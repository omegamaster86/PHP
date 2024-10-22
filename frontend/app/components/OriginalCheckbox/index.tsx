import React, { ChangeEvent } from 'react';
import clsx from 'clsx';

const OriginalCheckbox = ({
  id,
  label,
  value,
  checked,
  onChange,
  readonly,
  isError,
  errorMessages,
}: {
  id: string;
  label?: string;
  value: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly?: boolean;
  isError?: boolean;
  errorMessages?: string[];
}) => {
  return (
    <div className='flex flex-col gap-[8px]'>
      <div className='flex items-center'>
        <input
          id={id}
          type='checkbox'
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={readonly}
          className='w-4 h-4 border border-gray-300 bg-gray-100 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
        />
        <label
          htmlFor={id}
          className={clsx('ms-2 text-small', readonly ? 'text-secondaryText' : 'text-primaryText')}
        >
          {label}
        </label>
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

export default OriginalCheckbox;
