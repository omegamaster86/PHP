'use client';

import Info from '@/app/(Pages)/(App)/(MyPage)/_components/Info';
import { TitleSideButton } from '@/app/(Pages)/(App)/_components/TitleSideButton';
import { RoundedBadge } from '@/app/components';
import { fetcher } from '@/app/lib/swr';
import { MyPagePlayerProfileInfoData } from '@/app/types';
import { formatDate } from '@/app/utils/dateUtil';
import { EditOutlined } from '@mui/icons-material';
import { Avatar } from '@mui/material';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

export default function PlayerProfile() {
  const router = useRouter();
  const { data } = useSWR(
    {
      url: 'api/getMyPagePlayerProfileList',
    },
    fetcher<MyPagePlayerProfileInfoData>,
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

  const user = data?.result;

  if (!user) {
    return null;
  }

  const EditButton = (
    <TitleSideButton href='/playerInformation?mode=update' icon={EditOutlined} text='編集' />
  );

  const left = [
    {
      label: '性別',
      value: user.sex,
    },
    {
      label: '身長',
      value: `${user.height}cm`,
    },
  ];

  const right = [
    {
      label: '生年月日',
      value: formatDate(user.dateOfBirth, 'yyyy/MM/dd'),
    },
    {
      label: '体重',
      value: `${user.weight}kg`,
    },
  ];

  const birthPlace = [user.birthCountryName, user.birthPrefectureName].filter((x) => x).join(' ');
  const residence = [user.residenceCountryName, user.residencePrefectureName]
    .filter((x) => x)
    .join(' ');

  return (
    <main>
      <div className='flex flex-col min-[1008px]:flex-row gap-8 m-4 md:m-8'>
        {/* スマホの場合は表示 */}
        <div className='flex justify-between md:hidden'>
          <h2>選手プロフィール</h2>
          {EditButton}
        </div>

        <div className='flex items-center justify-center flex-row gap-2 md:items-start'>
          <Avatar src={user.photo ?? undefined} sx={{ width: 260, height: 260 }} />
        </div>

        <div className='md:max-w-sm'>
          <div className='flex gap-8'>
            <h2 className='text-3xl'>{user.playerName}</h2>
            {/* スマホの場合は非表示 */}
            <div className='hidden md:block'>{EditButton}</div>
          </div>
          <div className='flex gap-4 my-2'>
            <div className='flex gap-2'>
              <span>選手ID:</span>
              <span className='text-gray-300'>{user.playerId}</span>
            </div>
            <div className='flex gap-2'>
              <span>既存選手ID:</span>
              <span className='text-gray-300'>{user.jaraPlayerId}</span>
            </div>
          </div>
          <div className='flex gap-2 items-center'>
            <span>フォロワー:</span>
            <span className='text-gray-300'>{user.followerCount}</span>
          </div>

          <h3 className='my-4'>プロフィール</h3>
          <div className='flex gap-4'>
            <div className='flex flex-col gap-2'>
              {left.map((item) => (
                <Info key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            <div className='flex flex-col gap-2 mb-2'>
              {right.map((item) => (
                <Info key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </div>
          <Info label='出身' value={birthPlace} labelClassName='whitespace-nowrap mb-2' />
          <Info label='居住地' value={residence} labelClassName='whitespace-nowrap' />

          <h3 className='my-4'>サイド情報</h3>
          <div className='flex flex-wrap justify-start gap-2'>
            {user.sideInfo.map((side) => (
              <RoundedBadge
                key={side.sideName}
                label={side.sideName}
                isValid={Boolean(side.isEnable)}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
