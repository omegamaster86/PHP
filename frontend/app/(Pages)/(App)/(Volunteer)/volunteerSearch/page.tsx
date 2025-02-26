// 機能名: ボランティア検索
'use client';

import {
  CustomButton,
  CustomDatePicker,
  CustomDropdown,
  CustomTable,
  CustomTbody,
  CustomTd,
  CustomTextField,
  CustomTh,
  CustomThead,
  CustomTitle,
  CustomTr,
  ErrorBox,
  InputLabel,
  OriginalCheckbox,
} from '@/app/components/';
import { JAPAN_COUNTRY_CODE, JAPAN_COUNTRY_ID } from '@/app/constants';
import { useUserType } from '@/app/hooks/useUserType';
import axios from '@/app/lib/axios';
import {
  CountryResponse,
  DisTypeResponse,
  LangResponse,
  PrefectureResponse,
  QualHoldResponse,
  SexResponse,
  VolunteerResponse,
} from '@/app/types';
import Validator from '@/app/utils/validator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  MenuItem,
  Select,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';

// 検索条件
interface SearchCond {
  volunteer_id?: number; // ボランティアID
  volunteer_name?: string; // 氏名
  date_of_birth_start: string; // 生年月日
  date_of_birth_end: string; // 生年月日
  sex?: number; // 性別
  sexName?: string; // 性別
  residence_country?: number; // 居住地（国）
  residenceCountryName?: string; // 居住地（国）
  residence_prefecture?: number; // 居住地（都道府県）
  residencePrefectureName?: string; // 居住地（都道府県）
  qualHold?: [
    {
      id: number;
      name: string;
    }?,
  ]; // 保有資格
  othersQual?: string; // その他資格
  lang?: [
    {
      id: number;
      name: string;
      levelId: number;
      levelName: string;
    },
    {
      id: number;
      name: string;
      levelId: number;
      levelName: string;
    },
    {
      id: number;
      name: string;
      levelId: number;
      levelName: string;
    },
  ]; // 言語
  disType?: [
    {
      id: number;
      name: string;
    }?,
  ]; // 障碍タイプ
  dayOfWeek?: string; // 参加しやすい曜日
  timeZone?: string; // 参加しやすい時間帯
}

const OTHERS_QUAL_ID = 99; //保有資格 その他選択時

