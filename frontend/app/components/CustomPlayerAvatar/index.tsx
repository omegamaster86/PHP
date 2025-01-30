import { PLAYER_IMAGE_URL } from '@/app/utils/imageUrl';
import { Avatar, AvatarProps } from '@mui/material';

type Props = Omit<AvatarProps, 'src'> & {
  fileName?: string;
  isPreview?: boolean;
};

export const CustomPlayerAvatar: React.FC<Props> = (props) => {
  const { fileName, isPreview = false, ...rest } = props;

  let src = fileName;
  if (!isPreview && fileName) {
    src = `${PLAYER_IMAGE_URL}${fileName}`;
  }

  return <Avatar {...rest} src={src} />;
};
