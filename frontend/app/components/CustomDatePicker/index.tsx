import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ja from 'date-fns/locale/ja';

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
  id,
}: {
  selectedDate: string;
  onChange: any;
  maxDate?: Date;
  errorMessages?: string[];
  useTime?: boolean;
  readonly?: boolean;
  placeHolder?: string;
  isError?: boolean;
  className?: string;
  id?: string;
}) => {
  return (
    <div>
      {readonly && <p className='h-12 w-[300px] text-secondaryText py-3 disable'>{selectedDate}</p>}
      {!readonly && (
        <DatePicker
          id={id}
          className={`border-[0.5px] border-solid rounded h-12 w-full p-3 ${
            isError ? 'border-red' : 'border-gray-200 '
          } ${className ? className : ''}`}
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
        />
      )}
      {errorMessages?.map((message: string) => (
        <p key={message} className='pt-1 text-caption1 text-systemErrorText'>
          {message}
        </p>
      ))}
    </div>
  );
};

export default CustomDatePicker;
