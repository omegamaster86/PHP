<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\PlayerInfoAlignmentController;
use App\Http\Controllers\VolunteerController;
use App\Http\Controllers\TournamentRaceRefeController;
use App\Http\Controllers\TournamentController; //Laravel_Reactデータ送信テスト 20231227
use App\Models\M_prefectures;
use App\Models\M_countries;

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

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::group(['middleware' => ['api', 'cors']], function () {
    Route::get('list', [TournamentController::class, 'index']); //Laravel_Reactデータ送信テスト 20231227
    Route::post('postSample', [TournamentController::class, 'postTest']); //React_Laravelデータ送信テスト 20231228

    Route::get('getPrefecures', [M_prefectures::class, 'getPrefecures']); //都道府県マスター取得 20240117
    Route::get('getCountries', [M_countries::class, 'getCountries']); //国マスター取得 20240117

    //---------------以下にAPIを追加する----------------
    Route::get('createCsrf', [AuthenticatedSessionController::class, 'createCsrf']); //ログイン画面遷移時にcsrfトークンを取得 20240122
    Route::post('loginCheck', [AuthenticatedSessionController::class, 'loginCheck']); //ログインボタン押下時の処理 20240119
});
