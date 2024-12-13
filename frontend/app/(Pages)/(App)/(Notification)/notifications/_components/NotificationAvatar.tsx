import { NotificationToType } from '@/app/constants';
import { Avatar, AvatarProps } from '@mui/material';

type Props = {
  notificationDestinationType: NotificationToType;
  senderIcon: string | null;
  senderName: string;
  sx?: AvatarProps['sx'];
};

export const NotificationAvatar: React.FC<Props> = (props) => {
  const { notificationDestinationType, senderIcon, senderName, sx } = props;

  if (notificationDestinationType === 'tournFollower') {
    return <Avatar sx={sx}>{senderIcon}</Avatar>;
  }

  // 有資格者(3)、全ユーザー(4)であればjara-icon.pngを表示
  const avatarSrc = ['qualifiedUser', 'allUser'].includes(notificationDestinationType)
    ? '/jara-icon.png'
    : senderIcon;

  return <Avatar src={avatarSrc ?? undefined} alt={senderName} sx={sx} />;
};
