import React, { ChangeEvent } from 'react';
import { InputLabel, CustomDatePicker, CustomDropdown, OriginalCheckbox } from '@/app/components';
import { formatDate } from '@/app/utils/dateUtil';
import { CoachRefereeResponse, SelectOption } from '@/app/types';

interface Props {
  coachingHistory: CoachRefereeResponse['coachingHistories'][number];
  index: number;
  handleInputChange: (index: number, field: string, value: string | number | boolean | null) => void;
  organizationOptions: { org_id: number; org_name: string }[];
  staffOptions: SelectOption[];
}

const CoachingHistory: React.FC<Props> = ({
  coachingHistory,
  index,
  handleInputChange,
  organizationOptions,
  staffOptions,
}) => {
  return (
    <div className='flex flex-col md:flex-row text-wrap gap-5'>
      <h2 className='flex items-center justify-between md:hidden'>
        指導履歴&nbsp;{index + 1}
        <OriginalCheckbox
          id={`delete_coachingHistory${index + 1}`}
          label='削除'
          value='削除'
          checked={coachingHistory.isDeleted}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleInputChange(index, 'isDeleted', event.target.checked);
          }}
        />
      </h2>
      <div className='flex flex-col gap-2'>
        {index === 0 && (
          <div className='hidden md:block'>
            <InputLabel label='開始日' required displayHelp />
          </div>
        )}
        <div className='md:hidden'>
          <InputLabel label='開始日' required displayHelp />
        </div>
        <CustomDatePicker
          selectedDate={coachingHistory.startDate}
          onChange={(date: Date | null) => {
            if (date) {
              const formattedDate = formatDate(date.toISOString(), 'yyyy/MM/dd');
              handleInputChange(index, 'startDate', formattedDate);
            } else {
              handleInputChange(index, 'startDate', null);
            }
          }}
        />
      </div>
      <div className='flex flex-col gap-2'>
        {index === 0 && (
          <div className='hidden md:block'>
            <InputLabel label='終了日' displayHelp />
          </div>
        )}
        <div className='md:hidden'>
          <InputLabel label='終了日' displayHelp />
        </div>
        <CustomDatePicker
          selectedDate={coachingHistory.endDate}
          disabled={coachingHistory.isEndDateUndefined}
          onChange={(date: Date | null) => {
            if (date) {
              const formattedDate = formatDate(date.toISOString(), 'yyyy/MM/dd');
              handleInputChange(index, 'endDate', formattedDate);
            } else {
              handleInputChange(index, 'endDate', null);
            }
          }}
        />
        <OriginalCheckbox
          id={`isEndDateUndefined_${index + 1}`}
          label='終了日未定'
          value='終了日未定'
          checked={coachingHistory.isEndDateUndefined}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleInputChange(index, 'isEndDateUndefined', event.target.checked);
          }}
        />
      </div>
      <div className='flex flex-col gap-2'>
        {index === 0 && (
          <div className='hidden md:block'>
            <InputLabel label='団体名' required />
          </div>
        )}
        <div className='md:hidden'>
          <InputLabel label='団体名' required />
        </div>
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
        {index === 0 && (
          <div className='hidden md:block'>
            <InputLabel label='スタッフ種別' required />
          </div>
        )}
        <div className='md:hidden'>
          <InputLabel label='スタッフ種別' required />
        </div>
        <CustomDropdown<number>
          id={`staff_type_${coachingHistory.orgCoachingHistoryId}`}
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
      <div className='hidden text-nowrap md:flex md:flex-col md:gap-2'>
        {index === 0 && <InputLabel label='削除' />}
        <div className='mt-4'>
          <OriginalCheckbox
            id={`delete_coachingHistory${index + 1}`}
            label=''
            value='削除'
            checked={coachingHistory.isDeleted}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              handleInputChange(index, 'isDeleted', event.target.checked);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CoachingHistory;
