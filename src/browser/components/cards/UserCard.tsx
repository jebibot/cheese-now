import { ReactNode } from "react";
import tw, { styled } from "twin.macro";

import { ChzzkChannel } from "~/common/types";

import { useClickAction } from "~/browser/hooks";

import Anchor from "../Anchor";
import Card from "../Card";
import ChannelName from "../ChannelName";
import DropdownButton from "../DropdownButton";
import Image from "../Image";

import UserDropdown from "../dropdowns/UserDropdown";

const Thumbnail = styled.div`
  ${tw`overflow-hidden relative rounded-full w-12`}
`;

const StyledDropdownButton = styled(DropdownButton)`
  ${tw`absolute invisible end-6 -top-2 z-20`}
`;

export interface WrapperProps {
  isRerun?: boolean;
  isLive?: boolean;
}

const Wrapper = styled(Card)<WrapperProps>`
  ${tw`py-2 relative`}

  ${Thumbnail} {
    ${(props) => {
      if (props.isRerun) {
        return tw`ring-2 ring-offset-2 ring-offset-white ring-neutral-600 dark:(ring-neutral-400 ring-offset-black)`;
      }

      if (props.isLive) {
        return tw`ring-2 ring-offset-2 ring-offset-white ring-red-600 dark:(ring-red-400 ring-offset-black)`;
      }

      return null;
    }}
  }

  :hover ${StyledDropdownButton} {
    ${tw`visible`}
  }
`;

export interface UserCardProps {
  children?: ReactNode;
  isRerun?: boolean;
  isLive?: boolean;
  user: ChzzkChannel;

  onNewCollection?(): void;
}

function UserCard(props: UserCardProps) {
  const { user } = props;

  const defaultAction = useClickAction(user.channelId);

  return (
    <Anchor to={defaultAction}>
      <Wrapper
        isLive={props.isLive}
        isRerun={props.isRerun}
        title={<ChannelName login={user.channelId} name={user.channelName} />}
        leftOrnament={
          <Thumbnail>
            <Image
              src={
                user.channelImageUrl
                  ? `${user.channelImageUrl}?type=f120_120_na`
                  : "https://ssl.pstatic.net/cmstatic/nng/img/img_anonymous_square_gray_opacity2x.png"
              }
              ratio={1}
            />
          </Thumbnail>
        }
      >
        {props.children}

        <UserDropdown user={user} onNewCollection={props.onNewCollection}>
          <StyledDropdownButton />
        </UserDropdown>
      </Wrapper>
    </Anchor>
  );
}

export default UserCard;
