import React, { ChangeEvent } from 'react';
import { InputLabel, CustomDatePicker, CustomDropdown, OriginalCheckbox } from '@/app/components';
import { formatDate } from '@/app/utils/dateUtil';
import { IRefereeQualification, SelectOption } from '@/app/types';

interface Props {
  refereeQualification: IRefereeQualification;
  index: number;
  refereeQualificationsOptions: SelectOption[];
  handleInputChange: (index: number, field: string, value: string | number | boolean | null) => void;
}

const RefereeQualification: React.FC<Props> = ({
  refereeQualification,
  index,
  refereeQualificationsOptions,
  handleInputChange,
}) => {
  return (
    <div className='flex flex-col md:flex-row text-wrap gap-5'>
      <h2 className='flex items-center justify-between md:hidden'>
        審判資格&nbsp;{index + 1}
        <OriginalCheckbox
          id={`delete_refereeQualification${index + 1}`}
          label='削除'
          value='削除'
          checked={refereeQualification.isDeleted}
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
          id={`refereeQualification_${refereeQualification.heldRefereeQualificationId}`}
          placeHolder='資格名'
          value={refereeQualification.refereeQualificationId}
          options={refereeQualificationsOptions}
          onChange={(value: number) => handleInputChange(index, 'refereeQualificationId', value)}
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
          selectedDate={refereeQualification.acquisitionDate || ''}
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
          selectedDate={refereeQualification.expiryDate}
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
            id={`delete_refereeQualification${index + 1}`}
            label=''
            value='削除'
            checked={refereeQualification.isDeleted}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              handleInputChange(index, 'isDeleted', event.target.checked);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RefereeQualification;
