<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\View\View;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Illuminate\Validation\ValidationException;
use League\CommonMark\Node\Inline\Newline;

use App\Models\T_volunteers;
use App\Models\T_volunteer_availables;
use App\Models\T_volunteer_histories;
use App\Models\T_volunteer_language_proficiency;
use App\Models\T_volunteer_qualifications_hold;
use App\Models\T_volunteer_supportable_disability;

use App\Models\T_raceResultRecord;
use App\Models\T_organizations;
use App\Models\M_venue;
use Illuminate\Support\Facades\Validator;

/*
登録：register
変更：edit
確認：confirm
削除：delete
参照：reference
*/

class VolunteerController extends Controller
{
    //大会情報参照画面に遷移した時
    public function createReference(
        T_volunteers $tVolunteer,
        T_volunteer_availables $tVolunteerAvailables,
        T_volunteer_histories $tVolunteerHistories,
        T_volunteer_language_proficiency $tVolunteerLanguageProficiency,
        T_volunteer_qualifications_hold $tVolunteerQualificationsHold,
        T_volunteer_supportable_disability $tVolunteerSupportableDisability
    ) {
        //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        }
        $volData = $tVolunteer->getVolunteers(1); //ボランティア情報を取得
        $volAvaData = $tVolunteerAvailables->getVolunteerAvailables(1); //ボランティアアベイラブル情報を取得
        $volHistData = $tVolunteerHistories->getVolunteerHistories(1); //ボランティア履歴情報を取得
        $volLangProData = $tVolunteerLanguageProficiency->getVolunteerLanguageProficiency(1); //ボランティア言語レベル情報を取得
        $volQualData = $tVolunteerQualificationsHold->getVolunteerQualificationsHold(1); //ボランティア保有資格情報を取得
        $volSupDisData = $tVolunteerSupportableDisability->getVolunteerSupportableDisability(1); //ボランティア支援可能障害タイプ情報を取得

        return view('volunteer.reference', [
            "pagemode" => "refer", "volData" => $volData, "volAvaData" => $volAvaData, "volHistData" => $volHistData,
            "volLangProData" => $volLangProData, "volQualData" => $volQualData, "volSupDisData" => $volSupDisData
        ]);
    }

    //大会情報削除画面に遷移した時
    public function createDelete(
        T_volunteers $tVolunteer,
        T_volunteer_availables $tVolunteerAvailables,
        T_volunteer_histories $tVolunteerHistories,
        T_volunteer_language_proficiency $tVolunteerLanguageProficiency,
        T_volunteer_qualifications_hold $tVolunteerQualificationsHold,
        T_volunteer_supportable_disability $tVolunteerSupportableDisability
    ) {
        //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        }
        $volData = $tVolunteer->getVolunteers(1); //ボランティア情報を取得
        $volAvaData = $tVolunteerAvailables->getVolunteerAvailables(1); //ボランティアアベイラブル情報を取得
        $volHistData = $tVolunteerHistories->getVolunteerHistories(1); //ボランティア履歴情報を取得
        $volLangProData = $tVolunteerLanguageProficiency->getVolunteerLanguageProficiency(1); //ボランティア言語レベル情報を取得
        $volQualData = $tVolunteerQualificationsHold->getVolunteerQualificationsHold(1); //ボランティア保有資格情報を取得
        $volSupDisData = $tVolunteerSupportableDisability->getVolunteerSupportableDisability(1); //ボランティア支援可能障害タイプ情報を取得

        return view('volunteer.reference', [
            "pagemode" => "delete", "volData" => $volData, "volAvaData" => $volAvaData, "volHistData" => $volHistData,
            "volLangProData" => $volLangProData, "volQualData" => $volQualData, "volSupDisData" => $volSupDisData
        ]);
    }

    //削除ボタンを押した時（削除フラグの更新）
    public function deleteVolunteers(
        Request $request,
        T_volunteers $tVolunteer,
        T_volunteer_availables $tVolunteerAvailables,
        T_volunteer_histories $tVolunteerHistories,
        T_volunteer_language_proficiency $tVolunteerLanguageProficiency,
        T_volunteer_qualifications_hold $tVolunteerQualificationsHold,
        T_volunteer_supportable_disability $tVolunteerSupportableDisability
    ) {
        $result = "success";

        DB::beginTransaction();
        try {
            $tVolunteer::$volunteerInfo['volunteer_id'] = 1;
            $tVolunteer::$volunteerInfo['delete_flag'] = 1;
            $tVolunteerAvailables::$volunteerInfo['volunteer_id'] = 1;
            $tVolunteerAvailables::$volunteerInfo['delete_flag'] = 1;
            $tVolunteerHistories::$volunteerInfo['volunteer_id'] = 1;
            $tVolunteerHistories::$volunteerInfo['delete_flag'] = 1;
            $tVolunteerLanguageProficiency::$volunteerInfo['volunteer_id'] = 1;
            $tVolunteerLanguageProficiency::$volunteerInfo['delete_flag'] = 1;
            $tVolunteerQualificationsHold::$volunteerInfo['volunteer_id'] = 1;
            $tVolunteerQualificationsHold::$volunteerInfo['delete_flag'] = 1;
            $tVolunteerSupportableDisability::$volunteerInfo['volunteer_id'] = 1;
            $tVolunteerSupportableDisability::$volunteerInfo['delete_flag'] = 1;

            $tVolunteer->updateVolunteers($tVolunteer::$volunteerInfo); //ボランティア情報を取得
            $tVolunteerAvailables->updateVolunteerAvailables($tVolunteerAvailables::$volunteerInfo); //ボランティアアベイラブル情報を取得
            $tVolunteerHistories->updateVolunteerHistories($tVolunteerHistories::$volunteerInfo); //ボランティア履歴情報を取得
            $tVolunteerLanguageProficiency->updateVolunteerLanguageProficiency($tVolunteerLanguageProficiency::$volunteerInfo); //ボランティア言語レベル情報を取得
            $tVolunteerQualificationsHold->updateVolunteerQualificationsHold($tVolunteerQualificationsHold::$volunteerInfo); //ボランティア保有資格情報を取得
            $tVolunteerSupportableDisability->updateVolunteerSupportableDisability($tVolunteerSupportableDisability::$volunteerInfo); //ボランティア支援可能障害タイプ情報を取得

            DB::commit();
        } catch (\Throwable $e) {
            //dd($e);
            // dd($request->all());
            //dd("stop");
            DB::rollBack();

            $result = "failed";
            return $result;
        }

        if ($result == "success") {
            $page_status = "完了しました";
            $page_url = route('my-page');
            $page_url_text = "マイページ";
            return view('change-notification', ['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
        }
    }
}
