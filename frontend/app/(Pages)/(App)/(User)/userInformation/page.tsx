// 機能名: ユーザー情報更新画面・入力確認画面
'use client';

import { NO_IMAGE_URL, USER_IMAGE_URL } from '../../../../utils/imageUrl'; //For importing image url from a single source of truth

import axios from '@/app/lib/axios';
import {
  Country,
  CountryResponse,
  Prefecture,
  PrefectureResponse,
  Sex,
  SexResponse,
  UserResponse,
} from '@/app/types';
import Validator from '@/app/utils/validator';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';

import {
  CustomButton,
  CustomDatePicker,
  CustomDialog,
  CustomDropdown,
  CustomTextField,
  CustomTitle,
  ErrorBox,
  ImageUploader,
  InputLabel,
} from '@/app/components';
import {
  getSessionStorage,
  getStorageKey,
  removeSessionStorage,
  setSessionStorage,
} from '@/app/utils/sessionStorage';

type UserFormData = UserResponse;

export default function UserInformationUpdate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const prevScreen = searchParams.get('prevScreen');
  const source = searchParams.get('source') as 'confirm' | null;
  const isMailChanged = searchParams.get('isMailChanged');

  //For storing the verification status of certification number
  const [isNumberVerified, setIsNumberVerified] = useState(false);

  let paramError = false;

  // フォームの入力値を管理するステート
  const [formData, setFormData] = useState<UserFormData>({
    user_id: '', // ユーザーID
    user_name: '', // ユーザー名
    date_of_birth: '', // 生年月日
    sexName: '', // 性別
    sex: null, // 性別ID
    height: null, // 身長
    weight: null, // 体重
    residence_country: null, // 居住地（国）ID
    residenceCountryName: '', // 居住地（国）
    residence_prefecture: null, // 居住地（都道府県）ID
    residencePrefectureName: '', // 居住地（都道府県）
    mailaddress: '', // メールアドレス
    user_type: '', // ユーザー種別
    userTypeName: '', // ユーザー種別名
    temp_password_flag: 0, // 仮登録フラグ
    photo: '', // 写真
  });
  // モードのチェック
  switch (mode) {
    case 'update':
      break;
    case 'confirm':
      break;
    default:
      paramError = true;
      break;
  }

  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [userNameErrorMessages, setUserNameErrorMessages] = useState([] as string[]);
  const [livingCountryErrorMessages, setLivingCountryErrorMessages] = useState([] as string[]);
  const [livingPrefectureErrorMessages, setLivingPrefectureErrorMessages] = useState(
    [] as string[],
  );
  const [sexErrorMessages, setSexErrorMessages] = useState([] as string[]);
  const [dateOfBirthErrorMessages, setDateOfBirthErrorMessages] = useState([] as string[]);
  const [prevEmail, setPrevEmail] = useState('' as string);

  const [countries, setCountries] = useState<Omit<CountryResponse, 'cd'>[]>([]);
  const [prefectures, setPrefectures] = useState<PrefectureResponse[]>([]);
  const [sex, setSex] = useState<SexResponse[]>([]);
  const [currentShowFile, setCurrentShowFile] = useState<
    | {
        file: File;
        isUploaded: boolean;
        preview?: string;
      }
    | undefined
  >(undefined);
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailErrorMessages, setEmailErrorMessages] = useState([] as string[]);
  const [emailConfirmErrorMessages, setEmailConfirmErrorMessages] = useState([] as string[]);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authNumber, setAuthNumber] = useState('' as string);

  const storageKey = getStorageKey({ pageName: 'userInformation', type: 'update', id: 0 });

  const draftFormData = getSessionStorage<UserFormData>(storageKey);

  const removeDraftFormData = () => {
    removeSessionStorage(storageKey);
  };

  // フォームの入力値を管理する関数
  const handleInputChange = (name: string, value: string | File | null) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (formData?.residence_country == 0) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        residencePrefectureId: 0,
        residencePrefectureName: '東京',
      }));
    }
  }, [formData?.residence_country]);

  //アップロードされたファイルを保存するー開始
  useEffect(() => {
    if (currentShowFile?.file) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        uploadedPhotoName: currentShowFile.file.name,
        uploadedPhoto: currentShowFile.file,
        photo: '',
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        uploadedPhotoName: '',
        uploadedPhoto: undefined,
        photo: '',
      }));
    }
  }, [currentShowFile]);
  //アップロードされたファイルを保存するー完了

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        // APIを叩いて、マスタ情報を取得する処理の置き換え
        const [prefectureResponse, sexResponse, countryResponse] = await Promise.all([
          axios.get<Prefecture[]>('api/getPrefectures'),
          axios.get<Sex[]>('api/getSexList'),
          axios.get<Country[]>('api/getCountries'),
        ]);

        const stateList = prefectureResponse.data.map((x) => ({
          id: x.pref_id,
          name: x.pref_name,
        }));
        setPrefectures(stateList);

        const sexList = sexResponse.data.map((x) => ({
          id: x.sex_id,
          name: x.sex,
        }));
        setSex(sexList);

        const countryList = countryResponse.data.map((x) => ({
          id: x.country_id,
          name: x.country_name,
        }));
        setCountries(countryList);
      } catch (error: any) {
        setErrorMessage(['API取得エラー:' + error.message]);
      }
    };
    fetchMaster();
  }, []);

  // ユーザー情報のセットアップ
  useEffect(() => {
    const restoreFormData = () => {
      // draftFormDataが存在しない場合は復元しない
      if (!draftFormData || mode === 'confirm') {
        return;
      }

      // 確認画面から戻ってきた場合は、draftFormDataを適用する
      if (source === 'confirm') {
        setFormData(draftFormData);
        return;
      }

      if (mode === 'update') {
        const ok = confirm('編集中の入力内容があります。復元しますか？');
        if (!ok) {
          return;
        }
      }

      setFormData(draftFormData);
    };

    const fetchUser = async () => {
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        const response = await axios.get<{ result: UserResponse }>('api/user');

        setFormData((prevFormData) => ({
          ...prevFormData,
          ...{
            user_id: response.data.result.user_id,
            user_name: response.data.result.user_name,
            user_type: response.data.result.user_type,
            userTypeName: response.data.result.userTypeName,
            date_of_birth: response.data.result.date_of_birth,
            sexName: response.data.result.sexName,
            sex: response.data.result.sex,
            height: response.data.result.height,
            weight: response.data.result.weight,
            residence_country: response.data.result.residence_country,
            residenceCountryName: response.data.result.residenceCountryName,
            residence_prefecture: response.data.result.residence_prefecture,
            residencePrefectureName: response.data.result.residencePrefectureName,
            mailaddress: response.data.result.mailaddress,
            temp_password_flag: response.data.result.temp_password_flag,
            photo: response.data.result.photo,
          },
        }));
        restoreFormData();

        setPrevEmail(response.data.result.mailaddress);
      } catch (error: any) {
        setErrorMessage(['API取得エラー:' + error.message]);
      }
    };
    // 更新モード、参照モード、削除モードの時にユーザー情報を取得し、フォームにセットする。
    if (mode === 'update') {
      fetchUser();
    }
  }, []);

  const modeCustomButtons = {
    update: (
      <CustomButton
        buttonType='primary'
        onClick={() => {
          const userNameError = Validator.getErrorMessages([
            Validator.validateRequired(formData?.user_name, 'ユーザー名'),
            Validator.validateUserNameFormat(formData?.user_name),
          ]);

          const sexError = Validator.getErrorMessages([
            Validator.validateRequired(formData?.sexName, '性別'),
          ]);

          const birthDateError = Validator.getErrorMessages([
            Validator.validateBirthOfDateRange(
              new Date(formData?.date_of_birth),
              '生年月日',
              5,
              150,
            ),
          ]);

          const livingCountryError = Validator.getErrorMessages([
            Validator.validateRequired(formData?.residenceCountryName, '居住地'),
          ]);

          let livingPrefectureError = [];

          if (formData?.residenceCountryName === '日本国 （jpn）') {
            livingPrefectureError = Validator.getErrorMessages([
              Validator.validateRequired(formData?.residencePrefectureName, '居住地'),
            ]);
            setLivingPrefectureErrorMessages(livingPrefectureError as string[]);
          }

          // const dateOfBirthError = Validator.getErrorMessages([
          //   Validator.validateRequired(formData?.date_of_birth, '生年月日'),
          //   Validator.validateBirthOfDateRange(new Date(formData?.date_of_birth), '生年月日', 5, 150),
          // ]);

          setUserNameErrorMessages(userNameError as string[]);
          setSexErrorMessages(sexError as string[]);
          setDateOfBirthErrorMessages(birthDateError as string[]);
          setLivingCountryErrorMessages(livingCountryError as string[]);

          // setDateOfBirthErrorMessages(dateOfBirthError as string[]);

          if (
            userNameError.length > 0 ||
            sexError.length > 0 ||
            birthDateError.length > 0 ||
            livingCountryError.length > 0 ||
            livingPrefectureError.length > 0
            // dateOfBirthError.length > 0
          ) {
            return;
          }
          setErrorMessage([]);
          setSessionStorage<UserFormData>(storageKey, formData);
          router.push(
            '/userInformation?mode=confirm&isMailChanged=' +
              (email && email !== prevEmail ? 'true' : 'false') +
              (prevScreen ? '&prevScreen=' + prevScreen : ''),
          );
        }}
      >
        確認
      </CustomButton>
    ),
    confirm: (
      <CustomButton
        buttonType='primary'
        onClick={async () => {
          // TODO: 更新処理
          if (isMailChanged === 'true') {
            if (isNumberVerified) {
              const updateUser = async () => {
                const csrf = () => axios.get('/sanctum/csrf-cookie');
                await csrf();

                axios
                  .post('api/updateUserData', formData, {
                    //ファイルを送るため
                    headers: {
                      'content-type': 'multipart/form-data',
                    },
                  })
                  .then((response) => {
                    // 成功時の処理を実装
                    removeDraftFormData();
                    window.alert('ユーザー情報を更新しました。');
                    router.push('/mypage/profile');
                  })
                  .catch((error) => {
                    if (error?.response) {
                      setErrorMessage([...error?.response?.data]);
                    } else {
                      setErrorMessage([error?.message]);
                    }
                  });
              };
              updateUser();
            } else {
              const isOK = window.confirm(
                'メールアドレスが変更されている為、表示されているメールアドレス宛に6桁の認証番号が送られます。メール本文に記載されている認証番号を入力してください。※認証番号の有効期限は30分間です。',
              );
              if (isOK) {
                const csrf = () => axios.get('/sanctum/csrf-cookie');
                await csrf();
                axios
                  .post('api/user/sent-certification-number', {
                    user_name: formData?.user_name,
                    mailaddress: formData?.mailaddress,
                  })
                  .then((response) => {
                    // 成功時の処理を実装
                    setIsAuthDialogOpen(true);
                    setErrorMessage([]);
                  })
                  .catch((error) => {
                    if (error?.response) {
                      setErrorMessage([...error?.response?.data]);
                    } else {
                      setErrorMessage([error?.message]);
                    }
                    // setErrorMessage([
                    //   'メールを送信に失敗しました。ユーザーサポートにお問い合わせください。',
                    // ]);
                  });
              }
            }
          } else {
            const updateUser = async () => {
              const csrf = () => axios.get('/sanctum/csrf-cookie');
              await csrf();

              axios
                .post('api/updateUserData', formData, {
                  //ファイルを送るため
                  headers: {
                    'content-type': 'multipart/form-data',
                  },
                })

                .then((response) => {
                  // 成功時の処理を実装
                  removeDraftFormData();
                  window.alert('ユーザー情報を更新しました。');
                  router.push('/mypage/profile');
                })
                .catch((error) => {
                  if (error?.response?.response?.data) {
                    setErrorMessage([...error?.response?.data]);
                  } else {
                    setErrorMessage([error?.message]);
                  }
                  // setErrorMessage([
                  //   'ユーザー情報の登録に失敗しました。ユーザーサポートにお問い合わせください。',
                  // ]);
                });
            };
            updateUser();
          }
        }}
      >
        更新
      </CustomButton>
    ),
  };

  // 日付をYYYY/MM/DDの形式に変換する
  const formatDate = (dt: Date | null | undefined) => {
    if (!dt) {
      return '';
    }

    const y = dt.getFullYear();
    const m = ('00' + (dt.getMonth() + 1)).slice(-2);
    const d = ('00' + dt.getDate()).slice(-2);
    return y + '/' + m + '/' + d;
  };

  const customBack = () => {
    if (mode === 'confirm') {
      router.push(`/userInformation?mode=update&source=confirm`);
      return;
    }

    router.back();
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
          <CustomTitle customBack={customBack}>
            {mode === 'update' && 'ユーザー情報更新'}
            {mode === 'confirm' && 'ユーザー情報確認'}
          </CustomTitle>
        </div>
        <div className='flex flex-col justify-start gap-[10px]'>
          {/* 写真 */}
          <InputLabel
            displayHelp={mode !== 'confirm'}
            label='写真'
            toolTipText={`<span style="display: block;">登録可能な画像ファイルの種類は以下になります。</span>
          <span style="display: block;">jpg</span>
          <span style="display: block;">jpeg</span>
          <span style="display: block;">png</span>`}
          />
          {mode === 'update' && (
            <ImageUploader
              currentShowFile={currentShowFile}
              setCurrentShowFile={setCurrentShowFile}
              setFormData={setFormData}
              initialPhotoUrl={formData?.photo ? `${USER_IMAGE_URL}${formData.photo}` : ''}
            />
          )}
          {/* 写真 */}
          {mode === 'confirm' && (
            <img
              src={
                currentShowFile?.preview ??
                (formData.photo ? `${USER_IMAGE_URL}${formData.photo}` : `${NO_IMAGE_URL}`)
              }
              className='w-[300px] h-[300px] rounded-[2px] object-cover'
              alt='Profile Photo'
            />
          )}
        </div>
        {/* ユーザーID */}
        <CustomTextField
          label='ユーザーID'
          readonly
          value={formData?.user_id}
          displayHelp={false}
          placeHolder='XXXXXXX'
        />
        {/* ユーザー種別 */}
        <CustomTextField
          label='ユーザー種別'
          readonly
          placeHolder='XXXXXXX'
          value={formData?.userTypeName}
          displayHelp={false}
        />
        {/* ユーザー名 */}
        <CustomTextField
          label='ユーザー名'
          placeHolder='山田太郎'
          readonly={mode === 'confirm'}
          toolTipText={`<span style="display: block;">文字制限</span>
          <span style="display: block;">最大文字数：32文字（全半角区別なし）</span>
          <span style="display: block;">利用可能文字：</span>
          <span style="display: block;">日本語</span>
          <span style="display: block;">英大文字：[A-Z]（26 文字）</span>
          <span style="display: block;">英小文字：[a-z]（26 文字）</span>
          <span style="display: block;">数字：[0-9]（10 文字）</span>
          <span style="display: block;">記号：-,_`}
          onChange={(e) => {
            handleInputChange('user_name', e.target.value);
          }}
          errorMessages={[...userNameErrorMessages]}
          isError={userNameErrorMessages.length > 0}
          displayHelp={mode === 'update'}
          required={mode === 'update'}
          value={formData?.user_name}
        />
        {/* メールアドレス */}
        <div className='flex flex-row gap-[10px]'>
          <CustomTextField
            label='メールアドレス'
            errorMessages={[]}
            displayHelp={mode === 'update'}
            required={mode === 'update'}
            readonly
            placeHolder='メールアドレスを入力してください。'
            type='email'
            value={formData?.mailaddress}
            toolTipText='変更するボタンをクリックし、新しいメールアドレスを入力して、画面下部の確認ボタンから更新を行なってください。'
            onChange={() => {
              handleInputChange('mailaddress', '');
            }}
          />
          {!formData?.temp_password_flag && mode == 'update' && (
            <div className='mt-auto'>
              <CustomDialog
                className='w-[120px]'
                title='メールアドレスの変更'
                buttonLabel='変更する'
                displayCancel={true}
                confirmButtonLabel='変更'
                // ダイアログ内で確認ボタンを押した時の処理
                handleConfirm={() => {
                  const errorMessages = Validator.getErrorMessages([
                    Validator.validateRequired(email, 'メールアドレス'),
                    Validator.validateEmailFormat2(email),
                  ]);
                  setEmailErrorMessages(errorMessages);
                  const confEmailError = Validator.getErrorMessages([
                    Validator.validateRequired(confirmEmail, '確認用にもう一度メールアドレス'),
                    Validator.validateEqual(email, confirmEmail, 'メールアドレス'),
                  ]);
                  setEmailConfirmErrorMessages(confEmailError);

                  if (errorMessages.length == 0 && confEmailError.length == 0) {
                    // setPrevEmail(formData.mailaddress);
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      mailaddress: email,
                    }));
                    return true;
                  }
                  return false;
                }}
                // キャンセルボタンを押した時の処理
                // ダイアログでの入力データを初期化する
                handleCancel={() => {
                  setConfirmEmail('');
                  setEmail('');
                  setEmailErrorMessages([]);
                  setEmailConfirmErrorMessages([]);
                }}
              >
                {/* メールアドレス */}
                <div className='flex flex-col justify-start gap-[10px] my-[24px]'>
                  <CustomTextField
                    label='新しいメールアドレス'
                    errorMessages={emailErrorMessages}
                    isError={emailErrorMessages.length > 0}
                    value={email}
                    required
                    displayHelp={false}
                    placeHolder='新しいメールアドレスを入力してください。'
                    type='email'
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                  {/* メールアドレス確認 */}
                  <CustomTextField
                    label='新しいメールアドレス確認 '
                    errorMessages={emailConfirmErrorMessages}
                    required
                    isError={emailConfirmErrorMessages.length > 0}
                    displayHelp={false}
                    value={confirmEmail}
                    placeHolder='新しいメールアドレスを入力してください。'
                    type='email'
                    onChange={(e) => {
                      setConfirmEmail(e.target.value);
                    }}
                  />
                </div>
              </CustomDialog>
            </div>
          )}
        </div>
        <div className='flex flex-col justify-start gap-[10px]'>
          {/* 性別 */}
          <CustomDropdown
            id='性別'
            label='性別'
            required={mode === 'update'}
            value={mode !== 'confirm' ? formData?.sex?.toString() || '' : formData?.sexName}
            options={sex.map((item) => ({ key: item.id, value: item.name }))}
            placeHolder='男性'
            className='w-full'
            readonly={mode === 'confirm'}
            onChange={(e) => {
              handleInputChange('sex', e);
              handleInputChange('sexName', sex.find((item) => item.id === Number(e))?.name || '');
            }}
            errorMessages={sexErrorMessages}
            isError={sexErrorMessages.length > 0}
          />
        </div>
        <div className='flex flex-col justify-start gap-[10px]'>
          {/* 生年月日 */}
          <InputLabel
            label='生年月日'
            displayHelp={mode === 'update'}
            toolTipText='西暦で入力してください。'
          />
          <CustomDatePicker
            readonly={mode === 'confirm'}
            selectedDate={formData?.date_of_birth}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleInputChange('date_of_birth', formatDate(e as unknown as Date));
            }}
            maxDate={new Date()}
            errorMessages={dateOfBirthErrorMessages}
            isError={dateOfBirthErrorMessages.length > 0}
          />
        </div>
        <div className='flex flex-col items-start sm:flex-row sm:justify-start gap-[16px]'>
          <div className='flex flex-col justify-start w-full'>
            {/* 居住地（国） */}
            <CustomDropdown
              id='residenceCountry'
              label='居住地'
              className='w-full'
              required={mode === 'update'}
              readonly={mode === 'confirm'}
              options={countries.map((item) => ({ key: item.id, value: item.name })) || []}
              placeHolder='日本国 （jpn）'
              value={
                mode !== 'confirm'
                  ? formData?.residence_country?.toString() || ''
                  : formData?.residenceCountryName
              }
              onChange={(e) => {
                handleInputChange('residence_country', e);
                handleInputChange(
                  'residenceCountryName',
                  countries.find((item) => item.id === Number(e))?.name || '',
                );
              }}
              errorMessages={livingCountryErrorMessages}
              isError={livingCountryErrorMessages.length > 0}
            />
          </div>
          {/* 居住地（都道府県） */}
          {formData?.residenceCountryName === '日本国 （jpn）' && (
            <div className='flex flex-col justify-start w-full'>
              <CustomDropdown
                id='residencePrefecture'
                label='都道府県'
                className='w-full'
                required={mode === 'update'}
                readonly={mode === 'confirm'}
                options={prefectures.map((item) => ({ key: item.id, value: item.name })) || []}
                value={
                  mode !== 'confirm'
                    ? formData?.residence_prefecture?.toString() || ''
                    : formData?.residencePrefectureName
                }
                placeHolder='東京'
                onChange={(e) => {
                  handleInputChange('residence_prefecture', e);
                  handleInputChange(
                    'residencePrefectureName',
                    prefectures.find((item) => item.id === Number(e))?.name || '',
                  );
                }}
                errorMessages={livingPrefectureErrorMessages}
                isError={livingPrefectureErrorMessages.length > 0}
              />
            </div>
          )}
        </div>
        {/* ２段階認証用ダイアログ */}
        <Dialog
          open={isAuthDialogOpen}
          onClose={() => {
            setIsAuthDialogOpen(false);
          }}
        >
          <DialogTitle>２段階認証</DialogTitle>
          <DialogContent>
            <DialogContentText>
              受信したメールに記載されているコードを入力してください。
            </DialogContentText>
            <CustomTextField
              label='認証番号'
              placeHolder='6桁のコードを入力'
              type='number'
              value={authNumber}
              onChange={(e) => {
                setAuthNumber(e.target.value);
              }}
            />
            <ErrorBox errorText={errorMessage} />
          </DialogContent>
          <DialogActions>
            <CustomButton
              buttonType='white-outlined'
              className='w-full'
              onClick={() => {
                setIsAuthDialogOpen(false);
                setAuthNumber('');
                setErrorMessage([]);
              }}
            >
              キャンセル
            </CustomButton>
            <CustomButton
              buttonType='primary'
              className='w-[200px]'
              onClick={async () => {
                // 認証処理。認証番号が入力されていない場合はバリデーションエラーを表示する。
                if (!authNumber) {
                  setErrorMessage(['認証番号を入力してください。']);
                  // setIsAuthDialogOpen(false);
                  return;
                }

                const csrf = () => axios.get('/sanctum/csrf-cookie');
                await csrf();

                axios
                  .post('api/user/verify-certification-number', {
                    certification_number: authNumber,
                  })
                  .then((response) => {
                    setIsNumberVerified(true);
                    setAuthNumber('');
                    setErrorMessage([]);
                    setIsAuthDialogOpen(false);
                    window.alert(response?.data);
                  })
                  .catch((error) => {
                    // setAuthNumber('');
                    if (error?.response) {
                      setErrorMessage([...error?.response?.data]);
                    } else {
                      setErrorMessage([error?.message]);
                    }
                  });

                // const verifyResult = () => {
                //   // TODO: 「ユーザーテーブル」の当該ユーザーの「メールアドレス変更認証番号」に登録されている数字と一致することを確認する処理に置き換え
                //   true;
                // };
                // if (!verifyResult) {
                //   setErrorMessage(['認証番号が不正です。']);
                //   setIsAuthDialogOpen(false);
                //   return;
                // }
                // const expireResult = () => {
                //   // TODO: 当該認証番号の有効期限切れていないことを確認する処理に置き換え
                //   true;
                // };
                // if (!expireResult) {
                //   setErrorMessage(['認証番号の有効期限が切れています。']);
                //   setIsAuthDialogOpen(false);
                //   return;
                // }

                // setIsAuthDialogOpen(false);

                // TODO: 「ユーザーテーブル」に上記で作成した承認番号と承認番号の有効期限を削除（null）する処理に置き換える
                // const csrf = () => axios.get('/sanctum/csrf-cookie')
                // await csrf()
                // axios
                //   .delete('/user')
                //   .then((response) => {
                //     //console.log('認証番号を削除しました。');
                //     setAuthNumber('');
                //     router.push('/' + prevScreen);
                //   })
                //   .catch((error) => {
                //     // TODO: エラーハンドリング処理の置き換え
                //     setErrorMessage([
                //       'ユーザー情報の登録に失敗しました。ユーザーサポートにお問い合わせください。',
                //     ]);
                //   });
              }}
            >
              送信
            </CustomButton>
          </DialogActions>
        </Dialog>
        <div className='flex flex-col sm:flex-row sm:justify-start gap-[16px] w-full'>
          {/* 身長 */}
          <CustomTextField
            label='身長'
            type='number'
            readonly={mode === 'confirm'}
            required={false}
            isDecimal={true}
            value={formData.height?.toString()}
            placeHolder='180'
            onChange={(e) => {
              handleInputChange('height', e.target.value === '' ? null : e.target.value);
            }}
            displayHelp={mode === 'update'}
            inputAdorment={mode === 'confirm' && formData.height === null ? '-' : 'cm'}
            toolTipText='半角数字で入力してください。'
          />
          {/* 体重 */}
          <CustomTextField
            label='体重'
            type='number'
            isDecimal={true}
            readonly={mode === 'confirm'}
            required={false}
            value={formData.weight?.toString()}
            onChange={(e) => {
              handleInputChange('weight', e.target.value === '' ? null : e.target.value);
            }}
            placeHolder='80'
            displayHelp={mode === 'update'}
            toolTipText='半角数字で入力してください。'
            inputAdorment={mode === 'confirm' && formData.weight === null ? '-' : 'kg'}
          />
        </div>
      </div>
      <Divider className='h-[1px] bg-border' />
      <div className='flex flex-col items-center sm:flex-row sm:justify-center gap-[16px]'>
        {/* 戻るボタン */}
        <CustomButton
          buttonType='white-outlined'
          onClick={() => {
            setErrorMessage([]);
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
