// 機能名: 大会登録・更新
'use client';

// Reactおよび関連モジュールのインポート
import axios from '@/app/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
// コンポーネントのインポート
import {
  CustomButton,
  CustomDatePicker,
  CustomDropdown,
  CustomTable,
  CustomTbody,
  CustomTd,
  CustomTextField,
  CustomTh,
  CustomThead,
  CustomTitle,
  CustomTr,
  ErrorBox,
  InputLabel,
  OriginalCheckbox,
} from '@/app/components';
import PdfFileUploader from './pdfFileUploader';

import {
  ApprovalType,
  CheckOrgManager,
  CheckOrgManagerRequest,
  Event,
  EventResponse,
  Race,
  RaceType,
  RaceTypeResponse,
  Tournament,
  TourTypeResponse,
  Venue,
  VenueResponse,
} from '@/app/types';

import { useUserType } from '@/app/hooks/useUserType';
import { fetcher } from '@/app/lib/swr';
import {
  getSessionStorage,
  getStorageKey,
  removeSessionStorage,
  setSessionStorage,
} from '@/app/utils/sessionStorage';
import Validator from '@/app/utils/validator';
import TextField from '@mui/material/TextField';
import useSWRMutation from 'swr/mutation';
import { formatDate } from '@/app/utils/dateUtil';

const sendCheckOrgManagerRequest = async (
  url: string,
  trigger: { arg: CheckOrgManagerRequest },
) => {
  return fetcher<CheckOrgManager>({
    url,
    method: 'POST',
    data: trigger.arg,
  });
};

// ファイル関連のアクションを扱うためのインターフェース
interface FileHandler {
  clearFile(): void;
}

type TournamentFormData = {
  tournamentFormData: Tournament;
  tableData: Race[];
};

