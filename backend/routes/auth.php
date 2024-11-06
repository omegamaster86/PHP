<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewAuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\CoachRefereeControlloer;
use App\Http\Controllers\ContactUsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\OrganizationPlayersController;
use App\Http\Controllers\TournamentController;
use App\Http\Controllers\PlayerInfoAlignmentController;
use App\Http\Controllers\VolunteerController;
use App\Http\Controllers\TournamentRaceRefeController;
use App\Http\Controllers\VolunteerInfoAlignmentController;
use App\Http\Controllers\TournamentInfoAlignmentController;
use App\Http\Controllers\MyPageController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
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
use App\Models\T_races;
use App\Models\T_organizations;
use App\Models\M_weather_type;
use App\Models\M_wind_direction;
use App\Models\M_race_result_notes;
use App\Models\M_seat_number;

// Route::get('contact-us', [ContactUsController::class, 'create'])->name('contact-us');
// Route::get('contact-us/confirm', [ContactUsController::class, 'createConfirm'])->name('contact-us-confirm');
Route::post('contact-us', [ContactUsController::class, 'store']);
// Route::post('contact-us/confirm', [ContactUsController::class, 'storeConfirm']);


//団体選手一括登録
Route::get('organization-player-register', [OrganizationPlayersController::class, 'createOrganizationPlayerRegister'])->name('organization-player-register');
Route::post('organization-player-register', [OrganizationPlayersController::class, 'csvReadOrganizationPlayerRegister']);
//団体選手一括登録

Route::middleware('guest')->group(function () {

    // Route::get('register', [RegisteredUserController::class, 'create'])->name('register');

    // Route::post('register', [RegisteredUserController::class, 'store']);

    Route::post('signup', [RegisteredUserController::class, 'store'])->name('signup');

    // Route::get('password-reset', [UserController::class, 'createPasswordReset'])->name('password-reset');
    Route::post('password-reset', [UserController::class, 'storePasswordReset']);

    // Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');

    // Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login');

    // Route::get('status', function () {
    //     return view('auth.guest_user_status');
    // })->name('guest_user_status');
});

