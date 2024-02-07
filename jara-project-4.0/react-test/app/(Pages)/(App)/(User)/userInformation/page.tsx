// 機能名: ユーザー情報更新画面・入力確認画面
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// 実装　ー　クマール　ー開始
import axios from '@/app/lib/axios';
// 実装　ー　クマール　ー終了
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Validator from '@/app/utils/validator';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { UserResponse, PrefectureResponse, SexResponse, CountryResponse } from '@/app/types';

import {
  CustomDialog,
  CustomTextField,
  CustomDatePicker,
  CustomDropdown,
  CustomButton,
  InputLabel,
  ImageUploader,
  ErrorBox,
  CustomTitle,
} from '@/app/components';
import { useAuth } from '@/app/hooks/auth';

export default function UserInformationUpdate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const prevScreen = searchParams.get('prevScreen');
  const isMailChanged = searchParams.get('isMailChanged');
  let paramError = false;

  // フォームの入力値を管理するステート
  const [formData, setFormData] = useState<UserResponse>({
    user_id: '', // ユーザーID
    user_name: '', // ユーザー名
    date_of_birth: '', // 生年月日
    sexName: '', // 性別
    sex: 0, // 性別ID
    height: '', // 身長
    weight: '', // 体重
    residenceCountryName: '', // 居住地（国）
    residence_country: 0, // 居住地（国）ID
    residencePrefectureName: '', // 居住地（都道府県）
    residence_prefecture: 0, // 居住地（都道府県）ID
    mailaddress: '', // メールアドレス
    user_type: '', // ユーザー種別
    userTypeName: '', // ユーザー種別名
    temp_password_flag: false, // 仮登録フラグ
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

  const [countries, setCountries] = useState([] as CountryResponse[]);
  const [prefectures, setPrefectures] = useState([] as PrefectureResponse[]);
  const [sex, setSex] = useState([] as SexResponse[]);
  const [currentShowFile, setCurrentShowFile] = useState<{
    file: File;
    isUploaded: boolean;
    preview?: string;
  }>();
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailErrorMessages, setEmailErrorMessages] = useState([] as string[]);
  const [emailConfirmErrorMessages, setEmailConfirmErrorMessages] = useState([] as string[]);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authNumber, setAuthNumber] = useState('' as string);

  // 実装　ー　クマール　ー開始　
  const { user} = useAuth({ middleware: 'auth' }) //簡単にユーザー情報もらうため
  // 実装　ー　クマール　ー終了
  // フォームの入力値を管理する関数
  const handleInputChange = (name: string, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (formData.residence_country == 0) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        residencePrefectureId: 0,
        residencePrefectureName: '東京',
      }));
    }
  }, [formData.residence_country]);

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        // TODO: APIを叩いて、マスタ情報を取得する処理の置き換え
        // const prefectureResponse = await axios.get<PrefectureResponse[]>('http://localhost:3100/prefecture',);
        const prefectureResponse = await axios.get('http://localhost:8000/api/getPrefecures');
        const stateList = prefectureResponse.data.map(({ pref_id, pref_name }: { pref_id: number; pref_name: string }) => ({ id: pref_id, name: pref_name }));
        //console.log(stateList);
        setPrefectures(stateList);
        // setPrefectures(prefectureResponse.data);
        // const sexResponse = await axios.get<SexResponse[]>('http://localhost:3100/sex');
        const sexResponse = await axios.get('http://localhost:8000/api/getSexList');
        console.log(sexResponse.data);
        const sexList = sexResponse.data.map(({ sex_id, sex }: { sex_id: number; sex: string }) => ({ id: sex_id, name: sex }));
        setSex(sexList);
        // setSex(sexResponse.data);
        // const countryResponse = await axios.get<CountryResponse[]>('http://localhost:3100/countries',);
        const countryResponse = await axios.get('http://localhost:8000/api/getCountries');
        const countryList = countryResponse.data.map(({ country_id, country_name }: { country_id: number; country_name: string }) => ({ id: country_id, name: country_name }));
        setCountries(countryList);
        // setCountries(countryResponse.data);

      } catch (error: any) {
        setErrorMessage(['API取得エラー:' + error.message]);
      }
    };
    fetchMaster();
  }, []);

  // ユーザー情報のセットアップ
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // const response = await axios.get<UserResponse>('http://localhost:3100/user');
        // console.log("User : ", user);
        // 実装　ー　クマール　ー開始
        const csrf = () => axios.get('/sanctum/csrf-cookie')
        await csrf()
        const response = await axios.get('/getUserData');
        // 実装　ー　クマール　ー終了
        console.log(response.data.result);
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...{
            userId: response.data.result.user_id,
            userName: response.data.result.user_name,
            userType: response.data.result.user_type,
            userTypeName: "",//response.data.result.userTypeName,
            dateOfBirth: response.data.result.date_of_birth,
            sexName: '男性',//response.data.result.sexName ? response.data.sexName : '男性',
            sexId: response.data.result.sex,
            height: response.data.result.height,
            weight: response.data.result.weight,
            residenceCountryId: response.data.result.residence_country,
            residenceCountryName: 0//response.data.result.residenceCountryName
              ? response.data.result.residenceCountryName
              : '日本',
            residencePrefectureId: response.data.result.residence_prefecture,
            residencePrefectureName: "",//response.data.result.residencePrefectureName,
            email: response.data.result.mailaddress,
            tempPasswordFlag: response.data.result.temp_password_flag,
            photo: response.data.result.photo,
          },
        }));
        setPrevEmail(response.data.result.mailaddress);
      } catch (error: any) {
        setErrorMessage(['API取得エラー:' + error.message]);
      }
    };
    // 更新モードの時にユーザー情報を取得し、フォームにセットする。
    if (mode === 'update') {
      fetchUser();
    }
    // APIを叩いて、ユーザー情報を取得する
  }, []);

  const modeCustomButtons = {
    update: (
      <CustomButton
        buttonType='primary'
        className='w-[200px]'
        onClick={() => {
          const userNameError = Validator.getErrorMessages([
            Validator.validateRequired(formData.user_name, 'ユーザー名'),
            Validator.validateUserNameFormat(formData.user_name),
          ]);

          const sexError = Validator.getErrorMessages([
            Validator.validateRequired(formData.sexName, '性別'),
          ]);

          const livingCountryError = Validator.getErrorMessages([
            Validator.validateRequired(formData.residenceCountryName, '居住地'),
          ]);

          const livingPrefectureError = Validator.getErrorMessages([
            Validator.validateRequired(formData.residencePrefectureName, '居住地'),
          ]);

          const dateOfBirthError = Validator.getErrorMessages([
            Validator.validateRequired(formData.date_of_birth, '生年月日'),
            Validator.validateBirthOfDateRange(new Date(formData.date_of_birth), '生年月日', 5, 150),
          ]);

          setUserNameErrorMessages(userNameError as string[]);
          setSexErrorMessages(sexError as string[]);
          setLivingCountryErrorMessages(livingCountryError as string[]);
          setLivingPrefectureErrorMessages(livingPrefectureError as string[]);
          setDateOfBirthErrorMessages(dateOfBirthError as string[]);

          if (
            userNameError.length > 0 ||
            sexError.length > 0 ||
            livingCountryError.length > 0 ||
            livingPrefectureError.length > 0 ||
            dateOfBirthError.length > 0
          ) {
            return;
          }
          router.push(
            '/userInformation?mode=confirm&isMailChanged=' +
              (email && email !== formData.mailaddress ? 'true' : 'false') +
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
        className='w-[200px]'
        onClick={() => {
          // TODO: 更新処理
          if (isMailChanged === 'true') {
            const isOK = window.confirm(
              'メールアドレスが変更されている為、表示されているメールアドレス宛に6桁の認証番号が送られます。メール本文に記載されている認証番号を入力してください。※認証番号の有効期限は30分間です。',
            );

            if (isOK) {
              // 6桁の整数をランダム生成する
              const getRandomInt = (min: number, max: number) => {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
              };
              // TODO: 「ユーザーテーブル」に作成した承認番号と承認番号の有効期限を登録する※既に登録されている場合は、上書きする
              console.log('承認番号：' + getRandomInt(100000, 999999));
              // 有効期限は30分後
              const expireDateTime = new Date();
              expireDateTime.setMinutes(expireDateTime.getMinutes() + 30);
              console.log('有効期限：' + expireDateTime.toLocaleString('ja-JP'));

              // TODO: 変更後のメールアドレス宛に「「2.-①-ⅰ-b1-1」で作成した6桁の整数」を通知する。メールの内容は、シート「補足」の「認証番号通知メール」を参照
              if (isMailChanged) {
              }
              console.log(email + 'あてにメールを送信しました。');
              // TODO: 認証番号入力用のダイアログをモーダルで表示する。
              setIsAuthDialogOpen(true);
            }
          } else {
            // 「ユーザーテーブル」に上記で作成した承認番号と承認番号の有効期限を削除（null）する。
            console.log('認証番号を削除しました。');
            // TODO: エラーハンドリングはサーバとの疎通実装時、axiosでcatchするため、以下は置き換え
            const requestBody = {};
            axios
              // .post('http://localhost:3100/', requestBody)
              .post('http://localhost:8000/api/updateUserData',requestBody)
              .then((response) => {
                // 成功時の処理を実装
                window.confirm('ユーザー情報を更新しました。');
                router.push('/' + (prevScreen ? prevScreen : ''));
              })
              .catch((error) => {
                setErrorMessage([
                  'ユーザー情報の登録に失敗しました。ユーザーサポートにお問い合わせください。',
                ]);
              });
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

  // モードが不正の時にエラー画面を表示する
  if (paramError) {
    return <div>ページが見つかりません</div>;
  }
  return (
    <main className='flex min-h-screen flex-col justify-start p-[10px] m-auto gap-[46px] my-[80px]'>
      <div className='flex flex-col justify-start gap-[20px]'>
        <ErrorBox errorText={errorMessage} />
        <div className='flex flex-row justify-start gap-[20px]'>
          {/* 画面名 */}
          <CustomTitle isCenter={false} displayBack>
            {mode === 'update' && 'ユーザー情報更新'}
            {mode === 'confirm' && 'ユーザー情報確認'}
          </CustomTitle>
        </div>
        <div className='flex flex-col justify-start gap-[10px]'>
          {/* 写真 */}
          <InputLabel required displayHelp label='写真' />
          {mode === 'update' && (
            <ImageUploader
              currentShowFile={currentShowFile}
              setCurrentShowFile={setCurrentShowFile}
              initialPhotoUrl={formData.photo}
            />
          )}
          {/* 写真 */}
          {mode === 'confirm' && (
            <img src={formData.photo} className='w-[300px] h-[300px] rounded-[2px] object-cover' />
          )}
        </div>
        {/* ユーザーID */}
        <CustomTextField
          label='ユーザーID'
          readonly
          value={formData.user_id}
          displayHelp={false}
          placeHolder='XXXXXXX'
        />
        {/* ユーザー種別 */}
        <CustomTextField
          label='ユーザー種別'
          readonly
          placeHolder='XXXXXXX'
          value={formData.userTypeName}
          displayHelp={false}
        />
        {/* ユーザー名 */}
        <CustomTextField
          label='ユーザー名'
          placeHolder='山田 太郎'
          readonly={mode === 'confirm'}
          onChange={(e) => {
            handleInputChange('user_name', e.target.value);
          }}
          errorMessages={[...userNameErrorMessages]}
          isError={userNameErrorMessages.length > 0}
          displayHelp={mode === 'update'}
          required={mode === 'update'}
          value={formData.user_name}
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
            value={formData.mailaddress}
            onChange={() => {
              handleInputChange('mailaddress', '');
            }}
          />
          {!formData.temp_password_flag && mode == 'update' && (
            <div className='mt-auto'>
              <CustomDialog
                className='w-[120px] '
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
                    setPrevEmail(formData.mailaddress);
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      email: email,
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
                    label='メールアドレス'
                    errorMessages={emailErrorMessages}
                    isError={emailErrorMessages.length > 0}
                    value={email}
                    required
                    displayHelp={false}
                    placeHolder='メールアドレスを入力してください。'
                    type='email'
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                  {/* メールアドレス確認 */}
                  <CustomTextField
                    label='メールアドレス確認 '
                    errorMessages={emailConfirmErrorMessages}
                    required
                    isError={emailConfirmErrorMessages.length > 0}
                    displayHelp={false}
                    value={confirmEmail}
                    placeHolder='確認のためにもう一度メールアドレスを入力してください。'
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
          <InputLabel label='性別' required={mode === 'update'} />
          <CustomDropdown
            id='性別'
            value={mode !== 'confirm' ? formData.sex?.toString() || '' : formData.sexName}
            options={sex.map((item) => ({ key: item.id, value: item.name }))}
            placeHolder='男性'
            className='w-[200px]'
            readonly={mode === 'confirm'}
            onChange={(e) => {
              handleInputChange('sex', e);
              handleInputChange('sexName', sex.find((item) => item.id === Number(e))?.name || '');
            }}
            errorMessages={sexErrorMessages}
          />
        </div>
        <div className='flex flex-col justify-start gap-[10px]'>
          {/* 生年月日 */}
          <InputLabel label='生年月日' displayHelp={mode === 'update'} />
          <CustomDatePicker
            readonly={mode === 'confirm'}
            selectedDate={formData.date_of_birth}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleInputChange('date_of_birth', formatDate(e as unknown as Date));
            }}
            maxDate={new Date()}
            errorMessages={dateOfBirthErrorMessages}
          />
        </div>
        <div className='flex flex-row justify-start gap-[16px]'>
          <div className='flex flex-col justify-start'>
            {/* 居住地（国） */}
            <InputLabel label='居住地' required={mode === 'update'} />
            <CustomDropdown
              id='residenceCountry'
              readonly={mode === 'confirm'}
              options={countries.map((item) => ({ key: item.id, value: item.name })) || []}
              placeHolder='日本'
              value={
                mode !== 'confirm'
                  ? formData.residence_prefecture?.toString() || ''
                  : formData.residenceCountryName
              }
              onChange={(e) => {
                handleInputChange('residence_country', e);
                handleInputChange(
                  'residenceCountryName',
                  countries.find((item) => item.id === Number(e))?.name || '',
                );
              }}
              errorMessages={livingCountryErrorMessages}
              className='w-[300px] '
            />
          </div>
          {/* 居住地（都道府県） */}
          {formData.residenceCountryName === '日本' && (
            <div className='flex flex-col justify-start'>
              <InputLabel label='都道府県' required={mode === 'update'} />
              <CustomDropdown
                id='residencePrefecture'
                readonly={mode === 'confirm'}
                options={prefectures.map((item) => ({ key: item.id, value: item.name })) || []}
                value={
                  mode !== 'confirm'
                    ? formData.residence_prefecture?.toString() || ''
                    : formData.residencePrefectureName
                }
                placeHolder='東京'
                onChange={(e) => {
                  handleInputChange('residencePrefectureId', e);
                  handleInputChange(
                    'residencePrefectureName',
                    prefectures.find((item) => item.id === Number(e))?.name || '',
                  );
                }}
                className='w-[300px]'
                errorMessages={livingPrefectureErrorMessages}
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
          </DialogContent>
          <DialogActions>
            <CustomButton
              buttonType='white-outlined'
              className='w-[200px]'
              onClick={() => {
                setIsAuthDialogOpen(false);
                setAuthNumber('');
              }}
            >
              キャンセル
            </CustomButton>
            <CustomButton
              buttonType='primary'
              className='w-[200px]'
              onClick={() => {
                // 認証処理。認証番号が入力されていない場合はバリデーションエラーを表示する。
                if (!authNumber) {
                  setErrorMessage(['認証番号を入力してください。']);
                  setIsAuthDialogOpen(false);
                  return;
                }

                const verifyResult = () => {
                  // TODO: 「ユーザーテーブル」の当該ユーザーの「メールアドレス変更認証番号」に登録されている数字と一致することを確認する処理に置き換え
                  true;
                };
                if (!verifyResult) {
                  setErrorMessage(['認証番号が不正です。']);
                  setIsAuthDialogOpen(false);
                  return;
                }
                const expireResult = () => {
                  // TODO: 当該認証番号の有効期限切れていないことを確認する処理に置き換え
                  true;
                };
                if (!expireResult) {
                  setErrorMessage(['認証番号の有効期限が切れています。']);
                  setIsAuthDialogOpen(false);
                  return;
                }

                setIsAuthDialogOpen(false);

                // TODO: 「ユーザーテーブル」に上記で作成した承認番号と承認番号の有効期限を削除（null）する処理に置き換える
                axios
                  .delete('http://localhost:3100/user')
                  .then((response) => {
                    console.log('認証番号を削除しました。');
                    setAuthNumber('');
                    router.push('/' + prevScreen);
                  })
                  .catch((error) => {
                    // TODO: エラーハンドリング処理の置き換え
                    setErrorMessage([
                      'ユーザー情報の登録に失敗しました。ユーザーサポートにお問い合わせください。',
                    ]);
                  });
              }}
            >
              送信
            </CustomButton>
          </DialogActions>
        </Dialog>
        <div className='flex flex-row justify-start gap-[16px]'>
          {/* 身長 */}
          <CustomTextField
            label='身長'
            type='number'
            readonly={mode === 'confirm'}
            required={false}
            value={formData.height}
            placeHolder='180'
            onChange={(e) => {
              handleInputChange('height', e.target.value);
            }}
            displayHelp={mode === 'update'}
            inputAdorment='cm'
          />
          {/* 体重 */}
          <CustomTextField
            label='体重'
            type='number'
            readonly={mode === 'confirm'}
            required={false}
            value={formData.weight}
            onChange={(e) => {
              handleInputChange('weight', e.target.value);
            }}
            placeHolder='80'
            displayHelp={mode === 'update'}
            inputAdorment='kg'
          />
        </div>
      </div>
      <Divider className='w-[900px] h-[1px] bg-border' />
      <div className='flex flex-row justify-center gap-[16px]'>
        {/* 戻るボタン */}
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
