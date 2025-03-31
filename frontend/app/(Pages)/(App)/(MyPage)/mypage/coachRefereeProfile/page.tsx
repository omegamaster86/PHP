'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MyPageCoachRefereeResponse } from '@/app/types';

import {
  CustomTitle,
  CustomTable,
  CustomThead,
  CustomTr,
  CustomTh,
  CustomTbody,
  CustomTd,
  RoundedBadge,
  InputLabel,
  ToolTip,
} from '@/app/components';
import { TitleSideButton } from '@/app/(Pages)/(App)/_components/TitleSideButton';
import EditIcon from '@mui/icons-material/EditOutlined';

import useSWR from 'swr';
import { fetcher } from '@/app/lib/swr';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { formatDate } from '@/app/utils/dateUtil';
import { addMonths, isAfter, isEqual } from 'date-fns';

const coachMonthOffset = 9;
const refereeMonthOffset = 12;

type Qualification = {
  expiryDate: string | null;
  label: string;
};

type QualificationItemProps = {
  item: Qualification;
  monthOffset: number;
};

const QualificationItem: React.FC<QualificationItemProps> = ({ item, monthOffset }) => {
  const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;

  const isWithinPeriod = (expiry: Date): boolean => {
    const today = new Date();
    const isWithinMonths = addMonths(expiry, -monthOffset);
    return isAfter(today, isWithinMonths) || isEqual(today, isWithinMonths);
  };

  const qualificationToolTipText = (item: Qualification): string => {
    if (!item.expiryDate) return '無期限で有効です。';
    return `有効期限は ${formatDate(item.expiryDate, 'yyyy/MM/dd')} です。`;
  };

  const toolTipText = qualificationToolTipText(item);

  return (
    <ToolTip toolTipText={toolTipText}>
      <div className='relative'>
        <RoundedBadge label={item.label} isValid={expiryDate ? expiryDate > new Date() : true} />
        {expiryDate && isWithinPeriod(expiryDate) && (
          <WarningAmberIcon className='text-systemWarningText text-lg bg-white -translate-y-1/2 absolute -right-3' />
        )}
      </div>
    </ToolTip>
  );
};

export default function CoachRefereeProfile() {
  const router = useRouter();
  const EditButton = (
    <TitleSideButton href='/coachReferee?mode=update' icon={EditIcon} text='編集' />
  );

  const { data } = useSWR(
    {
      url: `api/getCoachRefereeProfileInfo`,
    },
    fetcher<MyPageCoachRefereeResponse>,
    {
      onSuccess: (data) => {
        if (!data.result) {
          router.push('/mypage/profile');
        }
      },
      onError: (error) => {
        console.error(error);
        router.push('/mypage/profile');
      },
    },
  );
  const profile = data?.result;

  if (!profile) {
    return null;
  }

  return (
    <>
      {/* スマホ画面で表示 */}
      <div className='mb-4 md:hidden'>
        <div className='flex justify-between mb-5'>
          <CustomTitle displayBack={false}>指導者・審判プロフィール</CustomTitle>
          <div className='flex items-center'>{EditButton}</div>
        </div>
        <div className='font-bold text-xl'>{profile.userName}</div>
      </div>
      {/* スマホ画面以外で表示 */}
      <div className='hidden md:flex justify-between items-center mb-4'>
        <h2 className='font-bold text-3xl'>{profile.userName}</h2>
        {EditButton}
      </div>

      <div className='flex flex-col text-xs sm:text-sm'>
        <h3 className='mb-3 text-sm font-bold'>指導履歴</h3>
        <div className='overflow-auto mb-7 '>
          {profile.coachingHistories.length > 0 ? (
            <CustomTable>
              <CustomThead>
                <CustomTr>
                  <CustomTh align='left'>指導期間</CustomTh>
                  <CustomTh align='left'>団体名</CustomTh>
                  <CustomTh align='left'>スタッフ種別</CustomTh>
                </CustomTr>
              </CustomThead>
              <CustomTbody>
                {profile.coachingHistories.map((history) => (
                  <CustomTr key={history.orgCoachingHistoryId}>
                    <CustomTd>
                      <span>
                        {formatDate(history.startDate, 'yyyy/MM/dd')} ~{' '}
                        {formatDate(history.endDate, 'yyyy/MM/dd') || '現在'}
                      </span>
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
        <div className='mb-3'>
          <InputLabel
            label='指導者資格'
            displayHelp={true}
            toolTipText='資格名を選択すると有効期限日を確認できます。'
          />
        </div>
        <div className='flex gap-3 mb-3'>
          <span>MyJSPO No.</span>
          {data.result.jspoNumber ? <span>{data.result.jspoNumber}</span> : <span>未登録</span>}
        </div>
        <div className='flex flex-wrap gap-3 mb-7'>
          {profile.coachQualifications.length > 0 ? (
            profile.coachQualifications.map((qualification) => (
              <QualificationItem
                key={qualification.heldCoachQualificationId}
                item={{
                  label: qualification.qualName,
                  expiryDate: qualification.expiryDate,
                }}
                monthOffset={coachMonthOffset}
              />
            ))
          ) : (
            <span>指導者資格がありません。</span>
          )}
        </div>

        <div className='mb-3'>
          <InputLabel
            label='審判資格'
            displayHelp={true}
            toolTipText='資格名を選択すると有効期限日を確認できます。'
          />
        </div>
        <div className='flex flex-wrap gap-3 items-center'>
          {profile.refereeQualifications.length > 0 ? (
            profile.refereeQualifications.map((qualification) => (
              <QualificationItem
                key={qualification.heldRefereeQualificationId}
                item={{
                  label: qualification.qualName,
                  expiryDate: qualification.expiryDate,
                }}
                monthOffset={refereeMonthOffset}
              />
            ))
          ) : (
            <span>審判資格がありません。</span>
          )}
        </div>
      </div>
    </>
  );
}
