<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

use App\Models\T_organizations;
use App\Models\M_organization_type;
use App\Models\M_organization_class;
use App\Models\M_prefectures;
use App\Models\T_organization_staff;
use App\Models\M_staff_type;
use App\Models\T_users;
use App\Models\T_tournaments;
use App\Models\T_organization_players;
use App\Models\T_players;
use App\Models\T_raceResultRecord;
use App\Models\M_countries;

class OrganizationController extends Controller
{
    //団体情報更新画面を開く
    public function getStaffData(
        Request $request,
        T_organizations $tOrganization,
        M_organization_type $mOrganizationType,
        M_organization_class $mOrganizationClass,
        M_prefectures $mPrefectures,
        T_organization_staff $tOrganizationStaff,
        M_staff_type $mStaffType
    ) {
        Log::debug(sprintf("getStaffData start."));
        if (Auth::user()->temp_password_flag === 1) {
            // return redirect('user/password-change');
        } else {
            $targetOrgId = $request->all();
            Log::debug($targetOrgId['org_id']);
            //団体情報を取得 20231215 t_futamura
            $tOrg = $tOrganization->getOrganization($targetOrgId['org_id']);
            // //団体種別マスターを取得 20231215 t_futamura
            // $mOrgType = $mOrganizationType->getOrganizationType();
            // //団体区分マスターを取得 20231215 t_futamura
            // $mOrgClass = $mOrganizationClass->getOrganizationClass();
            // //都道府県マスターを取得 20231215 t_futamura
            // $mPref = $mPrefectures->getPrefecures();
            //団体所属スタッフテーブルを取得 20231215 t_futamura
            $tStaff = $tOrganizationStaff->getOrganizationStaffFromOrgId($targetOrgId['org_id']);
            //スタッフ種別マスターを取得 20231215 t_futamura
            // $mStfType = $mStaffType->getStaffType();
            //郵便番号を分割して持たせておく
            $post_code = $tOrg->post_code;
            $tOrg->post_code_upper = Str::substr($post_code, 0, 3);
            $tOrg->post_code_lower = Str::substr($post_code, 3, 4);

            //$staff_tag = $this->generateStaffTag($tStaff, $mStfType);
            //各データをViewに渡して開く
            // return view(
            //     'organizations.register-edit',
            //     [
            //         "pagemode" => "edit",
            //         "organization" => $tOrg,
            //         "organizationType" => $mOrgType,
            //         "organizationClass" => $mOrgClass,
            //         "prefectures" => $mPref,
            //         "staff_tag" => $staff_tag
            //     ]
            // );
            Log::debug(sprintf("getStaffData end."));
            return response()->json(['result' => $tStaff]); //処理結果を返す
        }
    }

    private function generateStaffTag($tStaff, $mStaffType)
    {
        $staff_count = 1;
        $tag = "<table border=1>
                <tr>
                    <th width='50px' style='text-align:center;'>削除</th>
                    <th width='100px' style='text-align:center;'>ユーザーID</th>
                    <th width='200px' style='text-align:center;'>ユーザー名</th>
                    <th width='120px' style='text-align:center;'>管理者（監督）</th>
                    <th width='120px' style='text-align:center;'>部長</th>
                    <th width='120px' style='text-align:center;'>コーチ</th>
                    <th width='120px' style='text-align:center;'>マネージャー</th>
                    <th width='120px' style='text-align:center;'>監督代理</th>
                </tr>";
        if (isset($tStaff)) {
            foreach ($tStaff as $staff) {
                $tag .= "<tr>";
                $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff" . $staff_count . "'></td>"; //削除
                $tag .= "<td><input type='text' id='staff" . $staff_count . "_user_id' value='" . $staff->user_id . "'></td>"; //ユーザーID
                $tag .= "<td>" . $staff->user_name . "</td>"; //ユーザー名
                //管理者（監督）
                if ($staff->is_director === 1) {
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff" . $staff_count . "_is_director' checked></td>";
                } else {
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff" . $staff_count . "_is_director'></td>";
                }
                //部長
                if ($staff->is_head === 1) {
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff" . $staff_count . "_is_head' checked></td>";
                } else {
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff" . $staff_count . "_is_head'></td>";
                }
                //コーチ
                if ($staff->is_coach === 1) {
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff" . $staff_count . "_is_coach' checked></td>";
                } else {
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff" . $staff_count . "_is_coach'></td>";
                }
                //マネージャー
                if ($staff->is_manager === 1) {
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff" . $staff_count . "_is_manager' checked></td>";
                } else {
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff" . $staff_count . "_is_manager'></td>";
                }
                //監督代理
                if ($staff->is_acting_director === 1) {
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff" . $staff_count . "_is_acting_director' checked></td>";
                } else {
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff" . $staff_count . "_is_acting_director'></td>";
                }
                $tag .= "</tr>";

                $staff_count += 1;
            }
        }
        $tag .= '</table>';
        return $tag;
    }

