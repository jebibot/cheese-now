import tw, { styled } from "twin.macro";

import { t } from "~/common/helpers";
import { ChzzkChannel } from "~/common/types";

import { useClickAction } from "~/browser/hooks";

import Anchor from "../Anchor";
import Card from "../Card";
import DropdownButton from "../DropdownButton";
import ChannelName from "../ChannelName";
import Image from "../Image";
import Tooltip from "../Tooltip";

import ChannelDropdown from "../dropdowns/ChannelDropdown";

const StyledDropdownButton = styled(DropdownButton)`
  ${tw`absolute invisible end-6 -top-2 z-20`}
`;

const Thumbnail = styled.div`
  ${tw`overflow-hidden relative rounded-full w-12`}
`;

const FollowerCount = styled.div`
  ${tw`truncate`}
`;

export interface WrapperProps {
  isLive?: boolean;
}

const Wrapper = styled(Card)<WrapperProps>`
  ${tw`py-2 relative`}

  ${Thumbnail} {
    ${(props) =>
      props.isLive &&
      tw`ring-2 ring-offset-2 ring-offset-white ring-red-500 dark:ring-offset-black`}
  }

  :hover ${StyledDropdownButton} {
    ${tw`visible`}
  }
`;

export interface ChannelCardProps {
  channel: ChzzkChannel;
}

function ChannelCard(props: ChannelCardProps) {
  const { channel } = props;

  const defaultAction = useClickAction(channel.channelId);

  return (
    <Anchor to={defaultAction}>
      <Wrapper
        isLive={channel.openLive}
        title={<ChannelName login={channel.channelId} name={channel.channelName} />}
        subtitle={
          <Tooltip content={channel.channelDescription}>
            <span>{channel.channelDescription}</span>
          </Tooltip>
        }
        leftOrnament={
          <Thumbnail>
            <Image
              src={
                channel.channelImageUrl
                  ? `${channel.channelImageUrl}?type=f120_120_na`
                  : "https://ssl.pstatic.net/cmstatic/nng/img/img_anonymous_square_gray_opacity2x.png"
              }
              ratio={1}
            />
          </Thumbnail>
        }
      >
        <FollowerCount>
          {t("detailText_followerCount", (channel.followerCount || 0).toLocaleString())}
        </FollowerCount>

        <ChannelDropdown channel={channel}>
          <StyledDropdownButton />
        </ChannelDropdown>
      </Wrapper>
    </Anchor>
  );
}

export default ChannelCard;
