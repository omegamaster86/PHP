// ボランティア一括登録
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Validator from '@/app/utils/validator';
import { CustomTitle, ErrorBox, CustomButton } from '@/app/components';
import CsvHandler from './CsvHandler';
import CsvTable from './CsvTable';
import axios from '@/app/lib/axios';

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
  sexId: {
    key: string;
    value: string;
    isError: boolean;
  }; // 性別
  residenceCountryId: {
    key: string;
    value: string;
    isError: boolean;
  }; // 居住国
  residencePrefectureId: {
    key: string;
    value: string;
    isError: boolean;
  }; // 居住都道府県
  mailaddress: {
    value: string;
    isError: boolean;
  }; // メールアドレス
  telephoneNumber: {
    value: string;
    isError: boolean;
  }; // 電話番号
  clothesSizeId: {
    key: string;
    value: string;
    isError: boolean;
  }; // 服サイズ
  disTypeId1: {
    key: string;
    value: string;
    isError: boolean;
  }; // PR1
  disTypeId2: {
    key: string;
    value: string;
    isError: boolean;
  }; // PR2
  disTypeId3: {
    key: string;
    value: string;
    isError: boolean;
  }; // PR3
  qualId1: {
    key: string;
    value: string;
    isError: boolean;
  }; // 保有資格1
  qualId2: {
    key: string;
    value: string;
    isError: boolean;
  }; // 保有資格2
  qualId3: {
    key: string;
    value: string;
    isError: boolean;
  }; // 保有資格3
  qualId4: {
    key: string;
    value: string;
    isError: boolean;
  }; // 保有資格4
  qualId5: {
    key: string;
    value: string;
    isError: boolean;
  }; // 保有資格5
  langId1: {
    key: string;
    value: string;
    isError: boolean;
  }; // 使用言語1
  langProId1: {
    key: string;
    value: string;
    isError: boolean;
  }; // 言語レベル1
  langId2: {
    key: string;
    value: string;
    isError: boolean;
  }; // 使用言語2
  langProId2: {
    key: string;
    value: string;
    isError: boolean;
  }; // 言語レベル2
  langId3: {
    key: string;
    value: string;
    isError: boolean;
  }; // 使用言語3
  langProId3: {
    key: string;
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
  const [visibilityFlg, setVisibilityFlg] = useState<boolean>(false); //CSVテーブルの表示切替フラグ 20240406
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
      } catch (error: any) {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMasterData = async () => {
      // マスターデータの取得
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        // APIを叩いて、マスターデータを取得する
        // 国マスタ
        // const residenceCountryMaster = await axios.get('http://localhost:3100/countries');
        const countryResponse = await axios.get('/getCountries');
        const countryList = countryResponse.data.map(
          ({ country_id, country_name }: { country_id: number; country_name: string }) => ({
            id: country_id,
            name: country_name,
          }),
        );
        setCountry(countryList);
        // 都道府県マスタ
        // const residencePrefectureMaster = await axios.get('http://localhost:3100/prefecture');
        const prefectureResponse = await axios.get('/getPrefecures');
        const stateList = prefectureResponse.data.map(
          ({ pref_id, pref_name }: { pref_id: number; pref_name: string }) => ({
            id: pref_id,
            name: pref_name,
          }),
        );
        setPrefecture(stateList);
        // 性別マスタ
        // const sexMaster = await axios.get('http://localhost:3100/sex');
        const sexResponse = await axios.get('/getSexList');
        const sexList = sexResponse.data.map(
          ({ sex_id, sex }: { sex_id: number; sex: string }) => ({ id: sex_id, name: sex }),
        );
        setSex(sexList);
        // 服サイズマスタ
        // const clothesSizeMaster = await axios.get('http://localhost:3100/clothesSize');
        const clothesSizeMaster = await axios.get('/getClothesSize');
        const clothesSizeMasterList = clothesSizeMaster.data.map(
          ({
            clothes_size_id,
            clothes_size,
          }: {
            clothes_size_id: number;
            clothes_size: string;
          }) => ({ id: clothes_size_id, name: clothes_size }),
        );
        setClothesSize(clothesSizeMasterList);
        // 資格マスタ
        // const qualificationMaster = await axios.get('http://localhost:3100/qualHold');
        const qualHold = await axios.get('/getQualifications');
        const qualHoldList = qualHold.data.map(
          ({ qual_id, qual_name }: { qual_id: number; qual_name: string }) => ({
            id: qual_id,
            name: qual_name,
          }),
        );
        setQualHold(qualHoldList);
        // 言語マスタ
        // const languageMaster = await axios.get('http://localhost:3100/language');
        const lang = await axios.get('/getLanguages');
        const langList = lang.data.map(
          ({ lang_id, lang_name }: { lang_id: number; lang_name: string }) => ({
            id: lang_id,
            name: lang_name,
          }),
        );
        setLanguage(langList);
        // 言語レベルマスタ
        // const languageProficiencyMaster = await axios.get('http://localhost:3100/languageLevel');
        const langLevel = await axios.get('/getLanguageProficiency');
        const langLevelList = langLevel.data.map(
          ({ lang_pro_id, lang_pro_name }: { lang_pro_id: number; lang_pro_name: string }) => ({
            id: lang_pro_id,
            name: lang_pro_name,
          }),
        );
        setLanguageLevel(langLevelList);
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
    if (value === '' || value === undefined || value === null) return false;
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
    // yyyy/MM/ddの形式を想定し、Dateオブジェクトに変換できるかどうかを判定する
    // 日付の形式の時、falseを返す

    // 正規表現で日付の形式がYYYY/MM/DD（MM,DDは1桁を許容する)かどうかを判定する
    // Dateオブジェクトへの変換だけでは、yyyy-MM-ddのような形式も変換できてしまうため、正規表現で形式をチェックする
    const regex = /^\d{4}\/([1-9]|0[1-9]|1[0-2])\/([1-9]|0[1-9]|[12][0-9]|3[01])$/;
    if (value.match(regex) === null) {
      return true;
    }

    // Dateオブジェクトに変換できるかどうかを判定する
    // ただし、2000/4/31のような日付はオブジェクトに変換できるが、日付が2000/5/1に変換されることに注意
    const date = new Date(value);

    // Dateオブジェクトに変換後、年月日が一致するかどうかを判定する
    // 一致しない場合、falseを返す
    const [year, month, day] = value.split('/');
    return (
      date.getFullYear() !== Number(year) ||
      date.getMonth() + 1 !== Number(month) ||
      date.getDate() !== Number(day)
    );
  };

  const validateVolunteerName = (value: string) => {
    if (value === '') return false;
    // 氏名の形式(全半角文字50文字以内であることを確認)かどうかを判定する
    // 氏名の形式の時、falseを返す
    return !/^[a-zA-Z0-9０-９ぁ-んァ-ヶー一-龠ａ-ｚＡ-Ｚ]+$/g.test(value) || value.length > 50;
  };

  // const validateCountryIsNotJapan = (key: string) => {
  //   //console.log(key);
  //   if (key === '' || key === undefined || key === null) return false;
  //   // 居住国が日本=112の時のみ、居住都道府県の形式をチェックする
  //   // 居住国が日本=112の時、falseを返す
  //   return key !== '112';
  // };
  //居住地のバリデーションチェックで日本以外かつ都道府県ありをチェックできるように条件を修正 20240412
  const validateCountryIsNotJapanAndPref = (cntKey: string, prefKey: string) => {
    //console.log(cntKey,prefKey);
    if (cntKey != '112' && prefKey != '') {
      return true; //日本以外かつ都道府県あり
    } else if (cntKey == '112' && (prefKey == '' || prefKey == undefined || prefKey == null)) {
      return true; //日本かつ都道府県なし
    } else {
      return false;
    }
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

    const expectedColumnCount = 34; // 期待する列数
    if (row.length !== expectedColumnCount) {
      // resultは無効データとし、各項目は-とする
      return {
        id: index,
        checked: false,
        result: '無効データ',
        userId: { value: '-', isError: true },
        volunteerName: { value: '-', isError: true },
        dateOfBirth: { value: '-', isError: true },
        sexId: { key: '-', value: '-', isError: true },
        residenceCountryId: { key: '-', value: '-', isError: true },
        residencePrefectureId: { key: '-', value: '-', isError: true },
        mailaddress: { value: '-', isError: true },
        telephoneNumber: { value: '-', isError: true },
        clothesSizeId: { key: '-', value: '-', isError: true },
        disTypeId1: { key: '-', value: '-', isError: true },
        disTypeId2: { key: '-', value: '-', isError: true },
        disTypeId3: { key: '-', value: '-', isError: true },
        qualId1: { key: '-', value: '-', isError: true },
        qualId2: { key: '-', value: '-', isError: true },
        qualId3: { key: '-', value: '-', isError: true },
        qualId4: { key: '-', value: '-', isError: true },
        qualId5: { key: '-', value: '-', isError: true },
        langId1: { key: '-', value: '-', isError: true },
        langProId1: { key: '-', value: '-', isError: true },
        langId2: { key: '-', value: '-', isError: true },
        langProId2: { key: '-', value: '-', isError: true },
        langId3: { key: '-', value: '-', isError: true },
        langProId3: { key: '-', value: '-', isError: true },
        dayOfWeek1: { value: '-', isError: true },
        dayOfWeek2: { value: '-', isError: true },
        dayOfWeek3: { value: '-', isError: true },
        dayOfWeek4: { value: '-', isError: true },
        dayOfWeek5: { value: '-', isError: true },
        dayOfWeek6: { value: '-', isError: true },
        dayOfWeek7: { value: '-', isError: true },
        timeZone1: { value: '-', isError: true },
        timeZone2: { value: '-', isError: true },
        timeZone3: { value: '-', isError: true },
        timeZone4: { value: '-', isError: true },
      };
    } else {
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
        sexId: {
          key: row[3],
          value: sex.find((item) => item.id === Number(row[3]))?.name || row[3],
          isError: validateRequired(row[3])
            ? true
            : validateNumber(row[3], 2) ||
              sex.filter((item) => item.id === Number(row[3])).length !== 1,
        },
        // 必須項目
        residenceCountryId: {
          key: row[4],
          value: country.find((item) => item.id === Number(row[4]))?.name || row[4],
          isError: validateRequired(row[4])
            ? true
            : validateNumber(row[4], 3) ||
              country.filter((item) => item.id === Number(row[4])).length !== 1,
        },
        // 必須項目
        // residencePrefectureId: { //20240411
        //   key: row[5],
        //   value: prefecture.find((item) => item.id === Number(row[5]))?.name || row[5],
        //   isError: validateCountryIsNotJapan(row[4])
        //     ? false
        //     : validateRequired(row[5])
        //       ? true
        //       : validateNumber(row[5], 2) ||
        //         prefecture.filter((item) => item.id === Number(row[5])).length !== 1,
        // },
        residencePrefectureId: {
          key: row[5],
          value: prefecture.find((item) => item.id === Number(row[5]))?.name || row[5],
          isError: validateCountryIsNotJapanAndPref(row[4], row[5])
            ? true
            : validateNumber(row[5], 2) ||
              (row[4] == '112' &&
                prefecture.filter((item) => item.id === Number(row[5])).length !== 1),
        },
        mailaddress: {
          value: row[6],
          isError: !validateRequired(row[6]) && validateEmailFormat(row[6]),
        },
        telephoneNumber: {
          value: row[7],
          isError: !validateRequired(row[7]) && validateNumber(row[7], 15),
        },
        // 必須項目
        clothesSizeId: {
          key: row[8],
          value: clothesSize.find((item) => item.id === Number(row[8]))?.name || row[8],
          isError: validateRequired(row[8])
            ? true
            : validateNumber(row[8], 1) ||
              clothesSize.filter((item) => item.id === Number(row[8])).length !== 1,
        },
        disTypeId1: {
          key: row[9],
          value: row[9] === '1' ? '◯' : '',
          isError: !validateRequired(row[9]) && validateZeroOrOne(row[9]),
        },
        disTypeId2: {
          key: row[10],
          value: row[10] === '1' ? '◯' : '',
          isError: !validateRequired(row[10]) && validateZeroOrOne(row[10]),
        },
        disTypeId3: {
          key: row[11],
          value: row[11] === '1' ? '◯' : '',
          isError: !validateRequired(row[11]) && validateZeroOrOne(row[11]),
        },
        qualId1: {
          key: row[12],
          value: qualHold.find((item) => item.id === Number(row[12]))?.name || row[12],
          isError:
            !validateRequired(row[12]) &&
            (validateNumber(row[12], 3) ||
              qualHold.filter((item) => item.id === Number(row[12])).length !== 1),
        },
        qualId2: {
          key: row[13],
          value: qualHold.find((item) => item.id === Number(row[13]))?.name || row[13],
          isError:
            !validateRequired(row[13]) &&
            (validateNumber(row[13], 3) ||
              qualHold.filter((item) => item.id === Number(row[13])).length !== 1),
        },
        qualId3: {
          key: row[14],
          value: qualHold.find((item) => item.id === Number(row[14]))?.name || row[14],
          isError:
            !validateRequired(row[14]) &&
            (validateNumber(row[14], 3) ||
              qualHold.filter((item) => item.id === Number(row[14])).length !== 1),
        },
        qualId4: {
          key: row[15],
          value: qualHold.find((item) => item.id === Number(row[15]))?.name,
          isError:
            !validateRequired(row[15]) &&
            (validateNumber(row[15], 3) ||
              qualHold.filter((item) => item.id === Number(row[15])).length !== 1),
        },
        qualId5: {
          key: row[16],
          value: qualHold.find((item) => item.id === Number(row[16]))?.name,
          isError:
            !validateRequired(row[16]) &&
            (validateNumber(row[16], 3) ||
              qualHold.filter((item) => item.id === Number(row[16])).length !== 1),
        },
        langId1: {
          key: row[17],
          value: language.find((item) => item.id === Number(row[17]))?.name,
          isError:
            !validateRequired(row[17]) &&
            (validateNumber(row[17], 3) ||
              language.filter((item) => item.id === Number(row[17])).length !== 1),
        },
        langProId1: {
          key: row[18],
          value: languageLevel.find((item) => item.id === Number(row[18]))?.name,
          isError:
            !validateRequired(row[18]) &&
            (validateNumber(row[18], 3) ||
              languageLevel.filter((item) => item.id === Number(row[18])).length !== 1),
        },
        langId2: {
          key: row[19],
          value: language.find((item) => item.id === Number(row[19]))?.name,
          isError:
            !validateRequired(row[19]) &&
            (validateNumber(row[19], 3) ||
              language.filter((item) => item.id === Number(row[19])).length !== 1),
        },
        langProId2: {
          key: row[20],
          value: languageLevel.find((item) => item.id === Number(row[20]))?.name,
          isError:
            !validateRequired(row[20]) &&
            (validateNumber(row[20], 3) ||
              languageLevel.filter((item) => item.id === Number(row[20])).length !== 1),
        },
        langId3: {
          key: row[21],
          value: language.find((item) => item.id === Number(row[21]))?.name,
          isError:
            !validateRequired(row[21]) &&
            (validateNumber(row[21], 3) ||
              language.filter((item) => item.id === Number(row[21])).length !== 1),
        },
        langProId3: {
          key: row[22],
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
    }
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
        : // 氏名の形式(全半角文字50文字以内であることを確認)
          (validateRequired(row[0]) ? true : validateNumber(row[0], 7)) ||
            // 生年月日日付の形式かどうかを判定する
            (validateRequired(row[1]) ? true : validateVolunteerName(row[1])) ||
            // 性別の形式かどうかを判定する
            (validateRequired(row[2]) ? true : validateYmdFormat(row[2])) ||
            // 居住国の形式かどうかを判定する
            (validateRequired(row[4])
              ? true
              : validateNumber(row[4], 3) ||
                country.filter((item) => item.id === Number(row[4])).length !== 1) ||
            // 居住都道府県の形式かどうかを判定する
            // 居住国が日本=112の時のみ、居住都道府県の形式をチェックする
            // (validateCountryIsNotJapan(row[4])
            //   ? false
            //   : validateRequired(row[5])
            //     ? true
            //     : validateNumber(row[5], 2) ||
            //       prefecture.filter((item) => item.id === Number(row[5])).length !== 1) ||
            (validateCountryIsNotJapanAndPref(row[4], row[5])
              ? true
              : validateNumber(row[5], 2) ||
                (row[4] == '112' &&
                  prefecture.filter((item) => item.id === Number(row[5])).length !== 1)) ||
            // 性別の形式かどうかを判定する
            (validateRequired(row[3])
              ? true
              : validateNumber(row[3], 2) ||
                sex.filter((item) => item.id === Number(row[3])).length !== 1) ||
            // メールアドレスの形式かどうかを判定する
            (validateRequired(row[6]) ? false : validateEmailFormat(row[6])) ||
            // 電話番号の形式かどうかを判定する
            (validateRequired(row[7]) ? false : validateNumber(row[7], 15)) ||
            // 服サイズの形式かどうかを判定する
            (validateRequired(row[8])
              ? true
              : validateNumber(row[8], 1) ||
                clothesSize.filter((item) => item.id === Number(row[8])).length !== 1) ||
            // PR1の形式かどうかを判定する
            (validateRequired(row[9]) ? false : validateZeroOrOne(row[9])) ||
            // PR2の形式かどうかを判定する
            (validateRequired(row[10]) ? false : validateZeroOrOne(row[10])) ||
            // PR3の形式かどうかを判定する
            (validateRequired(row[11]) ? false : validateZeroOrOne(row[11])) ||
            // 保有資格1の形式かどうかを判定する
            (validateRequired(row[12])
              ? false
              : validateNumber(row[12], 3) ||
                qualHold.filter((item) => item.id === Number(row[12])).length !== 1) ||
            // 保有資格2の形式かどうかを判定する
            (validateRequired(row[13])
              ? false
              : validateNumber(row[13], 3) ||
                qualHold.filter((item) => item.id === Number(row[13])).length !== 1) ||
            // 保有資格3の形式かどうかを判定する
            (validateRequired(row[14])
              ? false
              : validateNumber(row[14], 3) ||
                qualHold.filter((item) => item.id === Number(row[14])).length !== 1) ||
            // 保有資格4の形式かどうかを判定する
            (validateRequired(row[15])
              ? false
              : validateNumber(row[15], 3) ||
                qualHold.filter((item) => item.id === Number(row[15])).length !== 1) ||
            // 保有資格5の形式かどうかを判定する
            (validateRequired(row[16])
              ? false
              : validateNumber(row[16], 3) ||
                qualHold.filter((item) => item.id === Number(row[16])).length !== 1) ||
            // 使用言語1の形式かどうかを判定する
            (validateRequired(row[17])
              ? false
              : validateNumber(row[17], 3) ||
                language.filter((item) => item.id === Number(row[17])).length !== 1) ||
            // 使用言語1のレベルの形式かどうかを判定する
            (validateRequired(row[18])
              ? false
              : validateNumber(row[18], 3) ||
                languageLevel.filter((item) => item.id === Number(row[18])).length !== 1) ||
            // 使用言語2の形式かどうかを判定する
            (validateRequired(row[19])
              ? false
              : validateNumber(row[19], 3) ||
                language.filter((item) => item.id === Number(row[19])).length !== 1) ||
            // 使用言語2のレベルの形式かどうかを判定する
            (validateRequired(row[20])
              ? false
              : validateNumber(row[20], 3) ||
                languageLevel.filter((item) => item.id === Number(row[20])).length !== 1) ||
            // 使用言語3の形式かどうかを判定する
            (validateRequired(row[21])
              ? false
              : validateNumber(row[21], 3) ||
                language.filter((item) => item.id === Number(row[21])).length !== 1) ||
            // 使用言語3のレベルの形式かどうかを判定する
            (validateRequired(row[22])
              ? false
              : validateNumber(row[22], 3) ||
                languageLevel.filter((item) => item.id === Number(row[22])).length !== 1) ||
            // 曜日1の形式かどうかを判定する
            (validateRequired(row[23]) ? false : validateZeroOrOne(row[23])) ||
            // 曜日2の形式かどうかを判定する
            (validateRequired(row[24]) ? false : validateZeroOrOne(row[24])) ||
            // 曜日3の形式かどうかを判定する
            (validateRequired(row[25]) ? false : validateZeroOrOne(row[25])) ||
            // 曜日4の形式かどうかを判定する
            (validateRequired(row[26]) ? false : validateZeroOrOne(row[26])) ||
            // 曜日5の形式かどうかを判定する
            (validateRequired(row[27]) ? false : validateZeroOrOne(row[27])) ||
            // 曜日6の形式かどうかを判定する
            (validateRequired(row[28]) ? false : validateZeroOrOne(row[28])) ||
            // 曜日7の形式かどうかを判定する
            (validateRequired(row[29]) ? false : validateZeroOrOne(row[29])) ||
            // 時間帯1の形式かどうかを判定する
            (validateRequired(row[30]) ? false : validateZeroOrOne(row[30])) ||
            // 時間帯2の形式かどうかを判定する
            (validateRequired(row[31]) ? false : validateZeroOrOne(row[31])) ||
            // 時間帯3の形式かどうかを判定する
            (validateRequired(row[32]) ? false : validateZeroOrOne(row[32])) ||
            // 時間帯4の形式かどうかを判定する
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

  //読み込むボタン押下時 20240228
  const sendCsvData = async () => {
    const specifiedHeader =
      'ユーザーID,氏名,生年月日,性別,居住地（国）,居住地（都道府県）,メールアドレス,電話番号,服のサイズ,PR1,PR2,PR3,保有資格1,保有資格2,保有資格3,保有資格4,保有資格5,言語1,言語1語学力,言語2,言語2語学力,言語3,言語3語学力,日曜日,月曜日,火曜日,水曜日,木曜日,金曜日,土曜日,早朝,午前,午後,夜'; // 指定のヘッダー文字列
    const header = csvFileData?.content?.[0]?.join(','); // 1行目を,で結合
    const isHeaderMatch = header === specifiedHeader; // ヘッダーが指定の文字列と一致するか確認

    var array = Array() as CsvData[];
    Promise.all(
      // EOF（末尾の改行）対策でフィルターを行う
      csvFileData.content
        ?.filter(function (x) {
          // 1列以上のデータを抽出. 空行を除外するが、何らかの文字が入っている場合は抽出する
          return x.length > 0 && x.some((y) => y.length > 0);
        })
        .slice(isHeaderMatch ? 1 : 0) // ヘッダー行が一致する場合は1行目をスキップ
        .map((row, index) => getJsonRow(row, index)),
    ).then((results) => {
      array = results as CsvData[];
    });
    const csrf = () => axios.get('/sanctum/csrf-cookie');
    await csrf();
    await axios
      .post('/sendVolunteerCsvData', array)
      .then((res) => {
        var contentData = res.data.result as CsvData[];

        setActivationFlg(true);
        if (dialogDisplayFlg) {
          if (
            !window.confirm('読み込み結果に表示されているデータはクリアされます。よろしいですか？')
          ) {
            setActivationFlg(false);
            return;
          }
        }
        //console.log(contentData);
        setCsvData(contentData as CsvData[]);
        setDialogDisplayFlg(true);
        setActivationFlg(false);
        setVisibilityFlg(true); //CSVテーブルの表示切替フラグ 20240406
        setDialogDisplayFlg(true);
        setDisplayLinkButtonFlg(true);
        performValidation();
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  //登録ボタン押下時 20240307
  const registerCsvData = async () => {
    const csrf = () => axios.get('/sanctum/csrf-cookie');
    await csrf();
    //console.log(csvData);
    await axios
      .post('/registerVolunteerCsvData', csvData)
      .then((res) => {
        //console.log('res.data');
        //console.log(res.data);
        // router.push('/tournamentSearch'); // 20240222
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const csvDownloadProps = {
    header: [
      { label: 'ユーザーID', key: 'userId' },
      { label: '氏名', key: 'volunteerName' },
      { label: '生年月日', key: 'dateOfBirth' },
      { label: '性別', key: 'sexId' },
      { label: '居住地（国）', key: 'residenceCountryId' },
      { label: '居住地（都道府県）', key: 'residencePrefectureId' },
      { label: 'メールアドレス', key: 'mailaddress' },
      { label: '電話番号', key: 'telephoneNumber' },
      { label: '服のサイズ', key: 'clothesSizeId' },
      { label: 'PR1', key: 'disTypeId1' },
      { label: 'PR2', key: 'disTypeId2' },
      { label: 'PR3', key: 'disTypeId3' },
      { label: '保有資格1', key: 'qualId1' },
      { label: '保有資格2', key: 'qualId2' },
      { label: '保有資格3', key: 'qualId3' },
      { label: '保有資格4', key: 'qualId4' },
      { label: '保有資格5', key: 'qualId5' },
      { label: '言語1', key: 'langId1' },
      { label: '言語1語学力', key: 'langProId1' },
      { label: '言語2', key: 'langId2' },
      { label: '言語2語学力', key: 'langProId2' },
      { label: '言語3', key: 'langId3' },
      { label: '言語3語学力', key: 'langProId3' },
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
    data: [{}],
    filename: 'ボランティア一括登録.csv',
    label: 'CSVフォーマット出力',
  } as CsvDownloadProps;

  return (
    validFlag && (
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
              visibilityFlg={visibilityFlg}
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
                onClick={async () => {
                  if (csvData.find((row) => row.checked)?.id === undefined) {
                    window.alert('1件以上選択してください。');
                    return;
                  }
                  if (window.confirm('連携を実施しますか？')) {
                    await registerCsvData(); //バックエンド側にデータを送信 20240307
                    setActivationFlg(true);
                    setCsvData([]);
                    setCsvFileData({ content: [], isSet: false });
                    fileUploaderRef?.current?.clearFile();
                    window.alert('連携を完了しました。');
                    setActivationFlg(false);
                    setDialogDisplayFlg(false);
                    setDisplayLinkButtonFlg(false);
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
    )
  );
}
