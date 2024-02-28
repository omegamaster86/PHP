// 機能名: 選手情報連携
'use client';
// ライブラリのインポート
import React, { useState, useRef } from 'react';
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
  oldPlayerId: string; // 既存選手ID
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

  //読み込むボタン押下時 20240228
  const sendCsvData = async () => {
    const csrf = () => axios.get('/sanctum/csrf-cookie');
    await csrf();
    await axios.post('/sendCsvData', csvData)
      .then((res) => {
        console.log(res.data);
        // router.push('/tournamentSearch'); //大会検索画面に遷移する 20240222
      })
      .catch(error => {
        console.log(error);
      });
  }

  //連携ボタン押下時 20240228
  const registerCsvData = async () => {
    const csrf = () => axios.get('/sanctum/csrf-cookie');
    await csrf();
    await axios.post('/registerCsvData', csvData)
      .then((res) => {
        console.log(res.data);
        // router.push('/tournamentSearch'); //大会検索画面に遷移する 20240222
      })
      .catch(error => {
        console.log(error);
      });
  }

  // CSVダウンロードのプロパティ
  const csvDownloadProps = {
    header: [
      { label: '既存選手ID', key: 'oldPlayerId' },
      { label: '新選手ID', key: 'newPlayerId' },
      { label: 'メールアドレス', key: 'mailaddress' },
      { label: '選手名', key: 'playerName' },
    ],
    // 仮実装。ダウンロードするデータを設定
    data: [
      {
        oldPlayerId: 9999999,
        newPlayerId: 9999999,
        mailaddress: 'xxxxxx@xx.xx.xx',
        playerName: 'ああああああああ',
      },
    ],
    filename: '選手情報連携ファイル.csv',
    label: 'CSVフォーマット出力',
  } as CsvDownloadProps;

  // レンダリング
  return (
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
                <p className='mb-1'>CSVファイルの読み込みについての説明文を記載</p>
                <CustomButton
                  buttonType='primary'
                  onClick={() => {
                    setActivationFlg(true);
                    if (dialogDisplayFlg) {
                      window.confirm('読み込み結果に表示されているデータはクリアされます。よろしいですか？',) ?
                        (
                          sendCsvData(), //読み込んだCSVデータをDBに連携する
                          setCsvData([]),
                          csvFileData?.content?.slice(1).map((row, rowIndex) => {
                            setCsvData((prevData) => [
                              ...(prevData as CsvData[]),
                              {
                                id: rowIndex,
                                // 仮実装。チェック内容に応じて連携の可否とチェックの有無を判定
                                checked: rowIndex % 2 === 0 ? true : false,
                                link: rowIndex % 2 === 0 ? '連携' : '連携不可',
                                oldPlayerId: row[0],
                                playerId: row[1],
                                mailaddress: row[2],
                                playerName: row[3],
                                message: 'メッセージ',
                              },
                            ]);
                            setDialogDisplayFlg(true);
                          })
                        ) :
                        null;
                    } else {
                      sendCsvData(); //読み込んだCSVデータをDBに連携する
                      setCsvData([]);
                      csvFileData?.content?.slice(1).map((row, rowIndex) => {
                        setCsvData((prevData) => [
                          ...(prevData as CsvData[]),
                          {
                            id: rowIndex,
                            // 仮実装。チェック内容に応じて連携の可否とチェックの有無を判定
                            checked: rowIndex % 2 === 0 ? true : false,
                            link: rowIndex % 2 === 0 ? '連携' : '連携不可',
                            oldPlayerId: row[0],
                            playerId: row[1],
                            mailaddress: row[2],
                            playerName: row[3],
                            message: 'メッセージ',
                          },
                        ]);
                        setDialogDisplayFlg(true);
                        // 仮実装。チェック内容に応じて連携ボタンの表示を判定
                        if (row[0] !== '') {
                          setDisplayLinkButtonFlg(true);
                        }
                      });
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
          <p className='text-caption1 text-systemErrorText'>{csvFileErrorMessage}</p>
          {/* 読み込み結果の表示 */}
          <div className='flex flex-col items-center'>
            <p className='mb-1'>読み込んだデータの連携方法についての説明文を記載</p>
            <CsvTable
              content={csvData}
              header={['連携', '選手ID', '既存選手ID', '選手名', 'メールアドレス', 'エラー内容']}
              handleInputChange={handleInputChange}
              displayLinkButton={displayLinkButton}
              activationFlg={activationFlg}
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
                  console.log(csvData);
                  setActivationFlg(true);
                  csvData.find((row) => row.checked)?.id === undefined ?
                    window.confirm('1件以上選択してください。') :
                    registerCsvData(), //読み込んだCSVデータをDBに連携する
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
                連携
              </CustomButton>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
