type GetToLabelParams =
  | {
      type: 'userFollower';
    }
  | {
      type: 'tournFollower';
      tornName: string;
    }
  | {
      type: 'qualifiedUser';
      qualName: string;
    }
  | {
      type: 'allUser';
    };

export const useNotification = () => {
  const getToLabel = (params: GetToLabelParams): string => {
    const { type } = params;
    if (type === 'userFollower') {
      return 'フォロワー';
    } else if (type === 'tournFollower') {
      return `${params.tornName}フォロワー`;
    } else if (type === 'qualifiedUser') {
      return `${params.qualName}保持者`;
    } else if (type === 'allUser') {
      return '全ユーザー';
    }

    return '';
  };

  return {
    getToLabel,
  };
};
