import React from 'react';
import {
  CustomTable,
  CustomThead,
  CustomTh,
  CustomTr,
  CustomTbody,
  CustomTd,
  OriginalCheckbox,
} from '@/app/components';
import Link from 'next/link';
import { StaffRef } from '@/app/types';
import { useUserType } from '@/app/hooks/useUserType';

interface Props {
  staffs: StaffRef[];
}

export const BelongStaff: React.FC<Props> = ({ staffs }) => {
  const userType = useUserType();
  const showPermission = userType?.isPrefBoatOfficer || userType?.isJara;

  return (
    <>
      <div className='w-full bg-secondary-500 text-white h-[40px] flex justify-center items-center font-bold'>
        所属スタッフ
      </div>
      <div className='overflow-auto'>
        <CustomTable>
          <CustomThead>
            <CustomTr>
              <CustomTh align='center' rowSpan={2}>
                ユーザーID
              </CustomTh>
              <CustomTh align='center' rowSpan={2}>
                ユーザー名
              </CustomTh>
              <CustomTh align='center' colSpan={5}>
                役職
              </CustomTh>
              {showPermission && (
                <CustomTh align='center' colSpan={3}>
                  資格
                </CustomTh>
              )}
            </CustomTr>
            <CustomTr>
              <CustomTh align='center'>管理者(監督)</CustomTh>
              <CustomTh align='center'>部長</CustomTh>
              <CustomTh align='center'>コーチ</CustomTh>
              <CustomTh align='center'>マネージャー</CustomTh>
              <CustomTh align='center'>管理代理</CustomTh>
              {showPermission && (
                <>
                  <CustomTh align='center'>JSPO ID</CustomTh>
                  <CustomTh align='center'>指導者</CustomTh>
                  <CustomTh align='center'>審判</CustomTh>
                </>
              )}
            </CustomTr>
          </CustomThead>
          <CustomTbody>
            {staffs.map((row, index) => (
              <CustomTr key={index}>
                <CustomTd>
                  <Link
                    className='text-primary-300 underline hover:text-primary-50'
                    href={`/coachRefereeRef?userId=${row.user_id}`}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {row.user_id}
                  </Link>
                </CustomTd>
                <CustomTd>
                  <Link
                    className='text-primary-300 underline hover:text-primary-50'
                    href={`/coachRefereeRef?userId=${row.user_id}`}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {row.user_name}
                  </Link>
                </CustomTd>
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='staffType1'
                    value='監督'
                    onChange={() => {}}
                    checked={row.staff_type_id.includes('監督')}
                    readonly={true}
                  ></OriginalCheckbox>
                </CustomTd>
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='staffType2'
                    value='部長'
                    onChange={() => {}}
                    checked={row.staff_type_id.includes('部長')}
                    readonly={true}
                  ></OriginalCheckbox>
                </CustomTd>
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='staffType3'
                    value='コーチ'
                    onChange={() => {}}
                    checked={row.staff_type_id.includes('コーチ')}
                    readonly={true}
                  ></OriginalCheckbox>
                </CustomTd>
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='staffType4'
                    value='マネージャー'
                    onChange={() => {}}
                    checked={row.staff_type_id.includes('マネージャー')}
                    readonly={true}
                  ></OriginalCheckbox>
                </CustomTd>
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='staffType5'
                    value='管理代理'
                    onChange={() => {}}
                    checked={row.staff_type_id.includes('管理代理')}
                    readonly={true}
                  ></OriginalCheckbox>
                </CustomTd>
                {showPermission && (
                  <>
                    <CustomTd>{row.jspo_id}</CustomTd>
                    <CustomTd>{row.coachQualificationNames.join(', ')}</CustomTd>
                    <CustomTd>{row.refereeQualificationNames.join(', ')}</CustomTd>
                  </>
                )}
              </CustomTr>
            ))}
          </CustomTbody>
        </CustomTable>
      </div>
    </>
  );
};
