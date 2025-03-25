// 機能名: 大会情報参照画面・大会情報削除画面
'use client';

import { TitleSideButton } from '@/app/(Pages)/(App)/_components/TitleSideButton';
import {
  CustomButton,
  CustomTable,
  CustomTbody,
  CustomTd,
  CustomTh,
  CustomThead,
  CustomTitle,
  CustomTr,
  ErrorBox,
  Label,
} from '@/app/components';
import FollowButton from '@/app/components/FollowButton';
import { useUserType } from '@/app/hooks/useUserType';
import axios from '@/app/lib/axios';
import { fetcher } from '@/app/lib/swr';
import { CheckOrgManager, CheckOrgManagerRequest, Race, Tournament, UserIdType } from '@/app/types';
import { ROLE } from '@/app/utils/consts';
import { TOURNAMENT_PDF_URL } from '@/app/utils/imageUrl';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Autocomplete, Chip, TextField } from '@mui/material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { formatDate } from '@/app/utils/dateUtil';
import { useSort } from '@/app/hooks/useSort';
import { SortableHeader } from '@/app/components/SortableHeader';

const sendCheckOrgManagerRequest = async (
  url: string,
  trigger: { arg: CheckOrgManagerRequest },
) => {
  return fetcher<CheckOrgManager>({
    url,
    method: 'POST',
    data: trigger.arg,
  });
};

//レース名フィルター用
interface RaceNameList {
  id: number;
  name: string;
}
//種目フィルター用
interface EventNameList {
  id: number;
  name: string;
}
//組別フィルター用
interface ByGroupList {
  id: number;
  name: string;
}
//距離フィルター用
interface RangeList {
  id: number;
  name: string;
}

