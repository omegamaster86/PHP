<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\M_side_info;
use App\Models\T_raceResultRecord;
use App\Models\T_players;
use App\Models\T_tournaments;
use App\Models\T_volunteers;
use App\Models\T_volunteer_language_proficiency;
use App\Models\T_volunteer_qualifications_hold;
use App\Models\T_volunteer_supportable_disability;


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
    public function getMyPagePlayerProfileList(T_players $tPlayers, M_side_info $mSideInfo)
    {
        Log::debug(sprintf("getMyPagePlayerProfileList start"));
        $result = $tPlayers->getPlayerProfileInfo(Auth::user()->user_id); //ユーザIDを元に選手プロフィール情報を取得 202401015
        $sideInfoMasterResult = $mSideInfo->getMyPageSideInfo($result->sideInfo); //サイド情報(8桁の数字列)を元にサイド名を取得 202401021
        $result->sideInfo = $sideInfoMasterResult; //サイド情報マスターから取得した結果をsideInfoに渡す 20241021

        Log::debug(sprintf("getMyPagePlayerProfileList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //ボランティア情報を取得 20241017
    public function getMyPageVolunteerInfoList(
        T_volunteers $tVolunteers,
        T_volunteer_language_proficiency $tVolunteerLanguageProficiency,
        T_volunteer_qualifications_hold $tVolunteerQualificationsHold,
        T_volunteer_supportable_disability $tVolunteerSupportableDisability
    ) {
        Log::debug(sprintf("getMyPageVolunteerInfoList start"));

        $volData = $tVolunteers->getVolunteerInfoFromUserId(Auth::user()->user_id); //ユーザIDを元にボランティア情報を取得 202401015

        //volDataが0件だった場合は空配列を返す 20241021
        if (empty($volData)) {
            return response()->json(['result' => []]);
        }

        $volSupDisData = $tVolunteerSupportableDisability->getMyPageVolunteerSupportableDisability($volData[0]->volunteer_id); //ボランティア支援可能障害タイプ情報を取得
        $volLangProData = $tVolunteerLanguageProficiency->getMyPageVolunteerLanguageProficiency($volData[0]->volunteer_id); //ボランティア言語レベル情報を取得
        $volQualData = $tVolunteerQualificationsHold->getMyPageVolunteerQualificationsHold($volData[0]->volunteer_id); //ボランティア保有資格情報を取得

        Log::debug(sprintf("getMyPageVolunteerInfoList end"));
        return response()->json([
            'result' => ([
                'volunteerName' => $volData[0]->volunteerName,
                'sex' => $volData[0]->sex,
                'dateOfBirth' => $volData[0]->dateOfBirth,
                'countryName' => $volData[0]->countryName,
                'prefName' => $volData[0]->prefName,
                'mailaddress' => $volData[0]->mailaddress,
                'telephoneNumber' => $volData[0]->telephoneNumber,
                'clothesSize' => $volData[0]->clothesSize,
                'disType' => $volSupDisData,
                'qualHold' => $volQualData,
                'languageProficiency' => $volLangProData,
                'dayOfWeek' => $volData[0]->dayOfWeek,
                'timeZone' => $volData[0]->timeZone,
            ])
        ]); //DBの結果を返す
    }
}
