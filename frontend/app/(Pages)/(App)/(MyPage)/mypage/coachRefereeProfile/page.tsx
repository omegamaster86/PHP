'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CoachRefereeResponse } from '@/app/types';

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

type Qualification = {
  id: number;
  label: string;
  isValid?: boolean;
  expiryDate: string;
};

  // 2ヶ月以内かどうか判定
  const isWithinTwoMonths = (expiryDate: Date): boolean => {
    const today = new Date();
    const twoMonthsBeforeExpiry = addMonths(expiryDate, -2);
    return (
      isAfter(today, twoMonthsBeforeExpiry) || isEqual(today, twoMonthsBeforeExpiry)
    );
  };

const qualificationToolTipText = (item: Qualification): string => {
  if (!item.expiryDate) return '無期限で有効です。';
  return `有効期限は ${formatDate(item.expiryDate, 'yyyy/MM/dd')} です。`;
};

const QualificationItem: React.FC<{ item: Qualification }> = ({ item }) => {
  const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
  const toolTipText = qualificationToolTipText(item);

  return (
    <ToolTip toolTipText={toolTipText}>
      <div className='relative'>
        <RoundedBadge label={item.label} isValid={expiryDate ? expiryDate > new Date() : true} />
        {expiryDate && isWithinTwoMonths(expiryDate) && (
          <WarningAmberIcon className='text-systemWarningText text-lg bg-white -translate-y-1/2 absolute -right-3' />
        )}
      </div>
    </ToolTip>
  );
};

export default function CoachRefereeProfile() {
  const router = useRouter();
  const EditButton = (
    <TitleSideButton
      // FIXME リンク先のURLを修正する
      href='/user-information-edit'
      icon={EditIcon}
      text='編集'
    />
  );

  const { data } = useSWR(
    {
      url: `/getUserData?userId`,
    },
    fetcher<CoachRefereeResponse>,
    {
      onSuccess: (data) => {
        // FIXME リンク先のURLを修正する(結合時)
        if (!data.result) {
          router.push('/mypage/coachRefereeProfile');
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

  const mockData = [
    {
      period: '2022年4月 - 2023年3月',
      organization: '東京スポーツクラブ',
      staffType: 'コーチ',
    },
    {
      period: '2021年6月 - 2022年3月',
      organization: '大阪アスリート協会',
      staffType: 'アシスタントコーチ',
    },
    {
      period: '2020年4月 - 2021年5月',
      organization: '福岡フィットネスセンター',
      staffType: 'トレーナー',
    },
  ];

  const qualifications = [
    { id: 1,  label: 'テスト1', expiryDate: '2023-12-01' },
    { id: 2, label: 'テスト2', expiryDate: '2025-01-09' },
  ];

  const refereeQualifications = [
    { id: 1, label: 'テスト3', expiryDate: '2023-12-01' },
    { id: 2, label: 'テスト4', expiryDate: '2024-12-01' },
    { id: 3, label: 'ローイングコーチ', expiryDate: '2025-12-01' },
  ];

  return (
    <>
      {/* スマホ画面で表示 */}
      <div className='mb-4 md:hidden'>
        <div className='flex justify-between mb-5'>
          <CustomTitle displayBack={false}>指導者・審判プロフィール</CustomTitle>
          <div className='flex items-center'>{EditButton}</div>
        </div>
        <div className='font-bold text-xl'>{profile.user_name}</div>
      </div>
      {/* スマホ画面以外で表示 */}
      <div className='hidden md:flex justify-between items-center mb-4'>
        <h2 className='font-bold text-3xl'>{profile.user_name}</h2>
        {EditButton}
      </div>

      <div className='flex flex-col text-xs sm:text-sm'>
        <h3 className='mb-3 font-bold'>指導履歴</h3>
        <div className='overflow-auto mb-7 '>
          {mockData && mockData.length > 0 ? (
            <CustomTable>
              <CustomThead>
                <CustomTr>
                  <CustomTh align='left'>指導期間</CustomTh>
                  <CustomTh align='left'>団体名</CustomTh>
                  <CustomTh align='left'>スタッフ種別</CustomTh>
                </CustomTr>
              </CustomThead>
              <CustomTbody>
                {mockData.map((item, index) => (
                  <CustomTr key={index}>
                    <CustomTd>
                      <span>{item.period}</span>
                    </CustomTd>
                    <CustomTd>
                      <span>{item.organization}</span>
                    </CustomTd>
                    <CustomTd>
                      <span>{item.staffType}</span>
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
          <span>JSPO ID</span>
          {/* FIXME バックエンドとの結合 */}
          <span>1234</span>
        </div>
        <div className='flex flex-wrap gap-3 mb-7'>
          {qualifications.length > 0 ? (
            qualifications.map((item) => <QualificationItem key={item.id} item={item} />)
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
          {refereeQualifications.length > 0 ? (
            refereeQualifications.map((item) => <QualificationItem key={item.id} item={item} />)
          ) : (
            <span>審判資格がありません。</span>
          )}
        </div>
      </div>
    </>
  );
}
