import { flatMap, sortBy } from "lodash-es";
import { Link } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { getCategoryPath, t } from "~/common/helpers";

import { useRefreshHandler } from "~/browser/contexts";
import { isEmpty } from "~/browser/helpers";
import { useCategories, useCollections, useTopCategories } from "~/browser/hooks";

import CategoryCard from "~/browser/components/cards/CategoryCard";

import CollectionList from "~/browser/components/CollectionList";
import Layout from "~/browser/components/Layout";
import MoreButton from "~/browser/components/MoreButton";
import Splash from "~/browser/components/Splash";

const Collection = styled.div`
  ${tw`gap-x-2 gap-y-4 grid grid-cols-4 px-4 py-2`}
`;

const LoadMore = styled.div`
  ${tw`px-4 py-2`}
`;

export function ChildComponent() {
  const [collections] = useCollections("category", {
    suspense: true,
  });

  const { data: categories = [] } = useCategories(flatMap(collections, "items"), {
    suspense: true,
  });

  const [pages, { fetchMore, hasMore, isValidating, refresh }] = useTopCategories(
    {
      size: 20,
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
      items={sortBy(categories, "categoryValue")}
      getItemIdentifier={getCategoryPath}
      defaultItems={pages.flatMap((page) => page.content?.data || [])}
      render={({ collection, items, createCollection }) => (
        <>
          <Collection>
            {items.map((category) => (
              <Link key={category.categoryId} to={`/categories/${getCategoryPath(category)}`}>
                <CategoryCard
                  category={category}
                  onNewCollection={() => createCollection([getCategoryPath(category)])}
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
  return (
    <Layout>
      <ChildComponent />
    </Layout>
  );
}
