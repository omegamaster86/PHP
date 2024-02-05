'use client';
// import Header from '../../components/Header';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className='flex h-screen flex-col'>
      {/* <Header /> */}
      <div className='flex-grow md:overflow-y-auto md:p-12'>{children}</div>
    </div>
  );
}
