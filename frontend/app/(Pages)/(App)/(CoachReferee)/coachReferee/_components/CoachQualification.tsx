import React from 'react';
import { InputLabel, CustomDropdown, CustomDatePicker } from '@/app/components';
import { ICoachQualification, SelectOption } from '@/app/types';
import { formatDate } from '@/app/utils/dateUtil';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

interface Props {
  coachQualification: ICoachQualification;
  index: number;
  coachQualificationOptions: SelectOption[];
  handleInputChange: (index: number, field: string, value: string | number) => void;
}

const CoachQualification: React.FC<Props> = ({
  coachQualification,
  index,
  coachQualificationOptions,
  handleInputChange,
}) => {
  return (
    <div className='flex flex-col md:flex-row text-wrap gap-5'>
      <h2 className='flex items-center justify-between md:hidden'>
        指導者資格&nbsp;{index + 1}
        <RemoveCircleOutlineIcon />
      </h2>
      <div className='flex flex-col gap-2'>
        <InputLabel label='資格名' required />
        <CustomDropdown<number>
          id={`org_name_${coachQualification.heldCoachQualificationId}`}
          placeHolder='資格名'
          value={coachQualification.coachQualificationId}
          options={coachQualificationOptions}
          onChange={(value: number) => handleInputChange(index, 'coachQualificationId', value)}
          widthClassName='w-full md:w-[150px]'
          className='h-12'
        />
      </div>
      <div className='flex flex-col gap-2'>
        <InputLabel label='取得日' required displayHelp />
        <CustomDatePicker
          placeHolder='2024/01/31'
          selectedDate={coachQualification.acquisitionDate || ''}
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
          selectedDate={coachQualification.expiryDate}
          onChange={(date: Date | null) => {
            if (date) {
              const formattedDate = formatDate(date.toISOString(), 'yyyy/MM/dd');
              handleInputChange(index, 'expiryDate', formattedDate);
            }
          }}
        />
      </div>
      <div className='hidden md:block md:mt-10'>
        <RemoveCircleOutlineIcon />
      </div>
    </div>
  );
};

export default CoachQualification;
