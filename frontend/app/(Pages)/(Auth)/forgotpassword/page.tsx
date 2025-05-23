// 機能名: パスワード再発行
'use client';

import { BeforeLoginFooter } from '@/app/(Pages)/(Auth)/_components/BeforeLoginFooter';
import { CustomButton, CustomTextField, CustomTitle, ErrorBox } from '@/app/components';
import axios from '@/app/lib/axios';
import Validator from '@/app/utils/validator';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ForgotPassword() {
  const [errorText, setErrorText] = useState([] as string[]);
  const [messageText, setMessageText] = useState([] as string[]);
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [emailErrorMessages, setEmailErrorMessages] = useState([] as string[]);
  const [emailConfirmErrorMessages, setEmailConfirmErrorMessages] = useState([] as string[]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  return (
    <>
      <main className='flex flex-col items-center justify-between gap-[40px] my-[100px] m-auto max-w-md px-2'>
        {/* 画面名 */}
        <CustomTitle>パスワード再発行</CustomTitle>
        <div className='flex flex-col gap-5 rounded w-full'>
          {/* メッセージ表示エリア */}
          <ErrorBox errorText={errorText} />
          {messageText.length > 0 && (
            <div className='relative w-full my-3 p-2  border-solid border-[1px] border-secondary-700 flex justify-center items-center'>
              {messageText.map((message) => {
                return (
                  <p key={message} className='text-secondary-700 text-small'>
                    {message}
                  </p>
                );
              })}
            </div>
          )}
          {/* 登録済みメールアドレス */}
          <div className='flex flex-col gap-[8px]'>
            <div className='flex flex-col gap-[8px]'>
              <CustomTextField
                label='登録済みメールアドレス'
                // エラー表示1
                isError={emailErrorMessages.length > 0}
                errorMessages={emailErrorMessages}
                required
                value={email}
                placeHolder='メールアドレスを入力してください。'
                displayHelp={false}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {/* メールアドレス(確認用) */}
          <div className='flex flex-col gap-[8px] '>
            <CustomTextField
              label='メールアドレス(確認用)'
              // エラー表示2
              isError={emailConfirmErrorMessages.length > 0}
              errorMessages={emailConfirmErrorMessages}
              required
              placeHolder='メールアドレスを入力してください。'
              displayHelp={false}
              value={emailConfirm}
              onChange={(e) => setEmailConfirm(e.target.value)}
            />
          </div>
          {/* 説明文 */}
          <div className='flex items-center gap-2 bg-systemWarningBg border-systemWarningText border-solid border-[1px] p-2 justify-center break-words bg-opacity-40'>
            <WarningAmberOutlinedIcon className='text-systemWarningText text-h3' />
            <p className='text-primaryText text-caption2 text-center'>
              登録済みメールアドレスに仮パスワードを記載したメールが送付されます。
              <br />
              {process.env.MAIL_FROM_ADDRESS}
              からのメールが受信できるように受信設定をしてください。
            </p>
          </div>
          <div className='flex flex-col sm:flex-row items-center gap-4'>
            <CustomButton
              className='flex-1'
              onClick={() => {
                router.push('/login');
              }}
            >
              戻る
            </CustomButton>
            {/* 送信 */}
            <CustomButton
              buttonType='primary'
              className='flex-1'
              onClick={async () => {
                if (isSubmitting) {
                  return;
                }
                setIsSubmitting(true);

                const emailErrorMessages = Validator.getErrorMessages([
                  Validator.validateRequired(email, 'メールアドレス'),
                  Validator.validateEmailFormat(email),
                ]);
                const emailConfirmErrorMessages = Validator.getErrorMessages([
                  Validator.validateRequired(emailConfirm, 'メールアドレス'),
                  Validator.validateEqual2(email, emailConfirm),
                ]);
                setEmailErrorMessages(emailErrorMessages);
                setEmailConfirmErrorMessages(emailConfirmErrorMessages);
                if (emailErrorMessages.length > 0 || emailConfirmErrorMessages.length > 0) {
                } else {
                  const forgotPassword = async () => {
                    const csrf = () => axios.get('/sanctum/csrf-cookie');
                    await csrf();
                    await axios
                      .post('api/password-reset', {
                        mailaddress: email,
                      })
                      .then((res) => {
                        setMessageText([
                          '仮パスワードを記載したメールアドレスを送信しました。送信されたメールに記載されたパスワードを使用して、パスワードの再設定を行ってください。',
                        ]);
                      })
                      .catch((err) => {
                        setErrorText([err.response?.data?.message]);
                      });
                  };
                  await forgotPassword();
                }
                setIsSubmitting(false);
              }}
            >
              送信
            </CustomButton>
          </div>
        </div>
      </main>
      <BeforeLoginFooter />
    </>
  );
}
