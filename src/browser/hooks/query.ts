import { get, has } from "lodash-es";
import useSWR, { SWRConfiguration } from "swr";
import useSWRInfinite, { SWRInfiniteConfiguration } from "swr/infinite";

import { allPromises, sendRuntimeMessage } from "~/common/helpers";
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

export function useCategoryStreams(
  path: string,
  params?: Dictionary<unknown> | null,
  config?: SWRInfiniteConfiguration,
) {
  return useCursorQueryList<ChzzkLive>(`v2/categories/${path}/lives`, params, config);
}

export function useCategoryVideos(
  path: string,
  params?: Dictionary<unknown> | null,
  config?: SWRInfiniteConfiguration,
) {
  return useCursorQueryList<ChzzkVideo & { channel: ChzzkChannel }>(
    `v2/categories/${path}/videos`,
    params,
    config,
  );
}

export function useLiveDetail(id: string, config?: SWRConfiguration) {
  return useSWR(
    ["liveDetail", id],
    async () =>
      (config?.fallbackData ||
        (await sendRuntimeMessage("request", `v3.1/channels/${id}/live-detail`))
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

export function useTopCategories(
  params?: Dictionary<unknown> | null,
  config?: SWRInfiniteConfiguration,
) {
  return useCursorQueryList<ChzzkCategory>("v1/categories/live", params, config);
}

async function fetchCategory(id: string) {
  return (await sendRuntimeMessage("request", `v1/categories/${id}/info`))
    ?.content as ChzzkCategory;
}

export function useCategory(id: string) {
  return useSWR(id != null ? ["category", id] : null, () => fetchCategory(id), {
    suspense: true,
  });
}

export function useCategories(id: string[], config?: SWRConfiguration) {
  return useSWR(
    id.length > 0 ? ["categories", id] : null,
    () => allPromises(id, fetchCategory),
    config,
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

      const { content } = await sendRuntimeMessage("request", "v1/channels/followings", {
        size: 505,
        sortType: "FOLLOW",
      });

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
