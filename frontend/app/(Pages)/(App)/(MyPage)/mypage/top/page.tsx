'use client';

import NotificationsList from '@/app/components/NotificationsList';
import { useUserType } from '@/app/hooks/useUserType';
import { fetcher } from '@/app/lib/swr';
import { TopPageCountResponse } from '@/app/types';
import useSWR from 'swr';
import YourInformation from './_components/YourInformation';

const TopPage = () => {
  const userType = useUserType();
  const { data: summaryCount } = useSWR(
    {
      url: `api/getTopPageSummaryCount`,
    },
    fetcher<TopPageCountResponse>,
  );

  if (!summaryCount) {
    return null;
  }

  return (
    <>
      <h2 className='text-lg pl-3 border-l-[6px] border-x-primary-300 mb-3 md:text-xl'>
        あなたの情報
      </h2>
      <div className='flex border border-border py-2 mb-12'>
        <YourInformation title={'出場した大会'} number={summaryCount.result.raceCount} />
        <div className='w-[1px] bg-border'></div>
        <YourInformation title={'選手フォロー数'} number={summaryCount.result.followPlayerCount} />
        {userType.isPlayer && (
          <>
            <div className='w-[1px] bg-border'></div>
            <YourInformation
              title={'フォロワー数'}
              number={summaryCount.result.followedPlayerCount}
            />
          </>
        )}
        <div className='w-[1px] bg-border'></div>
        <YourInformation
          title={'大会フォロー数'}
          number={summaryCount.result?.followedTournCount}
        />
      </div>
      <h2 className='text-lg font pl-3 border-l-[6px] border-x-primary-300 mb-5 md:text-xl'>
        最近のお知らせ
      </h2>
      <NotificationsList />
    </>
  );
};

export default TopPage;
