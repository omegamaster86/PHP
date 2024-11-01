import { cn } from '@/app/utils/cn';
import { formatDate } from '@/app/utils/dateUtil';
import { Avatar } from '@mui/material';

type Props = {
  notification: {
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
  isSelected: boolean;
};

const ListItem: React.FC<Props> = (props) => {
  const { notification, isSelected } = props;
  const { title, createdAt, isRead, sender } = notification;

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4',
        isRead && 'opacity-50',
        isSelected && 'border-r-2 border-r-primary-500 bg-primary-40',
      )}
    >
      <div className='flex flex-col gap-4 w-full'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <Avatar
              src={sender.photo}
              alt={sender.name}
              sx={{
                width: 24,
                height: 24,
              }}
            />
            <h2 className='text-xs font-bold'>{sender.name}</h2>
          </div>
          <p className='text-xs text-gray-300'>{formatDate(createdAt, 'yyyy/MM/dd HH:mm')}</p>
        </div>

        <h3 className='text-base font-bold text-start whitespace-nowrap overflow-hidden text-ellipsis'>
          {title}
        </h3>
      </div>
    </div>
  );
};

export default ListItem;
