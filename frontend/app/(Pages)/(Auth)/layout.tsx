'use client';
import { useIdleTimer } from 'react-idle-timer'; // For logout a user after one hour of inactivity
import { Header } from '@/app/components';
import { type ReactNode, useState } from 'react';
import { useAuth } from '@/app/hooks/auth';
import { usePathname, useRouter } from 'next/navigation';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth({ middleware: 'auth' });
  const [loggedIn, setLoggedIn] = useState(false);
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
  return (
    <div className='flex h-screen flex-col'>
      <Header />
      <div className='flex-grow md:overflow-y-auto'>{children}</div>
    </div>
  );
}
