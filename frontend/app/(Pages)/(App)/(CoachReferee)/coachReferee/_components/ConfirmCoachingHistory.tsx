import React from 'react';
import { CoachRefereeResponse, SelectOption, OrganizationListData } from '@/app/types';
import { formatDate } from '@/app/utils/dateUtil';
import { OriginalCheckbox } from '@/app/components';

interface Props {
  organizationOptions: OrganizationListData[];
  staffOptions: SelectOption<number>[];
  parsedData: CoachRefereeResponse | null;
}

const ConfirmCoachingHistory: React.FC<Props> = ({
  organizationOptions,
  staffOptions,
  parsedData,
}) => {
  const organizations = organizationOptions.reduce(
    (acc, organizationData) => {
      acc[organizationData.org_id] = organizationData.org_name;
      return acc;
    },
    {} as Record<number, string>,
  );

  const staffTypeOptions = staffOptions.reduce(
    (acc, staffData) => {
      acc[staffData.key] = staffData.value;
      return acc;
    },
    {} as Record<number, string>,
  );

  const coachingHistories = parsedData?.coachingHistories || [];

  return (
    <>
      <h2 className='text-lg md:text-xl font-bold'>指導履歴</h2>
      <table className='text-nowrap mb-5'>
        <thead className='[&_th]:pb-2 [&_th]:w-52 [&_th]:text-left [&_th]:text-xs md:[&_th]:text-sm [&_th]:font-normal'>
          <tr className='border-b border-b-border '>
            <th>開始日</th>
            <th>終了日</th>
            <th>団体名</th>
            <th>スタッフ種別</th>
            <th>削除</th>
          </tr>
        </thead>
        <tbody className='[&_td]:pt-2 [&_td]:pr-2 [&_td]:text-xs md:[&_td]:text-sm [&_td]:font-normal [&_td]:max-w-[50px] [&_td]:text-ellipsis [&_td]:overflow-hidden'>
          {coachingHistories.map((history: CoachRefereeResponse['coachingHistories'][number], index: number) => (
            <tr key={history.orgCoachingHistoryId}>
              <td>{formatDate(history.startDate, 'yyyy/MM/dd')}</td>
              <td>
                {history.isEndDateUndefined
                  ? '未定'
                  : formatDate(history.endDate, 'yyyy/MM/dd') || '未定'}
              </td>
              <td>{organizations[history.orgId]}</td>
              <td>{staffTypeOptions[history.staffTypeId]}</td>
              <td>
                <OriginalCheckbox
                  id={`delete_coachingHistory${index + 1}`}
                  value='削除'
                  checked={history.isDeleted}
                  readonly
                  onChange={() => {}}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default ConfirmCoachingHistory;
