import React from 'react';
import './Header.css';
import Logo from '../Logo';
import { AccountCircle, Notifications } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const router = useRouter();
  return (
    <header className='header bg-primary'>
      <Logo />
      <div className='right-content'>
        <AccountCircle
          className={'text-[40px] bg-transparent text-white cursor-pointer'}
          onClick={() => {
            router.push('/mypage');
          }}
        />
      </div>
    </header>
  );
};

export default Header;
