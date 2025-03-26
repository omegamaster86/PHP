// 団体検索画面
'use client';

import {
  CustomButton,
  CustomDropdown,
  CustomTable,
  CustomTd,
  CustomTextField,
  CustomTh,
  CustomThead,
  CustomTitle,
  CustomTr,
  CustomYearPicker,
  ErrorBox,
  InputLabel,
} from '@/app/components';
import { SortableHeader } from '@/app/components/SortableHeader';
import { useSort } from '@/app/hooks/useSort';
import axios from '@/app/lib/axios';
import {
  Org,
  OrgClass,
  OrgClassResponse,
  OrgType,
  OrgTypeResponse,
  Prefecture,
  PrefectureResponse,
  UserIdType,
  UserResponse,
} from '@/app/types';
import { ROLE } from '@/app/utils/consts';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import { Divider } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface SearchCond {
  entrySystemId: string;
  org_id: string;
  org_name: string;
  org_class: string;
  orgClassName: string;
  org_type: string;
  orgTypeName: string;
  foundingYear_start: string;
  foundingYear_end: string;
  residenceCountryId: string;
  residenceCountryName: string;
  residencePrefectureId: string;
  residencePrefectureName: string;
}

const createSortFunctions = (
  handleSort: (key: string, compareFn: (a: any, b: any) => number) => void,
) => ({
  entrySystemId: () =>
    handleSort('entrySystemId', (a, b) => a.entrysystem_org_id - b.entrysystem_org_id),
  orgId: () => handleSort('orgId', (a, b) => a.org_id - b.org_id),
  orgName: () => handleSort('orgName', (a, b) => a.org_name.localeCompare(b.org_name)),
  foundingYear: () =>
    handleSort('foundingYear', (a, b) => {
      if (a.founding_year === null) return 1;
      if (b.founding_year === null) return -1;
      return a.founding_year - b.founding_year;
    }),
  orgType: () => handleSort('orgType', (a, b) => a.orgTypeName.localeCompare(b.orgTypeName)),
  orgClassName: () =>
    handleSort('orgClassName', (a, b) => a.orgClassName.localeCompare(b.orgClassName)),
});

