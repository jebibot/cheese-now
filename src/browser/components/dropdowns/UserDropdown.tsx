import { IconPlus } from "@tabler/icons-react";
import { ReactElement, useMemo } from "react";

import { openUrl, t, template } from "~/common/helpers";
import { ChzzkChannel } from "~/common/types";

import { useCollections, useSettings } from "~/browser/hooks";

import DropdownMenu, { DropdownMenuItemProps } from "../DropdownMenu";

export interface UserDropdownProps {
  children: ReactElement;
  user: ChzzkChannel;

  onNewCollection?(): void;
}

function UserDropdown(props: UserDropdownProps) {
  const { user } = props;

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
        onClick: (event) => openUrl(`https://chzzk.naver.com/live/${user.channelId}`, event),
      },
      {
        type: "normal",
        title: t("optionValue_openChat"),
        onClick: (event) => openUrl(`https://chzzk.naver.com/live/${user.channelId}/chat`, event),
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
                "{id}": user.channelId,
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
            checked: collection.items.includes(user.channelId),
            onChange: () => toggleCollectionItem(collection.id, user.channelId),
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
        onClick: (event) => openUrl(`https://chzzk.naver.com/${user.channelId}/about`, event),
      },
      {
        type: "normal",
        title: t("optionValue_schedule"),
        onClick: (event) => openUrl(`https://chzzk.naver.com/${user.channelId}/community`, event),
      },
      {
        type: "normal",
        title: t("optionValue_videos"),
        onClick: (event) => openUrl(`https://chzzk.naver.com/${user.channelId}/videos`, event),
      },
    );

    return result;
  }, [collections, customActions, props.onNewCollection, user]);

  return <DropdownMenu items={items}>{props.children}</DropdownMenu>;
}

export default UserDropdown;
