'use client';

import { Confirm } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/Confirm';
import {
  Create,
  CreateFormInput,
} from '@/app/(Pages)/(App)/(Notification)/notifications/_components/Create';
import {
  Update,
  UpdateFormInput,
} from '@/app/(Pages)/(App)/(Notification)/notifications/_components/Update';
import { fetcher } from '@/app/lib/swr';
import { Qualification, SelectOption, TeamResponse, Tournament } from '@/app/types';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';

type NotificationMode = 'view' | 'create' | 'update' | 'delete' | 'confirm';

export default function Notifications() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') || 'create') as NotificationMode;

  const teamOrgRes = useSWR({ url: '/getOrganizationForOrgManagement' }, fetcher<TeamResponse[]>);
  const orgId = teamOrgRes.data ? teamOrgRes.data.result[0].org_id : null;
  const qualRes = useSWR({ url: '/getQualifications' }, fetcher<Qualification[]>);
  const tournRes = useSWR(
    orgId
      ? {
          url: '/getTournamentInfoData_org',
          method: 'POST',
          params: {
            org_id: orgId,
          },
        }
      : null,
    fetcher<Tournament[]>,
  );

  const tournamentsResult = tournRes.data?.result ?? [];
  // FIXME: fetcherでresultじゃない場合の考慮が必要
  const qualificationsResult = (qualRes.data as unknown as Qualification[]) ?? [];

  const tournaments: SelectOption[] =
    tournamentsResult.map((x) => ({
      key: Number(x.tourn_id),
      value: x.tourn_name,
    })) ?? [];
  const qualifications: SelectOption[] =
    qualificationsResult.map((x) => ({
      key: Number(x.qual_id),
      value: x.qual_name,
    })) ?? [];

  const createNotificationSettings = (formData: CreateFormInput) => {
    router.push(`/notifications?mode=confirm&formData=${JSON.stringify(formData)}`);
  };

  const updateNotificationSettings = (formData: UpdateFormInput) => {
    console.log({
      formData,
    });
  };

  if (mode === 'confirm') {
    return <Confirm qualifications={qualifications} tournaments={tournaments} />;
  }
  if (mode === 'create') {
    return (
      <Create
        tournaments={tournaments}
        qualifications={qualifications}
        onSubmit={createNotificationSettings}
      />
    );
  }
  if (mode === 'update') {
    return (
      <Update
        tournaments={tournaments}
        qualifications={qualifications}
        onSubmit={updateNotificationSettings}
      />
    );
  }
}
