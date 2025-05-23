// 機能名: 退会画面
'use client';

import axios from '@/app/lib/axios';
import { Divider } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CustomButton, CustomTitle, ErrorBox } from '@/app/components';
import { useAuth } from '@/app/hooks/auth';

export default function Withdrawal() {
  const router = useRouter();
  const { logout } = useAuth({ middleware: 'auth' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState([] as string[]);

  return (
    <>
      <ErrorBox errorText={errorMessage} />
      <CustomTitle displayBack>退会</CustomTitle>
      <p className='text-center lg:text-lg'>退会しますか？</p>
      <Divider className='h-[1px] bg-border' />
      <div className='flex flex-col items-center justify-center gap-4 md:flex-row'>
        <CustomButton
          buttonType='white-outlined'
          onClick={() => {
            setErrorMessage([]);
            router.back();
          }}
        >
          キャンセル
        </CustomButton>
        {/* 退会ボタン */}
        <CustomButton
          buttonType='red-outlined'
          onClick={() => {
            if (isSubmitting) {
              return;
            }
            setIsSubmitting(true);

            const isOk = window.confirm(
              '選手情報やボランティア情報が紐づく場合、該当するデータは削除されずに残りますが、退会しますか？',
            );
            if (isOk) {
              const deleteUser = async () => {
                axios
                  .post('api/deleteUserData')
                  .then((res) => {
                    logout();
                  })
                  .catch((error) => {
                    setErrorMessage([error.response.data.message]);
                  });
              };
              deleteUser();
            }

            setIsSubmitting(false);
          }}
        >
          退会
        </CustomButton>
      </div>
    </>
  );
}
