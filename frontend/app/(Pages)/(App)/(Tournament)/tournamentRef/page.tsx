// 機能名: 大会情報参照画面・大会情報削除画面
'use client';

// Reactおよび関連モジュールのインポート
import { useState, useEffect, useRef, ChangeEvent, MouseEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/app/lib/axios';
// コンポーネントのインポート
import {
  ErrorBox,
  CustomButton,
  Label,
  CustomTable,
  CustomThead,
  CustomTr,
  CustomTh,
  CustomTd,
  CustomTitle,
  CustomTbody,
} from '@/app/components';
import { Tournament, Race, UserResponse, UserIdType } from '@/app/types';
import Link from 'next/link';
import EditIcon from '@mui/icons-material/EditOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { ROLE } from '@/app/utils/consts';
import { TOURNAMENT_PDF_URL } from '@/app/utils/imageUrl';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Autocomplete,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

//種目フィルター用
interface EventNameList {
  id: number;
  name: string;
}
//組別フィルター用
interface ByGroupList {
  id: number;
  name: string;
}
//発艇日時フィルター用
interface StartDateTimeList {
  id: number;
  name: string;
}

// 大会情報参照画面
export default function TournamentRef() {
  // フック
  const router = useRouter();

  // TODO: ユーザーの権限を取得する処理をuseEffectに記述すること
  const [userType, setUserType] = useState('');

  // ページ全体のエラーハンドリング用のステート
  let isError = false;

  // クエリパラメータを取得する
  const searchParams = useSearchParams();
  // modeの値を取得
  const mode = searchParams.get('mode');
  switch (mode) {
    case 'delete':
      break;
    default:
      break;
  }

  const tournId = searchParams.get('tournId')?.toString() || '';
  // tournIdの値を取得
  switch (tournId) {
    case '':
      isError = true;
      break;
    default:
      break;
  }
  const [tourn_id, setTournId] = useState<any>({
    tourn_id: tournId,
  });

  // フォームデータを管理する状態
  const [tableData, setTableData] = useState<Race[]>([]);

  // 大会情報を管理する状態
  const [tournamentFormData, setTournamentFormData] = useState<Tournament>({
    tourn_id: '',
    entrysystem_tourn_id: '',
    tourn_name: '',
    tourn_type: '',
    tournTypeName: '',
    sponsor_org_id: '',
    sponsorOrgName: '',
    event_start_date: '',
    event_end_date: '',
    venue_id: '',
    venue_name: '',
    tourn_url: '',
    tourn_info_faile_path: '',
  });

  // レース結果情報のデータステート
  //種目
  const [eventNameList, setEventNameList] = useState([] as EventNameList[]);
  const [selectedEventNameList, setSelectedEventNameList] = useState([] as EventNameList[]);
  //組別
  const [byGroupList, setByGroupList] = useState([] as ByGroupList[]);
  const [selectedByGroupList, setSelectedByGroupList] = useState([] as ByGroupList[]);
  //発艇日時
  const [startDateTimeList, setStartDateTimeList] = useState([] as StartDateTimeList[]);
  const [selectedStartDateTimeList, setSelectedStartDateTimeList] = useState(
    [] as StartDateTimeList[],
  );

  // フィルター用のステート 20240508
  const [showEventNameAutocomplete, setShowEventNameAutocomplete] = useState(false);
  const [showByGroupAutocomplete, setShowByGroupAutocomplete] = useState(false);
  const [showStartDateTimeAutocomplete, setShowStartDateTimeAutocomplete] = useState(false);
  const eventNamefocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240518
  // const textRef = useRef<HTMLInputElement>(null);//
  // const textRef = useRef<HTMLInputElement>(null);//

  // ヘッダーの位置を取得するためのステート
  //種目
  const [selectedEventNameHeader, setSelectedEventNameHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //組別
  const [selectedByGroupHeader, setSelectedByGroupHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });
  //発艇日時
  const [selectedStartDateTimeHeader, setSelectedStartDateTimeHeader] = useState({
    value: '',
    position: { top: 0, left: 0 },
  });

  /**
   * 種目ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleEventNameHeaderClick = (
    value: string,
    event: MouseEvent<HTMLElement, MouseEvent>,
  ) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedEventNameHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowEventNameAutocomplete(!showEventNameAutocomplete);
    setShowByGroupAutocomplete(false);
    setShowStartDateTimeAutocomplete(false);
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
    setShowEventNameAutocomplete(false);
    setShowByGroupAutocomplete(!showByGroupAutocomplete);
    setShowStartDateTimeAutocomplete(false);
  };
  /**
   * 発艇日時ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleStartDateTimeHeaderClick = (
    value: string,
    event: MouseEvent<HTMLElement, MouseEvent>,
  ) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedStartDateTimeHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        left: headerPosition.left + window.scrollX,
      },
    });
    setShowEventNameAutocomplete(false);
    setShowByGroupAutocomplete(false);
    setShowStartDateTimeAutocomplete(!showStartDateTimeAutocomplete);
  };

  // 発艇日時のソート用
  // ソート用のステート 20240518
  const [startDateTimeSortFlag, setStartDateTimeSortFlag] = useState(false);
  const startDateTimeSort = () => {
    if (startDateTimeSortFlag) {
      setStartDateTimeSortFlag(false);
      tableData.sort(
        (a, b) =>
          //ハイフン、スペース、コロンを空文字に変換してnumber型にキャストして大小比較する 20240518
          Number(a.start_date_time.replace(/[- :]/g, '')) -
          Number(b.start_date_time.replace(/[- :]/g, '')),
      );
    } else {
      setStartDateTimeSortFlag(true);
      tableData.sort(
        (a, b) =>
          //ハイフン、スペース、コロンを空文字に変換してnumber型にキャストして大小比較する 20240518
          Number(b.start_date_time.replace(/[- :]/g, '')) -
          Number(a.start_date_time.replace(/[- :]/g, '')),
      );
    }
  };

  // APIの呼び出し実績の有無を管理する状態
  const isApiFetched = useRef(false);

  //20240401 該当の団体管理者かどうかを判別するためのフラグ
  const [orgManagerFlag, setOrgManagerFlag] = useState(0);

  // エラーハンドリング用のステート
  const [error, setError] = useState({ isError: false, errorMessage: '' });

  const [userIdType, setUserIdType] = useState({} as UserIdType); //ユーザIDに紐づいた情報 20240222

  // データ取得
  useEffect(() => {
    // StrictModeの制約回避のため、APIの呼び出し実績の有無をuseEffectの中に記述
    if (!isApiFetched.current) {
      const fetchData = async () => {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        // const userResponse = await axios.get<UserResponse>('http://localhost:3100/user');
        const userResponse = await axios.get('getUserData');
        setUserType(userResponse.data.result.user_type);
        // TODO: tournIdを元に大会情報を取得する処理の置き換え
        // const tournamentResponse = await axios.get<Tournament>('http://localhost:3100/tournament');
        const tournamentResponse = await axios.post('/getTournamentInfoData', tourn_id); //大会IDを元に大会情報を取得する
        //console.log(tournamentResponse);
        tournamentResponse.data.result.tourn_url = tournamentResponse.data.result.tourn_url ?? ''; //nullのパラメータを空のパラメータに置き換える
        setTournamentFormData(tournamentResponse.data.result);
        // TODO: tournIdを元にレース情報を取得する処理の置き換え
        // const raceResponse = await axios.get<Race[]>('http://localhost:3100/race');
        const raceResponse = await axios.post('/getRaceData', tourn_id);
        //console.log(raceResponse.data.result);
        raceResponse.data.result.map((data: any) => {
          setTableData((prevData) => [...prevData, { ...data }]);
        });

        const playerInf = await axios.get('/getIDsAssociatedWithUser');
        setUserIdType(playerInf.data.result[0]); //ユーザIDに紐づいた情報 20240222

        const sendData = {
          userInfo: playerInf.data.result[0],
          tournInfo: tournamentResponse.data.result,
        };
        const resData = await axios.post('/checkOrgManager', sendData); //大会情報参照画面 主催団体管理者の判別 20240402
        //console.log(resData.data.result);
        setOrgManagerFlag(resData.data.result);

        //種目をフィルターできるようにする 20240509
        const eventNameArray = raceResponse.data.result.map((item: any) => item.event_name);
        //console.log(eventNameArray);
        const uniqueEventNameSet = new Set(eventNameArray);
        const uniqueEventNameArray = Array.from(uniqueEventNameSet);
        setEventNameList(
          uniqueEventNameArray.map((item: any, index: any) => ({
            id: index,
            name: item,
          })),
        );
        //組別をフィルターできるようにする 20240509
        const byGroupsArray = raceResponse.data.result.map((item: any) => item.by_group);
        //console.log(byGroupsArray);
        const uniqueByGroupsSet = new Set(byGroupsArray);
        const uniqueByGroupsArray = Array.from(uniqueByGroupsSet);
        setByGroupList(
          uniqueByGroupsArray.map((item: any, index: any) => ({
            id: index,
            name: item,
          })),
        );
        //発艇日時をフィルターできるようにする 20240509
        const startDateTimeArray = raceResponse.data.result.map((item: any) =>
          item.start_date_time.substring(0, 10),
        );
        //console.log(startDateTimeArray);
        const uniqueStartDateTimeSet = new Set(startDateTimeArray);
        const uniqueStartDateTimeArray = Array.from(uniqueStartDateTimeSet);
        setStartDateTimeList(
          uniqueStartDateTimeArray.map((item: any, index: any) => ({
            id: index,
            name: item,
          })),
        );
      };
      fetchData();
      isApiFetched.current = true;
    }
  }, []);

  useEffect(() => {
    if (showEventNameAutocomplete) {
      console.log('trueeeeeeee');
      console.log(eventNamefocusTarget.current);
      if (eventNamefocusTarget.current != null) {
        console.log('focus');
        var hoge = (eventNamefocusTarget.current as HTMLDivElement)
        console.log(hoge);
        hoge.childNodes.forEach(element => {
          console.log(element);
        });
        console.log(hoge.childNodes[0].childNodes[0].childNodes[1]);
      }
    } else {
      console.log('falsesss');
    }
  }, [showEventNameAutocomplete]);

  // エラーがある場合はエラーメッセージを表示
  if (isError) {
    return <div>404エラー</div>;
  }
  return (
    <div>
      <main>
        <div className='flex flex-col pt-[40px] pb-[60px] gap-[50px] md:w-[1000px] sm: w-[600px]'>
          <ErrorBox errorText={error.isError ? [error.errorMessage] : []} />
          <div className='flex flex-row justify-between items-center '>
            {/* 画面名 */}
            <CustomTitle isCenter={false} displayBack>
              {mode === 'delete' && '大会情報削除'}
              {mode !== 'delete' && '大会情報'}
            </CustomTitle>
            <div>
              <div>
                {mode !== 'delete' && (userIdType.is_administrator == 1 || orgManagerFlag == 1) && (
                  <Link
                    href={{
                      pathname: '/tournament',
                      query: { mode: 'update', tourn_id: tournId },
                    }}
                    target='_blank'
                    className='text-primary-500 hover:text-primary-700 underline text-small md:text-normal'
                  >
                    <EditIcon className='cursor-pointer m-1 text-small md:text-h3' />
                    大会情報を更新
                  </Link>
                )}
              </div>
              <div>
                {mode !== 'delete' && (userIdType.is_administrator == 1 || orgManagerFlag == 1) && (
                  <Link
                    href={{
                      pathname: '/tournamentRef',
                      query: { mode: 'delete', tournId: tournId },
                    }}
                    target='_blank'
                    className='text-primary-500 hover:text-primary-700 underline text-small md:text-normal'
                  >
                    <EditIcon className='cursor-pointer m-1 text-small md:text-h3' />
                    大会情報を削除
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className='bg-gradient-to-r from-primary-900 via-primary-500 to-primary-900 p-4 '>
            <div className='flex flex-col gap-[10px]'>
              <div className='flex flex-col gap-[30px]'>
                <div className='flex flex-row justify-between'>
                  <Label
                    label={tournamentFormData.tourn_name}
                    textColor='white'
                    textSize='h2'
                  ></Label>
                  {/* 大会要項ダウンロードボタン */}
                  {/* <CustomButton
                    buttonType='white-outlined'
                    className='w-[220px] text-normal text-white hover:text-primary-100 hover:bg-transparent hover:border-primary-100'
                    onClick={() => {
                      // TODO: 大会要項のPDFをダウンロードする処理
                      return `${TOURNAMENT_PDF_URL}${tournamentFormData.tourn_info_faile_path}`;
                    }}
                  >
                    <FileDownloadOutlinedIcon className='text-[16px] mr-1 hover:text-primary-100 '></FileDownloadOutlinedIcon>
                    大会要項ダウンロード
                  </CustomButton> */}
                  {/* ダウンロードコード追加 開始*/}
                  {tournamentFormData.tourn_info_faile_path && (
                    <Link
                      href={`${TOURNAMENT_PDF_URL}${tournamentFormData.tourn_info_faile_path}`}
                      download
                      className='w-[220px] text-normal text-white hover:text-primary-100 hover:bg-transparent hover:border-primary-100 '
                      target='_blank'
                    >
                      <FileDownloadOutlinedIcon className='text-[16px] mr-1 hover:text-primary-100 '></FileDownloadOutlinedIcon>
                      大会要項ダウンロード
                    </Link>
                  )}
                  {/* ダウンロードコード追加 終了*/}
                </div>
                <div className='flex flex-row'>
                  {/* 大会個別URL */}
                  <div className='text-gray-40 text-caption1 w-[100px]'>大会URL</div>
                  <Link
                    href={tournamentFormData.tourn_url}
                    rel='noopener noreferrer'
                    target='_blank'
                    className='text-white text-caption1 underline hover:text-primary-100'
                  >
                    {tournamentFormData.tourn_url}
                  </Link>
                </div>
                <div className='flex flex-col gap-[12px]'>
                  <Label label='開催情報' textColor='white' textSize='small' isBold={true}></Label>
                  <div className='flex flex-col gap-[5px]'>
                    <div className='flex flex-row gap-[20px]'>
                      <div className='flex flex-col gap-[5px]'>
                        <div className='flex flex-row'>
                          {/* 開催開始年月日 */}
                          <div className='text-gray-40 text-caption1 w-[100px]'>開催開始年月日</div>
                          <Label
                            label={tournamentFormData.event_start_date}
                            textColor='white'
                            textSize='caption1'
                          ></Label>
                        </div>
                        <div className='flex flex-row'>
                          {/* 開催終了年月日 */}
                          <div className='text-gray-40 text-caption1 w-[100px]'>開催終了年月日</div>
                          <Label
                            label={tournamentFormData.event_end_date}
                            textColor='white'
                            textSize='caption1'
                          ></Label>
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-row'>
                      {/* 開催場所 */}
                      <div className='text-gray-40 text-caption1 w-[100px]'>開催場所</div>
                      <Label
                        label={tournamentFormData.venue_name}
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col gap-[10px]'>
                  <Label label='主催団体' textColor='white' textSize='small' isBold={true}></Label>
                  <div className='flex flex-col gap-[5px]'>
                    <div className='flex flex-row'>
                      {/* 主催団体名 */}
                      <div className='text-gray-40 text-caption1 w-[100px]'>名前</div>
                      <Label
                        label={tournamentFormData.sponsorOrgName}
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                    </div>
                  </div>
                  <div className='flex flex-row'>
                    {/* 主催団体ID */}
                    <div className='text-gray-40 text-caption1 w-[100px]'>ID</div>
                    <Label
                      label={tournamentFormData.sponsor_org_id}
                      textColor='white'
                      textSize='caption1'
                    ></Label>
                  </div>
                </div>
                <div className='flex flex-row gap-[20px]'>
                  <div className='flex flex-row gap-[10px]'>
                    {/* 大会ID */}
                    <div className='text-gray-40 text-caption1'>大会ID：</div>
                    <Label
                      label={tournamentFormData.tourn_id?.toString() as string}
                      textColor='white'
                      textSize='caption1'
                    ></Label>
                  </div>
                  {(userIdType.is_administrator == ROLE.SYSTEM_ADMIN ||
                    userIdType.is_organization_manager == ROLE.GROUP_MANAGER ||
                    userIdType.is_jara == ROLE.JARA ||
                    userIdType.is_pref_boat_officer == ROLE.PREFECTURE) && (
                    <div className='flex flex-row gap-[10px]'>
                      {/* エントリーシステムの大会ID */}
                      <div className='text-gray-40 text-caption1'>エントリーシステムの大会ID：</div>
                      <Label
                        label={tournamentFormData.entrysystem_tourn_id}
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* TODO: DPTに仕様を確認すること。 */}
          <div className='text-lg mb-4'>
            <div className='mb-4'>
              <div className='flex justify-between items-center'>
                <div className='font-bold'>開催レース</div>
              </div>
            </div>
            {/* レース一覧テーブル表示 */}
            <CustomTable>
              <CustomThead>
                <CustomTr>
                  <CustomTh align='left'>レースID</CustomTh>
                  <CustomTh align='left'>レース名</CustomTh>
                  <CustomTh align='left'>レースNo.</CustomTh>
                  <CustomTh align='left'>
                    <div className='flex flex-row items-center gap-[10px]'>
                      種目
                      <div onClick={(event) => handleEventNameHeaderClick('種目', event as any)}>
                        <FilterListIcon />
                      </div>
                    </div>
                  </CustomTh>
                  <CustomTh align='left'>
                    <div className='flex flex-row items-center gap-[10px]'>
                      組別
                      <div onClick={(event) => handleByGroupHeaderClick('組別', event as any)}>
                        <FilterListIcon />
                      </div>
                    </div>
                  </CustomTh>
                  <CustomTh align='left'>距離</CustomTh>
                  <CustomTh align='left'>
                    <div className='flex flex-row items-center gap-[10px]'>
                      <div className='underline' onClick={() => startDateTimeSort()}>
                        発艇日時
                      </div>
                      <div
                        onClick={(event) =>
                          handleStartDateTimeHeaderClick('発艇日時', event as any)
                        }
                      >
                        <FilterListIcon />
                      </div>
                    </div>
                  </CustomTh>
                </CustomTr>
              </CustomThead>
              <CustomTbody>
                {tableData
                  .filter((row, index) => {
                    if (
                      selectedEventNameList.length === 0 &&
                      selectedByGroupList.length === 0 &&
                      selectedStartDateTimeList.length === 0
                    ) {
                      return true;
                    } else if (
                      selectedEventNameList.length > 0 &&
                      selectedByGroupList.length === 0 &&
                      selectedStartDateTimeList.length === 0
                    ) {
                      return selectedEventNameList.some((item) => item.name === row.event_name);
                    } else if (
                      selectedEventNameList.length === 0 &&
                      selectedByGroupList.length > 0 &&
                      selectedStartDateTimeList.length === 0
                    ) {
                      return selectedByGroupList.some((item) => item.name === row.by_group);
                    } else if (
                      selectedEventNameList.length === 0 &&
                      selectedByGroupList.length === 0 &&
                      selectedStartDateTimeList.length > 0
                    ) {
                      return selectedStartDateTimeList.some((item) =>
                        row.start_date_time.includes(item.name),
                      );
                    } else if (
                      selectedEventNameList.length > 0 &&
                      selectedByGroupList.length > 0 &&
                      selectedStartDateTimeList.length == 0
                    ) {
                      return (
                        selectedEventNameList.some((item) => item.name === row.event_name) &&
                        selectedByGroupList.some((item) => item.name === row.by_group)
                      );
                    } else if (
                      selectedEventNameList.length > 0 &&
                      selectedByGroupList.length == 0 &&
                      selectedStartDateTimeList.length > 0
                    ) {
                      return (
                        selectedEventNameList.some((item) => item.name === row.event_name) &&
                        selectedStartDateTimeList.some((item) =>
                          row.start_date_time.includes(item.name),
                        )
                      );
                    } else if (
                      selectedEventNameList.length == 0 &&
                      selectedByGroupList.length > 0 &&
                      selectedStartDateTimeList.length > 0
                    ) {
                      return (
                        selectedByGroupList.some((item) => item.name === row.by_group) &&
                        selectedStartDateTimeList.some((item) =>
                          row.start_date_time.includes(item.name),
                        )
                      );
                    } else {
                      return (
                        selectedEventNameList.some((item) => item.name === row.event_name) &&
                        selectedStartDateTimeList.some((item) =>
                          row.start_date_time.includes(item.name),
                        ) &&
                        selectedByGroupList.some((item) => item.name === row.by_group)
                      );
                    }
                  })
                  .map((row, index) => (
                    <CustomTr key={index}>
                      {/* 「出漕結果記録テーブル」に「レーステーブル」.「レースID」と紐づくデータが存在する場合、リンクボタンを表示するかどうかを制御するためにhasHistoryを利用 */}
                      {row.hasHistory == true && (
                        // TODO: 遷移先のURLは仮置き。置き換えること。
                        <CustomTd
                          transitionDest={
                            '/tournamentRaceResultRef?raceId=' + row.race_id?.toString()
                          }
                        >
                          {row.race_id}
                        </CustomTd>
                      )}
                      {/* レースID */}
                      {!row.hasHistory && <CustomTd>{row.race_id}</CustomTd>}
                      {row.hasHistory == true && (
                        // TODO: 遷移先のURLは仮置き。置き換えること。
                        <CustomTd
                          transitionDest={
                            '/tournamentRaceResultRef?raceId=' + row.race_id?.toString()
                          }
                        >
                          {row.race_name}
                        </CustomTd>
                      )}
                      {/* レース名 */}
                      {!row.hasHistory && <CustomTd>{row.race_name}</CustomTd>}
                      {/* レースNo. */}
                      <CustomTd>{row.race_number}</CustomTd>
                      {/* 種目 */}
                      <CustomTd>{row.event_name}</CustomTd>
                      {/* 組別 */}
                      <CustomTd>{row.by_group}</CustomTd>
                      {/* 距離 */}
                      <CustomTd>{row.range}</CustomTd>
                      {/* 発艇日時 */}
                      <CustomTd>{row.start_date_time.substring(0, 16)}</CustomTd>
                    </CustomTr>
                  ))}
              </CustomTbody>
            </CustomTable>
            {/* 種目フィルター用のオートコンプリート 20240509 */}
            {showEventNameAutocomplete && (
              <div
                ref={eventNamefocusTarget}
                style={{
                  position: 'absolute',
                  top: `${selectedEventNameHeader.position.top - 120}px`,
                  left: `${selectedEventNameHeader.position.left}px`,
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  zIndex: 1000,
                  padding: '8px',
                }}
                onBlur={() => setShowEventNameAutocomplete(false)} //フォーカスが外れたら非表示にする 20240518
              >
                <Autocomplete
                  id='eventName'
                  multiple
                  options={eventNameList}
                  filterOptions={(options, { inputValue }) =>
                    options.filter((option) => option.name.includes(inputValue))
                  }
                  value={selectedEventNameList || []}
                  onChange={(e: ChangeEvent<{}>, newValue: EventNameList[]) => {
                    //console.log(newValue);
                    setSelectedEventNameList(newValue);
                  }}
                  renderOption={(props: any, option: EventNameList) => {
                    return (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    );
                  }}
                  renderTags={(value: EventNameList[], getTagProps: any) => {
                    return value.map((option, index) => (
                      <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                    ));
                  }}
                  renderInput={(params) => (
                    <TextField
                      key={params.id}
                      className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                      {...params}
                      label={'種目'}
                    />
                  )}
                />
              </div>
            )}
            {/* 組別フィルター用のオートコンプリート 20240508 */}
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
                onBlur={() => setShowByGroupAutocomplete(false)} //フォーカスが外れたら非表示にする 20240518
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
            {/* 発艇日時用のオートコンプリート 20240509 */}
            {showStartDateTimeAutocomplete && (
              <div
                style={{
                  position: 'absolute',
                  top: `${selectedStartDateTimeHeader.position.top - 120}px`,
                  left: `${selectedStartDateTimeHeader.position.left}px`,
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  zIndex: 1000,
                  padding: '8px',
                }}
                onBlur={() => setShowStartDateTimeAutocomplete(false)} //フォーカスが外れたら非表示にする 20240518
              >
                <Autocomplete
                  id='startDateTime'
                  multiple
                  options={startDateTimeList}
                  filterOptions={(options, { inputValue }) =>
                    options.filter((option) => option.name.includes(inputValue))
                  }
                  value={selectedStartDateTimeList || []}
                  onChange={(e: ChangeEvent<{}>, newValue: StartDateTimeList[]) => {
                    //console.log(newValue);
                    setSelectedStartDateTimeList(newValue);
                  }}
                  renderOption={(props: any, option: StartDateTimeList) => {
                    return (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    );
                  }}
                  renderTags={(value: StartDateTimeList[], getTagProps: any) => {
                    return value.map((option, index) => (
                      <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                    ));
                  }}
                  renderInput={(params) => (
                    <TextField
                      key={params.id}
                      className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                      {...params}
                      label={'発艇日時'}
                    />
                  )}
                />
              </div>
            )}
          </div>
          <div className='flex flex-row justify-center gap-[40px] m-auto'>
            {/* 戻るボタン */}
            <CustomButton
              buttonType='primary-outlined'
              className='w-[280px]'
              onClick={() => {
                router.back();
              }}
            >
              戻る
            </CustomButton>
            {/* 参照モードかつ、権限がシステム管理者、大会団体管理者の時は表示 */}
            {mode === 'delete' &&
              (userIdType.is_administrator == ROLE.SYSTEM_ADMIN ||
                userIdType.is_organization_manager == ROLE.GROUP_MANAGER ||
                userIdType.is_jara == ROLE.JARA ||
                userIdType.is_pref_boat_officer == ROLE.PREFECTURE) && (
                // 削除ボタン
                <CustomButton
                  buttonType='primary'
                  className='w-[280px]'
                  onClick={async () => {
                    // TODO: 削除ボタン押下イベントの実装
                    //追加対象のデータをまとめて送信する 20240202
                    const sendFormData = {
                      tournamentFormData: tournamentFormData, //選手情報
                      tableData: tableData, //選手の出漕結果情報
                    };
                    const isOk = window.confirm('大会情報を削除します。よろしいですか？');
                    const csrf = () => axios.get('/sanctum/csrf-cookie');
                    await csrf();
                    if (isOk) {
                      // TODO: 削除確認画面でOKボタンが押された場合、テーブルの当該項目に削除フラグを立てる処理の置き換え
                      axios
                        // .delete('http://localhost:3100/tournament')
                        .post('/deleteTournamentData', sendFormData) //大会情報の削除 20240202
                        .then((response) => {
                          // TODO: 削除完了時の処理の置き換え
                          window.alert('大会情報の削除が完了しました');
                          router.push('/tournamentSearch'); //大会検索に遷移 20240311
                        })
                        .catch((error) => {
                          // TODO: エラーハンドリングの実装の置き換え
                          setError({
                            isError: true,
                            errorMessage:
                              '大会情報の削除に失敗しました。ユーザーサポートにお問い合わせください。',
                          });
                          window.scrollTo(0, 0);
                          return;
                        });
                    }
                  }}
                >
                  削除
                </CustomButton>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}
