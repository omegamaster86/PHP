import { cn } from '@/app/utils/cn';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'; // Import the specific icon component
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

const CustomTitle = ({
  displayBack,
  customBack,
  children,
  className,
}: {
  displayBack?: boolean;
  customBack?: () => void;
  children?: ReactNode;
  className?: string;
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
      <h1 className={cn('text-2xl lg:text-4xl font-bold', className)}>{children}</h1>
    </div>
  );
};
export default CustomTitle;
