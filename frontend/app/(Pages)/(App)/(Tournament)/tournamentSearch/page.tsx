// 機能名: 大会検索
'use client';

// Reactおよび関連モジュールのインポート
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/app/lib/axios';
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
  Label,
} from '@/app/components/';
// モデルのインポート
import { Tournament } from '@/app/types';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import Validator from '@/app/utils/validator';
import Divider from '@mui/material/Divider';
// モデルのインポート
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

// 検索条件フォームの型定義
// 検索条件
interface SearchCond {
  jara_player_id: string;
  player_id: string;
  player_name: string;
  tourn_name: string;
  tourn_type: string;
  tournTypeName: string;
  event_start_date: string;
  event_end_date: string;
  venue_id: string;
  venue_name: string;
  sponsor_org_id: string;
  sponsorOrgName: string;
}

// APIレスポンスの型定義

// 承認種別
interface TourTypeResponse {
  id: number;
  name: string;
}

// 開催場所
interface VenueResponse {
  id: number;
  name: string;
}

export default function TournamentSearch() {
  // フック
  const router = useRouter();

  // フォームデータを管理する状態
  const [searchCond, setSearchCond] = useState<SearchCond>({
    jara_player_id: '',
    player_id: '',
    player_name: '',
    tourn_name: '',
    tourn_type: '',
    tournTypeName: '',
    // event_start_date: new Date().toLocaleDateString(),
    // event_end_date: new Date().toLocaleDateString(),
    event_start_date: '',
    event_end_date: '',
    venue_id: '',
    venue_name: '',
    sponsor_org_id: '',
    sponsorOrgName: '',
  } as SearchCond);
  const [searchResponse, setSearchResponse] = useState<Tournament[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [visibleData, setVisibleData] = useState<Tournament[]>([]); // 表示するデータ
  const [visibleItems, setVisibleItems] = useState(10); // 表示するデータの数

  // フォームの入力値を管理する関数
  const handleInputChange = (name: string, value: string) => {
    setSearchCond((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  function getNonEmptyProperties(obj: SearchCond): { key: string; value: any }[] {
    return Object.entries(obj)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => ({
        key,
        value,
      }));
  }

  const handleSearch = async () => {
    // var apiUri = 'http://localhost:3100/tournamentSearch?';
    // getNonEmptyProperties(searchCond).forEach((item) => {
    //   apiUri += item.key + '=' + item.value + '&';
    // });
    // apiUri = apiUri.slice(0, -1);

    try {
      const csrf = () => axios.get('/sanctum/csrf-cookie');
      await csrf();
      const response = await axios.post('/tournamentSearch', searchCond);
      //console.log(response.data);
      if (response.data.result.length > 100) {
        window.alert('検索結果が100件を超えました、上位100件を表示しています。');
      }
      // レスポンスからデータを取り出してstateにセット
      setSearchResponse(response.data.result);
      // 最初は10件だけ表示
      setVisibleItems(10);
      setVisibleData(response.data.result.slice(0, 10));
    } catch (error) {
      setErrorMessage([...(errorMessage as string[]), 'API取得エラー:' + (error as Error).message]);
    }
  };

  // ステート変数
  const [tournType, setTourType] = useState<TourTypeResponse[]>([]);
  const [venue, setVenue] = useState<VenueResponse[]>([]);

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 仮のURL（繋ぎ込み時に変更すること）
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        // const tourTypeResponse = await axios.get<TourTypeResponse[]>('/tourType',);
        const tourTypeResponse = await axios.get('/getApprovalType');
        const tourTypeList = tourTypeResponse.data.map(
          ({
            appro_type_id,
            appro_type_id_name,
          }: {
            appro_type_id: number;
            appro_type_id_name: string;
          }) => ({ id: appro_type_id, name: appro_type_id_name }),
        );
        //console.log(tourTypeList);
        setTourType(tourTypeList);

        // const venueResponse = await axios.get<VenueResponse[]>('/venue');
        const venueResponse = await axios.get('/getVenueList');
        const stateList = venueResponse.data.map(
          ({ venue_id, venue_name }: { venue_id: number; venue_name: string }) => ({
            id: venue_id,
            name: venue_name,
          }),
        );
        setVenue(stateList);
      } catch (error) {
        setErrorMessage(['API取得エラー:' + (error as Error).message]);
      }
    };
    fetchData();
  }, []);

  // 日付をYYYY/MM/DDの形式に変換する
  const formatDate = (dt: Date) => {
    const y = dt.getFullYear();
    const m = ('00' + (dt.getMonth() + 1)).slice(-2);
    const d = ('00' + dt.getDate()).slice(-2);
    return y + '/' + m + '/' + d;
  };

  /**
   * データを10件ずつ増やす関数
   * @description
   * visibleDataに10件ずつデータを追加する
   * visibleItemsに10を加算する
   */
  const loadMoreData = () => {
    const newData = searchResponse.slice(0, visibleItems + 10);
    setVisibleData(newData);
    setVisibleItems((prevCount) => prevCount + 10);
  };

  // レンダリング
  return (
    <div>
      <main className='flex min-h-screen flex-col justify-start p-[10px] gap-[20px] my-[80px] md:w-[1200px] sm: w-[600px]'>
        <div className='relative flex flex-row justify-between w-full h-screen flex-wrap'>
          {/* 画面名 */}
          <CustomTitle displayBack>大会検索</CustomTitle>
        </div>
        {/* エラーメッセージの表示 */}
        <ErrorBox errorText={[]} />
        <div className='bg-thinContainerBg p-[20px] flex flex-col gap-[12px]'>
          <div className='flex flex-col justify-start gap-[16px]'>
            <div className='flex flex-row justify-start gap-[16px]'>
              {/* 大会名 */}
              <CustomTextField
                label='大会名'
                placeHolder='大会名'
                displayHelp={false}
                isError={false}
                errorMessages={[]}
                value={searchCond.tourn_name}
                className='w-[400px] border-[0.5px] border-solid border-gray-50 rounded'
                onChange={(e) => handleInputChange('tourn_name', e.target.value)}
              />
              {/* 大会種別 */}
              <div className='flex flex-col justify-start gap-[8px] w-[200px] h-[50px] border-[0.5px] border-solid border-gray-50 rounded'>
                <CustomDropdown
                  id='tournType'
                  label='大会種別'
                  options={tournType.map((item) => ({ key: item.id, value: item.name }))}
                  value={searchCond.tourn_type}
                  onChange={(e) => {
                    handleInputChange('tourn_type', e);
                    handleInputChange(
                      'tournTypeName',
                      tournType.find((item) => item.id.toString() === e)?.name || '',
                    );
                  }}
                  className='border-[0.5px] border-solid border-gray-50 rounded w-[200px]'
                />
              </div>
              {/* 開催場所 */}
              <div className='flex flex-col justify-start gap-[8px]'>
                <InputLabel label='開催場所' />
                <div>
                  <CustomDropdown
                    id='venueId'
                    placeHolder='開催場所'
                    options={venue.map((item) => ({ key: item.id, value: item.name }))}
                    value={searchCond.venue_id}
                    onChange={(e) => {
                      handleInputChange('venue_id', e);
                      handleInputChange(
                        'venue_name',
                        venue.find((item) => item.id.toString() === e)?.name || '',
                      );
                    }}
                    className='border-[0.5px] border-solid border-gray-50 rounded w-[200px]'
                  />
                </div>
              </div>
            </div>
            <div className='flex flex-row justify-start gap-[16px]'>
              {/* 開催開始年月日 */}
              <div className='flex flex-col justify-start '>
                <InputLabel label='開催年月日' />
                <CustomDatePicker
                  // placeHolder={new Date().toLocaleDateString('ja-JP')}
                  placeHolder={'YYYY/MM/DD'}
                  selectedDate={searchCond.event_start_date}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    handleInputChange('event_start_date', formatDate(e as unknown as Date));
                  }}
                />
              </div>
              <p className='flex flex-col justify-center items-center h-[50px] w-[20px] text-center self-end'>
                ～
              </p>
              {/* 開催終了年月日 */}
              <div className='flex flex-col justify-start self-end'>
                <CustomDatePicker
                  // placeHolder={new Date().toLocaleDateString('ja-JP')}
                  placeHolder={'YYYY/MM/DD'}
                  selectedDate={searchCond.event_end_date}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    handleInputChange('event_end_date', formatDate(e as unknown as Date));
                  }}
                />
              </div>
            </div>
            <Divider className='h-[1px] bg-border' />
            <div className='flex flex-col justify-start items-center'>
              <CustomButton
                buttonType='secondary'
                onClick={toggleAccordion}
                className='flex flex-row justify-center gap-[4px] w-[940px]'
              >
                <div className='font-bold'>もっと詳しく検索</div>
                {isOpen ? <RemoveIcon /> : <AddIcon />}
              </CustomButton>
            </div>

            {isOpen && (
              <div className='flex flex-col justify-start gap-[16px]'>
                <Label label='選手情報' isBold />
                <div className='flex flex-row justify-start gap-[16px]'>
                  {/* JARA選手コード */}
                  <CustomTextField
                    // type='number'
                    label='JARA選手コード'
                    placeHolder='JARA選手コード'
                    displayHelp={false}
                    isError={false}
                    errorMessages={[]}
                    value={searchCond.jara_player_id}
                    onChange={(e) => handleInputChange('jara_player_id', e.target.value)}
                  />
                  {/* 選手ID */}
                  <CustomTextField
                    // type='number'
                    label='選手ID'
                    placeHolder='選手ID'
                    displayHelp={false}
                    isError={false}
                    errorMessages={[]}
                    value={searchCond.player_id}
                    onChange={(e) => handleInputChange('player_id', e.target.value)}
                  />
                  <CustomTextField
                    label='選手名'
                    placeHolder='選手名'
                    displayHelp={false}
                    isError={false}
                    errorMessages={[]}
                    value={searchCond.player_name}
                    onChange={(e) => handleInputChange('player_name', e.target.value)}
                  />
                </div>
              </div>
            )}
            {isOpen && (
              <div className='flex flex-col justify-start gap-[16px]'>
                <Label label='主催団体' isBold />
                <div className='flex flex-row justify-start gap-[16px]'>
                  {/* 主催団体ID */}
                  <div className='flex flex-col justify-start'>
                    <CustomTextField
                      label='主催団体ID'
                      placeHolder='主催団体ID'
                      displayHelp={false}
                      value={searchCond.sponsor_org_id}
                      onChange={(e) => handleInputChange('sponsor_org_id', e.target.value)}
                    />
                  </div>
                  {/* 主催団体名 */}
                  <div className='flex flex-col justify-start'>
                    <CustomTextField
                      label='主催団体名'
                      placeHolder='主催団体名'
                      displayHelp={false}
                      isError={false}
                      errorMessages={[]}
                      value={searchCond.sponsorOrgName}
                      onChange={(e) => handleInputChange('sponsorOrgName', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            <Divider></Divider>
            <div className='flex flex-row justify-center gap-[4px]'>
              <CustomButton
                buttonType='primary'
                onClick={() => {
                  handleSearch();
                }}
                className='flex flex-row justify-center gap-[4px] w-[200px]'
              >
                <SearchIcon />
                <div>検索</div>
              </CustomButton>
              <CustomButton
                buttonType='secondary'
                onClick={() => {
                  setSearchCond({
                    jara_player_id: '',
                    player_id: '',
                    player_name: '',
                    tourn_name: '',
                    tourn_type: '',
                    tournTypeName: '',
                    // event_start_date: new Date().toLocaleDateString(),
                    // event_end_date: new Date().toLocaleDateString(),
                    event_start_date: '',
                    event_end_date: '',
                    venue_id: '',
                    venue_name: '',
                    sponsor_org_id: '',
                    sponsorOrgName: '',
                  } as SearchCond);
                }}
                className='w-[200px]'
              >
                クリア
              </CustomButton>
            </div>
          </div>
        </div>
        {/* 大会一覧テーブル表示 */}
        <div className='overflow-y-auto'>
          <CustomTable>
            {/* 大会一覧テーブルヘッダー表示 */}
            <CustomThead>
              <CustomTr>
                <CustomTh>大会種別</CustomTh>
                <CustomTh>大会名</CustomTh>
                <CustomTh>開催開始日</CustomTh>
                <CustomTh>開催終了日</CustomTh>
                <CustomTh>開催場所</CustomTh>
                <CustomTh>主催団体ID</CustomTh>
                <CustomTh>主催団体名</CustomTh>
              </CustomTr>
            </CustomThead>
            {/* 大会一覧テーブル明細表示 */}
            <CustomTbody>
              {visibleData.map((row, index) => (
                <CustomTr index={index} key={index}>
                  {/* 大会種別 */}
                  <CustomTd>{row.tournTypeName}</CustomTd>
                  {/* 大会名 */}
                  <CustomTd>
                    <Link
                      href={{
                        pathname: '/tournamentRef',
                        query: { tournId: row.tourn_id },
                      }}
                      className='text-primary-300 underline hover:text-primary-50 cursor-pointer'
                      rel='noopener noreferrer'
                      target='_blank'
                    >
                      {row.tourn_name}
                    </Link>
                  </CustomTd>
                  {/* 開催開始日 */}
                  <CustomTd>{row.event_start_date}</CustomTd>
                  {/* 開催終了日 */}
                  <CustomTd>{row.event_end_date}</CustomTd>
                  {/* 開催場所 */}
                  <CustomTd>{row.venue_name}</CustomTd>
                  {/* 主催団体ID */}
                  <CustomTd>
                    <Link
                      href={{
                        pathname: '/teamRef',
                        query: { sponsor_org_id: row.sponsor_org_id },
                      }}
                      className='text-primary-300 underline hover:text-primary-50 cursor-pointer'
                      rel='noopener noreferrer'
                      target='_blank'
                    >
                      {row.sponsor_org_id}
                    </Link>
                  </CustomTd>
                  {/* 主催団体名 */}
                  <CustomTd>
                    <Link
                      href={{
                        pathname: '/teamRef',
                        query: { sponsor_org_id: row.sponsor_org_id },
                      }}
                      className='text-primary-300 underline hover:text-primary-50 cursor-pointer'
                      rel='noopener noreferrer'
                      target='_blank'
                    >
                      {row.sponsorOrgName}
                    </Link>
                  </CustomTd>
                </CustomTr>
              ))}
            </CustomTbody>
          </CustomTable>
        </div>
        <div
          className='flex flex-row justify-center gap-[16px] my-[30px] text-primary-500 font-bold cursor-pointer'
          onClick={loadMoreData}
        >
          <AddIcon /> 10件表示する
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
      </main>
    </div>
  );
}
