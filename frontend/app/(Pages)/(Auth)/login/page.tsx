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
  Loading,
} from '@/app/components';
import { useAuth } from '@/app/hooks/auth';
import Validator from '@/app/utils/validator';

import axios, { type AxiosError } from 'axios';
import Link from 'next/link';

interface Values {
  email: string;
  password: string;
}

export default function Login() {
  const [errorText, setErrorText] = useState([] as string[]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErrorMessages, setEmailErrorMessages] = useState([] as string[]);
  const [passwordErrorMessages, setPasswordErrorMessages] = useState([] as string[]);

  const router = useRouter();

  const { login, isLoading } = useAuth({
    middleware: 'guest',
    redirectIfAuthenticated: '/tournamentSearch',
  });

  if (isLoading) {
    <Loading />;
  }

  const submitForm = async (values: Values): Promise<any> => {
    try {
      await login(values);
    } catch (error: Error | AxiosError | any) {
      if (!error?.response) {
        setErrorText(['サーバーへの接続に失敗しました。', 'ネットワークを確認してください。']);
        console.log(Error);
      }
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        setErrorText(error.response?.data?.errors?.system_error);
      }
    } finally {
      // setSubmitting(false)
      // setStatus('')
    }
  };

  return (
    <>
      <div>
        <main className='flex flex-col items-center justify-between gap-[40px] my-[100px] m-auto'>
          <CustomTitle isCenter={true}>ログイン</CustomTitle>
          <div className='flex flex-col gap-[20px] justify-center rounded min-w-[90%] lg:min-w-[900px]'>
            <ErrorBox errorText={errorText} />
              <div className='flex flex-col gap-[8px]'>
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
              </div>
            <div className='flex flex-col gap-[8px] '>
              <CustomPasswordField
                label='パスワード'
                isError={passwordErrorMessages.length > 0}
                errorMessages={passwordErrorMessages}
                required
                placeholder='パスワードを入力してください。'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
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
                  // TODO: バリデーションエラー時の処理を実装
                } else {
                  // TODO: ログイン処理
                  // let isPasswordTemporary = true;
                  // if (isPasswordTemporary) {
                  //   // TODO: ログイン処理を実装
                  //   const requestBody = {};
                  //   axios
                  //     .post('http://localhost:8000/', requestBody)
                  //     .then((response) => {
                  //       // TODO: 成功時の処理を実装
                  //       //console.log(response);
                  //       router.push('/passwordchange');
                  //     })
                  //     .catch((error) => {
                  //       // TODO: エラー処理を実装
                  //       //console.log(error);
                  //     });
                  // } else {
                  //   // TODO: ログイン処理を実装
                  //   const requestBody = {};
                  //   axios
                  //     .post('http://localhost:8000/', requestBody)
                  //     .then((response) => {
                  //       // TODO: 成功時の処理を実装
                  //       //console.log(response);
                  //       router.push('/mypage');
                  //     })
                  //     .catch((error) => {
                  //       // TODO: エラー処理を実装
                  //       //console.log(error);
                  //     });
                  // }

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
        <div className='bg-disableBg flex justify-center flex-col items-center text-secondaryText gap-[20px] py-[87px] '>
          <div className='text-h3 text-black font-bold'>日本ローイング協会 サポートデスク</div>
          <CustomButton
            onClick={() => {
              router.push('/inquiry');
            }}
            buttonType='primary-outlined'
          >
            <p>お問い合わせはこちらへ</p>
          </CustomButton>
          <p className='text-black text-small text-center font-light [&_span]:inline-block'>
            <span>営業時間：土・日・祝日&nbsp;&nbsp;</span>
            <span>休業日を除く月曜〜金曜&nbsp;&nbsp;9:00〜12:00&nbsp;&nbsp;13:00〜17:00</span>
          </p>
        </div>
      </div>
    </>
  );
}
