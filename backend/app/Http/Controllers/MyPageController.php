<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\M_side_info;
use App\Models\T_followed_players;
use App\Models\T_raceResultRecord;
use App\Models\T_players;
use App\Models\T_tournaments;
use App\Models\T_users;
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
        $tournType = $reqData["tournType"];
        $playerData = $tPlayers->getPlayerDataFromUserId(Auth::user()->user_id); //ユーザIDを元に選手IDを取得 202401008

        $playerId = $playerData->player_id ?? null;
        $result = $tTournaments->getMyPageTournamentInfo($playerId, $tournType); //選手IDを元に大会情報を取得 20241008
        Log::debug(sprintf("getMyPageTournamentInfoList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //出漕履歴を取得 20241010
    public function getMyPageRaceResultRecordInfoList(Request $request, T_raceResultRecord $tRaceResultRecord, T_players $tPlayers)
    {
        Log::debug(sprintf("getMyPageRaceResultRecordInfoList start"));
        $reqData = $request->all();
        $official = $reqData["official"];
        $playerData = $tPlayers->getPlayerDataFromUserId(Auth::user()->user_id); //ユーザIDを元に選手IDを取得 202401008

        if (empty($playerData)) {
            return response()->json(['result' => []]);
        }

        $result = $tRaceResultRecord->getMyPageRaceResultRecordInfo($playerData->player_id, $official); //選手IDを元に出漕履歴情報を取得 20241015

        Log::debug(sprintf("getMyPageRaceResultRecordInfoList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //選手プロフィールを取得 20241015
    public function getMyPagePlayerProfileList(T_players $tPlayers, T_users $tUsers, M_side_info $mSideInfo, T_followed_players $tFollowedPlayers)
    {
        Log::debug(sprintf("getMyPagePlayerProfileList start"));

        $userId = Auth::user()->user_id;

        $userType = $tUsers->getIDsAssociatedWithUser($userId);
        $firstOfUserType = reset($userType);
        if (!$firstOfUserType || $firstOfUserType->is_player == 0) {
            abort(403, '閲覧権限がありません。');
        }

        $result = $tPlayers->getPlayerProfileInfo($userId); //ユーザIDを元に選手プロフィール情報を取得 202401015

        if (empty($result)) {
            abort(404, '選手情報が存在しません。');
        }

        $sideInfoMasterResult = $mSideInfo->getMyPageSideInfo($result->sideInfoString); //サイド情報(8桁の数字列)を元にサイド名を取得 202401021
        $result->sideInfo = $sideInfoMasterResult; //サイド情報マスターから取得した結果をsideInfoに渡す 20241021
        unset($result->sideInfoString);

        $followerCount = $tFollowedPlayers->getFollowerCount($result->playerId); //選手IDに紐づいたフォロワー数を取得 202401029
        $result->followerCount = $followerCount; //フォロワー数を代入 20241029

        Log::debug(sprintf("getMyPagePlayerProfileList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //ボランティア情報を取得 20241017
    public function getMyPageVolunteerInfoList(
        T_users $tUsers,
        T_volunteers $tVolunteers,
        T_volunteer_language_proficiency $tVolunteerLanguageProficiency,
        T_volunteer_qualifications_hold $tVolunteerQualificationsHold,
        T_volunteer_supportable_disability $tVolunteerSupportableDisability
    ) {
        Log::debug(sprintf("getMyPageVolunteerInfoList start"));

        $userId = Auth::user()->user_id;

        $userType = $tUsers->getIDsAssociatedWithUser($userId);
        $firstOfUserType = reset($userType);
        if (!$firstOfUserType || $firstOfUserType->is_volunteer == 0) {
            abort(403, '閲覧権限がありません。');
        }

        $volData = $tVolunteers->getVolunteerInfoFromUserId(Auth::user()->user_id); //ユーザIDを元にボランティア情報を取得 202401015
        if (empty($volData)) {
            abort(404, 'ボランティア情報が存在しません。');
        }

        $volId = $volData[0]->volunteer_id;
        $volSupDisData = $tVolunteerSupportableDisability->getMyPageVolunteerSupportableDisability($volId); //ボランティア支援可能障害タイプ情報を取得
        $volLangProData = $tVolunteerLanguageProficiency->getMyPageVolunteerLanguageProficiency($volId); //ボランティア言語レベル情報を取得
        $volQualData = $tVolunteerQualificationsHold->getMyPageVolunteerQualificationsHold($volId); //ボランティア保有資格情報を取得

        $dowBinaryString = $volData[0]->dayOfWeekStr ?? "0000000";
        $tzBinaryString = $volData[0]->timeZoneStr ?? "0000";

        $dayOfWeekNames = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
        $volDayOfWeek = array_map(
            fn($name, $index) =>
            [
                'dayOfWeekName' => $name,
                'isEnable' => intval($dowBinaryString[strlen($dowBinaryString) - $index - 1]) // dowBinaryStringを逆から読む
            ],
            $dayOfWeekNames,
            array_keys($dayOfWeekNames)
        );

        $timeZoneNames = ["早朝", "午前", "午後", "夜"];
        $volTimeZone = array_map(
            fn($name, $index) =>
            [
                'timeZoneName' => $name,
                'isEnable' => intval($tzBinaryString[strlen($tzBinaryString) - $index - 1]) // tzBinaryStringを逆から読む
            ],
            $timeZoneNames,
            array_keys($timeZoneNames)
        );

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
                'dayOfWeek' => $volDayOfWeek,
                'timeZone' => $volTimeZone
            ])
        ]); //DBの結果を返す
    }

    //プロフィールを取得 20241023
    public function getMyPageProfileList(T_users $tUsers)
    {
        Log::debug(sprintf("getMyPageProfileList start"));
        $result = $tUsers->getUserProfileInfo(Auth::user()->user_id); //ユーザIDを元にプロフィール情報を取得 202401023

        if (empty($result)) {
            abort(403, 'プロフィール情報が存在しません。');
        }

        $result->userType = array(
            array("userTypeName" => "管理者", "isEnable" => intval(substr($result->userTypeString, 1, 1))),
            array("userTypeName" => "JARA", "isEnable" => intval(substr($result->userTypeString, 2, 1))),
            array("userTypeName" => "県ボ職員", "isEnable" => intval(substr($result->userTypeString, 3, 1))),
            array("userTypeName" => "団体管理者", "isEnable" => intval(substr($result->userTypeString, 4, 1))),
            array("userTypeName" => "選手", "isEnable" => intval(substr($result->userTypeString, 5, 1))),
            array("userTypeName" => "ボランティア", "isEnable" => intval(substr($result->userTypeString, 6, 1))),
            array("userTypeName" => "一般ユーザー（観客）", "isEnable" => intval(substr($result->userTypeString, 7, 1))),
        );
        unset($result->userTypeString);

        Log::debug(sprintf("getMyPageProfileList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }
}
