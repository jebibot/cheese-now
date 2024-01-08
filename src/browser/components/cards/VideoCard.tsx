import { useMemo } from "react";
import tw, { styled } from "twin.macro";

import { t } from "~/common/helpers";
import { ChzzkChannel, ChzzkVideo } from "~/common/types";

import { formatDate, formatTime } from "~/browser/helpers";

import Anchor from "../Anchor";
import Card from "../Card";
import ChannelName from "../ChannelName";
import Image from "../Image";
import Tooltip from "../Tooltip";

const Thumbnail = styled.div`
  ${tw`bg-black overflow-hidden relative rounded w-24`}
`;

const VideoDuration = styled.div`
  ${tw`absolute bg-black/75 bottom-0 font-medium px-1 end-0 rounded-ss tabular-nums text-sm text-white`}
`;

const Details = styled.ul`
  ${tw`flex gap-4`}
`;

const Wrapper = styled(Card)`
  ${tw`py-2`}
`;

export interface VideoCardProps {
  channel: ChzzkChannel;
  video: ChzzkVideo;
}

function VideoCard(props: VideoCardProps) {
  const { channel, video } = props;

  const createdAt = useMemo(() => formatDate(video.publishDateAt), [video.publishDateAt]);
  const durationString = useMemo(() => formatTime(video.duration * 1000), [video.duration]);

  return (
    <Anchor to={`https://chzzk.naver.com/video/${video.videoNo}`}>
      <Wrapper
        title={
          <Tooltip content={video.videoTitle}>
            <span>{video.videoTitle || <i>{t("detailText_noTitle")}</i>}</span>
          </Tooltip>
        }
        subtitle={<ChannelName login={channel.channelId} name={channel.channelName} />}
        leftOrnament={
          <Thumbnail>
            <Image src={video.thumbnailImageUrl} ratio={9 / 16} />
            <VideoDuration>{durationString}</VideoDuration>
          </Thumbnail>
        }
      >
        <Details>
          <li>{createdAt}</li>
          <li>{t("detailText_viewCount", video.readCount.toLocaleString())}</li>
        </Details>
      </Wrapper>
    </Anchor>
  );
}

export default VideoCard;
