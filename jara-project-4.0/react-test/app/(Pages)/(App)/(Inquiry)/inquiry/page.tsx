// 問い合わせ画面
'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CustomButton,
  ErrorBox,
  CustomTitle,
  CustomTextField,
  OriginalCheckbox,
  Label,
  InputLabel,
} from '@/app/components';
import Validator from '@/app/utils/validator';
import axios from '@/app/lib/axios';
import { TextareaAutosize } from '@mui/material';
import { UserResponse } from '@/app/types';

export default function Inquiry() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // modeの値を取得 default confirm
  const mode = searchParams.get('mode') ?? 'default';
  // modeの値に応じてボタンの表示を変更
  const isConfirm = mode === 'confirm';
  // ログインユーザーかどうか
  const [isLogIn, setIsLogIn] = useState(false);
  // ユーザー情報
  const [user, setUser] = useState({
    user_name: '',
    mailaddress: '',
  } as UserResponse);
  // お問い合わせ内容
  const [inquiry, setInquiry] = useState<string>();
  // お問い合わせ内容（改行ごとに配列に分割）
  const [inquiryLines, setInquiryLines] = useState<string[]>();
  // 個人情報保護方針の同意
  const [checked, setChecked] = useState(false);

  // エラーメッセージ
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [userNameErrorMessages, setUserNameErrorMessages] = useState([] as string[]);
  const [emailErrorMessages, setEmailErrorMessages] = useState([] as string[]);
  const [inquiryErrorMessages, setInquiryErrorMessages] = useState([] as string[]);
  const [consentErrorMessages, setConsentErrorMessages] = useState([] as string[]);

  // データ取得用のEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 仮のURL（繋ぎ込み時に変更すること）
        // const response = await axios.get<UserResponse>('http://localhost:3100/user');
        const csrf = () => axios.get('/sanctum/csrf-cookie')
        await csrf()
        const response = await axios.get('/api/user');
        setUser(response.data);
      } catch (error) {
        setErrorMessage([
          ...(errorMessage as string[]),
          'API取得エラー:' + (error as Error).message,
        ]);
      }
    };

    // ログインユーザーの場合にデータを取得
    if (isLogIn) {
      fetchData();
    }
  }, [isLogIn]);

  // モードに応じたボタンの設定
  const modeCustomButtons = {
    default: (
      <CustomButton
        className='w-[120px] md:w-[240px]'
        buttonType='primary'
        onClick={() => {
          // エラーがあればエラーメッセージを表示
          const userNameError = Validator.getErrorMessages([
            Validator.validateRequired(user.user_name, '氏名（ユーザー名）'),
            Validator.validateUserNameFormat(user.user_name),
            Validator.validateLength(user.user_name, '氏名（ユーザー名）', 32),
          ]);

          const emailError = Validator.getErrorMessages([
            Validator.validateRequired(user.mailaddress, 'メールアドレス'),
            Validator.validateEmailFormat(user.mailaddress),
          ]);

          const inquiryError = Validator.getErrorMessages([
            Validator.validateRequired(inquiry, 'お問い合わせ内容'),
          ]);

          const consentError = [] as string[];
          if (!isLogIn && !checked) {
            consentError.push('個人情報保護方針への同意が必要です。');
          }

          setUserNameErrorMessages(userNameError as string[]);
          setEmailErrorMessages(emailError as string[]);
          setInquiryErrorMessages(inquiryError as string[]);
          setConsentErrorMessages(consentError as string[]);

          // エラーがある場合、後続の処理を中止
          if (
            userNameError.length > 0 ||
            emailError.length > 0 ||
            inquiryError.length > 0 ||
            consentError.length > 0
          ) {
            return;
          }
          setInquiryLines(inquiry?.split('\n') as string[]);
          router.push('/inquiry?mode=confirm');
        }}
      >
        確認
      </CustomButton>
    ),
    confirm: (
      <CustomButton
        buttonType='primary'
        onClick={async() => {
          // 送信処理
          const requestBody = {};
          const csrf = () => axios.get('/sanctum/csrf-cookie')
          await csrf()
          axios
            .post('/smtp', requestBody)
            .then((response) => {
              router.push('/login');
            })
            .catch((error) => {
              setErrorMessage(['メール送信に失敗しました。もう一度送信してください。']);
            });
        }}
      >
        送信
      </CustomButton>
    ),
  };

  return (
    <div>
      <main className='flex flex-col items-center justify-start gap-[40px] my-[100px] m-auto p-4 md:max-w-[900px]'>
        {/* 画面名 */}
        <CustomTitle isCenter={true}>お問い合わせ</CustomTitle>
        <div className='flex flex-col gap-[20px] rounded'>
          {/* エラー表示１ */}
          <ErrorBox errorText={errorMessage.length > 0 ? errorMessage : []} />
          <div className='flex flex-col gap-[8px]'>
            {/* 氏名 */}
            <div className='flex flex-col gap-[8px]'>
              <CustomTextField
                label='お名前'
                // エラー表示2
                isError={userNameErrorMessages.length > 0}
                errorMessages={userNameErrorMessages}
                required={!isConfirm}
                displayHelp={false}
                value={user.user_name}
                placeHolder='山田 太郎'
                onChange={(e) => setUser({ ...user, user_name: e.target.value })}
                readonly={isConfirm}
              />
            </div>
          </div>
          {/* メールアドレス */}
          <div className='flex flex-col gap-[10px]'>
            <CustomTextField
              label='メールアドレス'
              // エラー表示3
              isError={emailErrorMessages.length > 0}
              errorMessages={emailErrorMessages}
              required={!isConfirm}
              displayHelp={false}
              placeHolder='メールアドレスを入力してください。'
              value={user.mailaddress}
              onChange={(e) => setUser({ ...user, mailaddress: e.target.value })}
              readonly={isConfirm}
            />
          </div>
          {/* お問い合わせ内容 */}
          <div className='flex flex-col gap-[20px]'>
            <div className='flex flex-col gap-[8px]'>
              <InputLabel label={'お問い合わせの内容'} required={!isConfirm} />
              {isConfirm ? (
                <div className='h-auto text-secondaryText py-3 disable'>
                  {inquiryLines?.map((line, index) => (
                    <Fragment key={index}>
                      {line}
                      {index < inquiryLines.length - 1 && <br />}
                    </Fragment>
                  ))}
                </div>
              ) : (
                <TextareaAutosize
                  className={`bg-white border-[1px] border-solid rounded-md p-4 ${
                    inquiryErrorMessages.length > 0 ? 'border-red' : 'border-gray-100'
                  }`}
                  value={inquiry}
                  onChange={(e) => setInquiry(e.target.value)}
                />
              )}
              {/* エラー表示4 */}
              {inquiryErrorMessages.length > 0 &&
                inquiryErrorMessages?.map((message) => {
                  return (
                    <p key={message} className='text-caption1 text-systemErrorText'>
                      {message}
                    </p>
                  );
                })}
            </div>
            {!isLogIn && !isConfirm && (
              <div className='flex flex-col gap-[20px]'>
                <div className='bg-thinContainerBg border-[1px] border-solid border-[#E0E0E0] rounded-md p-4 flex flex-col gap-2'>
                  {/* 個人情報取り扱い */}
                  <Label label='個人情報取り扱い' textSize='h3' isBold />
                  {/* 個人情報保護方針の本文 */}
                  <p className='text-small'>
                    (sample)
                    <br />
                    XXXXX
                    <br />
                    XXXXX
                  </p>
                </div>
                <div className='flex justify-center items-center gap-[10px]'>
                  <div className='flex flex-col gap-[8px]'>
                    <OriginalCheckbox
                      id='terms'
                      label='上記個人情報に関する内容について同意する'
                      value='個人情報取り扱い'
                      checked={checked}
                      readonly={false}
                      onChange={() => {
                        setChecked(!checked);
                      }}
                      // エラー表示5
                      isError={consentErrorMessages.length > 0}
                      errorMessages={consentErrorMessages}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className='flex justify-center flex-row items-center gap-[16px]'>
            <CustomButton
              onClick={() => {
                router.back();
              }}
              buttonType='white-outlined'
              className='w-[120px] md:w-[240px]'
            >
              キャンセル
            </CustomButton>
            {modeCustomButtons[mode as keyof typeof modeCustomButtons]}
          </div>
        </div>
      </main>
    </div>
  );
}
