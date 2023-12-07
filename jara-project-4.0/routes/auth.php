<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\UserEditController;
use App\Http\Controllers\UserPasswordChangeController;
use App\Http\Controllers\UserDeleteController;
use App\Http\Controllers\EditInfoConfirmController;
use App\Http\Controllers\EditVerifiCationController;
use App\Http\Controllers\DeleteVerifiCationController;
use App\Http\Controllers\PlayerRegisterController;
use App\Http\Controllers\PlayerRegisterConfirmController;
use App\Http\Controllers\PlayerEditConfirmController;
use App\Http\Controllers\PlayerEditController;
use App\Http\Controllers\PlayerDetailsController;
use App\Http\Controllers\PlayerDeleteController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\TournamentController;
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
    Route::get('user/edit', [UserEditController::class, 'create'])->name('user.edit');

    Route::post('user/edit', [UserEditController::class, 'store']);

    Route::get('user/edit/confirm', [EditInfoConfirmController::class, 'create'])->name('user.edit.confirm');

    Route::post('user/edit/confirm', [EditInfoConfirmController::class, 'store']);
    Route::get('user/edit/verification', [EditVerifiCationController::class, 'create'])->name('user.edit.verification');
    Route::post('user/edit/verification', [EditVerifiCationController::class, 'store']);
    Route::get('user/delete/verification', [DeleteVerifiCationController::class, 'create'])->name('user.delete.verification');
    Route::post('user/delete/verification', [DeleteVerifiCationController::class, 'store']);

    Route::get('user/details', function () {
        return view('user.details',['pageMode' => 'details']);
    })->name('user.details');
    Route::get('user/delete', function () {
        return view('user.details',['pageMode' => 'delete']);
    })->name('user.delete');
    Route::post('user/delete',  [UserDeleteController::class, 'store']);
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    //Password Change
    Route::get('user/password-change',[UserPasswordChangeController::class, 'create'])->name('user.password-change');
    // Route::get('user/password-change', function () {
    //     return view('user.password-change');
    // })->name('user.password-change');
    
    Route::post('user/password-change',[UserPasswordChangeController::class, 'store']);
    
    // My page 
    Route::get('my-page', function () {
        return view('my-page');
    })->name('my-page');


    // Player Register
    
    Route::get('player/register', [PlayerRegisterController::class, 'create'])->name('player.register');
    Route::post('player/register', [PlayerRegisterController::class, 'store']);

    Route::get('player/register/confirm', [PlayerRegisterConfirmController::class, 'create'])->name('player.register.confirm');
    Route::post('player/register/confirm', [PlayerRegisterConfirmController::class, 'store']);

    // Player Edit

    Route::get('player/edit', [PlayerEditController::class, 'create'])->name('player.edit');
    Route::post('player/edit', [PlayerEditController::class, 'store']);

    Route::get('player/edit/confirm', [PlayerEditConfirmController::class, 'create'])->name('player.edit.confirm');
    Route::post('player/edit/confirm', [PlayerEditConfirmController::class, 'store']);

    // Player Delete
    Route::get('player/delete', [PlayerDeleteController::class, 'create'])->name('player.delete');
    Route::post('player/delete', [PlayerDeleteController::class, 'store']);

    //Player Details
    
    Route::get('player/details', [PlayerDetailsController::class, 'create'])->name('player.details');

    //20231129
    //-----大会関連-----
    // 大会登録
    Route::get('tournament/register', [TournamentController::class, 'create']) ->name('tournament.register'); //大会登録画面
    Route::post('tournament/register', [TournamentController::class, 'storeRegister']); //大会登録画面の確認ボタン押下時の処理
    // 大会変更画面
    Route::get('tournament/edit', [TournamentController::class, 'create01']) ->name('tournament.edit'); //大会更新画面    
    Route::post('tournament/edit', [TournamentController::class, 'storeEdit']); //大会変更画面の確認ボタン押下時の処理
    // 大会確認画面
    Route::get('tournament/register/confirm', [TournamentController::class, 'create02']) ->name('tournament.confirm');
    Route::get('tournament/edit/confirm', [TournamentController::class, 'create02']);
    Route::post('tournament/register/confirm', [TournamentController::class, 'storeRegisterConfirm']);
    // 大会削除画面
    Route::get('tournament/delete', [TournamentController::class, 'create03']) ->name('tournament.delete'); //大会削除画面
    // 大会情報参照画面
    Route::get('tournament/reference', [TournamentController::class, 'createReference']) ->name('tournament.reference'); //大会削除画面
    
    //Organizations
    //団体情報登録・更新画面
    Route::get('organization/register', [OrganizationController::class, 'create'])->name('organizations.register-edit');
    Route::post('organization/register', [OrganizationController::class, 'storeRegister']);

    //団体情報登録・更新確認画面
    Route::get('organization/register/confirm', [OrganizationController::class, 'createConfirm'])->name('organizations.register-comfirm');
    Route::post('organization/register/confirm', [OrganizationController::class, 'storeConfirmRegister']);

    //Organization Management
    Route::get('organization/management', function(){
        return view('organization.management');
    })->name('organization.management');

});
