import React, { useState, useEffect, FC, MouseEvent } from 'react';
import './Header.css';
import Logo from '../Logo';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, MenuItem, Button } from '@mui/material';

const Header: FC = () => {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [clickIndex, setclickIndex] = useState(0);

  // メニューを開く
  const handleClick = (event: MouseEvent<HTMLButtonElement>, clickIndex: number) => {
    setAnchorEl(event.currentTarget);
    setclickIndex(clickIndex);
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
      default:
        setIndex(4);
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
              大会検索
            </MenuItem>
          </div>
        )}
        {/* clickIndexが1の時（選手情報押下時）に表示 */}
        {clickIndex === 1 && (
          <div>
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
                router.push('/playerSearch');
              }}
              className='text-caption1'
            >
              選手検索
            </MenuItem>
          </div>
        )}
        {/* clickIndexが2の時（団体押下時）に表示 */}
        {clickIndex === 2 && (
          <div>
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
              団体検索
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
              ${
                index === 0 &&
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
              ${
                index === 1 &&
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
              ${
                index === 2 &&
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
              ${
                index === 3 &&
                'border-b-[2px] rounded-none border-solid border-primary-500 text-primary-500'
              }
              flex justify-center items-center h-[49px] w-[100px] cursor-pointer
              `}
            >
              ボランティア
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
