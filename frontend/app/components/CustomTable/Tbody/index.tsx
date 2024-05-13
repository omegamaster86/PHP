import { ReactNode } from 'react';
const CustomTbody = ({ children, deleteMode }: { children: ReactNode; deleteMode?: boolean }) => {
  return <tbody className={`${deleteMode ? 'bg-gray-500' : ''}`}>{children}</tbody>;
};
export default CustomTbody;
