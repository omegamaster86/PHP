<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\CoachRefereeController;
use App\Http\Controllers\CommonController;
use App\Http\Controllers\ContactUsController;
use App\Http\Controllers\MyPageController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\OrganizationPlayersController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\PlayerInfoAlignmentController;
use App\Http\Controllers\TopPageController;
use App\Http\Controllers\TournamentController;
use App\Http\Controllers\TournamentInfoAlignmentController;
use App\Http\Controllers\TournamentRaceRefeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VolunteerController;
use App\Http\Controllers\VolunteerInfoAlignmentController;
use App\Models\M_prefectures;
use App\Models\M_countries;
use App\Models\M_sex;
use App\Models\M_venue;
use App\Models\M_race_class;
use App\Models\M_events;
use App\Models\M_organization_class;
use App\Models\M_organization_type;
use App\Models\M_approval_type;
use App\Models\M_disability_type;
use App\Models\M_volunteer_qualifications;
use App\Models\M_languages;
use App\Models\M_language_proficiency;
use App\Models\M_clothes_size;
use App\Models\M_weather_type;
use App\Models\M_wind_direction;
use App\Models\M_race_result_notes;
use App\Models\M_seat_number;
use App\Models\T_organizations;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// ログイン前に使用するAPIはここに定義する。
Route::group(['middleware' => []], function () {
    Route::post('contact-us', [ContactUsController::class, 'store']);
    Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login');
    Route::post('password-reset', [UserController::class, 'storePasswordReset']);
    Route::post('signup', [RegisteredUserController::class, 'store'])->name('signup');
});

