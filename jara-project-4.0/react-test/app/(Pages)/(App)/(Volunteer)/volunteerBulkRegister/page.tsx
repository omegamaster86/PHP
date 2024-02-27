// ボランティア一括登録
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Validator from '@/app/utils/validator';
import { CustomTitle, ErrorBox, CustomButton } from '@/app/components';
import CsvHandler from './CsvHandler';
import CsvTable from './CsvTable';
import axios from 'axios';

interface MasterData {
  id: number;
  name: string;
}

interface CsvData {
  id: number; // ID
  checked: boolean; // 選択
  result: string; // 読み込み結果
  userId: {
    value: string;
    isError: boolean;
  }; // ユーザーID
  volunteerName: {
    value: string;
    isError: boolean;
  }; // 氏名
  dateOfBirth: {
    value: string;
    isError: boolean;
  }; // 生年月日
  residenceCountryId: {
    value: string;
    isError: boolean;
  }; // 居住国
  residencePrefectureId: {
    value: string;
    isError: boolean;
  }; // 居住都道府県
  sexId: {
    value: string;
    isError: boolean;
  }; // 性別
  clothesSizeId: {
    value: string;
    isError: boolean;
  }; // 服サイズ
  mailaddress: {
    value: string;
    isError: boolean;
  }; // メールアドレス
  telephoneNumber: {
    value: string;
    isError: boolean;
  }; // 電話番号
  disTypeId1: {
    value: string;
    isError: boolean;
  }; // PR1
  disTypeId2: {
    value: string;
    isError: boolean;
  }; // PR2
  disTypeId3: {
    value: string;
    isError: boolean;
  }; // PR3
  qualId1: {
    value: string;
    isError: boolean;
  }; // 保有資格1
  qualId2: {
    value: string;
    isError: boolean;
  }; // 保有資格2
  qualId3: {
    value: string;
    isError: boolean;
  }; // 保有資格3
  qualId4: {
    value: string;
    isError: boolean;
  }; // 保有資格4
  qualId5: {
    value: string;
    isError: boolean;
  }; // 保有資格5
  langId1: {
    value: string;
    isError: boolean;
  }; // 使用言語1
  langId2: {
    value: string;
    isError: boolean;
  }; // 使用言語2
  langId3: {
    value: string;
    isError: boolean;
  }; // 使用言語3
  langProId1: {
    value: string;
    isError: boolean;
  }; // 言語レベル1
  langProId2: {
    value: string;
    isError: boolean;
  }; // 言語レベル2
  langProId3: {
    value: string;
    isError: boolean;
  }; // 言語レベル3
  dayOfWeek1: {
    value: string;
    isError: boolean;
  }; // 日曜日
  dayOfWeek2: {
    value: string;
    isError: boolean;
  }; // 月曜日
  dayOfWeek3: {
    value: string;
    isError: boolean;
  }; // 火曜日
  dayOfWeek4: {
    value: string;
    isError: boolean;
  }; // 水曜日
  dayOfWeek5: {
    value: string;
    isError: boolean;
  }; // 木曜日
  dayOfWeek6: {
    value: string;
    isError: boolean;
  }; // 金曜日
  dayOfWeek7: {
    value: string;
    isError: boolean;
  }; // 土曜日
  timeZone1: {
    value: string;
    isError: boolean;
  }; // 早朝
  timeZone2: {
    value: string;
    isError: boolean;
  }; // 午前
  timeZone3: {
    value: string;
    isError: boolean;
  }; // 午後
  timeZone4: {
    value: string;
    isError: boolean;
  }; // 夜
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

export default function VolunteerBulkRegister() {
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  // フック
  const router = useRouter();
  const fileUploaderRef = useRef<FileHandler>(null);
  // ステート変数
  const [csvFileData, setCsvFileData] = useState<{
    content: Array<Array<string>>;
    isSet: boolean;
  }>({ content: [], isSet: false });
  const [activationFlg, setActivationFlg] = useState<boolean>(false);
  // CSVファイルのアップロードを処理する関数
  const handleCsvUpload = (newCsvData: { content: Array<Array<string>>; isSet: boolean }) => {
    setCsvFileData(newCsvData);
  };
  const [dialogDisplayFlg, setDialogDisplayFlg] = useState<boolean>(false);
  const [displayLinkButtonFlg, setDisplayLinkButtonFlg] = useState<boolean>(false);
  const [csvData, setCsvData] = useState<CsvData[]>([]);
  const [csvFileErrorMessage, setCsvFileErrorMessage] = useState([] as string[]);
  const [country, setCountry] = useState<MasterData[]>([]);
  const [prefecture, setPrefecture] = useState<MasterData[]>([]);
  const [sex, setSex] = useState<MasterData[]>([]);
  const [clothesSize, setClothesSize] = useState<MasterData[]>([]);
  const [qualHold, setQualHold] = useState<MasterData[]>([]);
  const [language, setLanguage] = useState<MasterData[]>([]);
  const [languageLevel, setLanguageLevel] = useState<MasterData[]>([]);

  useEffect(() => {
    const fetchMasterData = async () => {
      // マスターデータの取得
      try {
        // APIを叩いて、マスターデータを取得する
        // 国マスタ
        const residenceCountryMaster = await axios.get('http://localhost:3100/countries');
        setCountry(residenceCountryMaster.data);
        // 都道府県マスタ
        const residencePrefectureMaster = await axios.get('http://localhost:3100/prefecture');
        setPrefecture(residencePrefectureMaster.data);
        // 性別マスタ
        const sexMaster = await axios.get('http://localhost:3100/sex');
        setSex(sexMaster.data);
        // 服サイズマスタ
        const clothesSizeMaster = await axios.get('http://localhost:3100/clothesSize');
        setClothesSize(clothesSizeMaster.data);
        // 資格マスタ
        const qualificationMaster = await axios.get('http://localhost:3100/qualHold');
        setQualHold(qualificationMaster.data);
        // 言語マスタ
        const languageMaster = await axios.get('http://localhost:3100/language');
        setLanguage(languageMaster.data);
        // 言語レベルマスタ
        const languageProficiencyMaster = await axios.get('http://localhost:3100/languageLevel');
        setLanguageLevel(languageProficiencyMaster.data);
      } catch (error) {
        console.error(`マスターデータの取得に失敗しました: ${error}`);
      }
    };
    fetchMasterData();
  }, []);

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

  /**
   * 必須チェックの関数
   * @param value チェックする値
   * @returns true: エラーあり, false: エラーなし
   **/
  const validateRequired = (value: string) => {
    // 値が空でないかどうかを判定する
    // 空の時、trueを返す
    return value == '';
  };

  /**
   * 数値チェックの関数
   * @param value チェックする値
   * @param digits 桁数
   * @returns true: エラーあり, false: エラーなし
   **/
  const validateNumber = (value: string, digits: number) => {
    if (value === '') return false;
    // digits桁以下の数値かどうかを判定する
    // digits以下の時、かつ数値の文字列である場合はfalseを返す
    return value.length > digits || isNaN(Number(value));
  };

  /**
   * 0または1チェックの関数
   * @param value チェックする値
   * @returns true: エラーあり, false: エラーなし
   **/
  const validateZeroOrOne = (value: string) => {
    if (value === '') return false;
    // 0または1かどうかを判定する
    // 0または1の時、falseを返す
    return value !== '0' && value !== '1';
  };

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

  const validateYmdFormat = (value: string) => {
    if (value === '') return false;
    // 日付の形式かどうかを判定する
    // 日付の形式の時、falseを返す
    return !/^(?:(?!0000)[0-9]{4}\/(?:(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12][0-9]|3[01])|(?:0[13-9]|1[0-2])\/(?:29|30)|(?:0[13578]|1[02])\/31))$/.test(
      value,
    );
  };

