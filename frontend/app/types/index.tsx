import { NotificationDestinationId, OfficialType, TournType } from '@/app/constants';

// Jsonの型定義
interface CountryResponse {
  id: number;
  name: string;
  cd: string;
}

interface Country {
  country_id: number;
  country_name: string;
  country_code: string;
}

interface PrefectureResponse {
  id: number;
  name: string;
}

interface Prefecture {
  pref_id: number;
  pref_name: string;
  pref_code_jis: string;
}

interface SexResponse {
  id: number;
  name: string;
}

interface Sex {
  sex_id: number;
  sex: string;
}

interface ClothesSize {
  clothes_size_id: number;
  clothes_size: string;
}

interface Qualification {
  qual_id: number;
  qual_name: string;
}

interface Language {
  lang_id: number;
  lang_name: string;
}

interface LanguageProficiency {
  lang_pro_id: number;
  lang_pro_name: string;
}

// 出漕結果情報一覧
interface RaceResultRecordsResponse {
  race_result_record_id: number; // 出漕結果記録ID
  tourn_id: number; // 大会ID
  tourn_name: string; // 大会名
  official: number; // 公式／非公式
  eventStartDate: string; // 開催日
  org_name: string; // 団体所属
  org_id: string; // 団体所属ID
  race_number: number; // レースNo.
  event_name: string; // 種目
  race_name: string; // レース名
  race_id: string; //レースID
  by_group: string; // 組別
  crew_name: string; // クルー名
  rank: number; // 順位
  laptime_500m: number; // 500mラップタイム
  laptime_1000m: number; // 1000mラップタイム
  laptime_1500m: number; // 1500mラップタイム
  laptime_2000m: number; // 2000mラップタイム
  final_time: number; // 最終タイム
  bNo: number; // B.No
  race_result_note: string; // 備考
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
  player_height: number; // 選手身長（出漕時点）
  player_weight: number; // 選手体重（出漕時点）
  seat_number: number; // シート番号ID（出漕時点）
  seat_name: string; // シート番号（出漕時点）
  race_result_record_name: string; // 出漕結果記録名
  registered_time: string; // 登録日時
  start_datetime: string; // 発艇日時
  wind_speed_2000m_point: number | null; // 2000m地点風速
  wind_direction_2000m_point: number | null; // 2000m地点風向ID
  twentyHundredmWindDirectionName: string | null; // 2000m地点風向名
  wind_speed_1000m_point: number | null; // 1000m地点風速
  wind_direction_1000m_point: number | null; // 1000m地点風向ID
  tenHundredmWindDirectionName: string | null; // 1000m地点風向名
  venue_id: number;
  venue_name: string; // 開催場所
  range: number; // 距離
  order: number; // 順番
  weatherId: number; // 天候
  weatherName: string; // 天候
  startDateTime: string; // 発艇日時
  deleteFlg: boolean; // 削除フラグ
  crewPlayer: CrewPlayer[]; // 選手情報
  lane_number: number; // レーンNo
  errorText: string; // エラーテキスト
  laptimeErrorText: string; // ラップタイムエラーテキスト
  strokeRateErrorText: string; // ストロークレートエラーテキスト
  finalHeartRate: number; // 最終心拍数
  player_id: string; // 選手ID
  player_name: string; // 選手名
  sex: number; // 性別ID
  event_id: number; //種目ID
  orgNameErrorText: string; //所属団体エラーメッセージ
  crewNameErrorText: string; //クルー名エラーメッセージ
  laneNumberErrorText: string; //レーンNo.エラーメッセージ
  rankErrorText: string; //順位エラーメッセージ
}

