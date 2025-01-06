'use client';

import MyPageSideBar, {
  MyPageSideBarUser,
  type MyPageSideBarListItem,
} from '@/app/(Pages)/(App)/(MyPage)/_components/MyPageSideBar';
import { useUserType } from '@/app/hooks/useUserType';
import { fetcher } from '@/app/lib/swr';
import { MyPageProfileInfoData } from '@/app/types';
import { NextPage } from 'next';
import { usePathname } from 'next/navigation';
import useSWR from 'swr';
import MyPageScrollBar from '../MyPageScrollBar';

type Props = {
  children?: React.ReactNode;
};

const MyPageLayout: NextPage<Props> = (props) => {
  const { children } = props;
  const pathname = usePathname();
  const { data: profile } = useSWR(
    {
      url: 'api/getMyPageProfileList',
    },
    fetcher<MyPageProfileInfoData>,
  );
  const userType = useUserType();

  const user: MyPageSideBarUser = {
    name: profile?.result.userName ?? '',
    tags: profile?.result.userType.filter((x) => !!x.isEnable).map((x) => x.userTypeName) ?? [],
    avatarUrl: profile?.result.photo,
  };

  const routerStatuses = {
    officialTournament: pathname === '/mypage/tournament/official',
    unofficialTournament: pathname === '/mypage/tournament/unofficial',
    officialRaceResult: pathname === '/mypage/raceResult/official',
    unofficialRaceResult: pathname === '/mypage/raceResult/unofficial',
    playerProfile: pathname === '/mypage/playerProfile',
    volunteer: pathname === '/mypage/volunteer',
    profile: pathname === '/mypage/profile',
    coachRefereeProfile: pathname === '/mypage/coachRefereeProfile',
    top: pathname === '/mypage/top',
  };

  const listItems: MyPageSideBarListItem[] = [
    {
      title: 'トップ',
      link: '/mypage/top',
      active: routerStatuses.top,
    },
    {
      title: '大会情報',
      active: routerStatuses.officialTournament || routerStatuses.unofficialTournament,
      items: [
        {
          title: '公式大会',
          link: '/mypage/tournament/official',
          active: routerStatuses.officialTournament,
        },
        {
          title: '非公式大会',
          link: '/mypage/tournament/unofficial',
          active: routerStatuses.unofficialTournament,
        },
      ],
    },
    {
      title: '出漕履歴',
      active: routerStatuses.officialRaceResult || routerStatuses.unofficialRaceResult,
      items: [
        {
          title: '公式大会',
          link: '/mypage/raceResult/official',
          active: routerStatuses.officialRaceResult,
        },
        {
          title: '非公式大会',
          link: '/mypage/raceResult/unofficial',
          active: routerStatuses.unofficialRaceResult,
        },
      ],
    },
    {
      title: '選手プロフィール',
      link: '/mypage/playerProfile',
      active: routerStatuses.playerProfile,
      show: userType?.isPlayer ?? false,
    },
    {
      title: 'ボランティア',
      link: '/mypage/volunteer',
      active: routerStatuses.volunteer,
      show: userType?.isVolunteer ?? false,
    },
    {
      title: 'プロフィール',
      link: '/mypage/profile',
      active: routerStatuses.profile,
    },
    {
      title: '指導者・審判',
      link: '/mypage/coachRefereeProfile',
      active: routerStatuses.coachRefereeProfile,
    },
  ].filter((x) => x.show !== false);

  return (
    <div className='flex flex-col md:flex-row'>
      {/* スマホの場合は表示 */}
      <div className='block md:hidden'>
        <MyPageScrollBar listItems={listItems} />
      </div>

      {/* サイドバー */}
      <div className='hidden md:block'>
        {/* サイドバーの中身 */}
        <MyPageSideBar user={user} listItems={listItems} />
      </div>

      {/* メインコンテンツ */}
      <div className='flex-1 bg-white p-4 sm:p-6'>{children}</div>
    </div>
  );
};

export default MyPageLayout;
