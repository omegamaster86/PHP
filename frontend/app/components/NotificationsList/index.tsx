'use client';

import { ListItem } from '@/app/components/Notification/ListItem';
import { NotificationContent } from '@/app/components/Notification/NotificationContent';
import { CustomButton, CustomTitle } from '@/app/components';
import { useInfiniteList } from '@/app/hooks/useInfiniteList';
import { fetcher } from '@/app/lib/swr';
import { NotificationInfoData, NotificationListData } from '@/app/types';
import { Button } from '@mui/base';
import { useMediaQuery } from '@mui/material';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import useSWR from 'swr';

const notSelectedMessage = '受信トレイからメールを選択してください。';
const noDataMessage = '受信したメールはありません。';

export default function NotificationsList() {
  // tailwindのmdの幅を超えているかどうか
  const isWideScreen = useMediaQuery('(min-width: 768px)');
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentId = Number(searchParams.get('id'));

  const { data } = useSWR(
    {
      url: 'api/getRecipientsNotificationsList',
    },
    fetcher<NotificationListData[]>,
    { suspense: true },
  );

  const notificationRes = useSWR(
    {
      url: 'api/getNotificationInfoData',
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

  const notifications = data.result ?? [];
  const { infiniteList, isLastPage, fetchMore } = useInfiniteList(notifications);

  const hasNotifications = !!notifications.length;
  const notificationContent = notificationRes.data?.result;
  // 通知IDを指定してる&通知内容がある&通知内容の取得が終わっている
  const isSelected = !!currentId && !!notificationContent && !notificationRes.isLoading;

  const pathname = usePathname();
  const isTopPage = pathname === '/mypage/top';

  const handleClickListItem = (id: number) => async () => {
    updateIsRead(id);

    if (isTopPage) {
      if (isWideScreen) {
        router.push(`/mypage/top?id=${id}`);
      } else {
        router.push(`/notificationRef?id=${id}`);
      }
    } else {
      if (isWideScreen) {
        router.push(`/notifications/received?id=${id}`);
      } else {
        router.push(`/notificationRef?id=${id}`);
      }
    }
  };

  const updateIsRead = (id: number) => {
    console.log('updateIsRead id: ', id);
  };

  return (
    <>
      <div className='flex'>
        <div className='flex flex-col w-full md:max-w-xs border-r border-r-gray-50'>
          {hasNotifications ? (
            infiniteList.map((n) => (
              <Button key={n.notificationId} onClick={handleClickListItem(n.notificationId)}>
                <ListItem notification={n} isSelected={currentId === n.notificationId} />
              </Button>
            ))
          ) : (
            <div className='flex justify-center items-center w-full'>
              <p>{noDataMessage}</p>
            </div>
          )}

          {!isLastPage && (
            <div className='flex justify-center my-4'>
              <CustomButton buttonType='primary-outlined' className='w-28' onClick={fetchMore}>
                もっと見る
              </CustomButton>
            </div>
          )}
        </div>

        {/* スマホの場合は非表示 */}
        <div className='hidden md:block w-full'>
          {isSelected ? (
            <NotificationContent
              type='received'
              notificationContent={notificationContent}
              isWideScreen={isWideScreen}
            />
          ) : (
            <div className='flex justify-center items-center w-full'>
              <p>{notSelectedMessage}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
