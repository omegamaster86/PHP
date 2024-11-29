import React from 'react';
import { InputLabel, CustomDatePicker, CustomDropdown, OriginalCheckbox } from '@/app/components';
import { formatDate } from '@/app/utils/dateUtil';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { CoachRefereeHistoryResponse } from '@/app/types';

interface Props {
  coachingHistory: CoachRefereeHistoryResponse['coachingHistories'][number];
  index: number;
  options: { value: string; key: number }[] | null;
  handleInputChange: (index: number, field: string, value: string | boolean) => void;
}

const CoachHistory: React.FC<Props> = ({
  coachingHistory,
  index,
  options,
  handleInputChange,
}) => {
  return (
    <div className='flex flex-col md:flex-row text-wrap gap-5'>
      <div className='flex md:hidden'>
        <h2>指導履歴</h2>
        <span>{coachingHistory.orgCoachingHistoryId}</span>
      </div>
      <div className='flex flex-col gap-2'>
        <InputLabel label='開始日' required displayHelp />
        <CustomDatePicker
          placeHolder='2024/01/31'
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
          placeHolder='2024/06/31'
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
          id='coaching'
          label='現在指導中'
          value='現在指導中'
          checked={coachingHistory.isCurrentlyCoaching}
          onChange={() => {
            handleInputChange(index, 'isCurrentlyCoaching', !coachingHistory.isCurrentlyCoaching);
            if (!coachingHistory.isCurrentlyCoaching) {
              handleInputChange(index, 'endDate', '');
            }
          }}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <InputLabel label='団体名' required />
        <CustomDropdown
          id={String(coachingHistory.orgCoachingHistoryId)}
          placeHolder='団体名'
          options={options || []}
          widthClassName='w-full md:w-[150px]'
          className='h-12'
        />
      </div>
      <div className='flex flex-col gap-2'>
        <InputLabel label='スタッフ種別' required />
        <CustomDropdown
          id={String(coachingHistory.orgCoachingHistoryId)}
          placeHolder='スタッフ種別'
          options={options || []}
          widthClassName='w-full md:w-[150px]'
          className='h-12'
        />
      </div>
      <div className='md:mt-10 md:block hidden'>
        <RemoveCircleOutlineIcon />
      </div>
    </div>
  );
};

export default CoachHistory;
