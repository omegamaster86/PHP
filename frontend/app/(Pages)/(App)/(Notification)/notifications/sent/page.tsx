'use client';

import { ListItem } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/ListItem';
import { NotificationContent } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/NotificationContent';
import { CustomButton, CustomTitle } from '@/app/components';
import { useAuth } from '@/app/hooks/auth';
import { useInfiniteList } from '@/app/hooks/useInfiniteList';
import { fetcher } from '@/app/lib/swr';
import { NotificationInfoData } from '@/app/types';
import { Button } from '@mui/base';
import { useMediaQuery } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

type NotificationMode = 'delete';

const sendDeleteRequest = async (url: string, trigger: { arg: { notificationId: number } }) => {
  return fetcher({
    url,
    method: 'DELETE',
    params: {
      notificationId: trigger.arg.notificationId,
    },
  });
};

const title = '送信通知一覧';
const notSelectedMessage = '送信トレイからメールを選択してください。';
const noDataMessage = '送信したメールはありません。';

export default function NotificationsSentList() {
  // tailwindのmdの幅を超えているかどうか
  const isWideScreen = useMediaQuery('(min-width: 768px)');
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentId = Number(searchParams.get('id'));
  const mode = searchParams.get('mode') as NotificationMode | null;
  const { user } = useAuth({ middleware: 'auth' });

  const { trigger } = useSWRMutation('/deleteNotification', sendDeleteRequest);
  const { data } = useSWR(
    {
      url: '/getSenderNotificationsList',
    },
    fetcher<NotificationInfoData[]>,
    { suspense: true },
  );
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

  const notifications = data.result ?? [];
  const { infiniteList, isLastPage, fetchMore } = useInfiniteList(notifications);

  const hasNotifications = !!notifications.length;
  const notificationContent = notificationRes.data?.result;
  // 通知IDを指定してる&通知内容がある&通知内容の取得が終わっている
  const isSelected = !!currentId && !!notificationContent && !notificationRes.isLoading;
  const senderId = Number(notificationContent?.senderId);
  const userId = Number(user?.user_id);
  const isAuthor = !!senderId && !!userId && senderId === userId;
  const isDeleteMode = mode === 'delete';

  const updateIsRead = (id: number) => {
    console.log('updateIsRead id: ', id);
  };

  const handleDelete = (id: number) => {
    const ok = window.confirm('この通知を削除します。よろしいですか？');
    if (ok) {
      trigger(
        { notificationId: id },
        {
          onSuccess: () => {
            router.replace('/notifications/sent');
          },
        },
      );
    }
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
    <div>
      <div className='mb-5'>
        <CustomTitle displayBack>{title}</CustomTitle>
      </div>
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
              type='sent'
              notificationContent={notificationContent}
              isAuthor={isAuthor}
              isWideScreen={isWideScreen}
              isDeleteMode={isDeleteMode}
              onDelete={handleDelete}
            />
          ) : (
            <div className='flex justify-center items-center w-full'>
              <p>{notSelectedMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
