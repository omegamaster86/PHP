import { fetcher } from '@/app/lib/swr';
import { UserIdType } from '@/app/types';
import { useMemo } from 'react';
import useSWR from 'swr';

type UserType = {
  userId: number | null; // ユーザID
  playerId: number | null; // 選手ID
  volunteerId: number | null; // ボランティアID
  isAdministrator: boolean; // 管理者
  isJara: boolean; // JARA
  isPrefBoatOfficer: boolean; // 県ボ
  isOrganizationManager: boolean; // 団体管理者
  isPlayer: boolean; // 選手
  isVolunteer: boolean; // ボランティア
  isAudience: boolean; // 一般ユーザ
};

const toUserType = (result: UserIdType | undefined): UserType => {
  const userType: UserType = {
    userId: result?.user_id ?? null,
    playerId: result?.player_id ?? null,
    volunteerId: result?.volunteer_id ?? null,
    isAdministrator: Number(result?.is_administrator) === 1,
    isJara: Number(result?.is_jara) === 1,
    isPrefBoatOfficer: Number(result?.is_pref_boat_officer) === 1,
    isOrganizationManager: Number(result?.is_organization_manager) === 1,
    isPlayer: Number(result?.is_player) === 1,
    isVolunteer: Number(result?.is_volunteer) === 1,
    isAudience: Number(result?.is_audience) === 1,
  };

  return userType;
};

export const useUserType = (): UserType => {
  const { data } = useSWR({ url: 'api/getIDsAssociatedWithUser' }, fetcher<UserIdType[]>);
  const result: UserIdType | undefined = data?.result?.[0];
  const userType = useMemo(() => toUserType(result), [result]);

  return userType;
};
