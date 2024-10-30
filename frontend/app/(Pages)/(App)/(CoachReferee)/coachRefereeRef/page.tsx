'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import axios from '@/app/lib/axios';
import { Divider } from '@mui/material';
import { CoachRefereeResponse } from '@/app/types';

import {
  CustomButton,
  CustomTitle,
  CustomTable,
  CustomThead,
  CustomTr,
  CustomTh,
  CustomTbody,
  CustomTd,
  RoundedBadge,
} from '@/app/components';
import { TitleSideButton } from '../../_components/TitleSideButton';
import EditIcon from '@mui/icons-material/EditOutlined';
import { useAuth } from '@/app/hooks/auth';

const fetcher = async (url: string) => {
  await axios.get('/sanctum/csrf-cookie');
  const response = await axios.get(url);
  return response.data.result;
};

export default function UserInformationReference() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user } = useAuth({
    middleware: 'auth',
  });

  if (user === undefined) {
    router.push('/login');
    return null;
  }
  const userId = Number(searchParams.get('userId') || user.user_id);

  if (!userId) {
    return null;
  }

  // ユーザー情報のセットアップ
  const { data } = useSWR<CoachRefereeResponse>(`/getUserData?userId=${userId}`, fetcher);
  const { user_name } = data || {};

  if (!user_name) {
    return null;
  }

  return (
    <>
      {/* 画面名 */}
      <div className='flex justify-between gap-2'>
        <CustomTitle displayBack>指導者・審判情報参照</CustomTitle>
        <div className='flex items-center gap-2'>
          {Number(user.user_id) === userId && (
            <TitleSideButton
              // FIXME リンク先のURLを修正する
              href='/user-information-edit'
              icon={EditIcon}
              text='指導者・審判情報更新'
            />
          )}
        </div>
      </div>
      <div className='flex flex-col text-xs sm:text-sm'>
        <h2 className='font-bold text-3xl text-secondaryText'>{user_name}</h2>
        <div className='flex gap-3 mb-7'>
          <span>ユーザーID</span>
          <span>{userId}</span>
        </div>
        <h3 className='mb-3'>指導履歴</h3>
        <div className='overflow-auto mb-7 mr-auto'>
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
        <h3 className='mb-3'>指導者資格</h3>
        <div className='flex gap-3 mb-3'>
          <span>JSPO ID</span>
          <span>{userId}</span>
        </div>
        <div className='flex gap-3 mb-7 flex-wrap'>
          <RoundedBadge label={user_name} isValid={true} />
          <RoundedBadge label={user_name} isValid={true} />
        </div>
        <h3 className='mb-3'>審判資格</h3>
        <div className='flex gap-3 flex-wrap'>
          <RoundedBadge label={user_name} isValid={true} />
          <RoundedBadge label={user_name} isValid={true} />
        </div>
      </div>
      <Divider className='h-[1px] bg-border' />
      <div className='flex flex-row justify-center gap-4'>
        {/* 戻るボタン */}
        <CustomButton
          buttonType='white-outlined'
          onClick={() => {
            router.back();
          }}
        >
          戻る
        </CustomButton>
      </div>
    </>
  );
}
