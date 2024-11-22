import axios from '@/app/lib/axios';
import { Method } from 'axios';

interface FetcherParams {
  url: string;
  params?: object;
  method?: Method;
  key?: string; // SWR内部で使うためのキーなのでfetcherでは不要
}

export const fetcher = async <T>({ url, params, method = 'GET' }: FetcherParams) => {
  const res = await axios.request<{ result: T }>({
    url,
    params,
    method,
  });
  return res.data;
};
