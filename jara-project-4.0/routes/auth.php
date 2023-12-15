<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
// use App\Http\Controllers\UserEditController;
use App\Http\Controllers\UserController;
// use App\Http\Controllers\UserPasswordChangeController;
// use App\Http\Controllers\UserDeleteController;
// use App\Http\Controllers\EditInfoConfirmController;
// use App\Http\Controllers\EditVerifiCationController;
// use App\Http\Controllers\DeleteVerifiCationController;
// use App\Http\Controllers\PlayerRegisterController;
use App\Http\Controllers\PlayerController;
// use App\Http\Controllers\PlayerRegisterConfirmController;
// use App\Http\Controllers\PlayerEditConfirmController;
// use App\Http\Controllers\PlayerEditController;
// use App\Http\Controllers\PlayerDetailsController;
// use App\Http\Controllers\PlayerDeleteController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\TournamentController;
use App\Http\Controllers\PlayerInfoAlignmentController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {

    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    
    Route::get('status', function () {
        return view('auth.guest_user_status');
    })->name('guest_user_status');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

});

Route::middleware('auth')->group(function () {
    //Notification page
    Route::get('change-notification', function () {
        return view('change-notification');
    })->name('change-notification');
    
    //User
    Route::get('user/edit', [UserController::class, 'createEdit'])->name('user.edit');

    Route::post('user/edit', [UserController::class, 'storeEdit']);

    Route::get('user/edit/confirm', [UserController::class, 'createEditConfirm'])->name('user.edit.confirm');

    Route::post('user/edit/confirm', [UserController::class, 'storeEditConfirm']);
    Route::get('user/edit/verification', [UserController::class, 'createEditVerifiCation'])->name('user.edit.verification');
    Route::post('user/edit/verification', [UserController::class, 'storeEditVerifiCation']);
    Route::get('user/delete/verification', [UserController::class, 'createDeleteVerifiCation'])->name('user.delete.verification');
    Route::post('user/delete/verification', [UserController::class, 'storeDeleteVerifiCation']);

    Route::get('user/details', [UserController::class, 'createDetails'])->name('user.details');

    Route::get('user/delete', [UserController::class, 'createDelete'])->name('user.delete');
    Route::post('user/delete',  [UserController::class, 'storeDelete']);
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    //Password Change
    Route::get('user/password-change',[UserController::class, 'createPasswordChange'])->name('user.password-change');
    
    Route::post('user/password-change',[UserController::class, 'storePasswordChange']);
    
    // My page 
    Route::get('my-page', function () {
        return view('my-page');
    })->name('my-page');


    // Player Register
    
    Route::get('player/register', [PlayerController::class, 'createRegister'])->name('player.register');
    Route::post('player/register', [PlayerController::class, 'storeRegister']);

    Route::get('player/register/confirm', [PlayerController::class, 'createRegisterConfirm'])->name('player.register.confirm');
    Route::post('player/register/confirm', [PlayerController::class, 'storeRegisterConfirm']);

    // Player Edit

    Route::get('player/edit', [PlayerController::class, 'createEdit'])->name('player.edit');
    Route::post('player/edit', [PlayerController::class, 'storeEdit']);

    Route::get('player/edit/confirm', [PlayerController::class, 'createEditConfirm'])->name('player.edit.confirm');
    Route::post('player/edit/confirm', [PlayerController::class, 'storeEditConfirm']);

    // Player Delete
    Route::get('player/delete', [PlayerController::class, 'createDelete'])->name('player.delete');
    Route::post('player/delete', [PlayerController::class, 'storeDelete']);

    //Player Details
    
    Route::get('player/details', [PlayerController::class, 'createDetails'])->name('player.details');

    //20231129
    //-----大会関連-----
    // 大会登録・変更
    Route::get('tournament/register', [TournamentController::class, 'create']) ->name('tournament.register'); //大会登録画面
    Route::post('tournament/register', [TournamentController::class, 'storeConfirm']);

    Route::get('tournament/edit', [TournamentController::class, 'createEdit']) ->name('tournament.edit'); //大会更新画面    
    Route::post('tournament/edit', [TournamentController::class, 'storeEditConfirm']); //大会変更画面の確認ボタン押下時の処理
    
    // 大会確認画面
    Route::get('tournament/register/confirm', [TournamentController::class, 'createConfirm']) ->name('tournament.register.confirm');
    Route::post('tournament/register/confirm', [TournamentController::class, 'storeConfirmRegister']);
    Route::get('tournament/edit/confirm', [TournamentController::class, 'createEditConfirm'])->name('tournament.edit.confirm');
    Route::post('tournament/edit/confirm', [TournamentController::class, 'storeConfirmEdit']);
    
    // 大会削除画面
    Route::get('tournament/delete', [TournamentController::class, 'createDelete']) ->name('tournament.delete'); //大会削除画面
    Route::post('tournament/delete', [TournamentController::class, 'dbDelete']); //大会削除画面
    // 大会情報参照画面
    Route::get('tournament/reference', [TournamentController::class, 'createReference']) ->name('tournament.reference'); //大会削除画面
    //-----大会関連ここまで-----

    //Organizations
    //団体情報登録・更新画面
    Route::get('organization/register', [OrganizationController::class, 'create'])->name('organizations.register');
    Route::post('organization/register', [OrganizationController::class, 'storeConfirm']);

    Route::get('organization/edit/{targetOrgId}', [OrganizationController::class, 'createEdit'])->name('organizations.edit');
    Route::post('organization/edit/{targetOrgId}', [OrganizationController::class, 'storeEditConfirm']);

    //団体情報登録・更新確認画面
    Route::get('organization/register/confirm', [OrganizationController::class, 'createConfirm'])->name('organizations.register.confirm');
    Route::post('organization/register/confirm', [OrganizationController::class, 'storeConfirmRegister']);

    Route::get('organization/edit/{targetOrgId}/confirm', [OrganizationController::class, 'createEditConfirm'])->name('organizations.edit.confirm');
    Route::post('organization/edit/{targetOrgId}/confirm', [OrganizationController::class, 'storeConfirmEdit']);

    //団体情報参照・削除画面
    Route::get('organization/reference/{targetOrgId}', [OrganizationController::class, 'createReference'])->name('organizations.reference');

    // Route::get('organization/delete/{targetOrgId}', [OrganizationController::class, 'createDeleteView'])->name('organizations.reference');
    // Route::post('organization/delete/{targetOrgId}', [OrganizationController::class, 'deleteOrganization']);

    //Organization Management
    Route::get('organization/management', [OrganizationController::class, 'createManagement'])->name('organization.management');
    
    
    // 20231207
    // 選手情報連携画面
    Route::get('PlayerInfoAlignment/', [PlayerInfoAlignmentController::class, 'createInfoAlignment'])->name('PlayerInfoAlignment');
    Route::post('PlayerInfoAlignment/', [PlayerInfoAlignmentController::class, 'csvread'])->name('csv.upload');

});
