'use client';

import MyPageLayout from '@/app/(Pages)/(App)/(MyPage)/_components/MyPageLayout';
import { Footer, Header } from '@/app/components';
import { useAuth } from '@/app/hooks/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useIdleTimer } from 'react-idle-timer'; // For logout a user after one hour of inactivity

export default function Layout({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const { user, logout } = useAuth({ middleware: 'auth' });
  const pathname = usePathname();
  const router = useRouter();

  const onIdle = () => {
    if (user) {
      logout(); //The user will be automatically after 1 hour of inactivity.
      pause(); // For stop counting idle time of a logged user because of logout.
    }
  };
  const { start, pause } = useIdleTimer({
    onIdle,
    timeout: 1000 * 60 * 60,
    events: [
      'mousemove',
      'keydown',
      'wheel',
      'DOMMouseScroll',
      'mousewheel',
      'mousedown',
      'touchstart',
      'touchmove',
      'MSPointerDown',
      'MSPointerMove',
      'visibilitychange',
      'focus',
    ],
    crossTab: true,
    syncTimers: 1000 * 60 * 60,
  }); //Set 1 hour inactivity time for logout .

  function authCheck() {
    if (user) {
      setLoggedIn(true);
      start(); // For counting idle time of a logged user.
    }
  }
  if (!loggedIn) {
    authCheck();
  }

  const isMyPageRoute = pathname.includes('/mypage');

  return (
    <>
      {loggedIn && (
        <div className='flex h-screen flex-col justify-between'>
          <div className='flex flex-col flex-grow justify-start'>
            <Header />
            {isMyPageRoute ? (
              <MyPageLayout>{children}</MyPageLayout>
            ) : (
              <main className='flex flex-col gap-7 md:overflow-y-auto px-3 py-4 md:py-12 w-full max-w-5xl m-auto'>
                {children}
              </main>
            )}
          </div>
          <Footer />
        </div>
      )}
    </>
  );
}
