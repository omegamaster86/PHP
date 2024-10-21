import { useEffect, useState } from 'react';

export const useInfiniteList = <T>(data: T[], perPage = 10) => {
  const [page, setPage] = useState(1);
  const [infiniteList, setInfiniteList] = useState<T[]>([]);

  const isLastPage = data.length / perPage <= page;

  const fetchMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    const start = 0;
    const end = perPage * page;
    setInfiniteList(data.slice(start, end));
  }, [data, page, perPage]);

  return { infiniteList, isLastPage, fetchMore };
};
