import React from 'react';
import ConfirmCoachingHistory from './ConfirmCoachingHistory';
import ConfirmCoachQualification from './ConfirmCoachQualification';
import ConfirmRefereeQualification from './ConfirmRefereeQualification';
import { CustomButton, CustomTitle } from '@/app/components';
import { useRouter } from 'next/navigation';
import { Divider } from '@mui/material';
import { CoachRefereeResponse, SelectOption, OrganizationListData } from '@/app/types';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '@/app/lib/swr';

interface Props {
  coachQualifications: SelectOption<number>[];
  refereeQualifications: SelectOption<number>[];
  organizations: OrganizationListData[];
  staffs: SelectOption<number>[];
  parsedData: CoachRefereeResponse | null;
}

const ConfirmView: React.FC<Props> = ({
  coachQualifications,
  refereeQualifications,
  organizations,
  staffs,
  parsedData,
}) => {
  const router = useRouter();
  const sendResisterRequest = async (
    url: string,
    trigger: { arg: { reqFormData: CoachRefereeResponse } },
  ) => {
    return fetcher({
      url,
      method: 'patch',
      data: trigger.arg.reqFormData,
    });
  };

  const resisterMutation = useSWRMutation('api/updateCoachRefereeInfo', sendResisterRequest);
  if (!parsedData) {
    return null;
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const reqData: CoachRefereeResponse = {
      ...parsedData,
      jspoId: parsedData.jspoId,
      coachingHistories: parsedData.coachingHistories?.map((history: any) => ({
        ...history,
      })),
      coachQualifications: parsedData.coachQualifications?.map((coachQualification: any) => ({
        ...coachQualification,
      })),
      refereeQualifications: parsedData.refereeQualifications?.map((refereeQualification: any) => ({
        ...refereeQualification,
      })),
    };

    await resisterMutation.trigger({ reqFormData: reqData });
    alert('指導者・審判情報を更新しました。');
    router.push('/mypage/coachRefereeProfile');
  };

  const handleGoBack = () => {
    router.push('/coachReferee?mode=update&source=confirm');
  };

  return (
    <>
      <CustomTitle customBack={handleGoBack}>指導者・審判情報確認</CustomTitle>
      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <ConfirmCoachingHistory
          parsedData={parsedData}
          organizationOptions={organizations}
          staffOptions={staffs}
        />
        <ConfirmCoachQualification
          parsedData={parsedData}
          coachQualificationOptions={coachQualifications}
        />
        <ConfirmRefereeQualification
          parsedData={parsedData}
          refereeQualificationOptions={refereeQualifications}
        />
        <Divider className='h-[1px] bg-border ' />
        <div className='flex flex-col gap-4 items-center justify-center md:flex-row'>
          <CustomButton buttonType='white-outlined' onClick={handleGoBack}>
            戻る
          </CustomButton>
          <CustomButton type='submit' buttonType='primary'>
            更新
          </CustomButton>
        </div>
      </form>
    </>
  );
};

export default ConfirmView;
