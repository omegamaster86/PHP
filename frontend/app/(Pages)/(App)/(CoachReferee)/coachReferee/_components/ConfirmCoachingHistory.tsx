import React from 'react';

const ConfirmCoachingHistory = () => {
  return (
    <div>
      <h2 className='text-lg md:text-xl font-bold'>指導履歴</h2>
      <table className='text-nowrap mb-5'>
        <thead className='[&_th]:pb-2 [&_th]:w-52 [&_th]:text-left [&_th]:text-xs md:[&_th]:text-sm [&_th]:font-normal'>
          <tr className='border-b border-b-border '>
            <th>開始日</th>
            <th>終了日</th>
            <th>団体名</th>
            <th>スタッフ種別</th>
          </tr>
        </thead>
        <tbody className='[&_td]:pt-2 [&_td]:pr-2 [&_td]:text-xs md:[&_td]:text-sm [&_td]:font-normal [&_td]:max-w-[50px] [&_td]:text-ellipsis [&_td]:overflow-hidden'>
          <tr>
            <td>2024/01/01</td>
            <td>2024/01/01</td>
            <td>日本ローイング協会</td>
            <td>コーチ</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ConfirmCoachingHistory;
