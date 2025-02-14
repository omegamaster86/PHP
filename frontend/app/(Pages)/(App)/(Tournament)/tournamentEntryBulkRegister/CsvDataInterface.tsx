// CSVデータの型定義
interface CsvData {
  id: number; // ID
  checked: boolean; // 選択
  loadingResult: string; // 読み込み結果
  tournId: string; // 大会ID
  tournIdError: string | false; // 大会IDエラーの有無
  tournName: string; // 大会名
  eventId: string; // 種目ID
  eventIdError: string | false; // 種目IDエラーの有無
  eventName: string; // 種目名
  raceTypeId: string; // レース区分ID
  raceTypeIdError: string | false; // レース区分IDエラーの有無
  raceTypeName: string; // レース区分名
  raceId: string; // レースID
  raceIdError: string | false; // レースIDエラーの有無
  raceName: string; // レース名
  byGroup: string; // 組別
  byGroupError: string | false; // 組別エラーの有無
  raceNumber: string; // レースNo
  raceNumberError: string | false; // レースNoエラーの有無
  startDatetime: string; // 発艇日時
  orgId: string; // 団体ID
  orgIdError: string | false; // 団体IDエラーの有無
  orgName: string; // 団体名
  orgNameError: string | false; // 団体名エラーの有無
  crewName: string; // クルー名
  crewNameError: string | false; // クルー名エラーの有無
  mSeatNumber: string; // シート番号ID
  mSeatNumberError: string | false; // シート番号IDエラーの有無
  seatName: string; // シート番号
  seatNameError: string | false; // シート番号エラーの有無
  userId: string; // 選手ID
  userIdError: string | false; // 選手IDエラーの有無
  playerName: string; // 選手名
  playerNameError: string | false; // 選手名エラーの有無
}

export type { CsvData };
