import TextField from '@mui/material/TextField';
import React from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '../InputLabel';
import { ChangeEvent } from 'react';

const CustomTextField = ({
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
}: {
  label?: string;
  isError?: boolean;
  errorMessages?: string[];
  required?: boolean;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  readonly?: boolean;
  inputAdorment?: string;
  displayHelp?: boolean;
  placeHolder?: string;
  disabled?: boolean;
  toolTipTitle?: string;
  toolTipText?: string;
  className?: string;
}) => {
  if (displayHelp === undefined) {
    displayHelp = true;
  }
  return (
    <div className='flex flex-col gap-[8px]'>
      {label && (
        <InputLabel
          label={label}
          required={required}
          displayHelp={displayHelp}
          toolTipTitle={toolTipTitle}
          toolTipText={toolTipText}
        />
      )}
      <div className='flex flex-col gap-[8px]'>
        {readonly && (
          <p className={className + ' h-12 text-secondaryText py-3 disable'}>
            {value} {inputAdorment}
          </p>
        )}
        {!readonly && (
          <TextField
            type={type || 'text'}
            error={isError}
            name={label}
            id={label}
            {...(disabled && { disabled: true })}
            {...(disabled && { className: 'bg-disableBg' })}
            value={value}
            onChange={onChange}
            placeholder={placeHolder}
            inputProps={{
              step: '0.01',
            }}
            InputProps={
              inputAdorment &&
              ({
                endAdornment: <InputAdornment position='end'>{inputAdorment}</InputAdornment>,
              } as any)
            }
            className={`bg-white ${className ? className : ''}`}
          />
        )}
      </div>
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
};

export default CustomTextField;
