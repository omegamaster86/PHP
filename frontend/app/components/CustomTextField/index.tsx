import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import type { ChangeEvent, FocusEvent, HTMLInputTypeAttribute } from 'react';
import { forwardRef } from 'react';
import InputLabel from '../InputLabel';

type Props = {
  label?: string;
  isError?: boolean;
  errorMessages?: string[];
  required?: boolean;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: HTMLInputTypeAttribute;
  readonly?: boolean;
  inputAdorment?: string;
  displayHelp?: boolean;
  placeHolder?: string;
  disabled?: boolean;
  toolTipTitle?: string;
  toolTipText?: string;
  className?: string;
  isDecimal?: boolean;
  widthClassName?: string;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  maxLength?: number;
};

const CustomTextField = forwardRef(
  (
    {
      label,
      isError,
      errorMessages,
      required,
      value,
      onChange,
      type,
      readonly,
      inputAdorment,
      displayHelp,
      placeHolder,
      disabled,
      toolTipTitle,
      toolTipText,
      className,
      isDecimal,
      onBlur,
      maxLength,
      widthClassName,
    }: Props,
    ref,
  ) => {
    if (displayHelp === undefined) {
      displayHelp = true;
    }
    return (
      <div className={`flex flex-col gap-[8px] ${widthClassName}`}>
        {label && (
          <InputLabel
            label={label}
            required={required}
            displayHelp={displayHelp}
            toolTipTitle={toolTipTitle}
            toolTipText={toolTipText}
          />
        )}
        {readonly ? (
          <p className={className + '  text-secondaryText disable'}>
            {value} {inputAdorment}
          </p>
        ) : (
          <TextField
            type={type || 'text'}
            error={isError}
            name={label}
            id={label}
            {...(disabled && { disabled: true })}
            {...(disabled && { className: 'bg-disableBg' })}
            value={value}
            onChange={onChange}
            onBlur={(e) => {
              if (onBlur) {
                onBlur(e as any);
              }
            }}
            placeholder={placeHolder}
            inputProps={
              (isDecimal && { step: '0.01' }) || (maxLength && { maxLength: maxLength }) || {}
            }
            InputProps={
              inputAdorment &&
              ({
                endAdornment: <InputAdornment position='end'>{inputAdorment}</InputAdornment>,
              } as any)
            }
            className={`bg-white ${className ? className : ''}`}
            fullWidth
            inputRef={ref}
          />
        )}
        {isError &&
          errorMessages?.map((message) => {
            return (
              <p key={message} className='text-caption1 text-systemErrorText'>
                {message}
              </p>
            );
          })}
      </div>
    );
  },
);

CustomTextField.displayName = 'CustomTextField';

export default CustomTextField;
