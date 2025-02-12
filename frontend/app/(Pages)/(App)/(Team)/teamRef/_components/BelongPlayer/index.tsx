import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CustomTable,
  CustomThead,
  CustomTh,
  CustomTr,
  CustomTbody,
  CustomTd,
  OriginalCheckbox,
  CustomButton,
} from '@/app/components';
import { PLAYER_IMAGE_URL, NO_IMAGE_URL } from '@/app/utils/imageUrl';
import { CustomPlayerAvatar } from '@/app/components/CustomPlayerAvatar';

interface Player {
  player_id: number;
  player_name: string;
  photo: string;
  birthCountryName: string;
  birthPrefectureName: string;
  height: string | null;
  weight: string | null;
  side_info: boolean[];
}
interface UserIdType {
  is_administrator: number;
  is_organization_manager: number;
}

interface Props {
  players: Player[];
  mode: string | null;
  userIdType: UserIdType;
  checkOrgManage: () => boolean;
  orgId: string;
}

export const BelongPlayer: React.FC<Props> = ({
  players,
  mode,
  userIdType,
  checkOrgManage,
  orgId,
}) => {
  const router = useRouter();

  return (
    <>
      <div className='w-full bg-secondary-500 text-white h-[60px] sm:h-[40px] flex flex-col sm:flex-row justify-center items-center font-bold relative'>
        所属選手
        {mode !== 'delete' &&
          (userIdType.is_administrator == 1 ||
          (userIdType.is_organization_manager == 1 && checkOrgManage()) ? (
            <div
              className={`sm:absolute right-[10px] ${
                mode === 'delete' ? 'hidden' : 'flex flex-row gap-[10px]'
              }`}
            >
              <CustomButton
                className='w-[100px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300'
                buttonType='secondary'
                onClick={() => {
                  sessionStorage.removeItem('addPlayerList'); //Remove if it is already stored
                  router.push('/teamPlayer?mode=create&org_id=' + orgId);
                }}
              >
                所属選手編集
              </CustomButton>
              <CustomButton
                className='w-[120px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300'
                buttonType='secondary'
                onClick={() => {
                  router.push('/teamPlayerBulkRegister?org_id=' + orgId);
                }}
              >
                所属選手一括登録
              </CustomButton>
            </div>
          ) : (
            ''
          ))}
      </div>
      <div className='overflow-auto'>
        <CustomTable>
          <CustomThead>
            <CustomTr>
              <CustomTh align='center' rowSpan={2}>
                選手画像
              </CustomTh>
              <CustomTh align='center' rowSpan={2}>
                選手名
              </CustomTh>
              <CustomTh align='center' rowSpan={2}>
                選手ID
              </CustomTh>
              <CustomTh align='center' rowSpan={2}>
                出身地(国)
              </CustomTh>
              <CustomTh align='center' rowSpan={2}>
                出身地(都道府県)
              </CustomTh>
              <CustomTh align='center' rowSpan={2}>
                身長
              </CustomTh>
              <CustomTh align='center' rowSpan={2}>
                体重
              </CustomTh>
              <CustomTh align='center' rowSpan={1} colSpan={4}>
                サイド情報
              </CustomTh>
            </CustomTr>
            <CustomTr>
              <CustomTh align='center'>S</CustomTh>
              <CustomTh align='center'>B</CustomTh>
              <CustomTh align='center'>X</CustomTh>
              <CustomTh align='center'>C</CustomTh>
            </CustomTr>
          </CustomThead>
          <CustomTbody>
            {players.map((row, index) => (
              <CustomTr key={index}>
                {/* 選手画像 */}
                <CustomTd align='center'>
                  <CustomPlayerAvatar
                    fileName={row.photo}
                    alt={row.player_name}
                    sx={{
                      width: 40,
                      height: 40,
                      fontSize: 14,
                    }}
                  />
                </CustomTd>
                {/* 選手名 */}
                <CustomTd>
                  <Link
                    className='text-primary-300 underline hover:text-primary-50'
                    href={'/playerInformationRef?player_id=' + row.player_id}
                  >
                    {row.player_name}
                  </Link>
                </CustomTd>
                {/* 選手ID */}
                <CustomTd>
                  <Link
                    className='text-primary-300 underline hover:text-primary-50'
                    href={'/playerInformationRef?player_id=' + row.player_id}
                  >
                    {row.player_id}
                  </Link>
                </CustomTd>

                {/* 出身地(国) */}
                <CustomTd>{row.birthCountryName}</CustomTd>
                {/* 出身地(都道府県) */}
                <CustomTd>{row.birthPrefectureName}</CustomTd>
                {/* 身長 */}
                <CustomTd>{row.height ? `${row.height} cm` : ''}</CustomTd>
                {/* 体重 */}
                <CustomTd>{row.weight ? `${row.weight} kg` : ''}</CustomTd>
                {/* サイド情報 */}
                <CustomTd>
                  <OriginalCheckbox
                    id='sideInfoS'
                    value='S'
                    onChange={() => {}}
                    checked={row.side_info[0]}
                    readonly={true}
                  ></OriginalCheckbox>
                </CustomTd>
                <CustomTd>
                  <OriginalCheckbox
                    id='sideInfoB'
                    value='B'
                    onChange={() => {}}
                    checked={row.side_info[1]}
                    readonly={true}
                  ></OriginalCheckbox>
                </CustomTd>
                <CustomTd>
                  <OriginalCheckbox
                    id='sideInfoX'
                    value='X'
                    onChange={() => {}}
                    checked={row.side_info[2]}
                    readonly={true}
                  ></OriginalCheckbox>
                </CustomTd>
                <CustomTd>
                  <OriginalCheckbox
                    id='sideInfoC'
                    value='C'
                    onChange={() => {}}
                    checked={row.side_info[3]}
                    readonly={true}
                  ></OriginalCheckbox>
                </CustomTd>
              </CustomTr>
            ))}
          </CustomTbody>
        </CustomTable>
      </div>
    </>
  );
};
