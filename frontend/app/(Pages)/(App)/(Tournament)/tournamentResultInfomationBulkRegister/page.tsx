// 機能名: 大会結果情報一括登録
'use client';
// ライブラリのインポート
import { useState, useRef, ChangeEvent, useEffect, FocusEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// 共通コンポーネントのインポート
import {
  ErrorBox,
  CustomTitle,
  CustomButton,
  CustomTextField,
  CustomYearPicker,
  InputLabel,
  Label,
} from '@/app/components';
import Validator from '@/app/utils/validator';
// ローカルコンポーネントのインポート
import CsvHandler from './CsvHandler';
import CsvTable from './CsvTable';
import { Tournament, TournamentResponse, CheckRace } from '@/app/types';
import axios from '@/app/lib/axios';
import { Autocomplete, TextField } from '@mui/material';
import { CsvData } from './CsvDataInterface';

interface FormData {
  tournId: number;
  eventYear: string;
  tournName: string;
}

//大会名を変更した際に開催年を変更できるようにインターフェースを追加 20240318
interface TournResponse {
  id: number;
  year: string;
  name: string;
}

// CSVアップロードのプロパティの型定義
interface CsvUploadProps {
  label: string; // ラベル
  readonly: boolean; // 読み取り専用かどうか
  csvUpload: (newCsvData: { content: Array<Array<string>>; isSet: boolean }) => void; // CSVアップロード時のコールバック
  resetActivationFlg: () => void; // アクティベーションフラグのリセット
}
// CSVダウンロードのプロパティの型定義
interface CsvDownloadProps {
  data: any[];
  header: any[];
  filename: string;
  label: string;
  tournId: number;
  formData: FormData;
  checkTournName: (flg: boolean) => void;
}

// ファイル関連のアクションを扱うためのインターフェース
interface FileHandler {
  clearFile(): void;
}

// 選手情報連携のメインコンポーネント
export default function TournamentResultInfomationBulkRegister() {
  // フック
  const router = useRouter();
  const fileUploaderRef = useRef<FileHandler>(null);
  const searchParams = useSearchParams();

  // URLパラメータの取得
  const prevScreen = searchParams.get('prevScreen');
  const tournId = searchParams.get('tournId');
  const eventYear = searchParams.get('eventYear');
  const tournName = searchParams.get('tournName');

  // ステート変数
  const [csvFileData, setCsvFileData] = useState<{
    content: Array<Array<string>>;
    isSet: boolean;
  }>({ content: [], isSet: false });
  const [activationFlg, setActivationFlg] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [tournIdErrorMessage, setTournIdErrorMessage] = useState([] as string[]);
  const [eventYearErrorMessage, setEventYearErrorMessage] = useState([] as string[]);
  const [tournNameErrorMessage, setTournNameErrorMessage] = useState([] as string[]);
  const [csvFileErrorMessage, setCsvFileErrorMessage] = useState([] as string[]);
  const [csvData, setCsvData] = useState<CsvData[]>([]);
  const [dialogDisplayFlg, setDialogDisplayFlg] = useState<boolean>(false);
  const [displayRegisterButtonFlg, setDisplayRegisterButtonFlg] = useState<boolean>(false);
  const [tournamentNameIsEmpty, setTournamentNameIsEmpty] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    tournId: prevScreen === 'tournamentRef' && tournId ? Number(tournId) : 0,
    eventYear:
      prevScreen === 'tournamentRef' && eventYear
        ? eventYear
        : new Date().toLocaleDateString('ja-JP').slice(0, 4),
    tournName: prevScreen === 'tournamentRef' && tournName ? tournName : '',
  });
  const [tournamentList, setTournamentList] = useState<TournResponse[]>([]);
  // 大会情報参照画面から遷移してきた場合は、falseを設定
  const [displayFlg, setDisplayFlg] = useState<boolean>(
    prevScreen === 'tournamentRef' ? true : false,
  );
  // TODO: ユーザーの権限を取得する処理をuseEffectに記述すること
  const [userType, setUserType] = useState('');

  const [tournIdActivFlag, setTournIdActivFlag] = useState<boolean>(false); //true:変更できない false:変更できる
  const [tournStartYearActivFlag, setTournStartYearActivFlag] = useState<boolean>(false); //true:変更できない false:変更できる
  const [tournNameActivFlag, setTournNameActivFlag] = useState<boolean>(false); //true:変更できない false:変更できる
  const [readButtonActivFlag, setReadButtonActivFlag] = useState<boolean>(true); //true:変更できない false:変更できる

  const [validFlag, setValidFlag] = useState(false); //URL直打ち対策（ユーザ種別が不正なユーザが遷移できないようにする） 20240418
  //ユーザIDに紐づいた情報の取得 20240418
  useEffect(() => {
    const fetchData = async () => {
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        const response = await axios.get('/getUserData');
        console.log(response.data.result);
        if (Object.keys(response.data.result).length > 0) {
          const playerInf = await axios.get('/getIDsAssociatedWithUser');
          if (
            playerInf.data.result[0].is_administrator == 1 ||
            playerInf.data.result[0].is_jara == 1 ||
            playerInf.data.result[0].is_pref_boat_officer == 1 ||
            playerInf.data.result[0].is_organization_manager == 1
          ) {
            setValidFlag(true); //URL直打ち対策（ユーザ種別が不正なユーザが遷移できないようにする） 20240418
          } else {
            console.log('ユーザ種別不正');
            router.push('/tournamentSearch');
          }
        } else {
          console.log('ユーザ情報なし');
          router.push('/tournamentSearch');
        }
      } catch (error: any) {}
    };
    fetchData();
  }, []);

  // CSVファイルのアップロードを処理する関数
  const handleCsvUpload = (newCsvData: { content: Array<Array<string>>; isSet: boolean }) => {
    setCsvFileData(newCsvData);
  };

  // activationFlgをリセットする関数
  const resetActivationFlg = () => {
    setActivationFlg(false);
  };

  // 連携ボタンの表示を切り替える関数
  const displayRegisterButton = (flg: boolean) => {
    setDisplayRegisterButtonFlg(flg);
  };

  const checkTournName = (flg: boolean) => {
    setTournamentNameIsEmpty(flg);
  };

  // CSVテーブル内の入力変更を処理する関数
  const handleTableInputChange = (rowId: number, name: string, value: string | boolean) => {
    setCsvData((prevRows) =>
      prevRows.map((row) => (row.id === rowId ? { ...row, [name]: value } : row)),
    );
  };

  /**
   * 入力フォームの変更時の処理
   * @param name
   * @param value
   * @description
   * nameとvalueを受け取り、stateを更新する
   */
  const handleInputChange = (name: string, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // バリデーションを実行する関数
  const performValidation = () => {
    const msg = csvFileData?.content?.length !== 0 ? 'exist' : '';
    const csvFileError = Validator.getErrorMessages([
      Validator.validateRequired(msg, '読み込むCSVファイル'),
    ]);
    setCsvFileErrorMessage(csvFileError);
  };

  // CSVアップロードのプロパティ
  const csvUploadProps = {
    label: '読み込みCSVファイル',
    readonly: activationFlg,
    csvUpload: handleCsvUpload,
    resetActivationFlg: resetActivationFlg,
  } as CsvUploadProps;

  useEffect(() => {
    if (tournamentNameIsEmpty) {
      const tournNameError = Validator.getErrorMessages([
        Validator.validateSelectRequired(formData.tournName, '大会名'),
      ]);
      setTournNameErrorMessage(tournNameError);
    } else {
      setTournNameErrorMessage([]);
    }
  }, [tournamentNameIsEmpty]);

  // CSVダウンロードのプロパティ
  const [csvDownloadProps, setCsvDownloadProps] = useState<CsvDownloadProps>({
    header: [
      { label: '大会ID', key: 'tournId' },
      { label: 'エントリー大会ID', key: 'entrysystemTournId' },
      { label: '大会名', key: 'tournName' },
      { label: '選手ID', key: 'userId' },
      { label: 'JARA選手コード', key: 'jaraPlayerId' },
      { label: '選手名', key: 'playerName' },
      { label: 'レースID', key: 'raceId' },
      { label: 'エントリーレースID', key: 'entrysystemRaceId' },
      { label: 'レースNo', key: 'raceNumber' },
      { label: 'レース名', key: 'raceName' },
      { label: 'レース区分ID', key: 'raceTypeId' },
      { label: 'レース区分名', key: 'raceTypeName' },
      { label: '団体ID', key: 'orgId' },
      { label: 'エントリー団体コード', key: 'entrysystemOrgId' },
      { label: '団体名', key: 'orgName' },
      { label: 'クルー名', key: 'crewName' },
      { label: '組別', key: 'byGroup' },
      { label: '種目ID', key: 'eventId' },
      { label: '種目名', key: 'eventName' },
      { label: '距離', key: 'range' },
      { label: '順位', key: 'rank' },
      { label: '500mlapタイム', key: 'fiveHundredmLaptime' },
      { label: '1000mlapタイム', key: 'tenHundredmLaptime' },
      { label: '1500mlapタイム', key: 'fifteenHundredmLaptime' },
      { label: '2000mlapタイム', key: 'twentyHundredmLaptime' },
      { label: '最終タイム', key: 'finalTime' },
      { label: 'ストロークレート（平均）', key: 'strokeRateAvg' },
      { label: '500mストロークレート', key: 'fiveHundredmStrokeRat' },
      { label: '1000mストロークレート', key: 'tenHundredmStrokeRat' },
      { label: '1500mストロークレート', key: 'fifteenHundredmStrokeRat' },
      { label: '2000mストロークレート', key: 'twentyHundredmStrokeRat' },
      { label: '心拍数（平均）', key: 'heartRateAvg' },
      { label: '500m心拍数', key: 'fiveHundredmHeartRate' },
      { label: '1000m心拍数', key: 'tenHundredmHeartRate' },
      { label: '1500m心拍数', key: 'fifteenHundredmHeartRate' },
      { label: '2000m心拍数', key: 'twentyHundredmHeartRate' },
      { label: '公式／非公式', key: 'official' },
      { label: '立ち合い有無', key: 'attendance' },
      { label: 'エルゴ体重', key: 'ergoWeight' },
      { label: '選手身長', key: 'playerHeight' },
      { label: '選手体重', key: 'playerWeight' },
      { label: 'シート番号ID', key: 'mSheetNumber' },
      { label: 'シート番号', key: 'sheetName' },
      { label: '出漕結果記録名', key: 'raceResultRecordName' },
      { label: '発艇日時', key: 'startDatetime' },
      { label: '天候', key: 'weather' },
      { label: '2000m地点風速', key: 'windSpeedTwentyHundredmPoint' },
      { label: '2000m地点風向', key: 'windDirectionTwentyHundredmPoint' },
      { label: '1000m地点風速', key: 'windSpeedTenHundredmPoint' },
      { label: '1000m地点風向', key: 'windDirectionTenHundredmPoint' },
      { label: '備考', key: 'remark' },
    ],
    data: [],
    filename: '',
    label: 'CSVフォーマット出力',
    tournId: 0,
    formData: {
      tournId: 0,
      eventYear: '',
      tournName: '',
    },
    checkTournName: checkTournName,
  });

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 仮のURL（繋ぎ込み時に変更すること）
        // TODO: ログインユーザーの権限によって取得する大会情報を変更すること
        // 大会名
        // const tournamentResponse = await axios.get<TournamentResponse[]>('http://localhost:3100/tournaments',);
        // const TournamentsResponse = await axios.get('/getTournamentInfoData_allData');
        console.log(formData?.eventYear);
        const sendVal = { event_start_year: formData?.eventYear };
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        const TournamentsResponse = await axios.post('/tournamentEntryYearSearch', sendVal);
        console.log(TournamentsResponse);
        const TournamentsResponseList = TournamentsResponse.data.result.map(
          ({
            tourn_id,
            tourn_name,
            event_start_date,
          }: {
            tourn_id: number;
            tourn_name: string;
            event_start_date: string;
          }) => ({
            id: tourn_id,
            name: tourn_name,
            year: event_start_date.substring(0, 4),
          }),
        );
        // console.log(TournamentsResponseList);
        setTournamentList(TournamentsResponseList);
      } catch (error) {
        setErrorMessage(['API取得エラー:' + (error as Error).message]);
      }
    };
    fetchData();
  }, []);

  const handleSearchTournament = async (name: string, e: FocusEvent<HTMLInputElement>) => {
    console.log(formData.tournId);
    // 大会IDが入力されている場合
    if (formData.tournId != 0 && formData.tournId != null && formData.tournId != undefined) {
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        // 仮のURL（繋ぎ込み時に変更すること）
        // const apiURL = `http://localhost:3100/tournament?${name}=${e.target.value}`;
        // 大会情報を取得
        // const tournamentResponse = await axios.get<Tournament>('http://localhost:3100/tournament');
        const tornSearchVal = { tourn_id: formData.tournId };
        console.log(tornSearchVal);
        const tournamentResponse = await axios.post('/getTournamentInfoData', tornSearchVal);
        console.log(tournamentResponse.data.result);
        // 大会情報が取得できなかった場合
        if (
          tournamentResponse.data.result === undefined ||
          tournamentResponse.data.result === null
        ) {
          setTournIdErrorMessage(['入力された大会IDの大会は、存在しませんでした。']);
          return;
        } else {
          // 大会情報が取得できた場合
          setFormData((prevFormData) => ({
            ...prevFormData,
            // eventYear: tournamentResponse.data.result.event_start_date.slice(0, 4),
            tournId: tournamentResponse.data.result.tourn_id,
            eventYear: tournamentResponse.data.result.event_start_date,
            tournName: tournamentResponse.data.result.tourn_name,
          }));
          // 大会IDを入力して大会情報が取得できた場合、csvフォーマット出力用に値をセットする 20240419
          setCsvDownloadProps((prevProps) => ({
            ...prevProps,
            filename: tournamentResponse.data.result.tourn_name,
            formData: {
              tournId: tournamentResponse.data.result.tourn_id,
              eventYear: tournamentResponse.data.result.event_start_date,
              tournName: tournamentResponse.data.result.tourn_name,
            },
          }));
          // setDisplayFlg(false);
          setTournIdActivFlag(true); //true:変更できない false:変更できる
          setTournStartYearActivFlag(true); //true:変更できない false:変更できる
          setTournNameActivFlag(false); //true:変更できない false:変更できる
          setReadButtonActivFlag(false); //true:変更できない false:変更できる
        }
      } catch (error) {
        setErrorMessage(['API取得エラー:' + (error as Error).message]);
      }
    } else {
      try {
        console.log(e);
        // var eventYearVal = { event_start_year: e.target.value };
        var eventYearVal = { event_start_year: formData.eventYear };
        console.log(eventYearVal);
        // 大会情報を取得
        // const tournamentResponse = await axios.get<Tournament>('http://localhost:3100/tournament');
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        const tournamentResponse = await axios.post('/tournamentEntryYearSearch', eventYearVal);
        console.log(tournamentResponse.data.result);
        // 大会情報が取得できなかった場合
        if (tournamentResponse.data === undefined || tournamentResponse.data === null) {
          setTournIdErrorMessage(['大会IDを入力してください。']);
          return;
        } else {
          // 大会情報が取得できた場合
          // setFormData((prevFormData) => ({
          //   ...prevFormData,
          //   // eventYear: tournamentResponse.data.event_start_date.slice(0, 4),
          //   eventYear: tournamentResponse.data.result.event_start_date,
          //   tourn: {
          //     id: Number(tournamentResponse.data.result.tourn_id),
          //     name: tournamentResponse.data.result.tourn_name,
          //   },
          // }));
          // setDisplayFlg(false);
          if (tournamentResponse.data.result.length > 0) {
            const TournResList = tournamentResponse.data.result.map(
              ({
                tourn_id,
                tourn_name,
                event_start_date,
              }: {
                tourn_id: number;
                tourn_name: string;
                event_start_date: string;
              }) => ({
                id: tourn_id,
                name: tourn_name,
                year: event_start_date.substring(0, 4),
              }),
            );
            setTournamentList(TournResList);
          } else {
            setTournamentList([]);
          }
        }
      } catch (error) {
        setErrorMessage(['API取得エラー:' + (error as Error).message]);
      }
    }
  };

  // 大会IDのテキストフィールドでの最大文字数
  const maxLength = 5;
  // CSVファイルの項目数
  const csvElementNum = 51;

  // CSV項目のバリデーション
  const checkStringLegnth = (element: string, maxLength: number) => {
    return new TextEncoder().encode(element).length > maxLength;
  };

  const checkMaxInt = (element: string, maxNumber: number) => {
    return Number(element) > maxNumber;
  };

  const checkMaxDouble = (element: string, maxInt: number, maxDecimal: number) => {
    const regexPart = '\\d{1,' + maxInt + '}(\\.\\d{0,' + maxDecimal + '})?';
    const regex = new RegExp('^' + regexPart + '$');
    return !regex.test(element);
  };

  const checkTimestamp = (element: string) => {
    return !/^\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}$/.test(element);
  };

  const checkFlg = (element: string) => {
    return element !== '0' && element !== '1';
  };

  const checkRequired = (official: string, flg: string, element: string) => {
    return official === flg ? element === '' || element === undefined : false;
  };

  // CSVデータの処理
  // const handleCsvData = async (row: string[], rowIndex: number) => {
  //   if (row.length !== csvElementNum) {
  //     setCsvData((prevData) => [
  //       ...(prevData as CsvData[]),
  //       {
  //         id: rowIndex,
  //         checked: false,
  //         loadingResult: '無効データ',
  //         tournId: '-',
  //         tournIdError: false,
  //         entrysystemTournId: '-',
  //         entrysystemTournIdError: false,
  //         tournName: '-',
  //         tournNameError: false,
  //         userId: '-',
  //         userIdError: false,
  //         jaraPlayerId: '-',
  //         jaraPlayerIdError: false,
  //         playerName: '-',
  //         playerNameError: false,
  //         raceId: '-',
  //         raceIdError: false,
  //         entrysystemRaceId: '-',
  //         entrysystemRaceIdError: false,
  //         raceNumber: '-',
  //         raceNumberError: false,
  //         raceName: '-',
  //         raceNameError: false,
  //         raceTypeId: '-',
  //         raceTypeIdError: false,
  //         raceTypeName: '-',
  //         raceTypeNameError: false,
  //         orgId: '-',
  //         orgIdError: false,
  //         entrysystemOrgId: '-',
  //         entrysystemOrgIdError: false,
  //         orgName: '-',
  //         orgNameError: false,
  //         crewName: '-',
  //         crewNameError: false,
  //         byGroup: '-',
  //         byGroupError: false,
  //         eventId: '-',
  //         eventIdError: false,
  //         eventName: '-',
  //         eventNameError: false,
  //         range: '-',
  //         rangeError: false,
  //         rank: '-',
  //         rankError: false,
  //         fiveHundredmLaptime: '-',
  //         fiveHundredmLaptimeError: false,
  //         tenHundredmLaptime: '-',
  //         tenHundredmLaptimeError: false,
  //         fifteenHundredmLaptime: '-',
  //         fifteenHundredmLaptimeError: false,
  //         twentyHundredmLaptime: '-',
  //         twentyHundredmLaptimeError: false,
  //         finalTime: '-',
  //         finalTimeError: false,
  //         strokeRateAvg: '-',
  //         strokeRateAvgError: false,
  //         fiveHundredmStrokeRat: '-',
  //         fiveHundredmStrokeRatError: false,
  //         tenHundredmStrokeRat: '-',
  //         tenHundredmStrokeRatError: false,
  //         fifteenHundredmStrokeRat: '-',
  //         fifteenHundredmStrokeRatError: false,
  //         twentyHundredmStrokeRat: '-',
  //         twentyHundredmStrokeRatError: false,
  //         heartRateAvg: '-',
  //         heartRateAvgError: false,
  //         fiveHundredmHeartRate: '-',
  //         fiveHundredmHeartRateError: false,
  //         tenHundredmHeartRate: '-',
  //         tenHundredmHeartRateError: false,
  //         fifteenHundredmHeartRate: '-',
  //         fifteenHundredmHeartRateError: false,
  //         twentyHundredmHeartRate: '-',
  //         twentyHundredmHeartRateError: false,
  //         official: '-',
  //         officialError: false,
  //         attendance: '-',
  //         attendanceError: false,
  //         ergoWeight: '-',
  //         ergoWeightError: false,
  //         playerHeight: '-',
  //         playerHeightError: false,
  //         playerWeight: '-',
  //         playerWeightError: false,
  //         mSheetNumber: '-',
  //         mSheetNumberError: false,
  //         sheetName: '-',
  //         sheetNameError: false,
  //         raceResultRecordName: '-',
  //         raceResultRecordNameError: false,
  //         startDatetime: '-',
  //         startDatetimeError: false,
  //         weather: '-',
  //         weatherError: false,
  //         windSpeedTwentyHundredmPoint: '-',
  //         windSpeedTwentyHundredmPointError: false,
  //         windDirectionTwentyHundredmPoint: '-',
  //         windDirectionTwentyHundredmPointError: false,
  //         windSpeedTenHundredmPoint: '-',
  //         windSpeedTenHundredmPointError: false,
  //         windDirectionTenHundredmPoint: '-',
  //         windDirectionTenHundredmPointError: false,
  //         remark: '-',
  //         remarkError: false,
  //       },
  //     ]);
  //   } else {
  //     let apiUri = 'http://localhost:3100/checkRace/';
  //     let loadingResult = '';
  //     try {
  //       const response = await axios.get<CheckRace>('http://localhost:3100/checkRace/');
  //       const data = response.data;

  //       if (data.hasMatch) {
  //         loadingResult = '更新登録';
  //       } else {
  //         loadingResult = '新規登録';
  //       }
  //     } catch (error) {
  //       setErrorMessage(['API取得エラー:' + (error as Error).message]);
  //     }

  //     const tournIdError = checkMaxInt(row[0], 100000) || checkRequired(row[36], '0', row[0]);
  //     const entrysystemTournIdError =
  //       checkMaxInt(row[1], 10000000) || checkRequired(row[36], '1', row[1]);
  //     const tournNameError = checkStringLegnth(row[2], 255) || checkRequired(row[36], '1', row[2]);
  //     const userIdError = checkMaxInt(row[3], 10000000) || checkRequired(row[36], '0', row[3]);
  //     const jaraPlayerIdError =
  //       checkStringLegnth(row[4], 12) || checkRequired(row[36], '1', row[4]);
  //     const playerNameError = checkStringLegnth(row[5], 100) || checkRequired(row[36], '1', row[5]);
  //     const raceIdError = checkMaxInt(row[6], 100000000) || row[6] === '' || row[6] === undefined;
  //     const entrysystemRaceIdError =
  //       checkMaxInt(row[7], 10000000) || checkRequired(row[36], '0', row[7]);
  //     const raceNumberError = checkMaxInt(row[8], 1000) || checkRequired(row[36], '1', row[8]);
  //     const raceNameError = checkStringLegnth(row[9], 255) || checkRequired(row[36], '0', row[9]);
  //     const raceTypeIdError = checkMaxInt(row[10], 1000) || checkRequired(row[36], '0', row[10]);
  //     const raceTypeNameError =
  //       checkStringLegnth(row[11], 255) || checkRequired(row[36], '1', row[11]);
  //     const orgIdError = checkMaxInt(row[12], 10000);
  //     const entrysystemOrgIdError = checkStringLegnth(row[13], 6);
  //     const orgNameError = checkStringLegnth(row[14], 255);
  //     const crewNameError = checkStringLegnth(row[15], 255);
  //     const byGroupError = checkStringLegnth(row[16], 255);
  //     const eventIdError = checkMaxInt(row[17], 1000);
  //     const eventNameError = checkStringLegnth(row[18], 255);
  //     const rangeError = checkMaxInt(row[19], 10000);
  //     const rankError = checkMaxInt(row[20], 1000);
  //     const fiveHundredmLaptimeError = checkMaxDouble(row[21], 5, 2);
  //     const tenHundredmLaptimeError = checkMaxDouble(row[22], 5, 2);
  //     const fifteenHundredmLaptimeError = checkMaxDouble(row[23], 5, 2);
  //     const twentyHundredmLaptimeError = checkMaxDouble(row[24], 5, 2);
  //     const finalTimeError = checkMaxDouble(row[25], 5, 2);
  //     const strokeRateAvgError = checkMaxInt(row[26], 1000);
  //     const fiveHundredmStrokeRatError = checkMaxInt(row[27], 1000);
  //     const tenHundredmStrokeRatError = checkMaxInt(row[28], 1000);
  //     const fifteenHundredmStrokeRatError = checkMaxInt(row[29], 1000);
  //     const twentyHundredmStrokeRatError = checkMaxInt(row[30], 1000);
  //     const heartRateAvgError = checkMaxInt(row[31], 1000);
  //     const fiveHundredmHeartRateError = checkMaxInt(row[32], 1000);
  //     const tenHundredmHeartRateError = checkMaxInt(row[33], 1000);
  //     const fifteenHundredmHeartRateError = checkMaxInt(row[34], 1000);
  //     const twentyHundredmHeartRateError = checkMaxInt(row[35], 1000);
  //     const officialError = checkFlg(row[36]);
  //     const attendanceError = checkFlg(row[37]);
  //     const ergoWeightError = checkMaxDouble(row[38], 3, 2);
  //     const playerHeightError = checkMaxDouble(row[39], 3, 2);
  //     const playerWeightError = checkMaxDouble(row[40], 3, 2);
  //     const mSheetNumberError = checkMaxInt(row[41], 100);
  //     const sheetNameError = checkStringLegnth(row[42], 255);
  //     const raceResultRecordNameError = checkStringLegnth(row[43], 255);
  //     const startDatetimeError = checkTimestamp(row[44]);
  //     const weatherError = checkStringLegnth(row[45], 255);
  //     const windSpeedTwentyHundredmPointError = checkMaxDouble(row[46], 3, 2);
  //     const windDirectionTwentyHundredmPointError = checkStringLegnth(row[47], 255);
  //     const windSpeedTenHundredmPointError = checkMaxDouble(row[48], 3, 2);
  //     const windDirectionTenHundredmPointError = checkStringLegnth(row[49], 255);
  //     const remarkError = checkStringLegnth(row[50], 255);
  //     const error =
  //       tournIdError ||
  //       entrysystemTournIdError ||
  //       tournNameError ||
  //       userIdError ||
  //       jaraPlayerIdError ||
  //       playerNameError ||
  //       raceIdError ||
  //       entrysystemRaceIdError ||
  //       raceNumberError ||
  //       raceNameError ||
  //       raceTypeIdError ||
  //       raceTypeNameError ||
  //       orgIdError ||
  //       entrysystemOrgIdError ||
  //       orgNameError ||
  //       crewNameError ||
  //       byGroupError ||
  //       eventIdError ||
  //       eventNameError ||
  //       rangeError ||
  //       rankError ||
  //       fiveHundredmLaptimeError ||
  //       tenHundredmLaptimeError ||
  //       fifteenHundredmLaptimeError ||
  //       twentyHundredmLaptimeError ||
  //       finalTimeError ||
  //       strokeRateAvgError ||
  //       fiveHundredmStrokeRatError ||
  //       tenHundredmStrokeRatError ||
  //       fifteenHundredmStrokeRatError ||
  //       twentyHundredmStrokeRatError ||
  //       heartRateAvgError ||
  //       fiveHundredmHeartRateError ||
  //       tenHundredmHeartRateError ||
  //       fifteenHundredmHeartRateError ||
  //       twentyHundredmHeartRateError ||
  //       officialError ||
  //       attendanceError ||
  //       ergoWeightError ||
  //       playerHeightError ||
  //       playerWeightError ||
  //       mSheetNumberError ||
  //       sheetNameError ||
  //       raceResultRecordNameError ||
  //       startDatetimeError ||
  //       weatherError ||
  //       windSpeedTwentyHundredmPointError ||
  //       windDirectionTwentyHundredmPointError ||
  //       windSpeedTenHundredmPointError ||
  //       windDirectionTenHundredmPointError ||
  //       remarkError;

  //     setCsvData((prevData) => [
  //       ...(prevData as CsvData[]),
  //       {
  //         id: rowIndex,
  //         checked: error ? false : true,
  //         loadingResult: error ? '登録不可データ' : loadingResult,
  //         tournId: row[0],
  //         tournIdError: tournIdError,
  //         entrysystemTournId: row[1],
  //         entrysystemTournIdError: entrysystemTournIdError,
  //         tournName: row[2],
  //         tournNameError: tournNameError,
  //         userId: row[3],
  //         userIdError: userIdError,
  //         jaraPlayerId: row[4],
  //         jaraPlayerIdError: jaraPlayerIdError,
  //         playerName: row[5],
  //         playerNameError: playerNameError,
  //         raceId: row[6],
  //         raceIdError: raceIdError,
  //         entrysystemRaceId: row[7],
  //         entrysystemRaceIdError: entrysystemRaceIdError,
  //         raceNumber: row[8],
  //         raceNumberError: raceNumberError,
  //         raceName: row[9],
  //         raceNameError: raceNameError,
  //         raceTypeId: row[10],
  //         raceTypeIdError: raceTypeIdError,
  //         raceTypeName: row[11],
  //         raceTypeNameError: raceTypeNameError,
  //         orgId: row[12],
  //         orgIdError: orgIdError,
  //         entrysystemOrgId: row[13],
  //         entrysystemOrgIdError: entrysystemOrgIdError,
  //         orgName: row[14],
  //         orgNameError: orgNameError,
  //         crewName: row[15],
  //         crewNameError: crewNameError,
  //         byGroup: row[16],
  //         byGroupError: byGroupError,
  //         eventId: row[17],
  //         eventIdError: eventIdError,
  //         eventName: row[18],
  //         eventNameError: eventNameError,
  //         range: row[19],
  //         rangeError: rangeError,
  //         rank: row[20],
  //         rankError: rankError,
  //         fiveHundredmLaptime: row[21],
  //         fiveHundredmLaptimeError: fiveHundredmLaptimeError,
  //         tenHundredmLaptime: row[22],
  //         tenHundredmLaptimeError: tenHundredmLaptimeError,
  //         fifteenHundredmLaptime: row[23],
  //         fifteenHundredmLaptimeError: fifteenHundredmLaptimeError,
  //         twentyHundredmLaptime: row[24],
  //         twentyHundredmLaptimeError: twentyHundredmLaptimeError,
  //         finalTime: row[25],
  //         finalTimeError: finalTimeError,
  //         strokeRateAvg: row[26],
  //         strokeRateAvgError: strokeRateAvgError,
  //         fiveHundredmStrokeRat: row[27],
  //         fiveHundredmStrokeRatError: fiveHundredmStrokeRatError,
  //         tenHundredmStrokeRat: row[28],
  //         tenHundredmStrokeRatError: tenHundredmStrokeRatError,
  //         fifteenHundredmStrokeRat: row[29],
  //         fifteenHundredmStrokeRatError: fifteenHundredmStrokeRatError,
  //         twentyHundredmStrokeRat: row[30],
  //         twentyHundredmStrokeRatError: twentyHundredmStrokeRatError,
  //         heartRateAvg: row[31],
  //         heartRateAvgError: heartRateAvgError,
  //         fiveHundredmHeartRate: row[32],
  //         fiveHundredmHeartRateError: fiveHundredmHeartRateError,
  //         tenHundredmHeartRate: row[33],
  //         tenHundredmHeartRateError: tenHundredmHeartRateError,
  //         fifteenHundredmHeartRate: row[34],
  //         fifteenHundredmHeartRateError: fifteenHundredmHeartRateError,
  //         twentyHundredmHeartRate: row[35],
  //         twentyHundredmHeartRateError: twentyHundredmHeartRateError,
  //         official: row[36],
  //         officialError: officialError,
  //         attendance: row[37],
  //         attendanceError: attendanceError,
  //         ergoWeight: row[38],
  //         ergoWeightError: ergoWeightError,
  //         playerHeight: row[39],
  //         playerHeightError: playerHeightError,
  //         playerWeight: row[40],
  //         playerWeightError: playerWeightError,
  //         mSheetNumber: row[41],
  //         mSheetNumberError: mSheetNumberError,
  //         sheetName: row[42],
  //         sheetNameError: sheetNameError,
  //         raceResultRecordName: row[43],
  //         raceResultRecordNameError: raceResultRecordNameError,
  //         startDatetime: row[44],
  //         startDatetimeError: startDatetimeError,
  //         weather: row[45],
  //         weatherError: weatherError,
  //         windSpeedTwentyHundredmPoint: row[46],
  //         windSpeedTwentyHundredmPointError: windSpeedTwentyHundredmPointError,
  //         windDirectionTwentyHundredmPoint: row[47],
  //         windDirectionTwentyHundredmPointError: windDirectionTwentyHundredmPointError,
  //         windSpeedTenHundredmPoint: row[48],
  //         windSpeedTenHundredmPointError: windSpeedTenHundredmPointError,
  //         windDirectionTenHundredmPoint: row[49],
  //         windDirectionTenHundredmPointError: windDirectionTenHundredmPointError,
  //         remark: row[50],
  //         remarkError: remarkError,
  //       },
  //     ]);
  //     setDisplayRegisterButtonFlg(true);
  //   }
  // };

  const getJsonRow = async (row: string[], index: number) => {
    const expectedColumnCount = 51; // 期待する列数

    if (row.length !== expectedColumnCount) {
      // 列数が期待する列数と異なる場合
      // loadingResultは無効データとし、各項目は-とする
      return {
        id: index,
        checked: false,
        loadingResult: '無効データ',
        tournId: '-',
        tournIdError: true,
        entrysystemTournId: '-',
        entrysystemTournIdError: true,
        tournName: '-',
        tournNameError: true,
        userId: '-',
        userIdError: true,
        jaraPlayerId: '-',
        jaraPlayerIdError: true,
        playerName: '-',
        playerNameError: true,
        raceId: '-',
        raceIdError: true,
        entrysystemRaceId: '-',
        entrysystemRaceIdError: true,
        raceNumber: '-',
        raceNumberError: true,
        raceName: '-',
        raceNameError: true,
        raceTypeId: '-',
        raceTypeIdError: true,
        raceTypeName: '-',
        raceTypeNameError: true,
        orgId: '-',
        orgIdError: true,
        entrysystemOrgId: '-',
        entrysystemOrgIdError: true,
        orgName: '-',
        orgNameError: true,
        crewName: '-',
        crewNameError: true,
        byGroup: '-',
        byGroupError: true,
        eventId: '-',
        eventIdError: true,
        eventName: '-',
        eventNameError: true,
        range: '-',
        rangeError: true,
        rank: '-',
        rankError: true,
        fiveHundredmLaptime: '-',
        fiveHundredmLaptimeError: true,
        tenHundredmLaptime: '-',
        tenHundredmLaptimeError: true,
        fifteenHundredmLaptime: '-',
        fifteenHundredmLaptimeError: true,
        twentyHundredmLaptime: '-',
        twentyHundredmLaptimeError: true,
        finalTime: '-',
        finalTimeError: true,
        strokeRateAvg: '-',
        strokeRateAvgError: true,
        fiveHundredmStrokeRat: '-',
        fiveHundredmStrokeRatError: true,
        tenHundredmStrokeRat: '-',
        tenHundredmStrokeRatError: true,
        fifteenHundredmStrokeRat: '-',
        fifteenHundredmStrokeRatError: true,
        twentyHundredmStrokeRat: '-',
        twentyHundredmStrokeRatError: true,
        heartRateAvg: '-',
        heartRateAvgError: true,
        fiveHundredmHeartRate: '-',
        fiveHundredmHeartRateError: true,
        tenHundredmHeartRate: '-',
        tenHundredmHeartRateError: true,
        fifteenHundredmHeartRate: '-',
        fifteenHundredmHeartRateError: true,
        twentyHundredmHeartRate: '-',
        twentyHundredmHeartRateError: true,
        official: '-',
        officialError: true,
        attendance: '-',
        attendanceError: true,
        ergoWeight: '-',
        ergoWeightError: true,
        playerHeight: '-',
        playerHeightError: true,
        playerWeight: '-',
        playerWeightError: true,
        mSheetNumber: '-',
        mSheetNumberError: true,
        sheetName: '-',
        sheetNameError: true,
        raceResultRecordName: '-',
        raceResultRecordNameError: true,
        startDatetime: '-',
        startDatetimeError: true,
        weather: '-',
        weatherError: true,
        windSpeedTwentyHundredmPoint: '-',
        windSpeedTwentyHundredmPointError: true,
        windDirectionTwentyHundredmPoint: '-',
        windDirectionTwentyHundredmPointError: true,
        windSpeedTenHundredmPoint: '-',
        windSpeedTenHundredmPointError: true,
        windDirectionTenHundredmPoint: '-',
        windDirectionTenHundredmPointError: true,
        remark: '-',
        remarkError: true,
      };
    } else {
      return {
        id: index,
        checked: true,
        loadingResult: '',
        tournId: row[0],
        tournIdError: false,
        entrysystemTournId: row[1],
        entrysystemTournIdError: false,
        tournName: row[2],
        tournNameError: false,
        userId: row[3],
        userIdError: false,
        jaraPlayerId: row[4],
        jaraPlayerIdError: false,
        playerName: row[5],
        playerNameError: false,
        raceId: row[6],
        raceIdError: false,
        entrysystemRaceId: row[7],
        entrysystemRaceIdError: false,
        raceNumber: row[8],
        raceNumberError: false,
        raceName: row[9],
        raceNameError: false,
        raceTypeId: row[10],
        raceTypeIdError: false,
        raceTypeName: row[11],
        raceTypeNameError: false,
        orgId: row[12],
        orgIdError: false,
        entrysystemOrgId: row[13],
        entrysystemOrgIdError: false,
        orgName: row[14],
        orgNameError: false,
        crewName: row[15],
        crewNameError: false,
        byGroup: row[16],
        byGroupError: false,
        eventId: row[17],
        eventIdError: false,
        eventName: row[18],
        eventNameError: false,
        range: row[19],
        rangeError: false,
        rank: row[20],
        rankError: false,
        fiveHundredmLaptime: row[21],
        fiveHundredmLaptimeError: false,
        tenHundredmLaptime: row[22],
        tenHundredmLaptimeError: false,
        fifteenHundredmLaptime: row[23],
        fifteenHundredmLaptimeError: false,
        twentyHundredmLaptime: row[24],
        twentyHundredmLaptimeError: false,
        finalTime: row[25],
        finalTimeError: false,
        strokeRateAvg: row[26],
        strokeRateAvgError: false,
        fiveHundredmStrokeRat: row[27],
        fiveHundredmStrokeRatError: false,
        tenHundredmStrokeRat: row[28],
        tenHundredmStrokeRatError: false,
        fifteenHundredmStrokeRat: row[29],
        fifteenHundredmStrokeRatError: false,
        twentyHundredmStrokeRat: row[30],
        twentyHundredmStrokeRatError: false,
        heartRateAvg: row[31],
        heartRateAvgError: false,
        fiveHundredmHeartRate: row[32],
        fiveHundredmHeartRateError: false,
        tenHundredmHeartRate: row[33],
        tenHundredmHeartRateError: false,
        fifteenHundredmHeartRate: row[34],
        fifteenHundredmHeartRateError: false,
        twentyHundredmHeartRate: row[35],
        twentyHundredmHeartRateError: false,
        official: row[36],
        officialError: false,
        attendance: row[37],
        attendanceError: false,
        ergoWeight: row[38],
        ergoWeightError: false,
        playerHeight: row[39],
        playerHeightError: false,
        playerWeight: row[40],
        playerWeightError: false,
        mSheetNumber: row[41],
        mSheetNumberError: false,
        sheetName: row[42],
        sheetNameError: false,
        raceResultRecordName: row[43],
        raceResultRecordNameError: false,
        startDatetime: row[44],
        startDatetimeError: false,
        weather: row[45],
        weatherError: false,
        windSpeedTwentyHundredmPoint: row[46],
        windSpeedTwentyHundredmPointError: false,
        windDirectionTwentyHundredmPoint: row[47],
        windDirectionTwentyHundredmPointError: false,
        windSpeedTenHundredmPoint: row[48],
        windSpeedTenHundredmPointError: false,
        windDirectionTenHundredmPoint: row[49],
        windDirectionTenHundredmPointError: false,
        remark: row[50],
        remarkError: false,
      };
    }
  };

  //読み込むボタン押下時 20240302
  const sendCsvData = async (row: any[]) => {
    try {
      const sendTournData = {
        tournData: formData,
        csvDataList: row,
      };
      const csrf = () => axios.get('/sanctum/csrf-cookie');
      await csrf();
      const response = await axios.post('/sendTournamentResultCsvData', sendTournData);
      console.log(response.data);
      setCsvData(response.data.result.csvDataList);
    } catch (error) {
      console.log(error);
      setErrorMessage(['エラー:  ' + (error as any).response?.data.result]);
    } finally {
      setActivationFlg(false);
    }
  };

  //連携ボタン押下時 20240302
  const registerCsvData = async () => {
    const sendTournData = {
      tournData: formData,
      csvDataList: csvData,
    };
    const csrf = () => axios.get('/sanctum/csrf-cookie');
    await csrf();
    await axios
      .post('/registerTournamentResultCsvData', sendTournData)
      .then((res) => {
        console.log(res.data.result);
        // router.push('/tournamentSearch'); // 20240222
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // レンダリング
  return (
    validFlag && (
      <div>
        <main className='flex min-h-screen flex-col justify-start p-[10px] m-auto gap-[20px] my-[80px]'>
          {/* 画面名*/}
          <CustomTitle isCenter={false} displayBack>
            レース結果情報一括登録
          </CustomTitle>
          {/* エラーメッセージの表示 */}
          <ErrorBox errorText={errorMessage} />
          {/* 大会ID */}
          <div className='flex flex-col justify-start gap-[8px]'>
            <CustomTextField
              label='大会ID'
              displayHelp={false}
              disabled={tournIdActivFlag}
              value={formData?.tournId === 0 ? '' : formData.tournId.toString()}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.value.length <= maxLength) {
                  handleInputChange('tournId', e.target.value);
                }
                console.log(tournNameActivFlag, e.target.value.length);
                // if (tournNameActivFlag == false) {
                //   console.log("setFormActiveFlag call");
                //   setTournNameActivFlag(true); //大会名の入力欄を変更できないようにする true:変更できない false:変更できる
                // }
                // if (tournNameActivFlag == true && e.target.value.length == 0) {
                //   setTournNameActivFlag(false); //大会名の入力欄を変更できるようにする true:変更できない false:変更できる
                // }
              }}
              onBlur={(e: FocusEvent<HTMLInputElement>) => {
                console.log('==== CustomTextField');
                handleSearchTournament('tournId', e);
              }}
              // readonly={displayFlg}
              type='number'
              maxLength={maxLength}
              isError={tournIdErrorMessage.length > 0}
              errorMessages={tournIdErrorMessage}
            />
            <div className={prevScreen === 'tournamentRef' ? 'hidden' : ''}>
              <Label
                label='※大会IDが分かる場合、入力してください。'
                textColor='red'
                textSize='caption1'
              />
            </div>
          </div>
          {/* 大会開催年 */}
          <div className='flex flex-col justify-start gap-[8px]'>
            <InputLabel label='大会開催年（西暦）' required />
            <div className='flex flex-row justify-start'>
              <CustomYearPicker
                // placeHolder={new Date().toLocaleDateString('ja-JP').slice(0, 4)}
                placeHolder={'YYYY'}
                readonly={tournStartYearActivFlag}
                selectedDate={formData?.eventYear}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  console.log(e);
                  var eventYearVal = e as any as Date;
                  if (eventYearVal != null) {
                    if (eventYearVal.getFullYear().toString().length <= 4) {
                      handleInputChange('eventYear', eventYearVal.getFullYear().toString());
                    }
                  } else {
                    // eventYearVal = '';
                  }
                }}
                onBlur={(e: FocusEvent<HTMLInputElement>) => {
                  if (
                    formData?.eventYear === '' ||
                    formData?.eventYear === null ||
                    formData?.eventYear === undefined
                  ) {
                    handleInputChange('tournName', '');
                  } else {
                    console.log('==== CustomYearPicker');
                    handleSearchTournament('eventYear', e);
                  }
                }}
                // readonly={displayFlg}
              />
              <Label label='年' />
            </div>
            <div
              className={
                prevScreen === 'tournamentRef' ||
                !(
                  formData?.eventYear === '' ||
                  formData?.eventYear === null ||
                  formData?.eventYear === undefined
                )
                  ? 'hidden'
                  : ''
              }
            >
              <Label
                label='※「大会開催年」を入力してください。'
                textColor='red'
                textSize='caption1'
              />
            </div>
          </div>
          {/* 大会名 */}
          <div className='flex flex-col justify-start'>
            <InputLabel label='大会名' required />
            <div>
              <Autocomplete
                options={tournamentList.map((item) => ({
                  id: item.id,
                  name: item.name,
                  year: item.year,
                }))}
                getOptionLabel={(option) => option.name}
                readOnly={tournNameActivFlag}
                value={
                  { id: formData.tournId, name: formData.tournName, year: formData.eventYear } || ''
                }
                onChange={(e: ChangeEvent<{}>, newValue) => {
                  console.log(newValue);
                  handleInputChange('tournName', newValue ? (newValue as TournResponse).name : '');
                  handleInputChange(
                    'tournId',
                    newValue ? (newValue as TournResponse).id.toString() : '',
                  );
                  handleInputChange('eventYear', newValue ? (newValue as TournResponse).year : '');
                  setCsvDownloadProps((prevProps) => ({
                    ...prevProps,
                    filename: (newValue as TournResponse)?.name,
                    formData: {
                      tournId: newValue ? (newValue as TournResponse).id : formData.tournId,
                      eventYear: formData.eventYear,
                      tournName: (newValue as TournResponse)?.name,
                    },
                  }));
                  console.log(formData.tournName, formData.tournId);
                  if (newValue == null) {
                    setTournIdActivFlag(false); //大会名のリストが空の場合、大会IDの入力を可能にする
                    setTournStartYearActivFlag(false); //大会名のリストが空の場合、開催年の入力を可能にする
                    setReadButtonActivFlag(true); //大会名のリストが空の場合、読み込むボタンを押せないようにする
                  } else {
                    setTournIdActivFlag(true); //大会名のリストに値がある場合、大会IDの入力をできなようにする
                    setTournStartYearActivFlag(true); //大会名のリストに値がある場合、開催年の入力をできなようにする
                    setReadButtonActivFlag(false); //大会名のリストに値がある場合、読み込むボタンを押せるようにする
                  }
                  setTournIdErrorMessage([]); //大会IDにエラーメッセージが残っている場合、削除する
                }}
                renderOption={(props: any, option: TournResponse) => {
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
                    value={formData.tournName || ''}
                  />
                )}
                disabled={activationFlg}
              />
              {tournNameErrorMessage?.map((message: string) => (
                <p key={message} className='pt-1 text-caption1 text-systemErrorText'>
                  {message}
                </p>
              ))}
            </div>
          </div>
          {/* 読み込みCSVファイルの表示 */}
          <div className='flex flex-col gap-[20px]'>
            <div className='flex flex-row justify-start'>
              <CsvHandler
                csvUploadProps={csvUploadProps}
                csvDownloadProps={csvDownloadProps}
                ref={fileUploaderRef}
              ></CsvHandler>
            </div>
            {/* CSVフォーマット出力の表示 */}
            {!activationFlg && (
              <div className='flex flex-col gap-[20px]'>
                {/* 読み込みボタンの表示 */}
                <div className='flex flex-col gap-[4px] items-center'>
                  <p className='mb-1 text-systemErrorText'>
                    【読み込み方法】
                    <br />
                    ［準備］
                    <br />
                    定型フォーマットに当該大会でのレース結果を選手単位で入力してください。
                    <br />
                    ※定型フォーマットが必要な場合は、「CSVフォーマット出力」をクリックしてください。
                    <br />
                    定型フォーマットがダウンロードされます。
                    <br />
                    ［読み込む］
                    <br />
                    ①　「大会名」をレース結果を登録する大会を選択してください。
                    <br />
                    ※大会の絞り込み方法
                    <br />
                    「大会ID」が分かる場合、「大会ID」を入力すると「大会開催年」「大会名」が自動で入力・選択されます。
                    <br />
                    「大会ID」が分からない場合、「大会開催年」を入力すると当該年に開催された大会から
                    <br />
                    ②　「読み込みCSVファイル」に、読み込ませるCSVファイルをドラッグ＆ドロップしてください。
                    <br />
                    ※「参照」からファイルを指定することもできます。
                    <br />
                    ③　「読み込み」をクリックすると、CSVフォーマットの内容を読み込み、内容を画面下部のレース結果一覧に表示します。
                    <br />
                    ※この状態では、まだシステムにレース結果は登録されません
                  </p>
                  <CustomButton
                    buttonType='primary'
                    disabled={readButtonActivFlag}
                    onClick={() => {
                      setActivationFlg(true);
                      const specifiedHeader =
                        '大会ID,エントリー大会ID,大会名,選手ID,JARA選手コード,選手名,レースID,エントリーレースID,レースNo,レース名,レース区分ID,レース区分名,団体ID,エントリー団体コード,団体名,クルー名,組別,種目ID,種目名,距離,順位,500mlapタイム,1000mlapタイム,1500mlapタイム,2000mlapタイム,最終タイム,ストロークレート（平均）,500mストロークレート,1000mストロークレート,1500mストロークレート,2000mストロークレート,心拍数（平均）,500m心拍数,1000m心拍数,1500m心拍数,2000m心拍数,公式／非公式,立ち合い有無,エルゴ体重,選手身長,選手体重,シート番号ID,シート番号,出漕結果記録名,発艇日時,天候,2000m地点風速,2000m地点風向,1000m地点風速,1000m地点風向,備考'; // 指定のヘッダー文字列
                      const header = csvFileData?.content?.[0]?.join(','); // 1行目を,で結合
                      const isHeaderMatch = header === specifiedHeader; // ヘッダーが指定の文字列と一致するか確認
                      if (dialogDisplayFlg) {
                        window.confirm(
                          '読み込み結果に表示されているデータはクリアされます。よろしいですか？',
                        )
                          ? (setCsvData([]),
                            Promise.all(
                              csvFileData.content
                                ?.filter(function (x) {
                                  // 1列以上のデータを抽出. 空行を除外するが、何らかの文字が入っている場合は抽出する
                                  return x.length > 0 && x.some((y) => y.length > 0);
                                })
                                .slice(isHeaderMatch ? 1 : 0)
                                .map((row, index) => getJsonRow(row, index)),
                            ).then((results) => {
                              sendCsvData(results); //バックエンド側のバリデーションチェックを行う為にデータを送信する 20240302
                              setDialogDisplayFlg(true);
                            }))
                          : setActivationFlg(false);
                      } else {
                        if (formData.tournName === '' || formData.tournName === undefined) {
                          checkTournName(true);
                        } else {
                          // setCsvData([]);
                          // csvFileData?.content?.slice(1).map((row, rowIndex) => {
                          //   handleCsvData(row, rowIndex);
                          //   setDialogDisplayFlg(true);
                          //   // 仮実装。チェック内容に応じて登録ボタンの表示を判定
                          //   if (row[0] !== '') {
                          //     displayRegisterButton(true);
                          //   }
                          // });
                          console.log('=====================');
                          setCsvData([]);
                          Promise.all(
                            csvFileData.content
                              ?.slice(1)
                              .map((row, index) => getJsonRow(row, index)),
                          ).then((results) => {
                            sendCsvData(results); //バックエンド側のバリデーションチェックを行う為にデータを送信する 20240302
                            setDialogDisplayFlg(true);
                            displayRegisterButton(true);
                          });
                        }
                      }
                      performValidation();
                    }}
                  >
                    読み込む
                  </CustomButton>
                </div>
              </div>
            )}
            {/* エラーメッセージの表示 */}
            <div className='flex flex-col items-center'>
              <p className='text-caption1 text-systemErrorText'>{csvFileErrorMessage}</p>
            </div>
            {/* 読み込み結果の表示 */}
            <div className='flex flex-col items-center'>
              <p className='mb-1 text-systemErrorText'>
                【登録方法】
                <br />
                ①　「レース結果一覧」にCSVフォーマットを読み込んだ結果が表示されます。
                <br />
                ②　読み込むデータの「選択」にチェックを入れてください。※「全選択」で、エラー以外の全てのデータを選択状態にできます。
                <br />
                ③　「登録」をクリックすると「レース結果一覧」にて「選択」にチェックが入っているデータを対象に、本システムに登録されます。
                <br />
                ※既に登録されているレース結果は上書きされます。
                <br />
                ※登録後、レース結果の更新・削除をする場合は「大会レース結果編集画面」から行ってください。
                <br />
              </p>
              <CsvTable
                content={csvData.sort((a, b) => a.id - b.id)}
                header={[
                  '読み込み結果',
                  '大会ID',
                  'エントリー大会ID',
                  '大会名',
                  '選手ID',
                  'JARA選手コード',
                  '選手名',
                  'レースID',
                  'エントリーレースID',
                  'レースNo',
                  'レース名',
                  'レース区分ID',
                  'レース区分名',
                  '団体ID',
                  'エントリー団体コード',
                  '団体名',
                  'クルー名',
                  '組別',
                  '種目ID',
                  '種目名',
                  '距離',
                  '順位',
                  '500mlapタイム',
                  '1000mlapタイム',
                  '1500mlapタイム',
                  '2000mlapタイム',
                  '最終タイム',
                  'ストロークレート（平均）',
                  '500mストロークレート',
                  '1000mストロークレート',
                  '1500mストロークレート',
                  '2000mストロークレート',
                  '心拍数（平均）',
                  '500m心拍数',
                  '1000m心拍数',
                  '1500m心拍数',
                  '2000m心拍数',
                  '公式／非公式',
                  '立ち合い有無',
                  'エルゴ体重',
                  '選手身長',
                  '選手体重',
                  'シート番号ID',
                  'シート番号',
                  '出漕結果記録名',
                  '発艇日時',
                  '天候',
                  '2000m地点風速',
                  '2000m地点風向',
                  '1000m地点風速',
                  '1000m地点風向',
                  '備考',
                ]}
                handleInputChange={handleTableInputChange}
                displayRegisterButton={displayRegisterButton}
                activationFlg={activationFlg}
              />
            </div>
          </div>
          {/* ボタンの表示 */}
          {!activationFlg && (
            <div className='flex flex-row gap-[4px] justify-center'>
              <CustomButton
                buttonType='secondary'
                onClick={() => {
                  router.back();
                }}
              >
                戻る
              </CustomButton>
              {displayRegisterButtonFlg && (
                <CustomButton
                  buttonType='primary'
                  onClick={() => {
                    setActivationFlg(true);
                    if (csvData.find((row) => row.checked)?.id === undefined) {
                      window.confirm('1件以上選択してください。');
                    } else {
                      registerCsvData(); //バックエンド側にデータを渡す 20240302
                      setCsvData([]);
                      setCsvFileData({ content: [], isSet: false });
                      fileUploaderRef?.current?.clearFile();
                      window.confirm('レース結果の登録が完了しました。')
                        ? (setActivationFlg(false),
                          setDialogDisplayFlg(false),
                          setDisplayRegisterButtonFlg(false))
                        : null;
                    }
                    setActivationFlg(false);
                  }}
                >
                  登録
                </CustomButton>
              )}
            </div>
          )}
        </main>
      </div>
    )
  );
}
