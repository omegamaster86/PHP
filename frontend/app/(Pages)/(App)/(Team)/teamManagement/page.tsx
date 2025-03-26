// 機能名: 団体管理画面
'use client';
import {
  CustomButton,
  CustomTable,
  CustomTbody,
  CustomTd,
  CustomTh,
  CustomThead,
  CustomTitle,
  CustomTr,
  ErrorBox,
} from '@/app/components';
import axios from '@/app/lib/axios';
import { TeamResponse, UserResponse } from '@/app/types';
import { DeleteOutline, EditOutlined } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, Chip, TextField } from '@mui/material';
import { useSort } from '@/app/hooks/useSort';
import { SortableHeader } from '@/app/components/SortableHeader';

//団体種別フィルター用
interface OrgTypeList {
  id: number;
  name: string;
}
//団体名フィルター用
interface OrgNameList {
  id: number;
  name: string;
}

const createSortFunctions = (
  handleSort: (key: string, compareFn: (a: any, b: any) => number) => void,
) => ({
  teamTyp: () => handleSort('teamTyp', (a, b) => a.teamTyp.localeCompare(b.teamTyp)),
  entrySystemId: () =>
    handleSort(
      'entrysystem_org_id',
      (a, b) => Number(a.entrysystem_org_id) - Number(b.entrysystem_org_id),
    ),
  orgId: () => handleSort('org_id', (a, b) => Number(a.org_id) - Number(b.org_id)),
  orgName: () => handleSort('org_name', (a, b) => a.org_name.localeCompare(b.org_name)),
});

