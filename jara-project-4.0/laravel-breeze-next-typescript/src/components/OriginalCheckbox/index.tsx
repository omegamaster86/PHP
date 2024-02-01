import React from 'react';

const OriginalCheckbox = ({
  id,
  label,
  value,
  checked,
  onChange,
  readonly,
}: {
  id: string;
  label: string;
  value: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly?: boolean;
}) => {
  return (
    <div className=''>
      <input
        id={id}
        type='checkbox'
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={readonly}
        className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
      />
      {!readonly && (
        <label htmlFor={id} className='ms-2 text-small text-primaryText'>
          {label}
        </label>
      )}
      {readonly && (
        <label htmlFor={id} className='ms-2 text-small text-secondaryText'>
          {label}
        </label>
      )}
    </div>
  );
};

export default OriginalCheckbox;
