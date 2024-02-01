import React from 'react';
import './Header.css';
import Logo from '../Logo';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const router = useRouter();
  return (
    <header className='header bg-primary'>
      <Logo />
      <div className='right-content'></div>
    </header>
  );
};

export default Header;
