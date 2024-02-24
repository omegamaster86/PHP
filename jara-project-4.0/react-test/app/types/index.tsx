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
  race_result_record_id: number; // 出漕結果記録ID
  tourn_id: number; // 大会ID
  tourn_name: string; // 大会名
  official: number; // 公式／非公式
  eventStartDate: string; // 開催日　#置き換え作業未対応
  org_name: string; // 団体所属
  race_number: number; // レースNo.
  event_name: string; // 種目　
  race_name: string; // レース名
  by_group: string; // 組別
  crew_name: string; // クルー名
  rank: number; // 順位
  laptime_500m: number; // 500mラップタイム
  laptime_1000m: number; // 1000mラップタイム
  laptime_1500m: number; // 1500mラップタイム
  laptime_2000m: number; // 2000mラップタイム
  final_time: number; // 最終タイム
  race_result_notes: string; // 備考
  stroke_rate_avg: number; // ストロークレート（平均）
  stroke_rat_500m: number; // 500mlapストロークレート
  stroke_rat_1000m: number; // 1000mlapストロークレート
  stroke_rat_1500m: number; // 1500mlapストロークレート
  stroke_rat_2000m: number; // 2000mlapストロークレート
  heart_rate_avg: number; // 心拍数/分（平均）
  heart_rate_500m: number; // 500mlap心拍数/分
  heart_rate_1000m: number; // 1000mlap心拍数/分
  heart_rate_1500m: number; // 1500mlap心拍数/分
  heart_rate_2000m: number; // 2000mlap心拍数/分
  attendance: number; // 立ち合い有無
  ergo_weight: number; // エルゴ体重
  player_height: number; // 選手身長（出漕時点）
  player_weight: number; // 選手体重（出漕時点）
  seat_number: number; // シート番号ID（出漕時点）
  seat_name: string; // シート番号（出漕時点）
  race_result_record_name: string; // 出漕結果記録名
  registered_time: string; // 登録日時
  wind_speed_2000m_point: number; // 2000m地点風速
  wind_direction_2000m_point: number; // 2000m地点風向
  wind_speed_1000m_point: number; // 1000m地点風速
  wind_direction_1000m_point: number; // 1000m地点風向
  venueName: string; // 開催場所　#置き換え作業対応不要
  range: number; // 距離
  order: number; // 順番
}

// 団体情報
interface TeamResponse {
  teamTyp: string; // 団体種別　#置き換え作業対応不要
  entrysystem_org_id: string; // エントリーシステムの団体ID
  org_id: string; // 団体ID
  org_name: string; // 団体名
}

// 大会情報
interface Tournament {
  tourn_id?: string; // 大会ID
  entrysystem_tourn_id: string; // エントリーシステムの大会ID
  tourn_name: string; // 大会名
  tourn_type: string; // 大会種別
  tournTypeName: string; // 大会種別名　#置き換え作業対応不要
  sponsor_org_id: string; // 主催団体ID
  sponsorOrgName: string; // 主催団体名　#置き換え作業対応不要
  event_start_date: string; // 開催日
  event_end_date: string; // 終了日
  venue_id: string; // 開催場所ID
  venue_name: string; // 開催場所名
  tourn_url: string; // 大会URL
  tourn_info_faile_path: string; // 大会情報ファイルパス
}

// レース情報
interface Race {
  id: number; // ID　#置き換え作業未対応
  checked: boolean; // チェックボックス　#置き換え作業未対応
  race_id: string; //
  entrysystem_race_id: string; // エントリーシステムのレースID
  tourn_id: number; //大会ID
  race_number: string; // レースNo.
  event_id: string; // 種目ID
  event_name: string; // 種目名
  race_name: string; // レース名
  race_class_id: string; // レース区分
  race_class_name: string; // レース区分名
  otherRaceName?: string; // その他レース名　#置き換え作業未対応
  by_group: string; // 組別
  range: string; // 距離
  start_date_time: string; // 開始日時
  // 「出漕結果記録テーブル」に「レーステーブル」.「レースID」と紐づくデータが存在する場合、リンクボタンを表示するかどうかを制御するためにhasHistoryを利用
  hasHistory?: boolean; // 過去のレース結果があるかどうか
  tournName: string; // 大会名
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
  user_id: string; // ユーザーID
  user_type: string; // ユーザー種別
  userTypeName: string; // ユーザー種別　#置き換え作業未対応
  user_name: string; // ユーザー名
  mailaddress: string; // メールアドレス
  sexName: string; // 性別　#置き換え作業未対応
  sex?: number; // 性別
  date_of_birth: string; // 生年月日
  residence_country?: number; // 居住地（国）
  residenceCountryName: string; // 居住地（国）　#置き換え作業対応不要
  residence_prefecture?: number; // 居住地（都道府県）
  residencePrefectureName: string; // 居住地（都道府県）　#置き換え作業対応不要
  height: string; // 身長
  weight: string; // 体重
  temp_password_flag: boolean; // 登録ステータス
  photo: string; // 写真
  uploadedPhoto?: File; // アップロードされて写真を保存する
  uploadedPhotoName?: string; // アップロードされて写真の名前を保存する
}

