import { castArray, find, get, toString } from "lodash-es";

import { REDIRECT_URI } from "~/common/constants";
import {
  matchString,
  openUrl,
  reportException,
  settlePromises,
  setupSentry,
  t,
} from "~/common/helpers";
import { stores } from "~/common/stores";
import {
  ChzzkFollowedChannel,
  ChzzkFollowing,
  ChzzkResponse,
  ChzzkUser,
  Dictionary,
  Message,
} from "~/common/types";

setupSentry();

class RequestError extends Error {
  constructor(
    readonly request: Request,
    readonly response: Response,
  ) {
    super(response.statusText);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RequestError);
    }
  }
}

async function request<T>(path: string, params?: Dictionary<unknown>): Promise<ChzzkResponse<T>> {
  const url = new URL(path, "https://api.chzzk.naver.com/service/");

  for (const [name, value] of Object.entries(params ?? {})) {
    for (const v of castArray(value)) {
      if (typeof v === "undefined") {
        continue;
      }

      url.searchParams.append(name, toString(v));
    }
  }

  const request = new Request(url, {
    cache: "no-cache",
  });

  const response = await fetch(request);

  if (response.ok) {
    return response.json();
  }

  throw new RequestError(request, response);
}

async function getCurrentUser() {
  const user = await request<ChzzkUser>(
    "https://comm-api.game.naver.com/nng_main/v1/user/getUserStatus",
  );

  if (!user.content?.userIdHash) {
    return null;
  }

  return user.content;
}

async function getFollowedStreams() {
  const liveFollowings = await request<ChzzkFollowing>("v1/channels/followings/live");
  const list = liveFollowings.content?.followingList;

  if (!list?.length) {
    return [];
  }

  return list;
}

async function filterFollowedStreams(streams: ChzzkFollowedChannel[]) {
  const [followedStreams, settings] = await Promise.all([
    stores.followedStreams.get(),
    stores.settings.get(),
  ]);

  const {
    notifications: {
      ignoredCategories,
      selectedUsers,
      withCategoryChanges,
      withChzzkSettings,
      withFilters,
    },
  } = settings;

  return streams.filter((stream) => {
    if (
      (withChzzkSettings && stream.channel.personalData?.following?.notification === false) ||
      (withFilters && !selectedUsers.includes(stream.channelId)) ||
      ignoredCategories.some(matchString.bind(null, stream.liveInfo.liveCategoryValue))
    ) {
      return false;
    }

    const oldStream = find(followedStreams, {
      channelId: stream.channelId,
    });

    return (
      oldStream == null ||
      (withCategoryChanges &&
        oldStream.liveInfo.liveCategoryValue !== stream.liveInfo.liveCategoryValue)
    );
  });
}

async function refreshCurrentUser() {
  const currentUser = await getCurrentUser();

  if (await stores.currentUser.set(currentUser)) {
    if (currentUser == null) {
      browser.notifications.create(`${Date.now()}:authorize`, {
        title: t("notificationTitle_accessExpired"),
        message: t("notificationMessage_accessExpired"),
        iconUrl: browser.runtime.getURL("icon-96.png"),
        type: "basic",
      });
    }
  }

  return currentUser;
}

async function refreshFollowedStreams(showNotifications = true) {
  const settings = await stores.settings.get();

  const followedStreams = await getFollowedStreams();

  if (showNotifications && settings.notifications.enabled) {
    const streams = await filterFollowedStreams(followedStreams);

    settlePromises(streams, (stream) =>
      browser.notifications.create(`${Date.now()}:stream:${stream.channelId}`, {
        title: t(
          `notificationMessage_stream${stream.liveInfo.liveCategoryValue ? "Playing" : "Online"}`,
          [stream.channel.channelName, stream.liveInfo.liveCategoryValue],
        ),
        message: stream.liveInfo.liveTitle || t("detailText_noTitle"),
        type: "basic",
        iconUrl: stream.channel.channelImageUrl
          ? `${stream.channel.channelImageUrl}?type=f120_120_na`
          : browser.runtime.getURL("icon-96.png"),
      }),
    );
  }

  await stores.followedStreams.set(followedStreams);
}