  const validateVolunteerName = (value: string) => {
    if (value === '') return false;
    // 氏名の形式(全半角文字50文字以内であることを確認)かどうかを判定する
    // 氏名の形式の時、falseを返す
    return !/^[a-zA-Z0-9ぁ-んァ-ヶー一-龠０-９々〆〤]+$/.test(value);
  };

  /**
   * CSVの行データをエラー込みで取得する関数
   * @param row CSVの行データ
   * @param index 行番号
   * @returns CSVの行データ
   **/
  const getJsonRow = async (row: Array<string>, index: number) => {
    // 必須項目は入力が空の場合、エラーとする。
    // 空ではない場合、バリデーションを実行し、エラーがある場合はエラーとする。

    // 任意項目は入力が空の場合、エラーとしない。
    // 空ではない場合、バリデーションを実行し、エラーがある場合はエラーとする。

    return {
      id: index,
      checked: (await handleResult(row)) === '登録可能データ' ? true : false,
      result: await handleResult(row),
      // 必須項目
      userId: {
        value: row[0],
        isError: validateRequired(row[0]) ? true : validateNumber(row[0], 7),
      },
      // 必須項目
      volunteerName: {
        value: row[1],
        isError: validateRequired(row[1]) ? true : validateVolunteerName(row[1]),
      },
      // 必須項目
      dateOfBirth: {
        value: row[2],
        isError: validateRequired(row[2]) ? true : validateYmdFormat(row[2]),
      },
      // 必須項目
      residenceCountryId: {
        value: country.find((item) => item.id === Number(row[4]))?.name || row[4],
        isError: validateRequired(row[4])
          ? true
          : validateNumber(row[4], 3) ||
            country.filter((item) => item.id === Number(row[4])).length !== 1,
      },
      // 必須項目
      residencePrefectureId: {
        value: prefecture.find((item) => item.id === Number(row[5]))?.name || row[5],
        isError: validateRequired(row[5])
          ? true
          : validateNumber(row[5], 2) ||
            prefecture.filter((item) => item.id === Number(row[5])).length !== 1,
      },
      // 必須項目
      sexId: {
        value: sex.find((item) => item.id === Number(row[3]))?.name || row[3],
        isError: validateRequired(row[3])
          ? true
          : validateNumber(row[3], 2) ||
            sex.filter((item) => item.id === Number(row[3])).length !== 1,
      },
      // 必須項目
      clothesSizeId: {
        value: clothesSize.find((item) => item.id === Number(row[6]))?.name || row[6],
        isError: validateRequired(row[6])
          ? true
          : validateNumber(row[6], 1) ||
            clothesSize.filter((item) => item.id === Number(row[6])).length !== 1,
      },
      mailaddress: {
        value: row[7],
        isError: !validateRequired(row[7]) && validateEmailFormat(row[7]),
      },
      telephoneNumber: {
        value: row[8],
        isError: !validateRequired(row[8]) && validateNumber(row[8], 15),
      },
      disTypeId1: {
        value: row[9] === '1' ? '◯' : '',
        isError: !validateRequired(row[9]) && validateZeroOrOne(row[9]),
      },
      disTypeId2: {
        value: row[10] === '1' ? '◯' : '',
        isError: !validateRequired(row[10]) && validateZeroOrOne(row[10]),
      },
      disTypeId3: {
        value: row[11] === '1' ? '◯' : '',
        isError: !validateRequired(row[11]) && validateZeroOrOne(row[11]),
      },
      qualId1: {
        value: qualHold.find((item) => item.id === Number(row[12]))?.name || row[12],
        isError:
          !validateRequired(row[12]) &&
          (validateNumber(row[12], 3) ||
            qualHold.filter((item) => item.id === Number(row[12])).length !== 1),
      },
      qualId2: {
        value: qualHold.find((item) => item.id === Number(row[13]))?.name || row[13],
        isError:
          !validateRequired(row[13]) &&
          (validateNumber(row[13], 3) ||
            qualHold.filter((item) => item.id === Number(row[13])).length !== 1),
      },
      qualId3: {
        value: qualHold.find((item) => item.id === Number(row[14]))?.name || row[14],
        isError:
          !validateRequired(row[14]) &&
          (validateNumber(row[14], 3) ||
            qualHold.filter((item) => item.id === Number(row[14])).length !== 1),
      },
      qualId4: {
        value: qualHold.find((item) => item.id === Number(row[15]))?.name,
        isError:
          !validateRequired(row[15]) &&
          (validateNumber(row[15], 3) ||
            qualHold.filter((item) => item.id === Number(row[15])).length !== 1),
      },
      qualId5: {
        value: qualHold.find((item) => item.id === Number(row[16]))?.name,
        isError:
          !validateRequired(row[16]) &&
          (validateNumber(row[16], 3) ||
            qualHold.filter((item) => item.id === Number(row[16])).length !== 1),
      },
      langId1: {
        value: language.find((item) => item.id === Number(row[17]))?.name,
        isError:
          !validateRequired(row[17]) &&
          (validateNumber(row[17], 3) ||
            language.filter((item) => item.id === Number(row[17])).length !== 1),
      },
      langId2: {
        value: language.find((item) => item.id === Number(row[18]))?.name,
        isError:
          !validateRequired(row[18]) &&
          (validateNumber(row[18], 3) ||
            language.filter((item) => item.id === Number(row[18])).length !== 1),
      },
      langId3: {
        value: language.find((item) => item.id === Number(row[19]))?.name,
        isError:
          !validateRequired(row[19]) &&
          (validateNumber(row[19], 3) ||
            language.filter((item) => item.id === Number(row[19])).length !== 1),
      },
      langProId1: {
        value: languageLevel.find((item) => item.id === Number(row[20]))?.name,
        isError:
          !validateRequired(row[20]) &&
          (validateNumber(row[20], 3) ||
            languageLevel.filter((item) => item.id === Number(row[20])).length !== 1),
      },
      langProId2: {
        value: languageLevel.find((item) => item.id === Number(row[21]))?.name,
        isError:
          !validateRequired(row[21]) &&
          (validateNumber(row[21], 3) ||
            languageLevel.filter((item) => item.id === Number(row[21])).length !== 1),
      },
      langProId3: {
        value: languageLevel.find((item) => item.id === Number(row[22]))?.name,
        isError:
          !validateRequired(row[22]) &&
          (validateNumber(row[22], 3) ||
            languageLevel.filter((item) => item.id === Number(row[22])).length !== 1),
      },
      dayOfWeek1: {
        value: row[23] === '1' ? '◯' : '',
        isError: !validateRequired(row[23]) && validateZeroOrOne(row[23]),
      },
      dayOfWeek2: {
        value: row[24] === '1' ? '◯' : '',
        isError: !validateRequired(row[24]) && validateZeroOrOne(row[24]),
      },
      dayOfWeek3: {
        value: row[25] === '1' ? '◯' : '',
        isError: !validateRequired(row[25]) && validateZeroOrOne(row[25]),
      },
      dayOfWeek4: {
        value: row[26] === '1' ? '◯' : '',
        isError: !validateRequired(row[26]) && validateZeroOrOne(row[26]),
      },
      dayOfWeek5: {
        value: row[27] === '1' ? '◯' : '',
        isError: !validateRequired(row[27]) && validateZeroOrOne(row[27]),
      },
      dayOfWeek6: {
        value: row[28] === '1' ? '◯' : '',
        isError: !validateRequired(row[28]) && validateZeroOrOne(row[28]),
      },

      dayOfWeek7: {
        value: row[29] === '1' ? '◯' : '',
        isError: !validateRequired(row[29]) && validateZeroOrOne(row[29]),
      },
      timeZone1: {
        value: row[30] === '1' ? '◯' : '',
        isError: !validateRequired(row[30]) && validateZeroOrOne(row[30]),
      },
      timeZone2: {
        value: row[31] === '1' ? '◯' : '',
        isError: !validateRequired(row[31]) && validateZeroOrOne(row[31]),
      },

      timeZone3: {
        value: row[32] === '1' ? '◯' : '',
        isError: !validateRequired(row[32]) && validateZeroOrOne(row[32]),
      },
      timeZone4: {
        value: row[33] === '1' ? '◯' : '',
        isError: !validateRequired(row[33]) && validateZeroOrOne(row[33]),
      },
    };
  };

