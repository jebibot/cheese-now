import { IconInfoCircle, IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import tw, { styled } from "twin.macro";

import { t } from "~/common/helpers";
import { CurrentUser } from "~/common/types";

import AboutModal from "./modals/AboutModal";

import DropdownMenu from "./DropdownMenu";
import Image from "./Image";

const Wrapper = styled.button`
  ${tw`bg-white dark:bg-black flex-none overflow-hidden relative rounded-full w-10 hover:(ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-emerald-500)`}
`;

interface ProfileBadgeProps {
  className?: string;
  user: CurrentUser;
}

function ProfileBadge(props: ProfileBadgeProps) {
  const [isAboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <DropdownMenu
        placement="right-end"
        items={[
          {
            type: "normal",
            title: t("optionValue_settings"),
            icon: <IconSettings size="1.25rem" />,
            onClick() {
              open(browser.runtime.getURL("settings.html"), "_blank");
            },
          },
          {
            type: "normal",
            title: t("optionValue_aboutHelp"),
            icon: <IconInfoCircle size="1.25rem" />,
            onClick() {
              setAboutOpen(true);
            },
          },
        ]}
      >
        <Wrapper className={props.className}>
          <Image
            src={
              props.user?.profileImageUrl
                ? `${props.user.profileImageUrl}?type=f120_120_na`
                : "https://ssl.pstatic.net/cmstatic/nng/img/img_anonymous_square_gray_opacity2x.png"
            }
            ratio={1}
          />
        </Wrapper>
      </DropdownMenu>

      {isAboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </>
  );
}

export default ProfileBadge;
