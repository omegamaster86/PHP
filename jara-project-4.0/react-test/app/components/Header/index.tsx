import React, { useState, useEffect, FC, MouseEvent } from 'react';
import './Header.css';
import Logo from '../Logo';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, MenuItem, Button } from '@mui/material';
import { useAuth } from '@/app/hooks/auth';
import axios from '@/app/lib/axios';

const Header: FC = () => {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [clickIndex, setclickIndex] = useState(0);

  const [playerId, setPlayerId] = useState<number>(); //選手ID 20240221
  const [volunteerId, setVolunteerId] = useState<number>(); //ボランティアID 20240221

  const [is_administrator, set_is_administrator] = useState<number>(); //管理者権限 20240221
  const [is_jara, set_is_jara] = useState<number>(); //JARA権限 20240221
  const [is_pref_boat_officer, set_is_pref_boat_officer] = useState<number>(); //県ボ権限 20240221  
  const [is_organization_manager, set_is_organization_manager] = useState<number>(); //団体管理者権限 20240221
  const [is_player, set_is_player] = useState<number>(); //選手権限 20240221
  const [is_volunteer, set_is_volunteer] = useState<number>(); //ボランティア権限 20240221
  const [is_audience, set_is_audience] = useState<number>(); //一般権限 20240221

  // メニューを開く
  const handleClick = (event: MouseEvent<HTMLButtonElement>, clickIndex: number) => {
    setAnchorEl(event.currentTarget);
    setclickIndex(clickIndex); //メニューのカテゴリのindexが入る（大会、選手、団体、ボランティア、その他）
  };

  // メニューを閉じる
  const handleClose = () => {
    setAnchorEl(null);
  };

  const page = usePathname();

  // ページによってindexを変更
  const handleIndex = () => {
    switch (page) {
      case '/tournament':
      case '/tournamentRef':
      case '/tournamentSearch':
      case '/tournamentRaceResultRef':
        setIndex(0);
        break;
      case '/playerInformation':
      case '/playerInformationRef':
      case '/playerRaceResultRegister':
      case '/playerSearch':
        setIndex(1);
        break;
      case '/team':
      case '/teamRef':
      case '/teamSearch':
      case '/team':
        setIndex(2);
        break;
      case '/volunteerSearch':
      case '/volunteerInformationRef':
        setIndex(3);
        break;
      case '/userInformation':
      case '/userInformationRef':
        setIndex(4);
        break;
      default:
        setIndex(5);
        break;
    }
  };

  useEffect(() => {
    handleIndex();
  }, [page]);

  //選手IDに紐づいた情報の取得 20240221
  useEffect(() => {
    const fetchData = async () => {
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie')
        await csrf()
        const playerInf = await axios.get('/getIDsAssociatedWithUser');
        console.log(playerInf.data.result[0]);
        setPlayerId(playerInf.data.result[0].player_id);
        setVolunteerId(playerInf.data.result[0].volunteer_id);

        set_is_administrator(playerInf.data.result[0].is_administrator);
        set_is_jara(playerInf.data.result[0].is_jara);
        set_is_pref_boat_officer(playerInf.data.result[0].is_pref_boat_officer);
        set_is_organization_manager(playerInf.data.result[0].is_organization_manager);
        set_is_player(playerInf.data.result[0].is_player);
        set_is_volunteer(playerInf.data.result[0].is_volunteer);
        set_is_audience(playerInf.data.result[0].is_audience);

      } catch (error: any) {
        console.log(error);
      }
    };
    fetchData();
  }, []);


  return (
    <div>
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {/* clickIndexが0の時（大会情報押下時）に表示 */}
        {clickIndex === 0 && (
          <div>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/tournamentSearch');
              }}
              className='text-caption1'
            >
              大会検索
            </MenuItem>
            {(is_administrator == 1
              || is_jara == 1
              || is_pref_boat_officer == 1
              || is_organization_manager == 1) ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  router.push('/DummyMyPage');
                }}
                className='text-caption1'
              >
                大会結果管理
              </MenuItem>
            ) : ''}

            {(is_administrator == 1
              || is_jara == 1
              || is_pref_boat_officer == 1
              || is_organization_manager == 1) ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  router.push('/tournament?mode=create');
                }}
                className='text-caption1'
              >
                大会登録
              </MenuItem>
            ) : ''}
            {(is_administrator == 1
              || is_jara == 1
              || is_pref_boat_officer == 1
              || is_organization_manager == 1) ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  router.push('/DummyMyPage');
                }}
                className='text-caption1'
              >
                大会結果情報一括登録
              </MenuItem>
            ) : ''}
            {(is_administrator == 1
              || is_jara == 1
              || is_pref_boat_officer == 1
              || is_organization_manager == 1) ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  router.push('/DummyMyPage');
                }}
                className='text-caption1'
              >
                大会エントリー一括登録
              </MenuItem>
            ) : ''}
          </div>
        )}
        {/* clickIndexが1の時（選手情報押下時）に表示 */}
        {clickIndex === 1 && (
          <div>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/playerSearch');
              }}
              className='text-caption1'
            >
              選手検索
            </MenuItem>
            {(is_jara == 1
              || is_pref_boat_officer == 1
              || is_organization_manager == 1
              || is_volunteer == 1
              || is_audience == 1) ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  router.push('/playerInformation?mode=create');
                }}
                className='text-caption1'
              >
                選手登録
              </MenuItem>
            ) : ''}
            {is_player == 1 ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  const urlStr = '/playerInformation?mode=update' + '&player_id=' + playerId;
                  router.push(urlStr);
                }}
                className='text-caption1'
              >
                選手情報更新
              </MenuItem>
            ) : ''}
            {is_player == 1 ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  const urlStr = '/playerInformationRef' + '?player_id=' + playerId;
                  router.push(urlStr);
                  // router.push('/playerInformation?mode=create');
                }}
                className='text-caption1'
              >
                選手情報参照
              </MenuItem>
            ) : ''}
            {is_player == 1 ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  const urlStr = '/playerInformationRef?mode=delete' + '&player_id=' + playerId;
                  router.push(urlStr);
                  // router.push('/playerInformation?mode=create');
                }}
                className='text-caption1'
              >
                選手情報削除
              </MenuItem>
            ) : ''}
            {(is_administrator == 1 || is_jara == 1) ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  router.push('/playerInformation?mode=create');
                }}
                className='text-caption1'
              >
                選手一括登録
              </MenuItem>
            ) : ''}
          </div>
        )}
        {/* clickIndexが2の時（団体押下時）に表示 */}
        {clickIndex === 2 && (
          <div>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/teamSearch');
              }}
              className='text-caption1'
            >
              団体検索
            </MenuItem>
            {(is_administrator == 1 || is_organization_manager == 1) ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  router.push('/teamManagement');
                }}
                className='text-caption1'
              >
                団体管理
              </MenuItem>
            ) : ''}
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/team?mode=create');
              }}
              className='text-caption1'
            >
              団体登録
            </MenuItem>
            {is_administrator == 1 ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  router.push('/teamPlayerBulkRegister');
                }}
                className='text-caption1'
              >
                団体選手一括登録
              </MenuItem>
            ) : ''}
          </div>
        )}
        {/* clickIndexが3の時（ボランティア押下時）に表示 */}
        {clickIndex === 3 && (
          <div>
            {(is_administrator == 1 || is_jara == 1 || is_pref_boat_officer == 1) ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  router.push('/volunteerSearch');
                }}
                className='text-caption1'
              >
                ボランティア検索
              </MenuItem>
            ) : ''}
            {is_volunteer == 1 ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  const urlStr = '/volunteerInformationRef' + '?volunteer_id=' + volunteerId;
                  router.push(urlStr);
                  // router.push('/volunteerInformationRef');
                }}
                className='text-caption1'
              >
                ボランティア情報参照
              </MenuItem>
            ) : ''}
            {is_volunteer == 1 ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  const urlStr = '/volunteerInformationRef?mode=delete' + '&volunteer_id=' + volunteerId;
                  router.push(urlStr);
                  // router.push('/volunteerSearch');
                }}
                className='text-caption1'
              >
                ボランティア情報削除
              </MenuItem>
            ) : ''}

            {(is_administrator == 1 || is_jara == 1) ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  router.push('/DummyMyPage');
                }}
                className='text-caption1'
              >
                ボランティア一括登録
              </MenuItem>
            ) : ''}
          </div>
        )}
        {/* clickIndexが4の時（その他押下時）に表示 */}
        {clickIndex === 4 && (
          <div>
            {is_audience == 1 ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  router.push('/userInformation?mode=update');
                }}
                className='text-caption1'
              >
                ユーザ情報更新
              </MenuItem>
            ) : ''}
            {is_audience == 1 ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  router.push('/userInformationRef');
                }}
                className='text-caption1'
              >
                ユーザ情報参照
              </MenuItem>
            ) : ''}
            {is_audience == 1 ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  router.push('/userInformationRef?mode=delete');
                }}
                className='text-caption1'
              >
                ユーザ情報削除
              </MenuItem>
            ) : ''}
            {is_audience == 1 ? (
              <MenuItem
                onClick={(e) => {
                  handleClose();
                  router.push('/passwordchange');
                }}
                className='text-caption1'
              >
                パスワード変更
              </MenuItem>
            ) : ''}
            <MenuItem
              onClick={(e) => {
                handleClose();
                //ログアウト処理 残件
              }}
              className='text-caption1'
            >
              ログアウト
            </MenuItem>
          </div>
        )}
      </Menu>
      <header className='bg-primary-500 h-[60px] w-full flex justify-start px-[20px]'>
        <Logo />
        <div className='right-content'></div>
      </header>
      <div className='w-full'>
        <div className='flex flex-row justify-start items-center h-[50px] gap-[40px] px-[104px] text-small text-secondaryText'>
          <div>
            <button
              className={`
              ${index === 0 &&
                'border-b-[2px] rounded-none border-solid border-primary-500 text-primary-500'
                }
              flex justify-center items-center h-[49px] cursor-pointer w-[100px] 
              `}
              onClick={(e) => {
                handleClick(e, 0);
              }}
            >
              大会情報
            </button>
          </div>
          <div>
            <button
              onClick={(e) => {
                handleClick(e, 1);
              }}
              className={`
              ${index === 1 &&
                'border-b-[2px] rounded-none border-solid border-primary-500 text-primary-500'
                }
              flex justify-center items-center h-[49px] w-[100px] cursor-pointer
              `}
            >
              選手情報
            </button>
          </div>
          <div>
            <button
              onClick={(e) => {
                handleClick(e, 2);
              }}
              className={`
              ${index === 2 &&
                'border-b-[2px] rounded-none border-solid border-primary-500 text-primary-500'
                }
              flex justify-center items-center h-[49px] w-[100px] cursor-pointer
              `}
            >
              団体
            </button>
          </div>
          <div>
            <button
              onClick={(e) => {
                handleClick(e, 3);
              }}
              className={`
              ${index === 3 &&
                'border-b-[2px] rounded-none border-solid border-primary-500 text-primary-500'
                }
              flex justify-center items-center h-[49px] w-[100px] cursor-pointer
              `}
            >
              ボランティア
            </button>
          </div>
          <div>
            <button
              onClick={(e) => {
                handleClick(e, 4);
              }}
              className={`
              ${index === 4 &&
                'border-b-[2px] rounded-none border-solid border-primary-500 text-primary-500'
                }
              flex justify-center items-center h-[49px] w-[100px] cursor-pointer
              `}
            >
              その他
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
