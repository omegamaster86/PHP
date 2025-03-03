import { CustomUserAvatar } from '@/app/components/CustomUserAvatar';
import { useAuth } from '@/app/hooks/auth';
import axios from '@/app/lib/axios';
import { fetcher } from '@/app/lib/swr';
import type { NotificationUnreadCount, UserIdType, UserResponse } from '@/app/types';
import { CloseOutlined, MailOutline, MenuOutlined, PersonOutlined } from '@mui/icons-material';
import {
  Badge,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  Menu,
  MenuItem,
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type FC, type MouseEvent } from 'react';
import useSWRImmutable from 'swr/immutable';
import NestedItem from '../../(Pages)/(App)/(MyPage)/_components/MyPageSideBar/NestedItem';
import Logo from '../Logo';
import MenuButton from '../MenuButton';
import './Header.css';

const headerRoutesForTempPassword = ['/passwordchange'];

type MenuItemChild = {
  title: string;
  link: string;
  action?: () => void;
  icon?: JSX.Element;
  show: boolean;
  active?: boolean;
};

type MenuItem = {
  title: string;
  index: number;
  link?: string;
  icon?: JSX.Element;
  active: boolean;
  show: boolean;
  items?: MenuItemChild[];
};

const Header: FC = () => {
  const router = useRouter();
  const page = usePathname();
  const { user, logout } = useAuth({ middleware: 'auth' });
  const unreadCount = useSWRImmutable(
    { url: '/api/unreadCount' },
    fetcher<NotificationUnreadCount>,
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpenOpen] = useState(false);
  const [clickIndex, setClickIndex] = useState(0);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [userIdType, setUserIdType] = useState({} as UserIdType); //ユーザIDに紐づいた情報

  const open = Boolean(anchorEl);
  const username = user?.user_name;
  const hasNotifications = Number(unreadCount.data?.result.unreadCount ?? 0) > 0;

  // メニューを開く
  const handleClick = (event: MouseEvent<HTMLButtonElement>, clickIndex: number) => {
    setAnchorEl(event.currentTarget);
    setClickIndex(clickIndex); //メニューのカテゴリのindexが入る（大会、選手、団体、ボランティア、その他）
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setDrawerOpenOpen(newOpen);
  };

  // メニューを閉じる
  const handleClose = () => {
    setAnchorEl(null);
  };

  // ページによってindexを変更
  const handleIndex = () => {
    switch (page) {
      case '/tournament':
      case '/tournamentRef':
      case '/tournamentSearch':
      case '/tournamentRaceResultRef':
        setCurrentIndex(0);
        break;
      case '/playerInformation':
      case '/playerInformationRef':
      case '/playerRaceResultRegister':
      case '/playerSearch':
        setCurrentIndex(1);
        break;
      case '/team':
      case '/teamRef':
      case '/teamSearch':
        setCurrentIndex(2);
        break;
      case '/volunteerSearch':
      case '/volunteerInformationRef':
        setCurrentIndex(3);
        break;
      case '/ticketBulkRegister':
      case '/donationBulkRegister':
      case '/userInformation':
        setCurrentIndex(6);
        break;
      default:
        setCurrentIndex(999);
        break;
    }

    if (page.startsWith('/notification')) {
      setCurrentIndex(4);
      return;
    }
    if (page.startsWith('/mypage')) {
      setCurrentIndex(5);
      return;
    }
  };

  //ユーザIDに紐づいた情報の取得 20240221
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<{ result: UserResponse }>('api/user');
        //ユーザ情報が存在し、仮パスワードフラグが0の場合ヘッダーメニューを表示 20240403
        if (Object.keys(response.data.result).length > 0) {
          if (response.data.result.temp_password_flag == 0) {
            setShowHeaderMenu(true);
          } else {
            const showHeader = headerRoutesForTempPassword.includes(page);
            setShowHeaderMenu(showHeader);
          }
          const playerInf = await axios.get('api/getIDsAssociatedWithUser');
          setUserIdType(playerInf.data.result[0]); //ユーザIDに紐づいた情報 20240222
        } else {
          setShowHeaderMenu(false);
        }
      } catch (error: any) {}
    };
    fetchData();
    handleIndex();
  }, [page]);

  const menuItems: MenuItem[] = [
    {
      title: '大会情報',
      index: 0,
      active: currentIndex === 0,
      show: true,
      items: [
        {
          title: '大会検索',
          link: '/tournamentSearch',
          show: true,
        },
        {
          title: 'レース結果管理',
          link: '/tournamentResultManagement',
          show:
            userIdType.is_administrator == 1 ||
            userIdType.is_jara == 1 ||
            userIdType.is_pref_boat_officer == 1 ||
            userIdType.is_organization_manager == 1,
        },
        {
          title: '大会登録',
          link: '/tournament?mode=create',
          show:
            userIdType.is_administrator == 1 ||
            userIdType.is_jara == 1 ||
            userIdType.is_pref_boat_officer == 1 ||
            userIdType.is_organization_manager == 1,
        },
        {
          title: 'レース結果情報一括登録',
          link: '/tournamentResultInfomationBulkRegister',
          show:
            userIdType.is_administrator == 1 ||
            userIdType.is_jara == 1 ||
            userIdType.is_pref_boat_officer == 1 ||
            userIdType.is_organization_manager == 1,
        },
        {
          title: '大会エントリー一括登録',
          link: '/tournamentEntryBulkRegister',
          show:
            userIdType.is_administrator == 1 ||
            userIdType.is_jara == 1 ||
            userIdType.is_pref_boat_officer == 1 ||
            userIdType.is_organization_manager == 1,
        },
      ],
    },
    {
      title: '選手情報',
      index: 1,
      active: currentIndex === 1,
      show: true,
      items: [
        {
          title: '選手検索',
          link: '/playerSearch',
          show: true,
        },
        {
          title: '選手登録',
          link: '/playerInformation?mode=create',
          show:
            userIdType.is_player == 0 &&
            (userIdType.is_jara == 1 ||
              userIdType.is_pref_boat_officer == 1 ||
              userIdType.is_organization_manager == 1 ||
              userIdType.is_volunteer == 1 ||
              userIdType.is_audience == 1),
        },
        {
          title: '選手情報更新',
          link: '/playerInformation?mode=update&player_id=' + userIdType.player_id,
          show: userIdType.is_player == 1,
        },
        {
          title: '選手情報参照',
          link: '/playerInformationRef?player_id=' + userIdType.player_id,
          show: userIdType.is_player == 1,
        },
        {
          title: '選手情報削除',
          link: '/playerInformationRef?mode=delete&player_id=' + userIdType.player_id,
          show: userIdType.is_player == 1,
        },
        {
          title: '選手情報連携',
          link: '/playerInformationLinking',
          show: userIdType.is_administrator == 1 || userIdType.is_jara == 1,
        },
      ],
    },
    {
      title: '団体',
      index: 2,
      active: currentIndex === 2,
      show: true,
      items: [
        {
          title: '団体検索',
          link: '/teamSearch',
          show: true,
        },
        {
          title: '団体管理',
          link: '/teamManagement',
          show:
            userIdType.is_administrator == 1 ||
            userIdType.is_jara == 1 ||
            userIdType.is_pref_boat_officer == 1 ||
            userIdType.is_organization_manager == 1,
        },
        {
          title: '団体登録',
          link: '/team?mode=create',
          show: true,
        },
        {
          title: '団体所属選手一括登録',
          link: '/teamPlayerBulkRegister',
          show:
            userIdType.is_administrator == 1 ||
            userIdType.is_jara == 1 ||
            userIdType.is_pref_boat_officer == 1 ||
            userIdType.is_organization_manager == 1,
        },
      ],
    },
    {
      title: 'ボランティア',
      index: 3,
      active: currentIndex === 3,
      show: true,
      items: [
        {
          title: 'ボランティア検索',
          link: '/volunteerSearch',
          show:
            userIdType.is_administrator == 1 ||
            userIdType.is_jara == 1 ||
            userIdType.is_pref_boat_officer == 1,
        },
        {
          title: 'ボランティア情報参照',
          link: '/volunteerInformationRef?volunteer_id=' + userIdType.volunteer_id,
          show: userIdType.is_volunteer == 1,
        },
        {
          title: 'ボランティア一括登録',
          link: '/volunteerBulkRegister',
          show: userIdType.is_administrator == 1 || userIdType.is_jara == 1,
        },
      ],
    },
    {
      title: 'お知らせ',
      index: 4,
      show: true,
      active: currentIndex === 4,
      items: [
        {
          title: '通知登録',
          link: '/notification?mode=create',
          active: page === '/notification',
          show: true,
        },
        {
          title: '受信通知一覧',
          link: '/notifications/received',
          show: true,
        },
        {
          title: '送信通知一覧',
          link: '/notifications/sent',
          show: true,
        },
      ],
    },
    {
      title: 'マイページ',
      index: 5,
      link: '/mypage/top',
      show: true,
      active: currentIndex === 5,
    },
    {
      title: 'その他',
      index: 6,
      active: currentIndex === 6,
      show: true,
      items: [
        {
          title: 'チケット購入履歴一括登録',
          link: '/ticketBulkRegister',
          show:
            userIdType.is_administrator == 1 ||
            userIdType.is_jara == 1 ||
            userIdType.is_pref_boat_officer == 1,
        },
        {
          title: '寄付履歴一括登録',
          link: '/donationBulkRegister',
          show:
            userIdType.is_administrator == 1 ||
            userIdType.is_jara == 1 ||
            userIdType.is_pref_boat_officer == 1,
        },
        {
          title: 'ユーザー情報更新',
          link: '/userInformation?mode=update',
          show: userIdType.is_audience == 1,
        },
        {
          title: 'パスワード変更',
          link: '/passwordchange',
          show: userIdType.is_audience == 1,
        },
        {
          title: 'ログアウト',
          link: '',
          show: true,
          action: () => {
            logout();
          },
        },
        {
          title: '退会',
          link: '/withdrawal',
          show: userIdType.is_audience == 1,
        },
      ],
    },
  ] as const;

  const DrawerList = (
    <List sx={{ minWidth: '280px', paddingX: '8px' }}>
      <ListItem
        component='button'
        onClick={toggleDrawer(false)}
        sx={{ justifyContent: 'flex-end' }}
      >
        <ListItemIcon sx={{ justifyContent: 'flex-end' }}>
          <CloseOutlined />
        </ListItemIcon>
      </ListItem>

      <div className='flex flex-row p-3 gap-2'>
        <CustomUserAvatar fileName={user?.photo ?? undefined} />
        <h2 className='text-normal font-semibold flex items-center'>{username}</h2>
      </div>

      <div className='flex flex-col'>
        {menuItems.map((item) => {
          if (!item.show) {
            return null;
          }

          const filteredChildren = item.items?.filter((x) => x.show) ?? [];

          return (
            <NestedItem
              key={item.index}
              item={{
                title: item.title,
                link: item.link,
                action: toggleDrawer(false),
                active: item.active,
                items: filteredChildren.map((x) => ({
                  title: x.title,
                  link: x.link,
                  show: x.show,
                  active: x.active ?? x.link === page,
                  action: x.action,
                })),
              }}
            />
          );
        })}
      </div>
    </List>
  );

  const childMenuItems = menuItems[clickIndex].items ?? [];

  return (
    <>
      <div className='flex flex-row'>
        {!!childMenuItems.length && (
          <Menu
            id='basic-menu'
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            {childMenuItems.map(
              (item) =>
                item.show && (
                  <MenuItem
                    key={item.title}
                    onClick={() => {
                      router.push(item.link);
                      item.action?.();
                      handleClose();
                    }}
                  >
                    {item.title}
                  </MenuItem>
                ),
            )}
          </Menu>
        )}
      </div>
      <header className='bg-primary-500 h-[60px] w-full flex justify-between px-[20px]'>
        <Logo />
        {showHeaderMenu && (
          <div className='right-content'>
            {/* スマホの場合は表示 */}
            <div className='flex justify-center items-center h-full md:hidden'>
              <IconButton onClick={toggleDrawer(true)}>
                <MenuOutlined
                  sx={{
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                />
              </IconButton>
              <Drawer open={drawerOpen} onClose={toggleDrawer(false)} anchor='right'>
                {DrawerList}
              </Drawer>
            </div>
          </div>
        )}
      </header>

      {showHeaderMenu ? (
        // スマホの場合は非表示
        <div className='w-full hidden md:block'>
          <div className='flex flex-row justify-start items-center h-[50px] gap-[40px] px-[104px] text-small text-secondaryText'>
            <div className='flex flex-row justify-between w-full'>
              {/* メニュー左側 */}
              <div className='flex flex-row'>
                <div>
                  <MenuButton active={currentIndex === 0} onClick={(e) => handleClick(e, 0)}>
                    大会情報
                  </MenuButton>
                </div>
                <div>
                  <MenuButton active={currentIndex === 1} onClick={(e) => handleClick(e, 1)}>
                    選手情報
                  </MenuButton>
                </div>
                <div>
                  <MenuButton active={currentIndex === 2} onClick={(e) => handleClick(e, 2)}>
                    団体
                  </MenuButton>
                </div>
                {userIdType.is_administrator == 1 ||
                userIdType.is_jara == 1 ||
                userIdType.is_pref_boat_officer == 1 ||
                userIdType.is_volunteer == 1 ? (
                  <div>
                    <MenuButton active={currentIndex === 3} onClick={(e) => handleClick(e, 3)}>
                      ボランティア
                    </MenuButton>
                  </div>
                ) : (
                  ''
                )}
                <div>
                  <MenuButton active={currentIndex === 6} onClick={(e) => handleClick(e, 6)}>
                    その他
                  </MenuButton>
                </div>
              </div>

              {/* メニュー右側 */}
              <div className='flex'>
                <MenuButton
                  active={currentIndex === 4}
                  onClick={(e) => {
                    handleClick(e, 4);
                  }}
                >
                  <Badge
                    color='error'
                    variant={hasNotifications ? 'dot' : 'standard'}
                    sx={{ marginRight: '4px' }}
                  >
                    <MailOutline
                      sx={{
                        fontSize: 18,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    />
                  </Badge>
                  <span>お知らせ</span>
                </MenuButton>
                <MenuButton
                  active={currentIndex === 5}
                  onClick={(e) => {
                    handleClick(e, 5);
                    router.push('/mypage/top');
                  }}
                >
                  <PersonOutlined
                    sx={{
                      fontSize: 18,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: '4px',
                    }}
                  />
                  <span>マイページ</span>
                </MenuButton>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ''
      )}
    </>
  );
};
export default Header;
