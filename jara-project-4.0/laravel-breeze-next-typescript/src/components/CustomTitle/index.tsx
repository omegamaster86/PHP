import React from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'; // Import the specific icon component
import { useRouter } from 'next/navigation';

const CustomTitle = ({
  isCenter,
  displayBack,
  children,
}: {
  isCenter?: boolean;
  displayBack?: boolean;
  children?: React.ReactNode;
}) => {
  const router = useRouter();
  if (isCenter) {
    return (
      <div className='flex justify-center items-center w-max gap-3 mx-auto'>
        {displayBack && <ChevronLeftIcon />}
        <h1 className='text-h1 font-bold'>{children}</h1>
        <div className='flex-grow'></div>
      </div>
    );
  }
  return (
    <div className='flex justify-start items-center w-max gap-3 mr-auto'>
      {displayBack && <ChevronLeftIcon onClick={() => router.back()} className='cursor-pointer' />}
      <h1 className='text-h1 font-bold'>{children}</h1>
    </div>
  );
};
export default CustomTitle;
