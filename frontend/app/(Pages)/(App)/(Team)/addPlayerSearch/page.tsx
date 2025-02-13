// 団体所属追加選手検索画面
'use client';

import {
  CustomButton,
  CustomDropdown,
  CustomTable,
  CustomTbody,
  CustomTd,
  CustomTextField,
  CustomTh,
  CustomThead,
  CustomTitle,
  CustomTr,
  ErrorBox,
  InputLabel,
  Label,
  OriginalCheckbox,
} from '@/app/components';
import axios from '@/app/lib/axios';
import {
  EventResponse,
  PrefectureResponse,
  SexResponse,
  TeamPlayerInformationResponse,
  TeamResponse,
} from '@/app/types';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Divider } from '@mui/material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';

interface SearchCond {
  playerName: string;
  sexId: string;
  sex: string;
  jaraPlayerId: string;
  playerId: string;
  entrysystemOrgId: string;
  birthCountryId: string;
  birthPrefectureId: string;
  residenceCountryId: string;
  residencePrefectureId: string;
  orgId: string;
  orgName: string;
  eventId: string;
  eventName: string;
  raceEventName: string;
  sideInfo: {
    S: boolean;
    B: boolean;
    X: boolean;
    C: boolean;
    N1: boolean;
    N2: boolean;
    N3: boolean;
    N4: boolean;
  };
}

