'use client';
import { useAuth } from '@/app/hooks/auth';
import { Header, Footer, Loading } from '@/app/components';
import { useState } from 'react';
import { useIdleTimer } from "react-idle-timer"; // For logout a user after one hour of inactivity

export default function Layout({ children }: { children: React.ReactNode }) {
  
  const [loggedIn, setLoggedIn] = useState(false);
  const { user, logout, isLoading } = useAuth({ middleware: 'auth' });

  const onIdle = () => {
    if(user){
      logout(); //The user will be automatically after 1 hour of inactivity.
      // pause();// For stop counting idle time of a logged user because of logout.
    }
  };
  const {start, pause} =  useIdleTimer({onIdle, timeout: 1000 * 10, events: [
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
    'focus'
  ], 
  crossTab: true,
  syncTimers: 1000 * 5
  }); //Set 1 hour inactivity time for logout .

  if(isLoading) {
    return (
      <Loading/>
    )
  }

  function authCheck(){
    if(user){
      setLoggedIn(true);
      start(); // For counting idle time of a logged user.
    }
  }
  if(!loggedIn){
    authCheck();
  }
  
  // console.log("login status : ",loggedIn);
  
  return (
    <>
      {loggedIn && (<div className='flex h-screen flex-col justify-between'>
        <div className='flex flex-col justify-start'>
          <Header />
          <div className='flex-grow p-4 md:overflow-y-auto md:p-12 w-full max-w-7xl m-auto min-h-screen'>
            {/* This is a extra feature for logout - start */}
            {/* <div className=' text-right mt-4 mr-2'>
              { <CustomButton buttonType='primary' className='w-[200px]'  onClick={logout} >
                    ログアウト
              </CustomButton> }
            </div> */}
            {children}
          </div>
        </div>
        <Footer />
      </div>)}
    </>
  );
}
