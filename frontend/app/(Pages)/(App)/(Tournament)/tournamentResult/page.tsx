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

interface UpdatedRaceResultRecordsResponse extends RaceResultRecordsResponse {
  isAdded: boolean;
}

// // 大会レース結果管理画面のメインコンポーネント
export default function TournamentResult() {
  // フック
  const router = useRouter();

  // ステート変数
  //エラーメッセージの設定
  const [errorText, setErrorText] = useState([] as string[]);
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
  const [sheetNameIdOptions, setSheetNameIdOptions] = useState<MasterResponse[]>([]);

  // レース基本情報のモデル
  const [raceInfo, setRaceInfo] = useState<RaceTable>({} as RaceTable);

  // 出漕結果記録情報のモデル（出漕時点情報）
  const [raceResultRecordResponse, setRaceResultRecordResponse] =
    useState<UpdatedRaceResultRecordsResponse>({} as UpdatedRaceResultRecordsResponse);

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
    const csrf = () => axios.get('/sanctum/csrf-cookie');
    await csrf();
    //const playerSearch = await axios.get('http://localhost:3100/teamPlayers?id=' + value);
    const sendId = { player_id: value };
    console.log(sendId);
    const playerSearch = await axios.post('/getCrewPlayerInfo', sendId);
    console.log('player_id', value);
    console.log('playerSearch', playerSearch);

    //名前の異なるバックエンド側とフロント側のキーを紐づける 20240410
    if (playerSearch.data.result.length > 0) {
      playerSearch.data.result[0].playerId = playerSearch.data.result[0].player_id;
      playerSearch.data.result[0].playerName = playerSearch.data.result[0].player_name;
      playerSearch.data.result[0].sexId = playerSearch.data.result[0].sex_id;
      playerSearch.data.result[0].sex = playerSearch.data.result[0].sexName;
    }
    const player = playerSearch.data.result[0];
    console.log(player);
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
          ...newFormData[index]?.crewPlayer[crewIndex],
          errorText: 'システムに登録されていない選手のIDです。',
        };
        return newFormData;
      });
      return;
    } else {
      setRaceResultRecords((prevFormData) => {
        const newFormData = [...prevFormData];
        newFormData[index].crewPlayer[crewIndex] = {
          ...newFormData[index]?.crewPlayer[crewIndex],
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
        deleteFlg: player ? newFormData[index]?.crewPlayer[crewIndex]?.deleteFlg : false,
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
   * レース結果情報の入力値をバリデーションする関数 すべての元凶 20240514 324行目から1446行目まで
   * @returns
   */
  const validateRaceResultRecords = () => {
    var errorCount = 0;
    //レースID　必須チェック
    const raceId = Validator.validateRequired(raceInfo?.race_id, 'レースID');
    if (raceId) {
      // setErrorText([raceId]);
      setRaceIdErrorText(raceId);
      errorCount++;
    }
    //レース名　必須チェック
    const raceName = Validator.validateRequired(raceInfo?.race_name, 'レース名');
    if (raceName) {
      // setErrorText([raceName]);
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
      // setErrorText(['半角数字で、999までの数字を入力してください。']);
      setWindSpeed1000mPointErrorText('半角数字で、999までの数字を入力してください。');
      errorCount++;
    }
    //2000m地点風速 入力値チェック
    const windSpeed2 = raceResultRecordResponse.wind_speed_2000m_point;
    if (windSpeed2 && !/^\d{1,3}$/.test(windSpeed2.toString())) {
      // setErrorText(['半角数字で、999までの数字を入力してください。']);
      setWindSpeed2000mPointErrorText('半角数字で、999までの数字を入力してください。');
      errorCount++;
    }

    //共通部分　ここまで
    //=============================================================
    //=============================================================
    //クルー単位の内容　ここから

    //選手情報に全ての削除チェックがされている項目以外をバリデーションチェック対象とする 20240516
    var validateCheckList = raceResultRecords.filter(
      (item) => !item?.crewPlayer?.every((player) => player.deleteFlg),
    );

    //レース結果情報の要素数分ループ
    for (let index = 0; index < validateCheckList.length; index++) {
      //所属団体 空欄チェック
      if (!validateCheckList[index].org_id) {
        validateCheckList[index].orgNameErrorText = '所属団体を選択してください。';
      } else {
        validateCheckList[index].orgNameErrorText = '';
      }

      //クルー名　空欄チェック
      if (!validateCheckList[index].crew_name) {
        validateCheckList[index].crewNameErrorText = 'クルー名を入力してください。';
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
      } else {
        validateCheckList[index].laneNumberErrorText = '';
      }

      //順位 空欄チェック 入力値チェック
      if (!validateCheckList[index].rank) {
        validateCheckList[index].rankErrorText = '順位を入力してください';
      } else if (
        validateCheckList[index].rank &&
        !/^\d{1,2}$/.test(validateCheckList[index]?.rank.toString())
      ) {
        validateCheckList[index].rankErrorText =
          '順位は半角数字で、99までの数値を入力してください。';
      } else {
        validateCheckList[index].rankErrorText = '';
      }
    }

    //クルー名、所属団体組み合わせ
    validateCheckList.some((record, i) => {
      validateCheckList.some((record2, j) => {
        if (i !== j && record.org_id === record2.org_id && record.crew_name === record2.crew_name) {
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
    validateCheckList.some((record, i) => {
      validateCheckList.some((record2, j) => {
        if (
          i !== j &&
          record.lane_number === record2.lane_number &&
          (record.lane_number || record2.lane_number)
        ) {
          handleRaceResultRecordsInputChangebyIndex(
            i,
            'errorText',
            '出漕レーンNoが重複しています。',
          );
          errorCount++;
        }
      });
    });

    //順位 重複チェック
    validateCheckList.some((record, i) => {
      validateCheckList.some((record2, j) => {
        if (i !== j && record.rank === record2.rank) {
          handleRaceResultRecordsInputChangebyIndex(i, 'errorText', '順位が重複しています。');
          errorCount++;
        }
      });
    });

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

    //クルー単位の内容　ここまで
    //=============================================================
    //=============================================================
    //選手単位の内容　ここから

    //空欄チェック
    validateCheckList.map((record, i) => {
      record?.crewPlayer?.map((player, j) => {
        // 追加行の場合 削除フラグが未チェックかつ、playerの何れかの項目に値が入っている場合に実施
        if (player.addonLineFlg) {
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
            var errorTextData = '';
            if (!player.playerId) {
              errorTextData += '選手IDを入力してください。';
            }
            if (!player.playerName) {
              errorTextData += '選手名を入力してください。';
            }
            if (!player.height) {
              errorTextData += '身長を入力してください。';
            }
            if (!player.weight) {
              errorTextData += '体重を入力してください。';
            }
            if (!player.sheetNameId) {
              errorTextData += 'シート番号を選択してください。';
            }
            if (errorTextData.length > 0) {
              handleRaceResultRecordsCrewPlayerChangebyIndex(i, j, 'errorText', errorTextData);
              errorCount++;
            }
          }
        } else {
          // 更新行の場合 削除フラグが未チェックの場合のみ実施
          if (!player.deleteFlg) {
            var errorTextData = '';
            //選手ID 空欄チェック
            if (!player.playerId) {
              errorTextData += '選手IDを入力してください。';
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
            if (!player.sheetNameId) {
              errorTextData += 'シート番号を選択してください。';
            } else if (player.sheetName) {
              const seatNoList = record?.crewPlayer?.map((player) => player.sheetName);
              // console.log(seatNoList);
              if (seatNoList.filter((item) => item === player.sheetName).length > 1) {
                errorTextData += 'シート番号が重複しています。';
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
            }
          }
        }
      });
    });

    //種目の人数分、登録可能な行が存在することを確認する
    var playerCountErrorList = [] as number[];
    const playerNum = validateCheckList.some((record, i) => {
      var count = 0;
      record?.crewPlayer?.map((player, j) => {
        // console.log(playerCount,count, player.deleteFlg, player.errorText);
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
          player.sheetName != '' &&
          player.sheetName != null &&
          player.sheetName != undefined
        ) {
          count++;
        }
      });
      console.log('yyyyyyyyyyyyy');
      console.log(count, playerCount);
      if (count != playerCount) {
        playerCountErrorList.push(i);
      }
      return playerCountErrorList.length > 0;
    });
    if (playerNum) {
      playerCountErrorList.map((index) => {
        handleRaceResultRecordsInputChangebyIndex(
          index,
          'errorText',
          '「選手情報」に種目の人数分、登録してください。',
        );
      });
      errorCount++;
    }
    return errorCount;
  };

  //バリデーションここまで
  //================================================================

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

        //大会結果管理 試作中 20240422
        const sendData = {
          tourn_id: tournId,
          event_id: eventId,
        };
        const responseDataList = await axios.post('/getTournLinkRaces', sendData); //大会IDと種目IDに紐づいたレース結果のないレースを取得 20240422
        console.log(responseDataList); //20240422
        // const response = await axios.get('/getAllRaces');
        //console.log(response);
        const raceList = responseDataList.data.result.map(
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
          alert('選択されている種目は、開催予定のない種目になります。');
          router.back();
        } else {
          // setRaceInfo(data[0]); //レース結果登録に画面遷移時は「レース基本情報」の項目はすべて空の状態にする 20240422
        }

        // 種目に対応したシート位置（マスタ）の取得 20240514
        const response6 = await axios.post('/getEventSheetPosForEventID', sendData);

        // シート番号（マスタ）の取得
        //const response6 = await axios.get('http://localhost:3100/seatNo');
        const response7 = await axios.get('/getSeatNumber');
        // console.log(response7.data);
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
        // console.log(newSeatNumberArray);
        setSheetNameIdOptions(newSeatNumberArray); //フィルタ後のリストをセットする 20240514

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
          data.race_result[0].startDateTime = data.race_result[0].start_date_time; //バックエンド側のキーをフロント側のキーに入れ直す 20240410
          setRaceInfo(data.race_result[0]);
        }

        const sendEventData = {
          event_id: eventId || data.race_result[0].event_id,
        };
        // 種目に対応したシート位置（マスタ）の取得 20240514
        const response6 = await axios.post('/getEventSheetPosForEventID', sendEventData);

        // シート番号（マスタ）の取得
        const response7 = await axios.get('/getSeatNumber');
        // console.log(response7.data);
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
        // console.log(newSeatNumberArray);
        setSheetNameIdOptions(newSeatNumberArray); //フィルタ後のリストをセットする 20240514

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
        } else if (data.record_result.length > 0 && data.record_result.length < 10) {
          //データが10件未満の場合の処理がなかったため追加 20240408
          console.log(data.record_result);
          setRaceResultRecords(data.record_result);
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
        var data = null;
        // レース情報の取得
        // const response = await axios.get('http://localhost:3100/raceInfo?id=' + raceInfo?.race_id);
        if (raceId != '' && raceId != null && raceId != undefined) {
          const sendData = {
            race_id: raceId,
          };
          const csrf = () => axios.get('/sanctum/csrf-cookie');
          await csrf();
          const response = await axios.post('/getRaceDataRaceId', sendData);
          console.log(response.data.race_result);

          data = response.data.race_result;
          data[0].startDateTime = data[0].start_date_time; //バックエンド側のキーをフロント側のキーに入れ直す 20240422
          // 遷移元からイベントIDが取得できる時だけ、遷移元からのイベントIDをセットする。セットされていない時は、レース情報からイベントIDをセットする。
          setRaceInfo({
            ...data[0],
            eventId: eventId || data[0].eventId,
          });
        }

        if (
          (eventId != '' && eventId != null && eventId != undefined) ||
          (data[0].event_id != '' && data[0].event_id != null && data[0].event_id != undefined)
        ) {
          // 種目マスタに紐づく選手の人数 (バックエンドからの取得方法不明のためDummy)
          // TODO: 種目マスタに紐づく選手の人数を取得する
          // const response2 = Math.floor(Math.random() * 5) + 1;
          const sendEventId = {
            event_id: eventId || data[0].event_id,
          };
          console.log('kkkkkkkkkkkkk');
          console.log(sendEventId);
          const res2 = await axios.post('/getCrewNumberForEventId', sendEventId);
          const response2 = res2.data.result;
          console.log(response2);

          setPlayerCount(response2);
          if (mode === 'create') {
            // レース結果情報の取得
            // 選手情報の件数が種目マスタに紐づく選手の人数より少ない場合、足りない件数分追加行を追加する

            raceResultRecords.map((record) => {
              if (record?.crewPlayer?.length < response2) {
                record.crewPlayer = record?.crewPlayer.concat(
                  Array.from({ length: response2 - record?.crewPlayer.length }, () => ({
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
              if (record?.crewPlayer?.length > response2) {
                record.crewPlayer = record?.crewPlayer.slice(0, response2);
              }
              record.isAdded = true;
            }, []);
          }
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
                    const data = response.data.race_result;
                    if (data.length == 0) {
                      setRaceInfo({} as RaceTable);
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
                        const data = response.data.race_result;
                        if (data.length == 0) {
                          setErrorText(['レース情報が取得できませんでした。']);
                          setRaceInfo({} as RaceTable);
                          scrollTo(0, 0);
                        } else {
                          //名前の異なるバックエンド側とフロント側のキーを紐づける 20240420
                          data[0].startDateTime = data[0].start_date_time;
                          setRaceInfo(data[0]);
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
                value={raceInfo?.range?.toString() ? raceInfo?.range?.toString() + 'm' : ''}
                readonly
                displayHelp={false}
              />
              <CustomTextField
                label='発艇予定日時'
                value={raceInfo?.startDateTime?.substring(0, 16) || ''}
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
                      // e.toISOString('yyyy/MM/dd HH:mm'),
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
                          <InputLabel label='備考' />
                          {/* <CustomDropdown
                            value={
                              mode === 'confirm'
                                ? item.race_result_notes
                                : item?.remarkId?.toString() || ''
                            }
                            options={remarkOptions.map((item) => ({
                              key: item.id,
                              value: item.name,
                            }))}
                            className='w-[120px]'
                            id='remark'
                            onChange={(e: any) => {
                              handleRaceResultRecordsInputChangebyIndex(index, 'remarkId', e);
                              handleRaceResultRecordsInputChangebyIndex(
                                index,
                                'race_result_notes',
                                remarkOptions.find((item) => item.id == e)?.name || '',
                              );
                            }}
                            readonly={mode === 'confirm'}
                          /> */}
                          <Autocomplete
                            options={remarkOptions.map((item) => ({
                              id: item.id,
                              name: item.name,
                            }))}
                            getOptionLabel={(option) =>
                              typeof option === 'string' ? option : option?.name || ''
                            }
                            value={
                              { id: Number(item.remarkId), name: item.race_result_notes } || ''
                            }
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
                                className={`border-[1px] border-solid border-gray-50 rounded-md ${
                                  mode === 'confirm' && item.deleteFlg ? 'bg-gray-500' : 'bg-white'
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
                            (mode == 'update' && player.addonLineFlg != true) || mode === 'confirm'
                          }
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
                          readonly={
                            (mode == 'update' && player.addonLineFlg != true) || mode === 'confirm'
                          }
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
            console.log(errorCount);
            if (errorCount == 0) {
              clearError(); //エラーメッセージのクリア
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

                router.push('/tournamentResult?mode=confirm&prevMode=create');
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
                  //登録・更新確認画面からバックエンド側にデータを送る 20240405
                  const sendData = {
                    raceInfo: raceInfo,
                    raceResultRecordResponse: raceResultRecordResponse,
                    raceResultRecords: raceResultRecords,
                  };
                  const csrf = () => axios.get('/sanctum/csrf-cookie');
                  await csrf();
                  const raceResponse = await axios.post(
                    '/registerRaceResultRecordForRegisterConfirm',
                    sendData,
                  );
                  console.log(raceResponse);
                  // router.push('/tournamentResult?mode=confirm&prevMode=update');
                  if (!raceResponse.data?.errMessage) {
                    router.push('/tournamentResultRef?raceId=' + raceResultRecordResponse.race_id);
                  }
                } else if (prevMode == 'update') {
                  //登録・更新確認画面からバックエンド側にデータを送る 20240405
                  const sendData = {
                    raceInfo: raceInfo,
                    raceResultRecordResponse: raceResultRecordResponse,
                    raceResultRecords: raceResultRecords,
                  };
                  const csrf = () => axios.get('/sanctum/csrf-cookie');
                  await csrf();
                  const raceResponse = await axios.post(
                    '/updateRaceResultRecordForUpdateConfirm',
                    sendData,
                  );
                  console.log(raceResponse);
                  // router.push('/tournamentResult?mode=confirm&prevMode=update');
                  if (!raceResponse.data?.errMessage) {
                    router.push('/tournamentResultRef?raceId=' + raceResultRecordResponse.race_id);
                  }
                }
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
