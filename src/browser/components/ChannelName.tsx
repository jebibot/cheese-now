import Tooltip from "./Tooltip";

export interface ChannelNameProps {
  className?: string;
  login: string;
  name: string;
}

function ChannelName(props: ChannelNameProps) {
  return (
    <div className={props.className}>
      <Tooltip content={`${props.name} (${props.login})`}>
        <span>{props.name}</span>
      </Tooltip>
    </div>
  );
}

export default ChannelName;
