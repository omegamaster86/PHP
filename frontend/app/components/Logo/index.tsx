import type { FC } from 'react';
import './Logo.css';

const Logo: FC = () => {
  return <img className='logo' src='/jara-logo.png' alt='logo' width={220} height={32} />;
};

export default Logo;
