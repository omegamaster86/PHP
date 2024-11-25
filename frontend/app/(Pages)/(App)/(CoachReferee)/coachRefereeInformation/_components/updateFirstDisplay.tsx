'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CustomDatePicker, CustomDropdown, CustomButton, InputLabel } from '@/app/components';
import { formatDate } from '@/app/utils/dateUtil';
import { CoachingHistory } from '@/app/types';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

type CoachingHistoryWithoutId = Omit<CoachingHistory, 'orgCoachingHistoryId'>;
type Mode = 'update' | 'confirm';

interface Props {
  coachingHistory: CoachingHistoryWithoutId[];
}
const UpdateFirstDisplay = () => {
  // FIXME: エラーメッセージを考慮する
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as Mode;

  const [data, setData] = useState<Props>({
    coachingHistory: [],
  });

  const [options, setOptions] = useState<{ value: string; key: number }[] | null>(null);

  const handleInputChange = (index: number, field: string, value: string) => {
    setData((prevData) => {
      const updatedHistory = [...prevData.coachingHistory];
      updatedHistory[index] = {
        ...updatedHistory[index],
        [field]: value,
      };
      return {
        ...prevData,
        coachingHistory: updatedHistory,
      };
    });
  };

  useEffect(() => {
    const fetchOptions = async () => {
      const optionsData = [
        { value: 'JARA', key: 1 },
        { value: 'JARA2', key: 2 },
        { value: 'JARA3', key: 3 },
      ];
      setOptions(optionsData);
    };
    fetchOptions();
  }, []);

  const addHistoryElement = () => {
    const newElement: CoachingHistoryWithoutId = {
      startDate: '',
      endDate: '',
      orgName: '',
      staffTypeName: '',
    };
    setData((prevData) => ({
      ...prevData,
      coachingHistory: [...prevData.coachingHistory, newElement],
    }));
  };

  const renderHistoryElements = () => {
    return data.coachingHistory.map((element, index) => (
      <div className='flex text-wrap gap-5' key={index}>
        <div>
          <InputLabel
            label='開始日'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
          />
          <CustomDatePicker
            readonly={mode === 'confirm'}
            placeHolder='2024/01/31'
            selectedDate={element.startDate}
            onChange={(date: Date | null) => {
              if (date) {
                const formattedDate = formatDate(date.toISOString(), 'yyyy/MM/dd');
                handleInputChange(index, 'startDate', formattedDate);
              }
            }}
          />
        </div>
        <div>
          <InputLabel
            label='終了日'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
          />
          <CustomDatePicker
            readonly={mode === 'confirm'}
            placeHolder='2024/06/31'
            selectedDate={element.endDate}
            onChange={(date: Date | null) => {
              if (date) {
                const formattedDate = formatDate(date.toISOString(), 'yyyy/MM/dd');
                handleInputChange(index, 'endDate', formattedDate);
              }
            }}
          />
        </div>
        <div>
          <InputLabel label='団体名' required={mode !== 'confirm'} />
          <CustomDropdown
            id={`organization_${index}`}
            placeHolder='団体名'
            options={options || []}
            widthClassName='w-[150px]'
            className='h-12'
          />
        </div>
        <div>
          <InputLabel label='スタッフ種別' required={mode !== 'confirm'} />
          <CustomDropdown
            id={`organization_${index}`}
            placeHolder='スタッフ種別'
            options={options || []}
            widthClassName='w-[150px]'
            className='h-12'
          />
        </div>
        <RemoveCircleOutlineIcon className='mt-8 '/>
      </div>
    ));
  };

  return (
    <>
      {mode === 'update' && (
        <>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <h2>指導履歴</h2>
              <CustomButton
                buttonType='primary'
                className='h-10 w-[5rem] text-sm'
                onClick={addHistoryElement}
              >
                追加する
              </CustomButton>
            </div>
            <div className='flex flex-col gap-4'>{renderHistoryElements()}</div>
          </div>
          <div className='flex items-center gap-2'>
            <h2>指導者資格</h2>
            <CustomButton buttonType='primary' className='h-10 w-[5rem] text-sm'>
              追加する
            </CustomButton>
          </div>
          <div className='flex items-center gap-2 mb-12'>
            <h2>審判資格</h2>
            <CustomButton buttonType='primary' className='h-10 w-[5rem] text-sm'>
              追加する
            </CustomButton>
          </div>
        </>
      )}
    </>
  );
};

export default UpdateFirstDisplay;
