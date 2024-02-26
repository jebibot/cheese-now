import { NavLink } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { t } from "~/common/helpers";
import { ChzzkCategory } from "~/common/types";

import ExternalAnchor from "./ExternalAnchor";
import Image from "./Image";

const Wrapper = styled.div`
  ${tw`relative`}
`;

const Inner = styled.div`
  ${tw`flex flex-col place-items-center p-6 relative z-10`}
`;

const Background = styled.div`
  ${tw`absolute inset-0 overflow-hidden after:(absolute inset-0 bg-gradient-to-b content-[''] from-transparent to-white dark:to-neutral-900)`}
`;

const BackgroundImage = styled(Image)`
  ${tw`h-full object-cover w-full blur-sm opacity-50`}
`;

const Thumbnail = styled.div`
  ${tw`bg-black mb-2 overflow-hidden rounded shadow`}
`;

const ThumbnailImage = styled(Image)`
  ${tw`object-cover object-top w-[66px]`}
`;

const Name = styled.div`
  ${tw`font-bold text-2xl text-center`}
`;

const TabList = styled.div`
  ${tw`flex`}
`;

const Tab = styled(NavLink)`
  ${tw`border-b border-neutral-200 flex-1 py-3 relative text-center text-neutral-600 dark:(border-neutral-800 text-neutral-400) [&.active]:(border-emerald-500 font-medium text-black dark:text-white)!`}
`;

export interface CategoryTitleProps {
  className?: string;
  category: ChzzkCategory;
}

function CategoryTitle(props: CategoryTitleProps) {
  const { category } = props;

  return (
    <Wrapper className={props.className}>
      <Background>
        <BackgroundImage src={category.posterImageUrl} />
      </Background>

      <Inner>
        <Thumbnail>
          <ThumbnailImage
            src={
              category.posterImageUrl ||
              "data:image/png;base64,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"
            }
            ratio={4 / 3}
          />
        </Thumbnail>

        <Name>{category.categoryValue}</Name>

        {category.categoryType === "GAME" && (
          <ExternalAnchor to={`https://game.naver.com/lounge/${category.categoryId}`}>
            {t("buttonText_viewOn", "게임 라운지")}
          </ExternalAnchor>
        )}
      </Inner>

      <TabList>
        <Tab to="streams">{t("titleText_streams")}</Tab>
        <Tab to="videos">{t("titleText_videos")}</Tab>
      </TabList>
    </Wrapper>
  );
}

export default CategoryTitle;
