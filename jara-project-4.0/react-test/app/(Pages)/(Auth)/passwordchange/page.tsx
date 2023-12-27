'use client';
import Header from '../../../components/Header';
import { useState } from 'react';
import CustomPasswordField from '@/app/components/CustomPasswordField';
import CustomButton from '@/app/components/CustomButton';
import { useRouter } from 'next/navigation';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import V from '@/app/utils/validator';

export default function Passwordchange() {
  const [errorText, setErrorText] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [currentPasswordErrorMessages, setCurrentPasswordErrorMessages] = useState([] as string[]);
  const [newPasswordErrorMessages, setNewPasswordErrorMessages] = useState([] as string[]);
  const [confirmNewPasswordErrorMessages, setConfirmNewPasswordErrorMessages] = useState(
    [] as string[],
  );

  const router = useRouter();

  return (
    <div>
      <Header />
      <main className='flex flex-col items-center justify-start gap-[80px] my-[100px] m-auto p-4'>
        <h1 className='text-h1 font-bold'>パスワード変更</h1>
        <div className='flex flex-col gap-[20px] rounded'>
          {errorText && (
            <div
              className='flex flex-col gap-[20px]
                bg-systemErrorBg border-systemErrorText border-solid border-[1px] p-2 px-4 justify-center break-words bg-opacity-40'
            >
              <p className='text-systemErrorText text-[14px] text-center'>{errorText}</p>
            </div>
          )}
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
            <WarningAmberOutlinedIcon className='text-systemWarningText text-[20px]' />
            <div className='flex flex-col gap-[8px] text-primaryText text-[10px] text-left'>
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
            className='secondary w-[200px]'
            onClick={() => {
              // パスワード変更画面に遷移
              router.back();
            }}
          >
            戻る
          </CustomButton>
          <CustomButton
            className='primary w-[200px]'
            onClick={() => {
              // バリデーション
              setCurrentPasswordErrorMessages(
                V.getErrorMessages([
                  V.validateRequired(currentPassword, '旧パスワード'),
                ]) as string[],
              );

              setNewPasswordErrorMessages(
                V.getErrorMessages([
                  V.validateRequired(newPassword, '新パスワード'),
                  V.validatePasswordFormat(newPassword),
                  V.validateLengthMinAndMax(newPassword, 'パスワード', 8, 16),
                  V.ValidateNotEqual(newPassword, currentPassword, '旧パスワード', 'パスワード'),
                ]) as string[],
              );

              setConfirmNewPasswordErrorMessages(
                V.getErrorMessages([
                  V.validateRequired(confirmNewPassword, '確認用のパスワード'),
                  V.validateEqual(newPassword, confirmNewPassword, 'パスワード'),
                ]) as string[],
              );
            }}
          >
            変更
          </CustomButton>
        </div>
      </main>
    </div>
  );
}
