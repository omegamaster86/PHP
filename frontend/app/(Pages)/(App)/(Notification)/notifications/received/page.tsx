'use client';

import { ListItem } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/ListItem';
import { NotificationContent } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/NotificationContent';
import { CustomButton } from '@/app/components';
import { fetcher } from '@/app/lib/swr';
import { NotificationInfoData } from '@/app/types';
import { Button } from '@mui/base';
import { useMediaQuery } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';

export default function NotificationsList() {
  // tailwindのmdの幅を超えているかどうか
  const isWideScreen = useMediaQuery('(min-width: 768px)');
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentId = Number(searchParams.get('id'));

  const notificationRes = useSWR(
    {
      url: '/getNotificationInfoData',
      params: {
        notificationId: currentId,
      },
    },
    currentId ? fetcher<NotificationInfoData> : null,
    {
      onError: (err) => {
        router.back();
      },
    },
  );

  const data: NotificationInfoData[] = [
    {
      notificationId: 1,
      title:
        'XXX大会に出場予定です！あああああああああああああああああああああああああああああああああああああああああああああああああああああああ',
      body: '本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。\n本文が入ります。本文が入ります。本文が入ります。本文が入ります。\n本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。\n\nリンク\n\n本文が入ります。\n本文が入ります。',
      sentTime: '2022-01-01 18:00',
      senderId: 1,
      senderName: '山田太郎',
      senderIcon: null,
      to: 'xxx大会 フォロワー',
      notificationDestinationTypeId: 1,
    },
    {
      notificationId: 2,
      title: 'XXX大会に出場予定です！',
      body: '本文が入ります。',
      sentTime: '2022-01-01 18:00',
      senderId: 1,
      senderName: '山田太郎',
      senderIcon: null,
      to: 'xxx大会 フォロワー',
      notificationDestinationTypeId: 1,
    },
    {
      notificationId: 3,
      title: 'XXX大会に出場予定です！',
      body: '本文が入ります。',
      sentTime: '2022-01-01 18:00',
      senderId: 1,
      senderName: '山田太郎',
      senderIcon: null,
      to: 'xxx大会 フォロワー',
      notificationDestinationTypeId: 1,
    },
    {
      notificationId: 4,
      title: 'XXX大会に出場予定です！',
      body: '本文が入ります。',
      sentTime: '2022-01-01 18:00',
      senderId: 1,
      senderName: '山田太郎',
      senderIcon: null,
      to: 'xxx大会 フォロワー',
      notificationDestinationTypeId: 1,
    },
    {
      notificationId: 5,
      title: 'XXX大会に出場予定です！',
      body: '本文が入ります。',
      sentTime: '2022-01-01 18:00',
      senderId: 1,
      senderName: '山田太郎',
      senderIcon: null,
      to: 'xxx大会 フォロワー',
      notificationDestinationTypeId: 1,
    },
    {
      notificationId: 6,
      title: 'XXX大会に出場予定です！',
      body: '本文が入ります。',
      sentTime: '2022-01-01 18:00',
      senderId: 1,
      senderName: '山田太郎',
      senderIcon: null,
      to: 'xxx大会 フォロワー',
      notificationDestinationTypeId: 1,
    },
    {
      notificationId: 7,
      title: 'XXX大会に出場予定です！',
      body: '本文が入ります。',
      sentTime: '2022-01-01 18:00',
      senderId: 1,
      senderName: '山田太郎',
      senderIcon: null,
      to: 'xxx大会 フォロワー',
      notificationDestinationTypeId: 1,
    },
    {
      notificationId: 8,
      title: 'XXX大会に出場予定です！',
      body: '本文が入ります。',
      sentTime: '2022-01-01 18:00',
      senderId: 1,
      senderName: '山田太郎',
      senderIcon: null,
      to: 'xxx大会 フォロワー',
      notificationDestinationTypeId: 1,
    },
    {
      notificationId: 9,
      title: 'XXX大会に出場予定です！',
      body: '本文が入ります。',
      sentTime: '2022-01-01 18:00',
      senderId: 1,
      senderName: '山田太郎',
      senderIcon: null,
      to: 'xxx大会 フォロワー',
      notificationDestinationTypeId: 1,
    },
    {
      notificationId: 10,
      title: 'XXX大会に出場予定です！',
      body: '本文が入ります。',
      sentTime: '2022-01-01 18:00',
      senderId: 1,
      senderName: '山田太郎',
      senderIcon: null,
      to: 'xxx大会 フォロワー',
      notificationDestinationTypeId: 1,
    },
  ];

  const notificationContent = notificationRes.data?.result;
  const hasMore = true;

  const handleClickListItem = (id: number) => async () => {
    updateIsRead(id);

    if (isWideScreen) {
      router.push(`/notifications/received?id=${id}`);
    } else {
      router.push(`/notificationRef?id=${id}`);
    }
  };

  const fetchMore = () => {
    console.log('fetchMore');
  };

  const updateIsRead = (id: number) => {
    console.log('updateIsRead id: ', id);
  };

  return (
    <div className='flex'>
      <div className='flex flex-col w-full md:max-w-xs border-r border-r-gray-50'>
        {data.map((notification) => (
          <Button
            key={notification.notificationId}
            onClick={handleClickListItem(notification.notificationId)}
          >
            <ListItem
              notification={notification}
              isSelected={currentId === notification.notificationId}
            />
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
            type='received'
            notificationContent={notificationContent}
            isWideScreen={isWideScreen}
          />
        </div>
      )}
    </div>
  );
}