export default function TeamManagement() {
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [team, setTeam] = useState([] as TeamResponse[]);
  const router = useRouter();
  const [validFlag, setValidFlag] = useState(false); //URL直打ち対策（ユーザ種別が不正なユーザが遷移できないようにする） 20240418

  //団体種別
  const [orgTypeList, setOrgTypeList] = useState([] as OrgTypeList[]);
  const [selectedOrgTypeList, setSelectedOrgTypeList] = useState([] as OrgTypeList[]);
  //団体名
  const [orgNameList, setOrgNameList] = useState([] as OrgNameList[]);
  const [selectedOrgNameList, setSelectedOrgNameList] = useState([] as OrgNameList[]);

  // フィルター用のステート 20240724
  const [showOrgTypeAutocomplete, setShowOrgTypeAutocomplete] = useState(false); //種目のフィルター実装　20240724
  const [showOrgNameAutocomplete, setShowOrgNameAutocomplete] = useState(false); //種目のフィルター実装　20240724

  const orgTypefocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240724
  const orgNamefocusTarget = useRef(null); //フィルターにフォーカスを当てる際に使用 20240724

  //団体種別
  const [selectedOrgTypeHeader, setSelectedOrgTypeHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });
  //団体名
  const [selectedOrgNameHeader, setSelectedOrgNameHeader] = useState({
    value: '',
    position: { top: 0, right: 0 },
  });

  /**
   * 団体種別ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleOrgTypeHeaderClick = (value: string, event: MouseEvent<HTMLElement>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedOrgTypeHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        right: headerPosition.left + window.scrollX,
      },
    });
    setShowOrgTypeAutocomplete((prev) => !prev);
  };
  /**
   * 団体名ヘッダークリック時の処理
   * @param value
   * @param event
   * ヘッダーの位置を取得し、オートコンプリートを表示する
   */
  const handleOrgNameHeaderClick = (value: string, event: MouseEvent<HTMLElement>) => {
    const headerPosition = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedOrgNameHeader({
      value,
      position: {
        top: headerPosition.bottom + window.scrollY,
        right: headerPosition.right + window.scrollX,
      },
    });
    setShowOrgNameAutocomplete((prev) => !prev);
  };

  //ユーザIDに紐づいた情報の取得 20240418
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<{ result: UserResponse }>('api/user');
        if (Object.keys(response.data.result).length > 0) {
          const playerInf = await axios.get('api/getIDsAssociatedWithUser');
          if (
            playerInf.data.result[0].is_administrator == 1 ||
            playerInf.data.result[0].is_jara == 1 ||
            playerInf.data.result[0].is_pref_boat_officer == 1 ||
            playerInf.data.result[0].is_organization_manager == 1
          ) {
            setValidFlag(true); //URL直打ち対策（ユーザ種別が不正なユーザが遷移できないようにする） 20240418
          } else {
            //console.log('ユーザ種別不正');
            router.push('/teamSearch');
          }
        } else {
          //console.log('ユーザ情報なし');
          router.push('/teamSearch');
        }
      } catch (error: any) {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('api/getOrganizationForOrgManagement'); //団体データ取得
        const fetchedTeams = response.data.result.map((record: any) => ({
          ...record,
          isStaff: record.isStaff === 1,
        }));
        setTeam(fetchedTeams);
      } catch (error) {
        setErrorMessage(['API取得エラー:' + (error as Error).message]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    //団体種別をフィルターできるようにする 20240724
    const orgTypeArray = team.map((item: any) => item.teamTyp);
    const uniqueOrgTypeSet = new Set(orgTypeArray);
    const uniqueOrgTypeArray = Array.from(uniqueOrgTypeSet);
    setOrgTypeList(
      uniqueOrgTypeArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
    //団体種別をフィルターできるようにする 20240724
    const orgNameArray = team.map((item: any) => item.org_name);
    const uniqueOrgNameSet = new Set(orgNameArray);
    const uniqueOrgNameArray = Array.from(uniqueOrgNameSet);
    setOrgNameList(
      uniqueOrgNameArray.map((item: any, index: any) => ({
        id: index,
        name: item,
      })),
    );
  }, [team]);

  useEffect(() => {
    if (showOrgTypeAutocomplete) {
      if (orgTypefocusTarget.current != null) {
        var target = orgTypefocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedOrgTypeList.length
          ] as HTMLElement
        ).focus();
      }
    }
    if (showOrgNameAutocomplete) {
      if (orgNamefocusTarget.current != null) {
        var target = orgNamefocusTarget.current as HTMLDivElement;
        (
          target.childNodes[0].childNodes[0].childNodes[1].childNodes[
            selectedOrgNameList.length
          ] as HTMLElement
        ).focus();
      }
    }
  }, [showOrgTypeAutocomplete, showOrgNameAutocomplete]);

  const { sortState, handleSort } = useSort<TeamResponse>({
    currentData: team,
    onSort: setTeam,
  });

  const sortFunctions = useMemo(() => createSortFunctions(handleSort), [handleSort]);

  if (!validFlag) return null;

  return (
    <>
      <CustomTitle displayBack={true}>団体管理</CustomTitle>
      {/* エラー表示１ */}
      <ErrorBox errorText={errorMessage} />
      <div className='w-full bg-primary-500 text-white h-[40px] flex justify-center items-center'>
        <div className='font-bold'>管理団体一覧</div>
      </div>
      <div className='overflow-x-auto'>
        <CustomTable>
          <CustomThead>
            <CustomTr>
              <CustomTh align='left'>
                <SortableHeader
                  column='teamTyp'
                  label='団体種別'
                  sortState={sortState}
                  onSort={sortFunctions.teamTyp}
                  hasFilter
                  isFiltered={selectedOrgTypeList.length > 0}
                  onFilter={(event) => handleOrgTypeHeaderClick('団体種別', event)}
                />
              </CustomTh>
              <CustomTh align='left'>
                <SortableHeader
                  column='entrysystem_org_id'
                  label='エントリーシステムの団体ID'
                  sortState={sortState}
                  onSort={sortFunctions.entrySystemId}
                />
              </CustomTh>
              <CustomTh align='left'>
                <SortableHeader
                  column='org_id'
                  label='団体ID'
                  sortState={sortState}
                  onSort={sortFunctions.orgId}
                />
              </CustomTh>
              <CustomTh align='left'>
                <SortableHeader
                  column='org_name'
                  label='団体名'
                  sortState={sortState}
                  onSort={sortFunctions.orgName}
                  hasFilter
                  isFiltered={selectedOrgNameList.length > 0}
                  onFilter={(event) => handleOrgNameHeaderClick('団体名', event)}
                />
              </CustomTh>
              <CustomTh align='left'>操作</CustomTh>
            </CustomTr>
          </CustomThead>
          <CustomTbody>
            {team
              .filter((row) => {
                if (selectedOrgTypeList.length > 0) {
                  return selectedOrgTypeList.some((item) => item.name === row.teamTyp);
                } else {
                  return true;
                }
              })
              .filter((row) => {
                if (selectedOrgNameList.length > 0) {
                  return selectedOrgNameList.some((item) => item.name === row.org_name);
                } else {
                  return true;
                }
              })
              .map((row) => (
                <CustomTr key={row.org_id}>
                  {/* 団体種別 */}
                  <CustomTd>{row.teamTyp}</CustomTd>
                  {/* エントリーシステムの団体ID */}
                  <CustomTd>
                    <Link
                      className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                      href={{
                        pathname: '/teamRef',
                        query: { org_id: row.org_id.toString() },
                      }}
                    >
                      {row.entrysystem_org_id}
                    </Link>
                  </CustomTd>
                  {/* 団体ID */}
                  <CustomTd>
                    <Link
                      className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                      href={{
                        pathname: '/teamRef',
                        query: { org_id: row.org_id.toString() },
                      }}
                    >
                      {row.org_id}
                    </Link>
                  </CustomTd>
                  {/* 団体名 */}
                  <CustomTd>
                    <Link
                      className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                      href={{
                        pathname: '/teamRef',
                        query: { org_id: row.org_id.toString() },
                      }}
                    >
                      {row.org_name}
                    </Link>
                  </CustomTd>
                  <CustomTd>
                    <div className='flex items-center gap-4'>
                      {/* 更新ボタン */}
                      <CustomButton
                        onClick={() => {
                          router.push('/team?mode=update&org_id=' + row.org_id.toString());
                        }}
                        buttonType='white-outlined'
                        className='w-[60px] text-nowrap text-small h-[40px] p-[0px] border-transparent'
                      >
                        <EditOutlined className='text-secondaryText text-normal mr-[2px]'></EditOutlined>
                        更新
                      </CustomButton>
                      {/* 削除ボタン */}
                      {row.isStaff && (
                        <CustomButton
                          onClick={() => {
                            router.push('/teamRef?mode=delete&org_id=' + row.org_id.toString());
                          }}
                          buttonType='white-outlined'
                          className='w-[60px] text-small h-[40px] p-[0px] border-transparent'
                        >
                          <DeleteOutline className='text-secondaryText text-normal mr-[2px]' />
                          削除
                        </CustomButton>
                      )}
                    </div>
                  </CustomTd>
                </CustomTr>
              ))}
          </CustomTbody>
        </CustomTable>
      </div>
      {/* 団体種別フィルター用のオートコンプリート 20240723 */}
      {showOrgTypeAutocomplete && (
        <div
          ref={orgTypefocusTarget}
          style={{
            position: 'absolute',
            top: `${selectedOrgTypeHeader.position.top - 120}px`,
            right: `max(0px, calc(100vw - ${selectedOrgTypeHeader.position.right}px - 300px))`,
            backgroundColor: 'white',
            borderRadius: '4px',
            zIndex: 1000,
            padding: '8px',
          }}
          onBlur={() => setShowOrgTypeAutocomplete(false)} //フォーカスが外れたら非表示にする 20240723
        >
          <Autocomplete
            id='orgType'
            multiple
            options={orgTypeList}
            sx={{ width: 300 }}
            filterOptions={(options, { inputValue }) =>
              options.filter((option) => option.name?.includes(inputValue))
            }
            value={selectedOrgTypeList || []}
            onChange={(e: ChangeEvent<{}>, newValue: OrgTypeList[]) => {
              setSelectedOrgTypeList(newValue);
            }}
            renderOption={(props: any, option: OrgTypeList) => {
              return (
                <li {...props} key={option.id}>
                  {option.name}
                </li>
              );
            }}
            renderTags={(value: OrgTypeList[], getTagProps: any) => {
              return value.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
              ));
            }}
            renderInput={(params) => (
              <TextField
                key={params.id}
                className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                {...params}
                label={'団体種別'}
              />
            )}
          />
        </div>
      )}
      {showOrgNameAutocomplete && (
        <div
          ref={orgNamefocusTarget}
          style={{
            position: 'absolute',
            top: `${selectedOrgNameHeader.position.top - 120}px`,
            right: `max(0px, calc(100vw - ${selectedOrgNameHeader.position.right}px - 300px))`,
            backgroundColor: 'white',
            borderRadius: '4px',
            zIndex: 1000,
            padding: '8px',
          }}
          onBlur={() => setShowOrgNameAutocomplete(false)} //フォーカスが外れたら非表示にする 20240723
        >
          <Autocomplete
            id='orgName'
            multiple
            options={orgNameList}
            sx={{ width: 300 }}
            filterOptions={(options, { inputValue }) =>
              options.filter((option) => option.name?.includes(inputValue))
            }
            value={selectedOrgNameList || []}
            onChange={(e: ChangeEvent<{}>, newValue: OrgNameList[]) => {
              setSelectedOrgNameList(newValue);
            }}
            renderOption={(props: any, option: OrgNameList) => {
              return (
                <li {...props} key={option.id}>
                  {option.name}
                </li>
              );
            }}
            renderTags={(value: OrgNameList[], getTagProps: any) => {
              return value.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.id} label={option.name} />
              ));
            }}
            renderInput={(params) => (
              <TextField
                key={params.id}
                className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                {...params}
                label={'団体名'}
              />
            )}
          />
        </div>
      )}
      <div className='flex justify-center items-center gap-[20px] mt-[20px]'>
        {/* 戻るボタン */}
        <CustomButton
          buttonType='white-outlined'
          className='text-small'
          onClick={() => {
            router.back();
          }}
        >
          戻る
        </CustomButton>
      </div>
    </>
  );
}
