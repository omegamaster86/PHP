import HelpOutlineSharp from '@mui/icons-material/HelpOutlineSharp';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '../InputLabel';

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
  hideDisplayHelp,
  placeHolder,
}: {
  label: string;
  isError?: boolean;
  errorMessages?: string[];
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  readonly?: boolean;
  inputAdorment?: string;
  hideDisplayHelp?: boolean;
  placeHolder?: string;
}) => {
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  return (
    <div className='flex flex-col gap-[8px]'>
      <InputLabel label={label} required={required} displayHelp={!hideDisplayHelp}/>
      <div className='flex flex-col gap-[8px]'>
        {readonly && <p className='h-12 w-[300px] p-3 disable'>{value}</p>}
        {!readonly && (
          <TextField
            type={type || 'text'}
            error={isError}
            name={label}
            id={label}
            value={value}
            onChange={onChange}
            placeholder={placeHolder}
            InputProps={
              inputAdorment &&
              ({
                endAdornment: <InputAdornment position='end'>{inputAdorment}</InputAdornment>,
              } as any)
            }
          />
        )}
      </div>
      {isError &&
        errorMessages.map((message) => {
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
