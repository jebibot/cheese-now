import { useMemo } from "react";
import tw, { styled } from "twin.macro";

import { t, template } from "~/common/helpers";
import { ChzzkChannel, ChzzkLive, ChzzkLiveInfo } from "~/common/types";

import { useClickAction, useLiveDetail } from "~/browser/hooks";

import Anchor from "../Anchor";
import Card from "../Card";
import ChannelName from "../ChannelName";
import DropdownButton from "../DropdownButton";
import Image from "../Image";
import Tooltip from "../Tooltip";
import Uptime from "../Uptime";
import ViewerCount from "../ViewerCount";

import StreamDropdown from "../dropdowns/StreamDropdown";

const Thumbnail = styled.div`
  ${tw`bg-black overflow-hidden relative rounded w-24`}
`;

const StyledStreamUptime = styled(Uptime)`
  ${tw`absolute bg-black/75 bottom-0 font-medium px-1 end-0 rounded-ss tabular-nums text-sm text-white`}
`;

const Title = styled.div`
  ${tw`flex gap-2`}
`;

const UserName = styled(ChannelName)`
  ${tw`flex-1 truncate`}
`;

const CategoryName = styled.div`
  ${tw`truncate`}
`;

const StyledDropdownButton = styled(DropdownButton)`
  ${tw`absolute invisible end-6 -top-2 z-20`}
`;

const Wrapper = styled(Card)`
  ${tw`py-2 relative`}

  :hover ${StyledDropdownButton} {
    ${tw`visible`}
  }
`;

export interface StreamCardProps {
  channel: ChzzkChannel;
  stream: ChzzkLive | ChzzkLiveInfo;

  onNewCollection?(): void;
}

function StreamCard(props: StreamCardProps) {
  const { channel, stream } = props;

  const defaultAction = useClickAction(channel.channelId);

  const { data: liveDetail } = useLiveDetail(channel.channelId, {
    fallbackData: "liveId" in stream ? stream : undefined,
  });

  const startDate = useMemo(() => {
    if (liveDetail?.openDate) {
      // @ts-expect-error update liveInfo
      stream.openDate = liveDetail.openDate;
      return new Date(`${liveDetail.openDate}+0900`);
    }
  }, [liveDetail?.openDate]);

  const previewImage = useMemo(() => {
    if (liveDetail?.adult) {
      return "https://ssl.pstatic.net/static/nng/glive/resource/p/static/media/image_age_restriction_search.ba30cccc6b1fd2dbf431.png";
    }
    return template(liveDetail?.defaultThumbnailImageUrl || liveDetail?.liveImageUrl || "", {
      "{type}": 480,
    });
  }, [liveDetail?.adult, liveDetail?.defaultThumbnailImageUrl, liveDetail?.liveImageUrl]);

  return (
    <Anchor to={defaultAction}>
      <Wrapper
        title={
          <Title>
            <UserName login={channel.channelId} name={channel.channelName} />
            <ViewerCount stream={stream} />
          </Title>
        }
        subtitle={
          <Tooltip content={stream.liveTitle}>
            <span>{stream.liveTitle || <i>{t("detailText_noTitle")}</i>}</span>
          </Tooltip>
        }
        leftOrnament={
          <Thumbnail>
            <Image src={previewImage} ratio={9 / 16} />
            {startDate && <StyledStreamUptime startDate={startDate} />}
          </Thumbnail>
        }
      >
        <CategoryName>
          <Tooltip content={stream.liveCategoryValue}>
            <span>{stream.liveCategoryValue || <i>{t("detailText_noCategory")}</i>}</span>
          </Tooltip>
        </CategoryName>

        <StreamDropdown
          channel={channel}
          category={liveDetail?.liveCategory}
          onNewCollection={props.onNewCollection}
        >
          <StyledDropdownButton />
        </StreamDropdown>
      </Wrapper>
    </Anchor>
  );
}

export default StreamCard;
