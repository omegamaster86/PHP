// 機能名: ボランティア検索
'use client';

// ReactおよびNext関連モジュールのインポート
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// コンポーネントのインポート
import {
  CustomTitle,
  ErrorBox,
  CustomTextField,
  CustomDropdown,
  InputLabel,
  CustomDatePicker,
  CustomButton,
  CustomTable,
  CustomThead,
  CustomTh,
  CustomTr,
  CustomTbody,
  CustomTd,
  OriginalCheckbox,
} from '@/app/components/';

// モデルのインポート
import {
  SexResponse,
  VolunteerResponse,
  DisTypeResponse,
  QualHoldResponse,
  LangResponse,
  CountryResponse,
  PrefectureResponse,
  TournamentResponse,
} from '@/app/types';

// モデルのインポート
import { Tournament } from '@/app/types';

// マテリアルUI関連モジュールのインポート
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// その他モジュールのインポート
import axios from '@/app/lib/axios';

import {
  Box,
  Chip,
  MenuItem,
  Select,
  Autocomplete,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import CustomAutocomplete from '@/app/components/CustomAutocomplete';

// 検索条件フォームの型定義
// 検索条件
interface SearchCond {
  volunteerId?: number; // ボランティアID
  volunteerName?: string; // 氏名
  dateOfBirthStartDate?: string; // 生年月日
  dateOfBirthEndDate?: string; // 生年月日
  sexId?: number; // 性別
  sexName?: string; // 性別
  residenceCountryId?: number; // 居住地（国）
  residenceCountryName?: string; // 居住地（国）
  residencePrefectureId?: number; // 居住地（都道府県）
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
  tour?: [TournamentResponse]; // 参加したい大会
}

export default function VolunteerSearch() {
  /** 定数定義 **/
  const JAPAN_COUNTRY_ID = 0;
  const OTHERS_QUAL_ID = 0;

  /** フック **/
  const router = useRouter();

  /** 状態定義 **/
  // 検索条件の初期値
  const initialSearchCond = () => {
    return {
      volunteerId: undefined,
      volunteerName: undefined,
      dateOfBirthStartDate: '',
      dateOfBirthEndDate: undefined,
      sexId: undefined,
      sexName: '',
      residenceCountryId: undefined,
      residenceCountryName: '',
      residencePrefectureId: undefined,
      residencePrefectureName: '',
      qualHold: [] as { id: number; name: string }[],
      othersQual: '',
      lang: [] as { id: number; name: string; levelId: number; levelName: string }[],
      disType: [] as { id: number; name: string }[],
      dayOfWeek: '000000000000',
      timeZone: '00000000',
      tour: [] as TournamentResponse[],
    } as unknown as SearchCond;
  };

  const [searchCond, setSearchCond] = useState<SearchCond>(initialSearchCond); // 検索条件
  const [searchResponse, setSearchResponse] = useState<VolunteerResponse[]>([]); // 検索結果
  const [sex, setSex] = useState<SexResponse[]>([]); // 性別マスタ
  const [tour, setTour] = useState<TournamentResponse[]>([]); // 大会マスタ
  const [qualHold, setQualHold] = useState<QualHoldResponse[]>([]); // 資格マスタ
  const [disType, setDisType] = useState<DisTypeResponse[]>([]); // 障碍タイプマスタ
  const [lang, setLang] = useState<LangResponse[]>([]); // 言語マスタ
  const [langLevel, setLangLevel] = useState<LangResponse[]>([]); // 言語レベルマスタ
  const [country, setCountry] = useState<CountryResponse[]>([]); // 国マスタ
  const [prefecture, setPrefecture] = useState<PrefectureResponse[]>([]); // 都道府県マスタ

  /** 関数 **/

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
      [name]: resultString as string,
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
    axios
      .get<VolunteerResponse[]>('http://localhost:3100/volunteerSearch')
      .then((response) => {
        // レスポンスからデータを取り出してstateにセット
        setSearchResponse(response.data as VolunteerResponse[]);
      })
      .catch((error) => {
        // TODO: エラー処理
        // alert(error);
      });
  };

  // React Hook
  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie')
        await csrf()
        // 仮のURL（繋ぎ込み時に変更すること）
        // 性別マスタの取得
        // const response = await axios.get<SexResponse[]>('http://localhost:3100/sex');
        const sexResponse = await axios.get('/getSexList');
        const sexList = sexResponse.data.map(({ sex_id, sex }: { sex_id: number; sex: string }) => ({ id: sex_id, name: sex }));
        setSex(sexList);
        // 大会マスタの取得
        // const tour = await axios.get<TournamentResponse[]>('http://localhost:3100/tournaments');
        const hostTournamentsResponse = await axios.get('/getTournamentInfoData_vol'); //残件対象項目
        console.log(hostTournamentsResponse.data.result);
        // setTour(tour.data);
        // 障碍タイプマスタの取得
        // const disType = await axios.get<DisTypeResponse[]>('http://localhost:3100/disType');
        const disType = await axios.get('/getDisabilityType');
        const disTypeList = disType.data.map(({ dis_type_id, dis_type_name }: { dis_type_id: number; dis_type_name: string }) => ({ id: dis_type_id, name: dis_type_name }));
        setDisType(disTypeList);
        // 資格マスタの取得
        // const qualHold = await axios.get<QualHoldResponse[]>('http://localhost:3100/qualHold');
        const qualHold = await axios.get('/getQualifications');
        const qualHoldList = qualHold.data.map(({ qual_id, qual_name }: { qual_id: number; qual_name: string }) => ({ id: qual_id, name: qual_name }));
        setQualHold(qualHoldList);
        // 言語マスタの取得
        // const lang = await axios.get<LangResponse[]>('http://localhost:3100/language');
        const lang = await axios.get('/getLanguages');
        const langList = lang.data.map(({ lang_id, lang_name }: { lang_id: number; lang_name: string }) => ({ id: lang_id, name: lang_name }));
        setLang(langList);
        // 言語レベルマスタの取得
        // const langLevel = await axios.get<LangResponse[]>('http://localhost:3100/languageLevel');
        const langLevel = await axios.get('/getLanguageProficiency');
        const langLevelList = langLevel.data.map(({ lang_pro_id, lang_pro_name }: { lang_pro_id: number; lang_pro_name: string }) => ({ id: lang_pro_id, name: lang_pro_name }));
        setLangLevel(langLevelList);

        // const country = await axios.get<CountryResponse[]>('http://localhost:3100/countries');
        const countryResponse = await axios.get('/getCountries');
        const countryList = countryResponse.data.map(({ country_id, country_name }: { country_id: number; country_name: string }) => ({ id: country_id, name: country_name }));
        setCountry(countryList);
        
        // const prefecture = await axios.get<PrefectureResponse[]>('http://localhost:3100/prefecture',);
        const prefectureResponse = await axios.get('/getPrefecures');
        const stateList = prefectureResponse.data.map(({ pref_id, pref_name }: { pref_id: number; pref_name: string }) => ({ id: pref_id, name: pref_name }));
        setPrefecture(stateList);

      } catch (error) {
        // alert(error);
      }
    };
    fetchData();
  }, []);

  // React Hook
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

  // React Hook
  // 検索条件のうち、大会情報の変更を監視
  useEffect(() => {
    if ((searchCond.tour?.length || 0) > 3) {
      alert('大会は3つまで選択できます。');
      setSearchCond((prevFormData) => ({
        ...prevFormData,
        tour: prevFormData.tour?.slice(0, 3) as [TournamentResponse],
      }));
    }
  }, [searchCond.tour]);

  // レンダリング
  return (
    <main className='flex min-h-screen flex-col justify-start p-[10px] gap-[20px] my-[80px] md:w-[1200px] sm: w-[600px]'>
      <div className='relative flex flex-row justify-between w-full h-screen flex-wrap'>
        {/* タイトルの表示 */}
        <CustomTitle displayBack>ボランティア検索</CustomTitle>
      </div>
      {/* エラーメッセージの表示 */}
      <ErrorBox errorText={[]} />
      <Accordion
        defaultExpanded
        className='w-full bg-gray-50 border-[1px] border-solid border-border rounded-md'
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel1-content'
          id='panel1-header'
        >
          <InputLabel label='検索条件' />
        </AccordionSummary>
        <AccordionDetails>
          <div className='bg-gray-50 flex flex-col gap-[20px]'>
            <div>
              {/* ボランティアID */}
              <CustomTextField
                type='number'
                label='ボランティアID'
                placeHolder='ボランティアID'
                displayHelp={false}
                isError={false}
                errorMessages={[]}
                value={searchCond.volunteerId?.toString() || ''}
                onChange={(e) => handleInputChange('volunteerId', e.target.value)}
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
                value={searchCond.volunteerName}
                onChange={(e) => {
                  handleInputChange('volunteerName', e.target.value);
                }}
                className='w-[467px]'
              />
              <p className='text-small text-gray-400'>※部分一致</p>
            </div>
            <div className='flex flex-row justify-start gap-[16px]'>
              {/* 開催開始年月日 */}
              <div className='flex flex-col justify-start'>
                <InputLabel label='生年月日' />
                <div
                  className='flex flex-row justify-start gap-[16px] mt-[8px]'
                  style={{ width: '100%', height: '100%' }}
                >
                  <CustomDatePicker
                    id='dateOfBirthStartDate'
                    placeHolder={new Date().toLocaleDateString('ja-JP')}
                    selectedDate={searchCond.dateOfBirthStartDate?.toString() || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      handleInputChange('dateOfBirthStartDate', formatDate(e as unknown as Date));
                    }}
                    className='w-[210px] border-[1px] border-solid border-border rounded-md bg-white h-[56px]'
                  />
                  <p className='self-center text-small text-gray-400'>〜</p>
                  <CustomDatePicker
                    id='dateOfBirthEndDate'
                    placeHolder={new Date().toLocaleDateString('ja-JP')}
                    selectedDate={searchCond.dateOfBirthEndDate?.toString() || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      handleInputChange('dateOfBirthEndDate', formatDate(e as unknown as Date));
                    }}
                    className='w-[210px] border-[1px] border-solid border-border rounded-md bg-white h-[56px]'
                  />
                </div>
              </div>
              {/* 開催終了年月日 */}
              <div className='flex flex-col justify-start'></div>
            </div>
            {/* 性別 */}
            <div className='flex flex-col justify-start gap-[8px]'>
              <InputLabel label='性別' />
              <CustomDropdown
                id='sex'
                isError={false}
                placeHolder='男性'
                value={searchCond.sexId?.toString() || ''}
                className='w-[210px]'
                onChange={(e) => {
                  handleInputChange('sexId', e);
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
              <div className='flex flex-col justify-start gap-[8px]'>
                <InputLabel label='居住地' />
                <CustomDropdown
                  id='residenceCountry'
                  className='w-[210px]'
                  placeHolder='東京'
                  isError={false}
                  errorMessages={[]}
                  value={searchCond.residenceCountryId?.toString() || ''}
                  onChange={(e) => {
                    handleInputChange('residenceCountryId', e);
                  }}
                  options={country.map((item) => ({ key: item.id, value: item.name }))}
                />
              </div>
              {/* 居住地（都道府県） */}
              {searchCond.residenceCountryId === JAPAN_COUNTRY_ID && (
                <div className='flex flex-col justify-start gap-[8px]'>
                  <InputLabel label='都道府県' />
                  <CustomDropdown
                    id='residencePrefecture'
                    className='w-[210px]'
                    isError={false}
                    errorMessages={[]}
                    value={searchCond.residencePrefectureId?.toString() || ''}
                    onChange={(e) => {
                      handleInputChange('residencePrefectureId', e);
                    }}
                    options={prefecture.map((item) => ({ key: item.id, value: item.name }))}
                  />
                </div>
              )}
            </div>
            {/* 保有資格 */}
            <div className='flex flex-col justify-start gap-[16px]'>
              <div className='flex flex-row justify-start gap-[16px]'>
                <div>
                  <InputLabel label='保有資格' />
                  <Select
                    id='qualHold'
                    multiple
                    className='self-end border-[0.1px] border-solid border-gray-50 rounded-md bg-white w-[467px] my-1'
                    value={searchCond.qualHold?.map((item) => item?.id) || []}
                    onChange={(e) => {
                      let currentData = Array.isArray(e.target.value)
                        ? e.target.value.map((item: any) => {
                          return {
                            id: item,
                            name: qualHold.find((qualHold) => qualHold.id === item)?.name || '',
                          };
                        })
                        : [];
                      setSearchCond((prevFormData) => ({
                        ...prevFormData,
                        qualHold: currentData as [{ id: number; name: string }],
                      }));
                    }}
                    renderValue={() => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {searchCond.qualHold?.map((value, index) =>
                          value?.id === 0 ? null : <Chip key={index} label={value?.name} />,
                        )}
                      </Box>
                    )}
                  >
                    {qualHold
                      ? qualHold
                        .filter((item) => item.id !== undefined)
                        .filter((item) => item.name !== undefined)
                        .map((item, index) => {
                          return (
                            <MenuItem key={index} value={item.id}>
                              {item.name}
                            </MenuItem>
                          );
                        })
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
                <div className='flex flex-col justify-start gap-[8px]'>
                  <InputLabel label='言語' />
                  <CustomDropdown
                    id='lang1'
                    placeHolder='言語1'
                    className='w-[467px]'
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
                        ] as [
                            { id: number; name: string; levelId: number; levelName: string },
                            { id: number; name: string; levelId: number; levelName: string },
                            { id: number; name: string; levelId: number; levelName: string },
                          ],
                      }));
                    }}
                    options={lang.map((item) => ({ key: item.id, value: item.name }))}
                  />
                </div>
                <div className='flex flex-col justify-start gap-[8px]'>
                  <InputLabel label='言語レベル' />
                  <CustomDropdown
                    id='言語レベル1'
                    placeHolder='言語レベル'
                    className='w-[467px]'
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
                        ] as [
                            { id: number; name: string; levelId: number; levelName: string },
                            { id: number; name: string; levelId: number; levelName: string },
                            { id: number; name: string; levelId: number; levelName: string },
                          ],
                      }));
                    }}
                    options={langLevel.map((item) => ({ key: item.id, value: item.name }))}
                  />
                </div>
              </div>
              <div className='flex flex-row justify-start gap-[16px]'>
                <CustomDropdown
                  id='lang2'
                  placeHolder='言語2'
                  className='w-[467px]'
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
                      ] as [
                          { id: number; name: string; levelId: number; levelName: string },
                          { id: number; name: string; levelId: number; levelName: string },
                          { id: number; name: string; levelId: number; levelName: string },
                        ],
                    }));
                  }}
                  options={lang.map((item) => ({ key: item.id, value: item.name }))}
                />
                <CustomDropdown
                  id='言語レベル'
                  placeHolder='言語レベル'
                  className='w-[467px]'
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
                      ] as [
                          { id: number; name: string; levelId: number; levelName: string },
                          { id: number; name: string; levelId: number; levelName: string },
                          { id: number; name: string; levelId: number; levelName: string },
                        ],
                    }));
                  }}
                  options={langLevel.map((item) => ({ key: item.id, value: item.name }))}
                />
              </div>
              <div className='flex flex-row justify-start gap-[16px]'>
                <CustomDropdown
                  id='lang3'
                  placeHolder='言語3'
                  className='w-[467px]'
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
                          id: Number(e) || 2,
                          name: lang.find((item) => item.id === Number(e))?.name || '未選択',
                          levelId: prevFormData.lang?.[2]?.levelId || 0,
                          levelName: prevFormData.lang?.[2]?.levelName || '未選択',
                        },
                      ] as [
                          { id: number; name: string; levelId: number; levelName: string },
                          { id: number; name: string; levelId: number; levelName: string },
                          { id: number; name: string; levelId: number; levelName: string },
                        ],
                    }));
                  }}
                  options={lang.map((item) => ({ key: item.id, value: item.name }))}
                />
                <CustomDropdown
                  id='言語レベル3'
                  placeHolder='言語レベル3'
                  className='w-[467px]'
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
                      ] as [
                          { id: number; name: string; levelId: number; levelName: string },
                          { id: number; name: string; levelId: number; levelName: string },
                          { id: number; name: string; levelId: number; levelName: string },
                        ],
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
                toolTipText='補助が可能な障碍タイプ'
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
              <div className='flex flex-row gap-[14px] my-1'>
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
            {/* 過去に参加した大会 */}
            <div>
              <InputLabel label='過去に参加した大会' />
              <CustomAutocomplete
                id='tournament'
                errorMessages={[]}
                placeholder='大会名'
                value={searchCond.tour || []}
                onChange={(e, val) => {
                  setSearchCond((prevFormData) => ({
                    ...prevFormData,
                    tour: val as [TournamentResponse],
                  }));
                }}
                options={tour.map((item) => ({ id: item.id, name: item.name }))}
              />
              <p className='self-start text-small text-gray-400'>※複数選択可（3大会まで）</p>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
      {/* 検索ボタン */}
      <div className='flex flex-col justify-start'>
        <div className='flex flex-row justify-start gap-[4px]'>
          <CustomButton
            buttonType='primary'
            onClick={() => {
              handleSearch();
            }}
            className='flex flex-row justify-center gap-[4px] w-[100px]'
          >
            <SearchIcon />
            <div>検索</div>
          </CustomButton>
          {/* クリアボタン */}
          <CustomButton
            buttonType='secondary'
            onClick={() => {
              setSearchCond(initialSearchCond());
            }}
            className='w-[100px]'
          >
            クリア
          </CustomButton>
        </div>
      </div>
      {/* ボランティア一覧 */}
      <CustomTable>
        <CustomThead>
          <CustomTr>
            <CustomTh rowSpan={2}>ボランティアID</CustomTh>
            <CustomTh rowSpan={2}>氏名</CustomTh>
            <CustomTh rowSpan={2}>居住地</CustomTh>
            <CustomTh rowSpan={2}>性別</CustomTh>
            <CustomTh rowSpan={2}>年齢</CustomTh>
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
            <CustomTh>PR1</CustomTh>
            <CustomTh>PR2</CustomTh>
            <CustomTh>PR3</CustomTh>
          </CustomTr>
        </CustomThead>
        <CustomTbody>
          {searchResponse.map((row, index) => (
            <CustomTr index={index} key={index}>
              <CustomTd>
                <Link
                  className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                  href={{
                    pathname: '/userInformationRef',
                  }}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  {row.volunteerId}
                </Link>
              </CustomTd>
              <CustomTd>
                <Link
                  className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                  href={{
                    pathname: '/userInformationRef',
                  }}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  {row.volunteerName}
                </Link>
              </CustomTd>
              <CustomTd>
                {row.residenceCountry === '日本' ? row.residencePrefecture : row.residenceCountry}
              </CustomTd>
              <CustomTd>{row.sex}</CustomTd>
              <CustomTd>{calculateAgeFromBirthday(row.dateOfBirth)}</CustomTd>
              <CustomTd>{row.disType?.[0] ? '◯' : '×'}</CustomTd>
              <CustomTd>{row.disType?.[1] ? '◯' : '×'}</CustomTd>
              <CustomTd>{row.disType?.[2] ? '◯' : '×'}</CustomTd>
              <CustomTd>{row.language[0].languageName}</CustomTd>
              <CustomTd>{row.language[1].languageName}</CustomTd>
              <CustomTd>{row.language[2].languageName}</CustomTd>
              <CustomTd>{row.telephoneNumber}</CustomTd>
              <CustomTd>{row.mailaddress}</CustomTd>
            </CustomTr>
          ))}
        </CustomTbody>
      </CustomTable>
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
    </main>
  );
}
