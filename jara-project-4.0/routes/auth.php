<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewAuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
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

Route::get('contact-us', [ContactUsController::class, 'create'])->name('contact-us');
Route::get('contact-us/confirm', [ContactUsController::class, 'createConfirm'])->name('contact-us-confirm');
Route::post('contact-us', [ContactUsController::class, 'store']);
Route::post('contact-us/confirm', [ContactUsController::class, 'storeConfirm']);


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
    Route::get('getIDsAssociatedWithUser', [UserController::class, 'getIDsAssociatedWithUser']); //ユーザIDに紐づいた情報を取得 20240221

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
    Route::post('storePlayerTest', [PlayerController::class, 'storePlayerTest']); //選手登録確認画面から登録 20231228
    Route::post('getUpdatePlayerData', [PlayerController::class, 'getUpdatePlayerData']); //DBから選手情報更新画面にデータを渡す 20240131
    Route::post('updatePlayerData', [PlayerController::class, 'updatePlayerData']); //選手更新確認画面から更新 20240131
    Route::post('checkJARAPlayerId', [PlayerController::class, 'checkJARAPlayerId']); //選手登録画面から登録 20240220
    Route::post('getPlayerInfoData', [PlayerController::class, 'getPlayerInfoData']); //DBから選手情報更新画面にデータを渡す 20240131
    Route::post('getRaceResultRecordsData', [PlayerController::class, 'getRaceResultRecordsData']); //DBから選手情報更新画面にデータを渡す 20240131
    Route::post('deletePlayerData', [PlayerController::class, 'deletePlayerData']); //該当データをDBから削除する 20240201
    Route::post('playerSearch', [PlayerController::class, 'searchPlayer']); //選手検索 20240212

    //団体関連
    Route::post('getOrgData', [OrganizationController::class, 'getOrgData']); //DBから団体管理画面にデータを渡す 20240201
    Route::post('storeOrgData', [OrganizationController::class, 'storeOrgData']); //団体情報をDBに送る 20240201
    Route::post('getStaffData', [OrganizationController::class, 'getStaffData']); //団体所属スタッフを取得 20240212
    Route::post('orgSearch', [OrganizationController::class, 'searchOrganization']); //団体検索 20240212
    Route::get('getOrganizationForOrgManagement', [OrganizationController::class, 'getOrganizationForOrgManagement']); //団体管理画面用に団体情報を取得 20240212
    Route::post('getEntryTournamentsViewForTeamRef', [OrganizationController::class, 'getEntryTournamentsViewForTeamRef']); //エントリー大会 20240212
    Route::post('searchOrganizationPlayersForTeamRef', [OrganizationPlayersController::class, 'searchOrganizationPlayersForTeamRef']); //主催大会 20240215

    //スタッフ関連
    Route::post('getOrgStaffData', [OrganizationController::class, 'getOrgStaffData']); //スタッフ情報取得 20240214

    //大会関連
    Route::post('getTournamentInfoData', [TournamentController::class, 'getTournamentInfoData']); //DBから大会情報更新画面にデータを渡す 20240201
    Route::post('getTournamentInfoData_org', [TournamentController::class, 'getTournamentInfoData_org']); //主催大会 20240215
    Route::post('storeTournamentInfoData', [TournamentController::class, 'storeTournamentInfoData']); //DBから大会情報更新画面にデータを渡す 20240201
    Route::post('updateTournamentInfoData', [TournamentController::class, 'updateTournamentInfoData']); //大会情報更新 20240202
    Route::get('getRaceInfoData', [TournamentController::class, 'getRaceInfoData']); //DBから大会情報更新画面にデータを渡す 20240201
    Route::post('deleteTournamentData', [TournamentController::class, 'deleteTournamentData']); //DBから大会情報を削除する 20240205
    Route::post('tournamentSearch', [TournamentController::class, 'searchTournament']); //大会検索 20240212
    Route::get('getTournamentInfoData_vol', [TournamentController::class, 'getTournamentInfoData_vol']); //大会検索 20240212

    //レース関連
    Route::post('getRaceData', [TournamentController::class, 'getRaceData']); //レース情報取得 20240214

    //レース結果(出漕結果記録)関連
    Route::post('getTournRaceResultRecords', [TournamentController::class, 'getTournRaceResultRecords']); //大会レース結果参照画面 20240216
    Route::post('getCrewData', [TournamentController::class, 'getCrewData']); //クルー取得 20240216

    //ボランティア関連
    Route::post('getVolunteerData', [VolunteerController::class, 'getVolunteerData']); //ボランティア情報取得 20240213 ※ボランティア履歴情報も取得する
    Route::post('volunteerSearch', [VolunteerController::class, 'searchVolunteers']); //ボランティア検索


    //React連携後APIここまで===========================================================
    //================================================================================

    //Notification page
    // Route::get('change-notification', function () {
    //     return view('change-notification');
    // })->name('change-notification');

    //User
    // Route::get('user/edit', [UserController::class, 'createEdit'])->name('user.edit');

    // Route::post('user/edit', [UserController::class, 'storeEdit']);

    // Route::get('user/edit/confirm', [UserController::class, 'createEditConfirm'])->name('user.edit.confirm');

    // Route::post('user/edit/confirm', [UserController::class, 'storeEditConfirm']);
    // Route::get('user/edit/verification', [UserController::class, 'createEditVerifiCation'])->name('user.edit.verification');
    // Route::post('user/edit/verification', [UserController::class, 'storeEditVerifiCation']);
    // Route::get('user/delete/verification', [UserController::class, 'createDeleteVerifiCation'])->name('user.delete.verification');
    // Route::post('user/delete/verification', [UserController::class, 'storeDeleteVerifiCation']);

    // Route::get('user/details', [UserController::class, 'createDetails'])->name('user.details');

    // Route::get('user/delete', [UserController::class, 'createDelete'])->name('user.delete');
    Route::post('user/delete',  [UserController::class, 'storeDelete']);

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    //Password Change
    // Route::get('user/password-change', [UserController::class, 'createPasswordChange'])->name('user.password-change');

    // Route::post('user/password-change', [UserController::class, 'storePasswordChange']);

    // // My page 
    // Route::get('my-page', function () {
    //     return view('my-page');
    // })->name('my-page');



    // Player Register

    // Route::get('player/register', [PlayerController::class, 'createRegister'])->name('player.register');
    // Route::post('player/register', [PlayerController::class, 'storeRegister']);

    // // Route::get('player/register/confirm', [PlayerController::class, 'createRegisterConfirm'])->name('player.register.confirm');
    // Route::post('player/register/confirm', [PlayerController::class, 'storeRegisterConfirm']);

    // // Player Edit


    // // Route::get('player/edit', [PlayerController::class, 'createEdit'])->name('player.edit');
    // Route::post('player/edit', [PlayerController::class, 'storeEdit']);

    // // Route::get('player/edit/confirm', [PlayerController::class, 'createEditConfirm'])->name('player.edit.confirm');
    // Route::post('player/edit/confirm', [PlayerController::class, 'storeEditConfirm']);

    // // Player Delete
    // // Route::get('player/delete', [PlayerController::class, 'createDelete'])->name('player.delete');
    // Route::post('player/delete', [PlayerController::class, 'storeDelete']);


    // //Player search 
    // // Route::get('player/search', [PlayerController::class, 'createSearch'])->name('player.search');

    // Route::post('player/search', [PlayerController::class, 'searchPlayer']);

    //Player Details

    // Route::get('player/{user_id}', [PlayerController::class, 'createDetails'])->name('player.details');

    //20231129
    //-----大会関連-----
    // 大会登録・変更
    // Route::get('tournament/register', [TournamentController::class, 'create'])->name('tournament.register'); //大会登録画面
    // Route::post('tournament/register', [TournamentController::class, 'storeConfirm']);

    // Route::get('tournament/edit', [TournamentController::class, 'createEdit'])->name('tournament.edit'); //大会更新画面    
    // Route::post('tournament/edit', [TournamentController::class, 'storeEditConfirm']); //大会変更画面の確認ボタン押下時の処理

    // // 大会確認画面
    // Route::get('tournament/register/confirm', [TournamentController::class, 'createConfirm'])->name('tournament.register.confirm');
    // Route::post('tournament/register/confirm', [TournamentController::class, 'storeConfirmRegister']);
    // Route::get('tournament/edit/confirm', [TournamentController::class, 'createEditConfirm'])->name('tournament.edit.confirm');
    // Route::post('tournament/edit/confirm', [TournamentController::class, 'storeConfirmEdit']);

    // // 大会削除画面
    // Route::get('tournament/delete', [TournamentController::class, 'createDelete'])->name('tournament.delete'); //大会削除画面
    // Route::post('tournament/delete', [TournamentController::class, 'deleteTournament']); //大会削除画面
    // // 大会情報参照画面
    // Route::get('tournament/reference', [TournamentController::class, 'createReference'])->name('tournament.reference');
    // // 大会検索画面
    // Route::get('tournament/search', [TournamentController::class, 'createSearch'])->name('tournament.search');
    // Route::post('tournament/search', [TournamentController::class, 'searchTournament']);

    // // 大会レース結果参照画面
    // Route::get('tournament/racereference', [TournamentRaceRefeController::class, 'createReference'])->name('tournament.racereference');
    // Route::post('tournament/racereference', [TournamentRaceRefeController::class, 'showCrewData']);

    // //大会エントリー一括登録
    // Route::get('tournament-entry-register', [TournamentController::class, 'createEntryRegister'])->name('tournament-entry-register');
    // Route::post('tournament-entry-register', [TournamentController::class, 'csvReadEntryRegister']);

    // //20240205 レース(大会)結果一括登録
    // Route::get('tournamentInfoAlignment', [TournamentInfoAlignmentController::class, 'createEntryRegister'])->name('TournamentInfoAlignment');
    // Route::post('tournamentInfoAlignment', [TournamentInfoAlignmentController::class, 'csvReadEntryRegister']);

    //-----大会関連ここまで-----------------------------

    //Organizations
    //団体情報登録・更新画面
    // Route::get('organization/register', [OrganizationController::class, 'create'])->name('organizations.register');
    // Route::post('organization/register', [OrganizationController::class, 'storeConfirm']);

    // Route::get('organization/edit/{targetOrgId}', [OrganizationController::class, 'createEdit'])->name('organizations.edit');
    // Route::post('organization/edit/{targetOrgId}', [OrganizationController::class, 'storeEditConfirm']);

    // //団体情報登録・更新確認画面
    // Route::get('organization/register/confirm', [OrganizationController::class, 'createConfirm'])->name('organizations.register.confirm');
    // Route::post('organization/register/confirm', [OrganizationController::class, 'storeConfirmRegister']);

    // Route::get('organization/edit/{targetOrgId}/confirm', [OrganizationController::class, 'createEditConfirm'])->name('organizations.edit.confirm');
    // Route::post('organization/edit/{targetOrgId}/confirm', [OrganizationController::class, 'storeConfirmEdit']);

    // //団体情報参照・削除画面
    // Route::get('organization/reference/{targetOrgId}', [OrganizationController::class, 'createReference'])->name('organizations.reference');

    // Route::get('organization/delete/{targetOrgId}', [OrganizationController::class, 'createDeleteView'])->name('organizations.delete');
    // Route::post('organization/delete/{targetOrgId}', [OrganizationController::class, 'deleteOrganization']);

    // //団体検索画面
    // Route::get('organization/search', [OrganizationController::class, 'createSearchView'])->name('organizations.search');
    // Route::post('organization/search', [OrganizationController::class, 'searchOrganization']);

    //Organization Management
    // Route::get('organization/management', [OrganizationController::class, 'createManagement'])->name('organization.management');


    // // 20231207
    // // 選手情報連携画面
    // Route::get('PlayerInfoAlignment/', [PlayerInfoAlignmentController::class, 'createInfoAlignment'])->name('PlayerInfoAlignment');
    // Route::post('PlayerInfoAlignment/', [PlayerInfoAlignmentController::class, 'csvread'])->name('csv.upload');

    // //20231227
    // // ボランティア削除画面
    // Route::get('volunteer/delete', [VolunteerController::class, 'createDelete'])->name('volunteer.delete');
    // Route::post('volunteer/delete', [VolunteerController::class, 'deleteVolunteers']);
    // // ボランティア参照画面
    // Route::get('volunteer/reference', [VolunteerController::class, 'createReference'])->name('volunteer.reference');
    // //20240116
    // //ボランティア検索画面
    // Route::get('volunteer/search', [VolunteerController::class, 'createSearch'])->name('volunteer.search');
    // Route::post('volunteer/search', [VolunteerController::class, 'searchVolunteers']);
    // //20240126
    // //ボランティア一括登録画面
    // Route::get('volunteerInfoAlignment/', [VolunteerInfoAlignmentController::class, 'createInfoAlignment'])->name('VolunteerInfoAlignment');
    // Route::post('volunteerInfoAlignment/', [VolunteerInfoAlignmentController::class, 'csvread'])->name('volunteer.csv.read');
});

