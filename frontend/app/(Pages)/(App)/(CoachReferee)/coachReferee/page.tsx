'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CustomButton, ErrorBox, CustomTitle } from '@/app/components';
import { Divider } from '@mui/material';
import UpdateView from './_components/UpdateView';
import ConfirmView from './_components/ConfirmView';

type Mode = 'update' | 'confirm';

const CoachReferee = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as Mode;

  if (!['update', 'confirm'].includes(mode || '')) {
    console.error('Invalid mode:', mode);
  }

  const modeCustomButtons = {
    update: (
      <CustomButton
        buttonType='primary'
        onClick={() => {
          router.push('/coachReferee?mode=confirm');
        }}
      >
        確認
      </CustomButton>
    ),
    confirm: (
      <CustomButton
        buttonType='primary'
        onClick={() => {
          // 更新系の処理を記載する
          router.push('/coachRefereeRef?mode=update');
        }}
      >
        更新
      </CustomButton>
    ),
  };

  return (
    <>
      <ErrorBox errorText={errorMessage} />

      <CustomTitle displayBack>
        {mode === 'update' && '指導者・審判情報更新'}
        {mode === 'confirm' && '指導者・審判情報確認'}
      </CustomTitle>
      {mode === 'update' && <UpdateView />}
      {mode === 'confirm' && <ConfirmView />}
      <Divider className='h-[1px] bg-border ' />
      <div className='flex flex-col gap-4 items-center justify-center md:flex-row'>
        <CustomButton buttonType='white-outlined' onClick={() => router.back()}>
          戻る
        </CustomButton>
        {modeCustomButtons[mode as keyof typeof modeCustomButtons]}
      </div>
    </>
  );
};

export default CoachReferee;