export default function AddPlayerSearch() {
  // マスタデータ
  const [teamData, setTeamData] = useState({} as TeamResponse);
  const [event, setEvent] = useState<EventResponse[]>([]);
  const [prefectures, setPrefectures] = useState([] as PrefectureResponse[]);
  const [sex, setSex] = useState<SexResponse[]>([]);

  // エラーメッセージ
  const [errorMessage, setErrorMessage] = useState([] as string[]);

  // 検索結果表示用
  const [searchResult, setSearchResult] = useState<TeamPlayerInformationResponse[]>([]);
  const [visibleData, setVisibleData] = useState<TeamPlayerInformationResponse[]>([]); // 表示するデータ
  const [visibleItems, setVisibleItems] = useState(10); // 表示するデータの数
  const [isSearched, setIsSearched] = useState(false);

  const [searchCond, setSearchCond] = useState<SearchCond>({
    playerName: '',
    sexId: '',
    sex: '',
    jaraPlayerId: '',
    playerId: '',
    entrysystemOrgId: '',
    orgId: '',
    orgName: '',
    eventId: '',
    eventName: '',
    raceEventName: '',
    birthPrefectureId: '',
    residencePrefectureId: '',
    sideInfo: {
      S: false,
      B: false,
      X: false,
      C: false,
      N1: false,
      N2: false,
      N3: false,
      N4: false,
    },
  } as SearchCond);

  const router = useRouter();

  const orgId = useSearchParams().get('org_id')?.toString() || '';

  /**
   * 検索ボタン押下時の処理
   * @description
   * 検索ボタン押下時の処理
   * 検索条件を元にAPIを叩いて検索結果を取得する
   * 検索結果をstateにセットする
   */
  const handleSearch = async () => {
    // 検索条件が一つでも入力されていることを確認
    if (
      searchCond.playerName === '' &&
      searchCond.sexId === '' &&
      searchCond.jaraPlayerId === '' &&
      searchCond.playerId === '' &&
      searchCond.entrysystemOrgId === '' &&
      searchCond.orgId === '' &&
      searchCond.orgName === '' &&
      searchCond.eventId === '' &&
      searchCond.eventName === '' &&
      searchCond.raceEventName === '' &&
      searchCond.birthPrefectureId === '' &&
      searchCond.residencePrefectureId === '' &&
      !Object.values(searchCond.sideInfo).some((value) => value)
    ) {
      setErrorMessage(['検索条件を1つ以上入力してください。']);
      return;
    }

    try {
      const response = await axios.post('api/teamPlayerSearch', searchCond);
      const data = response.data.result;
      data.forEach((item: TeamPlayerInformationResponse) => {
        item.checked = false;
      });

      //名前の異なるバックエンド側とフロント側のキーを紐づける 20240415
      if (data.length > 0) {
        for (let index = 0; index < data.length; index++) {
          data[index].orgId = data[index].org_id;
        }
      }

      if (data.length > 100) {
        window.alert('検索結果が100件を超えました、上位100件を表示しています。');
      }
      setSearchResult(data);
      setVisibleItems(10);
      setVisibleData(data.slice(0, 10));
      setIsSearched(true);

      setErrorMessage([]);
    } catch (error) {
      setErrorMessage(['API取得エラー:' + (error as Error).message]);
    }
  };

  /**
   * データを10件ずつ増やす関数
   * @description
   * visibleDataに10件ずつデータを追加する
   * visibleItemsに10を加算する
   */
  const loadMoreData = () => {
    const newData = searchResult.slice(visibleItems, visibleItems + 10);
    setVisibleData((prevData) => [...prevData, ...newData]);
    setVisibleItems((prevCount) => prevCount + newData.length);
  };

  /**
   * チェックボックスの変更時の処理
   * @description
   * nameとcheckedを受け取り、stateを更新する
   */
  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    const checked = event.target.checked;
    setSearchCond((prevFormData) => ({
      ...prevFormData,
      sideInfo: {
        ...prevFormData.sideInfo,
        [name]: checked,
      },
    }));
  };

  // 日付をYYYY/MM/DDの形式に変換する
  const formatDate = (dt: Date) => {
    const y = dt.getFullYear();
    const m = ('00' + (dt.getMonth() + 1)).slice(-2);
    const d = ('00' + dt.getDate()).slice(-2);
    return y + '/' + m + '/' + d;
  };

  /**
   * 入力フォームの変更時の処理
   * @param name
   * @param value
   * @description
   * nameとvalueを受け取り、stateを更新する
   */
  const handleInputChange = (name: string, value: string) => {
    setSearchCond((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  useEffect(() => {
    const getTeam = async () => {
      try {
        const sendId = { org_id: orgId };
        const teamResponse = await axios.post('api/getOrgData', sendId);
        setTeamData(teamResponse.data.result);
        // 性別
        const sexResponse = await axios.get('api/getSexList');
        const sexList = sexResponse.data.map(
          ({ sex_id, sex }: { sex_id: number; sex: string }) => ({ id: sex_id, name: sex }),
        );
        setSex(sexList);
        const prefectures = await axios.get('api/getPrefectures'); //都道府県マスターの取得 20240208
        const stateList = prefectures.data.map(
          ({ pref_id, pref_name }: { pref_id: number; pref_name: string }) => ({
            id: pref_id,
            name: pref_name,
          }),
        );
        setPrefectures(stateList);
        // 種目
        const eventResponse = await axios.get('api/getEvents');
        const eventResponseList = eventResponse.data.map(
          ({ event_id, event_name }: { event_id: number; event_name: string }) => ({
            id: event_id,
            name: event_name,
          }),
        );
        setEvent(eventResponseList);
      } catch (error) {
        //console.log(error);
      }
    };
    getTeam();
  }, []);
  return (
    <>
      <CustomTitle displayBack>
        {teamData?.org_name}
        <br />
        団体に登録する選手検索
      </CustomTitle>
      <ErrorBox errorText={errorMessage} />
      <div className='bg-thinContainerBg p-[20px] flex flex-col gap-[20px] border border-border'>
        <div className='flex flex-col justify-start gap-[20px]'>
          <Label label={'選手情報'} isBold />
          <div className='flex flex-row justify-start gap-[16px]'>
            {/* JARA選手コード */}
            <CustomTextField
              // type='number'
              label='JARA選手コード'
              displayHelp
              value={searchCond.jaraPlayerId}
              onChange={(e) => handleInputChange('jaraPlayerId', e.target.value)}
            />
            {/* 選手ID */}
            <CustomTextField
              // type='number'
              label='選手ID'
              displayHelp
              value={searchCond.playerId}
              onChange={(e) => handleInputChange('playerId', e.target.value)}
            />
            {/* 選手名 */}
            <div className='flex flex-col justify-start'>
              <CustomTextField
                label='選手名'
                displayHelp={false}
                value={searchCond.playerName}
                onChange={(e) => handleInputChange('playerName', e.target.value)}
              />
            </div>
          </div>
          <div className='flex flex-row justify-start gap-[16px]'>
            {/* 性別 */}
            <div className='flex flex-col justify-start gap-[8px]'>
              <CustomDropdown
                id='sex'
                label='性別'
                displayHelp={false}
                options={sex.map((item) => ({ key: item.id, value: item.name }))}
                value={searchCond.sexId}
                errorMessages={[]}
                onChange={(e) => {
                  handleInputChange('sexId', e);
                  handleInputChange('sex', sex.find((item) => item.id === Number(e))?.name || '');
                }}
                className='rounded w-[120px]'
              />
            </div>
            <div className='flex flex-col justify-start gap-[8px]'>
              {/* 出身地（都道府県） */}
              <CustomDropdown
                id='birthPrefecture'
                label='出身地（都道府県）'
                options={prefectures.map((item) => ({ key: item.id, value: item.name }))}
                value={searchCond.birthPrefectureId?.toString()}
                onChange={(e) => {
                  handleInputChange('birthPrefectureId', e);
                  handleInputChange(
                    'birthPrefectureName',
                    prefectures.find((item) => item.id === Number(e))?.name || '',
                  );
                }}
                className='rounded w-[300px] '
              />
            </div>
            <div className='flex flex-col justify-start gap-[8px]'>
              {/* 居住地（都道府県） */}
              <CustomDropdown
                id='residencePrefecture'
                label='居住地（都道府県）'
                options={prefectures.map((item) => ({ key: item.id, value: item.name }))}
                value={searchCond.residencePrefectureId?.toString()}
                onChange={(e) => {
                  handleInputChange('residencePrefectureId', e);
                  handleInputChange(
                    'residencePrefectureName',
                    prefectures.find((item) => item.id === Number(e))?.name || '',
                  );
                }}
                className='rounded w-[300px] '
              />
            </div>
          </div>
          {/* サイド情報 */}
          <div className='flex flex-col justify-start'>
            <InputLabel label='サイド情報' displayHelp />
            <div className='flex flex-row gap-[4px]'>
              <div className='flex justify-start flex-col gap-[4px] my-1'>
                <OriginalCheckbox
                  id='checkbox-S'
                  label=': S (ストロークサイド)'
                  value='S'
                  checked={searchCond.sideInfo.S}
                  onChange={handleCheckboxChange}
                />
                <OriginalCheckbox
                  id='checkbox-B'
                  label=': B (バウサイド)'
                  value='B'
                  checked={searchCond.sideInfo.B}
                  onChange={handleCheckboxChange}
                />
              </div>
              <div className='flex justify-start flex-col gap-[4px] my-1'>
                <OriginalCheckbox
                  id='checkbox-X'
                  label=': X (スカル)'
                  value='X'
                  checked={searchCond.sideInfo.X}
                  onChange={handleCheckboxChange}
                />
                <OriginalCheckbox
                  id='checkbox-C'
                  label=': C (コックス)'
                  value='C'
                  checked={searchCond.sideInfo.C}
                  onChange={handleCheckboxChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col justify-start gap-[8px]'>
          <div className='flex flex-col justify-start gap-[8px]'>
            <div className='flex flex-row gap-[16px]'></div>
          </div>
          <div className='flex flex-col justify-start gap-[8px]'>
            <Label label={'選手所属団体情報'} isBold />
            <div className='flex flex-row justify-start gap-[12px]'>
              {/* エントリーシステムの団体ID */}

              {/* 団体ID */}
              <div className='flex flex-col justify-start'>
                <CustomTextField
                  label='団体ID'
                  // type='number'
                  displayHelp
                  value={searchCond.orgId}
                  onChange={(e) => handleInputChange('orgId', e.target.value)}
                />
              </div>
              {/* エントリーシステムID */}
              <div className='flex flex-col justify-start'>
                <CustomTextField
                  label='エントリー団体ID'
                  // type='number'
                  displayHelp
                  value={searchCond.entrysystemOrgId}
                  onChange={(e) => handleInputChange('entrysystemOrgId', e.target.value)}
                />
              </div>
              {/* 団体名 */}
              <div className='flex flex-col justify-start'>
                <CustomTextField
                  label='団体名'
                  displayHelp={false}
                  value={searchCond.orgName}
                  onChange={(e) => handleInputChange('orgName', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className='flex flex-col justify-start gap-[8px]'>
            <Label label={'出漕履歴情報'} isBold />
            <div className='flex flex-row justify-start gap-[12px]'></div>
            {/* 出漕大会名 */}
            <div className='flex flex-col justify-start'>
              <CustomTextField
                label='出漕大会名'
                displayHelp={false}
                value={searchCond.raceEventName}
                onChange={(e) => handleInputChange('raceEventName', e.target.value)}
              />
              <div className='text-caption1 my-[6px]'>※部分一致</div>
            </div>
          </div>
          {/* 出漕種目 */}
          <div className='flex flex-col justify-start gap-[8px]'>
            <CustomDropdown
              id='event'
              label='出漕種目'
              displayHelp={false}
              options={event.map((item) => ({ key: item.id, value: item.name }))}
              value={searchCond.eventId}
              placeHolder='未選択'
              onChange={(e) => {
                handleInputChange('eventId', e);
                handleInputChange(
                  'eventName',
                  event.find((item) => item.id === Number(e))?.name || '',
                );
              }}
              className='rounded w-[300px] '
            />
          </div>
        </div>

        <Divider className='w-[900px] h-[1px] bg-border' />
        <div className='flex flex-col justify-start'>
          <div className='flex flex-row justify-center gap-[4px]'>
            {/* 検索 */}
            <CustomButton
              buttonType='primary'
              onClick={() => {
                handleSearch();
              }}
              className='flex flex-row justify-center gap-[4px] w-[200px]'
            >
              <SearchIcon />
              <div>検索</div>
            </CustomButton>
            <CustomButton
              buttonType='secondary'
              onClick={() => {
                setSearchCond({
                  playerName: '',
                  sexId: '',
                  sex: '',
                  jaraPlayerId: '',
                  playerId: '',
                  entrysystemOrgId: '',
                  orgId: '',
                  orgName: '',
                  eventId: '',
                  eventName: '',
                  raceEventName: '',
                  sideInfo: {
                    S: false,
                    B: false,
                    X: false,
                    C: false,
                    N1: false,
                    N2: false,
                    N3: false,
                    N4: false,
                  },
                } as SearchCond);
              }}
              className='w-[200px]'
            >
              クリア
            </CustomButton>
          </div>
        </div>
      </div>
      {/* TODO ヘッダー固定 */}
      {/* 選手一覧テーブル表示 */}
      <div className='overflow-auto'>
        {/* 全選択ボタン */}
        <div className='bg-primary-40 bg-opacity-30 text-primary-500 py-2 px-4 w-full h-[40px] flex justify-center items-center font-bold relative'>
          <>選手候補</>
          <div className={`absolute left-[10px] flex gap-[10px]`}>
            <CustomButton
              className='w-[100px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300'
              buttonType='secondary'
              onClick={() => {
                setVisibleData((prevData) => prevData.map((item) => ({ ...item, checked: true })));
              }}
            >
              全選択
            </CustomButton>
            <CustomButton
              className='w-[120px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300'
              buttonType='secondary'
              onClick={() => {
                setVisibleData((prevData) => prevData.map((item) => ({ ...item, checked: false })));
              }}
            >
              全選択解除
            </CustomButton>
          </div>
        </div>
        <CustomTable>
          {/* 選手一覧テーブルヘッダー表示 */}
          <CustomThead>
            <CustomTr>
              <CustomTh rowSpan={2}>選択</CustomTh>
              <CustomTh rowSpan={2}>選手ID</CustomTh>
              <CustomTh rowSpan={2}>JARA選手コード</CustomTh>
              <CustomTh rowSpan={2}>選手名</CustomTh>
              <CustomTh rowSpan={2}>性別</CustomTh>
              <CustomTh rowSpan={2}>出身地</CustomTh>
              <CustomTh rowSpan={2}>居住地</CustomTh>
              <CustomTh colSpan={4}>サイド情報</CustomTh>
              <CustomTh rowSpan={2}>所属団体</CustomTh>
            </CustomTr>
            <CustomTr>
              <CustomTh>S</CustomTh>
              <CustomTh>B</CustomTh>
              <CustomTh>X</CustomTh>
              <CustomTh>C</CustomTh>
            </CustomTr>
          </CustomThead>
          {/* 大会一覧テーブル明細表示 */}
          <CustomTbody>
            {visibleData.map((data, index) => (
              <CustomTr key={index}>
                <CustomTd>
                  <OriginalCheckbox
                    id={'checkbox-' + index}
                    label=''
                    value={index.toString()}
                    checked={data.checked || false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setVisibleData((prevData) =>
                        prevData.map((item, idx) =>
                          idx === index ? { ...item, checked: checked } : item,
                        ),
                      );
                    }}
                  />
                </CustomTd>
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={'/playerInformationRef?player_id=' + data.player_id}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {data.player_id}
                  </Link>
                </CustomTd>
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={'/playerInformationRef?player_id=' + data.player_id}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {data.jara_player_id}
                  </Link>
                </CustomTd>
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={'/playerInformationRef?player_id=' + data.player_id}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {data.player_name}
                  </Link>
                </CustomTd>
                <CustomTd>{data.sexName}</CustomTd>
                <CustomTd>
                  {[data.birthCountryName, data.birthPrefectureName].filter((x) => x).join(' ')}
                </CustomTd>
                <CustomTd>
                  {[data.residenceCountryName, data.residencePrefectureName]
                    .filter((x) => x)
                    .join(' ')}
                </CustomTd>
                <CustomTd>{data.side_info[0] ? '○' : '×'}</CustomTd>
                <CustomTd>{data.side_info[1] ? '○' : '×'}</CustomTd>
                <CustomTd>{data.side_info[2] ? '○' : '×'}</CustomTd>
                <CustomTd>{data.side_info[3] ? '○' : '×'}</CustomTd>
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={'/teamRef?org_id=' + data.orgId}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {data.org_name}
                  </Link>
                </CustomTd>
              </CustomTr>
            ))}
          </CustomTbody>
        </CustomTable>
      </div>
      {isSearched && !searchResult.length && (
        <div className='flex flex-row justify-center'>選手が見つかりませんでした。</div>
      )}
      {isSearched && searchResult.length !== visibleItems && (
        <div
          className='flex flex-row justify-center gap-[16px] my-[30px] text-primary-500 font-bold cursor-pointer'
          onClick={loadMoreData}
        >
          <AddIcon /> 10件表示する
        </div>
      )}
      <div className='m-auto flex gap-[10px]'>
        <CustomButton
          buttonType='secondary'
          onClick={() => {
            router.back();
          }}
        >
          戻る
        </CustomButton>
        <CustomButton
          buttonType='primary'
          onClick={() => {
            // チェック済みのデータのみを取得
            const checkedData = visibleData.filter((data) => data.checked);
            if (sessionStorage.getItem('addPlayerList') !== null) {
              //Get the player data from session storage
              const currentPlayerList = JSON.parse(
                sessionStorage.getItem('addPlayerList') as string,
              );

              //Merge checked player data with previous data
              const mergeCurrentArrayWithCheckedData = [...currentPlayerList, ...checkedData];

              //Remove duplicate data from array
              const mapFromMergedArray = new Map(
                mergeCurrentArrayWithCheckedData.map((c) => [c.player_id, c]),
              );
              const uniquePlayers = [...mapFromMergedArray.values()];

              //Store merged data in session storage
              sessionStorage.setItem('addPlayerList', JSON.stringify(uniquePlayers));
            } else {
              //Store checked data in session storage
              sessionStorage.setItem('addPlayerList', JSON.stringify(checkedData));
            }

            // sessionStorage.setItem('addPlayerList', JSON.stringify(checkedData));
            router.back();
          }}
        >
          リストに追加
        </CustomButton>
      </div>
    </>
  );
}
