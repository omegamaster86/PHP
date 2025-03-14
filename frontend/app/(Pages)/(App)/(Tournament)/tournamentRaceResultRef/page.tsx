// レース結果参照画面
'use client';

// Reactおよび関連モジュールのインポート
import React, { useState, useEffect, ChangeEvent, Fragment, MouseEvent, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/app/lib/axios';
// コンポーネントのインポート
import {
  CustomTitle,
  CustomButton,
  CustomTable,
  CustomThead,
  CustomTbody,
  CustomTr,
  CustomTh,
  CustomTd,
  Label,
  ErrorBox,
} from '@/app/components';
import { RaceResultRecordsResponse, CrewResponse } from '@/app/types';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Autocomplete,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  TextField,
} from '@mui/material';
import { formatDate } from '@/app/utils/dateUtil';

interface RaceNameList {
  id: number;
  name: string;
}

interface ByGroupList {
  id: number;
  name: string;
}

//クルー情報取得用 20240216
interface SearchCrewList {
  race_id: number; //レースID
  crew_name: string; //クルー名
  org_id: number; //団体ID
}

export default function TournamentRaceResultRef() {
  // エラーハンドリング用のステート
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // クエリパラメータを取得する
  const searchParams = useSearchParams();
  const raceId = searchParams.get('raceId')?.toString() || '';
  // tournIdの値を取得
  switch (raceId) {
    case '':
      break;
    default:
      break;
  }
  const [race_id, setRaceId] = useState<any>({
    race_id: raceId,
  });

  // レース結果情報のデータステート
  const [raceResultRecordsData, setResultRecordsData] = useState([] as RaceResultRecordsResponse[]);
  const [crewRecordsData, setCrewRecordsData] = useState([] as CrewResponse[]);
  const [raceNameList, setRaceNameList] = useState([] as RaceNameList[]);
  const [selectedRaceNameList, setSelectedRaceNameList] = useState([] as RaceNameList[]);
  const [byGroupList, setByGroupList] = useState([] as ByGroupList[]);
  const [selectedByGroupList, setSelectedByGroupList] = useState([] as ByGroupList[]);

  const raceNameFilterInputRef = useRef(null);
  const byGroupFilterInputRef = useRef(null);

  const [searchCrewInfo, setSearchCrewInfo] = useState([] as SearchCrewList[]);

  // Next.jsのRouterを利用
  const router = useRouter();

  // データ取得用のEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('api/getTournRaceResultRecords', race_id); //残件対象項目
        //クルー情報を取得するためのパラメータをセット
        setSearchCrewInfo(response.data.result);
        setResultRecordsData(response.data.result);

        const raceNamesArray = response.data.result.map((item: any) => item.race_name); //残件対応項目
        const uniqueRaceNamesSet = new Set(raceNamesArray);
        const uniqueRaceNamesArray = Array.from(uniqueRaceNamesSet);
        setRaceNameList(
          uniqueRaceNamesArray.map((item: any, index: any) => ({
            //残件対応項目
            id: index,
            name: item,
          })),
        );
        const byGroupsArray = response.data.result.map((item: any) => item.by_group); //残件対応項目
        const uniqueByGroupsSet = new Set(byGroupsArray);
        const uniqueByGroupsArray = Array.from(uniqueByGroupsSet);
        setByGroupList(
          uniqueByGroupsArray.map((item: any, index: any) => ({
            //残件対応項目
            id: index,
            name: item,
          })),
        );
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || `API取得エラー: ${error.message}`;
        setErrorMessages([errorMessage]);
      }
    };
    fetchData();
  }, []);

  const headerArray = [
    'レース名',
    'レースNo.',
    '組別',
    '発艇日時',
    '順位',
    'クルー名',
    '500mlapタイム',
    '1000mlapタイム',
    '1500mlapタイム',
    '2000mlapタイム',
    '最終タイム',
    // 'B.No',
    'Qualify',
    'ストローク（平均）',
    '500mストローク',
    '1000mストローク',
    '1500mストローク',
    '2000mストローク',
    '非公式／公式',
    '1000m地点風速',
    '1000m地点風向',
    '2000m地点風速',
    '2000m地点風向',
  ];

  // フィルター用のステート
  const [showRaceNameAutocomplete, setShowRaceNameAutocomplete] = useState(false);
  const [showByGroupAutocomplete, setShowByGroupAutocomplete] = useState(false);
  // ヘッダーの位置を取得するためのステート
  const [selectedRaceNameHeader, setSelectedRaceNameHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });
  const [selectedByGroupHeader, setSelectedByGroupHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });

  useEffect(() => {
    if (showRaceNameAutocomplete) {
      if (raceNameFilterInputRef.current != null) {
        const target = raceNameFilterInputRef.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedRaceNameList.length
          ] as HTMLElement
        ).focus();
      }
    }
  }, [showRaceNameAutocomplete]);

  useEffect(() => {
    if (showByGroupAutocomplete) {
      if (byGroupFilterInputRef.current != null) {
        const target = byGroupFilterInputRef.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedRaceNameList.length
          ] as HTMLElement
        ).focus();
      }
    }
  }, [showByGroupAutocomplete]);

  /**
   * レース名ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleRaceNameHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedRaceNameHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        right: headerPosition.right + window.scrollX,
      },
    });
    setShowRaceNameAutocomplete((prev) => !prev);
  };

  /**
   * 組別ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleByGroupHeaderClick = (value: string, event: MouseEvent<HTMLElement, MouseEvent>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedByGroupHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        right: headerPosition.right + window.scrollX,
      },
    });
    setShowByGroupAutocomplete((prev) => !prev);
  };

  /**
   * クルー情報取得
   * @description クルー情報を取得する
   */
  const [currentCrewName, setCurrentCrewName] = useState('');
  const getCrew = async (rowData: RaceResultRecordsResponse) => {
    // クルー名、団体ID、レースIDのすべてが一致するクルー情報を取得
    var index = 0;
    for (; index < searchCrewInfo.length; index++) {
      if (
        searchCrewInfo[index].crew_name == rowData.crew_name &&
        searchCrewInfo[index].org_id.toString() == rowData.org_id &&
        searchCrewInfo[index].race_id.toString() == rowData.race_id
      ) {
        break;
      }
    }
    await axios
      .post('api/getCrewData', searchCrewInfo[index])
      .then((response) => {
        // レスポンスからデータを取り出してstateにセット
        setCurrentCrewName(searchCrewInfo[index].crew_name);
        for (let index = 0; index < response.data.result.length; index++) {
          if (response.data.result[index].seat_name == 'ストローク') {
            response.data.result[index].seat_name = 'S（ストローク）';
          } else if (response.data.result[index].seat_name == 'バウ') {
            response.data.result[index].seat_name = 'B（バウ）';
          } else if (response.data.result[index].seat_name == 'コックス') {
            response.data.result[index].seat_name = 'C（コックス）';
          } else if (response.data.result[index].seat_name == 'スカル') {
            response.data.result[index].seat_name = 'X（スカル）';
          }

          response.data.result[index].playerDeleteFlag =
            response.data.result[index].playerDeleteFlag === 1;
        }
        setCrewRecordsData(response.data.result);
      })
      .catch((error) => {
        //alert(error);
      });
  };

  // ダイアログのステート
  const [open, setOpen] = useState(false);
  /**
   * ダイアログを閉じる
   * @description ダイアログを閉じる
   */
  const handleClose = () => {
    setOpen(false);
  };

  if (raceResultRecordsData.length === 0) {
    return (
      <>
        <CustomTitle displayBack>レース結果参照</CustomTitle>
        <ErrorBox errorText={errorMessages} />
      </>
    );
  }

  return (
    <>
      <div className='flex flex-col gap-[30px]'>
        <CustomTitle displayBack>レース結果参照</CustomTitle>
        <ErrorBox errorText={errorMessages} />
        <div className='flex flex-col gap-[20px] bg-primary-900 p-4'>
          {/* 種目名 */}
          <Label
            label={
              raceResultRecordsData.at(0)?.event_id === 999
                ? `その他 ${raceResultRecordsData.at(0)?.event_name} `
                : raceResultRecordsData.at(0)?.event_name ?? ''
            }
            textColor='white'
            textSize='h3'
          />
          <div className='flex gap-3 items-center'>
            <Label label='大会名' textColor='gray' textSize='caption1' />
            {raceResultRecordsData.length > 0 && (
              <Link
                href={`/tournamentRef?tournId=${raceResultRecordsData.at(0)?.tourn_id}`}
                rel='noopener noreferrer'
                target='_blank'
                color='#ffffff'
              >
                {raceResultRecordsData.at(0)?.tourn_name as string}
              </Link>
            )}
          </div>
          <div className='flex gap-3'>
            <Label label='開催場所' textColor='gray' textSize='caption1' />
            {raceResultRecordsData.length > 0 && (
              <Label
                label={
                  raceResultRecordsData.at(0)?.venue_id === 9999
                    ? `その他 ${raceResultRecordsData.at(0)?.venue_name}`
                    : raceResultRecordsData.at(0)?.venue_name ?? ''
                }
                textColor='white'
                textSize='caption1'
              />
            )}
          </div>
          <div className='flex gap-3'>
            <Label label='距離' textColor='gray' textSize='caption1' />
            {raceResultRecordsData.length > 0 && (
              <Label
                label={(raceResultRecordsData.at(0)?.range?.toString() + 'm') as string}
                textColor='white'
                textSize='caption1'
              />
            )}
          </div>
        </div>
        {/* 選手情報表示 */}
        <div className='text-lg mb-4'>
          {/* 出漕結果情報一覧テーブル表示 */}
          <div className='overflow-auto'>
            <CustomTable>
              {/* テーブルヘッダー */}
              <CustomThead>
                <CustomTr>
                  {headerArray.map((header, index) =>
                    header === 'レース名' ? (
                      <CustomTh align='center' key={index}>
                        <div className='flex flex-row items-center gap-[10px]'>
                          {header}
                          <button
                            type='button'
                            style={{
                              cursor: 'pointer',
                              color: selectedRaceNameList.length > 0 ? '#F44336' : '#001D74',
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(event) => handleRaceNameHeaderClick(header, event as any)}
                          >
                            <FilterListIcon />
                          </button>
                        </div>
                      </CustomTh>
                    ) : header === '組別' ? (
                      <CustomTh align='center' key={index}>
                        <div className='flex flex-row items-center gap-[10px]'>
                          {header}
                          <button
                            type='button'
                            style={{
                              cursor: 'pointer',
                              color: selectedByGroupList.length > 0 ? '#F44336' : '#001D74',
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(event) => handleByGroupHeaderClick(header, event as any)}
                          >
                            <FilterListIcon />
                          </button>
                        </div>
                      </CustomTh>
                    ) : (
                      <CustomTh align='center' key={index}>
                        {header}
                      </CustomTh>
                    ),
                  )}
                </CustomTr>
              </CustomThead>
              {/* テーブルボディー */}
              <CustomTbody>
                {raceResultRecordsData
                  .filter((row, index) => {
                    if (selectedRaceNameList.length === 0 && selectedByGroupList.length === 0) {
                      return true;
                    } else if (
                      selectedRaceNameList.length > 0 &&
                      selectedByGroupList.length === 0
                    ) {
                      return selectedRaceNameList.some((item) => item.name === row.race_name);
                    } else if (
                      selectedRaceNameList.length === 0 &&
                      selectedByGroupList.length > 0
                    ) {
                      return selectedByGroupList.some((item) => item.name === row.by_group);
                    } else {
                      return (
                        selectedRaceNameList.some((item) => item.name === row.race_name) &&
                        selectedByGroupList.some((item) => item.name === row.by_group)
                      );
                    }
                  })
                  .sort((a, b) => a.order - b.order)
                  .map((row, index) => (
                    <CustomTr key={index}>
                      {/* レース名 */}
                      <CustomTd>{row.race_name}</CustomTd>
                      {/* レースNo. */}
                      <CustomTd>{row.race_number}</CustomTd>
                      {/* 組別 */}
                      <CustomTd>{row.by_group}</CustomTd>
                      {/* 発艇日時 「YYYY/MM/DD hh:mm」表記で表示 */}
                      <CustomTd>{formatDate(row.start_datetime, 'yyyy/MM/dd HH:mm')}</CustomTd>
                      {/* 順位 */}
                      <CustomTd>{row.rank}</CustomTd>
                      {/* クルー名 */}
                      <CustomTd>
                        <div
                          onClick={(event) => {
                            setOpen(true);
                            getCrew(row);
                          }}
                          className='text-primary-300 underline hover:text-primary-50 cursor-pointer text-caption1'
                        >
                          {row.crew_name}
                        </div>
                      </CustomTd>
                      {/* 500mlapタイム */}
                      <CustomTd>{row.laptime_500m}</CustomTd>
                      {/* 1000mlapタイム */}
                      <CustomTd>{row.laptime_1000m}</CustomTd>
                      {/* 1500mlapタイム */}
                      <CustomTd>{row.laptime_1500m}</CustomTd>
                      {/* 2000mlapタイム */}
                      <CustomTd>{row.laptime_2000m}</CustomTd>
                      {/* 最終タイム */}
                      <CustomTd>{row.final_time}</CustomTd>
                      {/* 備考 */}
                      <CustomTd>{row.race_result_note}</CustomTd>
                      {/* ストローク（平均） */}
                      <CustomTd>{row.stroke_rate_avg}</CustomTd>
                      {/* 500mlapストローク */}
                      <CustomTd>{row.stroke_rat_500m}</CustomTd>
                      {/* 1000mlapストローク */}
                      <CustomTd>{row.stroke_rat_1000m}</CustomTd>
                      {/* 1500mlapストローク */}
                      <CustomTd>{row.stroke_rat_1500m}</CustomTd>
                      {/* 2000mlapストローク */}
                      <CustomTd>{row.stroke_rat_2000m}</CustomTd>
                      {/* 非公式／公式 */}
                      <CustomTd>{row.official === 0 ? '非公式' : '公式'}</CustomTd>
                      {/* 1000m地点風速 */}
                      <CustomTd>{row.wind_speed_1000m_point}</CustomTd>
                      {/* 1000m地点風向 */}
                      <CustomTd>{row.wind_direction_1000m_point}</CustomTd>
                      {/* 2000m地点風速 */}
                      <CustomTd>{row.wind_speed_2000m_point}</CustomTd>
                      {/* 2000m地点風向 */}
                      <CustomTd>{row.wind_direction_2000m_point}</CustomTd>
                    </CustomTr>
                  ))}
              </CustomTbody>
            </CustomTable>
            {/* レース名フィルター用のオートコンプリート */}
            {showRaceNameAutocomplete && (
              <div
                ref={raceNameFilterInputRef}
                style={{
                  position: 'absolute',
                  top: `${selectedRaceNameHeader.position.top - 120}px`,
                  right: `max(0px, calc(100vw - ${selectedRaceNameHeader.position.right}px - 300px))`,
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  zIndex: 1000,
                  padding: '8px',
                }}
                onBlur={() => setShowRaceNameAutocomplete(false)} // フォーカスが外れたら非表示にする
              >
                <Autocomplete
                  id='raceName'
                  multiple
                  sx={{ width: 300 }}
                  options={raceNameList}
                  filterOptions={(options, { inputValue }) =>
                    options.filter((option) => option.name.includes(inputValue))
                  }
                  value={selectedRaceNameList || []}
                  onChange={(e: ChangeEvent<{}>, newValue: RaceNameList[]) => {
                    setSelectedRaceNameList(newValue);
                  }}
                  renderOption={(props: any, option: RaceNameList) => {
                    return (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    );
                  }}
                  renderTags={(value: RaceNameList[], getTagProps: any) => {
                    return value.map((option, index) => (
                      <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                    ));
                  }}
                  renderInput={(params) => (
                    <TextField
                      key={params.id}
                      className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                      {...params}
                      label={'レース名'}
                    />
                  )}
                />
              </div>
            )}
            {/* 組別フィルター用のオートコンプリート */}
            {showByGroupAutocomplete && (
              <div
                ref={byGroupFilterInputRef}
                style={{
                  position: 'absolute',
                  top: `${selectedByGroupHeader.position.top - 120}px`,
                  right: `max(0px, calc(100vw - ${selectedByGroupHeader.position.right}px - 300px))`,
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  zIndex: 1000,
                  padding: '8px',
                }}
                onBlur={() => setShowByGroupAutocomplete(false)} // フォーカスが外れたら非表示にする
              >
                <Autocomplete
                  id='byGroup'
                  multiple
                  sx={{ width: 300 }}
                  options={byGroupList}
                  filterOptions={(options, { inputValue }) =>
                    options.filter((option) => option.name.includes(inputValue))
                  }
                  value={selectedByGroupList || []}
                  onChange={(e: ChangeEvent<{}>, newValue: ByGroupList[]) => {
                    setSelectedByGroupList(newValue);
                  }}
                  renderOption={(props: any, option: ByGroupList) => {
                    return (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    );
                  }}
                  renderTags={(value: ByGroupList[], getTagProps: any) => {
                    return value.map((option, index) => (
                      <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                    ));
                  }}
                  renderInput={(params) => (
                    <TextField
                      key={params.id}
                      className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                      {...params}
                      label={'組別'}
                    />
                  )}
                />
              </div>
            )}
          </div>
        </div>
        {/* 戻るボタン */}
        <CustomButton
          buttonType='primary-outlined'
          className='m-auto'
          onClick={() => {
            router.back();
          }}
        >
          戻る
        </CustomButton>
      </div>
      <Fragment>
        <Dialog
          maxWidth={'lg'}
          open={open}
          onClose={handleClose}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
          className='flex flex-col justify-center gap-[20px]'
        >
          <DialogTitle id='alert-dialog-title' className='font-bold'>
            クルー名： {currentCrewName}
          </DialogTitle>
          <DialogContent dividers>
            <CustomTable>
              <CustomThead>
                <CustomTr>
                  <CustomTh>シート</CustomTh>
                  <CustomTh>氏名</CustomTh>
                  <CustomTh>身長（cm）</CustomTh>
                  <CustomTh>体重（kg）</CustomTh>
                </CustomTr>
              </CustomThead>
              <CustomTbody>
                {crewRecordsData
                  .sort((a, b) => a.order - b.order)
                  .map((row, index) => (
                    <CustomTr key={index}>
                      <CustomTd>{row.seat_name}</CustomTd>
                      <CustomTd>
                        {row.playerDeleteFlag ? (
                          row.player_name
                        ) : (
                          <Link
                            href={`/playerInformationRef?playerId=${row.player_id}`}
                            rel='noopener noreferrer'
                            target='_blank'
                          >
                            {row.player_name}
                          </Link>
                        )}
                      </CustomTd>
                      <CustomTd>{row.player_height}</CustomTd>
                      <CustomTd>{row.player_weight}</CustomTd>
                    </CustomTr>
                  ))}
              </CustomTbody>
            </CustomTable>
          </DialogContent>
          <DialogActions className='mt-[20px]'>
            <CustomButton onClick={handleClose} buttonType='primary-outlined' className='m-auto'>
              閉じる
            </CustomButton>
          </DialogActions>
        </Dialog>
      </Fragment>
    </>
  );
}
