import { TitleSideButton } from '@/app/(Pages)/(App)/_components/TitleSideButton';
import { CustomButton } from '@/app/components';
import Tag from '@/app/components/Tag';
import { formatDate } from '@/app/utils/dateUtil';
import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Avatar } from '@mui/material';
import { useRouter } from 'next/navigation';

type NotificationContent = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: number;
    name: string;
    photo: string | undefined;
  };
};

type Props =
  | {
      type: 'received';
      notificationContent: NotificationContent;
      isWideScreen: boolean;
    }
  | {
      type: 'sent';
      notificationContent: NotificationContent;
      isWideScreen: boolean;
      to: string;
      isDeleteMode?: boolean;
      onDelete: (id: number) => void;
    };

export const NotificationContent: React.FC<Props> = (props) => {
  const { type, notificationContent, isWideScreen } = props;
  const router = useRouter();

  const { id, title, content, createdAt, sender } = notificationContent;
  const isSent = type === 'sent';
  const isDeleteMode = !!(isSent && props.isDeleteMode);
  const editPath = `/notification?mode=update&id=${id}`;
  const deletePath = isWideScreen
    ? `/notifications/sent?mode=delete&id=${id}`
    : `/notificationRef?mode=delete&id=${id}`;

  return (
    <div className='flex flex-col w-full px-6'>
      <div className='flex justify-between gap-4'>
        <h2 className='text-lg font-bold'>{title}</h2>

        {/* 送信詳細画面で通知の作者&削除モードではないとき表示 */}
        {isSent && !isDeleteMode && (
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
          <Tag tag={props.to} className='bg-gray-50' />
        </div>
      )}

      <div className='flex justify-between items-center my-4'>
        <div className='flex items-center gap-2'>
          <Avatar src={sender.photo ?? undefined} sx={{ width: 36, height: 36 }} />
          <h2 className='text-sm font-bold'>{sender.name}</h2>
        </div>

        <p className='text-2xs text-gray-300'>{formatDate(createdAt, 'yyyy/MM/dd HH:mm')}</p>
      </div>

      <p className='text-xs whitespace-pre-wrap'>{content}</p>

      {/* 送信詳細画面で通知の作者&削除モードのとき表示 */}
      {isSent && isDeleteMode && (
        <div className='flex flex-wrap justify-center gap-4 mt-4'>
          <CustomButton onClick={router.back}>戻る</CustomButton>
          <CustomButton buttonType='primary' onClick={() => props.onDelete(id)}>
            削除
          </CustomButton>
        </div>
      )}
    </div>
  );
};
