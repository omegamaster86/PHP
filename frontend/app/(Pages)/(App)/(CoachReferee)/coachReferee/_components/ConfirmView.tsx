import React from 'react';
import ConfirmCoachingHistory from './ConfirmCoachingHistory';
import ConfirmCoachQualification from './ConfirmCoachQualification';
import ConfirmRefereeQualification from './ConfirmRefereeQualification';
import { CustomButton } from '@/app/components';
import { useRouter } from 'next/navigation';
import { Divider } from '@mui/material';
import { CoachRefereeResponse, SelectOption, OrganizationListData } from '@/app/types';
import useSWRMutation from 'swr/mutation';

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

//   const sendResisterRequest = async () => {
//     url: string,
//     trigger: { arg: { reqFormData: UpdateNotificationRequest } },
//   ) => {
//     url,
//     menubar: 'no',
//     data: trigger.arg.reqFormData,
//   });
// };

  // const resisterMutation = useSWRMutation('/updateNotification', sendResisterRequest);
  // async function onSubmit(event: FormEvent<HTMLFormElement>) {
  //   event.preventDefault();
  // }

  return (
    <form onSubmit={() => {}} className='flex flex-col gap-5'>
      <ConfirmCoachingHistory parsedData={parsedData} organizationOptions={organizations} staffOptions={staffs} />
      <ConfirmCoachQualification parsedData={parsedData} coachQualificationOptions={coachQualifications} />
      <ConfirmRefereeQualification parsedData={parsedData} refereeQualificationOptions={refereeQualifications} />
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
