// 団体登録・更新 / 入力確認画面
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Divider from '@mui/material/Divider';
import {
  OrgClass,
  OrgType,
  Organization,
  PrefectureResponse,
  Staff,
  UserResponse,
} from '@/app/types';
import Validator from '@/app/utils/validator';
import { ROLE } from '@/app/utils/consts';
import {
  CustomTextField,
  CustomYearPicker,
  CustomDropdown,
  CustomButton,
  InputLabel,
  ErrorBox,
  CustomTitle,
  CustomTable,
  CustomThead,
  CustomTr,
  CustomTh,
  CustomTbody,
  CustomTd,
  OriginalCheckbox,
} from '@/app/components';

export default function OrgInfo() {
  const [formData, setFormData] = useState<Organization>({
    org_id: '',
    org_name: '',
    entrysystem_org_id: '',
    orgTypeName: '',
    founding_year: 0,
    post_code: '',
    location_prefecture: 0,
    locationPrefectureName: '',
    address1: '',
    address2: '',
    org_class: 0,
    orgClassName: '',
    jara_org_type: 0,
    jaraOrgTypeName: '',
    jara_org_reg_trail: '',
    pref_org_type: 0,
    prefOrgTypeName: '',
    pref_org_reg_trail: '',
  } as Organization);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prefectureOptions, setPrefectureOptions] = useState([] as PrefectureResponse[]);
  const [orgClassOptions, setOrgClassOptions] = useState([] as OrgClass[]);
  const [orgTypeOptions, setOrgTypeOptions] = useState([] as OrgType[]);
  const mode = searchParams.get('mode');
  const prevMode = searchParams.get('prevMode');
  let paramError = false;
  const [disableFlag, setDisableFlag] = useState<boolean>(false);
  const [addressNumbers, setAddressNumbers] = useState([] as string[]);
  // ボタンの活性・非活性を保持するステート
  const [displayFlg, setDisplayFlg] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [orgNameErrorMessages, setOrgNameErrorMessages] = useState([] as string[]);
  const [foundingYearErrorMessages, setFoundingYearErrorMessages] = useState([] as string[]);
  const [addressErrorMessages, setAddressErrorMessages] = useState([] as string[]);
  const [orgClassErrorMessages, setOrgClassErrorMessages] = useState([] as string[]);
  const [tableErrorMessages, setTableErrorMessages] = useState([] as string[]);
  const [user, setUser] = useState({} as UserResponse);
  const [jaraOrgTypeErrorMessages, setJaraOrgTypeErrorMessages] = useState([] as string[]);
  const [prefOrgTypeErrorMessages, setPrefOrgTypeErrorMessages] = useState([] as string[]);

  // フォームデータを管理する状態
  const [tableData, setTableData] = useState<Staff[]>([]);

  // モードのチェック
  switch (mode) {
    case 'create':
      break;
    case 'update':
      break;
    case 'confirm':
      break;
    default:
      paramError = true;
      break;
  }

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

  // テーブルデータの入力値を管理する関数
  /**
   * スタッフテーブルの変更時の処理
   * @param rowId
   * @param name
   * @param value
   * @description
   * rowIdとnameとvalueを受け取り、stateを更新する
   */
  const handleInputChangeStaff = (rowId: number, name: string, value: any | boolean) => {
    setTableData((prevRows) =>
      prevRows.map((row) => (row.id === rowId ? { ...row, [name]: value } : row)),
    );
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: APIを叩いて、マスタ情報を取得する処理の置き換え
        // const prefectures = await axios.get<PrefectureResponse[]>('http://localhost:3100/prefecture',);
        const prefectures = await axios.get('http://localhost:8000/api/getPrefecures');
        setPrefectureOptions(prefectures.data);
        // const orgClass = await axios.get<OrgClass[]>('http://localhost:3100/orgClass');
        const orgClass = await axios.get('http://localhost:8000/api/getOrgClassData');
        setOrgClassOptions(orgClass.data);
        // const orgType = await axios.get<OrgType[]>('http://localhost:3100/orgType');
        const orgType = await axios.get('http://localhost:8000/api/getOrgTypeData');
        setOrgTypeOptions(orgType.data);
        // const user = await axios.get<UserResponse>('http://localhost:3100/user');
        const user = await axios.get('http://localhost:8000/api/getUserData');
        setUser(user.data);

        if (mode === 'update') {
          // const organization = await axios.get<Organization>('http://localhost:3100/organization');
          const organization = await axios.get('http://localhost:8000/api/getOrgData');
          setFormData((prevFormData) => ({
            ...prevFormData,
            ...{
              org_id: organization.data.org_id,
              org_name: organization.data.org_name,
              entrysystem_org_id: organization.data.entrysystem_org_id,
              orgTypName: organization.data.orgTypeName,
              founding_year: organization.data.founding_year,
              post_code: organization.data.post_code,
              location_prefecture: organization.data.location_prefecture,
              locationPrefectureName: organization.data.locationPrefectureName,
              address1: organization.data.address1,
              address2: organization.data.address2,
              org_class: organization.data.org_class,
              orgClassName: organization.data.orgClassName,
              jara_org_type: organization.data.jara_org_type,
              jaraOrgTypeName: organization.data.jaraOrgTypeName,
              jara_org_reg_trail: organization.data.jara_org_reg_trail,
              pref_org_type: organization.data.pref_org_type,
              prefOrgTypeName: organization.data.prefOrgTypeName,
              pref_org_reg_trail: organization.data.pref_org_reg_trail,
            },
          }));
          // const staff = await axios.get<Staff[]>('http://localhost:3100/staff');
          const staff = await axios.get('http://localhost:8000/api/getStaff');
          setTableData(staff.data);
        }
      } catch (error: any) {
        setErrorMessage(['API取得エラー:' + error.message]);
      }
    };
    fetchData();
  }, []);

  /**
   * 郵便番号の変更時の処理
   * @description
   * 郵便番号を-で分割して、stateを更新する
   */
  useEffect(() => {
    const addressNumbers = formData.post_code?.split('-');
    setAddressNumbers(addressNumbers);
  }, [formData.post_code]);

  /**
   * バリデーションエラーの有無を判定する関数
   * @description
   * バリデーションエラーがある場合はtrueを返す
   */
  const isValidateError = () => {
    const orgNameError = Validator.getErrorMessages([
      Validator.validateRequired(formData.org_name, '団体名'),
    ]);
    setOrgNameErrorMessages(orgNameError);

    const foundingYearError = Validator.getErrorMessages([
      Validator.validateFoundingYear(
        formData.founding_year === 0 ? '' : formData.founding_year.toString(),
      ),
    ]);
    setFoundingYearErrorMessages(foundingYearError);

    const addressError = Validator.getErrorMessages([
      Validator.validateRequired(formData.post_code, '郵便番号'),
      Validator.validateAddressNumberFormat(formData.post_code),
      Validator.validateRequired(formData.locationPrefectureName, '都道府県'),
      Validator.validateRequired(formData.address1, '市区町村・町字番地'),
      Validator.validateRequired(formData.address2, '建物名'),
    ]);
    setAddressErrorMessages(addressError);

    const orgClassError = Validator.getErrorMessages([
      Validator.validateRequired(formData.org_class, '団体区分'),
    ]);
    setOrgClassErrorMessages(orgClassError);

    const jaraTrailError = Validator.getErrorMessages([
      Validator.validateTrailError(formData.jara_org_reg_trail, formData.jaraOrgTypeName, 'JARA'),
    ]);
    setJaraOrgTypeErrorMessages(jaraTrailError);

    const prefTrailError = Validator.getErrorMessages([
      Validator.validateTrailError(formData.pref_org_reg_trail, formData.prefOrgTypeName, '県ボ'),
    ]);
    setPrefOrgTypeErrorMessages(prefTrailError);

    if (
      orgNameError.length > 0 ||
      foundingYearError.length > 0 ||
      addressError.length > 0 ||
      orgClassError.length > 0 ||
      jaraTrailError.length > 0 ||
      prefTrailError.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  };

  // スタッフ追加
  const addCustomButton = displayFlg && (
    <CustomButton
      className='w-[120px] text-small'
      buttonType='primary'
      disabled={disableFlag}
      onClick={() => {
        setTableData((prevData) => [
          ...prevData,
          {
            id: prevData.length + 1,
            user_id: '',
            userName: '',
            delete_flag: false,
            staff_type_id: [],
            isUserFound: true, //新規登録時は便宜的にtrue
          },
        ]);
      }}
    >
      スタッフ追加
    </CustomButton>
  );

  // 確認
  const modeCustomButtons = {
    create: (
      <CustomButton
        buttonType='primary'
        className='w-[200px]'
        onClick={() => {
          if (isValidateError()) {
            setDisableFlag(true);
            return;
          } else {
            setDisableFlag(false);
          }

          router.push('/team?mode=confirm&prevMode=create');
        }}
      >
        確認
      </CustomButton>
    ),
    update: (
      <CustomButton
        buttonType='primary'
        className='w-[200px]'
        onClick={() => {
          if (isValidateError()) {
            setDisableFlag(true);
            return;
          } else {
            setDisableFlag(false);
          }
          router.push('/team?mode=confirm&prevMode=update');
        }}
      >
        確認
      </CustomButton>
    ),
    confirm: (
      <CustomButton
        buttonType='primary'
        className='w-[200px]'
        onClick={() => {
          // TODO: APIを叩いて、登録・更新処理を行う
          const requestBody = {};
          alert('TODO: APIを叩いて、登録・更新処理を行う');
          if (prevMode === 'create') {
            axios
              // .post('http://localhost:3100/', requestBody)
              .post('http://localhost:8000/api/storeOrgData', formData) //20240206
              .then((response) => {
                // TODO: 登録処理成功時の処理
                window.confirm('団体情報を登録しました。');
              })
              .catch((error) => {
                // TODO: 登録処理失敗時の処理
                setErrorMessage([
                  ...(errorMessage as string[]),
                  '登録に失敗しました。原因：' + (error as Error).message,
                ]);
              });
          } else {
            axios
              // .post('http://localhost:3100/', requestBody)
              .post('http://localhost:8000/api/updateOrgData', formData) //20240206
              .then((response) => {
                // TODO: 更新処理成功時の処理
                window.confirm('団体情報を更新しました。');
              })
              .catch((error) => {
                // TODO: 更新処理失敗時の処理
                setErrorMessage([
                  ...(errorMessage as string[]),
                  '更新に失敗しました。原因：' + (error as Error).message,
                ]);
              });
          }
        }}
      >
        {prevMode === 'create' && '登録'}
        {prevMode === 'update' && '更新'}
      </CustomButton>
    ),
  };

  // モードが不正の時にエラー画面を表示する
  if (paramError) {
    return <div>ページが見つかりません</div>;
  }
  return (
    <main className='flex min-h-screen flex-col justify-start p-[10px] m-auto gap-[20px] my-[80px]'>
      <div className='flex flex-col justify-start gap-[20px]'>
        <ErrorBox errorText={errorMessage} />
        <div className='flex flex-row justify-start gap-[20px]'>
          {/* 画面名 */}
          <CustomTitle isCenter={false} displayBack>
            {mode === 'create' && '団体情報登録'}
            {mode === 'update' && '団体情報更新'}
            {mode === 'confirm' && '団体情報入力確認'}
          </CustomTitle>
        </div>
        {/* フォーム */}
        {mode === 'update' ||
          (prevMode === 'update' && (
            // 団体ID
            <CustomTextField
              label='団体ID'
              displayHelp={false}
              readonly
              required={false}
              value={formData.org_id}
              onChange={(e) => handleInputChange('org_id', e.target.value)}
            />
          ))}
        {/* エントリーシステムの団体ID */}
        <CustomTextField
          label='エントリーシステムの団体ID'
          readonly={mode === 'confirm'}
          value={formData.entrysystem_org_id}
          displayHelp={mode !== 'confirm'}
          onChange={(e) => handleInputChange('entrysystem_org_id', e.target.value)}
          toolTipTitle='Title エントリーシステムの団体ID' //はてなボタン用
          toolTipText='サンプル用のツールチップ表示' //はてなボタン用
        />
        {/* 団体名 */}
        <CustomTextField
          label='団体名'
          readonly={mode === 'confirm'}
          required={mode !== 'confirm'}
          errorMessages={orgNameErrorMessages}
          isError={orgNameErrorMessages.length > 0}
          displayHelp={mode !== 'confirm'}
          value={formData.org_name}
          onChange={(e) => handleInputChange('org_name', e.target.value)}
          toolTipTitle='Title 団体名' //はてなボタン用
          toolTipText='サンプル用のツールチップ表示' //はてなボタン用
        />
        {/* 創立年 */}
        <div className='w-full flex flex-col justify-between gap-[8px]'>
          <InputLabel
            label='創立年'
            displayHelp={mode !== 'confirm'}
            toolTipTitle='Title 創立年' //はてなボタン用
            toolTipText='サンプル用のツールチップ表示' //はてなボタン用
          />
          <CustomYearPicker
            selectedDate={formData.founding_year === 0 ? '' : formData.founding_year?.toString()}
            errorMessages={foundingYearErrorMessages}
            onChange={(date: Date) => handleInputChange('founding_year', date.toString())}
            readonly={mode === 'confirm'}
            isError={foundingYearErrorMessages.length > 0}
            className='w-[300px]'
          />
        </div>
        <div className='w-full flex flex-col justify-between gap-[8px]'>
          {/* 所在地 */}
          <InputLabel
            label='所在地'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            toolTipTitle='Title 所在地' //はてなボタン用
            toolTipText='サンプル用のツールチップ表示' //はてなボタン用
          />
          {mode !== 'confirm' && (
            <div className='w-full flex flex-row justify-start gap-[8px]'>
              <div className='h-[40px] self-end'>〒</div>
              {/* 郵便番号1 */}
              <CustomTextField
                required={mode !== 'confirm'}
                displayHelp={mode !== 'confirm'}
                value={addressNumbers?.[0]}
                onChange={(e) =>
                  handleInputChange(
                    'post_code',
                    e.target.value + '-' + (addressNumbers?.[1] || ''),
                  )
                }
                isError={addressErrorMessages.length > 0}
                className='w-[120px]'
              />
              <div className='h-[40px] self-end'>-</div>
              {/* 郵便番号2 */}
              <CustomTextField
                required={mode !== 'confirm'}
                value={addressNumbers?.[1]}
                onChange={(e) =>
                  handleInputChange(
                    'post_code',
                    (addressNumbers?.[0] || '') + '-' + e.target.value,
                  )
                }
                isError={addressErrorMessages.length > 0}
                className='w-[120px] self-end'
              />
              {/* 検索 */}
              <CustomButton
                buttonType='primary'
                className='w-[80px] self-end'
                disabled={disableFlag}
                onClick={() => {
                  const addressError = Validator.getErrorMessages([
                    Validator.validateRequired(formData.post_code, '郵便番号'),
                    Validator.validateAddressNumberFormat(formData.post_code),
                  ]);
                  if (addressError.length > 0) {
                    setAddressErrorMessages(addressError);
                    return;
                  } else {
                    setAddressErrorMessages([]);
                  }
                  // TODO: 検索ボタンが押された時の処理
                  alert('TODO: 検索ボタンが押された時の処理');
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    ...{
                      location_prefecture: 1,
                      locationPrefectureName: '北海道',
                      address1: '札幌市',
                      address2: '中央区',
                    },
                  }));
                }}
              >
                検索
              </CustomButton>
            </div>
          )}
          {mode === 'confirm' && (
            <div className='w-full flex flex-row justify-start gap-[8px]'>
              <CustomTextField
                displayHelp={false}
                required={false}
                readonly
                value={'〒' + formData.post_code}
                className='w-[120px]'
              />
            </div>
          )}
        </div>
        <div className='w-full flex flex-col justify-between gap-[8px]'>
          {/* 都道府県 */}
          <InputLabel
            label='都道府県'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            toolTipTitle='Title 都道府県' //はてなボタン用
            toolTipText='サンプル用のツールチップ表示' //はてなボタン用
          />
          <CustomDropdown
            id='prefecture'
            options={prefectureOptions.map((item) => ({
              value: item.name,
              key: item.id,
            }))}
            isError={addressErrorMessages.length > 0}
            value={
              (mode !== 'confirm'
                ? formData.location_prefecture.toString()
                : formData.locationPrefectureName) || ''
            }
            readonly={mode === 'confirm'}
            onChange={(e) => {
              handleInputChange('location_prefecture', e);
              handleInputChange(
                'locationPrefectureName',
                prefectureOptions.find((prefecture) => prefecture.id === Number(e))?.name || '',
              );
            }}
            className='w-[300px]'
          />
        </div>
        {/* 市区町村・町字番地 */}
        <CustomTextField
          label='市区町村・町字番地'
          required={mode !== 'confirm'}
          displayHelp={mode !== 'confirm'}
          value={formData.address1}
          readonly={mode === 'confirm'}
          isError={addressErrorMessages.length > 0}
          onChange={(e) => handleInputChange('address1', e.target.value)}
          toolTipTitle='Title 市区町村・町字番地' //はてなボタン用
          toolTipText='サンプル用のツールチップ表示' //はてなボタン用
        />
        {/* マンション・アパート */}
        <CustomTextField
          label='マンション・アパート'
          required={mode !== 'confirm'}
          displayHelp={mode !== 'confirm'}
          value={formData.address2}
          readonly={mode === 'confirm'}
          onChange={(e) => handleInputChange('address2', e.target.value)}
          isError={addressErrorMessages.length > 0}
          errorMessages={addressErrorMessages}
          toolTipTitle='Title マンション・アパート' //はてなボタン用
          toolTipText='サンプル用のツールチップ表示' //はてなボタン用
        />
        <div className='w-full flex flex-col justify-between gap-[8px]'>
          {/* 団体区分 */}
          <InputLabel
            label='団体区分'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            toolTipTitle='Title 団体区分' //はてなボタン用
            toolTipText='サンプル用のツールチップ表示' //はてなボタン用
          />
          <CustomDropdown
            id='団体区分'
            options={orgClassOptions.map((orgClass) => ({
              value: orgClass.name,
              key: orgClass.id,
            }))}
            errorMessages={orgClassErrorMessages}
            readonly={mode === 'confirm'}
            isError={orgClassErrorMessages.length > 0}
            value={
              (mode !== 'confirm' ? formData.org_class.toString() : formData.orgClassName) || ''
            }
            onChange={(e) => {
              handleInputChange('org_class', e);
              handleInputChange(
                'orgClassName',
                orgClassOptions.find((orgClass) => orgClass.id === Number(e))?.name || '',
              );
            }}
            className='w-[300px]'
          />
        </div>
        {/* JARA団体種別 */}
        <InputLabel
          label='団体種別'
          displayHelp={mode !== 'confirm'}
          toolTipTitle='Title 団体種別' //はてなボタン用
          toolTipText='サンプル用のツールチップ表示' //はてなボタン用
        />
        <div className='w-full flex flex-row justify-start gap-[8px]'>
          <div className='w-full flex flex-col justify-between gap-[8px]'>
            <InputLabel label='JARA' />
            <CustomDropdown
              id='JARA'
              value={
                mode !== 'confirm' ? formData.jara_org_type?.toString() : formData.jaraOrgTypeName
              }
              onChange={(e) => {
                handleInputChange('jara_org_type', e);
                handleInputChange(
                  'jaraOrgTypeName',
                  orgTypeOptions.find((orgType) => orgType.id === Number(e))?.name || '',
                );
              }}
              readonly={mode === 'confirm'}
              options={orgTypeOptions.map((orgType) => ({
                value: orgType.name,
                key: orgType.id,
              }))}
              className='w-[300px]'
              errorMessages={jaraOrgTypeErrorMessages}
              isError={jaraOrgTypeErrorMessages.length > 0}
            />
          </div>
          {/* JARA証跡 */}
          {(user.user_type === ROLE.SYSTEM_ADMIN ||
            user.user_type === ROLE.JARA ||
            (user.user_type === ROLE.PREFECTURE && mode !== 'create')) && (
              <CustomTextField
                label='証跡'
                displayHelp={false}
                className='w-[300px]'
                value={formData.jara_org_reg_trail}
                readonly={mode === 'confirm' || user.user_type === ROLE.PREFECTURE}
                onChange={(e) => handleInputChange('jara_org_reg_trail', e.target.value)}
              />
            )}
        </div>
        <div className='w-full flex flex-row justify-start gap-[8px]'>
          <div className='w-full flex flex-col justify-between gap-[8px]'>
            <InputLabel label='県ボ' />
            {/* 県ボ団体種別 */}
            <CustomDropdown
              id='県ボ'
              value={
                mode !== 'confirm' ? formData.pref_org_type?.toString() : formData.prefOrgTypeName
              }
              onChange={(e) => {
                handleInputChange('pref_org_type', e);
                handleInputChange(
                  'prefOrgTypeName',
                  orgTypeOptions.find((orgType) => orgType.id === Number(e))?.name || '',
                );
              }}
              options={orgTypeOptions.map((orgType) => ({
                value: orgType.name,
                key: orgType.id,
              }))}
              readonly={mode === 'confirm'}
              className='w-[300px]'
              errorMessages={prefOrgTypeErrorMessages}
              isError={prefOrgTypeErrorMessages.length > 0}
            />
          </div>
          {/* 県ボ証跡 */}
          {(user.user_type === ROLE.SYSTEM_ADMIN ||
            (user.user_type === ROLE.JARA && mode !== 'create') ||
            user.user_type === ROLE.PREFECTURE) && (
              <CustomTextField
                label='証跡'
                className='w-[300px]'
                displayHelp={false}
                readonly={mode === 'confirm' || user.user_type === ROLE.JARA}
                value={formData.pref_org_reg_trail}
                onChange={(e) => handleInputChange('pref_org_reg_trail', e.target.value)}
              />
            )}
        </div>
      </div>
      <div className='overflow-auto'>
        <CustomTable>
          {/* 所属スタッフ一覧ヘッダー表示 */}
          <CustomThead>
            <CustomTr>
              {mode !== 'confirm' ? (
                <>
                  {/* 全選択ボタン */}
                  <CustomTh>
                    {displayFlg && (
                      <CustomButton
                        className='w-[100px] text-small'
                        buttonType='primary'
                        onClick={() => {
                          tableData.length > 0 &&
                            setTableData((prevData) =>
                              prevData.map((data) => ({ ...data, delete_flag: true })),
                            );
                        }}
                        disabled={disableFlag}
                      >
                        全選択
                      </CustomButton>
                    )}
                  </CustomTh>
                  {/* 全選択解除ボタン */}
                  <CustomTh>
                    {displayFlg && (
                      <CustomButton
                        className='w-[110px] text-small'
                        buttonType='primary'
                        onClick={() => {
                          tableData.length > 0 &&
                            setTableData((prevData) =>
                              prevData.map((data) => ({ ...data, delete_flag: false })),
                            );
                        }}
                        disabled={disableFlag}
                      >
                        全選択解除
                      </CustomButton>
                    )}
                  </CustomTh>
                  <CustomTh align='center' colSpan={5}>
                    スタッフ登録
                  </CustomTh>
                  <CustomTh align='center'>{addCustomButton}</CustomTh>
                </>
              ) : mode === 'confirm' ? (
                <CustomTh align='center' colSpan={9}>
                  スタッフ登録
                </CustomTh>
              ) : (
                <></>
              )}
            </CustomTr>
            <CustomTr>
              {mode !== 'confirm' ? <CustomTh align='center'>削除</CustomTh> : <></>}
              <CustomTh align='center'>ユーザーID</CustomTh>
              <CustomTh align='center'>ユーザー名</CustomTh>
              <CustomTh align='center'>管理者(監督)</CustomTh>
              <CustomTh align='center'>部長</CustomTh>
              <CustomTh align='center'>コーチ</CustomTh>
              <CustomTh align='center'>マネージャー</CustomTh>
              <CustomTh align='center'>管理代理</CustomTh>
            </CustomTr>
          </CustomThead>
          {/* 所属スタッフ一覧明細表示 */}
          <CustomTbody>
            {tableData.map((data, index) => (
              <CustomTr key={index}>
                {/** 削除 */}
                {mode !== 'confirm' ? (
                  <CustomTd align='center'>
                    <OriginalCheckbox
                      id='delete_flag'
                      value='delete'
                      checked={data.isUserFound ? data.delete_flag : true}
                      readonly={mode === 'confirm' || !data.isUserFound}
                      onChange={() => {
                        handleInputChangeStaff(data.id, 'delete_flag', !data.delete_flag);
                      }}
                    />
                  </CustomTd>
                ) : (
                  <></>
                )}
                {/** ユーザーID */}
                <CustomTd align='center'>
                  <CustomTextField
                    displayHelp={false}
                    required={false}
                    value={data.user_id}
                    className='border-transparent'
                    readonly={mode === 'confirm'}
                    disabled={!data.isUserFound}
                    onChange={(e) => handleInputChangeStaff(data.id, 'user_id', e.target.value)}
                  />
                </CustomTd>
                {/** ユーザー名 */}
                <CustomTd align='center'>
                  <CustomTextField
                    displayHelp={false}
                    required={false}
                    value={data.isUserFound ? data.userName : '該当ユーザーなし'}
                    disabled={!data.isUserFound}
                    readonly={mode === 'confirm' || !data.isUserFound}
                    className={data.isUserFound ? '' : 'text-systemErrorText'}
                    onChange={(e) => handleInputChangeStaff(data.id, 'user_name', e.target.value)}
                  />
                </CustomTd>
                {/** 管理者(監督) */}
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='director'
                    value='監督'
                    checked={data.staff_type_id.includes('監督')}
                    readonly={mode === 'confirm' || !data.isUserFound}
                    onChange={() => {
                      handleInputChangeStaff(
                        data.id,
                        'staff_type_id',
                        data.staff_type_id.includes('監督')
                          ? data.staff_type_id.filter((item) => item !== '監督')
                          : [...data.staff_type_id, '監督'],
                      );
                    }}
                  />
                </CustomTd>
                {/** 部長 */}
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='generalmanager'
                    value='部長'
                    checked={data.staff_type_id.includes('部長')}
                    readonly={mode === 'confirm' || !data.isUserFound}
                    onChange={() => {
                      handleInputChangeStaff(
                        data.id,
                        'staff_type_id',
                        data.staff_type_id.includes('部長')
                          ? data.staff_type_id.filter((item) => item !== '部長')
                          : [...data.staff_type_id, '部長'],
                      );
                    }}
                  />
                </CustomTd>
                {/** コーチ */}
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='coach'
                    value='コーチ'
                    checked={data.staff_type_id.includes('コーチ')}
                    readonly={mode === 'confirm' || !data.isUserFound}
                    onChange={() => {
                      handleInputChangeStaff(
                        data.id,
                        'staff_type_id',
                        data.staff_type_id.includes('コーチ')
                          ? data.staff_type_id.filter((item) => item !== 'コーチ')
                          : [...data.staff_type_id, 'コーチ'],
                      );
                    }}
                  />
                </CustomTd>
                {/** マネージャー */}
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='manager'
                    value='マネージャー'
                    checked={data.staff_type_id.includes('マネージャー')}
                    readonly={mode === 'confirm' || !data.isUserFound}
                    onChange={() => {
                      handleInputChangeStaff(
                        data.id,
                        'staff_type_id',
                        data.staff_type_id.includes('マネージャー')
                          ? data.staff_type_id.filter((item) => item !== 'マネージャー')
                          : [...data.staff_type_id, 'マネージャー'],
                      );
                    }}
                  />
                </CustomTd>
                {/** 管理代理 */}
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='actingdirector'
                    value='管理代理'
                    checked={data.staff_type_id.includes('管理代理')}
                    readonly={mode === 'confirm' || !data.isUserFound}
                    onChange={() => {
                      handleInputChangeStaff(
                        data.id,
                        'staff_type_id',
                        data.staff_type_id.includes('管理代理')
                          ? data.staff_type_id.filter((item) => item !== '管理代理')
                          : [...data.staff_type_id, '管理代理'],
                      );
                    }}
                  />
                </CustomTd>
              </CustomTr>
            ))}
          </CustomTbody>
        </CustomTable>
      </div>
      <Divider className='w-[900px] h-[1px] bg-border' />
      <div className='flex flex-row justify-center gap-[16px]'>
        {/* 戻る */}
        <CustomButton
          buttonType='white-outlined'
          className='w-[200px]'
          onClick={() => {
            router.back();
          }}
        >
          戻る
        </CustomButton>
        {/* 更新/確認ボタン */}
        {modeCustomButtons[mode as keyof typeof modeCustomButtons]}
      </div>
    </main>
  );
}
