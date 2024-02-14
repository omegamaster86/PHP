// 機能名: ユーザー情報参照画面・ユーザー情報削除画面
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/app/lib/axios';
import { Divider } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { UserResponse } from '@/app/types';

import {
  CustomTextField,
  CustomDatePicker,
  CustomButton,
  InputLabel,
  OriginalCheckbox,
  ErrorBox,
  CustomTitle,
} from '@/app/components';
import { useAuth } from '@/app/hooks/auth';

export default function UserInformationUpdate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  let paramError = false;
  const {  logout } = useAuth({ middleware: 'auth' })

  // フォームの入力値を管理するステート
  const [formData, setFormData] = useState<UserResponse>({
    user_id: '', // ユーザーID
    user_name: '', // ユーザー名
    date_of_birth: '', // 生年月日
    sexName: '', // 性別
    height: '', // 身長
    weight: '', // 体重
    residenceCountryName: '', // 居住地（国）
    residencePrefectureName: '', // 居住地（都道府県）
    mailaddress: '', // メールアドレス
    user_type: '', // ユーザー種別
    userTypeName: '', // ユーザー種別名
    temp_password_flag: false, // 仮登録ステータス
    photo: '', // 写真
  });
  // モードのチェック
  switch (mode) {
    case 'delete':
      break;
    default:
      // 参照モードとして扱う
      break;
  }

  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const handleInputChange = (name: string, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (formData.residenceCountryName == '日本国 （jpn）') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        livingPrefecture: '東京',
      }));
    }
  }, [formData.residenceCountryName]);

  // ユーザー情報のセットアップ
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // APIを叩いて、ユーザー情報を取得する
        // TODO: 仮のURL（繋ぎ込み時に変更すること）
        const csrf = () => axios.get('/sanctum/csrf-cookie')
        await csrf()
        const response = await axios.get('/getUserData');
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...{
            user_id: response.data.result.user_id,
            user_name: response.data.result.user_name,
            user_type: response.data.result.user_type,
            userTypeName: response.data.result.userTypeName,
            date_of_birth: response.data.result.date_of_birth,
            sexName: response.data.result.sexName ? response.data.sexName : '男性',
            sex: response.data.result.sex,
            height: response.data.result.height,
            weight: response.data.result.weight,
            residence_country: response.data.result.residence_country,
            residenceCountryName: response.data.result.residenceCountryName
              ? response.data.result.residenceCountryName
              : '日本国 （jpn）',
              residence_prefecture: response.data.result.residence_prefecture,
            residencePrefectureName: response.data.result.residencePrefectureName,
            mailaddress: response.data.result.mailaddress,
            temp_password_flag: response.data.result.temp_password_flag,
            photo: response.data.result.photo,
          },
        }));
      } catch (error: any) {
        // TODO: エラー処理の置き換え
        setErrorMessage(['API取得エラー:' + error.message]);
      }
    };
    fetchUser();
  }, []);

  const modeCustomButtons = {
    delete: (
      <CustomButton
        buttonType='red-outlined'
        className='w-[200px]'
        onClick={() => {
          // TODO: 団体管理者権限を保持していないかのチェックの実装
          const isAuthValidate = false;
          if (isAuthValidate) {
            setErrorMessage([
              '団体管理者権限を保有しています。団体管理画面から権限の破棄を行ってください。',
            ]);
            return;
          }
          const isOk = window.confirm(
            '選手情報やボランティア情報が紐づく場合、該当するデータは削除されずに残りますが、退会しますか？',
          );
          if (isOk) {
            // TODO: ユーザーテーブルから削除する処理の実装
            const deleteUser = async()=>{
              const csrf = () => axios.get('/sanctum/csrf-cookie')
              await csrf()
              axios
                // .delete('http://localhost:3100/')
                .post('/deleteUserData') //20240212 削除するデータを送信
                .then((res) => {
                  // ログイン画面に遷移する
                  logout();
                })
                .catch((error) => {
                  // TODO: エラー処理
                  if(error?.response){
                    setErrorMessage([...error?.response?.data]);
                  }
                  else{
                    setErrorMessage([...error?.message]);
                  }
                  
                });
            }
            deleteUser()
            
          }
        }}
      >
        退会
      </CustomButton>
    ),
  };
  // モードが不正の時にエラー画面を表示する
  if (paramError) {
    return <div>ページが見つかりません</div>;
  }
  return (
    <main className='flex min-h-screen flex-col justify-start p-[10px] m-auto gap-[46px] my-[80px]'>
      <div className='flex flex-col justify-start gap-[20px]'>
        <ErrorBox errorText={errorMessage} />
        <div className='flex flex-row justify-start gap-[20px]'>
          {/* 画面名 */}
          <CustomTitle isCenter={false} displayBack>
            {mode !== 'delete' && 'ユーザー情報参照'}
            {mode === 'delete' && '退会'}
          </CustomTitle>
        </div>
        <div className='flex flex-col justify-start gap-[10px]'>
          {/* 写真 */}
          <InputLabel displayHelp={false} label='写真' />
          <img src={`http://localhost:8000/images/users/${formData.photo}`} className='w-[300px] h-[300px] rounded-[2px] object-cover' />
        </div>
        {/* ユーザーID */}
        <CustomTextField
          label='ユーザーID'
          readonly={true}
          value={formData.user_id}
          displayHelp={false}
        />
        {/* ユーザー種別 */}
        <CustomTextField
          label='ユーザー種別'
          readonly={true}
          value={formData.userTypeName}
          displayHelp={false}
        />
        {/* ユーザー名 */}
        <CustomTextField
          label='ユーザー名'
          placeHolder='山田 太郎'
          readonly
          displayHelp={false}
          required={false}
          value={formData.user_name}
        />
        {/* メールアドレス */}
        <div className='flex flex-row gap-[10px] '>
          <CustomTextField
            label='メールアドレス'
            displayHelp={false}
            errorMessages={[]}
            readonly
            type='email'
            value={formData.mailaddress}
          />
        </div>
        <div className='flex flex-col justify-start gap-[10px]'>
          {/* 性別 */}
          <CustomTextField
            label='性別'
            value={formData.sexName}
            placeHolder='男性'
            displayHelp={false}
            readonly
          />
        </div>
        <div className='flex flex-col justify-start gap-[10px]'>
          {/* 生年月日 */}
          <InputLabel label='生年月日' displayHelp={false} />
          <CustomDatePicker
            readonly
            selectedDate={formData.date_of_birth}
            onChange={(e: string) => {
              handleInputChange('date_of_birth', e);
            }}
            maxDate={new Date()}
          />
        </div>
        <div className='flex flex-row justify-start gap-[16px]'>
          <div className='flex flex-col justify-start'>
            {/* 居住地（国） */}
            <CustomTextField
              label='居住地'
              readonly
              displayHelp={false}
              placeHolder='日本国 （jpn）'
              value={formData.residenceCountryName}
            />
          </div>
          {formData.residenceCountryName === '日本国 （jpn）' && (
            <div className='flex flex-col justify-start'>
              {/* 居住地（都道府県） */}
              <CustomTextField
                label='都道府県'
                displayHelp={false}
                readonly
                value={formData.residencePrefectureName}
              />
            </div>
          )}
        </div>
        <div className='flex flex-row justify-start gap-[16px]'>
          {/* 身長 */}
          <CustomTextField
            label='身長'
            type='number'
            readonly
            required={false}
            value={formData.height}
            placeHolder='180'
            onChange={(e) => {
              handleInputChange('height', e.target.value);
            }}
            displayHelp={false}
            inputAdorment='cm'
          />
          {/* 体重 */}
          <CustomTextField
            label='体重'
            type='number'
            readonly
            required={false}
            value={formData.weight}
            displayHelp={false}
            inputAdorment='kg'
          />
        </div>
      </div>
      <Divider className='w-[900px] h-[1px] bg-border' />

      <div className='flex flex-row justify-center gap-[16px]'>
        {/* 戻る・キャンセルボタン */}
        <CustomButton
          buttonType='white-outlined'
          className='w-[200px]'
          onClick={() => {
            setErrorMessage([]);
            router.back();
          }}
        >
          {mode === 'delete' && 'キャンセル'}
          {mode !== 'delete' && '戻る'}
        </CustomButton>
        {/* 退会ボタン */}
        {modeCustomButtons[mode as keyof typeof modeCustomButtons]}
      </div>
    </main>
  );
}
