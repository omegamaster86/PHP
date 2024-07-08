// 団体情報参照・削除画面
'use client';

import React, { useEffect, useState, SyntheticEvent } from 'react';
import axios from '@/app/lib/axios';
import {
  CustomTable,
  CustomTh,
  CustomThead,
  CustomTbody,
  CustomTr,
  CustomTd,
  OriginalCheckbox,
  CustomButton,
  CustomTitle,
  ErrorBox,
  Label,
} from '@/app/components';
import {
  Organization,
  PlayerInformationResponse,
  Tournament,
  Staff,
  UserResponse,
  UserIdType,
  TeamResponse,
} from '@/app/types';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROLE } from '@/app/utils/consts';
import { Tab, Tabs } from '@mui/material';
import { NO_IMAGE_URL, PLAYER_IMAGE_URL } from '@/app/utils/imageUrl';

export default function TeamRef() {
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [formData, setFormData] = useState({} as Organization);
  const [hostTournaments, setHostTournaments] = useState([] as Tournament[]);
  const [entTournaments, setEntTournaments] = useState([] as Tournament[]);
  const [players, setPlayers] = useState([] as PlayerInformationResponse[]);
  const [userData, setUserData] = useState({} as UserResponse);
  const [staffs, setStaffs] = useState([] as Staff[]);
  const [value, setValue] = useState(0);
  const [userIdType, setUserIdType] = useState({} as UserIdType); //ユーザIDに紐づいた情報 20240222
  const [teamdata, setTeamdata] = useState([] as TeamResponse[]); //該当ユーザが管理する団体情報の取得 20240415

  // ページ全体のエラーハンドリング用のステート
  let isError = false;

  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get('mode');
  switch (mode) {
    case 'delete':
      break;
    default:
      // 参照モードとして扱う
      break;
  }

  const orgId =
    searchParams.get('orgId')?.toString() ||
    searchParams.get('org_id')?.toString() ||
    searchParams.get('sponsor_org_id')?.toString() ||
    '';
  // orgIdの値を取得
  switch (orgId) {
    case '':
      isError = true;
      break;
    default:
      break;
  }
  const [org_id, setOrgId] = useState<any>({
    org_id: orgId,
  });

  /**
   * タブの切り替え
   * @param event
   * @param newValue
   */
  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  /**
   * タブの切り替え用のtagを生成
   * @param index
   * @returns id, aria-controls
   */
  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  };

  //都道府県を振り分ける 20240318
  const prefVal = () => {
    if (formData.location_prefecture != null) {
      if (formData.location_prefecture == 1) {
        return '';
      } else if (formData.location_prefecture == 13) {
        return '都';
      } else if (formData.location_prefecture == 26) {
        return '府';
      } else if (formData.location_prefecture == 27) {
        return '府';
      } else {
        return '県';
      }
    }
  };
  //null防止用 20240318
  const addressVal = () => {
    return formData.address2 ?? '';
  };

  //表示中の団体がログインユーザの管理する団体か判定する 20240415
  const checkOrgManage = () => {
    //console.log(teamdata);
    for (let index = 0; index < teamdata.length; index++) {
      if (teamdata[index].org_id == orgId) {
        return true;
      }
    }
    return false; //ユーザが管理する団体のいずれでもない場合、falseを返す
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 仮のURL（繋ぎ込み時に変更すること）
        // 主催大会
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        // const response = await axios.get<Organization>('/organization');
        const response = await axios.post('/getOrgData', org_id); //団体情報取得
        //console.log(response.data.result);
        setFormData(response.data.result);
        // // 主催大会大会
        // const hostTournamentsResponse = await axios.get<Tournament[]>('/tournamentSearch',);
        const hostTournamentsResponse = await axios.post('/getTournamentInfoData_org', org_id);
        //console.log(hostTournamentsResponse.data.result);
        setHostTournaments(hostTournamentsResponse.data.result);
        // // エントリー大会
        // const entTournamentsResponse = await axios.get<Tournament[]>('/tournamentSearch',);
        const entTournamentsResponse = await axios.post(
          '/getEntryTournamentsViewForTeamRef',
          org_id,
        );
        //console.log(entTournamentsResponse.data.result);
        setEntTournaments(entTournamentsResponse.data.result);
        // // 所属選手
        // const playersResponse = await axios.get<PlayerInformationResponse[]>('/playerSearch',);
        const playersResponse = await axios.post('/searchOrganizationPlayersForTeamRef', org_id);
        //console.log(playersResponse.data.result);
        setPlayers(playersResponse.data.result);

        // const userDataResponse = await axios.get<UserResponse>('/api/user');
        const userDataResponse = await axios.get('/api/user');
        setUserData(userDataResponse.data);

        // 所属スタッフ
        // const staffsResponse = await axios.get<Staff[]>('/staff');
        const staffsResponse = await axios.post('/getOrgStaffData', org_id); //スタッフ情報取得
        //console.log(staffsResponse.data.result);
        setStaffs(staffsResponse.data.result);

        const playerInf = await axios.get('/getIDsAssociatedWithUser');
        setUserIdType(playerInf.data.result[0]); //ユーザIDに紐づいた情報 20240222

        const responseData = await axios.get('/getOrganizationForOrgManagement'); //団体データ取得 20240415
        //console.log(responseData.data.result);
        setTeamdata(responseData.data.result);
      } catch (error) {
        setErrorMessage(['API取得エラー:' + (error as Error).message]);
      }
    };
    fetchData();
  }, []);

  return (
    <main className='flex min-h-screen flex-col justify-start p-[10px] m-auto gap-[20px] my-[80px]'>
      <div className='flex flex-col justify-start gap-[20px]'>
        <div className='relative flex flex-row justify-between w-full h-screen flex-wrap'>
          {/* 画面名*/}
          <CustomTitle isCenter={false} displayBack>
            {mode === 'delete' ? '団体情報削除' : '団体情報参照'}
          </CustomTitle>
        </div>
        <ErrorBox errorText={errorMessage} />
        {/* フォーム */}
        <div className='bg-gradient-to-r from-primary-900 via-primary-500 to-primary-900 p-4 '>
          <div className='flex flex-col gap-[30px] m-auto rounded-[10px] w-[700px]'>
            {/* 団体名 */}
            <Label label={formData.org_name} textColor='white' textSize='h2'></Label>
            {/* 開催情報 */}
            <Label label='開催情報' textColor='white' textSize='small' isBold={true}></Label>
            <div className='flex flex-col gap-[5px]'>
              {/* 創立年 */}
              <div className='flex flex-row'>
                <div className='text-gray-40 text-caption1 w-[100px]'>創立年</div>
                <Label label={formData.founding_year?.toString()} textColor='white' />
              </div>
              {/* 所在地 */}
              <div className='flex flex-row'>
                <div className='text-gray-40 text-caption1 w-[100px]'>所在地</div>
                {/* 市区町村・町字番地, 都道府県, マンション・アパート, 郵便番号1, 郵便番号 */}
                <Label
                  label={
                    formData.post_code +
                    ' ' +
                    formData.locationPrefectureName +
                    prefVal() +
                    formData.address1 +
                    addressVal()
                  }
                  textColor='white'
                />
              </div>
              {/* 団体区分 */}
              <div className='flex flex-row'>
                <div className='text-gray-40 text-caption1 w-[100px]'>団体区分</div>
                <Label label={formData.orgClassName} textColor='white' />
              </div>
              {/* 団体種別 */}
              <div className='flex flex-row'>
                <div className='text-gray-40 text-caption1 w-[100px]'>団体種別</div>
                <div className='w-[100px]'>
                  <Label label={formData.jaraOrgTypeName} textColor='white' />
                  <Label label={formData.prefOrgTypeName} textColor='white' />
                </div>
                {(userIdType.is_administrator == ROLE.SYSTEM_ADMIN ||
                  userIdType.is_jara == ROLE.JARA ||
                  userIdType.is_pref_boat_officer == ROLE.PREFECTURE) && (
                  <div className='w-[100px]'>
                    <Label
                      label={formData.jara_org_type == 1 ? formData.jara_org_reg_trail : '　'}
                      textColor='white'
                    />
                    <Label
                      label={formData.pref_org_type == 1 ? formData.pref_org_reg_trail : '　'}
                      textColor='white'
                    />
                  </div>
                )}
              </div>
            </div>
            <div className='flex flex-row gap-[20px]'>
              {/* 団体ID */}
              <div className='flex flex-row '>
                <div className='text-gray-40 text-caption1 w-[100px]'>団体ID</div>
                <Label label={formData.org_id} textColor='white' />
              </div>
              {/* エントリーシステムの団体ID */}
              <div className='flex flex-row gap-[15px]'>
                <div className='text-gray-40 text-caption1 '>エントリーシステムの団体ID</div>
                <Label label={formData.entrysystem_org_id} textColor='white' />
              </div>
            </div>
          </div>
        </div>
        {/* タブ */}
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label='simple tabs example'
          className='w-[700px] m-auto'
        >
          <Tab label='主催大会' {...a11yProps(0)} />
          <Tab label='エントリー大会' {...a11yProps(1)} />
          <Tab label='所属選手' {...a11yProps(2)} />
          <Tab label='所属スタッフ' {...a11yProps(3)} />
        </Tabs>

        {/* 主催大会テーブル表示 */}
        {value === 0 && (
          <div>
            <div>
              <div className='w-full bg-primary-500 text-white h-[40px] flex justify-center items-center font-bold relative'>
                <div className='absolute'>主催大会</div>
                {mode !== 'delete' &&
                  (userIdType.is_administrator == 1 ||
                  (userIdType.is_organization_manager == 1 && checkOrgManage()) ? (
                    <div className='absolute right-[10px]'>
                      <CustomButton
                        className='w-[100px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300'
                        buttonType='secondary'
                        onClick={() => {
                          router.push('/tournament?mode=create');
                        }}
                      >
                        大会登録
                      </CustomButton>
                    </div>
                  ) : (
                    ''
                  ))}
              </div>
              <CustomTable>
                <CustomThead>
                  <CustomTr>
                    <CustomTh align='left'>大会種別</CustomTh>
                    <CustomTh align='left'>大会名</CustomTh>
                    <CustomTh align='left'>開催期間</CustomTh>
                    <CustomTh align='left'>開催場所</CustomTh>
                    <CustomTh align='left'>大会URL</CustomTh>
                  </CustomTr>
                </CustomThead>
                <CustomTbody>
                  {hostTournaments.map((row, index) => (
                    <CustomTr key={index}>
                      {/* 大会種別 */}
                      <CustomTd>{row.tournTypeName}</CustomTd>
                      {/* 大会名 */}
                      <CustomTd>
                        <Link
                          href={{
                            pathname: '/tournamentRef',
                            query: { tournId: row.tourn_id?.toString() },
                          }}
                          target='_blank'
                          className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                        >
                          {row.tourn_name}
                        </Link>
                      </CustomTd>
                      {/* 開催期間 */}
                      <CustomTd>
                        {row.event_start_date} ~ {row.event_end_date}
                      </CustomTd>
                      {/* 開催場所 */}
                      <CustomTd>{row.venue_name}</CustomTd>
                      {/* 大会URL */}
                      <CustomTd>
                        <Link
                          href={row.tourn_url || ('' as string)}
                          rel='noopener noreferrer'
                          target='_blank'
                          className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                        >
                          {row.tourn_url}
                        </Link>
                      </CustomTd>
                    </CustomTr>
                  ))}
                </CustomTbody>
              </CustomTable>
            </div>
          </div>
        )}
        {/* エントリー大会テーブル表示 */}
        {value === 1 && (
          <div>
            <div className='w-full bg-primary-500 text-white h-[40px] flex justify-center items-center font-bold'>
              エントリー大会
            </div>
            <CustomTable>
              <CustomThead>
                <CustomTr>
                  <CustomTh align='left'>大会種別</CustomTh>
                  <CustomTh align='left'>大会名</CustomTh>
                  <CustomTh align='left'>開催期間</CustomTh>
                  <CustomTh align='left'>開催場所</CustomTh>
                  <CustomTh align='left'>大会URL</CustomTh>
                </CustomTr>
              </CustomThead>
              <CustomTbody>
                {entTournaments.map((row, index) => (
                  <CustomTr key={index}>
                    {/* 大会種別 */}
                    <CustomTd>{row.tournTypeName}</CustomTd>
                    {/* 大会名 */}
                    <CustomTd>
                      <Link
                        href={{
                          pathname: '/tournamentRef',
                          query: { tournId: row.tourn_id?.toString() },
                        }}
                        target='_blank'
                        className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                      >
                        {row.tourn_name}
                      </Link>
                    </CustomTd>
                    {/* 開催期間 */}
                    <CustomTd>
                      {row.event_start_date} ~ {row.event_end_date}
                    </CustomTd>
                    {/* 開催場所 */}
                    <CustomTd>{row.venue_name}</CustomTd>
                    {/* 大会URL */}
                    <CustomTd>
                      <Link
                        href={row.tourn_url || ('' as string)}
                        rel='noopener noreferrer'
                        target='_blank'
                        className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                      >
                        {row.tourn_url}
                      </Link>
                    </CustomTd>
                  </CustomTr>
                ))}
              </CustomTbody>
            </CustomTable>
          </div>
        )}

        {/* 所属選手テーブル表示 */}
        {value === 2 && (
          <div>
            <div className='w-full bg-secondary-500 text-white h-[40px] flex justify-center items-center font-bold relative'>
              <>所属選手</>
              {mode !== 'delete' &&
                (userIdType.is_administrator == 1 ||
                (userIdType.is_organization_manager == 1 && checkOrgManage()) ? (
                  <div
                    className={`absolute right-[10px] ${
                      mode === 'delete' ? 'hidden' : 'flex flex-row gap-[10px]'
                    }`}
                  >
                    <CustomButton
                      className='w-[100px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300'
                      buttonType='secondary'
                      onClick={() => {
                        sessionStorage.removeItem('addPlayerList'); //Remove if it is already stored
                        router.push('/teamPlayer?mode=create&org_id=' + orgId);
                      }}
                    >
                      所属選手編集
                    </CustomButton>
                    <CustomButton
                      className='w-[120px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300'
                      buttonType='secondary'
                      onClick={() => {
                        router.push('/teamPlayerBulkRegister?org_id=' + orgId);
                      }}
                    >
                      所属選手一括登録
                    </CustomButton>
                  </div>
                ) : (
                  ''
                ))}
            </div>
            <CustomTable>
              <CustomThead>
                <CustomTr>
                  <CustomTh align='center' rowSpan={2}>
                    選手画像
                  </CustomTh>
                  <CustomTh align='center' rowSpan={2}>
                    選手名
                  </CustomTh>
                  <CustomTh align='center' rowSpan={2}>
                    選手ID
                  </CustomTh>
                  <CustomTh align='center' rowSpan={2}>
                    出身地(国)
                  </CustomTh>
                  <CustomTh align='center' rowSpan={2}>
                    出身地(都道府県)
                  </CustomTh>
                  <CustomTh align='center' rowSpan={2}>
                    身長
                  </CustomTh>
                  <CustomTh align='center' rowSpan={2}>
                    体重
                  </CustomTh>
                  <CustomTh align='center' rowSpan={1} colSpan={4}>
                    サイド情報
                  </CustomTh>
                </CustomTr>
                <CustomTr>
                  <CustomTh align='center'>S</CustomTh>
                  <CustomTh align='center'>B</CustomTh>
                  <CustomTh align='center'>X</CustomTh>
                  <CustomTh align='center'>C</CustomTh>
                </CustomTr>
              </CustomThead>
              <CustomTbody>
                {players.map((row, index) => (
                  <CustomTr key={index}>
                    {/* 選手画像 */}
                    <CustomTd align='center'>
                      <img
                        src={row.photo ? `${PLAYER_IMAGE_URL}${row.photo}` : `${NO_IMAGE_URL}`}
                        alt={row.player_name}
                        className='w-[50px] h-[50px] rounded-full'
                      />
                    </CustomTd>
                    {/* 選手名 */}
                    <CustomTd>
                      <Link
                        className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                        href={'/playerInformationRef?player_id=' + row.player_id}
                      >
                        {row.player_name}
                      </Link>
                    </CustomTd>
                    {/* 選手ID */}
                    <CustomTd>
                      <Link
                        className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                        href={'/playerInformationRef?player_id=' + row.player_id}
                      >
                        {row.player_id}
                      </Link>
                    </CustomTd>

                    {/* 出身地(国) */}
                    <CustomTd>{row.birthCountryName}</CustomTd>
                    {/* 出身地(都道府県) */}
                    <CustomTd>{row.birthPrefectureName}</CustomTd>
                    {/* 身長 */}
                    <CustomTd>{row.height}cm</CustomTd>
                    {/* 体重 */}
                    <CustomTd>{row.weight}kg</CustomTd>
                    {/* サイド情報 */}
                    <CustomTd>
                      <OriginalCheckbox
                        id='sideInfoS'
                        value='S'
                        onChange={() => {}}
                        checked={row.side_info[0]}
                        readonly={true}
                      ></OriginalCheckbox>
                    </CustomTd>
                    <CustomTd>
                      <OriginalCheckbox
                        id='sideInfoB'
                        value='B'
                        onChange={() => {}}
                        checked={row.side_info[1]}
                        readonly={true}
                      ></OriginalCheckbox>
                    </CustomTd>
                    <CustomTd>
                      <OriginalCheckbox
                        id='sideInfoX'
                        value='X'
                        onChange={() => {}}
                        checked={row.side_info[2]}
                        readonly={true}
                      ></OriginalCheckbox>
                    </CustomTd>
                    <CustomTd>
                      <OriginalCheckbox
                        id='sideInfoC'
                        value='C'
                        onChange={() => {}}
                        checked={row.side_info[3]}
                        readonly={true}
                      ></OriginalCheckbox>
                    </CustomTd>
                  </CustomTr>
                ))}
              </CustomTbody>
            </CustomTable>
          </div>
        )}
        {/* 所属スタッフテーブル表示 */}
        {value === 3 && (
          <div>
            <div className='w-full bg-secondary-500 text-white h-[40px] flex justify-center items-center font-bold'>
              所属スタッフ
            </div>
            <CustomTable>
              <CustomThead>
                <CustomTr>
                  <CustomTh align='center'>ユーザーID</CustomTh>
                  <CustomTh align='center'> ユーザー名</CustomTh>
                  <CustomTh align='center'>管理者(監督)</CustomTh>
                  <CustomTh align='center'> 部長</CustomTh>
                  <CustomTh align='center'>コーチ</CustomTh>
                  <CustomTh align='center'>マネージャー</CustomTh>
                  <CustomTh align='center'>管理代理</CustomTh>
                </CustomTr>
              </CustomThead>
              <CustomTbody>
                {staffs.map((row, index) => (
                  <CustomTr key={index}>
                    <CustomTd>{row.user_id}</CustomTd>
                    <CustomTd>{row.user_name}</CustomTd>
                    <CustomTd>
                      <OriginalCheckbox
                        id='staffType1'
                        value='監督'
                        onChange={() => {}}
                        checked={row.staff_type_id.includes('監督')}
                        readonly={true}
                      ></OriginalCheckbox>
                    </CustomTd>
                    <CustomTd>
                      <OriginalCheckbox
                        id='staffType2'
                        value='部長'
                        onChange={() => {}}
                        checked={row.staff_type_id.includes('部長')}
                        readonly={true}
                      ></OriginalCheckbox>
                    </CustomTd>
                    <CustomTd>
                      <OriginalCheckbox
                        id='staffType3'
                        value='コーチ'
                        onChange={() => {}}
                        checked={row.staff_type_id.includes('コーチ')}
                        readonly={true}
                      ></OriginalCheckbox>
                    </CustomTd>
                    <CustomTd>
                      <OriginalCheckbox
                        id='staffType4'
                        value='マネージャー'
                        onChange={() => {}}
                        checked={row.staff_type_id.includes('マネージャー')}
                        readonly={true}
                      ></OriginalCheckbox>
                    </CustomTd>
                    <CustomTd>
                      <OriginalCheckbox
                        id='staffType5'
                        value='管理代理'
                        onChange={() => {}}
                        checked={row.staff_type_id.includes('管理代理')}
                        readonly={true}
                      ></OriginalCheckbox>
                    </CustomTd>
                  </CustomTr>
                ))}
              </CustomTbody>
            </CustomTable>
          </div>
        )}
        <div className='flex flex-row justify-center gap-[20px] py-[20px]'>
          <CustomButton
            className='w-[300px] h-[50px]'
            onClick={() => {
              router.back();
            }}
          >
            戻る
          </CustomButton>
          {mode === 'delete' && (
            <CustomButton
              className='w-[300px] h-[50px]'
              buttonType='primary'
              onClick={async () => {
                const isOk = window.confirm('団体情報を削除します。よろしいですか？');
                const csrf = () => axios.get('/sanctum/csrf-cookie');
                await csrf();
                if (!isOk) return;
                axios
                  // .delete('/organization')
                  .post('/deleteOrgData', org_id)
                  .then((res) => {
                    // TODO: 削除成功時の処理
                    //console.log(res);
                    router.back();
                  })
                  .catch((error) => {
                    console.group(error);
                    setErrorMessage([
                      '団体情報の削除に失敗しました。ユーザーサポートにお問い合わせください。',
                    ]);
                    // TODO: 削除失敗時の処理
                  });
              }}
            >
              削除
            </CustomButton>
          )}
        </div>
      </div>
    </main>
  );
}
