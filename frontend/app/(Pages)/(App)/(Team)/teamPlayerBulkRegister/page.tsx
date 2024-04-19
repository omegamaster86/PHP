'use client';
// 機能名: 団体所属選手一括登録画面

import React, { useEffect, useState, useRef } from 'react';
import { CustomTitle, CustomButton, ErrorBox, InputLabel, CustomDropdown } from '@/app/components';
import CsvTable from './CsvTable';
import CsvHandler from './CsvHandler';
import Validator from '@/app/utils/validator';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/app/lib/axios';
import { TeamResponse, Org, UserIdType } from '@/app/types';

// CSVデータの型定義
interface CsvData {
  id: number; // ID
  checked: boolean; // 選択
  result: string; // 読み込み結果
  userId: string; // ユーザーID
  playerId: string; // 選手ID
  jaraPlayerId: string; // JARA選手コード
  playerName: string; // 選手名
  mailaddress: string; // メールアドレス
  teamId: string; // 所属団体ID
  teamName: string; // 所属団体名
  birthPlace: string; // 出身地
  residence: string; // 居住地
  birthCountryId: number; //出身地国ID
  birthPrefectureId: number; //出身地都道府県ID
  residenceCountryId: number; //居住地国ID
  residencePrefectureId: number; //居住地都道府県ID
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
  isOrgSelected: boolean;
  label: string;
}

// ファイル関連のアクションを扱うためのインターフェース
interface FileHandler {
  clearFile(): void;
}

