'use client';
import Header from '@/components/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-screen flex-col'>
      <Header />
      <div className='flex-grow md:overflow-y-auto md:p-12'>{children}</div>
    </div>
  );
}
