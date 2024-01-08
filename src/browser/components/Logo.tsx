import tw, { styled } from "twin.macro";

const Wrapper = styled.svg`
  ${tw`block`}
`;

export interface LogoProps {
  className?: string;
}

function Logo(props: LogoProps) {
  return (
    <Wrapper className={props.className} viewBox="0 0 512 512">
      <circle cx="256" cy="256" r="240" fill="#00ffa3" />
      <path
        fill="#fff"
        d="M342.5 218.9c-.8-1.8-2.6-2.9-4.5-2.9h-59.2l58.5-92.3c1-1.5 1-3.5.2-5.1-.9-1.6-2.6-2.6-4.4-2.6h-80c-1.9 0-3.6 1.1-4.5 2.8l-75 150c-.8 1.5-.7 3.4.2 4.9.9 1.5 2.5 2.4 4.3 2.4h51.4l-56 133.1c-1 2.3-.1 4.9 2 6.2.8.5 1.7.7 2.6.7 1.4 0 2.8-.6 3.8-1.8l160-190c1.2-1.6 1.5-3.6.6-5.4z"
      />
    </Wrapper>
  );
}

export default Logo;