// ログイン後に使用するAPIはここに定義する。
Route::group(['middleware' => ['auth:sanctum']], function () {
    // ユーザー関連
    Route::post('deleteUserData', [UserController::class, 'updateDeleteFlagInUserData']); //ユーザ情報を削除する
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::post('updateUserData', [UserController::class, 'updateUserData']); //DBからユーザ画面にデータを渡す
    Route::get('user', [UserController::class, 'getUserData']);
    Route::post('user/password-change', [UserController::class, 'storePasswordChange']); //パスワード変更
    Route::post('user/sent-certification-number', [UserController::class, 'sentCertificationNumber']); //承認番号送信
    Route::post('user/verify-certification-number', [UserController::class, 'verifyCertificationNumber']); // 承認番号確認

    // 共通項目
    Route::get('getApprovalType', [M_approval_type::class, 'getApprovalType']); //大会種別マスター取得
    Route::get('getClothesSize', [M_clothes_size::class, 'getClothesSize']); //服のサイズマスタ
    Route::get('getCoachQualifications', [CommonController::class, 'getCoachQualifications']); //ドロップダウンで使用する指導者資格名を取得 
    Route::get('getCountries', [M_countries::class, 'getCountries']); //国マスター取得
    Route::get('getDisabilityType', [M_disability_type::class, 'getDisabilityType']); //障碍マスタ
    Route::get('getEvents', [M_events::class, 'getEvents']); //イベントマスター取得
    Route::get('getIDsAssociatedWithUser', [UserController::class, 'getIDsAssociatedWithUser']); //ユーザIDに紐づいた情報を取得
    Route::get('getLanguageProficiency', [M_language_proficiency::class, 'getLanguageProficiency']); //言語レベルマスタ
    Route::get('getLanguages', [M_languages::class, 'getLanguages']); //言語マスタ
    Route::get('getOrganizationClass', [M_organization_class::class, 'getOrganizationClass']); //団体区分マスター取得
    Route::get('getOrganizations', [T_organizations::class, 'getOrganizations']); //全レース情報取得
    Route::get('getOrganizationTypeData', [M_organization_type::class, 'getOrganizationTypeData']); //団体種別マスター取得
    Route::get('getPrefectures', [M_prefectures::class, 'getPrefectures']); //都道府県マスター取得
    Route::get('getQualifications', [M_volunteer_qualifications::class, 'getQualifications']); //資格マスタ
    Route::get('getRaceClass', [M_race_class::class, 'getRaceClass']); //レースクラスマスター取得
    Route::get('getRaceResultNotes', [M_race_result_notes::class, 'getRaceResultNotes']); // 備考（マスタ）
    Route::get('getRefereeQualifications', [CommonController::class, 'getRefereeQualifications']); //ドロップダウンで使用する審判資格名を取得
    Route::get('getSeatNumber', [M_seat_number::class, 'getSeatNumber']); // シート番号（マスタ）
    Route::get('getSexList', [M_sex::class, 'getSexList']); //性別マスター取得
    Route::get('getStaffTypes', [CommonController::class, 'getStaffTypes']); //スタッフ種別を取得
    Route::get('getVenueList', [M_venue::class, 'getVenueList']); //水域マスター取得
    Route::get('getWeatherType', [M_weather_type::class, 'getWeatherType']); //天気マスタ
    Route::get('getWindDirection', [M_wind_direction::class, 'getWindDirection']); // 風向き（マスタ）

    // 選手関連
    Route::post('checkJARAPlayerId', [PlayerController::class, 'checkJARAPlayerId']); //選手登録画面から登録
    Route::post('deletePlayerData', [PlayerController::class, 'deletePlayerData']); //該当データをDBから削除する
    Route::get('getPlayerFollowStatus', [PlayerController::class, 'getPlayerFollowStatus']); // 選手のフォロー状態・フォロワー数取得
    Route::get('getPlayerInfoData', [PlayerController::class, 'getPlayerInfoData']); //DBから選手情報更新画面にデータを渡す
    Route::get('getRaceResultRecordsData', [PlayerController::class, 'getRaceResultRecordsData']); //DBから選手情報更新画面にデータを渡す
    Route::get('getUpdatePlayerData', [PlayerController::class, 'getUpdatePlayerData']); //DBから選手情報更新画面にデータを渡す
    Route::patch('playerFollowed', [PlayerController::class, 'playerFollowed']); //選手フォロー (選手情報参照画面)
    Route::post('playerSearch', [PlayerController::class, 'playerSearch']); //選手検索
    Route::post('registerCsvData', [PlayerInfoAlignmentController::class, 'registerCsvData']); //連携ボタン押下時
    Route::post('sendCsvData', [PlayerInfoAlignmentController::class, 'sendCsvData']); //読み込みボタン押下時
    Route::post('storePlayerData', [PlayerController::class, 'storePlayerData']); //選手登録確認画面から登録
    Route::post('updatePlayerData', [PlayerController::class, 'updatePlayerData']); //選手更新確認画面から更新
    //選手情報参照・削除画面

    // 団体関連
    Route::post('deleteOrgData', [OrganizationController::class, 'deleteOrgData']); //団体削除
    Route::post('getEntryTournamentsViewForTeamRef', [OrganizationController::class, 'getEntryTournamentsViewForTeamRef']); //エントリー大会
    Route::get('getOrganizationForOrgManagement', [OrganizationController::class, 'getOrganizationForOrgManagement']); //団体管理画面用に団体情報を取得
    Route::get('getOrganizationListData', [OrganizationController::class, 'getOrganizationListData']); //団体所属選手一括登録画面用に団体情報を取得
    Route::get('getOrgData', [OrganizationController::class, 'getOrgData']); //DBから団体管理画面にデータを渡す
    Route::post('orgSearch', [OrganizationController::class, 'searchOrganization']); //団体検索
    Route::post('registerOrgCsvData', [OrganizationPlayersController::class, 'registerOrgCsvData']); //団体一括 登録ボタン押下
    Route::post('searchOrganizationPlayersForTeamRef', [OrganizationPlayersController::class, 'searchOrganizationPlayersForTeamRef']); //主催大会
    Route::post('sendOrgCsvData', [OrganizationPlayersController::class, 'sendOrgCsvData']); //団体一括 読み込むボタン押下
    Route::post('storeOrgData', [OrganizationController::class, 'storeOrgData']); //団体情報をDBに送る
    Route::post('teamPlayerSearch', [OrganizationPlayersController::class, 'teamPlayerSearch']); //団体所属選手更新
    Route::post('updateOrgData', [OrganizationController::class, 'updateOrgData']); //団体情報をDBに送る
    Route::post('updateOrgPlayerData', [OrganizationPlayersController::class, 'updateOrgPlayerData']); //団体所属選手更新 
    Route::post('validateOrgData', [OrganizationController::class, 'validateOrgData']); //団体のバリデーションチェック

    // スタッフ関連
    Route::post('getOrgStaffData', [OrganizationController::class, 'getOrgStaffData']); //スタッフ情報取得

    //大会関連
    Route::post('deleteTournamentData', [TournamentController::class, 'deleteTournamentData']); //DBから大会情報を削除する
    Route::get('getTournamentFollowStatus', [TournamentController::class, 'getTournamentFollowStatus']); // 大会のフォロー状態・フォロワー数取得
    Route::get('getTournamentInfoData_allData', [TournamentController::class, 'getTournamentInfoData_allData']); //大会検索
    Route::post('getTournamentInfoData_org', [TournamentController::class, 'getTournamentInfoData_org']); //主催大会
    Route::get('getTournamentInfoData', [TournamentController::class, 'getTournamentInfoData']); //DBから大会情報更新画面にデータを渡す
    Route::post('searchTournament', [TournamentController::class, 'searchTournament']); //大会検索
    Route::post('tournamentRegistOrUpdateValidationCheck', [TournamentController::class, 'tournamentRegistOrUpdateValidationCheck']);
    Route::post('storeTournamentInfoData', [TournamentController::class, 'storeTournamentInfoData']); //DBから大会情報更新画面にデータを渡す
    Route::post('updateTournamentInfoData', [TournamentController::class, 'updateTournamentInfoData']); //大会情報更新
    Route::post('tournamentEntryYearSearch', [TournamentInfoAlignmentController::class, 'tournamentEntryYearSearch']); //大会エントリー一括登録
    Route::post('sendTournamentEntryCsvData', [TournamentInfoAlignmentController::class, 'sendTournamentEntryCsvData']); //大会エントリー一括登録 読み込むボタン押下
    Route::post('registerTournamentEntryCsvData', [TournamentInfoAlignmentController::class, 'registerTournamentEntryCsvData']); //大会エントリー一括登録 登録ボタン押下
    Route::post('sendTournamentResultCsvData', [TournamentInfoAlignmentController::class, 'sendTournamentResultCsvData']); //大会結果一括 読み込むボタン押下
    Route::post('registerTournamentResultCsvData', [TournamentInfoAlignmentController::class, 'registerTournamentResultCsvData']); //大会結果一括 登録ボタン押下
    Route::post('checkOrgManager', [TournamentController::class, 'checkOrgManager']); //大会情報参照画面 主催団体管理者の判別
    Route::post('getEventSheetPosForEventID', [TournamentController::class, 'getEventSheetPosForEventID']); //種目IDを条件に対象の種目に対応するシート位置を取得する
    Route::get('getMyOrgsHostedTournaments', [TournamentController::class, 'getMyOrgsHostedTournaments']); // 自分が、選手もしくはスタッフとして所属している団体(複数)でその団体が主催している大会を取得
    Route::patch('tournamentFollowed', [TournamentRaceRefeController::class, 'tournamentFollowed']); //大会フォロー (大会参照画面)

    // レース関連
    Route::post('getRaceData', [TournamentController::class, 'getRaceData']); // 大会情報に基づくレース情報
    Route::post('searchRaceData', [TournamentController::class, 'searchRaceData']); //大会レース結果管理　レース結果検索
    Route::post('getRaceDataRaceId', [TournamentController::class, 'getRaceDataRaceId']); //レース結果登録 レースIDを元にレース情報を取得
    Route::post('getRaceDataFromTournIdAndEventId', [TournamentController::class, 'getRaceDataFromTournIdAndEventId']); //レース結果登録 大会IDと種目IDを元にレース情報を取得
    Route::post('getCsvFormatRaceData', [TournamentController::class, 'getCsvFormatRaceData']); //大会結果情報一括登録画面用 csvフォーマット出力に使用するレース情報の取得
    Route::post('getTournLinkRaces', [TournamentController::class, 'getTournLinkRaces']); //大会結果管理　レース登録画面用 レース情報の取得

    // レース結果(出漕結果記録)関連
    Route::post('getTournRaceResultRecords', [TournamentController::class, 'getTournRaceResultRecords']); //大会レース結果参照画面
    Route::post('getCrewData', [TournamentController::class, 'getCrewData']); //クルー取得
    Route::post('getCrewNumberForEventId', [TournamentController::class, 'getCrewNumberForEventId']); //種目名毎のクルー人数を取得
    Route::post('registerRaceResultRecordForRegisterConfirm', [TournamentController::class, 'registerRaceResultRecordForRegisterConfirm']); //レース結果入力確認画面で登録を実行
    Route::post('updateRaceResultRecordForUpdateConfirm', [TournamentController::class, 'updateRaceResultRecordForUpdateConfirm']); //レース結果更新確認画面で更新を実行
    Route::post('getCrewPlayerInfo', [TournamentController::class, 'getCrewPlayerInfo']); //レース結果登録画面で選手IDを入力したとき、その選手情報を取得する
    Route::post('deleteRaceResultRecordData', [TournamentController::class, 'updateDeleteFlagOfRaceResultRecord']); //大会結果管理画面（レース結果削除） で「削除ボタン」押下時に実行される

    //ボランティア関連
    Route::post('getVolunteerData', [VolunteerController::class, 'getVolunteerData']); //ボランティア情報取得
    Route::post('volunteerSearch', [VolunteerController::class, 'searchVolunteers']); //ボランティア検索
    Route::post('sendVolunteerCsvData', [VolunteerInfoAlignmentController::class, 'sendVolunteerCsvData']); //ボランティア一括 読み込むボタン押下
    Route::post('registerVolunteerCsvData', [VolunteerInfoAlignmentController::class, 'registerVolunteerCsvData']); //ボランティア一括 登録ボタン押下
    Route::post('deleteVolunteer', [VolunteerController::class, 'deleteVolunteer']); //ボランティア削除

    //マイページ関連
    Route::get('getMyPageTournamentInfoList', [MyPageController::class, 'getMyPageTournamentInfoList']); // 大会情報を取得する
    Route::get('getMyPageRaceResultRecordInfoList', [MyPageController::class, 'getMyPageRaceResultRecordInfoList']); // 出漕履歴を取得する
    Route::get('getMyPagePlayerProfileList', [MyPageController::class, 'getMyPagePlayerProfileList']); // 選手プロフィールを取得する
    Route::get('getMyPageVolunteerInfoList', [MyPageController::class, 'getMyPageVolunteerInfoList']); // ボランティア情報を取得する
    Route::get('getMyPageProfileList', [MyPageController::class, 'getMyPageProfileList']); // プロフィールを取得する

    //指導者・審判情報関連　
    Route::get('getCoachRefereeInfoList', [CoachRefereeController::class, 'getCoachRefereeInfoList']); // 指導者・審判情報を取得する
    Route::get('getUpdateCoachRefereeInfoList', [CoachRefereeController::class, 'getUpdateCoachRefereeInfoList']); //指導者・審判情報更新用のデータを取得
    Route::patch('updateCoachRefereeInfo', [CoachRefereeController::class, 'updateCoachRefereeInfo']); //指導者・審判情報の追加・更新を行う
    Route::get('getCoachRefereeProfileInfo', [CoachRefereeController::class, 'getCoachRefereeProfileInfo']); //指導者・審判プロフィール情報を取得する

    //通知関連
    Route::get('getNotificationInfoData', [NotificationsController::class, 'getNotificationInfoData']); //通知参照画面用の情報を取得
    Route::get('getSenderNotificationsList', [NotificationsController::class, 'getSenderNotificationsList']); //通知一覧画面(送信)の情報を取得
    Route::get('getRecipientsNotificationsList', [NotificationsController::class, 'getRecipientsNotificationsList']); //通知一覧画面(受信)の情報を取得
    Route::delete('deleteNotification', [NotificationsController::class, 'deleteNotification']); //通知情報の削除 
    Route::post('insertNotification', [NotificationsController::class, 'insertNotification']); //通知情報の登録
    Route::patch('updateNotification', [NotificationsController::class, 'updateNotification']); //通知情報の更新
    Route::patch('updateNotificationReadFlag', [NotificationsController::class, 'updateNotificationReadFlag']); //既読フラグの更新

        // トップ画面
        Route::get('getTopPageSummaryCount', [TopPageController::class, 'getTopPageSummaryCount']); //トップページのフォロー中の選手、大会数、出場した大会数、フォロワーの値を取得
});
