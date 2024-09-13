// 機能名: 大会レース結果管理画面
'use client';

// Reactおよび関連モジュールのインポート
import { useState, useEffect, ChangeEvent, FocusEvent, useRef, MouseEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// import axios from 'axios';
import axios from '@/app/lib/axios';
// コンポーネントのインポート
import {
  CustomTitle,
  ErrorBox,
  CustomTextField,
  InputLabel,
  CustomButton,
  CustomTable,
  CustomThead,
  CustomTh,
  CustomTr,
  CustomTbody,
  CustomTd,
  Label,
  CustomYearPicker,
} from '@/app/components/';
// モデルのインポート
import { EventResponse, Race, RaceTypeResponse, Tournament, TournamentResponse } from '@/app/types';
import SearchIcon from '@mui/icons-material/Search';
import Validator from '@/app/utils/validator';
import Divider from '@mui/material/Divider';
import { Autocomplete, Chip, TextField } from '@mui/material';

import FilterListIcon from '@mui/icons-material/FilterList';

// 検索条件フォームの型定義
// 検索条件
interface SearchCond {
  eventYear: string;
  tournId: string;
  tournName: string;
  eventId: string;
  eventIdName: string;
  eventName: string;
  raceTypeId: string;
  raceTypeName: string;
  byGroup: string;
  raceNo: string;
}

//組別フィルター用
interface ByGroupList {
  id: number;
  name: string;
}

export default function TournamentResultManagement() {
  // フック
  const router = useRouter();
  const searchParams = useSearchParams();

  const prevScreen = searchParams.get('prevScreen') ?? 'default';
  const [tournamentList, setTournamentList] = useState<TournamentResponse[]>([]);
  const [event, setEvent] = useState<EventResponse[]>([]);
  const [raceTypeList, setRaceTypeList] = useState<RaceTypeResponse[]>([]);
  const sessionStorageData = JSON.parse(
    sessionStorage.getItem('tournamentResultManagement') || '{}',
  );

  // フォームデータを管理する状態
  const [searchCond, setSearchCond] = useState<SearchCond>({
    eventYear:
      prevScreen === 'tournamentResult'
        ? sessionStorageData.eventYear
        : new Date().getFullYear().toString(), //new Date().toLocaleDateString(),
    tournId: prevScreen === 'tournamentResult' ? sessionStorageData.tournId : '',
    tournName: prevScreen === 'tournamentResult' ? sessionStorageData.tournName : '',
    eventId: prevScreen === 'tournamentResult' ? sessionStorageData.eventId : '',
    eventIdName: prevScreen === 'tournamentResult' ? sessionStorageData.eventIdName : '',
    eventName: prevScreen === 'tournamentResult' ? sessionStorageData.eventName : '',
    raceTypeId: prevScreen === 'tournamentResult' ? sessionStorageData.raceTypeId : '',
    raceTypeName: prevScreen === 'tournamentResult' ? sessionStorageData.raceTypeName : '',
    byGroup: prevScreen === 'tournamentResult' ? sessionStorageData.byGroup : '',
    raceNo: prevScreen === 'tournamentResult' ? sessionStorageData.raceNo : '',
  } as SearchCond);

  const [searchResponse, setSearchResponse] = useState<Race[]>([]);
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [eventYearErrorMessage, setEventYearErrorMessage] = useState([] as string[]);
  const [tournNameErrorMessage, setTournNameErrorMessage] = useState([] as string[]);
  const [eventIdErrorMessage, setEventIdErrorMessage] = useState([] as string[]);
  const [eventNameErrorMessage, setEventNameErrorMessage] = useState([] as string[]);
  const [tableHeight, setTableHeight] = useState(''); // デフォルトの行の高さを設定

  // 組別のソート用　20240718
  const [groupSortFlag, setGroupSortFlag] = useState(false);
  const groupSort = () => {
    if (groupSortFlag) {
      setGroupSortFlag(false);
      searchResponse.sort((a, b) => ('' + a.by_group).localeCompare(b.by_group));
    } else {
      setGroupSortFlag(true);
      searchResponse.sort((a, b) => ('' + b.by_group).localeCompare(a.by_group));
    }
  };
  // レースIDのソート用　20240718
  const [raceIdSortFlag, setRaceIdSortFlag] = useState(false);
  const raceIdSort = () => {
    if (raceIdSortFlag) {
      setRaceIdSortFlag(false);
      searchResponse.sort((a, b) => ('' + a.race_id).localeCompare(b.race_id));
    } else {
      setRaceIdSortFlag(true);
      searchResponse.sort((a, b) => ('' + b.race_id).localeCompare(a.race_id));
    }
  };
  // レース名のソート用　20240718
  const [raceNameSortFlag, setRaceNameSortFlag] = useState(false);
  const raceNameSort = () => {
    if (raceNameSortFlag) {
      setRaceNameSortFlag(false);
      searchResponse.sort((a, b) => ('' + a.race_name).localeCompare(b.race_name));
    } else {
      setRaceNameSortFlag(true);
      searchResponse.sort((a, b) => ('' + b.race_name).localeCompare(a.race_name));
    }
  };
  // レースNoのソート用　20240718
  const [raceNoSortFlag, setRaceNoSortFlag] = useState(false);
  const raceNoSort = () => {
    if (raceNoSortFlag) {
      setRaceNoSortFlag(false);
      searchResponse.sort((a, b) => ('' + a.race_number).localeCompare(b.race_number));
    } else {
      setRaceNoSortFlag(true);
      searchResponse.sort((a, b) => ('' + b.race_number).localeCompare(a.race_number));
    }
  };

  const [showByGroupAutocomplete, setShowByGroupAutocomplete] = useState(false); //組別のフィルター実装　20240719

  const byGroupfocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240719

  //組別のフィルター実装　20240719
  const [byGroupList, setByGroupList] = useState([] as ByGroupList[]);
  const [selectedByGroupList, setSelectedByGroupList] = useState([] as ByGroupList[]);

  //組別のフィルター実装　20240719
  const [selectedByGroupHeader, setSelectedByGroupHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });

  //組別のフィルター実装　20240719
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
  };

  const [messageDisplay, setMessageDisplay] = useState(
    prevScreen !== 'tournamentResult' ||
      !(
        searchCond?.eventYear === '' ||
        searchCond?.eventYear === null ||
        searchCond?.eventYear === undefined
      )
      ? 'hidden'
      : 'visible',
  );

  // フォームの入力値を管理する関数
  const handleInputChange = (name: string, value: string) => {
    setSearchCond((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  function getNonEmptyProperties(obj: SearchCond): { key: string; value: any }[] {
    return Object.entries(obj)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => ({
        key,
        value,
      }));
  }

  const handleSearch = async () => {
    // var apiUri = 'http://localhost:3100/race?';

    // getNonEmptyProperties(searchCond).forEach((item) => {
    //   apiUri += item.key + '=' + item.value + '&';
    // });
    // apiUri = apiUri.slice(0, -1);

    try {
      // 仮のURL（繋ぎ込み時に変更すること）
      // const response = await axios.get<Race[]>('http://localhost:3100/race/');
      const csrf = () => axios.get('/sanctum/csrf-cookie');
      await csrf();
      const response = await axios.post('searchRaceData', searchCond);
      //console.log(response.data.result);
      setSearchResponse(response.data.result);
      setSelectedByGroupList([]);

      const height = response.data.length * 73 + 100 < 830 ? response.data.length * 73 + 100 : 830;
      setTableHeight('h-[' + height + 'px]');
    } catch (error) {
      setErrorMessage([...(errorMessage as string[]), 'API取得エラー:' + (error as Error).message]);
    }
  };

  const getTournamentList = async () => {
    try {
      // 仮のURL（繋ぎ込み時に変更すること）
      // TODO: ログインユーザーの権限によって取得する大会情報を変更すること
      // const response = await axios.get<TournamentResponse[]>('http://localhost:3100/tournaments');
      if (
        searchCond?.eventYear != '' &&
        searchCond?.eventYear != null &&
        searchCond?.eventYear != undefined
      ) {
        const sendVal = { event_start_year: searchCond?.eventYear };
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        //console.log(sendVal);
        const tournamentResponse = await axios.post('/tournamentEntryYearSearch', sendVal);
        const TournamentsResponseList = tournamentResponse.data.result.map(
          ({ tourn_id, tourn_name }: { tourn_id: number; tourn_name: string }) => ({
            id: tourn_id,
            name: tourn_name,
          }),
        );
        //console.log(TournamentsResponseList);
        setTournamentList(TournamentsResponseList);
      }
    } catch (error) {
      setErrorMessage([...(errorMessage as string[]), 'API取得エラー:' + (error as Error).message]);
    }
  };

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      //console.log(searchCond?.eventYear);
      // 大会名
      getTournamentList();

      try {
        // const eventResponse = await axios.get<EventResponse[]>('http://localhost:3100/event');
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        const eventResponse = await axios.get('/getEvents'); //イベント(種目)マスター取得
        const eventResponseList = eventResponse.data.map(
          ({ event_id, event_name }: { event_id: number; event_name: string }) => ({
            id: event_id,
            name: event_name,
          }),
        );
        setEvent(eventResponseList);

        // const raceTypeResponse = await axios.get<RaceTypeResponse[]>('http://localhost:3100/raceType',);
        const raceTypeResponse = await axios.get('/getRaceClass'); //レース区分マスター取得
        const stateList = raceTypeResponse.data.map(
          ({
            race_class_id,
            race_class_name,
          }: {
            race_class_id: number;
            race_class_name: string;
          }) => ({ id: race_class_id, name: race_class_name }),
        );
        setRaceTypeList(stateList);

        if (prevScreen === 'tournamentResult') {
          handleSearch();
        }
      } catch (error) {
        setErrorMessage(['API取得エラー:' + (error as Error).message]);
      }
    };
    fetchData();
  }, []);

  // バリデーションを実行する関数
  const performValidation = () => {
    const eventYearError = Validator.getErrorMessages([
      Validator.validateSelectRequired(searchCond.eventYear, '大会開催年'),
    ]);
    const tournNameError = Validator.getErrorMessages([
      Validator.validateSelectRequired(searchCond.tournName, '大会名'),
    ]);
    const eventIdError = Validator.getErrorMessages([
      Validator.validateSelectRequired(searchCond.eventId, '種目'),
    ]);
    const eventNameError =
      searchCond.eventId === '0'
        ? Validator.getErrorMessages([
            Validator.validateSelectRequired(searchCond.eventName, '種目'),
          ])
        : [];

    setEventYearErrorMessage(eventYearError);
    setTournNameErrorMessage(tournNameError);
    setEventIdErrorMessage(eventIdError);
    setEventNameErrorMessage(eventNameError);

    if (
      eventYearError.length > 0 ||
      tournNameError.length > 0 ||
      eventIdError.length > 0 ||
      eventNameError.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (showByGroupAutocomplete) {
      if (byGroupfocusTarget.current != null) {
        var target = byGroupfocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedByGroupList.length
          ] as HTMLElement
        ).focus();
      }
    }
  }, [showByGroupAutocomplete]);

  useEffect(() => {
    //組別をフィルターできるようにする 20240718
    const byGroupsArray = searchResponse.map((item: any) => item.by_group);
    const uniqueByGroupsSet = new Set(byGroupsArray);
    const uniqueByGroupsArray = Array.from(uniqueByGroupsSet);
    setByGroupList(
      uniqueByGroupsArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
  }, [searchResponse]);

  // レンダリング
  return (
    <div>
      <main className='flex min-h-screen flex-col justify-start p-[10px] gap-[20px] my-[80px] md:w-[1200px] sm: w-[600px]'>
        <div className='relative flex flex-row justify-between w-full h-screen flex-wrap'>
          {/* 画面名 */}
        </div>
        <CustomTitle displayBack>大会レース結果管理</CustomTitle>
        <div className='flex flex-col justify-center items-center'>
          {/* 説明 */}
          <p>
            レース結果記録を変更したいレースが開催された大会と種目を選択し、「レース結果検索」ボタンをクリックしてください。
            <br />
            本システムに登録されているレース結果の中から検索条件に合うレース結果が、「レース結果一覧」に表示されます。
          </p>
        </div>
        {/* エラーメッセージの表示 */}
        <ErrorBox errorText={[]} />
        <div className='bg-thinContainerBg p-[20px] flex flex-col gap-[12px]'>
          <div className='flex flex-col justify-start gap-[16px]'>
            <div className='flex flex-row justify-start gap-[16px]'>
              {/* 大会開催年 */}
              <div className='flex flex-col justify-start gap-[8px]'>
                <InputLabel label='大会開催年（西暦）' required />
                <div className='flex flex-row justify-start gap-[4px]'>
                  <CustomYearPicker
                    // placeHolder={new Date().toLocaleDateString('ja-JP').slice(0, 4)}
                    placeHolder={'YYYY'}
                    selectedDate={searchCond?.eventYear}
                    onChange={(date: Date) => {
                      handleInputChange('eventYear', date?.toLocaleDateString('ja-JP').slice(0, 4));
                    }}
                    onBlur={(e: FocusEvent<HTMLInputElement>) => {
                      if (
                        searchCond?.eventYear === '' ||
                        searchCond?.eventYear === null ||
                        searchCond?.eventYear === undefined
                      ) {
                        handleInputChange('tournName', '');
                        setMessageDisplay('visible');
                        setTournamentList([]); //大会開催年が空欄の場合、大会名のリストを空にする 20240420
                      } else {
                        getTournamentList();
                        setMessageDisplay('hidden');
                      }
                    }}
                    isError={eventYearErrorMessage.length > 0}
                    errorMessages={eventYearErrorMessage}
                  />
                  <Label label='年' />
                </div>
              </div>
            </div>
            {/* 大会名 */}
            <div className='flex flex-col justify-start'>
              <div className='flex flex-row justify-start gap-[8px]'>
                <div className='flex flex-col justify-start gap-[8px]'>
                  <InputLabel label='大会名' required />
                  <div>
                    <Autocomplete
                      options={tournamentList.map((item) => ({ id: item.id, name: item.name }))}
                      getOptionLabel={(option) => option.name}
                      value={{ id: Number(searchCond.tournId), name: searchCond.tournName } || ''}
                      onChange={(e: ChangeEvent<{}>, newValue) => {
                        handleInputChange(
                          'tournId',
                          newValue ? (newValue as TournamentResponse).id?.toString() : '',
                        );
                        handleInputChange(
                          'tournName',
                          newValue ? (newValue as TournamentResponse).name : '',
                        );
                      }}
                      renderOption={(props: any, option: TournamentResponse) => {
                        return (
                          <li {...props} key={option.id}>
                            {option.name}
                          </li>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          key={params.id}
                          className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                          {...params}
                          value={searchCond.tournName || ''}
                        />
                      )}
                      className={'w-[500px]'}
                    />
                    {tournNameErrorMessage?.map((message: string) => (
                      <p key={message} className='pt-1 text-caption1 text-systemErrorText'>
                        {message}
                      </p>
                    ))}
                  </div>
                </div>
                <div className={`flex flex-col justify-end ${messageDisplay}`}>
                  <Label
                    label='※「大会開催年」を入力してください。'
                    textColor='red'
                    textSize='caption1'
                  />
                </div>
              </div>
            </div>
            <div className='flex flex-row justify-start gap-[16px]'>
              <div className='flex flex-row justify-start gap-[12px]'>
                {/* 種目 */}
                <div className='flex flex-col justify-start gap-[8px]'>
                  <InputLabel label='種目' required />
                  <div>
                    <Autocomplete
                      options={event.map((item) => ({ id: item.id, name: item.name }))}
                      getOptionLabel={(option) => option.name}
                      value={
                        { id: Number(searchCond?.eventId), name: searchCond?.eventIdName } || ''
                      }
                      onChange={(e: ChangeEvent<{}>, newValue) => {
                        handleInputChange(
                          'eventId',
                          newValue ? (newValue as EventResponse).id.toString() : '',
                        );
                        handleInputChange(
                          'eventIdName',
                          newValue ? (newValue as EventResponse).name : '',
                        );
                      }}
                      renderOption={(props: any, option: EventResponse) => {
                        return (
                          <li {...props} key={option.id}>
                            {option.name}
                          </li>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          key={params.id}
                          className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                          {...params}
                          value={searchCond?.tournName || ''}
                        />
                      )}
                      className={'w-[200px]'}
                    />
                    {eventIdErrorMessage?.map((message: string) => (
                      <p key={message} className='pt-1 text-caption1 text-systemErrorText'>
                        {message}
                      </p>
                    ))}
                    {eventNameErrorMessage?.map((message: string) => (
                      <p key={message} className='pt-1 text-caption1 text-systemErrorText'>
                        {message}
                      </p>
                    ))}
                  </div>
                </div>
                {/* 種目名 ペンディング対象のため表示されないようにコメントアウト 20240516 */}
                {/* <div
                  className={`${
                    (prevScreen === 'tournamentResult' && searchCond?.eventId !== '0') ||
                    searchCond?.eventId !== '999'
                      ? 'hidden'
                      : ''
                  }`}
                >
                  <CustomTextField
                    label='種目名 ※部分一致'
                    displayHelp={false}
                    value={searchCond?.eventName}
                    onChange={(e) => handleInputChange('eventName', e.target.value)}
                    className='w-[300px]'
                  />
                </div> */}
              </div>
            </div>
            {/* レース区分 */}
            <div className='flex flex-col justify-start gap-[8px]'>
              <InputLabel label='レース区分' />
              <div>
                <Autocomplete
                  options={raceTypeList.map((item) => ({ id: item.id, name: item.name }))}
                  getOptionLabel={(option) => option.name}
                  value={
                    { id: Number(searchCond?.raceTypeId), name: searchCond?.raceTypeName } || ''
                  }
                  onChange={(e: ChangeEvent<{}>, newValue) => {
                    handleInputChange(
                      'raceTypeId',
                      newValue ? (newValue as EventResponse).id.toString() : '',
                    );
                    handleInputChange(
                      'raceTypeName',
                      newValue ? (newValue as EventResponse).name : '',
                    );
                  }}
                  renderOption={(props: any, option: TournamentResponse) => {
                    return (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      key={params.id}
                      className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                      {...params}
                      value={searchCond?.tournName || ''}
                    />
                  )}
                  className={'w-[200px]'}
                />
              </div>
            </div>
            {/* 組別 */}
            <div className='flex flex-col justify-start'>
              <CustomTextField
                label='組別 ※部分一致'
                displayHelp={false}
                value={searchCond?.byGroup}
                onChange={(e) => handleInputChange('byGroup', e.target.value)}
                className='w-[200px]'
              />
            </div>
            {/* レースNo */}
            <div className='flex flex-col justify-start'>
              <CustomTextField
                label='レースNo'
                displayHelp={false}
                value={searchCond?.raceNo}
                onChange={(e) => handleInputChange('raceNo', e.target.value)}
                className='w-[150px]'
              />
            </div>
            <Divider />
            <div className='flex flex-col justify-start'>
              <div className='flex flex-row justify-center gap-[4px]'>
                <CustomButton
                  buttonType='primary'
                  onClick={() => {
                    if (!performValidation()) {
                      handleSearch();
                    }
                  }}
                  className='flex flex-row justify-center gap-[4px] w-[200px]'
                >
                  <SearchIcon />
                  <div>レース結果検索</div>
                </CustomButton>
                <CustomButton
                  buttonType='secondary'
                  onClick={() => {
                    setSearchCond({
                      eventYear: '',
                      tournId: '',
                      tournName: '',
                      eventId: '',
                      eventIdName: '',
                      eventName: '',
                      raceTypeId: '',
                      raceTypeName: '',
                      byGroup: '',
                      raceNo: '',
                    } as SearchCond);
                  }}
                  className='w-[200px]'
                >
                  クリア
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
        {/* レース結果一覧テーブル表示 */}
        <div className='overflow-auto'>
          <CustomTable>
            {/* レース一覧テーブルヘッダー表示 */}
            <CustomThead>
              <CustomTr>
                <th className='w-[280px] p-1 border border-gray-20 whitespace-nowrap text-caption1'>
                  <CustomButton
                    buttonType='primary'
                    onClick={function (): void {
                      if (!performValidation()) {
                        sessionStorage.setItem(
                          'tournamentResultManagement',
                          JSON.stringify(searchCond),
                        );
                        let url = '/tournamentResult?mode=create';
                        if (searchCond.tournId) {
                          url += '&tournId=' + searchCond.tournId;
                        }
                        if (searchCond.eventId) {
                          url += '&eventId=' + searchCond.eventId;
                        }
                        if (searchCond.eventName) {
                          url += '&eventName=' + searchCond.eventName;
                        }
                        router.push(url);
                      }
                    }}
                    className='w-[150px]'
                  >
                    レース結果追加
                  </CustomButton>
                </th>
                <CustomTh colSpan={5}>レース結果一覧</CustomTh>
              </CustomTr>
              <CustomTr>
                <CustomTh>操作</CustomTh>
                <CustomTh>
                  <div
                    className='underline'
                    style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                    onClick={() => raceIdSort()}
                  >
                    レースID
                  </div>
                </CustomTh>
                <CustomTh>
                  <div
                    className='underline'
                    style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                    onClick={() => raceNameSort()}
                  >
                    レース名
                  </div>
                </CustomTh>
                <CustomTh>
                  <div
                    className='underline'
                    style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                    onClick={() => raceNoSort()}
                  >
                    レースNo
                  </div>
                </CustomTh>
                <CustomTh>レース区分</CustomTh>
                <CustomTh>
                  <div className='flex flex-row items-center gap-[10px]'>
                    <div
                      className='underline'
                      style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                      onClick={() => groupSort()}
                    >
                      組別
                    </div>
                    <div
                      style={{
                        cursor: 'pointer',
                        color: selectedByGroupList.length > 0 ? '#F44336' : '#001D74', //フィルター実行後の色の変更
                      }}
                      onClick={(event) => handleByGroupHeaderClick('組別', event as any)}
                    >
                      <FilterListIcon />
                    </div>
                  </div>
                </CustomTh>
              </CustomTr>
            </CustomThead>
            {/* 大会一覧テーブル明細表示 */}
            <CustomTbody>
              {searchResponse
                .filter((row, index) => {
                  //組別のフィルター実装　20240719
                  if (selectedByGroupList.length > 0) {
                    return selectedByGroupList.some((item) => item.name === row.by_group);
                  } else {
                    return true;
                  }
                })
                .map((row, index) => (
                  <CustomTr index={index} key={index}>
                    {/* 操作 */}
                    <CustomTd>
                      <div className='flex justify-center items-center gap-[10px]'>
                        <CustomButton
                          buttonType='primary'
                          className='w-[80px]'
                          onClick={function (): void {
                            sessionStorage.setItem(
                              'tournamentResultManagement',
                              JSON.stringify(searchCond),
                            );
                            router.push('/tournamentResult?mode=update&raceId=' + row.race_id);
                          }}
                        >
                          更新
                        </CustomButton>
                        <CustomButton
                          buttonType='primary'
                          className='w-[80px]'
                          onClick={function (): void {
                            sessionStorage.setItem(
                              'tournamentResultManagement',
                              JSON.stringify(searchCond),
                            );
                            router.push('/tournamentResultRef?mode=delete&raceId=' + row.race_id);
                          }}
                        >
                          削除
                        </CustomButton>
                        <CustomButton
                          buttonType='primary'
                          className='w-[80px]'
                          onClick={function (): void {
                            sessionStorage.setItem(
                              'tournamentResultManagement',
                              JSON.stringify(searchCond),
                            );
                            router.push('/tournamentResultRef?raceId=' + row.race_id);
                          }}
                        >
                          参照
                        </CustomButton>
                      </div>
                    </CustomTd>
                    {/* レースID */}
                    <CustomTd>{row.race_id}</CustomTd>
                    {/* レース名 */}
                    <CustomTd>{row.race_name}</CustomTd>
                    {/* レースNo */}
                    <CustomTd>{row.race_number}</CustomTd>
                    {/* レース区分 */}
                    <CustomTd>{row.race_class_name}</CustomTd>
                    {/* 組別 */}
                    <CustomTd>{row.by_group}</CustomTd>
                  </CustomTr>
                ))}
            </CustomTbody>
          </CustomTable>
          {/* 組別フィルター用のオートコンプリート 20240719 */}
          {showByGroupAutocomplete && (
            <div
              ref={byGroupfocusTarget}
              style={{
                position: 'absolute',
                top: `${selectedByGroupHeader.position.top - 120}px`,
                left: `${selectedByGroupHeader.position.left}px`,
                backgroundColor: 'white',
                borderRadius: '4px',
                zIndex: 1000,
                padding: '8px',
              }}
              onBlur={() => setShowByGroupAutocomplete(false)} //フォーカスが外れたら非表示にする 20240719
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
                  //console.log(newValue);
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
          {/* <CustomTable>
          </CustomTable> */}
        </div>
        <div className='flex flex-row justify-center gap-[16px] my-[30px]'>
          <CustomButton
            onClick={() => {
              router.back();
            }}
            buttonType='secondary'
          >
            戻る
          </CustomButton>
        </div>
      </main>
    </div>
  );
}