async function refresh(withNotifications: boolean) {
  try {
    const user = await refreshCurrentUser();

    if (user) {
      await refreshFollowedStreams(withNotifications);
    } else {
      await stores.followedStreams.set([]);
    }
  } catch (e) {
    reportException(e);
  }

  browser.alarms.create("refresh", {
    delayInMinutes: 1,
  });
}

async function refreshActionBadge() {
  const manifest = browser.runtime.getManifest();
  const browserAction = manifest.manifest_version === 2 ? browser.browserAction : browser.action;

  const [currentUser, followedStreams, settings] = await Promise.all([
    stores.currentUser.get(),
    stores.followedStreams.get(),
    stores.settings.get(),
  ]);

  let text = "";

  if (settings.badge.enabled && followedStreams.length > 0) {
    text = followedStreams.length.toLocaleString("en-US");
  }

  const getIconPath = (size: number) =>
    browser.runtime.getURL(currentUser ? `icon-${size}.png` : `icon-gray-${size}.png`);

  await Promise.allSettled([
    browserAction.setBadgeBackgroundColor({
      color: settings.badge.color,
    }),
    browserAction.setBadgeText({
      text,
    }),
    browserAction.setIcon({
      path: {
        16: getIconPath(16),
        32: getIconPath(32),
      },
    }),
  ]);
}

async function backup() {
  const [followedStreamState, followedUserState, collections, settings] = await Promise.all([
    stores.followedStreamState.getState(),
    stores.followedUserState.getState(),
    stores.collections.getState(),
    stores.settings.getState(),
  ]);

  return {
    followedStreamState,
    followedUserState,
    collections,
    settings,
  };
}

async function restore(data: Dictionary<unknown>) {
  await settlePromises(Object.entries(data), async ([name, state]) => {
    const store = get(stores, name);

    if (store) {
      await store.restore(state);
    }
  });
}

async function authorize() {
  return openUrl(`https://nid.naver.com/nidlogin.login?url=${REDIRECT_URI}`, undefined, true);
}

async function setup(): Promise<void> {
  const items = await browser.storage.local.get();

  await settlePromises(Object.values(stores), (store) => store.setup(true));
  await settlePromises(Object.keys(items), async (key) => {
    if (key in stores) {
      return;
    }

    return browser.storage.local.remove(key);
  });
}

async function reset(): Promise<void> {
  await Promise.allSettled([
    browser.storage.local.clear(),
    browser.storage.managed.clear(),
    browser.storage.sync.clear(),
  ]);

  await setup();
}

const messageHandlers: Dictionary<(...args: any[]) => Promise<any>> = {
  authorize,
  backup,
  refresh,
  request,
  reset,
  restore,
};

browser.alarms.onAlarm.addListener((alarm) => {
  refresh(Date.now() < alarm.scheduledTime + 300_000);
});

browser.notifications.onClicked.addListener((notificationId) => {
  const [, type, data] = notificationId.split(":");

  switch (type) {
    case "authorize":
      return authorize();

    case "stream":
      return openUrl(`https://chzzk.naver.com/live/${data}`);
  }
});

browser.runtime.onInstalled.addListener(() => {
  setup();
});

browser.runtime.onStartup.addListener(() => {
  setup();
});

browser.runtime.onMessage.addListener((message) => {
  const msg = message as Message;
  const { [msg.type]: handler } = messageHandlers;

  if (handler == null) {
    throw new RangeError();
  }

  return handler(...msg.args);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.startsWith(REDIRECT_URI)) {
    refresh(false);
    browser.tabs.remove(tabId);
  }
});

stores.currentUser.onChange((_, oldValue) => {
  if (oldValue == null) {
    refresh(false);
  }
});

stores.followedStreams.onChange(() => {
  refreshActionBadge();
});

stores.settings.onChange(() => {
  refreshActionBadge();
});
