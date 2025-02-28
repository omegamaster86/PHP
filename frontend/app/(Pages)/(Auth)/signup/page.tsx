// ユーザー登録画面
'use client';

import {
  CustomButton,
  CustomTextField,
  CustomTitle,
  ErrorBox,
  OriginalCheckbox,
} from '@/app/components';
import axios from '@/app/lib/axios';
import Validator from '@/app/utils/validator';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Signup() {
  const [errorText, setErrorText] = useState([] as string[]);
  const [userNameErrorMessages, setUserNameErrorMessages] = useState([] as string[]);
  const [emailErrorMessages, setEmailErrorMessages] = useState([] as string[]);
  const [emailConfirmErrorMessages, setEmailConfirmErrorMessages] = useState([] as string[]);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  return (
    <main className='flex flex-col items-center justify-start gap-[40px] my-[100px] m-auto px-2 max-w-md'>
      {/* 画面名 */}
      <CustomTitle>仮登録</CustomTitle>
      <div className='flex flex-col gap-[20px] rounded w-full'>
        {/* エラー表示1 */}
        <ErrorBox errorText={errorText} />
        {/* ユーザー名 */}
        <div className='flex flex-col gap-[8px]'>
          <CustomTextField
            label='ユーザー名'
            // エラー表示2
            isError={userNameErrorMessages.length > 0}
            errorMessages={userNameErrorMessages}
            required
            value={userName}
            placeHolder='山田太郎'
            onChange={(e) => setUserName(e.target.value)}
            toolTipText={`<span style="display: block;">文字制限</span>
                    <span style="display: block;">最大文字数：32文字（全半角区別なし）</span>
                    <span style="display: block;">利用可能文字：</span>
                    <span style="display: block;">日本語</span>
                    <span style="display: block;">英大文字：[A-Z]（26 文字）</span>
                    <span style="display: block;">英小文字：[a-z]（26 文字）</span>
                    <span style="display: block;">数字：[0-9]（10 文字）</span>
                    <span style="display: block;">記号：-,_</span>
                    `}
          />
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
            placeHolder='メールアドレスを入力してください。'
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
          />
        </div>
        <div className='bg-thinContainerBg border-[1px] border-solid border-[#E0E0E0] rounded-md p-4'>
          {/* 利用規約 */}
          <h2 className='text-h3 font-bold pb-2'>利用規約</h2>
          {/* 本登録説明文 */}
          <p className='text-small'>
            {/* FIXME:文言の修正 */}
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
        <div className='flex flex-col justify-center sm:flex-row items-center gap-[16px]'>
          {/* キャンセル */}
          <CustomButton
            onClick={() => {
              router.push('/login');
            }}
            buttonType='white-outlined'
          >
            キャンセル
          </CustomButton>
          {/* 登録 */}
          <CustomButton
            buttonType='primary'
            onClick={async () => {
              if (isSubmitting) {
                return;
              }
              setIsSubmitting(true);

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
                setIsSubmitting(false);
                return;
              }
              if (window.confirm('入力した内容でユーザーの仮登録を行います。') == false) {
                setIsSubmitting(false);
                return; //キャンセルボタンが押された場合、以降の処理を行わない 20240522
              }

              const csrf = () => axios.get('/sanctum/csrf-cookie');
              await csrf();
              // 仮登録処理
              await axios
                .post('api/signup', {
                  userName,
                  email,
                  confirmEmail,
                  checked,
                })
                .then((response) => {
                  window.alert(response?.data); //仮パスワード通知メール送信メッセージの表示 20240522
                  router.push('/login');
                })
                .catch((error) => {
                  setErrorText([error.response?.data?.message]);
                });

              setIsSubmitting(false);
            }}
          >
            仮登録
          </CustomButton>
        </div>
      </div>
      <div className='flex flex-col gap-[10px] rounded py-[40px] border-border border-solid border-[1px]  p-4'>
        <h2 className='text-h3 font-bold pb-2 mx-auto'>本登録までの流れ</h2>
        <div className='flex flex-col justify-center items-center gap-[10px] text-caption1 text-center'>
          <span>メール送信</span>
          <ArrowDropDownIcon className='text-small' />
          <div>
            <span className='block'>メール本文に記載されている</span>
            <span className='block'>パスワードでログイン</span>
          </div>
          <ArrowDropDownIcon className='text-small' />
          <span>パスワード変更とユーザ情報の入力</span>
        </div>
      </div>
    </main>
  );
}
