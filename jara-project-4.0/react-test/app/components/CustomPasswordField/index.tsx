import HelpOutlineSharp from '@mui/icons-material/HelpOutlineSharp';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import InputLabel from '../InputLabel';

const CustomPasswordField = ({
  label,
  isError,
  errorMessages,
  required,
  value,
  onChange,
  placeholder
}: {
  label: string;
  isError: boolean;
  errorMessages: string[];
  required?: boolean;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };
  return (
    <div className='flex flex-col gap-[8px]'>
      <InputLabel label={label} required={required} />
      <div className='flex flex-col gap-[8px]'>
        <TextField
          type={passwordShown ? 'text' : 'password'}
          error={isError}
          name={label}
          id={label}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                {passwordShown ? (
                  <VisibilityIcon className='cursor-pointer' onClick={togglePasswordVisibility} />
                ) : (
                  <VisibilityOffIcon
                    className='cursor-pointer'
                    onClick={togglePasswordVisibility}
                  />
                )}
              </InputAdornment>
            ),
          }}
        />
      </div>
      {isError &&
        errorMessages.map((message) => {
          return (
            <p key={message} className='text-[12px] text-systemErrorText'>
              {message}
            </p>
          );
        })}
    </div>
  );
};

export default CustomPasswordField;
