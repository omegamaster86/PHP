import { cn } from '@/app/utils/cn';

type Props = {
  label: string;
  labelClassName?: string;
  value: string | number | null;
  valueClassName?: string;
};

const Info: React.FC<Props> = (props) => {
  const { label, labelClassName, value, valueClassName } = props;

  // nullまたは空文字の場合は'-'を表示する。
  const displayValue = (value: string | number | null) => {
    if (value === null || value === '') {
      return '-';
    }
    return value;
  };

  return (
    <div className='flex gap-2 text-sm'>
      <span className={cn('font-semibold', labelClassName)}>{label}</span>
      <p className={cn(valueClassName)}>{displayValue(value)}</p>
    </div>
  );
};

export default Info;
