'use client';

import React, { FormEvent, useState } from 'react';
import { CustomButton, CustomTextField, CustomTitle, ErrorBox, InputLabel } from '@/app/components';
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
import { setSessionStorage } from '@/app/utils/sessionStorage';
import useSWR from 'swr';
import { fetcher } from '@/app/lib/swr';

interface UpdateViewProps {
  coachQualifications: SelectOption<number>[];
  refereeQualifications: SelectOption<number>[];
  organizations: OrganizationListData[];
  staffs: SelectOption<number>[];
  storageKey: string;
  parsedData: CoachRefereeResponse | null;
}

const UpdateView: React.FC<UpdateViewProps> = ({
  coachQualifications,
  refereeQualifications,
  organizations,
  staffs,
  storageKey,
  parsedData,
}) => {
  const router = useRouter();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const { data: coachRefereeInfoListRes } = useSWR(
    {
      url: `getUpdateCoachRefereeInfoList`,
    },
    fetcher<CoachRefereeResponse>,
    { suspense: true },
  );
  const coachRefereeInfoList = coachRefereeInfoListRes?.result && {
    ...coachRefereeInfoListRes.result,
    coachingHistories: coachRefereeInfoListRes.result.coachingHistories.map((history) => ({
      ...history,
      isCurrentlyCoaching: history.endDate === null,
      isDeleted: false,
    })),
    coachQualifications: coachRefereeInfoListRes.result.coachQualifications.map(
      (qualification) => ({
        ...qualification,
        isDeleted: false,
      }),
    ),
    refereeQualifications: coachRefereeInfoListRes.result.refereeQualifications.map(
      (qualification) => ({
        ...qualification,
        isDeleted: false,
      }),
    ),
  };

  const [fetchData, setFetchData] = useState<CoachRefereeResponse>({
    jspoId: parsedData?.jspoId || coachRefereeInfoList.jspoId,
    coachingHistories: parsedData?.coachingHistories || coachRefereeInfoList.coachingHistories,
    coachQualifications:
      parsedData?.coachQualifications || coachRefereeInfoList.coachQualifications,
    refereeQualifications:
      parsedData?.refereeQualifications || coachRefereeInfoList.refereeQualifications,
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

    const errors: string[] = [];

    const coachDuplicateIds = new Set<number>();
    const refereeDuplicateIds = new Set<number>();

    fetchData.coachingHistories.forEach((history, index) => {
      if (!history.startDate) {
        errors.push(`指導履歴 ${index + 1}番目の開始日を入力してください。`);
      }
      if (history.orgId <= 0) {
        errors.push(`指導履歴 ${index + 1}番目の団体を選択してください。`);
      }
      if (history.staffTypeId <= 0) {
        errors.push(`指導履歴 ${index + 1}番目のスタッフ種別を選択してください。`);
      }
    });

    fetchData.coachQualifications.forEach((qualification, index) => {
      if (qualification.coachQualificationId <= 0) {
        errors.push(`指導者資格 ${index + 1}番目の資格を選択してください。`);
      }
      if (!qualification.acquisitionDate) {
        errors.push(`指導者資格 ${index + 1}番目の取得日を入力してください。`);
      }

      if (!coachDuplicateIds.add(qualification.coachQualificationId)) {
        errors.push(`指導者資格の中で重複している資格があります。`);
      }
    });

    if (fetchData.coachQualifications.length > 0 && !fetchData.jspoId) {
      errors.push('指導者資格がある場合は、JSPO IDを入力してください。');
    }

    fetchData.refereeQualifications.forEach((qualification, index) => {
      if (qualification.refereeQualificationId <= 0) {
        errors.push(`審判資格 ${index + 1}番目の資格を選択してください。`);
      }
      if (!qualification.acquisitionDate) {
        errors.push(`審判資格 ${index + 1}番目の取得日を入力してください。`);
      }

      if (!refereeDuplicateIds.add(qualification.refereeQualificationId)) {
        errors.push(`審判資格の中で重複している資格があります。`);
      }
    });

    setErrorMessages(errors);

    if (errors.length > 0) {
      return;
    }

    setSessionStorage(storageKey, fetchData);
    router.push('/coachReferee?mode=confirm');
  }

  return (
    <>
      <ErrorBox errorText={errorMessages} />

      <CustomTitle displayBack>指導者・審判情報更新</CustomTitle>

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
    </>
  );
};

export default UpdateView;
