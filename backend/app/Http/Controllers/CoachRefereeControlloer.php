<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\T_organization_coaching_history;
use App\Models\T_users;

class CoachRefereeControlloer extends Controller
{
    //指導者・審判情報を取得 20241106
    public function getCoachRefereeInfoList(Request $request, T_users $tUsers, T_organization_coaching_history $tOrganizationCoachingHistory)
    {
        Log::debug(sprintf("getCoachRefereeInfoList start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $result = $tUsers->getCoachRefereeInfoData(); //ユーザIDに紐づいた指導者・審判資格を取得する 20241106
        $result->coachingHistories = $tOrganizationCoachingHistory->getOrganizationCoachingHistoryData(); //ユーザIDに紐づいた指導履歴を取得する 20241106
        $result->coachQualificationNames = explode(",", $result->coachQualificationNames);
        $result->refereeQualificationNames = explode(",", $result->refereeQualificationNames);

        Log::debug(sprintf("getCoachRefereeInfoList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

}
