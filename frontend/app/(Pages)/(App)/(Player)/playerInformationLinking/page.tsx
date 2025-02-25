// 機能名: 選手情報連携
'use client';

import CsvHandler from '@/app/(Pages)/(App)/(Player)/playerInformationLinking/CsvHandler';
import {
  CsvDownloadProps,
  CsvTableRow,
  CsvUploadProps,
  FileHandler,
} from '@/app/(Pages)/(App)/(Player)/playerInformationLinking/shared/csv';
import { CustomButton, CustomTitle, ErrorBox } from '@/app/components';
import axios from '@/app/lib/axios';
import { UserResponse } from '@/app/types';
import Validator from '@/app/utils/validator';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import CsvTable from './CsvTable';

export default function PlayerInformationLinking() {
  const router = useRouter();
  const fileUploaderRef = useRef<FileHandler>(null);

  const [csvFileData, setCsvFileData] = useState<{
    content: Array<Array<string>>;
    isSet: boolean;
  }>({ content: [], isSet: false });
  const [activationFlg, setActivationFlg] = useState<boolean>(false);
  const [errorText, setErrorText] = useState([] as string[]);
  const [csvFileErrorMessage, setCsvFileErrorMessage] = useState([] as string[]);
  const [csvData, setCsvData] = useState<CsvTableRow[]>([]);
  const [dialogDisplayFlg, setDialogDisplayFlg] = useState<boolean>(false);
  const [displayLinkButtonFlg, setDisplayLinkButtonFlg] = useState<boolean>(false);
  const [visibilityFlg, setVisibilityFlg] = useState<boolean>(false); //CSVテーブルの表示切替フラグ 20240412

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
            playerInf.data.result[0].is_jara == 1
          ) {
            setValidFlag(true); //URL直打ち対策（ユーザ種別が不正なユーザが遷移できないようにする） 20240418
          } else {
            //console.log('ユーザ種別不正');
            router.push('/playerSearch');
          }
        } else {
          //console.log('ユーザ情報なし');
          router.push('/playerSearch');
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
  const csvUploadProps: CsvUploadProps = {
    label: '読み込みCSVファイル',
    readonly: activationFlg,
    csvUpload: handleCsvUpload,
    resetActivationFlg: resetActivationFlg,
    setActivationFlg: setActivationFlg,
  };

  //読み込むボタン押下時 20240228
  const sendCsvData = async () => {
    const specifiedHeader = 'JARA選手コード,新選手ID,メールアドレス,選手名'; // 指定のヘッダー文字列
    const header = csvFileData?.content?.[0]?.join(','); // 1行目を,で結合
    const isHeaderMatch = header === specifiedHeader; // ヘッダーが指定の文字列と一致するか確認
    const expectedColumnCount = 4; // 期待する列数

    // ヘッダー行は削除する
    const array = csvFileData?.content
      ?.filter((x) => {
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
            oldPlayerIdError: false,
            playerId: '-',
            playerIdError: false,
            mailaddress: '-',
            mailaddressError: false,
            playerName: '-',
            playerNameError: false,
            message: '',
          };
        } else {
          return {
            id: index, // ID
            checked: true, // 選択
            link: '', // 連携
            oldPlayerId: value[0],
            oldPlayerIdError: false,
            playerId: value[1],
            playerIdError: false,
            mailaddress: value[2],
            mailaddressError: false,
            playerName: value[3],
            playerNameError: false,
            message: '',
          };
        }
      });
    const element = array;
    setActivationFlg(true);
    await axios
      .post<{ result: CsvTableRow[] }>('api/sendCsvData', element)
      .then((res) => {
        const contentData = res.data.result;

        if (dialogDisplayFlg) {
          window.confirm('読み込み結果に表示されているデータはクリアされます。よろしいですか？')
            ? (setCsvData([]),
              contentData.forEach((row, rowIndex) => {
                setCsvData((prevData) => [
                  ...prevData,
                  {
                    id: rowIndex,
                    checked: row.checked,
                    link: row.link,
                    oldPlayerId: row.oldPlayerId,
                    oldPlayerIdError: row.oldPlayerIdError,
                    playerId: row.playerId,
                    playerIdError: row.playerIdError,
                    mailaddress: row.mailaddress,
                    mailaddressError: row.mailaddressError,
                    playerName: row.playerName,
                    playerNameError: row.playerNameError,
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
              ...prevData,
              {
                id: rowIndex,
                checked: row.checked,
                link: row.link,
                oldPlayerId: row.oldPlayerId,
                oldPlayerIdError: row.oldPlayerIdError,
                playerId: row.playerId,
                playerIdError: row.playerIdError,
                mailaddress: row.mailaddress,
                mailaddressError: row.mailaddressError,
                playerName: row.playerName,
                playerNameError: row.playerNameError,
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
        setDialogDisplayFlg(true);
      });
  };

  //連携ボタン押下時
  const registerCsvData = async () => {
    await axios
      .post('api/registerCsvData', csvData)
      .then((res) => {
        setCsvData([]);
        setCsvFileData({ content: [], isSet: false });
        fileUploaderRef?.current?.clearFile();
        window.alert('連携を完了しました。');
        setActivationFlg(false);
        setDialogDisplayFlg(false);
        setDisplayLinkButtonFlg(false);
        setActivationFlg(false);
      })
      .catch((error) => {
        setErrorText(['選手情報連携に失敗しました：' + (error as Error).message]);
      });
  };

  // CSVダウンロードのプロパティ
  const csvDownloadProps: CsvDownloadProps = {
    header: [
      { label: 'JARA選手コード', key: 'oldPlayerId' },
      { label: '新選手ID', key: 'newPlayerId' },
      { label: 'メールアドレス', key: 'mailaddress' },
      { label: '選手名', key: 'playerName' },
    ],
    data: [{}],
    filename: '選手情報連携ファイル.csv',
    label: 'CSVフォーマット出力',
  };

  if (!validFlag) return null;

  return (
    <>
      <CustomTitle displayBack>選手情報連携</CustomTitle>
      {/* エラーメッセージの表示 */}
      <ErrorBox errorText={errorText} />
      {/* 読み込みCSVファイルの表示 */}
      <div className='flex flex-col gap-[20px]'>
        <CsvHandler
          csvUploadProps={csvUploadProps}
          csvDownloadProps={csvDownloadProps}
          ref={fileUploaderRef}
        ></CsvHandler>
        {/* CSVフォーマット出力の表示 */}
        <div className='flex flex-col items-center gap-[20px]'>
          {/* 読み込みボタンの表示 */}
          <p className='mb-1 text-systemErrorText'>
            【読み込み方法】
            <br />
            ① 「CSVフォーマット出力」ボタンをクリックしフォーマットをダウンロード
            <br />
            ② CSVファイルを編集
            <br />
            ③
            「読み込みCSVファイル」の参照ボタンからCSVファイルを選択、もしくはCSVファイルを直接ドラッグ＆ドロップしてアップロード
            <br />
            ④ 「読み込む」ボタンをクリック
            <br />
            ⑤ CSVファイルの読み取り結果を画面下部で確認
            <br />
            ※この段階では、まだCSVファイルの内容はシステムに登録されません。
          </p>
          <CustomButton
            buttonType='primary'
            onClick={() => {
              sendCsvData(); //読み込んだcsvファイルの判定をするためにバックエンド側に渡す 20240229
            }}
          >
            読み込む
          </CustomButton>
        </div>
        {/* エラーメッセージの表示 */}
        <p className='text-caption1 text-systemErrorText'>{csvFileErrorMessage}</p>
        {/* 読み込み結果の表示 */}
        <div className='flex flex-col items-center'>
          <p className='mb-1 text-systemErrorText'>
            【登録方法】
            <br />
            ① 「読み込む」ボタンの下にCSVファイルを読み込んだ結果が表示されます。
            <br />
            　※連携の意味
            <br />
            　連携可能：本システムに登録されている選手と連携可能なデータです。
            <br />
            　連携待ち：当該選手が本システムに登録されていないため、新規で選手を登録します。
            <br />
            　連携不可：本システムに取り込めないデータです。エラー内容を確認してください。
            <br />
            ② 読み込むデータの「選択」にチェックを入れてください。
            <br />
            　※「全選択」で、エラー以外の全てのデータを選択状態にできます。
            <br />③ 「登録」をクリックすると「選択」にチェックが入っているデータが登録されます。
          </p>
          <CsvTable
            content={csvData}
            header={['連携', '選手ID', 'JARA選手コード', '選手名', 'メールアドレス', 'エラー内容']}
            handleInputChange={handleInputChange}
            displayLinkButton={displayLinkButton}
            activationFlg={activationFlg}
            visibilityFlg={visibilityFlg}
          />
        </div>
      </div>
      {/* ボタンの表示 */}
      {!activationFlg && (
        <div className='self-center'>
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
                setActivationFlg(true);
                if (csvData.find((row) => row.checked)?.id === undefined) {
                  window.alert('1件以上選択してください。');
                  setActivationFlg(false);
                  setDialogDisplayFlg(false);
                  setDisplayLinkButtonFlg(false);
                  setActivationFlg(false);
                  return;
                }
                registerCsvData(); //読み込んだCSVデータをDBに連携する
              }}
            >
              連携
            </CustomButton>
          )}
        </div>
      )}
    </>
  );
}
