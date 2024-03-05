// 機能名: 大会エントリー一括登録
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
import { Tournament, TournamentResponse, CheckRace, CheckRaceResultRecord } from '@/app/types';
import axios from '@/app/lib/axios';
import { Autocomplete, TextField } from '@mui/material';
import { CsvData } from './CsvDataInterface';
import { FormData } from './FormDataInterface';

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
  formData: FormData;
  checkTournName: (flg: boolean) => void;
}

// ファイル関連のアクションを扱うためのインターフェース
interface FileHandler { }

// 選手情報連携のメインコンポーネント
export default function TournamentEntryBulkRegister() {
  // フック
  const router = useRouter();
  const fileUploaderRef = useRef<FileHandler>(null);
  const searchParams = useSearchParams();

  // URLパラメータの取得
  const prevScreen = searchParams.get('prevScreen');
  const eventYear = searchParams.get('eventYear');
  const tournName = searchParams.get('tournName');

  // ステート変数
  const [csvFileData, setCsvFileData] = useState<{
    content: Array<Array<string>>;
    isSet: boolean;
  }>({ content: [], isSet: false });
  const [activationFlg, setActivationFlg] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [eventYearErrorMessage, setEventYearErrorMessage] = useState([] as string[]);
  const [tournNameErrorMessage, setTournNameErrorMessage] = useState([] as string[]);
  const [csvFileErrorMessage, setCsvFileErrorMessage] = useState([] as string[]);
  const [csvData, setCsvData] = useState<CsvData[]>([]);
  const [dialogDisplayFlg, setDialogDisplayFlg] = useState<boolean>(false);
  const [displayRegisterButtonFlg, setDisplayRegisterButtonFlg] = useState<boolean>(false);
  const [tournamentNameIsEmpty, setTournamentNameIsEmpty] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    eventYear: new Date().toLocaleDateString('ja-JP').slice(0, 4),
    tournId: 0,
    tournName: '',
  });
  const [tournamentList, setTournamentList] = useState<TournamentResponse[]>([]);
  // 大会情報参照画面から遷移してきた場合は、falseを設定
  const [displayFlg, setDisplayFlg] = useState<boolean>(
    prevScreen === 'tournamentRef' ? true : false,
  );
  // TODO: ユーザーの権限を取得する処理をuseEffectに記述すること
  const [userType, setUserType] = useState('');

  var [loadingResultList, setloadingResultList] = useState<string[]>([]); //バックエンド側の読み込み結果を受け取る 20230304

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
    console.log(value);
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
      { label: '大会名', key: 'tournName' },
      { label: '種目ID', key: 'eventId' },
      { label: '種目名', key: 'eventName' },
      { label: 'レース区分ID', key: 'raceTypeId' },
      { label: 'レース区分名', key: 'raceTypeName' },
      { label: 'レースID', key: 'raceId' },
      { label: 'レース名', key: 'raceName' },
      { label: '組別', key: 'byGroup' },
      { label: 'レースNo', key: 'raceNumber' },
      { label: '発艇日時', key: 'startDatetime' },
      { label: '団体ID', key: 'orgId' },
      { label: '団体名', key: 'orgName' },
      { label: 'クルー名', key: 'crewName' },
      { label: 'シート番号ID', key: 'mSheetNumber' },
      { label: 'シート番号', key: 'sheetName' },
      { label: '選手ID', key: 'userId' },
      { label: '選手名', key: 'playerName' },
    ],
    data: [],
    filename: '',
    label: 'CSVフォーマット出力',
    formData: {
      eventYear: '',
      tournId: 0,
      tournName: '',
    },
    checkTournName: checkTournName,
  });

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        // 仮のURL（繋ぎ込み時に変更すること）
        // TODO: ログインユーザーの権限によって取得する大会情報を変更すること
        // 大会名
        // const tournamentResponse = await axios.get<TournamentResponse[]>('http://localhost:3100/tournaments',);
        const TournamentsResponse = await axios.get('/getTournamentInfoData_allData'); //残件対象項目
        const TournamentsResponseList = TournamentsResponse.data.result.map(({ tourn_id, tourn_name }: { tourn_id: number; tourn_name: string }) => ({ id: tourn_id, name: tourn_name }));
        console.log(TournamentsResponseList);
        setTournamentList(TournamentsResponseList);
      } catch (error) {
        setErrorMessage(['API取得エラー:' + (error as Error).message]);
      }
    };
    fetchData();
  }, []);

  const handleSearchTournament = async (name: string, e: FocusEvent<HTMLInputElement>) => {
    try {
      console.log(e);
      var eventYearVal = { event_start_year: e.target.value };
      // 仮のURL（繋ぎ込み時に変更すること）
      const apiURL = `http://localhost:3100/tournament?${name}=${e.target.value}`;
      // 大会情報を取得
      // const tournamentResponse = await axios.get<Tournament>('http://localhost:3100/tournament');
      const csrf = () => axios.get('/sanctum/csrf-cookie');
      await csrf();
      const tournamentResponse = await axios.post('/tournamentEntryYearSearch', eventYearVal);
      const TournamentsResponseList = tournamentResponse.data.result.map(({ tourn_id, tourn_name }: { tourn_id: number; tourn_name: string }) => ({ id: tourn_id, name: tourn_name }));
      setTournamentList(TournamentsResponseList);
      setFormData((prevFormData) => ({
        ...prevFormData,
        eventYear: tournamentResponse.data.result.event_start_date.slice(0, 4),
        tournName: tournamentResponse.data.result.tourn_name,
      }));
      setDisplayFlg(false);
    } catch (error) {
      setErrorMessage(['API取得エラー:' + (error as Error).message]);
    }
  };

  // CSVファイルの項目数
  const csvElementNum = 18;

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

  const checkRequired = (element: string) => {
    return element === '' || element === undefined;
  };

  // CSVデータの処理
  const handleCsvData = async (row: string[], rowIndex: number) => {
    if (row.length !== csvElementNum) {
      console.log('row.length:', row.length);
      setCsvData((prevData) => [
        ...(prevData as CsvData[]),
        {
          id: rowIndex,
          checked: false,
          loadingResult: '無効データ',
          tournId: '-',
          tournIdError: false,
          tournName: '-',
          tournNameError: false,
          eventId: '-',
          eventIdError: false,
          eventName: '-',
          eventNameError: false,
          raceTypeId: '-',
          raceTypeIdError: false,
          raceTypeName: '-',
          raceTypeNameError: false,
          raceId: '-',
          raceIdError: false,
          raceName: '-',
          raceNameError: false,
          byGroup: '-',
          byGroupError: false,
          raceNumber: '-',
          raceNumberError: false,
          startDatetime: '-',
          startDatetimeError: false,
          orgId: '-',
          orgIdError: false,
          orgName: '-',
          orgNameError: false,
          crewName: '-',
          crewNameError: false,
          mSheetNumber: '-',
          mSheetNumberError: false,
          sheetName: '-',
          sheetNameError: false,
          userId: '-',
          userIdError: false,
          playerName: '-',
          playerNameError: false,
        },
      ]);
    } else {

      const tournIdError = checkMaxInt(row[0], 100000) || checkRequired(row[0]);
      const eventIdError = checkMaxInt(row[2], 1000) || checkRequired(row[2]);
      const raceTypeIdError = checkMaxInt(row[4], 1000) || checkRequired(row[4]);
      const raceIdError = checkMaxInt(row[6], 100000000) || checkRequired(row[6]);
      const byGroupError = checkStringLegnth(row[8], 255) || checkRequired(row[8]);
      const raceNumberError = checkMaxInt(row[9], 1000) || checkRequired(row[9]);
      const orgIdError = checkMaxInt(row[11], 10000) || checkRequired(row[11]);
      const orgNameError = checkStringLegnth(row[12], 255) || checkRequired(row[12]);
      const crewNameError = checkStringLegnth(row[13], 255) || checkRequired(row[13]);
      const mSheetNumberError = checkMaxInt(row[14], 100) || checkRequired(row[14]);
      const sheetNameError = checkStringLegnth(row[15], 255) || checkRequired(row[15]);
      const userIdError = checkMaxInt(row[16], 10000000) || checkRequired(row[16]);
      const playerNameError = checkStringLegnth(row[17], 100) || checkRequired(row[17]);

      // const error =
      //   tournIdError ||
      //   userIdError ||
      //   playerNameError ||
      //   raceIdError ||
      //   raceNumberError ||
      //   raceTypeIdError ||
      //   orgIdError ||
      //   orgNameError ||
      //   crewNameError ||
      //   byGroupError ||
      //   eventIdError ||
      //   mSheetNumberError ||
      //   sheetNameError;

      setCsvData((prevData) => [
        ...(prevData as CsvData[]),
        {
          id: rowIndex,
          checked: (loadingResultList[rowIndex] != null) ? false : true,
          loadingResult: loadingResultList[rowIndex],
          tournId: row[0],
          tournIdError: tournIdError,
          tournName: row[1],
          eventId: row[2],
          eventIdError: eventIdError,
          eventName: row[3],
          raceTypeId: row[4],
          raceTypeIdError: raceTypeIdError,
          raceTypeName: row[5],
          raceId: row[6],
          raceIdError: raceIdError,
          raceName: row[7],
          byGroup: row[8],
          byGroupError: byGroupError,
          raceNumber: row[9],
          raceNumberError: raceNumberError,
          startDatetime: row[10],
          orgId: row[11],
          orgIdError: orgIdError,
          orgName: row[12],
          orgNameError: orgNameError,
          crewName: row[13],
          crewNameError: crewNameError,
          mSheetNumber: row[14],
          mSheetNumberError: mSheetNumberError,
          sheetName: row[15],
          sheetNameError: sheetNameError,
          userId: row[16],
          userIdError: userIdError,
          playerName: row[17],
          playerNameError: playerNameError,
        },
      ]);
      setDisplayRegisterButtonFlg(true);
    }
  };

  //読み込むボタン押下時 20240302
  const sendCsvData = async () => {
    try {
      var array = csvFileData?.content.map((row, rowIndex) => {
        return {
          id: rowIndex,
          checked: false,
          loadingResult: '',
          tournId: row[0],
          tournIdError: false,
          tournName: row[1],
          eventId: row[2],
          eventIdError: false,
          eventName: row[3],
          raceTypeId: row[4],
          raceTypeIdError: false,
          raceTypeName: row[5],
          raceId: row[6],
          raceIdError: false,
          raceName: row[7],
          byGroup: row[8],
          byGroupError: false,
          raceNumber: row[9],
          raceNumberError: false,
          startDatetime: row[10],
          orgId: row[11],
          orgIdError: false,
          orgName: row[12],
          orgNameError: false,
          crewName: row[13],
          crewNameError: false,
          mSheetNumber: row[14],
          mSheetNumberError: false,
          sheetName: row[15],
          sheetNameError: false,
          userId: row[16],
          userIdError: false,
          playerName: row[17],
          playerNameError: false,
        }
      });
      var element = array as CsvData[];
      console.log(element);
      const csrf = () => axios.get('/sanctum/csrf-cookie');
      await csrf();
      const response = await axios.post('/sendTournamentEntryCsvData', element);
      const data = response.data.result as CsvData[];
      var resList = Array();
      for (let index = 0; index < response.data.result.length; index++) {
        const element = array[index];
        resList.push(response.data.result[index].loadingResult);
      }
      console.log(resList);
      setloadingResultList(resList);
    } catch (error) {
      setErrorMessage(['API取得エラー:' + (error as Error).message]);
    }
  }

  const checkRaceResultRecords = async () => {
    let apiUri = 'http://localhost:3100/checkRaceResultRecord';
    try {
      // ToDo バックエンドの例外処理に関する仕様が決まり次第、エラーメッセージを修正すること
      // const response = await axios.get<CheckRaceResultRecord>('http://localhost:3100/checkRaceResultRecord/',);
      const response = await axios.post('/registerTournamentEntryCsvData', csvData);
      const data = response.data;

      if (data.hasError) {
        csvData
          .filter((row) => row.id === data.id)
          .map((row) => {
            row.loadingResult = '登録エラー（記録情報あり）';
            row.checked = false;
          });
        setErrorMessage([
          '他のユーザーによりレース結果が登録されたレースが有ります。当該レースのエントリー情報は更新することは出来ません。',
        ]);
        return true;
      }
      return false;
    } catch (error) {
      setErrorMessage(['API取得エラー:' + (error as Error).message]);
    }
  };

  // レンダリング
  return (
    <div>
      <main className='flex min-h-screen flex-col justify-start p-[10px] m-auto gap-[20px] my-[80px]'>
        {/* 画面名*/}
        <CustomTitle isCenter displayBack>
          大会エントリー一括登録
        </CustomTitle>
        {/* エラーメッセージの表示 */}
        <ErrorBox errorText={errorMessage} />
        {/* 大会開催年 */}
        <div className='flex flex-col justify-start gap-[8px]'>
          <InputLabel label='大会開催年（西暦）' required />
          <div className='flex flex-row justify-start'>
            <CustomYearPicker
              placeHolder={new Date().toLocaleDateString('ja-JP').slice(0, 4)}
              selectedDate={formData?.eventYear}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                var eventYearVal = e as any as Date;
                if (eventYearVal.getFullYear().toString().length === 4) {
                  // handleInputChange('eventYear', e as unknown as string);//eventYearVal.getFullYear().toString()
                  handleInputChange('eventYear', eventYearVal.getFullYear().toString());
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
              readonly={displayFlg}
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
              options={tournamentList.map((item) => ({ id: item.id, name: item.name }))}
              getOptionLabel={(option) => option.name}
              value={{ id: 0, name: formData.tournName } || ''}
              onChange={(e: ChangeEvent<{}>, newValue) => {
                handleInputChange(
                  'tournName',
                  newValue ? (newValue as TournamentResponse).name : '',
                );
                setCsvDownloadProps((prevProps) => ({
                  ...prevProps,
                  filename: (newValue as TournamentResponse)?.name,
                  formData: {
                    eventYear: formData.eventYear,
                    tournId: (newValue as TournamentResponse)?.id,
                    tournName: (newValue as TournamentResponse)?.name,
                  },
                }));
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
                <p className='mb-1 text-red'>
                  【読み込み方法】
                  <br />
                  ［準備］
                  <br />
                  定型フォーマットにエントリー情報を入力してください。
                  <br />
                  ※定型フォーマットが必要な場合は、「CSVフォーマット出力」をクリックしてください。
                  <br />
                  ※定型フォーマットがダウンロードされます。
                  <br />
                  ［読み込む］
                  <br />
                  ①　「大会名」からエントリー情報を登録する大会を選択してください。
                  <br />
                  ②　「読み込みCSVファイル」に、読み込ませるCSVファイルをドラッグ＆ドロップしてください。
                  <br />
                  ※「参照」からファイルを指定することもできます。
                  <br />
                  ③　「読み込み」をクリックすると、CSVフォーマットの内容を読み込み、内容を画面下部のエントリー一覧に表示します。
                </p>
                <CustomButton
                  buttonType='primary'
                  onClick={async () => {
                    setActivationFlg(true);
                    if (dialogDisplayFlg) {
                      window.confirm(
                        '読み込み結果に表示されているデータはクリアされます。よろしいですか？',
                      )
                        ? (setCsvData([]),
                          csvFileData?.content?.slice(1).map((row, rowIndex) => {
                            handleCsvData(row, rowIndex);
                            setDialogDisplayFlg(true);
                          }))
                        : null;
                    } else {
                      if (formData.tournName === '' || formData.tournName === undefined) {
                        checkTournName(true);
                      } else {
                        await sendCsvData(); //バックエンド側にCSVデータを送信 データ判定用
                        setCsvData([]);
                        csvFileData?.content?.slice(1).map((row, rowIndex) => {
                          handleCsvData(row, rowIndex);
                          setDialogDisplayFlg(true);
                          // 仮実装。チェック内容に応じて登録ボタンの表示を判定
                          if (row[0] !== '') {
                            displayRegisterButton(true);
                          }
                        });
                      }
                    }
                    performValidation();
                    setActivationFlg(false);
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
            <p className='mb-1 text-red'>
              【登録方法】
              <br />
              ①　「エントリー一覧」にCSVフォーマットを読み込んだ結果が表示されます。
              <br />
              ②　読み込むデータの「選択」にチェックを入れてください。※「全選択」で、全てのデータを選択状態にできます。
              <br />
              ③　「登録」をクリックすると「エントリー一覧」にて「選択」にチェックが入っているデータを対象に、本システムに登録されます。
              <br />
              ※それまでに登録されていたデータは全て削除され、読み込んだデータに置き換わります。
              <br />
            </p>
            <CsvTable
              content={csvData.sort((a, b) => a.id - b.id)}
              header={[
                '読み込み結果',
                '大会ID',
                '大会名',
                '種目ID',
                '種目名',
                'レース区分ID',
                'レース区分名',
                'レースID',
                'レース名',
                '組別',
                'レースNo',
                '発艇日時',
                '団体ID',
                '団体名',
                'クルー名',
                'シート番号ID',
                'シート番号',
                '選手ID',
                '選手名',
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
            {csvData.some(
              (row) => !(row.loadingResult === '未入力項目あり' || row.loadingResult === '-'),
            ) &&
              displayRegisterButtonFlg && (
                <CustomButton
                  buttonType='primary'
                  onClick={async () => {
                    setActivationFlg(true);
                    if (csvData.find((row) => row.checked)?.id === undefined) {
                      window.confirm('1件以上選択してください。');
                    } else {
                      const errorFlg = await checkRaceResultRecords(); //バックエンド側にCSVデータを送信 データ登録用
                      if (!errorFlg) {
                        window.confirm('レース結果の登録が完了しました。')
                          ? (setActivationFlg(false),
                            setDialogDisplayFlg(false),
                            setDisplayRegisterButtonFlg(false))
                          : null;
                      }
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
  );
}
