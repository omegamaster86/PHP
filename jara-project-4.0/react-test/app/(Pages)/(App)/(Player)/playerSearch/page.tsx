// 機能名: 選手検索
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
  OriginalCheckbox,
} from '@/app/components/';
import { EventResponse, SexResponse, Player } from '@/app/types';
import Divider from '@mui/material/Divider';

// モデルのインポート
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Label from '@/app/components/Label';

// 検索条件フォームの型定義
// 検索条件
interface SearchCond {
  playerName: string;
  sexId: string;
  sex: string;
  jaraPlayerId: string;
  playerId: string;
  startDateOfBirth: string;
  endDateOfBirth: string;
  entrysystemOrgId: string;
  orgId: string;
  orgName: string;
  eventId: string;
  eventName: string;
  raceEventName: string;
  sideInfo: {
    S: boolean;
    B: boolean;
    X: boolean;
    C: boolean;
    N1: boolean;
    N2: boolean;
    N3: boolean;
    N4: boolean;
  };
}

export default function PlayerSearch() {
  // フック
  const router = useRouter();

  // フォームデータを管理する状態
  const [searchCond, setSearchCond] = useState<SearchCond>({
    playerName: '',
    sexId: '',
    sex: '',
    jaraPlayerId: '',
    playerId: '',
    startDateOfBirth: '',
    endDateOfBirth: '',
    entrysystemOrgId: '',
    orgId: '',
    orgName: '',
    eventId: '',
    eventName: '',
    raceEventName: '',
    sideInfo: {
      S: false,
      B: false,
      X: false,
      C: false,
      N1: false,
      N2: false,
      N3: false,
      N4: false,
    },
  } as SearchCond);
  const [searchResponse, setSearchResponse] = useState<Player[]>([]);
  const [visibleData, setVisibleData] = useState<Player[]>([]); // 表示するデータ
  const [visibleItems, setVisibleItems] = useState(10); // 表示するデータの数

  /**
   * 入力フォームの変更時の処理
   * @param name 
   * @param value
   * @description
   * nameとvalueを受け取り、stateを更新する
   */
  const handleInputChange = (name: string, value: string) => {
    setSearchCond((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  /**
   * 検索条件からnull, undefined, 空文字でないプロパティを取得する
   * @returns
   * @param obj
   * @description
   * valueがnull, undefined, 空文字でないプロパティを取得する
   */
  function getNonEmptyProperties(obj: SearchCond): { key: string; value: any }[] {
    return Object.entries(obj)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => ({
        key,
        value,
      }));
  }

  /**
   * 検索ボタン押下時の処理
   * @description
   * 検索ボタン押下時の処理
   * 検索条件を元にAPIを叩いて検索結果を取得する
   * 検索結果をstateにセットする
   */
  const handleSearch = async () => {
    var apiUri = 'http://localhost:3100/playerSearch?';

    getNonEmptyProperties(searchCond).forEach((item) => {
      apiUri += item.key + '=' + item.value + '&';
    });
    apiUri = apiUri.slice(0, -1);

    try {
      const csrf = () => axios.get('/sanctum/csrf-cookie')
      await csrf()
      const response = await axios.get<Player[]>('/playerSearch/');
      const data = response.data;

      if (data.length > 100) {
        window.alert('検索結果が100件を超えました、上位100件を表示しています。');
      }
      // レスポンスからデータを取り出してstateにセット
      setSearchResponse(data);
      // 最初は10件だけ表示
      setVisibleItems(10);
      setVisibleData(data.slice(0, 10));
    } catch (error) {
      setErrorMessage(['API取得エラー:' + (error as Error).message]);
    }
  };

  // ログインユーザーの種別
  const [userType, setUserType] = useState<number>(1);

  const [sponsorOrgIdErrorMessage, setSponsorOrgIdErrorMessage] = useState([] as string[]);

  // ステート変数
  const [isOpen, setIsOpen] = useState(false);
  const [sex, setSex] = useState<SexResponse[]>([]);
  const [event, setEvent] = useState<EventResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState([] as string[]);

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 仮のURL（繋ぎ込み時に変更すること）
        // 性別
        // const sexResponse = await axios.get<SexResponse[]>('http://localhost:3100/sex');
        const csrf = () => axios.get('/sanctum/csrf-cookie')
        await csrf()
        const sexResponse = await axios.get('/getSexList');
        const sexList = sexResponse.data.map(({ sex_id, sex }: { sex_id: number; sex: string }) => ({ id: sex_id, name: sex }));
        setSex(sexList);
        // 種目
        const eventResponse = await axios.get<EventResponse[]>('/event');
        setEvent(eventResponse.data);
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
   * チェックボックスの変更時の処理
   * @description
   * nameとcheckedを受け取り、stateを更新する
   */
  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    const checked = event.target.checked;
    setSearchCond((prevFormData) => ({
      ...prevFormData,
      sideInfo: {
        ...prevFormData.sideInfo,
        [name]: checked,
      },
    }));
  };

  /**
   * アコーディオンの開閉
   * @description
   * isOpenのstateを更新する
   */
  const toggleAccordion = () => {
    setIsOpen(!isOpen);
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
      <main className='flex min-h-screen flex-col justify-start p-[10px] gap-[20px] my-[80px] md:w-[1000px] sm: w-[600px]'>
        <div className='relative flex flex-row justify-between w-full h-screen flex-wrap'>
          {/* 画面名 */}
          <CustomTitle displayBack>選手検索</CustomTitle>
        </div>
        {/* エラーメッセージの表示 */}
        <ErrorBox errorText={errorMessage} />
        <div className='bg-thinContainerBg p-[20px] flex flex-col gap-[12px] border border-border'>
          <div className='flex flex-col justify-start'>
            <div className='flex flex-row justify-start gap-[16px]'>
              {/* 選手名 */}
              <div className='flex flex-col justify-start'>
                <CustomTextField
                  label='選手名'
                  displayHelp={false}
                  value={searchCond.playerName}
                  onChange={(e) => handleInputChange('playerName', e.target.value)}
                />
              </div>
              {/* 性別 */}
              <div className='flex flex-col justify-start gap-[8px]'>
                <InputLabel label='性別' displayHelp={false} />
                <CustomDropdown
                  id='sex'
                  options={sex.map((item) => ({ key: item.id, value: item.name }))}
                  value={searchCond.sexId}
                  errorMessages={[]}
                  onChange={(e) => {
                    handleInputChange('sexId', e);
                    handleInputChange('sex', sex.find((item) => item.id === Number(e))?.name || '');
                  }}
                  className='rounded w-[90px]'
                />
              </div>
              {/* サイド情報 */}
              <div className='flex flex-col justify-start'>
                <InputLabel label='サイド情報' displayHelp />
                <div className='flex flex-row gap-[4px]'>
                  <div className='flex justify-start flex-col gap-[4px] my-1'>
                    <OriginalCheckbox
                      id='checkbox-S'
                      label=': S (ストロークサイド)'
                      value='S'
                      checked={searchCond.sideInfo.S}
                      onChange={handleCheckboxChange}
                    />
                    <OriginalCheckbox
                      id='checkbox-B'
                      label=': B (バウサイド)'
                      value='B'
                      checked={searchCond.sideInfo.B}
                      onChange={handleCheckboxChange}
                    />
                  </div>
                  <div className='flex justify-start flex-col gap-[4px] my-1'>
                    <OriginalCheckbox
                      id='checkbox-X'
                      label=': X (スカル)'
                      value='X'
                      checked={searchCond.sideInfo.X}
                      onChange={handleCheckboxChange}
                    />
                    <OriginalCheckbox
                      id='checkbox-C'
                      label=': C (コックス)'
                      value='C'
                      checked={searchCond.sideInfo.C}
                      onChange={handleCheckboxChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Divider className='w-[900px] h-[1px] bg-border' />
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
            <div className='flex flex-col justify-start gap-[8px]'>
              <div className='flex flex-col justify-start gap-[8px]'>
                <Label label={'選手'} isBold />
                <div className='flex flex-row gap-[16px]'>
                  {/* JARA選手コード */}
                  <CustomTextField
                    type='number'
                    label='JARA選手コード'
                    displayHelp
                    value={searchCond.jaraPlayerId}
                    onChange={(e) => handleInputChange('jaraPlayerId', e.target.value)}
                  />
                  {/* 選手ID */}
                  <CustomTextField
                    type='number'
                    label='選手ID'
                    displayHelp
                    value={searchCond.playerId}
                    onChange={(e) => handleInputChange('playerId', e.target.value)}
                  />
                  <div className='flex flex-col justify-start gap-[8px]'>
                    <InputLabel label='生年月日' />
                    <div className='flex flex-row gap-[8px]'>
                      {/* 生年月日（開始年） */}
                      <div className='flex flex-col justify-start'>
                        <CustomDatePicker
                          placeHolder={new Date().toLocaleDateString('ja-JP')}
                          selectedDate={searchCond.startDateOfBirth}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            handleInputChange('startDateOfBirth', formatDate(e as unknown as Date));
                          }}
                        />
                      </div>
                      <Label label='~' isBold />
                      {/* 生年月日（終了年） */}
                      <div className='flex flex-col justify-start gap-[8px] self-end'>
                        <CustomDatePicker
                          placeHolder={new Date().toLocaleDateString('ja-JP')}
                          selectedDate={searchCond.endDateOfBirth}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            handleInputChange('endDateOfBirth', formatDate(e as unknown as Date));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex flex-col justify-start gap-[8px]'>
                <Label label={'団体'} isBold />
                <div className='flex flex-row justify-start gap-[12px]'>
                  {/* エントリーシステムの団体ID */}
                  {/* 仮実装。ユーザー種別による表示制御 */}
                  {userType === 1 && (
                    <div className='flex flex-col justify-start'>
                      <CustomTextField
                        label='エントリーシステムの団体ID'
                        type='number'
                        displayHelp
                        value={searchCond.entrysystemOrgId}
                        onChange={(e) => handleInputChange('entrysystemOrgId', e.target.value)}
                      />
                    </div>
                  )}
                  {/* 団体ID */}
                  <div className='flex flex-col justify-start'>
                    <CustomTextField
                      label='団体ID'
                      type='number'
                      displayHelp
                      isError={sponsorOrgIdErrorMessage.length > 0}
                      errorMessages={sponsorOrgIdErrorMessage}
                      value={searchCond.orgId}
                      onChange={(e) => handleInputChange('orgId', e.target.value)}
                    />
                  </div>
                  {/* 団体名 */}
                  <div className='flex flex-col justify-start'>
                    <CustomTextField
                      label='団体名'
                      displayHelp
                      value={searchCond.orgName}
                      onChange={(e) => handleInputChange('orgName', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className='flex flex-col justify-start gap-[8px]'>
                <Label label={'大会'} isBold />
                <div className='flex flex-row justify-start gap-[12px]'>
                  {/* 出漕種目 */}
                  <div className='flex flex-col justify-start gap-[8px]'>
                    <InputLabel label='出漕種目' displayHelp={false} />
                    <CustomDropdown
                      id='event'
                      options={event.map((item) => ({ key: item.id, value: item.name }))}
                      value={searchCond.eventId}
                      placeHolder='未選択'
                      onChange={(e) => {
                        handleInputChange('eventId', e);
                        handleInputChange(
                          'eventName',
                          event.find((item) => item.id === Number(e))?.name || '',
                        );
                      }}
                      className='rounded w-[90px]'
                    />
                  </div>
                  {/* 出漕大会名 */}
                  <div className='flex flex-col justify-start'>
                    <CustomTextField
                      label='出漕大会名'
                      displayHelp={false}
                      isError={sponsorOrgIdErrorMessage.length > 0}
                      errorMessages={sponsorOrgIdErrorMessage}
                      value={searchCond.raceEventName}
                      onChange={(e) => handleInputChange('raceEventName', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <Divider className='w-[900px] h-[1px] bg-border' />
          <div className='flex flex-col justify-start'>
            <div className='flex flex-row justify-center gap-[4px]'>
              {/* 検索 */}
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
                    playerName: '',
                    sexId: '',
                    sex: '',
                    jaraPlayerId: '',
                    playerId: '',
                    startDateOfBirth: '',
                    endDateOfBirth: '',
                    entrysystemOrgId: '',
                    orgId: '',
                    orgName: '',
                    eventId: '',
                    eventName: '',
                    raceEventName: '',
                    sideInfo: {
                      S: false,
                      B: false,
                      X: false,
                      C: false,
                      N1: false,
                      N2: false,
                      N3: false,
                      N4: false,
                    },
                  } as SearchCond);
                }}
                className='w-[200px]'
              >
                クリア
              </CustomButton>
            </div>
          </div>
        </div>
        {/* TODO ヘッダー固定 */}
        {/* 選手一覧テーブル表示 */}
        <div className='overflow-auto'>
          <CustomTable>
            {/* 選手一覧テーブルヘッダー表示 */}
            <CustomThead>
              <CustomTr>
                <CustomTh>選手画像</CustomTh>
                <CustomTh>選手名</CustomTh>
                <CustomTh>JARA選手コード</CustomTh>
                <CustomTh>選手ID</CustomTh>
                <CustomTh>性別</CustomTh>
                <CustomTh>エントリーシステムの団体ID</CustomTh>
                <CustomTh>団体ID1</CustomTh>
                <CustomTh>所属団体名1</CustomTh>
                <CustomTh>団体ID2</CustomTh>
                <CustomTh>所属団体名2</CustomTh>
                <CustomTh>団体ID3</CustomTh>
                <CustomTh>所属団体名3</CustomTh>
              </CustomTr>
            </CustomThead>
            {/* 大会一覧テーブル明細表示 */}
            <CustomTbody>
              {visibleData.map((row, index) => (
                <CustomTr index={index} key={index}>
                  <CustomTd>
                    <img
                      src={row.photo}
                      width={100}
                      height={100}
                      alt='Random'
                      className='rounded-full'
                    />
                  </CustomTd>
                  {/* TODO 仮実装なので、以下リンク設定があるものには、遷移時に必要なパラメータを設定 */}
                  {/* 選手名 */}
                  <CustomTd transitionDest={'/playerInfomationRef?playerId=' + row.player_id}>
                    {row.player_name}
                  </CustomTd>
                  {/* JARA選手コード */}
                  <CustomTd transitionDest={'/playerInfomationRef?playerId=' + row.player_id}>
                    {row.jara_player_id}
                  </CustomTd>
                  {/* 選手ID */}
                  <CustomTd transitionDest={'/playerInfomationRef?playerId=' + row.player_id}>
                    {row.player_id}
                  </CustomTd>
                  {/* 性別 */}
                  <CustomTd>{row.sex}</CustomTd>
                  {/* エントリーシステムの団体ID */}
                  <CustomTd
                    transitionDest={'/teamInfomationRef?entrysystemRaceId=' + row.entrysystemRaceId}
                  >
                    {row.entrysystemRaceId}
                  </CustomTd>
                  {/* 団体ID1 */}
                  <CustomTd transitionDest={'/teamInfomationRef?orgId=' + row.orgId1}>
                    {row.orgId1}
                  </CustomTd>
                  {/* 所属団体名1 */}
                  <CustomTd transitionDest={'/teamInfomationRef?orgId=' + row.orgId1}>
                    {row.orgName1}
                  </CustomTd>
                  {/* 団体ID2 */}
                  <CustomTd transitionDest={'/teamInfomationRef?orgId=' + row.orgId2}>
                    {row.orgId2}
                  </CustomTd>
                  {/* 所属団体名2 */}
                  <CustomTd transitionDest={'/teamInfomationRef?orgId=' + row.orgId2}>
                    {row.orgName2}
                  </CustomTd>
                  {/* 団体ID3 */}
                  <CustomTd transitionDest={'/teamInfomationRef?orgId=' + row.orgId3}>
                    {row.orgId3}
                  </CustomTd>
                  {/* 所属団体名3 */}
                  <CustomTd transitionDest={'/teamInfomationRef?orgId=' + row.orgId3}>
                    {row.orgName3}
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
