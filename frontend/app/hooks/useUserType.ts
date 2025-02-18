import { fetcher } from '@/app/lib/swr';
import { UserIdType } from '@/app/types';
import useSWR from 'swr';

type UserType = {
  userId: number; // ユーザID
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

const toUserType = (result: UserIdType): UserType => {
  const userType: UserType = {
    userId: result.user_id,
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

type UseUserTypeParams = {
  onSuccess?: (data: UserType) => void;
};

export const useUserType = (params?: UseUserTypeParams): UserType | null => {
  const { data } = useSWR({ url: 'api/getIDsAssociatedWithUser' }, fetcher<UserIdType[]>, {
    onSuccess: (successData) => {
      const result: UserIdType | undefined = successData.result?.[0];
      if (result && params?.onSuccess) {
        const userType = toUserType(result);
        params.onSuccess(userType);
      }
    },
  });
  const result: UserIdType | undefined = data?.result?.[0];

  if (!result) {
    return null;
  }

  const userType = toUserType(result);

  return userType;
};
