'use client';

import TournamentCardContent, {
  TournamentCardItem,
} from '@/app/(Pages)/(App)/(MyPage)/_components/TournamentCardContent';
import { CustomButton } from '@/app/components';
import LinkCard from '@/app/components/LinkCard';

export default function TournamentOfficial() {
  const items: TournamentCardItem[] = [
    {
      id: 1,
      title: '大会名',
      tags: ['公式', 'チケット購入済み'],
      date: '2022-01-01',
      venue: '海の森水上競技場',
      host: '日本ローイング協会',
    },
    {
      id: 2,
      title: '大会名',
      tags: ['公式'],
      date: '2022-01-01',
      venue: '海の森水上競技場',
      host: '日本ローイング協会',
    },
    {
      id: 3,
      title: '大会名',
      tags: ['公式'],
      date: '2022-01-01',
      venue: '海の森水上競技場',
      host: '日本ローイング協会',
    },
    {
      id: 4,
      title: '大会名',
      tags: ['公式'],
      date: '2022-01-01',
      venue: '海の森水上競技場',
      host: '日本ローイング協会',
    },
    {
      id: 5,
      title: '大会名',
      tags: ['公式'],
      date: '2022-01-01',
      venue: '海の森水上競技場',
      host: '日本ローイング協会',
    },
    {
      id: 6,
      title: '大会名',
      tags: ['公式'],
      date: '2022-01-01',
      venue: '海の森水上競技場',
      host: '日本ローイング協会',
    },
    {
      id: 7,
      title: '大会名',
      tags: ['公式'],
      date: '2022-01-01',
      venue: '海の森水上競技場',
      host: '日本ローイング協会',
    },
    {
      id: 8,
      title: '大会名',
      tags: ['公式'],
      date: '2022-01-01',
      venue: '海の森水上競技場',
      host: '日本ローイング協会',
    },
    {
      id: 9,
      title: '大会名',
      tags: ['公式'],
      date: '2022-01-01',
      venue: '海の森水上競技場',
      host: '日本ローイング協会',
    },
    {
      id: 10,
      title: '大会名',
      tags: ['公式'],
      date: '2022-01-01',
      venue: '海の森水上競技場',
      host: '日本ローイング協会',
    },
  ];

  const fetchMore = () => {
    console.log('fetch more');
  };

  return (
    <main>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {items.map((item) => (
          <LinkCard key={item.id} href={`/tournamentRef?tournId=${item.id}`}>
            <TournamentCardContent cardItem={item} />
          </LinkCard>
        ))}
      </div>
      <div className='flex justify-center mt-4'>
        <CustomButton buttonType='primary-outlined' className='!w-28' onClick={fetchMore}>
          もっと見る
        </CustomButton>
      </div>
    </main>
  );
}
