<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

use App\Models\T_volunteers;
use App\Models\T_volunteer_availables;
use App\Models\T_volunteer_language_proficiency;
use App\Models\T_volunteer_qualifications_hold;
use App\Models\T_volunteer_supportable_disability;
use App\Models\T_users;
use App\Models\M_sex;
use App\Models\M_countries;
use App\Models\M_prefectures;
use App\Models\M_clothes_size;
use App\Models\M_volunteer_qualifications;
use App\Models\M_languages;
use App\Models\M_language_proficiency;

class VolunteerController extends Controller
{
    //ボランティア情報参照画面
    public function getVolunteerData(
        Request $request,
        T_volunteers $tVolunteer,
        T_volunteer_availables $tVolunteerAvailables,
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
        $volData = $tVolunteer->getVolunteers($requestData['volunteer_id']); //ボランティア情報を取得
        $volAvaData = $tVolunteerAvailables->getVolunteerAvailables($requestData['volunteer_id']); //ボランティアアベイラブル情報を取得
        $volLangProData = $tVolunteerLanguageProficiency->getVolunteerLanguageProficiency($requestData['volunteer_id']); //ボランティア言語レベル情報を取得
        $volQualData = $tVolunteerQualificationsHold->getVolunteerQualificationsHold($requestData['volunteer_id']); //ボランティア保有資格情報を取得
        $volSupDisData = $tVolunteerSupportableDisability->getVolunteerSupportableDisability($requestData['volunteer_id']); //ボランティア支援可能障害タイプ情報を取得

        Log::debug(sprintf("createReference end"));
        return response()->json([
            'result' => $volData,
            'volAvaData' => $volAvaData,
            'volLangProData' => $volLangProData,
            'volQualData' => $volQualData,
            'volSupDisData' => $volSupDisData
        ]); //DBの結果を返す
    }

    //条件に合うボランティアの検索結果を表示する
    public function searchVolunteers(Request $request, T_volunteers $t_volunteers)
    {
        Log::debug(sprintf("searchVolunteers start"));
        $searchInfo = $request->all();
        try {
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
            $searchInfo['time_negotiable'] = $timeZoneList[7];

            //保有資格
            for ($i = 0; $i < count($searchInfo['qualHold']); $i++) {
                if ($searchInfo['qualHold'][$i]['id'] == 99) {
                    $searchInfo['qualifications' . ($i + 1)] = $searchInfo['qualHold'][$i]['id'];
                    $searchInfo['other_qualification'] = $searchInfo['othersQual'];
                } else {
                    $searchInfo['qualifications' . ($i + 1)] = $searchInfo['qualHold'][$i]['id'];
                }
            }

            //言語レベル
            for ($i = 0; $i < count($searchInfo['lang']); $i++) {
                if (isset($searchInfo['lang'][$i]['id']) && $searchInfo['lang'][$i]['id'] != 0) {
                    $searchInfo['language' . ($i + 1)] = $searchInfo['lang'][$i]['id'];
                    if (isset($searchInfo['lang'][$i]['levelId'])) {
                        $searchInfo['lang_pro' . ($i + 1)] = $searchInfo['lang'][$i]['levelId'];
                    }
                }
            }

            //障碍タイプ
            for ($i = 0; $i < count($searchInfo['disType']); $i++) {
                $searchInfo[$searchInfo['disType'][$i]['name']] = 1;
            }

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
        } catch (\Throwable $e) {
            Log::error($e);
            abort(500, $e->getMessage());
        }
    }

    //ボランティア情報を取得する
    public function getVolunteerResponse(Request $request, T_volunteers $t_volunteers)
    {
        $volunteerResponse = $t_volunteers->getVolunteerResponse($request); //ボランティアIDに基づいたボランティア情報を取得
        return response()->json(['result' => $volunteerResponse]); //DBの結果を返す
    }

