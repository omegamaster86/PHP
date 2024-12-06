import React from 'react';

const ConfirmRefereeQualification = () => {
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
            </tr>
          </thead>
          <tbody className='[&_td]:pt-2 [&_td]:pr-2 [&_td]:text-xs md:[&_td]:text-sm [&_td]:font-normal [&_td]:max-w-[50px] [&_td]:text-ellipsis [&_td]:overflow-hidden'>
            <tr>
              <td>資格A</td>
              <td>2024/01/01</td>
              <td>2024/01/01</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ConfirmRefereeQualification;
