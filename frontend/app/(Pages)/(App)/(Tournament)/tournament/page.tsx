// 機能名: 大会登録・更新
'use client';

// Reactおよび関連モジュールのインポート
import React, { useState, useEffect, ChangeEvent, useRef, Dispatch, SetStateAction } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/app/lib/axios';
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
  UserIdType,
} from '@/app/types';

import Validator from '@/app/utils/validator';
import TextField from '@mui/material/TextField';
import { Straight } from '@mui/icons-material';

// ファイル関連のアクションを扱うためのインターフェース
interface FileHandler {
  clearFile(): void;
}

export default function Tournaments() {
  // フック
  const router = useRouter();
  const fileUploaderRef = useRef<FileHandler>(null);

  const [userIdType, setUserIdType] = useState({} as UserIdType); //ユーザIDに紐づいた情報 20240222

  // クエリパラメータを取得する
  const searchParams = useSearchParams();
  // modeの値を取得 update, create
  const mode = searchParams.get('mode');
  if (mode == null) {
    router.push('/tournament?mode=create');
  }
  const tournId = searchParams.get('tourn_id')?.toString() || '';
  const prevMode = searchParams.get('prevMode')?.toString() || 'confirm';

  const [tourn_id, setTournId] = useState<any>({
    tourn_id: tournId,
  });

  // フォームデータを管理する状態
  const [tableData, setTableData] = useState<Race[]>([]);

  // const [raceFormData, setRaceFormData] = useState<Race>({
  //   id: 0,
  //   checked: false,
  //   race_id: '',
  //   entrysystem_race_id: '',
  //   tourn_id: Number(tournId) ?? 0, //大会更新の場合は既に存在する大会IDに紐づける 20240409
  //   race_number: '',
  //   event_id: '',
  //   event_name: '',
  //   race_name: '',
  //   race_class_id: '',
  //   race_class_name: '',
  //   by_group: '',
  //   range: '',
  //   start_date_time: '',
  //   hasHistory: false,
  //   tournName: '',
  // });

  //大会情報 20240202
  const [tournamentFormData, setTournamentFormData] = useState<Tournament>({
    tourn_id: tournId,
    entrysystem_tourn_id: '',
    tourn_name: '',
    tourn_type: '0',
    tournTypeName: '非公式',
    sponsor_org_id: '',
    sponsorOrgName: '',
    event_start_date: new Date().toLocaleDateString('ja-JP'),
    event_end_date: new Date().toLocaleDateString('ja-JP'),
    venue_id: '',
    venue_name: '',
    tourn_url: '',
    tourn_info_faile_path: '',
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
  // const [entrysystemRaceIdErrorMessage, setEntrysystemRaceIdErrorMessage] = useState(
  //   [] as string[],
  // );
  const [entrysystemTournIdErrorMessage, setEntrysystemTournIdErrorMessage] = useState(
    [] as string[],
  ); //エントリーシステムの大会ID用エラーメッセージ 20240409
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
  const [raceIdErrorMessage, setRaceIdErrorMessage] = useState([] as string[]);
  const [raceNumberErrorMessage, setRaceNumberErrorMessage] = useState([] as string[]);
  const [eventIdErrorMessage, setEventIdErrorMessage] = useState([] as string[]);
  const [raceNameErrorMessage, setRaceNameErrorMessage] = useState([] as string[]);
  const [raceTypeErrorMessage, setRaceTypeErrorMessage] = useState([] as string[]);
  const [raceTypeNameErrorMessage, setRaceTypeNameErrorMessage] = useState([] as string[]);
  const [byGroupErrorMessage, setByGroupErrorMessage] = useState([] as string[]);
  const [rangeErrorMessage, setRangeErrorMessage] = useState([] as string[]);
  const [startDateTimeErrorMessage, setStartDateTimeErrorMessage] = useState([] as string[]);
  const [entrysystemRaceIdErrorMessage, setEntrysystemRaceIdErrorMessage] = useState(
    [] as string[],
  ); //エントリーシステムレースIDの重複メッセージ用 20240506
  const [raceNumberDuplicatErrorMessage, setRaceNumberDuplicatErrorMessage] = useState(
    [] as string[],
  ); //レースNo.の重複メッセージ用 20240506
  const [errorMessages, setErrorMessages] = useState([] as string[]);

  const [backKeyFlag, setBackKeyFlag] = useState<boolean>(false); //戻るボタン押下時に前回入力された内容を維持するためのフラグ 20240326

  // バリデーションを実行する関数
  const performValidation = () => {
    // const entrysystemRaceIdError = Validator.getErrorMessages([]);

    //エントリーシステムの大会ID用エラーメッセージ 20240606
    const entrysystemTournIdError = Validator.getErrorMessages([
      Validator.validateAlphabetNumber(tournamentFormData.entrysystem_tourn_id, 'エントリーシステムの大会ID'),
    ]);

    const tournNameError = Validator.getErrorMessages([
      Validator.validateRequired(tournamentFormData.tourn_name, '大会名'),
    ]);
    const sponsorOrgIdError = Validator.getErrorMessages([
      Validator.validateRequired(tournamentFormData.sponsor_org_id, '主催団体ID'),
    ]);
    let eventStartDateError = Validator.getErrorMessages([
      Validator.validateRequired(tournamentFormData.event_start_date, '開催日時'),
    ]);
    const eventEndDateError = Validator.getErrorMessages([
      Validator.validateRequired(tournamentFormData.event_end_date, '終了日時'),
    ]);

    if (eventStartDateError.length < 1) {
      eventStartDateError = Validator.getErrorMessages([
        Validator.compareDates(
          tournamentFormData.event_start_date,
          tournamentFormData.event_end_date,
        ),
      ]);
    }
    const venueIdError = Validator.getErrorMessages([
      Validator.validateRequired(
        tournamentFormData.venue_id,
        '開催場所を選択するか、入力欄に開催場所',
      ),
    ]);
    const venueNameError =
      tournamentFormData.venue_id === '9999'
        ? Validator.getErrorMessages([
            Validator.validateRequired(
              tournamentFormData.venue_name,
              '開催場所を選択するか、入力欄に開催場所',
            ),
          ])
        : [];

    const tournUrlError = Validator.getErrorMessages([
      Validator.validateUrlFormat(tournamentFormData.tourn_url),
    ]);

    const raceNumberErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない 20240508
      }
      return Validator.validateRequired(row.race_number, 'レースNo.').length > 0;
      // if () {
      //   //console.log(Validator.getErrorMessages([Validator.validatePositiveNumber(row.race_number)]));
      //   setRaceNumberErrorMessage(Validator.getErrorMessages([Validator.validatePositiveNumber(row.race_number)]));

      //   return false;
      // } else {
      //   return true;
      // }
    });
    // const raceIdErrorFlg = tableData.some((row) => {
    //   return Validator.validateIntegerRange(row.entrysystem_race_id).length > 0;
    // });
    const raceNumberNegativeErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない 20240508
      }
      return Validator.validatePositiveNumber(row.race_number).length > 0;
    });
    const eventIdErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない 20240508
      }
      return Validator.validateSelectRequired(row.event_id, '種目').length > 0;
    });

    const raceNameErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない 20240508
      }
      return Validator.validateRequired(row.race_name, 'レース名').length > 0;
    });
    const raceTypeErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない 20240508
      }
      return Validator.validateRequired(row.race_class_id, 'レース区分').length > 0;
    });
    const raceTypeNameErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない 20240508
      }
      //console.log(row.race_class_name);
      //console.log(row.race_class_id);
      //console.log(row.otherRaceName);
      return row.race_class_id === '999'
        ? Validator.validateRequired(row.otherRaceName, 'レース区分').length > 0
        : false;
    });

    const byGroupErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない 20240508
      }
      return Validator.validateRequired(row.by_group, '組別').length > 0;
    });

    const rangeErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない 20240508
      }
      return Validator.validateRequired(row.range, '距離').length > 0;
    });
    const rangeNegativeErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない 20240508
      }
      return Validator.validatePositiveNumber(row.range).length > 0;
    });

    const startDateTimeErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない 20240508
      }
      return Validator.validateRequired(row.start_date_time, '発艇日時').length > 0;
    });

    // setEntrysystemRaceIdErrorMessage(entrysystemRaceIdError);
    setEntrysystemTournIdErrorMessage(entrysystemTournIdError);
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
      if (raceNumberNegativeErrorFlg) {
        setRaceNumberErrorMessage(['レースNo.は不正な番号です、1 以上数値を入力してください。']);
      } else {
        setRaceNumberErrorMessage([]);
      }
    }

    // if (raceIdErrorFlg) {
    //   setRaceIdErrorMessage(
    //     Validator.getErrorMessages([
    //       'エントリーシステムのレースIDは不正な番号です、1以上数値と　2147483647以下数値を入力してください。',
    //     ]),
    //   );
    // } else {
    //   setRaceIdErrorMessage([]);
    // }
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
      if (rangeNegativeErrorFlg) {
        setRangeErrorMessage(['距離は不正な番号です、1 以上数値を入力してください。']);
      } else {
        setRangeErrorMessage([]);
      }
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
      // raceIdErrorFlg ||
      raceNumberErrorFlg ||
      raceNumberNegativeErrorFlg ||
      raceTypeErrorFlg ||
      raceTypeNameErrorFlg ||
      byGroupErrorFlg ||
      rangeErrorFlg ||
      rangeNegativeErrorFlg ||
      startDateTimeErrorFlg
    ) {
      //console.log(tournNameError);
      //console.log(sponsorOrgIdError);
      //console.log(eventStartDateError);
      //console.log(eventEndDateError);
      //console.log(venueIdError);
      //console.log(venueNameError);
      //console.log(raceIdErrorFlg);

      return true;
    } else {
      return false;
    }
  };

  // エントリーシステムレースIDの重複チェックを行う 20240506
  const entrysystemRaceIdCehck = () => {
    var strArray = Array();
    if (mode == 'create') {
      //console.log('create check');
      tableData.filter(
        (element, index, self) => (
          self.findIndex(
            (e) =>
              e.entrysystem_race_id == element.entrysystem_race_id &&
              e.checked != true &&
              element.checked != true,
          ) != index
            ? self[index].entrysystem_race_id != '' && self[index].entrysystem_race_id != null
              ? strArray.push(
                  'エントリーシステムのレースIDが重複しています。' +
                    self[index].entrysystem_race_id.toString(),
                )
              : null
            : null,
          setEntrysystemRaceIdErrorMessage(strArray.length > 0 ? strArray[0] : [])
        ),
      );
    } else if (mode == 'update') {
      //console.log('update check');
      tableData.filter(
        (element, index, self) => (
          self.findIndex(
            (e) =>
              e.entrysystem_race_id == element.entrysystem_race_id &&
              e.checked != true &&
              element.checked != true,
          ) != index
            ? self[index].entrysystem_race_id != '' &&
              self[index].entrysystem_race_id != null &&
              self[index].checked != true
              ? strArray.push(
                  'エントリーシステムのレースIDが重複しています。' +
                    self[index].entrysystem_race_id.toString(),
                )
              : null
            : null,
          setEntrysystemRaceIdErrorMessage(strArray.length > 0 ? strArray[0] : [])
        ),
      );
    }
    //console.log(strArray);
    if (strArray.length > 0) {
      //console.log('エントリーシステムエラーあり');
      return true;
    } else {
      //console.log('エントリーシステムエラーなし');
      return false;
    }
  };
  // レースNo.の重複チェックを行う 20240506
  const raceNumberDuplicatCheck = () => {
    var strArray = Array();
    if (mode == 'create') {
      //console.log('create check');
      tableData.filter(
        (element, index, self) => (
          self.findIndex(
            (e) =>
              e.race_number == element.race_number && e.checked != true && element.checked != true,
          ) != index
            ? self[index].race_number != '' && self[index].race_number != null
              ? strArray.push('レースNo.が重複しています。' + self[index].race_number.toString())
              : null
            : null,
          setRaceNumberDuplicatErrorMessage(strArray.length > 0 ? strArray[0] : [])
        ),
      );
    } else if (mode == 'update') {
      //console.log('update check');
      tableData.filter(
        (element, index, self) => (
          self.findIndex(
            (e) =>
              e.race_number == element.race_number && e.checked != true && element.checked != true,
          ) != index
            ? self[index].race_number != '' &&
              self[index].race_number != null &&
              self[index].checked != true
              ? strArray.push('レースNo.が重複しています。' + self[index].race_number.toString())
              : null
            : null,
          setRaceNumberDuplicatErrorMessage(strArray.length > 0 ? strArray[0] : [])
        ),
      );
    }

    //console.log(strArray);
    if (strArray.length > 0) {
      //console.log('レースNoエラーあり');
      return true;
    } else {
      //console.log('レースNoエラーなし');
      return false;
    }
  };

  //選手IDに紐づいた情報の取得 20240221
  useEffect(() => {
    const fetchData = async () => {
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        const playerInf = await axios.get('/getIDsAssociatedWithUser');
        setUserIdType(playerInf.data.result[0]); //ユーザIDに紐づいた情報 20240222
      } catch (error: any) {}
    };
    fetchData();
  }, []);

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      // APIを叩いてデータを取得する
      // TODO: データ取得処理の実装置き換え
      const csrf = () => axios.get('/sanctum/csrf-cookie');
      await csrf();
      axios
        // .get<TourTypeResponse[]>('/tourType') getOrganizationType
        .get('/getApprovalType')
        .then((response) => {
          const tourTypeList = response.data.map(
            ({
              appro_type_id,
              appro_type_id_name,
            }: {
              appro_type_id: number;
              appro_type_id_name: string;
            }) => ({ id: appro_type_id, name: appro_type_id_name }),
          );
          setTourType(tourTypeList);
        })
        .catch((error) => {
          // TODO: エラー処理の実装置き換え
          // alert(error);
        });
      // TODO: データ取得処理の実装置き換え
      axios
        // .get<VenueResponse[]>('http://localhost:3100/venue')
        .get('/getVenueList')
        .then((response) => {
          //DBのカラム名と画面側のプロパティ名をマップする 20240202
          const stateList = response.data.map(
            ({ venue_id, venue_name }: { venue_id: number; venue_name: string }) => ({
              id: venue_id,
              name: venue_name,
            }),
          );
          setVenue(stateList);
        })
        .catch((error) => {
          // TODO: エラー処理の実装置き換え
          // alert(error);
        });
      // TODO: データ取得処理の実装置き換え
      axios
        // .get<EventResponse[]>('http://localhost:3100/event')
        .get('/getEvents')
        .then((response) => {
          //DBのカラム名と画面側のプロパティ名をマップする 20240202
          const stateList = response.data.map(
            ({ event_id, event_name }: { event_id: number; event_name: string }) => ({
              id: event_id,
              name: event_name,
            }),
          );
          setEvent(stateList);
        })
        .catch((error) => {
          // TODO: エラー処理の実装置き換え
          // alert(error);
        });
      // TODO: データ取得処理の実装置き換え
      axios
        // .get<RaceTypeResponse[]>('http://localhost:3100/raceType')
        .get('/getRaceClass')
        .then((response) => {
          //DBのカラム名と画面側のプロパティ名をマップする 20240202
          const stateList = response.data.map(
            ({
              race_class_id,
              race_class_name,
            }: {
              race_class_id: number;
              race_class_name: string;
            }) => ({ id: race_class_id, name: race_class_name }),
          );
          setRaceType(stateList);
        })
        .catch((error) => {
          // TODO: エラー処理の実装置き換え
          // alert(error);
        });
      // 更新モードの時に、大会情報を取得する
      if (mode === 'update' && !backKeyFlag) {
        // APIを叩いて、大会情報とレース情報を取得する
        // TODO: データ取得処理の実装置き換え
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        axios
          // .get<Tournament>('http://localhost:3100/tournament')
          .post('/getTournamentInfoData', tourn_id) //大会IDを元に大会情報を取得する
          .then((response) => {
            //console.log(response.data);
            setTournamentFormData(response.data.result);
          })
          .catch((error) => {
            // TODO: エラー処理の実装置き換え
            // alert(error);
          });
        axios
          // .get<Race[]>('/race')
          .post('/getRaceData', tourn_id)
          .then((response) => {
            //console.log(response.data.result);
            setTableData(response.data.result); //「その他」で入力された値を表示できるように修正 20240514
          })
          .catch((error) => {
            // TODO: エラー処理の実装置き換え
            // alert(error);
          });
      } else if (mode === 'create' && !backKeyFlag) {
        setTournamentFormData((prevFormData) => ({
          ...prevFormData,
          ...{
            tourn_id: '',
            entrysystem_tourn_id: '',
            tourn_name: '',
            tourn_type: '0',
            tournTypeName: '非公式',
            sponsor_org_id: '',
            sponsorOrgName: '',
            event_start_date: new Date().toLocaleDateString('ja-JP'),
            event_end_date: new Date().toLocaleDateString('ja-JP'),
            venue_id: '',
            venue_name: '',
            tourn_url: '',
            tourn_info_faile_path: '',
          },
        }));
        setTableData([]);
      }
      setBackKeyFlag(false); //戻るボタン押下時に前回入力された内容を維持するためのフラグ 20240326
      //console.log(backKeyFlag);
    };
    fetchData();
  }, [mode]);
  // モードに応じたボタンの設定
  const modeCustomButtons = {
    create: (
      <CustomButton
        buttonType='primary'
        onClick={async () => {
          setDisplayFlg(false);
          const isError = performValidation();
          if (!isError) {
            const csrf = () => axios.get('/sanctum/csrf-cookie');
            await csrf();

            axios
              // .post('http://localhost:3100/', registerData)
              .post('/tournamentRegistOrUpdateValidationCheck', {
                entrysystem_tourn_id: tournamentFormData.entrysystem_tourn_id,
                tourn_type: tournamentFormData.tourn_type,
                sponsor_org_id: tournamentFormData.sponsor_org_id,
                mode: prevMode,
                race_data: tableData,
              })
              .then((response) => {
                const storeTournamentInfo = async () => {
                  const registerData = {
                    tournamentFormData,
                    tableData,
                  };
                  //nullのパラメータを空のパラメータに置き換える
                  Object.keys(registerData.tournamentFormData).forEach((key) => {
                    (registerData.tournamentFormData as any)[key] =
                      (registerData.tournamentFormData as any)[key] ?? '';
                  });
                  // sendFormData.tournamentFormData = tournamentFormData;
                  // sendFormData.tableData = tableData;
                  //console.log(registerData);
                  const csrf = () => axios.get('/sanctum/csrf-cookie');
                  await csrf();

                  axios
                    // .post('http://localhost:3100/', registerData)
                    .post('/storeTournamentInfoData', registerData, {
                      //ファイルを送るため
                      headers: {
                        'content-type': 'multipart/form-data',
                      },
                    })
                    .then((response) => {
                      //console.log(response);
                      // TODO: 処理成功時の処理
                      setTournamentFormData({} as Tournament);
                      // setRaceFormData({
                      //   id: 0,
                      //   checked: false,
                      //   race_id: '',
                      //   entrysystem_race_id: '',
                      //   tourn_id: 0,
                      //   race_number: '',
                      //   event_id: '',
                      //   event_name: '',
                      //   race_name: '',
                      //   race_class_id: '',
                      //   race_class_name: '',
                      //   by_group: '',
                      //   range: '',
                      //   start_date_time: '',
                      //   hasHistory: false,
                      //   tournName: '',
                      // });
                      setTableData([
                        {
                          id: 0,
                          checked: false,
                          race_id: '',
                          entrysystem_race_id: '',
                          tourn_id: 0,
                          race_number: '',
                          event_id: '',
                          event_name: '',
                          race_name: '',
                          race_class_id: '',
                          race_class_name: '',
                          by_group: '',
                          range: '',
                          start_date_time: '',
                          hasHistory: false,
                          tournName: '',
                        },
                      ]);
                      fileUploaderRef?.current?.clearFile();
                      window.alert('大会情報を登録しました。');
                      router.push(`/tournamentRef?tournId=${response.data.result}`);
                    })
                    .catch((error) => {
                      // TODO: 処理失敗時の処理
                      setErrorMessages([
                        // ...(errorMessages as string[]),
                        // '登録に失敗しました。原因：' + (error as Error).message,
                        '登録に失敗しました。',
                      ]);
                    })
                    .finally(() => {
                      setDisplayFlg(true);
                    });
                };
                storeTournamentInfo();
              })
              .catch((error) => {
                error?.response?.data?.response_entrysystem_tourn_id &&
                  setEntrysystemTournIdErrorMessage([
                    error?.response?.data?.response_entrysystem_tourn_id,
                  ]);
                error?.response?.data?.response_tourn_type &&
                  setTournNameErrorMessage([error?.response?.data?.response_tourn_type]);
                error?.response?.data?.response_org_id &&
                  setSponsorOrgIdErrorMessage([error?.response?.data?.response_org_id]);
                error?.response?.data?.response_race_id &&
                  setRaceNumberErrorMessage(error?.response?.data?.response_race_id);
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
        onClick={async () => {
          setDisplayFlg(false);
          const isError = performValidation();

          if (!isError) {
            const csrf = () => axios.get('/sanctum/csrf-cookie');
            await csrf();

            axios
              // .post('http://localhost:3100/', registerData)
              .post('/tournamentRegistOrUpdateValidationCheck', {
                tourn_id: tournamentFormData.tourn_id,
                entrysystem_tourn_id: tournamentFormData.entrysystem_tourn_id,
                tourn_type: tournamentFormData.tourn_type,
                sponsor_org_id: tournamentFormData.sponsor_org_id,
                mode: prevMode,
                race_data: tableData,
              })
              .then((response) => {
                const updateTournamentInfo = async () => {
                  const registerData = {
                    tournamentFormData, //選手情報
                    tableData, //選手の出漕結果情報
                  };
                  //nullのパラメータを空のパラメータに置き換える
                  Object.keys(registerData.tournamentFormData).forEach((key) => {
                    (registerData.tournamentFormData as any)[key] =
                      (registerData.tournamentFormData as any)[key] ?? '';
                  });
                  //console.log(registerData);
                  axios
                    // .post('http://localhost:3100/', registerData)
                    .post('/updateTournamentInfoData', registerData, {
                      //ファイルを送るため
                      headers: {
                        'content-type': 'multipart/form-data',
                      },
                    })
                    .then((response) => {
                      // TODO: 処理成功時の処理
                      setTournamentFormData({} as Tournament);
                      // setRaceFormData({
                      //   id: 0,
                      //   checked: false,
                      //   race_id: '',
                      //   entrysystem_race_id: '',
                      //   tourn_id: 0,
                      //   race_number: '',
                      //   event_id: '',
                      //   event_name: '',
                      //   race_name: '',
                      //   race_class_id: '',
                      //   race_class_name: '',
                      //   by_group: '',
                      //   range: '',
                      //   start_date_time: '',
                      //   hasHistory: false,
                      //   tournName: '',
                      // });
                      setTableData([
                        {
                          id: 0,
                          checked: false,
                          race_id: '',
                          entrysystem_race_id: '',
                          tourn_id: 0,
                          race_number: '',
                          event_id: '',
                          event_name: '',
                          race_name: '',
                          race_class_id: '',
                          race_class_name: '',
                          by_group: '',
                          range: '',
                          start_date_time: '',
                          hasHistory: false,
                          tournName: '',
                        },
                      ]);
                      fileUploaderRef?.current?.clearFile();
                      window.alert('大会情報を更新しました。');
                      router.push(
                        `/tournamentRef?tournId=${registerData.tournamentFormData.tourn_id}`,
                      );
                    })
                    .catch((error) => {
                      // TODO: 処理失敗時の処理
                      setErrorMessages([
                        // ...(errorMessages as string[]),
                        // '更新に失敗しました。原因：' + (error as Error).message,
                        '更新に失敗しました。',
                      ]);
                    })
                    .finally(() => {
                      setDisplayFlg(true);
                    });
                };
                updateTournamentInfo();
              })
              .catch((error) => {
                error?.response?.data?.response_entrysystem_tourn_id &&
                  setEntrysystemTournIdErrorMessage([
                    error?.response?.data?.response_entrysystem_tourn_id,
                  ]);
                error?.response?.data?.response_tourn_type &&
                  setTournNameErrorMessage([error?.response?.data?.response_tourn_type]);
                error?.response?.data?.response_org_id &&
                  setSponsorOrgIdErrorMessage([error?.response?.data?.response_org_id]);
                error?.response?.data?.response_race_id &&
                  setRaceNumberErrorMessage(error?.response?.data?.response_race_id);
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
        onClick={async () => {
          setDisplayFlg(false);
          //console.log(tableData);
          const isError = performValidation();
          //console.log(isError);
          const isEntryRaceIdError = entrysystemRaceIdCehck(); //エントリーシステムのレースIDの重複チェック 20240506
          const isRaceNoError = raceNumberDuplicatCheck(); //レースNo.の重複チェック 20240506

          if (!isError && !isEntryRaceIdError && !isRaceNoError) {
            const csrf = () => axios.get('/sanctum/csrf-cookie');
            await csrf();
            axios
              // .post('http://localhost:3100/', registerData)
              .post('/tournamentRegistOrUpdateValidationCheck', {
                tourn_id: tournamentFormData.tourn_id,
                entrysystem_tourn_id: tournamentFormData.entrysystem_tourn_id,
                tourn_type: tournamentFormData.tourn_type,
                sponsor_org_id: tournamentFormData.sponsor_org_id,
                mode: mode,
                race_data: tableData,
              })
              .then((response) => {
                //console.log(tableData);
                //console.log(response);
                //console.log(tournamentFormData);
                tournamentFormData.sponsorOrgName = response.data.success.org_name;
                setTableData((prevData) => {
                  // return prevData.filter((row) => {
                  //   return !row.checked;
                  // });
                  return prevData; //全てのデータをバックエンド側に送る 20240311
                });
                setErrorMessages([]);
                setEntrysystemRaceIdErrorMessage([]); //エントリーシステムのレースIDのエラーメッセージを空にする 20240506
                setRaceNumberDuplicatErrorMessage([]); //レースNo.のエラーメッセージを空にする 20240506
                router.push('/tournament?mode=confirm&prevMode=' + mode);
              })
              .catch((error) => {
                error?.response?.data?.response_entrysystem_tourn_id &&
                  setEntrysystemTournIdErrorMessage([
                    error?.response?.data?.response_entrysystem_tourn_id,
                  ]);
                error?.response?.data?.response_tourn_type &&
                  setTournNameErrorMessage([error?.response?.data?.response_tourn_type]);
                error?.response?.data?.response_org_id &&
                  setSponsorOrgIdErrorMessage([error?.response?.data?.response_org_id]);
                error?.response?.data?.response_race_id &&
                  setRaceNumberErrorMessage(error?.response?.data?.response_race_id);
              });
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
        //console.log(tableData.length);
        //console.log(tableData);
        setTableData((prevData) => [
          ...prevData,
          {
            id: tableData.length + 1,
            checked: false,
            race_id: '',
            entrysystem_race_id: '',
            tourn_id: Number(tournId) ?? 0, //大会更新の場合は既に存在する大会IDに紐づける 20240409
            race_number: '',
            event_id: '',
            event_name: '',
            race_name: '',
            race_class_id: '',
            race_class_name: '',
            by_group: '',
            range: '',
            start_date_time: '',
            hasHistory: false,
            tournName: '',
          },
        ]);
        // フォームデータをリセット
        // setRaceFormData({
        //   id: 1,
        //   checked: false,
        //   race_id: '',
        //   entrysystem_race_id: '',
        //   tourn_id: Number(tournId) ?? 0, //大会更新の場合は既に存在する大会IDに紐づける 20240409
        //   race_number: '',
        //   event_id: '',
        //   event_name: '',
        //   race_name: '',
        //   race_class_id: '',
        //   race_class_name: '',
        //   by_group: '',
        //   range: '',
        //   start_date_time: '',
        //   hasHistory: false,
        //   tournName: '',
        // });
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
        {/* エントリーシステムのレースID */}
        <CustomTd>
          <TextField
            type={'text'}
            value={row.entrysystem_race_id}
            onChange={(e) =>
              //console.log(tableData),
              handleInputChangeRace(row.id, 'entrysystem_race_id', e.target.value)
            }
            className='my-[8px]'
            inputProps={{ maxLength: 8 }}
          />
        </CustomTd>
        {/* レースNo. */}
        <CustomTd>
          <TextField
            type={'number'}
            value={row.race_number}
            onChange={(e) => {
              handleInputChangeRace(row.id, 'race_number', e.target.value);
            }}
            InputProps={{ inputProps: { min: 1 } }}
            className='w-[150px]'
          />
        </CustomTd>
        {/* 種目 */}
        <CustomTd>
          <CustomDropdown
            id='event'
            options={event.map((item) => ({ key: item.id, value: item.name }))}
            value={row.event_id}
            onChange={(e) => {
              handleInputChangeRace(row.id, 'event_id', e);
              handleInputChangeRace(
                row.id,
                'event_name',
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
            value={row.race_name}
            onChange={(e) => handleInputChangeRace(row.id, 'race_name', e.target.value)}
            className='w-[150px]'
          />
        </CustomTd>
        {/* レース区分 */}
        <CustomTd>
          <div className='flex flex-row gap-[4px]'>
            <CustomDropdown
              id='raceType'
              options={raceType.map((item) => ({ key: item.id, value: item.name }))}
              value={row.race_class_id}
              onChange={(e) => {
                handleInputChangeRace(row.id, 'race_class_id', e.toString());
                handleInputChangeRace(
                  row.id,
                  'race_class_name',
                  raceType.find((item) => item.id === Number(e))?.name || '',
                );
                handleInputChangeRace(row.id, 'otherRaceName', ''); //レース区分を切り替えた際に、その他のレース区分内容をリセットする 20240308
              }}
              className='border-[0.5px] border-solid border-gray-50 rounded self-end w-[150px]'
              readonly={mode === 'confirm'}
            />
            {/* その他選択時に表示のテキストボックス */}
            <div className={`${row.race_class_id == '999' ? 'visible' : 'hidden'} `}>
              <CustomTextField
                label=''
                isError={raceTypeNameErrorMessage.length > 0}
                displayHelp={false}
                readonly={mode === 'confirm'}
                value={row.otherRaceName}
                onChange={(e) => handleInputChangeRace(row.id, 'otherRaceName', e.target.value)}
                className='w-[150px]'
              />
            </div>
          </div>
        </CustomTd>
        {/* 組別 */}
        <CustomTd>
          <TextField
            // type={'number'}
            value={row.by_group}
            onChange={(e) => handleInputChangeRace(row.id, 'by_group', e.target.value)}
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
            InputProps={{ inputProps: { min: 1 } }}
          />
        </CustomTd>
        {/* 発艇日時 */}
        <CustomTd>
          <CustomDatePicker
            selectedDate={row.start_date_time}
            useTime={true}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleInputChangeRace(
                row.id,
                'start_date_time',
                formatDateTime(e as unknown as Date),
              );
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
            value={tournamentFormData.tourn_id}
          />
        </div>
        {/* エントリーシステムの大会ID */}
        <div className='flex flex-col justify-start'>
          {/* システム管理者 JARA職員 団体管理者 の場合、入力欄を表示する */}
          {(userIdType.is_administrator == 1 ||
            userIdType.is_jara == 1 ||
            userIdType.is_pref_boat_officer == 1 ||
            userIdType.is_organization_manager == 1) && (
            <CustomTextField
              label='エントリーシステムの大会ID'
              isError={entrysystemTournIdErrorMessage.length > 0}
              errorMessages={entrysystemTournIdErrorMessage}
              readonly={mode === 'confirm'}
              displayHelp={mode !== 'confirm'}
              value={tournamentFormData.entrysystem_tourn_id}
              onChange={(e) => handleInputChangeTournament('entrysystem_tourn_id', e.target.value)}
              // toolTipTitle='Title エントリーシステムの大会ID' //はてなボタン用
              toolTipText='大会エントリーシステムに発番される大会ID
              この大会IDについては、日本ローイング協会にお問い合わせください。' //はてなボタン用
              maxLength={8}
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
              value={tournamentFormData.tourn_name}
              onChange={(e) => handleInputChangeTournament('tourn_name', e.target.value)}
              // toolTipTitle='Title 大会名' //はてなボタン用
              toolTipText='開催する大会名と大会種別（公式/非公式）を選択してください。' //はてなボタン用
            />
            {/* 大会種別（公式・非公式） */}
            <CustomDropdown
              id='tournType'
              options={tournType.map((item) => ({ key: item.id, value: item.name }))}
              value={
                mode !== 'confirm'
                  ? tournamentFormData.tourn_type
                  : tournamentFormData.tournTypeName
              }
              required={mode !== 'confirm'}
              onChange={(e) => {
                handleInputChangeTournament('tourn_type', e?.toString());
                handleInputChangeTournament(
                  'tournTypeName',
                  tournType.find((item) => item.id === Number(e))?.name || '',
                );
              }}
              className='rounded self-end w-[100px] mt-auto'
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
            value={tournamentFormData.sponsor_org_id}
            onChange={(e) => handleInputChangeTournament('sponsor_org_id', e.target.value)}
            // toolTipTitle='Title 主催団体ID' //はてなボタン用
            toolTipText='団体IDは団体情報参照画面で確認できます。' //はてなボタン用
          />
        </div>
        {/* 主催団体名 */}
        {mode === 'confirm' && (prevMode === 'create' || prevMode === 'update') && (
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
              // toolTipTitle='Title 開催開始年月日' //はてなボタン用
              toolTipText='YYYY/MM/DDの形式で入力してください。' //はてなボタン用
            ></InputLabel>
            <CustomDatePicker
              selectedDate={tournamentFormData.event_start_date}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleInputChangeTournament('event_start_date', formatDate(e as unknown as Date));
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
              // toolTipTitle='Title 開催終了年月日' //はてなボタン用
              toolTipText='YYYY/MM/DDの形式で入力してください。' //はてなボタン用
            ></InputLabel>
            <CustomDatePicker
              selectedDate={tournamentFormData.event_end_date}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleInputChangeTournament('event_end_date', formatDate(e as unknown as Date));
              }}
              readonly={mode === 'confirm'}
              isError={eventEndDateErrorMessage.length > 0}
              errorMessages={eventEndDateErrorMessage}
            />
          </div>
        </div>
        <div className='flex flex-col justify-start gap-[8px]'>
          {/* 開催場所 */}
          <InputLabel
            label={'開催場所'}
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            // toolTipTitle='Title 開催場所' //はてなボタン用
            toolTipText='大会を開催する水域を選択してください。' //はてなボタン用
          ></InputLabel>
          <div className='flex flex-row justify-start gap-[4px]'>
            <CustomDropdown
              id='venue'
              required={mode !== 'confirm'}
              options={venue.map((item) => ({ key: item.id, value: item.name }))}
              value={
                mode !== 'confirm' ? tournamentFormData.venue_id : tournamentFormData.venue_name
              }
              onChange={(e) => {
                handleInputChangeTournament('venue_id', e?.toString());
                handleInputChangeTournament(
                  'venue_name',
                  venue.find((item) => item.id === Number(e))?.name || '',
                );
              }}
              className='rounded self-end w-[300px]'
              readonly={mode === 'confirm'}
            />
            {/* 開催場所入力欄 */}
            <div className={`${tournamentFormData.venue_id == '9999' ? '' : 'hidden'} `}>
              <CustomTextField
                label=''
                isError={venueNameErrorMessage.length > 0}
                readonly={mode === 'confirm'}
                displayHelp={false}
                value={tournamentFormData.venue_name}
                onChange={(e) => handleInputChangeTournament('venue_name', e.target.value)}
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
            value={tournamentFormData.tourn_url}
            onChange={(e) => handleInputChangeTournament('tourn_url', e.target.value)}
            // toolTipTitle='Title 大会個別URL' //はてなボタン用
            toolTipText='大会用のホームページを公開している場合、URLを入力してください。' //はてなボタン用
          />
        </div>
        {/* 大会要項PDFファイル */}
        <div className='flex flex-col justify-start'>
          <PdfFileUploader
            label='大会要項PDFファイル'
            readonly={!displayFlg || mode === 'confirm'}
            ref={fileUploaderRef}
            setTournamentFormData={setTournamentFormData}
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
                    <CustomTh align='center'>{addCustomButton}</CustomTh>
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
                  </>
                ) : mode === 'create' ? (
                  <>
                    <CustomTh align='center'>{addCustomButton}</CustomTh>
                    <CustomTh align='center' colSpan={8}>
                      レース登録
                    </CustomTh>
                  </>
                ) : prevMode === 'update' ? (
                  <CustomTh align='center' colSpan={10}>
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
                {mode === 'confirm' && prevMode === 'update' && (
                  <CustomTh align='center'>削除</CustomTh>
                )}
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
                  レース区分
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
                  {mode === 'confirm' && prevMode === 'update' && (
                    <CustomTd align='center'>
                      <OriginalCheckbox
                        id={'delete-' + row.id}
                        label={''}
                        value={'delete-' + row.id}
                        checked={row.checked}
                        onChange={(e) => handleInputChangeRace(row.id, 'checked', e.target.checked)}
                        readonly
                      />
                    </CustomTd>
                  )}
                  {(mode === 'update' || prevMode === 'update') && (
                    <CustomTd>
                      {mode === 'confirm' ? (
                        <p className='h-12 text-secondaryText py-3 disable'>{row.race_id}</p>
                      ) : (
                        // <TextField
                        //   type={'text'}
                        //   value={row.race_id}
                        //   onChange={(e) => handleInputChangeRace(row.id, 'race_id', e.target.value)}
                        //   className='my-[8px]'
                        // />
                        <p className='h-12 text-secondaryText py-3 disable'>{row.race_id}</p>
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
                            setTableData((prevData) => {
                              var newList = prevData.filter((data) => data.id !== row.id);
                              for (let index = 0; index < newList.length; index++) {
                                newList[index].id = index + 1;
                              }
                              return newList;
                            });
                            //console.log(tableData);
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
                      <CustomTd textType='secondary'>{row.entrysystem_race_id}</CustomTd>
                      {/* レースNo. */}
                      <CustomTd textType='secondary'>{row.race_number}</CustomTd>
                      {/* 種目 */}
                      <CustomTd textType='secondary'>{row.event_name}</CustomTd>
                      {/* レース名 */}
                      <CustomTd textType='secondary'>{row.race_name}</CustomTd>
                      <CustomTd textType='secondary'>
                        {/* レース区分 */}
                        <div className='flex flex-row gap-[8px] items-center'>
                          {row.race_class_name}
                          {/* レース区分名 */}
                          <div className={`${row.race_class_id == '999' ? 'visible' : 'hidden'} `}>
                            {row.otherRaceName}
                          </div>
                        </div>
                      </CustomTd>
                      {/* 組別 */}
                      <CustomTd textType='secondary'>{row.by_group}</CustomTd>
                      {/* 距離 */}
                      <CustomTd textType='secondary'>{row.range}</CustomTd>
                      {/* 発艇日時 */}
                      <CustomTd textType='secondary'>
                        {row.start_date_time?.substring(0, 16)}
                      </CustomTd>
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
            raceIdErrorMessage.length > 0 ||
            eventIdErrorMessage.length > 0 ||
            raceNameErrorMessage.length > 0 ||
            raceTypeErrorMessage.length > 0 ||
            raceTypeNameErrorMessage.length > 0 ||
            byGroupErrorMessage.length > 0 ||
            rangeErrorMessage.length > 0 ||
            startDateTimeErrorMessage.length > 0 ||
            entrysystemRaceIdErrorMessage.length > 0 ||
            raceNumberDuplicatErrorMessage.length > 0) && (
            <div key='tableErrorMessage' className='text-caption1 text-systemErrorText'>
              <p>{raceIdErrorMessage}</p>
              <p>{raceNumberErrorMessage}</p>
              <p>{eventIdErrorMessage}</p>
              <p>{raceNameErrorMessage}</p>
              <p>{raceTypeErrorMessage}</p>
              <p>{raceTypeNameErrorMessage}</p>
              <p>{byGroupErrorMessage}</p>
              <p>{rangeErrorMessage}</p>
              <p>{startDateTimeErrorMessage}</p>
              <p>{raceNumberDuplicatErrorMessage}</p>
              <p>{entrysystemRaceIdErrorMessage}</p>
            </div>
          )
        }
        <div className='flex flex-row justify-center gap-[16px] my-[30px]'>
          {/* 戻るボタン */}
          {displayFlg && (
            <CustomButton
              onClick={() => {
                //console.log(backKeyFlag);
                setBackKeyFlag(true); //戻るボタン押下時に前回入力された内容を維持するためのフラグ 20240326
                //console.log(backKeyFlag);
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
