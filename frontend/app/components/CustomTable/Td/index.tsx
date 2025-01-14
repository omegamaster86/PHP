import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

type AlignType = 'left' | 'center' | 'right' | 'justify' | 'char';

const CustomTd = ({
  children,
  transitionDest,
  align,
  textType,
  className,
  newLine,
}: {
  children: ReactNode;
  transitionDest?: string;
  align?: AlignType;
  textType?: 'primary' | 'secondary' | 'error' | 'warning';
  className?: string;
  newLine?: boolean;
}) => {
  // Next.jsのRouterを利用
  const router = useRouter();

  return transitionDest === undefined ? (
    <td
      className={`py-2 px-1 border border-gray-20 text-caption1
      ${
        textType === 'primary'
          ? 'text-primary-300'
          : textType === 'secondary'
            ? 'text-secondaryText'
            : textType === 'error'
              ? 'text-systemErrorText'
              : textType === 'warning'
                ? 'text-systemWarningText'
                : 'text-primaryText'
      }
      ${newLine ? 'break-all whitespace-normal' : 'whitespace-nowrap'}
      ${className}
      `}
      align={align}
    >
      {children}
    </td>
  ) : (
    <td
      className='py-2 px-1 text-primary-300 underline hover:text-primary-50 cursor-pointer border border-gray-20 whitespace-nowrap text-caption1'
      align={align}
      onClick={() => {
        router.push(transitionDest);
      }}
    >
      {children}
    </td>
  );
};
export default CustomTd;
