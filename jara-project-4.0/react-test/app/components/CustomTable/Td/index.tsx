import { useRouter } from 'next/navigation';

type AlignType = 'left' | 'center' | 'right' | 'justify' | 'char';

const CustomTd = ({
  children,
  transitionDest,
  align,
  key,
  textType,
}: {
  children: React.ReactNode;
  transitionDest?: string;
  align?: AlignType;
  key?: number;
  textType?: string;
}) => {
  // Next.jsのRouterを利用
  const router = useRouter();

  return transitionDest === undefined ? (
    <td
      className={`py-2 px-1 border border-gray-20 whitespace-nowrap text-caption1
      ${
        textType === 'primary'
          ? 'text-primary-300'
          : textType === 'secondary'
            ? 'text-secondaryText'
            : textType === 'error'
              ? 'text-systemErrorText'
              : 'text-primaryText'
      }  
      `}
      align={align}
      key={key}
    >
      {children}
    </td>
  ) : (
    <td
      className='py-2 px-1 text-primary-300 underline hover:text-primary-50 cursor-pointer border border-gray-20 whitespace-nowrap text-caption1'
      align={align}
      key={key}
      onClick={() => {
        router.push(transitionDest);
      }}
    >
      {children}
    </td>
  );
};
export default CustomTd;
