'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CustomDatePicker,
  CustomDropdown,
  CustomButton,
  InputLabel,
  ErrorBox,
  CustomTitle,
} from '@/app/components';
import { Divider } from '@mui/material';

const CoachRefereeInformation = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const [paramError, setParamError] = useState(false);
  const [options, setOptions] = useState<{ value: string; key: number }[] | null>(null);

  const [historyElements, setHistoryElements] = useState<JSX.Element[]>([]);

  const [data, setData] = useState({
    coaching_start_date: '', // 指導開始日
    coaching_end_date: '', // 指導終了日
    belong_organization: '', // 所属団体
    staff_type: '', // スタッフ種別
    qualification_name: '', // 資格名
    qualification_get_date: '', // 取得日
    qualification_expiry_date: '', // 有効期限
  });

  const handleInputChange = (field: string, value: string) => {
    setData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const formatDate = (dt: Date | null | undefined): string => {
    if (!dt) {
      return '';
    }

    const y = dt.getFullYear();
    const m = ('00' + (dt.getMonth() + 1)).slice(-2);
    const d = ('00' + dt.getDate()).slice(-2);
    return `${y}/${m}/${d}`;
  };

  useEffect(() => {
    const fetchOptions = async () => {
      const data = [
        { value: 'JARA', key: 1 },
        { value: 'JARA2', key: 2 },
        { value: 'JARA3', key: 3 },
      ];
      setOptions(data);
    };
    fetchOptions();
  }, []);

  const handleAddClick = () => {
    setHistoryElements((prev) => [
      ...prev,
      // keyは取得元のidを指定する
      <div className='flex text-wrap' key={prev.length}>
        <div className='mr-5'>
          <InputLabel
            label='開始日'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
          />
          {/* FIXME CustomDatePickerで日付を選択した際に即時反映させる */}
          <CustomDatePicker
            readonly={mode === 'confirm'}
            placeHolder={new Date().toLocaleDateString('ja-JP')}
            selectedDate={data.coaching_start_date}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleInputChange('coaching_start_date', formatDate(e as unknown as Date));
            }}
          />
        </div>
        <div className='mr-5'>
          <InputLabel
            label='終了日'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
          />
          <CustomDatePicker
            readonly={mode === 'confirm'}
            placeHolder='2024/01/31'
            selectedDate={data.coaching_end_date}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleInputChange('coaching_end_date', formatDate(e as unknown as Date));
            }}
          />
        </div>
        <div className='mr-5'>
          <InputLabel label='団体名' required={mode !== 'confirm'} />
          <CustomDropdown
            id='団体名'
            placeHolder='団体名'
            options={options || []}
            widthClassName='w-[150px]'
            className='h-12'
          />
        </div>
        <div className=''>
          <InputLabel label='スタッフ種別' required={mode !== 'confirm'} />
          <CustomDropdown
            id='スタッフ種別'
            placeHolder='スタッフ種別'
            options={options || []}
            widthClassName='w-[150px]'
            className='h-12'
          />
        </div>
      </div>,
    ]);
  };

  useEffect(() => {
    if (!['update', 'confirm'].includes(mode || '')) {
      setParamError(true);
    }
  }, [mode]);

  const modeCustomButtons = {
    update: (
      <CustomButton
        buttonType='primary'
        onClick={() => {
          router.push('/coachRefereeInformation?mode=confirm');
        }}
      >
        確認
      </CustomButton>
    ),
    confirm: (
      <CustomButton
        buttonType='primary'
        onClick={() => {
          // 更新系の処理を記載する
          router.push('/coachRefereeRef');
        }}
      >
        更新
      </CustomButton>
    ),
  };

  if (paramError) {
    return <div>ページが見つかりません</div>;
  }
  return (
    <>
      <div className='flex flex-col justify-start gap-[20px]'>
        <ErrorBox errorText={errorMessage} />
        <div className='flex flex-row justify-start gap-[20px]'>
          {/* 画面名 */}
          <CustomTitle displayBack>
            {mode === 'update' && '指導者・審判情報更新'}
            {mode === 'confirm' && '指導者・審判情報確認'}
            {paramError && 'エラー: 無効なモード'}
          </CustomTitle>
        </div>
        {mode === 'update' && (
          <>
            <div className='flex items-center gap-2'>
              <h2>指導履歴</h2>
              <CustomButton
                buttonType='primary'
                className='h-10 w-[5rem] text-sm'
                onClick={handleAddClick}
              >
                追加する
              </CustomButton>
            </div>
            {historyElements.map((element) => element)}
            <div className='flex items-center gap-2 mt-10'>
              <h2>指導者資格</h2>
              <CustomButton buttonType='primary' className='h-10 w-[5rem] text-sm'>
                追加する
              </CustomButton>
            </div>

            <div className='flex items-center gap-2 mt-10'>
              <h2>審判資格</h2>
              <CustomButton buttonType='primary' className='h-10 w-[5rem] text-sm'>
                追加する
              </CustomButton>
            </div>
          </>
        )}
        {mode === 'confirm' && (
          <>
            <h2 className='font-bold text-xl mt-6'>指導履歴</h2>
          </>
        )}
      </div>
      <Divider className='h-[1px] bg-border ' />
      <div className='flex gap-4 justify-center'>
        <CustomButton
          buttonType='white-outlined'
          onClick={() => {
            router.back();
          }}
        >
          戻る
        </CustomButton>
        {modeCustomButtons[mode as keyof typeof modeCustomButtons]}
      </div>
    </>
  );
};

export default CoachRefereeInformation;
