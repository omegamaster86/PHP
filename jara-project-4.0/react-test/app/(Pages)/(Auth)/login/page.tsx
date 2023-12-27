'use client';

import Header from '../../../components/Header';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomButton from '../../../components/CustomButton';
import CustomTextField from '@/app/components/CustomTextField';
import CustomPasswordField from '@/app/components/CustomPasswordField';
import Validator from '@/app/utils/validator';

export default function Login() {
  const [errorText, setErrorText] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErrorMessages, setEmailErrorMessages] = useState([] as string[]);
  const [passwordErrorMessages, setPasswordErrorMessages] = useState([] as string[]);

  const router = useRouter();

  return (
    <div>
      <Header />
      <main className='flex flex-col items-center justify-start gap-[80px] my-[100px] m-auto p-4'>
        <h1 className='text-h1 font-bold'>ログイン</h1>
        <div className='flex flex-col gap-[20px] rounded'>
          {errorText && (
            <div
              className='flex flex-col gap-[20px]
              bg-systemErrorBg border-systemErrorText border-solid border-[1px] p-2 px-4 justify-center  break-words'
            >
              <p className='text-systemErrorText text-[14px] font-bold text-center'>{errorText}</p>
            </div>
          )}
          <div className='flex flex-col gap-[8px]'>
            <div className='flex flex-col gap-[8px]'>
              <CustomTextField
                label='メールアドレス'
                isError={emailErrorMessages.length > 0}
                errorMessages={emailErrorMessages}
                required
                value={email}
                placeHolder='メールアドレスを入力してください。'
                hideDisplayHelp={true}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
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
          <p className=' flex justify-center text-[14px] font-bold pt-[32px]'>
            <a
              className='text-primary-500 '
              href='#'
              onClick={() => {
                router.push('/passwordreset');
              }}
            >
              パスワードを忘れましたか？
            </a>
          </p>
          <CustomButton
            className='primary'
            onClick={() => {
              const emailErrorMessages = Validator.getErrorMessages([
                Validator.validateRequired(email, 'メールアドレス'),
                Validator.validateEmailFormat(email),
              ]);
              const passwordErrorMessages = Validator.getErrorMessages([
                Validator.validateRequired(password, 'パスワード'),
              ]);

              // 仮の処理 バリデーション
              setEmailErrorMessages(emailErrorMessages);
              setPasswordErrorMessages(passwordErrorMessages);
              console.log(emailErrorMessages);

              if (emailErrorMessages.length > 0 || passwordErrorMessages.length > 0) {
                return;
              } else {
                // 仮の処理 仮パスワードかどうかで分岐
                let isPasswordTemporary = true;
                if (isPasswordTemporary) {
                  router.push('/passwordchange');
                } else {
                  router.push('/mypage');
                }
              }
              return;
            }}
          >
            ログイン
          </CustomButton>
          <p className='text-center text-[14px] pt-[20px]'>初めてご利用の方</p>
          <CustomButton
            onClick={() => {
              router.push('/signup');
            }}
            className='secondary'
          >
            新規登録
          </CustomButton>
        </div>
      </main>
      <div className='bg-disableBg flex justify-center flex-col items-center text-secondaryText gap-[20px] py-[87px] '>
        <div className='text-[20px] text-black font-bold'>日本ローイング協会 サポートデスク</div>
        <CustomButton
          onClick={() => {
            router.push('/contact');
          }}
          className='border-solid border-[1px] border-primary-500 text-primary-500'
        >
          <p>お問い合わせはこちらへ</p>
        </CustomButton>
        <p className='text-black text-[14px] p-4'>
          営業時間：土・日・祝日　休業日を除く月曜〜金曜　9:00〜12:00 13:00〜17:00
        </p>
      </div>
    </div>
  );
}
