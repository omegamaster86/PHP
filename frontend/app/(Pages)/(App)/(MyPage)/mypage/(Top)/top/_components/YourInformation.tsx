import React from 'react';

interface Props {
  title: string;
  number: number;
}

const YourInformation: React.FC<Props> = ({ title, number }) => {
  return (
    <div className='flex flex-col items-center flex-1 gap-5 py-[10px]'>
      <span className='font-medium text-[8px] md:text-sm'>{title}</span>
      <span className='font-bold text-lg md:text-[40px]'>{number.toLocaleString()}</span>
    </div>
  );
};

export default YourInformation;