// Route::group(['middleware' => ['auth', 'action_log']], function () {
//     //Organizations
//     //団体情報登録・更新画面
//     Route::get('organization/register', [OrganizationController::class, 'create'])->name('organizations.register');
//     Route::post('organization/register', [OrganizationController::class, 'storeConfirm']);

//     Route::get('organization/edit/{targetOrgId}', [OrganizationController::class, 'createEdit'])->name('organizations.edit');
//     Route::post('organization/edit/{targetOrgId}', [OrganizationController::class, 'storeEditConfirm']);

//     //団体情報登録・更新確認画面
//     Route::get('organization/register/confirm', [OrganizationController::class, 'createConfirm'])->name('organizations.register.confirm');
//     Route::post('organization/register/confirm', [OrganizationController::class, 'storeConfirmRegister']);

//     Route::get('organization/edit/{targetOrgId}/confirm', [OrganizationController::class, 'createEditConfirm'])->name('organizations.edit.confirm');
//     Route::post('organization/edit/{targetOrgId}/confirm', [OrganizationController::class, 'storeConfirmEdit']);

//     //団体情報参照・削除画面
//     Route::get('organization/reference/{targetOrgId}', [OrganizationController::class, 'createReference'])->name('organizations.reference');

//     Route::get('organization/delete/{targetOrgId}', [OrganizationController::class, 'createDeleteView'])->name('organizations.delete');
//     Route::post('organization/delete/{targetOrgId}', [OrganizationController::class, 'deleteOrganization']);

//     //団体検索画面
//     Route::get('organization/search', [OrganizationController::class, 'createSearchView'])->name('organizations.search');
//     Route::post('organization/search', [OrganizationController::class, 'searchOrganization']);

//     //20240118
//     //団体所属選手登録画面
//     Route::get('organization-players/edit/{targetOrgId}', [OrganizationPlayersController::class, 'createEdit'])->name('organization-players.edit');

//     //20240122
//     //団体所属追加選手検索画面
//     Route::get('organization-players/search/{targetOrgId}', [OrganizationPlayersController::class, 'createSearchView'])->name('organization-players.search');
//     Route::post('organization-players/search/{targetOrgId}', [OrganizationPlayersController::class, 'searchOrganizationPlayers']);
// });
