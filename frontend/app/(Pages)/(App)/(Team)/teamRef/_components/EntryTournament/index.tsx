import React from 'react';
import Link from 'next/link';
import {
  CustomTable,
  CustomThead,
  CustomTh,
  CustomTr,
  CustomTbody,
  CustomTd,
} from '@/app/components';
import { formatDate } from '@/app/utils/dateUtil';

interface Tournament {
  tournTypeName: string;
  tourn_name: string;
  tourn_id?: string;
  event_start_date: string;
  event_end_date: string;
  venue_name: string;
  tourn_url: string;
}

interface Props {
  entTournaments: Tournament[];
}

export const EntryTournament: React.FC<Props> = ({ entTournaments }) => {
  return (
    <>
      <div className='w-full bg-primary-500 text-white h-[40px] flex justify-center items-center font-bold'>
        エントリー大会
      </div>
      <div className='overflow-auto'>
        <CustomTable>
          <CustomThead>
            <CustomTr>
              <CustomTh align='left'>大会種別</CustomTh>
              <CustomTh align='left'>大会名</CustomTh>
              <CustomTh align='left'>開催期間</CustomTh>
              <CustomTh align='left'>開催場所</CustomTh>
              <CustomTh align='left'>大会URL</CustomTh>
            </CustomTr>
          </CustomThead>
          <CustomTbody>
            {entTournaments.map((row, index) => (
              <CustomTr key={index}>
                {/* 大会種別 */}
                <CustomTd>{row.tournTypeName}</CustomTd>
                {/* 大会名 */}
                <CustomTd>
                  <Link
                    href={{
                      pathname: '/tournamentRef',
                      query: { tournId: row.tourn_id?.toString() },
                    }}
                    className='text-primary-300 underline hover:text-primary-50'
                  >
                    {row.tourn_name}
                  </Link>
                </CustomTd>
                {/* 開催期間 */}
                <CustomTd>
                  {formatDate(row.event_start_date, 'yyyy/MM/dd')} ~ {formatDate(row.event_end_date, 'yyyy/MM/dd')}
                </CustomTd>
                {/* 開催場所 */}
                <CustomTd>{row.venue_name}</CustomTd>
                {/* 大会URL */}
                <CustomTd>
                  <Link
                    href={row.tourn_url || ('' as string)}
                    rel='noopener noreferrer'
                    target='_blank'
                    className='text-primary-300 underline hover:text-primary-50'
                  >
                    {row.tourn_url}
                  </Link>
                </CustomTd>
              </CustomTr>
            ))}
          </CustomTbody>
        </CustomTable>
      </div>
    </>
  );
};
