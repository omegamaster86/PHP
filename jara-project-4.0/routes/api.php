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
use App\Models\M_sex;
use App\Models\M_venue;

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
    Route::get('getSexList', [M_sex::class, 'getSexList']); //性別マスター取得 20240131
    Route::get('getVenueList', [M_venue::class, 'getVenueList']); //水域マスター取得 20240201

    //---------------以下にAPIを追加する----------------
    Route::get('createCsrf', [AuthenticatedSessionController::class, 'createCsrf']); //ログイン画面遷移時にcsrfトークンを取得 20240122
    Route::post('loginCheck', [AuthenticatedSessionController::class, 'loginCheck']); //ログインボタン押下時の処理 20240119

    //選手情報登録・更新画面
    Route::post('storePlayerTest', [PlayerController::class, 'storePlayerTest']); //選手登録確認画面から登録 20231228
    Route::get('getUpdatePlayerData', [PlayerController::class, 'getUpdatePlayerData']); //DBから選手情報更新画面にデータを渡す 20240131
    Route::post('updatePlayerData', [PlayerController::class, 'updatePlayerData']); //選手更新確認画面から更新 20240131
    //選手情報参照・削除画面
    Route::get('getPlayerInfoData', [PlayerController::class, 'getPlayerInfoData']); //DBから選手情報更新画面にデータを渡す 20240131
    Route::get('getRaceResultRecordsData', [PlayerController::class, 'getRaceResultRecordsData']); //DBから選手情報更新画面にデータを渡す 20240131
    Route::post('deletePlayerData', [PlayerController::class, 'deletePlayerData']); //該当データをDBから削除する 20240201

    //団体管理画面
    Route::get('getOrgData', [PlayerController::class, 'getOrgData']); //DBから団体管理画面にデータを渡す 20240201

    //大会登録・更新画面
    Route::get('getTournamentInfoData', [TournamentController::class, 'getTournamentInfoData']); //DBから選手情報更新画面にデータを渡す 20240201
});
