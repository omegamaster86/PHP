import { format } from 'date-fns';

type FormatType = 'yyyy-MM-dd' | 'yyyy/MM/dd';
export const formatDate = (dateStr: string, formatType: FormatType): string => {
  const date = format(new Date(dateStr), formatType);
  return date;
};
