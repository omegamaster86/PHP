<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ProfileEditController;
use App\Http\Controllers\ProfileDeleteController;
use App\Http\Controllers\EditInfoConfirmController;
use App\Http\Controllers\EditVerifiCationController;
use App\Http\Controllers\DeleteVerifiCationController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\PlayerRegisterController;
use App\Http\Controllers\PlayerRegisterConfirmController;
use App\Http\Controllers\PlayerEditConfirmController;
use App\Http\Controllers\PlayerEditController;
use App\Http\Controllers\PlayerDeleteController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {

    Route::get('register', [RegisteredUserController::class, 'create'])
                ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
                ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

});

Route::middleware('auth')->group(function () {
    //User
    Route::get('profile', [ProfileEditController::class, 'create'])
                ->name('profile.edit');

    Route::post('profile', [ProfileEditController::class, 'store']);

    Route::get('profile/edit/confirm', [EditInfoConfirmController::class, 'create'])
                ->name('profile.edit.confirm');

    Route::post('profile/edit/confirm', [EditInfoConfirmController::class, 'store']);
    Route::get('profile/edit/verification', [EditVerifiCationController::class, 'create'])->name('profile.edit.verification');
    Route::post('profile/edit/verification', [EditVerifiCationController::class, 'store']);
    Route::get('profile/delete/verification', [DeleteVerifiCationController::class, 'create'])->name('profile.delete.verification');
    Route::post('profile/delete/verification', [DeleteVerifiCationController::class, 'store']);

    Route::get('profile/details', function () {
        return view('profile.details',['pageMode' => 'details']);
    })->name('profile.details');
    Route::get('profile/delete', function () {
        return view('profile.details',['pageMode' => 'delete']);
    })->name('profile.delete');
    Route::post('profile/delete',  [ProfileDeleteController::class, 'store']);
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
                ->name('logout');

    // Player 
    
    Route::get('player/register', [PlayerRegisterController::class, 'create'])
                ->name('player.register');
    Route::post('player/register', [PlayerRegisterController::class, 'store']);

    Route::get('player/register/confirm', [PlayerRegisterConfirmController::class, 'create'])
                ->name('player.register.confirm');
    Route::post('player/register/confirm', [PlayerRegisterConfirmController::class, 'store']);

    Route::get('player/edit', [PlayerEditController::class, 'create'])->name('player.edit');
    Route::post('player/edit', [PlayerEditController::class, 'store']);

    Route::get('player/edit/confirm', [PlayerEditConfirmController::class, 'create'])->name('player.edit.confirm');
    Route::post('player/edit/confirm', [PlayerEditConfirmController::class, 'store']);
    Route::get('player/delete', [PlayerDeleteController::class, 'create'])->name('player.delete');
    Route::post('player/delete', [PlayerDeleteController::class, 'store']);
});
