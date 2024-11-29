'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Divider } from '@mui/material';
import { CoachRefereeRefResponse } from '@/app/types';

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
import { fetcher } from '@/app/lib/swr';

export default function UserInformationReference() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user } = useAuth({
    middleware: 'auth',
  });

  const userId = Number(searchParams.get('userId') || user?.user_id);
  const { data } = useSWR(
    userId
      ? {
          url: `/getCoachRefereeInfoList`,
          params: { userId },
        }
      : null,
    fetcher<CoachRefereeRefResponse>,
  );

  if (!data) {
    return null;
  } else if (user === undefined) {
    router.push('/login');
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
        <h2 className='font-bold text-3xl text-primaryText'>{data.result.userName}</h2>
        <div className='flex gap-3 mb-7'>
          <span>ユーザーID</span>
          <span>{userId}</span>
        </div>
        <h3 className='mb-3'>指導履歴</h3>
        <div className='overflow-auto mb-7 mr-auto'>
          {data.result.coachingHistories.length > 0 ? (
            <CustomTable>
              <CustomThead>
                <CustomTr>
                  <CustomTh align='left'>指導期間</CustomTh>
                  <CustomTh align='left'>団体名</CustomTh>
                  <CustomTh align='left'>スタッフ種別</CustomTh>
                </CustomTr>
              </CustomThead>
              <CustomTbody>
                {data.result.coachingHistories.map((history) => (
                  <CustomTr key={history.orgCoachingHistoryId}>
                    <CustomTd>
                      <span>{history.startDate}</span>
                    </CustomTd>
                    <CustomTd>
                      <span>{history.orgName}</span>
                    </CustomTd>
                    <CustomTd>
                      <span>{history.staffTypeName}</span>
                    </CustomTd>
                  </CustomTr>
                ))}
              </CustomTbody>
            </CustomTable>
          ) : (
            <span>指導履歴はありません。</span>
          )}
        </div>
        <h3 className='mb-3'>指導者資格</h3>
        <div className='flex gap-3 mb-3'>
          <span>JSPO ID</span>
          {data.result.jspoId ? <span>{data.result.jspoId}</span> : <span>未登録</span>}
        </div>
        <div className='flex gap-3 mb-7 flex-wrap'>
          {data.result.coachQualificationNames.length > 0 ? (
            data.result.coachQualificationNames.map((name) => (
              <RoundedBadge key={name} label={name} isValid={true} />
            ))
          ) : (
            <span>指導者資格がありません。</span>
          )}
        </div>
        <h3 className='mb-3'>審判資格</h3>
        <div className='flex gap-3 flex-wrap'>
          {data.result.refereeQualificationNames.length > 0 ? (
            data.result.refereeQualificationNames.map((name) => (
              <RoundedBadge key={name} label={name} isValid={true} />
            ))
          ) : (
            <span>審判資格がありません。</span>
          )}
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
