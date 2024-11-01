import { formatDate } from '@/app/utils/dateUtil';
import { Avatar } from '@mui/material';

type Props = {
  notificationContent: {
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
};

const NotificationContent: React.FC<Props> = (props) => {
  const { notificationContent } = props;

  return (
    <div className='flex flex-col w-full px-6'>
      <h2 className='text-2xl font-bold'>{notificationContent.title}</h2>

      <div className='flex justify-between items-center my-4'>
        <div className='flex items-center gap-2'>
          <Avatar
            src={notificationContent.sender.photo ?? undefined}
            sx={{ width: 36, height: 36 }}
          />
          <h2 className='text-sm font-bold'>{notificationContent.sender.name}</h2>
        </div>

        <p className='text-sm text-gray-300'>
          {formatDate(notificationContent.createdAt, 'yyyy/MM/dd HH:mm')}
        </p>
      </div>

      <p className='whitespace-pre-wrap'>{notificationContent.content}</p>
    </div>
  );
};

export default NotificationContent;
