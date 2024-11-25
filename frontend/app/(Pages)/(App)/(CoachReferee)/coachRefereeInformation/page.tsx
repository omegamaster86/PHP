'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CustomButton, ErrorBox, CustomTitle } from '@/app/components';
import { Divider } from '@mui/material';
import UpdateFirstDisplay from './_components/updateFirstDisplay';

type Mode = 'update' | 'confirm';

const CoachRefereeInformation = () => {
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
          router.push('/coachRefereeInformation?mode=confirm');
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
          router.push('/coachRefereeRef');
        }}
      >
        更新
      </CustomButton>
    ),
  };

  return (
    <>
      <ErrorBox errorText={errorMessage} />
      <div className='flex flex-row mb-5'>
        <CustomTitle displayBack>
          {mode === 'update' && '指導者・審判情報更新'}
          {mode === 'confirm' && '指導者・審判情報確認'}
        </CustomTitle>
      </div>
      {mode === 'update' && (
        <div className='flex flex-col gap-10'>
          <UpdateFirstDisplay />
        </div>
      )}
      {mode === 'confirm' && (
        <>
          <h2>指導履歴</h2>
          <h2>指導者資格</h2>
          <h2>審判資格</h2>
        </>
      )}

      <Divider className='h-[1px] bg-border ' />
      <div className='flex gap-4 justify-center'>
        <CustomButton buttonType='white-outlined' onClick={() => router.back()}>
          戻る
        </CustomButton>
        {modeCustomButtons[mode as keyof typeof modeCustomButtons]}
      </div>
    </>
  );
};

export default CoachRefereeInformation;