// 大会情報参照画面
export default function TournamentRef() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkOrgManagerMutation = useSWRMutation('api/checkOrgManager', sendCheckOrgManagerRequest);

  // modeの値を取得
  const mode = searchParams.get('mode');
  switch (mode) {
    case 'delete':
      break;
    default:
      break;
  }
  const isDeleteMode = mode === 'delete';
  const tournId = searchParams.get('tournId')?.toString();

  useUserType({
    onSuccess: async (userType) => {
      if (isDeleteMode) {
        const sendData: CheckOrgManagerRequest = {
          tournId: Number(tournId),
        };
        const res = await checkOrgManagerMutation.trigger(sendData);
        const { isOrgManager } = res.result;

        const hasAuthority = userType?.isAdministrator || isOrgManager;

        if (!hasAuthority) {
          router.replace('/tournamentSearch');
        }
      }
    },
  });

  // フォームデータを管理する状態
  const [tableData, setTableData] = useState<Race[]>([]);

  // 大会情報を管理する状態
  const [tournamentFormData, setTournamentFormData] = useState<Tournament>({
    tourn_id: '',
    entrysystem_tourn_id: '',
    tourn_name: '',
    tourn_type: '',
    tournTypeName: '',
    sponsor_org_id: '',
    sponsorOrgName: '',
    event_start_date: '',
    event_end_date: '',
    venue_id: 0,
    venue_name: '',
    tourn_url: '',
    tourn_info_faile_path: '',
  });

  const [followStatus, setFollowStatus] = useState({
    isFollowed: false,
    followerCount: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // レース結果情報のデータステート
  //レース名
  const [raceNameList, setRaceNameList] = useState<RaceNameList[]>([]);
  const [selectedRaceNameList, setSelectedRaceNameList] = useState<RaceNameList[]>([]);
  //種目
  const [eventNameList, setEventNameList] = useState<EventNameList[]>([]);
  const [selectedEventNameList, setSelectedEventNameList] = useState<EventNameList[]>([]);
  //組別
  const [byGroupList, setByGroupList] = useState<ByGroupList[]>([]);
  const [selectedByGroupList, setSelectedByGroupList] = useState<ByGroupList[]>([]);
  //距離
  const [rangeList, setRangeList] = useState<RangeList[]>([]);
  const [selectedRangeList, setSelectedRangeList] = useState<RangeList[]>([]);

  // フィルター用のステート 20240508
  const [showEventNameAutocomplete, setShowEventNameAutocomplete] = useState(false);
  const [showRaceNameAutocomplete, setShowRaceNameAutocomplete] = useState(false);
  const [showByGroupAutocomplete, setShowByGroupAutocomplete] = useState(false);
  const [showRangeAutocomplete, setShowRangeAutocomplete] = useState(false);
  const raceNamefocusTarget = useRef(null);
  const eventNamefocusTarget = useRef(null);
  const byGroupfocusTarget = useRef(null);
  const rangefocusTarget = useRef(null);

  // ヘッダーの位置を取得するためのステート
  //レース名
  const [selectedRaceNameHeader, setSelectedRaceNameHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });
  //種目
  const [selectedEventNameHeader, setSelectedEventNameHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });
  //組別
  const [selectedByGroupHeader, setSelectedByGroupHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });
  //発艇日時
  const [selectedRangeHeader, setSelectedRangeHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });

  const { sortState, handleSort } = useSort<Race>({
    currentData: tableData,
    onSort: setTableData,
  });
  const handleEventNameHeaderClick = (value: string, event: React.MouseEvent<HTMLElement>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedEventNameHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        right: headerPosition.right + window.scrollX,
      },
    });
    setShowEventNameAutocomplete((prev) => !prev);
  };

  const handleByGroupHeaderClick = (value: string, event: React.MouseEvent<HTMLElement>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedByGroupHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        right: headerPosition.right + window.scrollX,
      },
    });
    setShowByGroupAutocomplete((prev) => !prev);
  };

  const handleRangeHeaderClick = (value: string, event: React.MouseEvent<HTMLElement>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedRangeHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        right: headerPosition.right + window.scrollX,
      },
    });
    setShowRangeAutocomplete((prev) => !prev);
  };

  const sortFunctions = {
    raceId: () => handleSort('raceId', (a, b) => Number(a.race_id) - Number(b.race_id)),
    raceName: () => handleSort('raceName', (a, b) => ('' + a.race_name).localeCompare(b.race_name)),
    raceNumber: () =>
      handleSort('raceNumber', (a, b) => Number(a.race_number) - Number(b.race_number)),
    eventName: () =>
      handleSort('eventName', (a, b) => ('' + a.event_name).localeCompare(b.event_name)),
    byGroup: () => handleSort('byGroup', (a, b) => ('' + a.by_group).localeCompare(b.by_group)),
    range: () => handleSort('range', (a, b) => Number(a.range) - Number(b.range)),
    startDateTime: () =>
      handleSort(
        'startDateTime',
        (a, b) =>
          Number(a.start_date_time.replace(/[- :]/g, '')) -
          Number(b.start_date_time.replace(/[- :]/g, '')),
      ),
  };

  // APIの呼び出し実績の有無を管理する状態
  const isApiFetched = useRef(false);

  //20240401 該当の団体管理者かどうかを判別するためのフラグ
  const [orgManagerFlag, setOrgManagerFlag] = useState<boolean>(false);

  // エラーハンドリング用のステート
  const [errors, setErrors] = useState<string[]>([]);

  const [userIdType, setUserIdType] = useState({} as UserIdType); //ユーザIDに紐づいた情報 20240222

  // データ取得
  useEffect(() => {
    // StrictModeの制約回避のため、APIの呼び出し実績の有無をuseEffectの中に記述
    if (!isApiFetched.current) {
      const fetchData = async () => {
        try {
          const tournamentResponse = await axios.post('api/getTournamentInfoData', {
            tourn_id: tournId,
          }); //大会IDを元に大会情報を取得する
          tournamentResponse.data.result.tourn_url = tournamentResponse.data.result.tourn_url ?? ''; //nullのパラメータを空のパラメータに置き換える
          setTournamentFormData(tournamentResponse.data.result);

          const raceResponse = await axios.post('api/getRaceData', {
            tourn_id: tournId,
          });
          raceResponse.data.result.map((data: any) => {
            setTableData((prevData) => [...prevData, { ...data }]);
          });

          const playerInf = await axios.get('api/getIDsAssociatedWithUser');
          setUserIdType(playerInf.data.result[0]); //ユーザIDに紐づいた情報 20240222

          const sendData: CheckOrgManagerRequest = {
            tournId: Number(tournId),
          };
          const resData = await axios.post<{ result: CheckOrgManager }>(
            'api/checkOrgManager',
            sendData,
          ); //大会情報参照画面 主催団体管理者の判別 20240402
          setOrgManagerFlag(resData.data.result.isOrgManager);

          //レース名をフィルターできるようにする
          const raceNameArray = raceResponse.data.result.map((item: any) => item.race_name);
          const uniqueRaceNameSet = new Set(raceNameArray);
          const uniqueRaceNameArray = Array.from(uniqueRaceNameSet);
          setRaceNameList(
            uniqueRaceNameArray.map((item: any, index: any) => ({
              id: index,
              name: item,
            })),
          );
          //種目をフィルターできるようにする 20240509
          const eventNameArray = raceResponse.data.result.map((item: any) => item.event_name);
          const uniqueEventNameSet = new Set(eventNameArray);
          const uniqueEventNameArray = Array.from(uniqueEventNameSet);
          setEventNameList(
            uniqueEventNameArray.map((item: any, index: any) => ({
              id: index,
              name: item,
            })),
          );
          //組別をフィルターできるようにする 20240509
          const byGroupsArray = raceResponse.data.result.map((item: any) => item.by_group);
          const uniqueByGroupsSet = new Set(byGroupsArray);
          const uniqueByGroupsArray = Array.from(uniqueByGroupsSet);
          setByGroupList(
            uniqueByGroupsArray.map((item: any, index: any) => ({
              id: index,
              name: item,
            })),
          );
          //距離をフィルターできるようにする 20240509
          const rangeArray = raceResponse.data.result.map((item: any) => item.range);
          const uniqueRangeSet = new Set(rangeArray);
          const uniqueRangeArray = Array.from(uniqueRangeSet);
          setRangeList(
            uniqueRangeArray.map((item: any, index: any) => ({
              id: index,
              name: item,
            })),
          );
          const followStatus = await axios.get('api/getTournamentFollowStatus', {
            params: { tourn_id: tournId },
          });
          setFollowStatus({
            isFollowed: followStatus.data.result.isFollowed,
            followerCount: followStatus.data.result.followerCount,
          });
        } catch (error: any) {
          setErrors([error.response?.data?.message]);
        }
      };
      fetchData();
      isApiFetched.current = true;
    }
  }, []);

  useEffect(() => {
    if (showRaceNameAutocomplete) {
      if (raceNamefocusTarget.current != null) {
        var target = raceNamefocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedRaceNameList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showEventNameAutocomplete) {
      if (eventNamefocusTarget.current != null) {
        var target = eventNamefocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedEventNameList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showByGroupAutocomplete) {
      if (byGroupfocusTarget.current != null) {
        var target = byGroupfocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedByGroupList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showRangeAutocomplete) {
      if (rangefocusTarget.current != null) {
        var target = rangefocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedRangeList.length
          ] as HTMLElement
        ).focus();
      }
    }
  }, [
    showRaceNameAutocomplete,
    showEventNameAutocomplete,
    showByGroupAutocomplete,
    showRangeAutocomplete,
  ]);

  const handleFollowToggle = () => {
    axios
      .patch('api/tournamentFollowed', { tournId })
      .then(() => {
        setFollowStatus((prevStatus) => ({
          isFollowed: !prevStatus.isFollowed,
          followerCount: prevStatus.isFollowed
            ? prevStatus.followerCount - 1
            : prevStatus.followerCount + 1,
        }));
      })
      .catch(() => {
        window.alert('フォロー状態の更新に失敗しました:');
      });
  };

  // tournIdの値を取得
  if (typeof tournId === 'undefined') return null;

  // エラーがある場合はエラーメッセージを表示
  if (tournamentFormData.tourn_id === '') {
    return (
      <>
        <CustomTitle displayBack>{mode === 'delete' ? '大会情報削除' : '大会情報'}</CustomTitle>
        <ErrorBox errorText={errors} />
      </>
    );
  }

  return (
    <>
      <ErrorBox errorText={errors} />
      <div className='flex flex-row justify-between items-center '>
        {/* 画面名 */}
        <CustomTitle displayBack>{mode === 'delete' ? '大会情報削除' : '大会情報'}</CustomTitle>
        <div className='flex items-center gap-2'>
          {mode !== 'delete' && (userIdType.is_administrator == 1 || orgManagerFlag) && (
            <TitleSideButton
              href={{
                pathname: '/tournament',
                query: { mode: 'update', tourn_id: tournId },
              }}
              icon={EditIcon}
              text='大会情報更新'
            />
          )}
          {mode !== 'delete' && (userIdType.is_administrator == 1 || orgManagerFlag) && (
            <TitleSideButton
              href={{
                pathname: '/tournamentRef',
                query: { mode: 'delete', tournId: tournId },
              }}
              icon={DeleteOutlineIcon}
              text='大会情報削除'
            />
          )}
        </div>
      </div>
      <div className='bg-gradient-to-r from-primary-900 via-primary-500 to-primary-900 p-4 '>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
            <div className='flex flex-col items-start lg:items-center lg:flex-row gap-3'>
              <Label label={tournamentFormData.tourn_name} textColor='white' textSize='h2'></Label>
              <FollowButton
                isFollowed={followStatus.isFollowed}
                handleFollowToggle={handleFollowToggle}
                followedCount={followStatus.followerCount}
                icon={EmojiEventsIcon}
                text='大会'
              />
            </div>
            {/* ダウンロードコード追加 開始 */}
            {tournamentFormData.tourn_info_faile_path && (
              <Link
                href={`${TOURNAMENT_PDF_URL}${tournamentFormData.tourn_info_faile_path}`}
                download
                className='text-normal text-white hover:text-primary-100 hover:bg-transparent hover:border-none border border-white p-2'
              >
                <FileDownloadOutlinedIcon className='text-[16px] mr-2 hover:text-primary-100 '></FileDownloadOutlinedIcon>
                大会要項ダウンロード
              </Link>
            )}
            {/* ダウンロードコード追加 終了*/}
          </div>
          <div className='flex flex-col sm:flex-row'>
            {/* 大会個別URL */}
            <div className='text-gray-40 w-[100px]'>大会URL</div>
            <Link
              href={tournamentFormData.tourn_url}
              rel='noopener noreferrer'
              target='_blank'
              className='text-white underline hover:text-primary-100'
            >
              {tournamentFormData.tourn_url}
            </Link>
          </div>
          <div className='flex flex-col gap-[12px]'>
            <Label label='開催情報' textColor='white' textSize='small' isBold={true}></Label>
            <div className='flex flex-col gap-[5px]'>
              <div className='flex flex-row gap-[20px]'>
                <div className='flex flex-col gap-[5px]'>
                  <div className='flex flex-row gap-2'>
                    {/* 開催開始年月日 */}
                    <div className='text-gray-40 text-sm w-[100px]'>開催開始年月日</div>
                    <Label
                      label={formatDate(tournamentFormData.event_start_date, 'yyyy/MM/dd')}
                      textColor='white'
                      textSize='small'
                    ></Label>
                  </div>
                  <div className='flex flex-row gap-2'>
                    {/* 開催終了年月日 */}
                    <div className='text-gray-40 text-sm w-[100px]'>開催終了年月日</div>
                    <Label
                      label={formatDate(tournamentFormData.event_end_date, 'yyyy/MM/dd')}
                      textColor='white'
                      textSize='small'
                    ></Label>
                  </div>
                </div>
              </div>
              <div className='flex flex-row gap-2'>
                {/* 開催場所 */}
                <div className='text-gray-40 text-sm w-[100px]'>開催場所</div>
                <Label
                  label={
                    tournamentFormData.venue_id === 9999
                      ? `その他 ${tournamentFormData.venue_name}`
                      : tournamentFormData.venue_name
                  }
                  textColor='white'
                  textSize='small'
                />
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-[10px]'>
            <Label label='主催団体' textColor='white' textSize='small' isBold={true}></Label>
            <div className='flex flex-col gap-[5px]'>
              <div className='flex flex-row gap-2'>
                {/* 主催団体名 */}
                <div className='text-gray-40 text-sm w-[100px]'>名前</div>
                <Label
                  label={tournamentFormData.sponsorOrgName}
                  textColor='white'
                  textSize='small'
                ></Label>
              </div>
            </div>
            <div className='flex flex-row gap-2'>
              {/* 主催団体ID */}
              <div className='text-gray-40 text-sm w-[100px]'>ID</div>
              <Label
                label={tournamentFormData.sponsor_org_id}
                textColor='white'
                textSize='small'
              ></Label>
            </div>
          </div>
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-5'>
            <div className='flex flex-row gap-[10px]'>
              {/* 大会ID */}
              <div className='text-gray-40 text-sm'>大会ID：</div>
              <Label
                label={tournamentFormData.tourn_id?.toString() as string}
                textColor='white'
                textSize='small'
              ></Label>
            </div>
            {(userIdType.is_administrator == ROLE.SYSTEM_ADMIN ||
              userIdType.is_organization_manager == ROLE.GROUP_MANAGER ||
              userIdType.is_jara == ROLE.JARA ||
              userIdType.is_pref_boat_officer == ROLE.PREFECTURE) && (
              <div className='flex flex-row gap-[10px]'>
                {/* エントリーシステムの大会ID */}
                <div className='text-gray-40 text-sm'>エントリーシステムの大会ID：</div>
                <Label
                  label={tournamentFormData.entrysystem_tourn_id}
                  textColor='white'
                  textSize='small'
                ></Label>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='text-lg mb-4'>
        <div className='mb-4'>
          <div className='text-2xl lg:text-4xl font-bold'>開催レース</div>
        </div>
        {/* レース一覧テーブル表示 */}
        <div className='overflow-auto'>
          <CustomTable>
            <CustomThead>
              <CustomTr>
                <CustomTh align='left'>
                  <SortableHeader
                    column='raceId'
                    label='レースID'
                    sortState={sortState}
                    onSort={sortFunctions.raceId}
                  />
                </CustomTh>
                <CustomTh align='left'>
                  <SortableHeader
                    column='raceName'
                    label='レース名'
                    sortState={sortState}
                    onSort={sortFunctions.raceName}
                  />
                </CustomTh>
                <CustomTh align='left'>
                  <SortableHeader
                    column='raceNumber'
                    label='レースNo.'
                    sortState={sortState}
                    onSort={sortFunctions.raceNumber}
                  />
                </CustomTh>
                <CustomTh align='left'>
                  <SortableHeader
                    column='eventName'
                    label='種目'
                    sortState={sortState}
                    onSort={sortFunctions.eventName}
                    hasFilter
                    isFiltered={selectedEventNameList.length > 0}
                    onFilter={(event) => handleEventNameHeaderClick('種目', event)}
                  />
                </CustomTh>
                <CustomTh align='left'>
                  <SortableHeader
                    column='byGroup'
                    label='組別'
                    sortState={sortState}
                    onSort={sortFunctions.byGroup}
                    hasFilter
                    isFiltered={selectedByGroupList.length > 0}
                    onFilter={(event) =>
                      handleByGroupHeaderClick('組別', event)
                    }
                  />
                </CustomTh>
                <CustomTh align='left'>
                  <SortableHeader
                    column='range'
                    label='距離'
                    sortState={sortState}
                    onSort={sortFunctions.range}
                    hasFilter
                    isFiltered={selectedRangeList.length > 0}
                    onFilter={(event) =>
                      handleRangeHeaderClick('距離', event)
                    }
                  />
                </CustomTh>
                <CustomTh align='left'>
                  <SortableHeader
                    column='startDateTime'
                    label='発艇日時'
                    sortState={sortState}
                    onSort={sortFunctions.startDateTime}
                  />
                </CustomTh>
              </CustomTr>
            </CustomThead>
            <CustomTbody>
              {tableData
                .filter((row, index) => {
                  if (selectedRaceNameList.length > 0) {
                    return selectedRaceNameList.some((item) => item.name === row.race_name);
                  } else {
                    return true;
                  }
                })
                .filter((row, index) => {
                  if (selectedEventNameList.length > 0) {
                    return selectedEventNameList.some((item) => item.name === row.event_name);
                  } else {
                    return true;
                  }
                })
                .filter((row, index) => {
                  if (selectedByGroupList.length > 0) {
                    return selectedByGroupList.some((item) => item.name === row.by_group);
                  } else {
                    return true;
                  }
                })
                .filter((row, index) => {
                  if (selectedRangeList.length > 0) {
                    return selectedRangeList.some((item) => item.name === row.range);
                  } else {
                    return true;
                  }
                })
                .map((row, index) => (
                  <CustomTr key={index}>
                    {/* 「出漕結果記録テーブル」に「レーステーブル」.「レースID」と紐づくデータが存在する場合、リンクボタンを表示するかどうかを制御するためにhasHistoryを利用 */}
                    {row.hasHistory ? (
                      <CustomTd
                        transitionDest={
                          '/tournamentRaceResultRef?raceId=' + row.race_id?.toString()
                        }
                      >
                        {row.race_id}
                      </CustomTd>
                    ) : (
                      <CustomTd>{row.race_id}</CustomTd>
                    )}
                    {row.hasHistory ? (
                      <CustomTd
                        transitionDest={
                          '/tournamentRaceResultRef?raceId=' + row.race_id?.toString()
                        }
                      >
                        {row.race_name}
                      </CustomTd>
                    ) : (
                      <CustomTd>{row.race_name}</CustomTd>
                    )}
                    {/* レースNo. */}
                    <CustomTd>{row.race_number}</CustomTd>
                    {/* 種目 */}
                    <CustomTd>
                      {row.event_id == '999'
                        ? `${row.event_name} ${row.otherEventName}`
                        : row.event_name}
                    </CustomTd>
                    {/* 組別 */}
                    <CustomTd>{row.by_group}</CustomTd>
                    {/* 距離 */}
                    <CustomTd>{row.range}</CustomTd>
                    {/* 発艇日時 */}
                    <CustomTd>{formatDate(row.start_date_time, 'yyyy/MM/dd HH:mm')}</CustomTd>
                  </CustomTr>
                ))}
            </CustomTbody>
          </CustomTable>
        </div>
        {/* レース名フィルター用のオートコンプリート 20240509 */}
        {showRaceNameAutocomplete && (
          <div
            ref={raceNamefocusTarget}
            style={{
              position: 'absolute',
              top: `${selectedRaceNameHeader.position.top - 120}px`,
              right: `max(0px, calc(100vw - ${selectedRaceNameHeader.position.right}px - 300px))`,
              backgroundColor: 'white',
              borderRadius: '4px',
              zIndex: 1000,
              padding: '8px',
            }}
            onBlur={
              //フォーカスが外れたら非表示にする
              () => {
                setShowRaceNameAutocomplete(false);
              }
            }
          >
            <Autocomplete
              id='raveName'
              multiple
              sx={{ width: 300 }}
              options={raceNameList}
              filterOptions={(options, { inputValue }) =>
                options.filter((option) => option.name.includes(inputValue))
              }
              value={selectedRaceNameList || []}
              onChange={(e: ChangeEvent<{}>, newValue: RaceNameList[]) => {
                setSelectedRaceNameList(newValue);
              }}
              renderOption={(props: any, option: RaceNameList) => {
                return (
                  <li {...props} key={option.id}>
                    {option.name}
                  </li>
                );
              }}
              renderTags={(value: RaceNameList[], getTagProps: any) => {
                return value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                ));
              }}
              renderInput={(params) => (
                <TextField
                  key={params.id}
                  className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                  {...params}
                  label={'レース名'}
                />
              )}
            />
          </div>
        )}
        {/* 種目フィルター用のオートコンプリート 20240509 */}
        {showEventNameAutocomplete && (
          <div
            ref={eventNamefocusTarget}
            style={{
              position: 'absolute',
              top: `${selectedEventNameHeader.position.top - 120}px`,
              right: `max(0px, calc(100vw - ${selectedEventNameHeader.position.right}px - 300px))`,
              backgroundColor: 'white',
              borderRadius: '4px',
              zIndex: 1000,
              padding: '8px',
            }}
            onBlur={
              //フォーカスが外れたら非表示にする
              () => {
                setShowEventNameAutocomplete(false);
              }
            }
          >
            <Autocomplete
              id='eventName'
              multiple
              sx={{ width: 300 }}
              options={eventNameList}
              filterOptions={(options, { inputValue }) =>
                options.filter((option) => option.name.includes(inputValue))
              }
              value={selectedEventNameList || []}
              onChange={(e: ChangeEvent<{}>, newValue: EventNameList[]) => {
                setSelectedEventNameList(newValue);
              }}
              renderOption={(props: any, option: EventNameList) => {
                return (
                  <li {...props} key={option.id}>
                    {option.name}
                  </li>
                );
              }}
              renderTags={(value: EventNameList[], getTagProps: any) => {
                return value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                ));
              }}
              renderInput={(params) => (
                <TextField
                  key={params.id}
                  className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                  {...params}
                  label={'種目'}
                />
              )}
            />
          </div>
        )}
        {/* 組別フィルター用のオートコンプリート 20240508 */}
        {showByGroupAutocomplete && (
          <div
            ref={byGroupfocusTarget}
            style={{
              position: 'absolute',
              top: `${selectedByGroupHeader.position.top - 120}px`,
              right: `max(0px, calc(100vw - ${selectedByGroupHeader.position.right}px - 300px))`,
              backgroundColor: 'white',
              borderRadius: '4px',
              zIndex: 1000,
              padding: '8px',
            }}
            onBlur={
              //フォーカスが外れたら非表示にする
              () => setShowByGroupAutocomplete(false)
            }
          >
            <Autocomplete
              id='byGroup'
              multiple
              options={byGroupList}
              sx={{ width: 300 }}
              filterOptions={(options, { inputValue }) =>
                options.filter((option) => option.name.includes(inputValue))
              }
              value={selectedByGroupList || []}
              onChange={(e: ChangeEvent<{}>, newValue: ByGroupList[]) => {
                setSelectedByGroupList(newValue);
              }}
              renderOption={(props: any, option: ByGroupList) => {
                return (
                  <li {...props} key={option.id}>
                    {option.name}
                  </li>
                );
              }}
              renderTags={(value: ByGroupList[], getTagProps: any) => {
                return value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                ));
              }}
              renderInput={(params) => (
                <TextField
                  key={params.id}
                  className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                  {...params}
                  label={'組別'}
                />
              )}
            />
          </div>
        )}
        {/* 距離用のオートコンプリート 20240509 */}
        {showRangeAutocomplete && (
          <div
            ref={rangefocusTarget}
            style={{
              position: 'absolute',
              top: `${selectedRangeHeader.position.top - 120}px`,
              right: `max(0px, calc(100vw - ${selectedRangeHeader.position.right}px - 300px))`,
              backgroundColor: 'white',
              borderRadius: '4px',
              zIndex: 1000,
              padding: '8px',
            }}
            onBlur={
              //フォーカスが外れたら非表示にする
              () => setShowRangeAutocomplete(false)
            }
          >
            <Autocomplete
              id='range'
              multiple
              options={rangeList}
              sx={{ width: 300 }}
              filterOptions={(options, { inputValue }) =>
                options.filter((option) => option.name?.toString().includes(inputValue?.toString()))
              }
              value={selectedRangeList || []}
              onChange={(e: ChangeEvent<{}>, newValue: RangeList[]) => {
                setSelectedRangeList(newValue);
              }}
              renderOption={(props: any, option: RangeList) => {
                return (
                  <li {...props} key={option.id}>
                    {option.name}
                  </li>
                );
              }}
              renderTags={(value: RangeList[], getTagProps: any) => {
                return value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
                ));
              }}
              renderInput={(params) => (
                <TextField
                  key={params.id}
                  className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                  {...params}
                  label={'距離'}
                />
              )}
            />
          </div>
        )}
      </div>
      <div className='flex flex-row justify-center gap-[40px] m-auto'>
        {/* 戻るボタン */}
        {window.history.length > 1 && (
          <CustomButton
            buttonType='primary-outlined'
            onClick={() => {
              router.back();
            }}
          >
            戻る
          </CustomButton>
        )}
        {/* 参照モードかつ、権限がシステム管理者、大会団体管理者の時は表示 */}
        {mode === 'delete' &&
          (userIdType.is_administrator == ROLE.SYSTEM_ADMIN ||
            userIdType.is_organization_manager == ROLE.GROUP_MANAGER ||
            userIdType.is_jara == ROLE.JARA ||
            userIdType.is_pref_boat_officer == ROLE.PREFECTURE) && (
            // 削除ボタン
            <CustomButton
              buttonType='primary'
              onClick={async () => {
                if (isSubmitting) {
                  return;
                }
                setIsSubmitting(true);

                // TODO: 削除ボタン押下イベントの実装
                //追加対象のデータをまとめて送信する 20240202
                const sendFormData = {
                  tournamentFormData: tournamentFormData, //選手情報
                  tableData: tableData, //選手の出漕結果情報
                };
                const isOk = window.confirm('大会情報を削除します。よろしいですか？');
                if (isOk) {
                  // TODO: 削除確認画面でOKボタンが押された場合、テーブルの当該項目に削除フラグを立てる処理の置き換え
                  await axios
                    .post('api/deleteTournamentData', sendFormData) //大会情報の削除 20240202
                    .then((response) => {
                      // TODO: 削除完了時の処理の置き換え
                      window.alert('大会情報の削除が完了しました');
                      router.push('/tournamentSearch'); //大会検索に遷移 20240311
                    })
                    .catch((error) => {
                      // TODO: エラーハンドリングの実装の置き換え
                      setErrors([
                        '大会情報の削除に失敗しました。ユーザーサポートにお問い合わせください。',
                      ]);
                      window.scrollTo(0, 0);
                    });
                }

                setIsSubmitting(false);
              }}
            >
              削除
            </CustomButton>
          )}
      </div>
    </>
  );
}
