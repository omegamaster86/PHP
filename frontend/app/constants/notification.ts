const notificationToTypeLabel = {
  userFollower: '自分をフォローしているユーザー',
  tournFollower: '大会をフォローしているユーザー',
  qualifiedUser: '有資格者',
  allUser: '全ユーザー',
} as const;

const notificationDestination = {
  userFollower: 1,
  tournFollower: 2,
  qualifiedUser: 3,
  allUser: 4,
} as const;

const notificationDestinationType = {
  1: 'userFollower',
  2: 'tournFollower',
  3: 'qualifiedUser',
  4: 'allUser',
} as const;

export type NotificationToType = keyof typeof notificationToTypeLabel;
export type NotificationDestinationId = (typeof notificationDestination)[NotificationToType];

export const getNotificationToTypeLabel = (notificationToType: NotificationToType) => {
  return notificationToTypeLabel[notificationToType];
};

export const getNotificationDestination = (notificationToType: NotificationToType) => {
  return notificationDestination[notificationToType];
};

export const getNotificationDestinationType = (
  notificationDestinationId: NotificationDestinationId,
) => {
  return notificationDestinationType[notificationDestinationId];
};
