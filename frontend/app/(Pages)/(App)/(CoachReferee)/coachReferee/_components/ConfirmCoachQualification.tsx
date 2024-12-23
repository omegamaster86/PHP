import React from 'react';
import { ICoachQualification, CoachRefereeResponse, SelectOption } from '@/app/types';
import { formatDate } from '@/app/utils/dateUtil';
import { OriginalCheckbox } from '@/app/components';

interface Props {
  coachQualificationOptions: SelectOption<number>[];
  parsedData: CoachRefereeResponse | null;
}

const ConfirmCoachQualification: React.FC<Props> = ({ coachQualificationOptions, parsedData }) => {
  const qualificationOptions = coachQualificationOptions.reduce(
    (acc, qualificationOption) => {
      acc[qualificationOption.key] = qualificationOption.value;
      return acc;
    },
    {} as Record<number, string>,
  );

  const coachQualifications = parsedData?.coachQualifications || [];

  return (
    <>
      <h2 className='text-lg md:text-xl font-bold text'>指導者資格</h2>
      <div className='mb-5'>
        <table className='table-fixed mb-5'>
          <thead className='[&_th]:pb-2'>
            <tr className='border-b border-b-border'>
              <th className='text-left text-xs md:text-sm font-normal'>JSPO ID</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='w-52 pr-2 pt-2 text-xs md:text-sm font-normal'>
                {parsedData?.jspoId}
              </td>
            </tr>
          </tbody>
        </table>
        <table className='table-fixed text-nowrap'>
          <thead className='[&_th]:pb-2 [&_th]:w-52 [&_th]:text-left [&_th]:text-xs md:[&_th]:text-sm [&_th]:font-normal'>
            <tr className='border-b border-b-border'>
              <th>資格名</th>
              <th>取得日</th>
              <th>有効期限</th>
              <th>削除</th>
            </tr>
          </thead>
          <tbody className='[&_td]:pt-2 [&_td]:pr-2 [&_td]:text-xs md:[&_td]:text-sm [&_td]:font-normal [&_td]:max-w-[50px] [&_td]:text-ellipsis [&_td]:overflow-hidden'>
            {coachQualifications.map((qualification: ICoachQualification, index:number) => (
              <tr key={qualification.heldCoachQualificationId}>
                <td>{qualificationOptions[qualification.coachQualificationId]}</td>
                <td>{formatDate(qualification.acquisitionDate, 'yyyy/MM/dd')}</td>
                <td>{formatDate(qualification.expiryDate, 'yyyy/MM/dd')}</td>
                <td>
                  <OriginalCheckbox
                    id={`delete_coachQualification${index + 1}`}
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
export default ConfirmCoachQualification;
