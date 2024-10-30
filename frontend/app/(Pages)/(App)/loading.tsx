import { FC } from 'react';
import { CircularProgress } from '@mui/material';

const Loading: FC = () => {
  return (
    <div className='w-full h-full grid place-content-center'>
      <CircularProgress size='3rem' />
    </div>
  );
};

export default Loading;
