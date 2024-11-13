'use client';

import { Delete } from '@/app/(Pages)/(App)/(Notification)/notifications/notificationsRef/_components/Delete';
import { View } from '@/app/(Pages)/(App)/(Notification)/notifications/notificationsRef/_components/View';
import { useSearchParams } from 'next/navigation';

type NotificationMode = 'delete';

export default function NotificationsRef() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as NotificationMode | null;

  if (mode === 'delete') {
    return <Delete />;
  }

  return <View />;
}
