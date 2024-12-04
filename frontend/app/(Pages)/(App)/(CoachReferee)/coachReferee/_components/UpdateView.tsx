'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import { CustomButton, CustomTextField, InputLabel } from '@/app/components';
import { ICoachQualification, IRefereeQualification, CoachRefereeResponse, SelectOption } from '@/app/types';
import useSWR from 'swr';
import { fetcher } from '@/app/lib/swr';
import CoachingHistory from './CoachingHistory';
import useSWRMutation from 'swr/mutation';
import CoachQualification from './CoachQualification';
import RefereeQualification from './RefereeQualification';

type OrganizationListData = {
  org_id: number;
  org_name: string;
}[];

const UpdateView = () => {
  const { data } = useSWR(
    {
      url: `getUpdateCoachRefereeInfoList`,
    },
    fetcher<CoachRefereeResponse>,
  );
  const { data: coachQualificationData } = useSWR(
    {
      url: `getCoachQualifications`,
    },
    fetcher<SelectOption[]>,
  );
  const { data: refereeQualificationData } = useSWR(
    {
      url: `getRefereeQualifications`,
    },
    fetcher<SelectOption[]>,
  );

  const { data: organizationData } = useSWR(
    {
      url: `getOrganizationListData`,
    },
    fetcher<OrganizationListData>,
  );

  const { data: staffData } = useSWR(
    {
      url: `getStaffTypes`,
    },
    fetcher<SelectOption[]>,
  );

  // FIXME: エラーメッセージを考慮する
  const [errorMessage, setErrorMessage] = useState([] as string[]);

  const [fetchData, setFetchData] = useState<CoachRefereeResponse>({
    jspoId: 0,
    coachingHistories: [],
    coachQualifications: [],
    refereeQualifications: [],
  });

  useEffect(() => {
    if (data?.result) {
      setFetchData({
        jspoId: data.result.jspoId,
        coachingHistories: data.result.coachingHistories.map((history) => ({
          ...history,
          isCurrentlyCoaching: history.endDate === null,
        })),
        coachQualifications: data.result.coachQualifications || [],
        refereeQualifications: data.result.refereeQualifications || [],
      });
    }
  }, [data]);

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
  // const deleteRequest = async (
  //   url: string,
  //   trigger: { arg: { jspoId: number; orgCoachingHistoryId: number; isDeleted: boolean } },
  // ) => {
  //   const payload = {
  //     coachingHistories: fetchData.coachingHistories,
  //     coachQualifications: fetchData.coachQualifications,
  //     refereeQualifications: fetchData.refereeQualifications,
  //     jspoId: fetchData.jspoId,
  //   };

  //   console.log('送信データ:', JSON.stringify(payload, null, 2));

  //   return fetcher({
  //     url,
  //     method: 'PATCH',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(payload),
  //   });
  // };

  // const { trigger } = useSWRMutation('/updateCoachRefereeInfo', deleteRequest);

  const handleDelete = () => {
    console.log('削除');
  };

  // const sendUpdateRequest = async () => {
  //   const payload = {
  //     coachingHistories: fetchData.coachingHistories,
  //     coachQualifications: fetchData.coachQualifications,
  //     refereeQualifications: fetchData.refereeQualifications,
  //     jspoId: fetchData.jspoId,
  //   };

  //   console.log('送信データ:', JSON.stringify(payload, null, 2));

  //   try {
  //     const response = await fetch('/updateCoachRefereeInfo', {
  //       method: 'PATCH',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTPエラー: ${response.status}`);
  //     }

  //     const responseData = await response.json();
  //     console.log('サーバーからのレスポンス:', responseData);
  //     return responseData;
  //   } catch (error) {
  //     console.error('リクエストエラー:', error);
  //     throw error;
  //   }
  // };

  // const handleDelete = async () => {
  //   try {
  //     const result = await sendUpdateRequest();
  //     console.log('更新が成功しました:', result);
  //   } catch (error) {
  //     console.error('更新中にエラーが発生しました:', error);
  //   }
  // };

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
      orgName: '',
      staffTypeId: 0,
      staffTypeName: '',
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
      qualName: '',
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
      qualName: '',
      isNewRow: true,
      isDeleted: false,
    };
    setFetchData((prevData) => ({
      ...prevData,
      refereeQualifications: [newElement, ...prevData.refereeQualifications],
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
            <CoachingHistory
              key={index}
              coachingHistory={coachingHistory}
              index={index}
              handleInputChange={handleCoachingHistoryChange}
              handleDelete={handleDelete}
              organizationOptions={organizationData?.result || []}
              staffOptions={staffData?.result || []}
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
            />
          </div>
        )}
        <div className='flex flex-col gap-4'>
          {fetchData.coachQualifications.map((coachQualification, index) => (
            <CoachQualification
              key={index}
              coachQualification={coachQualification}
              index={index}
              coachQualificationOptions={coachQualificationData?.result || []}
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
              refereeQualificationsOptions={refereeQualificationData?.result || []}
              handleInputChange={handleUpdatedRefereeQualificationsChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdateView;
