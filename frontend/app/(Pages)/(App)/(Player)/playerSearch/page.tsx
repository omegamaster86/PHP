// 機能名: 選手検索
'use client';

// Reactおよび関連モジュールのインポート
import React, { useState, useEffect, ChangeEvent, useMemo } from 'react';
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
  CustomTr,
  CustomTh,
  CustomTbody,
  CustomTd,
  OriginalCheckbox,
} from '@/app/components/';
import { EventResponse, SexResponse, Player, UserIdType } from '@/app/types';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
// モデルのインポート
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Label from '@/app/components/Label';
import { CustomPlayerAvatar } from '@/app/components/CustomPlayerAvatar';
import { formatDate } from '@/app/utils/dateUtil';
import { SortableHeader } from '@/app/components/SortableHeader';
import { useSort } from '@/app/hooks/useSort';

// 検索条件フォームの型定義
// 検索条件
interface SearchCond {
  player_id: string;
  player_name: string;
  jara_player_id: string;
  sexId: string;
  sex: string;
  startDateOfBirth: string;
  endDateOfBirth: string;
  entrysystem_org_id: string;
  org_id: string;
  org_name: string;
  event_id: string;
  event_name: string;
  race_class_name: string;
  side_info: {
    N1: boolean;
    N2: boolean;
    N3: boolean;
    Coastal: boolean;
    S: boolean;
    B: boolean;
    X: boolean;
    C: boolean;
  };
}

const createSortFunctions = (
  handleSort: (key: string, compareFn: (a: any, b: any) => number) => void,
) => ({
  playerName: () =>
    handleSort('player_name', (a, b) => ('' + a.player_name).localeCompare(b.player_name)),
  jaraPlayerId: () =>
    handleSort('jara_player_id', (a, b) => Number(a.jara_player_id) - Number(b.jara_player_id)),
  playerId: () => handleSort('player_id', (a, b) => Number(a.player_id) - Number(b.player_id)),
  sex: () => handleSort('sex', (a, b) => ('' + a.sex).localeCompare(b.sex)),
});

