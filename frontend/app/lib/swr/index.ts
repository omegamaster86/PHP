import axios from '@/app/lib/axios';

interface FetcherParams {
  url: string;
  params: object;
  key?: string; // SWR内部で使うためのキーなのでfetcherでは不要
}

export const fetcher = async <T>({ url, params }: FetcherParams) => {
  const res = await axios.get<{ result: T }>(url, {
    params,
  });
  return res.data;
};
