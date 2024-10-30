'use client';

import React from 'react';
import { CircularProgress } from '@mui/material';

const Loading: React.FC = () => {
  return (
    <>
      <div className='flex flex-col items-center justify-center h-screen'>
        <CircularProgress size='6rem' />
        <h1 className='text-2xl mt-5'>Now loading...</h1>
      </div>
    </>
  );
};

export default Loading;
