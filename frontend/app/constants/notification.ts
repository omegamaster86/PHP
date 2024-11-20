const notificationToTypeLabel = {
  userFollower: '自分をフォローしているユーザー',
  tournFollower: '大会をフォローしているユーザー',
  qualifiedUser: '有資格者',
  allUser: '全ユーザー',
} as const;

export type NotificationToType = keyof typeof notificationToTypeLabel;

export const getNotificationToTypeLabel = (notificationToType: NotificationToType) => {
  return notificationToTypeLabel[notificationToType];
};
