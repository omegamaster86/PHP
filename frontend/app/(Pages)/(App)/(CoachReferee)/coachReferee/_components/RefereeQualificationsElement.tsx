import React from 'react';
import { InputLabel, CustomDatePicker, CustomDropdown } from '@/app/components';
import { formatDate } from '@/app/utils/dateUtil';
import { RefereeQualification } from '@/app/types';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

interface RefereeQualificationsElementProps {
  RefereeQualification: RefereeQualification;
  index: number;
  options: { value: string; key: number }[] | null;
  handleInputChange: (index: number, field: string, value: string) => void;
}

const RefereeQualificationsElement: React.FC<RefereeQualificationsElementProps> = ({
  RefereeQualification,
  index,
  options,
  handleInputChange,
}) => {
  return (
    <div className='flex flex-col md:flex-row text-wrap gap-5' key={index}>
      <div className='flex justify-between md:hidden'>
        <h2>審判資格{}</h2>
        <div className='md:hidden'>
          <RemoveCircleOutlineIcon />
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <InputLabel label='資格名' required />
        <CustomDropdown
          id={`organization_${index}`}
          placeHolder='資格名'
          options={options || []}
          widthClassName='w-full md:w-[150px]'
          className='h-12'
        />
      </div>
      <div className='flex flex-col gap-2'>
        <InputLabel label='取得日' required displayHelp />
        <CustomDatePicker
          placeHolder='2024/01/31'
          selectedDate={RefereeQualification.acquisitionDate || ''}
          onChange={(date: Date | null) => {
            if (date) {
              const formattedDate = formatDate(date.toISOString(), 'yyyy/MM/dd');
              handleInputChange(index, 'acquisitionDate', formattedDate);
            }
          }}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <InputLabel label='有効期限日' displayHelp />
        <CustomDatePicker
          placeHolder='2024/06/31'
          selectedDate={RefereeQualification.expiryDate}
          onChange={(date: Date | null) => {
            if (date) {
              const formattedDate = formatDate(date.toISOString(), 'yyyy/MM/dd');
              handleInputChange(index, 'expiryDate', formattedDate);
            }
          }}
        />
      </div>
      <div className='md:mt-10 md:block hidden'>
        <RemoveCircleOutlineIcon />
      </div>
    </div>
  );
};

export default RefereeQualificationsElement;