  /**
   * CSV行に対しバリデーションを実行し、resultの文字列を返す関数
   * @param row
   * @returns
   */
  const handleResult = async (row: string[]) => {
    // TODO: システムチェックの実装
    const result =
      row.length !== 34
        ? '無効データ'
        : (validateRequired(row[0]) ? true : validateNumber(row[0], 7)) ||
            (validateRequired(row[1]) ? true : validateVolunteerName(row[1])) ||
            (validateRequired(row[2]) ? true : validateYmdFormat(row[2])) ||
            (validateRequired(row[4])
              ? true
              : validateNumber(row[4], 3) ||
                country.filter((item) => item.id === Number(row[4])).length !== 1) ||
            (validateRequired(row[5])
              ? true
              : validateNumber(row[5], 2) ||
                prefecture.filter((item) => item.id === Number(row[5])).length !== 1) ||
            (validateRequired(row[3])
              ? true
              : validateNumber(row[3], 2) ||
                sex.filter((item) => item.id === Number(row[3])).length !== 1) ||
            (validateRequired(row[6])
              ? true
              : validateNumber(row[6], 1) ||
                clothesSize.filter((item) => item.id === Number(row[6])).length !== 1) ||
            (validateRequired(row[7]) ? false : validateEmailFormat(row[7])) ||
            (validateRequired(row[8]) ? false : validateNumber(row[8], 15)) ||
            (validateRequired(row[9]) ? false : validateZeroOrOne(row[9])) ||
            (validateRequired(row[10]) ? false : validateZeroOrOne(row[10])) ||
            (validateRequired(row[11]) ? false : validateZeroOrOne(row[11])) ||
            (validateRequired(row[12])
              ? false
              : validateNumber(row[12], 3) ||
                qualHold.filter((item) => item.id === Number(row[12])).length !== 1) ||
            (validateRequired(row[13])
              ? false
              : validateNumber(row[13], 3) ||
                qualHold.filter((item) => item.id === Number(row[13])).length !== 1) ||
            (validateRequired(row[14])
              ? false
              : validateNumber(row[14], 3) ||
                qualHold.filter((item) => item.id === Number(row[14])).length !== 1) ||
            (validateRequired(row[15])
              ? false
              : validateNumber(row[15], 3) ||
                qualHold.filter((item) => item.id === Number(row[15])).length !== 1) ||
            (validateRequired(row[16])
              ? false
              : validateNumber(row[16], 3) ||
                qualHold.filter((item) => item.id === Number(row[16])).length !== 1) ||
            (validateRequired(row[17])
              ? false
              : validateNumber(row[17], 3) ||
                language.filter((item) => item.id === Number(row[17])).length !== 1) ||
            (validateRequired(row[18])
              ? false
              : validateNumber(row[18], 3) ||
                language.filter((item) => item.id === Number(row[18])).length !== 1) ||
            (validateRequired(row[19])
              ? false
              : validateNumber(row[19], 3) ||
                language.filter((item) => item.id === Number(row[19])).length !== 1) ||
            (validateRequired(row[20])
              ? false
              : validateNumber(row[20], 3) ||
                languageLevel.filter((item) => item.id === Number(row[20])).length !== 1) ||
            (validateRequired(row[21])
              ? false
              : validateNumber(row[21], 3) ||
                languageLevel.filter((item) => item.id === Number(row[21])).length !== 1) ||
            (validateRequired(row[22])
              ? false
              : validateNumber(row[22], 3) ||
                languageLevel.filter((item) => item.id === Number(row[22])).length !== 1) ||
            (validateRequired(row[23]) ? false : validateZeroOrOne(row[23])) ||
            (validateRequired(row[24]) ? false : validateZeroOrOne(row[24])) ||
            (validateRequired(row[25]) ? false : validateZeroOrOne(row[25])) ||
            (validateRequired(row[26]) ? false : validateZeroOrOne(row[26])) ||
            (validateRequired(row[27]) ? false : validateZeroOrOne(row[27])) ||
            (validateRequired(row[28]) ? false : validateZeroOrOne(row[28])) ||
            (validateRequired(row[29]) ? false : validateZeroOrOne(row[29])) ||
            (validateRequired(row[30]) ? false : validateZeroOrOne(row[30])) ||
            (validateRequired(row[31]) ? false : validateZeroOrOne(row[31])) ||
            (validateRequired(row[32]) ? false : validateZeroOrOne(row[32])) ||
            (validateRequired(row[33]) ? false : validateZeroOrOne(row[33]))
          ? '登録不可データ'
          : '登録可能データ';

    // どの項目がエラーになっているかをコンソールに出力

    return result;
  };

