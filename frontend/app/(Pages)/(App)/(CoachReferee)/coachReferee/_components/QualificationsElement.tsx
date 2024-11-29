import React from 'react';
import { InputLabel, CustomDropdown, CustomDatePicker } from '@/app/components';
import { CoachQualification, CoachingHistory } from '@/app/types';
import { formatDate } from '@/app/utils/dateUtil';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import useSWR from 'swr';
import { useAuth } from '@/app/hooks/auth';
import { fetcher } from '@/app/lib/swr';

interface QualificationElementProps {
  CoachQualification: CoachQualification;
  index: number;
  options: { value: string; key: number }[] | null;
  handleInputChange: (index: number, field: string, value: string) => void;
}

// type CoachingHistoryAddCurrentlyCoaching = CoachingHistory & {
//   isCurrentlyCoaching: boolean;
// };

const QualificationElement: React.FC<QualificationElementProps> = ({
  CoachQualification,
  index,
  options,
  handleInputChange,
}) => {
  const { data } = useSWR(
    {
      url: `getUpdateCoachRefereeInfoList`,
    },
    fetcher<CoachQualification>,
  );
  console.log(data?.result);

  return (
    <div className='flex flex-col md:flex-row text-wrap gap-5' key={index}>
      <div className='flex justify-between md:hidden'>
        <h2>指導者資格{}</h2>
        <div className='md:hidden'>
          <RemoveCircleOutlineIcon />
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <InputLabel label='資格名' required />
        <CustomDropdown
          id={String(data?.result.heldCoachQualificationId)}
          placeHolder='資格名'
          options={
            Array.isArray(data?.result)
              ? data.result.map((qual) => ({
                  value: qual.heldCoachQualificationId,
                  key: qual.qualName,
                }))
              : []
          }
          widthClassName='w-full md:w-[150px]'
          className='h-12'
        />
      </div>
      <div className='flex flex-col gap-2'>
        <InputLabel label='取得日' required displayHelp />
        <CustomDatePicker
          placeHolder='2024/01/31'
          selectedDate={CoachQualification.acquisitionDate || ''}
          onChange={(date: Date | null) => {
            if (date) {
              const formattedDate = formatDate(date.toISOString(), 'yyyy/MM/dd');
              handleInputChange(index, 'acquisitionDate', formattedDate);
            }
          }}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <InputLabel label='有効期限日' displayHelp/>
        <CustomDatePicker
          placeHolder='2024/06/31'
          selectedDate={CoachQualification.expiryDate}
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

export default QualificationElement;
