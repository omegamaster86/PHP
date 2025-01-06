import { NotificationAvatar } from '@/app/components/Notification/NotificationAvatar';
import SenderName from '@/app/components/Notification/SenderName';
import { TitleSideButton } from '@/app/(Pages)/(App)/_components/TitleSideButton';
import { CustomButton } from '@/app/components';
import LinkifyText from '@/app/components/LinkifyText';
import Tag from '@/app/components/Tag';
import { getNotificationDestinationType } from '@/app/constants';
import { NotificationInfoData } from '@/app/types';
import { formatDate } from '@/app/utils/dateUtil';
import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

type Props =
  | {
      type: 'received';
      notificationContent: NotificationInfoData;
      isWideScreen: boolean;
    }
  | {
      type: 'sent';
      notificationContent: NotificationInfoData;
      isAuthor: boolean;
      isWideScreen: boolean;
      isDeleteMode?: boolean;
      onDelete: (id: number) => void;
    };

export const NotificationContent: React.FC<Props> = (props) => {
  const { type, notificationContent, isWideScreen } = props;
  const router = useRouter();

  const {
    notificationId,
    title,
    to,
    body,
    notificationDestinationTypeId,
    senderName,
    senderIcon,
    sentTime,
    tournId,
    playerId,
  } = notificationContent;
  const isSent = type === 'sent';
  const isAuthor = !!(isSent && props.isAuthor);
  const isDeleteMode = !!(isSent && props.isDeleteMode);
  const editPath = `/notification?mode=update&id=${notificationId}`;
  const deletePath = isWideScreen
    ? `/notifications/sent?mode=delete&id=${notificationId}`
    : `/notificationRef?mode=delete&id=${notificationId}`;
  const notificationDestinationType = getNotificationDestinationType(notificationDestinationTypeId);

  return (
    <div className='flex flex-col w-full px-6'>
      <div className='flex justify-between gap-4'>
        <h2 className='text-lg font-bold'>{title}</h2>

        {/* 送信詳細画面で通知の作者&削除モードではないとき表示 */}
        {isAuthor && !isDeleteMode && (
          <div className='flex items-start gap-2'>
            <TitleSideButton
              text='編集'
              href={editPath}
              external={false}
              icon={EditOutlined}
              className='sm:w-20'
            />
            <TitleSideButton
              text='削除'
              href={deletePath}
              external={false}
              icon={DeleteOutlined}
              className='sm:w-20'
            />
          </div>
        )}
      </div>

      {isSent && (
        <div className='flex items-center gap-2 my-2 text-2xs'>
          <span>To: </span>
          {to.map((t, i) => (
            <Tag key={`${t}-${i}`} tag={t} className='bg-gray-50' />
          ))}
        </div>
      )}

      <div className='flex justify-between items-center my-4'>
        <div className='flex items-center gap-2'>
          <NotificationAvatar
            notificationDestinationType={notificationDestinationType}
            senderIcon={senderIcon}
            senderName={senderName}
            sx={{ width: 36, height: 36 }}
          />
          <SenderName
            notificationDestinationType={notificationDestinationType}
            senderName={senderName}
            tournId={tournId}
            playerId={playerId}
          />
        </div>

        <p className='text-2xs text-gray-300'>{formatDate(sentTime, 'yyyy/MM/dd HH:mm')}</p>
      </div>

      <p className='text-xs whitespace-pre-wrap'>
        <LinkifyText>{body}</LinkifyText>
      </p>

      {/* 送信詳細画面で通知の作者&削除モードのとき表示 */}
      {isAuthor && isDeleteMode && (
        <div className='flex flex-wrap justify-center gap-4 mt-4'>
          <CustomButton onClick={router.back}>戻る</CustomButton>
          <CustomButton buttonType='primary' onClick={() => props.onDelete(notificationId)}>
            削除
          </CustomButton>
        </div>
      )}
    </div>
  );
};
