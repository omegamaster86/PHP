import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ja from 'date-fns/locale/ja';

// 日本語ロケールの登録
registerLocale('ja', ja);

const CustomYearPicker = ({
  selectedDate,
  onChange,
  maxDate,
  errorMessages,
  readonly,
  placeHolder,
  isError,
  className,
}: {
  selectedDate: string;
  onChange: any;
  maxDate?: Date;
  errorMessages?: string[];
  readonly?: boolean;
  placeHolder?: string;
  isError?: boolean;
  className?: string;
}) => {
  const dispYear = new Date(selectedDate).getFullYear();
  return (
    <div>
      {readonly && (
        <p className='h-12 w-[300px] text-secondaryText py-3 disable'>
          {selectedDate ? dispYear : ''}
        </p>
      )}
      {!readonly && (
        <DatePicker
          className={`border-[0.5px] border-solid rounded h-12 p-3 ${
            isError ? 'border-red' : 'border-gray-200 '
          } ${className ? className : ''}`}
          {...(selectedDate && { selected: new Date(selectedDate) })}
          onChange={onChange}
          {...{ dateFormat: 'yyyy' }}
          maxDate={maxDate}
          {...{ placeholderText: 'yyyy' }}
          locale='ja'
          showYearDropdown
          showYearPicker
          dateFormat={'yyyy'}
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

export default CustomYearPicker;
