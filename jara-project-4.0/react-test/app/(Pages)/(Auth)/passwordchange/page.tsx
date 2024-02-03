// パスワード変更画面

'use client';
import { useState } from 'react';
import { useAuth } from '@/app/hooks/auth'
import CustomPasswordField from '@/app/components/CustomPasswordField';
import CustomButton from '@/app/components/CustomButton';
import Loading from '@/app/components/Loading';
import { useRouter } from 'next/navigation';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Validator from '@/app/utils/validator';
import CustomTitle from '@/app/components/CustomTitle';
import ErrorBox from '@/app/components/ErrorBox';
import axios from 'axios';
import { Header } from '@/app/components';

export default function Passwordchange() {
  const [errorText, setErrorText] = useState([] as string[]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [currentPasswordErrorMessages, setCurrentPasswordErrorMessages] = useState([] as string[]);
  const [newPasswordErrorMessages, setNewPasswordErrorMessages] = useState([] as string[]);
  const [confirmNewPasswordErrorMessages, setConfirmNewPasswordErrorMessages] = useState(
    [] as string[],
  );

  const router = useRouter();
  
  {/* This is a extra feature for logout - start*/}
  const [loggedIn, setLoggedIn] = useState(false);
  const { user, logout, isLoading } = useAuth({ middleware: 'auth' })

  if(isLoading ) {
    return (
    <Loading/>)
  }

  function authCheck(){
    if(user){
      setLoggedIn(true)
    }
  }
  if(!loggedIn){
    authCheck()
  }
  else {
    // if(!(user?.temp_password_flag))
    //   router.push('/myPage')
  }
  
  {/* This is a extra feature for logout - end*/}
  return (
    <>
    {loggedIn && (<><Header />
    <div>
        {/* This is a extra feature for logout - start*/}
        <div className=' text-right mt-4 mr-2'>
          <CustomButton buttonType='primary' className='w-[200px]'  onClick={logout} >
                ログアウト
          </CustomButton>
      </div>
      {/* This is a extra feature for logout - end*/}
      <main className='flex flex-col items-center justify-start gap-[80px] my-[100px] m-auto p-4'>
        <CustomTitle isCenter={true}>パスワード変更</CustomTitle>
        <div className='flex flex-col gap-4 rounded'>
          <ErrorBox errorText={errorText} />
          <CustomPasswordField
            label='旧パスワード'
            isError={currentPasswordErrorMessages.length > 0}
            errorMessages={currentPasswordErrorMessages}
            required
            placeholder='旧パスワードを入力してください。'
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <CustomPasswordField
            label='新パスワード'
            isError={newPasswordErrorMessages.length > 0}
            errorMessages={newPasswordErrorMessages}
            required
            placeholder='パスワードを入力してください。'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <CustomPasswordField
            label='新パスワード確認'
            isError={confirmNewPasswordErrorMessages.length > 0}
            errorMessages={confirmNewPasswordErrorMessages}
            required
            placeholder='確認のためにもう一度パスワードを入力してください。'
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          <div className='flex flex-col gap-[8px] bg-systemWarningBg border-systemWarningText border-solid border-[1px] p-2 justify-center break-words bg-opacity-40'>
            <WarningAmberOutlinedIcon className='text-systemWarningText text-h3' />
            <div className='flex flex-col gap-[8px] text-primaryText text-caption2 text-left'>
              パスワードは、以下の文字種の全てを含む、8文字以上16文字以内にしてください。
              <br />
              ・半角英文字
              <br />
              ・半角数字
              <br />
              ・以下の記号のいずれか1文字以上
              <br />
              {'!"#$%&\'()*+,-./:;<=>?@[]_`{|}~^'}
            </div>
          </div>
        </div>
        <div className='flex justify-center gap-[16px]'>
          <CustomButton
            buttonType='white-outlined'
            className='w-[200px]'
            onClick={() => {
              // パスワード変更画面に遷移
              router.back();
            }}
          >
            戻る
          </CustomButton>
          <CustomButton
            buttonType='primary'
            className='w-[200px]'
            onClick={() => {
              // バリデーション
              setCurrentPasswordErrorMessages(
                Validator.getErrorMessages([
                  Validator.validateRequired(currentPassword, '旧パスワード'),
                ]) as string[],
              );

              setNewPasswordErrorMessages(
                Validator.getErrorMessages([
                  Validator.validateRequired(newPassword, '新パスワード'),
                  Validator.validatePasswordFormat(newPassword),
                  Validator.validateLengthMinAndMax(newPassword, 'パスワード', 8, 16),
                  Validator.ValidateNotEqual(
                    newPassword,
                    currentPassword,
                    '旧パスワード',
                    'パスワード',
                  ),
                ]) as string[],
              );

              setConfirmNewPasswordErrorMessages(
                Validator.getErrorMessages([
                  Validator.validateRequired(confirmNewPassword, '確認用のパスワード'),
                  Validator.validateEqual(newPassword, confirmNewPassword, 'パスワード'),
                ]) as string[],
              );

              const requestBody = {};
              axios
                .post('http://localhost:3100/', requestBody)
                .then((response) => {
                  // 成功時の処理を実装
                  window.confirm('パスワードを変更しました。');
                  console.log(response);
                })
                .catch((error) => {
                  // エラー時の処理を実装
                  console.log(error);
                });
            }}
          >
            変更
          </CustomButton>
        </div>
      </main>
      </div></>)}
    </>
  );
}
