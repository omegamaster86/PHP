import { cn } from '@/app/utils/cn';

type Props = {
  label: string;
  isValid?: boolean;
  className?: string;
};

export const RoundedBadge = ({ label, isValid = false, className }: Props) => {
  return (
    <span
      className={cn(
        'px-[12px] py-[4px] rounded-full text-small border',
        isValid ? 'border-secondary-500 text-secondary-500' : 'border-gray-200 text-gray-200',
        className,
      )}
    >
      {label}
    </span>
  );
};
