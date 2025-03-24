import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const SortIcon = ({ sortFlag, onClick }: { sortFlag: boolean; onClick: () => void }) => {
  const SortIcon = sortFlag ? KeyboardArrowDownIcon : KeyboardArrowUpIcon;
  return <SortIcon onClick={onClick} />;
};

export default SortIcon;
