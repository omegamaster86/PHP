// 機能名: 大会エントリー一括登録
'use client';
// ライブラリのインポート
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, FocusEvent, useEffect, useRef, useState } from 'react';
// 共通コンポーネントのインポート
import {
  CustomButton,
  CustomTitle,
  CustomYearPicker,
  ErrorBox,
  InputLabel,
  Label,
} from '@/app/components';
import Validator from '@/app/utils/validator';
// ローカルコンポーネントのインポート
import axios from '@/app/lib/axios';
import { TournamentResponse, UserResponse } from '@/app/types';
import { Autocomplete, TextField } from '@mui/material';
import { CsvData } from './CsvDataInterface';
import CsvHandler, { FileHandler } from './CsvHandler';
import CsvTable from './CsvTable';
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

// 選手情報連携のメインコンポーネント
export default function TournamentEntryBulkRegister() {
  // フック
  const router = useRouter();
  const fileUploaderRef = useRef<FileHandler>(null);
  const searchParams = useSearchParams();

  // URLパラメータの取得
  const prevScreen = searchParams.get('prevScreen');

  // ステート変数
  const [csvFileData, setCsvFileData] = useState<{
    content: Array<Array<string>>;
    isSet: boolean;
  }>({ content: [], isSet: false });
  const [activationFlg, setActivationFlg] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [tournNameErrorMessage, setTournNameErrorMessage] = useState([] as string[]);
  const [csvFileErrorMessage, setCsvFileErrorMessage] = useState([] as string[]);
  const [csvData, setCsvData] = useState<CsvData[]>([]);
  const [dialogDisplayFlg, setDialogDisplayFlg] = useState<boolean>(false);
  const [displayRegisterButtonFlg, setDisplayRegisterButtonFlg] = useState<boolean>(false);
  const [visibilityFlg, setVisibilityFlg] = useState<boolean>(false); //CSVテーブルの表示切替フラグ 20240508
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

  var loadingResultList = Array();

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
      { label: '大会名', key: 'tournName' },
      { label: '種目ID', key: 'eventId' },
      { label: '種目名', key: 'eventName' },
      { label: 'レース区分ID', key: 'raceTypeId' },
      { label: 'レース区分', key: 'raceTypeName' },
      { label: 'レースID', key: 'raceId' },
      { label: 'レース名', key: 'raceName' },
      { label: '組別', key: 'byGroup' },
      { label: 'レースNo', key: 'raceNumber' },
      { label: '発艇日時', key: 'startDatetime' },
      { label: '団体ID', key: 'orgId' },
      { label: '団体名', key: 'orgName' },
      { label: 'クルー名', key: 'crewName' },
      { label: 'シート番号ID', key: 'mSeatNumber' },
      { label: 'シート番号', key: 'seatName' },
      { label: '選手ID', key: 'playerId' },
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
        const sendVal = { event_start_year: formData?.eventYear };
        const TournamentsResponse = await axios.post('api/tournamentEntryYearSearch', sendVal);
        const TournamentsResponseList = TournamentsResponse.data.result.map(
          ({ tourn_id, tourn_name }: { tourn_id: number; tourn_name: string }) => ({
            id: tourn_id,
            name: tourn_name,
          }),
        );
        setTournamentList(TournamentsResponseList);
      } catch (error) {
        setErrorMessage(['API取得エラー:' + (error as Error).message]);
      }
    };
    fetchData();
  }, []);

  const handleSearchTournament = async (name: string, eventYearVal: string) => {
    try {
      const sendVal = { event_start_year: eventYearVal };
      const tournamentResponse = await axios.post('api/tournamentEntryYearSearch', sendVal);

      //該当の開催年に紐づく大会が存在する場合、リストの最初の大会を表示させる 20240514
      if (tournamentResponse.data.result.length > 0) {
        const TournamentsResponseList = tournamentResponse.data?.result?.map(
          ({ tourn_id, tourn_name }: { tourn_id: number; tourn_name: string }) => ({
            id: tourn_id,
            name: tourn_name,
          }),
        );
        setTournamentList(TournamentsResponseList);
        setFormData((prevFormData) => ({
          ...prevFormData,
          eventYear: tournamentResponse.data?.result[0]?.event_start_date.slice(0, 4),
          tournName: tournamentResponse.data?.result[0]?.tourn_name,
        }));

        //大会名のエラーメッセージが表示されていた場合、非表示にする 20240514
        if (
          tournamentResponse.data?.result[0]?.tourn_name != undefined &&
          tournamentResponse.data?.result[0]?.tourn_name != null
        ) {
          checkTournName(false);
        }
      } else {
        setTournamentList([]);
        setFormData((prevFormData) => ({
          ...prevFormData,
          eventYear: '',
          tournName: '',
        }));
      }
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
    return Number(element) >= maxNumber; //境界値を判定できるように修正 20240513
  };

  const checkRequired = (element: string) => {
    return element === '' || element === undefined;
  };

  //読み込むボタン押下時 20240302
  const sendCsvData = async () => {
    try {
      const specifiedHeader =
        '大会ID,大会名,種目ID,種目名,レース区分ID,レース区分,レースID,レース名,組別,レースNo,発艇日時,団体ID,団体名,クルー名,シート番号ID,シート番号,選手ID,選手名'; // 指定のヘッダー文字列
      const header = csvFileData?.content?.[0]?.join(','); // 1行目を,で結合
      const isHeaderMatch = header === specifiedHeader; // ヘッダーが指定の文字列と一致するか確認
      var array = csvFileData?.content
        ?.filter(function (x) {
          // 1列以上のデータを抽出. 空行を除外するが、何らかの文字が入っている場合は抽出する
          return x.length > 0 && x.some((y) => y.length > 0);
        })
        .slice(isHeaderMatch ? 1 : 0)
        .map((row, rowIndex) => {
          if (row.length !== csvElementNum) {
            return {
              id: rowIndex,
              checked: false,
              loadingResult: '無効データ',
              tournId: '-',
              tournIdError: false,
              tournName: '-',
              eventId: '-',
              eventIdError: false,
              eventName: '-',
              raceTypeId: '-',
              raceTypeIdError: false,
              raceTypeName: '-',
              raceId: '-',
              raceIdError: false,
              raceName: '-',
              byGroup: '-',
              byGroupError: false,
              raceNumber: '-',
              raceNumberError: false,
              orgId: '-',
              orgIdError: false,
              orgName: '-',
              orgNameError: false,
              crewName: '-',
              crewNameError: false,
              mSeatNumber: '-',
              mSeatNumberError: false,
              seatName: '-',
              seatNameError: false,
              playerId: '-',
              playerIdError: false,
              playerName: '-',
              playerNameError: false,
            };
          } else {
            //必須入力チェック 必須入力項目のいずれかがエラーの場合エラーとする
            const tournIdError = checkRequired(row[0]) ? '大会IDは必須入力です。' : false;
            const eventIdError = checkRequired(row[2]) ? '種目IDは必須入力です。' : false;
            const raceTypeIdError = checkRequired(row[4]) ? 'レース区分IDは必須入力です。' : false;
            const raceIdError = checkRequired(row[6]) ? 'レースIDは必須入力です。' : false;
            const byGroupError = checkRequired(row[8]) ? '組別は必須入力です。' : false;
            const raceNumberError = checkRequired(row[9]) ? 'レースNoは必須入力です。' : false;
            const orgIdError = checkRequired(row[11]) ? '団体IDは必須入力です。' : false;
            const orgNameError = checkRequired(row[12]) ? '団体名は必須入力です。' : false;
            const crewNameError = checkRequired(row[13]) ? 'クルー名は必須入力です。' : false;
            const mSeatNumberError = checkRequired(row[14])
              ? 'シート番号IDは必須入力です。'
              : false;
            const seatNameError = checkRequired(row[15]) ? 'シート番号は必須入力です。' : false;
            const playerIdError = checkRequired(row[16]) ? '選手IDは必須入力です。' : false;
            const playerNameError = checkRequired(row[17]) ? '選手名は必須入力です。' : false;

            const error =
              tournIdError ||
              playerIdError ||
              playerNameError ||
              raceIdError ||
              raceNumberError ||
              raceTypeIdError ||
              orgIdError ||
              orgNameError ||
              crewNameError ||
              byGroupError ||
              eventIdError ||
              mSeatNumberError ||
              seatNameError;

            //データ型チェック（入力値範囲チェック）入力項目のいずれかがエラーの場合エラーとする
            const byGroupRangeError = checkStringLegnth(row[8], 255)
              ? '組別は255文字以内で入力してください。'
              : false;
            const orgNameRangeError = checkStringLegnth(row[12], 255)
              ? '団体名は255文字以内で入力してください。'
              : false;
            const crewNameRangeError = checkStringLegnth(row[13], 255)
              ? 'クルー名は255文字以内で入力してください。'
              : false;
            const seatNameRangeError = checkStringLegnth(row[15], 255)
              ? 'シート番号は255文字以内で入力してください。'
              : false;
            const playerNameRangeError = checkStringLegnth(row[17], 100)
              ? '選手名は100文字以内で入力してください。'
              : false;

            const RangeError =
              playerNameRangeError ||
              orgNameRangeError ||
              crewNameRangeError ||
              byGroupRangeError ||
              seatNameRangeError;

            return {
              id: rowIndex,
              checked: false,
              loadingResult: error ? '未入力項目あり' : RangeError ? '入力値不正項目あり' : '',
              tournId: row[0],
              tournIdError,
              tournName: row[1],
              eventId: row[2],
              eventIdError,
              eventName: row[3],
              raceTypeId: row[4],
              raceTypeIdError,
              raceTypeName: row[5],
              raceId: row[6],
              raceIdError,
              raceName: row[7],
              byGroup: row[8],
              byGroupError: byGroupError || byGroupRangeError,
              raceNumber: row[9],
              raceNumberError,
              orgId: row[11],
              orgIdError,
              orgName: row[12],
              orgNameError: orgNameError || orgNameRangeError,
              crewName: row[13],
              crewNameError: crewNameError || crewNameRangeError,
              mSeatNumber: row[14],
              mSeatNumberError,
              seatName: row[15],
              seatNameError: seatNameError || seatNameRangeError,
              playerId: row[16],
              playerIdError,
              playerName: row[17],
              playerNameError: playerNameError || playerNameRangeError,
            };
          }
        });
      var element = array as CsvData[];
      const sendTournData = {
        tournData: formData,
        csvDataList: element,
      };
      const response = await axios.post('api/sendTournamentEntryCsvData', sendTournData);
      const data = response.data.result as CsvData[];
      setCsvData([]);
      var resList = Array();
      for (let index = 0; index < response.data.result.csvDataList.length; index++) {
        const element = array[index];
        resList.push(response.data.result.csvDataList[index].loadingResult);
      }
      loadingResultList = resList.filter(Boolean); //リスト内のnullを削除して渡す
      console.log(response.data.result.csvDataList);
      setCsvData(response.data.result.csvDataList);
      setDialogDisplayFlg(true);
      displayRegisterButton(true);
    } catch (error) {
      setErrorMessage(['API取得エラー:' + (error as Error).message]);
    }
  };

  const checkRaceResultRecords = async () => {
    try {
      const sendTournData = {
        tournData: formData,
        csvDataList: csvData,
      };
      // TODO: バックエンドの例外処理に関する仕様が決まり次第、エラーメッセージを修正すること
      const response = await axios.post('api/registerTournamentEntryCsvData', sendTournData);
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
      }

      window.alert('レース結果の登録が完了しました。');
      setCsvData([]);
      setCsvFileData({ content: [], isSet: false });
      fileUploaderRef?.current?.clearFile();
      setActivationFlg(false);
      setDialogDisplayFlg(false);
      setDisplayRegisterButtonFlg(false);
    } catch (error) {
      setErrorMessage(['大会エントリー一括登録に失敗しました：' + (error as Error).message]);
    }
  };

  if (!validFlag) return null;

  // レンダリング
  return (
    <>
      <CustomTitle displayBack>大会エントリー一括登録</CustomTitle>
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
                handleSearchTournament('eventYear', formData?.eventYear);
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
          <Label label='※「大会開催年」を入力してください。' textColor='red' textSize='caption1' />
        </div>
      </div>
      {/* 大会名 */}
      <div className='flex flex-col justify-start'>
        <InputLabel label='大会名' required />
        <div>
          <Autocomplete
            options={tournamentList.map((item) => ({ id: item.id, name: item.name }))}
            getOptionLabel={(option) => option.name}
            value={{ id: formData.tournId, name: formData.tournName }}
            onChange={(e: ChangeEvent<{}>, newValue) => {
              handleInputChange(
                'tournId',
                newValue ? (newValue as TournamentResponse).id.toString() : '',
              );
              handleInputChange('tournName', newValue ? (newValue as TournamentResponse).name : '');

              setCsvDownloadProps((prevProps) => ({
                ...prevProps,
                filename: (newValue as TournamentResponse)?.name,
                formData: {
                  eventYear: formData.eventYear,
                  tournId: (newValue as TournamentResponse)?.id,
                  tournName: (newValue as TournamentResponse)?.name,
                },
              }));
              if (newValue != undefined && newValue != null) {
                checkTournName(false);
              }
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
                ① 大会エントリー情報を登録する大会の大会IDを入力
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
                onClick={async () => {
                  setActivationFlg(true);
                  if (dialogDisplayFlg) {
                    if (
                      window.confirm(
                        '読み込み結果に表示されているデータはクリアされます。よろしいですか？',
                      )
                    ) {
                      if (
                        formData.tournName === '' ||
                        formData.tournName === undefined ||
                        formData.tournName === null
                      ) {
                        checkTournName(true);
                      } else {
                        await sendCsvData(); //バックエンド側にCSVデータを送信 データ判定用
                      }
                    }
                  } else {
                    if (
                      formData.tournName === '' ||
                      formData.tournName === undefined ||
                      formData.tournName === null
                    ) {
                      checkTournName(true);
                    } else {
                      await sendCsvData(); //バックエンド側にCSVデータを送信 データ判定用
                    }
                  }
                  setVisibilityFlg(true);
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
              '大会名',
              '種目ID',
              '種目名',
              'レース区分ID',
              'レース区分名',
              'レースID',
              'レース名',
              '組別',
              'レースNo',
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
          {csvData.some(
            (row) => !(row.loadingResult === '未入力項目あり' || row.loadingResult === '-'),
          ) &&
            displayRegisterButtonFlg && (
              <CustomButton
                buttonType='primary'
                onClick={async () => {
                  setActivationFlg(true);
                  if (csvData.find((row) => row.checked)?.id === undefined) {
                    window.alert('1件以上選択してください。');
                  } else {
                    checkRaceResultRecords(); //バックエンド側にCSVデータを送信 データ登録用
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
