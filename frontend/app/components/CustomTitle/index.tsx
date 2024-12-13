import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'; // Import the specific icon component
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

const CustomTitle = ({
  displayBack,
  customBack,
  children,
}: {
  displayBack?: boolean;
  customBack?: () => void;
  children?: ReactNode;
}) => {
  const router = useRouter();

  const handleGoBack = () => {
    if (displayBack) {
      router.back();
    } else if (customBack) {
      customBack();
    }
  };
  return (
    <div className='flex items-center gap-3'>
      {(displayBack || customBack) && (
        <ChevronLeftIcon onClick={handleGoBack} className='cursor-pointer' />
      )}
      <h1 className='text-2xl lg:text-4xl font-bold'>{children}</h1>
    </div>
  );
};
export default CustomTitle;
