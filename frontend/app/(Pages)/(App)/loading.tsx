'use client'

import React from 'react';
import { CircularProgress } from '@mui/material';
import { Header } from '@/app/components';

const Loading: React.FC = () => {
  return (
    <>
      <Header/>
      <div className='flex flex-col items-center justify-center h-screen'>
        <CircularProgress size="6rem" />
        <h1 className='text-2xl mt-5'>Now loading...</h1>
      </div>
    </>
  );
};

export default Loading;