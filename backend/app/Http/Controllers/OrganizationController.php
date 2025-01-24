<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

use App\Models\T_organizations;
use App\Models\T_organization_staff;
use App\Models\T_users;
use App\Models\T_tournaments;
use App\Models\T_organization_players;
use App\Models\T_raceResultRecord;

class OrganizationController extends Controller
{
    //団体検索を実行
    public function searchOrganization(Request $request, T_organizations $tOrganizations)
    {
        Log::debug(sprintf("searchOrganization start"));
        $searchInfo = $request->all();
        Log::debug($searchInfo);
        $searchValue = [];
        $searchCondition = $this->generateOrganizationSearchCondition($searchInfo, $searchValue);
        $organizations = $tOrganizations->getOrganizationWithSearchCondition($searchCondition, $searchValue);
        // dd($organizations);
        Log::debug(sprintf("searchOrganization end"));
        return response()->json(['result' => $organizations]); //送信データ(debug用)とDBの結果を返す
    }

    //react 団体登録画面からDBにデータを渡す 20240209
    public function getOrgData(Request $request, T_organizations $tOrganizations)
    {
        Log::debug(sprintf("getOrgData start"));
        $result = $request->all();
        Log::debug($result);
        $tOrg = $tOrganizations->getOrganization($result['org_id']);
        Log::debug(sprintf("getOrgData end"));
        return response()->json(['result' => $tOrg]); //DBの結果を返す
    }

