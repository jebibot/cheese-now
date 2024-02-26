import { Fragment } from "react";
import { useOutletContext } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { getCategoryPath, t } from "~/common/helpers";

import { useRefreshHandler } from "~/browser/contexts";
import { isEmpty } from "~/browser/helpers";
import { useCategoryVideos } from "~/browser/hooks";

import VideoCard from "~/browser/components/cards/VideoCard";

import Loader from "~/browser/components/Loader";
import MoreButton from "~/browser/components/MoreButton";
import Splash from "~/browser/components/Splash";

import type { OutletContext } from "./Category";

const List = styled.div`
  ${tw`py-2`}
`;

const LoadMore = styled.div`
  ${tw`p-4 pt-0`}
`;

function ChildComponent() {
  const { category } = useOutletContext<OutletContext>();

  const [pages, { fetchMore, hasMore, isValidating, refresh }] = useCategoryVideos(
    getCategoryPath(category),
    {},
    {
      suspense: true,
    },
  );

  useRefreshHandler(async () => {
    await refresh();
  });

  if (isEmpty(pages)) {
    return <Splash>{t("errorText_emptyVideos")}</Splash>;
  }

  return (
    <>
      <List>
        {pages.map((page, index) => (
          <Fragment key={index}>
            {page.content?.data.map((video) => (
              <VideoCard key={video.videoNo} video={video} channel={video.channel} />
            ))}
          </Fragment>
        ))}
      </List>

      {hasMore && (
        <LoadMore>
          <MoreButton isLoading={isValidating} fetchMore={fetchMore}>
            {t("buttonText_loadMore")}
          </MoreButton>
        </LoadMore>
      )}
    </>
  );
}

export function Component() {
  return (
    <Loader>
      <ChildComponent />
    </Loader>
  );
}

export default Component;
