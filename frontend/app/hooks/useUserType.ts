import { fetcher } from '@/app/lib/swr';
import { UserIdType } from '@/app/types';
import useSWR from 'swr';

type UserType = {
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

export const useUserType = (): UserType | null => {
  const { data } = useSWR({ url: '/getIDsAssociatedWithUser' }, fetcher<UserIdType[]>);
  const result: UserIdType | undefined = data?.result[0];

  if (!result) {
    return null;
  }

  const userType: UserType = {
    playerId: result.player_id,
    volunteerId: result.volunteer_id,
    isAdministrator: Number(result.is_administrator) === 1,
    isJara: Number(result.is_jara) === 1,
    isPrefBoatOfficer: Number(result.is_pref_boat_officer) === 1,
    isOrganizationManager: Number(result.is_organization_manager) === 1,
    isPlayer: Number(result.is_player) === 1,
    isVolunteer: Number(result.is_volunteer) === 1,
    isAudience: Number(result.is_audience) === 1,
  };

  return userType;
};
