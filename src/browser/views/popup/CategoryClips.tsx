import { Fragment, useState } from "react";
import { useOutletContext } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { getCategoryPath, t } from "~/common/helpers";

import { useRefreshHandler } from "~/browser/contexts";
import { isEmpty } from "~/browser/helpers";
import { useCategoryClips } from "~/browser/hooks";

import ClipCard from "~/browser/components/cards/ClipCard";

import FilterBar from "~/browser/components/FilterBar";
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

interface ChildComponentProps {
  period: string;
  sort: string;
}

function ChildComponent(props: ChildComponentProps) {
  const { category } = useOutletContext<OutletContext>();

  const [pages, { fetchMore, refresh, hasMore, isValidating }] = useCategoryClips(
    getCategoryPath(category),
    {
      filterType: props.period,
      orderType: props.sort,
    },
    {
      suspense: true,
    },
  );

  useRefreshHandler(async () => {
    await refresh();
  });

  if (isEmpty(pages)) {
    return <Splash>{t("errorText_emptyClips")}</Splash>;
  }

  return (
    <>
      <List>
        {pages.map((page, index) => (
          <Fragment key={index}>
            {page.content?.data.map((clip) => <ClipCard key={clip.clipUID} clip={clip} />)}
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
  const [period, setPeriod] = useState<string>("ALL");
  const [sort, setSort] = useState("POPULAR");

  return (
    <>
      <FilterBar
        filters={[
          {
            side: "left",
            value: period,
            onChange: setPeriod,
            options: [
              {
                value: "ALL",
                label: t("optionValue_period_allTime"),
              },
              {
                value: "WITHIN_ONE_DAY",
                label: t("optionValue_period_lastHours", "24"),
              },
              {
                value: "WITHIN_SEVEN_DAYS",
                label: t("optionValue_period_lastDays", "7"),
              },
              {
                value: "WITHIN_THIRTY_DAYS",
                label: t("optionValue_period_lastDays", "30"),
              },
            ],
          },
          {
            side: "right",
            value: sort,
            onChange: setSort,
            options: [
              {
                value: "POPULAR",
                label: t("optionValue_sort_views"),
              },
              {
                value: "RECENT",
                label: t("optionValue_sort_time"),
              },
            ],
          },
        ]}
      />

      <Loader>
        <ChildComponent {...{ period, sort }} />
      </Loader>
    </>
  );
}

export default Component;
