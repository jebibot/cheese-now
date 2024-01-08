import tw, { styled } from "twin.macro";

import { ChzzkCategory } from "~/common/types";

import DropdownButton from "../DropdownButton";
import Image from "../Image";
import Tooltip from "../Tooltip";

import CategoryDropdown from "../dropdowns/CategoryDropdown";

const StyledDropdownButton = styled(DropdownButton)`
  ${tw`absolute invisible end-2 -top-2 z-20`}
`;

const CoverImage = styled(Image)`
  ${tw`rounded`}
`;

const Cover = styled.div`
  ${tw`mb-1 relative`}

  :hover ${StyledDropdownButton} {
    ${tw`visible`}
  }
`;

const Name = styled.div`
  ${tw`font-medium text-black dark:text-white truncate`}
`;

export interface CategoryCardProps {
  category: ChzzkCategory;

  onNewCollection?(): void;
}

function CategoryCard(props: CategoryCardProps) {
  const { category } = props;

  return (
    <div>
      <Cover>
        <CoverImage
          src={category.logo || "https://ssl.pstatic.net/static/nng/resource/img/ico-game-icon.png"}
          ratio={1}
        />

        <CategoryDropdown category={category} onNewCollection={props.onNewCollection}>
          <StyledDropdownButton />
        </CategoryDropdown>
      </Cover>
      <Name>
        <Tooltip content={category.name}>
          <span>{category.name}</span>
        </Tooltip>
      </Name>
    </div>
  );
}

export default CategoryCard;
