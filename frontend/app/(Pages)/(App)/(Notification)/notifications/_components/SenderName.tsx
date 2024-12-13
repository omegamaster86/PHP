import { NotificationToType } from '@/app/constants';
import { cn } from '@/app/utils/cn';
import Link from 'next/link';

type Props = {
  notificationDestinationType: NotificationToType;
  senderName: string;
  tournId: number | null;
  playerId: number;
  className?: string;
};

const SenderName: React.FC<Props> = (props) => {
  const { notificationDestinationType, senderName, tournId, playerId } = props;

  const className = cn('text-sm font-bold truncate', props.className);
  const title = <h2 className={className}>{senderName}</h2>;

  // 選手情報参照画面
  if (notificationDestinationType === 'userFollower') {
    return <Link href={`/playerInformationRef?playerId=${playerId}`}>{title}</Link>;
  }
  // 大会情報参照画面
  if (notificationDestinationType === 'tournFollower') {
    return <Link href={`/tournamentRef?tournId=${tournId ?? ''}`}>{title}</Link>;
  }

  return title;
};

export default SenderName;