// ボランティア情報
interface VolunteerResponse {
  volunteer_id: string; // ボランティアID
  volunteer_name: string; // 氏名
  residence_country: string; // 居住地（国）
  residence_prefecture: string; // 居住地（都道府県）
  sex: string; // 性別　#置き換え作業未対応
  date_of_birth: string; // 生年月日
  telephone_number: string; // 電話番号
  mailaddress: string; // メールアドレス
  clothes_size: string; // 服のサイズ
  personality: string; // 性格　#置き換え作業未対応
  dis_type_id: string[]; // 障碍タイプ
  qualHold: string[]; // 保有資格　#置き換え作業未対応
  language: any; // 言語　#置き換え作業未対応
  language_proficiency: any;  //言語レベル
  day_of_week: string; // 曜日
  time_zone: string; // 時間帯
  photo: string; // 写真　#置き換え作業未対応
}

// ボランティア履歴情報
interface VolunteerHistoriesResponse {
  tourn_id: string; // 大会ID
  tourn_name: string; // 大会名
  tourn_type: number; // 大会種別
  event_start_date: string; // 開催日
  event_end_date: string; // 終了日
  role: string; // 役割名
  ad: string; // 役割名　#置き換え作業未対応
  date_type: number; // 平日/休日（祝日）
  day_of_week: string; // 曜日
  time_zone: string; // 時間帯
}

// 選手情報
interface PlayerInformationResponse {
  player_id: number; // 選手ID
  jara_player_id: string; // JARA選手コード
  player_name: string; // 選手名
  date_of_birth: string; // 生年月日
  sexName: string; // 性別　#置き換え作業対応不要
  sex_id?: number; // 性別
  height: string; // 身長
  weight: string; // 体重
  side_info: boolean[]; // サイド情報
  birthCountryName: string; // 出身地（国）　#置き換え作業対応不要
  birth_country?: number; // 出身地（国）
  birthPrefectureName: string; // 出身地（都道府県）　#置き換え作業対応不要
  birth_prefecture?: number; // 出身地（都道府県）
  residenceCountryName: string; // 居住地（国）　#置き換え作業対応不要
  residence_country?: number; // 居住地（国）
  residencePrefectureName: string; // 居住地（都道府県）　#置き換え作業対応不要
  residence_prefecture?: number; // 居住地（都道府県）
  photo: string; // 写真
  uploadedPhoto?: File; // アップロードされて写真を保存する
  uploadedPhotoName?: string; // アップロードされて写真の名前を保存する
}

// 団体所属選手情報
interface TeamPlayerInformationResponse {
  id: number; // ID　#置き換え作業未対応
  player_id: number; // 選手ID
  jara_player_id: string; // JARA選手コード
  player_name: string; // 選手名
  date_of_birth: string; // 生年月日
  sexName: string; // 性別　#置き換え作業未対応
  sex_id?: number; // 性別
  height: string; // 身長
  weight: string; // 体重
  side_info: boolean[]; // サイド情報
  birthCountryName: string; // 出身地（国）　#置き換え作業対応不要
  birth_country?: number; // 出身地（国）
  birthPrefectureName: string; // 出身地（都道府県）　#置き換え作業対応不要
  birth_prefecture?: number; // 出身地（都道府県）
  residenceCountryName: string; // 居住地（国）　#置き換え作業対応不要
  residence_country?: number; // 居住地（国）
  residencePrefectureName: string; // 居住地（都道府県）　#置き換え作業対応不要
  residence_prefecture?: number; // 居住地（都道府県）
  photo: string; // 写真
  deleteFlag?: boolean; // 削除フラグ
  type?: string; // 種別
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
  id: number; // 選手ID　#置き換え作業未対応
  photo: string; // 選手画像
  player_name: string; // 選手名
  jara_player_id: string; // JARA選手コード
  player_id: string; // 選手ID
  sex_id: string; // 性別ID
  sex: string; // 性別　#置き換え作業未対応
  entrysystemOrgId1: string; // エントリーシステムの団体ID1　#置き換え作業未対応
  orgId1: string; // 団体ID1　#置き換え作業未対応
  orgName1: string; // 所属団体名1　#置き換え作業未対応
  entrysystemOrgId2: string; // エントリーシステムの団体ID2　#置き換え作業未対応
  orgId2: string; // 団体ID2　#置き換え作業未対応
  orgName2: string; // 所属団体名2　#置き換え作業未対応
  entrysystemOrgId3: string; // エントリーシステムの団体ID3　#置き換え作業未対応
  orgId3: string; // 団体ID3　#置き換え作業未対応
  orgName3: string; // 所属団体名3　#置き換え作業未対応
}

