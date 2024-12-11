'use client';

import React, { FormEvent, useState } from 'react';
import { CustomButton, CustomTextField, InputLabel } from '@/app/components';
import {
  ICoachQualification,
  IRefereeQualification,
  CoachRefereeResponse,
  SelectOption,
  OrganizationListData,
} from '@/app/types';
import CoachingHistory from './CoachingHistory';
import CoachQualification from './CoachQualification';
import RefereeQualification from './RefereeQualification';
import { useRouter } from 'next/navigation';
import { Divider } from '@mui/material';
import { getSessionStorage, getStorageKey, setSessionStorage } from '@/app/utils/sessionStorage';

interface UpdateViewProps {
  coachRefereeInfoList: CoachRefereeResponse;
  coachQualifications: SelectOption<number>[];
  refereeQualifications: SelectOption<number>[];
  organizations: OrganizationListData[];
  staffs: SelectOption<number>[];
}

const storageKey = getStorageKey({
  pageName: 'coachReferee',
  type: 'create',
});

const UpdateView: React.FC<UpdateViewProps> = ({
  coachRefereeInfoList,
  coachQualifications,
  refereeQualifications,
  organizations,
  staffs,
}) => {
  const router = useRouter();
  // FIXME: エラーメッセージを考慮する
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const draftFormData = getSessionStorage<CoachRefereeResponse>(storageKey);

  const [fetchData, setFetchData] = useState<CoachRefereeResponse>({
    jspoId: draftFormData?.jspoId || 0,
    coachingHistories: draftFormData?.coachingHistories || [],
    coachQualifications: draftFormData?.coachQualifications || [],
    refereeQualifications: draftFormData?.refereeQualifications || [],
  });

  const handleCoachingHistoryChange = (
    index: number,
    field: string,
    value: string | number | boolean,
  ) => {
    setFetchData((prevData) => {
      const updatedHistory = prevData.coachingHistories.map((history, i) =>
        i === index ? { ...history, [field]: value } : history,
      );
      return {
        ...prevData,
        coachingHistories: updatedHistory,
      };
    });
  };

  const handleUpdatedQualificationsChange = (
    index: number,
    field: string,
    value: string | number | boolean,
  ) => {
    setFetchData((prevData) => {
      const updatedQualifications = prevData.coachQualifications.map((qualification, i) =>
        i === index ? { ...qualification, [field]: value } : qualification,
      );
      return {
        ...prevData,
        coachQualifications: updatedQualifications,
      };
    });
  };

  const handleUpdatedRefereeQualificationsChange = (
    index: number,
    field: string,
    value: string | number | boolean,
  ) => {
    setFetchData((prevData) => {
      const updatedRefereeQualifications = prevData.refereeQualifications.map((qualification, i) =>
        i === index ? { ...qualification, [field]: value } : qualification,
      );
      return {
        ...prevData,
        refereeQualifications: updatedRefereeQualifications,
      };
    });
  };

  const addCoachingHistory = () => {
    const newElement: CoachRefereeResponse['coachingHistories'][number] = {
      startDate: '',
      endDate: '',
      orgId: 0,
      staffTypeId: 0,
      orgCoachingHistoryId: 0,
      isNewRow: true,
      isDeleted: false,
      isCurrentlyCoaching: false,
    };
    setFetchData((prevData) => ({
        ...prevData,
        coachingHistories: [newElement, ...prevData.coachingHistories],
    }));
  };

  const addCoachQualification = () => {
    const newElement: ICoachQualification = {
      heldCoachQualificationId: 0,
      coachQualificationId: 0,
      acquisitionDate: '',
      expiryDate: '',
      isNewRow: true,
      isDeleted: false,
    };
    setFetchData((prevData) => ({
      ...prevData,
      coachQualifications: [newElement, ...prevData.coachQualifications],
    }));
  };

  const addRefereeQualification = () => {
    const newElement: IRefereeQualification = {
      heldRefereeQualificationId: 0,
      refereeQualificationId: 0,
      acquisitionDate: '',
      expiryDate: '',
      isNewRow: true,
      isDeleted: false,
    };
    setFetchData((prevData) => ({
      ...prevData,
      refereeQualifications: [newElement, ...prevData.refereeQualifications],
    }));
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSessionStorage(storageKey, fetchData);
    router.push(`/coachReferee?mode=confirm&type=create&storageKey=${storageKey}`);
  }

  return (
    <form onSubmit={onSubmit} className='flex flex-col gap-8'>
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
            <CoachingHistory
              key={index}
              coachingHistory={coachingHistory}
              index={index}
              handleInputChange={handleCoachingHistoryChange}
              organizationOptions={organizations}
              staffOptions={staffs}
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
        {fetchData.coachQualifications.length > 0 && (
          <div className='flex flex-col gap-4 mb-2'>
            <InputLabel label='JSPO ID' required />
            <CustomTextField
              placeHolder='12345'
              value={String(fetchData.jspoId)}
              widthClassName='w-full md:w-[150px]'
              onChange={(event) =>
                setFetchData({ ...fetchData, jspoId: Number(event.target.value) })
              }
            />
          </div>
        )}
        <div className='flex flex-col gap-4'>
          {fetchData.coachQualifications.map((coachQualification, index) => (
            <CoachQualification
              key={index}
              coachQualification={coachQualification}
              index={index}
              coachQualificationOptions={coachQualifications}
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
          {fetchData.refereeQualifications.map((refereeQualification, index) => (
            <RefereeQualification
              key={index}
              refereeQualification={refereeQualification}
              index={index}
              refereeQualificationsOptions={refereeQualifications}
              handleInputChange={handleUpdatedRefereeQualificationsChange}
            />
          ))}
        </div>
      </div>
      <Divider className='h-[1px] bg-border ' />
      <div className='flex flex-col gap-4 items-center justify-center md:flex-row'>
        <CustomButton buttonType='white-outlined' onClick={() => router.back()}>
          戻る
        </CustomButton>
        <CustomButton buttonType='primary' type='submit'>
          確認
        </CustomButton>
      </div>
    </form>
  );
};

export default UpdateView;