    //ボランティア削除 20240315
    public function deleteVolunteer(
        Request $request,
        T_volunteers $tVolunteer,
        T_volunteer_availables $tVolunteerAvailables,
        T_volunteer_language_proficiency $tVolunteerLanguageProficiency,
        T_volunteer_qualifications_hold $tVolunteerQualificationsHold,
        T_volunteer_supportable_disability $tVolunteerSupportableDisability,
        T_users $t_users
    ) {
        Log::debug(sprintf("deleteVolunteer start"));
        $reqData = $request->all();

        $volData = $tVolunteer->getVolunteers($reqData['volunteer_id']); //ボランティア情報を取得
        $volInfo = (array)$volData;

        //ログインユーザーに紐づいたボランティア情報の場合、削除処理を実行 20241203
        if ($volInfo['user_id'] != Auth::user()->user_id) {
            abort(403, '削除権限がありません。');
        }

        $volData = $tVolunteer->updateDeleteFlag($reqData['volunteer_id']); //ボランティア情報の更新
        $volAvaData = $tVolunteerAvailables->updateDeleteFlag($reqData['volunteer_id']); //ボランティアアベイラブル情報の更新
        $volLangProData = $tVolunteerLanguageProficiency->updateDeleteFlag($reqData['volunteer_id']); //ボランティア言語レベル情報の更新
        $volQualData = $tVolunteerQualificationsHold->updateDeleteFlag($reqData['volunteer_id']); //ボランティア保有資格情報の更新
        $volSupDisData = $tVolunteerSupportableDisability->updateDeleteFlag($reqData['volunteer_id']); //ボランティア支援可能障害タイプ情報の更新

        //ユーザ種別の更新
        $hoge = array();
        $hoge['user_id'] = Auth::user()->user_id;
        $hoge['input'] = '00000010'; //選手のユーザ種別を変更する
        $user_type = (string)Auth::user()->user_type;
        //右から2桁目が1のときだけユーザー種別を更新する
        if (substr($user_type, -2, 1) == '1') {
            $t_users->updateUserTypeDelete($hoge);
        }

        Log::debug(sprintf("deleteVolunteer end"));
        return response()->json(['result' => $reqData]); //DBの結果を返す
    }

