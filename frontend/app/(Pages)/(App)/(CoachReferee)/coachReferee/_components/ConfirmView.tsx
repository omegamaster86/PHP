import React from 'react';
import ConfirmCoachingHistory from './ConfirmCoachingHistory';
import ConfirmCoachQualification from './ConfirmCoachQualification';
import ConfirmRefereeQualification from './ConfirmRefereeQualification';
import { CustomButton } from '@/app/components';
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
  if (!parsedData) {
    return null;
  }

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

  const resisterMutation = useSWRMutation('/updateCoachRefereeInfo', sendResisterRequest);
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
    console.log('データが送信されます', reqData);

    await resisterMutation.trigger({ reqFormData: reqData });
    alert('データが送信されました');
  };

  return (
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
        <CustomButton
          buttonType='white-outlined'
          onClick={() => router.push('/coachReferee?mode=update')}
        >
          戻る
        </CustomButton>
        <CustomButton
          type='submit'
          buttonType='primary'
          onClick={() => {
            router.push('/coachRefereeRef?mode=update');
          }}
        >
          更新
        </CustomButton>
      </div>
    </form>
  );
};

export default ConfirmView;
