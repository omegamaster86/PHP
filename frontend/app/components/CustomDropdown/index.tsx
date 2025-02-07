import { SelectOption } from '@/app/types';
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem';
import Select, { SelectProps } from '@mui/material/Select';
import { clsx } from 'clsx';
import InputLabel from '../InputLabel';

type MuiSelectProps = Omit<SelectProps, 'onChange' | 'color'>;

// Propsの型定義
interface CustomDropdownProps<T = string> extends MuiSelectProps {
  id: string;
  options: SelectOption<string | number>[];
  value?: T;
  errorMessages?: string[];
  onChange?: (value: T) => void;
  className?: string;
  placeHolder?: string;
  readonly?: boolean;
  isError?: boolean;
  required?: boolean;
  label?: string;
  displayHelp?: boolean;
  toolTipTitle?: string;
  toolTipText?: string;
  widthClassName?: string;
  multiple?: boolean;
  customRef?: MuiSelectProps['ref'];
}
const CustomDropdown = <T = string,>(props: CustomDropdownProps<T>) => {
  const {
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
    widthClassName,
    multiple = false,
    customRef,
    disabled,
  } = props;

  const readOnlyValue = Array.isArray(value) ? value.join(', ') : String(value);

  return (
    <div className={clsx('flex flex-col gap-[6px]', widthClassName ? widthClassName : 'w-full')}>
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
        {readonly && <p className='text-secondaryText disable'>{readOnlyValue}</p>}
        {!readonly && (
          <Select<T>
            id={id}
            value={value}
            onChange={(e) => {
              onChange?.(e.target.value as T);
            }}
            className={clsx(className, 'w-full bg-white')}
            readOnly={readonly}
            placeholder={placeHolder}
            error={isError}
            multiple={multiple}
            ref={customRef}
            disabled={disabled}
          >
            {required && !multiple && (
              <MenuItem key='default' disabled value='0'>
                未選択
              </MenuItem>
            )}
            {!required && !multiple && (
              <MenuItem key='default' value=''>
                未選択
              </MenuItem>
            )}
            {options.map((option, index) => (
              <MenuItem
                key={index}
                value={option.key as MenuItemProps['value']}
                className='text-primaryText'
              >
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
