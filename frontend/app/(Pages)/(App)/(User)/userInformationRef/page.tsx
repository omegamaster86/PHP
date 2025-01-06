// 機能名: ユーザー情報参照画面・ユーザー情報削除画面
'use client';

import axios from '@/app/lib/axios';
import { UserResponse } from '@/app/types';
import { Divider } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  CustomButton,
  CustomTable,
  CustomTbody,
  CustomTd,
  CustomTh,
  CustomThead,
  CustomTitle,
  CustomTr,
  ErrorBox,
  RoundedBadge,
} from '@/app/components';
import { useAuth } from '@/app/hooks/auth';
import { NO_IMAGE_URL, USER_IMAGE_URL } from '@/app/utils/imageUrl';

export default function UserInformationReference() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  let paramError = false;
  const { logout } = useAuth({ middleware: 'auth' });

  // フォームの入力値を管理するステート
  const [formData, setFormData] = useState<UserResponse>({
    user_id: '', // ユーザーID
    user_name: '', // ユーザー名
    date_of_birth: '', // 生年月日
    sex: null, // 性別
    sexName: '', // 性別
    height: 0, // 身長
    weight: 0, // 体重
    residence_country: null, // 居住地（国）ID
    residenceCountryName: '', // 居住地（国）
    residence_prefecture: null, // 居住地（都道府県）ID
    residencePrefectureName: '', // 居住地（都道府県）
    mailaddress: '', // メールアドレス
    user_type: '', // ユーザー種別
    userTypeName: '', // ユーザー種別名
    temp_password_flag: 0, // 仮登録ステータス
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
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        const response = await axios.get<{ result: UserResponse }>('api/user');
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...{
            user_id: response.data.result.user_id,
            user_name: response.data.result.user_name,
            user_type: response.data.result.user_type,
            userTypeName: response.data.result.userTypeName,
            date_of_birth: response.data.result.date_of_birth,
            sexName: response.data.result.sexName,
            sex: response.data.result.sex,
            height: response.data.result.height,
            weight: response.data.result.weight,
            residenceCountryName: response.data.result.residenceCountryName,
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
            const deleteUser = async () => {
              const csrf = () => axios.get('/sanctum/csrf-cookie');
              await csrf();
              axios
                .post('api/deleteUserData')
                .then((res) => {
                  logout();
                })
                .catch((error) => {
                  // TODO: エラー処理
                  if (error?.response) {
                    setErrorMessage([...error?.response?.data]);
                  } else {
                    setErrorMessage([...error?.message]);
                  }
                });
            };
            deleteUser();
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
    <>
      <ErrorBox errorText={errorMessage} />
      {/* 画面名 */}
      <CustomTitle displayBack>{mode === 'delete' ? '退会' : 'ユーザー情報参照'}</CustomTitle>
      <div className='flex flex-col md:flex-row gap-10'>
        <img
          src={formData.photo ? `${USER_IMAGE_URL}${formData.photo}` : `${NO_IMAGE_URL}`}
          className='w-[260px] h-[260px] rounded-full object-cover self-center sm:self-start'
        />
        <div className='text-xs sm:text-sm'>
          <span className='font-bold text-3xl text-secondaryText'>
            {formData.user_name ? formData.user_name : '山田 太郎'}
          </span>
          <div className='flex flex-col gap-1 mb-7'>
            <span className=' text-secondaryText'>
              {formData.mailaddress ? formData.mailaddress : ''}
            </span>
            <div className='flex gap-3'>
              <span>ユーザーID</span>
              <span className=' text-secondaryText'>
                {formData.user_id ? formData.user_id : ''}
              </span>
            </div>
            <div className='flex flex-col sm:flex-row sm:gap-3'>
              <span className='flex-shrink-0'>ユーザー種別</span>
              <span className=' text-secondaryText'>
                {formData.userTypeName ? formData.userTypeName : ''}
              </span>
            </div>
          </div>
          <span className='inline-block mb-3'>プロフィール</span>
          <div className='flex flex-col gap-1 mb-7'>
            <div className='flex gap-9'>
              <div className='flex gap-3'>
                <span>性別</span>
                <span className=' text-secondaryText w-16 '>
                  {formData.sexName ? formData.sexName : ''}
                </span>
              </div>
              <div className='flex gap-3'>
                <span>生年月日</span>
                <span className='text-secondaryText'>
                  {formData.date_of_birth ? formData.date_of_birth : ''}
                </span>
              </div>
            </div>
            <div className='flex gap-9'>
              <div className='flex gap-3'>
                <span>身長</span>
                <span className=' text-secondaryText inline-block w-16 whitespace-nowrap'>
                  {formData.height ? `${formData.height} cm` : ''}
                </span>
              </div>
              <div className='flex gap-3'>
                <span>体重</span>
                <span className=' text-secondaryText'>
                  {formData.weight ? `${formData.weight} kg` : ''}
                </span>
              </div>
            </div>
            <div className='flex gap-3'>
              <span>居住地</span>
              <div>
                <span className=' text-secondaryText'>
                  {formData.residenceCountryName ? formData.residenceCountryName : ''}
                </span>
                <span className='text-secondaryText'>
                  {formData.residencePrefectureName ? formData.residencePrefectureName : ''}
                </span>
              </div>
            </div>
          </div>
          <span className='inline-block mb-3'>指導履歴</span>
          <div className='overflow-auto mb-7'>
            <CustomTable>
              <CustomThead>
                <CustomTr>
                  <CustomTh align='left'>指導期間</CustomTh>
                  <CustomTh align='left'>団体名</CustomTh>
                  <CustomTh align='left'>スタッフ種別</CustomTh>
                </CustomTr>
              </CustomThead>
              <CustomTbody>
                <CustomTr>
                  <CustomTd>
                    <span>指導期間テスト</span>
                  </CustomTd>
                  <CustomTd>
                    <span>団体名テスト</span>
                  </CustomTd>
                  <CustomTd>
                    <span>スタッフテスト</span>
                  </CustomTd>
                </CustomTr>
              </CustomTbody>
            </CustomTable>
          </div>
          <span className='inline-block mb-3'>指導者資格</span>
          <div className='flex gap-3 mb-3'>
            <span>JSPO ID</span>
            <span>{formData.user_id ? formData.user_id : ''}</span>
          </div>
          <div className='flex gap-3 mb-7'>
            <RoundedBadge label={formData.residenceCountryName} isValid={true} />
            <RoundedBadge label={formData.residenceCountryName} isValid={true} />
          </div>
          <span className='inline-block mb-3'>審判資格</span>
          <div className='flex gap-3'>
            <RoundedBadge label={formData.residenceCountryName} isValid={true} />
            <RoundedBadge label={formData.residenceCountryName} isValid={true} />
          </div>
        </div>
      </div>
      <Divider className='h-[1px] bg-border' />
      <div className='flex flex-row justify-center gap-4'>
        {/* 戻る・キャンセルボタン */}
        <CustomButton
          buttonType='white-outlined'
          onClick={() => {
            setErrorMessage([]);
            router.back();
          }}
        >
          {mode === 'delete' ? 'キャンセル' : '戻る'}
        </CustomButton>
        {/* 退会ボタン */}
        {modeCustomButtons[mode as keyof typeof modeCustomButtons]}
      </div>
    </>
  );
}