  // CSVアップロードのプロパティ
  const csvUploadProps = {
    label: '読み込みCSVファイル',
    readonly: activationFlg,
    csvUpload: handleCsvUpload,
    resetActivationFlg: resetActivationFlg,
  } as CsvUploadProps;

  const csvDownloadProps = {
    header: [
      { label: 'ユーザーID', key: 'userId' },
      { label: '氏名', key: 'volunteerName' },
      { label: '生年月日', key: 'dateOfBirth' },
      { label: '性別', key: 'sexId' },
      { label: '居住地（国）', key: 'residenceCountryId' },
      { label: '居住地（都道府県）', key: 'residencePrefectureId' },
      { label: '服サイズ', key: 'clothesSizeId' },
      { label: 'メールアドレス', key: 'mailaddress' },
      { label: '電話番号', key: 'telephoneNumber' },
      { label: 'PR1', key: 'disTypeId1' },
      { label: 'PR2', key: 'disTypeId2' },
      { label: 'PR3', key: 'disTypeId3' },
      { label: '保有資格1', key: 'qualId1' },
      { label: '保有資格2', key: 'qualId2' },
      { label: '保有資格3', key: 'qualId3' },
      { label: '保有資格4', key: 'qualId4' },
      { label: '保有資格5', key: 'qualId5' },
      { label: '言語1', key: 'langId1' },
      { label: '言語2', key: 'langId2' },
      { label: '言語3', key: 'langId3' },
      { label: '言語レベル1', key: 'langProId1' },
      { label: '言語レベル2', key: 'langProId2' },
      { label: '言語レベル3', key: 'langProId3' },
      { label: '日曜日', key: 'dayOfWeek1' },
      { label: '月曜日', key: 'dayOfWeek2' },
      { label: '火曜日', key: 'dayOfWeek3' },
      { label: '水曜日', key: 'dayOfWeek4' },
      { label: '木曜日', key: 'dayOfWeek5' },
      { label: '金曜日', key: 'dayOfWeek6' },
      { label: '土曜日', key: 'dayOfWeek7' },
      { label: '早朝', key: 'timeZone1' },
      { label: '午前', key: 'timeZone2' },
      { label: '午後', key: 'timeZone3' },
      { label: '夜', key: 'timeZone4' },
    ],
    // 仮実装。ダウンロードするデータを設定
    data: [
      {
        id: 1,
        userId: '1243455',
        volunteerName: '田中たろう',
        dateOfBirth: '2021/01/01',
        residenceCountryId: '001',
        residencePrefectureId: '01',
        sexId: '01',
        clothesSizeId: '1',
        mailaddress: 'sample@example.com',
        telephoneNumber: '00011112222',
        disTypeId1: '1',
        disTypeId2: '0',
        disTypeId3: '0',
        qualId1: '001',
        qualId2: '002',
        qualId3: '003',
        qualId4: '001',
        qualId5: '002',
        langId1: '001',
        langId2: '002',
        langId3: '003',
        langProId1: '001',
        langProId2: '002',
        langProId3: '003',
        dayOfWeek1: '1',
        dayOfWeek2: '0',
        dayOfWeek3: '1',
        dayOfWeek4: '0',
        dayOfWeek5: '1',
        dayOfWeek6: '0',
        dayOfWeek7: '1',
        timeZone1: '0',
        timeZone2: '1',
        timeZone3: '0',
        timeZone4: '1',
      },
    ],
    filename: 'ボランティア一括登録.csv',
    label: 'CSVフォーマット出力',
  } as CsvDownloadProps;

