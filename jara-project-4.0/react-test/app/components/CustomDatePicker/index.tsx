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
}: {
  selectedDate: Date;
  onChange: any;
  maxDate: Date;
}) => {
  return (
    <DatePicker
      className='border-[0.5px] border-solid border-gray-200 rounded h-12 w-full p-3'
      {...(selectedDate && { selected: selectedDate })}
      onChange={onChange}
      dateFormat='yyyy/MM/dd'
      maxDate={maxDate}
      locale='ja'
      showMonthDropdown
      showYearDropdown
    />
  );
};

export default CustomDatePicker;
