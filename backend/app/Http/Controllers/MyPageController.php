<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\T_raceResultRecord;
use App\Models\T_players;
use App\Models\T_tournaments;
use Illuminate\Support\Facades\Auth;

class MyPageController extends Controller
{
    //大会情報を取得 20241008
    public function getMyPageTournamentInfoList(Request $request, T_tournaments $tTournaments, T_players $tPlayers)
    {
        Log::debug(sprintf("getMyPageTournamentInfoList start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $tournType = $reqData["tournType"];
        $playerData = $tPlayers->getPlayerDataFromUserId(Auth::user()->user_id); //ユーザIDを元に選手IDを取得 202401008

        // FIXME: 大会フォロー機能実装時に不要になる予定
        if (empty($playerData)) {
            return response()->json(['result' => []]);
        }

        $result = $tTournaments->getMyPageTournamentInfo($playerData->player_id, $tournType); //選手IDを元に大会情報を取得 20241008

        Log::debug(sprintf("getMyPageTournamentInfoList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //出漕履歴を取得 20241010
    public function getMyPageRaceResultRecordInfoList(Request $request, T_raceResultRecord $tRaceResultRecord, T_players $tPlayers)
    {
        Log::debug(sprintf("getMyPageRaceResultRecordInfoList start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $official = $reqData["official"];
        $playerData = $tPlayers->getPlayerDataFromUserId(Auth::user()->user_id); //ユーザIDを元に選手IDを取得 202401008
        $result = $tRaceResultRecord->getMyPageRaceResultRecordInfo($playerData->player_id, $official); //選手IDを元に出漕履歴情報を取得 20241015

        Log::debug(sprintf("getMyPageRaceResultRecordInfoList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //選手プロフィールを取得 20241015
    public function getMyPagePlayerProfileList(Request $request, T_players $tPlayers)
    {
        Log::debug(sprintf("getMyPagePlayerProfileList start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $userId = $reqData["userId"];
        $result = $tPlayers->getPlayerProfileInfo($userId); //ユーザIDを元に選手プロフィール情報を取得 202401015

        Log::debug(sprintf("getMyPagePlayerProfileList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }
}
