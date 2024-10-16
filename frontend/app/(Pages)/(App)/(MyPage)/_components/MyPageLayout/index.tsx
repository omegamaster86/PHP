'use client';

import MyPageSideBar, {
  MyPageSideBarUser,
  type MyPageSideBarListItem,
} from '@/app/(Pages)/(App)/(MyPage)/_components/MyPageSideBar';
import { PersonOutlineOutlined, TextSnippetOutlined } from '@mui/icons-material';
import { NextPage } from 'next';
import { usePathname } from 'next/navigation';
import MyPageScrollBar from '../MyPageScrollBar';

type Props = {
  children?: React.ReactNode;
};

const MyPageLayout: NextPage<Props> = (props) => {
  const { children } = props;
  const pathname = usePathname();

  // TODO: 後で差し替える
  const user: MyPageSideBarUser = {
    name: '山田太郎',
    tags: ['管理者', 'JARA', '県ボ職員', '団体管理者', '選手', 'ボランティア', '観客'],
    avatarUrl: undefined,
  };

  const routerStatuses = {
    officialTournament: pathname === '/mypage/tournament/official',
    unofficialTournament: pathname === '/mypage/tournament/unofficial',
    officialRowingHistory: pathname === '/mypage/raceResult/official',
    unofficialRowingHistory: pathname === '/mypage/raceResult/unofficial',
    athleteProfile: pathname === '/mypage/playerProfile',
    volunteer: pathname === '/mypage/volunteer',
    profile: pathname === '/mypage/profile',
  };

  const listItems: MyPageSideBarListItem[] = [
    {
      title: '大会情報',
      icon: <TextSnippetOutlined />,
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
      icon: <TextSnippetOutlined />,
      active: routerStatuses.officialRowingHistory || routerStatuses.unofficialRowingHistory,
      items: [
        {
          title: '公式大会',
          link: '/mypage/raceResult/official',
          active: routerStatuses.officialRowingHistory,
        },
        {
          title: '非公式大会',
          link: '/mypage/raceResult/unofficial',
          active: routerStatuses.unofficialRowingHistory,
        },
      ],
    },
    {
      title: '選手プロフィール',
      icon: <TextSnippetOutlined />,
      link: '/mypage/playerProfile',
      active: routerStatuses.athleteProfile,
    },
    {
      title: 'ボランティア',
      icon: <TextSnippetOutlined />,
      link: '/mypage/volunteer',
      active: routerStatuses.volunteer,
    },
    {
      title: 'プロフィール',
      icon: <PersonOutlineOutlined />,
      link: '/mypage/profile',
      active: routerStatuses.profile,
    },
  ];

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
      <div className='flex-1 bg-white p-6 md:ml-64'>{children}</div>
    </div>
  );
};

export default MyPageLayout;
