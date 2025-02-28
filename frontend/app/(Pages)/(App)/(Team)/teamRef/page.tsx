// 団体情報参照・削除画面
'use client';

import { CustomButton, CustomTitle, ErrorBox, Label } from '@/app/components';
import { useUserType } from '@/app/hooks/useUserType';
import axios from '@/app/lib/axios';
import {
  Organization,
  PlayerInformationResponse,
  StaffRef,
  TeamResponse,
  Tournament,
  UserIdType,
} from '@/app/types';
import { ROLE } from '@/app/utils/consts';
import { Tab, Tabs } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { SyntheticEvent, useState } from 'react';
import { BelongPlayer } from './_components/BelongPlayer';
import { BelongStaff } from './_components/BelongStaff';
import { EntryTournament } from './_components/EntryTournament';
import { SponsoredTournament } from './_components/SponsoredTournament';

export default function TeamRef() {
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [formData, setFormData] = useState({} as Organization);
  const [hostTournaments, setHostTournaments] = useState([] as Tournament[]);
  const [entTournaments, setEntTournaments] = useState([] as Tournament[]);
  const [players, setPlayers] = useState([] as PlayerInformationResponse[]);
  const [staffs, setStaffs] = useState([] as StaffRef[]);
  const [value, setValue] = useState(0);
  const [userIdType, setUserIdType] = useState({} as UserIdType); //ユーザIDに紐づいた情報 20240222
  const [teamdata, setTeamdata] = useState([] as TeamResponse[]); //該当ユーザが管理する団体情報の取得 20240415
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const isDeleteMode = mode === 'delete';

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

  useUserType({
    onSuccess: async (userType) => {
      const fetchData = async () => {
        try {
          // 主催大会
          const hostTournamentsResponse = await axios.post('api/getTournamentInfoData_org', org_id);
          setHostTournaments(hostTournamentsResponse.data.result);
          const entTournamentsResponse = await axios.post(
            'api/getEntryTournamentsViewForTeamRef',
            org_id,
          );
          setEntTournaments(entTournamentsResponse.data.result);
          const playersResponse = await axios.post('api/getOrgPlayers', org_id);
          setPlayers(playersResponse.data.result);

          const staffsResponse = await axios.post('api/getOrgStaffData', org_id); //スタッフ情報取得
          setStaffs(staffsResponse.data.result);

          const playerInf = await axios.get('api/getIDsAssociatedWithUser');
          setUserIdType(playerInf.data.result[0]); //ユーザIDに紐づいた情報

          const responseData = await axios.get('api/getOrganizationForOrgManagement'); //団体データ取得
          setTeamdata(responseData.data.result);
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || `API取得エラー: ${error.message}`;
          setErrorMessage([errorMessage]);
        }
      };

      await axios
        .post<{ result: Organization }>('api/getOrgData', org_id)
        .then((response) => {
          setFormData(response.data.result);

          const isStaff = response.data.result.isStaff;
          const hasAuthority = userType.isOrganizationManager && isStaff;
          if (isDeleteMode && !hasAuthority) {
            router.replace('/teamSearch');
          }

          fetchData();
        })
        .catch((error) => {
          const errorMessage = error?.response?.data?.message || `API取得エラー: ${error.message}`;
          setErrorMessage([errorMessage]);
        }); //団体情報取得
    },
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
    for (let index = 0; index < teamdata.length; index++) {
      if (teamdata[index].org_id == orgId) {
        return true;
      }
    }
    return false; //ユーザが管理する団体のいずれでもない場合、falseを返す
  };

  if (formData.org_id == null) {
    return <ErrorBox errorText={errorMessage} />;
  }

  return (
    <div className='flex flex-col justify-start gap-[20px]'>
      {/* 画面名*/}
      <CustomTitle displayBack>{mode === 'delete' ? '団体情報削除' : '団体情報参照'}</CustomTitle>

      <ErrorBox errorText={errorMessage} />
      {/* フォーム */}
      <div className='bg-gradient-to-r from-primary-900 via-primary-500 to-primary-900 p-4'>
        <div className='flex flex-col gap-[30px] m-auto rounded-[10px]'>
          {/* 団体名 */}
          <Label label={formData.org_name} textColor='white' textSize='h2'></Label>
          {/* 開催情報 */}
          <Label label='開催情報' textColor='white' textSize='small' isBold={true}></Label>
          <div className='flex flex-col gap-[5px]'>
            {/* 創立年 */}
            <div className='flex flex-row'>
              <div className='text-gray-40 text-sm w-[100px]'>創立年</div>
              <Label
                label={formData.founding_year?.toString() ?? '-'}
                textColor='white'
                textSize='small'
              />
            </div>
            {/* 所在地 */}
            <div className='flex flex-row'>
              <div className='text-gray-40 text-sm min-w-[100px]'>所在地</div>
              {/* 市区町村・町字番地, 都道府県, マンション・アパート, 郵便番号1, 郵便番号 */}
              <div className='text-white text-sm'>
                {[
                  formData.post_code,
                  formData.locationPrefectureName + prefVal(),
                  formData.address1,
                  addressVal(),
                ].map((line, index) => (
                  <div key={index}> {index === 0 ? `〒${line}` : line}</div>
                ))}
              </div>
            </div>
            {/* 団体区分 */}
            <div className='flex flex-row'>
              <div className='text-gray-40 text-sm w-[100px]'>団体区分</div>
              <Label label={formData.orgClassName} textColor='white' textSize='small' />
            </div>
            {/* 団体種別 */}
            <div className='flex flex-row'>
              <div className='text-gray-40 text-sm min-w-[100px]'>団体種別</div>
              <div className='w-[100px]'>
                <Label label={formData.jaraOrgTypeName} textColor='white' textSize='small' />
                <Label label={formData.prefOrgTypeName} textColor='white' textSize='small' />
              </div>
              {(userIdType.is_administrator == ROLE.SYSTEM_ADMIN ||
                userIdType.is_jara == ROLE.JARA ||
                userIdType.is_pref_boat_officer == ROLE.PREFECTURE) && (
                <div className='w-[100px]'>
                  <Label
                    label={formData.jara_org_type == 1 ? formData.jara_org_reg_trail : '　'}
                    textColor='white'
                    textSize='small'
                  />
                  <Label
                    label={formData.pref_org_type == 1 ? formData.pref_org_reg_trail : '　'}
                    textColor='white'
                    textSize='small'
                  />
                </div>
              )}
            </div>
          </div>
          <div className='flex flex-col gap-[10px]'>
            {/* 団体ID */}
            <div className='flex flex-row '>
              <div className='text-gray-40 text-sm w-[100px]'>団体ID</div>
              <Label label={formData.org_id} textColor='white' textSize='small' />
            </div>
            {/* エントリーシステムの団体ID */}
            <div className='flex flex-row gap-[15px]'>
              <div className='text-gray-40 text-sm'>エントリーシステムの団体ID</div>
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
        className='m-auto'
        variant='scrollable'
        scrollButtons='auto'
      >
        <Tab label='主催大会' {...a11yProps(0)} />
        <Tab label='エントリー大会' {...a11yProps(1)} />
        <Tab label='所属選手' {...a11yProps(2)} />
        <Tab label='所属スタッフ' {...a11yProps(3)} />
      </Tabs>

      {/* 主催大会テーブル表示 */}
      {value === 0 && (
        <SponsoredTournament
          hostTournaments={hostTournaments}
          mode={mode}
          userIdType={userIdType}
          orgId={formData.org_id}
          checkOrgManage={checkOrgManage}
        />
      )}
      {/* エントリー大会テーブル表示 */}
      {value === 1 && <EntryTournament entTournaments={entTournaments} />}

      {/* 所属選手テーブル表示 */}
      {value === 2 && (
        <BelongPlayer
          players={players}
          mode={mode}
          userIdType={userIdType}
          checkOrgManage={checkOrgManage}
          orgId={orgId}
        />
      )}
      {/* 所属スタッフテーブル表示 */}
      {value === 3 && <BelongStaff staffs={staffs} />}
      <div className='flex flex-col items-center sm:flex-row justify-center gap-[20px] py-[20px]'>
        {window.history.length > 1 && (
          <CustomButton
            onClick={() => {
              router.back();
            }}
          >
            戻る
          </CustomButton>
        )}
        {mode === 'delete' && (
          <CustomButton
            buttonType='primary'
            onClick={async () => {
              if (isSubmitting) {
                return;
              }
              setIsSubmitting(true);

              const isOk = window.confirm('団体情報を削除します。よろしいですか？');
              if (!isOk) {
                setIsSubmitting(false);
                return;
              }

              await axios
                .post('api/deleteOrgData', org_id)
                .then((res) => {
                  // TODO: 削除成功時の処理
                  router.back();
                })
                .catch((error) => {
                  console.group(error);
                  setErrorMessage([
                    '団体情報の削除に失敗しました。ユーザーサポートにお問い合わせください。',
                  ]);
                  // TODO: 削除失敗時の処理
                });

              setIsSubmitting(false);
            }}
          >
            削除
          </CustomButton>
        )}
      </div>
    </div>
  );
}
