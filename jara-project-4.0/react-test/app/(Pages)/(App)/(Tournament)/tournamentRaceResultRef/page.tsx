// 大会レース結果参照画面
'use client';

// Reactおよび関連モジュールのインポート
import React, { useState, useEffect, ChangeEvent, Fragment, MouseEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/app/lib/axios';
// コンポーネントのインポート
import {
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

interface RaceNameList {
  id: number;
  name: string;
}

interface ByGroupList {
  id: number;
  name: string;
}

export default function TournamentRaceResultRef() {
  // エラーハンドリング用のステート
  const [error, setError] = useState({
    isError: false,
    errorMessage: '',
  });

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

  //クルー情報取得用 20240216
  interface SearchCrewList {
    race_id: number; //レースID
    crew_name: string; //クルー名
    org_id: number; //団体ID
  };
  const [searchCrewInfo, setSearchCrewInfo] = useState([] as SearchCrewList[]);

  // Next.jsのRouterを利用
  const router = useRouter();

  // データ取得用のEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 仮のURL（繋ぎ込み時に変更すること）
        const csrf = () => axios.get('/sanctum/csrf-cookie')
        await csrf()
        // const response = await axios.get<RaceResultRecordsResponse[]>('http://localhost:3100/raceResultRecords',);
        const response = await axios.post('/getTournRaceResultRecords', race_id); //残件対象項目
        console.log(response.data.result);
        //クルー情報を取得するためのパラメータをセット
        setSearchCrewInfo(response.data.result);
        setResultRecordsData(response.data.result);
        response.data.length === 0
          ? setError({ isError: true, errorMessage: 'エントリー情報がありません。' })
          : null;
        const raceNamesArray = response.data.result.map((item) => item.race_name);
        const uniqueRaceNamesSet = new Set(raceNamesArray);
        const uniqueRaceNamesArray = Array.from(uniqueRaceNamesSet);
        setRaceNameList(
          uniqueRaceNamesArray.map((item, index) => ({
            id: index,
            name: item,
          })),
        );
        const byGroupsArray = response.data.result.map((item) => item.by_group);
        const uniqueByGroupsSet = new Set(byGroupsArray);
        const uniqueByGroupsArray = Array.from(uniqueByGroupsSet);
        setByGroupList(
          uniqueByGroupsArray.map((item, index) => ({
            id: index,
            name: item,
          })),
        );
      } catch (error: any) {
        setError({ isError: true, errorMessage: 'API取得エラー:' + error.message });
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
    'B.No',
    'Qualify',
    'ストローク（平均）',
    '500mlapストローク',
    '1000mlapストローク',
    '1500mlapストローク',
    '2000mlapストローク',
    '心拍数/分（平均）',
    '500m心拍数/分',
    '1000m心拍数/分',
    '1500m心拍数/分',
    '2000m心拍数/分',
    '非公式／公式',
    '立ち合い有無',
    'エルゴ体重',
    '選手身長',
    '選手体重',
    'シート番号ID',
    'シート番号',
    '出漕結果記録名',
    '500m地点風速',
    '1000m地点風速',
    '1500m地点風速',
    '2000m地点風速',
  ];

  // フィルター用のステート
  const [showRaceNameAutocomplete, setShowRaceNameAutocomplete] = useState(false);
  const [showByGroupAutocomplete, setShowByGroupAutocomplete] = useState(false);
  // ヘッダーの位置を取得するためのステート
  const [selectedRaceNameHeader, setSelectedRaceNameHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  const [selectedByGroupHeader, setSelectedByGroupHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });

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
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowRaceNameAutocomplete(!showRaceNameAutocomplete);
    setShowByGroupAutocomplete(false);
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
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowByGroupAutocomplete(!showByGroupAutocomplete);
    setShowRaceNameAutocomplete(false);
  };

  /**
   * クルー情報取得
   * @description クルー情報を取得する
   */
  const getCrew = async (index: number) => {
    // var apiUri = 'http://localhost:3100/crew?';
    const csrf = () => axios.get('/sanctum/csrf-cookie')
    await csrf()
    await axios
      // .get<CrewResponse[]>('/crew/') //残件対象項目
      .post('/getCrewData', searchCrewInfo[index])
      .then((response) => {
        console.log(response.data.result);
        // レスポンスからデータを取り出してstateにセット
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

  return (
    <div>
      <main>
        <div className='flex flex-col pt-[40px] pb-[60px] gap-[50px] md:w-[1000px] sm: w-[600px]'>
          <ErrorBox errorText={error.isError ? [error.errorMessage] : []} />
          <div className='bg-primary-900 p-4'>
            <div className='flex flex-col justify-start gap-[20px]'>
              {/* 種目名 */}
              <div className='flex flex-col justify-start'>
                <Label
                  label={raceResultRecordsData.at(0)?.event_name ?? ''}
                  textColor='white'
                  textSize='h3'
                />
              </div>
              <div className='flex flex-row gap-[10px]'>
                <div className='flex flex-col justify-start gap-[10px]'>
                  <Label label='大会名' textColor='gray' textSize='caption1' />
                  <div className='flex flex-col justify-start'>
                    <Label label='開催場所' textColor='gray' textSize='caption1' />
                    <Label label='距離' textColor='gray' textSize='caption1' />
                  </div>
                </div>
                {raceResultRecordsData.length > 0 && (
                  <div className='flex flex-col justify-start gap-[10px]'>
                    {/* 大会名 */}
                    <Link
                      href={`/tournamentRef?tournId=${raceResultRecordsData.at(0)?.tourn_id}`}
                      rel='noopener noreferrer'
                      target='_blank'
                      className='text-primary-300 underline hover:text-primary-50 cursor-pointer text-caption1'
                    >
                      {raceResultRecordsData.at(0)?.tourn_name as string}
                    </Link>
                    <div className='flex flex-col justify-start'>
                      {/* 開催場所 */}
                      <Label
                        label={raceResultRecordsData.at(0)?.venueName as string}
                        textColor='white'
                        textSize='caption1'
                      />
                      {/* 距離 */}
                      <Label
                        label={(raceResultRecordsData.at(0)?.range?.toString() + 'm') as string}
                        textColor='white'
                        textSize='caption1'
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 選手情報表示 */}
          <div className='text-lg mb-4'>
            {/* 出漕結果情報一覧テーブル表示 */}
            <div className='overflow-y-auto'>
              <CustomTable>
                {/* テーブルヘッダー */}
                <CustomThead>
                  <CustomTr>
                    {headerArray.map((header, index) =>
                      header === 'レース名' ? (
                        <CustomTh align='center' key={index}>
                          <div className='flex flex-row items-center gap-[10px]'>
                            {header}
                            <div onClick={(event) => handleRaceNameHeaderClick(header, event)}>
                              <FilterListIcon />
                            </div>
                          </div>
                        </CustomTh>
                      ) : header === '組別' ? (
                        <CustomTh align='center' key={index}>
                          <div className='flex flex-row items-center gap-[10px]'>
                            {header}
                            <div onClick={(event) => handleByGroupHeaderClick(header, event)}>
                              <FilterListIcon />
                            </div>
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
                        {/* 発艇日時 */}
                        <CustomTd>{row.eventStartDate}</CustomTd>
                        {/* 順位 */}
                        <CustomTd>{row.rank}</CustomTd>
                        {/* クルー名 */}
                        <CustomTd>
                          <div
                            onClick={(event) => {
                              console.log(index);
                              setOpen(true);
                              getCrew(index);
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
                        <CustomTd>{row.race_result_notes}</CustomTd>
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
                        {/* 心拍数/分（平均） */}
                        <CustomTd>{row.heart_rate_avg}</CustomTd>
                        {/* 500m心拍数/分 */}
                        <CustomTd>{row.heart_rate_500m}</CustomTd>
                        {/* 1000m心拍数/分 */}
                        <CustomTd>{row.heart_rate_1000m}</CustomTd>
                        {/* 1500m心拍数/分 */}
                        <CustomTd>{row.heart_rate_1500m}</CustomTd>
                        {/* 2000m心拍数/分 */}
                        <CustomTd>{row.heart_rate_2000m}</CustomTd>
                        {/* 非公式／公式 */}
                        <CustomTd>{row.official === 0 ? '非公式' : '公式'}</CustomTd>
                        {/* 立ち合い有無 */}
                        <CustomTd>{row.attendance}</CustomTd>
                        {/* エルゴ体重 */}
                        <CustomTd>{row.ergo_weight}</CustomTd>
                        {/* 選手身長 */}
                        <CustomTd>{row.player_height}</CustomTd>
                        {/* 選手体重 */}
                        <CustomTd>{row.player_weight}</CustomTd>
                        {/* シート番号ID */}
                        <CustomTd>{row.seat_number}</CustomTd>
                        {/* シート番号 */}
                        <CustomTd>{row.seat_name}</CustomTd>
                        {/* 出漕結果記録名 */}
                        <CustomTd>{row.race_result_record_name}</CustomTd>
                        {/* 2000m地点風速 */}
                        <CustomTd>{row.wind_speed_2000m_point}</CustomTd>
                        {/* 2000m地点風向 */}
                        <CustomTd>{row.wind_direction_2000m_point}</CustomTd>
                        {/* 1000m地点風速 */}
                        <CustomTd>{row.wind_speed_1000m_point}</CustomTd>
                        {/* 1000m地点風向 */}
                        <CustomTd>{row.wind_direction_1000m_point}</CustomTd>
                      </CustomTr>
                    ))}
                </CustomTbody>
              </CustomTable>
              {/* レース名フィルター用のオートコンプリート */}
              {showRaceNameAutocomplete && (
                <div
                  style={{
                    position: 'absolute',
                    top: `${selectedRaceNameHeader.position.top - 120}px`,
                    left: `${selectedRaceNameHeader.position.left}px`,
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    zIndex: 1000,
                    padding: '8px',
                  }}
                >
                  <Autocomplete
                    id='raceName'
                    multiple
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
                    className='w-[280px] m-auto'
                  />
                </div>
              )}
              {/* 組別フィルター用のオートコンプリート */}
              {showByGroupAutocomplete && (
                <div
                  style={{
                    position: 'absolute',
                    top: `${selectedByGroupHeader.position.top - 120}px`,
                    left: `${selectedByGroupHeader.position.left}px`,
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    zIndex: 1000,
                    padding: '8px',
                  }}
                >
                  <Autocomplete
                    id='byGroup'
                    multiple
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
            className='w-[280px] m-auto'
            onClick={() => {
              router.back();
            }}
          >
            戻る
          </CustomButton>
        </div>
        <Fragment>
          <Dialog
            fullWidth={true}
            maxWidth={'lg'}
            open={open}
            onClose={handleClose}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            className='flex flex-col justify-center w-full gap-[20px]'
          >
            <DialogTitle id='alert-dialog-title' className='font-bold'>
              クルー名
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
                          <Link
                            href={`/playerInformationRef?playerId=${row.player_id}`}
                            rel='noopener noreferrer'
                            target='_blank'
                            className='text-primary-300 underline hover:text-primary-50 cursor-pointer text-caption1'
                          >
                            {row.player_name}
                          </Link>
                        </CustomTd>
                        <CustomTd>{row.player_height}</CustomTd>
                        <CustomTd>{row.player_weight}</CustomTd>
                      </CustomTr>
                    ))}
                </CustomTbody>
              </CustomTable>
            </DialogContent>
            <DialogActions className='mt-[20px]'>
              <CustomButton
                onClick={handleClose}
                buttonType='primary-outlined'
                className='w-[280px] m-auto'
              >
                閉じる
              </CustomButton>
            </DialogActions>
          </Dialog>
        </Fragment>
      </main>
    </div>
  );
}