interface CrewPlayer {
  id?: number; //ID
  race_result_record_id?: number; //出漕結果記録ID 20240517
  playerPhoto: string; // 選手画像
  playerName: string; // 選手名
  jaraPlayerId: string; // JARA選手コード
  playerId: string; // 選手ID
  sexId: string;
  sex: string; // 性別
  height?: number; // 身長
  weight?: number; // 体重
  seatName: string; // シート番号
  seatNameId?: number; // シート番号
  entrysystemRaceId: string; // エントリーシステムの団体ID
  orgId1: string; // 団体ID1
  orgName1: string; // 所属団体名1
  orgId2: string; // 団体ID2
  orgName2: string; // 所属団体名2
  orgId3: string; // 団体ID3
  orgName3: string; // 所属団体名3
  fiveHundredmHeartRate?: number; // 500m
  tenHundredmHeartRate?: number; // 1000m
  fifteenHundredmHeartRate?: number; // 1500m
  twentyHundredmHeartRate?: number; // 2000m
  heartRateAvg?: number; // 平均
  attendance: string; // 立ち合い有無
  deleteFlg: boolean; // 削除フラグ
  addonLineFlg: boolean; // 追加行フラグ
  errorText: string; // エラーテキスト
  laneNumber?: number; // レーンNo
  rank?: number; // 順位
  laptime_500m?: number; // 500mラップタイム
  laptime_1000m?: number; // 1000mラップタイム
  laptime_1500m?: number; // 1500mラップタイム
  laptime_2000m?: number; // 2000mラップタイム
  stroke_rat_500m?: number; // 500mlapストロークレート
  stroke_rat_1000m?: number; // 1000mlapストロークレート
  stroke_rat_1500m?: number; // 1500mlapストロークレート
  stroke_rat_2000m?: number; // 2000mlapストロークレート
  stroke_rate_avg?: number; // ストロークレート（平均）
  final_time?: number; // 最終タイム
  race_result_note: string; // 備考
}

// 団体情報
interface TeamResponse {
  teamTyp: string; // 団体種別 #置き換え作業対応不要
  entrysystem_org_id: string; // エントリーシステムの団体ID
  org_id: string; // 団体ID
  org_name: string; // 団体名
  isStaff: boolean;
}

// 大会情報
interface Tournament {
  tourn_id?: string; // 大会ID
  entrysystem_tourn_id: string; // エントリーシステムの大会ID
  tourn_name: string; // 大会名
  tourn_type: string; // 大会種別
  tournTypeName: string; // 大会種別名 #置き換え作業対応不要
  sponsor_org_id: string; // 主催団体ID
  sponsorOrgName: string; // 主催団体名 #置き換え作業対応不要
  event_start_date: string; // 開催日
  event_end_date: string; // 終了日
  venue_id: number; // 開催場所ID
  venue_name: string; // 開催場所名
  tourn_url: string; // 大会URL
  tourn_info_faile_path: string; // 大会情報ファイルパス
  uploadedPDFFile?: File; // アップロードされて写真を保存する
  uploadedPDFFilePath?: string; // アップロードされて写真の名前を保存する
}

// 大会情報
interface TournamentOption {
  tournId: number;
  tournName: string;
}

// レーステーブル
interface RaceTable {
  race_id: string; // レースID
  race_number: number; // レースNo
  entrysystem_race_id: number; // エントリーレースID
  tourn_id: number; // 大会ID
  race_name: string; // レース名
  race_class_id: number;
  race_class_name: string; // レース区分
  otherRaceClassName: string; // その他レース区分名
  event_id: number; // 種目ID
  event_name: string; // 種目名
  otherEventName: string; // その他種目名
  by_group: string; // 組別
  range: number; // 距離
  startDateTime: string; // 発艇予定日時
}

// レース情報
interface Race {
  id: number; // ID #置き換え作業未対応
  checked: boolean; // チェックボックス #置き換え作業未対応
  race_id: string; //
  entrysystem_race_id: string; // エントリーシステムのレースID
  tourn_id: number; //大会ID
  race_number: string; // レースNo.
  event_id: string; // 種目ID
  event_name: string; // 種目名
  otherEventName: string; // その他種目名
  race_name: string; // レース名
  race_class_id: string; // レース区分
  race_class_name: string; // レース区分名
  otherRaceClassName: string; // その他レース区分名
  by_group: string; // 組別
  range: string; // 距離
  start_date_time: string; // 開始日時
  // 「出漕結果記録テーブル」に「レーステーブル」.「レースID」と紐づくデータが存在する場合、リンクボタンを表示するかどうかを制御するためにhasHistoryを利用
  hasHistory?: boolean; // 過去のレース結果があるかどうか
  tournName?: string; // 大会名
}