export default function TeamSearch() {
  const router = useRouter();
  const [orgTypeOptions, setOrgTypeOptions] = useState<OrgTypeResponse[]>([]); // 団体種別
  const [orgClassOptions, setOrgClassOptions] = useState<OrgClassResponse[]>([]); // 団体区分
  const [prefectureOptions, setPrefectureOptions] = useState<PrefectureResponse[]>([]);
  const [user, setUser] = useState<UserResponse>({} as UserResponse); // ユーザー情報
  const [formData, setFormData] = useState<SearchCond>({
    entrySystemId: '',
    org_id: '',
    org_name: '',
    org_type: '',
    orgTypeName: '',
    org_class: '',
    orgClassName: '',
    foundingYear_start: '',
    foundingYear_end: '',
    residenceCountryId: '',
    residenceCountryName: '',
    residencePrefectureId: '',
    residencePrefectureName: '',
  });
  const [errorMessages, setErrorMessages] = useState([] as string[]); // エラーメッセージ
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const [orgSearchResult, setOrgSearchResult] = useState<Org[]>([]); // 検索結果
  const [visibleData, setVisibleData] = useState<Org[]>([]); // 表示するデータ
  const [visibleItems, setVisibleItems] = useState(10); // 表示するデータの数
  const [userIdType, setUserIdType] = useState({} as UserIdType); //ユーザIDに紐づいた情報 20240222

  /**
   * 検索ボタン押下時の処理
   * @returns
   * @description
   * 検索ボタン押下時の処理
   * 検索条件を元にAPIを叩いて検索結果を取得する
   * 検索結果をstateにセットする
   */
  const handleSearch = async () => {
    formData.residenceCountryId = '112'; //仕様変更により、日本の固定値を代入 20240223
    axios
      .post('api/orgSearch', formData)
      .then((response) => {
        const data = response.data.result;
        for (let index = 0; index < data.length; index++) {
          if (
            data[index].orgTypeName == 'JARA・県ボ' ||
            data[index].orgTypeName == 'JARA' ||
            data[index].orgTypeName == '県ボ'
          ) {
            data[index].orgTypeName = '正規';
          }
        }
        if (data.length > 100) {
          window.alert('検索結果が100件を超えました、上位100件を表示しています。');
        }
        // レスポンスからデータを取り出してstateにセット
        setOrgSearchResult(data);
        // 最初は10件だけ表示
        setVisibleItems(10);
        setVisibleData(data.slice(0, 10));
      })
      .catch((error) => {
        // TODO: エラー処理
        setErrorMessages(['APIの呼び出しに失敗しました。']);
      });
  };

  /**
   * 入力フォームの変更時の処理
   * @param name
   * @param value
   * @description
   * nameとvalueを受け取り、stateを更新する
   */
  const handleInputChange = (name: string, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgType = await axios.get<OrgType[]>('api/getOrganizationTypeData');
        const orgTypeList = orgType.data.map(({ org_type_id, org_type }) => ({
          id: org_type_id,
          name: org_type,
        }));
        setOrgTypeOptions(orgTypeList);

        const orgClass = await axios.get<OrgClass[]>('api/getOrganizationClass');
        const orgClassList = orgClass.data.map(({ org_class_id, org_class_name }) => ({
          id: org_class_id,
          name: org_class_name,
        }));
        setOrgClassOptions(orgClassList);

        const prefectures = await axios.get<Prefecture[]>('api/getPrefectures'); //都道府県マスターの取得 20240208
        const stateList = prefectures.data.map(({ pref_id, pref_name }) => ({
          id: pref_id,
          name: pref_name,
        }));
        setPrefectureOptions(stateList);

        const userInfo = await axios.get('api/user');
        setUser(userInfo.data);

        const playerInf = await axios.get('api/getIDsAssociatedWithUser');
        setUserIdType(playerInf.data.result[0]); //ユーザIDに紐づいた情報 20240222
      } catch (error: any) {
        setErrorMessages(['APIの呼び出しに失敗しました。']);
      }
    };
    fetchData();
  }, []);

  /**
   * データを10件ずつ増やす関数
   * @description
   * visibleDataに10件ずつデータを追加する
   * visibleItemsに10を加算する
   */
  const loadMoreData = () => {
    const newData = orgSearchResult.slice(0, visibleItems + 10);
    setVisibleData(newData);
    setVisibleItems((prevCount) => prevCount + 10);
  };

  const { sortState, handleSort } = useSort<Org>({
    currentData: visibleData,
    onSort: setVisibleData,
  });

  const sortFunctions = useMemo(() => createSortFunctions(handleSort), [handleSort]);

  return (
    <>
      {/* 画面名 */}
      <CustomTitle displayBack>団体検索</CustomTitle>
      <ErrorBox errorText={errorMessages} />
      <div className='flex flex-col gap-[20px] bg-thinContainerBg rounded p-[30px] border-containerBg border-solid border-[1px]'>
        <div className='flex flex-col sm:flex-row gap-[8px] items-center'>
          {/* 団体名 */}
          <CustomTextField
            label='団体名'
            displayHelp={false}
            onChange={(e) => {
              handleInputChange('org_name', e.target.value);
            }}
            value={formData.org_name}
            widthClassName='w-full sm:w-[300px]'
          />
          {/* 都道府県 */}
          <CustomDropdown
            label='都道府県'
            id='都道府県'
            options={prefectureOptions.map((item) => ({
              value: item.name,
              key: item.id,
            }))}
            widthClassName='w-full sm:w-[100px]'
            value={formData?.residencePrefectureId || ''}
            onChange={(e) => {
              handleInputChange('residencePrefectureId', e);
              handleInputChange(
                'residencePrefectureName',
                prefectureOptions.find((item) => item.id === Number(e))?.name || '',
              );
            }}
          />
        </div>
        <Divider />
        <CustomButton
          buttonType='secondary'
          onClick={toggleAccordion}
          className='flex flex-row justify-center items-center gap-[4px] w-full'
        >
          <div className='font-bold'>もっと詳しく検索</div>
          {isOpen ? <RemoveIcon /> : <AddIcon />}
        </CustomButton>
        {isOpen && (
          <div className='flex flex-col gap-2'>
            {/* 団体種別 */}
            <div className='flex flex-col sm:flex-row gap-4'>
              <CustomDropdown
                id='団体種別'
                label='団体種別'
                options={orgTypeOptions.map((orgType) => ({
                  value: orgType.name,
                  key: orgType.id,
                }))}
                widthClassName='w-full sm:w-[200px]'
                value={formData?.org_type || ''}
                onChange={(e) => {
                  handleInputChange('org_type', e);
                  handleInputChange(
                    'orgTypeName',
                    orgTypeOptions.find((orgType) => Number(orgType.id) === Number(e))?.name || '',
                  );
                }}
              />
              {/* 団体区分 */}
              <CustomDropdown
                id='団体区分'
                label='団体区分'
                options={orgClassOptions.map((orgClass) => ({
                  value: orgClass.name,
                  key: orgClass.id,
                }))}
                widthClassName='w-full sm:w-[200px]'
                value={formData?.org_class || ''}
                onChange={(e) => {
                  handleInputChange('org_class', e);
                  handleInputChange(
                    'orgClassName',
                    orgClassOptions.find((orgClass) => orgClass.id === Number(e))?.name || '',
                  );
                }}
              />
            </div>
            <div className='flex flex-col sm:flex-row gap-4'>
              {/* 団体ID */}
              <CustomTextField
                label='団体ID'
                onChange={(e) => {
                  handleInputChange('org_id', e.target.value);
                }}
                value={formData?.org_id || ''}
                toolTipText='団体IDは団体情報参照画面で確認できます。' //はてなボタン用
              />
              {(userIdType.is_administrator == ROLE.SYSTEM_ADMIN ||
                userIdType.is_jara == ROLE.JARA ||
                userIdType.is_pref_boat_officer == ROLE.PREFECTURE ||
                userIdType.is_organization_manager == ROLE.GROUP_MANAGER) && (
                <CustomTextField
                  label='エントリーシステムID'
                  onChange={(e) => {
                    handleInputChange('entrySystemId', e.target.value);
                  }}
                  value={formData?.entrySystemId || ''}
                  toolTipText='日本ローイング協会より発行された、6桁の団体コードを入力してください。' //はてなボタン用
                />
              )}
            </div>
            <div className='flex flex-col gap-[8px]'>
              <InputLabel
                label='創立年'
                displayHelp
                toolTipText='団体の創立年を西暦で入力してください。' //はてなボタン用
              />
              <div className='flex gap-[8px]'>
                {/* 創立年（開始年） */}
                <CustomYearPicker
                  selectedDate={formData.foundingYear_start}
                  onChange={(date: Date) =>
                    handleInputChange('foundingYear_start', date.getFullYear().toString())
                  }
                  className='w-full'
                />
                <div className='flex justify-center items-center'>〜</div>
                {/* 創立年（終了年） */}
                <CustomYearPicker
                  selectedDate={formData.foundingYear_end}
                  onChange={(date: Date) =>
                    handleInputChange('foundingYear_end', date.getFullYear().toString())
                  }
                  className='w-full'
                />
              </div>
            </div>
          </div>
        )}
        <Divider />
        {/* 検索ボタン */}
        <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
          <CustomButton
            buttonType='primary'
            onClick={() => {
              handleSearch();
            }}
            className='flex flex-row justify-center items-center gap-[4px]'
          >
            <SearchIcon />
            <div>検索</div>
          </CustomButton>
          {/* クリアボタン */}
          <CustomButton
            buttonType='secondary'
            onClick={() => {
              setFormData({
                entrySystemId: '',
                org_id: '',
                org_name: '',
                org_type: '',
                orgTypeName: '',
                org_class: '',
                orgClassName: '',
                foundingYear_start: '',
                foundingYear_end: '',
                residenceCountryId: '',
                residenceCountryName: '',
                residencePrefectureId: '',
                residencePrefectureName: '',
              } as SearchCond);
            }}
          >
            クリア
          </CustomButton>
        </div>
      </div>
      <div className='overflow-auto'>
        <CustomTable>
          <CustomThead>
            <CustomTr>
              <CustomTh>
                <SortableHeader
                  column='entrySystemId'
                  label='エントリーシステムID'
                  sortState={sortState}
                  onSort={sortFunctions.entrySystemId}
                />
              </CustomTh>
              <CustomTh>
                <SortableHeader
                  column='orgId'
                  label='団体ID'
                  sortState={sortState}
                  onSort={sortFunctions.orgId}
                />
              </CustomTh>
              <CustomTh>
                <SortableHeader
                  column='orgName'
                  label='団体名'
                  sortState={sortState}
                  onSort={sortFunctions.orgName}
                />
              </CustomTh>
              <CustomTh>
                <SortableHeader
                  column='foundingYear'
                  label='創立年'
                  sortState={sortState}
                  onSort={sortFunctions.foundingYear}
                />
              </CustomTh>
              <CustomTh>
                <SortableHeader
                  column='orgType'
                  label='団体種別'
                  sortState={sortState}
                  onSort={sortFunctions.orgType}
                />
              </CustomTh>
              <CustomTh>
                <SortableHeader
                  column='orgClassName'
                  label='団体区分'
                  sortState={sortState}
                  onSort={sortFunctions.orgClassName}
                />
              </CustomTh>
            </CustomTr>
          </CustomThead>
          <tbody>
            {visibleData.map((org, index) => (
              <CustomTr key={index}>
                {/* エントリーシステムの団体ID */}
                <CustomTd>{org.entrysystem_org_id}</CustomTd>
                {/* 団体ID */}
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/teamRef',
                      query: { orgId: org.org_id },
                    }}
                  >
                    {org.org_id}
                  </Link>
                </CustomTd>
                {/* 団体名 */}
                <CustomTd>
                  <Link
                    className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                    href={{
                      pathname: '/teamRef',
                      query: { orgId: org.org_id },
                    }}
                  >
                    {org.org_name}
                  </Link>
                </CustomTd>
                {/* 創立年 */}
                <CustomTd>{org.founding_year}</CustomTd>
                {/* 団体種別 */}
                <CustomTd>{org.orgTypeName}</CustomTd>
                {/* 団体区分 */}
                <CustomTd>{org.orgClassName}</CustomTd>
              </CustomTr>
            ))}
          </tbody>
        </CustomTable>
      </div>
      <div
        className='flex justify-center gap-[16px] my-[30px] text-primary-500 font-bold cursor-pointer'
        onClick={loadMoreData}
      >
        <AddIcon /> 10件表示する
      </div>
      <div className='flex justify-center gap-[16px] my-[30px]'>
        <CustomButton
          onClick={() => {
            router.back();
          }}
          buttonType='secondary'
          className='border-primary-500 text-primary-500'
        >
          戻る
        </CustomButton>
      </div>
    </>
  );
}
