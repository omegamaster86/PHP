// 機能名: 選手情報連携
'use client';
// ライブラリのインポート
import React, { useState, useRef, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 共通コンポーネントのインポート
import CsvHandler from '@/app/(Pages)/(App)/(Player)/playerInformationLinking/CsvHandler';
import { ErrorBox, CustomTitle, CustomButton } from '@/app/components';
import Validator from '@/app/utils/validator';
// ローカルコンポーネントのインポート
import CsvTable from './CsvTable';
import axios from '@/app/lib/axios';

// CSVデータの型定義
interface CsvData {
  id: number; // ID
  checked: boolean; // 選択
  link: string; // 連携
  playerId: string; // 選手ID
  oldPlayerId: string; // JARA選手コード
  playerName: string; // 選手名
  mailaddress: string; // メールアドレス
  message: string; // メッセージ
}
// CSVアップロードのプロパティの型定義
interface CsvUploadProps {
  label: string; // ラベル
  readonly: boolean; // 読み取り専用かどうか
  csvUpload: (newCsvData: { content: Array<Array<string>>; isSet: boolean }) => void; // CSVアップロード時のコールバック
  resetActivationFlg: () => void; // アクティベーションフラグのリセット
  setActivationFlg: (flg: boolean) => void; // アクティベーションフラグのセット
  loading: boolean;
}
// CSVダウンロードのプロパティの型定義
interface CsvDownloadProps {
  data: any[];
  header: any[];
  filename: string;
  label: string;
}

// ファイル関連のアクションを扱うためのインターフェース
interface FileHandler {
  clearFile(): void;
}

// 選手情報連携のメインコンポーネント
export default function PlayerInformationLinking() {
  // フック
  const router = useRouter();
  const fileUploaderRef = useRef<FileHandler>(null);

  // ステート変数
  const [csvFileData, setCsvFileData] = useState<{
    content: Array<Array<string>>;
    isSet: boolean;
  }>({ content: [], isSet: false });
  const [activationFlg, setActivationFlg] = useState<boolean>(false);
  const [errorText, setErrorText] = useState([] as string[]);
  const [csvFileErrorMessage, setCsvFileErrorMessage] = useState([] as string[]);
  const [csvData, setCsvData] = useState<CsvData[]>([]);
  const [dialogDisplayFlg, setDialogDisplayFlg] = useState<boolean>(false);
  const [displayLinkButtonFlg, setDisplayLinkButtonFlg] = useState<boolean>(false);
  const [visibilityFlg, setVisibilityFlg] = useState<boolean>(false); //CSVテーブルの表示切替フラグ 20240412

  const [validFlag, setValidFlag] = useState(false); //URL直打ち対策（ユーザ種別が不正なユーザが遷移できないようにする） 20240418
  //ユーザIDに紐づいた情報の取得 20240418
  useEffect(() => {
    const fetchData = async () => {
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        const response = await axios.get('/getUserData');
        //console.log(response.data.result);
        if (Object.keys(response.data.result).length > 0) {
          const playerInf = await axios.get('/getIDsAssociatedWithUser');
          if (
            playerInf.data.result[0].is_administrator == 1 ||
            playerInf.data.result[0].is_jara == 1
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
      } catch (error: any) { }
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
    setActivationFlg: setActivationFlg,
  } as CsvUploadProps;

  //読み込むボタン押下時 20240228
  const sendCsvData = async () => {
    const specifiedHeader = 'JARA選手コード,新選手ID,メールアドレス,選手名'; // 指定のヘッダー文字列
    const header = csvFileData?.content?.[0]?.join(','); // 1行目を,で結合
    const isHeaderMatch = header === specifiedHeader; // ヘッダーが指定の文字列と一致するか確認
    const expectedColumnCount = 4; // 期待する列数

    // ヘッダー行は削除する
    var array = csvFileData?.content
      ?.filter(function (x) {
        // 1列以上のデータを抽出. 空行を除外するが、何らかの文字が入っている場合は抽出する
        return x.length > 0 && x.some((y) => y.length > 0);
      })
      .slice(isHeaderMatch ? 1 : 0) // ヘッダー行が一致する場合は1行目をスキップ
      .map((value, index) => {
        if (value.length !== expectedColumnCount) {
          // 列数が期待する列数と異なる場合
          return {
            id: index, // ID
            checked: false, // 選択
            link: '連携不可', // 連携不可
            oldPlayerId: '-',
            playerId: '-',
            mailaddress: '-',
            playerName: '-',
            message: '',
          };
        } else {
          // 列数が期待する列数と一致する場合
          return {
            id: index, // ID
            checked: false, // 選択
            link: '', // 連携
            oldPlayerId: value[0],
            playerId: value[1],
            mailaddress: value[2],
            playerName: value[3],
            message: '',
          };
        }
      });
    var element = array as CsvData[];
    setActivationFlg(true);
    const csrf = () => axios.get('/sanctum/csrf-cookie');
    await csrf();
    await axios
      .post('/sendCsvData', element)
      .then((res) => {
        //console.log(res.data.result);
        var contentData = res.data.result as CsvData[];
        // contentData.map((row, rowIndex) => {
        //   //console.log(row, rowIndex);
        // });

        if (dialogDisplayFlg) {
          window.confirm('読み込み結果に表示されているデータはクリアされます。よろしいですか？')
            ? (setCsvData([]),
              contentData.map((row, rowIndex) => {
                setCsvData((prevData) => [
                  ...(prevData as CsvData[]),
                  {
                    id: rowIndex,
                    checked: row.checked,
                    link: row.link,
                    oldPlayerId: row.oldPlayerId,
                    playerId: row.playerId,
                    mailaddress: row.mailaddress,
                    playerName: row.playerName,
                    message: row.message,
                  },
                ]);
                setDialogDisplayFlg(true);
              }),
              setVisibilityFlg(true)) //CSVテーブルの表示切替フラグ 20240412
            : setVisibilityFlg(false);
        } else {
          setCsvData([]);
          contentData.map((row, rowIndex) => {
            setCsvData((prevData) => [
              ...(prevData as CsvData[]),
              {
                id: rowIndex,
                checked: row.checked,
                link: row.link,
                oldPlayerId: row.oldPlayerId,
                playerId: row.playerId,
                mailaddress: row.mailaddress,
                playerName: row.playerName,
                message: row.message,
              },
            ]);
            setDialogDisplayFlg(true);
            // 仮実装。チェック内容に応じて連携ボタンの表示を判定
            if (row.oldPlayerId !== '') {
              setDisplayLinkButtonFlg(true);
            }
          });
          setVisibilityFlg(true); //CSVテーブルの表示切替フラグ 20240412
        }
        performValidation();
      })
      .catch((error) => {
        //console.log(error);
      })
      .finally(() => {
        setActivationFlg(false);
      });
  };

  //連携ボタン押下時 20240228
  const registerCsvData = async () => {
    const csrf = () => axios.get('/sanctum/csrf-cookie');
    await csrf();
    await axios
      .post('/registerCsvData', csvData)
      .then((res) => {
        //console.log(res.data);
        // router.push('/tournamentSearch'); // 20240222
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  // CSVダウンロードのプロパティ
  const csvDownloadProps = {
    header: [
      { label: 'JARA選手コード', key: 'oldPlayerId' },
      { label: '新選手ID', key: 'newPlayerId' },
      { label: 'メールアドレス', key: 'mailaddress' },
      { label: '選手名', key: 'playerName' },
    ],
    data: [{}],
    filename: '選手情報連携ファイル.csv',
    label: 'CSVフォーマット出力',
  } as CsvDownloadProps;

  // レンダリング
  return (
    validFlag && (
      <div>
        <main className='flex min-h-screen flex-col justify-start p-[10px] m-auto gap-[20px] my-[80px] items-center'>
          {/* タイトルの表示 */}
          <CustomTitle isCenter={false} displayBack>
            選手情報連携
          </CustomTitle>
          {/* エラーメッセージの表示 */}
          <ErrorBox errorText={errorText} />
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
                  {/* 表示する文言はDPT様にて実装予定 */}
                  <p className='mb-1 text-systemErrorText'>
                    【読み込み方法】
                    <br />
                    ［準備］
                    <br />
                    JARAエントリーシステムから本システムに連携したい選手情報を定型フォーマットに記載してください。
                    <br />
                    ※定型フォーマットが必要な場合は、「CSVフォーマット出力」をクリックしてください。
                    <br />
                    定型フォーマットがダウンロードされます。
                    <br />
                    ［読み込む］
                    <br />
                    ①　「読み込みCSVファイル」に、読み込ませるCSVファイルをドラッグ＆ドロップしてください。
                    <br />
                    ※「参照」からファイルを指定することもできます。
                    <br />
                    ②　「読み込み」をクリックすると、CSVフォーマットの内容を読み込み、内容を画面下部のレース結果一覧に表示します。
                    <br />
                    ※この状態では、まだシステムに選手情報は登録されません
                  </p>
                  <CustomButton
                    buttonType='primary'
                    onClick={() => {
                      //console.log(csvFileData);
                      sendCsvData(); //読み込んだcsvファイルの判定をするためにバックエンド側に渡す 20240229
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
              {!activationFlg && (
                <p className='mb-1 text-systemErrorText'>
                  【登録方法】
                  <br />
                  ①　「読み込み結果」にCSVフォーマットを読み込んだ結果が表示されます。
                  <br />
                  ※連携の意味
                  <br />
                  連携可能：本システムに登録されている選手と連携可能なデータです。
                  <br />
                  連携待ち：当該選手が本システムに登録されていないため、
                  <br />
                  連携不可：本システムに取り込めないデータです、エラー内容を確認してください。
                  <br />
                  ②　読み込むデータの「選択」にチェックを入れてください。※「全選択」で、エラー以外の全てのデータを選択状態にできます。
                  <br />
                  ③　「登録」をクリックすると「読み込み結果」にて「選択」にチェックが入っているデータを対象に、本システムに登録されます。
                  <br />
                </p>
              )}
              <CsvTable
                content={csvData}
                header={[
                  '連携',
                  '選手ID',
                  'JARA選手コード',
                  '選手名',
                  'メールアドレス',
                  'エラー内容',
                ]}
                handleInputChange={handleInputChange}
                displayLinkButton={displayLinkButton}
                activationFlg={activationFlg}
                visibilityFlg={visibilityFlg}
              />
            </div>
          </div>
          {/* ボタンの表示 */}
          {!activationFlg && (
            <div className='flex flex-row gap-[4px]'>
              <CustomButton
                buttonType='secondary'
                onClick={() => {
                  router.back();
                }}
              >
                戻る
              </CustomButton>
              {csvData.some((row) => row.link !== '連携不可') && displayLinkButtonFlg && (
                <CustomButton
                  buttonType='primary'
                  onClick={() => {
                    //console.log(csvData);
                    setActivationFlg(true);
                    if (csvData.find((row) => row.checked)?.id === undefined) {
                      window.alert('1件以上選択してください。');
                      return;
                    }
                    registerCsvData(), //読み込んだCSVデータをDBに連携する
                    setCsvData([]),
                    setCsvFileData({ content: [], isSet: false }),
                    fileUploaderRef?.current?.clearFile(),
                    window.confirm('連携を完了しました。');
                    setActivationFlg(false);
                    setDialogDisplayFlg(false);
                    setDisplayLinkButtonFlg(false);
                    setActivationFlg(false);
                  }}
                >
                  連携
                </CustomButton>
              )}
            </div>
          )}
        </main>
      </div>
    )
  );
}