// 承認種別
interface TourTypeResponse {
  id: number;
  name: string;
}

interface ApprovalType {
  appro_type_id: number;
  appro_type_id_name: string;
  delete_flag: number;
  display_order: number;
  registered_time: string;
  registered_user_id: number;
  updated_time: string;
  updated_user_id: number;
}

// 開催場所
interface VenueResponse {
  id: number;
  name: string;
}

interface Venue {
  venue_id: number;
  venue_name: string;
}

// 種目
interface EventResponse {
  id: number;
  name: string;
}

interface Event {
  abbr_name: string;
  event_id: number;
  event_name: string;
  mixed_sex: string;
}

// レースID区分
interface RaceTypeResponse {
  id: number;
  name: string;
}

interface RaceType {
  race_class_id: number;
  race_class_name: string;
}

interface PasswordChange {
  message: string;
  tempPasswordFlag: number;
}

// ユーザー情報
interface UserResponse {
  user_id: string; // ユーザーID
  user_type: string; // ユーザー種別
  userTypeName: string; // ユーザー種別 #置き換え作業未対応
  user_name: string; // ユーザー名
  mailaddress: string; // メールアドレス
  sexName: string; // 性別　#置き換え作業未対応
  sex: number | null; // 性別
  date_of_birth: string; // 生年月日
  residence_country: number | null; // 居住地（国）
  residenceCountryName: string; // 居住地（国）　#置き換え作業対応不要
  residence_prefecture: string | null; // 居住地（都道府県）
  residencePrefectureName: string; // 居住地（都道府県）　#置き換え作業対応不要
  height: number | null; // 身長
  weight: number | null; // 体重
  temp_password_flag: number; // 登録ステータス
  photo: string | null; // 写真

  /*  更新時に使用するためのプロパティ */
  uploadedPhoto?: File; // アップロードされて写真を保存する
  uploadedPhotoName?: string; // アップロードされて写真の名前を保存する
}

interface CoachRefereeRefResponse {
  user_id: string; // ユーザーID
  userName: string; // ユーザー名
  coachQualificationNames: string[]; //指導者資格
  refereeQualificationNames: string[]; //審判資格
  jspoId: string; //JSPO ID
  coachingHistories: (CoachingHistory & {
    orgName: string;
    staffTypeName: string;
  })[]; //指導履歴
}

interface ICoachQualification {
  heldCoachQualificationId: number;
  expiryDate: string | null;
  acquisitionDate: string;
  isNewRow?: true;
  isDeleted: boolean;
  coachQualificationId: number;
}

interface IRefereeQualification {
  heldRefereeQualificationId: number;
  expiryDate: string | null;
  acquisitionDate: string;
  isNewRow?: true;
  isDeleted: boolean;
  refereeQualificationId: number;
}

interface MyPageCoachRefereeResponse {
  userName: string;
  jspoId: string;
  coachingHistories: (CoachingHistory & {
    orgName: string;
    staffTypeName: string;
  })[];
  coachQualifications: (ICoachQualification & {
    qualName: string;
  })[];
  refereeQualifications: (IRefereeQualification & {
    qualName: string;
  })[];
}

interface CoachRefereeResponse {
  jspoId: string;
  coachingHistories: (CoachingHistory & {
    isEndDateUndefined: boolean;
  })[];
  coachQualifications: ICoachQualification[];
  refereeQualifications: IRefereeQualification[];
}

interface CoachingHistory {
  startDate: string;
  endDate: string;
  orgCoachingHistoryId: number;
  orgId: number;
  staffTypeId: number;
  isNewRow?: true;
  isDeleted: boolean;
}

