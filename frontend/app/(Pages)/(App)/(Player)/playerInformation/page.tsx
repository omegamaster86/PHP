// 機能名: 選手情報登録・更新・入力確認
'use client';

import {
  CustomButton,
  CustomDatePicker,
  CustomDropdown,
  CustomTextField,
  CustomTitle,
  ErrorBox,
  ImageUploader,
  InputLabel,
  OriginalCheckbox,
} from '@/app/components';
import { CustomPlayerAvatar } from '@/app/components/CustomPlayerAvatar';
import { useUserType } from '@/app/hooks/useUserType';
import axios from '@/app/lib/axios';
import {
  Country,
  CountryResponse,
  PlayerInformationResponse,
  Prefecture,
  PrefectureResponse,
  Sex,
  SexResponse,
} from '@/app/types';
import { PLAYER_IMAGE_URL } from '@/app/utils/imageUrl';
import {
  getSessionStorage,
  getStorageKey,
  removeSessionStorage,
  setSessionStorage,
} from '@/app/utils/sessionStorage';
import Validator from '@/app/utils/validator';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Divider from '@mui/material/Divider';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { formatDate } from '@/app/utils/dateUtil';

type PlayerFormData = PlayerInformationResponse;

const availableModes = ['create', 'update', 'confirm'] as const;
type AvailableModes = (typeof availableModes)[number];
const availablePrevModes = ['create', 'update', 'delete', ''] as const;
type AvailablePrevModes = (typeof availablePrevModes)[number];

