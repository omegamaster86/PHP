// 機能名: 選手情報登録・更新・入力確認
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import {
  CustomDropdown,
  CustomDatePicker,
  OriginalCheckbox,
  CustomButton,
  CustomTextField,
  InputLabel,
  ErrorBox,
  CustomTitle,
  ImageUploader,
} from '@/app/components';
import Validator from '@/app/utils/validator';
import {
  CountryResponse,
  PrefectureResponse,
  SexResponse,
  PlayerInformationResponse,
} from '@/app/types';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

export default function PlayerInformation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // modeの値を取得 update, create
  const mode = searchParams.get('mode');
  switch (mode) {
    case 'update':
      break;
    case 'create':
      break;
    case 'confirm':
      break;
    default:
      // TODO: 404エラーの表示処理に切り替え
      router.push('/playerInformation?mode=create');
      break;
  }
  const prevMode = searchParams.get('prevMode');
  switch (prevMode) {
    case 'update':
      break;
    case 'create':
      break;
    case 'delete':
      break;
    default:
      // TODO: 404エラーの表示処理に切り替え
      break;
  }

  // フォームの入力値を管理する関数
  const handleInputChange = (name: string, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
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

  const [formData, setFormData] = useState<PlayerInformationResponse>({
    playerId: 0,
    jaraPlayerCode: '',
    playerName: '',
    sexName: '',
    sexId: 0,
    height: '',
    weight: '',
    birthCountryId: 0,
    birthCountryName: '日本国 （jpn）',
    birthPrefectureId: 0,
    birthPrefectureName: '東京',
    residenceCountryId: 0,
    residenceCountryName: '日本国 （jpn）',
    residencePrefectureId: 0,
    residencePrefectureName: '東京',
    dateOfBirth: '',
    sideInfo: [false, false, false, false],
    photo: '',
  });

  const [jaraPlayerCodeErrorMessage, setJaraPlayerCodeErrorMessage] = useState([] as string[]);
  const [playerNameErrorMessage, setPlayerNameErrorMessage] = useState([] as string[]);
  const [dateOfBirthErrorMessage, setDateOfBirthErrorMessage] = useState([] as string[]);
  const [sexErrorMessage, setSexErrorMessage] = useState([] as string[]);
  const [heightErrorMessage, setHeightErrorMessage] = useState([] as string[]);
  const [weightErrorMessage, setWeightErrorMessage] = useState([] as string[]);
  const [birthCountryNameErrorMessage, setbirthCountryNameErrorMessage] = useState([] as string[]);
  const [birthPlacePrefectureErrorMessage, setBirthPlacePrefectureErrorMessage] = useState(
    [] as string[],
  );
  const [residenceCountryNameErrorMessage, setResidenceCountryNameErrorMessage] = useState(
    [] as string[],
  );
  const [residencePrefectureErrorMessage, setresidencePrefectureErrorMessage] = useState(
    [] as string[],
  );
  const [sideInfoErrorMessage, setSideInfoErrorMessage] = useState([] as string[]);
  const [countries, setCountries] = useState<CountryResponse[]>([]);
  const [prefectures, setPrefectures] = useState<PrefectureResponse[]>([]);
  const [sex, setSex] = useState<SexResponse[]>([]);
  const [currentShowFile, setCurrentShowFile] = useState<{
    file: File;
    isUploaded: boolean;
    preview?: string;
  }>();
  const [errorMessage, setErrorMessage] = useState([] as string[]);

  // 選手情報登録・更新・入力確認画面の「居住地（国）」が「日本」の場合、「居住地（都道府県）」を「東京」で設定する
  useEffect(() => {
    // 居住地（国）が日本（=0）の時
    if (formData.residenceCountryId == 0) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        residencePrefectureId: 0, // 東京
        residencePrefectureName: '東京',
      }));
    }
  }, [formData.residenceCountryId]);

  // 選手情報登録・更新・入力確認画面の「出身地（国）」が「日本」の場合、「出身地（都道府県）」を「東京」で設定する
  useEffect(() => {
    if (formData.birthCountryId == 0) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        birthPrefectureId: 0,
        birthPrefectureName: '東京',
      }));
    }
  }, [formData.birthCountryId]);

  // 更新モードの時に、選手情報を取得する
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        // TODO: 都道府県情報の取得処理を実装
        axios
          //20240123 DBからデータ取得
          // .get<PrefectureResponse[]>('http://localhost:3100/prefecture')
          .get('http://localhost:8000/api/getPrefecures')
          .then((response) => {
            const stateList = response.data.map(({ pref_id, pref_name }: { pref_id: number; pref_name: string }) => ({ id: pref_id, name: pref_name }));
            //console.log(stateList);
            setPrefectures(stateList);
            // setPrefectures(response.data);
          })
          .catch((error) => {
            // TODO: 個別エラー処理を実装
            setErrorMessage([
              ...(errorMessage as string[]),
              'API取得エラー:' + (error as Error).message,
            ]);
          });
        // TODO: 性別の取得処理を実装
        axios
          // .get<SexResponse[]>('http://localhost:3100/sex')
          .get('http://localhost:8000/api/getSexList') //20240123 DBからデータ取得
          .then((response) => {
            console.log(response.data);
            const sexList = response.data.map(({ sex_id, sex }: { sex_id: number; sex: string }) => ({ id: sex_id, name: sex }));
            setSex(sexList);
          })
          .catch((error) => {
            // TODO: 個別エラー処理を実装
            setErrorMessage([
              ...(errorMessage as string[]),
              'API取得エラー:' + (error as Error).message,
            ]);
          });
        // TODO: 国の取得処理を実装
        axios
          //20240123 DBからデータ取得
          // .get<CountryResponse[]>('http://localhost:3100/countries')
          .get('http://localhost:8000/api/getCountries')
          .then((response) => {
            const countryList = response.data.map(({ country_id, country_name }: { country_id: number; country_name: string }) => ({ id: country_id, name: country_name }));
            setCountries(countryList);
            // setCountries(response.data);
          })
          .catch((error) => {
            // TODO: 個別エラー処理を実装
            setErrorMessage([
              ...(errorMessage as string[]),
              'API取得エラー:' + (error as Error).message,
            ]);
          });
      } catch (error: any) {
        setErrorMessage(['API取得エラー:' + error.message]);
      }
    };
    fetchMaster();

    if (mode === 'update') {
      // TODO: 選手情報を取得する処理を実装
      // searchParams.get('id')から選手IDを取得
      axios
        .get<PlayerInformationResponse>('http://localhost:3100/player')
        .then((response) => {
          // nameプロパティのみ抜き出してstringの配列に変換
          setFormData((prevFormData) => ({
            ...prevFormData,
            ...{
              playerId: response.data.playerId, // 選手ID
              jaraPlayerCode: response.data.jaraPlayerCode, // JARA選手コード
              playerName: response.data.playerName, // 選手名
              sexName: response.data.sexName, // 性別
              sexId: response.data.sexId, // 性別
              height: response.data.height, // 身長
              weight: response.data.weight, // 体重
              birthCountryName: response.data.birthCountryName, // 出身地（国）
              birthCountryId: response.data.birthCountryId, // 出身地（国）
              birthPrefectureName: response.data.birthPrefectureName, // 出身地（都道府県）
              birthPrefectureId: response.data.birthPrefectureId, // 出身地（都道府県）
              residenceCountryName: response.data.residenceCountryName, // 居住地（国）
              residenceCountryId: response.data.residenceCountryId, // 居住地（国）
              residencePrefectureName: response.data.residencePrefectureName, // 居住地（都道府県）
              residencePrefectureId: response.data.residencePrefectureId, // 居住地（都道府県）
              dateOfBirth: response.data.dateOfBirth, // 生年月日
              sideInfo: response.data.sideInfo, // サイド情報
            },
          }));
        })
        .catch((error) => {
          // TODO: エラー処理を実装
          setErrorMessage([
            ...(errorMessage as string[]),
            'API取得エラー:' + (error as Error).message,
          ]);
        });
    }
    // APIを叩いて、選手情報を取得する
  }, []);

  /**
   * 入力チェック
   * @returns {boolean} エラーがある場合はtrue、ない場合はfalse
   */
  const validate = () => {
    // JARA選手コードの入力チェック
    const jaraPlayerCodeError = Validator.getErrorMessages([
      Validator.validatePlayerIdFormat(formData.jaraPlayerCode.toString()),
    ]);

    // 選手名の入力チェック
    const playerNameError = Validator.getErrorMessages([
      Validator.validateSelectRequired(formData.playerName, '選手名'),
      Validator.validateLength(formData.playerName, '選手名', 50),
      Validator.validatePlayerNameFormat(formData.playerName),
    ]);

    // サイド情報の入力チェック
    const sideInfoError = Validator.getErrorMessages([
      Validator.validateSideInfoIsInput(formData.sideInfo),
    ]);

    // 生年月日の入力チェック
    const dateOfBirthError = Validator.getErrorMessages([
      Validator.validateSelectRequired(formData.dateOfBirth, '生年月日'),
    ]);

    // 性別の入力チェック
    const sexError = Validator.getErrorMessages([
      Validator.validateSelectRequired(formData.sexName, '性別'),
    ]);

    // 身長の入力チェック
    const heightError = Validator.getErrorMessages([
      Validator.validateSelectRequired(formData.height, '身長'),
      Validator.validateWeightAndHeightFormat(Number(formData.height), '身長'),
    ]);

    // 体重の入力チェック
    const weightError = Validator.getErrorMessages([
      Validator.validateSelectRequired(formData.weight, '体重'),
      Validator.validateWeightAndHeightFormat(Number(formData.weight), '体重'),
    ]);

    // 出身地（国）の入力チェック
    const birthCountryNameError = Validator.getErrorMessages([
      Validator.validateSelectRequired(formData.birthCountryName, '出身地（国）'),
    ]);

    // 出身地（都道府県）の入力チェック
    const birthPlacePrefectureError = Validator.getErrorMessages([
      formData.birthCountryName.includes('日本')
        ? Validator.validateSelectRequired(formData.birthPrefectureName, '出身地（都道府県）')
        : '',
    ]);

    // 居住地（国）の入力チェック
    const residenceCountryNameError = Validator.getErrorMessages([
      Validator.validateSelectRequired(formData.residenceCountryName, '居住地（国）'),
    ]);

    // 居住地（都道府県）の入力チェック
    const livingPrefectureError = Validator.getErrorMessages([
      formData.residenceCountryName.includes('日本')
        ? Validator.validateSelectRequired(formData.residencePrefectureName, '居住地（都道府県）')
        : '',
    ]);

    // エラーメッセージを設定
    setJaraPlayerCodeErrorMessage(jaraPlayerCodeError);
    setPlayerNameErrorMessage(playerNameError);
    setSideInfoErrorMessage(sideInfoError);
    setDateOfBirthErrorMessage(dateOfBirthError);
    setHeightErrorMessage(heightError);
    setWeightErrorMessage(weightError);
    setSexErrorMessage(sexError);
    setbirthCountryNameErrorMessage(birthCountryNameError);
    setBirthPlacePrefectureErrorMessage(birthPlacePrefectureError);
    setResidenceCountryNameErrorMessage(residenceCountryNameError);
    setresidencePrefectureErrorMessage(livingPrefectureError);

    // エラーがある場合、後続の処理を中止
    if (
      jaraPlayerCodeError.length > 0 ||
      playerNameError.length > 0 ||
      sideInfoError.length > 0 ||
      dateOfBirthError.length > 0 ||
      heightError.length > 0 ||
      weightError.length > 0 ||
      sexError.length > 0 ||
      birthCountryNameError.length > 0 ||
      birthPlacePrefectureError.length > 0 ||
      residenceCountryNameError.length > 0 ||
      livingPrefectureError.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  };

  // モードに応じたボタンの設定
  const modeCustomButtons = {
    create: (
      <CustomButton
        buttonType='primary'
        onClick={() => {
          const isError = validate();
          if (isError) {
            return;
          }
          router.push('/playerInformation?mode=confirm&prevMode=create');
        }}
      >
        確認
      </CustomButton>
    ),
    update: (
      <CustomButton
        buttonType='primary'
        onClick={() => {
          const isError = validate();
          if (isError) {
            return;
          }
          router.push('/playerInformation?mode=confirm&prevMode=update');
        }}
      >
        確認
      </CustomButton>
    ),
    confirm: (
      <CustomButton
        buttonType='primary'
        onClick={() => {
          if (prevMode == 'update') {
            // TODO: 更新処理を実装
            const registerData = {};
            axios
              // .post('http://localhost:3100/', registerData)
              .post('http://localhost:8000/api/storePlayerTest', formData) //20240123 送信テスト
              .then((response) => {
                // TODO: 更新処理成功時の処理
                console.log(response);
              })
              .catch((error) => {
                // TODO: 更新処理失敗時の処理
                setErrorMessage([
                  ...(errorMessage as string[]),
                  '更新に失敗しました。原因：' + (error as Error).message,
                ]);
              });
          } else if (prevMode == 'create') {
            // TODO: 登録処理を実装
            const registerData = {};
            axios
              // .post('http://localhost:3100/', registerData)
              .post('http://localhost:8000/api/storePlayerTest', formData) //20240123 送信テスト
              .then((response) => {
                // TODO: 登録処理成功時の処理の実装
                console.log(response);
              })
              .catch((error) => {
                // TODO: 登録処理失敗時の処理の実装
                setErrorMessage([
                  ...(errorMessage as string[]),
                  '登録に失敗しました。原因：' + (error as Error).message,
                ]);
              });
          }
        }}
      >
        {prevMode === 'update' && '更新'}
        {prevMode === 'create' && '登録'}
      </CustomButton>
    ),
  };

  return (
    <div>
      <main className='flex min-h-screen flex-col justify-start p-[10px] m-auto gap-[20px] my-[80px]'>
        <div className='relative flex flex-row justify-between w-full h-screen flex-wrap'>
          {/* 画面名*/}
          <CustomTitle isCenter={false} displayBack>
            選手情報{mode === 'create' ? '登録' : mode === 'update' ? '更新' : '入力確認'}
          </CustomTitle>
        </div>
        {/* エラーメッセージの表示 */}
        <ErrorBox errorText={errorMessage} />
        <div className='flex flex-col justify-start'>
          {/* TODO: tooltipの表示内容は仕様が決まり次第置き換える */}
          {/* 写真 */}
          <InputLabel
            label='写真'
            displayHelp={mode !== 'confirm'}
            toolTipTitle='Title'
            toolTipText='サンプル用のツールチップ表示'
          />
          <div className='flex flex-row justify-start gap-[4px]'>
            {mode !== 'confirm' && (
              <div>
                <ImageUploader
                  currentShowFile={currentShowFile}
                  setCurrentShowFile={setCurrentShowFile}
                />
                {/* 写真削除ボタン */}
                <CustomButton
                  buttonType='white-outlined'
                  className='secondary mt-[20px] rounded border-[1px] border-solid border-borde text-primaryText h-12 w-[150px]'
                  onClick={() => {
                    // TODO: アップロードされた写真を削除する処理に置き換える
                    setCurrentShowFile(undefined);
                  }}
                >
                  <DeleteOutlinedIcon className='mr-[5px] text-[20px]' />
                  写真削除
                </CustomButton>
              </div>
            )}
            {mode === 'confirm' && (
              <div className='relative'>
                {/* 写真 */}
                <img
                  className='object-cover w-[320px] h-[320px] rounded-[2px]'
                  src={currentShowFile?.preview}
                  // Revoke data uri after image is loaded
                  onLoad={() => { }}
                />
              </div>
            )}
          </div>
        </div>
        {/* 選手ID */}
        {mode !== 'create' && prevMode === 'update' && (
          <CustomTextField
            label='選手ID'
            isError={false}
            errorMessages={[]}
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            readonly
            value={formData.playerId?.toString()}
            onChange={(e) => handleInputChange('playerId', e.target.value)}
          />
        )}
        <div className='flex flex-col justify-start'>
          {/* JARA選手コード */}
          <CustomTextField
            label='JARA選手コード'
            type='number'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            isError={jaraPlayerCodeErrorMessage.length > 0}
            placeHolder='123456789012'
            readonly={mode === 'confirm'}
            errorMessages={jaraPlayerCodeErrorMessage}
            value={formData.jaraPlayerCode?.toString()}
            onChange={(e) => handleInputChange('jaraPlayerCode', e.target.value)}
          />
        </div>
        <div className='flex flex-col justify-start'>
          {/* 選手名 */}
          <CustomTextField
            label='選手名'
            isError={playerNameErrorMessage.length > 0}
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            errorMessages={playerNameErrorMessage}
            placeHolder='山田 太郎'
            readonly={mode === 'confirm'}
            value={formData.playerName}
            onChange={(e) => handleInputChange('playerName', e.target.value)}
          />
        </div>
        <div className='flex flex-col justify-start'>
          {/* 生年月日 */}
          <InputLabel
            label='生年月日'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
          />
          <CustomDatePicker
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleInputChange('dateOfBirth', formatDate(e as unknown as Date));
            }}
            readonly={mode === 'confirm'}
            selectedDate={formData.dateOfBirth}
            maxDate={new Date()}
            errorMessages={dateOfBirthErrorMessage}
          />
        </div>
        <div className='flex flex-col justify-start'>
          {/* 性別 */}
          <InputLabel label='性別' required={mode !== 'confirm'} displayHelp={mode !== 'confirm'} />
          <CustomDropdown
            id='sex'
            readonly={mode === 'confirm'}
            options={sex.map((item) => ({ key: item.id, value: item.name }))}
            value={mode !== 'confirm' ? formData.sexId?.toString() || '' : formData.sexName}
            errorMessages={sexErrorMessage}
            placeHolder='未選択'
            onChange={(e) => {
              handleInputChange('sexId', e);
              handleInputChange('sexName', sex.find((item) => item.id === Number(e))?.name || '');
            }}
            className='rounded w-[300px] '
          />
        </div>
        <div className='flex flex-col justify-start'>
          {/* 身長 */}
          <CustomTextField
            label='身長'
            readonly={mode === 'confirm'}
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            isError={heightErrorMessage.length > 0}
            errorMessages={heightErrorMessage}
            type='number'
            placeHolder='180.00'
            inputAdorment='cm'
            value={formData.height?.toString()}
            onChange={(e) => handleInputChange('height', e.target.value)}
          />
        </div>
        <div className='flex flex-col justify-start'>
          {/* 体重 */}
          <CustomTextField
            label='体重'
            readonly={mode === 'confirm'}
            isError={weightErrorMessage.length > 0}
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            placeHolder='80.00'
            errorMessages={weightErrorMessage}
            type='number'
            inputAdorment='kg'
            value={formData.weight?.toString()}
            onChange={(e) => handleInputChange('weight', e.target.value)}
          />
        </div>
        <div className='flex flex-col justify-start'>
          {/* サイド情報 */}
          <InputLabel
            label='サイド情報'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
          />
          <div className='flex justify-start flex-col gap-[4px] my-1'>
            <OriginalCheckbox
              id='checkbox-S'
              readonly={mode === 'confirm'}
              label=': S (ストロークサイド)'
              value='S'
              checked={formData.sideInfo?.at(0) ?? false}
              onChange={() =>
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  sideInfo: [
                    !prevFormData.sideInfo[0],
                    prevFormData.sideInfo[1],
                    prevFormData.sideInfo[2],
                    prevFormData.sideInfo[3],
                  ],
                })) as void
              }
            />
            <OriginalCheckbox
              id='checkbox-B'
              readonly={mode === 'confirm'}
              label=': B (バウサイド)'
              value='B'
              checked={formData.sideInfo?.at(1) as boolean}
              onChange={() =>
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  sideInfo: [
                    prevFormData.sideInfo[0],
                    !prevFormData.sideInfo[1],
                    prevFormData.sideInfo[2],
                    prevFormData.sideInfo[3],
                  ],
                })) as void
              }
            />
            <OriginalCheckbox
              id='checkbox-X'
              label=': X (スカル)'
              value='X'
              readonly={mode === 'confirm'}
              checked={formData.sideInfo?.at(2) as boolean}
              onChange={() =>
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  sideInfo: [
                    prevFormData.sideInfo[0],
                    prevFormData.sideInfo[1],
                    !prevFormData.sideInfo[2],
                    prevFormData.sideInfo[3],
                  ],
                })) as void
              }
            />
            <OriginalCheckbox
              id='checkbox-C'
              label=': C (コックス)'
              readonly={mode === 'confirm'}
              value='C'
              checked={formData.sideInfo?.at(3) as boolean}
              onChange={() =>
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  sideInfo: [
                    prevFormData.sideInfo[0],
                    prevFormData.sideInfo[1],
                    prevFormData.sideInfo[2],
                    !prevFormData.sideInfo[3],
                  ],
                })) as void
              }
            />
          </div>
          {/* エラーメッセージ */}
          <p className='text-caption1 text-systemErrorText'>{sideInfoErrorMessage}</p>
        </div>
        <div className='flex flex-row justify-start gap-[100px]'>
          <div className='flex flex-col justify-start'>
            {/* 出身地（国） */}
            <InputLabel
              label='出身地'
              required={mode !== 'confirm'}
              displayHelp={mode !== 'confirm'}
            />
            <CustomDropdown
              id='birthCountry'
              readonly={mode === 'confirm'}
              options={countries.map((item) => ({ key: item.id, value: item.name }))}
              value={
                mode !== 'confirm'
                  ? formData.birthCountryId?.toString() || ''
                  : formData.birthCountryName
              }
              errorMessages={birthCountryNameErrorMessage}
              placeHolder='未選択'
              onChange={(e) => {
                handleInputChange('birthCountryId', e);
                handleInputChange(
                  'birthCountryName',
                  countries.find((item) => item.id === Number(e))?.name || '',
                );
              }}
              className='rounded w-[300px] '
            />
          </div>
          {formData.birthCountryName.includes('日本') && (
            <div className='flex flex-col justify-start'>
              {/* 出身地（都道府県） */}
              <InputLabel
                label='都道府県'
                required={mode !== 'confirm'}
                displayHelp={mode !== 'confirm'}
              />
              <CustomDropdown
                id='birthPrefecture'
                //20240123 DBから取得したデータの表示
                // options={prefectures.map((item) => ({ key: item.id, value: item.name }))}
                options={prefectures.map(({ id, name }) => ({ key: id, value: name }))} //都道府県のnameだけをリストにして表示 20240117
                readonly={mode === 'confirm'}
                value={
                  mode !== 'confirm'
                    ? formData.birthPrefectureId?.toString() || ''
                    : formData.birthPrefectureName
                }
                onChange={(e) => {
                  handleInputChange('birthPrefectureId', e);
                  handleInputChange(
                    'birthPrefectureName',
                    prefectures.find((item) => item.id === Number(e))?.name || '',
                  );
                }}
                errorMessages={birthPlacePrefectureErrorMessage}
                className='rounded w-[300px] '
              />
            </div>
          )}
        </div>
        <div className='flex flex-row justify-start gap-[100px]'>
          <div className='flex flex-col justify-start'>
            {/* 居住地（国） */}
            <InputLabel
              label='居住地'
              required={mode !== 'confirm'}
              displayHelp={mode !== 'confirm'}
            />
            <CustomDropdown
              id='residenceCountry'
              options={countries.map((item) => ({ key: item.id, value: item.name }))}
              value={
                mode !== 'confirm'
                  ? formData.residenceCountryId?.toString() || ''
                  : formData.residenceCountryName
              }
              readonly={mode === 'confirm'}
              onChange={(e) => {
                handleInputChange('residenceCountryId', e);
                handleInputChange(
                  'residenceCountryName',
                  countries.find((item) => item.id === Number(e))?.name || '',
                );
              }}
              errorMessages={residenceCountryNameErrorMessage}
              className='rounded w-[300px] '
            />
          </div>
          {formData.residenceCountryName.includes('日本') && (
            <div className='flex flex-col justify-start'>
              {/* 居住地（都道府県） */}
              <InputLabel
                label='都道府県'
                required={mode !== 'confirm'}
                displayHelp={mode !== 'confirm'}
              />
              <CustomDropdown
                id='residencePrefecture'
                readonly={mode === 'confirm'}
                options={prefectures.map((item) => ({ key: item.id, value: item.name }))}
                value={
                  mode !== 'confirm'
                    ? formData.residencePrefectureId?.toString() || ''
                    : formData.residencePrefectureName
                }
                onChange={(e) => {
                  handleInputChange('residencePrefectureId', e);
                  handleInputChange(
                    'residencePrefectureName',
                    prefectures.find((item) => item.id === Number(e))?.name || '',
                  );
                }}
                errorMessages={residencePrefectureErrorMessage}
                className='rounded w-[300px] '
              />
            </div>
          )}
        </div>
        <div className='flex flex-row justify-center gap-[16px] my-[30px]'>
          {/* 戻るボタン */}
          <CustomButton
            onClick={() => {
              router.back();
            }}
            buttonType='white-outlined'
          >
            戻る
          </CustomButton>
          {/* モードに応じたボタンの表示 */}
          {modeCustomButtons[mode as keyof typeof modeCustomButtons]}
        </div>
      </main>
    </div>
  );
}
