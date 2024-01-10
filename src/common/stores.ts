import {
  array,
  boolean,
  defaulted,
  Describe,
  enums,
  mask,
  nullable,
  number,
  object,
  optional,
  string,
  unknown,
} from "superstruct";
import { Storage } from "webextension-polyfill";

import { ClickAction, ClickBehavior } from "./constants";
import {
  ChzzkFollowedChannel,
  ChzzkUser,
  Collection,
  FollowedStreamState,
  FollowedUserState,
  Settings,
} from "./types";

export type StoreAreaName = "local" | "managed" | "sync";
export type StoreMigration = (value: any) => Promise<any>;

export interface StoreOptions<T> {
  schema: Describe<T>;
  migrations?: StoreMigration[];
  defaultValue(): T;
}

export interface StoreState<T> {
  version: number;
  value: T;
}

export type StoreChange<T> = (newValue: T, oldValue?: T) => void;

export class Store<T> {
  private listeners = new Set<StoreChange<T>>();

  private get areaStorage() {
    return browser.storage[this.areaName];
  }

  constructor(
    readonly areaName: StoreAreaName,
    readonly name: string,
    readonly options: StoreOptions<T>,
  ) {}

  async setup(migrate = false): Promise<void> {
    if (migrate) {
      await this.migrate();
    }

    const value = await this.get();

    this.listeners.forEach((listener) => {
      listener(value);
    });
  }

  applyChange(changes: Record<string, Storage.StorageChange>, areaName: string) {
    if (areaName !== this.areaName) {
      return;
    }

    const { [this.name]: change } = changes;

    if (change?.newValue == null) {
      return;
    }

    this.listeners.forEach((listener) => {
      listener(change.newValue?.value, change.oldValue?.value);
    });
  }

  onChange(listener: StoreChange<T>): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  async getState(): Promise<StoreState<T>> {
    const state = {
      value: this.options.defaultValue(),
      version: 1,
    };

    try {
      const { [this.name]: item } = await this.areaStorage.get(this.name);

      if (item) {
        state.value = this.validateValue(item.value);
      }
    } catch {} // eslint-disable-line no-empty

    return state;
  }

  async setState(state: StoreState<T>): Promise<void> {
    state.value = this.validateValue(state.value);

    await this.areaStorage.set({
      [this.name]: state,
    });
  }

  async get(): Promise<T> {
    return (await this.getState()).value;
  }

  async set(value: T): Promise<boolean>;
  async set(updater: (value: T) => T): Promise<boolean>;
  async set(value: any): Promise<boolean> {
    const state = await this.getState();

    if (typeof value === "function") {
      value = value(state.value);
    }

    if (state.value === value) {
      return false;
    }

    await this.setState({
      version: state.version,
      value,
    });

    return true;
  }

  async reset(): Promise<void> {
    await this.set(this.options.defaultValue);
  }

  async restore(state: StoreState<T>): Promise<void> {
    await this.setState(state);
    await this.migrate();
  }

  async migrate(): Promise<void> {
    const state = await this.getState();

    const {
      options: { migrations = [] },
    } = this;

    for (const [index, migration] of migrations.entries()) {
      const version = index + 2;

      if (state.version >= version) {
        break;
      }

      try {
        state.value = await migration(state.value);
      } catch {} // eslint-disable-line no-empty

      state.version = version;
    }

    await this.areaStorage.set({
      [this.name]: state,
    });
  }

  validateValue(value: T): T {
    return mask(value, defaulted(this.options.schema, this.options.defaultValue));
  }
}

export const stores = {
  currentUser: new Store<ChzzkUser | null>("local", "currentUser", {
    schema: nullable(
      object({
        hasProfile: boolean(),
        userIdHash: string(),
        nickname: string(),
        profileImageUrl: nullable(string()),
        penalties: unknown(),
        officialNotiAgree: boolean(),
        officialNotiAgreeUpdatedDate: nullable(string()),
        verifiedMark: boolean(),
        loggedIn: boolean(),
      }),
    ),
    defaultValue: () => null,
  }),
  followedStreams: new Store<ChzzkFollowedChannel[]>("local", "followedStreams", {
    schema: array(
      object({
        channelId: string(),
        channel: object({
          channelId: string(),
          channelName: string(),
          channelImageUrl: nullable(string()),
          verifiedMark: boolean(),
        }),
        streamer: optional(
          object({
            openLive: boolean(),
          }),
        ),
        liveInfo: object({
          liveTitle: string(),
          concurrentUserCount: number(),
          liveCategoryValue: string(),
        }),
      }),
    ),
    defaultValue: () => [],
  }),
  collections: new Store<Collection[]>("local", "collections", {
    schema: array(
      object({
        id: string(),
        name: string(),
        type: enums(["category", "user"]),
        items: array(string()),
      }),
    ),
    defaultValue: () => [],
  }),
  settings: new Store<Settings>("local", "settings", {
    schema: object({
      general: object({
        clickAction: number(),
        clickBehavior: number(),
        fontSize: enums(["smallest", "small", "medium", "large", "largest"]),
        theme: enums(["system", "dark", "light"]),
      }),
      badge: object({
        enabled: boolean(),
        color: string(),
      }),
      dropdownMenu: object({
        customActions: array(
          object({
            id: string(),
            title: string(),
            url: string(),
          }),
        ),
      }),
      notifications: object({
        enabled: boolean(),
        withFilters: boolean(),
        withCategoryChanges: boolean(),
        withChzzkSettings: boolean(),
        ignoredCategories: array(string()),
        selectedUsers: array(string()),
      }),
      streams: object({
        withReruns: boolean(),
        withFilters: boolean(),
        selectedLanguages: array(string()),
      }),
    }),
    defaultValue: () => ({
      general: {
        clickBehavior: ClickBehavior.CreateTab,
        clickAction: ClickAction.OpenChannel,
        fontSize: "medium",
        theme: "system",
      },
      badge: {
        enabled: true,
        color: "#737373",
      },
      dropdownMenu: {
        customActions: [],
      },
      notifications: {
        enabled: true,
        withFilters: false,
        withCategoryChanges: false,
        withChzzkSettings: false,
        ignoredCategories: [],
        selectedUsers: [],
      },
      streams: {
        withReruns: true,
        withFilters: false,
        selectedLanguages: [],
      },
    }),
  }),
  followedStreamState: new Store<FollowedStreamState>("local", "followedStreamState", {
    schema: object({
      sortDirection: enums(["asc", "desc"]),
      sortField: enums([
        "liveInfo.liveCategoryValue",
        "liveInfo.openDate",
        "channel.channelName",
        "liveInfo.concurrentUserCount",
      ]),
    }),
    defaultValue: () => ({
      sortField: "liveInfo.concurrentUserCount",
      sortDirection: "desc",
    }),
  }),
  followedUserState: new Store<FollowedUserState>("local", "followedUserState", {
    schema: object({
      sortDirection: enums(["asc", "desc"]),
      sortField: enums(["followedAt", "channelName"]),
      status: nullable(boolean()),
    }),
    defaultValue: () => ({
      sortField: "channelName",
      sortDirection: "asc",
      status: null,
    }),
  }),
};

browser.storage.onChanged.addListener((changes, areaName) => {
  for (const store of Object.values(stores)) {
    store.applyChange(changes, areaName);
  }
});