export default function PlayerSearch() {
  // フック
  const router = useRouter();

  // フォームデータを管理する状態
  const [searchCond, setSearchCond] = useState<SearchCond>({
    player_name: '',
    sexId: '',
    sex: '',
    jara_player_id: '',
    player_id: '',
    startDateOfBirth: '',
    endDateOfBirth: '',
    entrysystem_org_id: '',
    org_id: '',
    org_name: '',
    event_id: '',
    event_name: '',
    race_class_name: '',
    side_info: {
      N1: false,
      N2: false,
      N3: false,
      Coastal: false,
      S: false,
      B: false,
      X: false,
      C: false,
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
   */

  /**
   * 検索ボタン押下時の処理
   * @description
   * 検索ボタン押下時の処理
   * 検索条件を元にAPIを叩いて検索結果を取得する
   * 検索結果をstateにセットする
   */
  const handleSearch = async () => {
    try {
      const response = await axios.post('api/playerSearch', searchCond);
      const data = response.data.result;
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

  const [sponsorOrgIdErrorMessage, setSponsorOrgIdErrorMessage] = useState([] as string[]);

  // ステート変数
  const [isOpen, setIsOpen] = useState(false);
  const [sex, setSex] = useState<SexResponse[]>([]);
  const [event, setEvent] = useState<EventResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [userIdType, setUserIdType] = useState({} as UserIdType); //ユーザIDに紐づいた情報 20240222

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 性別
        const sexResponse = await axios.get('api/getSexList');
        const sexList = sexResponse.data.map(
          ({ sex_id, sex }: { sex_id: number; sex: string }) => ({ id: sex_id, name: sex }),
        );
        setSex(sexList);
        // 種目
        const eventResponse = await axios.get('api/getEvents');
        const eventResponseList = eventResponse.data.map(
          ({ event_id, event_name }: { event_id: number; event_name: string }) => ({
            id: event_id,
            name: event_name,
          }),
        );
        setEvent(eventResponseList);

        const playerInf = await axios.get('api/getIDsAssociatedWithUser');
        setUserIdType(playerInf.data.result[0]); //ユーザIDに紐づいた情報 20240222
      } catch (error) {
        setErrorMessage(['API取得エラー:' + (error as Error).message]);
      }
    };
    fetchData();
  }, []);

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
      side_info: {
        ...prevFormData.side_info,
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

  const { sortState, handleSort } = useSort<Player>({
    currentData: visibleData,
    onSort: setVisibleData,
  });

  const sortFunctions = useMemo(() => createSortFunctions(handleSort), [handleSort]);

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
      {/* 画面名 */}
      <CustomTitle displayBack>選手検索</CustomTitle>
      {/* エラーメッセージの表示 */}
      <ErrorBox errorText={errorMessage} />
      <div className='bg-thinContainerBg p-[20px] flex flex-col gap-[12px] border border-border'>
        <div className='flex flex-col sm:flex-row gap-[16px]'>
          {/* 選手名 */}
          <CustomTextField
            label='選手名'
            displayHelp={false}
            value={searchCond.player_name}
            onChange={(e) => handleInputChange('player_name', e.target.value)}
          />
          {/* 性別 */}

          <CustomDropdown
            id='sex'
            label='性別'
            displayHelp={false}
            options={sex.map((item) => ({ key: item.id, value: item.name }))}
            value={searchCond.sexId}
            errorMessages={[]}
            onChange={(e) => {
              handleInputChange('sexId', e);
              handleInputChange('sex', sex.find((item) => item.id === Number(e))?.name || '');
            }}
            widthClassName='sm:w-[200px]'
            className='rounded'
          />
          {/* サイド情報 */}
          <div>
            <InputLabel
              label='サイド情報'
              displayHelp
              toolTipText='選手が担当する役割になります。' //はてなボタン用
            />
            <div className='flex flex-wrap flex-col sm:flex-row sm:gap-[4px] '>
              <OriginalCheckbox
                id='checkbox-S'
                label=': S (ストロークサイド)'
                value='S'
                checked={searchCond.side_info.S}
                onChange={handleCheckboxChange}
              />
              <OriginalCheckbox
                id='checkbox-B'
                label=': B (バウサイド)'
                value='B'
                checked={searchCond.side_info.B}
                onChange={handleCheckboxChange}
              />
              <OriginalCheckbox
                id='checkbox-X'
                label=': X (スカル)'
                value='X'
                checked={searchCond.side_info.X}
                onChange={handleCheckboxChange}
              />
              <OriginalCheckbox
                id='checkbox-C'
                label=': C (コックス)'
                value='C'
                checked={searchCond.side_info.C}
                onChange={handleCheckboxChange}
              />
              <OriginalCheckbox
                id='checkbox-Coastal'
                label=': コースタル'
                value='Coastal'
                checked={searchCond.side_info.Coastal}
                onChange={handleCheckboxChange}
              />
            </div>
          </div>
        </div>
        <Divider className='h-[1px] bg-border' />
        <div className='flex flex-col items-center'>
          <CustomButton
            buttonType='secondary'
            onClick={toggleAccordion}
            className='flex flex-row items-center justify-center w-full gap-[4px]'
          >
            <div className='font-bold '>もっと詳しく検索</div>
            {isOpen ? <RemoveIcon /> : <AddIcon />}
          </CustomButton>
        </div>
        {isOpen && (
          <div className='flex flex-col gap-[8px]'>
            <Label label={'選手'} isBold />
            <div className='flex flex-col sm:flex-row gap-[16px]'>
              {/* JARA選手コード */}
              <CustomTextField
                type='number'
                label='選手コード'
                displayHelp
                value={searchCond.jara_player_id}
                onChange={(e) => handleInputChange('jara_player_id', e.target.value)}
                toolTipText='日本ローイング協会より発行された、12桁の選手コードになります。' //はてなボタン用
              />
              {/* 選手ID */}
              <CustomTextField
                type='number'
                label='選手ID'
                displayHelp
                value={searchCond.player_id}
                onChange={(e) => handleInputChange('player_id', e.target.value)}
                toolTipText='本システムでの選手情報管理用のIDとなります。
                    選手情報参照画面にて確認できます。' //はてなボタン用
              />
              <div className='flex flex-col gap-[8px]'>
                <InputLabel label='生年月日' />
                <div className='flex flex-row gap-[8px]'>
                  {/* 生年月日（開始年） */}
                  <CustomDatePicker
                    selectedDate={searchCond.startDateOfBirth}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      handleInputChange(
                        'startDateOfBirth',
                        formatDate(e as unknown as string, 'yyyy/MM/dd'),
                      );
                    }}
                  />
                  <p className='flex flex-col justify-center items-center text-center'>～</p>
                  {/* 生年月日（終了年） */}
                  <CustomDatePicker
                    selectedDate={searchCond.endDateOfBirth}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      handleInputChange(
                        'endDateOfBirth',
                        formatDate(e as unknown as string, 'yyyy/MM/dd'),
                      );
                    }}
                  />
                </div>
              </div>
            </div>
            <Label label={'団体'} isBold />
            <div className='flex flex-col sm:flex-row gap-[12px] sm:items-center'>
              {/* エントリーシステムの団体ID */}
              {/* ユーザー種別による表示制御 */}
              {(userIdType.is_administrator == 1 ||
                userIdType.is_jara == 1 ||
                userIdType.is_pref_boat_officer == 1 ||
                userIdType.is_organization_manager == 1) && (
                <CustomTextField
                  label='エントリーシステムID'
                  type='number'
                  displayHelp
                  value={searchCond.entrysystem_org_id}
                  onChange={(e) => handleInputChange('entrysystem_org_id', e.target.value)}
                  toolTipText='日本ローイング協会より発行された、6桁の団体コードになります。選手が所属している団体のコードを入力してください。' //はてなボタン用
                  widthClassName='sm:w-[200px]'
                />
              )}
              {/* 団体ID */}
              <CustomTextField
                label='団体ID'
                type='number'
                displayHelp
                isError={sponsorOrgIdErrorMessage.length > 0}
                errorMessages={sponsorOrgIdErrorMessage}
                value={searchCond.org_id}
                onChange={(e) => handleInputChange('org_id', e.target.value)}
                widthClassName='sm:w-[150px]'
                toolTipText='本システムでの団体情報管理用のIDとなります。
                      選手が所属している団体のIDを入力してください。
                      団体情報参照画面にて確認できます。' //はてなボタン用
              />
              {/* 団体名 */}
              <CustomTextField
                label='団体名'
                displayHelp={false}
                value={searchCond.org_name}
                onChange={(e) => handleInputChange('org_name', e.target.value)}
                widthClassName='sm:w-[250px]'
              />
            </div>
            <Label label={'大会'} isBold />
            <div className='flex flex-col sm:flex-row gap-[12px] '>
              {/* 出漕種目 */}
              <CustomDropdown
                id='event'
                label='出漕種目'
                displayHelp={false}
                options={event.map((item) => ({ key: item.id, value: item.name }))}
                value={searchCond.event_id}
                placeHolder='未選択'
                onChange={(e) => {
                  handleInputChange('event_id', e);
                  handleInputChange(
                    'eventName',
                    event.find((item) => item.id === Number(e))?.name || '',
                  );
                }}
                widthClassName='sm:w-[150px]'
                className='rounded'
              />
              {/* 出漕大会名 */}
              <CustomTextField
                label='出漕大会名'
                displayHelp={false}
                isError={sponsorOrgIdErrorMessage.length > 0}
                errorMessages={sponsorOrgIdErrorMessage}
                value={searchCond.race_class_name}
                onChange={(e) => handleInputChange('race_class_name', e.target.value)}
                widthClassName='sm:w-[250px]'
              />
            </div>
          </div>
        )}
        <Divider className='h-[1px] bg-border' />
        <div className='flex flex-col justify-start'>
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            {/* 検索 */}
            <CustomButton
              buttonType='primary'
              onClick={() => {
                handleSearch();
              }}
              className='flex justify-center items-center gap-[4px]'
            >
              <SearchIcon />
              <div>検索</div>
            </CustomButton>
            <CustomButton
              buttonType='secondary'
              onClick={() => {
                setSearchCond({
                  player_name: '',
                  sexId: '',
                  sex: '',
                  jara_player_id: '',
                  player_id: '',
                  startDateOfBirth: '',
                  endDateOfBirth: '',
                  entrysystem_org_id: '',
                  org_id: '',
                  org_name: '',
                  event_id: '',
                  event_name: '',
                  race_class_name: '',
                  side_info: {
                    N1: false,
                    N2: false,
                    N3: false,
                    Coastal: false,
                    S: false,
                    B: false,
                    X: false,
                    C: false,
                  },
                } as SearchCond);
              }}
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
              <CustomTh>
                <SortableHeader
                  column='player_name'
                  label='選手名'
                  sortState={sortState}
                  onSort={sortFunctions.playerName}
                />
              </CustomTh>
              <CustomTh>
                <SortableHeader
                  column='jara_player_id'
                  label='JARA選手コード'
                  sortState={sortState}
                  onSort={sortFunctions.jaraPlayerId}
                />
              </CustomTh>
              <CustomTh>
                <SortableHeader
                  column='player_id'
                  label='選手ID'
                  sortState={sortState}
                  onSort={sortFunctions.playerId}
                />
              </CustomTh>
              <CustomTh>
                <SortableHeader
                  column='sex'
                  label='性別'
                  sortState={sortState}
                  onSort={sortFunctions.sex}
                />
              </CustomTh>
              <CustomTh>エントリーシステムの団体ID1</CustomTh>
              <CustomTh>団体ID1</CustomTh>
              <CustomTh>所属団体名1</CustomTh>
              <CustomTh>エントリーシステムの団体ID2</CustomTh>
              <CustomTh>団体ID2</CustomTh>
              <CustomTh>所属団体名2</CustomTh>
              <CustomTh>エントリーシステムの団体ID3</CustomTh>
              <CustomTh>団体ID3</CustomTh>
              <CustomTh>所属団体名3</CustomTh>
            </CustomTr>
          </CustomThead>
          {/* 大会一覧テーブル明細表示 */}
          <CustomTbody>
            {visibleData.map((row, index) => (
              <CustomTr index={index} key={index}>
                <CustomTd align='center'>
                  <CustomPlayerAvatar
                    fileName={row.photo}
                    alt={row.player_name}
                    sx={{
                      width: 40,
                      height: 40,
                      fontSize: 14,
                    }}
                  />
                </CustomTd>
                {/* TODO 仮実装なので、以下リンク設定があるものには、遷移時に必要なパラメータを設定 */}
                {/* 選手名 */}
                <CustomTd>
                  <Link
                    className='text-primary-300 underline hover:text-primary-50'
                    href={{
                      pathname: '/playerInformationRef',
                      query: { playerId: row.player_id },
                    }}
                  >
                    {row.player_name}
                  </Link>
                </CustomTd>
                {/* JARA選手コード */}
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/playerInformationRef',
                      query: { playerId: row.player_id },
                    }}
                  >
                    {row.jara_player_id}
                  </Link>
                </CustomTd>
                {/* 選手ID */}
                <CustomTd>
                  <Link
                    className='text-primary-300 underline hover:text-primary-50'
                    href={{
                      pathname: '/playerInformationRef',
                      query: { playerId: row.player_id },
                    }}
                  >
                    {row.player_id}
                  </Link>
                </CustomTd>
                {/* 性別 */}
                <CustomTd>{row.sex}</CustomTd>
                {/* エントリーシステムの団体ID1 */}
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/teamRef',
                      query: { orgId: row.orgId1 },
                    }}
                  >
                    {row.entrysystemOrgId1}
                  </Link>
                </CustomTd>
                {/* 団体ID1 */}
                <CustomTd>
                  <Link
                    className='text-primary-300 underline hover:text-primary-50'
                    href={{
                      pathname: '/teamRef',
                      query: { orgId: row.orgId1 },
                    }}
                  >
                    {row.orgId1}
                  </Link>
                </CustomTd>
                {/* 所属団体名1 */}
                <CustomTd>
                  <Link
                    className='text-primary-300 underline hover:text-primary-50'
                    href={{
                      pathname: '/teamRef',
                      query: { orgId: row.orgId1 },
                    }}
                  >
                    {row.orgName1}
                  </Link>
                </CustomTd>
                {/* エントリーシステムの団体ID2 */}
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/teamRef',
                      query: { orgId: row.orgId2 },
                    }}
                  >
                    {row.entrysystemOrgId2}
                  </Link>
                </CustomTd>
                {/* 団体ID2 */}
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/teamRef',
                      query: { orgId: row.orgId2 },
                    }}
                  >
                    {row.orgId2}
                  </Link>
                </CustomTd>
                {/* 所属団体名2 */}
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/teamRef',
                      query: { orgId: row.orgId2 },
                    }}
                  >
                    {row.orgName2}
                  </Link>
                </CustomTd>
                {/* エントリーシステムの団体ID3 */}
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/teamRef',
                      query: { orgId: row.orgId3 },
                    }}
                  >
                    {row.entrysystemOrgId3}
                  </Link>
                </CustomTd>
                {/* 団体ID3 */}
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/teamRef',
                      query: { orgId: row.orgId3 },
                    }}
                  >
                    {row.orgId3}
                  </Link>
                </CustomTd>
                {/* 所属団体名3 */}
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/teamRef',
                      query: { orgId: row.orgId3 },
                    }}
                  >
                    {row.orgName3}
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
