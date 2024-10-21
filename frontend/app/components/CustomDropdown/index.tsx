import { FC } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '../InputLabel';
import { clsx } from 'clsx';

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
  required?: boolean;
  label?: string;
  displayHelp?: boolean;
  toolTipTitle?: string;
  toolTipText?: string;
  width?: string;
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
  required,
  label,
  displayHelp,
  toolTipTitle,
  toolTipText,
  width,
}) => {
  return (
    <div className={clsx('flex flex-col gap-[6px]', width ? width : 'w-full')}>
      {label && (
        <InputLabel
          label={label || ''}
          required={required}
          displayHelp={displayHelp}
          toolTipText={toolTipText || ''}
          toolTipTitle={toolTipTitle || ''}
        />
      )}
      <div className={className}>
        {readonly && <p className='h-12  text-secondaryText py-3 disable'>{value}</p>}
        {!readonly && (
          <Select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={clsx(className, 'w-full bg-white')}
            readOnly={readonly}
            placeholder={placeHolder}
            error={isError}
          >
            {required && (
              <MenuItem key='default' disabled value='0'>
                未選択
              </MenuItem>
            )}
            {!required && (
              <MenuItem key='default' value=''>
                未選択
              </MenuItem>
            )}
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
    </div>
  );
};

export default CustomDropdown;
