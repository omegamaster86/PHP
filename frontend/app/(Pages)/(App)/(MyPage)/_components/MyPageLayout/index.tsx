'use client';

import MyPageSideBar, {
  MyPageSideBarUser,
  type MyPageSideBarListItem,
} from '@/app/(Pages)/(App)/(MyPage)/_components/MyPageSideBar';
import { useUserType } from '@/app/hooks/useUserType';
import { NextPage } from 'next';
import { usePathname } from 'next/navigation';
import MyPageScrollBar from '../MyPageScrollBar';

type Props = {
  children?: React.ReactNode;
};

const MyPageLayout: NextPage<Props> = (props) => {
  const { children } = props;
  const pathname = usePathname();

  const userType = useUserType();

  // TODO: 後で差し替える
  const user: MyPageSideBarUser = {
    name: '山田太郎',
    tags: ['管理者', 'JARA', '県ボ職員', '団体管理者', '選手', 'ボランティア', '観客'],
    avatarUrl: undefined,
  };

  const routerStatuses = {
    officialTournament: pathname === '/mypage/tournament/official',
    unofficialTournament: pathname === '/mypage/tournament/unofficial',
    officialRaceResult: pathname === '/mypage/raceResult/official',
    unofficialRaceResult: pathname === '/mypage/raceResult/unofficial',
    playerProfile: pathname === '/mypage/playerProfile',
    volunteer: pathname === '/mypage/volunteer',
    profile: pathname === '/mypage/profile',
  };

  const listItems: MyPageSideBarListItem[] = [
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
    },
    {
      title: 'プロフィール',
      link: '/mypage/profile',
      active: routerStatuses.profile,
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
      <div className='flex-1 bg-white p-6'>{children}</div>
    </div>
  );
};

export default MyPageLayout;
