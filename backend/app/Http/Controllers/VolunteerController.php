<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
// use App\Providers\RouteServiceProvider;
// use Illuminate\Auth\Events\Registered;
// use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Hash;
// use Illuminate\Support\Str;
// use Illuminate\View\View;
// use Illuminate\Support\Facades\Mail;
// use App\Mail\WelcomeMail;
// use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

// use Illuminate\Validation\ValidationException;
// use League\CommonMark\Node\Inline\Newline;

use App\Models\T_volunteers;
use App\Models\T_volunteer_availables;
use App\Models\T_volunteer_histories;
use App\Models\T_volunteer_language_proficiency;
use App\Models\T_volunteer_qualifications_hold;
use App\Models\T_volunteer_supportable_disability;

// use App\Models\M_sex;
// use App\Models\M_countries;
// use App\Models\M_prefectures;
// use App\Models\M_languages;
// use App\Models\M_language_proficiency;

// use App\Models\T_raceResultRecord;
// use App\Models\T_organizations;
// use App\Models\M_venue;
// use Illuminate\Support\Facades\Validator;

/*
登録：register
変更：edit
確認：confirm
削除：delete
参照：reference
*/

class VolunteerController extends Controller
{
    //ボランティア情報参照画面
    public function getVolunteerData(
        Request $request,
        T_volunteers $tVolunteer,
        T_volunteer_availables $tVolunteerAvailables,
        T_volunteer_histories $tVolunteerHistories,
        T_volunteer_language_proficiency $tVolunteerLanguageProficiency,
        T_volunteer_qualifications_hold $tVolunteerQualificationsHold,
        T_volunteer_supportable_disability $tVolunteerSupportableDisability
    ) {
        Log::debug(sprintf("createReference start"));
        //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
        if (Auth::user()->temp_password_flag === 1) {
            //return redirect('user/password-change');
        }
        $requestData = $request->all();
        Log::debug($requestData['volunteer_id']);
        $volData = $tVolunteer->getVolunteers($requestData['volunteer_id']); //ボランティア情報を取得
        $volAvaData = $tVolunteerAvailables->getVolunteerAvailables($requestData['volunteer_id']); //ボランティアアベイラブル情報を取得
        $volHistData = $tVolunteerHistories->getVolunteerHistories($requestData['volunteer_id']); //ボランティア履歴情報を取得
        $volLangProData = $tVolunteerLanguageProficiency->getVolunteerLanguageProficiency($requestData['volunteer_id']); //ボランティア言語レベル情報を取得
        $volQualData = $tVolunteerQualificationsHold->getVolunteerQualificationsHold($requestData['volunteer_id']); //ボランティア保有資格情報を取得
        $volSupDisData = $tVolunteerSupportableDisability->getVolunteerSupportableDisability($requestData['volunteer_id']); //ボランティア支援可能障害タイプ情報を取得

        Log::debug(sprintf("createReference start"));
        return response()->json([
            'result' => $volData,
            'volAvaData' => $volAvaData,
            'volHistData' => $volHistData,
            'volLangProData' => $volLangProData,
            'volQualData' => $volQualData,
            'volSupDisData' => $volSupDisData
        ]); //DBの結果を返す
    }

    //大会情報削除画面に遷移した時
    // public function createDelete(
    //     T_volunteers $tVolunteer,
    //     T_volunteer_availables $tVolunteerAvailables,
    //     T_volunteer_histories $tVolunteerHistories,
    //     T_volunteer_language_proficiency $tVolunteerLanguageProficiency,
    //     T_volunteer_qualifications_hold $tVolunteerQualificationsHold,
    //     T_volunteer_supportable_disability $tVolunteerSupportableDisability
    // ) {
    //     //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
    //     if (Auth::user()->temp_password_flag === 1) {
    //         return redirect('user/password-change');
    //     }
    //     $volData = $tVolunteer->getVolunteers(1); //ボランティア情報を取得
    //     $volAvaData = $tVolunteerAvailables->getVolunteerAvailables(1); //ボランティアアベイラブル情報を取得
    //     $volHistData = $tVolunteerHistories->getVolunteerHistories(1); //ボランティア履歴情報を取得
    //     $volLangProData = $tVolunteerLanguageProficiency->getVolunteerLanguageProficiency(1); //ボランティア言語レベル情報を取得
    //     $volQualData = $tVolunteerQualificationsHold->getVolunteerQualificationsHold(1); //ボランティア保有資格情報を取得
    //     $volSupDisData = $tVolunteerSupportableDisability->getVolunteerSupportableDisability(1); //ボランティア支援可能障害タイプ情報を取得

