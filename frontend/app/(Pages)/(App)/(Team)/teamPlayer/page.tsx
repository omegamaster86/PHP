// 団体所属選手登録
'use client';

import {
  CustomButton,
  CustomTable,
  CustomTbody,
  CustomTd,
  CustomTh,
  CustomThead,
  CustomTitle,
  CustomTr,
  ErrorBox,
  OriginalCheckbox,
} from '@/app/components';
import { useUserType } from '@/app/hooks/useUserType';
import axios from '@/app/lib/axios';
import { TeamPlayerInformationResponse, TeamResponse } from '@/app/types';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mode = useSearchParams().get('mode');
  const orgId = useSearchParams().get('org_id')?.toString() || '';

  useUserType({
    onSuccess: async (userType) => {
      try {
        const sendData = {
          org_id: orgId,
        };
        const teamResponse = await axios.post<{ result: TeamResponse }>('api/getOrgData', sendData);
        setTeamData(teamResponse.data.result);

        const isStaff = teamResponse.data.result.isStaff;
        const hasAuthority =
          userType.isAdministrator || (userType.isOrganizationManager && isStaff);

        if (!hasAuthority) {
          router.replace('/teamSearch');
        }
      } catch (error) {
        router.replace('/teamSearch');
      }
    },
  });

  useEffect(() => {
    // modeの値を取得 create
    switch (mode) {
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
        // SessionStorageに追加選手リストがある場合、追加選手リストを取得
        if (sessionStorage.getItem('addPlayerList') !== null) {
          var addPlayerList = JSON.parse(sessionStorage.getItem('addPlayerList') as string);
          let data = transformData(addPlayerList, '追加');

          if (mode == 'create') {
            const response = await axios.post('api/getOrgPlayers', sendId);
            const searchRes = transformData(response.data.result, '既存');

            //追加選手の重複チェック処理 20240416
            setErrorMessage([]); //エラーメッセージの初期化
            const element = Array();
            element.push('選手が重複しているため追加できませんでした。');
            for (let index = 0; index < data.length; index++) {
              searchRes.some((item) => item.player_id == data[index].player_id);
              //要素が1つでも条件に合致するかを調べる 20240416
              if (searchRes.some((item) => item.player_id == data[index].player_id)) {
                element.push(
                  ' 選手ID: ' + data[index].player_id + '選手名:' + data[index].player_name,
                );
                data[index].deleteFlag = true; //重複している項目は削除対象
                addPlayerList[index].deleteFlag = true; //ストレージの重複データも削除対象
              }
            }
            if (element.length > 1) {
              setErrorMessage(element); //エラーメッセージの更新
            }
            data = data.filter((item) => !item.deleteFlag); //削除フラグがfalse（重複していないデータ）のみを取り出す 20240416
            addPlayerList = addPlayerList.filter((item: any) => !item.deleteFlag); //削除フラグがfalse（重複していないデータ）のみを取り出す 20240416
            sessionStorage.setItem('addPlayerList', JSON.stringify(addPlayerList)); //セッションストレージの内容を更新
            data = setIndex(data.concat(searchRes)); // concatで配列の結合をしてからindexをmapする
          }
          setFormData(data);
        } else {
          if (mode == 'create') {
            const response = await axios.post('api/getOrgPlayers', sendId);
            const searchRes = transformData(response.data.result, '既存');
            setFormData(searchRes);
          }
        }
      } catch (error) {
        //console.log(error);
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
    <>
      <div className='flex flex-col gap-[20px]'>
        <CustomTitle displayBack>
          {teamData?.org_name}
          <br />
          団体への選手追加・削除{mode === 'confirm' && '確認'}
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
        <div className='w-full bg-primary-500 text-white h-[120px] flex flex-col gap-3 justify-center items-center font-bold relative md:h-[40px] md:flex-row'>
          <p className='order-1 md:order-2'>所属選手</p>
          {mode !== 'confirm' && (
            <div className='flex gap-4 order-2 md:order-1 md:absolute md:left-[10px]'>
              <CustomButton
                className='w-[100px] h-[30px] text-small text-primary-500 hover:text-primary-300'
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
                className='w-[120px] h-[30px] text-small text-primary-500 hover:text-primary-300'
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
            <div className='order-3 md:absolute md:right-[10px]'>
              <CustomButton
                className='w-[120px] h-[30px] text-small text-primary-500 hover:text-primary-300'
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
        <div className='overflow-x-auto'>
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
                    <div
                      className={data.type === '追加' ? 'text-secondary-500' : 'text-primaryText'}
                    >
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
                    >
                      {data.player_name}
                    </Link>
                  </CustomTd>
                  <CustomTd align='center'>
                    {[data.birthCountryName, data.birthPrefectureName].filter((x) => x).join(' ')}
                  </CustomTd>
                  <CustomTd align='center'>
                    {[data.residenceCountryName, data.residencePrefectureName]
                      .filter((x) => x)
                      .join(' ')}
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
        <div
          className='flex flex-col items-center justify-center gap-[16px] md:flex-row'
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
                setErrorMessage([]);
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
                if (isSubmitting) {
                  return;
                }
                setIsSubmitting(true);

                try {
                  // TODO: 反映処理　残件対応項目
                  const sendData = {
                    target_org_id: teamData.org_id,
                    formData: formData,
                  };
                  await axios.post('api/updateOrgPlayerData', sendData);
                  router.push('/teamRef?orgId=' + teamData.org_id); //変更後は、該当の団体参照画面に遷移する 20240401
                } catch (error) {}

                setIsSubmitting(false);
              }}
            >
              反映
            </CustomButton>
          )}
        </div>
      </div>
    </>
  );
}
