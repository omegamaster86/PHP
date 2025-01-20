import { PLAYER_IMAGE_URL } from '@/app/utils/imageUrl';
import { Avatar, AvatarProps } from '@mui/material';

type Props = Omit<AvatarProps, 'src'> & {
  fileName?: string;
};

export const CustomPlayerAvatar: React.FC<Props> = (props) => {
  const { fileName, ...rest } = props;

  const src = fileName ? `${PLAYER_IMAGE_URL}${fileName}` : undefined;

  return <Avatar {...rest} src={src} />;
};
