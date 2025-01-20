<?php

namespace App\Http\Controllers;

use App\Models\T_users;
use App\Models\T_volunteers;
use App\Models\M_sex;
use App\Models\M_countries;
use App\Models\M_prefectures;
use App\Models\M_clothes_size;
use App\Models\M_volunteer_qualifications;
use App\Models\M_languages;
use App\Models\M_language_proficiency;
use App\Models\T_volunteer_availables;
use App\Models\T_volunteer_language_proficiency;
use App\Models\T_volunteer_qualifications_hold;
use App\Models\T_volunteer_supportable_disability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class VolunteerInfoAlignmentController extends Controller
{
    //マスターのIDと一致する行を取得する
    private function getMachingMasterRow($target_key, $master, $target_column)
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

    //ボランティアCSV読み込み時 20240229 
    public function sendVolunteerCsvData(
        Request $request,
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
        //Log::debug($reqData);

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
                //性別            
                if (isset($rowData['sexId']['key']) && empty($rowData['sexId']['value'])) {
                    $sex_id = $rowData['sexId']['key'];
                    $target_sex_row = $this->getMachingMasterRow($sex_id, $sex_list, "sex_id");
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
                    $target_country_row = $this->getMachingMasterRow($country_id, $country_list, "country_id");
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
                    $target_prefecture_row = $this->getMachingMasterRow($prefecture_id, $prefecture_list, "pref_id");
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
                    $target_clothes_size_row = $this->getMachingMasterRow($clothes_size_id, $clothes_size_list, "clothes_size_id");
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
                        $target_qual_row = $this->getMachingMasterRow($qual_id, $qualifications_list, "qual_id");
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
                        $target_lang_row = $this->getMachingMasterRow($lang_id, $language_list, "lang_id");
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
                        $target_lang_pro_row = $this->getMachingMasterRow($lang_pro_id, $language_proficientcy_list, "lang_pro_id");
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
        //Log::debug($reqData);
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
                    Log::debug($addAuthority);
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
}