    //react 団体登録確認画面からDBにデータを渡してInsertを実行する 20240209
    public function storeOrgData(Request $request, T_organizations $tOrganizations, T_organization_staff $tOrganizationStaff, T_users $t_users)
    {
        Log::debug(sprintf("storeOrgData start"));
        $lastInsertId = "";
        $organizationInfo = $request->all();
        Log::debug($organizationInfo);
        //郵便番号に「-(ハイフン)」が含まれていると、
        //DBのテーブルの設定が7文字固定であることから登録データの下一桁が欠落するため削除しておく
        $post_code = $organizationInfo['formData']['post_code'];
        $organizationInfo['formData']['post_code'] = str_replace("-", "", $post_code);
        //location_countryが入力されていなかったら、日本＝112を固定値として追加する
        if (empty($organizationInfo['formData']['location_country'])) {
            //所在地（国）がnullなら、location_country=112を配列に追加する
            $japan_code = 112;
            $organizationInfo['formData']['location_country'] = $japan_code;
        }

        //登録前にバリデーションチェックを行う 20240527
        $formData = $organizationInfo['formData'];
        $duplicationCount = 0;
        //団体IDがnullでエントリーシステムの団体IDが入力されている場合、登録時の重複チェックを行う
        if (!isset($formData['org_id']) && isset($formData['entrysystem_org_id'])) {
            // Log::debug("call getEntrysystemOrgIdCount");
            $duplicationCount = $tOrganizations->getEntrysystemOrgIdCount($formData['entrysystem_org_id']);
        }
        if ($duplicationCount > 0) {
            // Log::debug(sprintf("validateOrgData duplication"));
            return response()->json(['duplicationError' => "エントリーシステムの団体IDが重複しています。"]);
        }

        DB::beginTransaction();
        try {
            //Log::debug("=========================");
            //確認画面から登録
            $lastInsertId = $tOrganizations->insertOrganization($organizationInfo);
            //新しく入力されたスタッフをInsertする
            $replace_string = $this->generateInsertStaffValues($organizationInfo, $lastInsertId);
            $tOrganizationStaff->insertOrganizationStaff($replace_string, $lastInsertId);

            //ユーザー種別の団体管理者を更新
            $t_users->updateOrganizationManagerFlagAllUser();
            $t_users->updateDeleteOrganizationManagerFlagAllUser();

            DB::commit();
            Log::debug(sprintf("storeOrgData end"));
            return response()->json(['result' => $lastInsertId]); //DBの結果を返す
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, "団体登録に失敗しました。");
        }
    }

    //react 団体登録画面からDBにデータを渡す 20240209
    public function updateOrgData(Request $request, T_organizations $tOrganizations, T_organization_staff $tOrganizationStaff, T_users $t_users)
    {
        Log::debug(sprintf("updateOrgData start"));

        $organizationInfo = $request->all();
        Log::debug($organizationInfo);
        $target_org_id = $organizationInfo['formData']['org_id'];   //更新対象の団体ID
        //郵便番号に「-(ハイフン)」が含まれていると、
        //DBのテーブルの設定が7文字固定であることから登録データの下一桁が欠落するため削除しておく
        $post_code = $organizationInfo['formData']['post_code'];
        $organizationInfo['formData']['post_code'] = str_replace("-", "", $post_code);
        //location_countryが入力されていなかったら、日本＝112を固定値として追加する
        if (empty($organizationInfo['formData']['location_country'])) {
            //所在地（国）がnullなら、location_country=112を配列に追加する
            $japan_code = 112;
            $organizationInfo['formData']['location_country'] = $japan_code;
        }

        //更新前にバリデーションチェックを行う 20240527
        $formData = $organizationInfo['formData'];
        $errorCount = 0;
        //団体IDとエントリーシステムの団体IDが入力されている場合、更新時の重複チェックを行う
        if (isset($formData['org_id']) && isset($formData['entrysystem_org_id'])) {
            // Log::debug("call getEntrysystemOrgIdCountWithOrgId");
            $errorCount = $tOrganizations->getEntrysystemOrgIdCountWithOrgId($formData['entrysystem_org_id'], $formData['org_id']);
            if ($errorCount > 0) {
                return response()->json(['errorMessage' => "エントリーシステムの団体IDが重複しています。"]);
            }
        }
        //更新前に団体が削除されていないかを確認する 20240527
        if (isset($formData['org_id'])) {
            $errorCount = $tOrganizations->orgDataDeleteCheck($formData['org_id']);
            if ($errorCount > 0) {
                return response()->json(['errorMessage' => "他のユーザーにより団体情報が削除されています。情報の更新ができません。"]);
            }
        }


        DB::beginTransaction();
        try {
            $tOrganizations::$tournamentUpdateInfo['org_id'] = $target_org_id; //団体ID
            $tOrganizations::$tournamentUpdateInfo['entrysystem_org_id'] = $organizationInfo['formData']['entrysystem_org_id']; //エントリーシステムの団体ID
            $tOrganizations::$tournamentUpdateInfo['org_name'] = $organizationInfo['formData']['org_name']; //団体名
            $tOrganizations::$tournamentUpdateInfo['jara_org_type'] = $organizationInfo['formData']['jara_org_type']; //JARA団体種別
            $tOrganizations::$tournamentUpdateInfo['jara_org_reg_trail'] = $organizationInfo['formData']['jara_org_reg_trail']; //JARA団体証跡
            $tOrganizations::$tournamentUpdateInfo['pref_org_type'] = $organizationInfo['formData']['pref_org_type']; //県ボ団体種別
            $tOrganizations::$tournamentUpdateInfo['pref_org_reg_trail'] = $organizationInfo['formData']['pref_org_reg_trail']; //県ボ団体証跡
            $tOrganizations::$tournamentUpdateInfo['org_class'] = $organizationInfo['formData']['org_class']; //団体区分
            $tOrganizations::$tournamentUpdateInfo['founding_year'] = $organizationInfo['formData']['founding_year']; //創立年
            $tOrganizations::$tournamentUpdateInfo['location_country'] = $organizationInfo['formData']['location_country']; //所在地　国
            $tOrganizations::$tournamentUpdateInfo['location_prefecture'] = $organizationInfo['formData']['location_prefecture']; //所在地　都道府県
            $tOrganizations::$tournamentUpdateInfo['post_code'] = $organizationInfo['formData']['post_code']; //郵便番号
            $tOrganizations::$tournamentUpdateInfo['address1'] = $organizationInfo['formData']['address1']; //住所1
            $tOrganizations::$tournamentUpdateInfo['address2'] = $organizationInfo['formData']['address2']; //住所2
            $tOrganizations::$tournamentUpdateInfo['updated_time'] = now()->format('Y-m-d H:i:s.u'); //更新日時
            $tOrganizations::$tournamentUpdateInfo['updated_user_id'] = Auth::user()->user_id; //更新ユーザID

            $tOrganizations->updateOrganization($tOrganizations::$tournamentUpdateInfo);

            //スタッフの更新 20240318
            //前のスタッフをupdateする
            $updateCondition = $this->generateUpdateStaffCondition($organizationInfo);
            if (!empty($updateCondition)) {
                $tOrganizationStaff->updateDeleteFlagInOrganizationStaff($updateCondition, $target_org_id);
            }
            //新しく入力されたスタッフをInsertする
            $replace_string = $this->generateInsertStaffValues($organizationInfo, $organizationInfo['formData']['org_id']);
            $tOrganizationStaff->insertOrganizationStaff($replace_string, $target_org_id);

            //削除のチェックボックスにチェックしたユーザーを団体所属スタッフテーブルから削除する
            foreach ($organizationInfo['staffList'] as $staff) {
                if ($staff['delete_flag']) {
                    $target_user_id = $staff['user_id'];
                    $tOrganizationStaff->updateDeleteFlagByUserDeletion($target_user_id, $target_org_id);
                }
            }

            //ユーザー種別の団体管理者を更新
            $t_users->updateOrganizationManagerFlagAllUser();
            $t_users->updateDeleteOrganizationManagerFlagAllUser();

            DB::commit();
            Log::debug(sprintf("updateOrgData end"));
            return response()->json(['result' => true]); //DBの結果を返す
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, "団体更新に失敗しました。");
        }
    }

    //userIDに紐づいたデータを送信 20240131
    public function getOrganizationForOrgManagement(T_organizations $tOrganization)
    {
        Log::debug(sprintf("getOrganizationForOrgManagement start"));
        //団体情報を取得 20231215 t_futamura
        $targetOrgId = Auth::user()->user_id;
        //$tOrg = $tOrganization->getOrganizationForOrgManagement($targetOrgId); //userIDに紐づいた団体を取得するように修正する必要がある 二村さん残件対応箇所
        $tOrg = $tOrganization->getManagementOrganizations($targetOrgId);
        Log::debug(sprintf("getOrganizationForOrgManagement end"));
        return response()->json(['result' => $tOrg]); //DBの結果を返す
    }

    //団体情報を取得
    public function getOrganizationListData(T_organizations $tOrganization)
    {
        Log::debug(sprintf("getOrganizationListData start"));
        $tOrg = $tOrganization->getAllOrganizations(); //すべての団体リストを取得 20240410
        Log::debug(sprintf("getOrganizationListData end"));
        return response()->json(['result' => $tOrg]); //DBの結果を返す
    }

    //userIDに紐づいたデータを送信 20240131
    public function getOrgStaffData(Request $request, T_organization_staff $tOrganizationStaff)
    {
        Log::debug(sprintf("getOrgStaffData start"));
        $result = $request->all();
        $is_error = false;
        $tOrg = $tOrganizationStaff->getOrganizationStaffFromOrgId($result['org_id']); //userIDに紐づいた団体を取得するように修正する必要がある 二村さん残件対応箇所
        for ($i = 0; $i < count($tOrg); $i++) {
            $staff_type_id = array();
            if ($tOrg[$i]->is_director == 1) {
                array_push($staff_type_id, "監督");
            }
            if ($tOrg[$i]->is_head == 1) {
                array_push($staff_type_id, "部長");
            }
            if ($tOrg[$i]->is_coach == 1) {
                array_push($staff_type_id, "コーチ");
            }
            if ($tOrg[$i]->is_manager == 1) {
                array_push($staff_type_id, "マネージャー");
            }
            if ($tOrg[$i]->is_acting_director == 1) {
                array_push($staff_type_id, "管理代理");
            }
            $tOrg[$i]->staff_type_id = $staff_type_id;
            $tOrg[$i]->isUserFound = true;
            $tOrg[$i]->delete_flag = false;
            $tOrg[$i]->id = ($i + 1);
            if (!$tOrg[$i]->enable) {
                $tOrg[$i]->delete_flag = true;
                $is_error = true;
            }
            $tOrg[$i]->coachQualificationNames = explode(",", $tOrg[$i]->coachQualificationNames);
            $tOrg[$i]->refereeQualificationNames = explode(",", $tOrg[$i]->refereeQualificationNames);
        }
        Log::debug(sprintf("getOrgStaffData end"));
        //Log::debug($tOrg);

        if ($is_error) {
            //エラーがあった場合
            return response()->json(['result' => $tOrg, $is_error => true]); //DBの結果を返す
        } else {
            //エラーがなかった場合
            return response()->json(['result' => $tOrg, $is_error => false]); //DBの結果を返す
        }
    }

    //エントリー大会取得
    public function getEntryTournamentsViewForTeamRef(
        Request $request,
        T_tournaments $tTournaments,
        T_raceResultRecord $tRaceResultRecord
    ) {
        Log::debug(sprintf("getEntryTournamentsViewForTeamRef start"));
        $targetOrgId = $request->all();
        Log::debug($targetOrgId);
        //出漕結果記録情報を取得
        $tournamentIds = $tRaceResultRecord->getTournamentIdForResultsRecord($targetOrgId);
        //エントリー大会情報取得のための条件文を生成する
        $tournamentIdColumnName = 'tourn_id';
        $tournamentsIdCondition = $this->generateIdCondition($tournamentIds, $tournamentIdColumnName);
        //エントリー大会情報を取得
        $entryTournaments = [];
        if (!empty($tournamentsIdCondition)) {
            $entryTournaments = $tTournaments->getEntryTournaments($tournamentsIdCondition);
        }

        Log::debug(sprintf("getEntryTournamentsViewForTeamRef end"));
        return response()->json(['result' => $entryTournaments]); //DBの結果を返す
    }

    //団体削除 20240307
    public function deleteOrgData(
        Request $request,
        T_organization_staff $t_organization_staff,
        T_organization_players $t_organization_players,
        T_organizations $t_organizations,
        T_users $t_users
    ) {
        Log::debug(sprintf("deleteOrgData start"));
        $organizationInfo = $request->all();
        //Log::debug($organizationInfo);
        DB::beginTransaction();
        try {
            $org_id = $organizationInfo['org_id'];
            //Log::debug("org_id = ".$org_id);

            //団体所属スタッフを削除
            $t_organization_staff->updateDeleteFlagByOrganizationDeletion($org_id);
            //団体所属選手を削除
            $t_organization_players->updateDeleteFlagByOrganizationDeletion($org_id);
            // //団体を削除
            $t_organizations->updateDeleteFlag($org_id);

            //ユーザー種別の団体管理者を更新
            //$t_users->updateOrganizationManagerFlagAllUser();
            $t_users->updateDeleteOrganizationManagerFlagAllUser();

            DB::commit();
            Log::debug(sprintf("deleteOrgData end"));
            return response()->json(['result' => true]); //DBの結果を返す
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, "団体削除に失敗しました。"); //DBの結果を返す
        }
    }

    //団体のバリデーションチェック 20240307
    public function validateOrgData(Request $request,  T_organizations $tOrganizations, T_users $t_users)
    {
        Log::debug(sprintf("validateOrgData start"));
        $reqData = $request->all();
        //Log::debug($reqData);
        //Log::debug($reqData['formData']['entrysystem_org_id']);
        $formData = $reqData['formData'];
        $staff_list = &$reqData['staffList'];

        $duplicationCount = 0;
        //団体IDがnullでエントリーシステムの団体IDが入力されている場合、登録時の重複チェックを行う
        if (!isset($formData['org_id']) && isset($formData['entrysystem_org_id'])) {
            // Log::debug("call getEntrysystemOrgIdCount");
            $duplicationCount = $tOrganizations->getEntrysystemOrgIdCount($formData['entrysystem_org_id']);
        }
        //団体IDとエントリーシステムの団体IDが入力されている場合、更新時の重複チェックを行う
        if (isset($formData['org_id']) && isset($formData['entrysystem_org_id'])) {
            // Log::debug("call getEntrysystemOrgIdCountWithOrgId");
            $duplicationCount = $tOrganizations->getEntrysystemOrgIdCountWithOrgId($formData['entrysystem_org_id'], $formData['org_id']);
        }

        if ($duplicationCount > 0) {
            // Log::debug(sprintf("validateOrgData duplication"));
            abort(400, "エントリーシステムの団体IDが重複しています。");
        }

        //スタッフのユーザーID重複チェック
        $user_ids = array_column($staff_list, 'user_id');
        $duplicates = array_unique(array_diff_assoc($user_ids, array_unique($user_ids)));
        if (!empty($duplicates)) {
            abort(400, "重複して登録されているユーザーが有ります。ユーザーID：" . implode(', ', $duplicates));
        }

        //スタッフのuser_idが有効かチェックする
        //user_idを判定してenableに結果を格納する      
        $this->checkUserIdIsValid($staff_list, $t_users);
        //有効なユーザーかをチェック
        //staffListを確認し、enableが0のuser_idを抽出
        $disable_staffs_ids = array_column(array_filter($staff_list, function ($item) {
            return isset($item['enable']) && $item['enable'] == 0 && $item['delete_flag'] == false;
        }), 'user_id');
        if (!empty($disable_staffs_ids)) {
            abort(400, "本システムに本登録されていないユーザー登録されていないユーザーが含まれています。ユーザーID：" . implode(', ', $disable_staffs_ids));
        }

        //スタッフの入力が100件以下のチェック
        $enable_staff_count = 0;
        foreach ($staff_list as $staff) {
            if (!$staff['delete_flag']) {
                $enable_staff_count++;
            }
            if ($enable_staff_count > 100) {
                break;
            }
        }
        if ($enable_staff_count > 100) {
            abort(400, "登録できるスタッフの人数が、100名を超えています。1団体に登録できるスタッフ数は、100名までです。");
        }

        $non_deleted_staffs = array_filter($staff_list, fn($staff) => !$staff['delete_flag']);
        if (count($non_deleted_staffs) === 0) {
            abort(400, "1人以上のスタッフ登録が必要です。");
        }

        Log::debug(sprintf("validateOrgData end"));
        return response()->json(['result' => $reqData]); //DBの結果を返す
    }

    //団体所属スタッフテーブルを更新するための条件文を生成する
    private function generateUpdateStaffCondition($organizationInfo)
    {
        $condition = "";
        $staffList = $organizationInfo['staffList'];
        foreach ($staffList as $staff) {
            //団体IDを持つ、かつ削除フラグが立っていないとき
            // = 新規スタッフでない、かつ削除対象ではないスタッフに対して処理する
            if (isset($staff['org_id']) && !$staff['delete_flag']) {
                //監督にチェックが入っていない
                if ($staff['is_director'] == 0) {
                    $condition .= " or ( `user_id`= " . $staff['id'] . " and `staff_type_id`= 1)\r\n";
                }
                //部長にチェックが入っていない
                if ($staff['is_head'] == 0) {
                    $condition .= " or ( `user_id`= " . $staff['id'] . " and `staff_type_id`= 2)\r\n";
                }
                //コーチにチェックが入っていない
                if ($staff['is_coach'] == 0) {
                    $condition .= " or ( `user_id`= " . $staff['id'] . " and `staff_type_id`= 3)\r\n";
                }
                //マネージャーにチェックが入っていない
                if ($staff['is_manager'] == 0) {
                    $condition .= " or ( `user_id`= " . $staff['id'] . " and `staff_type_id`= 4)\r\n";
                }
                //管理代理にチェックが入っていない
                if ($staff['is_acting_director'] == 0) {
                    $condition .= " or ( `user_id`= " . $staff['id'] . " and `staff_type_id`= 5)\r\n";
                }
            }
            //削除フラグが立っているときは別途処理
        }
        $condition = ltrim($condition, " or ");
        return $condition;
    }

    //団体所属スタッフテーブルに挿入するValueを生成する
    //置き換える文字列は値を含めたものにする
    private function generateInsertStaffValues($organizationInfo, $org_id)
    {
        $currentDatetime = now()->format('Y-m-d H:i:s.u');
        $replace_string = "";
        //スタッフごとの処理
        foreach ($organizationInfo['staffList'] as $rowData) {
            //if (isset($rowData['user_id']) && isset($rowData['user_name'])) {
            if (!$rowData['delete_flag']) {
                for ($staff_array_index = 0; $staff_array_index < count($rowData['staff_type_id']); $staff_array_index++) {
                    //置き換える文字列を生成
                    $replace_string .= "union select " . $org_id . " AS `org_id`,\r\n";
                    $replace_string .= $rowData['user_id'] . " AS `user_id`,\r\n";
                    //スタッフ種別は取得したデータの文字列を判定する
                    switch ($rowData['staff_type_id'][$staff_array_index]) {
                        case '監督':
                            $replace_string .= "1 AS `staff_type_id`,\r\n";
                            break;
                        case '部長':
                            $replace_string .= "2 AS `staff_type_id`,\r\n";
                            break;
                        case 'コーチ':
                            $replace_string .= "3 AS `staff_type_id`,\r\n";
                            break;
                        case 'マネージャー':
                            $replace_string .= "4 AS `staff_type_id`,\r\n";
                            break;
                        case '管理代理':
                            $replace_string .= "5 AS `staff_type_id`,\r\n";
                            break;
                        default:
                            $replace_string .= "NULL AS `staff_type_id`,\r\n";
                    }
                    $replace_string .= "'" . $currentDatetime . "' AS `registered_time`,\r\n";
                    $replace_string .= Auth::user()->user_id . " AS `registered_user_id`,\r\n";
                    $replace_string .= "'" . $currentDatetime . "' AS `updated_time`,\r\n";
                    $replace_string .= Auth::user()->user_id . " AS `updated_user_id`,\r\n";
                    $replace_string .= "0 AS `delete_flag`\r\n";
                }
            }
        }
        //置き換えるときselectに続くようにしたいので「union select」を除く
        $replace_string = ltrim($replace_string, "union select ");
        return $replace_string;
    }

    //in句に置き換えられるような選手IDの条件文を生成する
    //id1,id2,・・・
    private function generateIdCondition($ids, $idName)
    {
        $conditionStr = "";
        foreach ($ids as $id) {
            $conditionStr .= $id->$idName . ',';
        }
        $conditionStr = rtrim($conditionStr, ",");
        return $conditionStr;
    }

    private function generateOrganizationSearchCondition($searchInfo, &$searchValue)
    {
        $condition = "";
        //エントリーシステムの団体IDの条件
        if (isset($searchInfo['entrySystemId'])) {
            $condition .= " and `t_organizations`.`entrysystem_org_id`= ?\r\n";
            array_push($searchValue, $searchInfo['entrySystemId']);
        }
        //団体IDの条件
        if (isset($searchInfo['org_id'])) {
            $condition .= " and `t_organizations`.`org_id`= ?\r\n";
            array_push($searchValue, $searchInfo['org_id']);
        }
        //団体名の条件
        if (isset($searchInfo['org_name'])) {
            $condition .= "and `t_organizations`.`org_name` LIKE ?\r\n";
            array_push($searchValue, '%' . $searchInfo['org_name'] . '%');
        }
        //団体種別の条件
        if (isset($searchInfo['org_type'])) {
            if ($searchInfo['org_type'] === "1") {
                $condition .= " and (`t_organizations`.`jara_org_type`= ? or `t_organizations`.`pref_org_type`= ?)\r\n";
            } elseif ($searchInfo['org_type'] === "0") {
                $condition .= " and (`t_organizations`.`jara_org_type`= ? and `t_organizations`.`pref_org_type`= ?)\r\n";
            }
            array_push($searchValue, $searchInfo['org_type']);
            array_push($searchValue, $searchInfo['org_type']);
        }
        //団体区分の条件
        if (isset($searchInfo['org_class'])) {
            $condition .= " and `t_organizations`.`org_class`= ?\r\n";
            array_push($searchValue, $searchInfo['org_class']);
        }
        //創立年開始の条件
        if (isset($searchInfo['foundingYear_start'])) {
            $condition .= " and `t_organizations`.`founding_year`>= ?\r\n";
            array_push($searchValue, $searchInfo['foundingYear_start']);
        }
        //創立年終了の条件
        if (isset($searchInfo['foundingYear_end'])) {
            $condition .= " and `t_organizations`.`founding_year`<= ?\r\n";
            array_push($searchValue, $searchInfo['foundingYear_end']);
        }
        //国の条件
        if (isset($searchInfo['residenceCountryId'])) {
            $condition .= " and `t_organizations`.`location_country`= ?\r\n";
            array_push($searchValue, $searchInfo['residenceCountryId']);
        }
        //都道府県の条件
        $japanCode = "112";   //日本の国コード
        if (isset($searchInfo['residencePrefectureId']) && ($searchInfo['residenceCountryId'] === $japanCode)) {
            $condition .= " and `t_organizations`.`location_prefecture`= ?\r\n";
            array_push($searchValue, $searchInfo['residencePrefectureId']);
        }
        return $condition;
    }

    //入力されたuser_idが有効かをDBへ問い合わせ、その結果をstaff_listのenableに格納する
    private function checkUserIdIsValid(&$staff_list, T_users $t_users)
    {
        Log::debug("checkUserIdIsValid start.");
        for ($iStaff = 0; $iStaff < count($staff_list); $iStaff++) {
            if (isset($staff_list[$iStaff]['user_id']) && $staff_list[$iStaff]['delete_flag'] == false) {
                $user_id = $staff_list[$iStaff]['user_id'];
                $is_valid = $t_users->getUserIdIsValid($user_id);
                $staff_list[$iStaff]['enable'] = $is_valid[0]->{'is_valid'};
                $staff_list[$iStaff]['user_name'] = $is_valid[0]->{'user_name'};
            }
        }
        Log::debug($staff_list);
        Log::debug("checkUserIdIsValid end.");
    }
}