    //ボランティアCSV読み込み時 20240229 
    public function sendVolunteerCsvData(
        Request $request,
        T_users $t_users,
        T_volunteers $t_volunteers,
        M_sex $m_sex,
        M_countries $m_countries,
        M_prefectures $m_prefectures,
        M_clothes_size $m_clothes_size,
        M_volunteer_qualifications $m_volunteer_qualifications,
        M_languages $m_languages,
        M_language_proficiency $m_language_proficiency
    ) {
        Log::debug(sprintf("sendVolunteerCsvData start"));
        $reqData = $request->all();

        //ボランティアの一覧を取得
        $volunteer_list = $t_volunteers->getVolunteer();
        //性別の一覧
        $sex_list = $m_sex->getSexList();
        //国の一覧
        $country_list = $m_countries->getCountries();
        //都道府県の一覧
        $prefecture_list = $m_prefectures->getPrefectures();
        //服のサイズ
        $clothes_size_list = $m_clothes_size->getClothesSize();
        //ボランティア保有資格の一覧
        $qualifications_list = $m_volunteer_qualifications->getQualifications();
        //言語の一覧
        $language_list = $m_languages->getLanguages();
        //言語レベルの一覧
        $language_proficientcy_list = $m_language_proficiency->getLanguageProficiency();

        try {
            for ($rowIndex = 0; $rowIndex < count($reqData); $rowIndex++) {
                $rowData = &$reqData[$rowIndex];
                //この時点で既に「連携不可」となっている場合はフォーマット不備の行のため、
                //次の行を処理する
                if ($rowData["result"] == "連携不可") {
                    continue;
                }
                //ユーザーID
                $user_list = $t_users->getUserDataFromUserId($rowData["userId"]["value"]);
                if (!isset($user_list) || empty($user_list)) {
                    $rowData["result"] = "登録不可データ";
                    $rowData["checked"] = false;
                    $rowData["userId"]["isError"] = true;
                }
                //性別            
                if (isset($rowData['sexId']['key']) && empty($rowData['sexId']['value'])) {
                    $sex_id = $rowData['sexId']['key'];
                    $target_sex_row = $this->getMatchingMasterRow($sex_id, $sex_list, "sex_id");
                    if (isset($target_sex_row->sex)) {
                        $rowData['sexId']['value'] = $target_sex_row->sex;
                    }
                    //検索で見つからなかったら入力値(ID)を表示してその項目をエラーとする
                    else {
                        $rowData["sexId"]["value"] = $rowData["sexId"]["key"];
                        $rowData["result"] = "登録不可データ";
                        $rowData["checked"] = false;
                        $rowData["sexId"]["isError"] = true;
                    }
                }
                //居住地（国）
                if (isset($rowData['residenceCountryId']['key']) && empty($rowData['residenceCountryId']['value'])) {
                    $country_id = $rowData['residenceCountryId']['key'];
                    $target_country_row = $this->getMatchingMasterRow($country_id, $country_list, "country_id");
                    if (isset($target_country_row->country_name)) {
                        $rowData['residenceCountryId']['value'] = $target_country_row->country_name;
                    }
                    //検索で見つからなかったら入力値を表示してその項目をエラーとする
                    else {
                        $rowData["residenceCountryId"]["value"] = $rowData["residenceCountryId"]["key"];
                        $rowData["result"] = "登録不可データ";
                        $rowData["checked"] = false;
                        $rowData["residenceCountryId"]["isError"] = true;
                    }
                }
                //居住地（都道府県）
                if (isset($rowData['residencePrefectureId']['key']) && $rowData['residenceCountryId']['key'] == 112 && empty($rowData['residencePrefectureId']['value'])) {
                    $prefecture_id = $rowData['residencePrefectureId']['key'];
                    $target_prefecture_row = $this->getMatchingMasterRow($prefecture_id, $prefecture_list, "pref_id");
                    if (isset($target_prefecture_row->pref_name)) {
                        $rowData['residencePrefectureId']['value'] = $target_prefecture_row->pref_name;
                    }
                    //検索で見つからなかったら入力値を表示してその項目をエラーとする
                    else {
                        $rowData["residencePrefectureId"]["value"] = $rowData["residencePrefectureId"]["key"];
                        $rowData["result"] = "登録不可データ";
                        $rowData["checked"] = false;
                        $rowData["residencePrefectureId"]["isError"] = true;
                    }
                }
                //服のサイズ
                if (isset($rowData['clothesSizeId']['key']) && empty($rowData['clothesSizeId']['value'])) {
                    $clothes_size_id = $rowData['clothesSizeId']['key'];
                    $target_clothes_size_row = $this->getMatchingMasterRow($clothes_size_id, $clothes_size_list, "clothes_size_id");
                    if (isset($target_clothes_size_row->clothes_size)) {
                        $rowData['clothesSizeId']['value'] = $target_clothes_size_row->clothes_size;
                    }
                    //検索で見つからなかったら入力値を表示してその項目をエラーとする
                    else {
                        $rowData["clothesSizeId"]["value"] = $rowData["clothesSizeId"]["key"];
                        $rowData["result"] = "登録不可データ";
                        $rowData["checked"] = false;
                        $rowData["clothesSizeId"]["isError"] = true;
                    }
                }
                //資格            
                $qual_max_index = 5;    //資格は最大5件入力可
                for ($i = 1; $i <= $qual_max_index; $i++) {
                    if (isset($rowData['qualId' . $i]['key']) && !isset($rowData["qualId" . $i]["value"])) {
                        $qual_id = $rowData['qualId' . $i]['key'];
                        $target_qual_row = $this->getMatchingMasterRow($qual_id, $qualifications_list, "qual_id");
                        if (isset($target_qual_row->qual_name)) {
                            $rowData['qualId' . $i]['value'] = $target_qual_row->qual_name;
                        }
                        //検索で見つからなかったら入力値を表示してその項目をエラーとする
                        else {
                            $rowData["qualId" . $i]["value"] = $rowData["qualId" . $i]["key"];
                            $rowData["result"] = "登録不可データ";
                            $rowData["checked"] = false;
                            $rowData["qualId" . $i]["isError"] = true;
                        }
                    }
                }
                //言語
                $lang_max_index = 3;    //言語は最大3件入力可
                for ($i = 1; $i <= $lang_max_index; $i++) {
                    if (isset($rowData['langId' . $i]['key']) && empty($rowData['langId' . $i]['value'])) {
                        $lang_id = $rowData['langId' . $i]['key'];
                        $target_lang_row = $this->getMatchingMasterRow($lang_id, $language_list, "lang_id");
                        if (isset($target_lang_row->lang_name)) {
                            $rowData['langId' . $i]['value'] = $target_lang_row->lang_name;
                        }
                        //検索で見つからなかったら入力値を表示してその項目をエラーとする
                        else {
                            $rowData["langId" . $i]["value"] = $rowData["langId" . $i]["key"];
                            $rowData["result"] = "登録不可データ";
                            $rowData["checked"] = false;
                            $rowData["langId" . $i]["isError"] = true;
                        }
                    }
                }
                //言語レベル
                $lang_pro_max_index = 3;    //言語は最大3件入力可
                for ($i = 1; $i <= $lang_pro_max_index; $i++) {
                    if (isset($rowData['langProId' . $i]['key']) && empty($rowData['langProId' . $i]['value'])) {
                        $lang_pro_id = $rowData['langProId' . $i]['key'];
                        $target_lang_pro_row = $this->getMatchingMasterRow($lang_pro_id, $language_proficientcy_list, "lang_pro_id");
                        if (isset($target_lang_pro_row->lang_pro_name)) {
                            $rowData['langProId' . $i]['value'] = $target_lang_pro_row->lang_pro_name;
                        }
                        //検索で見つからなかったら入力値を表示してその項目をエラーとする
                        else {
                            $rowData["langProId" . $i]["value"] = $rowData["langProId" . $i]["key"];
                            $rowData["result"] = "登録不可データ";
                            $rowData["checked"] = false;
                            $rowData["langProId" . $i]["isError"] = true;
                        }
                    }
                }
                //登録不可データでなければ重複チェックする
                if ($rowData["checked"]) {
                    //ユーザーIDの重複チェック
                    //「ボランティアテーブル」をファイルに記載されているユーザーIDで検索
                    $user_id = $rowData["userId"]["value"];
                    if (in_array($user_id, array_column($volunteer_list, 'user_id'))) {
                        $rowData["result"] = "重複データ";
                        $rowData["checked"] = false;
                        $rowData["userId"]["isError"] = true;
                    }
                }
            }
            Log::debug(sprintf("sendVolunteerCsvData end"));
            return response()->json(['result' => $reqData]); //DBの結果を返す
        } catch (\Throwable $e) {
            Log::error($e);
            abort(500, $e->getMessage());
        }
    }