export default function TeamPlayerBulkRegister() {
  const [errorMessage, setErrorMessage] = useState([] as string[]);

  // フック
  const router = useRouter();
  const fileUploaderRef = useRef<FileHandler>(null);

  const [orgs, setOrgs] = useState([] as Org[]);
  const [orgData, setOrg] = useState({} as Org);
  // ステート変数
  const [csvFileData, setCsvFileData] = useState<{
    content: Array<Array<string>>;
    isSet: boolean;
  }>({ content: [], isSet: false });
  const [activationFlg, setActivationFlg] = useState<boolean>(false);
  const [disableFlg, setDisableFlg] = useState<boolean>(false);
  const [orgSelected, setOrgSelected] = useState<string>('');
  const [errorText, setErrorText] = useState([] as string[]);
  const [csvFileErrorMessage, setCsvFileErrorMessage] = useState([] as string[]);
  const [csvData, setCsvData] = useState<CsvData[]>([]);
  const [dialogDisplayFlg, setDialogDisplayFlg] = useState<boolean>(false);
  const [displayLinkButtonFlg, setDisplayLinkButtonFlg] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const [userIdType, setUserIdType] = useState({} as UserIdType); //ユーザIDに紐づいた情報 20240222

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

  // 所属団体名の活性状態を制御
  let isOrgNameActive = false;
  const org_id =
    searchParams.get('orgId')?.toString() ||
    searchParams.get('org_id')?.toString() ||
    searchParams.get('sponsor_org_id')?.toString() ||
    '';
  // orgIdの値を取得
  switch (org_id) {
    case '':
      isOrgNameActive = true;
      break;
    default:
      isOrgNameActive = false;
      break;
  }

  // CSVファイルのアップロードを処理する関数
  const handleCsvUpload = (newCsvData: { content: Array<Array<string>>; isSet: boolean }) => {
    setCsvFileData(newCsvData);
  };

  // activationFlgをリセットする関数
  const resetActivationFlg = () => {
    setActivationFlg(false);
  };

  // 連携ボタンの表示を切り替える関数
  const displayLinkButton = (flg: boolean) => {
    setDisplayLinkButtonFlg(flg);
  };

  // CSVテーブル内の入力変更を処理する関数
  const handleInputChange = (rowId: number, name: string, value: string | boolean) => {
    setCsvData((prevRows) =>
      prevRows.map((row) => (row.id === rowId ? { ...row, [name]: value } : row)),
    );
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

  // CSVダウンロードのプロパティ
  const csvDownloadProps = {
    header: [
      { label: 'JARA選手コード', key: 'jaraPlayerId' },
      { label: '選手ID', key: 'playerId' },
      { label: 'ユーザーID', key: 'userId' },
      { label: 'メールアドレス', key: 'mailaddress' },
      { label: '選手名', key: 'playerName' },
    ],
    data: [{}],
    filename: '団体所属選手一括登録ファイル.csv',
    label: 'CSVフォーマット出力',
    isOrgSelected: orgSelected !== '',
  } as CsvDownloadProps;

  // 所属団体名の入力値を管理する関数 20240307
  const handleFormInputChange = (name: string, value: string) => {
    setTargetOrgData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  //所属団体名の情報を受け取るパラメータ 20240307
  const [targetOrgData, setTargetOrgData] = useState({
    targetOrgId: '',
    targetOrgName: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        if (isOrgNameActive == false) {
          // const org = await axios.get<Org[]>('http://localhost:3100/orgSearch');
          const orgSearchId = { org_id };
          const org = await axios.post('/getOrgData', orgSearchId);
          console.log(org.data.result);
          setOrg(org.data.result);
          setTargetOrgData({
            targetOrgId: org.data.result.org_id,
            targetOrgName: org.data.result.org_name,
          });
        } else {
          // const org = await axios.get<Org[]>('http://localhost:3100/orgSearch');
          const playerInf = await axios.get('/getIDsAssociatedWithUser');
          const userIdInfo = playerInf.data.result[0];
          if (
            userIdInfo.is_administrator == '0' &&
            userIdInfo.is_jara == '0' &&
            userIdInfo.is_pref_boat_officer == '0'
          ) {
            //団体管理者の権限だけが1の場合
            const responseData = await axios.get('/getOrganizationForOrgManagement'); //ログインユーザーが管理している団体データの取得 20240201
            console.log(responseData.data.result);
            setOrgs(responseData.data.result);
          } else {
            const responseData = await axios.get('/getOrganizationListData'); //すべての団体データの取得 20240410
            console.log(responseData.data.result);
            setOrgs(responseData.data.result);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  /**
   * CSV行に対しバリデーションを実行する関数
   * @param row
   * @returns
   */
  const handleResult = async (row: string[]) => {
    // 選手名の形式
    //　日本語：^[ぁ-んァ-ヶｱ-ﾝﾞﾟ一-龠]*$
    //　半角英数字：^[0-9a-zA-Z]*$
    //　記号：^[-,_]*$
    //　最大文字数：32文字（全半角区別なし）
    const plaerNameRegex = /^[ぁ-んァ-ヶｱ-ﾝﾞﾟ一-龠0-9a-zA-Z-,_]{1,32}$/;
    // メールアドレスの形式
    const maidAddressRegex =
      /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/;

    if (row[4] === '' || row[4] === undefined) {
      return '無効データ（メールアドレス未設定）';
    } else if (row[4].match(maidAddressRegex) === null) {
      return '無効データ（メールアドレス不正）';
    } else if (row[3] === '' || row[3] === undefined) {
      return '無効データ（選手名未設定）';
    } else if (row[3].match(plaerNameRegex) === null) {
      return '無効データ（選手名不正）';
    } else if (row.length !== 5) return '無効データ';

    setDisplayLinkButtonFlg(true);
    return '連携';
  };

  const getJsonRow = async (row: string[], index: number) => {
    const expectedColumnCount = 5; // 期待する列数
    console.log(row.length);
    if (row.length !== expectedColumnCount) {
      return {
        id: index,
        checked: false,
        result: '無効データ',
        userId: '-',
        playerId: '-',
        jaraPlayerId: '-',
        playerName: '-',
        mailaddress: '-',
        teamId: '',
        teamName: '',
        birthPlace: '',
        residence: '',
      };
    } else {
      return {
        id: index,
        // checked: handleCheckboxValue(await handleResult(row)),
        checked: true,
        result: await handleResult(row),
        // userId: row[0],
        // playerId: row[1],
        // jaraPlayerId: row[2],
        // playerName: row[3],
        // mailaddress: row[4],
        // teamId: row[5],
        // teamName: row[6],
        // birthPlace: row[7],
        // residence: row[8],
        userId: row[2],
        playerId: row[1],
        jaraPlayerId: row[0],
        playerName: row[4],
        mailaddress: row[3],
        teamId: row[5],
        teamName: row[6],
        birthPlace: row[7],
        residence: row[8],
      };
    }
  };

  //読み込むボタン押下時 20240302
  const sendCsvData = async (row: any[]) => {
    const sendData = {
      targetOrgData,
      csvDataList: row,
    };
    console.log(sendData.csvDataList);
    try {
      const csrf = () => axios.get('/sanctum/csrf-cookie');
      await csrf();
      const response = await axios.post('/sendOrgCsvData', sendData);
      console.log(response.data.result);
      setCsvData(response.data.result);
      setActivationFlg(false);
    } catch (error) {
      setErrorMessage(['API取得エラー:' + (error as Error).message]);
      setActivationFlg(false);
    }
  };

  //連携ボタン押下時 20240302
  const registerCsvData = async () => {
    const sendData = {
      targetOrgData,
      csvDataList: csvData,
    };
    console.log(sendData.csvDataList);
    const csrf = () => axios.get('/sanctum/csrf-cookie');
    await csrf();
    await axios
      .post('/registerOrgCsvData', sendData)
      .then((res) => {
        console.log(res.data.result);
        // router.push('/tournamentSearch'); // 20240222
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleCheckboxValue = (result: string) => {
    return result.startsWith('無効データ')
      ? false
      : result === 'ユーザー未登録' || result === '選手未登録のため選手登録後、所属選手登録を実施'
        ? false
        : true;
  };
  return (
    validFlag && (
      <main className='flex min-h-screen flex-col justify-start p-[10px] m-auto gap-[20px] my-[80px] min-w-[900px]'>
        <div className='relative flex flex-col justify-between w-full h-screen flex-wrap gap-[20px]'>
          <CustomTitle displayBack>団体所属選手一括登録</CustomTitle>
          <ErrorBox errorText={errorMessage} />
          <div className='flex flex-col gap-[10px] w-[300px]'>
            <CustomDropdown
              id='org'
              label='所属団体名'
              displayHelp
              toolTipText='選手を登録したい団体を選択してください。'
              value={isOrgNameActive ? orgSelected : orgData.org_name} //団体参照画面から遷移した場合は、該当の団体名を表示する
              options={orgs.map((org) => ({ value: org.org_name, key: org.org_id }))}
              onChange={(e) => {
                setOrgSelected(e);
                console.log(e);
                handleFormInputChange('targetOrgId', e);
                handleFormInputChange(
                  'targetOrgName',
                  orgs.find((item) => item.org_id === Number(e))?.org_name || '',
                );
              }}
              className='w-[300px]'
              readonly={isOrgNameActive == false} //団体参照画面から遷移した場合は、読み取り専用とする
            />
          </div>
          <div className='flex flex-row justify-start'>
            <CsvHandler
              csvUploadProps={csvUploadProps}
              csvDownloadProps={csvDownloadProps}
              ref={fileUploaderRef}
            ></CsvHandler>
          </div>
          {!activationFlg && (
            <div className='flex flex-col gap-[20px]'>
              {/* 読み込みボタンの表示 */}
              <div className='flex flex-col gap-[4px] items-center'>
                {/* 表示する文言はDPT様にて実装予定 */}
                <p className='mb-1 text-systemErrorText'>
                  【読み込み方法】
                  <br />
                  ［準備］
                  <br />
                  定型フォーマットに団体に所属させたい選手の情報を入力してください。
                  <br />
                  ※定型フォーマットが必要な場合は、「CSVフォーマット出力」をクリックしてください。
                  <br />
                  定型フォーマットがダウンロードされます。
                  <br />
                  ［読み込む］
                  <br />
                  ①　定型フォーマットに記載した選手を所属させたい団体を「所属団体名」より選択してください。
                  <br />
                  ②　「読み込みCSVファイル」に、読み込ませるCSVファイルをドラッグ＆ドロップしてください。
                  <br />
                  ※「参照」からファイルを指定することもできます。
                  <br />
                  ③　「読み込む」ボタンをクリックすると、CSVフォーマットの内容を読み込み、読み込んだ結果を「読み込む」ボタン下に一覧で表示します。
                  <br />
                  ※この状態では、まだ所属選手として登録されません
                </p>
                <CustomButton
                  buttonType='primary'
                  onClick={() => {
                    setActivationFlg(true);
                    // console.log(dialogDisplayFlg);
                    if (dialogDisplayFlg) {
                      if (
                        !window.confirm(
                          '読み込み結果に表示されているデータはクリアされます。よろしいですか？',
                        )
                      ) {
                        setActivationFlg(false);
                        return;
                      }
                    }

                    const specifiedHeader = '既存選手ID,新選手ID,ユーザーID,メールアドレス,選手名'; // 指定のヘッダー文字列
                    const header = csvFileData?.content?.[0]?.join(','); // 1行目を,で結合
                    const isHeaderMatch = header === specifiedHeader; // ヘッダーが指定の文字列と一致するか確認

                    Promise.all(
                      csvFileData.content
                        ?.filter(function (x) {
                          // 1列以上のデータを抽出. 空行を除外するが、何らかの文字が入っている場合は抽出する
                          return x.length > 0 && x.some((y) => y.length > 0);
                        })
                        .slice(isHeaderMatch ? 1 : 0) // ヘッダー行が一致する場合は1行目をスキップ
                        .map((row, index) => getJsonRow(row, index)),
                    ).then((results) => {
                      var resList = results as any;
                      resList.forEach((element: any) => {
                        element['birthCountryId'] = null;
                        element['birthPrefectureId'] = null;
                        element['residenceCountryId'] = null;
                        element['residencePrefectureId'] = null;
                      });
                      console.log(resList);
                      sendCsvData(resList); //バックエンド側のバリデーションチェックを行う為にデータを送信する 20240302
                      setDialogDisplayFlg(true); //2回目以降のcsv読み込みで確認ダイアログを表示させる 20240419
                    });

                    performValidation();
                  }}
                >
                  読み込む
                </CustomButton>
              </div>
            </div>
          )}
          {/* エラーメッセージの表示 */}
          <p className='text-caption1 text-systemErrorText'>{csvFileErrorMessage}</p>
          {/* 読み込み結果の表示 */}
          <div className='flex flex-col items-center'>
            <p className='mb-1 text-systemErrorText'>
              【登録方法】
              <br />
              ①　「読み込む」ボタンの下にCSVフォーマットを読み込んだ結果が表示されます。
              <br />
              ②　読み込むデータの「選択」にチェックを入れてください。※「全選択」で、エラー以外の全てのデータを選択状態にできます。
              <br />
              ③　「登録」をクリックすると「選択」にチェックが入っているデータを対象に、「所属団体名」にて選択した団体の所属選手として登録されます。
              <br />
              所属選手として登録された選手には、本システムより通知メールが送信されます。
              <br />
              ※読み込み結果に「ユーザー未登録」と表示された選手には、ユーザー仮登録の通知メールが送信されます。
              <br />
              本システムへのユーザー登録と選手登録が完了しましたら、所属選手変種から当該選手を所属選手として登録してください。
              <br />
              [手順]
              <br />
              メニュー「団体」-「団体管理」-当該団体のリンクをクリックし、団体情報参照画面へ遷移
              <br />
              所属選手-「所属選手編集」をクリック
            </p>
            <CsvTable
              content={csvData}
              header={[
                '読み込み結果',
                'ユーザーID',
                '選手ID',
                'JARA選手コード',
                '選手名',
                'メールアドレス',
                '所属団体ID',
                '所属団体名',
                '出身地',
                '居住地',
              ]}
              handleInputChange={handleInputChange}
              displayLinkButton={displayLinkButton}
              activationFlg={activationFlg}
            />
          </div>
          {!activationFlg && (
            <div className='flex flex-row justify-center gap-[8px]'>
              <CustomButton
                buttonType='secondary'
                onClick={() => {
                  router.back();
                }}
              >
                戻る
              </CustomButton>
              {csvData.some((row) => row.result !== '連携不可') && displayLinkButtonFlg && (
                <CustomButton
                  buttonType='primary'
                  onClick={() => {
                    if (csvData.find((row) => row.checked)?.id === undefined) {
                      window.confirm('1件以上選択してください。');
                      return;
                    }
                    window.confirm('連携を実施しますか？');
                    registerCsvData(); //バックエンド側にデータを渡す 20240302
                    setActivationFlg(true);
                    setCsvData([]),
                      setCsvFileData({ content: [], isSet: false }),
                      fileUploaderRef?.current?.clearFile(),
                      window.confirm('連携を完了しました。')
                        ? (setActivationFlg(false),
                          setDialogDisplayFlg(false),
                          setDisplayLinkButtonFlg(false))
                        : null;
                    setActivationFlg(false);
                  }}
                >
                  登録
                </CustomButton>
              )}
            </div>
          )}
        </div>
      </main>
    )
  );
}
