'use client';

import RaceResultCardContent from '@/app/(Pages)/(App)/(MyPage)/mypage/raceResult/_components/RaceResultCardContent';
import { CustomButton } from '@/app/components';
import EmptyScreen from '@/app/components/EmptyScreen';
import LinkCard from '@/app/components/LinkCard';
import { officialType } from '@/app/constants/official';
import { useInfiniteList } from '@/app/hooks/useInfiniteList';
import { fetcher } from '@/app/lib/swr';
import { MyPageRaceResultParams, MyPageRaceResultRecordInfoData } from '@/app/types';
import useSWR from 'swr';

export default function RaceResultUnofficial() {
  const myPageRaceResultParams: MyPageRaceResultParams = {
    official: officialType.unofficial,
  };
  const { data, isLoading } = useSWR(
    {
      url: '/getMyPageRaceResultRecordInfoList',
      params: myPageRaceResultParams,
      key: 'unofficial',
    },
    fetcher<MyPageRaceResultRecordInfoData[]>,
  );

  const raceResultItems = data?.result ?? [];
  const { infiniteList, isLastPage, fetchMore } = useInfiniteList(raceResultItems);

  if (!isLoading && !infiniteList.length) {
    return <EmptyScreen message='出漕履歴がありません。' />;
  }

  return (
    <main>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {infiniteList.map((item) => (
          <LinkCard key={item.raceId} href={`/tournamentRaceResultRef?raceId=${item.raceId}`}>
            <RaceResultCardContent cardItem={item} />
          </LinkCard>
        ))}
      </div>
      {!isLastPage && (
        <div className='flex justify-center mt-4'>
          <CustomButton buttonType='primary-outlined' className='!w-28' onClick={fetchMore}>
            もっと見る
          </CustomButton>
        </div>
      )}
    </main>
  );
}
