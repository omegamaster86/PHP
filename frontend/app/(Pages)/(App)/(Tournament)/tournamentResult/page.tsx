// レース結果管理画面
'use client';

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
  Label,
  OriginalCheckbox,
} from '@/app/components';
import { useUserType } from '@/app/hooks/useUserType';
import axios from '@/app/lib/axios';
import { CrewPlayer, MasterResponse, RaceResultRecordsResponse, RaceTable } from '@/app/types';
import Validator from '@/app/utils/validator';
import AddIcon from '@mui/icons-material/Add';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { formatDate } from '@/app/utils/dateUtil';

interface UpdatedRaceResultRecordsResponse extends RaceResultRecordsResponse {
  isAdded: boolean;
}

const initialRaceInfo = {
  race_id: '',
  race_number: 0,
  entrysystem_race_id: 0,
  tourn_id: 0,
  race_name: '',
  race_class_id: 0,
  race_class_name: '',
  otherRaceClassName: '',
  event_id: 0,
  event_name: '',
  otherEventName: '',
  by_group: '',
  range: 0,
  startDateTime: '',
};

const raceResultRecordInitialValue: UpdatedRaceResultRecordsResponse = {
  race_result_record_id: 0,
  tourn_id: 0,
  tourn_name: '',
  official: 0,
  eventStartDate: '',
  org_name: '',
  org_id: '',
  race_number: 0,
  event_name: '',
  race_name: '',
  race_id: '',
  by_group: '',
  crew_name: '',
  rank: 0,
  laptime_500m: 0,
  laptime_1000m: 0,
  laptime_1500m: 0,
  laptime_2000m: 0,
  final_time: 0,
  bNo: 0,
  race_result_notes: '',
  remarkId: 0,
  stroke_rate_avg: 0,
  stroke_rat_500m: 0,
  stroke_rat_1000m: 0,
  stroke_rat_1500m: 0,
  stroke_rat_2000m: 0,
  heart_rate_avg: 0,
  heart_rate_500m: 0,
  heart_rate_1000m: 0,
  heart_rate_1500m: 0,
  heart_rate_2000m: 0,
  attendance: 0,
  player_height: 0,
  player_weight: 0,
  seat_number: 0,
  seat_name: '',
  race_result_record_name: '',
  registered_time: '',
  start_datetime: '',
  wind_speed_2000m_point: null,
  wind_direction_2000m_point: null,
  twentyHundredmWindDirectionName: null,
  wind_speed_1000m_point: null,
  wind_direction_1000m_point: null,
  tenHundredmWindDirectionName: null,
  venue_name: '',
  range: 0,
  order: 0,
  weatherId: 0,
  weatherName: '',
  startDateTime: '',
  deleteFlg: false,
  crewPlayer: [],
  lane_number: 0,
  errorText: '',
  laptimeErrorText: '',
  strokeRateErrorText: '',
  finalHeartRate: 0,
  player_id: '',
  player_name: '',
  sex: 0,
  event_id: 0,
  orgNameErrorText: '',
  crewNameErrorText: '',
  laneNumberErrorText: '',
  rankErrorText: '',
  isAdded: false,
};

const tournamentResultMode = ['create', 'update', 'confirm'];