Route::middleware('auth')->group(function () {
    // 実装　ー　クマール　ー開始
    Route::get('getUserData', [UserController::class, 'getUserData']);
    // 実装　ー　クマール　ー終了

    //共通項目
    Route::get('getPrefecures', [M_prefectures::class, 'getPrefecures']); //都道府県マスター取得 20240117
    Route::get('getCountries', [M_countries::class, 'getCountries']); //国マスター取得 20240117
    Route::get('getSexList', [M_sex::class, 'getSexList']); //性別マスター取得 20240131
    Route::get('getVenueList', [M_venue::class, 'getVenueList']); //水域マスター取得 20240201
    Route::get('getRaceClass', [M_race_class::class, 'getRaceClass']); //レースクラスマスター取得 20240202
    Route::get('getEvents', [M_events::class, 'getEvents']); //イベントマスター取得 20240202
    Route::get('getOrganizationClass', [M_organization_class::class, 'getOrganizationClass']); //団体区分マスター取得 20240208
    Route::get('getOrganizationTypeData', [M_organization_type::class, 'getOrganizationTypeData']); //団体種別マスター取得 20240208
    Route::get('getApprovalType', [M_approval_type::class, 'getApprovalType']); //大会種別マスター取得 20240208
    Route::get('getDisabilityType', [M_disability_type::class, 'getDisabilityType']); //障碍マスタ
    Route::get('getQualifications', [M_volunteer_qualifications::class, 'getQualifications']); //資格マスタ
    Route::get('getLanguages', [M_languages::class, 'getLanguages']); //言語マスタ
    Route::get('getLanguageProficiency', [M_language_proficiency::class, 'getLanguageProficiency']); //言語レベルマスタ
    Route::get('getClothesSize', [M_clothes_size::class, 'getClothesSize']); //服のサイズマスタ
    Route::get('getIDsAssociatedWithUser', [UserController::class, 'getIDsAssociatedWithUser']); //ユーザIDに紐づいた情報を取得 20240221
    Route::get('getAllRaces', [T_races::class, 'getAllRaces']); //全レース情報取得 20240329
    Route::get('getOrganizations', [T_organizations::class, 'getOrganizations']); //全レース情報取得 20240329
    Route::get('getWeatherType', [M_weather_type::class, 'getWeatherType']); //天気マスタ
    Route::get('getWindDirection', [M_wind_direction::class, 'getWindDirection']); // 風向き（マスタ）
    Route::get('getRaceResultNotes', [M_race_result_notes::class, 'getRaceResultNotes']); // 備考（マスタ）
    Route::get('getSeatNumber', [M_seat_number::class, 'getSeatNumber']); // シート番号（マスタ）

    //ユーザー関連
    Route::get('getUserData', [UserController::class, 'getUserData']); //DBからユーザ情報を取得 20240131
    Route::post('updateUserData', [UserController::class, 'updateUserData']); //ユーザ情報をDBに送る 20240131
    Route::post('deleteUserData', [UserController::class, 'updateDeleteFlagInUserData']); //ユーザ情報を削除する 20240212

    //パスワード関連
    Route::post('user/password-change', [UserController::class, 'storePasswordChange']); //パスワード変更 20240207

    //ユーザー情報更新画面
    Route::post('user/sent-certification-number', [UserController::class, 'sentCertificationNumber']); //承認番号送信　20240213
    Route::post('user/verify-certification-number', [UserController::class, 'verifyCertificationNumber']); //承認番号確認　20240213

    //選手関連
    Route::post('storePlayerData', [PlayerController::class, 'storePlayerData']); //選手登録確認画面から登録 20231228
    Route::post('getUpdatePlayerData', [PlayerController::class, 'getUpdatePlayerData']); //DBから選手情報更新画面にデータを渡す 20240131
    Route::post('updatePlayerData', [PlayerController::class, 'updatePlayerData']); //選手更新確認画面から更新 20240131
    Route::post('checkJARAPlayerId', [PlayerController::class, 'checkJARAPlayerId']); //選手登録画面から登録 20240220

    Route::post('getPlayerInfoData', [PlayerController::class, 'getPlayerInfoData']); //DBから選手情報更新画面にデータを渡す 20240131
    Route::post('getRaceResultRecordsData', [PlayerController::class, 'getRaceResultRecordsData']); //DBから選手情報更新画面にデータを渡す 20240131
    Route::post('deletePlayerData', [PlayerController::class, 'deletePlayerData']); //該当データをDBから削除する 20240201
    Route::post('playerSearch', [PlayerController::class, 'playerSearch']); //選手検索 20240309
    Route::post('sendCsvData', [PlayerInfoAlignmentController::class, 'sendCsvData']); //読み込みボタン押下時 20240228
    Route::post('registerCsvData', [PlayerInfoAlignmentController::class, 'registerCsvData']); //連携ボタン押下時 20240228

    Route::patch('playerFollowed', [PlayerController::class, 'playerFollowed']); //選手フォロー (選手情報参照画面) 20241029

    //団体関連
    Route::post('getOrgData', [OrganizationController::class, 'getOrgData']); //DBから団体管理画面にデータを渡す 20240201
    Route::post('storeOrgData', [OrganizationController::class, 'storeOrgData']); //団体情報をDBに送る 20240201
    Route::post('updateOrgData', [OrganizationController::class, 'updateOrgData']); //団体情報をDBに送る 20240201
    Route::post('validateOrgData', [OrganizationController::class, 'validateOrgData']); //団体のバリデーションチェック 20240308
    //Route::post('getStaffData', [OrganizationController::class, 'getStaffData']); //団体所属スタッフを取得 20240212
    Route::post('orgSearch', [OrganizationController::class, 'searchOrganization']); //団体検索 20240212
    Route::post('deleteOrgData', [OrganizationController::class, 'deleteOrgData']); //団体削除 20240307
    Route::get('getOrganizationForOrgManagement', [OrganizationController::class, 'getOrganizationForOrgManagement']); //団体管理画面用に団体情報を取得 20240212
    Route::get('getOrganizationListData', [OrganizationController::class, 'getOrganizationListData']); //団体所属選手一括登録画面用に団体情報を取得 20240410
    Route::post('getEntryTournamentsViewForTeamRef', [OrganizationController::class, 'getEntryTournamentsViewForTeamRef']); //エントリー大会 20240212
    Route::post('searchOrganizationPlayersForTeamRef', [OrganizationPlayersController::class, 'searchOrganizationPlayersForTeamRef']); //主催大会 20240215
    Route::post('updateOrgPlayerData', [OrganizationPlayersController::class, 'updateOrgPlayerData']); //団体所属選手更新 20240226
    Route::post('teamPlayerSearch', [OrganizationPlayersController::class, 'teamPlayerSearch']); //団体所属選手更新 20240226
    Route::post('sendOrgCsvData', [OrganizationPlayersController::class, 'sendOrgCsvData']); //団体一括 読み込むボタン押下 20240301
    Route::post('registerOrgCsvData', [OrganizationPlayersController::class, 'registerOrgCsvData']); //団体一括 登録ボタン押下 20240301

    //スタッフ関連
    Route::post('getOrgStaffData', [OrganizationController::class, 'getOrgStaffData']); //スタッフ情報取得 20240214

    //大会関連
    Route::post('getTournamentInfoData', [TournamentController::class, 'getTournamentInfoData']); //DBから大会情報更新画面にデータを渡す 20240201
    Route::get('getTournamentIsFollowed', [TournamentController::class, 'getIsFollowed']); // ログインユーザーが当該大会をフォローしているか
    Route::post('getTournamentInfoData_org', [TournamentController::class, 'getTournamentInfoData_org']); //主催大会 20240215
    Route::post('tournamentRegistOrUpdateValidationCheck', [TournamentController::class, 'tournamentRegistOrUpdateValidationCheck']);
    Route::post('storeTournamentInfoData', [TournamentController::class, 'storeTournamentInfoData']); //DBから大会情報更新画面にデータを渡す 20240201
    Route::post('updateTournamentInfoData', [TournamentController::class, 'updateTournamentInfoData']); //大会情報更新 20240202
    Route::get('getRaceInfoData', [TournamentController::class, 'getRaceInfoData']); //DBから大会情報更新画面にデータを渡す 20240201
    Route::post('deleteTournamentData', [TournamentController::class, 'deleteTournamentData']); //DBから大会情報を削除する 20240205
    Route::post('tournamentSearch', [TournamentController::class, 'searchTournament']); //大会検索 20240212
    Route::get('getTournamentInfoData_allData', [TournamentController::class, 'getTournamentInfoData_allData']); //大会検索 20240212
    Route::post('tournamentEntryYearSearch', [TournamentInfoAlignmentController::class, 'tournamentEntryYearSearch']); //大会エントリー一括登録 20240229
    Route::post('sendTournamentEntryCsvData', [TournamentInfoAlignmentController::class, 'sendTournamentEntryCsvData']); //大会エントリー一括登録 読み込むボタン押下 20240301
    Route::post('registerTournamentEntryCsvData', [TournamentInfoAlignmentController::class, 'registerTournamentEntryCsvData']); //大会エントリー一括登録 登録ボタン押下 20240301
    Route::post('sendTournamentResultCsvData', [TournamentInfoAlignmentController::class, 'sendTournamentResultCsvData']); //大会結果一括 読み込むボタン押下 20240301
    Route::post('registerTournamentResultCsvData', [TournamentInfoAlignmentController::class, 'registerTournamentResultCsvData']); //大会結果一括 登録ボタン押下 20240301
    Route::post('checkOrgManager', [TournamentController::class, 'checkOrgManager']); //大会情報参照画面 主催団体管理者の判別 20240402
    Route::post('getEventSheetPosForEventID', [TournamentController::class, 'getEventSheetPosForEventID']); //種目IDを条件に対象の種目に対応するシート位置を取得する 20240514

    Route::patch('tournamentFollowed', [TournamentRaceRefeController::class, 'tournamentFollowed']); //大会フォロー (大会参照画面) 20241028

    //レース関連
    Route::post('getRaceData', [TournamentController::class, 'getRaceData']); //レース情報取得 20240214 大会情報に基づくレース情報
    Route::post('getRaceResultRecord', [TournamentController::class, 'getRaceResultRecord']);   //20240329 選手情報とレース結果情報
    Route::post('searchRaceData', [TournamentController::class, 'searchRaceData']); //大会レース結果管理　レース結果検索 20240329
    Route::post('getRaceDataRaceId', [TournamentController::class, 'getRaceDataRaceId']); //レース結果登録 レースIDを元にレース情報を取得 20240329
    Route::post('getRaceDataFromTournIdAndEventId', [TournamentController::class, 'getRaceDataFromTournIdAndEventId']); //レース結果登録 大会IDと種目IDを元にレース情報を取得 20240329
    Route::post('getCsvFormatRaceData', [TournamentController::class, 'getCsvFormatRaceData']); //大会結果情報一括登録画面用 csvフォーマット出力に使用するレース情報の取得 20240418
    Route::post('getTournLinkRaces', [TournamentController::class, 'getTournLinkRaces']); //大会結果管理　レース登録画面用 レース情報の取得 20240422

    //レース結果(出漕結果記録)関連
    Route::post('getTournRaceResultRecords', [TournamentController::class, 'getTournRaceResultRecords']); //大会レース結果参照画面 20240216
    Route::post('getCrewData', [TournamentController::class, 'getCrewData']); //クルー取得 20240216
    Route::post('getCrewNumberForEventId', [TournamentController::class, 'getCrewNumberForEventId']); //種目名毎のクルー人数を取得 20240405
    Route::post('registerRaceResultRecordForRegisterConfirm', [TournamentController::class, 'registerRaceResultRecordForRegisterConfirm']); //レース結果入力確認画面で登録を実行 20240405
    Route::post('updateRaceResultRecordForUpdateConfirm', [TournamentController::class, 'updateRaceResultRecordForUpdateConfirm']); //レース結果更新確認画面で更新を実行 20240405
    Route::post('getCrewPlayerInfo', [TournamentController::class, 'getCrewPlayerInfo']); //レース結果登録画面で選手IDを入力したとき、その選手情報を取得する 20240409
    Route::post('deleteRaceResultRecordData', [TournamentController::class, 'updateDeleteFlagOfRaceResultRecord']); //大会結果管理画面（レース結果削除） で「削除ボタン」押下時に実行される 20240520

    //ボランティア関連
    Route::post('getVolunteerData', [VolunteerController::class, 'getVolunteerData']); //ボランティア情報取得 20240213 ※ボランティア履歴情報も取得する
    Route::post('volunteerSearch', [VolunteerController::class, 'searchVolunteers']); //ボランティア検索
    Route::post('sendVolunteerCsvData', [VolunteerInfoAlignmentController::class, 'sendVolunteerCsvData']); //ボランティア一括 読み込むボタン押下
    Route::post('registerVolunteerCsvData', [VolunteerInfoAlignmentController::class, 'registerVolunteerCsvData']); //ボランティア一括 登録ボタン押下
    Route::post('deleteVolunteer', [VolunteerController::class, 'deleteVolunteer']); //ボランティア削除 20240315

    //マイページ関連
    Route::get('getMyPageTournamentInfoList', [MyPageController::class, 'getMyPageTournamentInfoList']); // 大会情報を取得する 20241008
    Route::get('getMyPageRaceResultRecordInfoList', [MyPageController::class, 'getMyPageRaceResultRecordInfoList']); // 出漕履歴を取得する 20241010
    Route::get('getMyPagePlayerProfileList', [MyPageController::class, 'getMyPagePlayerProfileList']); // 選手プロフィールを取得する 20241016
    Route::get('getMyPageVolunteerInfoList', [MyPageController::class, 'getMyPageVolunteerInfoList']); // ボランティア情報を取得する 20241017
    Route::get('getMyPageProfileList', [MyPageController::class, 'getMyPageProfileList']); // プロフィールを取得する 20241023

    //指導者・審判情報関連　
    Route::get('getCoachRefereeInfoList', [CoachRefereeControlloer::class, 'getCoachRefereeInfoList']); // 指導者・審判情報を取得する 20241105

    //React連携後APIここまで===========================================================
    //================================================================================

    Route::post('user/delete',  [UserController::class, 'storeDelete']);
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