export default function Tournaments() {
  const router = useRouter();
  const fileUploaderRef = useRef<FileHandler>(null);
  const checkOrgManagerMutation = useSWRMutation('api/checkOrgManager', sendCheckOrgManagerRequest);

  // クエリパラメータを取得する
  const searchParams = useSearchParams();
  // modeの値を取得 update, create
  const mode = searchParams.get('mode');
  const isCreateMode = mode === 'create';
  const isUpdateMode = mode === 'update';

  if (mode == null) {
    router.push('/tournament?mode=create');
  }
  const tournId = searchParams.get('tourn_id')?.toString() || '';
  const orgId = searchParams.get('orgId')?.toString() || '';
  const prevMode = searchParams.get('prevMode')?.toString() || 'confirm';
  const source = searchParams.get('source') as 'confirm' | null;

  const [tourn_id, setTournId] = useState<{ tourn_id: string }>({
    tourn_id: tournId,
  });

  useUserType({
    onSuccess: async (userType) => {
      if (isCreateMode) {
        const hasAuthority =
          userType.isAdministrator ||
          userType.isJara ||
          userType.isPrefBoatOfficer ||
          userType.isOrganizationManager;

        if (!hasAuthority) {
          router.replace('/tournamentSearch');
        }
      }

      if (isUpdateMode) {
        const sendData: CheckOrgManagerRequest = {
          tournId: Number(tournId),
        };
        const res = await checkOrgManagerMutation.trigger(sendData);
        const { isOrgManager } = res.result;

        const hasAuthority = userType?.isAdministrator || isOrgManager;

        if (!hasAuthority) {
          router.replace('/tournamentSearch');
        }
      }
    },
  });

  // フォームデータを管理する状態
  const [tableData, setTableData] = useState<Race[]>([]);

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

  const storageKey =
    mode === 'update'
      ? getStorageKey({ pageName: 'tournament', type: 'update', id: tourn_id.tourn_id })
      : getStorageKey({ pageName: 'tournament', type: 'create' });

  const draftFormData = getSessionStorage<TournamentFormData>(storageKey);

  const removeDraftFormData = () => {
    const storageKeyOnConfirmPage =
      prevMode === 'update'
        ? getStorageKey({ pageName: 'tournament', type: 'update', id: tourn_id.tourn_id })
        : getStorageKey({ pageName: 'tournament', type: 'create' });

    removeSessionStorage(storageKeyOnConfirmPage);
  };

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
  const [eventNameErrorMessage, setEventNameErrorMessage] = useState([] as string[]);
  const [raceNameErrorMessage, setRaceNameErrorMessage] = useState([] as string[]);
  const [raceTypeErrorMessage, setRaceTypeErrorMessage] = useState([] as string[]);
  const [raceTypeNameErrorMessage, setRaceTypeNameErrorMessage] = useState([] as string[]);
  const [byGroupErrorMessage, setByGroupErrorMessage] = useState([] as string[]);
  const [rangeErrorMessage, setRangeErrorMessage] = useState([] as string[]);
  const [startDateTimeErrorMessage, setStartDateTimeErrorMessage] = useState([] as string[]);
  const [entrysystemRaceIdErrorMessage, setEntrysystemRaceIdErrorMessage] = useState(
    [] as string[],
  ); //エントリーシステムレースIDの重複メッセージ用 20240506
  const [entryRaceIdErrorMessage, setEntryRaceIdErrorMessage] = useState([] as string[]); //エントリーシステムレースIDのバリデーション用 20240606
  const [raceNumberDuplicatErrorMessage, setRaceNumberDuplicatErrorMessage] = useState(
    [] as string[],
  ); //レースNo.の重複メッセージ用 20240506
  const [errorMessages, setErrorMessages] = useState([] as string[]);

  // バリデーションを実行する関数
  const performValidation = () => {
    //エントリーシステムの大会ID用エラーメッセージ 20240606
    const entrysystemTournIdError = Validator.getErrorMessages([
      tournamentFormData.entrysystem_tourn_id?.length > 0
        ? Validator.validateAlphabetNumber(
            tournamentFormData.entrysystem_tourn_id,
            'エントリーシステムの大会ID',
          )
        : '',
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

    //エントリーシステムのレースIDのバリデーションチェック 20240606
    const entryRaceIdErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない 20240606
      }
      return row.entrysystem_race_id?.length > 0
        ? Validator.validateAlphabetNumber(row.entrysystem_race_id, 'エントリーシステムの大会ID')
            .length > 0
        : false;
    });

    const raceNumberErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない
      }
      return Validator.validateRequired(row.race_number, 'レースNo.').length > 0;
    });
    const raceNumberNegativeErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない
      }
      return Validator.validatePositiveNumber(row.race_number).length > 0;
    });
    const eventIdErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない
      }
      return Validator.validateSelectRequired(row.event_id, '種目').length > 0;
    });

    const eventNameErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない
      }
      return row.event_id === '999'
        ? Validator.validateRequired(row.otherEventName, '種目').length > 0
        : false;
    });

    const raceNameErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない
      }
      return Validator.validateRequired(row.race_name, 'レース名').length > 0;
    });
    const raceTypeErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない
      }
      return Validator.validateRequired(row.race_class_id, 'レース区分').length > 0;
    });
    const raceTypeNameErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない
      }

      return row.race_class_id === '999'
        ? Validator.validateRequired(row.otherRaceClassName, 'レース区分').length > 0
        : false;
    });

    const byGroupErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない
      }
      return Validator.validateRequired(row.by_group, '組別').length > 0;
    });

    const rangeErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない
      }
      return Validator.validateRequired(row.range, '距離').length > 0;
    });
    const rangeNegativeErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない
      }
      return Validator.validatePositiveNumber(row.range).length > 0;
    });

    const startDateTimeErrorFlg = tableData.some((row) => {
      if (row.checked) {
        return false; //削除チェックがされている場合、バリデーションを行わない
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

    //エントリーシステムのレースID 20240606
    if (entryRaceIdErrorFlg) {
      setEntryRaceIdErrorMessage([
        'エントリーシステムの大会IDに使用できる文字は以下になります。使用可能文字: 半角英数字',
      ]);
    } else {
      setEntryRaceIdErrorMessage([]);
    }

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

    if (eventIdErrorFlg) {
      setEventIdErrorMessage(
        Validator.getErrorMessages([Validator.validateSelectRequired(null, '種目')]),
      );
    } else {
      setEventIdErrorMessage([]);
    }

    if (eventNameErrorFlg) {
      setEventNameErrorMessage(
        Validator.getErrorMessages([Validator.validateSelectRequired(null, '種目')]),
      );
    } else {
      setEventNameErrorMessage([]);
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
      entrysystemTournIdError.length > 0 ||
      tournNameError.length > 0 ||
      sponsorOrgIdError.length > 0 ||
      eventStartDateError.length > 0 ||
      eventEndDateError.length > 0 ||
      venueIdError.length > 0 ||
      venueNameError.length > 0 ||
      tournUrlError.length > 0 ||
      eventIdErrorFlg ||
      eventNameErrorFlg ||
      raceNameErrorFlg ||
      entryRaceIdErrorFlg ||
      raceNumberErrorFlg ||
      raceNumberNegativeErrorFlg ||
      raceTypeErrorFlg ||
      raceTypeNameErrorFlg ||
      byGroupErrorFlg ||
      rangeErrorFlg ||
      rangeNegativeErrorFlg ||
      startDateTimeErrorFlg
    ) {
      return true;
    } else {
      return false;
    }
  };

  // エントリーシステムレースIDの重複チェックを行う 20240506
  const entrysystemRaceIdCehck = () => {
    var strArray = Array();
    if (mode == 'create') {
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

    if (strArray.length > 0) {
      //console.log('レースNoエラーあり');
      return true;
    } else {
      //console.log('レースNoエラーなし');
      return false;
    }
  };

  // データ取得
  useEffect(() => {
    const restoreFormData = () => {
      // draftFormDataが存在しない場合は復元しない
      if (!draftFormData || mode === 'confirm') {
        return;
      }

      const setFormData = () => {
        setTournamentFormData(draftFormData.tournamentFormData);
        setTableData(draftFormData.tableData);
      };

      // 確認画面から戻ってきた場合は、draftFormDataを適用する
      if (source === 'confirm') {
        setFormData();
        return;
      }

      if (mode === 'update') {
        const ok = confirm('編集中の入力内容があります。復元しますか？');
        if (!ok) {
          return;
        }
      }

      setFormData();
    };

    const fetchData = async () => {
      const [approvalTypesRes, venuesRes, eventsRes, raceTypesRes] = await Promise.all([
        axios.get<ApprovalType[]>('api/getApprovalType'),
        axios.get<Venue[]>('api/getVenueList'),
        axios.get<Event[]>('api/getEvents'),
        axios.get<RaceType[]>('api/getRaceClass'),
      ]);

      const tourTypeList: TourTypeResponse[] = approvalTypesRes.data.map((x) => ({
        id: x.appro_type_id,
        name: x.appro_type_id_name,
      }));
      setTourType(tourTypeList);

      const venueList: VenueResponse[] = venuesRes.data.map((x) => ({
        id: x.venue_id,
        name: x.venue_name,
      }));
      setVenue(venueList);

      const eventList: EventResponse[] = eventsRes.data.map((x) => ({
        id: x.event_id,
        name: x.event_name,
      }));
      setEvent(eventList);

      const raceTypeList: RaceTypeResponse[] = raceTypesRes.data.map((x) => ({
        id: x.race_class_id,
        name: x.race_class_name,
      }));
      setRaceType(raceTypeList);

      // 更新モードの時に、大会情報を取得する
      if (mode === 'update') {
        try {
          const [tournamentRes, racesRes] = await Promise.all([
            axios.post<{ result: Tournament }>('api/getTournamentInfoData', tourn_id),
            axios.post<{ result: Race[] }>('api/getRaceData', tourn_id),
          ]);

          setTournamentFormData(tournamentRes.data.result);
          setTableData(racesRes.data.result);
          restoreFormData();
        } catch (error) {
          setErrorMessages(['大会情報の取得に失敗しました。']);
        }
      } else if (mode === 'create') {
        setTournamentFormData((prevFormData) => ({
          ...prevFormData,
          ...{
            tourn_id: '',
            entrysystem_tourn_id: '',
            tourn_name: '',
            tourn_type: '0',
            tournTypeName: '非公式',
            sponsor_org_id: orgId,
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

        restoreFormData();
      }
    };
    fetchData();
  }, [mode]);

  const registerData: TournamentFormData = {
    tournamentFormData, //選手情報
    tableData, //選手の出漕結果情報
  };

  // モードに応じたボタンの設定
  const modeCustomButtons = {
    create: (
      <CustomButton
        buttonType='primary'
        onClick={async () => {
          setDisplayFlg(false);
          const isError = performValidation();
          if (!isError) {
            axios
              .post('api/tournamentRegistOrUpdateValidationCheck', {
                entrysystem_tourn_id: tournamentFormData.entrysystem_tourn_id,
                tourn_type: tournamentFormData.tourn_type,
                sponsor_org_id: tournamentFormData.sponsor_org_id,
                mode: prevMode,
                race_data: tableData,
              })
              .then(async (response) => {
                const storeTournamentInfo = async () => {
                  //nullのパラメータを空のパラメータに置き換える
                  Object.keys(registerData.tournamentFormData).forEach((key) => {
                    (registerData.tournamentFormData as any)[key] =
                      (registerData.tournamentFormData as any)[key] ?? '';
                  });
                  await axios
                    .post('api/storeTournamentInfoData', registerData, {
                      headers: {
                        'content-type': 'multipart/form-data',
                      },
                    })
                    .then((response) => {
                      // TODO: 処理成功時の処理
                      setTournamentFormData({} as Tournament);
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
                          otherEventName: '',
                          race_name: '',
                          race_class_id: '',
                          race_class_name: '',
                          otherRaceClassName: '',
                          by_group: '',
                          range: '',
                          start_date_time: '',
                          hasHistory: false,
                          tournName: '',
                        },
                      ]);
                      fileUploaderRef?.current?.clearFile();
                      removeDraftFormData();
                      window.alert('大会情報を登録しました。');
                      router.push(`/tournamentRef?tournId=${response.data.result}`);
                    })
                    .catch((error) => {
                      // TODO: 処理失敗時の処理
                      setErrorMessages(['登録に失敗しました。']);
                    })
                    .finally(() => {
                      setDisplayFlg(true);
                    });
                };
                await storeTournamentInfo();
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

                const errorMessage = error?.response?.data?.message;
                if (errorMessage) {
                  setErrorMessages([errorMessage]);
                }
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
            axios
              .post('api/tournamentRegistOrUpdateValidationCheck', {
                tourn_id: tournamentFormData.tourn_id,
                entrysystem_tourn_id: tournamentFormData.entrysystem_tourn_id,
                tourn_type: tournamentFormData.tourn_type,
                sponsor_org_id: tournamentFormData.sponsor_org_id,
                mode: prevMode,
                race_data: tableData,
              })
              .then(async (response) => {
                const updateTournamentInfo = async () => {
                  //nullのパラメータを空のパラメータに置き換える
                  Object.keys(registerData.tournamentFormData).forEach((key) => {
                    (registerData.tournamentFormData as any)[key] =
                      (registerData.tournamentFormData as any)[key] ?? '';
                  });
                  await axios
                    .post('api/updateTournamentInfoData', registerData, {
                      headers: {
                        'content-type': 'multipart/form-data',
                      },
                    })
                    .then((response) => {
                      // TODO: 処理成功時の処理
                      setTournamentFormData({} as Tournament);
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
                          otherEventName: '',
                          race_name: '',
                          race_class_id: '',
                          race_class_name: '',
                          otherRaceClassName: '',
                          by_group: '',
                          range: '',
                          start_date_time: '',
                          hasHistory: false,
                          tournName: '',
                        },
                      ]);
                      fileUploaderRef?.current?.clearFile();
                      removeDraftFormData();
                      window.alert('大会情報を更新しました。');
                      router.push(
                        `/tournamentRef?tournId=${registerData.tournamentFormData.tourn_id}`,
                      );
                    })
                    .catch((error) => {
                      // TODO: 処理失敗時の処理
                      setErrorMessages(['更新に失敗しました。']);
                    })
                    .finally(() => {
                      setDisplayFlg(true);
                    });
                };
                await updateTournamentInfo();
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

                const errorMessage = error?.response?.data?.message;
                if (errorMessage) {
                  setErrorMessages([errorMessage]);
                }
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
          const isError = performValidation();
          const isEntryRaceIdError = entrysystemRaceIdCehck(); //エントリーシステムのレースIDの重複チェック 20240506
          const isRaceNoError = raceNumberDuplicatCheck(); //レースNo.の重複チェック 20240506

          if (!isError && !isEntryRaceIdError && !isRaceNoError) {
            axios
              .post('api/tournamentRegistOrUpdateValidationCheck', {
                tourn_id: tournamentFormData.tourn_id,
                entrysystem_tourn_id: tournamentFormData.entrysystem_tourn_id,
                tourn_type: tournamentFormData.tourn_type,
                sponsor_org_id: tournamentFormData.sponsor_org_id,
                mode: mode,
                race_data: tableData,
              })
              .then((response) => {
                tournamentFormData.sponsorOrgName = response.data.success.org_name;
                setTableData((prevData) => {
                  return prevData; //全てのデータをバックエンド側に送る 20240311
                });
                setErrorMessages([]);
                setEntrysystemRaceIdErrorMessage([]); //エントリーシステムのレースIDのエラーメッセージを空にする 20240506
                setRaceNumberDuplicatErrorMessage([]); //レースNo.のエラーメッセージを空にする 20240506

                setSessionStorage<TournamentFormData>(storageKey, registerData);
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

                const errorMessage = error?.response?.data?.message;
                if (errorMessage) {
                  setErrorMessages([errorMessage]);
                }
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
            otherEventName: '',
            race_name: '',
            race_class_id: '',
            race_class_name: '',
            otherRaceClassName: '',
            by_group: '',
            range: '',
            start_date_time: '',
            hasHistory: false,
            tournName: '',
          },
        ]);
      }}
    >
      追加
    </CustomButton>
  );

  // テーブルの明細行を作成する関数
  const raceRowComp = (row: Race) => {
    return (
      <>
        {/* エントリーシステムのレースID */}
        <CustomTd>
          <TextField
            type={'text'}
            value={row.entrysystem_race_id}
            onChange={(e) => handleInputChangeRace(row.id, 'entrysystem_race_id', e.target.value)}
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
          <div className='flex gap-1'>
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
              className='rounded'
            />
            {/* その他選択時に表示のテキストボックス */}
            {row.event_id == '999' && (
              <CustomTextField
                label=''
                isError={eventNameErrorMessage.length > 0}
                displayHelp={false}
                readonly={mode === 'confirm'}
                value={row.otherEventName}
                onChange={(e) => handleInputChangeRace(row.id, 'otherEventName', e.target.value)}
                widthClassName='w-[150px]'
              />
            )}
          </div>
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
          <div className='flex gap-1'>
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
                handleInputChangeRace(row.id, 'otherRaceClassName', ''); //レース区分を切り替えた際に、その他のレース区分内容をリセットする
              }}
              className='rounded'
              readonly={mode === 'confirm'}
            />
            {/* その他選択時に表示のテキストボックス */}
            {row.race_class_id == '999' && (
              <CustomTextField
                label=''
                isError={raceTypeNameErrorMessage.length > 0}
                displayHelp={false}
                readonly={mode === 'confirm'}
                value={row.otherRaceClassName}
                onChange={(e) =>
                  handleInputChangeRace(row.id, 'otherRaceClassName', e.target.value)
                }
                widthClassName='w-[150px]'
              />
            )}
          </div>
        </CustomTd>
        {/* 組別 */}
        <CustomTd>
          <TextField
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
                formatDate(e as unknown as string, 'yyyy/MM/dd HH:mm'),
              );
            }}
            className='!w-[200px] text-base'
          />
        </CustomTd>
      </>
    );
  };

  const customBack = () => {
    if (mode !== 'confirm') {
      router.back();
      return;
    }

    if (prevMode === 'create') {
      router.push('/tournament?mode=create&source=confirm');
    }
    if (prevMode === 'update') {
      router.push(`/tournament?mode=update&source=confirm&tourn_id=${tourn_id.tourn_id}`);
    }
  };

  return (
    <>
      <CustomTitle customBack={customBack}>
        {mode === 'create' ? '大会登録' : mode === 'update' ? '大会情報変更' : '大会情報入力確認'}
      </CustomTitle>
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
      <CustomTextField
        label='エントリーシステムの大会ID'
        isError={entrysystemTournIdErrorMessage.length > 0}
        errorMessages={entrysystemTournIdErrorMessage}
        readonly={mode === 'confirm'}
        displayHelp={mode !== 'confirm'}
        value={tournamentFormData.entrysystem_tourn_id}
        onChange={(e) => handleInputChangeTournament('entrysystem_tourn_id', e.target.value)}
        toolTipText='大会エントリーシステムに発番される大会ID
              この大会IDについては、日本ローイング協会にお問い合わせください。' //はてなボタン用
        maxLength={8}
      />
      {/* 大会名 */}
      <div className='flex flex-row gap-4'>
        <CustomTextField
          label='大会名'
          isError={tournNameErrorMessage.length > 0}
          errorMessages={[]}
          required={mode !== 'confirm'}
          displayHelp={mode !== 'confirm'}
          readonly={mode === 'confirm'}
          value={tournamentFormData.tourn_name}
          onChange={(e) => handleInputChangeTournament('tourn_name', e.target.value)}
          toolTipText='開催する大会名と大会種別（公式/非公式）を選択してください。' //はてなボタン用
          widthClassName={ mode !== 'confirm' ? 'w-full' : ''}
        />
        {/* 大会種別（公式・非公式） */}
        <CustomDropdown
          id='tournType'
          options={tournType.map((item) => ({ key: item.id, value: item.name }))}
          value={
            mode !== 'confirm' ? tournamentFormData.tourn_type : tournamentFormData.tournTypeName
          }
          required={mode !== 'confirm'}
          onChange={(e) => {
            handleInputChangeTournament('tourn_type', e?.toString());
            handleInputChangeTournament(
              'tournTypeName',
              tournType.find((item) => item.id === Number(e))?.name || '',
            );
          }}
          className='rounded mt-auto'
          widthClassName='w-[100px]'
          readonly={mode === 'confirm'}
        />
      </div>
      <p className='text-caption1 text-systemErrorText'>
        {tournNameErrorMessage?.map((message) => {
          return message;
        })}
      </p>
      {/* 主催団体ID */}
      <CustomTextField
        label='主催団体ID'
        isError={sponsorOrgIdErrorMessage.length > 0}
        errorMessages={sponsorOrgIdErrorMessage}
        required={mode !== 'confirm'}
        displayHelp={mode !== 'confirm'}
        readonly={mode === 'confirm'}
        value={tournamentFormData.sponsor_org_id}
        onChange={(e) => handleInputChangeTournament('sponsor_org_id', e.target.value)}
        toolTipText='団体IDは団体情報参照画面で確認できます。' //はてなボタン用
      />
      {/* 主催団体名 */}
      {mode === 'confirm' && (prevMode === 'create' || prevMode === 'update') && (
        <CustomTextField
          label='主催団体名'
          required={mode !== 'confirm'}
          displayHelp={mode !== 'confirm'}
          readonly={mode === 'confirm'}
          value={tournamentFormData.sponsorOrgName}
          onChange={(e) => {}}
        />
      )}
      <div className='flex flex-col gap-7 md:flex-row'>
        {/* 開催開始年月日 */}
        <div className='flex flex-col'>
          <InputLabel
            label='開催開始年月日'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            toolTipText='YYYY/MM/DDの形式で入力してください。' //はてなボタン用
          ></InputLabel>
          <CustomDatePicker
            selectedDate={tournamentFormData.event_start_date}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleInputChangeTournament('event_start_date', formatDate(e as unknown as string, 'yyyy/MM/dd'));
            }}
            readonly={mode === 'confirm'}
            isError={eventStartDateErrorMessage.length > 0}
            errorMessages={eventStartDateErrorMessage}
          />
        </div>
        {/* 開催終了年月日 */}
        <div className='flex flex-col'>
          <InputLabel
            label='開催終了年月日'
            required={mode !== 'confirm'}
            displayHelp={mode !== 'confirm'}
            toolTipText='YYYY/MM/DDの形式で入力してください。' //はてなボタン用
          ></InputLabel>
          <CustomDatePicker
            selectedDate={tournamentFormData.event_end_date}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleInputChangeTournament('event_end_date', formatDate(e as unknown as string, 'yyyy/MM/dd'));
            }}
            readonly={mode === 'confirm'}
            isError={eventEndDateErrorMessage.length > 0}
            errorMessages={eventEndDateErrorMessage}
          />
        </div>
      </div>
      <div className='flex flex-col gap-[8px]'>
        {/* 開催場所 */}
        <InputLabel
          label={'開催場所'}
          required={mode !== 'confirm'}
          displayHelp={mode !== 'confirm'}
          toolTipText='大会を開催する水域を選択してください。' //はてなボタン用
        ></InputLabel>
        <CustomDropdown
          id='venue'
          required={mode !== 'confirm'}
          options={venue.map((item) => ({ key: item.id, value: item.name }))}
          value={mode !== 'confirm' ? tournamentFormData.venue_id : tournamentFormData.venue_name}
          onChange={(e) => {
            handleInputChangeTournament('venue_id', e?.toString());
            handleInputChangeTournament(
              'venue_name',
              venue.find((item) => item.id === Number(e))?.name || '',
            );
          }}
          className='rounded w-full'
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
      <CustomTextField
        label='大会個別URL'
        isError={tournUrlErrorMessage.length > 0}
        errorMessages={tournUrlErrorMessage}
        readonly={mode === 'confirm'}
        displayHelp={mode !== 'confirm'}
        value={tournamentFormData.tourn_url}
        onChange={(e) => handleInputChangeTournament('tourn_url', e.target.value)}
        toolTipText='大会用のホームページを公開している場合、URLを入力してください。' //はてなボタン用
      />
      {/* 大会要項PDFファイル */}
      <div className='flex flex-col'>
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
                    <CustomTd textType='secondary'>
                      {row.event_id == '999'
                        ? `${row.event_name} ${row.otherEventName}`
                        : row.event_name}
                    </CustomTd>
                    {/* レース名 */}
                    <CustomTd textType='secondary'>{row.race_name}</CustomTd>
                    {/* レース区分 */}
                    <CustomTd textType='secondary'>
                      {row.race_class_id == '999'
                        ? `${row.race_class_name} ${row.otherRaceClassName}`
                        : row.race_class_name}
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
        (entryRaceIdErrorMessage.length > 0 ||
          raceNumberErrorMessage.length > 0 ||
          raceIdErrorMessage.length > 0 ||
          eventIdErrorMessage.length > 0 ||
          eventNameErrorMessage.length > 0 ||
          raceNameErrorMessage.length > 0 ||
          raceTypeErrorMessage.length > 0 ||
          raceTypeNameErrorMessage.length > 0 ||
          byGroupErrorMessage.length > 0 ||
          rangeErrorMessage.length > 0 ||
          startDateTimeErrorMessage.length > 0 ||
          entrysystemRaceIdErrorMessage.length > 0 ||
          raceNumberDuplicatErrorMessage.length > 0) && (
          <div key='tableErrorMessage' className='text-caption1 text-systemErrorText'>
            <p>{entryRaceIdErrorMessage}</p>
            <p>{raceIdErrorMessage}</p>
            <p>{raceNumberErrorMessage}</p>
            <p>{eventIdErrorMessage}</p>
            <p>{eventNameErrorMessage}</p>
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
      <div className='flex flex-col items-center justify-center gap-[16px] my-[30px] md:flex-row'>
        {/* 戻るボタン */}
        {displayFlg && (
          <CustomButton onClick={() => router.back()} buttonType='secondary'>
            戻る
          </CustomButton>
        )}
        {displayFlg && modeCustomButtons[prevMode as keyof typeof modeCustomButtons]}
      </div>
    </>
  );
}
