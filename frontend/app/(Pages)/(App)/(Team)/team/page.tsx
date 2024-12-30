// 団体登録・更新 / 入力確認画面
'use client';

import {
  CustomButton,
  CustomDropdown,
  CustomTable,
  CustomTbody,
  CustomTd,
  CustomTextField,
  CustomTh,
  CustomThead,
  CustomTitle,
  CustomTr,
  CustomYearPicker,
  ErrorBox,
  InputLabel,
  OriginalCheckbox,
} from '@/app/components';
import axios from '@/app/lib/axios';
import { OrgClass, OrgType, Organization, Staff, UserIdType } from '@/app/types';
import { ROLE } from '@/app/utils/consts';
import Validator from '@/app/utils/validator';
import Divider from '@mui/material/Divider';
import _axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrgInfo() {
  const [formData, setFormData] = useState<Organization>({
    org_id: '',
    org_name: '',
    entrysystem_org_id: '',
    orgTypeName: '',
    founding_year: 0,
    post_code: '',
    post_code1: '',
    post_code2: '',
    location_prefecture: 0,
    locationPrefectureName: '',
    address1: '',
    address2: '',
    org_class: 0,
    orgClassName: '',
    jara_org_type: 0,
    jaraOrgTypeName: '任意',
    jara_org_reg_trail: '',
    pref_org_type: 0,
    prefOrgTypeName: '任意',
    pref_org_reg_trail: '',
  } as Organization);

  // Jsonの型定義
  interface PrefResponse {
    id: number;
    prefCodeJis: string;
    name: string;
  }

  const router = useRouter();
  const searchParams = useSearchParams();
  const [prefectureOptions, setPrefectureOptions] = useState([] as PrefResponse[]);
  const [orgClassOptions, setOrgClassOptions] = useState([] as OrgClass[]);
  const [orgTypeOptions, setOrgTypeOptions] = useState([] as OrgType[]);
  const mode = searchParams.get('mode');
  const prevMode = searchParams.get('prevMode');
  let paramError = false;
  const [disableFlag, setDisableFlag] = useState<boolean>(false);
  const [addressNumbers, setAddressNumbers] = useState([] as string[]);
  // ボタンの活性・非活性を保持するステート
  const [displayFlg, setDisplayFlg] = useState<boolean>(true);
  const [addStaffDisplayFlg, setAddStaffDisplayFlg] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [orgNameErrorMessages, setOrgNameErrorMessages] = useState([] as string[]);
  const [foundingYearErrorMessages, setFoundingYearErrorMessages] = useState([] as string[]);
  const [addressErrorMessages, setAddressErrorMessages] = useState([] as string[]);
  const [orgClassErrorMessages, setOrgClassErrorMessages] = useState([] as string[]);
  const [tableErrorMessages, setTableErrorMessages] = useState([] as string[]);
  const [jaraOrgTypeErrorMessages, setJaraOrgTypeErrorMessages] = useState([] as string[]);
  const [prefOrgTypeErrorMessages, setPrefOrgTypeErrorMessages] = useState([] as string[]);
  const [userIdType, setUserIdType] = useState({} as UserIdType); //ユーザIDに紐づいた情報 20240222

  // スタッフ登録のバリデーションチェック 20240307
  const [userIdErrorMessage, setUserIdErrorMessage] = useState([] as string[]);
  const [userNameErrorMessage, setUserNameErrorMessage] = useState([] as string[]);
  const [userTypeErrorMessage, setUserTypeErrorMessage] = useState([] as string[]);

  const [backKeyFlag, setBackKeyFlag] = useState<boolean>(false); //戻るボタン押下時に前回入力された内容を維持するためのフラグ 20240326

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

  // クエリパラメータを取得する
  const orgId = searchParams.get('org_id')?.toString() || '';
  switch (orgId) {
    case '':
      break;
    default:
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
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        const prefectures = await axios.get('api/getPrefectures'); //都道府県マスターの取得 20240208
        //console.log(prefectures);
        const stateList = prefectures.data.map(
          ({
            pref_id,
            pref_name,
            pref_code_jis,
          }: {
            pref_id: number;
            pref_name: string;
            pref_code_jis: string;
          }) => ({
            id: pref_id,
            name: pref_name,
            prefCodeJis: pref_code_jis,
          }),
        );
        setPrefectureOptions(stateList);
        const orgClass = await axios.get('api/getOrganizationClass'); //団体区分マスターの取得
        const orgClassList = orgClass.data.map(
          ({ org_class_id, org_class_name }: { org_class_id: number; org_class_name: string }) => ({
            id: org_class_id,
            name: org_class_name,
          }),
        );
        setOrgClassOptions(orgClassList);
        const orgType = await axios.get('api/getOrganizationTypeData'); //団体種別マスターの取得
        const orgTypeList = orgType.data.map(
          ({ org_type_id, org_type }: { org_type_id: number; org_type: string }) => ({
            id: org_type_id,
            name: org_type,
          }),
        );
        setOrgTypeOptions(orgTypeList);
        if (mode === 'update' && !backKeyFlag) {
          const sendId = { org_id: orgId };
          const csrf = () => axios.get('/sanctum/csrf-cookie');
          await csrf();
          const organizationDataList = await axios.post('api/getOrgData', sendId);
          setFormData((prevFormData) => ({
            ...prevFormData,
            ...{
              org_id: organizationDataList.data.result.org_id,
              org_name: organizationDataList.data.result.org_name,
              entrysystem_org_id: organizationDataList.data.result.entrysystem_org_id,
              orgTypName: organizationDataList.data.result.orgTypeName,
              founding_year: organizationDataList.data.result.founding_year,
              post_code: organizationDataList.data.result.post_code,
              location_country: organizationDataList.data.result.location_country,
              locationCountry: organizationDataList.data.result.locationCountry,
              location_prefecture: organizationDataList.data.result.location_prefecture,
              locationPrefectureName: organizationDataList.data.result.locationPrefectureName,
              address1: organizationDataList.data.result.address1,
              address2: organizationDataList.data.result.address2,
              org_class: organizationDataList.data.result.org_class,
              orgClassName: organizationDataList.data.result.orgClassName,
              jara_org_type: organizationDataList.data.result.jara_org_type,
              jaraOrgTypeName: organizationDataList.data.result.jaraOrgTypeName,
              jara_org_reg_trail: organizationDataList.data.result.jara_org_reg_trail,
              pref_org_type: organizationDataList.data.result.pref_org_type,
              prefOrgTypeName: organizationDataList.data.result.prefOrgTypeName,
              pref_org_reg_trail: organizationDataList.data.result.pref_org_reg_trail,
            },
          }));
          const staff = await axios.post('api/getOrgStaffData', sendId);
          setTableData(staff.data.result);
        } else if (mode === 'create' && !backKeyFlag) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            ...{
              org_id: '',
              org_name: '',
              entrysystem_org_id: '',
              orgTypeName: '',
              founding_year: 0,
              post_code: '',
              post_code1: '',
              post_code2: '',
              location_prefecture: 0,
              locationPrefectureName: '',
              address1: '',
              address2: '',
              org_class: 0,
              orgClassName: '',
              jara_org_type: 0,
              jaraOrgTypeName: '任意',
              jara_org_reg_trail: '',
              pref_org_type: 0,
              prefOrgTypeName: '任意',
              pref_org_reg_trail: '',
            },
          }));

          setTableData([]); //団体更新から団体登録に遷移する場合を考慮して、一回空にし直す 20240321
          setTableData((prevData) => [
            ...prevData,
            {
              id: 1,
              user_id: '',
              user_name: '',
              delete_flag: false,
              staff_type_id: [],
              isUserFound: true, //新規登録時は便宜的にtrue
            },
          ]);
        }

        const playerInf = await axios.get('api/getIDsAssociatedWithUser');
        setUserIdType(playerInf.data.result[0]); //ユーザIDに紐づいた情報 20240222
      } catch (error: any) {
        setErrorMessage(['API取得エラー:' + error.message]);
      }
      setBackKeyFlag(false); //戻るボタン押下時に前回入力された内容を維持するためのフラグ 20240326
      //console.log(backKeyFlag);
    };
    fetchData();
  }, [mode]);

  /**
   * 郵便番号の変更時の処理
   * @description
   * 郵便番号を-で分割して、stateを更新する
   */
  useEffect(() => {
    // const addressNumbers = formData.post_code?.split('-');
    if (formData.post_code.includes('-')) {
      //バリデーションチェック時はハイフンが結合されるため
      //console.log(formData.post_code);
      const addressNumbers = formData.post_code.split('-');
      //console.log(addressNumbers);
      formData.post_code1 = addressNumbers[0];
      formData.post_code2 = addressNumbers[1];
    } else {
      //DBから受け取ったときはハイフンが無いため
      //console.log(formData.post_code);
      if (formData.post_code.length == 7) {
        const addressNumbers = Array();
        addressNumbers.push(formData.post_code?.slice(0, 3)); //郵便番号の前半3文字
        addressNumbers.push(formData.post_code?.slice(-4)); //郵便番号の後半4文字
        //console.log(addressNumbers);
        formData.post_code1 = addressNumbers[0];
        formData.post_code2 = addressNumbers[1];
        // setAddressNumbers(addressNumbers);
      }
    }
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
        formData.founding_year === 0 || formData.founding_year == null
          ? ''
          : formData.founding_year.toString(),
      ),
    ]);
    setFoundingYearErrorMessages(foundingYearError);

    formData.post_code = formData.post_code1 + '-' + formData.post_code2;
    const addressError = Validator.getErrorMessages([
      Validator.validateRequired(formData.post_code, '郵便番号'),
      Validator.validateAddressNumberFormat(formData.post_code),
      Validator.validateRequired(formData.locationPrefectureName, '都道府県'),
      Validator.validateRequired(formData.address1, '市区町村・町字番地'),
      // Validator.validateRequired(formData.address2, '建物名'),
    ]);
    setAddressErrorMessages(addressError);

    const orgClassError = Validator.getErrorMessages([
      Validator.validateRequired(formData.org_class, '団体区分'),
    ]);
    setOrgClassErrorMessages(orgClassError);

    const jaraTrailError = Validator.getErrorMessages([
      Validator.validateTrailError(formData.jara_org_reg_trail, formData.jara_org_type, 'JARA'),
    ]);
    setJaraOrgTypeErrorMessages(jaraTrailError);

    const prefTrailError = Validator.getErrorMessages([
      Validator.validateTrailError(formData.pref_org_reg_trail, formData.pref_org_type, '県ボ'),
    ]);
    setPrefOrgTypeErrorMessages(prefTrailError);

    //スタッフ登録のバリデーションチェック 20240308
    // 削除欄にチェックが入っている場合、バリデーションチェックを行わない
    const userIdErrorFlg = tableData.some((row) => {
      if (row.delete_flag) return false;
      return Validator.validateRequired(row.user_id, 'ユーザーID').length > 0;
    });
    // const userNameErrorFlg = tableData.some((row) => {
    //   if (row.delete_flag) return false;
    //   return Validator.validateSelectRequired(row.user_name, 'ユーザー名').length > 0;
    // });
    const userTypeErrorFlg = tableData.some((row) => {
      if (row.delete_flag) return false;
      var staff_type = null;
      if (row.staff_type_id.length > 0) {
        staff_type = 'OK';
      }
      return Validator.validateRequired(staff_type, 'ユーザー種別').length > 0;
    });
    if (userIdErrorFlg) {
      setUserIdErrorMessage(
        Validator.getErrorMessages([Validator.validateRequired(null, 'ユーザーID')]),
      );
    } else {
      setUserIdErrorMessage([]);
    }
    // if (userNameErrorFlg) {
    //   setUserNameErrorMessage(
    //     Validator.getErrorMessages([Validator.validateRequired(null, 'ユーザー名')]),
    //   );
    // } else {
    //   setUserNameErrorMessage([]);
    // }
    if (userTypeErrorFlg) {
      setUserTypeErrorMessage(
        Validator.getErrorMessages([Validator.validateSelectRequired(null, 'ユーザー種別')]),
      );
    } else {
      setUserTypeErrorMessage([]);
    }

    if (
      orgNameError.length > 0 ||
      foundingYearError.length > 0 ||
      addressError.length > 0 ||
      orgClassError.length > 0 ||
      jaraTrailError.length > 0 ||
      prefTrailError.length > 0 ||
      userIdErrorFlg ||
      // userNameErrorFlg ||
      userTypeErrorFlg
    ) {
      return true;
    } else {
      return false;
    }
  };

  // スタッフ追加
  const addCustomButton = addStaffDisplayFlg && (
    <CustomButton
      className='w-[120px] text-small'
      buttonType='primary'
      disabled={disableFlag}
      onClick={() => {
        //console.log(tableData.length);
        if (tableData.length > 199) {
          //行数が200を超えたときに、「スタッフ追加」ボタンを非表示にする
          setTableErrorMessages([
            '行の追加を制限しました、200行を超える行追加は出来ません。 ※登録可能スタッフ数は100名までです。',
          ]);
          setAddStaffDisplayFlg(false);
          return;
        }
        setTableData((prevData) => [
          ...prevData,
          {
            id: prevData.length + 1,
            user_id: '',
            user_name: '',
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

  //所在地検索 20240315
  const getAddress = async (): Promise<void> => {
    //console.log('getAddress start');
    const res = await _axios.get('https://zipcloud.ibsnet.co.jp/api/search', {
      params: { zipcode: formData.post_code1 + formData.post_code2 },
    });
    if (res.data.status === 200) {
      //console.log(res.data);
      if (res.data.results != null) {
        //外部サイトから取得したprefCodeとDBのprefCodeを対応させる処理 20240318
        var prefcode = 0;
        //console.log(prefectureOptions);
        for (let index = 0; index < prefectureOptions.length; index++) {
          //console.log((prefectureOptions[index] as any).prefCodeJis);
          if ((prefectureOptions[index] as any).prefCodeJis == res.data.results[0].prefcode) {
            prefcode = (prefectureOptions[index] as any).id;
          }
        }
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...{
            location_prefecture: prefcode,
            locationPrefectureName: res.data.results[0].address1,
            address1: res.data.results[0].address2 + res.data.results[0].address3,
          },
        }));
      } else {
        const addressError = Validator.getErrorMessages([Validator.validateAddressrResultFormat()]);
        //console.log(addressError.length);
        if (addressError.length > 0) {
          setAddressErrorMessages(addressError);
          return;
        } else {
          setAddressErrorMessages([]);
        }
      }
      // setAddress(res.data.results[0].address2 + res.data.results[0].address3);
      // setMsg(null);
    } else {
      //console.log(res);
      // setPref('');
      // setAddress('');
      // setMsg(res.data.message);
    }
  };

  // 確認
  const modeCustomButtons = {
    create: (
      <CustomButton
        buttonType='primary'
        className='w-[200px]'
        onClick={async () => {
          if (isValidateError()) {
            setDisableFlag(true);
          } else {
            // バックエンド側のバリデーションチェックを行う 20240308
            setDisableFlag(true); //バックエンド側へデータ送信中に操作できないようにする
            //console.log(tableData);
            //空行の削除
            var staffList = tableData.filter(function (x) {
              return !(x.delete_flag == true && (x.user_id == '' || x.user_name == ''));
            });
            //console.log(staffList);
            //送信データの作成
            //nullのパラメータを空のパラメータに置き換える
            Object.keys(formData).forEach((key) => {
              (formData as any)[key] = (formData as any)[key] ?? '';
            });
            const sendData = {
              formData,
              staffList,
            };
            const csrf = () => axios.get('/sanctum/csrf-cookie');
            await csrf();
            axios
              .post('api/validateOrgData', sendData)
              .then((response) => {
                //console.log(response.data);
                setTableData(response.data.result.staffList); //ユーザIDを元にユーザ名を表示する 20240405
                setDisableFlag(false);
                setErrorMessage([]);
                setTableErrorMessages([]);
                router.push('/team?mode=confirm&prevMode=create');
              })
              .catch((error) => {
                setErrorMessage(['入力値エラー: ' + (error?.response?.data as string[])]);
              });
          }
          setDisableFlag(false);
        }}
      >
        確認
      </CustomButton>
    ),
    update: (
      <CustomButton
        buttonType='primary'
        className='w-[200px]'
        onClick={async () => {
          if (isValidateError()) {
            setDisableFlag(true);
          } else {
            // バックエンド側のバリデーションチェックを行う 20240308
            setDisableFlag(true); //バックエンド側へデータ送信中に操作できないようにする
            //console.log(tableData);
            //空行の削除
            var staffList = tableData.filter(function (x) {
              return !(x.delete_flag == true && (x.user_id == '' || x.user_name == ''));
            });
            //console.log(staffList);
            //送信データの作成
            //nullのパラメータを空のパラメータに置き換える
            Object.keys(formData).forEach((key) => {
              (formData as any)[key] = (formData as any)[key] ?? '';
            });
            const sendData = {
              formData,
              staffList,
            };
            //console.log(sendData);
            const csrf = () => axios.get('/sanctum/csrf-cookie');
            await csrf();
            axios
              .post('api/validateOrgData', sendData)
              .then((response) => {
                //console.log(response);
                setTableData(response.data.result.staffList); //ユーザIDを元にユーザ名を表示する 20240405
                setDisableFlag(false);
                setErrorMessage([]);
                setTableErrorMessages([]);
                router.push('/team?mode=confirm&prevMode=update');
              })
              .catch((error) => {
                //console.log(error);
                setErrorMessage(['入力値エラー: ' + (error?.response?.data as string[])]);
              });
          }
          setDisableFlag(false);
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
          //空行の削除
          var staffList = tableData.filter(function (x) {
            return !(x.delete_flag == true && (x.user_id == '' || x.user_name == ''));
          });
          //console.log(staffList);
          //送信データの作成
          //nullのパラメータを空のパラメータに置き換える
          Object.keys(formData).forEach((key) => {
            (formData as any)[key] = (formData as any)[key] ?? '';
          });
          const sendData = {
            formData,
            staffList,
          };
          //console.log(sendData);
          //alert('TODO: APIを叩いて、登録・更新処理を行う');
          if (prevMode === 'create') {
            const storeOrgData = async () => {
              //console.log(formData);
              const csrf = () => axios.get('/sanctum/csrf-cookie');
              await csrf();
              axios
                .post('api/storeOrgData', sendData)
                .then((response) => {
                  // console.log(response);
                  // TODO: 登録処理成功時の処理
                  if (
                    response.data.duplicationError == undefined ||
                    response.data.duplicationError == null ||
                    response.data.duplicationError == ''
                  ) {
                    window.alert('団体情報を登録しました。');
                    router.push('/teamRef?orgId=' + response.data.result);
                  } else {
                    setErrorMessage([...(response.data?.duplicationError as string[])]);
                  }
                })
                .catch((error) => {
                  //console.log(error);
                  // TODO: 登録処理失敗時の処理
                  // setErrorMessage([
                  //   ...(errorMessage as string[]),
                  //   '登録に失敗しました。原因：' + (error as Error).message,
                  // ]);
                });
            };
            storeOrgData();
          } else {
            const updateOrgData = async () => {
              const csrf = () => axios.get('/sanctum/csrf-cookie');
              await csrf();
              axios
                .post('api/updateOrgData', sendData)
                .then((response) => {
                  if (
                    response.data.errorMessage == undefined ||
                    response.data.errorMessage == null ||
                    response.data.errorMessage == ''
                  ) {
                    window.alert('団体情報を更新しました。');
                    router.push('/teamRef?orgId=' + formData.org_id);
                  } else {
                    setErrorMessage([...(response.data?.errorMessage as string[])]);
                  }
                })
                .catch((error) => {
                  // TODO: 更新処理失敗時の処理
                  setErrorMessage([
                    ...(errorMessage as string[]),
                    '更新に失敗しました。原因：' + (error as Error).message,
                  ]);
                });
            };
            updateOrgData();
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
    <>
      <div className='flex flex-col justify-start gap-[20px]'>
        <ErrorBox errorText={errorMessage} />
        <div className='flex flex-row justify-start gap-[20px]'>
          {/* 画面名 */}
          <CustomTitle displayBack>
            {mode === 'create' && '団体情報登録'}
            {mode === 'update' && '団体情報更新'}
            {mode === 'confirm' && '団体情報入力確認'}
          </CustomTitle>
        </div>
        {/* フォーム */}
        {(mode === 'update' || prevMode === 'update') && (
          // 団体ID
          <CustomTextField
            label='団体ID'
            displayHelp={false}
            readonly
            required={false}
            value={formData.org_id}
            onChange={(e) => handleInputChange('org_id', e.target.value)}
          />
        )}
        {/* エントリーシステムの団体ID */}
        <CustomTextField
          label='エントリーシステムの団体ID'
          readonly={mode === 'confirm'}
          value={formData.entrysystem_org_id}
          displayHelp={mode !== 'confirm'}
          onChange={(e) => handleInputChange('entrysystem_org_id', e.target.value)}
          toolTipText='日本ローイング協会より発行された、6桁の団体コードを入力してください。' //はてなボタン用
          maxLength={6}
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
          toolTipText='登録する団体名を入力してください。' //はてなボタン用
        />
        {/* 創立年 */}
        <div className='w-full flex flex-col justify-between gap-[8px]'>
          <InputLabel
            label='創立年'
            displayHelp={mode !== 'confirm'}
            toolTipText='団体の創立年を西暦で入力してください。' //はてなボタン用
          />
          <CustomYearPicker
            selectedDate={formData.founding_year === 0 ? '' : formData.founding_year?.toString()}
            errorMessages={foundingYearErrorMessages}
            onChange={(date: Date) => {
              //console.log(date);
              handleInputChange('founding_year', date == null ? '' : date.getFullYear().toString()); //創立年に空欄を入力できるように対応 ※nullの場合、空文字にする 20240315
            }} //創立年を4桁年で取得するように修正 200240308
            readonly={mode === 'confirm'}
            isError={foundingYearErrorMessages.length > 0}
            className='w-[300px]'
          />
        </div>
        <div className='w-full flex flex-col justify-between gap-[8px]'>
          {/* 所在地 */}
          <InputLabel label='所在地' required={mode !== 'confirm'} displayHelp={false} />
          {mode !== 'confirm' && (
            <div className='w-full flex flex-row justify-start gap-[8px]'>
              <div className='h-[40px] self-end'>〒</div>
              {/* 郵便番号1 */}
              {/* <CustomTextField
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
              /> */}
              <CustomTextField
                required={mode !== 'confirm'}
                displayHelp={mode !== 'confirm'}
                value={formData.post_code1}
                onChange={(e) => handleInputChange('post_code1', e.target.value)}
                isError={addressErrorMessages.length > 0}
                className='w-[120px]'
              />
              <div className='h-[40px] self-end'>-</div>
              {/* 郵便番号2 */}
              {/* <CustomTextField
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
              /> */}
              <CustomTextField
                required={mode !== 'confirm'}
                value={formData.post_code2}
                onChange={(e) => handleInputChange('post_code2', e.target.value)}
                isError={addressErrorMessages.length > 0}
                className='w-[120px] self-end'
              />
              {/* 検索 */}
              <CustomButton
                buttonType='primary'
                className='w-[80px] self-end'
                disabled={disableFlag}
                onClick={() => {
                  formData.post_code = formData.post_code1 + '-' + formData.post_code2;
                  //console.log(formData.post_code);
                  const addressError = Validator.getErrorMessages([
                    Validator.validateRequired(formData.post_code, '郵便番号'),
                    Validator.validateAddressNumberFormat(formData.post_code),
                  ]);
                  //console.log(addressError.length);
                  if (addressError.length > 0) {
                    setAddressErrorMessages(addressError);
                    return;
                  } else {
                    setAddressErrorMessages([]);
                  }
                  // TODO: 検索ボタンが押された時の処理
                  // alert('TODO: 検索ボタンが押された時の処理');
                  getAddress(); //外部サイトから所在地を検索 20240315
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
          <CustomDropdown
            id='prefecture'
            label='都道府県'
            required={mode !== 'confirm'}
            displayHelp={false}
            options={prefectureOptions.map((item) => ({
              value: item.name,
              key: item.id,
            }))}
            isError={addressErrorMessages.length > 0}
            value={
              (mode !== 'confirm'
                ? formData.location_prefecture?.toString()
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
          displayHelp={false}
          value={formData.address1}
          readonly={mode === 'confirm'}
          isError={addressErrorMessages.length > 0}
          errorMessages={addressErrorMessages}
          onChange={(e) => handleInputChange('address1', e.target.value)}
        />
        {/* マンション・アパート */}
        <CustomTextField
          label='マンション・アパート'
          // required={mode !== 'confirm'}
          displayHelp={false}
          value={formData.address2}
          readonly={mode === 'confirm'}
          onChange={(e) => handleInputChange('address2', e.target.value)}
          // isError={addressErrorMessages.length > 0}
          // errorMessages={addressErrorMessages}
        />
        <div className='w-full flex flex-col justify-between gap-[8px]'>
          {/* 団体区分 */}
          <CustomDropdown
            id='団体区分'
            label='団体区分'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            toolTipText='保留' //はてなボタン用
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
        {(userIdType.is_administrator == ROLE.SYSTEM_ADMIN || userIdType.is_jara == ROLE.JARA) && (
          <InputLabel
            label='団体種別'
            displayHelp={mode !== 'confirm'}
            toolTipText='JARA
          　日本ローイング協会より証跡が発行されている場合、"正規" を選択し
          　発行された証跡を入力してください。
          県ボ
          　都道府県ボート協会より証跡が発行されている場合、"正規" を選択し
          　発行された証跡を入力してください。' //はてなボタン用
          />
        )}
        {(userIdType.is_administrator == ROLE.SYSTEM_ADMIN || userIdType.is_jara == ROLE.JARA) && (
          <div className='w-full flex flex-row justify-start gap-[8px]'>
            <div className='w-full flex flex-col justify-between gap-[8px]'>
              <CustomDropdown
                id='JARA'
                label='JARA'
                value={
                  mode !== 'confirm' ? formData.jara_org_type?.toString() : formData.jaraOrgTypeName
                }
                onChange={(e) => {
                  //console.log(formData.jara_org_type);
                  handleInputChange('jara_org_type', e);
                  handleInputChange(
                    'jaraOrgTypeName',
                    orgTypeOptions.find((orgType) => orgType.id == Number(e))?.name || '',
                  );
                  handleInputChange('jara_org_reg_trail', ''); //団体種別を切り替えるごとに証跡をリセットする 20240308
                  //console.log('sssssss', formData.jara_org_type);
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
            {(userIdType.is_administrator == ROLE.SYSTEM_ADMIN ||
              userIdType.is_jara == ROLE.JARA) &&
              formData.jara_org_type == 1 && (
                <CustomTextField
                  label='証跡'
                  displayHelp={false}
                  className='w-[300px]'
                  value={formData.jara_org_reg_trail}
                  // readonly={mode === 'confirm' || userIdType.is_pref_boat_officer == ROLE.PREFECTURE}
                  readonly={mode === 'confirm'}
                  onChange={(e) => handleInputChange('jara_org_reg_trail', e.target.value)}
                />
              )}
          </div>
        )}
        {(userIdType.is_administrator == ROLE.SYSTEM_ADMIN ||
          userIdType.is_pref_boat_officer == ROLE.PREFECTURE) && (
          <div className='w-full flex flex-row justify-start gap-[8px]'>
            <div className='w-full flex flex-col justify-between gap-[8px]'>
              {/* 県ボ団体種別 */}
              <CustomDropdown
                id='県ボ'
                label='県ボ'
                value={
                  mode !== 'confirm' ? formData.pref_org_type?.toString() : formData.prefOrgTypeName
                }
                onChange={(e) => {
                  handleInputChange('pref_org_type', e);
                  handleInputChange(
                    'prefOrgTypeName',
                    orgTypeOptions.find((orgType) => orgType.id == Number(e))?.name || '',
                  );
                  handleInputChange('pref_org_reg_trail', ''); //団体種別を切り替えるごとに証跡をリセットする 20240308
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
            {(userIdType.is_administrator == ROLE.SYSTEM_ADMIN ||
              userIdType.is_pref_boat_officer == ROLE.PREFECTURE) &&
              formData.pref_org_type == 1 && (
                <CustomTextField
                  label='証跡'
                  className='w-[300px]'
                  displayHelp={false}
                  // readonly={mode === 'confirm' || userIdType.is_jara == ROLE.JARA}
                  readonly={mode === 'confirm'}
                  value={formData.pref_org_reg_trail}
                  onChange={(e) => handleInputChange('pref_org_reg_trail', e.target.value)}
                />
              )}
          </div>
        )}
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
              {mode !== 'confirm' ? (
                <CustomTh rowSpan={2} align='center'>
                  削除
                </CustomTh>
              ) : (
                <></>
              )}
              <CustomTh rowSpan={2} align='center'>
                {mode !== 'confirm' && <p className='text-caption2 text-systemErrorText'>必須</p>}
                ユーザーID
              </CustomTh>
              <CustomTh rowSpan={2} align='center'>
                {/* {mode !== 'confirm' && <p className='text-caption2 text-systemErrorText'>必須</p>} */}
                ユーザー名
              </CustomTh>
              <CustomTh colSpan={5} align='center'>
                {mode !== 'confirm' && <p className='text-caption2 text-systemErrorText'>必須</p>}
                ユーザー種別
              </CustomTh>
            </CustomTr>
            <CustomTr>
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
                    value={data.isUserFound ? data.user_name : '該当ユーザーなし'}
                    disabled={!data.isUserFound}
                    // readonly={mode === 'confirm' || !data.isUserFound}
                    readonly={true}
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
      {
        // スタッフ登録のエラーメッセージの表示 20240308
        (userIdErrorMessage.length > 0 ||
          userNameErrorMessage.length > 0 ||
          userTypeErrorMessage.length > 0 ||
          tableErrorMessages.length > 0) && (
          <div key='tableErrorMessage' className='text-caption1 text-systemErrorText'>
            <p>{userIdErrorMessage}</p>
            <p>{userNameErrorMessage}</p>
            <p>{userTypeErrorMessage}</p>
            <p>{tableErrorMessages}</p>
          </div>
        )
      }
      <Divider className='w-[900px] h-[1px] bg-border' />
      <div className='flex flex-row justify-center gap-[16px]'>
        {/* 戻る */}
        <CustomButton
          buttonType='white-outlined'
          className='w-[200px]'
          onClick={() => {
            //console.log(backKeyFlag);
            setBackKeyFlag(true); //戻るボタン押下時に前回入力された内容を維持するためのフラグ 20240326
            //console.log(backKeyFlag);
            router.back();
          }}
        >
          戻る
        </CustomButton>
        {/* 更新/確認ボタン */}
        {modeCustomButtons[mode as keyof typeof modeCustomButtons]}
      </div>
    </>
  );
}
