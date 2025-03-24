import { useState } from 'react';

export type SortColumn = string | null;

export interface UseSortProps<T> {
  currentData: T[];
  onSort?: (sortedData: T[]) => void;
}

export interface SortState {
  column: SortColumn;
  isAscending: boolean;
}

export function useSort<T>({ currentData, onSort }: UseSortProps<T>) {
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    isAscending: true,
  });

  const handleSort = (column: SortColumn, sortFunction: (a: T, b: T) => number) => {
    setSortState((prevState) => {
      const isAscending = prevState.column === column ? !prevState.isAscending : true;
      currentData.sort((a, b) => (isAscending ? sortFunction(a, b) : sortFunction(b, a)));
      onSort?.(currentData);

      return {
        column: column,
        isAscending: isAscending,
      };
    });
  };

  return {
    sortState,
    handleSort,
  };
}
