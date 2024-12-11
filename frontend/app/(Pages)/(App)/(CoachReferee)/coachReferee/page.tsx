'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ErrorBox, CustomTitle } from '@/app/components';
import UpdateView from './_components/UpdateView';
import ConfirmView from './_components/ConfirmView';
import { CoachRefereeResponse, SelectOption, OrganizationListData } from '@/app/types';
import useSWR from 'swr';
import { fetcher } from '@/app/lib/swr';

type Mode = 'update' | 'confirm';

const CoachReferee = () => {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || ('update' as Mode);
  const [errorMessage, setErrorMessage] = useState([] as string[]);

  const { data: coachRefereeInfoListRes } = useSWR(
    {
      url: `getUpdateCoachRefereeInfoList`,
    },
    fetcher<CoachRefereeResponse>,
  );
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
  const coachRefereeInfoList = coachRefereeInfoListRes?.result ?? [];
  const coachQualifications = coachQualificationsRes?.result ?? [];
  const refereeQualifications = refereeQualificationsRes?.result ?? [];
  const organizations = organizationsRes?.result ?? [];
  const staffs = staffsRes?.result ?? [];
console.log(coachRefereeInfoList);
  return (
    <>
      <ErrorBox errorText={errorMessage} />

      <CustomTitle displayBack>
        {mode === 'update' && '指導者・審判情報更新'}
        {mode === 'confirm' && '指導者・審判情報確認'}
      </CustomTitle>
      {mode === 'update' && (
        <UpdateView
          coachRefereeInfoList={coachRefereeInfoList}
          coachQualifications={coachQualifications}
          refereeQualifications={refereeQualifications}
          organizations={organizations}
          staffs={staffs}
        />
      )}
      {mode === 'confirm' && (
        <ConfirmView
        // data={data.result}
        // coachQualificationData={coachQualificationData.result}
        // refereeQualificationData={refereeQualificationData.result}
        // organizationData={organizationData.result}
        // staffData={staffData.result}
        />
      )}
    </>
  );
};

export default CoachReferee;
