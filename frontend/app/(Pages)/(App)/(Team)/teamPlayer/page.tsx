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
  OriginalCheckbox,
  CustomButton,
  ErrorBox,
} from '@/app/components';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from '@/app/lib/axios';
import { TeamPlayerInformationResponse, TeamResponse } from '@/app/types';

const JAPAN_COUNTRY_ID = 0;

export default function TeamPlayer() {
  const router = useRouter();
  // テーブルデータの入力値を管理する関数
  const handleInputChangeTeamPlayer = (rowId: number, name: string, value: any | boolean) => {
    setFormData((prevRows) =>
      prevRows.map((row) => (row.id === rowId ? { ...row, [name]: value } : row)),
    );
  };

  const [teamData, setTeamData] = useState({} as TeamResponse);
  const [formData, setFormData] = useState<TeamPlayerInformationResponse[]>([]);
  const [tmpFormData, setTmpFormData] = useState<TeamPlayerInformationResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const mode = useSearchParams().get('mode');
  const orgId = useSearchParams().get('org_id')?.toString() || '';

  useEffect(() => {
    // modeの値を取得 update, create
    switch (mode) {
      case 'update':
        break;
      case 'create':
        break;
      case 'confirm':
        // 種別が追加かつ削除フラグが立っているデータを削除
        const deleteData = formData.filter((data) => data.type === '追加' && data.deleteFlag);

        if (deleteData.length > 0) {
          setFormData((prevData) => prevData.filter((data) => !deleteData.includes(data)));
        }

        break;
      default:
        // TODO: 404エラーの表示処理に切り替え
        router.push('/teamPlayer?mode=create');
        break;
    }
  });

  useEffect(() => {
    const getTeamPlayer = async () => {
      const transformData = (data: TeamPlayerInformationResponse[], type: string) =>
        data.map((item, index) => ({
          ...item,
          deleteFlag: false,
          type,
        }));
      const setIndex = (data: TeamPlayerInformationResponse[]) =>
        data.map((item, index) => ({
          ...item,
          id: index,
        }));
      try {
        const sendId = { org_id: orgId };
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        // SessionStorageに追加選手リストがある場合、追加選手リストを取得
        if (sessionStorage.getItem('addPlayerList') !== null) {
          const addPlayerList = JSON.parse(sessionStorage.getItem('addPlayerList') as string);
          console.log(addPlayerList);
          let data = transformData(addPlayerList, '追加');

          if (mode == 'update') {
            //const response = await axios.get('http://localhost:3100/teamPlayers');
            //const searchRes = transformData(response.data, '既存');
            //data = setIndex(searchRes.concat(data));

            // const response = await axios.get('/teamPlayers');
            const response = await axios.post('/searchOrganizationPlayersForTeamRef', sendId);
            const searchRes = transformData(response.data.result, '既存');
            data = setIndex(data.concat(searchRes));
            console.log(response.data.result);

            // setFormData(
            //   response.data.result.map((data: TeamPlayerInformationResponse) => ({
            //     ...data,
            //     deleteFlag: false,
            //     type: '既存',
            //   })),
            // );
          }
          if (mode == 'create') {
            // const response = await axios.get('http://localhost:3100/teamPlayers');
            // const searchRes = setIndex(transformData(response.data, '既存'));
            const response = await axios.post('/searchOrganizationPlayersForTeamRef', sendId);
            console.log(response);
            const searchRes = transformData(response.data.result, '既存');
            console.log(searchRes);
            data = setIndex(data.concat(searchRes));
          }
          setFormData(data);
          // sessionStorage.removeItem('addPlayerList');
        } else {
          if (mode == 'create') {
            // const response = await axios.get('http://localhost:3100/teamPlayers');
            // const searchRes = setIndex(transformData(response.data, '既存'));
            const response = await axios.post('/searchOrganizationPlayersForTeamRef', sendId);
            console.log(response);
            const searchRes = transformData(response.data.result, '既存');
            console.log(searchRes);
            setFormData(searchRes);
          }
        }

        // const teamResponse = await axios.get('/team');
        const teamResponse = await axios.post('/getOrgData', sendId);
        console.log(teamResponse.data.result);
        setTeamData(teamResponse.data.result);
      } catch (error) {
        // console.log(error);
      }
    };
    getTeamPlayer();
  }, []);

  // フィルタリングをリセットして元の配列に戻す関数
  const resetFilter = () => {
    // 元の配列をセット
    setFormData((prevFormData) => tmpFormData);
  };

  // 戻るボタンを押した際にフィルタリングをリセットする
  window.addEventListener('popstate', resetFilter);

  return (
    <main className='flex min-h-screen flex-col justify-start p-[10px] m-auto gap-[20px] my-[80px]'>
      <div className='relative flex flex-col justify-between w-full h-screen flex-wrap gap-[20px]'>
        {/* 画面名*/}
        <CustomTitle isCenter={false} displayBack>
          <div>
            {teamData?.org_name}
            <br />
            団体への選手追加・削除{mode === 'confirm' && '確認'}
          </div>
        </CustomTitle>
        <ErrorBox errorText={errorMessage} />
        {mode !== 'confirm' && (
          <p>
            新たに所属選手を追加したい場合は、「追加選手の検索」ボタンを押下し、
            <br />
            遷移先の検索画面にて追加したい選手を検索し、検索結果から選択してください。
            <br />
            所属選手から除外したい場合は、「削除」にチェックを入れてください。
          </p>
        )}
      </div>
      <div>
        <div className='w-full bg-primary-500 text-white h-[40px] flex justify-center items-center font-bold relative'>
          <>所属選手</>
          {mode !== 'confirm' && (
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
          )}
          {mode !== 'confirm' && (
            <div className={`absolute right-[10px]`}>
              <CustomButton
                className='w-[120px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300'
                buttonType='secondary'
                onClick={() => {
                  router.push('/addPlayerSearch?org_id=' + orgId);
                }}
              >
                追加選手の検索
              </CustomButton>
            </div>
          )}
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
              <CustomTr key={index}>
                <CustomTd align='center'>
                  <div className={data.type === '追加' ? 'text-secondary-500' : 'text-primaryText'}>
                    {data.type}
                  </div>
                </CustomTd>
                <CustomTd align='center'>
                  <OriginalCheckbox
                    checked={data.deleteFlag ? true : false}
                    onChange={() => {
                      handleInputChangeTeamPlayer(data.id, 'deleteFlag', !data.deleteFlag);
                    }}
                    readonly={mode === 'confirm'}
                    id={`delete-${index}`}
                    value='del'
                  ></OriginalCheckbox>
                </CustomTd>
                <CustomTd align='center'>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/playerInformationRef',
                      query: { player_id: data.player_id },
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
                      pathname: '/playerInformationRef',
                      query: { player_id: data.player_id },
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
                      pathname: '/playerInformationRef',
                      query: { player_id: data.player_id },
                    }}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {data.player_name}
                  </Link>
                </CustomTd>
                <CustomTd align='center'>
                  {data.birth_country === JAPAN_COUNTRY_ID
                    ? data.birthPrefectureName
                    : data.birthCountryName}
                </CustomTd>
                <CustomTd align='center'>
                  {data.residence_country === JAPAN_COUNTRY_ID
                    ? data.residencePrefectureName
                    : data.residenceCountryName}
                </CustomTd>
                <CustomTd align='center'>{data.side_info[0] ? '◯' : '×'}</CustomTd>
                <CustomTd align='center'>{data.side_info[1] ? '◯' : '×'}</CustomTd>
                <CustomTd align='center'>{data.side_info[2] ? '◯' : '×'}</CustomTd>
                <CustomTd align='center'>{data.side_info[3] ? '◯' : '×'}</CustomTd>
              </CustomTr>
            ))}
          </CustomTbody>
        </CustomTable>
        <div
          className='flex justify-between w-full gap-[20px] mt-[20px]'
          style={{ marginTop: '20px' }}
        >
          <CustomButton
            buttonType='white-outlined'
            onClick={() => {
              router.back();
            }}
          >
            戻る
          </CustomButton>
          {mode !== 'confirm' && (
            <CustomButton
              buttonType='primary'
              onClick={() => {
                // 確認画面に遷移する際、現在のformDataを復元のために一時待避
                setTmpFormData(formData);
                router.push('/teamPlayer?mode=confirm');
              }}
            >
              確認
            </CustomButton>
          )}
          {mode === 'confirm' && (
            <CustomButton
              buttonType='primary'
              onClick={async () => {
                // TODO: 反映処理　残件対応項目
                const sendData = {
                  target_org_id: teamData.org_id,
                  formData: formData,
                };
                const csrf = () => axios.get('/sanctum/csrf-cookie');
                await csrf();
                axios
                  .post('/updateOrgPlayerData', sendData) //20240226
                  .then((response) => {
                    console.log(response.data);
                    router.push('/teamRef?orgId=' + teamData.org_id); //変更後は、該当の団体参照画面に遷移する 20240401
                  })
                  .catch((error) => {});
              }}
            >
              反映
            </CustomButton>
          )}
        </div>
      </div>
    </main>
  );
}