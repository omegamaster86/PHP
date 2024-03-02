import { ReactNode } from 'react';

type AlignType = 'left' | 'center' | 'right' | 'justify' | 'char';

const CustomTh = ({
  children,
  align,
  colSpan,
  rowSpan,
}: {
  children: ReactNode;
  align?: AlignType;
  colSpan?: number;
  rowSpan?: number;
}) => {
  return (
    <th
      colSpan={colSpan}
      rowSpan={rowSpan}
      className='p-1 border border-gray-20 whitespace-nowrap text-caption1'
      align={align}
    >
      {children}
    </th>
  );
};

export default CustomTh;
