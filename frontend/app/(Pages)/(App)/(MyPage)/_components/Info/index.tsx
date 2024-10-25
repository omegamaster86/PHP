import { cn } from '@/app/utils/cn';

type Props = {
  label: string;
  labelClassName?: string;
  value?: string | number | null;
  valueClassName?: string;
};

const Info: React.FC<Props> = (props) => {
  const { label, labelClassName, value, valueClassName } = props;

  return (
    <div className='flex gap-2 text-sm'>
      <span className={cn('font-semibold', labelClassName)}>{label}</span>
      <p className={cn(valueClassName)}>{value}</p>
    </div>
  );
};

export default Info;
