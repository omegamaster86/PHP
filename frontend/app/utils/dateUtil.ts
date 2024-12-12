import { format } from 'date-fns';

type FormatType = 'yyyy-MM-dd' | 'yyyy/MM/dd' | 'yyyy/MM/dd HH:mm';
export const formatDate = (dateStr: string | null, formatType: FormatType): string => {
  if (!dateStr) return '';
  const date = format(new Date(dateStr), formatType);
  return date;
};
