'use client';

import { NotificationContent } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/NotificationContent';
import { useAuth } from '@/app/hooks/auth';
import { useNotification } from '@/app/hooks/useNotification';
import { useSearchParams } from 'next/navigation';

type NotificationMode = 'delete';

export default function NotificationRef() {
  const { user } = useAuth({ middleware: 'auth' });
  const searchParams = useSearchParams();
  const currentId = Number(searchParams.get('id'));
  const userId = Number(user?.user_id);
  const mode = searchParams.get('mode') as NotificationMode | null;

  const { getToLabel } = useNotification();

  if (!userId || !currentId) {
    return null;
  }

  const mockNotificationContent = {
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
  };

  const type = userId === mockNotificationContent.sender.id ? 'sent' : 'received';

  if (type === 'received') {
    return (
      <NotificationContent
        type='received'
        notificationContent={mockNotificationContent}
        isWideScreen={false}
      />
    );
  }

  if (type === 'sent') {
    const to = getToLabel({ type: 'tournFollower', tornName: 'xxxx大会' });
    const isDeleteMode = mode === 'delete';

    const handleDelete = (id: number) => {
      console.log('handleDelete id: ', id);
    };

    return (
      <NotificationContent
        type='sent'
        notificationContent={mockNotificationContent}
        isWideScreen={false}
        to={to}
        isDeleteMode={isDeleteMode}
        onDelete={handleDelete}
      />
    );
  }

  return null;
}
