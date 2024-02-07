// 団体所属選手登録
'use client';

import React, { useEffect, useState } from 'react';
import {
  CustomTitle,
  CustomTable,
  CustomThead,
  CustomTr,
  CustomTh,
  CustomTbody,
  CustomTd,
  CustomTextField,
  OriginalCheckbox,
  CustomButton,
} from '@/app/components';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { TeamPlayerInformationResponse, TeamResponse } from '@/app/types';

export default function TeamPlayer() {
  const router = useRouter();
  // テーブルデータの入力値を管理する関数
  const handleInputChangeStaff = (rowId: number, name: string, value: any | boolean) => {
    setFormData((prevRows) =>
      prevRows.map((row) => (row.id === rowId ? { ...row, [name]: value } : row)),
    );
  };

  const [teamData, setTeamData] = useState({} as TeamResponse);
  const [formData, setFormData] = useState<TeamPlayerInformationResponse[]>([
    {
      id: 0, // ID
      player_id: 0, // 選手ID
      jara_player_id: '', // JARA選手コード
      player_name: '', // 選手名
      date_of_birth: '', // 生年月日
      sexName: '', // 性別
      height: '', // 身長
      weight: '', // 体重
      residenceCountryName: '', // 居住地（国）
      residencePrefectureName: '', // 居住地（都道府県）
      birthCountryName: '', // 出身地（国）
      birthPrefectureName: '', // 出身地（都道府県）
      photo: '', // 写真
      side_info: [], // サイド情報
    },
  ]);
  const [errorMessage, setErrorMessage] = useState([] as string[]);

  useEffect(() => {
    const getTeamPlayer = async () => {
      try {
        const response = await axios.get('http://localhost:3100/teamPlayers');
        setFormData(response.data);
        const teamResponse = await axios.get('http://localhost:3100/team');
        setTeamData(teamResponse.data);
      } catch (error) {
        console.log(error);
      }
    };
    getTeamPlayer();
  }, []);

  return (
    <main className='flex min-h-screen flex-col justify-start p-[10px] m-auto gap-[20px] my-[80px]'>
      <div className='relative flex flex-col justify-between w-full h-screen flex-wrap gap-[20px]'>
        {/* 画面名*/}
        <CustomTitle isCenter={false} displayBack>
          <div>
            {teamData.name}
            <br />
            団体への選手追加・削除
          </div>
        </CustomTitle>
        <p>
          新たに所属選手を追加したい場合は、「追加選手の検索」ボタンを押下し、
          <br />
          遷移先の検索画面にて追加したい選手を検索し、検索結果から選択してください。
          <br />
          所属選手から除外したい場合は、「削除」にチェックを入れてください。
        </p>
      </div>
      <div>
        <div className='w-full bg-primary-500 text-white h-[40px] flex justify-center items-center font-bold relative'>
          <>所属選手</>
          <div className={`absolute left-[10px]`}>
            <CustomButton
              className='w-[100px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300'
              buttonType='secondary'
              onClick={() => {
                formData.length > 0 &&
                  setFormData((prevData) =>
                    prevData.map((data) => ({ ...data, deleteFlag: true })),
                  );
              }}
            >
              全削除
            </CustomButton>
            <CustomButton
              className='w-[120px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300'
              buttonType='secondary'
              onClick={() => {
                formData.length > 0 &&
                  setFormData((prevData) =>
                    prevData.map((data) => ({ ...data, deleteFlag: false })),
                  );
              }}
            >
              全削除解除
            </CustomButton>
          </div>
          <div className={`absolute right-[10px]`}>
            <CustomButton
              className='w-[120px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300'
              buttonType='secondary'
              onClick={() => {
                router.push('/addPlayerSearch');
              }}
            >
              追加選手の検索
            </CustomButton>
          </div>
        </div>
        <CustomTable>
          <CustomThead>
            <CustomTr>
              <CustomTh align='center' rowSpan={2}>
                種別
              </CustomTh>
              <CustomTh align='center' rowSpan={2}>
                削除
              </CustomTh>
              <CustomTh align='center' rowSpan={2}>
                選手ID
              </CustomTh>
              <CustomTh align='center' rowSpan={2}>
                JARA選手コード
              </CustomTh>
              <CustomTh align='center' rowSpan={2}>
                選手名
              </CustomTh>
              <CustomTh align='center' rowSpan={2}>
                出身地
              </CustomTh>
              <CustomTh align='center' rowSpan={2}>
                居住地
              </CustomTh>
              <CustomTh align='center' rowSpan={1} colSpan={4}>
                サイド情報
              </CustomTh>
            </CustomTr>
            <CustomTr>
              <CustomTh align='center'>S</CustomTh>
              <CustomTh align='center'>B</CustomTh>
              <CustomTh align='center'>X</CustomTh>
              <CustomTh align='center'>C</CustomTh>
            </CustomTr>
          </CustomThead>
          <CustomTbody>
            {formData.map((data, index) => (
              <CustomTr>
                <CustomTd align='center'>既存</CustomTd>
                <CustomTd align='center'>
                  <OriginalCheckbox
                    checked={data.deleteFlag ? true : false}
                    onChange={() => {
                      handleInputChangeStaff(data.id, 'delete', !data.deleteFlag);
                    }}
                    id='delete'
                    value='delete'
                  ></OriginalCheckbox>
                </CustomTd>
                <CustomTd align='center'>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/playerRef',
                    }}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {data.player_id}
                  </Link>
                </CustomTd>
                <CustomTd align='center'>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/playerRef',
                    }}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {data.jara_player_id}
                  </Link>
                </CustomTd>
                <CustomTd align='center'>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/playerRef',
                    }}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {data.player_name}
                  </Link>
                </CustomTd>
                <CustomTd align='center'>
                  {data.birthCountryName}
                  {data.birthPrefectureName}
                </CustomTd>
                <CustomTd align='center'>
                  {data.residenceCountryName}
                  {data.residencePrefectureName}
                </CustomTd>
                <CustomTd align='center'>{data.side_info[0] ? '◯' : '×'}</CustomTd>
                <CustomTd align='center'>{data.side_info[1] ? '◯' : '×'}</CustomTd>
                <CustomTd align='center'>{data.side_info[2] ? '◯' : '×'}</CustomTd>
                <CustomTd align='center'>{data.side_info[3] ? '◯' : '×'}</CustomTd>
              </CustomTr>
            ))}
          </CustomTbody>
        </CustomTable>
      </div>
    </main>
  );
}
