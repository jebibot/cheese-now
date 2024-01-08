import { Link } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { t } from "~/common/helpers";

import { useRefreshHandler } from "~/browser/contexts";
import { isEmpty } from "~/browser/helpers";
import { useTopCategories } from "~/browser/hooks";

import CategoryCard from "~/browser/components/cards/CategoryCard";

import CollectionList from "~/browser/components/CollectionList";
import Layout from "~/browser/components/Layout";
import Splash from "~/browser/components/Splash";

const Collection = styled.div`
  ${tw`gap-x-2 gap-y-3 grid grid-cols-4 px-4 py-2`}
`;

export function ChildComponent() {
  const { data: categories = [], mutate } = useTopCategories({ suspense: true });

  useRefreshHandler(async () => {
    await mutate();
  });

  if (isEmpty(categories)) {
    return <Splash>{t("errorText_emptyCategories")}</Splash>;
  }

  return (
    <CollectionList
      type="category"
      items={categories}
      getItemIdentifier={(item) => item.id}
      render={({ items, createCollection }) => (
        <>
          <Collection>
            {items.map((category) => (
              <Link key={category.id} to={`/categories/${category.id}`}>
                <CategoryCard
                  category={category}
                  onNewCollection={() => createCollection([category.id])}
                />
              </Link>
            ))}
          </Collection>
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