    //ボランティアCSV登録時 20240229 
    public function registerVolunteerCsvData(
        Request $request,
        T_volunteers $t_volunteers,
        T_users $t_users,
        T_volunteer_availables $t_volunteer_availables,
        T_volunteer_qualifications_hold $t_volunteer_qualifications_hold,
        T_volunteer_language_proficiency $t_volunteer_language_proficiency,
        T_volunteer_supportable_disability $t_volunteer_supportable_disability
    ) {
        Log::debug(sprintf("registerVolunteerCsvData start"));
        $reqData = $request->all();
        //登録・更新するユーザー名を取得
        $register_user_id = Auth::user()->user_id;
        //登録・更新日時のために現在の日時を取得
        $current_datetime = now()->format('Y-m-d H:i:s.u');
        //削除フラグは全て0で登録する
        $delete_flag = 0;
        DB::beginTransaction();
        try {
            for ($rowIndex = 0; $rowIndex < count($reqData); $rowIndex++) {
                $rowData = $reqData[$rowIndex];
                $checked = $rowData["checked"];
                $result = $rowData["result"];
                if ($checked == true && $result == "登録可能データ") {
                    //ボランティアテーブルに挿入する要素を格納する配列
                    $volunteer_data = array();
                    //ボランティアアベイラブルテーブルに挿入する要素を格納する配列
                    $volunteer_available_data = array();
                    //ボランティア支援可能障碍タイプテーブルに挿入する要素を格納する配列
                    $volunteer_supportable_disability = array();
                    //ボランティア保有資格情報テーブルに挿入する要素を格納する配列
                    $volunteer_qualifications_hold_data = array();
                    //ボランティア言語レベルテーブルに挿入する要素を格納する配列
                    $volunteer_language_proficiency_data = array();

                    //Insertの要素を持つ配列を生成する
                    //ボランティアテーブル
                    $volunteer_data['user_id'] = $rowData['userId']['value'];
                    $volunteer_data['volunteer_name'] = $rowData['volunteerName']['value'];
                    $volunteer_data['residence_country'] = $rowData['residenceCountryId']['key'];
                    $volunteer_data['residence_prefecture'] = $rowData['residencePrefectureId']['key'];
                    $volunteer_data['sex'] = $rowData['sexId']['key'];
                    $volunteer_data['date_of_birth'] = $rowData['dateOfBirth']['value'];
                    $volunteer_data['telephone_number'] = $rowData['telephoneNumber']['value'];
                    $volunteer_data['mailaddress'] = $rowData['mailaddress']['value'];
                    //users_email_flagを判定する
                    $target_id = $rowData['userId']['value'];
                    $user_list = $t_users->getUserDataFromUserId($target_id);
                    $mailaddress = $rowData['mailaddress']['value'];
                    $user_mailaddress = $user_list[0]->{'mailaddress'};
                    if ($mailaddress == $user_mailaddress) {
                        $volunteer_data['users_email_flag'] = 1;
                    } else {
                        $volunteer_data['users_email_flag'] = 0;
                    }
                    //服のサイズマスターで名前で検索したclothes_size_idを取得して、配列に格納する
                    $volunteer_data['clothes_size'] = $rowData['clothesSizeId']['key'];
                    $volunteer_data['registered_time'] = $current_datetime;
                    $volunteer_data['registered_user_id'] = $register_user_id;
                    $volunteer_data['updated_time'] = $current_datetime;
                    $volunteer_data['updated_user_id'] = $register_user_id;
                    $volunteer_data['delete_flag'] = $delete_flag;
                    $volunteer_id = $t_volunteers->insertVolunteer($volunteer_data);

                    //ボランティアアベイラブルテーブル
                    $volunteer_available_data['volunteer_id'] = $volunteer_id;
                    //day_of_weekを生成する
                    $sunday = $rowData['dayOfWeek1']['value'] == '◯' ? '1' : '0';
                    $monday = $rowData['dayOfWeek2']['value'] == '◯' ? '1' : '0';
                    $tuesday = $rowData['dayOfWeek3']['value'] == '◯' ? '1' : '0';
                    $wednesday = $rowData['dayOfWeek4']['value'] == '◯' ? '1' : '0';
                    $thursday = $rowData['dayOfWeek5']['value'] == '◯' ? '1' : '0';
                    $friday = $rowData['dayOfWeek6']['value'] == '◯' ? '1' : '0';
                    $saturday = $rowData['dayOfWeek7']['value'] == '◯' ? '1' : '0';
                    $day_of_week = '00000' . $saturday . $friday . $thursday . $wednesday . $tuesday . $monday . $sunday;
                    $volunteer_available_data['day_of_week'] = $day_of_week;
                    //time_zoneを生成する
                    $early_morning = $rowData['timeZone1']['value'] == '◯' ? '1' : '0';
                    $morning = $rowData['timeZone2']['value'] == '◯' ? '1' : '0';
                    $afternoon = $rowData['timeZone3']['value'] == '◯' ? '1' : '0';
                    $night = $rowData['timeZone4']['value'] == '◯' ? '1' : '0';
                    $time_zone = '0000' . $early_morning . $morning . $afternoon . $night;
                    $volunteer_available_data['time_zone'] = $time_zone;
                    $volunteer_available_data['registered_time'] = $current_datetime;
                    $volunteer_available_data['registered_user_id'] = $register_user_id;
                    $volunteer_available_data['updated_time'] = $current_datetime;
                    $volunteer_available_data['updated_user_id'] = $register_user_id;
                    $volunteer_available_data['delete_flag'] = $delete_flag;
                    $t_volunteer_availables->insertVolunteerAvailables($volunteer_available_data);

                    //ボランティア支援可能障碍タイプテーブル                        
                    $volunteer_supportable_disability['volunteer_id'] = $volunteer_id;
                    $volunteer_supportable_disability['registered_time'] = $current_datetime;
                    $volunteer_supportable_disability['registered_user_id'] = $register_user_id;
                    $volunteer_supportable_disability['updated_time'] = $current_datetime;
                    $volunteer_supportable_disability['updated_user_id'] = $register_user_id;
                    $volunteer_supportable_disability['delete_flag'] = $delete_flag;
                    //PR1が1なら挿入
                    if ($rowData['disTypeId1']['value'] == '◯') {
                        $volunteer_supportable_disability['dis_type_id'] = 1;
                        $t_volunteer_supportable_disability->insertVolunteerSupportableDisability($volunteer_supportable_disability);
                    }
                    //PR2が1なら挿入
                    if ($rowData['disTypeId2']['value'] == '◯') {
                        $volunteer_supportable_disability['dis_type_id'] = 2;
                        $t_volunteer_supportable_disability->insertVolunteerSupportableDisability($volunteer_supportable_disability);
                    }
                    //PR3が1なら挿入
                    if ($rowData['disTypeId3']['value'] == '◯') {
                        $volunteer_supportable_disability['dis_type_id'] = 3;
                        $t_volunteer_supportable_disability->insertVolunteerSupportableDisability($volunteer_supportable_disability);
                    }

                    //ボランティア保有資格情報テーブルに挿入
                    $max_qual_count = 5;
                    $volunteer_qualifications_hold_data['volunteer_id'] = $volunteer_id;
                    $volunteer_qualifications_hold_data['registered_time'] = $current_datetime;
                    $volunteer_qualifications_hold_data['registered_user_id'] = $register_user_id;
                    $volunteer_qualifications_hold_data['updated_time'] = $current_datetime;
                    $volunteer_qualifications_hold_data['updated_user_id'] = $register_user_id;
                    $volunteer_qualifications_hold_data['delete_flag'] = $delete_flag;
                    for ($qualIndex = 1; $qualIndex <= $max_qual_count; $qualIndex++) {
                        if (isset($rowData['qualId' . $qualIndex]['value'])) {
                            //資格の数だけInsertを実行
                            $volunteer_qualifications_hold_data['qual_id'] = $rowData['qualId' . $qualIndex]['key'];
                            $t_volunteer_qualifications_hold->insertVolunteerQualificationsHold($volunteer_qualifications_hold_data);
                        }
                    }

                    //ボランティア言語レベルテーブルに挿入
                    $max_language_count = 3;
                    $volunteer_language_proficiency_data['volunteer_id'] = $volunteer_id;
                    $volunteer_language_proficiency_data['registered_time'] = $current_datetime;
                    $volunteer_language_proficiency_data['registered_user_id'] = $register_user_id;
                    $volunteer_language_proficiency_data['updated_time'] = $current_datetime;
                    $volunteer_language_proficiency_data['updated_user_id'] = $register_user_id;
                    $volunteer_language_proficiency_data['delete_flag'] = $delete_flag;
                    for ($langIndex = 1; $langIndex <= $max_language_count; $langIndex++) {
                        if (
                            isset($rowData['langId' . $langIndex]['key'])
                            && isset($rowData['langProId' . $langIndex]['key'])
                        ) {
                            $volunteer_language_proficiency_data['lang_id'] = $rowData['langId' . $langIndex]['key'];
                            $volunteer_language_proficiency_data['lang_pro'] = $rowData['langProId' . $langIndex]['key'];
                            $t_volunteer_language_proficiency->insertVolunteerLanguageProficiency($volunteer_language_proficiency_data);
                        }
                    }

                    //ユーザー種別の更新 20240525
                    $addAuthority = array();
                    $addAuthority['user_id'] = $volunteer_data['user_id']; //ボランティア情報を連携させたいユーザーのユーザーID
                    $addAuthority['input'] = '10'; //ボランティアのユーザ種別を変更する
                    $user_type = (string)$user_list[0]->{'user_type'};
                    //右から2桁目が0のときだけユーザー種別を更新する (該当ユーザーのボランティアフラグが0だった場合)
                    if (substr($user_type, -2, 1) == '0') {
                        $t_users->updateUserTypeRegist($addAuthority);
                    }

                    DB::commit();
                }
            }
            Log::debug(sprintf("registerVolunteerCsvData end"));
            return response()->json(['result' => true]); //DBの結果を返す
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e);
            abort(500, $e->getMessage());
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
        Log::debug("generateLanguageCondition start.");
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
        Log::debug("generateLanguageCondition end.");
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
                        $condition .= ",count((tq.qual_id = :qualifications" . $i . " and tq.others_qual LIKE :other_qualification ) or null) as `qualifications" . $i . "`\r\n";
                        $conditionValue['qualifications' . $i] = $searchInfo['qualifications' . $i];
                        $conditionValue['other_qualification'] = "%" . $searchInfo['othersQual'] . "%";
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
                    if (!$is_add_andstr) {
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
        return $condition;
    }

    //マスターのIDと一致する行を取得する
    private function getMatchingMasterRow($target_key, $master, $target_column)
    {
        $keyIndex = array_search($target_key, array_column($master, $target_column));
        //マスターから取得できない場合はfalseが返る
        //インデックスが0の場合と区別したい
        if ($keyIndex === false) {
            $result = null;
        } else {
            $result = $master[$keyIndex];
        }
        return $result;
    }
}
