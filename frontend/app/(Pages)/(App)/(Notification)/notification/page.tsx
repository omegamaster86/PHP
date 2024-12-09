'use client';

import { Confirm } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/Confirm';
import { Create } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/Create';
import { Update } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/Update';
import { fetcher } from '@/app/lib/swr';
import {
  MyOrgsHostedTournament,
  NotificationCreateFormInput,
  NotificationUpdateFormInput,
  SelectOption,
} from '@/app/types';
import { getStorageKey, setSessionStorage } from '@/app/utils/sessionStorage';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';

type NotificationMode = 'create' | 'update' | 'confirm';

export default function Notification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') || 'create') as NotificationMode;

  const coachRes = useSWR({ url: '/getCoachQualifications' }, fetcher<SelectOption[]>);
  const refereeRes = useSWR({ url: '/getRefereeQualifications' }, fetcher<SelectOption[]>);
  const tournRes = useSWR(
    { url: '/getMyOrgsHostedTournaments' },
    fetcher<MyOrgsHostedTournament[]>,
  );

  const coachQualifications = coachRes.data?.result ?? [];
  const refereeQualifications = refereeRes.data?.result ?? [];
  const tournamentsResult = tournRes.data?.result ?? [];

  const tournaments: SelectOption[] = tournamentsResult.map((x) => ({
    key: x.tournId,
    value: x.tournName,
  }));
  const qualifications: SelectOption<string>[] = [
    ...coachQualifications.map((x) => ({ key: `coach_${x.key}`, value: x.value })),
    ...refereeQualifications.map((x) => ({ key: `referee_${x.key}`, value: x.value })),
  ];

  const createNotification = (formData: NotificationCreateFormInput) => {
    const storageKey = getStorageKey({
      pageName: 'notification',
      type: 'create',
    });
    setSessionStorage(storageKey, formData);
    router.push(`/notification?mode=confirm&type=create&storageKey=${storageKey}`);
  };

  const updateNotification = (formData: NotificationUpdateFormInput, notificationId: number) => {
    const storageKey = getStorageKey({
      pageName: 'notification',
      type: 'update',
      id: notificationId,
    });
    setSessionStorage(storageKey, formData);
    router.push(
      `/notification?mode=confirm&type=update&storageKey=${storageKey}&notificationId=${notificationId}`,
    );
  };

  if (mode === 'confirm') {
    return (
      <Confirm
        tournaments={tournaments}
        coachQualifications={coachQualifications}
        refereeQualifications={refereeQualifications}
      />
    );
  }
  if (mode === 'create') {
    return (
      <Create
        tournaments={tournaments}
        qualifications={qualifications}
        onSubmit={createNotification}
      />
    );
  }
  if (mode === 'update') {
    return (
      <Update
        tournaments={tournaments}
        qualifications={qualifications}
        onSubmit={updateNotification}
      />
    );
  }
}
