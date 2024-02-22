'use client';
import { useAuth } from '@/app/hooks/auth';
import { Header, Footer, CustomButton, Loading } from '@/app/components';
import { useEffect, useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const { user, logout, isLoading } = useAuth({ middleware: 'auth' })

  if(isLoading) {
    return (
      <Loading/>
    )
  }

  function authCheck(){
    if(user){
      setLoggedIn(true)
    }
  }
  if(!loggedIn){
    authCheck()
  }
  

  
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
