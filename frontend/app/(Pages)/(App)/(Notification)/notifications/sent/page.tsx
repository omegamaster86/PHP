'use client';

import { ListItem } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/ListItem';
import { NotificationContent } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/NotificationContent';
import { CustomButton } from '@/app/components';
import { useNotification } from '@/app/hooks/useNotification';
import { Button } from '@mui/base';
import { useMediaQuery } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';

type NotificationMode = 'delete';

export default function NotificationsSentList() {
  // tailwindのmdの幅を超えているかどうか
  const isWideScreen = useMediaQuery('(min-width: 768px)');
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentId = Number(searchParams.get('id'));
  const mode = searchParams.get('mode') as NotificationMode | null;
  const { getToLabel } = useNotification();

  const data = [
    {
      id: 1,
      title:
        'XXX大会に出場予定です！あああああああああああああああああああああああああああああああああああああああああああああああああああああああ',
      content:
        '本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。\n本文が入ります。本文が入ります。本文が入ります。本文が入ります。\n本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。\n\nリンク\n\n本文が入ります。\n本文が入ります。',
      createdAt: '2022-01-01 18:00',
      isRead: false,
      sender: {
        id: 1,
        name: '山田太郎',
        photo: undefined,
      },
    },
    {
      id: 2,
      title: 'XXX大会に出場予定です！',
      content: '本文が入ります。',
      createdAt: '2022-01-01 18:00',
      isRead: true,
      sender: {
        id: 1,
        name: '山田太郎',
        photo: undefined,
      },
    },
    {
      id: 3,
      title: 'XXX大会に出場予定です！',
      content: '本文が入ります。',
      createdAt: '2022-01-01 18:00',
      isRead: true,
      sender: {
        id: 1,
        name: '山田太郎',
        photo: undefined,
      },
    },
    {
      id: 4,
      title: 'XXX大会に出場予定です！',
      content: '本文が入ります。',
      createdAt: '2022-01-01 18:00',
      isRead: true,
      sender: {
        id: 1,
        name: '山田太郎',
        photo: undefined,
      },
    },
    {
      id: 5,
      title: 'XXX大会に出場予定です！',
      content: '本文が入ります。',
      createdAt: '2022-01-01 18:00',
      isRead: true,
      sender: {
        id: 1,
        name: '山田太郎',
        photo: undefined,
      },
    },
    {
      id: 6,
      title: 'XXX大会に出場予定です！',
      content: '本文が入ります。',
      createdAt: '2022-01-01 18:00',
      isRead: true,
      sender: {
        id: 1,
        name: '山田太郎',
        photo: undefined,
      },
    },
    {
      id: 7,
      title: 'XXX大会に出場予定です！',
      content: '本文が入ります。',
      createdAt: '2022-01-01 18:00',
      isRead: true,
      sender: {
        id: 1,
        name: '山田太郎',
        photo: undefined,
      },
    },
    {
      id: 8,
      title: 'XXX大会に出場予定です！',
      content: '本文が入ります。',
      createdAt: '2022-01-01 18:00',
      isRead: true,
      sender: {
        id: 1,
        name: '山田太郎',
        photo: undefined,
      },
    },
    {
      id: 9,
      title: 'XXX大会に出場予定です！',
      content: '本文が入ります。',
      createdAt: '2022-01-01 18:00',
      isRead: true,
      sender: {
        id: 1,
        name: '山田太郎',
        photo: undefined,
      },
    },
    {
      id: 10,
      title: 'XXX大会に出場予定です！',
      content: '本文が入ります。',
      createdAt: '2022-01-01 18:00',
      isRead: true,
      sender: {
        id: 1,
        name: '山田太郎',
        photo: undefined,
      },
    },
  ];

  const hasMore = true;
  const notificationContent = data.find((notification) => notification.id === currentId);
  const to = getToLabel({ type: 'tournFollower', tornName: 'xxxx大会' });
  const isDeleteMode = mode === 'delete';

  const fetchMore = () => {
    console.log('fetchMore');
  };

  const updateIsRead = (id: number) => {
    console.log('updateIsRead id: ', id);
  };

  const handleDelete = (id: number) => {
    console.log('handleDelete id: ', id);
  };

  const handleClickListItem = (id: number) => async () => {
    updateIsRead(id);

    if (isWideScreen) {
      router.push(`/notifications/sent?id=${id}`);
    } else {
      router.push(`/notificationRef?id=${id}`);
    }
  };

  return (
    <div className='flex'>
      <div className='flex flex-col w-full md:max-w-xs border-r border-r-gray-50'>
        {data.map((notification) => (
          <Button key={notification.id} onClick={handleClickListItem(notification.id)}>
            <ListItem notification={notification} isSelected={currentId === notification.id} />
          </Button>
        ))}

        {hasMore && (
          <div className='flex justify-center my-4'>
            <CustomButton buttonType='primary-outlined' className='w-28' onClick={fetchMore}>
              もっと見る
            </CustomButton>
          </div>
        )}
      </div>

      {/* スマホの場合は非表示 */}
      {notificationContent && (
        <div className='hidden md:block w-full'>
          <NotificationContent
            type='sent'
            notificationContent={notificationContent}
            isWideScreen={isWideScreen}
            to={to}
            isDeleteMode={isDeleteMode}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}