// ボランティア情報
interface VolunteerResponse {
  volunteer_id: string; // ボランティアID
  volunteer_name: string; // 氏名
  residence_country: string; // 居住地（国）
  residence_country_code: string | null; // 居住地（国）コード
  residence_prefecture: string; // 居住地（都道府県）
  residence_prefecture_code_jis: string | null; // 居住地（都道府県）コード
  sex: string; // 性別 #置き換え作業未対応
  date_of_birth: string; // 生年月日
  telephone_number: string; // 電話番号
  mailaddress: string; // メールアドレス
  clothes_size: string; // 服のサイズ
  personality: string; // 性格 #置き換え作業未対応
  dis_type_id: string[]; // 障碍タイプ
  qualHold: string[]; // 保有資格 #置き換え作業未対応
  language: any; // 言語 #置き換え作業未対応
  language_proficiency: any; //言語レベル
  day_of_week: string; // 曜日
  time_zone: string; // 時間帯
  photo: string; // 写真 #置き換え作業未対応
}

// 選手情報
interface PlayerInformationResponse {
  user_id: number; // ユーザーID
  player_id: number; // 選手ID
  jara_player_id: string; // JARA選手コード
  player_name: string; // 選手名
  date_of_birth: string | null; // 生年月日
  sexName: string; // 性別
  sex_id: number | null; // 性別
  height: string | null; // 身長
  weight: string | null; // 体重
  side_info: boolean[]; // サイド情報
  birthCountryName: string; // 出身地（国）
  birth_country: number | null; // 出身地（国）
  birthPrefectureName: string; // 出身地（都道府県）
  birth_prefecture: number | null; // 出身地（都道府県）
  residenceCountryName: string; // 居住地（国）
  residence_country: number | null; // 居住地（国）
  residencePrefectureName: string; // 居住地（都道府県）
  residence_prefecture: number | null; // 居住地（都道府県）
  photo: string; // 写真
  previousPhotoName?: File; // アップロードされて写真を保存する
  uploadedPhoto?: File; // アップロードされて写真を保存する
  uploadedPhotoName?: string; // アップロードされて写真の名前を保存する
}

// 団体所属選手情報
interface TeamPlayerInformationResponse {
  id: number; // ID
  player_id: number; // 選手ID
  jara_player_id: string; // JARA選手コード
  player_name: string; // 選手名
  sexName: string; // 性別
  height: string; // 身長
  weight: string; // 体重
  side_info: boolean[]; // サイド情報
  birthCountryName: string; // 出身地（国）
  birthPrefectureName: string; // 出身地（都道府県）
  residenceCountryName: string; // 居住地（国）
  residencePrefectureName: string; // 居住地（都道府県）
  orgId: string; // 団体ID
  org_name: string; // 団体名
  deleteFlag: boolean; // 削除フラグ
  checked?: boolean; // チェックボックス
  type: string; // 種別
}

interface MasterResponse {
  id: number;
  name: string;
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
  id: number; // 選手ID #置き換え作業未対応
  photo: string; // 選手画像
  player_name: string; // 選手名
  jara_player_id: string; // JARA選手コード
  player_id: string; // 選手ID
  sex_id: string; // 性別ID
  sex: string; // 性別 #置き換え作業未対応
  entrysystemOrgId1: string; // エントリーシステムの団体ID1 #置き換え作業未対応
  orgId1: string; // 団体ID1 #置き換え作業未対応
  orgName1: string; // 所属団体名1 #置き換え作業未対応
  entrysystemOrgId2: string; // エントリーシステムの団体ID2 #置き換え作業未対応
  orgId2: string; // 団体ID2 #置き換え作業未対応
  orgName2: string; // 所属団体名2 #置き換え作業未対応
  entrysystemOrgId3: string; // エントリーシステムの団体ID3 #置き換え作業未対応
  orgId3: string; // 団体ID3 #置き換え作業未対応
  orgName3: string; // 所属団体名3 #置き換え作業未対応
}

