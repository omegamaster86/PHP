// 団体検索画面
'use client';

import {
  CustomButton,
  CustomDropdown,
  CustomTable,
  CustomTextField,
  CustomThead,
  CustomTr,
  CustomTd,
  CustomTh,
  CustomTitle,
  CustomYearPicker,
  InputLabel,
  ErrorBox,
} from '@/app/components';
import { useEffect, useState } from 'react';
import axios from '@/app/lib/axios';
import { OrgClass, OrgType, UserResponse, Org } from '@/app/types';
import { Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROLE } from '@/app/utils/consts';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

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

export default function TeamSearch() {
  const router = useRouter();
  const [orgTypeOptions, setOrgTypeOptions] = useState<OrgType[]>([]); // 団体種別
  const [orgClassOptions, setOrgClassOptions] = useState<OrgClass[]>([]); // 団体区分
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

  /**
   * 検索ボタン押下時の処理
   * @returns
   * @description
   * 検索ボタン押下時の処理
   * 検索条件を元にAPIを叩いて検索結果を取得する
   * 検索結果をstateにセットする
   */
  const handleSearch = async () => {
    const csrf = () => axios.get('/sanctum/csrf-cookie');
    await csrf();
    axios
      // .get<Org[]>('/orgSearch')
      .post('/orgSearch', formData)
      .then((response) => {
        const data = response.data.result;
        // console.log(data);
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
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();

        //団体種別マスターの取得 20240209
        // const orgType = await axios.get<OrgType[]>('/orgType');
        const orgType = await axios.get('/getOrganizationTypeData');
        // console.log(orgType.data);
        const orgTypeList = orgType.data.map(({ org_type_id, org_type }: { org_type_id: number; org_type: string }) => ({ id: org_type_id, name: org_type }));
        setOrgTypeOptions(orgTypeList);

        //団体区分マスターの取得 20240209
        // const orgClass = await axios.get<OrgClass[]>('/orgClass');
        const orgClass = await axios.get('/getOrganizationClass');
        const orgClassList = orgClass.data.map(({ org_class_id, org_class_name }: { org_class_id: number; org_class_name: string }) => ({ id: org_class_id, name: org_class_name }));
        setOrgClassOptions(orgClassList);

        // const userInfo = await axios.get<UserResponse>('/api/user');
        const userInfo = await axios.get('/api/user');
        setUser(userInfo.data);
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

  return (
    <main className='flex min-h-screen flex-col justify-start p-[10px] m-auto gap-[20px] my-[80px]'>
      {/* 画面名 */}
      <CustomTitle displayBack>団体検索</CustomTitle>
      <ErrorBox errorText={errorMessages} />

      <div className='flex flex-col gap-[20px] bg-thinContainerBg rounded p-[30px] border-containerBg border-solid border-[1px]'>
        <div className='w-full flex flex-wrap justify-start gap-[8px]'>
          {/* 団体名 */}
          <CustomTextField
            label='団体名'
            displayHelp={false}
            onChange={(e) => {
              handleInputChange('org_name', e.target.value);
            }}
            value={formData.org_name}
          />
          {/* 所在地（国） */}
          <CustomTextField
            label='国'
            displayHelp
            onChange={(e) => {
              handleInputChange('residenceCountryName', e.target.value);
            }}
            value={formData.residenceCountryName}
            toolTipTitle='Title' //はてなボタン用
            toolTipText='サンプル用のツールチップ表示' //はてなボタン用
          />
          {/* 所在地（都道府県） */}
          <CustomTextField
            label='都道府県'
            displayHelp={false}
            onChange={(e) => {
              handleInputChange('residencePrefectureName', e.target.value);
            }}
            value={formData.residencePrefectureName}
          />
        </div>
        <div>
          <Divider />
          <div className='flex flex-col justify-start items-center py-4'>
            <CustomButton
              buttonType='secondary'
              onClick={toggleAccordion}
              className='flex flex-row justify-center gap-[4px] w-[940px]'
            >
              <div className='font-bold'>もっと詳しく検索</div>
              {isOpen ? <RemoveIcon /> : <AddIcon />}
            </CustomButton>
          </div>
          {isOpen && (
            <div className='flex flex-wrap justify-start items-center gap-[8px] w-[940px]'>
              {/* 団体種別 */}
              <div className='w-full flex flex-col justify-between gap-[8px]'>
                <InputLabel label='団体種別' />
                <CustomDropdown
                  id='団体種別'
                  options={orgTypeOptions.map((orgType) => ({
                    value: orgType.name,
                    key: orgType.id,
                  }))}
                  value={formData?.org_type || ''}
                  onChange={(e) => {
                    // console.log(e);
                    handleInputChange('org_type', e);
                    handleInputChange(
                      'orgTypeName',
                      orgTypeOptions.find((orgType) => orgType.id === Number(e))?.name || '',
                    );
                  }}
                  className='w-[300px]'
                />
              </div>
              {/* 団体区分 */}
              <div className='w-full flex flex-col justify-between gap-[8px]'>
                <InputLabel label='団体区分' />
                <CustomDropdown
                  id='団体区分'
                  options={orgClassOptions.map((orgClass) => ({
                    value: orgClass.name,
                    key: orgClass.id,
                  }))}
                  value={formData?.org_class || ''}
                  onChange={(e) => {
                    // console.log(e);
                    handleInputChange('org_class', e);
                    handleInputChange(
                      'orgClassName',
                      orgClassOptions.find((orgClass) => orgClass.id === Number(e))?.name || '',
                    );
                  }}
                  className='w-[300px]'
                />
              </div>
              {/* 団体ID */}
              <CustomTextField
                label='団体ID'
                onChange={(e) => {
                  handleInputChange('org_id', e.target.value);
                }}
                value={formData?.org_id || ''}
                toolTipTitle='Title' //はてなボタン用
                toolTipText='サンプル用のツールチップ表示' //はてなボタン用
              />
              {!(
                user.user_type === ROLE.SUPPORTER ||
                user.user_type === ROLE.PLAYER ||
                user.user_type === ROLE.VOLUNTEER
              ) && (
                  // エントリーシステムの団体ID
                  <CustomTextField
                    label='エントリーシステムID'
                    onChange={(e) => {
                      handleInputChange('entrySystemId', e.target.value);
                    }}
                    value={formData?.entrySystemId || ''}
                    toolTipTitle='Title' //はてなボタン用
                    toolTipText='サンプル用のツールチップ表示' //はてなボタン用
                  />
                )}
              <div className='w-full flex flex-col justify-start gap-[8px]'>
                <InputLabel
                  label='設立年'
                  displayHelp
                  toolTipTitle='Title' //はてなボタン用
                  toolTipText='サンプル用のツールチップ表示' //はてなボタン用
                />
                <div className='w-full flex flex-row justify-start gap-[8px]'>
                  {/* 創立年（開始年） */}
                  <CustomYearPicker
                    selectedDate={formData.foundingYear_start}
                    onChange={(date: Date) =>
                      handleInputChange('foundingYear_start', date.toString())
                    }
                  />
                  <div className='flex justify-center items-center'>〜</div>
                  {/* 創立年（終了年） */}
                  <CustomYearPicker
                    selectedDate={formData.foundingYear_end}
                    onChange={(date: Date) => handleInputChange('foundingYear_end', date.toString())}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* 検索ボタン */}
        <div className='flex flex-col justify-start mt-[20px]'>
          <div className='flex flex-row justify-center gap-[4px]'>
            <CustomButton
              buttonType='primary'
              onClick={() => {
                handleSearch();
              }}
              className='flex flex-row justify-center gap-[4px] w-[200px]'
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
              className='w-[200px]'
            >
              クリア
            </CustomButton>
          </div>
        </div>
      </div>
      <div className='overflow-auto'>
        <CustomTable>
          <CustomThead>
            <CustomTr>
              <CustomTh>エントリーシステムID</CustomTh>
              <CustomTh>団体ID</CustomTh>
              <CustomTh>団体名</CustomTh>
              <CustomTh>設立年</CustomTh>
              <CustomTh>団体種別</CustomTh>
              <CustomTh>団体区分</CustomTh>
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
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {org.org_class}
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
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {org.orgClassName}
                  </Link>
                </CustomTd>
                {/* 設立年 */}
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
        className='flex flex-row justify-center gap-[16px] my-[30px] text-primary-500 font-bold cursor-pointer'
        onClick={loadMoreData}
      >
        <AddIcon /> 10件表示する
      </div>
      <div className='flex flex-row justify-center gap-[16px] my-[30px]'>
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
    </main>
  );
}
