'use client';
import { Header, Footer } from '../../components';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-screen flex-col justify-between'>
      <div className='flex flex-col justify-start'>
        <Header />
        <div className='flex-grow p-4 md:overflow-y-auto md:p-12 w-full max-w-7xl m-auto min-h-screen'>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
