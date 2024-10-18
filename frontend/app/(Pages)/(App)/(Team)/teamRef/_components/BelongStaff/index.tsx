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

interface Staff {
  user_id: string;
  user_name: string;
  staff_type_id: string[];
}

interface Props {
  staffs: Staff[];
}

export const BelongStaff: React.FC<Props> = ({ staffs }) => {
  return (
    <>
      <div className='w-full bg-secondary-500 text-white h-[40px] flex justify-center items-center font-bold'>
        所属スタッフ
      </div>
      <div className='overflow-auto'>
        <CustomTable>
          <CustomThead>
            <CustomTr>
              <CustomTh align='center'>ユーザーID</CustomTh>
              <CustomTh align='center'> ユーザー名</CustomTh>
              <CustomTh align='center'>管理者(監督)</CustomTh>
              <CustomTh align='center'> 部長</CustomTh>
              <CustomTh align='center'>コーチ</CustomTh>
              <CustomTh align='center'>マネージャー</CustomTh>
              <CustomTh align='center'>管理代理</CustomTh>
            </CustomTr>
          </CustomThead>
          <CustomTbody>
            {staffs.map((row, index) => (
              <CustomTr key={index}>
                <CustomTd align='center'>{row.user_id}</CustomTd>
                <CustomTd align='center'>{row.user_name}</CustomTd>
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
              </CustomTr>
            ))}
          </CustomTbody>
        </CustomTable>
      </div>
    </>
  );
};