export default function VolunteerSearch() {
  const router = useRouter();

  useUserType({
    onSuccess: (userType) => {
      const hasAuthority =
        userType.isAdministrator || userType.isJara || userType.isPrefBoatOfficer;

      if (!hasAuthority) {
        router.replace('/mypage/top');
      }
    },
  });

  // 検索条件の初期値
  const initialSearchCond = () => {
    return {
      volunteer_id: undefined,
      volunteer_name: undefined,
      date_of_birth_start: '',
      date_of_birth_end: undefined,
      sex: undefined,
      sexName: '',
      residence_country: undefined,
      residenceCountryName: '',
      residence_prefecture: undefined,
      residencePrefectureName: '',
      qualHold: [] as { id: number; name: string }[],
      othersQual: '',
      lang: [] as { id: number; name: string; levelId: number; levelName: string }[],
      disType: [] as { id: number; name: string }[],
      dayOfWeek: '000000000000',
      timeZone: '00000000',
    } as unknown as SearchCond;
  };

  const [searchCond, setSearchCond] = useState<SearchCond>(initialSearchCond); // 検索条件
  const [searchResponse, setSearchResponse] = useState<VolunteerResponse[]>([]); // 検索結果
  const [sex, setSex] = useState<SexResponse[]>([]); // 性別マスタ
  const [qualHold, setQualHold] = useState<QualHoldResponse[]>([]); // 資格マスタ
  const [disType, setDisType] = useState<DisTypeResponse[]>([]); // 障碍タイプマスタ
  const [lang, setLang] = useState<LangResponse[]>([]); // 言語マスタ
  const [langLevel, setLangLevel] = useState<LangResponse[]>([]); // 言語レベルマスタ
  const [country, setCountry] = useState<CountryResponse[]>([]); // 国マスタ
  const [prefecture, setPrefecture] = useState<PrefectureResponse[]>([]); // 都道府県マスタ

  const [startDateExistsErrorMessages, setStartDateExistsErrorMessages] = useState<string[]>([]);
  const [endDateExistsErrorMessages, setEndDateExistsErrorMessages] = useState<string[]>([]);

  // ボランティアIDのソート用
  const [volunteerIdSortFlag, setVolunteerIdSortFlag] = useState(false);
  const volunteerIdSort = () => {
    if (volunteerIdSortFlag) {
      setVolunteerIdSortFlag(false);
      searchResponse.sort((a, b) => Number(a.volunteer_id) - Number(b.volunteer_id));
    } else {
      setVolunteerIdSortFlag(true);
      searchResponse.sort((a, b) => Number(b.volunteer_id) - Number(a.volunteer_id));
    }
  };
  //氏名のソート用
  const [volunteerNameSortFlag, setVolunteerNameSortFlag] = useState(false);
  const volunteerNameSort = () => {
    if (volunteerNameSortFlag) {
      setVolunteerNameSortFlag(false);
      searchResponse.sort((a, b) => ('' + a.volunteer_name).localeCompare(b.volunteer_name));
    } else {
      setVolunteerNameSortFlag(true);
      searchResponse.sort((a, b) => ('' + b.volunteer_name).localeCompare(a.volunteer_name));
    }
  };
  //居住地のソート用
  const [volunteerCountrySortFlag, setVolunteerCountrySortFlag] = useState(false);
  const volunteerCountrySort = () => {
    if (volunteerCountrySortFlag) {
      setVolunteerCountrySortFlag(false);
      searchResponse.sort((a, b) => {
        const aIsJapan = a.residence_country_code === JAPAN_COUNTRY_CODE;
        const bIsJapan = b.residence_country_code === JAPAN_COUNTRY_CODE;

        // 1. 日本以外の国を先にする
        if (!aIsJapan && bIsJapan) return -1;
        if (aIsJapan && !bIsJapan) return 1;

        // 2. 日本以外の国なら、国コードの昇順でソート
        if (!aIsJapan && !bIsJapan) {
          return (Number(a.residence_country_code) || 0) - (Number(b.residence_country_code) || 0);
        }

        // 3. 日本の都道府県の場合、JISコードの昇順でソート
        return (
          (Number(a.residence_prefecture_code_jis) || 0) -
          (Number(b.residence_prefecture_code_jis) || 0)
        );
      });
    } else {
      setVolunteerCountrySortFlag(true);
      searchResponse.sort((a, b) => {
        const aIsJapan = a.residence_country_code === JAPAN_COUNTRY_CODE;
        const bIsJapan = b.residence_country_code === JAPAN_COUNTRY_CODE;
        // 1. 日本を先にする
        if (aIsJapan && !bIsJapan) return -1;
        if (!aIsJapan && bIsJapan) return 1;

        // 2. 日本（JP）の場合、JISコードの降順でソート
        if (aIsJapan && bIsJapan) {
          return (
            (Number(b.residence_prefecture_code_jis) || 0) -
            (Number(a.residence_prefecture_code_jis) || 0)
          );
        }

        // 3. 日本以外の国の場合、国コードの降順でソート
        return (Number(b.residence_country_code) || 0) - (Number(a.residence_country_code) || 0);
      });
    }
  };
  //性別のソート用
  const [sexSortFlag, setSexSortFlag] = useState(false);
  const sexSort = () => {
    if (sexSortFlag) {
      setSexSortFlag(false);
      searchResponse.sort((a, b) => ('' + a.sex).localeCompare(b.sex));
    } else {
      setSexSortFlag(true);
      searchResponse.sort((a, b) => ('' + b.sex).localeCompare(a.sex));
    }
  };
  //年齢のソート用
  const [ageSortFlag, setAgeSortFlag] = useState(false);
  const ageSort = () => {
    if (ageSortFlag) {
      setAgeSortFlag(false);
      searchResponse.sort(
        (a, b) =>
          Number(calculateAgeFromBirthday(a.date_of_birth)) -
          Number(calculateAgeFromBirthday(b.date_of_birth)),
      );
    } else {
      setAgeSortFlag(true);
      searchResponse.sort(
        (a, b) =>
          Number(calculateAgeFromBirthday(b.date_of_birth)) -
          Number(calculateAgeFromBirthday(a.date_of_birth)),
      );
    }
  };
  //補助が可能な障碍タイプ （PR1）のソート用
  const [PR1SortFlag, setPR1SortFlag] = useState(false);
  const PR1Sort = () => {
    if (PR1SortFlag) {
      setPR1SortFlag(false);
      searchResponse.sort((a, b) => Number(a.dis_type_id?.[0]) - Number(b.dis_type_id?.[0]));
    } else {
      setPR1SortFlag(true);
      searchResponse.sort((a, b) => Number(b.dis_type_id?.[0]) - Number(a.dis_type_id?.[0]));
    }
  };
  //補助が可能な障碍タイプ （PR2）のソート用
  const [PR2SortFlag, setPR2SortFlag] = useState(false);
  const PR2Sort = () => {
    if (PR2SortFlag) {
      setPR2SortFlag(false);
      searchResponse.sort((a, b) => Number(a.dis_type_id?.[1]) - Number(b.dis_type_id?.[1]));
    } else {
      setPR2SortFlag(true);
      searchResponse.sort((a, b) => Number(b.dis_type_id?.[1]) - Number(a.dis_type_id?.[1]));
    }
  };
  //補助が可能な障碍タイプ （PR3）のソート用
  const [PR3SortFlag, setPR3SortFlag] = useState(false);
  const PR3Sort = () => {
    if (PR3SortFlag) {
      setPR3SortFlag(false);
      searchResponse.sort((a, b) => Number(a.dis_type_id?.[2]) - Number(b.dis_type_id?.[2]));
    } else {
      setPR3SortFlag(true);
      searchResponse.sort((a, b) => Number(b.dis_type_id?.[2]) - Number(a.dis_type_id?.[2]));
    }
  };

  /**
   * 年齢を計算する関数
   * @param birthday
   * @returns
   * @description
   * 年齢を計算する関数
   * 誕生日を引数にとり、現在の年齢を返す
   */
  const calculateAgeFromBirthday = (birthday: string) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * 日付をフォーマットする関数
   * @param dt
   * @returns
   * @description
   * 日付をフォーマットする関数
   * Date型を引数にとり、yyyy/MM/ddの形式で返す
   */
  const formatDate = (dt: Date) => {
    const y = dt.getFullYear();
    const m = ('00' + (dt.getMonth() + 1)).slice(-2);
    const d = ('00' + dt.getDate()).slice(-2);
    return y + '/' + m + '/' + d;
  };

  /**
   * 時間帯のチェックボックスの値を取得する関数
   * @param binaryString
   * @param index
   * @returns
   * @description
   * 時間帯のチェックボックスの値を取得する関数
   * チェックボックスの値は0と1の文字列で管理する
   */
  const getTimeZoneBool = (binaryString: string, index: number) => {
    if (binaryString == undefined) {
      return;
    }
    if (binaryString.length !== 8) {
      return;
    }
    if (binaryString[index] === '1') {
      return true;
    }
    return false;
  };

  /**
   * チェックボックスの値を取得する関数
   * @param binaryString
   * @param index
   * @returns
   * @description
   * チェックボックスの値を取得する関数
   * チェックボックスの値は0と1の文字列で管理する
   */
  const getBoolFromIndex = (binaryString: string, index: number) => {
    if (binaryString == undefined) {
      return;
    }
    if (binaryString.length <= index) {
      return;
    }
    if (binaryString[index] === '1') {
      return true;
    }
    return false;
  };

  /**
   * 障碍種別チェックボックスの値を変更する関数
   * @param nextBool チェックボックスの値
   * @param index チェックボックスのインデックス
   * @returns
   * @description
   * 障碍種別チェックボックスの値を変更する関数
   * チェックボックスの値は0と1の文字列で管理する
   */
  const handleDisTypeChange = (nextBool: boolean, index: number) => {
    let currentData = searchCond.disType;
    if (currentData === null || currentData === undefined) {
      currentData = [];
    }
    if (nextBool) {
      currentData.push({
        id: index,
        name: disType.find((item) => item.id === index)?.name || '',
      });
      setSearchCond((prevFormData) => ({
        ...prevFormData,
        disType: currentData,
      }));
    } else {
      setSearchCond((prevFormData) => ({
        ...prevFormData,
        disType: searchCond?.disType?.filter((item) => item?.id !== index) as [
          { id: number; name: string },
        ],
      }));
    }
  };

  /**
   * チェックボックスの値を変更する関数
   * @param name フォームの名前
   * @param boolString チェックボックスの値
   * @param index チェックボックスのインデックス
   * @returns
   * @description
   * チェックボックスの値を変更する関数
   * チェックボックスの値は0と1の文字列で管理する
   * 例：000000000000
   * 1文字目が日曜日のチェックボックスの値
   */
  const handleCheckboxChange = (name: string, boolString: string, index: number) => {
    let resultString = '';
    if (boolString == undefined) {
      return;
    }
    boolString.split('').map((item, i) => {
      if (i === index) {
        if (item === '1') {
          resultString += '0';
        } else {
          resultString += '1';
        }
      } else {
        resultString += item;
      }
    });
    setSearchCond((prevFormData) => ({
      ...prevFormData,
      [name]: resultString,
    }));
  };

  /**
   * フォームの値を変更する関数
   * @param name
   * @param value
   * @returns
   * @description
   * フォームの値を変更する関数
   * フォームの値は文字列で管理する
   */
  const handleInputChange = (name: string, value: string) => {
    setSearchCond((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  /**
   * 検索ボタン押下時の処理
   * @returns
   * @description
   * 検索ボタン押下時の処理
   * 検索条件を元にボランティアを検索する
   * 検索結果をstateにセットする
   */
  const handleSearch = async () => {
    const res = await axios.post<{ result: VolunteerResponse[] }>(
      'api/volunteerSearch',
      searchCond,
    );
    setSearchResponse(res.data.result);
  };

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sexResponse = await axios.get('api/getSexList');
        const sexList = sexResponse.data.map(
          ({ sex_id, sex }: { sex_id: number; sex: string }) => ({ id: sex_id, name: sex }),
        );
        setSex(sexList);

        // 障碍タイプマスタの取得
        const disType = await axios.get('api/getDisabilityType');
        const disTypeList = disType.data.map(
          ({ dis_type_id, dis_type_name }: { dis_type_id: number; dis_type_name: string }) => ({
            id: dis_type_id,
            name: dis_type_name,
          }),
        );
        setDisType(disTypeList);

        // 資格マスタの取得
        const qualHold = await axios.get('api/getQualifications');
        const qualHoldList = qualHold.data.map(
          ({ qual_id, qual_name }: { qual_id: number; qual_name: string }) => ({
            id: qual_id,
            name: qual_name,
          }),
        );
        setQualHold(qualHoldList);

        const lang = await axios.get('api/getLanguages');
        const langList = lang.data.map(
          ({ lang_id, lang_name }: { lang_id: number; lang_name: string }) => ({
            id: lang_id,
            name: lang_name,
          }),
        );
        setLang(langList);

        // 言語レベルマスタの取得
        const langLevel = await axios.get('api/getLanguageProficiency');
        const langLevelList = langLevel.data.map(
          ({ lang_pro_id, lang_pro_name }: { lang_pro_id: number; lang_pro_name: string }) => ({
            id: lang_pro_id,
            name: lang_pro_name,
          }),
        );
        setLangLevel(langLevelList);

        const countryResponse = await axios.get('api/getCountries');
        const countryList = countryResponse.data.map(
          ({ country_id, country_name }: { country_id: number; country_name: string }) => ({
            id: country_id,
            name: country_name,
          }),
        );
        setCountry(countryList);

        const prefectureResponse = await axios.get('api/getPrefectures');
        const stateList = prefectureResponse.data.map(
          ({ pref_id, pref_name }: { pref_id: number; pref_name: string }) => ({
            id: pref_id,
            name: pref_name,
          }),
        );
        setPrefecture(stateList);
      } catch (error) {
        //console.log(error);
      }
    };
    fetchData();
  }, []);

  // 検索条件のうち、資格情報の変更を監視
  useEffect(() => {
    if ((searchCond.qualHold?.length || 0) > 5) {
      alert('保有資格は5つまで選択できます。');
      setSearchCond((prevFormData) => ({
        ...prevFormData,
        qualHold: prevFormData.qualHold?.slice(0, 5) as [{ id: number; name: string }],
      }));
    }

    if (searchCond.qualHold?.find((item) => item?.id === OTHERS_QUAL_ID)) {
      setSearchCond((prevFormData) => ({
        ...prevFormData,
        othersQual: '',
      }));
    }
  }, [searchCond.qualHold]);

  return (
    <>
      <CustomTitle displayBack>ボランティア検索</CustomTitle>

      <ErrorBox errorText={[]} />
      <Accordion
        defaultExpanded
        className='w-full bg-thinContainerBg border-[1px] border-solid border-border rounded-md'
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel1-content'
          id='panel1-header'
        >
          <InputLabel label='検索条件' />
        </AccordionSummary>
        <AccordionDetails>
          <div className='flex flex-col gap-[20px]'>
            <div>
              {/* ボランティアID */}
              <CustomTextField
                type='number'
                label='ボランティアID'
                placeHolder='ボランティアID'
                displayHelp={false}
                isError={false}
                errorMessages={[]}
                value={searchCond.volunteer_id?.toString() || ''}
                onChange={(e) => handleInputChange('volunteer_id', e.target.value)}
                className='w-[310px]'
              />
            </div>
            {/* 氏名 */}
            <div className='flex flex-col justify-start gap-[8px]'>
              <CustomTextField
                label='氏名'
                placeHolder='氏名'
                displayHelp={false}
                isError={false}
                errorMessages={[]}
                value={searchCond.volunteer_name?.toString() || ''}
                onChange={(e) => {
                  handleInputChange('volunteer_name', e.target.value);
                }}
                className='w-[467px]'
              />
              <p className='text-small text-gray-400'>※部分一致</p>
            </div>
            <div className='flex flex-row justify-start gap-4'>
              {/* 開催開始年月日 */}
              <div className='flex flex-col justify-start'>
                <InputLabel label='生年月日' />
                <div
                  className='flex flex-row justify-start flex-wrap gap-4 mt-2'
                  style={{ width: '100%', height: '100%' }}
                >
                  <CustomDatePicker
                    id='date_of_birth_start'
                    selectedDate={searchCond.date_of_birth_start?.toString() || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      handleInputChange('date_of_birth_start', formatDate(e as unknown as Date));
                    }}
                    errorMessages={startDateExistsErrorMessages}
                    className='w-[210px] border-[1px] border-solid border-border rounded-md bg-white h-[56px]'
                    wrapperClassName=''
                  />
                  <p className='self-center text-small text-gray-400'>〜</p>
                  <CustomDatePicker
                    id='date_of_birth_end'
                    selectedDate={searchCond.date_of_birth_end?.toString() || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      handleInputChange('date_of_birth_end', formatDate(e as unknown as Date));
                    }}
                    errorMessages={endDateExistsErrorMessages}
                    className='w-[210px] border-[1px] border-solid border-border rounded-md bg-white h-[56px]'
                    wrapperClassName=''
                  />
                </div>
              </div>
              {/* 開催終了年月日 */}
              <div className='flex flex-col justify-start'></div>
            </div>
            {/* 性別 */}
            <div className='flex flex-col justify-start gap-[8px]'>
              <CustomDropdown
                id='sex'
                label='性別'
                isError={false}
                placeHolder='男性'
                value={searchCond.sex?.toString() || ''}
                onChange={(e) => {
                  handleInputChange('sex', e);
                  handleInputChange(
                    'sexName',
                    sex.find((item) => item.id === Number(e))?.name || '',
                  );
                }}
                options={sex.map((item) => ({ key: item.id, value: item.name }))}
              />
            </div>
            {/* 居住地（国） */}
            <div className='flex flex-row justify-start gap-[16px]'>
              <CustomDropdown
                id='residenceCountry'
                label='居住地'
                placeHolder='東京'
                isError={false}
                errorMessages={[]}
                value={searchCond.residence_country?.toString() || ''}
                onChange={(e) => {
                  handleInputChange('residence_country', e);
                }}
                options={country.map((item) => ({ key: item.id, value: item.name }))}
              />
              {/* 居住地（都道府県） */}
              {searchCond.residence_country === JAPAN_COUNTRY_ID && (
                <div className='flex flex-col justify-start gap-[8px]'>
                  <CustomDropdown
                    id='residencePrefecture'
                    label='都道府県'
                    className='w-[210px]'
                    isError={false}
                    errorMessages={[]}
                    value={searchCond.residence_prefecture?.toString() || ''}
                    onChange={(e) => {
                      handleInputChange('residence_prefecture', e);
                    }}
                    options={prefecture.map((item) => ({ key: item.id, value: item.name }))}
                  />
                </div>
              )}
            </div>
            {/* 保有資格 */}
            <div className='flex flex-col justify-start gap-[16px]'>
              <div className='flex flex-row flex-wrap sm:flex-nowrap justify-start gap-[16px]'>
                <div className='w-full'>
                  <InputLabel label='保有資格' />
                  <Select
                    id='qualHold'
                    multiple
                    className='self-end border-[0.1px] border-solid border-gray-50 rounded-md bg-white w-full max-w-[467px] my-1'
                    value={searchCond.qualHold?.map((item) => item?.id) || []}
                    onChange={(e) => {
                      const currentData = Array.isArray(e.target.value)
                        ? e.target.value.map((item) => ({
                            id: item,
                            name: qualHold.find((qualHold) => qualHold.id === item)?.name || '',
                          }))
                        : [];
                      setSearchCond((prevFormData) => ({
                        ...prevFormData,
                        qualHold: currentData as [{ id: number; name: string }],
                      }));
                    }}
                    renderValue={() => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {searchCond.qualHold?.map((value) =>
                          value?.id === 0 ? null : <Chip key={value?.id} label={value?.name} />,
                        )}
                      </Box>
                    )}
                  >
                    {qualHold
                      ? qualHold
                          .filter((item) => item.id !== undefined && item.name !== undefined)
                          .map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.name}
                            </MenuItem>
                          ))
                      : null}
                  </Select>
                  <p className='self-end text-small text-gray-400'>※複数選択可（5資格まで）</p>
                </div>
                {searchCond.qualHold?.find((item) => item?.id === OTHERS_QUAL_ID) && (
                  <CustomTextField
                    label='その他資格'
                    placeHolder='その他資格'
                    displayHelp={false}
                    isError={false}
                    errorMessages={[]}
                    value={searchCond.othersQual || ''}
                    onChange={(e) => handleInputChange('othersQual', e.target.value)}
                    className='w-[300px] self-end border-[0.5px] border-solid border-border rounded-md bg-white'
                  />
                )}
              </div>
            </div>
            {/* 言語 */}
            <div className='flex flex-col justify-start gap-[16px]'>
              <div className='flex flex-row justify-start gap-[16px]'>
                <CustomDropdown
                  id='lang1'
                  label='言語'
                  placeHolder='言語1'
                  className='w-[120px] sm:w-full max-w-[467px]'
                  isError={false}
                  errorMessages={[]}
                  value={searchCond?.lang?.[0]?.id?.toString() || ''}
                  onChange={(e) => {
                    setSearchCond((prevFormData) => ({
                      ...prevFormData,
                      lang: [
                        {
                          id: Number(e) || 0,
                          name: lang.find((item) => item.id === Number(e))?.name || '',
                          levelId: prevFormData.lang?.[0]?.levelId || 0,
                          levelName: prevFormData.lang?.[0]?.levelName || '未選択',
                        },
                        prevFormData.lang?.[1],
                        prevFormData.lang?.[2],
                      ] as SearchCond['lang'],
                    }));
                  }}
                  options={lang.map((item) => ({ key: item.id, value: item.name }))}
                />
                <CustomDropdown
                  id='言語レベル1'
                  label='言語レベル'
                  displayHelp={true}
                  toolTipText='A1（初心者）：<br>
                    自己紹介ができ、どこに住んでいるか、誰を知っているか、何を持っているかと言った個人的なことを聞き、こたえることができる。<br>
                    A2（初級）：<br>
                     慣れ親しんだ内容であれば単純で直接的な会話ができる。<br>
                    B1（中級）：<br>
                    仕事や学校、レジャーなど慣れ親しんだ環境の話題であれば、主な内容は理解・会話することができる。<br>
                    B2（中級の上）：<br>
                    ネイティブスピーカーと、ある程度流暢にストレスなく普通の会話をすることができる。<br>
                    C1（上級）：<br>
                    言葉や表現に悩まずに自身の考えを流暢によどみなく伝えることができる。<br>
                    C2（ネイティブ）：<br>
                    どんな複雑な状況下でも一貫して言葉のニュアンスの違いなどに気を配りながら流暢に正確に自己表現ができる。'
                  placeHolder='言語レベル'
                  className='w-[120px] sm:w-full max-w-[467px]'
                  isError={false}
                  errorMessages={[]}
                  value={searchCond?.lang?.[0]?.levelId?.toString() || ''}
                  onChange={(e) => {
                    setSearchCond((prevFormData) => ({
                      ...prevFormData,
                      lang: [
                        {
                          id: prevFormData.lang?.[0]?.id || 0,
                          name: prevFormData.lang?.[0]?.name || '',
                          levelId: Number(e) || 0,
                          levelName:
                            langLevel.find((item) => item.id === Number(e))?.name || '未選択',
                        },
                        prevFormData.lang?.[1],
                        prevFormData.lang?.[2],
                      ] as SearchCond['lang'],
                    }));
                  }}
                  options={langLevel.map((item) => ({ key: item.id, value: item.name }))}
                />
              </div>
              <div className='flex flex-row justify-start gap-[16px]'>
                <CustomDropdown
                  id='lang2'
                  placeHolder='言語2'
                  className='w-[120px] sm:w-full max-w-[467px]'
                  isError={false}
                  errorMessages={[]}
                  value={searchCond?.lang?.[1]?.id?.toString() || ''}
                  onChange={(e) => {
                    setSearchCond((prevFormData) => ({
                      ...prevFormData,
                      lang: [
                        prevFormData.lang?.[0],
                        {
                          id: Number(e) || 0,
                          name: lang.find((item) => item.id === Number(e))?.name || '未選択',
                          levelId: prevFormData.lang?.[1]?.levelId || 0,
                          levelName: prevFormData.lang?.[1]?.levelName || '未選択',
                        },
                        prevFormData.lang?.[2],
                      ] as SearchCond['lang'],
                    }));
                  }}
                  options={lang.map((item) => ({ key: item.id, value: item.name }))}
                />
                <CustomDropdown
                  id='言語レベル'
                  placeHolder='言語レベル'
                  className='w-[120px] sm:w-full max-w-[467px]'
                  isError={false}
                  errorMessages={[]}
                  value={searchCond?.lang?.[1]?.levelId?.toString() || ''}
                  onChange={(e) => {
                    setSearchCond((prevFormData) => ({
                      ...prevFormData,
                      lang: [
                        prevFormData.lang?.[0],
                        {
                          id: prevFormData.lang?.[1]?.id || 0,
                          name: prevFormData.lang?.[1]?.name || '未選択',
                          levelId: Number(e) || 0,
                          levelName:
                            langLevel.find((item) => item.id === Number(e))?.name || '未選択',
                        },
                        prevFormData.lang?.[2],
                      ] as SearchCond['lang'],
                    }));
                  }}
                  options={langLevel.map((item) => ({ key: item.id, value: item.name }))}
                />
              </div>
              <div className='flex flex-row justify-start gap-[16px]'>
                <CustomDropdown
                  id='lang3'
                  placeHolder='言語3'
                  className='w-[120px] sm:w-full max-w-[467px]'
                  isError={false}
                  errorMessages={[]}
                  value={searchCond?.lang?.[2]?.id?.toString() || ''}
                  onChange={(e) => {
                    setSearchCond((prevFormData) => ({
                      ...prevFormData,
                      lang: [
                        prevFormData.lang?.[0],
                        prevFormData.lang?.[1],
                        {
                          id: Number(e) || 0,
                          name: lang.find((item) => item.id === Number(e))?.name || '未選択',
                          levelId: prevFormData.lang?.[2]?.levelId || 0,
                          levelName: prevFormData.lang?.[2]?.levelName || '未選択',
                        },
                      ] as SearchCond['lang'],
                    }));
                  }}
                  options={lang.map((item) => ({ key: item.id, value: item.name }))}
                />
                <CustomDropdown
                  id='言語レベル3'
                  placeHolder='言語レベル3'
                  className='w-[120px] sm:w-full max-w-[467px]'
                  isError={false}
                  errorMessages={[]}
                  value={searchCond?.lang?.[2]?.levelId?.toString() || ''}
                  onChange={(e) => {
                    setSearchCond((prevFormData) => ({
                      ...prevFormData,
                      lang: [
                        prevFormData.lang?.[0],
                        prevFormData.lang?.[1],
                        {
                          id: prevFormData.lang?.[2]?.id || 0,
                          name: prevFormData.lang?.[2]?.name || '',
                          levelId: Number(e) || 0,
                          levelName:
                            langLevel.find((item) => item.id === Number(e))?.name || '未選択',
                        },
                      ] as SearchCond['lang'],
                    }));
                  }}
                  options={langLevel.map((item) => ({ key: item.id, value: item.name }))}
                />
              </div>
            </div>
            {/* 障碍タイプ */}
            <div className='flex flex-col justify-start'>
              <InputLabel
                label='補助が可能な障碍タイプ'
                displayHelp={true}
                toolTipText='PR1：<br>
                腕と肩は完全に動くが、脚の機能が失われている選手。脊椎損傷などが原因として考えられる。平衡機能が弱いため、体をボートに固定させる<br>
                PR2：<br>
                胴体と腕は十分に動くが、脚の機能が減少している選手。漕ぐ時はスライドするシートを使えない<br>
                PR3：<br>
                四肢と胴体に障害があるが、動かすことができる選手。視覚障害者もこのクラスに分類される'
              />
              <div className='flex flex-col justify-start gap-[4px] my-1'>
                <OriginalCheckbox
                  id='PR1'
                  label='PR1'
                  value={
                    searchCond.disType === null || searchCond.disType === undefined
                      ? ''
                      : searchCond.disType.find((item) => item?.id === 1)?.name || ''
                  }
                  checked={
                    searchCond.disType === null || searchCond.disType === undefined
                      ? false
                      : searchCond.disType.find((item) => item?.id === 1) !== undefined
                  }
                  readonly={false}
                  onChange={(e) => {
                    handleDisTypeChange(e.target.checked, 1);
                  }}
                />
                <OriginalCheckbox
                  id='PR2'
                  label='PR2'
                  value={
                    searchCond.disType === null || searchCond.disType === undefined
                      ? ''
                      : searchCond.disType.find((item) => item?.id === 2)?.name || ''
                  }
                  checked={
                    searchCond.disType === null || searchCond.disType === undefined
                      ? false
                      : searchCond.disType.find((item) => item?.id === 2) !== undefined
                  }
                  onChange={(e) => {
                    handleDisTypeChange(e.target.checked, 2);
                  }}
                />
                <OriginalCheckbox
                  id='PR3'
                  label='PR3'
                  value={
                    searchCond.disType === null || searchCond.disType === undefined
                      ? ''
                      : searchCond.disType.find((item) => item?.id === 3)?.name || ''
                  }
                  checked={
                    searchCond.disType === null || searchCond.disType === undefined
                      ? false
                      : searchCond.disType.find((item) => item?.id === 3) !== undefined
                  }
                  onChange={(e) => {
                    handleDisTypeChange(e.target.checked, 3);
                  }}
                />
              </div>
            </div>
            {/* 参加しやすい曜日 */}
            <div>
              <div className='text-small font-bold'>参加しやすい曜日</div>
              <div className='flex flex-row flex-wrap gap-[14px] my-1'>
                <OriginalCheckbox
                  id='anyday'
                  label='祝日は可'
                  value=''
                  checked={
                    getBoolFromIndex(searchCond.dayOfWeek ? searchCond.dayOfWeek : '', 7) || false
                  }
                  onChange={(e) => {
                    handleCheckboxChange(
                      'dayOfWeek',
                      searchCond.dayOfWeek ? searchCond.dayOfWeek : '',
                      7,
                    );
                  }}
                />
                <OriginalCheckbox
                  id='sunday'
                  label='日曜日'
                  value=''
                  checked={
                    getBoolFromIndex(searchCond.dayOfWeek ? searchCond.dayOfWeek : '', 0) || false
                  }
                  onChange={(e) => {
                    handleCheckboxChange(
                      'dayOfWeek',
                      searchCond.dayOfWeek ? searchCond.dayOfWeek : '',
                      0,
                    );
                  }}
                />
                <OriginalCheckbox
                  id='monday'
                  label='月曜日'
                  value=''
                  checked={
                    getBoolFromIndex(searchCond.dayOfWeek ? searchCond.dayOfWeek : '', 1) || false
                  }
                  onChange={(e) => {
                    handleCheckboxChange(
                      'dayOfWeek',
                      searchCond.dayOfWeek ? searchCond.dayOfWeek : '',
                      1,
                    );
                  }}
                />
                <OriginalCheckbox
                  id='tuesday'
                  label='火曜日'
                  value=''
                  checked={
                    getBoolFromIndex(searchCond.dayOfWeek ? searchCond.dayOfWeek : '', 2) || false
                  }
                  onChange={(e) => {
                    handleCheckboxChange(
                      'dayOfWeek',
                      searchCond.dayOfWeek ? searchCond.dayOfWeek : '',
                      2,
                    );
                  }}
                />
                <OriginalCheckbox
                  id='wednesday'
                  label='水曜日'
                  value=''
                  checked={
                    getBoolFromIndex(searchCond.dayOfWeek ? searchCond.dayOfWeek : '', 3) || false
                  }
                  onChange={(e) => {
                    handleCheckboxChange(
                      'dayOfWeek',
                      searchCond.dayOfWeek ? searchCond.dayOfWeek : '',
                      3,
                    );
                  }}
                />
                <OriginalCheckbox
                  id='thursday'
                  label='木曜日'
                  value=''
                  checked={
                    getBoolFromIndex(searchCond.dayOfWeek ? searchCond.dayOfWeek : '', 4) || false
                  }
                  onChange={(e) => {
                    handleCheckboxChange(
                      'dayOfWeek',
                      searchCond.dayOfWeek ? searchCond.dayOfWeek : '',
                      4,
                    );
                  }}
                />
                <OriginalCheckbox
                  id='friday'
                  label='金曜日'
                  value=''
                  checked={
                    getBoolFromIndex(searchCond.dayOfWeek ? searchCond.dayOfWeek : '', 5) || false
                  }
                  onChange={(e) => {
                    handleCheckboxChange(
                      'dayOfWeek',
                      searchCond.dayOfWeek ? searchCond.dayOfWeek : '',
                      5,
                    );
                  }}
                />
                <OriginalCheckbox
                  id='saturday'
                  label='土曜日'
                  value=''
                  checked={
                    getBoolFromIndex(searchCond.dayOfWeek ? searchCond.dayOfWeek : '', 6) || false
                  }
                  onChange={(e) => {
                    handleCheckboxChange(
                      'dayOfWeek',
                      searchCond.dayOfWeek ? searchCond.dayOfWeek : '',
                      6,
                    );
                  }}
                />
                <OriginalCheckbox
                  id='any'
                  label='相談可能'
                  value=''
                  checked={
                    getBoolFromIndex(searchCond.dayOfWeek ? searchCond.dayOfWeek : '', 8) || false
                  }
                  onChange={(e) => {
                    handleCheckboxChange(
                      'dayOfWeek',
                      searchCond.dayOfWeek ? searchCond.dayOfWeek : '',
                      8,
                    );
                  }}
                />
              </div>
            </div>
            {/* 参加可能時間帯 */}
            <div>
              <div className='text-small font-bold'>参加可能時間帯</div>
              <div className='flex flex-col gap-[4px] my-1'>
                <OriginalCheckbox
                  id='anytime'
                  label='相談可能'
                  value=''
                  checked={
                    getTimeZoneBool(searchCond.timeZone ? searchCond.timeZone : '', 7) || false
                  }
                  onChange={(e) => {
                    handleCheckboxChange(
                      'timeZone',
                      searchCond.timeZone ? searchCond.timeZone : '',
                      7,
                    );
                  }}
                />
                <OriginalCheckbox
                  id='earlymorning'
                  label='早朝　 06:00〜08:00'
                  value=''
                  checked={
                    getTimeZoneBool(searchCond.timeZone ? searchCond.timeZone : '', 0) || false
                  }
                  onChange={(e) => {
                    handleCheckboxChange(
                      'timeZone',
                      searchCond.timeZone ? searchCond.timeZone : '',
                      0,
                    );
                  }}
                />
                <OriginalCheckbox
                  id='morning'
                  label='午前　 08:00〜12:00'
                  value=''
                  checked={
                    getTimeZoneBool(searchCond.timeZone ? searchCond.timeZone : '', 1) || false
                  }
                  onChange={(e) => {
                    handleCheckboxChange(
                      'timeZone',
                      searchCond.timeZone ? searchCond.timeZone : '',
                      1,
                    );
                  }}
                />
                <OriginalCheckbox
                  id='afternoon'
                  label='午後　 12:00〜16:00'
                  value=''
                  checked={
                    getTimeZoneBool(searchCond.timeZone ? searchCond.timeZone : '', 2) || false
                  }
                  onChange={(e) => {
                    handleCheckboxChange(
                      'timeZone',
                      searchCond.timeZone ? searchCond.timeZone : '',
                      2,
                    );
                  }}
                />
                <OriginalCheckbox
                  id='night'
                  label='夜　　 16:00〜20:00'
                  value=''
                  checked={
                    getTimeZoneBool(searchCond.timeZone ? searchCond.timeZone : '', 3) || false
                  }
                  onChange={(e) => {
                    handleCheckboxChange(
                      'timeZone',
                      searchCond.timeZone ? searchCond.timeZone : '',
                      3,
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      <div className='flex flex-col justify-start'>
        <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
          <CustomButton
            buttonType='primary'
            onClick={() => {
              const startDateExistsError = Validator.getErrorMessages([
                Validator.validateDateExists(searchCond?.date_of_birth_start),
              ]);
              const endDateExistsError = Validator.getErrorMessages([
                Validator.validateDateExists(searchCond?.date_of_birth_end),
              ]);
              const compareDatesVolunteerError = Validator.getErrorMessages([
                Validator.compareDatesVolunteer(
                  searchCond?.date_of_birth_start,
                  searchCond?.date_of_birth_end,
                ),
              ]);

              setStartDateExistsErrorMessages(startDateExistsError);
              setEndDateExistsErrorMessages(endDateExistsError);

              if (startDateExistsError.length < 1) {
                setStartDateExistsErrorMessages(compareDatesVolunteerError);
              }

              if (
                startDateExistsError.length > 0 ||
                endDateExistsError.length > 0 ||
                compareDatesVolunteerError.length > 0
              ) {
                return;
              }

              handleSearch();
            }}
            className='flex flex-row justify-center items-center gap-1'
          >
            <SearchIcon />
            <div>検索</div>
          </CustomButton>

          <CustomButton
            buttonType='secondary'
            onClick={() => {
              setSearchCond(initialSearchCond());
            }}
          >
            クリア
          </CustomButton>
        </div>
      </div>
      {/* ボランティア一覧 */}
      <div className='overflow-auto'>
        <CustomTable>
          <CustomThead>
            <CustomTr>
              <CustomTh rowSpan={2}>
                <div
                  className='underline'
                  style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                  onClick={() => volunteerIdSort()}
                >
                  ボランティアID
                </div>
              </CustomTh>
              <CustomTh rowSpan={2}>
                <div
                  className='underline'
                  style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                  onClick={() => volunteerNameSort()}
                >
                  氏名
                </div>
              </CustomTh>
              <CustomTh rowSpan={2}>
                <div
                  className='underline'
                  style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                  onClick={() => volunteerCountrySort()}
                >
                  居住地
                </div>
              </CustomTh>
              <CustomTh rowSpan={2}>
                <div
                  className='underline'
                  style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                  onClick={() => sexSort()}
                >
                  性別
                </div>
              </CustomTh>
              <CustomTh rowSpan={2}>
                <div
                  className='underline'
                  style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                  onClick={() => ageSort()}
                >
                  年齢
                </div>
              </CustomTh>
              <CustomTh rowSpan={1} colSpan={3}>
                補助が可能な障碍タイプ
              </CustomTh>
              <CustomTh rowSpan={2}>言語1</CustomTh>
              <CustomTh rowSpan={2}>言語2</CustomTh>
              <CustomTh rowSpan={2}>言語3</CustomTh>
              <CustomTh rowSpan={2}>電話番号</CustomTh>
              <CustomTh rowSpan={2}>メールアドレス</CustomTh>
            </CustomTr>
            <CustomTr>
              <CustomTh>
                <div
                  className='underline'
                  style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                  onClick={() => PR1Sort()}
                >
                  PR1
                </div>
              </CustomTh>
              <CustomTh>
                <div
                  className='underline'
                  style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                  onClick={() => PR2Sort()}
                >
                  PR2
                </div>
              </CustomTh>
              <CustomTh>
                <div
                  className='underline'
                  style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                  onClick={() => PR3Sort()}
                >
                  PR3
                </div>
              </CustomTh>
            </CustomTr>
          </CustomThead>
          <CustomTbody>
            {searchResponse.map((row, index) => (
              <CustomTr index={index} key={index}>
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/volunteerInformationRef',
                      query: { volunteer_id: row.volunteer_id },
                    }}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {row.volunteer_id}
                  </Link>
                </CustomTd>
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/volunteerInformationRef',
                      query: { volunteer_id: row.volunteer_id },
                    }}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {row.volunteer_name}
                  </Link>
                </CustomTd>
                <CustomTd>
                  {row.residence_country.includes('日本')
                    ? row.residence_prefecture
                    : row.residence_country}
                </CustomTd>
                <CustomTd>{row.sex}</CustomTd>
                <CustomTd>{calculateAgeFromBirthday(row.date_of_birth)}</CustomTd>
                <CustomTd>{row.dis_type_id?.[0] ? '◯' : '×'}</CustomTd>
                <CustomTd>{row.dis_type_id?.[1] ? '◯' : '×'}</CustomTd>
                <CustomTd>{row.dis_type_id?.[2] ? '◯' : '×'}</CustomTd>
                <CustomTd>{row.language?.[0]}</CustomTd>
                <CustomTd>{row.language?.[1]}</CustomTd>
                <CustomTd>{row.language?.[2]}</CustomTd>
                <CustomTd>{row.telephone_number}</CustomTd>
                <CustomTd>{row.mailaddress}</CustomTd>
              </CustomTr>
            ))}
          </CustomTbody>
        </CustomTable>
      </div>
      <div className='flex flex-row justify-center gap-[16px] my-[30px]'>
        <CustomButton
          onClick={() => {
            router.back();
          }}
          buttonType='secondary'
        >
          戻る
        </CustomButton>
      </div>
    </>
  );
}