// レース結果管理画面のメインコンポーネント
export default function TournamentResult() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorText, setErrorText] = useState<string[]>([]);
  const [raceIdErrorText, setRaceIdErrorText] = useState(''); //レースID
  const [raceNameErrorText, setRaceNameErrorText] = useState(''); //レース名
  const [startDateTimeErrorText, setStartDateTimeErrorText] = useState(''); //発艇日時
  const [windSpeed1000mPointErrorText, setWindSpeed1000mPointErrorText] = useState(''); //1000m地点風速
  const [windSpeed2000mPointErrorText, setWindSpeed2000mPointErrorText] = useState(''); //2000m地点風速

  // レース名（マスタ）の設定
  const [raceNameOptions, setRaceNameOptions] = useState<MasterResponse[]>([]);
  // 所属団体（マスタ）の取得
  const [orgOptions, setOrgOptions] = useState<MasterResponse[]>([]);
  // 天候（マスタ）の取得
  const [weatherOptions, setWeatherOptions] = useState<MasterResponse[]>([]);
  // 風向き（マスタ）の取得
  const [windDirectionOptions, setWindDirectionOptions] = useState<MasterResponse[]>([]);
  // レース結果備考（マスタ）の取得
  const [remarkOptions, setRemarkOptions] = useState<MasterResponse[]>([]);
  // シート番号（マスタ）の取得
  const [seatNameIdOptions, setSeatNameIdOptions] = useState<MasterResponse[]>([]);

  // レース基本情報のモデル
  const [raceInfo, setRaceInfo] = useState<RaceTable>(initialRaceInfo);

  // 出漕結果記録情報のモデル（出漕時点情報）
  const [raceResultRecordResponse, setRaceResultRecordResponse] =
    useState<UpdatedRaceResultRecordsResponse>(raceResultRecordInitialValue);

  // 出漕結果記録情報（レース結果情報）のモデル
  const [raceResultRecords, setRaceResultRecords] = useState<UpdatedRaceResultRecordsResponse[]>([
    {
      crewPlayer: [{} as CrewPlayer],
    } as UpdatedRaceResultRecordsResponse,
  ]);

  // 種目マスタに紐づく選手の人数
  const [playerCount, setPlayerCount] = useState<number>(0);

  // 遷移元画面からのパラメータ取得
  const param = useSearchParams();
  const mode = param.get('mode') || '';
  const raceId = param.get('raceId');
  const tournId = param.get('tournId'); // 大会ID
  const eventId = param.get('eventId'); // 種目ID
  const prevMode = param.get('prevMode'); // 遷移元画面のモード

  useUserType({
    onSuccess: (userType) => {
      const hasAuthority =
        userType.isAdministrator ||
        userType.isJara ||
        userType.isPrefBoatOfficer ||
        userType.isOrganizationManager;

      if (!hasAuthority) {
        router.replace(`/tournamentRaceResultRef?raceId=${raceId}`);
      }
    },
  });

  /**
   * レース情報の入力値を管理する関数
   * @param name
   * @param value
   */
  const handleRaceInputChange = (name: string, value: string) => {
    setRaceInfo((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  /**
   * 出漕結果記録情報の入力値を管理する関数
   * @param name
   * @param value
   */
  const handleRaceResultRecordInputChange = (name: string, value: string | null) => {
    setRaceResultRecordResponse((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  /**
   * レース結果情報の入力値を管理する関数
   * @param index
   * @param name
   * @param value
   */
  const handleRaceResultRecordsInputChangebyIndex = (
    index: number,
    name: string,
    value: string,
  ) => {
    setRaceResultRecords((prevFormData) => {
      const newFormData = [...(prevFormData as UpdatedRaceResultRecordsResponse[])];
      if (newFormData[index]) {
        (newFormData[index] as any)[name] = value;
      }
      return newFormData;
    });
  };

  const handleRaceResultRecordsInputChangeBooleanbyIndex = (
    index: number,
    name: string,
    value: boolean,
  ) => {
    setRaceResultRecords((prevFormData) => {
      const newFormData = [...(prevFormData as UpdatedRaceResultRecordsResponse[])];
      if (newFormData[index]) {
        (newFormData[index] as any)[name] = value;
      }
      return newFormData;
    });
  };

  /**
   * クルー選手情報の入力値を管理する関数
   * @param index
   */
  const addCrewPlayerToRaceResultRecords = (index: number) => {
    if (!raceResultRecords[index]?.crewPlayer) {
      raceResultRecords[index].crewPlayer = [{} as CrewPlayer];
    }
    setRaceResultRecords((prevFormData) => {
      // 多次元配列のシャローコピーは2件レコードができるため、ディープコピー
      const newFormData = JSON.parse(JSON.stringify(prevFormData));
      newFormData[index]?.crewPlayer?.push({
        deleteFlg: false, // 削除フラグ
        addonLineFlg: true,
      } as CrewPlayer);
      return newFormData;
    });
  };

  /**
   * クルー選手情報の変更(選手情報ID入力かつフォーカスアウト時)
   * @param index
   * @param crewIndex
   * @param value
   */
  const handleCrewPlayerIdChange = async (index: number, crewIndex: number, value: string) => {
    const sendId = { player_id: value };
    const playerSearch = await axios.post('api/getCrewPlayerInfo', sendId);

    //名前の異なるバックエンド側とフロント側のキーを紐づける 20240410
    if (playerSearch.data.result.length > 0) {
      playerSearch.data.result[0].playerId = playerSearch.data.result[0].player_id;
      playerSearch.data.result[0].playerName = playerSearch.data.result[0].player_name;
      playerSearch.data.result[0].sexId = playerSearch.data.result[0].sex_id;
      playerSearch.data.result[0].sex = playerSearch.data.result[0].sexName;
    }
    const player = playerSearch.data.result[0];
    if (value === '') {
      //選手IDが空になった場合、当該行のすべての項目を空欄にする 20240517
      handleRaceResultRecordsCrewPlayerChangeBooleanbyIndex(index, crewIndex, 'deleteFlg', false); //削除フラグ
      handleRaceResultRecordsCrewPlayerChangebyIndex(index, crewIndex, 'playerName', ''); //選手名
      handleRaceResultRecordsCrewPlayerChangebyIndex(index, crewIndex, 'sex', ''); //性別
      handleRaceResultRecordsCrewPlayerChangebyIndex(index, crewIndex, 'height', ''); //身長
      handleRaceResultRecordsCrewPlayerChangebyIndex(index, crewIndex, 'weight', ''); //体重
      handleRaceResultRecordsCrewPlayerChangebyIndex(index, crewIndex, 'seatName', ''); //シート番号
      handleRaceResultRecordsCrewPlayerChangebyIndex(index, crewIndex, 'fiveHundredmHeartRate', ''); //500m
      handleRaceResultRecordsCrewPlayerChangebyIndex(index, crewIndex, 'tenHundredmHeartRate', ''); //1000m
      handleRaceResultRecordsCrewPlayerChangebyIndex(
        index,
        crewIndex,
        'fifteenHundredmHeartRate',
        '',
      ); //1500m
      handleRaceResultRecordsCrewPlayerChangebyIndex(
        index,
        crewIndex,
        'twentyHundredmHeartRate',
        '',
      ); //2000m
      handleRaceResultRecordsCrewPlayerChangebyIndex(index, crewIndex, 'heartRateAvg', ''); //平均
      handleRaceResultRecordsCrewPlayerChangebyIndex(index, crewIndex, 'attendance', ''); //立ち合い

      var emptyTarget = raceResultRecords[index].crewPlayer[crewIndex];
      Object.keys(emptyTarget).forEach((key) => {
        //更新モードで追加行が入力できる状態を維持するために、「addonLineFlg」以外をnullにする 20240520
        if (key != 'addonLineFlg') {
          (emptyTarget as any)[key] = null;
        }
      });
      return;
    }

    if (!player) {
      setRaceResultRecords((prevFormData) => {
        const newFormData = [...prevFormData];
        newFormData[index].crewPlayer[crewIndex] = {
          ...newFormData[index]?.crewPlayer[crewIndex],
          errorText: 'システムに登録されていない選手のIDです。',
        };
        return newFormData;
      });
      return;
    }

    //選手の重複チェック
    const isExist = raceResultRecords.some((record, i) => {
      return record?.crewPlayer?.some((player, j) => {
        return (
          player.playerId == value &&
          !(index == i && crewIndex == j) &&
          !player.deleteFlg &&
          !record?.crewPlayer[crewIndex].deleteFlg
        );
      });
    });
    if (isExist) {
      setRaceResultRecords((prevFormData) => {
        const newFormData = [...prevFormData];
        newFormData[index].crewPlayer[crewIndex] = {
          ...newFormData[index]?.crewPlayer[crewIndex],
          errorText: '重複する選手IDです。',
        };
        return newFormData;
      });
      return;
    }

    // 取得した選手IDに紐づく選手情報をセット
    setRaceResultRecords((prevFormData) => {
      const newFormData = [...prevFormData];
      newFormData[index].crewPlayer[crewIndex] = {
        ...newFormData[index]?.crewPlayer[crewIndex],
        playerId: value,
        playerName: player ? '*' + player.playerName : '',
        sex: player?.sex || '',
        height: player?.height || '',
        weight: player?.weight || '',
        deleteFlg: player ? newFormData[index]?.crewPlayer[crewIndex]?.deleteFlg ?? false : false,
        errorText: '',
      };
      return newFormData;
    });
  };

  /**
   * クルー選手情報の変更
   * @param index レース結果情報のインデックス
   * @param crewIndex クルー選手情報のインデックス
   * @param name 変更する項目名
   * @param value 変更する値
   */
  const handleRaceResultRecordsCrewPlayerChangebyIndex = (
    index: number,
    crewIndex: number,
    name: keyof CrewPlayer,
    value: string,
  ) => {
    setRaceResultRecords((prevFormData) => {
      const newFormData = [...prevFormData];
      if (
        newFormData[index]?.crewPlayer[crewIndex] !== null ||
        newFormData[index]?.crewPlayer[crewIndex] !== undefined
      ) {
        newFormData[index].crewPlayer[crewIndex][name] = value as never;
      }

      return newFormData;
    });
  };

  const handleRaceResultRecordsCrewPlayerChangeBooleanbyIndex = (
    index: number,
    crewIndex: number,
    name: keyof CrewPlayer,
    value: boolean,
  ) => {
    setRaceResultRecords((prevFormData) => {
      const newFormData = [...prevFormData];
      if (
        newFormData[index]?.crewPlayer[crewIndex] !== null ||
        newFormData[index]?.crewPlayer[crewIndex] !== undefined
      ) {
        newFormData[index].crewPlayer[crewIndex][name] = value as never;
      }

      return newFormData;
    });
  };

  const clearError = () => {
    // レース結果ごとのエラーメッセージをクリア
    raceResultRecords.map((record, i) => {
      handleRaceResultRecordsInputChangebyIndex(i, 'errorText', '');
      handleRaceResultRecordsInputChangebyIndex(i, 'laptimeErrorText', '');
      handleRaceResultRecordsInputChangebyIndex(i, 'strokeRateErrorText', '');
      record?.crewPlayer?.map((player, j) => {
        handleRaceResultRecordsCrewPlayerChangebyIndex(i, j, 'errorText', '');
      });
    });
    // システムエラーメッセージをクリア
    setErrorText([]);
    setRaceIdErrorText('');
    setRaceNameErrorText('');
    setStartDateTimeErrorText('');
    setWindSpeed1000mPointErrorText('');
    setWindSpeed2000mPointErrorText('');
  };

  /**
   * レース結果情報の入力値をバリデーションする関数 20240516
   * @returns
   */
  const validateRaceResultRecords = () => {
    var errorCount = 0;
    //レースID　必須チェック
    const raceId = Validator.validateRequired(raceInfo?.race_id, 'レースID');
    if (raceId) {
      setRaceIdErrorText(raceId);
      errorCount++;
    }
    //レース名　必須チェック
    const raceName = Validator.validateRequired(raceInfo?.race_name, 'レース名');
    if (raceName) {
      setRaceNameErrorText(raceName);
      errorCount++;
    }
    //発艇日時 必須チェック
    const startDateTime = Validator.validateRequired(
      raceResultRecordResponse?.startDateTime,
      '発艇日時',
    );
    if (startDateTime) {
      setStartDateTimeErrorText(startDateTime);
      errorCount++;
    }
    //1000m地点風速 入力値チェック
    const windSpeed = raceResultRecordResponse.wind_speed_1000m_point;
    if (windSpeed && !/^\d{1,3}$/.test(windSpeed.toString())) {
      setWindSpeed1000mPointErrorText('半角数字で、999までの数字を入力してください。');
      errorCount++;
    }
    //2000m地点風速 入力値チェック
    const windSpeed2 = raceResultRecordResponse.wind_speed_2000m_point;
    if (windSpeed2 && !/^\d{1,3}$/.test(windSpeed2.toString())) {
      setWindSpeed2000mPointErrorText('半角数字で、999までの数字を入力してください。');
      errorCount++;
    }

    //選手情報に全削除チェックされていないかつ、レース結果情報に削除チェックがされていない項目をバリデーションチェック対象とする 20240517
    var validateCheckList = raceResultRecords.filter(
      (item) => !item?.crewPlayer?.every((player) => player.deleteFlg) && !item.deleteFlg,
    );

    //レース結果情報の要素数分ループ
    for (let index = 0; index < validateCheckList.length; index++) {
      //所属団体 空欄チェック
      if (!validateCheckList[index].org_id) {
        validateCheckList[index].orgNameErrorText = '所属団体を選択してください。';
        errorCount++;
      } else {
        validateCheckList[index].orgNameErrorText = '';
      }

      //クルー名　空欄チェック
      if (!validateCheckList[index].crew_name) {
        validateCheckList[index].crewNameErrorText = 'クルー名を入力してください。';
        errorCount++;
      } else {
        validateCheckList[index].crewNameErrorText = '';
      }

      //出漕レーンNo 入力値チェック
      if (
        validateCheckList[index].lane_number &&
        !/^\d{1,2}$/.test(validateCheckList[index]?.lane_number.toString())
      ) {
        validateCheckList[index].laneNumberErrorText =
          '出漕レーンNoは半角数字で、99までの数値を入力してください。';
        errorCount++;
      } else {
        validateCheckList[index].laneNumberErrorText = '';
      }

      //順位 空欄チェック 入力値チェック
      if (!validateCheckList[index].rank) {
        validateCheckList[index].rankErrorText = '順位を入力してください';
        errorCount++;
      } else if (
        validateCheckList[index].rank &&
        !/^\d{1,2}$/.test(validateCheckList[index]?.rank.toString())
      ) {
        validateCheckList[index].rankErrorText =
          '順位は半角数字で、99までの数値を入力してください。';
        errorCount++;
      } else {
        validateCheckList[index].rankErrorText = '';
      }
    }

    //クルー名、所属団体組み合わせ
    validateCheckList.some((record, i) => {
      validateCheckList.some((record2, j) => {
        if (
          i !== j &&
          record.org_id === record2.org_id &&
          record.org_id != '' &&
          record.org_id != null &&
          record.org_id != undefined &&
          record2.org_id != '' &&
          record2.org_id != null &&
          record2.org_id != undefined &&
          record.crew_name === record2.crew_name &&
          record.crew_name != '' &&
          record.crew_name != null &&
          record.crew_name != undefined &&
          record2.crew_name != '' &&
          record2.crew_name != null &&
          record2.crew_name != undefined
        ) {
          handleRaceResultRecordsInputChangebyIndex(
            i,
            'errorText',
            '所属団体とクルー名が同じレース結果情報を登録しようとしています。',
          );
          errorCount++;
        }
      });
    });

    //出漕レーンNo 重複チェック
    //順位 重複チェック
    for (let i = 0; i < validateCheckList.length; i++) {
      for (let j = 0; j < validateCheckList.length; j++) {
        if (
          i != j &&
          validateCheckList[i].lane_number == validateCheckList[j].lane_number &&
          validateCheckList[i].lane_number != null &&
          validateCheckList[i].lane_number != undefined &&
          validateCheckList[j].lane_number != null &&
          validateCheckList[j].lane_number != undefined
        ) {
          handleRaceResultRecordsInputChangebyIndex(
            i,
            'errorText',
            '出漕レーンNoが重複しています。',
          );
          handleRaceResultRecordsInputChangebyIndex(
            j,
            'errorText',
            '出漕レーンNoが重複しています。',
          );
          errorCount++;
        }
      }
    }

    //順位 重複チェック
    for (let i = 0; i < validateCheckList.length; i++) {
      for (let j = 0; j < validateCheckList.length; j++) {
        if (
          i != j &&
          validateCheckList[i].rank == validateCheckList[j].rank &&
          validateCheckList[i].rank != null &&
          validateCheckList[i].rank != undefined &&
          validateCheckList[j].rank != null &&
          validateCheckList[j].rank != undefined
        ) {
          handleRaceResultRecordsInputChangebyIndex(i, 'errorText', '順位が重複しています。');
          handleRaceResultRecordsInputChangebyIndex(j, 'errorText', '順位が重複しています。');
          errorCount++;
        }
      }
    }

    //ラップタイム 空欄チェック 入力値チェック
    validateCheckList.some((record, index) => {
      // エラーに該当するレース結果情報のインデックスを取得する
      if (
        !record.laptime_500m &&
        !record.laptime_1000m &&
        !record.laptime_1500m &&
        !record.laptime_2000m &&
        !record.final_time
      ) {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'laptimeErrorText',
          '「ラップタイム」は、500m～最終タイムまでの何れかにタイムを入力してください。',
        );
        errorCount++;
      } else {
        var lapTimeErrorText = '';
        if (
          record.laptime_500m &&
          !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.laptime_500m.toString())
        ) {
          lapTimeErrorText += '「500mラップタイム」';
        }
        if (
          record.laptime_1000m &&
          !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.laptime_1000m.toString())
        ) {
          lapTimeErrorText += '「1000mラップタイム」';
        }
        if (
          record.laptime_1500m &&
          !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.laptime_1500m.toString())
        ) {
          lapTimeErrorText += '「1500mラップタイム」';
        }
        if (
          record.laptime_2000m &&
          !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.laptime_2000m.toString())
        ) {
          lapTimeErrorText += '「2000mラップタイム」';
        }
        if (record.final_time && !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.final_time.toString())) {
          lapTimeErrorText += '「finalラップタイム」';
        }
        if (lapTimeErrorText.length > 0) {
          lapTimeErrorText += 'は、半角数字で入力してください。MM:SS.99 例）3:05.89';
          handleRaceResultRecordsInputChangebyIndex(index, 'laptimeErrorText', lapTimeErrorText);
          errorCount++;
        }
      }
    });

    //ストロークレート 入力値チェック
    validateCheckList.some((record, index) => {
      if (
        (record.stroke_rat_500m && !/^\d{1,2}$/.test(record?.stroke_rat_500m.toString())) ||
        (record.stroke_rat_1000m && !/^\d{1,2}$/.test(record?.stroke_rat_1000m.toString())) ||
        (record.stroke_rat_1500m && !/^\d{1,2}$/.test(record?.stroke_rat_1500m.toString())) ||
        (record.stroke_rat_2000m && !/^\d{1,2}$/.test(record?.stroke_rat_2000m.toString())) ||
        (record.stroke_rate_avg && !/^\d{1,2}$/.test(record?.stroke_rate_avg.toString()))
      ) {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'strokeRateErrorText',
          '「ストロークレート」は、半角数字で、99までの数字を入力してください。',
        );
        errorCount++;
      }
    });

    //空欄チェック
    validateCheckList.map((record, i) => {
      record?.crewPlayer?.map((player, j) => {
        // 追加行の場合 削除フラグが未チェックかつ、playerの何れかの項目に値が入っている場合に実施
        if (player.addonLineFlg) {
          if (
            !player.deleteFlg &&
            ((player.playerId != undefined && player.playerId != null && player.playerId != '') ||
              (player.playerName != undefined &&
                player.playerName != null &&
                player.playerName != '') ||
              (player.height != undefined && player.height != null) ||
              (player.weight != undefined && player.weight != null) ||
              (player.seatName != undefined && player.seatName != null && player.seatName != '') ||
              (player.fiveHundredmHeartRate != undefined && player.fiveHundredmHeartRate != null) ||
              (player.tenHundredmHeartRate != undefined && player.tenHundredmHeartRate != null) ||
              (player.fifteenHundredmHeartRate != undefined &&
                player.fifteenHundredmHeartRate != null) ||
              (player.twentyHundredmHeartRate != undefined &&
                player.twentyHundredmHeartRate != null) ||
              (player.heartRateAvg != undefined && player.heartRateAvg != null) ||
              (player.attendance != undefined &&
                player.attendance != null &&
                player.attendance != ''))
          ) {
            var errorTextData = '';
            //選手ID 空欄チェック 重複チェック
            if (!player.playerId) {
              errorTextData += '選手IDを入力してください。';
            } else if (player.playerId) {
              for (let index = 0; index < record?.crewPlayer.length; index++) {
                if (
                  index != j &&
                  record?.crewPlayer[index].playerId == player.playerId &&
                  record?.crewPlayer[index].deleteFlg != true
                ) {
                  errorTextData += '重複する選手IDです。';
                  break; //メッセージが２つ以上表示されないようにbreakする
                }
              }
            }

            //選手名 空欄チェック
            if (!player.playerName) {
              errorTextData += '選手名を入力してください。';
            }

            //身長 空欄チェック 入力値チェック
            if (!player.height) {
              errorTextData += '身長を入力してください。';
            } else if (player.height && !/^\d{1,3}(\.\d{1,2})?$/.test(player?.height.toString())) {
              errorTextData += '「身長」は、半角数字で、999.99までの数値を入力してください。';
            }

            //体重 空欄チェック 入力値チェック
            if (!player.weight) {
              errorTextData += '体重を入力してください。';
            } else if (player.weight && !/^\d{1,3}(\.\d{1,2})?$/.test(player?.weight.toString())) {
              errorTextData += '「体重」は、半角数字で、999.99までの数値を入力してください。';
            }

            //シート番号 空欄チェック 重複チェック
            if (!player.seatNameId) {
              errorTextData += 'シート番号を選択してください。';
            } else if (player.seatName) {
              for (let index = 0; index < record?.crewPlayer.length; index++) {
                if (
                  index != j &&
                  record?.crewPlayer[index].seatName == player.seatName &&
                  record?.crewPlayer[index].deleteFlg != true
                ) {
                  errorTextData += 'シート番号が重複しています。';
                  break; //メッセージが２つ以上表示されないようにbreakする
                }
              }
            }

            //心拍数 入力値チェック
            if (
              (player.fiveHundredmHeartRate &&
                !/^\d{1,3}$/.test(player?.fiveHundredmHeartRate.toString())) ||
              (player.tenHundredmHeartRate &&
                !/^\d{1,3}$/.test(player?.tenHundredmHeartRate.toString())) ||
              (player.fifteenHundredmHeartRate &&
                !/^\d{1,3}$/.test(player?.fifteenHundredmHeartRate.toString())) ||
              (player.twentyHundredmHeartRate &&
                !/^\d{1,3}$/.test(player?.twentyHundredmHeartRate.toString())) ||
              (player.heartRateAvg && !/^\d{1,3}$/.test(player?.heartRateAvg.toString()))
            ) {
              errorTextData += '「心拍数」は、半角数字で999までの数値を入力してください。';
            }

            //バリデーション結果の表示
            if (errorTextData.length > 0) {
              handleRaceResultRecordsCrewPlayerChangebyIndex(i, j, 'errorText', errorTextData);
              errorCount++;
            }
          }
        } else {
          // 更新行の場合 削除フラグが未チェックの場合のみ実施
          if (!player.deleteFlg) {
            var errorTextData = '';
            //選手ID 空欄チェック 重複チェック
            if (!player.playerId) {
              errorTextData += '選手IDを入力してください。';
            } else if (player.playerId) {
              for (let index = 0; index < record?.crewPlayer.length; index++) {
                if (
                  index != j &&
                  record?.crewPlayer[index].playerId == player.playerId &&
                  record?.crewPlayer[index].deleteFlg != true
                ) {
                  errorTextData += '重複する選手IDです。';
                  break; //メッセージが２つ以上表示されないようにbreakする
                }
              }
            }

            //選手名 空欄チェック
            if (!player.playerName) {
              errorTextData += '選手名を入力してください。';
            }

            //身長 空欄チェック 入力値チェック
            if (!player.height) {
              errorTextData += '身長を入力してください。';
            } else if (player.height && !/^\d{1,3}(\.\d{1,2})?$/.test(player?.height.toString())) {
              errorTextData += '「身長」は、半角数字で、999.99までの数値を入力してください。';
            }

            //体重 空欄チェック 入力値チェック
            if (!player.weight) {
              errorTextData += '体重を入力してください。';
            } else if (player.weight && !/^\d{1,3}(\.\d{1,2})?$/.test(player?.weight.toString())) {
              errorTextData += '「体重」は、半角数字で、999.99までの数値を入力してください。';
            }

            //シート番号 空欄チェック 重複チェック
            if (!player.seatNameId) {
              errorTextData += 'シート番号を選択してください。';
            } else if (player.seatName) {
              for (let index = 0; index < record?.crewPlayer.length; index++) {
                if (
                  index != j &&
                  record?.crewPlayer[index].seatName == player.seatName &&
                  record?.crewPlayer[index].deleteFlg != true
                ) {
                  errorTextData += 'シート番号が重複しています。';
                  break; //メッセージが２つ以上表示されないようにbreakする
                }
              }
            }

            //心拍数 入力値チェック
            if (
              (player.fiveHundredmHeartRate &&
                !/^\d{1,3}$/.test(player?.fiveHundredmHeartRate.toString())) ||
              (player.tenHundredmHeartRate &&
                !/^\d{1,3}$/.test(player?.tenHundredmHeartRate.toString())) ||
              (player.fifteenHundredmHeartRate &&
                !/^\d{1,3}$/.test(player?.fifteenHundredmHeartRate.toString())) ||
              (player.twentyHundredmHeartRate &&
                !/^\d{1,3}$/.test(player?.twentyHundredmHeartRate.toString())) ||
              (player.heartRateAvg && !/^\d{1,3}$/.test(player?.heartRateAvg.toString()))
            ) {
              errorTextData += '「心拍数」は、半角数字で999までの数値を入力してください。';
            }

            //バリデーション結果の表示
            if (errorTextData.length > 0) {
              handleRaceResultRecordsCrewPlayerChangebyIndex(i, j, 'errorText', errorTextData);
              errorCount++;
            }
          }
        }
      });
    });

    //種目の人数分、登録可能な行が存在することを確認する
    validateCheckList.some((record, index) => {
      var count = 0;
      record?.crewPlayer?.map((player) => {
        //「登録可能」行の条件判定 （削除チェックなし、選手ID、選手名、身長、体重、シート名）
        if (
          !player.deleteFlg &&
          player.playerId != '' &&
          player.playerId != null &&
          player.playerId != undefined &&
          player.playerName != '' &&
          player.playerName != null &&
          player.playerName != undefined &&
          player.height != null &&
          player.height != undefined &&
          player.weight != null &&
          player.weight != undefined &&
          player.seatName != '' &&
          player.seatName != null &&
          player.seatName != undefined
        ) {
          count++;
        }
      });
      // NOTE: 種目「その他」（playerCountが0）の場合は人数制限なし
      if (playerCount > 0 && playerCount != count) {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'errorText',
          '「選手情報」に種目の人数分、登録してください。',
        );
        errorCount++;
      }
    });
    return errorCount;
  };

  useEffect(() => {
    /**
     * モード共通
     * マスタ取得
     */
    const fetchMaster = async () => {
      try {
        const sendData = {
          tourn_id: tournId,
          event_id: eventId,
        };
        const responseDataList = await axios.post('api/getTournLinkRaces', sendData); //大会IDと種目IDに紐づいたレース結果のないレースを取得
        const raceList = responseDataList.data.result.map(
          ({ race_id, race_name }: { race_id: number; race_name: string }) => ({
            id: race_id,
            name: race_name,
          }),
        );
        setRaceNameOptions(raceList);

        const response2 = await axios.get('api/getOrganizations');
        const orgList = response2.data.map(
          ({ org_id, org_name }: { org_id: number; org_name: string }) => ({
            id: org_id,
            name: org_name,
          }),
        );
        setOrgOptions(orgList);

        const response3 = await axios.get('api/getWeatherType');
        const weatherList = response3.data.map(
          ({ weather_id, weather_name }: { weather_id: number; weather_name: string }) => ({
            id: weather_id,
            name: weather_name,
          }),
        );
        setWeatherOptions(weatherList);

        const response4 = await axios.get('api/getWindDirection');
        const windDirectionList = response4.data.map(
          ({
            wind_direction_id,
            wind_direction,
          }: {
            wind_direction_id: number;
            wind_direction: string;
          }) => ({ id: wind_direction_id, name: wind_direction }),
        );
        setWindDirectionOptions(windDirectionList);

        const response5 = await axios.get('api/getRaceResultNotes');
        const raceResultNoteList = response5.data.map(
          ({
            race_result_notes_id,
            race_result_notes,
          }: {
            race_result_notes_id: number;
            race_result_notes: string;
          }) => ({ id: race_result_notes_id, name: race_result_notes }),
        );
        setRemarkOptions(raceResultNoteList);
      } catch (error: any) {
        setErrorText([error.message]);
      }
    };
    fetchMaster();

    /**
     * 登録モード
     * 遷移元より渡された大会IDと種目IDに紐づく「レーステーブル」のレースの内、「出漕結果記録テーブル」に登録されていないレースの「レース情報」を取得する。
     * 取得した「レース情報」の件数が0件の場合、以下のメッセージをポップアップ表示し、「レース結果管理画面」に遷移する。
     * 既に全てのレース結果が登録されています。
     * 新たにレース結果を登録することはできません。
     */
    const fetchRaceInfo = async () => {
      try {
        // レース情報の取得
        const sendData = {
          tourn_id: tournId,
          event_id: eventId,
        };
        const response = await axios.post('api/getRaceDataFromTournIdAndEventId', sendData);
        const data = response.data.result;
        if (data.length === 0) {
          alert('本大会の全レース結果は既に登録されています。');
          router.back();
        }

        // 種目に対応したシート位置（マスタ）の取得 20240514
        const response6 = await axios.post('api/getEventSeatPosForEventID', sendData);

        const response7 = await axios.get('api/getSeatNumber');
        const seatNumberList = response7.data.map(
          ({ seat_id, seat_name }: { seat_id: number; seat_name: string }) => ({
            id: seat_id,
            name: seat_name,
          }),
        );

        // 種目に対応したシート位置になるように要素をフィルタする 20240514
        const newSeatNumberArray = seatNumberList.filter((e: any) => {
          if (e.name == 'ストローク' && response6.data.result[0].seat_s == 1) {
            return e;
          } else if (e.name == '7' && response6.data.result[0].seat_7 == 1) {
            return e;
          } else if (e.name == '6' && response6.data.result[0].seat_6 == 1) {
            return e;
          } else if (e.name == '5' && response6.data.result[0].seat_5 == 1) {
            return e;
          } else if (e.name == '4' && response6.data.result[0].seat_4 == 1) {
            return e;
          } else if (e.name == '3' && response6.data.result[0].seat_3 == 1) {
            return e;
          } else if (e.name == '2' && response6.data.result[0].seat_2 == 1) {
            return e;
          } else if (e.name == 'バウ' && response6.data.result[0].seat_b == 1) {
            return e;
          } else if (e.name == 'コックス' && response6.data.result[0].seat_c == 1) {
            return e;
          }
        });
        setSeatNameIdOptions(newSeatNumberArray); //フィルタ後のリストをセットする 20240514
      } catch (error: any) {
        setErrorText([error.message]);
      }
    };
    if (mode == 'create') {
      fetchRaceInfo();
    }

    /**
     * 更新モード
     * 遷移元より渡されたレースIDに紐づく「レース情報」を、「レーステーブル」から取得する。
     * 遷移元より渡されたレースIDに紐づく「出漕結果記録情報」を、「出漕結果記録テーブル」から取得する
     */
    const fetchRaceInfoForUpdate = async () => {
      try {
        // レース情報の取得
        const raceResponse = await axios.post('api/getRaceDataRaceId', { race_id: raceId });

        const race = raceResponse.data.race_result[0];
        race.startDateTime = race.start_date_time; //バックエンド側のキーをフロント側のキーに入れ直す 20240410

        if (['update', 'confirm'].includes(mode) && race.race_id === '') {
          setErrorText(['レース情報が削除されているため更新できません。']);
          return;
        }

        setRaceInfo(race);

        // 種目に対応したシート位置（マスタ）の取得
        const seatPositionResponse = await axios.post('api/getEventSeatPosForEventID', {
          event_id: eventId || race.event_id,
        });
        const seatPosition = seatPositionResponse.data.result[0];

        // シート番号（マスタ）の取得
        const seatNumberResponse = await axios.get('api/getSeatNumber');
        const seatNumbers = seatNumberResponse.data.map(
          ({ seat_id, seat_name }: { seat_id: number; seat_name: string }) => ({
            id: seat_id,
            name: seat_name,
          }),
        );

        // 種目に対応したシート位置になるように要素をフィルタする
        const newSeatNumberArray = seatNumbers.filter((seatNumber: any) => {
          if (seatNumber.name == 'ストローク' && seatPosition.seat_s == 1) {
            return seatNumber;
          } else if (seatNumber.name == '7' && seatPosition.seat_7 == 1) {
            return seatNumber;
          } else if (seatNumber.name == '6' && seatPosition.seat_6 == 1) {
            return seatNumber;
          } else if (seatNumber.name == '5' && seatPosition.seat_5 == 1) {
            return seatNumber;
          } else if (seatNumber.name == '4' && seatPosition.seat_4 == 1) {
            return seatNumber;
          } else if (seatNumber.name == '3' && seatPosition.seat_3 == 1) {
            return seatNumber;
          } else if (seatNumber.name == '2' && seatPosition.seat_2 == 1) {
            return seatNumber;
          } else if (seatNumber.name == 'バウ' && seatPosition.seat_b == 1) {
            return seatNumber;
          } else if (seatNumber.name == 'コックス' && seatPosition.seat_c == 1) {
            return seatNumber;
          }
        });
        setSeatNameIdOptions(newSeatNumberArray); //フィルタ後のリストをセットする

        // 出漕結果記録情報の取得
        const recordResults = raceResponse.data.record_result;

        // NOTE: レース結果情報が存在しない場合、更新モードで開き直す。
        if (recordResults.length === 0) {
          const url = `/tournamentResult?mode=create&tournId=${race.tourn_id}&eventId=${race.event_id}`;
          router.replace(url);
          return;
        }

        setRaceResultRecordResponse(recordResults[0]);

        // 10件以上は表示できないため、エラーメッセージを表示する
        if (recordResults.length > 10) {
          // 設定するのは10件まで
          setRaceResultRecords(recordResults.slice(0, 10));
          scrollTo(0, 0);
        } else if (recordResults.length > 0 && recordResults.length < 10) {
          //データが10件未満の場合の処理がなかったため追加 20240408
          setRaceResultRecords(recordResults);
          scrollTo(0, 0);
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || `API取得エラー: ${error.message}`;
        setErrorText([errorMessage]);
      }
    };
    if (mode == 'update') {
      fetchRaceInfoForUpdate();
    }
  }, [param]);

  // レース情報の取得
  useEffect(() => {
    const fetchRaceInfo = async () => {
      try {
        let data = [];
        // レース情報の取得
        if (raceId != '' && raceId != null && raceId != undefined) {
          const sendData = {
            race_id: raceId,
          };
          const response = await axios.post('api/getRaceDataRaceId', sendData);

          data = response.data.race_result;

          if (['update', 'confirm'].includes(mode) && data.length === 0) {
            setErrorText(['レース情報が削除されているため更新できません。']);
            return;
          }

          data[0].startDateTime = data[0].start_date_time; //バックエンド側のキーをフロント側のキーに入れ直す 20240422
          // 遷移元からイベントIDが取得できる時だけ、遷移元からのイベントIDをセットする。セットされていない時は、レース情報からイベントIDをセットする。
          setRaceInfo({
            ...data[0],
            eventId: eventId || data[0].eventId,
          });
        }

        if (
          (eventId != '' && eventId != null && eventId != undefined) ||
          (data.length > 0 &&
            data[0].event_id != '' &&
            data[0].event_id != null &&
            data[0].event_id != undefined)
        ) {
          // 種目マスタに紐づく選手の人数 (バックエンドからの取得方法不明のためDummy)
          // TODO: 種目マスタに紐づく選手の人数を取得する
          // const response2 = Math.floor(Math.random() * 5) + 1;
          const sendEventId = {
            event_id: eventId || data[0].event_id,
          };
          const res2 = await axios.post('api/getCrewNumberForEventId', sendEventId);
          const response2 = res2.data.result;

          setPlayerCount(response2);
          if (mode === 'create') {
            // レース結果情報の取得
            // 選手情報の件数が種目マスタに紐づく選手の人数より少ない場合、足りない件数分追加行を追加する
            raceResultRecords.map((record) => {
              if (record?.crewPlayer?.length < response2) {
                record.crewPlayer = record?.crewPlayer.concat(
                  Array.from({ length: response2 }, () => ({
                    race_result_record_id: undefined,
                    playerPhoto: '',
                    playerName: '',
                    jaraPlayerId: '',
                    playerId: '',
                    sexId: '',
                    sex: '',
                    height: undefined,
                    weight: undefined,
                    seatName: '',
                    seatNameId: undefined,
                    entrysystemRaceId: '',
                    orgId1: '',
                    orgName1: '',
                    orgId2: '',
                    orgName2: '',
                    orgId3: '',
                    orgName3: '',
                    fiveHundredmHeartRate: undefined,
                    tenHundredmHeartRate: undefined,
                    fifteenHundredmHeartRate: undefined,
                    twentyHundredmHeartRate: undefined,
                    heartRateAvg: undefined,
                    attendance: '',
                    deleteFlg: false,
                    addonLineFlg: false,
                    errorText: '',
                  })),
                );
              }
              // 種目マスタに紐づく選手の人数より多い場合、余分な行を削除する
              if (record?.crewPlayer?.length > response2) {
                record.crewPlayer = record?.crewPlayer.slice(1, response2 + 1);
              }
              record.isAdded = true;
            }, []);
          }
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || `API取得エラー: ${error.message}`;
        setErrorText([errorMessage]);
      }
    };
    fetchRaceInfo();
  }, [raceInfo.race_id, param]);

  if (!tournamentResultMode.includes(mode)) return null;

  if (['update', 'confirm'].includes(mode) && raceInfo.race_id === '') {
    return (
      <>
        <CustomTitle>
          レース結果{mode === 'create' ? '登録' : mode === 'update' ? '更新' : '入力確認'}
        </CustomTitle>
        <ErrorBox errorText={errorText} />
      </>
    );
  }

  return (
    <>
      <CustomTitle>
        レース結果{mode === 'create' ? '登録' : mode === 'update' ? '更新' : '入力確認'}
      </CustomTitle>
      <ErrorBox errorText={errorText} />
      {/* レース基本情報 */}
      <div className='flex flex-col gap-[20px] border p-[20px]'>
        <Label label='レース基本情報' />
        <div>
          <div className='flex flex-row justify-between gap-[80px]'>
            <div className='flex flex-col justify-between gap-[16px] w-[50%]'>
              <div className='flex flex-col gap-[8px]'>
                <InputLabel label='レースID' required={mode === 'create' || mode === 'update'} />
                <CustomDropdown
                  id='race_id'
                  value={raceInfo?.race_id || ''}
                  options={raceNameOptions.map((item) => ({
                    key: item.id,
                    value: item.id.toString(),
                  }))}
                  className='w-[270px]'
                  onChange={async (e: any) => {
                    handleRaceInputChange('race_id', e as string);
                    handleRaceInputChange(
                      'race_name',
                      raceNameOptions.find((item) => item.id === e)?.name || '',
                    );
                    const sendData = {
                      race_id: e as string,
                    };
                    const response = await axios.post('api/getRaceDataRaceId', sendData);
                    const data = response.data.race_result;
                    if (data.length == 0) {
                      setRaceInfo(initialRaceInfo);
                      if ((e as string) != '' && e != null && e != undefined) {
                        //未選択の場合、エラーメッセージは表示させない 20240516
                        setErrorText(['レース情報が取得できませんでした。']);
                        scrollTo(0, 0);
                      }
                    } else {
                      //名前の異なるバックエンド側とフロント側のキーを紐づける 20240420
                      data[0].startDateTime = data[0].start_date_time;
                      setRaceInfo(data[0]);
                      setErrorText([]);
                    }
                  }}
                  readonly={mode === 'update' || mode === 'confirm'}
                  isError={raceIdErrorText !== ''}
                  errorMessages={[raceIdErrorText]} //レースIDのエラーメッセージを表示 20240515
                />
              </div>
              <div className='flex flex-col gap-[8px]'>
                {mode === 'create' ? (
                  <div className='flex flex-col gap-[8px]'>
                    <InputLabel
                      label='レース名'
                      required={mode === 'create' || mode === 'update'}
                    />
                    <Autocomplete
                      id='race_name'
                      value={{
                        id: Number(raceInfo?.race_id || 0),
                        name: raceInfo?.race_name ?? '',
                      }}
                      disableClearable
                      options={
                        (raceNameOptions?.length > 0 &&
                          raceNameOptions.map((item) => ({ id: item.id, name: item.name }))) || [
                          { id: 0, name: '' },
                        ]
                      }
                      getOptionLabel={(option) => option.name || ''}
                      onChange={async (e, newTarget) => {
                        handleRaceInputChange('race_id', newTarget?.id.toString() || '');
                        handleRaceInputChange('race_name', newTarget?.name || '');
                        const sendData = {
                          race_id: newTarget?.id,
                        };
                        const response = await axios.post('api/getRaceDataRaceId', sendData);
                        const data = response.data.race_result;
                        if (data.length == 0) {
                          setErrorText(['レース情報が取得できませんでした。']);
                          setRaceInfo(initialRaceInfo);
                          scrollTo(0, 0);
                        } else {
                          //名前の異なるバックエンド側とフロント側のキーを紐づける 20240420
                          data[0].startDateTime = data[0].start_date_time;
                          setRaceInfo(data[0]);
                        }
                      }}
                      renderOption={(props, option) => {
                        return (
                          <li {...props} key={option.id}>
                            {option.name}
                          </li>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          key={params.id}
                          className='border-[1px] border-solid border-gray-50 rounded-md bg-white my-1'
                          {...params}
                          value={raceInfo?.race_name || ''}
                        />
                      )}
                    ></Autocomplete>
                  </div>
                ) : (
                  <CustomTextField
                    required={mode === 'update'}
                    label='レース名'
                    value={raceInfo?.race_name || ''}
                    readonly
                    displayHelp={false}
                  />
                )}
              </div>

              <CustomTextField
                label='レースNo'
                value={raceInfo?.race_number?.toString() || ''}
                readonly
                displayHelp={false}
              />
              <CustomTextField
                label='種目'
                value={
                  raceInfo.event_id == 999
                    ? `${raceInfo.event_name} ${raceInfo.otherEventName}`
                    : raceInfo.event_name
                }
                readonly
                displayHelp={false}
              />
            </div>
            <div className='flex flex-col justify-between gap-[1px] w-[50%]'>
              <CustomTextField
                label='レース区分'
                value={
                  raceInfo.race_class_id == 999
                    ? `${raceInfo.race_class_name} ${raceInfo.otherRaceClassName}`
                    : raceInfo.race_class_name
                }
                readonly
                displayHelp={false}
              />
              <CustomTextField
                label='組別'
                value={raceInfo?.by_group || ''}
                readonly
                displayHelp={false}
              />
              <CustomTextField
                label='距離'
                value={raceInfo?.range?.toString() ? raceInfo?.range?.toString() + 'm' : ''}
                readonly
                displayHelp={false}
              />
              <CustomTextField
                label='発艇予定日時'
                value={formatDate(raceInfo?.startDateTime, 'yyyy/MM/dd HH:mm')}
                displayHelp={false}
                readonly
              />
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-[20px] border border-solid p-[20px]'>
        <Label label='出漕時点情報' />
        <div className='flex flex-col justify-between gap-[16px]'>
          <div className='flex flex-row justify-left gap-[20px]'>
            <div className='flex flex-col gap-[8px]'>
              <InputLabel label='発艇日時' required={mode === 'create' || mode === 'update'} />
              {mode === 'create' || mode === 'update' ? (
                <CustomDatePicker
                  selectedDate={raceResultRecordResponse?.startDateTime?.substring(0, 16)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    handleRaceResultRecordInputChange(
                      'startDateTime',
                      (e as unknown as Date)?.toLocaleString().toString().replaceAll('/', '-'),
                    );
                  }}
                  className='w-[200px]'
                  useTime
                  isError={startDateTimeErrorText !== ''}
                  errorMessages={[startDateTimeErrorText]}
                />
              ) : (
                // YYYY/MM/DD HH:MM
                <CustomTextField
                  value={
                    new Date(raceResultRecordResponse?.startDateTime).toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    }) || ''
                  }
                  displayHelp={false}
                  readonly
                />
              )}
            </div>
            {mode !== 'confirm' && (
              <p className='mt-auto text-secondaryText'>※例 2021/12/31 12:34</p>
            )}
          </div>
          <div className='flex flex-row justify-left gap-[80px] item-center'>
            <div className='flex flex-col gap-[8px]'>
              <InputLabel label='天気' />
              <CustomDropdown
                value={
                  mode === 'confirm'
                    ? raceResultRecordResponse?.weatherName || '-'
                    : raceResultRecordResponse?.weatherId?.toString() || ''
                }
                options={weatherOptions.map((item) => ({
                  key: item.id,
                  value: item.name,
                }))}
                className='w-[200px]'
                id='weather'
                onChange={(value) => {
                  handleRaceResultRecordInputChange('weatherId', value === '' ? null : value);
                  handleRaceResultRecordInputChange(
                    'weatherName',
                    weatherOptions.find((item) => item.id === Number(value))?.name || '',
                  );
                }}
                readonly={mode === 'confirm'}
              />
            </div>
          </div>
          <div className='flex flex-row justify-left gap-[80px] item-center'>
            <div className='flex flex-col gap-[8px]'>
              <InputLabel label='1000m地点風向' />
              <CustomDropdown
                id='1000mWindDirection'
                value={
                  mode === 'confirm'
                    ? raceResultRecordResponse?.tenHundredmWindDirectionName || '-'
                    : raceResultRecordResponse?.wind_direction_1000m_point?.toString() || ''
                }
                options={windDirectionOptions.map((item) => ({
                  key: item.id,
                  value: item.name,
                }))}
                className='w-[200px]'
                onChange={(value) => {
                  handleRaceResultRecordInputChange(
                    'wind_direction_1000m_point',
                    value === '' ? null : value,
                  );
                  handleRaceResultRecordInputChange(
                    'tenHundredmWindDirectionName',
                    windDirectionOptions.find((item) => item.id === Number(value))?.name || '',
                  );
                }}
                readonly={mode === 'confirm'}
              />
            </div>
            {/* 単位はm/秒 */}
            <CustomTextField
              label='1000m地点風速'
              value={raceResultRecordResponse?.wind_speed_1000m_point?.toString() || ''}
              displayHelp={false}
              type='number'
              inputAdorment={
                mode === 'confirm' && raceResultRecordResponse?.wind_speed_1000m_point === null
                  ? '-'
                  : 'm/秒'
              }
              onChange={(e) => {
                handleRaceResultRecordInputChange(
                  'wind_speed_1000m_point',
                  e.target.value === '' ? null : e.target.value,
                );
              }}
              readonly={mode === 'confirm'}
              isError={windSpeed1000mPointErrorText !== ''}
              errorMessages={[windSpeed1000mPointErrorText]}
            />
          </div>
          <div className='flex flex-row justify-left gap-[80px] item-center'>
            <div className='flex flex-col gap-[8px]'>
              <InputLabel label='2000m地点風向' />
              <CustomDropdown
                id='2000mWindDirection'
                value={
                  mode === 'confirm'
                    ? raceResultRecordResponse?.twentyHundredmWindDirectionName || '-'
                    : raceResultRecordResponse?.wind_direction_2000m_point?.toString() || ''
                }
                options={windDirectionOptions.map((item) => ({
                  key: item.id,
                  value: item.name,
                }))}
                className='w-[200px]'
                onChange={(value) => {
                  handleRaceResultRecordInputChange(
                    'wind_direction_2000m_point',
                    value === '' ? null : value,
                  );
                  handleRaceResultRecordInputChange(
                    'twentyHundredmWindDirectionName',
                    windDirectionOptions.find((item) => item.id === Number(value))?.name || '',
                  );
                }}
                readonly={mode === 'confirm'}
              />
            </div>
            <CustomTextField
              label='2000m地点風速'
              value={raceResultRecordResponse?.wind_speed_2000m_point?.toString() || ''}
              displayHelp={false}
              type='number'
              inputAdorment={
                mode === 'confirm' && raceResultRecordResponse?.wind_speed_2000m_point === null
                  ? '-'
                  : 'm/秒'
              }
              onChange={(e) => {
                handleRaceResultRecordInputChange(
                  'wind_speed_2000m_point',
                  e.target.value === '' ? null : e.target.value,
                );
              }}
              readonly={mode === 'confirm'}
              isError={windSpeed2000mPointErrorText !== ''}
              errorMessages={[windSpeed2000mPointErrorText]}
            />
          </div>
        </div>
      </div>
      <div className='flex flex-row gap-[20px] p-[20px] justify-between item-center'>
        <div></div>
        {mode !== 'confirm' && (
          <p className='text-systemErrorText leading-loose'>
            ※1つのレースに登録できるクルーは、10クルーまでです。
          </p>
        )}
        {mode !== 'confirm' && (
          <CustomButton
            buttonType='primary'
            onClick={() => {
              // 新規追加するオブジェクトのうち、選手情報（CrewPlayer）の数は種目マスタに紐づく選手の人数とする
              if (raceResultRecords.length < 10) {
                setRaceResultRecords((prevFormData: any) => [
                  {
                    crewPlayer: Array.from(
                      { length: playerCount },
                      () =>
                        ({
                          deleteFlg: false, // 削除フラグ
                          addonLineFlg: true,
                        }) as CrewPlayer,
                    ),
                    isAdded: true,
                  },
                  ...prevFormData,
                ]);
              } else {
                scrollTo(0, 0);
              }
            }}
            className='w-[170px]'
          >
            <AddIcon />
            クルー追加
          </CustomButton>
        )}
      </div>
      {/* レース結果情報 */}
      {raceResultRecords.map((item, index) => (
        <div
          className={`flex flex-col gap-[20px] border border-solid p-[20px] ${
            mode === 'confirm' && item.deleteFlg ? 'bg-gray-500' : ''
          }`}
          key={index}
        >
          <InputLabel label={'レース結果情報' + (raceResultRecords.length - index)} />
          <ErrorBox errorText={item.errorText ? [item.errorText] : []} />
          <div className='flex flex-row justify-between'>
            {!item.isAdded && (
              <div
                onClick={() => {
                  if (mode === 'confirm') {
                    return;
                  }
                  handleRaceResultRecordsInputChangeBooleanbyIndex(
                    index,
                    'deleteFlg',
                    !item.deleteFlg,
                  );
                }}
                className='leading-loose text-primary-500 flex flex-row gap-[8px] items-center cursor-pointer'
              >
                <OriginalCheckbox
                  id={'deleteFlg' + index}
                  value='deleteFlg'
                  checked={item.deleteFlg}
                  onChange={() => {}}
                  readonly={mode === 'confirm'}
                />
                <p className='text-systemErrorText'>このレース結果情報を削除する</p>
              </div>
            )}
            {item.isAdded && mode !== 'confirm' ? (
              <CustomButton
                buttonType='primary'
                onClick={() => {
                  const isOK = confirm('この「レース結果情報」を削除します。よろしいですか？');
                  if (isOK) {
                    setRaceResultRecords((prevFormData) => {
                      const newFormData = [...prevFormData];
                      newFormData.splice(index, 1);
                      return newFormData;
                    });
                  }
                }}
                className='w-[170px]'
              >
                追加の取り消し
              </CustomButton>
            ) : (
              <></>
            )}
          </div>
          <div className='flex flex-col gap-[20px] border border-solid border-gray-300 p-[20px]'>
            <div className='flex flex-row justify-between gap-[80px] w-[800px]'>
              <div className='flex flex-col justify-between gap-[1px]'>
                <div className='flex flex-row justify-left gap-[80px] item-center'>
                  <div className='flex flex-col gap-[8px]'>
                    <InputLabel
                      label='所属団体'
                      required={mode === 'create' || mode === 'update'}
                    />
                    <CustomDropdown
                      value={mode === 'confirm' ? item?.org_name : item?.org_id?.toString() || ''}
                      options={orgOptions.map((item) => ({
                        key: item.id,
                        value: item.name,
                      }))}
                      className='w-[200px]'
                      id='orgName'
                      readonly={mode === 'confirm'}
                      onChange={(e: any) => {
                        handleRaceResultRecordsInputChangebyIndex(index, 'org_id', e);
                        handleRaceResultRecordsInputChangebyIndex(
                          index,
                          'org_name',
                          orgOptions.find((item) => item.id === e)?.name || '',
                        );
                      }}
                      isError={item.orgNameErrorText?.length > 0}
                      errorMessages={[item.orgNameErrorText]}
                    />
                  </div>
                  <CustomTextField
                    label='クルー名'
                    value={item?.crew_name || ''}
                    required={mode === 'create' || mode === 'update'}
                    displayHelp={false}
                    onChange={(e) => {
                      handleRaceResultRecordsInputChangebyIndex(index, 'crew_name', e.target.value);
                    }}
                    readonly={mode === 'confirm'}
                    isError={item.crewNameErrorText?.length > 0}
                    errorMessages={[item.crewNameErrorText]}
                  />
                  <CustomTextField
                    label='出漕レーンNo'
                    value={item?.lane_number?.toString() || ''}
                    displayHelp={false}
                    type='number'
                    onChange={(e) => {
                      handleRaceResultRecordsInputChangebyIndex(
                        index,
                        'lane_number',
                        e.target.value,
                      );
                    }}
                    readonly={mode === 'confirm'}
                    isError={item.laneNumberErrorText?.length > 0}
                    errorMessages={[item.laneNumberErrorText]}
                  />
                </div>
                <div className='flex flex-row justify-left gap-[80px] item-center'>
                  <CustomTextField
                    label='順位'
                    value={item?.rank?.toString() || ''}
                    displayHelp={false}
                    required={mode === 'create' || mode === 'update'}
                    type='number'
                    onChange={(e) => {
                      handleRaceResultRecordsInputChangebyIndex(index, 'rank', e.target.value);
                    }}
                    readonly={mode === 'confirm'}
                    isError={item.rankErrorText?.length > 0}
                    errorMessages={[item.rankErrorText]}
                  />
                </div>
              </div>
            </div>
            <div className='flex flex-col'>
              <div className='border-t border-r border-l border-solid border-gray-300 bg-secondary-50 p-[8px]'>
                <Label label='ラップタイム' />
              </div>
              <div className='flex flex-col gap-[20px] border border-solid border-gray-300 p-[20px]'>
                <div>
                  <div className='flex flex-row justify-between gap-[80px] w-[800px]'>
                    <div className='flex flex-col justify-between gap-[1px]'>
                      <div className='flex flex-row justify-left item-center gap-[10px]'>
                        <CustomTextField
                          label='500m'
                          value={item?.laptime_500m?.toString() || ''}
                          displayHelp={false}
                          onChange={(e) => {
                            handleRaceResultRecordsInputChangebyIndex(
                              index,
                              'laptime_500m',
                              e.target.value,
                            );
                          }}
                          readonly={mode === 'confirm'}
                        />
                        <CustomTextField
                          label='1000m'
                          value={item.laptime_1000m?.toString() || ''}
                          displayHelp={false}
                          onChange={(e) => {
                            handleRaceResultRecordsInputChangebyIndex(
                              index,
                              'laptime_1000m',
                              e.target.value,
                            );
                          }}
                          readonly={mode === 'confirm'}
                        />
                        <CustomTextField
                          label='1500m'
                          value={item.laptime_1500m?.toString() || ''}
                          displayHelp={false}
                          onChange={(e) => {
                            handleRaceResultRecordsInputChangebyIndex(
                              index,
                              'laptime_1500m',
                              e.target.value,
                            );
                          }}
                          readonly={mode === 'confirm'}
                        />
                        <CustomTextField
                          label='2000m'
                          value={item.laptime_2000m?.toString() || ''}
                          displayHelp={false}
                          onChange={(e) => {
                            handleRaceResultRecordsInputChangebyIndex(
                              index,
                              'laptime_2000m',
                              e.target.value,
                            );
                          }}
                          readonly={mode === 'confirm'}
                        />
                        <CustomTextField
                          label='最終'
                          value={item.final_time?.toString() || ''}
                          displayHelp={false}
                          onChange={(e) => {
                            handleRaceResultRecordsInputChangebyIndex(
                              index,
                              'final_time',
                              e.target.value,
                            );
                          }}
                          readonly={mode === 'confirm'}
                        />
                        <div className='flex flex-col gap-[8px]'>
                          {mode === 'confirm' ? (
                            <CustomTextField label='備考' value={item.race_result_notes} readonly />
                          ) : (
                            <>
                              <InputLabel label='備考' />
                              <Autocomplete
                                options={remarkOptions.map((item) => ({
                                  id: item.id,
                                  name: item.name,
                                }))}
                                getOptionLabel={(option) =>
                                  typeof option === 'string' ? option : option?.name || ''
                                }
                                value={{ id: item.remarkId, name: item.race_result_notes }}
                                onChange={(e: ChangeEvent<{}>, newValue) => {
                                  handleRaceResultRecordsInputChangebyIndex(
                                    index,
                                    'remarkId',
                                    newValue ? (newValue as MasterResponse).id?.toString() : '',
                                  );
                                  handleRaceResultRecordsInputChangebyIndex(
                                    index,
                                    'race_result_notes',
                                    newValue ? (newValue as MasterResponse).name : '',
                                  );
                                }}
                                onInputChange={(e, newValue) => {
                                  handleRaceResultRecordsInputChangebyIndex(
                                    index,
                                    'race_result_notes',
                                    newValue || '',
                                  );
                                }}
                                renderOption={(props, option) => {
                                  return (
                                    <li {...props} key={option.id}>
                                      {option.name}
                                    </li>
                                  );
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    key={params.id}
                                    className={`border-[1px] border-solid border-gray-50 rounded-md ${
                                      mode === 'confirm' && item.deleteFlg
                                        ? 'bg-gray-500'
                                        : 'bg-white'
                                    } my-1`}
                                    {...params}
                                    value={item.race_result_notes || ''}
                                  />
                                )}
                                freeSolo
                                className='w-[210px]'
                                readOnly={mode === 'confirm'}
                                disabled={mode === 'confirm'}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {item.laptimeErrorText && (
                  <ErrorBox errorText={item.laptimeErrorText ? [item.laptimeErrorText] : ['']} />
                )}
              </div>
            </div>
            <div className='flex flex-col'>
              <div className='border-t border-r border-l border-solid border-gray-300 bg-primary-50 p-[8px]'>
                <Label label='ストロークレート' />
              </div>
              <div className='flex flex-col gap-[20px] border border-solid border-gray-300 p-[20px]'>
                <div>
                  <div className='flex flex-row justify-between gap-[80px] w-[800px]'>
                    <div className='flex flex-col justify-between gap-[1px]'>
                      <div className='flex flex-row justify-left item-center gap-[10px]'>
                        <CustomTextField
                          label='500m'
                          value={item?.stroke_rat_500m?.toString() || ''}
                          type='number'
                          displayHelp={false}
                          inputAdorment='回/分'
                          onChange={(e) => {
                            handleRaceResultRecordsInputChangebyIndex(
                              index,
                              'stroke_rat_500m',
                              e.target.value,
                            );
                          }}
                          readonly={mode === 'confirm'}
                        />
                        <CustomTextField
                          label='1000m'
                          value={item?.stroke_rat_1000m?.toString() || ''}
                          displayHelp={false}
                          type='number'
                          inputAdorment='回/分'
                          onChange={(e) => {
                            handleRaceResultRecordsInputChangebyIndex(
                              index,
                              'stroke_rat_1000m',
                              e.target.value,
                            );
                          }}
                          readonly={mode === 'confirm'}
                        />
                        <CustomTextField
                          label='1500m'
                          value={item?.stroke_rat_1500m?.toString() || ''}
                          displayHelp={false}
                          type='number'
                          inputAdorment='回/分'
                          onChange={(e) => {
                            handleRaceResultRecordsInputChangebyIndex(
                              index,
                              'stroke_rat_1500m',
                              e.target.value,
                            );
                          }}
                          readonly={mode === 'confirm'}
                        />
                        <CustomTextField
                          label='2000m'
                          value={item?.stroke_rat_2000m?.toString() || ''}
                          displayHelp={false}
                          type='number'
                          inputAdorment='回/分'
                          onChange={(e) => {
                            handleRaceResultRecordsInputChangebyIndex(
                              index,
                              'stroke_rat_2000m',
                              e.target.value,
                            );
                          }}
                          readonly={mode === 'confirm'}
                        />
                        <CustomTextField
                          label='平均'
                          value={item?.stroke_rate_avg?.toString() || ''}
                          displayHelp={false}
                          type='number'
                          inputAdorment='回/分'
                          onChange={(e) => {
                            handleRaceResultRecordsInputChangebyIndex(
                              index,
                              'stroke_rate_avg',
                              e.target.value,
                            );
                          }}
                          readonly={mode === 'confirm'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {item.strokeRateErrorText && (
                  <ErrorBox
                    errorText={item.strokeRateErrorText ? [item.strokeRateErrorText] : ['']}
                  />
                )}
              </div>
            </div>
            <div className='w-full bg-primary-500 h-[40px] flex justify-center items-center font-bold relative'>
              <div className='absolute left-[20px] gap-[8px] flex'>
                {mode !== 'confirm' && (
                  <CustomButton
                    buttonType='secondary'
                    onClick={() => {
                      setRaceResultRecords((prevFormData) => {
                        const newFormData = [...prevFormData];
                        newFormData[index].crewPlayer = newFormData[index]?.crewPlayer?.map(
                          (item) => {
                            item.deleteFlg = true;
                            return item;
                          },
                        );
                        return newFormData;
                      });
                    }}
                    className='w-[120px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300'
                  >
                    全削除
                  </CustomButton>
                )}
                {mode !== 'confirm' && (
                  <CustomButton
                    buttonType='secondary'
                    onClick={() => {
                      setRaceResultRecords((prevFormData) => {
                        const newFormData = [...prevFormData];
                        newFormData[index].crewPlayer = newFormData[index]?.crewPlayer?.map(
                          (item) => {
                            item.deleteFlg = false;
                            return item;
                          },
                        );
                        return newFormData;
                      });
                    }}
                    className='w-[120px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300'
                  >
                    全削除解除
                  </CustomButton>
                )}
              </div>

              <div className='font-bold text-white'>選手情報</div>
              {mode !== 'confirm' && (
                <CustomButton
                  buttonType='secondary'
                  onClick={() => {
                    addCrewPlayerToRaceResultRecords(index);
                  }}
                  className='w-[120px] h-[30px] p-[0px] text-small text-primary-500 hover:text-primary-300 absolute right-[20px]'
                >
                  選手追加
                </CustomButton>
              )}
            </div>
            <div className='overflow-x-auto'>
              <CustomTable>
                <CustomThead>
                  <CustomTr>
                    <CustomTh rowSpan={2}>削除</CustomTh>
                    <CustomTh rowSpan={2}>選手ID</CustomTh>
                    <CustomTh rowSpan={2}>選手名</CustomTh>
                    <CustomTh rowSpan={2}>性別</CustomTh>
                    <CustomTh rowSpan={2}>身長</CustomTh>
                    <CustomTh rowSpan={2}>体重</CustomTh>
                    <CustomTh rowSpan={2}>シート番号</CustomTh>
                    <CustomTh rowSpan={1} colSpan={5}>
                      心拍数(回/分)
                    </CustomTh>
                    <CustomTh rowSpan={1}>エルゴ</CustomTh>
                  </CustomTr>
                  <CustomTr>
                    <CustomTh>500m</CustomTh>
                    <CustomTh>1000m</CustomTh>
                    <CustomTh>1500m</CustomTh>
                    <CustomTh>2000m</CustomTh>
                    <CustomTh>平均</CustomTh>
                    <CustomTh>
                      立ち会い
                      <br />
                      有無
                    </CustomTh>
                  </CustomTr>
                </CustomThead>
                <CustomTbody deleteMode={mode === 'confirm' && item.deleteFlg}>
                  {item?.crewPlayer?.map((player, crewIndex) => (
                    <>
                      <CustomTr key={crewIndex}>
                        <CustomTd>
                          <div className='flex justify-center'>
                            <OriginalCheckbox
                              id={'deleteFlg' + index + crewIndex}
                              value='deleteFlg'
                              checked={player.deleteFlg}
                              onChange={(e) => {
                                handleRaceResultRecordsCrewPlayerChangeBooleanbyIndex(
                                  index,
                                  crewIndex,
                                  'deleteFlg',
                                  e.target.checked,
                                );
                              }}
                              readonly={mode === 'confirm'}
                            />
                          </div>
                        </CustomTd>
                        <CustomTd>
                          <CustomTextField
                            value={player.playerId || ''}
                            onBlur={async (e) => {
                              // 検索して選手情報を取得する
                              handleCrewPlayerIdChange(index, crewIndex, e.target.value);
                            }}
                            onChange={(e) => {
                              // 入力が完了してから実行する
                              handleRaceResultRecordsCrewPlayerChangebyIndex(
                                index,
                                crewIndex,
                                'playerId',
                                e.target.value,
                              );
                            }}
                            readonly={
                              (mode == 'update' && player.addonLineFlg != true) ||
                              mode === 'confirm'
                            }
                            widthClassName='w-[56px]'
                          />
                        </CustomTd>
                        <CustomTd newLine>
                          <CustomTextField
                            value={player.playerName || ''}
                            onChange={(e) => {
                              handleRaceResultRecordsCrewPlayerChangebyIndex(
                                index,
                                crewIndex,
                                'playerName',
                                e.target.value,
                              );
                            }}
                            readonly={
                              (mode == 'update' && player.addonLineFlg != true) ||
                              mode === 'confirm'
                            }
                            widthClassName='w-[120px]'
                          />
                        </CustomTd>
                        <CustomTd>
                          <CustomTextField value={player.sex || ''} readonly></CustomTextField>
                        </CustomTd>
                        <CustomTd>
                          <CustomTextField
                            value={player.height?.toString() || ''}
                            onChange={(e) => {
                              handleRaceResultRecordsCrewPlayerChangebyIndex(
                                index,
                                crewIndex,
                                'height',
                                e.target.value,
                              );
                            }}
                            type='number'
                            readonly={mode === 'confirm'}
                            widthClassName='w-[120px]'
                          />
                        </CustomTd>
                        <CustomTd>
                          <CustomTextField
                            value={player.weight?.toString() || ''}
                            onChange={(e) => {
                              handleRaceResultRecordsCrewPlayerChangebyIndex(
                                index,
                                crewIndex,
                                'weight',
                                e.target.value,
                              );
                            }}
                            type='number'
                            readonly={mode === 'confirm'}
                            widthClassName='w-[120px]'
                          />
                        </CustomTd>
                        <CustomTd>
                          <CustomDropdown
                            id='seatName'
                            value={
                              mode === 'confirm'
                                ? player?.seatName
                                : player?.seatNameId?.toString() || ''
                            }
                            options={seatNameIdOptions.map((item) => ({
                              key: item.id,
                              value: item.name,
                            }))}
                            onChange={(e) => {
                              handleRaceResultRecordsCrewPlayerChangebyIndex(
                                index,
                                crewIndex,
                                'seatNameId',
                                e,
                              );
                              handleRaceResultRecordsCrewPlayerChangebyIndex(
                                index,
                                crewIndex,
                                'seatName',
                                seatNameIdOptions.find((item) => item.id === Number(e))?.name || '',
                              );
                            }}
                            readonly={mode === 'confirm'}
                          />
                        </CustomTd>
                        <CustomTd>
                          <CustomTextField
                            value={player.fiveHundredmHeartRate?.toString() || ''}
                            onChange={(e) => {
                              handleRaceResultRecordsCrewPlayerChangebyIndex(
                                index,
                                crewIndex,
                                'fiveHundredmHeartRate',
                                e.target.value,
                              );
                            }}
                            type='number'
                            readonly={mode === 'confirm'}
                            widthClassName='w-[80px]'
                          />
                        </CustomTd>
                        <CustomTd>
                          <CustomTextField
                            value={player.tenHundredmHeartRate?.toString() || ''}
                            onChange={(e) => {
                              handleRaceResultRecordsCrewPlayerChangebyIndex(
                                index,
                                crewIndex,
                                'tenHundredmHeartRate',
                                e.target.value,
                              );
                            }}
                            type='number'
                            readonly={mode === 'confirm'}
                            widthClassName='w-[80px]'
                          />
                        </CustomTd>
                        <CustomTd>
                          <CustomTextField
                            value={player.fifteenHundredmHeartRate?.toString() || ''}
                            onChange={(e) => {
                              handleRaceResultRecordsCrewPlayerChangebyIndex(
                                index,
                                crewIndex,
                                'fifteenHundredmHeartRate',
                                e.target.value,
                              );
                            }}
                            type='number'
                            readonly={mode === 'confirm'}
                            widthClassName='w-[80px]'
                          />
                        </CustomTd>
                        <CustomTd>
                          <CustomTextField
                            value={player.twentyHundredmHeartRate?.toString() || ''}
                            onChange={(e) => {
                              handleRaceResultRecordsCrewPlayerChangebyIndex(
                                index,
                                crewIndex,
                                'twentyHundredmHeartRate',
                                e.target.value,
                              );
                            }}
                            type='number'
                            readonly={mode === 'confirm'}
                            widthClassName='w-[80px]'
                          />
                        </CustomTd>
                        <CustomTd>
                          <CustomTextField
                            value={player.heartRateAvg?.toString() || ''}
                            onChange={(e) => {
                              handleRaceResultRecordsCrewPlayerChangebyIndex(
                                index,
                                crewIndex,
                                'heartRateAvg',
                                e.target.value,
                              );
                            }}
                            type='number'
                            readonly={mode === 'confirm'}
                            widthClassName='w-[80px]'
                          />
                        </CustomTd>
                        <CustomTd>
                          <div className='flex justify-center'>
                            <OriginalCheckbox
                              id={'ergo' + index + crewIndex}
                              value='ergo'
                              checked={player.attendance ? true : false}
                              onChange={(e: any) => {
                                handleRaceResultRecordsCrewPlayerChangebyIndex(
                                  index,
                                  crewIndex,
                                  'attendance',
                                  e.target.checked,
                                );
                              }}
                              readonly={mode === 'confirm'}
                            />
                          </div>
                        </CustomTd>
                      </CustomTr>
                      {player.errorText && (
                        <CustomTr>
                          <CustomTh colSpan={13}>
                            <div className='flex justify-start text-systemErrorText text-small leading-loose'>
                              {player.errorText ? [player.errorText] : []}{' '}
                            </div>
                          </CustomTh>
                        </CustomTr>
                      )}
                    </>
                  ))}
                </CustomTbody>
              </CustomTable>
            </div>
          </div>
        </div>
      ))}
      <div className='flex flex-row justify-center gap-[80px] mt-[20px]'>
        <CustomButton
          buttonType='secondary'
          onClick={() => {
            router.back();
          }}
          className='w-[170px]'
        >
          戻る
        </CustomButton>
        <CustomButton
          buttonType='primary'
          onClick={async () => {
            var errorCount = 0;
            if (mode == 'create' || mode == 'update') {
              //レース結果情報のリストが0件、または、(選手情報に全削除チェックされていないかつ、レース結果情報に削除チェックがされていない)リストが0件の場合
              if (
                raceResultRecords.length == 0 ||
                raceResultRecords.filter(
                  (item) =>
                    !item?.crewPlayer?.every((player) => player.deleteFlg) && !item.deleteFlg,
                ).length == 0
              ) {
                alert('1件以上、レース結果情報を登録する必要があります。');
                return;
              }

              //ポップアップダイアログ
              const isAllPlayerChecked = raceResultRecords.some(
                (item) => item?.crewPlayer?.every((player) => player.deleteFlg),
              );
              if (isAllPlayerChecked) {
                const isOK = confirm(
                  '全ての選手が削除対象となっている「レース結果情報」があります。当該「レース結果情報」は、削除されますがよろしいですか？',
                );
                if (!isOK) {
                  return; //キャンセルが押された場合、以降の処理を行わない 20240515
                }
              }
              clearError(); //エラーメッセージのクリア
              errorCount = validateRaceResultRecords(); // バリデーション
            }

            if (errorCount > 0) return;

            clearError(); //エラーメッセージのクリア

            if (isSubmitting) {
              return;
            }
            setIsSubmitting(true);

            if (mode === 'create') {
              //追加行でない(更新行)かつ、選手情報すべてに削除チェックがされている場合、「このレース結果情報を削除する」にチェックを入れる 20240516
              for (let index = 0; index < raceResultRecords.length; index++) {
                if (
                  !raceResultRecords[index]?.isAdded &&
                  raceResultRecords[index]?.crewPlayer?.every((player) => player.deleteFlg)
                ) {
                  raceResultRecords[index].deleteFlg = true;
                }
              }
              //「追加行かつ、選手情報すべてに削除チェックがされている項目」以外を表示 20240516
              setRaceResultRecords((prevFormData) => {
                const newFormData = [...prevFormData];
                return newFormData.filter(
                  (item) =>
                    !(item?.isAdded && item?.crewPlayer?.every((player) => player.deleteFlg)),
                );
              });

              router.push(
                `/tournamentResult?mode=confirm&prevMode=create&raceId=${raceInfo.race_id}`,
              );
            } else if (mode === 'update') {
              //追加行でない(更新行)かつ、選手情報すべてに削除チェックがされている場合、「このレース結果情報を削除する」にチェックを入れる 20240516
              for (let index = 0; index < raceResultRecords.length; index++) {
                if (
                  !raceResultRecords[index]?.isAdded &&
                  raceResultRecords[index]?.crewPlayer?.every((player) => player.deleteFlg)
                ) {
                  raceResultRecords[index].deleteFlg = true;
                }
              }
              //「追加行かつ、選手情報すべてに削除チェックがされている項目」以外を表示 20240516
              setRaceResultRecords((prevFormData) => {
                const newFormData = [...prevFormData];
                return newFormData.filter(
                  (item) =>
                    !(item?.isAdded && item?.crewPlayer?.every((player) => player.deleteFlg)),
                );
              });

              router.push('/tournamentResult?mode=confirm&prevMode=update');
            } else if (mode === 'confirm') {
              //登録・更新する前に選手名についている「*」を消す 20240514
              for (let index = 0; index < raceResultRecords.length; index++) {
                for (let j = 0; j < raceResultRecords[index]?.crewPlayer.length; j++) {
                  raceResultRecords[index].crewPlayer[j].playerName = raceResultRecords[
                    index
                  ]?.crewPlayer[j].playerName.replace('*', '');
                }
              }
              if (prevMode == 'create') {
                //登録確認画面からバックエンド側にデータを送る 20240405
                const sendData = {
                  raceInfo: raceInfo,
                  raceResultRecordResponse: raceResultRecordResponse,
                  raceResultRecords: raceResultRecords,
                };
                const raceResponse = await axios.post(
                  'api/registerRaceResultRecordForRegisterConfirm',
                  sendData,
                );
                if (!raceResponse.data?.errMessage) {
                  router.push('/tournamentResultRef?raceId=' + raceInfo.race_id);
                } else {
                  setErrorText([raceResponse.data?.errMessage]);
                }
              } else if (prevMode == 'update') {
                //更新確認画面からバックエンド側にデータを送る 20240405
                const sendData = {
                  raceInfo: raceInfo,
                  raceResultRecordResponse: raceResultRecordResponse,
                  raceResultRecords: raceResultRecords,
                };
                const raceResponse = await axios.post(
                  'api/updateRaceResultRecordForUpdateConfirm',
                  sendData,
                );
                if (!raceResponse.data?.errMessage) {
                  router.push('/tournamentResultRef?raceId=' + raceInfo.race_id);
                } else {
                  setErrorText([raceResponse.data?.errMessage]);
                }
              }
            }

            setIsSubmitting(false);
          }}
          className='w-[170px]'
        >
          {prevMode === 'create' ? '登録' : prevMode === 'update' ? '更新' : '確認'}
        </CustomButton>
      </div>
    </>
  );
}
