// // 大会レース結果管理画面
'use client';
// ライブラリのインポート
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
// 共通コンポーネントのインポート
import {
  CustomTitle,
  CustomButton,
  ErrorBox,
  Label,
  CustomTextField,
  CustomDatePicker,
  CustomDropdown,
  CustomTable,
  CustomThead,
  InputLabel,
  CustomTr,
  CustomTd,
  CustomTh,
  CustomTbody,
  OriginalCheckbox,
} from '@/app/components';
import { RaceTable, RaceResultRecordsResponse, MasterResponse, CrewPlayer } from '@/app/types';
import axios from '@/app/lib/axios';
import Validator from '@/app/utils/validator';

// // 大会レース結果管理画面のメインコンポーネント
export default function TournamentResult() {
  // フック
  const router = useRouter();

  // ステート変数
  const [errorText, setErrorText] = useState([] as string[]);

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
  const [sheetNameIdOptions, setSheetNameIdOptions] = useState<MasterResponse[]>([]);

  // レース基本情報のモデル
  const [raceInfo, setRaceInfo] = useState<RaceTable>({} as RaceTable);

  // 出漕結果記録情報のモデル（出漕時点情報）
  const [raceResultRecordResponse, setRaceResultRecordResponse] =
    useState<RaceResultRecordsResponse>({} as RaceResultRecordsResponse);

  // 出漕結果記録情報（レース結果情報）のモデル
  const [raceResultRecords, setRaceResultRecords] = useState<RaceResultRecordsResponse[]>([
    {
      crewPlayer: [{} as CrewPlayer],
    } as RaceResultRecordsResponse,
  ]);

  // 種目マスタに紐づく選手の人数
  const [playerCount, setPlayerCount] = useState<number>(0);

  // 遷移元画面からのパラメータ取得
  const param = useSearchParams();
  const mode = param.get('mode');
  const [raceId, setRaceId] = useState<string | null>(param.get('raceId')); // レースID
  const tournId = param.get('tournId'); // 大会ID
  const eventId = param.get('eventId'); // 種目ID
  const prevMode = param.get('prevMode'); // 遷移元画面のモード
  // console.log(mode);
  // console.log(raceId);
  // console.log(tournId);
  // console.log(eventId);
  // console.log(prevMode);
  switch (mode) {
    case 'create':
      break;
    case 'update':
      break;
    case 'confirm':
      break;
    default:
      break;
  }

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
  const handleRaceResultRecordInputChange = (name: string, value: string) => {
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
      const newFormData = [...(prevFormData as RaceResultRecordsResponse[])];
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
    if (!raceResultRecords[index].crewPlayer) {
      raceResultRecords[index].crewPlayer = [{} as CrewPlayer];
    }
    setRaceResultRecords((prevFormData) => {
      // 多次元配列のシャローコピーは2件レコードができるため、ディープコピー
      const newFormData = JSON.parse(JSON.stringify(prevFormData));
      newFormData[index].crewPlayer?.push({
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
    const csrf = () => axios.get('/sanctum/csrf-cookie');
    await csrf();
    //const playerSearch = await axios.get('http://localhost:3100/teamPlayers?id=' + value);
    const sendIds = {
      player_id: value,
      race_id: raceId,
    };
    const playerSearch = await axios.post('/getRaceResultRecord', sendIds);
    console.log('player_id', value);
    console.log('race_id', raceId);
    console.log('playerSearch', playerSearch);
    const player = playerSearch.data[0];

    if (value === '') {
      return;
    }
    /**
     * システムに登録されていない選手IDの場合、エラーメッセージを表示する
     * 「システムに登録されていない選手のIDです。」
     * すでに他で同じ選手IDが２つ以上登録されている場合、エラーメッセージを表示する
     * 「重複する選手IDです。」
     */
    if (!player) {
      setRaceResultRecords((prevFormData) => {
        const newFormData = [...prevFormData];
        newFormData[index].crewPlayer[crewIndex] = {
          ...newFormData[index].crewPlayer[crewIndex],
          errorText: 'システムに登録されていない選手のIDです。',
        };
        return newFormData;
      });
      return;
    } else {
      setRaceResultRecords((prevFormData) => {
        const newFormData = [...prevFormData];
        newFormData[index].crewPlayer[crewIndex] = {
          ...newFormData[index].crewPlayer[crewIndex],
          errorText: '',
        };
        return newFormData;
      });
    }

    const isExist = raceResultRecords.some((record, i) => {
      return record?.crewPlayer?.some((player, j) => {
        return player.playerId === value && !(index === i && crewIndex === j);
      });
    });

    if (isExist) {
      setRaceResultRecords((prevFormData) => {
        const newFormData = [...prevFormData];
        newFormData[index].crewPlayer[crewIndex] = {
          ...newFormData[index].crewPlayer[crewIndex],
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
        ...newFormData[index].crewPlayer[crewIndex],
        playerId: value,
        playerName: player ? '*' + player.playerName : '',
        sex: player?.sex || '',
        height: player?.height || '',
        weight: player?.weight || '',
        deleteFlg: player ? newFormData[index].crewPlayer[crewIndex]?.deleteFlg : false,
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
        newFormData[index].crewPlayer[crewIndex] !== null ||
        newFormData[index].crewPlayer[crewIndex] !== undefined
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
  };

  /**
   * レース結果情報の入力値をバリデーションする関数
   * @returns
   */
  const validateRaceResultRecords = () => {
    /**
     * レースID
     * 空欄チェック
     * 空行が選択されている場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「レースIDを選択してください。」
     */
    const raceId = Validator.validateRequired(raceInfo?.race_id, 'レースID');
    if (raceId) {
      setErrorText([raceId]);
      scrollTo(0, 0);
      return false;
    }
    /**
     * レース名
     * 空欄チェック
     * 空行が選択されている場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「レース名を選択してください。」
     */
    const raceName = Validator.validateRequired(raceInfo?.race_name, 'レース名');
    if (raceName) {
      setErrorText([raceName]);
      scrollTo(0, 0);
      return false;
    }

    /**
     * 発艇日時
     * 空欄チェック
     * 空行が選択されている場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「発艇日時を選択してください。」
     */
    const startDateTime = Validator.validateRequired(
      raceResultRecordResponse?.startDateTime,
      '発艇日時',
    );
    if (startDateTime) {
      setErrorText([startDateTime]);
      scrollTo(0, 0);
      return false;
    }

    /**
     * 1000m地点風速
     * 入力値チェック
     * 整数3桁までの数値であることを確認
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「半角数字で入力してください。」
     */
    const windSpeed = raceResultRecordResponse.wind_speed_1000m_point;
    if (windSpeed && !/^\d{1,3}$/.test(windSpeed.toString())) {
      setErrorText(['半角数字で入力してください。']);
      scrollTo(0, 0);
      return false;
    }

    /**
     * 2000m地点風速
     * 入力値チェック
     * 整数3桁
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「半角数字で入力してください。」
     */
    const windSpeed2 = raceResultRecordResponse.wind_speed_2000m_point;
    if (windSpeed2 && !/^\d{1,3}$/.test(windSpeed2.toString())) {
      setErrorText(['半角数字で入力してください。']);
      scrollTo(0, 0);
      return false;
    }

    /**
     * 所属団体
     * 空欄チェック
     * 空行が選択されている場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「所属団体を選択してください。」
     */
    var indexList7 = [] as number[];
    const isError5 = raceResultRecords.some((record, i) => {
      if (!record.org_id) {
        indexList7.push(i);
      }
      return !record.org_id;
    });
    if (isError5) {
      indexList7.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'errorText',
          '所属団体を選択してください。',
        );
      });
      return false;
    } else {
      clearError();
    }

    /**
     * クルー名
     * 空欄チェック
     * 空行が選択されている場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「クルー名を入力してください。」
     */
    // レース結果情報全てにチェックを行う
    var indexList8 = [] as number[];
    const isError6 = raceResultRecords.some((record, i) => {
      if (!record.crew_name) {
        indexList8.push(i);
      }
      return !record.crew_name;
    });
    if (isError6) {
      indexList8.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'errorText',
          'クルー名を入力してください。',
        );
      });
      return false;
    } else {
      clearError();
    }

    /**
     * クルー名、所属団体組み合わせ
     * 「所属団体」と「クルー名」の組み合わせが、同じ「レース結果情報入力欄」が無いことを確認
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     * 「所属団体」と「クルー名」が同じ「レース結果情報」を登録しようとしています。」
     */
    var indexList9 = [] as number[];
    // チェックして、エラーに該当するレース結果情報のインデックスを取得する
    const isError7 = raceResultRecords.some((record, i) => {
      // エラーに該当するレース結果情報のインデックスを取得する
      return raceResultRecords.some((record2, j) => {
        if (i !== j && record.org_id === record2.org_id && record.crew_name === record2.crew_name) {
          indexList9.push(i);
          indexList9.push(j);
        }
        return (
          i !== j && record.org_id === record2.org_id && record.crew_name === record2.crew_name
        );
      });
    });
    if (isError7) {
      indexList9.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'errorText',
          '所属団体とクルー名が同じレース結果情報を登録しようとしています。',
        );
      });
      return false;
    } else {
      clearError();
    }

    /**
     * 出漕レーンNo
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「半角数字で、99までの数値を入力してください。」
     */
    var indexList10 = [] as number[];
    const isError8 = raceResultRecords.some((record, i) => {
      if (record.lane_number && !/^\d{1,2}$/.test(record?.lane_number.toString())) {
        indexList10.push(i);
      }
      return record.lane_number && !/^\d{1,2}$/.test(record?.lane_number.toString());
    });
    if (isError8) {
      indexList10.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'errorText',
          '出漕レーンNoは半角数字で、99までの数値を入力してください。',
        );
      });
      return false;
    } else {
      clearError();
    }

    /**
     * 出漕レーンNo
     * 出漕レーンNoが同じ「レース結果情報入力欄」が無いことを確認
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     * 「出漕レーンNoが重複しています。」
     */
    var indexList = [] as number[];
    // チェックして、エラーに該当するレース結果情報のインデックスを取得する
    const isError2 = raceResultRecords.some((record, i) => {
      // エラーに該当するレース結果情報のインデックスを取得する
      return raceResultRecords.some((record2, j) => {
        if (
          i !== j &&
          record.lane_number === record2.lane_number &&
          (record.lane_number || record2.lane_number)
        ) {
          indexList.push(i);
          indexList.push(j);
        }
        return i !== j && record.lane_number === record2.lane_number;
      });
    });

    if (isError2) {
      indexList.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'errorText',
          '出漕レーンNoが重複しています。',
        );
      });
      return false;
    } else {
      clearError();
    }

    /**
     * 順位
     * 空欄チェック
     * 空行が選択されている場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「順位を入力してください。」
     */
    var indexList11 = [] as number[];
    const isError9 = raceResultRecords.some((record, i) => {
      if (!record.rank) {
        indexList11.push(i);
      }
      return !record.rank;
    });
    if (isError9) {
      indexList11.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(index, 'errorText', '順位を入力してください。');
      });
      return false;
    } else {
      clearError();
    }

    /**
     * 順位
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「半角数字で、99までの数値を入力してください。」
     */
    var indexList12 = [] as number[];
    const isError10 = raceResultRecords.some((record, i) => {
      if (record.rank && !/^\d{1,2}$/.test(record?.rank.toString())) {
        indexList12.push(i);
      }
      return record.rank && !/^\d{1,2}$/.test(record?.rank.toString());
    });
    if (isError10) {
      indexList12.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'errorText',
          '順位は半角数字で、99までの数値を入力してください。',
        );
      });
      return false;
    } else {
      clearError();
    }

    /**
     * 順位
     * 順位が同じ「レース結果情報入力欄」が無いことを確認
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     * 「順位が重複しています。」
     */
    var indexList2 = [] as number[];
    // チェックして、エラーに該当するレース結果情報のインデックスを取得する
    const isError3 = raceResultRecords.some((record, i) => {
      // エラーに該当するレース結果情報のインデックスを取得する
      return raceResultRecords.some((record2, j) => {
        if (i !== j && record.rank === record2.rank) {
          indexList2.push(i);
          indexList2.push(j);
        }
        return i !== j && record.rank === record2.rank;
      });
    });

    if (isError3) {
      indexList2.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(index, 'errorText', '順位が重複しています。');
      });
      return false;
    } else {
      clearError();
    }

    /**
     * ラップタイム
     * 空欄チェック
     * 500m ～ 最終までの何れかに入力されていることを確認
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「「ラップタイム」は、500m～最終タイムまでの何れかにタイムを入力してください。」
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     */
    var indexList3 = [] as number[];
    // チェックして、エラーに該当するレース結果情報のインデックスを取得する
    const isError4 = raceResultRecords.some((record, i) => {
      // エラーに該当するレース結果情報のインデックスを取得する
      if (
        !record.laptime_500m &&
        !record.laptime_1000m &&
        !record.laptime_1500m &&
        !record.laptime_2000m &&
        //!record.twentyHundredmLaptime &&
        !record.final_time
      ) {
        indexList3.push(i);
      }
      return (
        !record.laptime_500m &&
        !record.laptime_1000m &&
        !record.laptime_1500m &&
        !record.laptime_2000m &&
        //!record.twentyHundredmLaptime &&
        !record.final_time
      );
    });
    if (isError4) {
      indexList3.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'laptimeErrorText',
          '「ラップタイム」は、500m～最終タイムまでの何れかにタイムを入力してください。',
        );
      });
      return false;
    }

    /**
     * ラップタイム(500m)
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「ラップタイム」は、半角数字で入力してください。MM:SS.99 例）3:05.89
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     */
    var indexList4 = [] as number[];
    const lapTime2 = raceResultRecords.some((record, i) => {
      // E
      if (record.laptime_500m && !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.laptime_500m.toString())) {
        indexList4.push(i);
      }
      return record.laptime_500m && !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.laptime_500m.toString());
    });
    if (lapTime2) {
      indexList4.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'laptimeErrorText',
          '「500mラップタイム」は、半角数字で入力してください。MM:SS.99 例）3:05.89',
        );
      });
      return false;
    }

    /**
     * ラップタイム(1000m)
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「ラップタイム」は、半角数字で入力してください。MM:SS.99 例）3:05.89
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     */
    var indexList5 = [] as number[];
    const lapTime3 = raceResultRecords.some((record, i) => {
      if (
        record.laptime_1000m &&
        !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.laptime_1000m.toString())
      ) {
        indexList5.push(i);
      }
      return (
        record.laptime_1000m && !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.laptime_1000m.toString())
      );
    });
    if (lapTime3) {
      indexList5.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'laptimeErrorText',
          '「1000mラップタイム」は、半角数字で入力してください。MM:SS.99 例）3:05.89',
        );
      });
      return false;
    }

    /**
     * ラップタイム(1500m)
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「ラップタイム」は、半角数字で入力してください。MM:SS.99 例）3:05.89
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     */
    var indexList6 = [] as number[];
    const lapTime4 = raceResultRecords.some((record, i) => {
      // このページのみのバリデーションのため、ここにバリデーションロジックを記述
      if (
        record.laptime_1500m &&
        !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.laptime_1500m.toString())
      ) {
        indexList6.push(i);
      }
      return (
        record.laptime_1500m && !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.laptime_1500m.toString())
      );
    });
    if (lapTime4) {
      indexList6.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'laptimeErrorText',
          '「1500mラップタイム」は、半角数字で入力してください。MM:SS.99 例）3:05.89',
        );
      });
      return false;
    }

    /**
     * ラップタイム(2000m)
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「ラップタイム」は、半角数字で入力してください。MM:SS.99 例）3:05.89
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     */
    var indexList7 = [] as number[];
    const lapTime5 = raceResultRecords.some((record, i) => {
      // このページのみのバリデーションのため、ここにバリデーションロジックを記述
      if (
        record.laptime_2000m &&
        !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.laptime_2000m.toString())
      ) {
        indexList7.push(i);
      }
      return (
        record.laptime_2000m && !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.laptime_2000m.toString())
      );
    });
    if (lapTime5) {
      indexList7.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'laptimeErrorText',
          '「2000mラップタイム」は、半角数字で入力してください。MM:SS.99 例）3:05.89',
        );
      });
      return false;
    }

    /**
     * ラップタイム(最終)
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「ラップタイム」は、半角数字で入力してください。MM:SS.99 例）3:05.89
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     */
    var indexList8 = [] as number[];
    const lapTime6 = raceResultRecords.some((record, i) => {
      // このページのみのバリデーションのため、ここにバリデーションロジックを記述
      if (record.final_time && !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.final_time.toString())) {
        indexList8.push(i);
      }
      return record.final_time && !/^\d{1,2}:\d{2}\.\d{2}$/.test(record?.final_time.toString());
    });
    if (lapTime6) {
      indexList8.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'laptimeErrorText',
          '「finalラップタイム」は、半角数字で入力してください。MM:SS.99 例）3:05.89',
        );
      });
      return false;
    }

    /**
     * ストロークレート
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「「ストロークレート」は、半角数字で入力してください。」
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     */
    var indexList9 = [] as number[];
    const strokeRate = raceResultRecords.some((record, i) => {
      // このページのみのバリデーションのため、ここにバリデーションロジックを記述
      if (record.stroke_rat_500m && !/^\d{1,2}$/.test(record?.stroke_rat_500m.toString())) {
        indexList9.push(i);
      }
      return record.stroke_rat_500m && !/^\d{1,2}$/.test(record?.stroke_rat_500m.toString());
    });
    if (strokeRate) {
      indexList9.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'strokeRateErrorText',
          '「ストロークレート」は、半角数字で入力してください。',
        );
      });
      return false;
    }

    /**
     * ストロークレート（1000m）
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「「ストロークレート」は、半角数字で入力してください。」
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     */
    var indexList10 = [] as number[];
    const strokeRate2 = raceResultRecords.some((record, i) => {
      // このページのみのバリデーションのため、ここにバリデーションロジックを記述
      if (record.stroke_rat_1000m && !/^\d{1,2}$/.test(record?.stroke_rat_1000m.toString())) {
        indexList10.push(i);
      }
      return record.stroke_rat_1000m && !/^\d{1,2}$/.test(record?.stroke_rat_1000m.toString());
    });
    if (strokeRate2) {
      indexList10.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'strokeRateErrorText',
          '「ストロークレート」は、半角数字で入力してください。',
        );
      });
      return false;
    }

    /**
     * ストロークレート（1500m）
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「「ストロークレート」は、半角数字で入力してください。」
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     */
    var indexList11 = [] as number[];
    const strokeRate3 = raceResultRecords.some((record, i) => {
      // このページのみのバリデーションのため、ここにバリデーションロジックを記述
      if (record.stroke_rat_1500m && !/^\d{1,2}$/.test(record?.stroke_rat_1500m.toString())) {
        indexList11.push(i);
      }
      return record.stroke_rat_1500m && !/^\d{1,2}$/.test(record?.stroke_rat_1500m.toString());
    });
    if (strokeRate3) {
      indexList11.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'strokeRateErrorText',
          '「ストロークレート」は、半角数字で入力してください。',
        );
      });
      return false;
    }

    /**
     * ストロークレート（2000m）
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「「ストロークレート」は、半角数字で入力してください。」
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     */
    var indexList12 = [] as number[];
    const strokeRate4 = raceResultRecords.some((record, i) => {
      // このページのみのバリデーションのため、ここにバリデーションロジックを記述
      if (record.stroke_rat_2000m && !/^\d{1,2}$/.test(record?.stroke_rat_2000m.toString())) {
        indexList12.push(i);
      }
      return record.stroke_rat_2000m && !/^\d{1,2}$/.test(record?.stroke_rat_2000m.toString());
    });
    if (strokeRate4) {
      indexList12.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'strokeRateErrorText',
          '「ストロークレート」は、半角数字で入力してください。',
        );
      });
      return false;
    }

    /**
     * ストロークレート（最終）
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「「ストロークレート」は、半角数字で入力してください。」
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     */
    var indexList13 = [] as number[];
    const strokeRate5 = raceResultRecords.some((record, i) => {
      // このページのみのバリデーションのため、ここにバリデーションロジックを記述
      if (record.stroke_rate_avg && !/^\d{1,2}$/.test(record?.stroke_rate_avg.toString())) {
        indexList13.push(i);
      }
      return record.stroke_rate_avg && !/^\d{1,2}$/.test(record?.stroke_rate_avg.toString());
    });
    if (strokeRate5) {
      indexList13.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'strokeRateErrorText',
          '「ストロークレート」は、半角数字で入力してください。',
        );
      });
      return false;
    }

    /**
     * 身長
     * ・当該行が追加行の場合
     * 「削除」が未チェックかつ当該行の何れかの項目に値が入っている場合に実施
     * ・当該行が更新行の場合
     * 「削除」が未チェックの場合のみ実施
     * 空欄チェック
     * 空欄の場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * ※表示場所は、当該行の直下に表示する。
     * 「身長を入力してください。」
     */

    // {i, j}[]の形式でindexを保持する
    var indexObjectList = [] as { i: number; j: number }[];
    const height = raceResultRecords.some((record, i) => {
      record.crewPlayer?.map((player, j) => {
        if (player.addonLineFlg) {
          // 追加行の場合
          // 削除フラグが未チェックかつ、playerの何れかの項目に値が入っている場合に実施
          if (
            !player.deleteFlg &&
            ((player.weight !== undefined && player.weight !== null) ||
              (player.playerId !== undefined && player.playerId !== null) ||
              (player.playerName !== undefined && player.playerName !== null) ||
              (player.sheetName !== undefined && player.sheetName !== null) ||
              (player.fiveHundredmHeartRate !== undefined &&
                player.fiveHundredmHeartRate !== null) ||
              (player.tenHundredmHeartRate !== undefined && player.tenHundredmHeartRate !== null) ||
              (player.fifteenHundredmHeartRate !== undefined &&
                player.fifteenHundredmHeartRate !== null) ||
              (player.twentyHundredmHeartRate !== undefined &&
                player.twentyHundredmHeartRate !== null) ||
              (player.heartRateAvg !== undefined && player.heartRateAvg !== null) ||
              (player.attendance !== undefined && player.attendance !== null))
          ) {
            // 身長が未入力の場合
            if (!player.height) {
              indexObjectList.push({ i, j });
            }
          }
        } else {
          // 更新行の場合
          // 削除フラグが未チェックの場合のみ実施
          if (player.deleteFlg === false) {
            if (player.height === undefined || player.height === null) {
              indexObjectList.push({ i, j });
            }
          }
        }
      });
      return indexObjectList.length > 0;
    });

    if (height) {
      indexObjectList.map((index) => {
        handleRaceResultRecordsCrewPlayerChangebyIndex(
          index.i,
          index.j,
          'errorText',
          '身長を入力してください。',
        );
      });
      return false;
    } else {
      clearError();
    }

    /**
     * 身長
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「身長」は、半角数字で、999.99までの数値を入力してください。
     * ※表示場所は、当該行の直下に表示する。
     */

    // {i, j}[]の形式でindexを保持する

    var indexObjectList2 = [] as { i: number; j: number }[];
    const height2 = raceResultRecords.some((record, i) => {
      record.crewPlayer?.map((player, j) => {
        // 形式は整数部は3桁まで、小数部は2桁まで. 整数のみも可
        if (player.height && !/^\d{1,3}(\.\d{1,2})?$/.test(player?.height.toString())) {
          indexObjectList2.push({ i, j });
        }
      });
      return indexObjectList2.length > 0;
    });
    if (height2) {
      indexObjectList2.map((index) => {
        handleRaceResultRecordsCrewPlayerChangebyIndex(
          index.i,
          index.j,
          'errorText',
          '「身長」は、半角数字で、999.99までの数値を入力してください。',
        );
      });
      return false;
    } else {
      clearError();
    }
    /**
     * 体重
     * ・当該行が追加行の場合
     * 「削除」が未チェックかつ当該行の何れかの項目に値が入っている場合に実施
     * ・当該行が更新行の場合
     * 「削除」が未チェックの場合のみ実施
     * 空欄チェック
     * 空欄の場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     */
    // {i, j}[]の形式でindexを保持する
    var indexObjectList3 = [] as { i: number; j: number }[];
    const weight = raceResultRecords.some((record, i) => {
      record.crewPlayer?.map((player, j) => {
        if (player.addonLineFlg) {
          // 追加行の場合
          // 削除フラグが未チェックかつ、playerの何れかの項目に値が入っている場合に実施
          if (
            !player.deleteFlg &&
            ((player.height !== undefined && player.height !== null) ||
              (player.playerId !== undefined && player.playerId !== null) ||
              (player.playerName !== undefined && player.playerName !== null) ||
              (player.sheetName !== undefined && player.sheetName !== null) ||
              (player.fiveHundredmHeartRate !== undefined &&
                player.fiveHundredmHeartRate !== null) ||
              (player.tenHundredmHeartRate !== undefined && player.tenHundredmHeartRate !== null) ||
              (player.fifteenHundredmHeartRate !== undefined &&
                player.fifteenHundredmHeartRate !== null) ||
              (player.twentyHundredmHeartRate !== undefined &&
                player.twentyHundredmHeartRate !== null) ||
              (player.heartRateAvg !== undefined && player.heartRateAvg !== null) ||
              (player.attendance !== undefined && player.attendance !== null))
          ) {
            if (!player.weight) {
              indexObjectList3.push({ i, j });
            }
          }
        } else {
          // 更新行の場合
          // 削除フラグが未チェックの場合のみ実施
          if (player.deleteFlg === false) {
            if (player.weight === undefined || player.weight === null) {
              indexObjectList3.push({ i, j });
            }
          }
        }
      });
      return indexObjectList3.length > 0;
    });
    if (weight) {
      indexObjectList3.map((index) => {
        handleRaceResultRecordsCrewPlayerChangebyIndex(
          index.i,
          index.j,
          'errorText',
          '体重を入力してください。',
        );
      });
      return false;
    } else {
      clearError();
    }

    /**
     * 体重
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。※以降のチェックを行う
     * 「体重」は、半角数字で、999.99までの数値を入力してください。
     * ※表示場所は、当該行の直下に表示する。
     */
    // {i, j}[]の形式でindexを保持する
    var indexObjectList4 = [] as { i: number; j: number }[];
    const weight2 = raceResultRecords.some((record, i) => {
      record.crewPlayer?.map((player, j) => {
        // 形式は整数部は3桁まで、小数部は2桁まで. 整数のみも可
        if (player.weight && !/^\d{1,3}(\.\d{1,2})?$/.test(player?.weight.toString())) {
          indexObjectList4.push({ i, j });
        }
      });
      return indexObjectList4.length > 0;
    });
    if (weight2) {
      indexObjectList4.map((index) => {
        handleRaceResultRecordsCrewPlayerChangebyIndex(
          index.i,
          index.j,
          'errorText',
          '「体重」は、半角数字で、999.99までの数値を入力してください。',
        );
      });
      return false;
    } else {
      clearError();
    }

    /**
     * シート番号
     * 空欄チェック
     * ・当該行が追加行の場合
     * 「削除」が未チェック
     * かつ
     * 当該行の何れかの項目に値が入っている場合に実施
     * ・当該行が更新行の場合
     * 「削除」が未チェックの場合のみ実施
     * 空欄チェック
     * 空欄の場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。
     * ※表示場所は、当該「レース結果情報」の名称の下に表示
     * 「シート番号を選択してください。」
     */
    // {i, j}[]の形式でindexを保持する
    var indexObjectList5 = [] as { i: number; j: number }[];
    const seatNo = raceResultRecords.some((record, i) => {
      record.crewPlayer?.map((player, j) => {
        if (player.addonLineFlg) {
          // 追加行の場合
          // 削除フラグが未チェックかつ、playerの何れかの項目に値が入っている場合に実施
          if (
            !player.deleteFlg &&
            ((player.height !== undefined && player.height !== null) ||
              (player.weight !== undefined && player.weight !== null) ||
              (player.playerId !== undefined && player.playerId !== null) ||
              (player.playerName !== undefined && player.playerName !== null) ||
              (player.fiveHundredmHeartRate !== undefined &&
                player.fiveHundredmHeartRate !== null) ||
              (player.tenHundredmHeartRate !== undefined && player.tenHundredmHeartRate !== null) ||
              (player.fifteenHundredmHeartRate !== undefined &&
                player.fifteenHundredmHeartRate !== null) ||
              (player.twentyHundredmHeartRate !== undefined &&
                player.twentyHundredmHeartRate !== null) ||
              (player.heartRateAvg !== undefined && player.heartRateAvg !== null) ||
              (player.attendance !== undefined && player.attendance !== null))
          ) {
            if (!player.sheetName) {
              indexObjectList5.push({ i, j });
            }
          }
        } else {
          // 更新行の場合
          // 削除フラグが未チェックの場合のみ実施
          if (player.deleteFlg === false) {
            if (player.sheetName === undefined || player.sheetName === null) {
              indexObjectList5.push({ i, j });
            }
          }
        }
      });
      return indexObjectList5.length > 0;
    });
    if (seatNo) {
      indexObjectList5.map((index) => {
        handleRaceResultRecordsCrewPlayerChangebyIndex(
          index.i,
          index.j,
          'errorText',
          'シート番号を選択してください。',
        );
      });
      return false;
    } else {
      clearError();
    }

    /**
     * シート番号
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。
     * 同一「選手情報一覧」内で、シート番号が重複していないことを確認
     * 「シート番号が重複しています。」
     */
    // {i, j}[]の形式でindexを保持する
    var indexObjectList6 = [] as { i: number; j: number }[];
    const seatNo2 = raceResultRecords.some((record, i) => {
      record.crewPlayer?.map((player, j) => {
        // 追加行と更新行の場合で処理をわけない
        if (player.sheetName) {
          const seatNoList = raceResultRecords
            .map((record) => record.crewPlayer?.map((player) => player.sheetName))
            .flat();
          if (seatNoList.filter((item) => item === player.sheetName).length > 1) {
            indexObjectList6.push({ i, j });
          }
        }
      });
      return indexObjectList6.length > 0;
    });
    if (seatNo2) {
      indexObjectList6.map((index) => {
        handleRaceResultRecordsCrewPlayerChangebyIndex(
          index.i,
          index.j,
          'errorText',
          'シート番号が重複しています。',
        );
      });
      return false;
    } else {
      clearError();
    }

    /**
     * 心拍数（500m）
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。
     * 「「心拍数」は、半角数字で999までの数値を入力してください。」
     * ※表示場所は、当該行の直下に表示する。
     */
    // {i, j}[]の形式でindexを保持する
    var indexObjectList7 = [] as { i: number; j: number }[];
    const heartRate = raceResultRecords.some((record, i) => {
      record.crewPlayer?.map((player, j) => {
        if (
          player.fiveHundredmHeartRate &&
          !/^\d{1,3}$/.test(player?.fiveHundredmHeartRate.toString())
        ) {
          indexObjectList7.push({ i, j });
        }
      });
      return indexObjectList7.length > 0;
    });
    if (heartRate) {
      indexObjectList7.map((index) => {
        handleRaceResultRecordsCrewPlayerChangebyIndex(
          index.i,
          index.j,
          'errorText',
          '「心拍数」は、半角数字で999までの数値を入力してください。',
        );
      });
      return false;
    }

    /**
     * 心拍数（1000m）
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。
     * 「「心拍数」は、半角数字で999までの数値を入力してください。」
     * ※表示場所は、当該行の直下に表示する。
     */
    // {i, j}[]の形式でindexを保持する
    var indexObjectList8 = [] as { i: number; j: number }[];
    const heartRate2 = raceResultRecords.some((record, i) => {
      record.crewPlayer?.map((player, j) => {
        if (
          player.tenHundredmHeartRate &&
          !/^\d{1,3}$/.test(player?.tenHundredmHeartRate.toString())
        ) {
          indexObjectList8.push({ i, j });
        }
      });
      return indexObjectList8.length > 0;
    });
    if (heartRate2) {
      indexObjectList8.map((index) => {
        handleRaceResultRecordsCrewPlayerChangebyIndex(
          index.i,
          index.j,
          'errorText',
          '「心拍数」は、半角数字で999までの数値を入力してください。',
        );
      });
      return false;
    }

    /**
     * 心拍数（1500m）
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。
     * 「「心拍数」は、半角数字で999までの数値を入力してください。」
     * ※表示場所は、当該行の直下に表示する。
     */
    // {i, j}[]の形式でindexを保持する
    var indexObjectList9 = [] as { i: number; j: number }[];
    const heartRate3 = raceResultRecords.some((record, i) => {
      record.crewPlayer?.map((player, j) => {
        if (
          player.fifteenHundredmHeartRate &&
          !/^\d{1,3}$/.test(player?.fifteenHundredmHeartRate.toString())
        ) {
          indexObjectList9.push({ i, j });
        }
      });
      return indexObjectList9.length > 0;
    });
    if (heartRate3) {
      indexObjectList9.map((index) => {
        handleRaceResultRecordsCrewPlayerChangebyIndex(
          index.i,
          index.j,
          'errorText',
          '「心拍数」は、半角数字で999までの数値を入力してください。',
        );
      });
      return false;
    } else {
      clearError();
    }

    /**
     * 心拍数（2000m）
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。
     * 「「心拍数」は、半角数字で999までの数値を入力してください。」
     * ※表示場所は、当該行の直下に表示する。
     */
    // {i, j}[]の形式でindexを保持する
    var indexObjectList10 = [] as { i: number; j: number }[];
    const heartRate4 = raceResultRecords.some((record, i) => {
      record.crewPlayer?.map((player, j) => {
        if (
          player.twentyHundredmHeartRate &&
          !/^\d{1,3}$/.test(player?.twentyHundredmHeartRate.toString())
        ) {
          indexObjectList10.push({ i, j });
        }
      });
      return indexObjectList10.length > 0;
    });
    if (heartRate4) {
      indexObjectList10.map((index) => {
        handleRaceResultRecordsCrewPlayerChangebyIndex(
          index.i,
          index.j,
          'errorText',
          '「心拍数」は、半角数字で999までの数値を入力してください。',
        );
      });
      return false;
    }

    /**
     * 心拍数（平均）
     * 入力値チェック
     * NGの場合、以下のエラーメッセージを入力値評価エラーとしてに赤文字で表示する。
     * 「「心拍数」は、半角数字で999までの数値を入力してください。」
     * ※表示場所は、当該行の直下に表示する。
     */
    // {i, j}[]の形式でindexを保持する
    var indexObjectList11 = [] as { i: number; j: number }[];
    const heartRate5 = raceResultRecords.some((record, i) => {
      record.crewPlayer?.map((player, j) => {
        if (player.heartRateAvg && !/^\d{1,3}$/.test(player?.heartRateAvg.toString())) {
          indexObjectList11.push({ i, j });
        }
      });
      return indexObjectList11.length > 0;
    });
    if (heartRate5) {
      indexObjectList11.map((index) => {
        handleRaceResultRecordsCrewPlayerChangebyIndex(
          index.i,
          index.j,
          'errorText',
          '「心拍数」は、半角数字で999までの数値を入力してください。',
        );
      });
      return false;
    } else {
      clearError();
    }

    /**
     * 「選手情報」に種目の人数分、登録可能な行が存在することを確認
     * ※登録可能な行：「削除」が未チェック、かつエラー行ではない。
     * ※種目の人数：当該種目の人数を「種目マスター」.「人数」から取得する
     * エラーの場合、以下のエラーメッセージをシステムエラーとしてに赤文字で表示し、以降の処理は行わない。
     * ※表示場所は、選手IDを入力した「選手情報一覧」と「ストロークレート」の間の余白
     */
    var indexList25 = [] as number[];
    const playerNum = raceResultRecords.some((record, i) => {
      var count = 0;
      record.crewPlayer?.map((player, j) => {
        if (!player.deleteFlg && !player.errorText) {
          count++;
        }
      });
      if (count !== playerCount) {
        indexList25.push(i);
      }
      return indexList25.length > 0;
    });

    if (playerNum) {
      indexList25.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'errorText',
          '「選手情報」に種目の人数分、登録してください。',
        );
      });
      return false;
    } else {
      clearError();
    }

    // エラーがない場合、trueを返す
    return true;
  };

  useEffect(() => {
    /**
     * モード共通
     * マスタ取得
     */
    const fetchMaster = async () => {
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        // レース名（マスタ）の取得
        //const response = await axios.get('http://localhost:3100/raceName');
        const response = await axios.get('/getAllRaces');
        //console.log(response);
        const raceList = response.data.map(
          ({ race_id, race_name }: { race_id: number; race_name: string }) => ({
            id: race_id,
            name: race_name,
          }),
        );
        setRaceNameOptions(raceList);

        // 所属団体（マスタ）の取得
        //const response2 = await axios.get('http://localhost:3100/orgName');
        const response2 = await axios.get('/getOrganizations');
        const orgList = response2.data.map(
          ({ org_id, org_name }: { org_id: number; org_name: string }) => ({
            id: org_id,
            name: org_name,
          }),
        );
        setOrgOptions(orgList);

        // 天候（マスタ）の取得
        //const response3 = await axios.get('http://localhost:3100/weather');
        const response3 = await axios.get('/getWeatherType');
        const weatherList = response3.data.map(
          ({ weather_id, weather_name }: { weather_id: number; weather_name: string }) => ({
            id: weather_id,
            name: weather_name,
          }),
        );
        setWeatherOptions(weatherList);

        // 風向き（マスタ）の取得
        //const response4 = await axios.get('http://localhost:3100/windDirection');
        const response4 = await axios.get('/getWindDirection');
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

        // レース結果備考（マスタ）の取得
        //const response5 = await axios.get('http://localhost:3100/remark');
        const response5 = await axios.get('/getRaceResultNotes');
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

        // シート番号（マスタ）の取得
        //const response6 = await axios.get('http://localhost:3100/seatNo');
        const response6 = await axios.get('/getSeatNumber');
        const seatNumberList = response6.data.map(
          ({ seat_id, seat_name }: { seat_id: number; seat_name: string }) => ({
            id: seat_id,
            name: seat_name,
          }),
        );
        setSheetNameIdOptions(seatNumberList);
      } catch (error: any) {
        setErrorText([error.message]);
      }
    };
    fetchMaster();

    /**
     * 登録モード
     * 遷移元より渡された大会IDと種目IDに紐づく「レーステーブル」のレースの内、「出漕結果記録テーブル」に登録されていないレースの「レース情報」を取得する。
     * 取得した「レース情報」の件数が0件の場合、以下のメッセージをポップアップ表示し、「大会レース結果管理画面」に遷移する。
     * 既に全てのレース結果が登録されています。
     * 新たにレース結果を登録することはできません。
     */
    const fetchRaceInfo = async () => {
      try {
        console.log('====================');
        // レース情報の取得
        // TODO: 検索処理に置き換え
        // const response = await axios.get('http://localhost:3100/raceInfo?id=1');
        const sendData = {
          tourn_id: tournId,
          event_id: eventId,
        };
        console.log(sendData);
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        const response = await axios.post('/getRaceDataFromTournIdAndEventId', sendData);
        console.log(response);
        const data = response.data.result;
        if (data.length === 0) {
          alert(
            '既に全てのレース結果が登録されています。新たにレース結果を登録することはできません。',
          );
          router.back();
        } else {
          setRaceInfo(data[0]);
        }
        console.log('====================');
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
        console.log('aaaaaaaaaaaaa');
        // レース情報の取得
        // const response = await axios.get('http://localhost:3100/raceInfo?id=' + raceId);
        const sendData = {
          race_id: raceId,
        };
        console.log(sendData);
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        const response = await axios.post('/getRaceDataRaceId', sendData);
        console.log(response.data);
        // window.alert("hoge");
        const data = response.data;
        if (data.length == 0) {
          setErrorText(['レース情報が取得できませんでした。']);
          setRaceInfo({} as RaceTable);
          scrollTo(0, 0);
        } else {
          setRaceInfo(data.race_result[0]);
        }

        // 出漕結果記録情報の取得
        // const response2 = await axios.get('http://localhost:3100/raceResultRecord');
        setRaceResultRecordResponse(data.record_result[0]);

        // レース結果情報の取得
        // const response3 = await axios.get('http://localhost:3100/raceResultRecords');

        // 10件以上は表示できないため、エラーメッセージを表示する
        if (data.record_result.length > 10) {
          // setErrorText(['1つのレースに登録できるクルーは、10クルーまでです。']); //既に注釈で同じ文章が記載されているため不要 20240405
          // 設定するのは10件まで
          setRaceResultRecords(data.record_result.slice(0, 10));
          scrollTo(0, 0);
        }
        console.log('eeeeeeeeeee');
      } catch (error: any) {
        console.log(error);
        // setErrorText([error.message]);
        scrollTo(0, 0);
      }
    };
    if (mode == 'update') {
      fetchRaceInfoForUpdate();
    }
  }, []);

  // レース情報の取得
  useEffect(() => {
    const fetchRaceInfo = async () => {
      try {
        // レース情報の取得
        // const response = await axios.get('http://localhost:3100/raceInfo?id=' + raceInfo?.race_id);
        const sendData = {
          race_id: raceId,
        };
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        const response = await axios.post('/getRaceDataRaceId', sendData);
        console.log(response.data.result);

        const data = response.data.result;
        // 遷移元からイベントIDが取得できる時だけ、遷移元からのイベントIDをセットする。セットされていない時は、レース情報からイベントIDをセットする。

        setRaceInfo({
          ...data[0],
          eventId: eventId || data[0].eventId,
        });

        // 種目マスタに紐づく選手の人数 (バックエンドからの取得方法不明のためDummy)
        // TODO: 種目マスタに紐づく選手の人数を取得する
        const response2 = Math.floor(Math.random() * 5) + 1;
        setPlayerCount(response2);
        if (mode === 'create') {
          // レース結果情報の取得
          // 選手情報の件数が種目マスタに紐づく選手の人数より少ない場合、足りない件数分追加行を追加する

          raceResultRecords.map((record) => {
            if (record.crewPlayer?.length < response2) {
              record.crewPlayer = record.crewPlayer.concat(
                Array.from({ length: response2 - record.crewPlayer.length }, () => ({
                  //id: undefined,
                  playerPhoto: '',
                  playerName: '',
                  jaraPlayerId: '',
                  playerId: '',
                  sexId: '',
                  sex: '',
                  height: undefined,
                  weight: undefined,
                  sheetName: '',
                  sheetNameId: undefined,
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
            if (record.crewPlayer?.length > response2) {
              record.crewPlayer = record.crewPlayer.slice(0, response2);
            }
          }, []);
        }
      } catch (error: any) {}
    };
    fetchRaceInfo();
  }, [raceInfo?.race_id]);

  // レンダリング
  return (
    <div className='flex flex-col gap-[20px] w-full h-full p-[20px]'>
      <CustomTitle isCenter={true}>
        レース結果{mode === 'create' ? '登録' : mode === 'update' ? '更新' : '入力確認'}
      </CustomTitle>
      <ErrorBox errorText={errorText?.length > 0 ? errorText : []} />
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
                    const csrf = () => axios.get('/sanctum/csrf-cookie');
                    await csrf();
                    const response = await axios.post('/getRaceDataRaceId', sendData);
                    console.log(response.data);
                    const data = response.data;
                    if (data.length == 0) {
                      setErrorText(['レース情報が取得できませんでした。']);
                      setRaceInfo({} as RaceTable);
                      scrollTo(0, 0);
                    } else {
                      setRaceInfo(data.race_result[0]);
                    }
                  }}
                  readonly={mode === 'update' || mode === 'confirm'}
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
                      value={
                        ({ name: raceInfo?.race_name, id: raceInfo?.race_id } as any) ||
                        ({ id: 0, name: '' } as MasterResponse)
                      }
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
                        const csrf = () => axios.get('/sanctum/csrf-cookie');
                        await csrf();
                        const response = await axios.post('/getRaceDataRaceId', sendData);
                        console.log(response.data);
                        const data = response.data;
                        if (data.length == 0) {
                          setErrorText(['レース情報が取得できませんでした。']);
                          setRaceInfo({} as RaceTable);
                          scrollTo(0, 0);
                        } else {
                          setRaceInfo(data.race_result[0]);
                        }
                      }}
                      renderOption={(props: any, option: MasterResponse) => {
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
                  ></CustomTextField>
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
                value={raceInfo?.event_name || ''}
                readonly
                displayHelp={false}
              />
            </div>
            <div className='flex flex-col justify-between gap-[1px] w-[50%]'>
              <CustomTextField
                label='レース区分'
                value={raceInfo?.race_class_name?.toString() || ''}
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
                value={raceInfo?.range?.toString() || ''}
                readonly
                displayHelp={false}
              />
              <CustomTextField
                label='発艇予定日時'
                value={raceInfo?.startDateTime || ''}
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
                  selectedDate={raceResultRecordResponse?.startDateTime}
                  onChange={(e: any) => {
                    handleRaceResultRecordInputChange(
                      'startDateTime',
                      e.toISOString('yyyy/MM/dd HH:mm'),
                    );
                  }}
                  className='w-[200px]'
                  useTime
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
                ></CustomTextField>
              )}
            </div>
            {mode !== 'confirm' && (
              <p className='mt-auto text-secondaryText'>※例) 2021/12/31 12:34</p>
            )}
          </div>
          <div className='flex flex-row justify-left gap-[80px] item-center'>
            <div className='flex flex-col gap-[8px]'>
              <InputLabel label='天気' />
              <CustomDropdown
                value={
                  mode === 'confirm'
                    ? raceResultRecordResponse?.weatherName
                    : raceResultRecordResponse?.weatherId?.toString() || ''
                }
                options={weatherOptions.map((item) => ({
                  key: item.id,
                  value: item.name,
                }))}
                className='w-[200px]'
                id='weather'
                onChange={(e) => {
                  handleRaceResultRecordInputChange('weatherId', e);
                  handleRaceResultRecordInputChange(
                    'weatherName',
                    weatherOptions.find((item) => item.id === Number(e))?.name || '',
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
                    ? raceResultRecordResponse?.tenHundredmWindDirectionName
                    : raceResultRecordResponse?.wind_direction_1000m_point?.toString() || ''
                }
                options={windDirectionOptions.map((item) => ({
                  key: item.id,
                  value: item.name,
                }))}
                className='w-[200px]'
                onChange={(e) => {
                  handleRaceResultRecordInputChange('wind_direction_1000m_point', e);
                  handleRaceResultRecordInputChange(
                    'tenHundredmWindDirectionName',
                    windDirectionOptions.find((item) => item.id === Number(e))?.name || '',
                  );
                }}
                readonly={mode === 'confirm'}
              ></CustomDropdown>
            </div>
            {/* 単位はm/秒 */}
            <CustomTextField
              label='1000m地点風速'
              value={raceResultRecordResponse?.wind_speed_1000m_point?.toString() || ''}
              displayHelp={false}
              type='number'
              inputAdorment='m/秒'
              onChange={(e) => {
                handleRaceResultRecordInputChange('wind_speed_1000m_point', e.target.value);
              }}
              readonly={mode === 'confirm'}
            />
          </div>
          <div className='flex flex-row justify-left gap-[80px] item-center'>
            <div className='flex flex-col gap-[8px]'>
              <InputLabel label='2000m地点風向' />
              <CustomDropdown
                id='2000mWindDirection'
                value={
                  mode === 'confirm'
                    ? raceResultRecordResponse?.twentyHundredmWindDirectionName
                    : raceResultRecordResponse?.wind_direction_2000m_point?.toString() || ''
                }
                options={windDirectionOptions.map((item) => ({
                  key: item.id,
                  value: item.name,
                }))}
                className='w-[200px]'
                onChange={(e) => {
                  handleRaceResultRecordInputChange('wind_direction_2000m_point', e);
                  handleRaceResultRecordInputChange(
                    'twentyHundredmWindDirectionName',
                    windDirectionOptions.find((item) => item.id === Number(e))?.name || '',
                  );
                }}
                readonly={mode === 'confirm'}
              ></CustomDropdown>
            </div>
            <CustomTextField
              label='2000m地点風速'
              value={raceResultRecordResponse?.wind_speed_2000m_point?.toString() || ''}
              displayHelp={false}
              type='number'
              inputAdorment='m/秒'
              onChange={(e) => {
                handleRaceResultRecordInputChange('wind_speed_2000m_point', e.target.value);
              }}
              readonly={mode === 'confirm'}
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
                          addonLineFlg: true,
                        }) as CrewPlayer,
                    ),
                  },
                  ...prevFormData,
                ]);
              } else {
                // setErrorText(['1つのレースに登録できるクルーは、10クルーまでです。']);
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
        <div className='flex flex-col gap-[20px] border border-solid p-[20px]' key={index}>
          <InputLabel label={'レース結果情報' + (index + 1)} />
          <ErrorBox errorText={item.errorText ? [item.errorText] : []} />
          <div className='flex flex-row justify-between'>
            {mode === 'update' && (
              <div
                onClick={() => {
                  handleRaceResultRecordsInputChangebyIndex(
                    index,
                    'deleteFlg',
                    (!item.deleteFlg).toString(),
                  );
                }}
                className='leading-loose text-primary-500 flex flex-row gap-[8px] items-center cursor-pointer'
              >
                <OriginalCheckbox
                  id={'deleteFlg' + index}
                  value='deleteFlg'
                  checked={item.deleteFlg || false}
                  onChange={() => {}}
                />
                <p className='text-systemErrorText'>このレース結果情報を削除する</p>
              </div>
            )}
            {mode === 'create' && (
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
                          'orgName',
                          orgOptions.find((item) => item.id === e)?.name || '',
                        );
                      }}
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
                  />
                  <CustomTextField
                    label='出漕レーンNo'
                    value={item?.lane_number?.toString() || ''}
                    displayHelp={false}
                    type='number'
                    onChange={(e) => {
                      handleRaceResultRecordsInputChangebyIndex(
                        index,
                        'laneNumber',
                        e.target.value,
                      );
                    }}
                    readonly={mode === 'confirm'}
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
                          <InputLabel label='備考' />
                          <Autocomplete
                            options={remarkOptions.map((item) => ({
                              id: item.id,
                              name: item.name,
                            }))}
                            getOptionLabel={(option) => option?.name || ''}
                            value={{ id: Number(item.remarkId), name: item.race_result_notes } || ''}
                            onChange={(e: ChangeEvent<{}>, newValue) => {
                              handleRaceResultRecordsInputChangebyIndex(
                                index,
                                 'remarkId',
                                 newValue ? (newValue as MasterResponse).id?.toString() : '',
                                  );
                              handleRaceResultRecordsInputChangebyIndex(
                                index,
                                'race_result_notes',
                                newValue ? (newValue as MasterResponse).name : '',                              );
                            }}
                            onInputChange={(e, newValue) => {
                              handleRaceResultRecordsInputChangebyIndex(
                                index,
                                'race_result_notes',
                                newValue || '',
                              );
                            }}
                            renderOption={(props: any, option: MasterResponse) => {
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
                                value={item.race_result_notes || ''}
                              />
                            )}
                            freeSolo
                            className={'w-[120px]'}
                          />
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
                        newFormData[index].crewPlayer = newFormData[index].crewPlayer?.map(
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
                        newFormData[index].crewPlayer = newFormData[index].crewPlayer?.map(
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
            <CustomTable>
              <CustomThead>
                <CustomTr>
                  <CustomTh rowSpan={2}>
                    <p>削除</p>
                  </CustomTh>
                  <CustomTh rowSpan={2} className='w-[110px]'>
                    <p>選手ID</p>
                  </CustomTh>
                  <CustomTh rowSpan={2} className='w-[160px]'>
                    <p>選手名</p>
                  </CustomTh>
                  <CustomTh rowSpan={2}>
                    <p>性別</p>
                  </CustomTh>
                  <CustomTh rowSpan={2} className='w-[120px]'>
                    <p>身長</p>
                  </CustomTh>
                  <CustomTh rowSpan={2} className='w-[120px]'>
                    <p>体重</p>
                  </CustomTh>
                  <CustomTh rowSpan={2} className='w-[130px]'>
                    <p>シート番号</p>
                  </CustomTh>
                  <CustomTh rowSpan={1} colSpan={5}>
                    <p>心拍数(回/分)</p>
                  </CustomTh>
                  <CustomTh rowSpan={1}>
                    <p>エルゴ</p>
                  </CustomTh>
                </CustomTr>
                <CustomTr>
                  <CustomTh className='w-[90px]'>
                    <p>500m</p>
                  </CustomTh>
                  <CustomTh className='w-[90px]'>
                    <p>1000m</p>
                  </CustomTh>
                  <CustomTh className='w-[90px]'>
                    <p>1500m</p>
                  </CustomTh>
                  <CustomTh className='w-[90px]'>
                    <p>2000m</p>
                  </CustomTh>
                  <CustomTh className='w-[90px]'>
                    <p>平均</p>
                  </CustomTh>
                  <CustomTh>
                    <p>
                      立ち会い
                      <br />
                      有無
                    </p>
                  </CustomTh>
                </CustomTr>
              </CustomThead>
              <CustomTbody>
                {item.crewPlayer?.map((player, crewIndex) => (
                  <>
                    <CustomTr key={crewIndex}>
                      <CustomTd>
                        <div className='flex justify-center'>
                          <OriginalCheckbox
                            id={'deleteFlg' + index + crewIndex}
                            value='deleteFlg'
                            checked={player.deleteFlg || false}
                            onChange={(e) => {
                              handleRaceResultRecordsCrewPlayerChangebyIndex(
                                index,
                                crewIndex,
                                'deleteFlg',
                                e.target.checked ? 'true' : 'false',
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
                          readonly={mode === 'confirm'}
                        />
                      </CustomTd>
                      <CustomTd>
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
                          readonly={mode === 'confirm'}
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
                        />
                      </CustomTd>
                      <CustomTd>
                        <CustomDropdown
                          id='sheetName'
                          value={
                            mode === 'confirm'
                              ? player?.sheetName
                              : player?.sheetNameId?.toString() || ''
                          }
                          options={sheetNameIdOptions.map((item) => ({
                            key: item.id,
                            value: item.name,
                          }))}
                          onChange={(e) => {
                            handleRaceResultRecordsCrewPlayerChangebyIndex(
                              index,
                              crewIndex,
                              'sheetNameId',
                              e,
                            );
                            handleRaceResultRecordsCrewPlayerChangebyIndex(
                              index,
                              crewIndex,
                              'sheetName',
                              sheetNameIdOptions.find((item) => item.id === Number(e))?.name || '',
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
                          <div className='text-systemErrorText text-small leading-loose'>
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
      ))}
      <div className='flex flex-row justify-between gap-[80px] mt-[20px]'>
        <CustomButton
          buttonType='secondary'
          onClick={() => {
            if (mode == 'comfirm') {
              router.back(); //確認画面の場合、1つ前の画面に戻る
            } else {
              router.push('/tournamentResultManagement');
            }
          }}
          className='w-[170px]'
        >
          {mode == 'confirm' ? '戻る' : '管理画面に戻る'}
        </CustomButton>
        <CustomButton
          buttonType='primary'
          onClick={() => {
            /**
             * 各「レース結果情報入力」.「選手情報一覧」.「削除」にて、全ての選手がチェック状態の「レース結果情報」が存在する場合、
             * 以下のメッセージをポップアップ表示する。
             * 全ての選手が削除対象となっている「レース結果情報」があります。
             * 当該「レース結果情報」は、削除されますがよろしいですか？
             */
            const isAllPlayerChecked = raceResultRecords.some(
              (item) => item.crewPlayer?.every((player) => player.deleteFlg),
            );
            console.log(isAllPlayerChecked);
            if (isAllPlayerChecked) {
              const isOK = confirm(
                '全ての選手が削除対象となっている「レース結果情報」があります。当該「レース結果情報」は、削除されますがよろしいですか？',
              );
              if (!isOK) {
                return;
              }
              setRaceResultRecords(
                raceResultRecords.filter(
                  (item) => !item.crewPlayer?.every((player) => player.deleteFlg),
                ),
              );
            }
            // バリデーション
            const isValid = validateRaceResultRecords();
            console.log(isValid);
            if (isValid) {
              if (mode === 'create') {
                // 登録処理
                // 同画面にconfirmモードで遷移
                router.push('/tournamentResult?mode=confirm&prevMode=create');
              } else if (mode === 'update') {
                // 更新処理
                router.push('/tournamentResult?mode=confirm&prevMode=update');
              }
            }
          }}
          className='w-[170px]'
        >
          {prevMode === 'create' ? '登録' : prevMode === 'update' ? '更新' : '確認'}
        </CustomButton>
        <div className='w-[170px]'></div>
      </div>
    </div>
  );
}
