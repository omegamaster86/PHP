// 機能名: 選手情報登録・更新・削除
'use client';

import React, { use, useEffect } from 'react';
import ImageUploader from '../../../components/ImageUploader';
import HelpOutlineSharp from '@mui/icons-material/HelpOutlineSharp';
import ArrowBackIosNewSharpIcon from '@mui/icons-material/ArrowBackIosNewSharp';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import CustomDropdown from '@/app/components/CustomDropdown';
import CustomDatePicker from '@/app/components/CustomDatePicker';
import OriginalCheckbox from '@/app/components/OriginalCheckbox';
import Header from '@/app/components/Header';
import { useSearchParams } from 'next/navigation';
import CustomButton from '@/app/components/CustomButton';
import CustomTextField from '@/app/components/CustomTextField';
import InputLabel from '@/app/components/InputLabel';
import { masterDataResponse } from '@/app/utils/interface'; //外部ファイルからインターフェースをインポート
import { listDataResponse } from '@/app/utils/interface'; //外部ファイルからインターフェースをインポート

// Jsonの型定義
interface countryResponse {
  name: string;
  cd: string;
}

// Jsonの型定義
interface stateResponse {
  name: string;
}

// Jsonの型定義
interface sexResponse {
  name: string;
}

// Jsonの型定義
interface playerResponse {
  playerId: string; // 選手ID
  jaraPlayerCode: string; // JARA選手コード
  playerName: string; // 選手名
  sex: string; // 性別
  height: string; // 身長
  weight: string; // 体重
  sideInfo: number; // サイド情報
  birthPlaceCountry: string; // 出身地（国）
  birthPlacePrefecture: string; // 出身地（都道府県）
  livingCountry: string; // 居住地（国）
  livingPrefecture: string; // 居住地（都道府県）
  birthday: string; // 生年月日
}