    //団体情報登録・更新確認画面を開く
    public function createEditConfirm()
    {
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        } else {
            return view('organizations.register-confirm', ["pagemode" => "edit"]);
        }
    }

    //団体情報参照画面を開く
    public function createReference(
        $targetOrgId,
        T_organizations $tOrganizations,
        T_tournaments $tTournaments,
        T_organization_players $tOrganizationPlayers,
        T_players $tPlayers,
        T_raceResultRecord $tRaceResultRecord,
        T_organization_staff $tOrganizationStaff
    ) {
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        } else {
            //団体情報を取得 20231215 t_futamura
            $organizations = $tOrganizations->getOrganization($targetOrgId);
            //主催大会情報を取得
            $organizedTournaments = $tTournaments->getTournamentsFromOrgId($targetOrgId);
            //団体所属選手情報を取得
            $orgPlayers = $tOrganizationPlayers->getOrganizationPlayers($targetOrgId);
            //選手情報取得のための条件文を生成する
            $playerIdColumnName = 'player_id';
            $organizedPlayerIdCondition = $this->generateIdCondition($orgPlayers, $playerIdColumnName);
            //選手情報を取得
            $organizedPlayers = [];
            if (!empty($organizedPlayerIdCondition)) {
                $organizedPlayers = $tPlayers->getPlayersFromPlayerId($organizedPlayerIdCondition);
            }
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
            //団体所属スタッフテーブルを取得 20231215 t_futamura
            $organizedStaff = $tOrganizationStaff->getOrganizationStaffFromOrgId($targetOrgId);

            //ユーザー種別を取得
            $user_type = Auth::user()->user_type;
            return view('organizations.reference', [
                "pagemode" => "refer",
                "organization_info" => $organizations,
                "organized_tournaments" => $organizedTournaments,
                "organized_players" => $organizedPlayers,
                "entryTournaments" => $entryTournaments,
                "organized_staff" => $organizedStaff,
                "user_type" => $user_type
            ]);
        }
    }

    //団体情報削除画面を開く
    public function createDeleteView(
        $targetOrgId,
        T_organizations $tOrganizations,
        T_tournaments $tTournaments,
        T_organization_players $tOrganizationPlayers,
        T_players $tPlayers,
        T_raceResultRecord $tRaceResultRecord,
        T_organization_staff $tOrganizationStaff
    ) {
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        } else {
            //団体情報を取得 20231215 t_futamura
            $organizations = $tOrganizations->getOrganization($targetOrgId);
            //主催大会情報を取得
            $organizedTournaments = $tTournaments->getTournamentsFromOrgId($targetOrgId);
            //団体所属選手情報を取得
            $orgPlayers = $tOrganizationPlayers->getOrganizationPlayers($targetOrgId);
            //選手情報取得のための条件文を生成する
            $playerIdColumnName = 'player_id';
            $organizedPlayerIdCondition = $this->generateIdCondition($orgPlayers, $playerIdColumnName);
            //選手情報を取得
            $organizedPlayers = [];
            if (!empty($organizedPlayerIdCondition)) {
                $organizedPlayers = $tPlayers->getPlayersFromPlayerId($organizedPlayerIdCondition);
            }
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
            //団体所属スタッフテーブルを取得 20231215 t_futamura
            $organizedStaff = $tOrganizationStaff->getOrganizationStaffFromOrgId($targetOrgId);

            //ユーザー種別を取得
            $user_type = Auth::user()->user_type;
            return view('organizations.reference', [
                "pagemode" => "delete",
                "organization_info" => $organizations,
                "organized_tournaments" => $organizedTournaments,
                "organized_players" => $organizedPlayers,
                "entryTournaments" => $entryTournaments,
                "organized_staff" => $organizedStaff,
                "user_type" => $user_type
            ]);
        }
    }

    //団体検索画面を開く
    public function createSearchView(
        M_prefectures $mPrefectures,
        M_organization_type $mOrganizationType,
        M_organization_class $mOrganizationClass,
        M_countries $mCountries
    ): View {
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        } else {
            //国マスタを取得
            $countries = $mCountries->getCountries();
            //都道府県マスタを取得
            $prefectures = $mPrefectures->getPrefecures();
            //団体区分マスタを取得
            $organizationClass = $mOrganizationClass->getOrganizationClass();
            //団体種別マスタを取得
            $organizationType = $mOrganizationType->getOrganizationType();
            //ユーザー種別を取得
            $user_type = Auth::user()->user_type;
            return view('organizations.search', [
                'countries' => $countries,
                'prefectures' => $prefectures,
                'organization_class' => $organizationClass,
                'organization_type' => $organizationType,
                'user_type' => $user_type
            ]);
        }
    }

    //団体情報登録画面で確認ボタンを押したときに発生するイベント
    public function storeConfirm(
        Request $request,
        T_organizations $t_organizations,
        M_prefectures $m_prefectures,
        T_users $t_users,
        M_organization_class $m_organization_class,
        M_staff_type $mStaffType
    ) {
        Log::debug(sprintf("storeConfirm start"));

        if (Auth::user()->temp_password_flag === 1) {
            //return redirect('user/password-change');
        } else {
            $organizationInfo = $request->all();
            Log::debug($organizationInfo);
            include('Auth/ErrorMessages/ErrorMessages.php');
            $rules = [
                'orgName' => ['required'],          //団体名
                'postCodeUpper' => ['required'],    //郵便番号
                'postCodeLower' => ['required'],    //郵便番号            
                'prefecture' => ['required'],       //都道府県
                'address1' => ['required'],         //市区町村・町字番地
                'orgClass' => ['required'],         //団体区分
                //'managerUserId' => ['required'],    //管理者のユーザID
            ];

            $errMessages = [
                'orgName.required' => $orgName_required,
                'foundingYear.required' => $foundingYear_required,
                'postCodeUpper.required' => $postCode_required,
                'postCodeLower.required' => $postCode_required,
                'prefecture.required' => $prefecture_required,
                'address1.required' => $address1_required,
                'orgClass.required' => $orgClass_required,
                //'managerUserId.required' => $managerUserId_required,
            ];
            //
            $validator = Validator::make($request->all(), $rules, $errMessages);
            //追加でチェックを行う
            $entrysystemOrgId = $organizationInfo['entrysystemOrgId'];
            $foundingYear = $organizationInfo['foundingYear'];
            $foundingYear_min = 1750;                                   //創立年最小値
            $post_code_upper = $organizationInfo['postCodeUpper'];
            $post_code_lower = $organizationInfo['postCodeLower'];
            $jara_org_reg_trail = $organizationInfo['jaraOrgRegTrail'];
            $jara_org_type = $organizationInfo['jaraOrgType'];
            $pref_org_reg_trail = $organizationInfo['prefOrgRegTrail'];
            $pref_org_type = $organizationInfo['prefOrgType'];

            //入力されたエントリーシステムの団体IDは、既に別の団体で使用されています。[団体ID]：[団体名]
            $duplicateCount = $t_organizations->getEntrysystemOrgIdCount($entrysystemOrgId);
            if ($duplicateCount > 0) {
                //エントリー団体IDから団体名を取得
                $duplicateOrgName = $t_organizations->getEntrysystemOrgIdCount($entrysystemOrgId);
                //エラーメッセージを整形
                $errorMessage = str_replace('[団体名]', $duplicateOrgName, str_replace('[団体ID]', $organizationInfo['entrysystemOrgId'], $entrysystemOrgId_registered));
                $validator->errors()->add('entrysystemOrgId', $errorMessage);
            }

            //創立年が、数値ではない、1750年より前、現在より後、のいずれかの場合エラー
            //不正な値です。適切な西暦を入力してください。
            if (
                !empty($foundingYear) &&
                (!is_numeric($foundingYear)
                    || $foundingYear < $foundingYear_min
                    || $foundingYear > date('Y'))
            ) {
                $validator->errors()->add('foundingYear_failed', $foundingYear_failed);
            }
            //不正な郵便番号です、適切な郵便番号を入力してください（数字３桁-数字４桁）
            if (
                !is_numeric($post_code_upper)
                || !is_numeric($post_code_lower)
                || (strlen($post_code_upper) != 3)
                || (strlen($post_code_lower) != 4)
            ) {
                $validator->errors()->add('postCode_failed', $postCode_failed);
            }
            //JARA証跡を設定しない場合、JARA団体種別は"任意"を選択してください。
            if (empty($jara_org_reg_trail) &&  $jara_org_type == "1") {
                $validator->errors()->add('jaraOrgType_official_failed', $jaraOrgType_official_failed);
            }
            //JARA証跡を設定する場合、JARA団体種別は"正式"を選択してください。
            if (!empty($jara_org_reg_trail) &&  $jara_org_type == "0") {
                $validator->errors()->add('jaraOrgType_private_failed', $jaraOrgType_private_failed);
            }
            //県ボ証跡を設定しない場合、県ボ団体種別は"任意"を選択してください。
            if (empty($pref_org_reg_trail) &&  $pref_org_type == "1") {
                $validator->errors()->add('prefOrgType_official_failed', $prefOrgType_official_failed);
            }
            //県ボ証跡を設定する場合、県ボ団体種別は"正式"を選択してください。
            if (!empty($pref_org_reg_trail) &&  $pref_org_type == "0") {
                $validator->errors()->add('prefOrgType_private_failed', $prefOrgType_private_failed);
            }
            //バリデーション失敗時、セッションにエラーメッセージをフラッシュデータとして保存
            if ($validator->errors()->count() > 0) {
                //return back()->withInput()->withErrors($validator);
            }
            //都道府県コードを以て、都道府県情報をDBから取得
            $targetPref = $m_prefectures->getPrefInfoFromPrefCodeJis($organizationInfo['prefecture']);
            $organizationInfo['pref_id'] = $targetPref->pref_id;
            $organizationInfo['pref_name'] = $targetPref->pref_name;
            //郵便番号をセット
            $organizationInfo['post_code'] = $organizationInfo['postCodeUpper'] . $organizationInfo['postCodeLower'];
            $organizationInfo['previousPageStatus'] = "success";
            //団体区分名をセット
            $organizationInfo['org_class_name'] = $m_organization_class->getOrganizationClassName($organizationInfo['orgClass']);

            //スタッフ名の取得
            $staff_index = 1;
            while (true) {
                //無限に繰り返す処理を記載
                if (isset($organizationInfo['staff' . $staff_index . '_user_id'])) {
                    //取得できているのでユーザー名を取得
                    $user_name = $t_users->getUserName($organizationInfo['staff' . $staff_index . '_user_id']);
                    //ユーザー名を取得できたら「staff_user_nameX」で$organizationInfoに追加
                    //ユーザーID、ユーザー名がセットで入ってたら存在するユーザーとする
                    $organizationInfo['staff' . $staff_index . '_user_name'] = $user_name;
                    //スタッフ種別を取得する
                    $target_staff_type_id = $organizationInfo['staff' . $staff_index . '_type'];
                    $organizationInfo['staff' . $staff_index . '_type_display'] = $mStaffType->getStaffTypeName($target_staff_type_id);
                } else {
                    //スタッフが入力されていなかったらループを抜ける
                    break;
                }
                $staff_index++;
            }
            Log::debug(sprintf("storeConfirm end"));
            return response()->json(['reqData' => $reqData, 'result' => $result]); //送信データ(debug用)とDBの結果を返す
            //return redirect('organization/register/confirm')->with('organizationInfo', $organizationInfo);
        }
    }

    //団体更新画面で確認ボタンを押下したときに発生するイベント
    public function storeEditConfirm(
        Request $request,
        T_organizations $t_organizations,
        M_prefectures $m_prefectures,
        T_users $t_users,
        M_organization_class $m_organization_class,
        M_staff_type $mStaffType
    ): RedirectResponse {
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        } else {
            $organizationInfo = $request->all();
            include('Auth/ErrorMessages/ErrorMessages.php');
            $rules = [
                'orgName' => ['required'],          //団体名
                'postCodeUpper' => ['required'],    //郵便番号
                'postCodeLower' => ['required'],    //郵便番号
                'prefecture' => ['required'],       //都道府県
                'address1' => ['required'],         //市区町村・町字番地
                'orgClass' => ['required'],         //団体区分
                //'managerUserId' => ['required'],    //管理者のユーザID
            ];

            $errMessages = [
                'orgName.required' => $orgName_required,
                'foundingYear.required' => $foundingYear_required,
                'postCodeUpper.required' => $postCode_required,
                'postCodeLower.required' => $postCode_required,
                'prefecture.required' => $prefecture_required,
                'address1.required' => $address1_required,
                'orgClass.required' => $orgClass_required,
                //'managerUserId.required' => $managerUserId_required,
            ];
            //
            $validator = Validator::make($request->all(), $rules, $errMessages);
            //追加でチェックを行う
            $org_id = $organizationInfo['org_id'];
            $entrysystemOrgId = $organizationInfo['entrysystemOrgId'];
            $foundingYear = $organizationInfo['foundingYear'];
            $foundingYear_min = 1750;                                   //創立年最小値
            $post_code_upper = $organizationInfo['postCodeUpper'];
            $post_code_lower = $organizationInfo['postCodeLower'];
            $jara_org_reg_trail = $organizationInfo['jaraOrgRegTrail'];
            $jara_org_type = $organizationInfo['jaraOrgType'];
            $pref_org_reg_trail = $organizationInfo['prefOrgRegTrail'];
            $pref_org_type = $organizationInfo['prefOrgType'];

            //入力されたエントリーシステムの団体IDは、既に別の団体で使用されています。[団体ID]：[団体名]
            $duplicateCount = $t_organizations->getEntrysystemOrgIdCountWithOrgId($entrysystemOrgId, $org_id);
            if ($duplicateCount > 0) {
                //エントリー団体IDから団体名を取得
                $duplicateOrgInfo = $t_organizations->getOrgInfoFromEntrySystemOrgId($entrysystemOrgId);
                //エラーメッセージを整形
                $errorMessage = str_replace('[団体名]', $duplicateOrgInfo->org_name, str_replace('[団体ID]', $duplicateOrgInfo->org_id, $entrysystemOrgId_registered));
                $validator->errors()->add('entrysystemOrgId', $errorMessage);
            }

            //創立年が、数値ではない、1750年より前、現在より後、のいずれかの場合エラー
            //不正な値です。適切な西暦を入力してください。
            if (
                !is_numeric($foundingYear)
                || $foundingYear < $foundingYear_min
                || $foundingYear > date('Y')
            ) {
                $validator->errors()->add('foundingYear_failed', $foundingYear_failed);
            }
            //不正な郵便番号です、適切な郵便番号を入力してください（数字３桁-数字４桁）
            if (
                !is_numeric($post_code_upper)
                || !is_numeric($post_code_lower)
                || (strlen($post_code_upper) != 3)
                || (strlen($post_code_lower) != 4)
            ) {
                $validator->errors()->add('postCode_failed', $postCode_failed);
            }
            //JARA証跡を設定しない場合、JARA団体種別は"任意"を選択してください。
            if (empty($jara_org_reg_trail) &&  $jara_org_type == "1") {
                $validator->errors()->add('jaraOrgType_official_failed', $jaraOrgType_official_failed);
            }
            //JARA証跡を設定する場合、JARA団体種別は"正式"を選択してください。
            if (!empty($jara_org_reg_trail) &&  $jara_org_type == "0") {
                $validator->errors()->add('jaraOrgType_private_failed', $jaraOrgType_private_failed);
            }
            //県ボ証跡を設定しない場合、県ボ団体種別は"任意"を選択してください。
            if (empty($pref_org_reg_trail) &&  $pref_org_type == "1") {
                $validator->errors()->add('prefOrgType_official_failed', $prefOrgType_official_failed);
            }
            //県ボ証跡を設定する場合、県ボ団体種別は"正式"を選択してください。
            if (!empty($pref_org_reg_trail) &&  $pref_org_type == "0") {
                $validator->errors()->add('prefOrgType_private_failed', $prefOrgType_private_failed);
            }
            //バリデーション失敗時、セッションにエラーメッセージをフラッシュデータとして保存
            if ($validator->errors()->count() > 0) {
                return back()->withInput()->withErrors($validator);
            }
            //都道府県コードを以て、都道府県情報をDBから取得
            $targetPref = $m_prefectures->getPrefInfoFromPrefCodeJis($organizationInfo['prefecture']);
            $organizationInfo['pref_id'] = $targetPref->pref_id;
            $organizationInfo['pref_name'] = $targetPref->pref_name;
            //郵便番号をセット
            $organizationInfo['post_code'] = $organizationInfo['postCodeUpper'] . $organizationInfo['postCodeLower'];
            //団体区分名をセット
            $organizationInfo['org_class_name'] = $m_organization_class->getOrganizationClassName($organizationInfo['orgClass']);
            $organizationInfo['previousPageStatus'] = "success";

            //スタッフ名の取得
            $staff_index = 1;
            while (true) {
                //無限に繰り返す処理を記載
                if (isset($organizationInfo['staff' . $staff_index . '_user_id'])) {
                    //取得できているのでユーザー名を取得
                    $user_name = $t_users->getUserName($organizationInfo['staff' . $staff_index . '_user_id']);
                    //ユーザー名を取得できたら「staff_user_nameX」で$organizationInfoに追加
                    //ユーザーID、ユーザー名がセットで入ってたら存在するユーザーとする
                    $organizationInfo['staff' . $staff_index . '_user_name'] = $user_name;
                    //スタッフ種別を取得する
                    $target_staff_type_id = $organizationInfo['staff' . $staff_index . '_type'];
                    $organizationInfo['staff' . $staff_index . '_type_display'] = $mStaffType->getStaffTypeName($target_staff_type_id);
                } else {
                    //スタッフが入力されていなかったらループを抜ける
                    break;
                }
                $staff_index++;
            }

            $targetUrl = 'organization/edit/' . $organizationInfo['org_id'] . '/confirm';
            return redirect($targetUrl)->with(['organizationInfo' => $organizationInfo]);
        }
    }

    //団体登録画面で確認ボタンを押したときに入力値をチェックするメソッド
    public function checkEditValue(
        Request $request,
        T_organizations $t_organizations,
        /*
        M_prefectures $m_prefectures,
        T_users $t_users,
        M_organization_class $m_organization_class,
        M_staff_type $mStaffType
        */
    ) {
        $organizationInfo = $request->all();
        include('Auth/ErrorMessages/ErrorMessages.php');
        // $rules = [
        //     'orgName' => ['required'],          //団体名
        //     'postCodeUpper' => ['required'],    //郵便番号
        //     'postCodeLower' => ['required'],    //郵便番号
        //     'prefecture' => ['required'],       //都道府県
        //     'address1' => ['required'],         //市区町村・町字番地
        //     'orgClass' => ['required'],         //団体区分
        //     //'managerUserId' => ['required'],    //管理者のユーザID
        // ];

        // $errMessages = [
        //     'orgName.required' => $orgName_required,
        //     'foundingYear.required' => $foundingYear_required,
        //     'postCodeUpper.required' => $postCode_required,
        //     'postCodeLower.required' => $postCode_required,
        //     'prefecture.required' => $prefecture_required,
        //     'address1.required' => $address1_required,
        //     'orgClass.required' => $orgClass_required,
        //     //'managerUserId.required' => $managerUserId_required,
        // ];
        //
        // $validator = Validator::make($request->all(), $rules, $errMessages);
        //追加でチェックを行う
        $org_id = $organizationInfo['org_id'];
        $entrysystemOrgId = $organizationInfo['entrysystemOrgId'];
        // $foundingYear = $organizationInfo['foundingYear'];
        // $foundingYear_min = 1750;                                   //創立年最小値
        // $post_code_upper = $organizationInfo['postCodeUpper'];
        // $post_code_lower = $organizationInfo['postCodeLower'];
        // $jara_org_reg_trail = $organizationInfo['jaraOrgRegTrail'];
        // $jara_org_type = $organizationInfo['jaraOrgType'];
        // $pref_org_reg_trail = $organizationInfo['prefOrgRegTrail'];
        // $pref_org_type = $organizationInfo['prefOrgType'];

        //入力されたエントリーシステムの団体IDは、既に別の団体で使用されています。[団体ID]：[団体名]
        $duplicateCount = $t_organizations->getEntrysystemOrgIdCountWithOrgId($entrysystemOrgId, $org_id);
        if ($duplicateCount > 0) {
            //エントリー団体IDから団体名を取得
            $duplicateOrgInfo = $t_organizations->getOrgInfoFromEntrySystemOrgId($entrysystemOrgId);
            //エラーメッセージを整形
            $errorMessage = str_replace('[団体名]', $duplicateOrgInfo->org_name, str_replace('[団体ID]', $duplicateOrgInfo->org_id, $entrysystemOrgId_registered));
            //エラーを返す
            return response()->json(['system_error' => $errorMessage], 500);
        }

        return true;

        // //創立年が、数値ではない、1750年より前、現在より後、のいずれかの場合エラー
        // //不正な値です。適切な西暦を入力してください。
        // if (
        //     !is_numeric($foundingYear)
        //     || $foundingYear < $foundingYear_min
        //     || $foundingYear > date('Y')
        // ) {
        //     $validator->errors()->add('foundingYear_failed', $foundingYear_failed);
        // }
        //不正な郵便番号です、適切な郵便番号を入力してください（数字３桁-数字４桁）
        // if (
        //     !is_numeric($post_code_upper)
        //     || !is_numeric($post_code_lower)
        //     || (strlen($post_code_upper) != 3)
        //     || (strlen($post_code_lower) != 4)
        // ) {
        //     $validator->errors()->add('postCode_failed', $postCode_failed);
        // }
        //JARA証跡を設定しない場合、JARA団体種別は"任意"を選択してください。
        // if (empty($jara_org_reg_trail) &&  $jara_org_type == "1") {
        //     $validator->errors()->add('jaraOrgType_official_failed', $jaraOrgType_official_failed);
        // }
        //JARA証跡を設定する場合、JARA団体種別は"正式"を選択してください。
        // if (!empty($jara_org_reg_trail) &&  $jara_org_type == "0") {
        //     $validator->errors()->add('jaraOrgType_private_failed', $jaraOrgType_private_failed);
        // }
        // //県ボ証跡を設定しない場合、県ボ団体種別は"任意"を選択してください。
        // if (empty($pref_org_reg_trail) &&  $pref_org_type == "1") {
        //     $validator->errors()->add('prefOrgType_official_failed', $prefOrgType_official_failed);
        // }
        // //県ボ証跡を設定する場合、県ボ団体種別は"正式"を選択してください。
        // if (!empty($pref_org_reg_trail) &&  $pref_org_type == "0") {
        //     $validator->errors()->add('prefOrgType_private_failed', $prefOrgType_private_failed);
        // }
        //バリデーション失敗時、セッションにエラーメッセージをフラッシュデータとして保存
        // if ($validator->errors()->count() > 0) {
        //     return back()->withInput()->withErrors($validator);
        // }
        //都道府県コードを以て、都道府県情報をDBから取得
        // $targetPref = $m_prefectures->getPrefInfoFromPrefCodeJis($organizationInfo['prefecture']);
        // $organizationInfo['pref_id'] = $targetPref->pref_id;
        // $organizationInfo['pref_name'] = $targetPref->pref_name;
        // //郵便番号をセット
        // $organizationInfo['post_code'] = $organizationInfo['postCodeUpper'] . $organizationInfo['postCodeLower'];
        // //団体区分名をセット
        // $organizationInfo['org_class_name'] = $m_organization_class->getOrganizationClassName($organizationInfo['orgClass']);
        // $organizationInfo['previousPageStatus'] = "success";

        //スタッフ名の取得
        // $staff_index = 1;
        // while (true) {
        //     //無限に繰り返す処理を記載
        //     if (isset($organizationInfo['staff' . $staff_index . '_user_id'])) {
        //         //取得できているのでユーザー名を取得
        //         $user_name = $t_users->getUserName($organizationInfo['staff' . $staff_index . '_user_id']);
        //         //ユーザー名を取得できたら「staff_user_nameX」で$organizationInfoに追加
        //         //ユーザーID、ユーザー名がセットで入ってたら存在するユーザーとする
        //         $organizationInfo['staff' . $staff_index . '_user_name'] = $user_name;
        //         //スタッフ種別を取得する
        //         $target_staff_type_id = $organizationInfo['staff' . $staff_index . '_type'];
        //         $organizationInfo['staff' . $staff_index . '_type_display'] = $mStaffType->getStaffTypeName($target_staff_type_id);
        //     } else {
        //         //スタッフが入力されていなかったらループを抜ける
        //         break;
        //     }
        //     $staff_index++;
        // }

        // $targetUrl = 'organization/edit/' . $organizationInfo['org_id'] . '/confirm';
        // return redirect($targetUrl)->with(['organizationInfo' => $organizationInfo]);
    }

    //団体所属スタッフテーブルを更新するための条件文を生成する
    private function generateUpdateStaffCondition($organizationInfo)
    {
        $condition = "";
        $staffList = $organizationInfo['staffList'];        
        foreach($staffList as $staff)
        {
            //団体IDを持つ、かつ削除フラグが立っていないとき
            // = 新規スタッフでない、かつ削除対象ではないスタッフに対して処理する
            if(isset($staff['org_id']) && !$staff['delete_flag'])
            {
                //監督にチェックが入っていない
                if($staff['is_director'] == 0)
                {
                    $condition .= " or ( `user_id`= ".$staff['id']. " and `staff_type_id`= 1)\r\n";
                }
                //部長にチェックが入っていない
                if($staff['is_head'] == 0)
                {
                    $condition .= " or ( `user_id`= ".$staff['id']. " and `staff_type_id`= 2)\r\n";
                }
                //コーチにチェックが入っていない
                if($staff['is_coach'] == 0)
                {
                    $condition .= " or ( `user_id`= ".$staff['id']. " and `staff_type_id`= 3)\r\n";
                }
                //マネージャーにチェックが入っていない
                if($staff['is_manager'] == 0)
                {
                    $condition .= " or ( `user_id`= ".$staff['id']. " and `staff_type_id`= 4)\r\n";
                }
                //管理代理にチェックが入っていない
                if($staff['is_acting_director'] == 0)
                {
                    $condition .= " or ( `user_id`= ".$staff['id']. " and `staff_type_id`= 5)\r\n";
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

    private function generateOrganizationSearchCondition($searchInfo, &$searchValue)
    {
        $condition = "";
        //エントリーシステムの団体IDの条件
        if (isset($searchInfo['entrysystemOrgId'])) {
            $condition .= " and `t_organizations`.`entrysystem_org_id`= ?\r\n";
            array_push($searchValue, $searchInfo['entrysystemOrgId']);
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

    // public function createManagement(): View
    // {
    //     $organizations = DB::select('select * from t_organizations');
    //     return view('organizations.management', ['organizations' => $organizations]);
    // }


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
    public function storeOrgData(Request $request, T_organizations $tOrganizations, T_organization_staff $tOrganizationStaff,T_users $t_users)
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
            return response()->json(["団体登録に失敗しました。"], 403);
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
            $tOrganizationStaff->updateDeleteFlagInOrganizationStaff($updateCondition,$target_org_id);

            //新しく入力されたスタッフをInsertする
            $replace_string = $this->generateInsertStaffValues($organizationInfo, $organizationInfo['formData']['org_id']);
            $tOrganizationStaff->insertOrganizationStaff($replace_string, $target_org_id);

            //削除のチェックボックスにチェックしたユーザーを団体所属スタッフテーブルから削除する
            foreach($organizationInfo['staffList'] as $staff)
            {
                if($staff['delete_flag'])
                {
                    $target_user_id = $staff['user_id'];
                    $tOrganizationStaff->updateDeleteFlagByUserDeletion($target_user_id,$target_org_id);
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
            return response()->json(["団体更新に失敗しました。"], 403);
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

    //userIDに紐づいたデータを送信 20240131
    public function getOrgStaffData(Request $request, T_organization_staff $tOrganizationStaff)
    {
        Log::debug(sprintf("getOrgStaffData start"));
        $result = $request->all();
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
        }
        Log::debug(sprintf("getOrgStaffData end"));
        //Log::debug($tOrg);
        return response()->json(['result' => $tOrg]); //DBの結果を返す
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
    public function deleteOrgData(Request $request,
                                    T_organization_staff $t_organization_staff
                                    ,T_organization_players $t_organization_players
                                    ,T_organizations $t_organizations
                                    ,T_users $t_users)
    {
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
            DB::rollBack();
            Log::error('Line:' . $e->getLine() . ' message:' . $e->getMessage());
            return response()->json(['result' => false]); //DBの結果を返す
        }
    }

    //団体のバリデーションチェック 20240307
    public function validateOrgData(Request $request,  T_organizations $tOrganizations)
    {
        Log::debug(sprintf("validateOrgData start"));
        $reqData = $request->all();
        // Log::debug($reqData);
        Log::debug($reqData['formData']['entrysystem_org_id']);
        $duplicationCount = 0;
        //団体IDがnullでエントリーシステムの団体IDが入力されている場合、登録時の重複チェックを行う
        if (!isset($reqData['formData']['org_id']) && isset($reqData['formData']['entrysystem_org_id'])) {
            Log::debug("call getEntrysystemOrgIdCount");
            $duplicationCount = $tOrganizations->getEntrysystemOrgIdCount($reqData['formData']['entrysystem_org_id']);
        }
        //団体IDとエントリーシステムの団体IDが入力されている場合、更新時の重複チェックを行う
        if (isset($reqData['formData']['org_id']) && isset($reqData['formData']['entrysystem_org_id'])) {
            Log::debug("call getEntrysystemOrgIdCountWithOrgId");
            $duplicationCount = $tOrganizations->getEntrysystemOrgIdCountWithOrgId($reqData['formData']['entrysystem_org_id'], $reqData['formData']['org_id']);
        }

        if ($duplicationCount > 0) {
            Log::debug(sprintf("validateOrgData duplication"));
            return response()->json(["エントリーシステムの団体IDが重複しています。"], 401);
        }

        Log::debug(sprintf("validateOrgData end"));
        return response()->json(['result' => $reqData]); //DBの結果を返す
    }
}
