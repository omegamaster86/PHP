'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CustomButton } from '@/app/components';
import {
  CoachingHistory,
  CoachQualification,
  RefereeQualification,
  CoachRefereeHistoryResponse,
} from '@/app/types';
import useSWR from 'swr';
import { fetcher } from '@/app/lib/swr';
import CoachHistory from './CoachHistory';
import QualificationElement from './QualificationsElement';
import RefereeQualificationsElement from './RefereeQualificationsElement';

type Mode = 'update' | 'confirm';

const UpdateView = () => {
  const { data } = useSWR(
    {
      url: `getUpdateCoachRefereeInfoList`,
    },
    fetcher<CoachRefereeHistoryResponse>,
  );
  console.log(data?.result);
  // FIXME: エラーメッセージを考慮する
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as Mode;

  const [fetchData, setFetchData] = useState<CoachRefereeHistoryResponse>({
    jspoId: 0, 
    coachingHistories: [],
    coachQualifications: [],
    refereeQualifications: [],
  });

  const [options, setOptions] = useState<{ value: string; key: number }[] | null>(null);

  const handleInputChange = (id: number, field: string, value: string | boolean) => {
    setFetchData((prevData) => {
      const updatedHistory = prevData.coachingHistories.map((history) =>
        history.orgCoachingHistoryId === id ? { ...history, [field]: value } : history,
      );
      return {
        ...prevData,
        coachingHistories: updatedHistory,
      };
    });
  };

  const handleUpdatedQualificationsChange = (id: number, field: string, value: string) => {
    setFetchData((prevData) => {
      const updatedQualifications = prevData.coachQualifications.map((qualification) =>
        qualification.heldCoachQualificationId === id
          ? { ...qualification, [field]: value }
          : qualification,
      );
      return {
        ...prevData,
        coachQualifications: updatedQualifications,
      };
    });
  };

  const handleUpdatedRefereeQualificationsChange = (id: number, field: string, value: string) => {
    setFetchData((prevData) => {
      const updatedRefereeQualifications = prevData.refereeQualifications.map((qualification) =>
        qualification.heldRefereeQualificationId === id
          ? { ...qualification, [field]: value }
          : qualification,
      );
      return {
        ...prevData,
        refereeQualifications: updatedRefereeQualifications,
      };
    });
  };

  const addCoachingHistory = () => {
    const newElement: CoachRefereeHistoryResponse['coachingHistories'][number] = {
      startDate: '',
      endDate: '',
      orgName: '',
      staffTypeName: '',
      isCurrentlyCoaching: false,
      orgCoachingHistoryId: 0,
      isNewRow: true,
    };
    setFetchData((prevData) => ({
      ...prevData,
      coachingHistories: [...prevData.coachingHistories, newElement],
    }));
  };

  const addCoachQualification = () => {
    const newElement: CoachQualification = {
      heldCoachQualificationId: 0,
      acquisitionDate: '',
      expiryDate: '',
      qualName: '',
      isNewRow: true,
    };
    setFetchData((prevData) => ({
      ...prevData,
      coachQualifications: [...prevData.coachQualifications, newElement],
    }));
  };

  const addRefereeQualification = () => {
    const newElement: RefereeQualification = {
      heldRefereeQualificationId: 0,
      acquisitionDate: '',
      expiryDate: '',
      qualName: '',
      isNewRow: true,
    };
    setFetchData((prevData) => ({
      ...prevData,
      refereeQualifications: [...prevData.refereeQualifications, newElement],
    }));
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <h2>指導履歴</h2>
          <CustomButton
            buttonType='primary'
            className='h-10 w-[5rem] text-sm'
            onClick={addCoachingHistory}
          >
            追加する
          </CustomButton>
        </div>
        <div className='flex flex-col gap-4'>
          {fetchData.coachingHistories.map((coachingHistory, index) => (
            <CoachHistory
              key={index}
              coachingHistory={coachingHistory}
              index={index}
              options={options}
              handleInputChange={handleInputChange}
            />
          ))}
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <h2>指導者資格</h2>
          <CustomButton
            buttonType='primary'
            className='h-10 w-[5rem] text-sm'
            onClick={addCoachQualification}
          >
            追加する
          </CustomButton>
        </div>
        <div className='flex flex-col gap-4'>
          {fetchData.coachQualifications.map((CoachQualification, index) => (
            <QualificationElement
              key={index}
              CoachQualification={CoachQualification}
              index={index}
              options={options}
              handleInputChange={handleUpdatedQualificationsChange}
            />
          ))}
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <h2>審判資格</h2>
          <CustomButton
            buttonType='primary'
            className='h-10 w-[5rem] text-sm'
            onClick={addRefereeQualification}
          >
            追加する
          </CustomButton>
        </div>
        <div className='flex flex-col gap-4'>
          {fetchData.refereeQualifications.map((RefereeQualification, index) => (
            <RefereeQualificationsElement
              key={index}
              RefereeQualification={RefereeQualification}
              index={index}
              options={options}
              handleInputChange={handleUpdatedRefereeQualificationsChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdateView;