    //     return view('volunteer.reference', [
    //         "pagemode" => "delete", "volData" => $volData, "volAvaData" => $volAvaData, "volHistData" => $volHistData,
    //         "volLangProData" => $volLangProData, "volQualData" => $volQualData, "volSupDisData" => $volSupDisData
    //     ]);
    // }

    //削除ボタンを押した時（削除フラグの更新）
    // public function deleteVolunteers(
    //     Request $request,
    //     T_volunteers $tVolunteer,
    //     T_volunteer_availables $tVolunteerAvailables,
    //     T_volunteer_histories $tVolunteerHistories,
    //     T_volunteer_language_proficiency $tVolunteerLanguageProficiency,
    //     T_volunteer_qualifications_hold $tVolunteerQualificationsHold,
    //     T_volunteer_supportable_disability $tVolunteerSupportableDisability
    // ) {
    //     $result = "success";

    //     DB::beginTransaction();
    //     try {
    //         $tVolunteer::$volunteerInfo['volunteer_id'] = 1;
    //         $tVolunteer::$volunteerInfo['delete_flag'] = 1;
    //         $tVolunteerAvailables::$volunteerInfo['volunteer_id'] = 1;
    //         $tVolunteerAvailables::$volunteerInfo['delete_flag'] = 1;
    //         $tVolunteerHistories::$volunteerInfo['volunteer_id'] = 1;
    //         $tVolunteerHistories::$volunteerInfo['delete_flag'] = 1;
    //         $tVolunteerLanguageProficiency::$volunteerInfo['volunteer_id'] = 1;
    //         $tVolunteerLanguageProficiency::$volunteerInfo['delete_flag'] = 1;
    //         $tVolunteerQualificationsHold::$volunteerInfo['volunteer_id'] = 1;
    //         $tVolunteerQualificationsHold::$volunteerInfo['delete_flag'] = 1;
    //         $tVolunteerSupportableDisability::$volunteerInfo['volunteer_id'] = 1;
    //         $tVolunteerSupportableDisability::$volunteerInfo['delete_flag'] = 1;

    //         $tVolunteer->updateVolunteers($tVolunteer::$volunteerInfo); //ボランティア情報を取得
    //         $tVolunteerAvailables->updateVolunteerAvailables($tVolunteerAvailables::$volunteerInfo); //ボランティアアベイラブル情報を取得
    //         $tVolunteerHistories->updateVolunteerHistories($tVolunteerHistories::$volunteerInfo); //ボランティア履歴情報を取得
    //         $tVolunteerLanguageProficiency->updateVolunteerLanguageProficiency($tVolunteerLanguageProficiency::$volunteerInfo); //ボランティア言語レベル情報を取得
    //         $tVolunteerQualificationsHold->updateVolunteerQualificationsHold($tVolunteerQualificationsHold::$volunteerInfo); //ボランティア保有資格情報を取得
    //         $tVolunteerSupportableDisability->updateVolunteerSupportableDisability($tVolunteerSupportableDisability::$volunteerInfo); //ボランティア支援可能障害タイプ情報を取得

    //         DB::commit();
    //     } catch (\Throwable $e) {
    //         //dd($e);
    //         // dd($request->all());
    //         //dd("stop");
    //         DB::rollBack();

    //         $result = "failed";
    //         return $result;
    //     }

    //     if ($result == "success") {
    //         $page_status = "完了しました";
    //         $page_url = route('my-page');
    //         $page_url_text = "マイページ";
    //         return view('change-notification', ['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
    //     }
    // }

    //ボランティア検索画面を開く
    // public function createSearch(
    //     M_sex $m_sex,
    //     M_countries $m_countries,
    //     M_prefectures $m_prefectures,
    //     M_languages $m_languages,
    //     M_language_proficiency $m_language_proficiency
    // ) {
    //     if (Auth::user()->temp_password_flag === 1) {
    //         return redirect('user/password-change');
    //     } else {
    //         $sex = $m_sex->getSexList();
    //         $countries = $m_countries->getCountries();
    //         $prefectures = $m_prefectures->getPrefecures();
    //         $languages =  $m_languages->getLanguages();
    //         $language_proficiency = $m_language_proficiency->getLanguageProficiency();

