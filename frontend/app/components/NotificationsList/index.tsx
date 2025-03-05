'use client';

import { CustomButton } from '@/app/components';
import { ListItem } from '@/app/components/Notification/ListItem';
import { NotificationContent } from '@/app/components/Notification/NotificationContent';
import { useInfiniteList } from '@/app/hooks/useInfiniteList';
import { fetcher } from '@/app/lib/swr';
import { NotificationInfoData, NotificationListData } from '@/app/types';
import { Button } from '@mui/base';
import { useMediaQuery } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

const notSelectedMessage = '受信トレイからメールを選択してください。';
const noDataMessage = '受信したメールはありません。';

const sendUpdateRequest = async (
  url: string,
  trigger: {
    arg: {
      notificationId: number;
    };
  },
) => {
  return fetcher({
    url,
    method: 'PATCH',
    data: {
      notificationId: trigger.arg.notificationId,
    },
  });
};

// unreadCountのSWRキャッシュを更新するためのキー
const unreadCountKey = { url: '/api/unreadCount' };

export default function NotificationsList() {
  // tailwindのmdの幅を超えているかどうか
  const isWideScreen = useMediaQuery('(min-width: 768px)');
  const router = useRouter();
  const searchParams = useSearchParams();
  const swrConfig = useSWRConfig();
  const pathname = usePathname();
  const isTopPage = pathname === '/mypage/top';
  const notificationType = 'received' as const;

  const currentId = Number(searchParams.get('id'));

  const receivedNotifications = useSWR(
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
        notificationType,
      },
    },
    currentId ? fetcher<NotificationInfoData> : null,
    {
      onError: (err) => {
        if (isTopPage) {
          router.replace(`/mypage/top`);
        } else {
          router.replace('/notifications/received');
        }
      },
    },
  );

  const updateReadStatus = useSWRMutation('api/updateNotificationReadFlag', sendUpdateRequest);

  const notifications = receivedNotifications.data.result ?? [];
  const { infiniteList, isLastPage, fetchMore } = useInfiniteList(notifications);

  const hasNotifications = !!notifications.length;
  const notificationContent = notificationRes.data?.result;
  // 通知IDを指定してる&通知内容がある&通知内容の取得が終わっている
  const isSelected = !!currentId && !!notificationContent && !notificationRes.isLoading;

  const handleClickListItem = (id: number, isRead: boolean) => async () => {
    if (!isRead) {
      await updateIsRead(id);
    }

    if (isTopPage) {
      if (isWideScreen) {
        router.push(`/mypage/top?id=${id}`, { scroll: false });
      } else {
        router.push(`/notificationRef?id=${id}&notificationType=received`);
      }
    } else {
      if (isWideScreen) {
        router.push(`/notifications/received?id=${id}`);
      } else {
        router.push(`/notificationRef?id=${id}&notificationType=received`);
      }
    }
  };

  const updateIsRead = async (id: number) => {
    if (updateReadStatus.isMutating) {
      return;
    }

    const newNotifications = notifications.map((n) => {
      if (n.notificationId === id) {
        return { ...n, isRead: 1 };
      }
      return n;
    });

    receivedNotifications.mutate(
      { result: newNotifications },
      {
        optimisticData: {
          result: newNotifications,
        },
        revalidate: false,
        rollbackOnError: true,
      },
    );

    // 1. 未読数を更新
    await updateReadStatus.trigger({ notificationId: id });
    // 2. 未読数のキャッシュを更新
    await swrConfig.mutate(unreadCountKey);
  };

  return (
    <div className='flex max-h-[calc(100vh-(3.75rem+1rem+1.5rem*1.5+1.75rem+1rem))] md:max-h-[calc(100vh-(3.75rem+3rem+3rem+1.5rem*1.5+1.75rem+3rem))] lg:max-h-[calc(100vh-(3.75rem+3rem+3rem+2.25rem*1.5+1.75rem+3rem))]'>
      <div className='flex flex-col w-full overflow-y-auto md:max-w-xs border-r border-r-gray-50'>
        {hasNotifications ? (
          infiniteList.map((n) => (
            <Button
              key={n.notificationId}
              onClick={handleClickListItem(n.notificationId, Boolean(n.isRead))}
            >
              <ListItem
                notification={n}
                isSelected={currentId === n.notificationId}
                isWideScreen={isWideScreen}
              />
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
      <div className='hidden md:block w-full overflow-y-auto'>
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
  );
}
