import React, { ChangeEvent, useState } from 'react';
import { InputLabel, CustomDatePicker, CustomDropdown, OriginalCheckbox } from '@/app/components';
import { formatDate } from '@/app/utils/dateUtil';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { CoachRefereeResponse, SelectOption } from '@/app/types';

interface Props {
  coachingHistory: CoachRefereeResponse['coachingHistories'][number];
  index: number;
  handleInputChange: (index: number, field: string, value: string | number | boolean) => void;
  handleDelete: (index: number) => void;
  organizationOptions: { org_id: number; org_name: string }[];
  staffOptions: SelectOption[];
}

const CoachingHistory: React.FC<Props> = ({
  coachingHistory,
  index, 
  handleInputChange,
  handleDelete,
  organizationOptions,
  staffOptions,
}) => {

  return (
    <div className='flex flex-col md:flex-row text-wrap gap-5'>
      <h2 className='flex items-center justify-between md:hidden'>
        指導履歴&nbsp;{index + 1}
        <RemoveCircleOutlineIcon onClick={() => handleDelete((index = 1234))} />
      </h2>
      <div className='flex flex-col gap-2'>
        <InputLabel label='開始日' required displayHelp />
        <CustomDatePicker
          selectedDate={coachingHistory.startDate}
          onChange={(date: Date | null) => {
            if (date) {
              const formattedDate = formatDate(date.toISOString(), 'yyyy/MM/dd');
              handleInputChange(index, 'startDate', formattedDate);
            }
          }}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <InputLabel label='終了日' required displayHelp />
        <CustomDatePicker
          selectedDate={coachingHistory.endDate}
          disabled={coachingHistory.isCurrentlyCoaching}
          onChange={(date: Date | null) => {
            if (date) {
              const formattedDate = formatDate(date.toISOString(), 'yyyy/MM/dd');
              handleInputChange(index, 'endDate', formattedDate);
            }
          }}
        />
        <OriginalCheckbox
          id={`currently_coaching_${index + 1}`}
          label='現在指導中'
          value='現在指導中'
          checked={coachingHistory.isCurrentlyCoaching}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleInputChange(index, 'isCurrentlyCoaching', event.target.checked);
          }}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <InputLabel label='団体名' required />
        <CustomDropdown<number>
          id={`org_name_${coachingHistory.orgCoachingHistoryId}`}
          placeHolder='団体名'
          value={coachingHistory.orgId}
          options={organizationOptions.map((org) => ({
            key: org.org_id,
            value: org.org_name,
          }))}
          onChange={(value: number) => {
            handleInputChange(index, 'orgId', value);
          }}
          widthClassName='w-full md:w-[150px]'
          className='h-12'
        />
      </div>
      <div className='flex flex-col gap-2'>
        <InputLabel label='スタッフ種別' required />
        <CustomDropdown<number>
          id={`org_name_${coachingHistory.orgCoachingHistoryId}`}
          placeHolder='スタッフ種別'
          value={coachingHistory.staffTypeId}
          options={staffOptions}
          onChange={(value: number) => {
            handleInputChange(index, 'staffTypeId', value);
          }}
          widthClassName='w-full md:w-[150px]'
          className='h-12'
        />
      </div>
      <div className='hidden md:block md:mt-10'>
        <RemoveCircleOutlineIcon onClick={() => handleDelete(index)} />
      </div>
    </div>
  );
};

export default CoachingHistory;
