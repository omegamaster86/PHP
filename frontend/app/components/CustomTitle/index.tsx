import type { ReactNode } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'; // Import the specific icon component
import { useRouter } from 'next/navigation';

const CustomTitle = ({
  displayBack,
  children,
}: {
  displayBack?: boolean;
  children?: ReactNode;
}) => {
  const router = useRouter();

  return (
    <div className='flex items-center w-max gap-3 mr-auto'>
      {displayBack && <ChevronLeftIcon onClick={() => router.back()} className='cursor-pointer' />}
      <h1 className='text-2xl lg:text-4xl font-bold'>{children}</h1>
    </div>
  );
};
export default CustomTitle;
