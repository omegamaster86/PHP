import { ReactNode } from 'react';
const CustomTable = ({ children }: { children: ReactNode }) => {
  return <table className='min-w-full bg-white'>{children}</table>;
};
export default CustomTable;
