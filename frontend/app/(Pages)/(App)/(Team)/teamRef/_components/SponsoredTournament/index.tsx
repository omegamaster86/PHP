import React from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import {
  CustomTable,
  CustomThead,
  CustomTh,
  CustomTr,
  CustomTbody,
  CustomTd,
  CustomButton,
} from '@/app/components';

interface Tournament {
  tournTypeName: string;
  tourn_name: string;
  tourn_id?: string | undefined;
  event_start_date: string;
  event_end_date: string;
  venue_name: string;
  tourn_url: string;
}

interface UserIdType {
  is_administrator: number;
  is_organization_manager: number;
}

interface Props {
  hostTournaments: Tournament[];
  mode: string | null;
  userIdType: UserIdType;
  checkOrgManage: () => boolean;
}

export const SponsoredTournament: React.FC<Props> = ({
  hostTournaments,
  mode,
  userIdType,
  checkOrgManage,
}) => {
  const router = useRouter();

  return (
    <>
      <div className='w-full bg-primary-500 text-white h-[40px] flex justify-center items-center font-bold relative'>
        <div className='absolute'>主催大会</div>
        {mode !== 'delete' &&
          (userIdType.is_administrator == 1 ||
            (userIdType.is_organization_manager == 1 && checkOrgManage())) && (
            <div className='absolute right-[10px]'>
              <CustomButton
                className='w-[100px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300'
                buttonType='secondary'
                onClick={() => {
                  router.push('/tournament?mode=create');
                }}
              >
                大会登録
              </CustomButton>
            </div>
          )}
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
            {hostTournaments.map((row, index) => (
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
                    target='_blank'
                    className='text-primary-300 underline hover:text-primary-50'
                  >
                    {row.tourn_name}
                  </Link>
                </CustomTd>
                {/* 開催期間 */}
                <CustomTd>
                  {row.event_start_date} ~ {row.event_end_date}
                </CustomTd>
                {/* 開催場所 */}
                <CustomTd>{row.venue_name}</CustomTd>
                {/* 大会URL */}
                <CustomTd>
                  <Link
                    href={row.tourn_url || ''}
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
