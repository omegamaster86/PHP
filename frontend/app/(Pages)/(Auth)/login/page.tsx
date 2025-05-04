// 機能名: ログイン画面
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CustomButton,
  CustomTextField,
  CustomPasswordField,
  ErrorBox,
  CustomTitle,
} from '@/app/components';
import { useAuth } from '@/app/hooks/auth';
import Validator from '@/app/utils/validator';

import axios, { type AxiosError } from 'axios';
import Link from 'next/link';
import { BeforeLoginFooter } from '@/app/(Pages)/(Auth)/_components/BeforeLoginFooter';
import { useSWRConfig } from 'swr';

interface Values {
  email: string;
  password: string;
}

// unreadCountのSWRキャッシュを更新するためのキー
const unreadCountKey = { url: '/api/unreadCount' };

export default function Login() {
  const [errorText, setErrorText] = useState([] as string[]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErrorMessages, setEmailErrorMessages] = useState([] as string[]);
  const [passwordErrorMessages, setPasswordErrorMessages] = useState([] as string[]);

  const router = useRouter();
  const swrConfig = useSWRConfig();

  const { login } = useAuth({
    middleware: 'guest',
    redirectIfAuthenticated: '/mypage/top',
  });

  const submitForm = async (values: Values): Promise<any> => {
    try {
      await login(values);
      await swrConfig.mutate(unreadCountKey);
    } catch (error: Error | AxiosError | any) {
      if (!error?.response) {
        setErrorText(['サーバーへの接続に失敗しました。', 'ネットワークを確認してください。']);
      }
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        setErrorText(error.response?.data?.errors?.system_error);
      }
    }
  };

  return (
    <div className='flex h-screen flex-col justify-between'>
      <main className='flex flex-col items-center justify-between gap-[40px] my-[100px] m-auto max-w-md px-2'>
        <CustomTitle>ログイン</CustomTitle>
        <div className='flex flex-col gap-[20px] justify-center rounded w-full'>
          <ErrorBox errorText={errorText} />
          <CustomTextField
            label='メールアドレス'
            isError={emailErrorMessages.length > 0}
            errorMessages={emailErrorMessages}
            required
            value={email}
            placeHolder='メールアドレスを入力してください。'
            displayHelp={false}
            onChange={(e) => setEmail(e.target.value)}
          />
          <CustomPasswordField
            label='パスワード'
            isError={passwordErrorMessages.length > 0}
            errorMessages={passwordErrorMessages}
            required
            placeholder='パスワードを入力してください。'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className='flex justify-center text-small font-bold pt-[32px]'>
            <Link className='text-primary-500' href='/forgotpassword'>
              パスワードを忘れましたか？
            </Link>
          </p>
          <CustomButton
            buttonType='primary'
            className='self-center'
            onClick={() => {
              const emailErrorMessages = Validator.getErrorMessages([
                Validator.validateRequired(email, 'メールアドレス'),
                Validator.validateEmailFormat(email),
                Validator.validateEmailFormat2(email),
              ]);
              const passwordErrorMessages = Validator.getErrorMessages([
                Validator.validateRequired(password, 'パスワード'),
                // Validator.validatePasswordFormat(password),
              ]);
              setEmailErrorMessages(emailErrorMessages);
              setPasswordErrorMessages(passwordErrorMessages);
              if (emailErrorMessages.length > 0 || passwordErrorMessages.length > 0) {
              } else {
                submitForm({
                  email,
                  password,
                });
              }
            }}
          >
            ログイン
          </CustomButton>
          <p className='text-center text-small pt-[20px]'>初めてご利用の方</p>
          <CustomButton
            className='self-center'
            onClick={() => {
              router.push('/signup');
            }}
            buttonType='white-outlined'
          >
            新規登録
          </CustomButton>
        </div>
      </main>
      <BeforeLoginFooter />
    </div>
  );
}
