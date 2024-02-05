import { ReactNode } from 'react';

const CustomThead = ({ children }: { children: ReactNode }) => {
  return (
    <thead className='bg-primary-40 bg-opacity-30 text-primary-500 py-2 px-4'>{children}</thead>
  );
};
export default CustomThead;
