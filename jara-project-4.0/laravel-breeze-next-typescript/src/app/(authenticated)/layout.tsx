'use client'
import { ReactNode } from 'react'
import { useAuth } from '@/hooks/auth'
import Navigation from '@/components/Layouts/Navigation'
import Header from '@/components/Header';

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth({ middleware: 'auth' })

  return (
    <div className='flex h-screen flex-col'>
      <Header />
      <Navigation user={user} />
      <div className='flex-grow md:overflow-y-auto md:p-12'>{children}</div>
    </div>

  )
}

export default AppLayout
