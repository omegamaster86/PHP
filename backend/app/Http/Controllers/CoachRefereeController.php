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
use Symfony\Component\HttpKernel\Exception\HttpException;

class CoachRefereeController extends Controller
{
    //指導者・審判情報を取得 20241106
    public function getCoachRefereeInfoList(Request $request, T_users $tUsers, T_organization_coaching_history $tOrganizationCoachingHistory)
    {
        Log::debug(sprintf("getCoachRefereeInfoList start"));
        $reqData = $request->all();

        // 指導者・審判資格を閲覧できるのはJARA/県ボのみ
        $userType = Auth::user()->user_type;
        $canShowQualification = substr($userType, -6, 1) == '1' || substr($userType, -5, 1) == '1';

        $result = $tUsers->getCoachRefereeInfoData($reqData['userId'], $canShowQualification); //ユーザIDに紐づいた指導者・審判資格を取得する
        $result->coachingHistories = $tOrganizationCoachingHistory->getOrganizationCoachingHistoryData($reqData['userId']); //ユーザIDに紐づいた指導履歴を取得する 20241106
        $result->coachQualificationNames = array_filter(
            explode(",", $result->coachQualificationNames),
            fn($name) => trim($name) !== ''
        );
        $result->refereeQualificationNames = array_filter(
            explode(",", $result->refereeQualificationNames),
            fn($name) => trim($name) !== ''
        );

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
        $coachingHistories = $tOrganizationCoachingHistory->getOrganizationCoachingHistoryData(Auth::user()->user_id);
        $coachQualifications = $tHeldCoachQualifications->getHeldCoachQualificationsData();
        $refereeQualifications = $tHeldRefereeQualifications->getHeldRefereeQualificationsData();
        unset(
            $coachingHistories->orgName,
            $coachingHistories->staffTypeName,
            $coachQualifications->qualName,
            $refereeQualifications->qualName
        );

        $result = [
            'jspoId' => Auth::user()->jspo_id,
            'coachingHistories' => $coachingHistories,
            'coachQualifications' => $coachQualifications,
            'refereeQualifications' => $refereeQualifications
        ];

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

            // 指導者資格の重複チェック
            $coachQualificationIds = array_column($reqData['coachQualifications'], 'coachQualificationId');
            $uniqueIds = array_unique($coachQualificationIds);

            if (count($coachQualificationIds) !== count($uniqueIds)) {
                abort(400, '指導者資格の中で資格名が重複しています。');
            }

            // 審判資格の重複チェック
            $refereeQualificationIds = array_column($reqData['refereeQualifications'], 'refereeQualificationId');
            $uniqueRefereeIds = array_unique($refereeQualificationIds);

            if (count($refereeQualificationIds) !== count($uniqueRefereeIds)) {
                abort(400, '審判資格の中で資格名が重複しています。');
            }

            $tUsers->updateJspoId($reqData['jspoId']); //JSPO IDの更新

            //指導履歴の追加・更新
            for ($i = 0; $i < count($reqData['coachingHistories']); $i++) {
                if ($reqData['coachingHistories'][$i]['isEndDateUndefined']) {
                    $reqData['coachingHistories'][$i]['endDate'] = null;
                }
                if (
                    isset($reqData['coachingHistories'][$i]['isNewRow']) && $reqData['coachingHistories'][$i]['isNewRow'] && !$reqData['coachingHistories'][$i]['isDeleted']
                ) {
                    //新規追加
                    $tOrganizationCoachingHistory->insertOrganizationCoachingHistoryData($reqData['coachingHistories'][$i]);
                } else {
                    //更新・削除
                    $tOrganizationCoachingHistory->updateOrganizationCoachingHistoryData($reqData['coachingHistories'][$i]);
                }
            }

            //指導者資格の追加・更新
            for ($i = 0; $i < count($reqData['coachQualifications']); $i++) {
                if (
                    isset($reqData['coachQualifications'][$i]['isNewRow']) && $reqData['coachQualifications'][$i]['isNewRow'] && !$reqData['coachQualifications'][$i]['isDeleted']
                ) {
                    // 新規追加
                    $tHeldCoachQualifications->insertHeldCoachQualificationsData($reqData['coachQualifications'][$i]);
                } else {
                    // 更新・削除
                    $tHeldCoachQualifications->updateHeldCoachQualificationsData($reqData['coachQualifications'][$i]);
                }
            }

            // 審判資格の追加・更新
            for ($i = 0; $i < count($reqData['refereeQualifications']); $i++) {
                if (
                    isset($reqData['refereeQualifications'][$i]['isNewRow']) && $reqData['refereeQualifications'][$i]['isNewRow'] && !$reqData['refereeQualifications'][$i]['isDeleted']
                ) {
                    // 新規追加
                    $tHeldRefereeQualifications->insertHeldRefereeQualificationsData($reqData['refereeQualifications'][$i]);
                } else {
                    // 更新・削除
                    $tHeldRefereeQualifications->updateHeldRefereeQualificationsData($reqData['refereeQualifications'][$i]);
                }
            }


            DB::commit();
        } catch (HttpException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, '指導者・審判情報の更新に失敗しました。');
        }

        Log::debug(sprintf("updateCoachRefereeInfo end"));
    }

    //指導者・審判プロフィール用のデータを取得 20241112
    public function getCoachRefereeProfileInfo(
        Request $request,
        T_organization_coaching_history $tOrganizationCoachingHistory,
        T_held_referee_qualifications $tHeldRefereeQualifications,
        T_held_coach_qualifications $tHeldCoachQualifications
    ) {
        Log::debug(sprintf("getCoachRefereeProfileInfo start"));
        $reqData = $request->all();

        $result = ([
            'userName' => Auth::user()->user_name,
            'jspoId' => Auth::user()->jspo_id,
            'coachingHistories' => $tOrganizationCoachingHistory->getOrganizationCoachingHistoryDataForProfile(),
            'coachQualifications' => $tHeldCoachQualifications->getHeldCoachQualificationsDataForProfile(),
            'refereeQualifications' => $tHeldRefereeQualifications->getHeldRefereeQualificationsDataForProfile()
        ]);
        Log::debug(sprintf("getCoachRefereeProfileInfo end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }
}
