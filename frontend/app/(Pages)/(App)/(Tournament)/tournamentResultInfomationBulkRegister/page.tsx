// 機能名: レース結果情報一括登録
'use client';
// ライブラリのインポート
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, FocusEvent, useEffect, useRef, useState } from 'react';
// 共通コンポーネントのインポート
import {
  CustomButton,
  CustomTextField,
  CustomTitle,
  CustomYearPicker,
  ErrorBox,
  InputLabel,
  Label,
} from '@/app/components';
import Validator from '@/app/utils/validator';
// ローカルコンポーネントのインポート
import axios from '@/app/lib/axios';
import { UserResponse } from '@/app/types';
import { Autocomplete, TextField } from '@mui/material';
import { CsvData } from './CsvDataInterface';
import CsvHandler, { FileHandler } from './CsvHandler';
import CsvTable from './CsvTable';

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

const CSV_HEADER = [
  { label: '大会ID', key: 'tournId' },
  { label: 'エントリー大会ID', key: 'entrysystemTournId' },
  { label: '大会名', key: 'tournName' },
  { label: '選手ID', key: 'playerId' },
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
  { label: '選手身長', key: 'playerHeight' },
  { label: '選手体重', key: 'playerWeight' },
  { label: 'シート番号ID', key: 'mSeatNumber' },
  { label: 'シート番号', key: 'seatName' },
  { label: '出漕結果記録名', key: 'raceResultRecordName' },
  { label: '発艇日時', key: 'startDatetime' },
  { label: '天候', key: 'weather' },
  { label: '2000m地点風速', key: 'windSpeedTwentyHundredmPoint' },
  { label: '2000m地点風向', key: 'windDirectionTwentyHundredmPoint' },
  { label: '1000m地点風速', key: 'windSpeedTenHundredmPoint' },
  { label: '1000m地点風向', key: 'windDirectionTenHundredmPoint' },
  { label: '備考', key: 'remark' },
];

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
  const [visibilityFlg, setVisibilityFlg] = useState<boolean>(false); //CSVテーブルの表示切替フラグ 20240508
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

  const [tournIdActivFlag, setTournIdActivFlag] = useState<boolean>(false); //true:変更できない false:変更できる
  const [tournStartYearActivFlag, setTournStartYearActivFlag] = useState<boolean>(false); //true:変更できない false:変更できる
  const [tournNameActivFlag, setTournNameActivFlag] = useState<boolean>(false); //true:変更できない false:変更できる
  const [readButtonActivFlag, setReadButtonActivFlag] = useState<boolean>(true); //true:変更できない false:変更できる

  const [validFlag, setValidFlag] = useState(false); //URL直打ち対策（ユーザ種別が不正なユーザが遷移できないようにする） 20240418
  //ユーザIDに紐づいた情報の取得 20240418
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<{ result: UserResponse }>('api/user');
        if (Object.keys(response.data.result).length > 0) {
          const playerInf = await axios.get('api/getIDsAssociatedWithUser');
          if (
            playerInf.data.result[0].is_administrator == 1 ||
            playerInf.data.result[0].is_jara == 1 ||
            playerInf.data.result[0].is_pref_boat_officer == 1 ||
            playerInf.data.result[0].is_organization_manager == 1
          ) {
            setValidFlag(true); //URL直打ち対策（ユーザ種別が不正なユーザが遷移できないようにする） 20240418
          } else {
            //console.log('ユーザ種別不正');
            router.push('/tournamentSearch');
          }
        } else {
          //console.log('ユーザ情報なし');
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
    header: CSV_HEADER,
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
        const sendVal = { event_start_year: formData?.eventYear };
        const TournamentsResponse = await axios.post('api/tournamentEntryYearSearch', sendVal);
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
        setTournamentList(TournamentsResponseList);
      } catch (error) {
        setErrorMessage(['API取得エラー:' + (error as Error).message]);
      }
    };
    fetchData();
  }, []);

  const handleSearchTournament = async (name: string, e: FocusEvent<HTMLInputElement>) => {
    // 大会IDが入力されている場合
    if (formData.tournId != 0 && formData.tournId != null && formData.tournId != undefined) {
      try {
        const tornSearchVal = { tourn_id: formData.tournId };
        const tournamentResponse = await axios.post('api/getTournamentInfoData', tornSearchVal);

        setFormData((prevFormData) => ({
          ...prevFormData,
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
        setTournIdActivFlag(true); //true:変更できない false:変更できる
        setTournStartYearActivFlag(true); //true:変更できない false:変更できる
        setTournNameActivFlag(false); //true:変更できない false:変更できる
        setReadButtonActivFlag(false); //true:変更できない false:変更できる
      } catch (error: any) {
        setTournIdErrorMessage([error?.response?.data.message]);
      }
    } else {
      try {
        var eventYearVal = { event_start_year: formData.eventYear };
        const tournamentResponse = await axios.post('api/tournamentEntryYearSearch', eventYearVal);
        // 大会情報が取得できなかった場合
        if (tournamentResponse.data === undefined || tournamentResponse.data === null) {
          setTournIdErrorMessage(['大会IDを入力してください。']);
          return;
        } else {
          // 大会情報が取得できた場合
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

  const getJsonRow = async (row: string[], index: number) => {
    const expectedColumnCount = CSV_HEADER.length; // 期待する列数

    if (row.length !== expectedColumnCount) {
      // 列数が期待する列数と異なる場合
      // loadingResultは無効データとし、各項目は-とする
      return {
        id: index,
        checked: false,
        loadingResult: '無効データ',
        tournId: '-',
        tournIdError: false,
        entrysystemTournId: '-',
        entrysystemTournIdError: false,
        tournName: '-',
        tournNameError: false,
        playerId: '-',
        playerIdError: false,
        jaraPlayerId: '-',
        jaraPlayerIdError: false,
        playerName: '-',
        playerNameError: false,
        raceId: '-',
        raceIdError: false,
        entrysystemRaceId: '-',
        entrysystemRaceIdError: false,
        raceNumber: '-',
        raceNumberError: false,
        raceName: '-',
        raceNameError: false,
        raceTypeId: '-',
        raceTypeIdError: false,
        raceTypeName: '-',
        raceTypeNameError: false,
        orgId: '-',
        orgIdError: false,
        entrysystemOrgId: '-',
        entrysystemOrgIdError: false,
        orgName: '-',
        orgNameError: false,
        crewName: '-',
        crewNameError: false,
        byGroup: '-',
        byGroupError: false,
        eventId: '-',
        eventIdError: false,
        eventName: '-',
        eventNameError: false,
        range: '-',
        rangeError: false,
        rank: '-',
        rankError: false,
        fiveHundredmLaptime: '-',
        fiveHundredmLaptimeError: false,
        tenHundredmLaptime: '-',
        tenHundredmLaptimeError: false,
        fifteenHundredmLaptime: '-',
        fifteenHundredmLaptimeError: false,
        twentyHundredmLaptime: '-',
        twentyHundredmLaptimeError: false,
        finalTime: '-',
        finalTimeError: false,
        strokeRateAvg: '-',
        strokeRateAvgError: false,
        fiveHundredmStrokeRat: '-',
        fiveHundredmStrokeRatError: false,
        tenHundredmStrokeRat: '-',
        tenHundredmStrokeRatError: false,
        fifteenHundredmStrokeRat: '-',
        fifteenHundredmStrokeRatError: false,
        twentyHundredmStrokeRat: '-',
        twentyHundredmStrokeRatError: false,
        heartRateAvg: '-',
        heartRateAvgError: false,
        fiveHundredmHeartRate: '-',
        fiveHundredmHeartRateError: false,
        tenHundredmHeartRate: '-',
        tenHundredmHeartRateError: false,
        fifteenHundredmHeartRate: '-',
        fifteenHundredmHeartRateError: false,
        twentyHundredmHeartRate: '-',
        twentyHundredmHeartRateError: false,
        official: '-',
        officialError: false,
        attendance: '-',
        attendanceError: false,
        playerHeight: '-',
        playerHeightError: false,
        playerWeight: '-',
        playerWeightError: false,
        mSeatNumber: '-',
        mSeatNumberError: false,
        seatName: '-',
        seatNameError: false,
        raceResultRecordName: '-',
        raceResultRecordNameError: false,
        startDatetime: '-',
        startDatetimeError: false,
        weather: '-',
        weatherError: false,
        windSpeedTwentyHundredmPoint: '-',
        windSpeedTwentyHundredmPointError: false,
        windDirectionTwentyHundredmPoint: '-',
        windDirectionTwentyHundredmPointError: false,
        windSpeedTenHundredmPoint: '-',
        windSpeedTenHundredmPointError: false,
        windDirectionTenHundredmPoint: '-',
        windDirectionTenHundredmPointError: false,
        remark: '-',
        remarkError: false,
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
        playerId: row[3],
        playerIdError: false,
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
        playerHeight: row[38],
        playerHeightError: false,
        playerWeight: row[39],
        playerWeightError: false,
        mSeatNumber: row[40],
        mSeatNumberError: false,
        seatName: row[41],
        seatNameError: false,
        raceResultRecordName: row[42],
        raceResultRecordNameError: false,
        startDatetime: row[43],
        startDatetimeError: false,
        weather: row[44],
        weatherError: false,
        windSpeedTwentyHundredmPoint: row[45],
        windSpeedTwentyHundredmPointError: false,
        windDirectionTwentyHundredmPoint: row[46],
        windDirectionTwentyHundredmPointError: false,
        windSpeedTenHundredmPoint: row[47],
        windSpeedTenHundredmPointError: false,
        windDirectionTenHundredmPoint: row[48],
        windDirectionTenHundredmPointError: false,
        remark: row[49],
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
      const response = await axios.post('api/sendTournamentResultCsvData', sendTournData);
      setCsvData(response.data.result.csvDataList);
    } catch (error) {
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
    await axios
      .post('api/registerTournamentResultCsvData', sendTournData)
      .then((res) => {
        setCsvData([]);
        setCsvFileData({ content: [], isSet: false });
        fileUploaderRef?.current?.clearFile();
        window.alert('レース結果の登録が完了しました。');
        setActivationFlg(false);
        setDialogDisplayFlg(false);
        setDisplayRegisterButtonFlg(false);
      })
      .catch((error) => {
        setErrorMessage(['大会エントリー一括登録に失敗しました：' + (error as Error).message]);
      });
  };

  if (!validFlag) return null;

  // レンダリング
  return (
    <>
      {/* 画面名*/}
      <CustomTitle displayBack>レース結果情報一括登録</CustomTitle>
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
          }}
          onBlur={(e: FocusEvent<HTMLInputElement>) => {
            handleSearchTournament('tournId', e);
          }}
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
        <div className='flex flex-row justify-start items-center gap-3'>
          <CustomYearPicker
            placeHolder={'YYYY'}
            readonly={tournStartYearActivFlag}
            selectedDate={formData?.eventYear}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              var eventYearVal = e as any as Date;
              if (eventYearVal != null) {
                if (eventYearVal.getFullYear().toString().length <= 4) {
                  handleInputChange('eventYear', eventYearVal.getFullYear().toString());
                }
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
                handleSearchTournament('eventYear', e);
              }
            }}
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
          <Label label='※「大会開催年」を入力してください。' textColor='red' textSize='caption1' />
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
            value={{ id: formData.tournId, name: formData.tournName, year: formData.eventYear }}
            onChange={(e: ChangeEvent<{}>, newValue) => {
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
                ① レース結果情報を登録する大会の大会IDを入力
                <br />
                　※大会IDがわからない場合は大会開催年、大会名を入力
                <br />
                ② 「CSVフォーマット出力」ボタンをクリックしフォーマットをダウンロード
                <br />
                ③ CSVファイルを編集
                <br />
                ④
                「読み込みCSVファイル」の参照ボタンからCSVファイルを選択、もしくはCSVファイルを直接ドラッグ＆ドロップしてアップロード
                <br />
                ⑤ 「読み込む」ボタンをクリック
                <br />
                ⑥ CSVファイルの読み取り結果を画面下部で確認
                <br />
                ※この段階では、まだCSVファイルの内容はシステムに登録されません。
              </p>
              <CustomButton
                buttonType='primary'
                disabled={readButtonActivFlag}
                onClick={() => {
                  setActivationFlg(true);
                  const specifiedHeader =
                    '大会ID,エントリー大会ID,大会名,選手ID,JARA選手コード,選手名,レースID,エントリーレースID,レースNo,レース名,レース区分ID,レース区分名,団体ID,エントリー団体コード,団体名,クルー名,組別,種目ID,種目名,距離,順位,500mlapタイム,1000mlapタイム,1500mlapタイム,2000mlapタイム,最終タイム,ストロークレート（平均）,500mストロークレート,1000mストロークレート,1500mストロークレート,2000mストロークレート,心拍数（平均）,500m心拍数,1000m心拍数,1500m心拍数,2000m心拍数,公式／非公式,立ち合い有無,選手身長,選手体重,シート番号ID,シート番号,出漕結果記録名,発艇日時,天候,2000m地点風速,2000m地点風向,1000m地点風速,1000m地点風向,備考'; // 指定のヘッダー文字列
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
                      setCsvData([]);
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
                        displayRegisterButton(true);
                      });
                    }
                  }
                  setVisibilityFlg(true);
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
            ① 「読み込む」ボタンの下にCSVファイルを読み込んだ結果が表示されます。
            <br />
            ② 読み込むデータの「選択」にチェックを入れてください。
            <br />
            　※「全選択」で、エラー以外の全てのデータを選択状態にできます。
            <br />③ 「登録」をクリックすると「選択」にチェックが入っているデータが登録されます。
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
            visibilityFlg={visibilityFlg}
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
                  window.alert('1件以上選択してください。');
                } else {
                  const isSuccess = registerCsvData(); //バックエンド側にデータを渡す 20240302
                }
                setActivationFlg(false);
              }}
            >
              登録
            </CustomButton>
          )}
        </div>
      )}
    </>
  );
}
