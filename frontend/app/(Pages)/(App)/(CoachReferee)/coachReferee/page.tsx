'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import UpdateView from './_components/UpdateView';
import ConfirmView from './_components/ConfirmView';
import { CoachRefereeResponse, SelectOption, OrganizationListData } from '@/app/types';
import useSWR from 'swr';
import { fetcher } from '@/app/lib/swr';
import { getSessionStorage, getStorageKey } from '@/app/utils/sessionStorage';

type Mode = 'update' | 'confirm';

const CoachReferee = () => {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || ('update' as Mode);

  const { data: coachQualificationsRes } = useSWR(
    {
      url: `getCoachQualifications`,
    },
    fetcher<SelectOption[]>,
  );
  const { data: refereeQualificationsRes } = useSWR(
    {
      url: `getRefereeQualifications`,
    },
    fetcher<SelectOption[]>,
  );

  const { data: organizationsRes } = useSWR(
    {
      url: `getOrganizationListData`,
    },
    fetcher<OrganizationListData[]>,
  );

  const { data: staffsRes } = useSWR(
    {
      url: `getStaffTypes`,
    },
    fetcher<SelectOption[]>,
  );
  const coachQualifications = coachQualificationsRes?.result ?? [];
  const refereeQualifications = refereeQualificationsRes?.result ?? [];
  const organizations = organizationsRes?.result ?? [];
  const staffs = staffsRes?.result ?? [];
  const storageKey = getStorageKey({
    pageName: 'coachReferee',
    type: 'create',
  });
  const parsedData = getSessionStorage<CoachRefereeResponse>(storageKey);

  return (
    <>
      {mode === 'update' && (
        <UpdateView
          coachQualifications={coachQualifications}
          refereeQualifications={refereeQualifications}
          organizations={organizations}
          staffs={staffs}
          parsedData={parsedData}
          storageKey={storageKey}
        />
      )}
      {mode === 'confirm' && (
        <ConfirmView
          coachQualifications={coachQualifications}
          refereeQualifications={refereeQualifications}
          organizations={organizations}
          staffs={staffs}
          parsedData={parsedData}
        />
      )}
    </>
  );
};

export default CoachReferee;
