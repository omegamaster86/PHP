import { SortColumn, SortState } from '@/app/hooks/useSort';
import SortIcon from '@/app/components/UpDownIcon';
import FilterListIcon from '@mui/icons-material/FilterList';
import { MouseEvent } from 'react';

interface SortableHeaderProps {
  column: SortColumn;
  label: string;
  sortState: SortState;
  onSort: () => void;
  hasFilter?: boolean;
  isFiltered?: boolean;
  onFilter?: (event: MouseEvent<HTMLElement>) => void;
}

export function SortableHeader({
  column,
  label,
  sortState,
  onSort,
  hasFilter,
  isFiltered,
  onFilter,
}: SortableHeaderProps) {
  return (
    <div className='flex flex-row items-center gap-[10px]'>
      <div
        className='underline'
        style={{ cursor: 'pointer', textDecorationThickness: '3px' }}
        onClick={onSort}
      >
        {label}
      </div>
      {sortState.column === column && (
        <SortIcon sortFlag={!sortState.isAscending} onClick={onSort} />
      )}
      {hasFilter && (
        <button
          type='button'
          style={{
            cursor: 'pointer',
            color: isFiltered ? '#F44336' : '#001D74',
          }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onFilter}
        >
          <FilterListIcon />
        </button>
      )}
    </div>
  );
}
