<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Session;
use App\Models\T_tournaments;
use App\Models\T_races;
use App\Models\T_raceResultRecord;
use App\Models\T_organizations;
use App\Models\T_players;
use App\Models\T_users;
use DateTime;

class MyPageController extends Controller
{
    //大会情報を取得 20241008
    public function getMyPageTournamentInfoList(Request $request, T_raceResultRecord $tRaceResultRecord, T_players $tPlayers)
    {
        Log::debug(sprintf("getMyPageTournamentInfoList start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $userId = $reqData["userId"];
        $tournType = $reqData["tournType"];
        $playerData = $tPlayers->getPlayerDataFromUserId($userId); //ユーザIDを元に選手IDを取得 202401008
        $result = $tRaceResultRecord->getMyPageTournamentInfo($playerData->player_id, $tournType); //選手IDを元に大会情報を取得 20241008

        Log::debug(sprintf("getMyPageTournamentInfoList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //出漕履歴を取得 20241010
    public function getMyPageRaceResultRecordInfoList(Request $request, T_raceResultRecord $tRaceResultRecord, T_players $tPlayers)
    {
        Log::debug(sprintf("getMyPageRaceResultRecordInfoList start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $userId = $reqData["userId"];
        $official = $reqData["official"];
        $playerData = $tPlayers->getPlayerDataFromUserId($userId); //ユーザIDを元に選手IDを取得 202401008
        $result = $tRaceResultRecord->getMyPageRaceResultRecordInfo($playerData->player_id, $official); //選手IDを元に出漕履歴情報を取得 20241015

        Log::debug(sprintf("getMyPageRaceResultRecordInfoList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }
}
