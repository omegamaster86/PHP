// ユーザー登録画面
'use client';

import { useState } from 'react';
import ArrowRightOutlinedIcon from '@mui/icons-material/ArrowRightOutlined';
import { useRouter } from 'next/navigation';
import {
  CustomButton,
  ErrorBox,
  CustomTitle,
  CustomTextField,
  OriginalCheckbox,
  Header,
} from '@/app/components';
import Validator from '@/app/utils/validator';
import axios from '@/app/lib/axios';

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
    <>
      <div>
        <main className='flex flex-col items-center justify-start gap-[40px] my-[100px] m-auto p-4 md:max-w-[900px]'>
          {/* 画面名 */}
          <CustomTitle isCenter={true}>仮登録</CustomTitle>
          <div className='flex flex-col gap-[20px] rounded'>
            {/* エラー表示1 */}
            <ErrorBox errorText={errorText} />
            <div className='flex flex-col gap-[8px]'>
              {/* ユーザー名 */}
              <div className='flex flex-col gap-[8px]'>
                <CustomTextField
                  label='ユーザー名'
                  // エラー表示2
                  isError={userNameErrorMessages.length > 0}
                  errorMessages={userNameErrorMessages}
                  required
                  value={userName}
                  placeHolder='山田 太郎'
                  onChange={(e) => setUserName(e.target.value)}
                  toolTipText='文字制限
                  　最大文字数：32文字（全半角区別なし）
                  　利用可能文字：
                  　　　日本語
                  　　　英大文字：[A-Z]（26 文字）
                  　　　英小文字：[a-z]（26 文字）
                  　　　数字：[0-9]（10 文字）
                  　　　記号：-,_' //はてなボタン用
                />
              </div>
            </div>
            {/* メールアドレス */}
            <div className='flex flex-col gap-[10px] '>
              <CustomTextField
                label='メールアドレス'
                // エラー表示3
                isError={emailErrorMessages.length > 0}
                errorMessages={emailErrorMessages}
                required
                placeHolder='メールアドレスを入力してください。'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                toolTipText='入力したメールアドレスは、ログインの時に使用します。'
              />
            </div>
            {/* メールアドレス確認 */}
            <div className='flex flex-col gap-[10px] '>
              <CustomTextField
                label='メールアドレスの入力確認'
                // エラー表示4
                isError={emailConfirmErrorMessages.length > 0}
                errorMessages={emailConfirmErrorMessages}
                required
                displayHelp={false}
                placeHolder='確認のためにもう一度メールアドレスを入力してください。'
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
              />
            </div>
            <div className='bg-thinContainerBg border-[1px] border-solid border-[#E0E0E0] rounded-md p-4'>
              {/* 利用規約 */}
              <h2 className='text-h3 font-bold pb-2'>利用規約</h2>
              {/* 本登録説明文 */}
              <p className='text-small'>
                (sample)この利用規約（以下，「本規約」といいます。XX
                ）は，〇〇（以下，「当社」といいます。）がこのウェブサイト上で提供するサービス（以下，「本サービス」といいます。）の利用条件を定めるものです。
                登録ユーザーの皆さま（以下，「ユーザー」といいます。）には，本規約に従って，本サービスをご利用いただきます。
                <br />
                XXXXX
                <br />
                XXXXX
              </p>
            </div>
            {/* 利用規約同意チェック */}
            <div className='flex justify-center items-center gap-[10px]'>
              <OriginalCheckbox
                id='terms'
                label='利用規約に同意する'
                value='利用規約'
                checked={checked}
                readonly={false}
                onChange={() => {
                  setChecked(!checked);
                }}
              />
            </div>
            <div className='flex justify-center flex-row items-center gap-[16px]'>
              {/* キャンセル */}
              <CustomButton
                onClick={() => {
                  router.push('/login');
                }}
                buttonType='white-outlined'
                className='w-[120px] md:w-[240px]'
              >
                キャンセル
              </CustomButton>
              {/* 登録 */}
              <CustomButton
                className='w-[120px] md:w-[240px]'
                buttonType='primary'
                onClick={async () => {
                  // エラーがあればエラーメッセージを表示
                  const userNameError = Validator.getErrorMessages([
                    Validator.validateRequired(userName, 'ユーザー名'),
                    Validator.validateUserNameFormat(userName),
                    Validator.validateLength(userName, 'ユーザー名', 32),
                  ]);

                  const emailError = Validator.getErrorMessages([
                    Validator.validateRequired(email, 'メールアドレス'),
                    Validator.validateEmailFormat(email),
                    Validator.validateEmailFormat2(email),
                  ]);

                  const emailConfirmError = Validator.getErrorMessages([
                    Validator.validateRequired(confirmEmail, '確認用のメールアドレス'),
                    Validator.validateEqual(email, confirmEmail, 'メールアドレス'),
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
                  if (
                    systemError.length > 0 ||
                    userNameError.length > 0 ||
                    emailError.length > 0 ||
                    emailConfirmError.length > 0
                  ) {
                    return;
                  }
                  const csrf = () => axios.get('/sanctum/csrf-cookie');
                  await csrf();
                  // 仮登録処理
                  axios
                    .post('/signup', {
                      userName,
                      email,
                      confirmEmail,
                      checked,
                    })
                    .then((response) => {
                      //console.log(response);
                      if (window.confirm(response?.data) == true) {
                        router.push('/login');
                      }
                    })
                    .catch((error) => {
                      // エラー時の処理を実装
                      let systemError = [] as string[];
                      if (error.response?.status === 422) {
                        systemError.push(error?.response?.data?.message);
                      } else if (error.response?.status === 400) {
                        systemError = [...error?.response?.data?.system_error];
                      } else {
                        systemError = [
                          '仮登録に失敗しました。',
                          'ユーザーサポートにお問い合わせください。',
                        ];
                      }
                      setErrorText(systemError);
                    });
                }}
              >
                仮登録
              </CustomButton>
            </div>
          </div>
          <div className='flex flex-col gap-[10px] rounded py-[40px] border-border border-solid border-[1px] md:w-[1000px] p-4'>
            <h2 className='text-h3 font-bold pb-2 mx-auto'>本登録までの流れ</h2>
            <div className='flex justify-center flex-row items-center gap-[10px]'>
              <p className='text-caption1'>メール送信</p>
              <ArrowRightOutlinedIcon className='text-small text-secondaryText' />
              <p className='text-caption1'>
                メール本文に記載されているパスワードで
                <br />
                本システムにログイン
              </p>
              <ArrowRightOutlinedIcon className='text-small text-secondaryText' />
              <p className='text-caption1'>
                パスワード変更と
                <br />
                ユーザ情報の入力
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