// クルー
interface CrewResponse {
  player_id: number; // 選手ID
  playerDeleteFlag: boolean; // t_players.delete_flag
  seat_id: number; // シート番号（出漕時点）
  seat_name: string; //シート名
  seat_addr_name: string; //シート略称
  player_name: string; // 選手名
  player_height: number; // 選手身長（出漕時点）
  player_weight: number; // 選手体重（出漕時点）
  order: number; // 順番 #置き換え作業未対応
}

// 団体情報
interface Organization {
  org_id: string; // 団体ID
  isStaff: boolean;
  org_name: string; // 団体名
  entrysystem_org_id: string; // エントリーシステムの団体ID
  orgTypeName: string; // 団体種別名
  founding_year: number | null; // 設立年
  post_code: string; // 郵便番号
  post_code1: string; // 郵便番号 分割した前3文字
  post_code2: string; // 郵便番号 分割した後4文字
  location_country: number; // 所在地（国）
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

interface StaffRef extends Staff {
  coachQualificationNames: string[]; //指導者資格
  refereeQualificationNames: string[]; //審判資格
  jspo_id: string; // JSPO ID
}

//団体所属選手情報
interface OrganizationPlayer {
  org_player_id: number; //団体所属ID
  org_id: number; //団体ID
  player_id: number; //選手ID
}

// 団体種別
interface OrgTypeResponse {
  id: string; // ID
  name: string; // 名称
}

interface OrgType {
  org_type: string;
  org_type_id: string;
}

// 団体区分
interface OrgClassResponse {
  id: number; // ID
  name: string; // 名称
}

interface OrgClass {
  org_class_id: number;
  org_class_name: string;
}

// 団体情報
interface Org {
  entrysystem_org_id: number;
  org_id: number; // 団体ID
  org_name: string; // 団体名
  org_class: number; // 団体区分
  orgClassName: string;
  orgTypeId: number;
  orgTypeName: string;
  founding_year: number | null; // 創立年
  location_country: number; // 所在地（国）
  residenceCountryName: string;
  location_prefecture: number; // 所在地（都道府県）
  residencePrefectureName: string;
}

interface OrganizationListData {
  org_id: number;
  org_name: string;
}

// レース情報
interface CheckRace {
  id: number; // ID
  hasMatch?: boolean; // 過去のレース結果があるかどうか
  hasError?: boolean; // エラーがあるかどうか
  hasRegisterdRace?: boolean; // 登録済みのレースがあるかどうか
}

// 出漕結果情報一覧チェック
interface CheckRaceResultRecord {
  id: number; // ID
  hasError?: boolean; // エラーがあるかどうか
}

// ユーザIDに紐づいた情報 20240222
interface UserIdType {
  user_id: number; // ユーザID
  player_id: number | null; // 選手ID
  volunteer_id: number | null; // ボランティアID
  is_administrator: number; // 管理者
  is_jara: number; // JARA
  is_pref_boat_officer: number; // 県ボ
  is_organization_manager: number; // 団体管理者
  is_player: number; // 選手
  is_volunteer: number; // ボランティア
  is_audience: number; // 一般ユーザ
}

interface CheckRaceResultRecordDeleted {
  id: number; // ID
  isDeleted: boolean; // 削除済かどうか
}

//マイページの大会情報表示用インターフェース 20241008
interface MyPageTournamentInfoData {
  tournId: number; // 大会ID
  tournName: string; // 大会名
  tournType: TournType; // 公式／非公式
  eventStartDate: string; // 開催日
  venueId: number;
  venueName: string; //開催場所
  sponsorOrgName: string; // 主催団体名
  isPurchased: boolean; // 購入済みかどうか
}

interface MyPageTournamentParams {
  tournType: TournType;
}

//マイページの出漕履歴表示用インターフェース 20241015
interface MyPageRaceResultRecordInfoData {
  raceId: number; // レースID
  tournName: string; // 大会名
  official: OfficialType; // 公式／非公式
  startDateTime: string; // 開始時刻
  raceNumber: number; //レースNo.
  raceName: string; //レース名
  byGroup: string; // 組別
}

interface MyPageRaceResultParams {
  official: OfficialType; // 公式／非公式
}

//マイページの選手プロフィール表示用インターフェース 20241029
interface MyPagePlayerProfileInfoData {
  playerName: string; //選手名
  playerId: number; //選手ID
  jaraPlayerId: number | null; //既存選手ID
  followerCount: number; //フォロワー数
  sex: string; //性別
  dateOfBirth: string; //誕生日
  height: number; //身長
  weight: number; //体重
  birthCountryName: string; //出身 国
  birthPrefectureName: string; //出身 都道府県
  residenceCountryName: string; //居住 国
  residencePrefectureName: string; //居住 都道府県
  photo: string | null; //写真
  sideInfo: {
    sideName: string;
    isEnable: number;
  }[]; //サイド情報
}

//マイページのボランティア情報表示用インターフェース 20241017
interface MyPageVolunteerInfoData {
  volunteerName: string; // 氏名
  sex: string; // 性別
  dateOfBirth: string; // 生年月日
  countryName: string; // 居住地（国）
  prefName: string; // 居住地（都道府県）
  telephoneNumber: string; // 電話番号
  mailaddress: string; // メールアドレス
  clothesSize: string; // 服のサイズ
  disType: {
    disTypeId: number; // 障碍タイプID
    disTypeName: string; // 障碍タイプ名
    isEnable: number; // 有効フラグ
  }[]; // 障碍タイプ
  qualHold: {
    qualId: number; // 保有資格ID
    qualName: string; // 保有資格名
  }[]; // 保有資格
  languageProficiency: {
    langId: number; // 言語ID
    langName: string; // 言語名
    langProName: string; // 言語レベル
  }[]; //言語
  dayOfWeek: {
    dayOfWeekName: string; // 曜日名
    isEnable: number; // 有効フラグ
  }[]; // 曜日
  timeZone: {
    timeZoneName: string; // 時間帯名
    isEnable: number; // 有効フラグ
  }[]; // 時間帯
}

//マイページのプロフィール表示用インターフェース 20241023
interface MyPageProfileInfoData {
  userId: number; //ユーザID
  userName: string; //ユーザ名
  mailaddress: string; //メールアドレス
  userType: {
    userTypeName: string;
    isEnable: number;
  }[]; //ユーザ種別
  sex: string | null; //性別
  dateOfBirth: string | null; //誕生日
  height: number | null; //身長
  weight: number | null; //体重
  countryName: string | null; //居住 国
  prefName: string | null; //居住 都道府県
  photo: string; //写真
}

// 通知参照情報
interface NotificationInfoData {
  notificationId: number;
  title: string;
  notificationDestinationTypeId: NotificationDestinationId; // 1:フォロワー, 2:大会フォロワー, 3:有資格者, 4: 全ユーザー
  to: string[];
  body: string;
  tournId: number | null;
  playerId: number;
  coachQualIds: number[];
  refereeQualIds: number[];
  senderId: number;
  senderName: string;
  senderIcon: string | null;
  sentTime: string;
}

// 受信・送信一覧api用インターフェース
interface NotificationListData {
  notificationId: number;
  title: string;
  notificationDestinationTypeId: NotificationDestinationId; // 1:フォロワー, 2:大会フォロワー, 3:有資格者, 4: 全ユーザー
  tournId: number | null;
  playerId: number;
  coachQualIds: number[];
  refereeQualIds: number[];
  senderId: number;
  senderName: string;
  senderIcon: string | null;
  sentTime: string;
  isRead: number;
}

// 未読通知カウント
interface NotificationUnreadCount {
  unreadCount: number;
}

// 通知作成リクエスト
interface CreateNotificationRequest {
  notificationData: {
    notificationDestinationTypeId: NotificationDestinationId; // 1:フォロワー, 2:大会フォロワー, 3:有資格者, 4: 全ユーザー
    tournId: number | null;
    title: string;
    body: string;
  };
  coachQualificationsData: { coachQualificationId: number }[];
  refereeQualificationsData: { refereeQualificationId: number }[];
}

// 通知更新リクエスト
interface UpdateNotificationRequest {
  notificationId: number;
  tournId: number;
  title: string;
  body: string;
  coachQualificationsData: { coachQualificationId: number }[];
  refereeQualificationsData: { refereeQualificationId: number }[];
}

interface MyOrgsHostedTournament {
  tournId: number; // 大会ID
  tournName: string; // 大会名
  tournType: TournType; // 公式／非公式
  eventStartDate: string; // 開催日
  sponsorOrgName: string; // 主催団体名
}

interface TopPageCountResponse {
  followedTournCount: number;
  raceCount: number;
  followPlayerCount: number;
  followedPlayerCount: number;
}

// チケット購入履歴一括登録リクエスト
interface TeketSalesHistoryRequest {
  fileName: string;
  tournId: number;
  csvData: {
    rowNumber: number;
    orderNumber: string;
    purchasedTime: string;
    purchaserName: string;
    mailaddress: string;
    eventDate: string;
    ticketName: string;
    ticketNumber: string;
    subTicketName: string;
    ticketCount: string;
    ticketAmount: string;
    admissionCount: string;
    questionnaireMailaddress: string;
  }[];
}

// 寄付履歴一括登録リクエスト
interface DonationRequest {
  csvData: {
    rowNumber: number;
    mailaddress: string;
    donatorName: string;
    donatedDate: string;
    donationAmount: string;
    donationTarget: string;
  }[];
}

interface CheckOrgManagerRequest {
  tournId: number;
}

interface CheckOrgManager {
  isOrgManager: boolean;
}

export type {
  ApprovalType,
  CheckOrgManager,
  CheckOrgManagerRequest,
  CheckRace,
  CheckRaceResultRecord,
  CheckRaceResultRecordDeleted,
  ClothesSize,
  CoachingHistory,
  CoachRefereeRefResponse,
  CoachRefereeResponse,
  Country,
  CountryResponse,
  CreateNotificationRequest,
  CrewPlayer,
  CrewResponse,
  DisTypeResponse,
  DonationRequest,
  Event,
  EventResponse,
  ICoachQualification,
  IRefereeQualification,
  LangResponse,
  Language,
  LanguageProficiency,
  MasterResponse,
  MyOrgsHostedTournament,
  MyPageCoachRefereeResponse,
  MyPagePlayerProfileInfoData,
  MyPageProfileInfoData,
  MyPageRaceResultParams,
  MyPageRaceResultRecordInfoData,
  MyPageTournamentInfoData,
  MyPageTournamentParams,
  MyPageVolunteerInfoData,
  NotificationInfoData,
  NotificationListData,
  NotificationUnreadCount,
  Org,
  Organization,
  OrganizationListData,
  OrganizationPlayer,
  OrgClass,
  OrgClassResponse,
  OrgType,
  OrgTypeResponse,
  PasswordChange,
  Player,
  PlayerInformationResponse,
  Prefecture,
  PrefectureResponse,
  QualHoldResponse,
  Qualification,
  Race,
  RaceResultRecordsResponse,
  RaceTable,
  RaceType,
  RaceTypeResponse,
  Sex,
  SexResponse,
  Staff,
  StaffRef,
  TeamPlayerInformationResponse,
  TeamResponse,
  TeketSalesHistoryRequest,
  TopPageCountResponse,
  Tournament,
  TournamentOption,
  TournamentResponse,
  TourTypeResponse,
  UpdateNotificationRequest,
  UserIdType,
  UserResponse,
  Venue,
  VenueResponse,
  VolunteerResponse,
};

export * from './form';
