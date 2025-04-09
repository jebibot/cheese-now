import { useMemo } from "react";
import tw, { styled } from "twin.macro";

import { t } from "~/common/helpers";
import { ChzzkClip } from "~/common/types";

import { formatDate, formatTime } from "~/browser/helpers";

import Anchor from "../Anchor";
import Card from "../Card";
import Image from "../Image";
import Tooltip from "../Tooltip";

const Thumbnail = styled.div`
  ${tw`bg-black overflow-hidden relative rounded w-24`}
`;

const Duration = styled.div`
  ${tw`absolute bg-black/75 bottom-0 font-medium px-1 end-0 rounded-ss tabular-nums text-sm text-white`}
`;

const Details = styled.ul`
  ${tw`flex gap-4`}
`;

const Wrapper = styled(Card)`
  ${tw`py-2`}
`;

export interface ClipCardProps {
  clip: ChzzkClip;
}

function ClipCard(props: ClipCardProps) {
  const { clip } = props;

  const createdAt = useMemo(() => formatDate(clip.createdDate), [clip.createdDate]);
  const timeString = useMemo(() => formatTime(clip.duration * 1000), [clip.duration]);

  return (
    <Anchor to={`https://chzzk.naver.com/clips/${clip.clipUID}`}>
      <Wrapper
        title={
          <Tooltip content={clip.clipTitle}>
            <span>{clip.clipTitle || <i>{t("detailText_noTitle")}</i>}</span>
          </Tooltip>
        }
        subtitle={clip.ownerChannel.channelName}
        leftOrnament={
          <Thumbnail>
            <Image src={clip.thumbnailImageUrl} ratio={9 / 16} />
            <Duration>{timeString}</Duration>
          </Thumbnail>
        }
      >
        <Details>
          <li>{createdAt}</li>
          <li>{t("detailText_viewCount", clip.readCount.toLocaleString())}</li>
        </Details>
      </Wrapper>
    </Anchor>
  );
}

export default ClipCard;
