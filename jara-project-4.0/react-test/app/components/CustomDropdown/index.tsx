import React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// Propsの型定義
interface SelectProps {
  id: string;
  options: Array<string>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CustomDropdown: React.FC<SelectProps> = ({ id, options, value, onChange, className }) => {
  return (
    <Select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <MenuItem key='default' value=''>
        未選択
      </MenuItem>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  );
};

export default CustomDropdown;
