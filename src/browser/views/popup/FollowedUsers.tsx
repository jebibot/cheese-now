import { orderBy } from "lodash-es";
import { useMemo, useState } from "react";
import tw, { styled } from "twin.macro";

import { t } from "~/common/helpers";
import { ChzzkChannel, FollowedUserState } from "~/common/types";

import { useRefreshHandler } from "~/browser/contexts";
import { formatDate, isEmpty, matchFields } from "~/browser/helpers";
import { useFollowedChannels, useFollowedUserState } from "~/browser/hooks";

import UserCard from "~/browser/components/cards/UserCard";

import CollectionList from "~/browser/components/CollectionList";
import FilterBar from "~/browser/components/FilterBar";
import Layout from "~/browser/components/Layout";
import Splash from "~/browser/components/Splash";

const Collection = styled.div``;

const FollowingSince = styled.div`
  ${tw`truncate`}
`;

interface FormattedUser extends ChzzkChannel {
  followedAt: Date;
  isRerun: boolean;
  isLive: boolean;
}

interface ChildComponentProps {
  followedUserState: FollowedUserState;
  searchQuery: string;
}

function ChildComponent(props: ChildComponentProps) {
  const { followedUserState, searchQuery } = props;

  const { data: followedChannels = [], mutate } = useFollowedChannels({
    suspense: true,
  });

  const filteredUsers = useMemo(() => {
    const items = new Array<FormattedUser>();

    followedChannels.forEach((channel) => {
      const matchesFields = matchFields(channel, ["channel.channelName"], searchQuery);
      const isLive = !!channel.streamer?.openLive;

      if (matchesFields && [isLive, null].includes(followedUserState.status)) {
        items.push({
          ...channel.channel,
          followedAt: new Date(channel.channel.personalData?.following?.followDate ?? 0),

          isRerun: false,
          isLive,
        });
      }
    });

    return orderBy(items, followedUserState.sortField, followedUserState.sortDirection);
  }, [followedChannels, followedUserState, searchQuery]);

  useRefreshHandler(async () => {
    await mutate();
  });

  if (isEmpty(filteredUsers)) {
    return <Splash>{t("errorText_emptyFollowingUsers")}</Splash>;
  }

  return (
    <CollectionList
      type="user"
      items={filteredUsers}
      getItemIdentifier={(item) => item.channelId}
      render={({ items, createCollection }) => (
        <Collection>
          {items.map((item) => (
            <UserCard
              key={item.channelId}
              onNewCollection={() => createCollection([item.channelId])}
              isRerun={item.isRerun}
              isLive={item.isLive}
              user={item}
            >
              <FollowingSince>
                {t("detailText_followingSince", formatDate(item.followedAt))}
              </FollowingSince>
            </UserCard>
          ))}
        </Collection>
      )}
    />
  );
}

export function Component() {
  const [searchQuery, setSearchQuery] = useState("");

  const [followedUserState, { setSortDirection, setSortField, setStatus }] = useFollowedUserState();

  return (
    <Layout searchQuery={searchQuery} onSearchQueryChange={setSearchQuery}>
      <FilterBar
        direction={followedUserState.sortDirection}
        onDirectionChange={setSortDirection}
        filters={[
          {
            side: "left",
            value: followedUserState.status,
            onChange: setStatus,
            options: [
              {
                value: null,
                label: t("optionValue_status_any"),
              },
              {
                value: true,
                label: t("optionValue_status_onlineOnly"),
              },
              {
                value: false,
                label: t("optionValue_status_offlineOnly"),
              },
            ],
          },
          {
            side: "right",
            value: followedUserState.sortField,
            onChange: setSortField,
            options: [
              {
                value: "channelName",
                label: t("optionValue_sort_name"),
              },
              {
                value: "followedAt",
                label: t("optionValue_sort_followedAt"),
              },
            ],
          },
        ]}
      />

      <ChildComponent {...{ followedUserState, searchQuery }} />
    </Layout>
  );
}

export default Component;
