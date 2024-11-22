'use client';

import { NotificationContent } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/NotificationContent';
import { useAuth } from '@/app/hooks/auth';
import { fetcher } from '@/app/lib/swr';
import { NotificationInfoData } from '@/app/types';
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

export default function NotificationRef() {
  const { user } = useAuth({ middleware: 'auth' });
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentId = Number(searchParams.get('id'));
  const userId = Number(user?.user_id);
  const mode = searchParams.get('mode') as NotificationMode | null;

  const { trigger } = useSWRMutation('/deleteNotification', sendDeleteRequest);
  const { data } = useSWR(
    {
      url: '/getNotificationInfoData',
      params: {
        notificationId: currentId,
      },
    },
    fetcher<NotificationInfoData>,
    {
      onError: (err) => {
        router.back();
      },
    },
  );

  const result = data?.result;

  if (!userId || !currentId || !result) {
    return null;
  }

  const { senderId } = result;
  const type = userId === senderId ? 'sent' : 'received';

  if (type === 'received') {
    return (
      <NotificationContent type='received' notificationContent={result} isWideScreen={false} />
    );
  }

  if (type === 'sent') {
    const isAuthor = !!senderId && !!userId && senderId === userId;
    const isDeleteMode = mode === 'delete';

    const handleDelete = (id: number) => {
      const ok = window.confirm('この通知を削除します。よろしいですか？');
      if (ok) {
        trigger({
          notificationId: id,
        });
      }
    };

    return (
      <NotificationContent
        type='sent'
        notificationContent={result}
        isAuthor={isAuthor}
        isWideScreen={false}
        isDeleteMode={isDeleteMode}
        onDelete={handleDelete}
      />
    );
  }

  return null;
}
