import { Link, useOutletContext } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { t } from "~/common/helpers";

import { useRefreshHandler } from "~/browser/contexts";
import { isEmpty } from "~/browser/helpers";
import { useSearchCategories } from "~/browser/hooks";

import CategoryCard from "~/browser/components/cards/CategoryCard";

import CollectionList from "~/browser/components/CollectionList";
import Loader from "~/browser/components/Loader";
import MoreButton from "~/browser/components/MoreButton";
import Splash from "~/browser/components/Splash";

import type { OutletContext } from "./Search";

const Collection = styled.div`
  ${tw`gap-x-2 gap-y-3 grid grid-cols-4 px-4 py-2`}
`;

const LoadMore = styled.div`
  ${tw`px-4 py-2`}
`;

interface ChildComponentProps {
  searchQuery: string;
}

function ChildComponent(props: ChildComponentProps) {
  const { searchQuery } = props;

  const [pages, { fetchMore, hasMore, isValidating, refresh }] = useSearchCategories(
    {
      keyword: searchQuery,
      limit: 50,
    },
    {
      suspense: true,
    },
  );

  useRefreshHandler(async () => {
    await refresh();
  });

  if (isEmpty(pages)) {
    return <Splash>{t("errorText_emptyCategories")}</Splash>;
  }

  return (
    <CollectionList
      type="category"
      items={[]}
      getItemIdentifier={(item) => item.loungeId}
      defaultItems={pages.flatMap((page) => page.content?.lounges || [])}
      render={({ collection, items, createCollection }) => (
        <>
          <Collection>
            {items.map((category) => (
              <Link key={category.loungeId} to={`/categories/${category.loungeId}`}>
                <CategoryCard
                  category={{
                    id: category.loungeId,
                    name: category.loungeName,
                    logo: category.logoImageSquareUrl,
                  }}
                  onNewCollection={() => createCollection([category.loungeId])}
                />
              </Link>
            ))}
          </Collection>

          {collection == null && hasMore && (
            <LoadMore>
              <MoreButton isLoading={isValidating} fetchMore={fetchMore}>
                {t("buttonText_loadMore")}
              </MoreButton>
            </LoadMore>
          )}
        </>
      )}
    />
  );
}

export function Component() {
  const { searchQuery } = useOutletContext<OutletContext>();

  if (searchQuery.length === 0) {
    return <Splash>{t("messageText_typeSearchCategories")}</Splash>;
  }

  return (
    <Loader>
      <ChildComponent {...{ searchQuery }} />
    </Loader>
  );
}

export default Component;
