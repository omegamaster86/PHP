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
import Divider from '@mui/material/Divider';
// モデルのインポート
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { formatDate } from '@/app/utils/dateUtil';

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
  const router = useRouter();

  // フォームデータを管理する状態
  const [searchCond, setSearchCond] = useState<SearchCond>({
    jara_player_id: '',
    player_id: '',
    player_name: '',
    tourn_name: '',
    tourn_type: '',
    tournTypeName: '',
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

  // 大会名のソート用 20240707
  const [tournamentNameSortFlag, setTournamentNameSortFlag] = useState(false);
  const tournamentNameSort = () => {
    if (tournamentNameSortFlag) {
      setTournamentNameSortFlag(false);
      visibleData.sort((a: any | number | bigint, b: any | number | bigint) =>
        ('' + a.tourn_name).localeCompare(b.tourn_name),
      );
    } else {
      setTournamentNameSortFlag(true);
      visibleData.sort((a: any | number | bigint, b: any | number | bigint) =>
        ('' + b.tourn_name).localeCompare(a.tourn_name),
      );
    }
  };
  // 開催開始日のソート用 20240707
  const [startDateSortFlag, setStartDateSortFlag] = useState(false);
  const startDateSort = () => {
    if (startDateSortFlag) {
      setStartDateSortFlag(false);
      visibleData.sort(
        (a: any | number | bigint, b: any | number | bigint) =>
          Number(a.event_start_date.replace(/[- :]/g, '')) -
          Number(b.event_start_date.replace(/[- :]/g, '')),
      );
    } else {
      setStartDateSortFlag(true);
      visibleData.sort(
        (a: any | number | bigint, b: any | number | bigint) =>
          Number(b.event_start_date.replace(/[- :]/g, '')) -
          Number(a.event_start_date.replace(/[- :]/g, '')),
      );
    }
  };
  // 開催終了日のソート用 20240707
  const [endDateSortFlag, setEndDateSortFlag] = useState(false);
  const endtDateSort = () => {
    if (endDateSortFlag) {
      setEndDateSortFlag(false);
      visibleData.sort(
        (a: any | number | bigint, b: any | number | bigint) =>
          Number(a.event_end_date.replace(/[- :]/g, '')) -
          Number(b.event_end_date.replace(/[- :]/g, '')),
      );
    } else {
      setEndDateSortFlag(true);
      visibleData.sort(
        (a: any | number | bigint, b: any | number | bigint) =>
          Number(b.event_end_date.replace(/[- :]/g, '')) -
          Number(a.event_end_date.replace(/[- :]/g, '')),
      );
    }
  };
  // 主催団体IDのソート用 20240707
  const [sponsorOrgIdFlag, setsponsorOrgIdFlag] = useState(false);
  const sponsorOrgIdSort = () => {
    if (sponsorOrgIdFlag) {
      setsponsorOrgIdFlag(false);
      visibleData.sort(
        (a: any | number | bigint, b: any | number | bigint) => a.sponsor_org_id - b.sponsor_org_id,
      );
    } else {
      setsponsorOrgIdFlag(true);
      visibleData.sort(
        (a: any | number | bigint, b: any | number | bigint) => b.sponsor_org_id - a.sponsor_org_id,
      );
    }
  };
  // 主催団体名のソート用 20240707
  const [sponsorOrgNameFlag, setSponsorOrgNameFlag] = useState(false);
  const sponsorOrgNameSort = () => {
    if (sponsorOrgNameFlag) {
      setSponsorOrgNameFlag(false);
      visibleData.sort((a: any | number | bigint, b: any | number | bigint) =>
        ('' + a.sponsorOrgName).localeCompare(b.sponsorOrgName),
      );
    } else {
      setSponsorOrgNameFlag(true);
      visibleData.sort((a: any | number | bigint, b: any | number | bigint) =>
        ('' + b.sponsorOrgName).localeCompare(a.sponsorOrgName),
      );
    }
  };

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
    try {
      const response = await axios.post('api/searchTournament', searchCond);
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
        const tourTypeResponse = await axios.get('api/getApprovalType');
        const tourTypeList = tourTypeResponse.data.map(
          ({
            appro_type_id,
            appro_type_id_name,
          }: {
            appro_type_id: number;
            appro_type_id_name: string;
          }) => ({ id: appro_type_id, name: appro_type_id_name }),
        );
        setTourType(tourTypeList);

        const venueResponse = await axios.get('api/getVenueList');
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
    <>
      <CustomTitle displayBack>大会検索</CustomTitle>
      {/* エラーメッセージの表示 */}
      <ErrorBox errorText={[]} />
      <div className='bg-thinContainerBg p-[20px]'>
        <div className='flex flex-col gap-[16px]'>
          <div className='w-full flex flex-col sm:flex-row gap-[16px]'>
            {/* 大会名 */}
            <CustomTextField
              label='大会名'
              placeHolder='大会名'
              displayHelp={false}
              isError={false}
              errorMessages={[]}
              value={searchCond.tourn_name}
              className='border-[0.5px] border-solid border-gray-50 rounded'
              onChange={(e) => handleInputChange('tourn_name', e.target.value)}
              widthClassName='w-full md:w-2/3'
            />
            {/* 大会種別 */}
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
              className='border-[0.5px] border-solid border-gray-50 rounded'
              widthClassName='w-full md:w-1/3'
            />
          </div>
          {/* 開催場所 */}
          <div className='w-full'>
            <CustomDropdown
              id='venueId'
              label='開催場所'
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
              className='border-[0.5px] border-solid border-gray-50 rounded'
            />
          </div>
          <div className='flex flex-row justify-center sm:justify-start gap-[16px]'>
            {/* 開催開始年月日 */}
            <div className='flex flex-col gap-[6px]'>
              <InputLabel label='開催年月日' /> {/* 外側のラベル */}
              <div className='flex flex-row gap-[16px]'>
                <CustomDatePicker
                  placeHolder={'YYYY/MM/DD'}
                  selectedDate={searchCond.event_start_date}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    handleInputChange(
                      'event_start_date',
                      formatDate(e as unknown as string, 'yyyy/MM/dd'),
                    );
                  }}
                />
                <p className='flex flex-col justify-center text-center '>～</p>
                <CustomDatePicker
                  placeHolder={'YYYY/MM/DD'}
                  selectedDate={searchCond.event_end_date}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    handleInputChange(
                      'event_end_date',
                      formatDate(e as unknown as string, 'yyyy/MM/dd'),
                    );
                  }}
                />
              </div>
            </div>
          </div>
          <Divider className='h-[1px] bg-border' />
          <CustomButton
            buttonType='secondary'
            onClick={toggleAccordion}
            className='flex flex-row justify-center items-center gap-[4px] w-full'
          >
            <div className='font-bold'>もっと詳しく検索</div>
            {isOpen ? <RemoveIcon /> : <AddIcon />}
          </CustomButton>

          {isOpen && (
            <div className='flex flex-col gap-[16px]'>
              <Label label='選手情報' isBold />
              <div className='flex flex-col sm:flex-row gap-[16px]'>
                {/* JARA選手コード */}
                <CustomTextField
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
            <div className='flex flex-col gap-[16px]'>
              <Label label='主催団体' isBold />
              <div className='flex flex-col sm:flex-row gap-[16px]'>
                {/* 主催団体ID */}
                <CustomTextField
                  label='主催団体ID'
                  placeHolder='主催団体ID'
                  displayHelp={false}
                  value={searchCond.sponsor_org_id}
                  onChange={(e) => handleInputChange('sponsor_org_id', e.target.value)}
                />
                {/* 主催団体名 */}
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
          )}
          <Divider></Divider>
          <div className='flex flex-col items-center sm:flex-row justify-center gap-4'>
            <CustomButton
              buttonType='primary'
              onClick={() => {
                handleSearch();
              }}
              className='flex flex-row items-center justify-center gap-[4px]'
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
                  event_start_date: '',
                  event_end_date: '',
                  venue_id: '',
                  venue_name: '',
                  sponsor_org_id: '',
                  sponsorOrgName: '',
                } as SearchCond);
              }}
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
              <CustomTh align='left'>大会種別</CustomTh>
              <CustomTh align='left'>
                <div
                  className='underline'
                  style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                  onClick={() => tournamentNameSort()}
                >
                  大会名
                </div>
              </CustomTh>
              <CustomTh align='left'>
                <div
                  className='underline'
                  style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                  onClick={() => startDateSort()}
                >
                  開催開始日
                </div>
              </CustomTh>
              <CustomTh align='left'>
                <div
                  className='underline'
                  style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                  onClick={() => endtDateSort()}
                >
                  開催終了日
                </div>
              </CustomTh>
              <CustomTh align='left'>開催場所</CustomTh>
              <CustomTh align='left'>
                <div
                  className='underline'
                  style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                  onClick={() => sponsorOrgIdSort()}
                >
                  主催団体ID
                </div>
              </CustomTh>
              <CustomTh align='left'>
                <div
                  className='underline'
                  style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
                  onClick={() => sponsorOrgNameSort()}
                >
                  主催団体名
                </div>
              </CustomTh>
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
                <CustomTd>{formatDate(row.event_start_date, 'yyyy/MM/dd')}</CustomTd>
                {/* 開催終了日 */}
                <CustomTd>{formatDate(row.event_end_date, 'yyyy/MM/dd')}</CustomTd>
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
    </>
  );
}
