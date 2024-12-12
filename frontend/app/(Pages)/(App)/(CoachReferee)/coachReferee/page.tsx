'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ErrorBox, CustomTitle } from '@/app/components';
import UpdateView from './_components/UpdateView';
import ConfirmView from './_components/ConfirmView';
import { CoachRefereeResponse, SelectOption, OrganizationListData } from '@/app/types';
import useSWR from 'swr';
import { fetcher } from '@/app/lib/swr';
import { getStorageKey } from '@/app/utils/sessionStorage';

type Mode = 'update' | 'confirm';

const CoachReferee = () => {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || ('update' as Mode);
  const [errorMessage, setErrorMessage] = useState([] as string[]);

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
  const rawData = sessionStorage.getItem(storageKey);
  const parsedData: CoachRefereeResponse | null = rawData ? JSON.parse(rawData) : null;

  return (
    <>
      <ErrorBox errorText={errorMessage} />

      <CustomTitle displayBack>
        {mode === 'update' && '指導者・審判情報更新'}
        {mode === 'confirm' && '指導者・審判情報確認'}
      </CustomTitle>
      {mode === 'update' && (
        <UpdateView
          coachQualifications={coachQualifications}
          refereeQualifications={refereeQualifications}
          organizations={organizations}
          staffs={staffs}
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
