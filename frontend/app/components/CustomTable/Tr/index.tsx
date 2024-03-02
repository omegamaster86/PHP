import { ReactNode } from 'react';

const CustomTr = ({
  children,
  isHidden,
  index, // keyだとエラーが出るのでindexに変更
}: {
  children: ReactNode;
  isHidden?: boolean;
  index?: number;
}) => {
  return (
    <tr className={`${isHidden ? 'hidden' : ''}`} key={index}>
      {children}
    </tr>
  );
};
export default CustomTr;