  return (
    <main className='flex min-h-screen flex-col justify-start p-[10px] m-auto gap-[20px] my-[80px] min-w-[900px]'>
      <div className='relative flex flex-col justify-between w-full h-screen flex-wrap gap-[20px]'>
        <CustomTitle displayBack>ボランティア一括登録</CustomTitle>
        <ErrorBox errorText={errorMessage} />
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
                　[準備]
                <br />
                　　定型フォーマットにエントリー情報を入力してください。
                <br />
                　　※定型フォーマットが必要な場合は、「CSVフォーマット出力」をクリックしてください。
                <br />
                　　定型フォーマットがダウンロードされます。
                <br />
                [読み込む]
                <br />
                ①「読み込みCSVファイル」に、読み込ませるCSVファイルをドラッグ＆ドロップしてください。
                <br />
                　　※「参照」からファイルを指定することもできます。
                <br />
                ②「読み込む」をクリックすると、CSVフォーマットの内容を読み込み、内容を画面下部の読み込み結果に表示します。
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
                  Promise.all(
                    csvFileData.content?.slice(1).map((row, index) => getJsonRow(row, index)),
                  ).then((results) => {
                    setCsvData(results as CsvData[]);
                    setActivationFlg(false);
                    setDisplayLinkButtonFlg(true);
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
            　①「読み込み結果」にCSVフォーマットを読み込んだ結果が表示されます。
            <br />
            　②読み込むデータの「選択」にチェックを入れてください。
            ※「全選択」で、全てのデータを選択状態にできます。
            <br />
            　③「登録」をクリックすると「読み込み結果」にて「選択」にチェックが入っているデータを対象に、
            <br />
            　　　本システムに登録されます。
            <br />
            　　　※それまで登録されていたデータは全て削除され、読み込んだデータに置き換わります。
          </p>
          <CsvTable
            content={csvData}
            handleInputChange={handleInputChange}
            displayLinkButton={displayLinkButton}
            activationFlg={activationFlg}
          />
        </div>
        <div className='flex flex-row justify-center gap-[8px]'>
          <CustomButton
            buttonType='secondary'
            disabled={activationFlg}
            onClick={() => {
              router.back();
            }}
          >
            戻る
          </CustomButton>
          {displayLinkButtonFlg && (
            <CustomButton
              buttonType='primary'
              disabled={activationFlg}
              onClick={() => {
                if (csvData.find((row) => row.checked)?.id === undefined) {
                  window.confirm('1件以上選択してください。');
                  return;
                }
                if (window.confirm('連携を実施しますか？')) {
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
                }
              }}
            >
              登録
            </CustomButton>
          )}
        </div>
      </div>
    </main>
  );
}
