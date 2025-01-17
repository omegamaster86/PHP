import { CustomAvatar } from '@/app/components/CustomAvatar';
import { NotificationToType } from '@/app/constants';
import { JARA_IMAGE_URL } from '@/app/utils/imageUrl';
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
  if (['qualifiedUser', 'allUser'].includes(notificationDestinationType)) {
    return <Avatar src={JARA_IMAGE_URL} alt={senderName} sx={sx} />;
  }

  return <CustomAvatar fileName={senderIcon ?? undefined} alt={senderName} sx={sx} />;
};
