// Jsonの型定義
interface CountryResponse {
  id: number;
  name: string;
  cd: string;
}

// Jsonの型定義
interface PrefectureResponse {
  id: number;
  name: string;
}

// Jsonの型定義
interface SexResponse {
  id: number;
  name: string;
}

// 出漕結果情報一覧
interface RaceResultRecordsResponse {
  raceResultRecordId: number; // 出漕結果記録ID
  tournId: number; // 大会ID
  tournName: string; // 大会名
  official: number; // 公式／非公式
  eventStartDate: string; // 開催日
  orgName: string; // 団体所属
  raceNumber: number; // レースNo.
  eventName: string; // 種目
  raceName: string; // レース名
  byGroup: string; // 組別
  crewName: string; // クルー名
  rank: number; // 順位
  fiveHundredmLaptime: number; // 500mラップタイム
  tenHundredmLaptime: number; // 1000mラップタイム
  fifteenHundredmLaptime: number; // 1500mラップタイム
  twentyHundredmLaptime: number; // 2000mラップタイム
  finalTime: number; // 最終タイム
  bNo: number; // B.No
  remark: string; // 備考
  strokeRateAvg: number; // ストロークレート（平均）
  fiveHundredmStrokeRat: number; // 500mlapストロークレート
  tenHundredmStrokeRat: number; // 1000mlapストロークレート
  fifteenHundredmStrokeRat: number; // 1500mlapストロークレート
  twentyHundredmStrokeRat: number; // 2000mlapストロークレート
  heartRateAvg: number; // 心拍数/分（平均）
  fiveHundredmHeartRate: number; // 500mlap心拍数/分
  tenHundredmHeartRate: number; // 1000mlap心拍数/分
  fifteenHundredmHeartRate: number; // 1500mlap心拍数/分
  twentyHundredmHeartRate: number; // 2000mlap心拍数/分
  attendance: number; // 立ち合い有無
  ergoWeight: number; // エルゴ体重
  playerHeight: number; // 選手身長（出漕時点）
  playerWeight: number; // 選手体重（出漕時点）
  sheetNameId: number; // シート番号ID（出漕時点）
  sheetName: string; // シート番号（出漕時点）
  raceResultRecordName: string; // 出漕結果記録名
  registeredTime: string; // 登録日時
  twentyHundredmWindSpeed: number; // 2000m地点風速
  twentyHundredmWindDirection: number; // 2000m地点風向
  tenHundredmWindSpeed: number; // 1000m地点風速
  tenHundredmWindDirection: number; // 1000m地点風向
  venueName: string; // 開催場所
  range: number; // 距離
  order: number; // 順番
}

// 団体情報
interface TeamResponse {
  teamTyp: string; // 団体種別
  entteamId: string; // エントリーシステムの団体ID
  teamId: string; // 団体ID
  name: string; // 団体名
}

// 大会情報
interface Tournament {
  tournId?: string; // 大会ID
  entrysystemRaceId: string; // エントリーシステムのレースID
  tournName: string; // 大会名
  tournType: string; // 大会種別
  tournTypeName: string; // 大会種別名
  sponsorOrgId: string; // 主催団体ID
  sponsorOrgName: string; // 主催団体名
  eventStartDate: string; // 開催日
  eventEndDate: string; // 終了日
  venueId: string; // 開催場所ID
  venueIdName: string; // 開催場所ID名
  venueName: string; // 開催場所名
  tournUrl: string; // 大会URL
  tournInfoFailePath: string; // 大会情報ファイルパス
}

// レース情報
interface Race {
  id: number; // ID
  checked: boolean; // チェックボックス
  raceId: string; //
  entrysystemRaceId: string; // エントリーシステムのレースID
  raceNumber: string; // レースNo.
  eventId: string; // 種目ID
  eventName: string; // 種目名
  raceName: string; // レース名
  raceType: string; // レース区分
  raceTypeName: string; // レース区分名
  otherRaceName?: string; // その他レース名
  byGroup: string; // 組別
  range: string; // 距離
  startDateTime: string; // 開始日時
  // 「出漕結果記録テーブル」に「レーステーブル」.「レースID」と紐づくデータが存在する場合、リンクボタンを表示するかどうかを制御するためにhasHistoryを利用
  hasHistory?: boolean; // 過去のレース結果があるかどうか
}