export default function PlayerInformation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // modeの値を取得 update, create
  const mode = (searchParams.get('mode')?.toString() || 'create') as AvailableModes;

  const prevMode = (searchParams.get('prevMode')?.toString() || '') as AvailablePrevModes;

  const source = searchParams.get('source') as 'confirm' | null;

  // クエリパラメータを取得する
  const playerIdParams = searchParams.get('player_id')?.toString() || '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const playerId = useMemo(() => Number(playerIdParams), []);
  const player_id = { player_id: playerIdParams };
  switch (playerIdParams) {
    case '':
      break;
    default:
      break;
  }

  useUserType({
    onSuccess: (userType) => {
      if (mode === 'create') {
        const hasAuthority =
          !userType.isPlayer &&
          (userType.isJara ||
            userType.isPrefBoatOfficer ||
            userType.isOrganizationManager ||
            userType.isVolunteer ||
            userType.isAudience);

        if (!hasAuthority) {
          router.replace('/playerSearch');
        }
      }

      if (mode === 'update') {
        const hasAuthority = userType.isPlayer && playerId && userType.playerId === playerId;
        if (!hasAuthority) {
          router.replace('/mypage/profile');
        }
      }
    },
  });

  // フォームの入力値を管理する関数
  const handleInputChange = (name: string, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const [formData, setFormData] = useState<PlayerFormData>({
    user_id: 0,
    player_id: 0,
    jara_player_id: '',
    player_name: '',
    sexName: '',
    sex_id: 0,
    height: '',
    weight: '',
    birth_country: 112,
    birthCountryName: '日本国 （jpn）',
    birth_prefecture: 13,
    birthPrefectureName: '東京',
    residence_country: 112,
    residenceCountryName: '日本国 （jpn）',
    residence_prefecture: 13,
    residencePrefectureName: '東京',
    date_of_birth: '',
    side_info: [false, false, false, false],
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
  const [countries, setCountries] = useState<Omit<CountryResponse, 'cd'>[]>([]);
  const [prefectures, setPrefectures] = useState<PrefectureResponse[]>([]);
  const [sex, setSex] = useState<SexResponse[]>([]);
  const [currentShowFile, setCurrentShowFile] = useState<{
    file: File;
    isUploaded: boolean;
    preview?: string;
  }>();
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storageKey =
    mode === 'update'
      ? getStorageKey({ pageName: 'player', type: 'update', id: playerId })
      : getStorageKey({ pageName: 'player', type: 'create' });

  const draftFormData = getSessionStorage<PlayerFormData>(storageKey);

  const removeDraftFormData = () => {
    const storageKeyOnConfirmPage =
      prevMode === 'update'
        ? getStorageKey({ pageName: 'player', type: 'update', id: playerId })
        : getStorageKey({ pageName: 'player', type: 'create' });
    removeSessionStorage(storageKeyOnConfirmPage);
  };

  // 選手情報登録・更新・入力確認画面の「出身地（国）」が「日本」の場合、「出身地（都道府県）」を「東京」で設定する
  useEffect(() => {
    if (formData.birth_country == 112) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        birth_prefecture: formData.birth_prefecture == 0 ? 13 : formData.birth_prefecture,
        birthPrefectureName:
          formData.birthPrefectureName == '' ? '東京' : formData.birthPrefectureName,
      }));
    }
  }, [formData.birth_country]);

  // 選手情報登録・更新・入力確認画面の「居住地（国）」が「日本」の場合、「居住地（都道府県）」を「東京」で設定する
  useEffect(() => {
    // 居住地（国）が日本（=0）の時
    if (formData.residence_country == 112) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        residence_prefecture:
          formData.residence_prefecture == 0 ? 13 : formData.residence_prefecture, // 東京
        residencePrefectureName:
          formData.residencePrefectureName == '' ? '東京' : formData.residencePrefectureName,
      }));
    }
  }, [formData.residence_country]);

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

  // 更新モードの時に、選手情報を取得する
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

    const fetchPrefecture = async () => {
      try {
        axios
          .get<Prefecture[]>('api/getPrefectures')
          .then((response) => {
            const stateList = response.data.map((x) => ({
              id: x.pref_id,
              name: x.pref_name,
            }));
            setPrefectures(stateList);
          })
          .catch((error) => {
            setErrorMessage([
              ...(errorMessage as string[]),
              'API取得エラー:' + (error as Error).message,
            ]);
          });

        axios
          .get<Sex[]>('api/getSexList')
          .then((response) => {
            const sexList = response.data.map((x) => ({
              id: x.sex_id,
              name: x.sex,
            }));
            setSex(sexList);
          })
          .catch((error) => {
            setErrorMessage([
              ...(errorMessage as string[]),
              'API取得エラー:' + (error as Error).message,
            ]);
          });
        axios
          .get<Country[]>('api/getCountries')
          .then((response) => {
            const countryList = response.data.map((x) => ({
              id: x.country_id,
              name: x.country_name,
            }));
            setCountries(countryList);
          })
          .catch((error) => {
            setErrorMessage([
              ...(errorMessage as string[]),
              'API取得エラー:' + (error as Error).message,
            ]);
          });
      } catch (error: any) {
        setErrorMessage([
          ...(errorMessage as string[]),
          'API取得エラー:' + (error as Error).message,
        ]);
      }
    };
    fetchPrefecture();

    if (mode === 'update') {
      const fetchPlayerData = async () => {
        axios
          .post('api/getUpdatePlayerData', player_id)
          .then(async (response) => {
            //サイド情報のデータ変換
            var data = response.data.result.side_info.split('');
            data.splice(0, 4); //サイド情報の先頭４つ分の不要なデータを削除
            for (let i = 0; i < 4; i++) {
              if (data[i] == '1') {
                data[i] = true;
              } else {
                data[i] = false;
              }
            }
            var tmpArray = Array(); //サイド情報のエンディアン入れ替え
            for (let index = data.length - 1; index >= 0; index--) {
              tmpArray.push(data[index]);
            }
            data = tmpArray;
            // nameプロパティのみ抜き出してstringの配列に変換
            setFormData((prevFormData) => ({
              ...prevFormData,
              ...{
                player_id: response.data.result.player_id, // 選手ID
                jara_player_id: response.data.result.jara_player_id, // JARA選手コード
                player_name: response.data.result.player_name, // 選手名
                sexName: response.data.result.sex_name, // 性別
                sex_id: response.data.result.sex_id, // 性別
                date_of_birth: response.data.result.date_of_birth, // 生年月日
                height: response.data.result.height, // 身長
                weight: response.data.result.weight, // 体重
                side_info: data, // サイド情報
                birthCountryName: response.data.result.birthCountryName, // 出身地（国）
                birth_country: response.data.result.birth_country, // 出身地（国）
                birthPrefectureName: response.data.result.birthPrefectureName, // 出身地（都道府県）
                birth_prefecture: response.data.result.birth_prefecture, // 出身地（都道府県）
                residenceCountryName: response.data.result.residenceCountryName, // 居住地（国）
                residence_country: response.data.result.residence_country, // 居住地（国）
                residencePrefectureName: response.data.result.residencePrefectureName, // 居住地（都道府県）
                residence_prefecture: response.data.result.residence_prefecture, // 居住地（都道府県）
                photo: response.data.result.photo, //写真
                previousPhotoName: response.data.result.photo, //写真
              },
            }));

            restoreFormData();
          })
          .catch((error) => {
            setErrorMessage([error.response?.data?.message]);
          });
      };
      fetchPlayerData();
    } else if (mode === 'create') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        ...{
          player_id: 0,
          jara_player_id: '',
          player_name: '',
          sexName: '',
          sex_id: 0,
          height: '',
          weight: '',
          birth_country: 112,
          birthCountryName: '日本国 （jpn）',
          birth_prefecture: 13,
          birthPrefectureName: '東京',
          residence_country: 112,
          residenceCountryName: '日本国 （jpn）',
          residence_prefecture: 13,
          residencePrefectureName: '東京',
          date_of_birth: '',
          side_info: [false, false, false, false],
          photo: '',
        },
      }));

      restoreFormData();
    }
  }, [mode]);

  /**
   * 入力チェック
   * @returns {boolean} エラーがある場合はtrue、ない場合はfalse
   */
  const validate = () => {
    // JARA選手コードの入力チェック
    const jaraPlayerCodeError = Validator.getErrorMessages([
      Validator.validateJaraPlayerCodeFormat(formData.jara_player_id?.toString()),
    ]);

    // 選手名の入力チェック
    const playerNameError = Validator.getErrorMessages([
      Validator.validateSelectRequired(formData.player_name, '選手名'),
      Validator.validateLength(formData.player_name, '選手名', 50),
      Validator.validatePlayerNameFormat(formData.player_name),
    ]);

    // サイド情報の入力チェック
    const sideInfoError = Validator.getErrorMessages([
      Validator.validateSideInfoIsInput(formData.side_info),
    ]);

    // 生年月日の入力チェック
    const dateOfBirthError = Validator.getErrorMessages([
      Validator.validateSelectRequired(formData.date_of_birth, '生年月日'),
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
      formData.birth_country == 112
        ? Validator.validateSelectRequired(formData.birthPrefectureName, '出身地（都道府県）')
        : '',
    ]);

    // 居住地（国）の入力チェック
    const residenceCountryNameError = Validator.getErrorMessages([
      Validator.validateSelectRequired(formData.residenceCountryName, '居住地（国）'),
    ]);

    // 居住地（都道府県）の入力チェック
    const livingPrefectureError = Validator.getErrorMessages([
      formData.residence_country == 112
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
        onClick={async () => {
          const isError = validate();
          if (isError) {
            return;
          }
          axios
            .post('api/checkJARAPlayerId', {
              jara_player_id: formData.jara_player_id,
              mode: 'create',
            })
            .then((response) => {
              setErrorMessage([]);
              setSessionStorage<PlayerFormData>(storageKey, formData);
              if (response?.data != '') {
                window.confirm(response?.data) &&
                  router.push('/playerInformation?mode=confirm&prevMode=create');
              } else {
                router.push('/playerInformation?mode=confirm&prevMode=create');
              }
            })
            .catch((error) => {
              setErrorMessage([error.response?.data?.message]);
            });
        }}
      >
        確認
      </CustomButton>
    ),
    update: (
      <CustomButton
        buttonType='primary'
        onClick={async () => {
          const isError = validate();
          if (isError) {
            return;
          }
          // jara_player_id登録されているかどうかチェック
          axios
            .post('api/checkJARAPlayerId', {
              jara_player_id: formData.jara_player_id,
              mode: 'update',
            })
            .then((response) => {
              setErrorMessage([]);
              setSessionStorage<PlayerFormData>(storageKey, formData);
              if (response?.data != '') {
                window.confirm(response?.data) &&
                  router.push('/playerInformation?mode=confirm&prevMode=update');
              } else {
                router.push('/playerInformation?mode=confirm&prevMode=update');
              }
            })
            .catch((error) => {
              setErrorMessage([error.response?.data?.message]);
            });
        }}
      >
        確認
      </CustomButton>
    ),
    confirm: (
      <CustomButton
        buttonType='primary'
        onClick={async () => {
          //確認画面で更新処理（F5,リロードボタン）された場合、formDataの値が空になるのでバックエンドに送信させないようにする 20240402
          if (formData.player_name == null || formData.player_name == '') {
            setErrorMessage(['データが空です。もう一度必須項目を入力してください']);
            return;
          }

          if (isSubmitting) {
            return;
          }
          setIsSubmitting(true);

          if (prevMode == 'update') {
            // jara_player_id登録されているかどうかチェック
            await axios
              .post('api/checkJARAPlayerId', {
                jara_player_id: formData.jara_player_id,
                mode: 'update_confirm',
              })
              .then(async (response) => {
                if (formData.birth_country != 112) {
                  //出身地が日本以外の場合、都道府県に関連したデータを削除する
                  formData.birth_prefecture = null;
                  formData.birthPrefectureName = '';
                }
                if (formData.residence_country != 112) {
                  //居住地が日本以外の場合、都道府県に関連したデータを削除する
                  formData.residence_prefecture = null;
                  formData.residencePrefectureName = '';
                }
                //サイド情報のデータ位置入れ替え
                var tmpArray = Array();
                for (let index = formData.side_info.length - 1; index >= 0; index--) {
                  tmpArray.push(formData.side_info[index]);
                }
                formData.side_info = tmpArray;
                formData.side_info.unshift(false, false, false, false); //先頭を0000で埋める

                //nullのパラメータを空のパラメータに置き換える
                Object.keys(formData).forEach((key) => {
                  (formData as any)[key] = (formData as any)[key] ?? '';
                });
                setErrorMessage([]);
                await axios
                  .post('api/updatePlayerData', formData, {
                    headers: { 'content-type': 'multipart/form-data' },
                  })
                  .then((response) => {
                    window.alert('選手情報を更新しました。');
                    removeDraftFormData();
                    const urlStr =
                      '/playerInformationRef?player_id=' + response.data.users[0].player_id;
                    router.push(urlStr); //選手情報参照画面に遷移する
                  })
                  .catch((error) => {
                    setErrorMessage([
                      '選手情報の更新に失敗しました。',
                      'ユーザーサポートにお問い合わせください。',
                    ]);
                  });
              })
              .catch((error) => {
                setErrorMessage([error.response?.data?.message]);
              });
          } else if (prevMode == 'create') {
            // jara_player_id登録されているかどうかチェック
            await axios
              .post('api/checkJARAPlayerId', {
                jara_player_id: formData.jara_player_id,
                mode: 'create_confirm',
              })
              .then(async (response) => {
                if (formData.birth_country != 112) {
                  //出身地が日本以外の場合、都道府県に関連したデータを削除する
                  formData.birth_prefecture = null;
                  formData.birthPrefectureName = '';
                }
                if (formData.residence_country != 112) {
                  //居住地が日本以外の場合、都道府県に関連したデータを削除する
                  formData.residence_prefecture = null;
                  formData.residencePrefectureName = '';
                }
                //サイド情報のデータ位置入れ替え
                var tmpArray = Array();
                for (let index = formData.side_info.length - 1; index >= 0; index--) {
                  tmpArray.push(formData.side_info[index]);
                }
                formData.side_info = tmpArray;
                formData.side_info.unshift(false, false, false, false); //先頭を0000で埋める

                //nullのパラメータを空のパラメータに置き換える
                Object.keys(formData).forEach((key) => {
                  (formData as any)[key] = (formData as any)[key] ?? '';
                });
                setErrorMessage([]);
                await axios
                  .post('api/storePlayerData', formData, {
                    headers: { 'content-type': 'multipart/form-data' },
                  })
                  .then((response) => {
                    if (response.data.errMessage != null || response.data.errMessage != undefined) {
                      setErrorMessage([
                        ...(errorMessage as string[]),
                        '登録に失敗しました。原因：' + response.data.errMessage,
                      ]);
                    } else {
                      window.alert('選手情報を登録しました。');
                      removeDraftFormData();
                      const urlStr =
                        '/playerInformationRef?player_id=' + response.data.users[0].player_id;
                      router.push(urlStr); //選手情報参照画面に遷移する
                    }
                  })
                  .catch((error) => {
                    setErrorMessage([
                      ...(errorMessage as string[]),
                      '登録に失敗しました。原因：' + (error as Error).message,
                    ]);
                  });
              })
              .catch((error) => {
                setErrorMessage([error.response?.data?.message]);
              });
          }

          setIsSubmitting(false);
        }}
      >
        {prevMode === 'update' && '更新'}
        {prevMode === 'create' && '登録'}
      </CustomButton>
    ),
  };

  const customBack = () => {
    if (mode !== 'confirm') {
      router.back();
      return;
    }

    if (prevMode === 'create') {
      router.replace('/playerInformation?mode=create&source=confirm');
    }
    if (prevMode === 'update') {
      router.replace(`/playerInformation?mode=update&source=confirm&player_id=${playerId}`);
    }
  };

  if (!availableModes.includes(mode)) return null;

  if (!availablePrevModes.includes(prevMode)) return null;

  if (mode !== 'create' && prevMode !== 'create' && formData.player_id === 0)
    return <ErrorBox errorText={errorMessage} />;

  return (
    <>
      <CustomTitle customBack={customBack}>
        選手情報{mode === 'create' ? '登録' : mode === 'update' ? '更新' : '入力確認'}
      </CustomTitle>
      {/* エラーメッセージの表示 */}
      <ErrorBox errorText={errorMessage} />
      <div>
        {/* 写真 */}
        <InputLabel
          label='写真'
          displayHelp={mode !== 'confirm'}
          // toolTipTitle='写真' //はてなボタン用
          toolTipText={`<span style="display: block;">登録可能な画像ファイルの種類は以下になります。</span>
            <span style="display: block;">jpg</span>
            <span style="display: block;">jpeg</span>
            <span style="display: block;">png</span>`}
        />
        <div className='flex flex-row justify-start gap-[4px]'>
          {mode !== 'confirm' && (
            <div>
              <ImageUploader
                currentShowFile={currentShowFile}
                setCurrentShowFile={setCurrentShowFile}
                setFormData={setFormData}
                initialPhotoUrl={formData?.photo ? `${PLAYER_IMAGE_URL}${formData.photo}` : ''}
              />
              {/* 写真削除ボタン */}
              <CustomButton
                buttonType='white-outlined'
                className='secondary mt-[20px] rounded border-[1px] border-solid border-borde text-primaryText h-12 w-[150px]'
                onClick={() => {
                  // TODO: アップロードされた写真を削除する処理に置き換える
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    uploadedPhotoName: '',
                    uploadedPhoto: undefined,
                    photo: '',
                  }));
                  setCurrentShowFile(undefined);
                }}
              >
                <DeleteOutlinedIcon className='mr-[5px] text-[20px]' />
                写真削除
              </CustomButton>
            </div>
          )}
          {mode === 'confirm' && (
            <CustomPlayerAvatar
              alt='選手画像'
              fileName={currentShowFile?.preview ?? formData.photo}
              isPreview={!!currentShowFile?.preview}
              sx={{
                width: 200,
                height: 200,
                fontSize: 14,
              }}
            />
          )}
        </div>
      </div>
      {/* 選手ID */}
      {(mode === 'update' || prevMode === 'update') && (
        <CustomTextField
          label='選手ID'
          isError={false}
          displayHelp={false}
          readonly
          value={formData.player_id?.toString()}
          onChange={(e) => handleInputChange('player_id', e.target.value)}
        />
      )}
      {/* JARA選手コード */}
      <CustomTextField
        label='JARA選手コード'
        displayHelp={mode !== 'confirm'}
        isError={jaraPlayerCodeErrorMessage.length > 0}
        placeHolder='123456789012'
        readonly={mode === 'confirm'}
        errorMessages={jaraPlayerCodeErrorMessage}
        value={formData.jara_player_id?.toString()}
        onChange={(e) => handleInputChange('jara_player_id', e.target.value)}
        toolTipText='日本ローイング協会より発行された、12桁の選手コードを入力してください。' //はてなボタン用
        maxLength={12}
      />
      {/* 選手名 */}
      <CustomTextField
        label='選手名'
        isError={playerNameErrorMessage.length > 0}
        required={mode !== 'confirm'}
        displayHelp={mode !== 'confirm'}
        errorMessages={playerNameErrorMessage}
        placeHolder='山田太郎'
        readonly={mode === 'confirm'}
        value={formData.player_name}
        onChange={(e) => handleInputChange('player_name', e.target.value)}
        toolTipText={`<span style="display: block;">文字制限</span>
            <span style="display: block;">最大文字数：32文字（全半角区別なし）</span>
            <span style="display: block;">利用可能文字：</span>
            <span style="display: block;">日本語</span>
            <span style="display: block;">英大文字：[A-Z]（26 文字）</span>
            <span style="display: block;">英小文字：[a-z]（26 文字）</span>
            <span style="display: block;">数字：[0-9]（10 文字）</span>
            <span style="display: block;">記号：-,_</span>`}
      />
      <div>
        {/* 生年月日 */}
        <InputLabel
          label='生年月日'
          required={mode !== 'confirm'}
          displayHelp={mode !== 'confirm'}
          toolTipText='西暦で入力してください。' //はてなボタン用
        />
        <CustomDatePicker
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleInputChange('date_of_birth', formatDate(e as unknown as string, 'yyyy/MM/dd'));
          }}
          readonly={mode === 'confirm'}
          selectedDate={formData.date_of_birth}
          maxDate={new Date()}
          isError={dateOfBirthErrorMessage.length > 0}
          errorMessages={dateOfBirthErrorMessage}
        />
      </div>
      {/* 性別 */}
      <CustomDropdown
        id='sex'
        label='性別'
        required={mode !== 'confirm'}
        displayHelp={mode !== 'confirm'}
        toolTipText='大会に登録する性別を選んでください。'
        readonly={mode === 'confirm'}
        options={sex.map((item) => ({ key: item.id, value: item.name }))}
        value={mode !== 'confirm' ? formData.sex_id?.toString() || '' : formData.sexName}
        errorMessages={sexErrorMessage}
        isError={sexErrorMessage.length > 0}
        placeHolder='未選択'
        onChange={(e) => {
          handleInputChange('sex_id', e);
          handleInputChange('sexName', sex.find((item) => item.id === Number(e))?.name || '');
        }}
        className='rounded'
      />
      {/* 身長 */}
      <CustomTextField
        label='身長'
        readonly={mode === 'confirm'}
        required={mode !== 'confirm'}
        displayHelp={mode !== 'confirm'}
        isError={heightErrorMessage.length > 0}
        errorMessages={heightErrorMessage}
        type='number'
        isDecimal={true}
        placeHolder='180.00'
        inputAdorment='cm'
        value={formData.height?.toString()}
        onChange={(e) => handleInputChange('height', e.target.value)}
        toolTipText='現在の身長を半角数字で入力してください。' //はてなボタン用
      />
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
        isDecimal={true}
        inputAdorment='kg'
        value={formData.weight?.toString()}
        onChange={(e) => handleInputChange('weight', e.target.value)}
        toolTipText='現在の体重を半角数字で入力してください。' //はてなボタン用
      />
      <div>
        {/* サイド情報 */}
        <InputLabel
          label='サイド情報'
          required={mode !== 'confirm'}
          displayHelp={mode !== 'confirm'}
          toolTipText='経験のあるサイドを選択してください。' //はてなボタン用
        />
        <div className='flex flex-col gap-[4px] my-1'>
          <OriginalCheckbox
            id='checkbox-S'
            readonly={mode === 'confirm'}
            label=': S (ストロークサイド)'
            value='S'
            checked={formData.side_info?.at(0) ?? false}
            onChange={() =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                side_info: [
                  !prevFormData.side_info[0],
                  prevFormData.side_info[1],
                  prevFormData.side_info[2],
                  prevFormData.side_info[3],
                ],
              }))
            }
          />
          <OriginalCheckbox
            id='checkbox-B'
            readonly={mode === 'confirm'}
            label=': B (バウサイド)'
            value='B'
            checked={formData.side_info?.at(1) as boolean}
            onChange={() =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                side_info: [
                  prevFormData.side_info[0],
                  !prevFormData.side_info[1],
                  prevFormData.side_info[2],
                  prevFormData.side_info[3],
                ],
              }))
            }
          />
          <OriginalCheckbox
            id='checkbox-X'
            label=': X (スカル)'
            value='X'
            readonly={mode === 'confirm'}
            checked={formData.side_info?.at(2) as boolean}
            onChange={() =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                side_info: [
                  prevFormData.side_info[0],
                  prevFormData.side_info[1],
                  !prevFormData.side_info[2],
                  prevFormData.side_info[3],
                ],
              }))
            }
          />
          <OriginalCheckbox
            id='checkbox-C'
            label=': C (コックス)'
            readonly={mode === 'confirm'}
            value='C'
            checked={formData.side_info?.at(3) as boolean}
            onChange={() =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                side_info: [
                  prevFormData.side_info[0],
                  prevFormData.side_info[1],
                  prevFormData.side_info[2],
                  !prevFormData.side_info[3],
                ],
              }))
            }
          />
        </div>
        {/* エラーメッセージ */}
        <p className='text-caption1 text-systemErrorText'>{sideInfoErrorMessage}</p>
      </div>
      <div className='flex flex-col justify-start gap-7 md:flex-row md:gap-[100px]'>
        <div>
          {/* 出身地（国） */}
          <CustomDropdown
            id='birthCountry'
            label='出身地'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            toolTipText='生まれた国を選択してください。
              日本を選択した場合、都道府県も選択してください。' //はてなボタン用
            readonly={mode === 'confirm'}
            options={countries.map((item) => ({ key: item.id, value: item.name }))}
            value={
              mode !== 'confirm'
                ? formData.birth_country?.toString() || ''
                : formData.birthCountryName
            }
            errorMessages={birthCountryNameErrorMessage}
            placeHolder='未選択'
            onChange={(e) => {
              handleInputChange('birth_country', e);
              handleInputChange(
                'birthCountryName',
                countries.find((item) => item.id === Number(e))?.name || '',
              );
            }}
            className='rounded md:w-[300px]'
          />
        </div>
        {/* 国コードが日本の場合のみ、都道府県の入力欄を表示する */}
        {formData.birth_country == 112 && (
          <div className='flex flex-col justify-start'>
            {/* 出身地（都道府県） */}
            <CustomDropdown
              id='birthPrefecture'
              label='都道府県'
              required={mode !== 'confirm'}
              displayHelp={mode !== 'confirm'}
              toolTipText='生まれた都道府県を選択してください。' //はてなボタン用
              options={prefectures.map((item) => ({ key: item.id, value: item.name }))}
              readonly={mode === 'confirm'}
              value={
                mode !== 'confirm'
                  ? formData.birth_prefecture?.toString() || ''
                  : formData.birthPrefectureName
              }
              errorMessages={birthPlacePrefectureErrorMessage}
              placeHolder='未選択'
              onChange={(e) => {
                handleInputChange('birth_prefecture', e);
                handleInputChange(
                  'birthPrefectureName',
                  prefectures.find((item) => item.id === Number(e))?.name || '',
                );
              }}
              className='rounded md:w-[300px] '
            />
          </div>
        )}
      </div>
      <div className='flex flex-col justify-start gap-7 md:flex-row md:gap-[100px]'>
        <div>
          {/* 居住地（国） */}
          <CustomDropdown
            id='residenceCountry'
            label='居住地'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            toolTipText='現在住んでいる国を選択してください。
              日本を選択した場合、都道府県も選択してください。' //はてなボタン用
            options={countries.map((item) => ({ key: item.id, value: item.name }))}
            value={
              mode !== 'confirm'
                ? formData.residence_country?.toString() || ''
                : formData.residenceCountryName
            }
            readonly={mode === 'confirm'}
            onChange={(e) => {
              handleInputChange('residence_country', e);
              handleInputChange(
                'residenceCountryName',
                countries.find((item) => item.id === Number(e))?.name || '',
              );
            }}
            errorMessages={residenceCountryNameErrorMessage}
            className='rounded md:w-[300px] '
          />
        </div>
        {/* 国コードが日本の場合のみ、都道府県の入力欄を表示する */}
        {formData.residence_country == 112 && (
          <div>
            {/* 居住地（都道府県） */}
            <CustomDropdown
              id='residencePrefecture'
              label='都道府県'
              required={mode !== 'confirm'}
              displayHelp={mode !== 'confirm'}
              toolTipText='現在住んでいる都道府県を選択してください。' //はてなボタン用
              readonly={mode === 'confirm'}
              options={prefectures.map((item) => ({ key: item.id, value: item.name }))}
              value={
                mode !== 'confirm'
                  ? formData.residence_prefecture?.toString() || ''
                  : formData.residencePrefectureName
              }
              onChange={(e) => {
                handleInputChange('residence_prefecture', e);
                handleInputChange(
                  'residencePrefectureName',
                  prefectures.find((item) => item.id === Number(e))?.name || '',
                );
              }}
              errorMessages={residencePrefectureErrorMessage}
              className='rounded md:w-[300px] '
            />
          </div>
        )}
      </div>
      <Divider className='h-[1px] bg-border' />
      <div className='flex flex-col md:flex-row justify-center items-center gap-[16px] my-[30px]'>
        {/* 戻るボタン */}
        <CustomButton
          onClick={async () => {
            setErrorMessage([]);
            customBack();
          }}
          buttonType='white-outlined'
        >
          戻る
        </CustomButton>
        {/* モードに応じたボタンの表示 */}
        {modeCustomButtons[mode as keyof typeof modeCustomButtons]}
      </div>
    </>
  );
}