export default function PlayerUpdate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // modeの値を取得 update, create, delete
  const mode = searchParams.get('mode');
  if (mode == null) {
    router.push('/player?mode=create');
  }

  // フォームの入力値を管理する関数
  const handleInputChange = (name: string, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const date = mode === 'delete' ? new Date() : null;
  const [formData, setFormData] = React.useState({
    playerId: '', // 選手ID
    jaraPlayerCode: '', // JARA選手コード
    playerName: '', // 選手名
    birthday: date, // 生年月日
    sex: '', // 性別
    height: '', // 身長
    weight: '', // 体重
    birthPlaceCountry: '日本国 （jpn）', // 出身地（国）
    birthPlacePrefecture: '東京', // 出身地（都道府県）
    livingCountry: '日本国 （jpn）', // 居住地（国）
    livingPrefecture: '東京', // 居住地（都道府県）
    sideInfo: {
      S: false,
      B: false,
      X: false,
      C: false,
      N1: false,
      N2: false,
      N3: false,
      N4: false,
    },
  });

  // const [countries, setCountries] = React.useState([] as string[]);
  const [countries, setCountries] = React.useState([] as masterDataResponse[]);
  const [prefectures, setPrefectures] = React.useState([] as masterDataResponse[]);
  const [sex, setSex] = React.useState([] as string[]);
  const [currentShowFile, setCurrentShowFile] = React.useState<{
    file: File;
    isUploaded: boolean;
    preview?: string;
  }>();

  useEffect(() => {
    if (formData.livingCountry == '日本') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        livingPrefecture: '東京',
      }));
    }
  }, [formData.livingCountry]);

  useEffect(() => {
    if (formData.birthPlaceCountry == '日本') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        birthPlacePrefecture: '東京',
      }));
    }
  }, [formData.birthPlaceCountry]);
  // 日付をYYYY/MM/DDの形式に変換する
  const formatDate = (dt: Date) => {
    var y = dt.getFullYear();
    var m = ('00' + (dt.getMonth() + 1)).slice(-2);
    var d = ('00' + dt.getDate()).slice(-2);
    return y + '/' + m + '/' + d;
  };

  // 指定したインデックス位置にある数値を抜き出す
  const getNumber = (num: number, index: number) => {
    return Number(num.toString().charAt(index));
  };

  // 2進数をsideInfoに変換する
  const convertNumberToBoolean = (num: number) => {
    const sideInfo = {
      S: getNumber(num, 0) === 1,
      B: getNumber(num, 1) === 1,
      X: getNumber(num, 2) === 1,
      C: getNumber(num, 3) === 1,
      N1: getNumber(num, 4) === 1,
      N2: getNumber(num, 5) === 1,
      N3: getNumber(num, 6) === 1,
      N4: getNumber(num, 7) === 1,
    };
    return sideInfo;
  };

  const convertBooleanToNumber = (sideInfo: any) => {
    const num =
      (sideInfo.S ? '1' : '0') +
      (sideInfo.B ? '1' : '0') +
      (sideInfo.X ? '1' : '0') +
      (sideInfo.C ? '1' : '0') +
      (sideInfo.N1 ? '1' : '0') +
      (sideInfo.N2 ? '1' : '0') +
      (sideInfo.N3 ? '1' : '0') +
      (sideInfo.N4 ? '1' : '0');
    return parseInt(num);
  };

  // 更新/削除モードの時に、選手情報を取得する
  useEffect(() => {
    if (mode === 'update' || mode === 'delete') {
      // APIを叩いて、選手情報を取得する
      // searchParams.get('id')"APIからを取得している処理。仮実装
      axios
        .get<playerResponse>('http://localhost:3100/player')
        .then((response) => {
          // YYYY/MM/DDの形式で取得
          const str = response.data.birthday;
          const year = parseInt(str.substring(0, 4));
          const month = parseInt(str.substring(5, 7));
          const day = parseInt(str.substring(8, 10));
          const date = new Date(year, month - 1, day);

          // nameプロパティのみ抜き出してstringの配列に変換
          setFormData((prevFormData) => ({
            ...prevFormData,
            ...{
              playerId: response.data.playerId, // 選手ID
              jaraPlayerCode: response.data.jaraPlayerCode, // JARA選手コード
              playerName: response.data.playerName, // 選手名
              sex: response.data.sex, // 性別
              height: response.data.height, // 身長
              weight: response.data.weight, // 体重
              birthPlaceCountry: response.data.birthPlaceCountry, // 出身地（国）
              birthPlacePrefecture: response.data.birthPlacePrefecture, // 出身地（都道府県）
              livingCountry: response.data.livingCountry, // 居住地（国）
              livingPrefecture: response.data.livingPrefecture, // 居住地（都道府県）
              birthday: date, // 生年月日
              sideInfo: convertNumberToBoolean(response.data.sideInfo), // サイド情報
            },
          }));
        })
        .catch((error) => {
          //alert(error);
        });
    }
    // APIを叩いて、選手情報を取得する
  }, []);

  useEffect(() => {
    const fetchCountry = async () => {
      // APIを叩いて、国名を取得する
      axios
        // .get<countryResponse[]>('http://localhost:3100/countries')
        .get('http://localhost:8000/api/getCountries')
        .then((response) => {
          // nameプロパティのみ抜き出してstringの配列に変換
          // const countryList = response.data.map((country: { name: string }) => country.name);
          const countryList = response.data.map(({ country_id, country_name }: { country_id: number; country_name: string }) => ({ id: country_id, name: country_name }));
          setCountries(countryList);
        })
        .catch((error) => {
          //alert(error);
        });
    };
    fetchCountry();
    // APIを叩いて、国名を取得する
  }, []);

  useEffect(() => {
    const fetchState = async () => {
      // APIを叩いて、都道府県名を取得する
      axios
        //.get<stateResponse[]>('http://localhost:3100/states')
        .get('http://localhost:8000/api/getPrefecures')
        .then((response) => {
          //console.log(response.data);
          // nameプロパティのみ抜き出してstringの配列に変換
          //const stateList = response.data.map((state: { name: string }) => state.name);
          const stateList = response.data.map(({ pref_id, pref_name }: { pref_id: number; pref_name: string }) => ({ id: pref_id, name: pref_name }));
          //console.log(stateList);
          setPrefectures(stateList);
        })
        .catch((error) => {
          //alert(error);
        });
    };
    fetchState();
    // APIを叩いて、都道府県名を取得する
  }, []);
  useEffect(() => {
    const fetchSex = async () => {
      // APIを叩いて、性別を取得する
      axios
        .get<sexResponse[]>('http://localhost:3100/sex')
        .then((response) => {
          // nameプロパティのみ抜き出してstringの配列に変換
          const sexList = response.data.map((sex) => sex.name);
          setSex(sexList);
        })
        .catch((error) => {
          //alert(error);
        });
    };
    fetchSex();
    // APIを叩いて、性別を取得する
  }, []);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    const checked = event.target.checked;
    setFormData((prevFormData) => ({
      ...prevFormData,
      sideInfo: {
        ...prevFormData.sideInfo,
        [name]: checked,
      },
    }));
  };

  // モードに応じたボタンの設定
  const modeCustomButtons = {
    create: (
      <CustomButton
        className='primary'
        onClick={() => console.log(formData, convertBooleanToNumber(formData.sideInfo))}
      >
        登録
      </CustomButton>
    ),
    update: (
      <CustomButton
        className='primary'
        onClick={() => console.log(formData, convertBooleanToNumber(formData.sideInfo))}
      >
        更新
      </CustomButton>
    ),
    delete: (
      <CustomButton
        className='primary'
        onClick={() => {
          window.confirm('選手情報を削除します。よろしいですか？') &&
            console.log(formData, convertBooleanToNumber(formData.sideInfo));
        }}
      >
        削除
      </CustomButton>
    ),
  };

  return (
    <div>
      <Header />
      <main className='flex min-h-screen max-w-4xl flex-col justify-start p-[10px] m-auto gap-[20px] my-[80px] max-w-[900px]'>
        <div className='relative w-full h-screen'>
          {mode === 'delete' && (
            <CustomButton
              className='secondary absolute rounded border-[1px] border-solid border-borde text-primaryText h-12 w-[150px] top-1 right-[0px]'
              onClick={() => {
                window.confirm(
                  'マイページに遷移します。入力された内容は破棄されますが、よろしいですか？',
                ) && router.push('/mypage');
              }}
            >
              マイページ
            </CustomButton>
          )}
          <div className='w-9/12 m-3 flex flex-row items-center justify-start gap-[20px]'>
            <ArrowBackIosNewSharpIcon
              className='cursor-pointer text-[14px]'
              onClick={() => {
                router.back();
              }}
            />
            <div className='text-h1 font-bold'>
              {mode === 'update'
                ? '選手情報入力確認'
                : mode === 'create'
                  ? '選手情報入力確認'
                  : '選手情報削除'}
            </div>
          </div>
        </div>
        <div className='flex flex-col justify-start'>
          <InputLabel label='写真' required={mode !== 'delete'} />
          <div className='flex flex-row justify-start gap-[4px]'>
            <ImageUploader
              currentShowFile={currentShowFile}
              setCurrentShowFile={setCurrentShowFile}
            />
          </div>
        </div>
        {mode !== 'create' && (
          <CustomTextField
            label='選手ID'
            isError={false}
            errorMessages={[]}
            readonly
            value={formData.playerId}
            onChange={(e) => handleInputChange('playerId', e.target.value)}
          />
        )}
        <div className='flex flex-col justify-start'>
          <CustomTextField
            label='JARA選手コード'
            isError={false}
            errorMessages={[]}
            required={mode !== 'delete'}
            readonly={mode === 'delete'}
            value={formData.jaraPlayerCode}
            onChange={(e) => handleInputChange('jaraPlayerCode', e.target.value)}
          />
        </div>
        <div className='flex flex-col justify-start'>
          <CustomTextField
            label='選手名'
            isError={false}
            errorMessages={[]}
            required={mode !== 'delete'}
            readonly={mode === 'delete'}
            value={formData.playerName}
            onChange={(e) => handleInputChange('playerName', e.target.value)}
          />
        </div>
        <div className='flex flex-col justify-start'>
          <InputLabel label='生年月日' required={mode !== 'delete'} />
          {mode === 'delete' && (
            <p className='h-12 w-[300px] p-3 disable'>{formatDate(formData.birthday as Date)}</p>
          )}
          {mode !== 'delete' && (
            <CustomDatePicker
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleInputChange('birthday', e as unknown as string);
              }}
              selectedDate={formData.birthday as Date}
              maxDate={new Date()}
            />
          )}
        </div>
        <div className='flex flex-col justify-start'>
          <InputLabel label='性別' required={mode !== 'delete'} />
          {mode === 'delete' && <p className='h-12 w-[300px] p-3 disable'>{formData.sex}</p>}
          {mode !== 'delete' && (
            <CustomDropdown
              id='sex'
              options={sex}
              value={formData.sex}
              onChange={(e) => {
                handleInputChange('sex', e);
              }}
              className='border-[0.5px] border-solid border-gray-50 rounded w-[300px]'
            />
          )}
        </div>
        <div className='flex flex-col justify-start'>
          <CustomTextField
            label='身長'
            isError={false}
            errorMessages={[]}
            type='number'
            required={mode !== 'delete'}
            readonly={mode === 'delete'}
            inputAdorment='cm'
            value={formData.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
          />
        </div>
        <div className='flex flex-col justify-start'>
          <CustomTextField
            label='体重'
            isError={false}
            errorMessages={[]}
            type='number'
            required={mode !== 'delete'}
            readonly={mode === 'delete'}
            inputAdorment='kg'
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
          />
        </div>
        <div className='flex flex-col justify-start'>
          <InputLabel label='サイド情報' required={mode !== 'delete'} />
          <div className='flex justify-start flex-col gap-[4px] my-1'>
            <OriginalCheckbox
              id='checkbox-S'
              label=': S (ストロークサイド)'
              value='S'
              checked={formData.sideInfo.S}
              readonly={mode === 'delete'}
              onChange={handleCheckboxChange}
            />
            <OriginalCheckbox
              id='checkbox-B'
              label=': B (バウサイド)'
              value='B'
              checked={formData.sideInfo.B}
              onChange={handleCheckboxChange}
              readonly={mode === 'delete'}
            />
            <OriginalCheckbox
              id='checkbox-X'
              label=': X (スカル)'
              value='X'
              checked={formData.sideInfo.X}
              onChange={handleCheckboxChange}
              readonly={mode === 'delete'}
            />
            <OriginalCheckbox
              id='checkbox-C'
              label=': C (コックス)'
              value='C'
              checked={formData.sideInfo.C}
              onChange={handleCheckboxChange}
              readonly={mode === 'delete'}
            />
          </div>
        </div>

        <div className='flex flex-row justify-start gap-[100px]'>
          <div className='flex flex-col justify-start'>
            <InputLabel label='出身地' required={mode !== 'delete'} />
            {mode === 'delete' && (
              <p className='h-12 w-[300px] p-3 disable'>{formData.birthPlaceCountry}</p>
            )}
            {mode !== 'delete' && (
              <CustomDropdown
                id='birthPlaceCountry'
                options={countries.map(({ id, name }) => (name))}
                value={formData.birthPlaceCountry}
                onChange={(e) => {
                  handleInputChange('birthPlaceCountry', e);
                }}
                className='border-[0.5px] border-solid  border-gray-50 rounded w-[300px]'
              />
            )}
          </div>
          {formData.birthPlaceCountry === '日本国 （jpn）' && (
            <div className='flex flex-col justify-start'>
              <InputLabel label='都道府県' required={mode !== 'delete'} />
              {mode === 'delete' && (
                <p className='h-12 w-[300px] p-3 disable'>{formData.birthPlacePrefecture}</p>
              )}
              {mode !== 'delete' && (
                <CustomDropdown
                  id='birthPlacePrefecture'
                  options={prefectures.map(({ id, name }) => (name))} //都道府県のnameだけをリストにして表示 20240117
                  value={formData.birthPlacePrefecture}
                  onChange={(e) => {
                    console.log(prefectures.filter((list) => list.name == e)); //選択都道府県確認用 20240117
                    handleInputChange('birthPlacePrefecture', e);
                  }}
                  className='border-[0.5px] border-solid border-gray-50 rounded w-[300px]'
                />
              )}
            </div>
          )}
        </div>
        <div className='flex flex-row justify-start gap-[100px]'>
          <div className='flex flex-col justify-start'>
            <InputLabel label='居住地' required={mode !== 'delete'} />
            {mode === 'delete' && (
              <p className='h-12 w-[300px] p-3 disable'>{formData.livingCountry}</p>
            )}
            {mode !== 'delete' && (
              <CustomDropdown
                id='livingCountry'
                options={countries.map(({ id, name }) => (name))}
                value={formData.livingCountry}
                onChange={(e) => {
                  handleInputChange('livingCountry', e);
                }}
                className='border-[0.5px] border-solid border-gray-50 rounded w-[300px] '
              />
            )}
          </div>
          {formData.livingCountry === '日本国 （jpn）' && (
            <div className='flex flex-col justify-start'>
              <InputLabel label='都道府県' required={mode !== 'delete'} />
              {mode === 'delete' && (
                <p className='h-12 w-[300px] p-3 disable'>{formData.livingPrefecture}</p>
              )}
              {mode !== 'delete' && (
                <CustomDropdown
                  id='livingPrefecture'
                  options={prefectures.map(({ id, name }) => (name))} //都道府県のnameだけをリストにして表示 20240117
                  value={formData.livingPrefecture}
                  onChange={(e) => {
                    console.log(prefectures.filter((list) => list.name == e)); //選択都道府県確認用 20240117
                    handleInputChange('livingPrefecture', e);
                  }}
                  className='border-[0.5px] border-solid border-gray-50 rounded w-[300px] '
                />
              )}
            </div>
          )}
        </div>
        <div className='flex flex-row justify-center gap-[16px] my-[30px]'>
          <CustomButton
            onClick={() => {
              router.back();
            }}
            className='secondary'
          >
            戻る
          </CustomButton>
          {modeCustomButtons[mode as keyof typeof modeCustomButtons]}
        </div>
      </main>
    </div>
  );
}
