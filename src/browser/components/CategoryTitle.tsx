import { NavLink } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { t } from "~/common/helpers";
import { ChzzkLounge } from "~/common/types";

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
  ${tw`mb-2 overflow-hidden rounded shadow`}
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
  category: ChzzkLounge;
}

function CategoryTitle(props: CategoryTitleProps) {
  const { category } = props;

  return (
    <Wrapper className={props.className}>
      <Background>
        <BackgroundImage src={category.backgroundMobileImageUrl || category.logoImageSquareUrl} />
      </Background>

      <Inner>
        <Thumbnail>
          <ThumbnailImage
            src={
              category.logoImageSquareUrl ||
              "https://ssl.pstatic.net/static/nng/resource/img/ico-game-icon.png"
            }
            ratio={1}
          />
        </Thumbnail>

        <Name>{category.loungeName}</Name>

        {!["talk"].includes(category.loungeId) && (
          <ExternalAnchor to={`https://game.naver.com/lounge/${category.loungeId}`}>
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
