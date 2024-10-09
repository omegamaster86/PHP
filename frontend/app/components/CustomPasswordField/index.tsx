import TextField from '@mui/material/TextField';
import { useState, type ChangeEvent } from 'react';
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
  placeholder,
  toolTipTitle,
  toolTipText,
}: {
  label: string;
  isError: boolean;
  errorMessages: string[];
  required?: boolean;
  value?: string;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  toolTipTitle?: string;
  toolTipText?: string;
}) => {
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };
  return (
    <div className='flex flex-col gap-[8px]'>
      <InputLabel
        label={label}
        required={required}
        toolTipTitle={toolTipTitle}
        toolTipText={toolTipText}
      />
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
            <p key={message} className='text-caption1 text-systemErrorText'>
              {message}
            </p>
          );
        })}
    </div>
  );
};

export default CustomPasswordField;
