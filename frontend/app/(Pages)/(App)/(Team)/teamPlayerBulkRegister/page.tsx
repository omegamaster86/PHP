'use client';
// 機能名: 団体所属選手一括登録画面

import { CustomButton, CustomDropdown, CustomTitle, ErrorBox } from '@/app/components';
import axios from '@/app/lib/axios';
import { Org, UserResponse } from '@/app/types';
import Validator from '@/app/utils/validator';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import CsvHandler from './CsvHandler';
import CsvTable from './CsvTable';

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

  const router = useRouter();
  const searchParams = useSearchParams();
  const fileUploaderRef = useRef<FileHandler>(null);

  const org_id = searchParams.get('org_id')?.toString() || '';

  const [orgs, setOrgs] = useState([] as Org[]);
  const [orgData, setOrg] = useState({} as Org);
  // ステート変数
  const [csvFileData, setCsvFileData] = useState<{
    content: Array<Array<string>>;
    isSet: boolean;
  }>({ content: [], isSet: false });
  const [activationFlg, setActivationFlg] = useState<boolean>(false);
  const [orgSelected, setOrgSelected] = useState<string>(org_id);
  const [csvFileErrorMessage, setCsvFileErrorMessage] = useState([] as string[]);
  const [csvData, setCsvData] = useState<CsvData[]>([]);
  const [dialogDisplayFlg, setDialogDisplayFlg] = useState<boolean>(false);
  const [displayLinkButtonFlg, setDisplayLinkButtonFlg] = useState<boolean>(false);
  const [visibilityFlg, setVisibilityFlg] = useState<boolean>(false); //CSVテーブルの表示切替フラグ 20240424

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
            router.push('/teamSearch');
          }
        } else {
          //console.log('ユーザ情報なし');
          router.push('/teamSearch');
        }
      } catch (error: any) {}
    };
    fetchData();
  }, []);

  // 所属団体名の活性状態を制御
  let isOrgNameActive = false;
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
        if (isOrgNameActive == false) {
          const orgSearchId = { org_id };
          const org = await axios.post('api/getOrgData', orgSearchId);
          setOrg(org.data.result);
          setTargetOrgData({
            targetOrgId: org.data.result.org_id,
            targetOrgName: org.data.result.org_name,
          });
        } else {
          const playerInf = await axios.get('api/getIDsAssociatedWithUser');
          const userIdInfo = playerInf.data.result[0];
          if (
            userIdInfo.is_administrator == '0' &&
            userIdInfo.is_jara == '0' &&
            userIdInfo.is_pref_boat_officer == '0'
          ) {
            //団体管理者の権限だけが1の場合
            const responseData = await axios.get('api/getOrganizationForOrgManagement'); //ログインユーザーが管理している団体データの取得
            setOrgs(responseData.data.result);
          } else {
            const responseData = await axios.get('api/getOrganizationListData'); //すべての団体データの取得
            setOrgs(responseData.data.result);
          }
        }
      } catch (error) {
        //console.log(error);
      }
    };
    fetchData();
  }, []);

  /**
   * メールアドレス形式チェックの関数
   * @param value チェックする値
   * @returns true: エラーあり, false: エラーなし
   **/
  const validateEmailFormat = (value: string) => {
    if (value === '') return false;
    // メールアドレスの形式かどうかを判定する
    // メールアドレスの形式の時、falseを返す
    const emailRegex = new RegExp('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$');
    return !emailRegex.test(value);
  };

  //選手名の形式チェック関数
  const validatePlayerName = (value: string) => {
    // 氏名の形式(全半角文字50文字以内であることを確認)かどうかを判定する
    // 氏名の形式の時、falseを返す
    return !/^[a-zA-Z0-9０-９ぁ-んァ-ヶー一-龠ａ-ｚＡ-Ｚ]+$/g.test(value) || value.length > 50;
  };

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

    if (row.length !== 5) return 'CSVのフォーマットが不正です。）';

    if (validateEmailFormat(row[3])) {
      return '無効データ（メールアドレスの形式が不正です。）';
    } else if (row[4] === '' || row[4] === undefined || row[4] === null) {
      return '無効データ（選手名は必須入力です。）';
    } else if (validatePlayerName(row[4])) {
      return '無効データ（選手名は全半角文字50文字以内で入力してください。）';
    }

    setDisplayLinkButtonFlg(true);
    return '登録可能';
  };

  const getJsonRow = async (row: string[], index: number) => {
    const expectedColumnCount = 5; // 期待する列数
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
        checked: handleCheckboxValue(await handleResult(row)),
        result: await handleResult(row),
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
    try {
      const sendData = {
        targetOrgData,
        csvDataList: row,
      };
      if (targetOrgData.targetOrgId == '' || targetOrgData.targetOrgId == null) {
        window.alert('所属団体名を選択してください');
        setActivationFlg(false);
        return;
      }
      const response = await axios.post('api/sendOrgCsvData', sendData);
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
    await axios
      .post('api/registerOrgCsvData', sendData)
      .then((res) => {
        setActivationFlg(true);
        setCsvData([]);
        setCsvFileData({ content: [], isSet: false });
        fileUploaderRef?.current?.clearFile();
        window.alert('登録を完了しました。');
        setActivationFlg(false);
        setDialogDisplayFlg(false);
        setDisplayLinkButtonFlg(false);
        setActivationFlg(false);
      })
      .catch((error) => {
        setErrorMessage(['団体所属選手一括登録に失敗しました：' + (error as Error).message]);
      });
  };

  const handleCheckboxValue = (result: string) => {
    return result.startsWith('無効データ') ? false : result != '登録可能' ? false : true;
  };

  if (!validFlag) return null;

  return (
    <>
      <CustomTitle displayBack>団体所属選手一括登録</CustomTitle>
      <ErrorBox errorText={errorMessage} />
      <div className='flex flex-col gap-[10px] md:w-[300px]'>
        <CustomDropdown
          id='org'
          label='所属団体名'
          displayHelp
          toolTipText='選手を登録したい団体を選択してください。'
          value={isOrgNameActive ? orgSelected : orgData.org_name} //団体参照画面から遷移した場合は、該当の団体名を表示する
          options={orgs.map((org) => ({ value: org.org_name, key: org.org_id }))}
          onChange={(e) => {
            //csv読み込み後に所属団体名を変更して登録できる不具合の対策 20240422
            if (dialogDisplayFlg) {
              if (
                window.confirm('現在選択中の団体への登録が完了していません。団体を変更しますか？')
              ) {
                setActivationFlg(true);
                setCsvData([]);
                setCsvFileData({ content: [], isSet: false });
                fileUploaderRef?.current?.clearFile();
                setActivationFlg(false);
                setDialogDisplayFlg(false);
                setDisplayLinkButtonFlg(false);
                setActivationFlg(false);
              } else {
                return;
              }
            }
            setOrgSelected(e);
            handleFormInputChange('targetOrgId', e);
            handleFormInputChange(
              'targetOrgName',
              orgs.find((item) => item.org_id === Number(e))?.org_name || '',
            );
          }}
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
              ① 所属団体名を入力
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
              onClick={() => {
                setActivationFlg(true);
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

                const specifiedHeader = 'JARA選手コード,選手ID,ユーザーID,メールアドレス,選手名'; // 指定のヘッダー文字列
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
                  sendCsvData(resList); //バックエンド側のバリデーションチェックを行う為にデータを送信する 20240302
                  setDialogDisplayFlg(true); //2回目以降のcsv読み込みで確認ダイアログを表示させる 20240419
                  setVisibilityFlg(true); //CSVテーブルの表示切替フラグ 20240424
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
      <p className='text-systemErrorText self-center'>{csvFileErrorMessage}</p>
      {/* 読み込み結果の表示 */}
      <p className='mb-1 text-systemErrorText'>
        【登録方法】
        <br />
        ① 「読み込む」ボタンの下にCSVファイルを読み込んだ結果が表示されます。
        <br />
        ② 読み込むデータの「選択」にチェックを入れてください。
        <br />
        　※「全選択」で、エラー以外の全てのデータを選択状態にできます。
        <br />③ 「登録」をクリックすると「選択」にチェックが入っているデータが登録されます。
        <br />
        　所属選手として登録された選手には、本システムより通知メールが送信されます。
        <br />
        <br />
        ※読み込み結果に「ユーザー未登録」と表示された選手には、ユーザー仮登録の通知メールが送信されます。
        <br />
        本システムへのユーザー登録と選手登録が完了後、下記手順により当該選手を団体と紐づけてください。
        <br />
        [手順]
        <br />
        団体メニュー＞「団体管理」＞当該団体のリンク＞団体情報参照画面へ遷移
        <br />
        所属選手タブの「所属選手編集」をクリック
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
        visibilityFlg={visibilityFlg}
      />
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
                if (window.confirm('登録を実施しますか？')) {
                  registerCsvData(); //バックエンド側にデータを渡す 20240302
                }
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