    //         return view('volunteer.search', [
    //             'm_sex' => $sex,
    //             'countries' => $countries,
    //             'prefectures' => $prefectures,
    //             'languages' => $languages,
    //             'language_proficiency' => $language_proficiency
    //         ]);
    //     }
    // }

    //条件に合うボランティアの検索結果を表示する
    public function searchVolunteers(Request $request, T_volunteers $t_volunteers)
    {
        Log::debug(sprintf("searchVolunteers start"));
        if (Auth::user()->temp_password_flag === 1) {
            // return redirect('user/password-change');
        } else {
            $searchInfo = $request->all();
            //参加しやすい曜日
            $pieces = str_split((string) $searchInfo['dayOfWeek']);

            $searchInfo['sunday'] = $pieces[0];
            $searchInfo['monday'] = $pieces[1];
            $searchInfo['tuesday'] = $pieces[2];
            $searchInfo['wednesday'] = $pieces[3];
            $searchInfo['thursday'] = $pieces[4];
            $searchInfo['friday'] = $pieces[5];
            $searchInfo['saturday'] = $pieces[6];
            $searchInfo['holiday'] = $pieces[7];
            $searchInfo['day_negotiable'] = $pieces[8];

            //参加可能時間帯
            $timeZoneList = str_split((string) $searchInfo['timeZone']);
            $searchInfo['early_morning'] = $timeZoneList[0];
            $searchInfo['morning'] = $timeZoneList[1];
            $searchInfo['afternoon'] = $timeZoneList[2];
            $searchInfo['night'] = $timeZoneList[3];
            $searchInfo['time_negotiable'] = $timeZoneList[4];

            //保有資格
            for ($i = 0; $i < count($searchInfo['qualHold']); $i++) {
                if ($searchInfo['qualHold'][$i]['id'] == 99) {
                    $searchInfo['qualifications' . ($i + 1)] = $searchInfo['qualHold'][$i]['id'];
                    $searchInfo['other_qualification'] = ""; //残件対象項目
                } else {
                    $searchInfo['qualifications' . ($i + 1)] = $searchInfo['qualHold'][$i]['id'];
                }
            }

            //言語レベル
            for ($i = 0; $i < count($searchInfo['lang']); $i++) {
                $searchInfo['language' . ($i + 1)] = $searchInfo['lang'][$i]['id'];
                $searchInfo['lang_pro' . ($i + 1)] = $searchInfo['lang'][$i]['levelId'];
            }

            //障碍タイプ
            for ($i = 0; $i < count($searchInfo['disType']); $i++) {
                $searchInfo[$searchInfo['disType'][$i]['name']] = 1;
            }

            //過去に参加した大会 //残件対象項目

            // Log::debug($searchInfo);
            $conditionValue = array();  //検索条件の値を格納する配列
            $supportableDisabilityCondition = $this->generateSupportableDisabilityCondition($searchInfo); //障碍タイプ
            $languageCondition = $this->generateLanguageCondition($searchInfo, $conditionValue); //言語レベル 
            $condition = $this->generateCondition($searchInfo, $conditionValue); //検索条件生成
            $langJoinType = "";
            if (
                isset($searchInfo['language1'])
                || isset($searchInfo['language2'])
                || isset($searchInfo['language3'])
            ) {
                $langJoinType = "join";
            } else {
                $langJoinType = "left join";
            }

            $SupportableDisabilityJoinType = "";
            if (
                isset($searchInfo['PR1'])
                || isset($searchInfo['PR2'])
                || isset($searchInfo['PR3'])
            ) {
                $SupportableDisabilityJoinType = "join";
            } else {
                $SupportableDisabilityJoinType = "left join";
            }
            Log::debug($searchInfo);
            $result = $t_volunteers->getVolunteersWithSearchCondition(
                $supportableDisabilityCondition,
                $languageCondition,
                $condition,
                $langJoinType,
                $SupportableDisabilityJoinType,
                $conditionValue
            );

            for ($i = 0; $i < count($result); $i++) {
                $dis_type_id = array();
                array_push($dis_type_id, $result[$i]->is_pr1);
                array_push($dis_type_id, $result[$i]->is_pr2);
                array_push($dis_type_id, $result[$i]->is_pr3);
                $result[$i]->dis_type_id = $dis_type_id;

                $language = array();
                array_push($language, $result[$i]->LANGUAGE_1);
                array_push($language, $result[$i]->LANGUAGE_2);
                array_push($language, $result[$i]->LANGUAGE_3);
                $result[$i]->language = $language;
            }

            Log::debug(sprintf("searchVolunteers end"));
            return response()->json(['result' => $result]); //DBの結果を返す
        }
    }

