'use client';
import Header from '@/app/components/Header';
import {useAuth} from '@/app/hooks/auth';

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <>
    {/* {user && */}
      <div className='flex h-screen flex-col'>
        <div className='flex-grow md:overflow-y-auto md:p-12'>{children}</div>
      </div>
      {/* } */}
    </>
  );
}
