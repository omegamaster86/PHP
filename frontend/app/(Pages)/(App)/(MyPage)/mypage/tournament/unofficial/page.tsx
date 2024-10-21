'use client';

import TournamentCardContent from '@/app/(Pages)/(App)/(MyPage)/mypage/tournament/_components/TournamentCardContent';
import { CustomButton } from '@/app/components';
import EmptyScreen from '@/app/components/EmptyScreen';
import LinkCard from '@/app/components/LinkCard';
import { tournType } from '@/app/constants';
import { useInfiniteList } from '@/app/hooks/useInfiniteList';
import { fetcher } from '@/app/lib/swr';
import { MyPageTournamentInfoData, MyPageTournamentParams } from '@/app/types';
import useSWR from 'swr';

export default function TournamentUnofficial() {
  const myPageTournamentParams: MyPageTournamentParams = {
    tournType: tournType.unofficial,
  };

  const { data, isLoading } = useSWR(
    {
      url: '/getMyPageTournamentInfoList',
      params: myPageTournamentParams,
      key: 'unofficial',
    },
    fetcher<MyPageTournamentInfoData[]>,
  );

  const tournamentItems = data?.result ?? [];
  const { infiniteList, isLastPage, fetchMore } = useInfiniteList(tournamentItems);

  if (!isLoading && !infiniteList.length) {
    return (
      <EmptyScreen message='出漕履歴・予定のある大会、もしくはフォローした大会が表示されます。' />
    );
  }

  return (
    <main>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {infiniteList.map((item) => (
          <LinkCard key={item.tournId} href={`/tournamentRef?tournId=${item.tournId}`}>
            <TournamentCardContent cardItem={item} />
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
