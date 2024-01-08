import { IconPlus } from "@tabler/icons-react";
import { ReactElement, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { openUrl, t, template } from "~/common/helpers";
import { ChzzkChannel } from "~/common/types";

import { useCollections, useSettings } from "~/browser/hooks";

import DropdownMenu, { DropdownMenuItemProps } from "../DropdownMenu";

export interface StreamDropdownProps {
  children: ReactElement;
  channel: ChzzkChannel;
  category?: string;

  onNewCollection?(): void;
}

function StreamDropdown(props: StreamDropdownProps) {
  const { channel, category } = props;

  const navigate = useNavigate();

  const [settings] = useSettings();
  const [collections, { toggleCollectionItem }] = useCollections("user");

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

    if (props.onNewCollection) {
      const userCollections = collections.filter((collection) => collection.type === "user");

      const items = new Array<DropdownMenuItemProps>({
        type: "normal",
        title: t("optionValue_newCollection"),
        icon: <IconPlus size="1.25rem" />,
        onClick: props.onNewCollection,
      });

      if (userCollections.length > 0) {
        items.unshift(
          ...userCollections.map<DropdownMenuItemProps>((collection) => ({
            type: "checkbox",
            title: collection.name,
            checked: collection.items.includes(channel.channelId),
            onChange: () => toggleCollectionItem(collection.id, channel.channelId),
          })),
          {
            type: "separator",
          },
        );
      }

      result.push(
        {
          type: "separator",
        },
        {
          type: "menu",
          title: t("optionValue_collections"),
          items,
        },
      );
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
      {
        type: "separator",
      },
      {
        type: "normal",
        disabled: !category,
        title: t("optionValue_gotoCategory"),
        onClick: () => navigate(`/categories/${category}`),
      },
    );

    return result;
  }, [collections, customActions, props.onNewCollection, category]);

  return <DropdownMenu items={items}>{props.children}</DropdownMenu>;
}

export default StreamDropdown;
