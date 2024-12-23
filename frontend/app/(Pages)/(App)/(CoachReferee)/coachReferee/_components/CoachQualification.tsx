import React, { ChangeEvent } from 'react';
import { InputLabel, CustomDropdown, CustomDatePicker, OriginalCheckbox } from '@/app/components';
import { ICoachQualification, SelectOption } from '@/app/types';
import { formatDate } from '@/app/utils/dateUtil';

interface Props {
  coachQualification: ICoachQualification;
  index: number;
  coachQualificationOptions: SelectOption[];
  handleInputChange: (index: number, field: string, value: string | number | boolean | null) => void;
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
        <OriginalCheckbox
          id={`delete_coachQualification${index + 1}`}
          label='削除'
          value='削除'
          checked={coachQualification.isDeleted}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleInputChange(index, 'isDeleted', event.target.checked);
          }}
        />
      </h2>
      <div className='flex flex-col gap-2'>
        {index === 0 && (
          <div className='hidden md:block'>
            <InputLabel label='資格名' required />
          </div>
        )}
        <div className='md:hidden'>
          <InputLabel label='資格名' required />
        </div>
        <CustomDropdown<number>
          id={`coachQualification${coachQualification.heldCoachQualificationId}`}
          placeHolder='資格名'
          value={coachQualification.coachQualificationId}
          options={coachQualificationOptions}
          onChange={(value: number) => handleInputChange(index, 'coachQualificationId', value)}
          widthClassName='w-full md:w-[150px]'
          className='h-12'
        />
      </div>
      <div className='flex flex-col gap-2'>
        {index === 0 && (
          <div className='hidden md:block'>
            <InputLabel label='取得日' required displayHelp />
          </div>
        )}
        <div className='md:hidden'>
          <InputLabel label='取得日' required displayHelp />
        </div>
        <CustomDatePicker
          selectedDate={coachQualification.acquisitionDate || ''}
          onChange={(date: Date | null) => {
            if (date) {
              const formattedDate = formatDate(date.toISOString(), 'yyyy/MM/dd');
              handleInputChange(index, 'acquisitionDate', formattedDate);
            } else {
              handleInputChange(index, 'acquisitionDate', null);
            }
          }}
        />
      </div>
      <div className='flex flex-col gap-2'>
        {index === 0 && (
          <div className='hidden md:block'>
            <InputLabel label='有効期限日' displayHelp />
          </div>
        )}
        <div className='md:hidden'>
          <InputLabel label='有効期限日' displayHelp />
        </div>
        <CustomDatePicker
          selectedDate={coachQualification.expiryDate}
          onChange={(date: Date | null) => {
            if (date) {
              const formattedDate = formatDate(date.toISOString(), 'yyyy/MM/dd');
              handleInputChange(index, 'expiryDate', formattedDate);
            } else {
              handleInputChange(index, 'expiryDate', null);
            }
          }}
        />
      </div>
      <div className='hidden md:flex md:flex-col md:gap-2'>
        {index === 0 && <InputLabel label='削除' />}
        <div className='mt-4'>
          <OriginalCheckbox
            id={`delete_coachQualification${index + 1}`}
            label=''
            value='削除'
            checked={coachQualification.isDeleted}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              handleInputChange(index, 'isDeleted', event.target.checked);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CoachQualification;
