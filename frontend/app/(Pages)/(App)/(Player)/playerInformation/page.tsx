// 機能名: 選手情報登録・更新・入力確認
'use client';
import { PLAYER_IMAGE_URL, NO_IMAGE_URL } from "../../../../utils/imageUrl"; //For importing image url from a single source of truth
import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/app/lib/axios';
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
  const mode = searchParams.get('mode')?.toString() || '';
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
  const prevMode = searchParams.get('prevMode')?.toString() || '';
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

  // クエリパラメータを取得する
  const playerId = searchParams.get('player_id')?.toString() || '';
  const player_id = { player_id: playerId };
  switch (playerId) {
    case '':
      break;
    default:
      break;
  };

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
    if (formData.residence_country == 112) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        residence_prefecture: 13, // 東京
        residencePrefectureName: '東京',
      }));
    }
  }, [formData.residence_country]);

  // 選手情報登録・更新・入力確認画面の「出身地（国）」が「日本」の場合、「出身地（都道府県）」を「東京」で設定する
  useEffect(() => {
    if (formData.birth_country == 112) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        birth_prefecture: 13,
        birthPrefectureName: '東京',
      }));
    }
  }, [formData.birth_country]);

  //アップロードされたファイルを保存するー開始
  useEffect(() => {
    if (currentShowFile?.file) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        uploadedPhotoName: currentShowFile.file.name,
        uploadedPhoto: currentShowFile.file,
        photo: ''
      }))
    }
    else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        uploadedPhotoName: '',
        uploadedPhoto: undefined,
        photo: ''
      }))
    }
  }, [currentShowFile]);//ファイルのアップロード終わったら
  //アップロードされたファイルを保存するー完了

  // 更新モードの時に、選手情報を取得する
  useEffect(() => {
    const fetchPrefecture = async () => {
      // 仮のURL（繋ぎ込み時に変更すること）
      try {
        // TODO: 都道府県情報の取得処理を実装
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        axios
          //20240123 DBからデータ取得
          // .get<PrefectureResponse[]>('http://localhost:3100/prefecture')
          .get('/getPrefecures')
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
          .get('/getSexList') //20240123 DBからデータ取得
          .then((response) => {
            // console.log(response.data);
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
          .get('/getCountries')
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
        setErrorMessage([
          ...(errorMessage as string[]),
          'API取得エラー:' + (error as Error).message,
        ]);
      }
    };
    fetchPrefecture();

    if (mode === 'update') {
      // TODO: 選手情報を取得する処理を実装
      // searchParams.get('id')から選手IDを取得
      const fetchPlayerData = async () => {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        axios
          // .get<PlayerInformationResponse>('http://localhost:3100/player')
          .post('/getUpdatePlayerData', player_id)
          .then((response) => {
            // console.log(response.data);
            //サイド情報のデータ変換
            var data = response.data.result.side_info.split('');
            data.splice(0, 4); //サイド情報の先頭４つ分の不要なデータを削除
            for (let i = 0; i < 4; i++) {
              if (data[i] == "1") {
                data[i] = true;
              } else {
                data[i] = false;
              }
            }
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
          })
          .catch((error) => {
            // TODO: エラー処理を実装
            setErrorMessage([
              ...(errorMessage as string[]),
              'API取得エラー:' + (error as Error).message,
            ]);
          });

      }

      fetchPlayerData();// APIを叩いて、選手情報を取得する
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
    }

  }, [mode]);

  /**
   * 入力チェック
   * @returns {boolean} エラーがある場合はtrue、ない場合はfalse
   */
  const validate = () => {
    // JARA選手コードの入力チェック
    // const jaraPlayerCodeError = Validator.getErrorMessages([
    //   Validator.validateSelectRequired(formData.jara_player_id.toString(), 'JARA選手コード'),
    //   Validator.validatePlayerIdFormat(formData.jara_player_id.toString()),
    // ]);

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
    console.log(birthPlacePrefectureError);

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
    console.log(livingPrefectureError);

    // エラーメッセージを設定
    // setJaraPlayerCodeErrorMessage(jaraPlayerCodeError);
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
      // jaraPlayerCodeError.length > 0 ||
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
          // jara_player_id登録されているかどうかチェック
          const csrf = () => axios.get('/sanctum/csrf-cookie');
          await csrf();
          axios
            // .post('http://localhost:3100/', registerData)
            .post('/checkJARAPlayerId', { "jara_player_id": formData.jara_player_id, "mode": "create" })
            .then((response) => {
              // TODO: 更新処理成功時の処理
              // console.log(response);
              setErrorMessage([]);
              // OK が押下された場合、確認画面に遷移する　※短絡評価
              window.confirm('入力したJARA選手コードと紐づくデータが存在しません。\nこのJARA選手コードで登録しますか？') && router.push('/playerInformation?mode=confirm&prevMode=create');
              // window.alert('入力したJARA選手コードと紐づくデータが存在しません。\nこのJARA選手コードで登録しますか？');
            })
            .catch((error) => {
              // TODO: 更新処理失敗時の処理
              setErrorMessage([
                ...(error?.response?.data as string[]),
              ]);
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
          const csrf = () => axios.get('/sanctum/csrf-cookie');
          await csrf();
          axios
            // .post('http://localhost:3100/', registerData)
            .post('/checkJARAPlayerId', { "jara_player_id": formData.jara_player_id, "mode": "update" })
            .then((response) => {
              // TODO: 更新処理成功時の処理
              // console.log(response);
              setErrorMessage([]);
              if (response?.data != '') {
                // OK が押下された場合、確認画面に遷移する　※短絡評価
                window.confirm(response?.data) && router.push('/playerInformation?mode=confirm&prevMode=update');
                // window.alert(response?.data);
              } else {
                router.push('/playerInformation?mode=confirm&prevMode=update');
              }
            })
            .catch((error) => {
              // TODO: 更新処理失敗時の処理
              setErrorMessage([
                ...(error?.response?.data as string[]),
              ]);
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
          if (prevMode == 'update') {
            // TODO: 更新処理を実装
            const registerData = {};
            const csrf = () => axios.get('/sanctum/csrf-cookie');
            await csrf();

            // jara_player_id登録されているかどうかチェック
            await axios
              .post('/checkJARAPlayerId', { "jara_player_id": formData.jara_player_id, "mode": "update_confirm" }) //20240123 送信テスト
              .then((response) => {
                // TODO: 更新処理成功時の処理
                // console.log(response);
                console.log(formData.side_info);
                formData.side_info.unshift(false, false, false, false); //先頭を0000で埋める
                if (formData.birth_country != 112) { //出身地が日本以外の場合、都道府県に関連したデータを削除する
                  formData.birth_prefecture = 0;
                  formData.birthPrefectureName = '';
                }
                if (formData.residence_country != 112) { //居住地が日本以外の場合、都道府県に関連したデータを削除する
                  formData.residence_prefecture = 0;
                  formData.residencePrefectureName = '';
                }
                console.log(formData.side_info);
                setErrorMessage([]);
                axios
                  // .post('http://localhost:3100/', registerData)
                  .post('/updatePlayerData', formData, {
                    //ファイルを送るため
                    headers: {
                      'content-type': 'multipart/form-data',
                    },
                  }) //20240123 送信テスト
                  .then((response) => {
                    // TODO: 更新処理成功時の処理
                    window.alert('選手情報を更新しました。');
                    const urlStr = '/playerInformationRef' + '?player_id=' + response.data.users[0].player_id;
                    router.push(urlStr); //選手情報参照画面に遷移する
                  })
                  .catch((error) => {
                    // TODO: 更新処理失敗時の処理
                    setErrorMessage([
                      ...(errorMessage as string[]),
                      '更新に失敗しました。原因：' + (error as Error).message,
                    ]);
                  });
              })
              .catch((error) => {
                // TODO: 更新処理失敗時の処理
                setErrorMessage([
                  ...(error?.response?.data as string[]),
                ]);

                return;
              });
            // axios
            //   // .post('http://localhost:3100/', registerData)
            //   .post('/updatePlayerData', formData,{ 
            //     //ファイルを送るため
            //     headers: { 
            //       'content-type' : 'multipart/form-data' ,
            //      } ,
            //    }) //20240123 送信テスト
            //   .then((response) => {
            //     // TODO: 更新処理成功時の処理
            //     console.log(response);
            //     window.confirm('選手情報を更新しました。');
            //     router.push('/DummyMyPage');
            //   })
            //   .catch((error) => {
            //     // TODO: 更新処理失敗時の処理
            //     setErrorMessage([
            //       ...(errorMessage as string[]),
            //       '更新に失敗しました。原因：' + (error as Error).message,
            //     ]);
            //   });
          } else if (prevMode == 'create') {
            // TODO: 登録処理を実装
            const csrf = () => axios.get('/sanctum/csrf-cookie');
            await csrf();
            const registerData = {};

            // jara_player_id登録されているかどうかチェック
            await axios
              // .post('http://localhost:3100/', registerData)
              .post('/checkJARAPlayerId', { "jara_player_id": formData.jara_player_id, "mode": "create_confirm" })
              .then((response) => {
                // TODO: 更新処理成功時の処理
                // console.log(response);
                console.log(formData.side_info);
                formData.side_info.unshift(false, false, false, false); //先頭を0000で埋める
                if (formData.birth_country != 112) { //出身地が日本以外の場合、都道府県に関連したデータを削除する
                  formData.birth_prefecture = 0;
                  formData.birthPrefectureName = '';
                }
                if (formData.residence_country != 112) { //居住地が日本以外の場合、都道府県に関連したデータを削除する
                  formData.residence_prefecture = 0;
                  formData.residencePrefectureName = '';
                }
                console.log(formData);
                setErrorMessage([]);
                axios
                  // .post('http://localhost:3100/', registerData)
                  .post('/storePlayerData', formData, {
                    //ファイルを送るため
                    headers: {
                      'content-type': 'multipart/form-data',
                    },
                  })
                  .then((response) => {
                    // TODO: 登録処理成功時の処理の実装
                    window.alert('選手情報を登録しました。');
                    const urlStr = '/playerInformationRef' + '?player_id=' + response.data.users[0].player_id;
                    router.push(urlStr); //選手情報参照画面に遷移する
                  })
                  .catch((error) => {
                    // TODO: 登録処理失敗時の処理の実装
                    setErrorMessage([
                      ...(errorMessage as string[]),
                      '登録に失敗しました。原因：' + (error as Error).message,
                    ]);
                  });
              })
              .catch((error) => {
                // TODO: 更新処理失敗時の処理
                setErrorMessage([
                  ...(error?.response?.data as string[]),
                ]);

                return;
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
            // toolTipTitle='写真' //はてなボタン用
            toolTipText='登録可能な画像ファイルの種類は以下になります。
            　jpg
            　jpeg
            　png' //はてなボタン用
          />
          <div className='flex flex-row justify-start gap-[4px]'>
            {mode !== 'confirm' && (
              <div>
                <ImageUploader
                  currentShowFile={currentShowFile}
                  setCurrentShowFile={setCurrentShowFile}
                  setFormData={setFormData} initialPhotoUrl={formData?.photo ? `${PLAYER_IMAGE_URL}${formData.photo}` : ''}
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
                      photo: ''
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
              <div className='relative'>
                {/* 写真 */}
                <img
                  className='object-cover w-[320px] h-[320px] rounded-[2px]'
                  src={currentShowFile?.preview ?? (formData.photo ? `${PLAYER_IMAGE_URL}${formData.photo}` : `${NO_IMAGE_URL}`)}

                  alt="Profile Photo"
                // Revoke data uri after image is loaded
                // onLoad={() => {
                //   console.log(currentShowFile);
                // }}
                />
              </div>
            )}
          </div>
        </div>
        {/* 選手ID */}

        {(mode === 'update' || prevMode === 'update') && (
          <CustomTextField
            label='選手ID'
            isError={false}
            // errorMessages={[]}
            // required={mode !== 'confirm'}
            displayHelp={false}
            readonly
            value={formData.player_id?.toString()}
            onChange={(e) => handleInputChange('player_id', e.target.value)}
          />
        )}
        <div className='flex flex-col justify-start'>
          {/* JARA選手コード */}
          <CustomTextField
            label='JARA選手コード'
            // type='number'
            // required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            // isError={jaraPlayerCodeErrorMessage.length > 0}
            placeHolder='123456789012'
            readonly={mode === 'confirm'}
            // errorMessages={jaraPlayerCodeErrorMessage}
            value={formData.jara_player_id?.toString()}
            onChange={(e) => handleInputChange('jara_player_id', e.target.value)}
            // toolTipTitle='Title JARA選手コード' //はてなボタン用
            toolTipText='日本ローイング協会より発行された、12桁の選手コードを入力してください。' //はてなボタン用
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
            value={formData.player_name}
            onChange={(e) => handleInputChange('player_name', e.target.value)}
            // toolTipTitle='Title 選手名' //はてなボタン用
            toolTipText='文字制限
            　最大文字数：32文字（全半角区別なし）
            　利用可能文字：
            　　　日本語
            　　　英大文字：[A-Z]（26 文字）
            　　　英小文字：[a-z]（26 文字）
            　　　数字：[0-9]（10 文字）
            　　　記号：-,_' //はてなボタン用
          />
        </div>
        <div className='flex flex-col justify-start'>
          {/* 生年月日 */}
          <InputLabel
            label='生年月日'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            // toolTipTitle='Title 生年月日' //はてなボタン用
            toolTipText='西暦で入力してください。' //はてなボタン用
          />
          <CustomDatePicker
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleInputChange('date_of_birth', formatDate(e as unknown as Date));
            }}
            readonly={mode === 'confirm'}
            selectedDate={formData.date_of_birth}
            maxDate={new Date()}
            errorMessages={dateOfBirthErrorMessage}
          />
        </div>
        <div className='flex flex-col justify-start'>
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
            placeHolder='未選択'
            onChange={(e) => {
              handleInputChange('sex_id', e);
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
            isDecimal={true}
            placeHolder='180.00'
            inputAdorment='cm'
            value={formData.height?.toString()}
            onChange={(e) => handleInputChange('height', e.target.value)}
            // toolTipTitle='Title 身長' //はてなボタン用
            toolTipText='現在の身長を半角数字で入力してください。' //はてなボタン用
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
            isDecimal={true}
            inputAdorment='kg'
            value={formData.weight?.toString()}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            // toolTipTitle='Title 体重' //はてなボタン用
            toolTipText='現在の体重を半角数字で入力してください。' //はてなボタン用
          />
        </div>
        <div className='flex flex-col justify-start'>
          {/* サイド情報 */}
          <InputLabel
            label='サイド情報'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            // toolTipTitle='Title サイド情報' //はてなボタン用
            toolTipText='経験のあるサイドを選択してください。' //はてなボタン用
          />
          <div className='flex justify-start flex-col gap-[4px] my-1'>
            <OriginalCheckbox
              id='checkbox-S'
              readonly={mode === 'confirm'}
              label=': S (ストロークサイド)'
              value='S'
              checked={formData.side_info?.at(3) ?? false}
              onChange={() =>
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  side_info: [
                    !prevFormData.side_info[0],
                    prevFormData.side_info[1],
                    prevFormData.side_info[2],
                    prevFormData.side_info[3],
                  ],
                })) as void
              }
            />
            <OriginalCheckbox
              id='checkbox-B'
              readonly={mode === 'confirm'}
              label=': B (バウサイド)'
              value='B'
              checked={formData.side_info?.at(2) as boolean}
              onChange={() =>
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  side_info: [
                    prevFormData.side_info[0],
                    !prevFormData.side_info[1],
                    prevFormData.side_info[2],
                    prevFormData.side_info[3],
                  ],
                })) as void
              }
            />
            <OriginalCheckbox
              id='checkbox-X'
              label=': X (スカル)'
              value='X'
              readonly={mode === 'confirm'}
              checked={formData.side_info?.at(1) as boolean}
              onChange={() =>
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  side_info: [
                    prevFormData.side_info[0],
                    prevFormData.side_info[1],
                    !prevFormData.side_info[2],
                    prevFormData.side_info[3],
                  ],
                })) as void
              }
            />
            <OriginalCheckbox
              id='checkbox-C'
              label=': C (コックス)'
              readonly={mode === 'confirm'}
              value='C'
              checked={formData.side_info?.at(0) as boolean}
              onChange={() =>
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  side_info: [
                    prevFormData.side_info[0],
                    prevFormData.side_info[1],
                    prevFormData.side_info[2],
                    !prevFormData.side_info[3],
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
            <CustomDropdown
              id='birthCountry'
              label='出身地'
              required={mode !== 'confirm'}
              displayHelp={mode !== 'confirm'}
              // toolTipTitle='Title 出身地' //はてなボタン用
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
              className='rounded w-[300px] '
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
                // toolTipTitle='Title 都道府県' //はてなボタン用
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
                //errorMessages={birthPlacePrefectureErrorMessage}
                className='rounded w-[300px] '
              />
            </div>
          )}
        </div>
        <div className='flex flex-row justify-start gap-[100px]'>
          <div className='flex flex-col justify-start'>
            {/* 居住地（国） */}
            <CustomDropdown
              id='residenceCountry'
              label='居住地'
              required={mode !== 'confirm'}
              displayHelp={mode !== 'confirm'}
              // toolTipTitle='Title 居住地' //はてなボタン用
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
              className='rounded w-[300px] '
            />
          </div>
          {/* 国コードが日本の場合のみ、都道府県の入力欄を表示する */}
          {formData.residence_country == 112 && (
            <div className='flex flex-col justify-start'>
              {/* 居住地（都道府県） */}
              <CustomDropdown
                id='residencePrefecture'
                label='都道府県'
                required={mode !== 'confirm'}
                displayHelp={mode !== 'confirm'}
                // toolTipTitle='Title 都道府県' //はてなボタン用
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
