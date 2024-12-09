type GetStorageKeyParams =
  | {
      pageName: string;
      type: 'create';
    }
  | {
      pageName: string;
      type: 'update';
      id: number | string;
    };
export const getStorageKey = (params: GetStorageKeyParams) => {
  if (params.type === 'create') {
    return `${params.pageName}-${params.type}`;
  }
  return `${params.pageName}-${params.type}-${params.id}`;
};

export const getSessionStorage = <T>(key: string): T | null => {
  const data = sessionStorage.getItem(key);
  return data ? (JSON.parse(data) as T) : null;
};

export const setSessionStorage = <T>(key: string, value: T): void => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const removeSessionStorage = (key: string): void => {
  sessionStorage.removeItem(key);
};
