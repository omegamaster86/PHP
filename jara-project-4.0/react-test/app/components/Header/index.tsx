import React, { useState, useEffect, FC, MouseEvent } from 'react';
import './Header.css';
import Logo from '../Logo';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, MenuItem, Button } from '@mui/material';
import { useAuth } from '@/app/hooks/auth';

const Header: FC = () => {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [clickIndex, setclickIndex] = useState(0);

  // const raceId = searchParams.get('raceId')?.toString() || '';
  const playerId = 1;
  const [player_id, setRaceId] = useState<any>({
    player_id: playerId,
  });

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
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/tournamentSearch');
              }}
              className='text-caption1'
            >
              大会結果管理
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/tournament?mode=create');
              }}
              className='text-caption1'
            >
              大会登録
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/tournamentSearch');
              }}
              className='text-caption1'
            >
              大会結果情報一括登録
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/tournamentSearch');
              }}
              className='text-caption1'
            >
              大会エントリー一括登録
            </MenuItem>
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
            <MenuItem
              onClick={(e) => {
                handleClose();
                // router.push('/playerInformation?mode=update?player_id=' + player_id);
                const urlStr = '/playerInformation?mode=update' + '?player_id=' + player_id;
                // const urlStr = '/playerInformation?mode=update' + '&player_id=' + '1';
                console.log(urlStr);
                // router.push('/playerInformation?mode=update');
                router.push(urlStr);
              }}
              className='text-caption1'
            >
              選手情報更新
            </MenuItem>

            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/playerInformation?mode=create');
              }}
              className='text-caption1'
            >
              選手登録
            </MenuItem>

            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/playerInformation?mode=create');
              }}
              className='text-caption1'
            >
              選手情報参照
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/playerInformation?mode=create');
              }}
              className='text-caption1'
            >
              選手情報削除
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/playerInformation?mode=create');
              }}
              className='text-caption1'
            >
              選手一括登録
            </MenuItem>
            
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
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/teamSearch');
              }}
              className='text-caption1'
            >
              団体管理
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/team?mode=create');
              }}
              className='text-caption1'
            >
              団体登録
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/teamSearch');
              }}
              className='text-caption1'
            >
              団体選手一括登録
            </MenuItem>
          </div>
        )}
        {/* clickIndexが3の時（ボランティア押下時）に表示 */}
        {clickIndex === 3 && (
          <div>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/volunteerSearch');
              }}
              className='text-caption1'
            >
              ボランティア検索
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/volunteerSearch');
              }}
              className='text-caption1'
            >
              ボランティア情報参照
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/volunteerSearch');
              }}
              className='text-caption1'
            >
              ボランティア情報削除
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/volunteerSearch');
              }}
              className='text-caption1'
            >
              ボランティア一括登録
            </MenuItem>
          </div>
        )}
        {/* clickIndexが4の時（その他押下時）に表示 */}
        {clickIndex === 4 && (
          <div>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/userInformation?mode=update');
              }}
              className='text-caption1'
            >
              ユーザ情報更新
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/userInformationRef');
              }}
              className='text-caption1'
            >
              ユーザ情報参照
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/userInformationRef');
              }}
              className='text-caption1'
            >
              ユーザ情報削除
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleClose();
                router.push('/userInformationRef');
              }}
              className='text-caption1'
            >
              パスワード変更
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleClose();
                //ログアウト処理
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
