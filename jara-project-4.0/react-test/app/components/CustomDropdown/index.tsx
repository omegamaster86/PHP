import { FC } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// Propsの型定義
interface SelectProps {
  id: string;
  options: Array<{ key: number; value: string }>;
  value: string;
  errorMessages?: string[];
  onChange: (value: string) => void;
  className?: string;
  placeHolder?: string;
  readonly?: boolean;
  isError?: boolean;
}
const CustomDropdown: FC<SelectProps> = ({
  id,
  options,
  value,
  onChange,
  className,
  errorMessages,
  placeHolder,
  readonly,
  isError,
}) => {
  return (
    <div className={className}>
      {readonly && <p className='h-12 w-[300px] text-secondaryText py-3 disable'>{value}</p>}
      {!readonly && (
        <Select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className + ' bg-white'}
          readOnly={readonly}
          placeholder={placeHolder}
          error={isError}
        >
          <MenuItem key='default' disabled value='0'>
            未選択
          </MenuItem>
          {options.map((option, index) => (
            <MenuItem key={index} value={option.key} className='text-primaryText'>
              {option.value}
            </MenuItem>
          ))}
        </Select>
      )}
      {(errorMessages?.length || 0) > 0 && (
        <p className='text-caption1 text-systemErrorText mt-1'>
          {errorMessages?.map((message) => {
            return message;
          })}
        </p>
      )}
    </div>
  );
};

export default CustomDropdown;
