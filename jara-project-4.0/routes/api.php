<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TournamentController; //Laravel_Reactデータ送信テスト 20231227


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

Route::get('list',[TournamentController::class, 'index']); //Laravel_Reactデータ送信テスト 20231227
Route::group(['middleware' => ['api', 'cors']], function () {
    Route::post('postSample',[TournamentController::class, 'postTest']); //React_Laravelデータ送信テスト 20231228
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
