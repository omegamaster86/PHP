// 機能名: パスワード再発行
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
import Validator from '@/app/utils/validator';
import axios from '@/app/lib/axios';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

export default function ForgotPassword() {
  const [errorText, setErrorText] = useState([] as string[]);
  const [messageText, setMessageText] = useState([] as string[]);
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [emailErrorMessages, setEmailErrorMessages] = useState([] as string[]);
  const [emailConfirmErrorMessages, setEmailConfirmErrorMessages] = useState([] as string[]);

  const router = useRouter();

  return (
    <div>
      <main className='flex flex-col items-center justify-between gap-[40px] my-[100px] m-auto'>
        {/* 画面名 */}
        <CustomTitle isCenter={true}>パスワード再発行</CustomTitle>
        <div className='flex flex-col gap-[20px] justify-center rounded md:w-[900px]'>
          {/* メッセージ表示エリア */}
          <ErrorBox errorText={errorText} />
          <div>
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
          </div>
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
          {/* 送信 */}
          <CustomButton
            buttonType='primary'
            className='self-center'
            onClick={() => {
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
                // TODO: バリデーションエラー時の処理を実装
              } else {

                const forgotPassword = async () => {
                  const csrf = () => axios.get('/sanctum/csrf-cookie');
                  await csrf();
                  axios
                    .get('/api/forgotpassword', {
                      params: {
                        email: email,
                      },
                    })
                    .then((res) => {
                      // TODO: ユーザーテーブルに存在するかを検索し、結果によりメッセージを出し分ける
                      setMessageText([
                        '仮パスワードを記載したメールアドレスを送信しました。送信されたメールに記載されたパスワードを使用して、パスワードの再設定を行ってください。',
                      ]);
                      setErrorText([
                        '登録されていないメールアドレスです。メールアドレスを確認してください',
                      ]);
                      // TODO: ユーザーテーブルの更新
                    })
                    .catch((err) => {
                      // TODO: エラー処理
                      setErrorText([err.message]);
                    });
                }
                forgotPassword()
              }
            }}
          >
            送信
          </CustomButton>
          {/* 説明文 */}
          <div className='flex flex-col gap-[8px] bg-systemWarningBg border-systemWarningText border-solid border-[1px] p-2 justify-center break-words bg-opacity-40'>
            <WarningAmberOutlinedIcon className='text-systemWarningText text-h3' />
            <div className='flex flex-col gap-[8px] text-primaryText text-caption2 text-left'>
              登録済みメールアドレスに仮パスワードを記載したメールが送付されます。
              <br />
              @xxxxからのメールが受信できるように受信設定をしてください。
            </div>
          </div>
        </div>
      </main>
      <div className='bg-disableBg flex justify-center flex-col items-center text-secondaryText gap-[20px] py-[87px] '>
        <div className='text-h3 text-black font-bold'>日本ローイング協会 サポートデスク</div>
        <CustomButton
          onClick={() => {
            router.push('/contact');
          }}
          buttonType='primary-outlined'
        >
          <p>お問い合わせはこちらへ</p>
        </CustomButton>
        <p className='text-black text-small p-4'>
          営業時間：土・日・祝日　休業日を除く月曜〜金曜　9:00〜12:00 13:00〜17:00
        </p>
      </div>
    </div>
  );
}
