// パスワード変更画面

'use client';

import CustomButton from '@/app/components/CustomButton';
import CustomPasswordField from '@/app/components/CustomPasswordField';
import CustomTitle from '@/app/components/CustomTitle';
import ErrorBox from '@/app/components/ErrorBox';
import { useAuth } from '@/app/hooks/auth';
import axios from '@/app/lib/axios';
import { PasswordChange } from '@/app/types';
import Validator from '@/app/utils/validator';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
  const { user, logout, refetchUser } = useAuth({ middleware: 'auth' });

  const router = useRouter();

  return (
    <main className='flex flex-col items-center justify-start gap-[20px] my-[100px] m-auto max-w-md px-2'>
      <CustomTitle>パスワード変更</CustomTitle>
      <div className='flex flex-col gap-4 rounded w-full'>
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
          placeholder='新しいパスワードを入力してください。'
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <CustomPasswordField
          label='新パスワード確認'
          isError={confirmNewPasswordErrorMessages.length > 0}
          errorMessages={confirmNewPasswordErrorMessages}
          required
          placeholder='新しいパスワードを入力してください。'
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />
        <div className='flex flex-col gap-[8px] bg-systemWarningBg border-systemWarningText border-solid border-[1px] p-2 justify-center break-words bg-opacity-40'>
          <WarningAmberOutlinedIcon className='text-systemWarningText text-h3' />
          <div className='flex flex-col gap-[8px] text-primaryText text-caption2 text-left'>
            パスワードは、以下の文字種の全てを含む、8文字以上32文字以内にしてください。
            <br />
            ・半角英大文字
            <br />
            ・半角英小文字
            <br />
            ・半角数字
            <br />
            ・以下の記号のいずれか1文字以上
            <br />
            {'!"#$%&\'()*+,-./:;<=>?@[]_`{|}~^'}
          </div>
        </div>
      </div>
      <div className='gap-4 flex flex-col sm:flex-row'>
        <CustomButton
          buttonType='white-outlined'
          className='flex-1'
          onClick={() => {
            if (user?.temp_password_flag == 1) {
              logout(); // 仮パスワードフラグが1の場合、ログイン画面に遷移する 20240404
            } else {
              router.back();
            }
          }}
        >
          戻る
        </CustomButton>
        <CustomButton
          buttonType='primary'
          className='flex-1'
          onClick={async () => {
            // バリデーション
            const currentPasswordErrorMessages = Validator.getErrorMessages([
              Validator.validateRequired(currentPassword, '旧パスワード'),
            ]);
            setCurrentPasswordErrorMessages(currentPasswordErrorMessages);

            const newPasswordErrorMessages = Validator.getErrorMessages([
              Validator.validateRequired(newPassword, '新パスワード'),
              Validator.validatePasswordFormat(newPassword),
              Validator.validateLengthMinAndMax(newPassword, 'パスワード', 8, 32),
              Validator.ValidateNotEqual(
                newPassword,
                currentPassword,
                '旧パスワード',
                'パスワード',
              ),
            ]);
            //新パスワードが未入力の場合、他のバリデーション結果を表示させない仕様のため下記の実装とする 20240416
            if (newPasswordErrorMessages.includes('新パスワードを入力してください。')) {
              setNewPasswordErrorMessages(['新パスワードを入力してください。']);
            } else {
              setNewPasswordErrorMessages(newPasswordErrorMessages);
            }

            const confirmPasswordErrorMessages = Validator.getErrorMessages([
              Validator.validateRequired(confirmNewPassword, '確認用のパスワード'),
              Validator.validateEqual(newPassword, confirmNewPassword, 'パスワード'),
            ]);
            setConfirmNewPasswordErrorMessages(confirmPasswordErrorMessages);
            // エラーがある場合、後続の処理を中止
            if (
              currentPasswordErrorMessages.length > 0 ||
              newPasswordErrorMessages.length > 0 ||
              confirmPasswordErrorMessages.length > 0
            ) {
              return;
            }
            const requestBody = {
              currentPassword,
              newPassword,
              confirmNewPassword,
            };
            const csrf = () => axios.get('/sanctum/csrf-cookie');
            await csrf();
            axios
              .post<{ result: PasswordChange }>('api/user/password-change', requestBody)
              .then(async (response) => {
                window.alert(response?.data.result.message);
                await csrf();
                await refetchUser();

                if (user?.temp_password_flag === 1) {
                  router.push('userInformation?mode=update'); //仮登録状態のユーザはユーザ情報更新画面に遷移
                  return;
                }

                router.push('/mypage/top'); //本登録済みのユーザはマイページトップ画面に遷移
              })
              .catch((error) => {
                setErrorText([error.response?.data?.message]);
              });
          }}
        >
          変更
        </CustomButton>
      </div>
    </main>
  );
}
