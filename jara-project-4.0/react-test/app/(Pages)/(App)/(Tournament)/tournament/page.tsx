// 機能名: 大会登録・更新
'use client';

// Reactおよび関連モジュールのインポート
import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
// コンポーネントのインポート
import {
  CustomDropdown,
  CustomDatePicker,
  CustomButton,
  CustomTextField,
  OriginalCheckbox,
  CustomTitle,
  ErrorBox,
  InputLabel,
  CustomTable,
  CustomTbody,
  CustomThead,
  CustomTr,
  CustomTh,
  CustomTd,
} from '@/app/components';
import PdfFileUploader from './pdfFileUploader';

import {
  Tournament,
  Race,
  TourTypeResponse,
  VenueResponse,
  EventResponse,
  RaceTypeResponse,
} from '@/app/types';

import Validator from '@/app/utils/validator';
import TextField from '@mui/material/TextField';

// ファイル関連のアクションを扱うためのインターフェース
interface FileHandler {
  clearFile(): void;
}

export default function Tournament() {
  // フック
  const router = useRouter();
  const fileUploaderRef = useRef<FileHandler>(null);

  // クエリパラメータを取得する
  const searchParams = useSearchParams();
  // modeの値を取得 update, create
  const mode = searchParams.get('mode');
  if (mode == null) {
    router.push('/tournament?mode=create');
  }
  const tournId = searchParams.get('tournId')?.toString() || '';
  const prevMode = searchParams.get('prevMode')?.toString() || 'confirm';

  // フォームデータを管理する状態
  const [tableData, setTableData] = useState<Race[]>([
    {
      id: 0,
      checked: false,
      raceId: '',
      entrysystemRaceId: '',
      raceNumber: '',
      eventId: '',
      eventName: '',
      raceName: '',
      raceType: '',
      raceTypeName: '',
      byGroup: '',
      range: '',
      startDateTime: '',
    },
  ]);

  const [raceFormData, setRaceFormData] = useState<Race>({
    id: 0,
    checked: false,
    raceId: '',
    entrysystemRaceId: '',
    raceNumber: '',
    eventId: '',
    eventName: '',
    raceName: '',
    raceType: '',
    raceTypeName: '',
    byGroup: '',
    range: '',
    startDateTime: '',
  });

  const [tournamentFormData, setTournamentFormData] = useState<Tournament>({
    tournId: tournId,
    entrysystemRaceId: '',
    tournName: '',
    tournType: '',
    tournTypeName: '',
    sponsorOrgId: '',
    sponsorOrgName: '',
    eventStartDate: '',
    eventEndDate: '',
    venueId: '',
    venueIdName: '',
    venueName: '',
    tournUrl: '',
    tournInfoFailePath: '',
  });

  // フォームの入力値を管理する関数
  const handleInputChangeTournament = (name: string, value: string) => {
    setTournamentFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleInputChangeRace = (rowId: number, name: string, value: string | boolean) => {
    setTableData((prevRows) =>
      prevRows.map((row) => (row.id === rowId ? { ...row, [name]: value } : row)),
    );
  };

  // ステート変数
  const [tournType, setTourType] = useState<TourTypeResponse[]>([]);
  const [venue, setVenue] = useState<VenueResponse[]>([]);
  const [event, setEvent] = useState<EventResponse[]>([]);
  const [raceType, setRaceType] = useState<RaceTypeResponse[]>([]);

  // テーブルに設定するキーの最大値
  const [maxId, setMaxId] = useState(0);

  // エラーメッセージ
  const [entrysystemRaceIdErrorMessage, setEntrysystemRaceIdErrorMessage] = useState(
    [] as string[],
  );
  const [tournNameErrorMessage, setTournNameErrorMessage] = useState([] as string[]);
  const [sponsorOrgIdErrorMessage, setSponsorOrgIdErrorMessage] = useState([] as string[]);
  const [eventStartDateErrorMessage, setEventStartDateErrorMessage] = useState([] as string[]);
  const [eventEndDateErrorMessage, setEventEndDateErrorMessage] = useState([] as string[]);
  const [venueIdErrorMessage, setVenueIdErrorMessage] = useState([] as string[]);
  const [venueNameErrorMessage, setVenueNameErrorMessage] = useState([] as string[]);
  const [tournUrlErrorMessage, setTournUrlErrorMessage] = useState([] as string[]);
  const [tournInfoFailePathErrorMessage, setTournInfoFailePathErrorMessageErrorMessage] = useState(
    [] as string[],
  );
  const [raceNumberErrorMessage, setRaceNumberErrorMessage] = useState([] as string[]);
  const [eventIdErrorMessage, setEventIdErrorMessage] = useState([] as string[]);
  const [raceNameErrorMessage, setRaceNameErrorMessage] = useState([] as string[]);
  const [raceTypeErrorMessage, setRaceTypeErrorMessage] = useState([] as string[]);
  const [raceTypeNameErrorMessage, setRaceTypeNameErrorMessage] = useState([] as string[]);
  const [byGroupErrorMessage, setByGroupErrorMessage] = useState([] as string[]);
  const [rangeErrorMessage, setRangeErrorMessage] = useState([] as string[]);
  const [startDateTimeErrorMessage, setStartDateTimeErrorMessage] = useState([] as string[]);
  const [errorMessages, setErrorMessages] = useState([] as string[]);

  // バリデーションを実行する関数
  const performValidation = () => {
    const entrysystemRaceIdError = Validator.getErrorMessages([]);
    const tournNameError = Validator.getErrorMessages([
      Validator.validateRequired(tournamentFormData.tournName, '大会名'),
    ]);
    const sponsorOrgIdError = Validator.getErrorMessages([
      Validator.validateRequired(tournamentFormData.sponsorOrgId, '主催団体ID'),
    ]);
    const eventStartDateError = Validator.getErrorMessages([
      Validator.validateRequired(tournamentFormData.eventStartDate, '開催日時'),
    ]);
    const eventEndDateError = Validator.getErrorMessages([
      Validator.validateRequired(tournamentFormData.eventEndDate, '終了日時'),
    ]);
    const venueIdError = Validator.getErrorMessages([
      Validator.validateRequired(
        tournamentFormData.venueId,
        '開催場所を選択するか、入力欄に開催場所',
      ),
    ]);
    const venueNameError =
      tournamentFormData.venueId === '0'
        ? Validator.getErrorMessages([
            Validator.validateRequired(
              tournamentFormData.venueName,
              '開催場所を選択するか、入力欄に開催場所',
            ),
          ])
        : [];

    const tournUrlError = Validator.getErrorMessages([
      Validator.validateUrlFormat(tournamentFormData.tournUrl),
    ]);
    const raceNumberErrorFlg = tableData.some((row) => {
      return Validator.validateRequired(row.raceNumber, 'レースNo.').length > 0;
    });
    const eventIdErrorFlg = tableData.some((row) => {
      return Validator.validateSelectRequired(row.eventId, '種目').length > 0;
    });
    const raceNameErrorFlg = tableData.some((row) => {
      return Validator.validateRequired(row.raceName, 'レース名').length > 0;
    });
    const raceTypeErrorFlg = tableData.some((row) => {
      return Validator.validateRequired(row.raceType, 'レース区分').length > 0;
    });
    const raceTypeNameErrorFlg = tableData.some((row) => {
      return row.raceType === '999'
        ? Validator.validateRequired(row.raceTypeName, 'レース区分').length > 0
        : false;
    });

    const byGroupErrorFlg = tableData.some((row) => {
      return Validator.validateRequired(row.byGroup, '組別').length > 0;
    });

    const rangeErrorFlg = tableData.some((row) => {
      return Validator.validateRequired(row.range, '距離').length > 0;
    });

    const startDateTimeErrorFlg = tableData.some((row) => {
      return Validator.validateRequired(row.startDateTime, '発艇日時').length > 0;
    });

    setEntrysystemRaceIdErrorMessage(entrysystemRaceIdError);
    setTournNameErrorMessage(tournNameError);
    setSponsorOrgIdErrorMessage(sponsorOrgIdError);
    setEventStartDateErrorMessage(eventStartDateError);
    setEventEndDateErrorMessage(eventEndDateError);
    setVenueIdErrorMessage(venueIdError);
    setVenueNameErrorMessage(venueNameError);
    setTournUrlErrorMessage(tournUrlError);
    if (raceNumberErrorFlg) {
      setRaceNumberErrorMessage(
        Validator.getErrorMessages([Validator.validateRequired(null, 'レースNo.')]),
      );
    } else {
      setRaceNumberErrorMessage([]);
    }
    if (eventIdErrorFlg) {
      setEventIdErrorMessage(
        Validator.getErrorMessages([Validator.validateSelectRequired(null, '種目')]),
      );
    } else {
      setEventIdErrorMessage([]);
    }
    if (raceNameErrorFlg) {
      setRaceNameErrorMessage(
        Validator.getErrorMessages([Validator.validateRequired(null, 'レース名')]),
      );
    } else {
      setRaceNameErrorMessage([]);
    }
    if (raceTypeErrorFlg) {
      setRaceTypeErrorMessage(
        Validator.getErrorMessages([Validator.validateSelectRequired(null, 'レース区分')]),
      );
    } else {
      setRaceTypeErrorMessage([]);
    }
    if (raceTypeNameErrorFlg) {
      setRaceTypeNameErrorMessage(
        Validator.getErrorMessages([Validator.validateSelectRequired(null, 'レース区分')]),
      );
    } else {
      setRaceTypeNameErrorMessage([]);
    }
    if (byGroupErrorFlg) {
      setByGroupErrorMessage(
        Validator.getErrorMessages([Validator.validateRequired(null, '組別')]),
      );
    } else {
      setByGroupErrorMessage([]);
    }
    if (rangeErrorFlg) {
      setRangeErrorMessage(Validator.getErrorMessages([Validator.validateRequired(null, '距離')]));
    } else {
      setRangeErrorMessage([]);
    }
    if (startDateTimeErrorFlg) {
      setStartDateTimeErrorMessage(
        Validator.getErrorMessages([Validator.validateRequired(null, '発艇日時')]),
      );
    } else {
      setStartDateTimeErrorMessage([]);
    }
    if (
      tournNameError.length > 0 ||
      sponsorOrgIdError.length > 0 ||
      eventStartDateError.length > 0 ||
      eventEndDateError.length > 0 ||
      venueIdError.length > 0 ||
      venueNameError.length > 0 ||
      tournUrlError.length > 0 ||
      eventIdErrorFlg ||
      raceNameErrorFlg ||
      raceTypeErrorFlg ||
      raceTypeNameErrorFlg ||
      byGroupErrorFlg ||
      rangeErrorFlg ||
      startDateTimeErrorFlg
    ) {
      return true;
    } else {
      return false;
    }
  };

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      // APIを叩いてデータを取得する
      // TODO: データ取得処理の実装置き換え
      axios
        .get<TourTypeResponse[]>('http://localhost:3100/tourType')
        .then((response) => {
          setTourType(response.data);
        })
        .catch((error) => {
          // TODO: エラー処理の実装置き換え
          alert(error);
        });
      // TODO: データ取得処理の実装置き換え
      axios
        .get<VenueResponse[]>('http://localhost:3100/venue')
        .then((response) => {
          setVenue(response.data);
        })
        .catch((error) => {
          // TODO: エラー処理の実装置き換え
          alert(error);
        });
      // TODO: データ取得処理の実装置き換え
      axios
        .get<EventResponse[]>('http://localhost:3100/event')
        .then((response) => {
          setEvent(response.data);
        })
        .catch((error) => {
          // TODO: エラー処理の実装置き換え
          alert(error);
        });
      // TODO: データ取得処理の実装置き換え
      axios
        .get<RaceTypeResponse[]>('http://localhost:3100/raceType')
        .then((response) => {
          setRaceType(response.data);
        })
        .catch((error) => {
          // TODO: エラー処理の実装置き換え
          alert(error);
        });
      // 更新モードの時に、大会情報を取得する
      if (mode === 'update') {
        // APIを叩いて、大会情報とレース情報を取得する
        // TODO: データ取得処理の実装置き換え
        axios
          .get<Tournament>('http://localhost:3100/tournament')
          .then((response) => {
            setTournamentFormData({
              tournId: tournId,
              entrysystemRaceId: response.data.entrysystemRaceId,
              tournName: response.data.tournName,
              tournType: response.data.tournType,
              tournTypeName: response.data.tournTypeName,
              sponsorOrgId: response.data.sponsorOrgId,
              sponsorOrgName: response.data.sponsorOrgName,
              eventStartDate: response.data.eventStartDate,
              eventEndDate: response.data.eventEndDate,
              venueId: response.data.venueId,
              venueIdName: response.data.venueIdName,
              venueName: response.data.venueName,
              tournUrl: response.data.tournUrl,
              tournInfoFailePath: response.data.tournInfoFailePath,
            });
            console.log(response.data);
          })
          .catch((error) => {
            // TODO: エラー処理の実装置き換え
            alert(error);
          });
        // TODO: データ取得処理の実装置き換え
        axios
          .get<Race[]>('http://localhost:3100/race')
          .then((response) => {
            setTableData(response.data);
          })
          .catch((error) => {
            // TODO: エラー処理の実装置き換え
            alert(error);
          });
      }
    };
    fetchData();
  }, []);

  // モードに応じたボタンの設定
  const modeCustomButtons = {
    create: (
      <CustomButton
        buttonType='primary'
        onClick={() => {
          setDisplayFlg(false);
          const isError = performValidation();
          if (!isError) {
            const registerData = {};
            axios
              .post('http://localhost:3100/', registerData)
              .then((response) => {
                // TODO: 処理成功時の処理
                setTournamentFormData({} as Tournament);
                setRaceFormData({
                  id: 0,
                  checked: false,
                  raceId: '',
                  entrysystemRaceId: '',
                  raceNumber: '',
                  raceType: '',
                  raceTypeName: '',
                  otherRaceName: '',
                  eventId: '',
                  eventName: '',
                  raceName: '',
                  byGroup: '',
                  range: '',
                  startDateTime: '',
                });
                setTableData([
                  {
                    id: 0,
                    checked: false,
                    raceId: '',
                    entrysystemRaceId: '',
                    raceNumber: '',
                    raceType: '',
                    raceTypeName: '',
                    otherRaceName: '',
                    eventId: '',
                    eventName: '',
                    raceName: '',
                    byGroup: '',
                    range: '',
                    startDateTime: '',
                  },
                ]);
                fileUploaderRef?.current?.clearFile();
                window.confirm('大会情報を登録しました。');
              })
              .catch((error) => {
                // TODO: 処理失敗時の処理
                setErrorMessages([
                  ...(errorMessages as string[]),
                  '登録に失敗しました。原因：' + (error as Error).message,
                ]);
              })
              .finally(() => {
                setDisplayFlg(true);
              });
          }
        }}
      >
        登録
      </CustomButton>
    ),
    update: (
      <CustomButton
        buttonType='primary'
        onClick={() => {
          setDisplayFlg(false);
          const isError = performValidation();
          if (!isError) {
            const registerData = {};
            axios
              .post('http://localhost:3100/', registerData)
              .then((response) => {
                // TODO: 処理成功時の処理
                setTournamentFormData({} as Tournament);
                setRaceFormData({
                  id: 0,
                  checked: false,
                  raceId: '',
                  entrysystemRaceId: '',
                  raceNumber: '',
                  eventId: '',
                  eventName: '',
                  raceName: '',
                  raceType: '',
                  raceTypeName: '',
                  otherRaceName: '',
                  byGroup: '',
                  range: '',
                  startDateTime: '',
                });
                setTableData([
                  {
                    id: 0,
                    checked: false,
                    raceId: '',
                    entrysystemRaceId: '',
                    raceNumber: '',
                    raceType: '',
                    raceTypeName: '',
                    otherRaceName: '',
                    eventId: '',
                    eventName: '',
                    raceName: '',
                    byGroup: '',
                    range: '',
                    startDateTime: '',
                  },
                ]);
                fileUploaderRef?.current?.clearFile();
                window.confirm('大会情報を更新しました。');
              })
              .catch((error) => {
                // TODO: 処理失敗時の処理
                setErrorMessages([
                  ...(errorMessages as string[]),
                  '更新に失敗しました。原因：' + (error as Error).message,
                ]);
              })
              .finally(() => {
                setDisplayFlg(true);
              });
          }
        }}
      >
        更新
      </CustomButton>
    ),
    confirm: (
      <CustomButton
        buttonType='primary'
        onClick={() => {
          setDisplayFlg(false);
          const isError = performValidation();
          if (!isError) {
            setTableData((prevData) => {
              return prevData.filter((row) => {
                return !row.checked;
              });
            });
            router.push('/tournament?mode=confirm&prevMode=' + mode);
          }
          setDisplayFlg(true);
        }}
      >
        確認
      </CustomButton>
    ),
  };

  // ボタンの活性・非活性を保持するステート
  const [displayFlg, setDisplayFlg] = useState<boolean>(true);

  // 追加ボタン
  const addCustomButton = displayFlg && (
    <CustomButton
      className='w-[100px]'
      buttonType='primary'
      onClick={() => {
        const newId = maxId + 1;
        setMaxId((prevMaxId) => prevMaxId + 1);
        setTableData((prevData) => [...prevData, { ...raceFormData, id: newId }]);
        // フォームデータをリセット
        setRaceFormData({
          id: 0,
          checked: false,
          raceId: '',
          entrysystemRaceId: '',
          raceNumber: '',
          raceType: '',
          raceTypeName: '',
          otherRaceName: '',
          eventId: '',
          eventName: '',
          raceName: '',
          byGroup: '',
          range: '',
          startDateTime: '',
        });
      }}
    >
      追加
    </CustomButton>
  );

  // ログインユーザーの種別
  const [userType, setUserType] = useState<number>(1);

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

  // 日付をYYYY/MM/DD HH:MMの形式に変換する
  const formatDateTime = (dt: Date | null | undefined) => {
    if (!dt) {
      return '';
    }
    const y = dt.getFullYear();
    const m = ('00' + (dt.getMonth() + 1)).slice(-2);
    const d = ('00' + dt.getDate()).slice(-2);
    const hh = ('00' + dt.getHours()).slice(-2);
    const mm = ('00' + dt.getMinutes()).slice(-2);
    return y + '/' + m + '/' + d + ' ' + hh + ':' + mm;
  };

  // テーブルの明細行を作成する関数
  const raceRowComp = (row: Race) => {
    return (
      <>
        {/* レースID */}
        <CustomTd>
          <TextField
            type={'text'}
            value={row.entrysystemRaceId}
            onChange={(e) => handleInputChangeRace(row.id, 'entrysystemRaceId', e.target.value)}
            className='my-[8px]'
          />
        </CustomTd>
        {/* レースNo. */}
        <CustomTd>
          <TextField
            type={'number'}
            value={row.raceNumber}
            onChange={(e) => {
              handleInputChangeRace(row.id, 'raceNumber', e.target.value);
            }}
            className='w-[150px]'
          />
        </CustomTd>
        {/* 種目 */}
        <CustomTd>
          <CustomDropdown
            id='event'
            options={event.map((item) => ({ key: item.id, value: item.name }))}
            value={row.eventId}
            onChange={(e) => {
              handleInputChangeRace(row.id, 'eventId', e);
              handleInputChangeRace(
                row.id,
                'eventName',
                event.find((item) => item.id === Number(e))?.name || '',
              );
            }}
            className='border-[0.5px] border-solid border-gray-50 rounded w-[150px]'
          />
        </CustomTd>
        {/* レース名 */}
        <CustomTd>
          <TextField
            type={'text'}
            value={row.raceName}
            onChange={(e) => handleInputChangeRace(row.id, 'raceName', e.target.value)}
            className='w-[150px]'
          />
        </CustomTd>
        {/* レース区分 */}
        <CustomTd>
          <div className='flex flex-row gap-[4px]'>
            <CustomDropdown
              id='raceType'
              options={raceType.map((item) => ({ key: item.id, value: item.name }))}
              value={row.raceType}
              onChange={(e) => {
                handleInputChangeRace(row.id, 'raceType', e.toString());
                handleInputChangeRace(
                  row.id,
                  'raceTypeName',
                  raceType.find((item) => item.id === Number(e))?.name || '',
                );
              }}
              className='border-[0.5px] border-solid border-gray-50 rounded self-end w-[150px]'
              readonly={mode === 'confirm'}
            />
            {/* その他選択時に表示のテキストボックス */}
            <div className={`${row.raceType === '999' ? '' : 'hidden'} `}>
              <CustomTextField
                label=''
                isError={raceTypeNameErrorMessage.length > 0}
                displayHelp={false}
                readonly={mode === 'confirm'}
                value={row.otherRaceName}
                onChange={(e) => handleInputChangeRace(row.id, 'otherRaceName', e.target.value)}
                textFieldWidth={150}
              />
            </div>
          </div>
        </CustomTd>
        {/* 組別 */}
        <CustomTd>
          <TextField
            type={'number'}
            value={row.byGroup}
            onChange={(e) => handleInputChangeRace(row.id, 'byGroup', e.target.value)}
            className='w-[150px]'
          />
        </CustomTd>
        {/* 距離 */}
        <CustomTd>
          <TextField
            type={'number'}
            value={row.range}
            onChange={(e) => handleInputChangeRace(row.id, 'range', e.target.value)}
            className='w-[150px]'
          />
        </CustomTd>
        {/* 発艇日時 */}
        <CustomTd>
          <CustomDatePicker
            selectedDate={row.startDateTime}
            useTime={true}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleInputChangeRace(row.id, 'startDateTime', formatDateTime(e as unknown as Date));
            }}
          />
        </CustomTd>
      </>
    );
  };
  return (
    <div>
      <main className='flex min-h-screen flex-col justify-start p-[10px] gap-[20px] my-[80px] md:w-[1200px] sm: w-[600px]'>
        <div className='relative flex flex-row justify-between w-full h-screen flex-wrap'>
          {/* 画面名 */}
          <CustomTitle isCenter={false} displayBack>
            {mode === 'create'
              ? '大会登録'
              : mode === 'update'
                ? '大会情報変更'
                : '大会情報入力確認'}
          </CustomTitle>
        </div>
        {/* エラー表示１ */}
        <ErrorBox errorText={errorMessages} />
        {/* 大会ID */}
        <div
          className={`${
            mode === 'update' || prevMode === 'update' ? '' : 'hidden'
          } 'flex flex-col justify-start'`}
        >
          <CustomTextField
            label='大会ID'
            isError={false}
            displayHelp={false}
            readonly
            onChange={(e) => {}}
            value={tournamentFormData.tournId}
          />
        </div>
        {/* エントリーシステムの大会ID */}
        <div className='flex flex-col justify-start'>
          {/* TODO: 仮実装。ユーザー種別による表示制御部分の置き換え */}
          {userType === 1 && (
            <CustomTextField
              label='エントリーシステムの大会ID'
              isError={entrysystemRaceIdErrorMessage.length > 0}
              errorMessages={entrysystemRaceIdErrorMessage}
              readonly={mode === 'confirm'}
              displayHelp={mode !== 'confirm'}
              value={tournamentFormData.entrysystemRaceId}
              onChange={(e) => handleInputChangeTournament('entrysystemRaceId', e.target.value)}
            />
          )}
        </div>
        <div className='flex flex-col justify-start gap-[8px]'>
          {/* 大会名 */}
          <div className='flex flex-row justify-start gap-[4px]'>
            <CustomTextField
              label='大会名'
              isError={tournNameErrorMessage.length > 0}
              errorMessages={[]}
              required={mode !== 'confirm'}
              displayHelp={mode !== 'confirm'}
              readonly={mode === 'confirm'}
              value={tournamentFormData.tournName}
              onChange={(e) => handleInputChangeTournament('tournName', e.target.value)}
            />
            {/* 大会種別（公式・非公式） */}
            <CustomDropdown
              id='tournType'
              options={tournType.map((item) => ({ key: item.id, value: item.name }))}
              value={
                mode !== 'confirm' ? tournamentFormData.tournType : tournamentFormData.tournTypeName
              }
              onChange={(e) => {
                handleInputChangeTournament('tournType', e.toString());
                handleInputChangeTournament(
                  'tournTypeName',
                  tournType.find((item) => item.id === Number(e))?.name || '',
                );
              }}
              className='rounded self-end w-[100px]'
              readonly={mode === 'confirm'}
            />
          </div>
          <p className='text-caption1 text-systemErrorText'>
            {tournNameErrorMessage?.map((message) => {
              return message;
            })}
          </p>
        </div>
        {/* 主催団体ID */}
        <div className='flex flex-col justify-start'>
          <CustomTextField
            label='主催団体ID'
            isError={sponsorOrgIdErrorMessage.length > 0}
            errorMessages={sponsorOrgIdErrorMessage}
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            readonly={mode === 'confirm'}
            value={tournamentFormData.sponsorOrgId}
            onChange={(e) => handleInputChangeTournament('sponsorOrgId', e.target.value)}
          />
        </div>
        {/* 主催団体名 */}
        {mode === 'confirm' && prevMode === 'update' && (
          <div className='flex flex-col justify-start'>
            <CustomTextField
              label='主催団体名'
              required={mode !== 'confirm'}
              displayHelp={mode !== 'confirm'}
              readonly={mode === 'confirm'}
              value={tournamentFormData.sponsorOrgName}
              onChange={(e) => {}}
            />
          </div>
        )}
        <div className='flex flex-row justify-start gap-[4px]'>
          {/* 開催開始年月日 */}
          <div className='flex flex-col justify-start '>
            <InputLabel
              label='開催開始年月日'
              required={mode !== 'confirm'}
              displayHelp={mode !== 'confirm'}
            ></InputLabel>
            <CustomDatePicker
              selectedDate={tournamentFormData.eventStartDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleInputChangeTournament('eventStartDate', formatDate(e as unknown as Date));
              }}
              readonly={mode === 'confirm'}
              isError={eventStartDateErrorMessage.length > 0}
              errorMessages={eventStartDateErrorMessage}
            />
          </div>
          {/* 開催終了年月日 */}
          <div className='flex flex-col justify-start'>
            <InputLabel
              label='開催終了年月日'
              required={mode !== 'confirm'}
              displayHelp={mode !== 'confirm'}
            ></InputLabel>
            <CustomDatePicker
              selectedDate={tournamentFormData.eventEndDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleInputChangeTournament('eventEndDate', formatDate(e as unknown as Date));
              }}
              readonly={mode === 'confirm'}
              isError={eventEndDateErrorMessage.length > 0}
              errorMessages={eventEndDateErrorMessage}
            />
          </div>
        </div>
        <div className='flex flex-col justify-start gap-[4px]'>
          {/* 開催場所 */}
          <InputLabel
            label={'開催場所'}
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
          ></InputLabel>
          <div className='flex flex-row justify-start gap-[4px]'>
            <CustomDropdown
              id='venue'
              options={venue.map((item) => ({ key: item.id, value: item.name }))}
              value={
                mode !== 'confirm' ? tournamentFormData.venueId : tournamentFormData.venueIdName
              }
              onChange={(e) => {
                handleInputChangeTournament('venueId', e.toString());
                handleInputChangeTournament(
                  'venueIdName',
                  venue.find((item) => item.id === Number(e))?.name || '',
                );
              }}
              className='rounded self-end'
              readonly={mode === 'confirm'}
            />
            {/* 開催場所入力欄 */}
            <div className={`${tournamentFormData.venueId === '0' ? '' : 'hidden'} `}>
              <CustomTextField
                label=''
                isError={venueNameErrorMessage.length > 0}
                readonly={mode === 'confirm'}
                displayHelp={false}
                value={tournamentFormData.venueName}
                onChange={(e) => handleInputChangeTournament('venueName', e.target.value)}
              />
            </div>
          </div>
          <p className='text-caption1 text-systemErrorText'>
            {venueIdErrorMessage.length > 0 &&
              venueIdErrorMessage?.map((message) => {
                return message;
              })}
          </p>
          <p className='text-caption1 text-systemErrorText'>
            {venueNameErrorMessage.length > 0 &&
              venueNameErrorMessage?.map((message) => {
                return message;
              })}
          </p>
        </div>
        {/* 大会個別URL */}
        <div className='flex flex-col justify-start'>
          <CustomTextField
            label='大会個別URL'
            isError={tournUrlErrorMessage.length > 0}
            errorMessages={tournUrlErrorMessage}
            readonly={mode === 'confirm'}
            displayHelp={mode !== 'confirm'}
            value={tournamentFormData.tournUrl}
            onChange={(e) => handleInputChangeTournament('tournUrl', e.target.value)}
          />
        </div>
        {/* 大会要項PDFファイル */}
        <div className='flex flex-col justify-start'>
          <PdfFileUploader
            label='大会要項PDFファイル'
            readonly={!displayFlg || mode === 'confirm'}
            ref={fileUploaderRef}
          ></PdfFileUploader>
          <p className='text-caption1 text-systemErrorText'>
            {tournInfoFailePathErrorMessage?.map((message) => {
              return message;
            })}
          </p>
        </div>
        {/* レース登録テーブル表示 */}
        <div className='overflow-auto'>
          <CustomTable>
            {/* レース登録テーブルヘッダー表示 */}
            <CustomThead>
              <CustomTr>
                {mode === 'update' ? (
                  <>
                    {/* 全選択ボタン */}
                    <CustomTh>
                      {displayFlg && (
                        <CustomButton
                          className='w-[100px]'
                          buttonType='primary'
                          onClick={() => {
                            tableData.length > 0 &&
                              setTableData((prevData) =>
                                prevData.map((data) => ({ ...data, checked: true })),
                              );
                          }}
                        >
                          全選択
                        </CustomButton>
                      )}
                    </CustomTh>
                    {/* 全選択解除ボタン */}
                    <CustomTh>
                      {displayFlg && (
                        <CustomButton
                          className='w-[110px]'
                          buttonType='primary'
                          onClick={() => {
                            tableData.length > 0 &&
                              setTableData((prevData) =>
                                prevData.map((data) => ({ ...data, checked: false })),
                              );
                          }}
                        >
                          全選択解除
                        </CustomButton>
                      )}
                    </CustomTh>
                    <CustomTh align='center' colSpan={7}>
                      レース登録
                    </CustomTh>
                    <CustomTh align='center'>{addCustomButton}</CustomTh>
                  </>
                ) : mode === 'create' ? (
                  <>
                    <CustomTh align='center' colSpan={8}>
                      レース登録
                    </CustomTh>
                    <CustomTh align='center'>{addCustomButton}</CustomTh>
                  </>
                ) : prevMode === 'update' ? (
                  <CustomTh align='center' colSpan={9}>
                    レース登録
                  </CustomTh>
                ) : (
                  <CustomTh align='center' colSpan={8}>
                    レース登録
                  </CustomTh>
                )}
              </CustomTr>
              <CustomTr>
                {mode !== 'confirm' ? <CustomTh align='center'>削除</CustomTh> : <></>}
                {(mode === 'update' || prevMode === 'update') && (
                  <CustomTh align='center'>レースID</CustomTh>
                )}
                <CustomTh align='center'>エントリーシステムのレースID</CustomTh>
                <CustomTh align='center'>
                  {mode !== 'confirm' && <p className='text-caption2 text-systemErrorText'>必須</p>}
                  レースNo.
                </CustomTh>
                <CustomTh align='center'>
                  {mode !== 'confirm' && <p className='text-caption2 text-systemErrorText'>必須</p>}
                  種目
                </CustomTh>
                <CustomTh align='center'>
                  {mode !== 'confirm' && <p className='text-caption2 text-systemErrorText'>必須</p>}
                  レース名
                </CustomTh>
                <CustomTh align='center'>
                  {mode !== 'confirm' && <p className='text-caption2 text-systemErrorText'>必須</p>}
                  レース区分ID
                </CustomTh>
                <CustomTh align='center'>
                  {mode !== 'confirm' && <p className='text-caption2 text-systemErrorText'>必須</p>}
                  組別
                </CustomTh>
                <CustomTh align='center'>
                  {mode !== 'confirm' && <p className='text-caption2 text-systemErrorText'>必須</p>}
                  距離
                </CustomTh>
                <CustomTh align='center'>
                  {mode !== 'confirm' && <p className='text-caption2 text-systemErrorText'>必須</p>}
                  発艇日時
                </CustomTh>
              </CustomTr>
            </CustomThead>
            {/* レース登録テーブル明細表示 */}
            <CustomTbody>
              {tableData.map((row) => (
                <CustomTr key={row.id}>
                  {mode === 'update' && (
                    <CustomTd align='center'>
                      <OriginalCheckbox
                        id={'delete-' + row.id}
                        label={''}
                        value={'delete-' + row.id}
                        checked={row.checked}
                        onChange={(e) => handleInputChangeRace(row.id, 'checked', e.target.checked)}
                      />
                    </CustomTd>
                  )}
                  {(mode === 'update' || prevMode === 'update') && (
                    <CustomTd>
                      {mode === 'confirm' ? (
                        <p className='h-12 text-secondaryText py-3 disable'>{row.raceId}</p>
                      ) : (
                        <TextField
                          type={'text'}
                          value={row.raceId}
                          onChange={(e) => handleInputChangeRace(row.id, 'raceId', e.target.value)}
                          className='my-[8px]'
                        />
                      )}
                    </CustomTd>
                  )}
                  {/* 削除ボタン */}
                  {mode === 'create' && (
                    <CustomTd>
                      {displayFlg && (
                        <CustomButton
                          className='secondary w-[60px]'
                          onClick={() => {
                            setTableData((prevData) =>
                              prevData.filter((data) => data.id !== row.id),
                            );
                          }}
                        >
                          削除
                        </CustomButton>
                      )}
                    </CustomTd>
                  )}
                  {mode === 'confirm' ? (
                    <>
                      {/* エントリーシステムのレースID */}
                      <CustomTd textType='secondary'>{row.entrysystemRaceId}</CustomTd>
                      {/* レースNo. */}
                      <CustomTd textType='secondary'>{row.raceNumber}</CustomTd>
                      {/* 種目 */}
                      <CustomTd textType='secondary'>{row.eventName}</CustomTd>
                      {/* レース名 */}
                      <CustomTd textType='secondary'>{row.raceName}</CustomTd>
                      <CustomTd textType='secondary'>
                        {/* レース区分 */}
                        <div className='flex flex-row gap-[8px] items-center'>
                          {row.raceTypeName}
                          {/* レース区分名 */}
                          <div className={`${row.raceType === '999' ? '' : 'hidden'} `}>
                            {row.otherRaceName}
                          </div>
                        </div>
                      </CustomTd>
                      {/* 組別 */}
                      <CustomTd textType='secondary'>{row.byGroup}</CustomTd>
                      {/* 距離 */}
                      <CustomTd textType='secondary'>{row.range}</CustomTd>
                      {/* 発艇日時 */}
                      <CustomTd textType='secondary'>{row.startDateTime}</CustomTd>
                    </>
                  ) : (
                    raceRowComp(row)
                  )}
                </CustomTr>
              ))}
            </CustomTbody>
          </CustomTable>
        </div>
        {
          // エラーメッセージの表示
          (raceNumberErrorMessage.length > 0 ||
            eventIdErrorMessage.length > 0 ||
            raceNameErrorMessage.length > 0 ||
            raceTypeErrorMessage.length > 0 ||
            raceTypeNameErrorMessage.length > 0 ||
            byGroupErrorMessage.length > 0 ||
            rangeErrorMessage.length > 0 ||
            startDateTimeErrorMessage.length > 0) && (
            <div key='tableErrorMessage' className='text-caption1 text-systemErrorText'>
              <p>{raceNumberErrorMessage}</p>
              <p>{eventIdErrorMessage}</p>
              <p>{raceNameErrorMessage}</p>
              <p>{raceTypeErrorMessage}</p>
              <p>{raceTypeNameErrorMessage}</p>
              <p>{byGroupErrorMessage}</p>
              <p>{rangeErrorMessage}</p>
              <p>{startDateTimeErrorMessage}</p>
            </div>
          )
        }
        <div className='flex flex-row justify-center gap-[16px] my-[30px]'>
          {/* 戻るボタン */}
          {displayFlg && (
            <CustomButton
              onClick={() => {
                router.back();
              }}
              buttonType='secondary'
            >
              戻る
            </CustomButton>
          )}
          {displayFlg && modeCustomButtons[prevMode as keyof typeof modeCustomButtons]}
        </div>
      </main>
    </div>
  );
}
