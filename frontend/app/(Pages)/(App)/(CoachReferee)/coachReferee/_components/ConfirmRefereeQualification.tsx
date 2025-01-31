import React from 'react';
import { IRefereeQualification, CoachRefereeResponse, SelectOption } from '@/app/types';
import { formatDate } from '@/app/utils/dateUtil';
import { OriginalCheckbox } from '@/app/components';

interface Props {
  refereeQualificationOptions: SelectOption<number>[];
  parsedData: CoachRefereeResponse | null;
}

const ConfirmRefereeQualification: React.FC<Props> = ({
  refereeQualificationOptions,
  parsedData,
}) => {
  const qualificationOptions = refereeQualificationOptions.reduce(
    (acc, qualificationOption) => {
      acc[qualificationOption.key] = qualificationOption.value;
      return acc;
    },
    {} as Record<number, string>,
  );
  const refereeQualifications = parsedData?.refereeQualifications || [];

  return (
    <>
      <h2 className=' text-xl font-bold'>審判資格</h2>
      <div className='mb-5'>
        <table className='table-fixed text-nowrap mb-5'>
          <thead className='[&_th]:pb-2 [&_th]:w-52 [&_th]:text-left [&_th]:text-xs md:[&_th]:text-sm [&_th]:font-normal'>
            <tr className='border-b border-b-border'>
              <th>資格名</th>
              <th>取得日</th>
              <th>有効期限</th>
              <th>削除</th>
            </tr>
          </thead>
          <tbody className='[&_td]:pt-2 [&_td]:pr-2 [&_td]:text-xs md:[&_td]:text-sm [&_td]:font-normal [&_td]:max-w-[50px] [&_td]:text-ellipsis [&_td]:overflow-hidden'>
            {refereeQualifications.map((qualification: IRefereeQualification, index: number) => (
              <tr key={qualification.heldRefereeQualificationId}>
                <td>{qualificationOptions[qualification.refereeQualificationId]}</td>
                <td>{formatDate(qualification.acquisitionDate, 'yyyy/MM/dd')}</td>
                <td>
                  {!qualification.expiryDate
                    ? '-'
                    : formatDate(qualification.expiryDate, 'yyyy/MM/dd')}
                </td>
                <td>
                  <OriginalCheckbox
                    id={`delete_refereeQualification${index + 1}`}
                    value='削除'
                    checked={qualification.isDeleted}
                    readonly
                    onChange={() => {}}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ConfirmRefereeQualification;