// 承認種別
interface TourTypeResponse {
  id: number;
  name: string;
}

// 開催場所
interface VenueResponse {
  id: number;
  name: string;
}

// 種目
interface EventResponse {
  id: number;
  name: string;
}

// レースID区分
interface RaceTypeResponse {
  id: number;
  name: string;
}

// ユーザー情報
interface UserResponse {
  userId: string; // ユーザーID
  userType: string; // ユーザー種別
  userTypeName: string; // ユーザー種別
  userName: string; // ユーザー名
  email: string; // メールアドレス
  sexName: string; // 性別
  sexId?: number; // 性別
  dateOfBirth: string; // 生年月日
  residenceCountryId?: number; // 居住地（国）
  residenceCountryName: string; // 居住地（国）
  residencePrefectureId?: number; // 居住地（都道府県）
  residencePrefectureName: string; // 居住地（都道府県）
  height: string; // 身長
  weight: string; // 体重
  tempPasswordFlag: boolean; // 登録ステータス
  photo: string; // 写真
}

// ボランティア情報
interface VolunteerResponse {
  volunteerId: string; // ボランティアID
  volunteerName: string; // 氏名
  residenceCountry: string; // 居住地（国）
  residencePrefecture: string; // 居住地（都道府県）
  sex: string; // 性別
  dateOfBirth: string; // 生年月日
  telephoneNumber: string; // 電話番号
  mailaddress: string; // メールアドレス
  clothesSize: string; // 服のサイズ
  personality: string; // 性格
  disType: string[]; // 障碍タイプ
  qualHold: string[]; // 保有資格
  language: any; // 言語
  dayOfWeek: string; // 曜日
  timeZone: string; // 時間帯
  photo: string; // 写真
}

// ボランティア履歴情報
interface VolunteerHistoriesResponse {
  tournId: string; // 大会ID
  tournName: string; // 大会名
  tournType: number; // 大会種別
  eventStartDate: string; // 開催日
  eventEndDate: string; // 終了日
  roleName: string; // 役割名
  ad: string; // 役割名
  dateType: number; // 平日/休日（祝日）
  dayOfWeek: string; // 曜日
  timeZone: string; // 時間帯
}

// 選手情報
interface PlayerInformationResponse {
  playerId: number; // 選手ID
  jaraPlayerCode: string; // JARA選手コード
  existPlayerId?: number; // 既存選手ID
  playerName: string; // 選手名
  dateOfBirth: string; // 生年月日
  sexName: string; // 性別
  sexId?: number; // 性別
  height: string; // 身長
  weight: string; // 体重
  sideInfo: boolean[]; // サイド情報
  birthCountryName: string; // 出身地（国）
  birthCountryId?: number; // 出身地（国）
  birthPrefectureName: string; // 出身地（都道府県）
  birthPrefectureId?: number; // 出身地（都道府県）
  residenceCountryName: string; // 居住地（国）
  residenceCountryId?: number; // 居住地（国）
  residencePrefectureName: string; // 居住地（都道府県）
  residencePrefectureId?: number; // 居住地（都道府県）
  photo: string; // 写真
}

// 団体所属選手情報
interface TeamPlayerInformationResponse {
  id: number; // ID
  playerId: number; // 選手ID
  jaraPlayerCode: string; // JARA選手コード
  existPlayerId?: number; // 既存選手ID
  playerName: string; // 選手名
  dateOfBirth: string; // 生年月日
  sexName: string; // 性別
  sexId?: number; // 性別
  height: string; // 身長
  weight: string; // 体重
  sideInfo: boolean[]; // サイド情報
  birthCountryName: string; // 出身地（国）
  birthCountryId?: number; // 出身地（国）
  birthPrefectureName: string; // 出身地（都道府県）
  birthPrefectureId?: number; // 出身地（都道府県）
  residenceCountryName: string; // 居住地（国）
  residenceCountryId?: number; // 居住地（国）
  residencePrefectureName: string; // 居住地（都道府県）
  residencePrefectureId?: number; // 居住地（都道府県）
  photo: string; // 写真
  deleteFlag?: boolean; // 削除フラグ
}

