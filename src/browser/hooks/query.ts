import { get, has } from "lodash-es";
import useSWR, { SWRConfiguration } from "swr";
import useSWRInfinite, { SWRInfiniteConfiguration } from "swr/infinite";

import { sendRuntimeMessage } from "~/common/helpers";
import {
  ChzzkCategory,
  ChzzkChannel,
  ChzzkFollowedChannel,
  ChzzkLive,
  ChzzkLounge,
  ChzzkOffset,
  ChzzkPagination,
  ChzzkResponse,
  ChzzkVideo,
  Dictionary,
} from "~/common/types";

import { UseStoreOptions, useCurrentUser } from "./store";

export interface UseQueryListResponse {
  fetchMore(): Promise<void>;
  refresh(): Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  isValidating: boolean;
  error?: Error;
}

export type UseQueryListReturn<T> = [ChzzkResponse<T>[] | undefined, UseQueryListResponse];

export function useQueryList<T = any>(
  path: string,
  getNext: (data: any) => any,
  hasNext: (data: any) => boolean,
  params?: Dictionary<unknown> | null,
  config?: SWRInfiniteConfiguration,
): UseQueryListReturn<T> {
  const { data, error, isLoading, isValidating, mutate, setSize, size } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (params == null) {
        return null;
      }

      if (pageIndex > 0) {
        const next = getNext(previousPageData);

        if (next == null) {
          return null;
        }

        params = { ...params, ...next };
      }

      return [path, params];
    },
    {
      fetcher: (args) => sendRuntimeMessage("request", ...args),
      ...config,
    },
  );

  const page = get(data, size - 1);
  const hasMore = hasNext(page) || (size > 0 && isValidating);

  return [
    data,
    {
      isLoading,
      isValidating,
      hasMore,
      error,

      async fetchMore() {
        await setSize((size) => size + 1);
      },

      async refresh() {
        await mutate();
      },
    },
  ];
}

export function useCursorQueryList<T = any>(
  path: string,
  params?: Dictionary<unknown> | null,
  config?: SWRInfiniteConfiguration,
) {
  return useQueryList<ChzzkPagination<T>>(
    path,
    (data) => get(data, "content.page.next"),
    (data) => has(data, "content.page.next"),
    params,
    config,
  );
}

export function useOffsetQueryList<T = any>(
  path: string,
  params?: Dictionary<unknown> | null,
  config?: SWRInfiniteConfiguration,
) {
  return useQueryList<ChzzkOffset & T>(
    path,
    (data) => {
      const content = get(data, "content");
      return content != null ? { offset: content.offset + content.limit } : null;
    },
    (data) => {
      const content = get(data, "content");
      return content != null && content.offset + content.limit < content.totalCount;
    },
    params,
    config,
  );
}

export function useStreams(params?: Dictionary<unknown> | null, config?: SWRInfiniteConfiguration) {
  return useCursorQueryList<ChzzkLive>("v1/lives", params, config);
}

export function useLiveDetail(id: string, config?: SWRConfiguration) {
  return useSWR(
    ["liveDetail", id],
    async () =>
      (config?.fallbackData ||
        (await sendRuntimeMessage("request", `v2/channels/${id}/live-detail`))
          ?.content) as ChzzkLive,
    config,
  );
}

export function useSearchChannels(
  params?: Dictionary<unknown> | null,
  config?: SWRInfiniteConfiguration,
) {
  return useCursorQueryList<{ channel: ChzzkChannel }>("v1/search/channels", params, config);
}

export function useSearchStreams(
  params?: Dictionary<unknown> | null,
  config?: SWRInfiniteConfiguration,
) {
  return useCursorQueryList<{ channel: ChzzkChannel; live: ChzzkLive }>(
    "v1/search/lives",
    params,
    config,
  );
}

export function useSearchVideos(
  params?: Dictionary<unknown> | null,
  config?: SWRInfiniteConfiguration,
) {
  return useCursorQueryList<{ channel: ChzzkChannel; video: ChzzkVideo }>(
    "v1/search/videos",
    params,
    config,
  );
}

export function useSearchCategories(
  params?: Dictionary<unknown> | null,
  config?: SWRInfiniteConfiguration,
) {
  return useOffsetQueryList<{ lounges: ChzzkLounge[] }>(
    "https://comm-api.game.naver.com/nng_main/v2/search/lounges",
    params,
    config,
  );
}

export function useTopCategories(config?: SWRConfiguration) {
  return useSWR(
    "categories",
    async () => {
      const result = await sendRuntimeMessage("request", "https://api.chz.app/categories");

      if (!result?.length) {
        return [];
      }

      return (result as ChzzkCategory[]).filter((c) => c.id !== "none");
    },
    config,
  );
}

export function useCategory(id?: string) {
  return useSWR(
    id != null ? ["category", id] : null,
    async () => {
      if (id === "talk") {
        return {
          loungeId: "talk",
          loungeName: "talk",
          backgroundMobileImageUrl: null,
          logoImageSquareUrl: "",
        };
      }

      const result = await sendRuntimeMessage(
        "request",
        `https://comm-api.game.naver.com/nng_main/v1/lounge/info/${id}`,
      );
      return result.content as ChzzkLounge;
    },
    {
      suspense: true,
    },
  );
}

export function useFollowedChannels(options?: UseStoreOptions) {
  const [currentUser] = useCurrentUser(options);

  return useSWR(
    currentUser ? ["followedChannels", currentUser.userIdHash] : null,
    async () => {
      if (currentUser == null) {
        return [];
      }

      const { content } = await sendRuntimeMessage("request", "v1/channels/followings");

      if (!content?.followingList?.length) {
        return [];
      }

      return content.followingList as ChzzkFollowedChannel[];
    },
    {
      suspense: true,
    },
  );
}
