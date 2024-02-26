import { IconPlus } from "@tabler/icons-react";
import { ReactElement, useMemo } from "react";

import { getCategoryPath, openUrl, t } from "~/common/helpers";
import { ChzzkCategory } from "~/common/types";

import { useCollections } from "~/browser/hooks";

import DropdownMenu, { DropdownMenuItemProps } from "../DropdownMenu";

export interface CategoryDropdownProps {
  category: ChzzkCategory;
  children: ReactElement;

  onNewCollection?(): void;
}

function CategoryDropdown(props: CategoryDropdownProps) {
  const { category } = props;

  const [collections, { toggleCollectionItem }] = useCollections("category");

  const items = useMemo(() => {
    const result = new Array<DropdownMenuItemProps>({
      type: "normal",
      disabled: category.categoryType === "GAME",
      title: t("buttonText_viewOn", "게임 라운지"),
      onClick: (event) => openUrl(`https://game.naver.com/lounge/${category.categoryId}`, event),
    });

    if (props.onNewCollection) {
      const items = new Array<DropdownMenuItemProps>({
        type: "normal",
        title: t("optionValue_newCollection"),
        icon: <IconPlus size="1.25rem" />,
        onClick: props.onNewCollection,
      });

      if (collections.length > 0) {
        items.unshift(
          ...collections.map<DropdownMenuItemProps>((collection) => ({
            type: "checkbox",
            title: collection.name,
            checked: collection.items.includes(getCategoryPath(category)),
            onChange: () => toggleCollectionItem(collection.id, getCategoryPath(category)),
          })),
          {
            type: "separator",
          },
        );
      }

      result.unshift(
        {
          type: "menu",
          title: t("optionValue_collections"),
          items,
        },
        {
          type: "separator",
        },
      );
    }

    return result;
  }, [category, props]);

  return <DropdownMenu items={items}>{props.children}</DropdownMenu>;
}

export default CategoryDropdown;