// クルー
interface CrewResponse {
  player_id: number; // 選手ID
  seat_id: number; // シート番号（出漕時点）
  seat_name: string;  //シート名
  seat_addr_name: string; //シート略称
  player_name: string; // 選手名
  player_height: number; // 選手身長（出漕時点）
  player_weight: number; // 選手体重（出漕時点）
  order: number; // 順番　#置き換え作業未対応
}

// 団体情報
interface Organization {
  org_id: string; // 団体ID
  org_name: string; // 団体名
  entrysystem_org_id: string; // エントリーシステムの団体ID
  orgTypeName: string; // 団体種別名
  founding_year: number; // 設立年
  post_code: string; // 郵便番号
  post_code1: string; // 郵便番号 分割した前3文字
  post_code2: string; // 郵便番号 分割した後4文字
  location_country: number;// 所在地（国）
  locationCountry: string; // 所在地（国）
  location_prefecture: number; // 所在地（都道府県）
  locationPrefectureName: string; // 所在地（都道府県）
  address1: string; // 住所1
  address2: string; // 住所2
  org_class: number; // 団体区分
  orgClassName: string; // 団体区分
  jara_org_type: number; // JARA団体種別
  jaraOrgTypeName: string; // JARA団体種別
  jara_org_reg_trail: string; // JARA団体登録状況
  pref_org_type: number; // 県ボ団体種別
  prefOrgTypeName: string; // 県ボ団体種別
  pref_org_reg_trail: string; // 県ボ団体登録状況
}

// スタッフ情報
interface Staff {
  id: number; // ID
  user_id: string; // ユーザーID
  user_name: string; // ユーザー名
  staff_type_id: string[]; // スタッフ種別
  delete_flag: boolean; // 削除フラグ
  isUserFound: boolean; // ユーザーが見つかったかどうか
}

//団体所属選手情報
interface OrganizationPlayer
{
  org_player_id: number;  //団体所属ID
  org_id: number;         //団体ID
  player_id: number;      //選手ID
  joining_date: string;   //団体登録年月日
  deperture_date: string; //退団年月日
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

//Organizationに統合したため、OrgではなくOrganizationを使用すること
// 団体情報
interface Org {
  entrysystem_org_id: number;
  org_id: number;// 団体ID
  org_name: string;// 団体名
  org_class: number;// 団体区分
  orgClassName: string; // 　#置き換え作業未対応
  orgTypeId: number; // 　#置き換え作業未対応
  orgTypeName: string; // 　#置き換え作業未対応
  founding_year: string;// 創立年
  location_country: number;// 所在地（国）
  residenceCountryName: string;// 　#置き換え作業対応不要
  location_prefecture: number;// 所在地（都道府県）
  residencePrefectureName: string;// 　#置き換え作業対応不要
}

// レース情報
interface CheckRace {
  id: number; // ID
  hasMatch?: boolean; // 過去のレース結果があるかどうか
}

// ユーザIDに紐づいた情報 20240222
interface UserIdType {
  player_id: number; // 選手ID
  volunteer_id: number; // ボランティアID
  is_administrator: number; // 管理者
  is_jara: number; // JARA
  is_pref_boat_officer: number; // 県ボ
  is_organization_manager: number; // 団体管理者
  is_player: number; // 選手
  is_volunteer: number; // ボランティア
  is_audience: number; // 一般ユーザ
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
export type { OrganizationPlayer };
export type { Org };
export type { CheckRace };
export type { UserIdType };