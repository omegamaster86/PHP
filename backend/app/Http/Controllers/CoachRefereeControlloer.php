<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\T_organization_coaching_history;
use App\Models\T_held_referee_qualifications;
use App\Models\T_held_coach_qualifications;
use App\Models\T_users;
use Illuminate\Support\Facades\DB;

class CoachRefereeControlloer extends Controller
{
    //指導者・審判情報を取得 20241106
    public function getCoachRefereeInfoList(Request $request, T_users $tUsers, T_organization_coaching_history $tOrganizationCoachingHistory)
    {
        Log::debug(sprintf("getCoachRefereeInfoList start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $result = $tUsers->getCoachRefereeInfoData($reqData['userId']); //ユーザIDに紐づいた指導者・審判資格を取得する 20241106
        $result->coachingHistories = $tOrganizationCoachingHistory->getOrganizationCoachingHistoryData($reqData['userId']); //ユーザIDに紐づいた指導履歴を取得する 20241106
        $result->coachQualificationNames = array_filter(
            explode(",", $result->coachQualificationNames),
            fn($name) => trim($name) !== '' 
        );
        $result->refereeQualificationNames = array_filter(
            explode(",", $result->refereeQualificationNames),
            fn($name) => trim($name) !== '');

        Log::debug(sprintf("getCoachRefereeInfoList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //指導者・審判情報更新用のデータを取得 20241106
    public function getUpdateCoachRefereeInfoList(
        Request $request,
        T_organization_coaching_history $tOrganizationCoachingHistory,
        T_held_referee_qualifications $tHeldRefereeQualifications,
        T_held_coach_qualifications $tHeldCoachQualifications
    ) {
        Log::debug(sprintf("getUpdateCoachRefereeInfoList start"));
        $reqData = $request->all();
        Log::debug($reqData);

        $result = json_encode([
            'jspoId' => Auth::user()->jspo_id,
            'coachingHistories' => $tOrganizationCoachingHistory->getOrganizationCoachingHistoryData(Auth::user()->user_id),
            'coachQualifications' => $tHeldRefereeQualifications->getHeldRefereeQualificationsData(),
            'refereeQualifications' => $tHeldCoachQualifications->getHeldCoachQualificationsData()
        ]);

        Log::debug(sprintf("getUpdateCoachRefereeInfoList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //指導者・審判情報を更新 20241108
    public function updateCoachRefereeInfo(
        Request $request,
        T_users $tUsers,
        T_organization_coaching_history $tOrganizationCoachingHistory,
        T_held_referee_qualifications $tHeldRefereeQualifications,
        T_held_coach_qualifications $tHeldCoachQualifications
    ) {
        Log::debug(sprintf("updateCoachRefereeInfo start"));

        try {
            DB::beginTransaction();

            $reqData = $request->all();
            Log::debug($reqData);

            $tUsers->updateJspoId($reqData['jspoId']); //JSPO IDの更新

            //指導履歴の追加・更新
            for ($i = 0; $i < count($reqData['coachingHistories']); $i++) {
                if ($reqData['coachingHistories'][$i]['isNewRow'] == 1) {
                    //新規追加
                    $tOrganizationCoachingHistory->insertOrganizationCoachingHistoryData($reqData['coachingHistories'][$i]);
                } else {
                    //更新・削除
                    $tOrganizationCoachingHistory->updateOrganizationCoachingHistoryData($reqData['coachingHistories'][$i]);
                }
            }

            //指導者資格の追加・更新
            for ($i = 0; $i < count($reqData['coachQualificationNames']); $i++) {
                if ($reqData['coachQualificationNames'][$i]['isNewRow'] == 1) {
                    //新規追加
                    $tHeldCoachQualifications->insertHeldCoachQualificationsData($reqData['coachQualificationNames'][$i]);
                } else {
                    //更新・削除
                    $tHeldCoachQualifications->updateHeldCoachQualificationsData($reqData['coachQualificationNames'][$i]);
                }
            }

            //審判資格の追加・更新
            for ($i = 0; $i < count($reqData['refereeQualificationNames']); $i++) {
                if ($reqData['refereeQualificationNames'][$i]['isNewRow'] == 1) {
                    //新規追加
                    $tHeldRefereeQualifications->insertHeldRefereeQualificationsData($reqData['refereeQualificationNames'][$i]);
                } else {
                    //更新・削除
                    $tHeldRefereeQualifications->updateHeldRefereeQualificationsData($reqData['refereeQualificationNames'][$i]);
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            abort(500, '指導者・審判情報の更新に失敗しました。');
        }

        Log::debug(sprintf("updateCoachRefereeInfo end"));
    }

    //指導者・審判プロフィール用のデータを取得 20241112
    public function getCoachRefereeProfileInfoList(
        Request $request,
        T_organization_coaching_history $tOrganizationCoachingHistory,
        T_held_referee_qualifications $tHeldRefereeQualifications,
        T_held_coach_qualifications $tHeldCoachQualifications
    ) {
        Log::debug(sprintf("getCoachRefereeProfileInfoList start"));
        $reqData = $request->all();
        Log::debug($reqData);

        $result = json_encode([
            'userName' => Auth::user()->user_name,
            'jspoId' => Auth::user()->jspo_id,
            'coachingHistories' => $tOrganizationCoachingHistory->getOrganizationCoachingHistoryDataForProfile(),
            'coachQualifications' => $tHeldRefereeQualifications->getHeldRefereeQualificationsDataForProfile(),
            'refereeQualifications' => $tHeldCoachQualifications->getHeldCoachQualificationsDataForProfile()
        ]);

        Log::debug(sprintf("getCoachRefereeProfileInfoList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }
}
