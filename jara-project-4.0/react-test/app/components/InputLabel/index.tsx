'use client';
import { HelpOutlineSharp } from '@mui/icons-material';

export default function InputLabel({
  label,
  required,
  displayHelp,
}: {
  label: string;
  required?: boolean;
  displayHelp?: boolean;
}) {
  return (
    <div className='flex justify-start items-center gap-[10px]'>
      <label htmlFor={label}>{label}</label>
      {required && <p className='text-caption2 text-systemErrorText'>必須</p>}
      {displayHelp && <HelpOutlineSharp className='text-caption2 text-secondaryText' />}
    </div>
  );
}
