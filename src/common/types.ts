import { ClickAction, ClickBehavior } from "./constants";

export type Dictionary<T> = Record<string, T>;

export type FontSize = "smallest" | "small" | "medium" | "large" | "largest";
export type SortDirection = "asc" | "desc";
export type Theme = "system" | "dark" | "light";

export interface GeneralSettings {
  clickBehavior: ClickBehavior;
  clickAction: ClickAction;
  fontSize: FontSize;
  theme: Theme;
}

export interface BadgeSettings {
  enabled: boolean;
  color: string;
}

export interface StreamSettings {
  withReruns: boolean;
  withFilters: boolean;
  selectedLanguages: string[];
}

export interface NotificationSettings {
  enabled: boolean;
  withFilters: boolean;
  withCategoryChanges: boolean;
  withChzzkSettings: boolean;
  ignoredCategories: string[];
  selectedUsers: string[];
}

export interface CustomAction {
  id: string;
  title: string;
  url: string;
}

export interface DropdownMenuSettings {
  customActions: CustomAction[];
}

export type FollowedStreamSortField =
  | "liveInfo.liveCategoryValue"
  | "liveInfo.openDate"
  | "channel.channelName"
  | "liveInfo.concurrentUserCount";

export interface FollowedStreamState {
  sortDirection: SortDirection;
  sortField: FollowedStreamSortField;
}

export type FollowedUserSortField = "followedAt" | "channelName";

export interface FollowedUserState {
  sortDirection: SortDirection;
  sortField: FollowedUserSortField;
  status: boolean | null;
}

export interface Settings {
  general: GeneralSettings;
  badge: BadgeSettings;
  notifications: NotificationSettings;
  dropdownMenu: DropdownMenuSettings;
  streams: StreamSettings;
}

export interface CurrentUser {
  userIdHash: string;
  nickname: string;
  profileImageUrl: string | null;
}

export type CollectionType = "category" | "user";

export interface Collection {
  id: string;
  name: string;
  type: CollectionType;
  items: string[];
}

export interface ChzzkCategory {
  id: string;
  name: string;
  count?: number;
  logo?: string;
}

export interface ChzzkChannel {
  channelId: string;
  channelName: string;
  channelImageUrl: string | null;
  verifiedMark: boolean;
  channelDescription?: string;
  followerCount?: number;
  openLive?: boolean;
  personalData?: {
    following?: {
      following: boolean;
      notification: boolean;
      followDate: string | null;
    };
    privateUserBlock?: boolean;
  };
}

export interface ChzzkFollowedChannel {
  channelId: string;
  channel: ChzzkChannel;
  streamer?: {
    openLive: boolean;
  };
  liveInfo: ChzzkLiveInfo;
}

export interface ChzzkFollowing {
  totalCount: number;
  totalPage: number;
  followingList: ChzzkFollowedChannel[];
}

export interface ChzzkLive extends ChzzkLiveInfo {
  liveId: number;
  liveImageUrl: string | null;
  defaultThumbnailImageUrl: string | null;
  accumulateCount: number;
  openDate: string;
  adult: boolean;
  categoryType: string | null;
  liveCategory: string;
  channel: ChzzkChannel;
}

export interface ChzzkLiveInfo {
  liveTitle: string;
  concurrentUserCount: number;
  liveCategoryValue: string;
}

export interface ChzzkLounge {
  loungeId: string;
  loungeName: string;
  backgroundMobileImageUrl: string | null;
  logoImageSquareUrl: string;
}

export interface ChzzkUser {
  hasProfile: boolean;
  userIdHash: string;
  nickname: string;
  profileImageUrl: string | null;
  penalties: unknown;
  officialNotiAgree: boolean;
  officialNotiAgreeUpdatedDate: string | null;
  verifiedMark: boolean;
  loggedIn: boolean;
}

export interface ChzzkVideo {
  videoNo: number;
  videoId: string;
  videoTitle: string;
  videoType: string;
  publishDate: string;
  thumbnailImageUrl: string;
  duration: number;
  readCount: number;
  channelId: string;
  publishDateAt: number;
  adult: boolean;
  categoryType: string;
  videoCategory: string;
  videoCategoryValue: string;
}

export interface ChzzkPagination<T> {
  size: number;
  page: {
    next: any;
  } | null;
  data: T[];
}

export interface ChzzkOffset {
  totalCount: number;
  offset: number;
  limit: number;
}

export interface ChzzkResponse<T> {
  code: number;
  content: T | null;
  message: string | null;
}
