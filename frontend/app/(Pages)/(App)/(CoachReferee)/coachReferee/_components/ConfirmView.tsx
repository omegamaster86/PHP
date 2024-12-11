import React from 'react';
import ConfirmCoachingHistory from './ConfirmCoachingHistory';
import ConfirmCoachQualification from './ConfirmCoachQualification';
import ConfirmRefereeQualification from './ConfirmRefereeQualification';
import { CustomButton } from '@/app/components';
import { useRouter } from 'next/navigation';
import { Divider } from '@mui/material';

const ConfirmView = () => {
  const router = useRouter();

  return (
    <form className='flex flex-col gap-5' onSubmit={() => {}}>
      <ConfirmCoachingHistory />
      <ConfirmCoachQualification />
      <ConfirmRefereeQualification />
      <Divider className='h-[1px] bg-border ' />
      <div className='flex flex-col gap-4 items-center justify-center md:flex-row'>
        <CustomButton buttonType='white-outlined' onClick={() => router.push('/coachReferee?mode=update')}>
          戻る
        </CustomButton>
        <CustomButton
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
