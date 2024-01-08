import { ReactElement, useMemo } from "react";

import { openUrl, t, template } from "~/common/helpers";
import { ChzzkChannel } from "~/common/types";

import { useSettings } from "~/browser/hooks";

import DropdownMenu, { DropdownMenuItemProps } from "../DropdownMenu";

export interface ChannelDropdownProps {
  channel: ChzzkChannel;
  children: ReactElement;
}

function ChannelDropdown(props: ChannelDropdownProps) {
  const { channel } = props;

  const [settings] = useSettings();

  const {
    dropdownMenu: { customActions },
  } = settings;

  const items = useMemo(() => {
    const result = new Array<DropdownMenuItemProps>(
      {
        type: "normal",
        title: t("optionValue_openChannel"),
        onClick: (event) => openUrl(`https://chzzk.naver.com/live/${channel.channelId}`, event),
      },
      {
        type: "normal",
        title: t("optionValue_openChat"),
        onClick: (event) =>
          openUrl(`https://chzzk.naver.com/live/${channel.channelId}/chat`, event),
      },
    );

    if (customActions.length > 0) {
      result.push({
        type: "menu",
        title: t("optionValue_customActions"),
        items: customActions.map<DropdownMenuItemProps>((item) => ({
          type: "normal",
          title: item.title,
          onClick: (event) =>
            openUrl(
              template(item.url, {
                "{id}": channel.channelId,
              }),
              event,
            ),
        })),
      });
    }

    result.push(
      {
        type: "separator",
      },
      {
        type: "normal",
        title: t("optionValue_about"),
        onClick: (event) => openUrl(`https://chzzk.naver.com/${channel.channelId}/about`, event),
      },
      {
        type: "normal",
        title: t("optionValue_schedule"),
        onClick: (event) =>
          openUrl(`https://chzzk.naver.com/${channel.channelId}/community`, event),
      },
      {
        type: "normal",
        title: t("optionValue_videos"),
        onClick: (event) => openUrl(`https://chzzk.naver.com/${channel.channelId}/videos`, event),
      },
    );

    return result;
  }, [channel, customActions]);

  return <DropdownMenu items={items}>{props.children}</DropdownMenu>;
}

export default ChannelDropdown;
