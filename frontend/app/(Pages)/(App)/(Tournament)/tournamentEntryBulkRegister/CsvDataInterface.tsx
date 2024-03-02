// CSVデータの型定義
interface CsvData {
  id: number; // ID
  checked: boolean; // 選択
  loadingResult: string; // 読み込み結果
  tournId: string; // 大会ID
  tournIdError: boolean; // 大会IDエラーの有無
  tournName: string; // 大会名
  eventId: string; // 種目ID
  eventIdError: boolean; // 種目IDエラーの有無
  eventName: string; // 種目名
  raceTypeId: string; // レース区分ID
  raceTypeIdError: boolean; // レース区分IDエラーの有無
  raceTypeName: string; // レース区分名
  raceId: string; // レースID
  raceIdError: boolean; // レースIDエラーの有無
  raceName: string; // レース名
  byGroup: string; // 組別
  byGroupError: boolean; // 組別エラーの有無
  raceNumber: string; // レースNo
  raceNumberError: boolean; // レースNoエラーの有無
  startDatetime: string; // 発艇日時
  orgId: string; // 団体ID
  orgIdError: boolean; // 団体IDエラーの有無
  orgName: string; // 団体名
  orgNameError: boolean; // 団体名エラーの有無
  crewName: string; // クルー名
  crewNameError: boolean; // クルー名エラーの有無
  mSheetNumber: string; // シート番号ID
  mSheetNumberError: boolean; // シート番号IDエラーの有無
  sheetName: string; // シート番号
  sheetNameError: boolean; // シート番号エラーの有無
  userId: string; // 選手ID
  userIdError: boolean; // 選手IDエラーの有無
  playerName: string; // 選手名
  playerNameError: boolean; // 選手名エラーの有無
}

export type { CsvData };