    //補助が可能な障碍タイプの条件を生成
    private function generateSupportableDisabilityCondition($searchInfo)
    {
        $condition = "";
        //PR1、PR2、PR3のいずれかがチェックされていたらhavingの条件を生成する
        if (
            isset($searchInfo['PR1'])
            || isset($searchInfo['PR2'])
            || isset($searchInfo['PR3'])
        ) {
            $condition .= "having 1=1\r\n";
            if (isset($searchInfo['PR1'])) {
                $condition .= "and instr(dis_type_id_array,1) > 0\r\n";
            }

            if (isset($searchInfo['PR2'])) {
                $condition .= "and instr(dis_type_id_array,2) > 0\r\n";
            }

            if (isset($searchInfo['PR3'])) {
                $condition .= "and instr(dis_type_id_array,3) > 0\r\n";
            }
        }
        return $condition;
    }

    //言語と言語レベルの検索条件を生成
    private function generateLanguageCondition($searchInfo, &$conditionValue)
    {
        $condition = "";
        $lang_max_count = 3;    //入力可能な言語条件の最大値は3
        if (
            isset($searchInfo['language1'])
            || isset($searchInfo['language2'])
            || isset($searchInfo['language3'])
        ) {
            $condition .= "and vol.volunteer_id in
                           (
                                select volunteer_id
                                FROM
                                (
                                    select volunteer_id
                            ";

            //言語と言語レベルの組み合わせに合致するor条件を生成
            for ($i = 1; $i <= $lang_max_count; $i++) {
                if (isset($searchInfo['language' . $i])) {
                    if (isset($searchInfo['lang_pro' . $i])) {
                        $condition .= ",count((lang_id = :lang_id" . $i . " and lang_pro >= :lang_pro" . $i . ") or null) as `lang" . $i . "`\r\n";
                        $conditionValue['lang_id' . $i] = $searchInfo['language' . $i];
                        $conditionValue['lang_pro' . $i] = $searchInfo['lang_pro' . $i];
                    } else {
                        $condition .= ",count(lang_id = :lang_id" . $i . " or null) as `lang" . $i . "`\r\n";
                        $conditionValue['lang_id' . $i] = $searchInfo['language' . $i];
                    }
                }
            }
            $condition .= "from t_volunteer_language_proficiency
                           group by volunteer_id
                            )vlp
                            where 1=1
                            ";

            //いずれかの言語を持っているかを判定するためのor条件を生成
            $is_add_andstr = false;
            for ($i = 1; $i <= $lang_max_count; $i++) {
                if (isset($searchInfo['language' . $i])) {
                    if (!$is_add_andstr) {
                        $condition .= "and (vlp.lang" . $i . " > 0\r\n";
                        $is_add_andstr = true;
                    } else {
                        $condition .= "or vlp.lang" . $i . " > 0\r\n";
                    }
                }
            }
            $condition .= ")\r\n";
            $condition .= ")\r\n";
        }
        return $condition;
    }

    //その他の検索条件を生成
    private function generateCondition($searchInfo, &$conditionValue)
    {
        $condition = "";
        //ボランティアID
        if (isset($searchInfo['volunteer_id'])) {
            $condition .= "and `t_volunteers`.`volunteer_id` = :volunteer_id\r\n";
            $conditionValue['volunteer_id'] = $searchInfo['volunteer_id'];
        }
        //ボランティア名
        if (isset($searchInfo['volunteer_name'])) {
            $condition .= "and `t_volunteers`.`volunteer_name` LIKE :volunteer_name\r\n";
            $conditionValue['volunteer_name'] = '%' . $searchInfo['volunteer_name'] . '%';
        }
        //生年月日
        if (isset($searchInfo['date_of_birth_start'])) {
            $condition .= "and `t_volunteers`.`date_of_birth` >= CAST(:date_of_birth_start as date)\r\n";
            $conditionValue['date_of_birth_start'] = $searchInfo['date_of_birth_start'];
        }
        if (isset($searchInfo['date_of_birth_end'])) {
            $condition .= "and `t_volunteers`.`date_of_birth` <= CAST(:date_of_birth_end as date)\r\n";
            $conditionValue['date_of_birth_end'] = $searchInfo['date_of_birth_end'];
        }
        //性別
        if (isset($searchInfo['sex'])) {
            $condition .= "and `t_volunteers`.`sex` = :sex\r\n";
            $conditionValue['sex'] = $searchInfo['sex'];
        }
        //居住地（国）
        if (isset($searchInfo['residence_country'])) {
            $condition .= "and `t_volunteers`.`residence_country` = :residence_country\r\n";
            $conditionValue['residence_country'] = $searchInfo['residence_country'];
        }
        //居住地（都道府県)
        if (isset($searchInfo['residence_prefecture'])) {
            $condition .= "and `t_volunteers`.`residence_prefecture` = :residence_prefecture\r\n";
            $conditionValue['residence_prefecture'] = $searchInfo['residence_prefecture'];
        }
        //資格情報
        if (
            isset($searchInfo['qualifications1'])
            || isset($searchInfo['qualifications2'])
            || isset($searchInfo['qualifications3'])
            || isset($searchInfo['qualifications4'])
            || isset($searchInfo['qualifications5'])
        ) {
            //資格入力可能最大数は5
            $qualifications_max = 5;
            //「その他」の資格ID
            $other_qualification_id = 99;
            $condition .= "and t_volunteers.volunteer_id in(
                            select volunteer_id
                            from
                            (
                                select tq.volunteer_id
                            ";

            for ($i = 1; $i <= $qualifications_max; $i++) {
                if (isset($searchInfo['qualifications' . $i])) {
                    //「その他」の資格のとき
                    if ($searchInfo['qualifications' . $i] == $other_qualification_id) {
                        $condition .= ",count((tq.qual_id = :qualifications" . $i . " and tq.others_qual = :other_qualification ) or null) as `qualifications" . $i . "`\r\n";
                        $conditionValue['qualifications' . $i] = $searchInfo['qualifications' . $i];
                        $conditionValue['other_qualification'] = $searchInfo['other_qualification'];
                    }
                    //「その他」ではない資格のとき
                    else {
                        $condition .= ",count(tq.qual_id = :qualifications" . $i . " or null) as `qualifications" . $i . "`\r\n";
                        $conditionValue['qualifications' . $i] = $searchInfo['qualifications' . $i];
                    }
                }
            }
            $condition .= "FROM t_volunteer_qualifications_hold tq
                           group by volunteer_id
                           )qual
                           where 1=1
                           ";

            //資格情報はor条件
            $is_add_andstr = false;
            for ($i = 1; $i <= $qualifications_max; $i++) {
                if (isset($searchInfo['qualifications' . $i])) {
                    if ($is_add_andstr) {
                        $condition .= "and (qual.`qualifications" . $i . "` > 0\r\n";
                        $is_add_andstr = true;
                    } else {
                        $condition .= "or qual.`qualifications" . $i . "` > 0\r\n";
                    }
                }
            }
            $condition .= ")\r\n";
            $condition .= ")\r\n";
        }
        //参加しやすい曜日
        //日曜日
        if ($searchInfo['sunday'] == '1') {
            $condition .= "and SUBSTRING(t_volunteer_availables.`day_of_week`,12,1) = '1'\r\n";
        }
        //月曜日
        if ($searchInfo['monday'] == '1') {
            $condition .= "and SUBSTRING(t_volunteer_availables.`day_of_week`,11,1) = '1'\r\n";
        }
        //火曜日
        if ($searchInfo['tuesday'] == '1') {
            $condition .= "and SUBSTRING(t_volunteer_availables.`day_of_week`,10,1) = '1'\r\n";
        }
        //水曜日
        if ($searchInfo['wednesday'] == '1') {
            $condition .= "and SUBSTRING(t_volunteer_availables.`day_of_week`,9,1) = '1'\r\n";
        }
        //木曜日
        if ($searchInfo['thursday'] == '1') {
            $condition .= "and SUBSTRING(t_volunteer_availables.`day_of_week`,8,1) = '1'\r\n";
        }
        //金曜日
        if ($searchInfo['friday'] == '1') {
            $condition .= "and SUBSTRING(t_volunteer_availables.`day_of_week`,7,1) = '1'\r\n";
        }
        //土曜日
        if ($searchInfo['saturday'] == '1') {
            $condition .= "and SUBSTRING(t_volunteer_availables.`day_of_week`,6,1) = '1'\r\n";
        }
        //祝日出勤可
        if ($searchInfo['holiday'] == '1') {
            $condition .= "and SUBSTRING(t_volunteer_availables.`day_of_week`,5,1) = '1'\r\n";
        }
        //相談可
        if ($searchInfo['day_negotiable'] == '1') {
            $condition .= "and SUBSTRING(t_volunteer_availables.`day_of_week`,4,1) = '1'\r\n";
        }
        //参加可能時間帯条件
        //早朝
        if ($searchInfo['early_morning'] == '1') {
            $condition .= "and SUBSTRING(t_volunteer_availables.`time_zone`,8,1) = '1'\r\n";
        }
        //午前
        if ($searchInfo['morning'] == '1') {
            $condition .= "and SUBSTRING(t_volunteer_availables.`time_zone`,7,1) = '1'\r\n";
        }
        //午後
        if ($searchInfo['afternoon'] == '1') {
            $condition .= "and SUBSTRING(t_volunteer_availables.`time_zone`,6,1) = '1'\r\n";
        }
        //夜
        if ($searchInfo['night'] == '1') {
            $condition .= "and SUBSTRING(t_volunteer_availables.`time_zone`,5,1) = '1'\r\n";
        }
        //相談可
        if ($searchInfo['time_negotiable'] == '1') {
            $condition .= "and SUBSTRING(t_volunteer_availables.`time_zone`,1,1) = '1'\r\n";
        }
        //過去に参加した大会
        if (isset($searchInfo['tournament1'])) {
            $condition .= "and t_tournaments.`tourn_name` LIKE :tournament1\r\n";
            $conditionValue['tournament1'] = "%" . $searchInfo['tournament1'] . "%";
        }
        if (isset($searchInfo['tournament2'])) {
            $condition .= "and t_tournaments.`tourn_name` LIKE :tournament2\r\n";
            $conditionValue['tournament2'] = "%" . $searchInfo['tournament2'] . "%";
        }
        if (isset($searchInfo['tournament3'])) {
            $condition .= "and t_tournaments.`tourn_name` LIKE :tournament3\r\n";
            $conditionValue['tournament3'] = "%" . $searchInfo['tournament3'] . "%";
        }
        return $condition;
    }

    //ボランティア情報を取得する
    public function getVolunteerResponse(Request $request, T_volunteers $t_volunteers)
    {
        $volunteerResponse = $t_volunteers->getVolunteerResponse($request); //ボランティアIDに基づいたボランティア情報を取得
        return response()->json(['result' => $volunteerResponse]); //DBの結果を返す
    }

    //ボランティア履歴情報を取得する
    public function VolunteerHistoriesResponse(Request $request, T_volunteer_histories $t_volunteer_histories)
    {
        $volunteerHistoriesResponse = $t_volunteer_histories->getVolunteerHistoriesResponse($request); //ボランティアIDに基づいたボランティア履歴情報を取得
        return response()->json(['result' => $volunteerHistoriesResponse]); //DBの結果を返す
    }

    //ボランティアCSV読み込み時 20240229 
    // public function sendVolunteerCsvData(Request $request)
    // {
    //     Log::debug(sprintf("sendVolunteerCsvData start"));
    //     $reqData = $request->all();
    //     Log::debug($reqData);
    //     Log::debug(sprintf("sendVolunteerCsvData end"));
    //     return response()->json(['result' => $reqData]); //DBの結果を返す
    // }

    // //ボランティアCSV登録時 20240229 
    // public function registerVolunteerCsvData(Request $request)
    // {
    //     Log::debug(sprintf("registerVolunteerCsvData start"));
    //     $reqData = $request->all();
    //     Log::debug($reqData);
    //     Log::debug(sprintf("registerVolunteerCsvData end"));
    //     return response()->json(['result' => $reqData]); //DBの結果を返す
    // }
}
