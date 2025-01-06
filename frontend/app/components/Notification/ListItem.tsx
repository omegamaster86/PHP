import { NotificationAvatar } from '@/app/components/Notification/NotificationAvatar';
import { getNotificationDestinationType } from '@/app/constants';
import { NotificationListData } from '@/app/types';
import { cn } from '@/app/utils/cn';
import { formatDate } from '@/app/utils/dateUtil';

type Props = {
  notification: NotificationListData;
  isSelected: boolean;
};

export const ListItem: React.FC<Props> = (props) => {
  const { notification, isSelected } = props;
  const { title, sentTime, senderName, senderIcon, notificationDestinationTypeId } = notification;
  const isRead = false;
  const notificationDestinationType = getNotificationDestinationType(notificationDestinationTypeId);

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4',
        isRead && 'opacity-50',
        isSelected && 'border-r-2 border-r-primary-500 md:bg-primary-40',
      )}
    >
      <div className='flex flex-col gap-4 w-full'>
        <div className='flex justify-between items-center w-full gap-2'>
          <div className='flex items-center gap-2 min-w-0'>
            <NotificationAvatar
              notificationDestinationType={notificationDestinationType}
              senderIcon={senderIcon}
              senderName={senderName}
              sx={{
                width: 24,
                height: 24,
                fontSize: 14,
              }}
            />
            <h2 className='text-xs font-bold truncate'>{senderName}</h2>
          </div>
          <p className='text-xs text-gray-300 flex-shrink-0'>
            {formatDate(sentTime, 'yyyy/MM/dd HH:mm')}
          </p>
        </div>

        <h3 className='text-base font-bold text-start truncate'>{title}</h3>
      </div>
    </div>
  );
};
