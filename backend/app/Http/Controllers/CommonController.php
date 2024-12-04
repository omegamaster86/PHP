<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use App\Models\M_staff_type;
use App\Models\M_coach_qualification;
use App\Models\M_referee_qualification;

class CommonController extends Controller
{
    //スタッフ種別を取得
    public function getStaffTypes(M_staff_type $staffTypeModel)
    {
        Log::debug(sprintf("getStaffTypes start"));
        $staffTypes = $staffTypeModel->getStaffTypes();
        Log::debug(sprintf("getStaffTypes end"));
        return response()->json(['result' => $staffTypes]);
    }

    // 指導者・審判情報 更新/確認画面用、指導者資格を取得
    public function getCoachQualifications(M_coach_qualification $m_coach_qualifications)
    {
        Log::debug(sprintf("getCoachQualifications start"));
        $qualifications = $m_coach_qualifications->getCoachQualifications();
        Log::debug(sprintf("getCoachQualifications end"));
        return response()->json(['result' => $qualifications]);
    }

    // 指導者・審判情報 更新/確認画面用、審判資格を取得
    public function getRefereeQualifications(M_referee_qualification $m_referee_qualifications)
    {
        Log::debug(sprintf("getRefereeQualifications start"));
        $qualifications = $m_referee_qualifications->getRefereeQualifications();
        Log::debug(sprintf("getRefereeQualifications end"));
        return response()->json(['result' => $qualifications]);
    }
}