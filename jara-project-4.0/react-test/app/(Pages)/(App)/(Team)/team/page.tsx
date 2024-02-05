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
    orgId: '',
    orgName: '',
    entOrgId: '',
    orgTypeName: '',
    foundingYear: 0,
    addressNumber: '',
    locationPrefectureId: 0,
    locationPrefectureName: '',
    address1: '',
    address2: '',
    orgClassId: 0,
    orgClassName: '',
    jaraOrgTypeId: 0,
    jaraOrgTypeName: '',
    jaraOrgRegTrail: '',
    prefOrgTypeId: 0,
    prefOrgTypeName: '',
    prefOrgRegTrail: '',
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
        const prefectures = await axios.get<PrefectureResponse[]>(
          'http://localhost:3100/prefecture',
        );
        setPrefectureOptions(prefectures.data);
        const orgClass = await axios.get<OrgClass[]>('http://localhost:3100/orgClass');
        setOrgClassOptions(orgClass.data);
        const orgType = await axios.get<OrgType[]>('http://localhost:3100/orgType');
        setOrgTypeOptions(orgType.data);
        const user = await axios.get<UserResponse>('http://localhost:3100/user');
        setUser(user.data);

        if (mode === 'update') {
          const organization = await axios.get<Organization>('http://localhost:3100/organization');
          setFormData((prevFormData) => ({
            ...prevFormData,
            ...{
              orgId: organization.data.orgId,
              orgName: organization.data.orgName,
              entOrgId: organization.data.entOrgId,
              orgTypName: organization.data.orgTypeName,
              foundingYear: organization.data.foundingYear,
              addressNumber: organization.data.addressNumber,
              locationPrefectureId: organization.data.locationPrefectureId,
              locationPrefectureName: organization.data.locationPrefectureName,
              address1: organization.data.address1,
              address2: organization.data.address2,
              orgClassId: organization.data.orgClassId,
              orgClassName: organization.data.orgClassName,
              jaraOrgTypeId: organization.data.jaraOrgTypeId,
              jaraOrgTypeName: organization.data.jaraOrgTypeName,
              jaraOrgRegTrail: organization.data.jaraOrgRegTrail,
              prefOrgTypeId: organization.data.prefOrgTypeId,
              prefOrgTypeName: organization.data.prefOrgTypeName,
              prefOrgRegTrail: organization.data.prefOrgRegTrail,
            },
          }));
          const staff = await axios.get<Staff[]>('http://localhost:3100/staff');
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
    const addressNumbers = formData.addressNumber?.split('-');
    setAddressNumbers(addressNumbers);
  }, [formData.addressNumber]);

  /**
   * バリデーションエラーの有無を判定する関数
   * @description
   * バリデーションエラーがある場合はtrueを返す
   */
  const isValidateError = () => {
    const orgNameError = Validator.getErrorMessages([
      Validator.validateRequired(formData.orgName, '団体名'),
    ]);
    setOrgNameErrorMessages(orgNameError);

    const foundingYearError = Validator.getErrorMessages([
      Validator.validateFoundingYear(
        formData.foundingYear === 0 ? '' : formData.foundingYear.toString(),
      ),
    ]);
    setFoundingYearErrorMessages(foundingYearError);

    const addressError = Validator.getErrorMessages([
      Validator.validateRequired(formData.addressNumber, '郵便番号'),
      Validator.validateAddressNumberFormat(formData.addressNumber),
      Validator.validateRequired(formData.locationPrefectureName, '都道府県'),
      Validator.validateRequired(formData.address1, '市区町村・町字番地'),
      Validator.validateRequired(formData.address2, '建物名'),
    ]);
    setAddressErrorMessages(addressError);

    const orgClassError = Validator.getErrorMessages([
      Validator.validateRequired(formData.orgClassId, '団体区分'),
    ]);
    setOrgClassErrorMessages(orgClassError);

    const jaraTrailError = Validator.getErrorMessages([
      Validator.validateTrailError(formData.jaraOrgRegTrail, formData.jaraOrgTypeName, 'JARA'),
    ]);
    setJaraOrgTypeErrorMessages(jaraTrailError);

    const prefTrailError = Validator.getErrorMessages([
      Validator.validateTrailError(formData.prefOrgRegTrail, formData.prefOrgTypeName, '県ボ'),
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
            userId: '',
            userName: '',
            deleteFlag: false,
            staffType: [],
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
              .post('http://localhost:3100/', requestBody)
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
              .post('http://localhost:3100/', requestBody)
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
              value={formData.orgId}
              onChange={(e) => handleInputChange('orgId', e.target.value)}
            />
          ))}
        {/* エントリーシステムの団体ID */}
        <CustomTextField
          label='エントリーシステムの団体ID'
          readonly={mode === 'confirm'}
          value={formData.entOrgId}
          displayHelp={mode !== 'confirm'}
          onChange={(e) => handleInputChange('entOrgId', e.target.value)}
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
          value={formData.orgName}
          onChange={(e) => handleInputChange('orgName', e.target.value)}
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
            selectedDate={formData.foundingYear === 0 ? '' : formData.foundingYear?.toString()}
            errorMessages={foundingYearErrorMessages}
            onChange={(date: Date) => handleInputChange('foundingYear', date.toString())}
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
                    'addressNumber',
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
                    'addressNumber',
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
                    Validator.validateRequired(formData.addressNumber, '郵便番号'),
                    Validator.validateAddressNumberFormat(formData.addressNumber),
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
                      locationPrefectureId: 1,
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
                value={'〒' + formData.addressNumber}
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
                ? formData.locationPrefectureId.toString()
                : formData.locationPrefectureName) || ''
            }
            readonly={mode === 'confirm'}
            onChange={(e) => {
              handleInputChange('locationPrefectureId', e);
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
              (mode !== 'confirm' ? formData.orgClassId.toString() : formData.orgClassName) || ''
            }
            onChange={(e) => {
              handleInputChange('orgClassId', e);
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
                mode !== 'confirm' ? formData.jaraOrgTypeId?.toString() : formData.jaraOrgTypeName
              }
              onChange={(e) => {
                handleInputChange('jaraOrgTypeId', e);
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
          {(user.userType === ROLE.SYSTEM_ADMIN ||
            user.userType === ROLE.JARA ||
            (user.userType === ROLE.PREFECTURE && mode !== 'create')) && (
              <CustomTextField
                label='証跡'
                displayHelp={false}
                className='w-[300px]'
                value={formData.jaraOrgRegTrail}
                readonly={mode === 'confirm' || user.userType === ROLE.PREFECTURE}
                onChange={(e) => handleInputChange('jaraOrgRegTrail', e.target.value)}
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
                mode !== 'confirm' ? formData.prefOrgTypeId?.toString() : formData.prefOrgTypeName
              }
              onChange={(e) => {
                handleInputChange('prefOrgTypeId', e);
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
          {(user.userType === ROLE.SYSTEM_ADMIN ||
            (user.userType === ROLE.JARA && mode !== 'create') ||
            user.userType === ROLE.PREFECTURE) && (
              <CustomTextField
                label='証跡'
                className='w-[300px]'
                displayHelp={false}
                readonly={mode === 'confirm' || user.userType === ROLE.JARA}
                value={formData.prefOrgRegTrail}
                onChange={(e) => handleInputChange('prefOrgRegTrail', e.target.value)}
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
                              prevData.map((data) => ({ ...data, deleteFlag: true })),
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
                              prevData.map((data) => ({ ...data, deleteFlag: false })),
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
                      id='deleteFlag'
                      value='delete'
                      checked={data.isUserFound ? data.deleteFlag : true}
                      readonly={mode === 'confirm' || !data.isUserFound}
                      onChange={() => {
                        handleInputChangeStaff(data.id, 'deleteFlag', !data.deleteFlag);
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
                    value={data.userId}
                    className='border-transparent'
                    readonly={mode === 'confirm'}
                    disabled={!data.isUserFound}
                    onChange={(e) => handleInputChangeStaff(data.id, 'userId', e.target.value)}
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
                    onChange={(e) => handleInputChangeStaff(data.id, 'userName', e.target.value)}
                  />
                </CustomTd>
                {/** 管理者(監督) */}
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='director'
                    value='監督'
                    checked={data.staffType.includes('監督')}
                    readonly={mode === 'confirm' || !data.isUserFound}
                    onChange={() => {
                      handleInputChangeStaff(
                        data.id,
                        'staffType',
                        data.staffType.includes('監督')
                          ? data.staffType.filter((item) => item !== '監督')
                          : [...data.staffType, '監督'],
                      );
                    }}
                  />
                </CustomTd>
                {/** 部長 */}
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='generalmanager'
                    value='部長'
                    checked={data.staffType.includes('部長')}
                    readonly={mode === 'confirm' || !data.isUserFound}
                    onChange={() => {
                      handleInputChangeStaff(
                        data.id,
                        'staffType',
                        data.staffType.includes('部長')
                          ? data.staffType.filter((item) => item !== '部長')
                          : [...data.staffType, '部長'],
                      );
                    }}
                  />
                </CustomTd>
                {/** コーチ */}
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='coach'
                    value='コーチ'
                    checked={data.staffType.includes('コーチ')}
                    readonly={mode === 'confirm' || !data.isUserFound}
                    onChange={() => {
                      handleInputChangeStaff(
                        data.id,
                        'staffType',
                        data.staffType.includes('コーチ')
                          ? data.staffType.filter((item) => item !== 'コーチ')
                          : [...data.staffType, 'コーチ'],
                      );
                    }}
                  />
                </CustomTd>
                {/** マネージャー */}
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='manager'
                    value='マネージャー'
                    checked={data.staffType.includes('マネージャー')}
                    readonly={mode === 'confirm' || !data.isUserFound}
                    onChange={() => {
                      handleInputChangeStaff(
                        data.id,
                        'staffType',
                        data.staffType.includes('マネージャー')
                          ? data.staffType.filter((item) => item !== 'マネージャー')
                          : [...data.staffType, 'マネージャー'],
                      );
                    }}
                  />
                </CustomTd>
                {/** 管理代理 */}
                <CustomTd align='center'>
                  <OriginalCheckbox
                    id='actingdirector'
                    value='管理代理'
                    checked={data.staffType.includes('管理代理')}
                    readonly={mode === 'confirm' || !data.isUserFound}
                    onChange={() => {
                      handleInputChangeStaff(
                        data.id,
                        'staffType',
                        data.staffType.includes('管理代理')
                          ? data.staffType.filter((item) => item !== '管理代理')
                          : [...data.staffType, '管理代理'],
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
