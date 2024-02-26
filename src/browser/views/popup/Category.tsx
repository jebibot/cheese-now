import { Outlet, useParams } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { t } from "~/common/helpers";
import { ChzzkCategory } from "~/common/types";

import { useCategory } from "~/browser/hooks";

import CategoryTitle from "~/browser/components/CategoryTitle";
import Layout from "~/browser/components/Layout";
import Splash from "~/browser/components/Splash";

const Title = styled(CategoryTitle)`
  ${tw`flex-none`}
`;

export interface OutletContext {
  category: ChzzkCategory;
}

function ChildComponent() {
  const { categoryType, categoryId } = useParams();

  const { data: category } = useCategory(`${categoryType}/${categoryId}`);

  if (category == null) {
    return <Splash>{t("detailText_noCategory")}</Splash>;
  }

  return (
    <>
      <Title category={category} />

      <Outlet
        context={{
          category,
        }}
      />
    </>
  );
}

export function Component() {
  return (
    <Layout>
      <ChildComponent />
    </Layout>
  );
}

export default Component;
