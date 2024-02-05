import { ChangeEvent } from 'react';
import { Autocomplete, Chip, TextField } from '@mui/material';

export default function CustomAutocomplete({
  id,
  options,
  value,
  onChange,
  placeholder,
  errorMessages,
}: {
  id?: string;
  options: { id: number; name: string }[];
  value: { id: number; name: string }[];
  onChange: (val: ChangeEvent<{}>, newValue: { id: number; name: string }[]) => void;
  placeholder?: string;
  errorMessages?: string[];
}) {
  return (
    <div>
      <Autocomplete
        id={id}
        multiple
        options={options}
        value={value}
        onChange={(e: ChangeEvent<{}>, newValue: { id: number; name: string }[]) => {
          onChange(e, newValue);
        }}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.id}>
              {option.name}
            </li>
          );
        }}
        renderTags={(tagValue, getTagProps) => {
          return tagValue.map((option, index) => (
            <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
          ));
        }}
        renderInput={(params) => (
          <TextField
            key={params.id}
            className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
            {...params}
            label={placeholder}
          />
        )}
      />
      {errorMessages?.map((message: string) => (
        <p key={message} className='pt-1 text-caption1 text-systemErrorText'>
          {message}
        </p>
      ))}
    </div>
  );
}