// 障碍タイプ
interface DisTypeResponse {
  id: number;
  name: string;
}

// 保有資格
interface QualHoldResponse {
  id: number;
  name: string;
}

// 言語
interface LangResponse {
  id: number;
  name: string;
}

// 大会情報
interface TournamentResponse {
  id: number;
  name: string;
}

// 選手情報
interface Player {
  id: number; // 選手ID
  playerPhoto: string; // 選手画像
  playerName: string; // 選手名
  jaraPlayerId: string; // JARA選手コード
  playerId: string; // 選手ID
  sexId: string; // 性別ID
  sex: string; // 性別
  entrysystemRaceId: string; // エントリーシステムの団体ID
  orgId1: string; // 団体ID1
  orgName1: string; // 所属団体名1
  orgId2: string; // 団体ID2
  orgName2: string; // 所属団体名2
  orgId3: string; // 団体ID3
  orgName3: string; // 所属団体名3
}

// クルー
interface CrewResponse {
  playerId: number; // 選手ID
  sheetName: string; // シート番号（出漕時点）
  playerName: string; // 選手名
  playerHeight: number; // 選手身長（出漕時点）
  playerWeight: number; // 選手体重（出漕時点）
  order: number; // 順番
}

// 団体情報
interface Organization {
  orgId: string; // 団体ID
  orgName: string; // 団体名
  entOrgId: string; // エントリーシステムの団体ID
  orgTypeName: string; // 団体種別名
  foundingYear: number; // 設立年
  addressNumber: string; // 郵便番号
  locationPrefectureId: number; // 所在地（都道府県）
  locationPrefectureName: string; // 所在地（都道府県）
  address1: string; // 住所1
  address2: string; // 住所2
  orgClassId: number; // 団体区分
  orgClassName: string; // 団体区分
  jaraOrgTypeId: number; // JARA団体種別
  jaraOrgTypeName: string; // JARA団体種別
  jaraOrgRegTrail: string; // JARA団体登録状況
  prefOrgTypeId: number; // 県ボ団体種別
  prefOrgTypeName: string; // 県ボ団体種別
  prefOrgRegTrail: string; // 県ボ団体登録状況
}

// スタッフ情報
interface Staff {
  id: number; // ID
  userId: string; // ユーザーID
  userName: string; // ユーザー名
  staffType: string[]; // スタッフ種別
  deleteFlag: boolean; // 削除フラグ]
  isUserFound: boolean; // ユーザーが見つかったかどうか
}

// 団体種別
interface OrgType {
  id: number; // ID
  name: string; // 名称
}

// 団体区分
interface OrgClass {
  id: number; // ID
  name: string; // 名称
}

// 団体情報
interface Org {
  entrySystemId: number;
  orgId: number;
  orgName: string;
  orgClassId: number;
  orgClassName: string;
  orgTypeId: number;
  orgTypeName: string;
  foundingYear: string;
  residenceCountryId: number;
  residenceCountryName: string;
  residencePrefectureId: number;
  residencePrefectureName: string;
}

export type { SexResponse };
export type { PrefectureResponse };
export type { CountryResponse };
export type { RaceResultRecordsResponse };
export type { PlayerInformationResponse };
export type { TeamPlayerInformationResponse };
export type { TeamResponse };
export type { Tournament };
export type { Race };
export type { TourTypeResponse };
export type { VenueResponse };
export type { EventResponse };
export type { RaceTypeResponse };
export type { UserResponse };
export type { DisTypeResponse };
export type { QualHoldResponse };
export type { LangResponse };
export type { VolunteerResponse };
export type { VolunteerHistoriesResponse };
export type { Player };
export type { Organization };
export type { Staff };
export type { OrgType };
export type { OrgClass };
export type { TournamentResponse };
export type { CrewResponse };
export type { Org };