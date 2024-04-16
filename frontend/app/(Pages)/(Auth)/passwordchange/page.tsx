// パスワード変更画面

'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/auth';
import CustomPasswordField from '@/app/components/CustomPasswordField';
import CustomButton from '@/app/components/CustomButton';
import Loading from '@/app/components/Loading';
import { useRouter } from 'next/navigation';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Validator from '@/app/utils/validator';
import CustomTitle from '@/app/components/CustomTitle';
import ErrorBox from '@/app/components/ErrorBox';
import axios from '@/app/lib/axios';
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
  const { user, logout } = useAuth({ middleware: 'auth' });

  const router = useRouter();

  return (
    <>
      <div>
        {/* This is a extra feature for logout - start*/}
        {/* <div className=' text-right mt-4 mr-2'>
          <CustomButton buttonType='primary' className='w-[200px]' onClick={logout} >
            ログアウト
          </CustomButton>
        </div> */}
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
          <div className='flex justify-center gap-[16px]'>
            <CustomButton
              buttonType='white-outlined'
              className='w-[200px]'
              onClick={() => {
                console.log(user.temp_password_flag);
                if (user.temp_password_flag == 1) {
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
              className='w-[200px]'
              onClick={async () => {
                // バリデーション
                const currentPasswordErrorMessages = Validator.getErrorMessages([
                  Validator.validateRequired(currentPassword, '旧パスワード'),
                ]);
                setCurrentPasswordErrorMessages(currentPasswordErrorMessages);

                // const newPasswordErrorMessages = Validator.getErrorMessages([
                //   Validator.validateRequired(newPassword, '新パスワード'),
                //   Validator.validatePasswordFormat(newPassword),
                //   Validator.validateLengthMinAndMax(newPassword, 'パスワード', 8, 32),
                //   Validator.ValidateNotEqual(
                //     newPassword,
                //     currentPassword,
                //     '旧パスワード',
                //     'パスワード',
                //   ),
                // ]);
                // setNewPasswordErrorMessages(newPasswordErrorMessages);
                if (Validator.validateRequired(newPassword, '新パスワード')) {
                  const newPasswordErrorMessages = Validator.getErrorMessages([
                    Validator.validateRequired(newPassword, '新パスワード'),
                  ]);
                  setNewPasswordErrorMessages(newPasswordErrorMessages);
                } else {
                  const newPasswordErrorMessages = Validator.getErrorMessages([
                    Validator.validatePasswordFormat(newPassword),
                    Validator.validateLengthMinAndMax(newPassword, 'パスワード', 8, 32),
                    Validator.ValidateNotEqual(
                      newPassword,
                      currentPassword,
                      '旧パスワード',
                      'パスワード',
                    ),
                  ]);
                  setNewPasswordErrorMessages(newPasswordErrorMessages);
                }

                const confirmPasswordErrorMessages = Validator.getErrorMessages([
                  Validator.validateRequired(confirmNewPassword, '確認用のパスワード'),
                  Validator.validateEqual(newPassword, confirmNewPassword, 'パスワード'),
                ]);
                setConfirmNewPasswordErrorMessages(confirmPasswordErrorMessages);
                // エラーがある場合、後続の処理を中止

                console.log(currentPasswordErrorMessages);
                console.log(newPasswordErrorMessages);
                console.log(confirmPasswordErrorMessages);
                console.log(currentPassword);
                console.log(newPassword);
                console.log(confirmNewPassword);

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
                  // .post('http://localhost:3100/', requestBody)
                  .post('/user/password-change', requestBody)
                  .then(async (response) => {
                    // 成功時の処理を実装
                    console.log(response);
                    window.alert(response?.data.result_message);
                    await csrf();
                    await axios.get('/api/user');
                    if (response?.data.temp_password_flag == 0) {
                      router.push('/tournamentSearch'); //本登録済みのユーザは大会検索画面に遷移させる 20240408
                    } else {
                      router.push('/userInformation?mode=update'); //仮登録状態のユーザはユーザ情報更新画面に遷移させる 20240408
                    }
                  })
                  .catch((error) => {
                    // エラー時の処理を実装
                    // console.log(error);
                    let systemError = [] as string[];
                    if (error.response?.status === 422) {
                      systemError.push(error?.response?.data?.message);
                    } else if (error.response?.status === 400) {
                      systemError = [...error?.response?.data?.system_error];
                    } else {
                      systemError = [
                        '内部処理エラーが発生しました、',
                        'サポートにご連絡ください。',
                      ];
                    }
                    setErrorText(systemError);
                  });
              }}
            >
              変更
            </CustomButton>
          </div>
        </main>
      </div>
    </>
  );
}
