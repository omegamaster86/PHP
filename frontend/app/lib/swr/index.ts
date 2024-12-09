import axios from '@/app/lib/axios';
import { Method } from 'axios';

interface FetcherParams {
  url: string;
  params?: object;
  data?: object;
  method?: Method;
  key?: string; // SWR内部で使うためのキーなのでfetcherでは不要
}

export const fetcher = async <T>(args: FetcherParams): Promise<{ result: T }> => {
  const { url, params, data, method = 'GET' } = args;
  const res = await axios.request<{ result: T }>({
    url,
    params,
    method,
    data,
  });

  return res.data;
};
