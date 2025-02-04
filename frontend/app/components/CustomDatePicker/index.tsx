import { cn } from '@/app/utils/cn';
import ja from 'date-fns/locale/ja';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// 日本語ロケールの登録
registerLocale('ja', ja);

const CustomDatePicker = ({
  selectedDate,
  onChange,
  maxDate,
  errorMessages,
  useTime,
  readonly,
  placeHolder,
  isError,
  className,
  wrapperClassName = 'w-full',
  id,
  disabled,
}: {
  selectedDate: string | null;
  onChange: any;
  maxDate?: Date;
  errorMessages?: string[];
  useTime?: boolean;
  readonly?: boolean;
  placeHolder?: string;
  isError?: boolean;
  className?: string;
  wrapperClassName?: string;
  id?: string;
  disabled?: boolean;
}) => {
  return (
    <>
      {readonly && <p className='text-secondaryText disable'>{selectedDate}</p>}
      {!readonly && (
        <DatePicker
          id={id}
          className={cn(
            'border-[0.5px] border-solid rounded w-full p-3',
            isError ? 'border-red' : 'border-gray-200 ',
            className,
          )}
          {...(selectedDate && { selected: new Date(selectedDate) })}
          onChange={onChange}
          {...(useTime ? { dateFormat: 'yyyy/MM/dd HH:mm' } : { dateFormat: 'yyyy/MM/dd' })}
          maxDate={maxDate}
          {...(useTime
            ? { placeholderText: 'yyyy/MM/dd HH:mm' }
            : { placeholderText: 'yyyy/MM/dd' })}
          locale='ja'
          showMonthDropdown
          showYearDropdown
          {...{ showTimeSelect: useTime }}
          timeIntervals={15}
          readOnly={readonly}
          placeholderText={placeHolder}
          wrapperClassName={wrapperClassName}
          disabled={disabled}
        />
      )}
      {errorMessages?.map((message: string) => (
        <p key={message} className='pt-1 text-caption1 text-systemErrorText'>
          {message}
        </p>
      ))}
    </>
  );
};

export default CustomDatePicker;
