// CSVデータの型定義
interface CsvData {
  id: number; // ID
  checked: boolean; // 選択
  loadingResult: string; // 読み込み結果
  tournId: string; // 大会ID
  tournIdError: string | false; // 大会IDエラーの有無
  entrysystemTournId: string; // エントリーシステム大会ID
  entrysystemTournIdError: string | false; // エントリーシステム大会IDエラーの有無
  tournName: string; // 大会名
  tournNameError: string | false; // 大会名エラーの有無
  userId: string; // 選手ID
  userIdError: string | false; // 選手IDエラーの有無
  jaraPlayerId: string; // JARA選手コード
  jaraPlayerIdError: string | false; // JARA選手コードエラーの有無
  playerName: string; // 選手名
  playerNameError: string | false; // 選手名エラーの有無
  raceId: string; // レースID
  raceIdError: string | false; // レースIDエラーの有無
  entrysystemRaceId: string; // エントリーシステムレースID
  entrysystemRaceIdError: string | false; // エントリーシステムレースIDエラーの有無
  raceNumber: string; // レースNo
  raceNumberError: string | false; // レースNoエラーの有無
  raceName: string; // レース名
  raceNameError: string | false; // レース名エラーの有無
  raceTypeId: string; // レース区分ID
  raceTypeIdError: string | false; // レース区分IDエラーの有無
  raceTypeName: string; // レース区分名
  raceTypeNameError: string | false; // レース区分名エラーの有無
  orgId: string; // 団体ID
  orgIdError: string | false; // 団体IDエラーの有無
  entrysystemOrgId: string; // エントリーシステム団体ID
  entrysystemOrgIdError: string | false; // エントリーシステム団体IDエラーの有無
  orgName: string; // 団体名
  orgNameError: string | false; // 団体名エラーの有無
  crewName: string; // クルー名
  crewNameError: string | false; // クルー名エラーの有無
  byGroup: string; // 組別
  byGroupError: string | false; // 組別エラーの有無
  eventId: string; // 種目ID
  eventIdError: string | false; // 種目IDエラーの有無
  eventName: string; // 種目名
  eventNameError: string | false; // 種目名エラーの有無
  range: string; // 距離
  rangeError: string | false; // 距離エラーの有無
  rank: string; // 順位
  rankError: string | false; // 順位エラーの有無
  fiveHundredmLaptime: string; // 500mラップタイム
  fiveHundredmLaptimeError: string | false; // 500mラップタイムエラーの有無
  tenHundredmLaptime: string; // 1000mラップタイム
  tenHundredmLaptimeError: string | false; // 1000mラップタイムエラーの有無
  fifteenHundredmLaptime: string; // 1500mラップタイム
  fifteenHundredmLaptimeError: string | false; // 1500mラップタイムエラーの有無
  twentyHundredmLaptime: string; // 2000mラップタイム
  twentyHundredmLaptimeError: string | false; // 2000mラップタイムエラーの有無
  finalTime: string; // 最終タイム
  finalTimeError: string | false; // 最終タイムエラーの有無
  strokeRateAvg: string; // ストロークレート（平均）
  strokeRateAvgError: string | false; // ストロークレート（平均）エラーの有無
  fiveHundredmStrokeRat: string; // 500mストロークレート
  fiveHundredmStrokeRatError: string | false; // 500mストロークレートエラーの有無
  tenHundredmStrokeRat: string; // 1000mストロークレート
  tenHundredmStrokeRatError: string | false; // 1000mストロークレートエラーの有無
  fifteenHundredmStrokeRat: string; // 1500mストロークレート
  fifteenHundredmStrokeRatError: string | false; // 1500mストロークレートエラーの有無
  twentyHundredmStrokeRat: string; // 2000mストロークレート
  twentyHundredmStrokeRatError: string | false; // 2000mストロークレートエラーの有無
  heartRateAvg: string; // 平均心拍数
  heartRateAvgError: string | false; // 平均心拍数エラーの有無
  fiveHundredmHeartRate: string; // 500m心拍数
  fiveHundredmHeartRateError: string | false; // 500m心拍数エラーの有無
  tenHundredmHeartRate: string; // 1000m心拍数
  tenHundredmHeartRateError: string | false; // 1000m心拍数エラーの有無
  fifteenHundredmHeartRate: string; // 1500m心拍数
  fifteenHundredmHeartRateError: string | false; // 1500m心拍数エラーの有無
  twentyHundredmHeartRate: string; // 2000m心拍数
  twentyHundredmHeartRateError: string | false; // 2000m心拍数エラーの有無
  official: string; // 公式/非公式
  officialError: string | false; // 公式/非公式エラーの有無
  attendance: string; // 立ち合い有無
  attendanceError: string | false; // 立ち合い有無エラーの有無
  playerHeight: string; // 選手身長
  playerHeightError: string | false; // 選手身長エラーの有無
  playerWeight: string; // 選手体重
  playerWeightError: string | false; // 選手体重エラーの有無
  mSeatNumber: string; // シート番号ID
  mSeatNumberError: string | false; // シート番号IDエラーの有無
  seatName: string; // シート番号
  seatNameError: string | false; // シート番号エラーの有無
  raceResultRecordName: string; // 出漕結果記録名
  raceResultRecordNameError: string | false; // 出漕結果記録名エラーの有無
  startDatetime: string; // 発艇日時
  startDatetimeError: string | false; // 発艇日時エラーの有無
  weather: string; // 天候
  weatherError: string | false; // 天候エラーの有無
  windSpeedTwentyHundredmPoint: string; // 2000m地点風速
  windSpeedTwentyHundredmPointError: string | false; // 2000m地点風速エラーの有無
  windDirectionTwentyHundredmPoint: string; // 2000m地点風向
  windDirectionTwentyHundredmPointError: string | false; // 2000m地点風向エラーの有無
  windSpeedTenHundredmPoint: string; // 1000m地点風速
  windSpeedTenHundredmPointError: string | false; // 1000m地点風速エラーの有無
  windDirectionTenHundredmPoint: string; // 1000m地点風向
  windDirectionTenHundredmPointError: string | false; // 1000m地点風向エラーの有無
  remark: string; // 備考
  remarkError: string | false; // 備考エラーの有無
}

export type { CsvData };
