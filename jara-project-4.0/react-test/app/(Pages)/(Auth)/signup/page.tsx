'use client';

import React from 'react';
import { useState } from 'react';
import Header from '../../../components/Header';
import ArrowRightOutlinedIcon from '@mui/icons-material/ArrowRightOutlined';
import { useRouter } from 'next/navigation';
import CustomButton from '../../../components/CustomButton';
import CustomTextField from '../../../components/CustomTextField';

import V from '@/app/utils/validator';

export default function Signup() {
  const [errorText, setErrorText] = useState([] as string[]);
  const [userNameErrorMessages, setUserNameErrorMessages] = useState([] as string[]);
  const [emailErrorMessages, setEmailErrorMessages] = useState([] as string[]);
  const [emailConfirmErrorMessages, setEmailConfirmErrorMessages] = useState([] as string[]);

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [checked, setChecked] = useState(false);

  const router = useRouter();

  return (
    <div>
      <Header />
      <main className='flex flex-col items-center justify-start gap-[80px] my-[100px] m-auto p-4 max-w-[900px]'>
        <h1 className='text-h1 font-bold'>仮登録</h1>
        <div className='flex flex-col gap-[20px] rounded'>
          {errorText.length > 0 && (
            <div
              className='flex flex-col
                bg-systemErrorBg border-systemErrorText border-solid border-[1px] p-2 px-4 justify-center break-words'
            >
              {errorText.map((message) => {
                return (
                  <p key={message} className='text-systemErrorText text-[14px]'>
                    {message}
                  </p>
                );
              })}
            </div>
          )}
          <div className='flex flex-col gap-[8px]'>
            <div className='flex flex-col gap-[8px]'>
              <CustomTextField
                label='ユーザー名'
                isError={userNameErrorMessages.length > 0}
                errorMessages={userNameErrorMessages}
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
          </div>
          <div className='flex flex-col gap-[10px] '>
            <CustomTextField
              label='メールアドレス'
              isError={emailErrorMessages.length > 0}
              errorMessages={emailErrorMessages}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className='flex flex-col gap-[10px] '>
            <CustomTextField
              label='メールアドレスの入力確認'
              isError={emailConfirmErrorMessages.length > 0}
              errorMessages={emailConfirmErrorMessages}
              required
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
          </div>
          <div className='bg-thinContainerBg border-[1px] border-solid border-[#E0E0E0] rounded-md p-4'>
            <h2 className='text-[24px] font-bold pb-2'>利用規約</h2>
            <p className='text-[14px]'>
              (sample)この利用規約（以下，「本規約」といいます。XX
              ）は，〇〇（以下，「当社」といいます。）がこのウェブサイト上で提供するサービス（以下，「本サービス」といいます。）の利用条件を定めるものです。
              登録ユーザーの皆さま（以下，「ユーザー」といいます。）には，本規約に従って，本サービスをご利用いただきます。
              <br />
              XXXXX
              <br />
              XXXXX
            </p>
          </div>
          <div className='flex justify-center items-center gap-[10px]'>
            <input
              type='checkbox'
              name='terms'
              id='terms'
              onChange={() => {
                setChecked(!checked);
              }}
              className='border-[1px] border-solid border-[#E0E0E0] rounded-md h-[20px] w-[20px]'
            />
            <label htmlFor='terms'>利用規約に同意する</label>
          </div>
          <div className='flex justify-center flex-row items-center gap-[16px]'>
            <CustomButton
              onClick={() => {
                router.push('/login');
              }}
              className='secondary w-[120px]'
            >
              キャンセル
            </CustomButton>
            <CustomButton
              className='primary w-[120px]'
              onClick={() => {
                // エラーがあればエラーメッセージを表示
                const userNameError = V.getErrorMessages([
                  V.validateRequired(userName, 'ユーザー名'),
                  V.validateUserNameFormat(userName),
                  V.validateLength(userName, 'ユーザー名', 32),
                ]);

                const emailError = V.getErrorMessages([
                  V.validateRequired(email, 'メールアドレス'),
                  V.validateEmailFormat(email),
                ]);

                const emailConfirmError = V.getErrorMessages([
                  V.validateRequired(confirmEmail, '確認用のメールアドレス'),
                  V.validateEqual(email, confirmEmail, 'メールアドレス'),
                ]);

                let systemError = [] as string[];
                if (!checked) {
                  systemError.push('ユーザーの仮登録には利用契約への同意が必要です。');
                }

                setUserNameErrorMessages(userNameError as string[]);
                setEmailErrorMessages(emailError as string[]);
                setEmailConfirmErrorMessages(emailConfirmError as string[]);
                setErrorText(systemError);

                // エラーがある場合、後続の処理を中止
                if (systemError.length > 0 || userNameError.length > 0 || emailError.length > 0) {
                  return;
                }
                // 仮登録処理
                alert('仮登録が完了しました。');
                // 本登録画面に遷移
                router.push('/signup/complete');
              }}
            >
              仮登録
            </CustomButton>
          </div>
        </div>
        <div className='flex flex-col gap-[10px] rounded py-[40px] border-border border-solid border-[1px] p-4'>
          <h2 className='text-[20px] font-bold pb-2 mx-auto'>本登録までの流れ</h2>
          <div className='flex justify-center flex-row items-center gap-[10px]'>
            <p className='text-[12px]'>メール送信</p>
            <ArrowRightOutlinedIcon className='text-[14px] text-secondaryText' />
            <p className='text-[12px]'>
              メール本文に記載されているパスワードで
              <br />
              本システムにログイン
            </p>
            <ArrowRightOutlinedIcon className='text-[14px] text-secondaryText' />
            <p className='text-[12px]'>
              パスワード変更と
              <br />
              ユーザ情報の入力
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
