// ボランティア一括登録
'use client';

import {
  canRegisterText,
  CsvDownloadProps,
  CsvTableRow,
  CsvUploadProps,
  FileHandler,
  MasterData,
} from '@/app/(Pages)/(App)/(Volunteer)/volunteerBulkRegister/shared/csv';
import { CustomButton, CustomTitle, ErrorBox } from '@/app/components';
import { JAPAN_COUNTRY_ID } from '@/app/constants';
import axios from '@/app/lib/axios';
import {
  ClothesSize,
  Country,
  Language,
  LanguageProficiency,
  Prefecture,
  Qualification,
  Sex,
  UserResponse,
} from '@/app/types';
import Validator from '@/app/utils/validator';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import CsvHandler from './CsvHandler';
import CsvTable from './CsvTable';

export default function VolunteerBulkRegister() {
  const router = useRouter();
  const fileUploaderRef = useRef<FileHandler>(null);

  const [csvFileData, setCsvFileData] = useState<{
    content: Array<Array<string>>;
    isSet: boolean;
  }>({ content: [], isSet: false });
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const [activationFlg, setActivationFlg] = useState(false);
  const [dialogDisplayFlg, setDialogDisplayFlg] = useState(false);
  const [displayLinkButtonFlg, setDisplayLinkButtonFlg] = useState(false);
  const [csvData, setCsvData] = useState<CsvTableRow[]>([]);
  const [csvFileErrorMessage, setCsvFileErrorMessage] = useState<string[]>([]);
  const [country, setCountry] = useState<MasterData[]>([]);
  const [prefecture, setPrefecture] = useState<MasterData[]>([]);
  const [sex, setSex] = useState<MasterData[]>([]);
  const [clothesSize, setClothesSize] = useState<MasterData[]>([]);
  const [qualHold, setQualHold] = useState<MasterData[]>([]);
  const [language, setLanguage] = useState<MasterData[]>([]);
  const [languageLevel, setLanguageLevel] = useState<MasterData[]>([]);
  const [visibilityFlg, setVisibilityFlg] = useState(false); //CSVテーブルの表示切替フラグ
  const [validFlag, setValidFlag] = useState(false); //URL直打ち対策（ユーザ種別が不正なユーザが遷移できないようにする）
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CSVファイルのアップロードを処理する関数
  const handleCsvUpload = (newCsvData: { content: Array<Array<string>>; isSet: boolean }) => {
    setCsvFileData(newCsvData);
  };

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
            setValidFlag(true); //URL直打ち対策（ユーザ種別が不正なユーザが遷移できないようにする）
          } else {
            router.push('/volunteerSearch');
          }
        } else {
          router.push('/volunteerSearch');
        }
      } catch (error: any) {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [
          countryResponse,
          prefectureResponse,
          sexResponse,
          clothesSizeMaster,
          qualHold,
          lang,
          langLevel,
        ] = await Promise.all([
          axios.get<Country[]>('api/getCountries'),
          axios.get<Prefecture[]>('api/getPrefectures'),
          axios.get<Sex[]>('api/getSexList'),
          axios.get<ClothesSize[]>('api/getClothesSize'),
          axios.get<Qualification[]>('api/getQualifications'),
          axios.get<Language[]>('api/getLanguages'),
          axios.get<LanguageProficiency[]>('api/getLanguageProficiency'),
        ]);

        const countryList = countryResponse.data.map(({ country_id, country_name }) => ({
          id: country_id,
          name: country_name,
        }));
        setCountry(countryList);
        const stateList = prefectureResponse.data.map(({ pref_id, pref_name }) => ({
          id: pref_id,
          name: pref_name,
        }));
        setPrefecture(stateList);
        // 性別マスタ
        const sexList = sexResponse.data.map(({ sex_id, sex }) => ({ id: sex_id, name: sex }));
        setSex(sexList);
        // 服サイズマスタ
        const clothesSizeMasterList = clothesSizeMaster.data.map(
          ({ clothes_size_id, clothes_size }) => ({ id: clothes_size_id, name: clothes_size }),
        );
        setClothesSize(clothesSizeMasterList);
        const qualHoldList = qualHold.data.map(({ qual_id, qual_name }) => ({
          id: qual_id,
          name: qual_name,
        }));
        setQualHold(qualHoldList);
        const langList = lang.data.map(({ lang_id, lang_name }) => ({
          id: lang_id,
          name: lang_name,
        }));
        setLanguage(langList);
        const langLevelList = langLevel.data.map(({ lang_pro_id, lang_pro_name }) => ({
          id: lang_pro_id,
          name: lang_pro_name,
        }));
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

  //居住地のバリデーションチェックで日本以外かつ都道府県ありをチェックできるように条件を修正 20240412
  const validateCountryIsNotJapanAndPref = (cntKey: string, prefKey: string) => {
    if (cntKey != `${JAPAN_COUNTRY_ID}` && prefKey != '') {
      return true; //日本以外かつ都道府県あり
    } else if (cntKey == `${JAPAN_COUNTRY_ID}` && !prefKey) {
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
  const getJsonRow = (row: Array<string>, index: number): CsvTableRow => {
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
        userId: { value: '-', error: false },
        volunteerName: { value: '-', error: false },
        dateOfBirth: { value: '-', error: false },
        sexId: { key: '-', value: '-', error: false },
        residenceCountryId: { key: '-', value: '-', error: false },
        residencePrefectureId: { key: '-', value: '-', error: false },
        mailaddress: { value: '-', error: false },
        telephoneNumber: { value: '-', error: false },
        clothesSizeId: { key: '-', value: '-', error: false },
        disTypeId1: { key: '-', value: '-', error: false },
        disTypeId2: { key: '-', value: '-', error: false },
        disTypeId3: { key: '-', value: '-', error: false },
        qualId1: { key: '-', value: '-', error: false },
        qualId2: { key: '-', value: '-', error: false },
        qualId3: { key: '-', value: '-', error: false },
        qualId4: { key: '-', value: '-', error: false },
        qualId5: { key: '-', value: '-', error: false },
        langId1: { key: '-', value: '-', error: false },
        langProId1: { key: '-', value: '-', error: false },
        langId2: { key: '-', value: '-', error: false },
        langProId2: { key: '-', value: '-', error: false },
        langId3: { key: '-', value: '-', error: false },
        langProId3: { key: '-', value: '-', error: false },
        dayOfWeek1: { value: '-', error: false },
        dayOfWeek2: { value: '-', error: false },
        dayOfWeek3: { value: '-', error: false },
        dayOfWeek4: { value: '-', error: false },
        dayOfWeek5: { value: '-', error: false },
        dayOfWeek6: { value: '-', error: false },
        dayOfWeek7: { value: '-', error: false },
        timeZone1: { value: '-', error: false },
        timeZone2: { value: '-', error: false },
        timeZone3: { value: '-', error: false },
        timeZone4: { value: '-', error: false },
      };
    } else {
      const foundSex = sex.find((item) => item.id === Number(row[3]));
      const foundCountry = country.find((item) => item.id === Number(row[4]));
      const foundPref = prefecture.find((item) => item.id === Number(row[5]));
      const foundClothesSize = clothesSize.find((item) => item.id === Number(row[8]));

      const foundLang1 = language.find((item) => item.id === Number(row[17]));
      const foundLangPro1 = languageLevel.find((item) => item.id === Number(row[18]));
      const foundLang2 = language.find((item) => item.id === Number(row[19]));
      const foundLangPro2 = languageLevel.find((item) => item.id === Number(row[20]));
      const foundLang3 = language.find((item) => item.id === Number(row[21]));
      const foundLangPro3 = languageLevel.find((item) => item.id === Number(row[22]));

      const foundQual1 = qualHold.find((item) => item.id === Number(row[12]));
      const foundQual2 = qualHold.find((item) => item.id === Number(row[13]));
      const foundQual3 = qualHold.find((item) => item.id === Number(row[14]));
      const foundQual4 = qualHold.find((item) => item.id === Number(row[15]));
      const foundQual5 = qualHold.find((item) => item.id === Number(row[16]));

      const userIdError = validateRequired(row[0]) ? 'ユーザーIDは必須項目です。' : false;
      const volunteerNameError =
        validateRequired(row[1]) || validateVolunteerName(row[1]) ? '氏名は必須項目です。' : false;
      const dateOfBirthError =
        validateRequired(row[2]) || validateYmdFormat(row[2]) ? '生年月日は必須項目です。' : false;
      const sexIdError = validateRequired(row[3]) || !foundSex ? '性別は必須項目です。' : false;
      const residenceCountryIdError =
        validateRequired(row[4]) || !foundCountry ? '居住国は必須項目です。' : false;
      const residencePrefectureIdError =
        validateCountryIsNotJapanAndPref(row[4], row[5]) ||
        (row[4] == `${JAPAN_COUNTRY_ID}` && !foundPref)
          ? '居住都道府県は必須項目です。'
          : false;
      const mailaddressError =
        !validateRequired(row[6]) && validateEmailFormat(row[6])
          ? 'メールアドレスの形式が正しくありません。'
          : false;
      const telephoneNumberError =
        !validateRequired(row[7]) && validateNumber(row[7], 15)
          ? '電話番号の形式が正しくありません。'
          : false;
      const clothesSizeIdError =
        validateRequired(row[8]) || !foundClothesSize ? '服サイズは必須項目です。' : false;

      const disTypeId1Error =
        !validateRequired(row[9]) && validateZeroOrOne(row[9])
          ? 'PR1は0もしくは1で記入してください。'
          : false;
      const disTypeId2Error =
        !validateRequired(row[10]) && validateZeroOrOne(row[10])
          ? 'PR2は0もしくは1で記入してください。'
          : false;
      const disTypeId3Error =
        !validateRequired(row[11]) && validateZeroOrOne(row[11])
          ? 'PR3は0もしくは1で記入してください。'
          : false;

      const qualId1Error =
        !validateRequired(row[12]) && !foundQual1 ? '資格1が不正な値です。' : false;
      const qualId2Error =
        !validateRequired(row[13]) && !foundQual2 ? '資格2が不正な値です。' : false;
      const qualId3Error =
        !validateRequired(row[14]) && !foundQual3 ? '資格3が不正な値です。' : false;
      const qualId4Error =
        !validateRequired(row[15]) && !foundQual4 ? '資格4が不正な値です。' : false;
      const qualId5Error =
        !validateRequired(row[16]) && !foundQual5 ? '資格5が不正な値です。' : false;

      const langId1Error =
        !validateRequired(row[17]) && !foundLang1 ? '言語1が不正な値です。' : false;
      const langProId1Error =
        !validateRequired(row[18]) && !foundLangPro1 ? '言語1のレベルが不正な値です。' : false;
      const langId2Error =
        !validateRequired(row[19]) && !foundLang2 ? '言語2が不正な値です。' : false;
      const langProId2Error =
        !validateRequired(row[20]) && !foundLangPro2 ? '言語2のレベルが不正な値です。' : false;
      const langId3Error =
        !validateRequired(row[21]) && !foundLang3 ? '言語3が不正な値です。' : false;
      const langProId3Error =
        !validateRequired(row[22]) && !foundLangPro3 ? '言語3のレベルが不正な値です。' : false;

      const dayOfWeek1Error =
        !validateRequired(row[23]) && validateZeroOrOne(row[23])
          ? '日は0もしくは1で記入してください。'
          : false;
      const dayOfWeek2Error =
        !validateRequired(row[24]) && validateZeroOrOne(row[24])
          ? '月は0もしくは1で記入してください。'
          : false;
      const dayOfWeek3Error =
        !validateRequired(row[25]) && validateZeroOrOne(row[25])
          ? '火は0もしくは1で記入してください。'
          : false;
      const dayOfWeek4Error =
        !validateRequired(row[26]) && validateZeroOrOne(row[26])
          ? '水は0もしくは1で記入してください。'
          : false;
      const dayOfWeek5Error =
        !validateRequired(row[27]) && validateZeroOrOne(row[27])
          ? '木は0もしくは1で記入してください。'
          : false;
      const dayOfWeek6Error =
        !validateRequired(row[28]) && validateZeroOrOne(row[28])
          ? '金は0もしくは1で記入してください。'
          : false;
      const dayOfWeek7Error =
        !validateRequired(row[29]) && validateZeroOrOne(row[29])
          ? '土は0もしくは1で記入してください。'
          : false;

      const timeZone1Error =
        !validateRequired(row[30]) && validateZeroOrOne(row[30])
          ? '早朝は0もしくは1で記入してください。'
          : false;
      const timeZone2Error =
        !validateRequired(row[31]) && validateZeroOrOne(row[31])
          ? '午前は0もしくは1で記入してください。'
          : false;
      const timeZone3Error =
        !validateRequired(row[32]) && validateZeroOrOne(row[32])
          ? '午後は0もしくは1で記入してください。'
          : false;
      const timeZone4Error =
        !validateRequired(row[33]) && validateZeroOrOne(row[33])
          ? '夜は0もしくは1で記入してください。'
          : false;

      const hasError = [
        userIdError,
        volunteerNameError,
        dateOfBirthError,
        sexIdError,
        residenceCountryIdError,
        residencePrefectureIdError,
        mailaddressError,
        telephoneNumberError,
        clothesSizeIdError,
        disTypeId1Error,
        disTypeId2Error,
        disTypeId3Error,
        qualId1Error,
        qualId2Error,
        qualId3Error,
        qualId4Error,
        qualId5Error,
        langId1Error,
        langProId1Error,
        langId2Error,
        langProId2Error,
        langId3Error,
        langProId3Error,
        dayOfWeek1Error,
        dayOfWeek2Error,
        dayOfWeek3Error,
        dayOfWeek4Error,
        dayOfWeek5Error,
        dayOfWeek6Error,
        dayOfWeek7Error,
        timeZone1Error,
        timeZone2Error,
        timeZone3Error,
        timeZone4Error,
      ].some((error) => error !== false);

      return {
        id: index,
        checked: !hasError,
        result: hasError ? '登録不可データ' : canRegisterText,
        // 必須項目
        userId: {
          value: row[0],
          error: userIdError,
        },
        // 必須項目
        volunteerName: {
          value: row[1],
          error: volunteerNameError,
        },
        // 必須項目
        dateOfBirth: {
          value: row[2],
          error: dateOfBirthError,
        },
        // 必須項目
        sexId: {
          key: row[3],
          value: foundSex?.name || row[3],
          error: sexIdError,
        },
        // 必須項目
        residenceCountryId: {
          key: row[4],
          value: foundCountry?.name || row[4],
          error: residenceCountryIdError,
        },
        residencePrefectureId: {
          key: row[5],
          value: foundPref?.name || row[5],
          error: residencePrefectureIdError,
        },
        mailaddress: {
          value: row[6],
          error: mailaddressError,
        },
        telephoneNumber: {
          value: row[7],
          error: telephoneNumberError,
        },
        // 必須項目
        clothesSizeId: {
          key: row[8],
          value: foundClothesSize?.name || row[8],
          error: clothesSizeIdError,
        },
        disTypeId1: {
          key: row[9],
          value: row[9] === '1' ? '◯' : '',
          error: disTypeId1Error,
        },
        disTypeId2: {
          key: row[10],
          value: row[10] === '1' ? '◯' : '',
          error: disTypeId2Error,
        },
        disTypeId3: {
          key: row[11],
          value: row[11] === '1' ? '◯' : '',
          error: disTypeId3Error,
        },
        qualId1: {
          key: row[12],
          value: foundQual1?.name || row[12],
          error: qualId1Error,
        },
        qualId2: {
          key: row[13],
          value: foundQual2?.name || row[13],
          error: qualId2Error,
        },
        qualId3: {
          key: row[14],
          value: foundQual3?.name || row[14],
          error: qualId3Error,
        },
        qualId4: {
          key: row[15],
          value: foundQual4?.name || row[15],
          error: qualId4Error,
        },
        qualId5: {
          key: row[16],
          value: foundQual5?.name || row[16],
          error: qualId5Error,
        },
        langId1: {
          key: row[17],
          value: foundLang1?.name || row[17],
          error: langId1Error,
        },
        langProId1: {
          key: row[18],
          value: foundLangPro1?.name || row[18],
          error: langProId1Error,
        },
        langId2: {
          key: row[19],
          value: foundLang2?.name || row[19],
          error: langId2Error,
        },
        langProId2: {
          key: row[20],
          value: foundLangPro2?.name || row[20],
          error: langProId2Error,
        },
        langId3: {
          key: row[21],
          value: foundLang3?.name || row[21],
          error: langId3Error,
        },
        langProId3: {
          key: row[22],
          value: foundLangPro3?.name || row[22],
          error: langProId3Error,
        },
        dayOfWeek1: {
          value: row[23] === '1' ? '◯' : '',
          error: dayOfWeek1Error,
        },
        dayOfWeek2: {
          value: row[24] === '1' ? '◯' : '',
          error: dayOfWeek2Error,
        },
        dayOfWeek3: {
          value: row[25] === '1' ? '◯' : '',
          error: dayOfWeek3Error,
        },
        dayOfWeek4: {
          value: row[26] === '1' ? '◯' : '',
          error: dayOfWeek4Error,
        },
        dayOfWeek5: {
          value: row[27] === '1' ? '◯' : '',
          error: dayOfWeek5Error,
        },
        dayOfWeek6: {
          value: row[28] === '1' ? '◯' : '',
          error: dayOfWeek6Error,
        },
        dayOfWeek7: {
          value: row[29] === '1' ? '◯' : '',
          error: dayOfWeek7Error,
        },
        timeZone1: {
          value: row[30] === '1' ? '◯' : '',
          error: timeZone1Error,
        },
        timeZone2: {
          value: row[31] === '1' ? '◯' : '',
          error: timeZone2Error,
        },
        timeZone3: {
          value: row[32] === '1' ? '◯' : '',
          error: timeZone3Error,
        },
        timeZone4: {
          value: row[33] === '1' ? '◯' : '',
          error: timeZone4Error,
        },
      };
    }
  };

  // CSVアップロードのプロパティ
  const csvUploadProps: CsvUploadProps = {
    label: '読み込みCSVファイル',
    readonly: activationFlg,
    csvUpload: handleCsvUpload,
    resetActivationFlg: resetActivationFlg,
  };

  //読み込むボタン押下時 20240228
  const sendCsvData = async () => {
    const specifiedHeader =
      'ユーザーID,氏名,生年月日,性別,居住地（国）,居住地（都道府県）,メールアドレス,電話番号,服のサイズ,PR1,PR2,PR3,保有資格1,保有資格2,保有資格3,保有資格4,保有資格5,言語1,言語1語学力,言語2,言語2語学力,言語3,言語3語学力,日曜日,月曜日,火曜日,水曜日,木曜日,金曜日,土曜日,早朝,午前,午後,夜'; // 指定のヘッダー文字列
    const header = csvFileData?.content?.[0]?.join(','); // 1行目を,で結合
    const isHeaderMatch = header === specifiedHeader; // ヘッダーが指定の文字列と一致するか確認

    // EOF（末尾の改行）対策でフィルターを行う
    const sendData = csvFileData.content
      ?.filter((x) => {
        // 1列以上のデータを抽出. 空行を除外するが、何らかの文字が入っている場合は抽出する
        return x.length > 0 && x.some((y) => y.length > 0);
      })
      .slice(isHeaderMatch ? 1 : 0) // ヘッダー行が一致する場合は1行目をスキップ
      .map((row, index) => getJsonRow(row, index));

    const res = await axios.post<{ result: CsvTableRow[] }>('api/sendVolunteerCsvData', sendData);
    const contentData = res.data.result;
    setActivationFlg(true);
    if (dialogDisplayFlg) {
      if (!window.confirm('読み込み結果に表示されているデータはクリアされます。よろしいですか？')) {
        setActivationFlg(false);
        return;
      }
    }
    setCsvData(contentData);
    setDialogDisplayFlg(true);
    setActivationFlg(false);
    setVisibilityFlg(true); //CSVテーブルの表示切替フラグ 20240406
    setDialogDisplayFlg(true);
    setDisplayLinkButtonFlg(true);
    performValidation();
  };

  //登録ボタン押下時 20240307
  const registerCsvData = async () => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);

    try {
      await axios.post('api/registerVolunteerCsvData', csvData);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const csvDownloadProps: CsvDownloadProps = {
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
  };

  if (!validFlag) return null;

  return (
    <>
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
        </div>
      )}
      {/* エラーメッセージの表示 */}
      <p className='text-systemErrorText self-center'>{csvFileErrorMessage}</p>
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
          content={csvData}
          handleInputChange={handleInputChange}
          displayLinkButton={displayLinkButton}
          activationFlg={activationFlg}
          visibilityFlg={visibilityFlg}
        />
      </div>
      <div className='flex flex-col items-center justify-center gap-[8px] md:flex-row'>
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
    </>
  );
}
