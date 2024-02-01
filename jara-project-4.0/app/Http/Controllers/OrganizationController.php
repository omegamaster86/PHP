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
    //団体情報登録画面を開く
    public function create(M_organization_type $mOrganizationType,
                            M_organization_class $mOrganizationClass,
                            M_prefectures $mPrefectures,
                            M_staff_type $mStaffType)
    {
        if(Auth::user()->temp_password_flag === 1)
        {
            return redirect('user/password-change');
        }
        else
        {
            $mOrgType = $mOrganizationType->getOrganizationType();
            $mOrgClass = $mOrganizationClass->getOrganizationClass();
            $mPref = $mPrefectures->getPrefecures();
            $mStfType = $mStaffType->getStaffType();
            $tStaff = null;
            $staff_tag = $this->generateStaffTag($tStaff,$mStfType);
            return view('organizations.register-edit',["pagemode"=>"register"
                                                        ,"organizationType"=>$mOrgType
                                                        ,"organizationClass"=>$mOrgClass
                                                        ,"prefectures"=>$mPref
                                                        ,"staff_tag"=>$staff_tag
                                                    ]);
        }
    }

    //団体情報更新画面を開く
    public function createEdit($targetOrgId,
                                    T_organizations $tOrganization,
                                    M_organization_type $mOrganizationType,
                                    M_organization_class $mOrganizationClass,
                                    M_prefectures $mPrefectures,
                                    T_organization_staff $tOrganizationStaff,
                                    M_staff_type $mStaffType)
    {
        if(Auth::user()->temp_password_flag === 1)
        {
            return redirect('user/password-change');
        }
        else
        {
            //団体情報を取得 20231215 t_futamura
            $tOrg = $tOrganization->getOrganization($targetOrgId);
            //団体種別マスターを取得 20231215 t_futamura
            $mOrgType = $mOrganizationType->getOrganizationType();
            //団体区分マスターを取得 20231215 t_futamura
            $mOrgClass = $mOrganizationClass->getOrganizationClass();
            //都道府県マスターを取得 20231215 t_futamura
            $mPref = $mPrefectures->getPrefecures();
            //団体所属スタッフテーブルを取得 20231215 t_futamura
            $tStaff = $tOrganizationStaff->getOrganizationStaffFromOrgId($targetOrgId);
            //スタッフ種別マスターを取得 20231215 t_futamura
            $mStfType = $mStaffType->getStaffType();
            //郵便番号を分割して持たせておく
            $post_code = $tOrg->post_code;
            $tOrg->post_code_upper = Str::substr($post_code,0,3);
            $tOrg->post_code_lower = Str::substr($post_code,3,4);

            $staff_tag = $this->generateStaffTag($tStaff,$mStfType);
            //各データをViewに渡して開く
            return view('organizations.register-edit',["pagemode"=>"edit",
                                                        "organization"=>$tOrg,
                                                        "organizationType"=>$mOrgType,
                                                        "organizationClass"=>$mOrgClass,
                                                        "prefectures"=>$mPref,
                                                        "staff_tag"=>$staff_tag]
                                                    );
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
        if(isset($tStaff)){
            foreach($tStaff as $staff){
                $tag .= "<tr>";
                $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff".$staff_count."'></td>"; //削除
                $tag .= "<td><input type='text' id='staff".$staff_count."_user_id' value='".$staff->user_id."'></td>"; //ユーザーID
                $tag .= "<td>".$staff->user_name."</td>"; //ユーザー名
                 //管理者（監督）
                if($staff->is_director === 1){
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff".$staff_count."_is_director' checked></td>";
                }else{
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff".$staff_count."_is_director'></td>";
                }
                //部長
                if($staff->is_head === 1){
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff".$staff_count."_is_head' checked></td>";
                }else{
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff".$staff_count."_is_head'></td>";
                }
                //コーチ
                if($staff->is_coach === 1){
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff".$staff_count."_is_coach' checked></td>";
                }else{
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff".$staff_count."_is_coach'></td>";
                }
                //マネージャー
                if($staff->is_manager === 1){
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff".$staff_count."_is_manager' checked></td>";
                }else{
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff".$staff_count."_is_manager'></td>";
                }
                //監督代理
                if($staff->is_acting_director === 1){
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff".$staff_count."_is_acting_director' checked></td>";
                }
                else{
                    $tag .= "<td style='text-align:center;'><input type='checkbox' id='staff".$staff_count."_is_acting_director'></td>";
                }
                $tag .= "</tr>";
                
                $staff_count +=1;
            }
        }
        $tag .= '</table>';
        return $tag;
    }

    //団体情報登録・更新確認画面を開く
    public function createConfirm()
    {
        if(Auth::user()->temp_password_flag === 1)
        {
            return redirect('user/password-change');
        }
        else
        {
            return view('organizations.register-confirm',["pagemode"=>"register"]);
        }
    }

    //団体情報登録・更新確認画面を開く
    public function createEditConfirm()
    {
        if(Auth::user()->temp_password_flag === 1)
        {
            return redirect('user/password-change');
        }
        else
        {
            return view('organizations.register-confirm',["pagemode"=>"edit"]);
        }
    }

    //団体情報参照画面を開く
    public function createReference($targetOrgId,
                                    T_organizations $tOrganizations,
                                    T_tournaments $tTournaments,                                    
                                    T_organization_players $tOrganizationPlayers,
                                    T_players $tPlayers,
                                    T_raceResultRecord $tRaceResultRecord,                                    
                                    T_organization_staff $tOrganizationStaff)
    {
        if(Auth::user()->temp_password_flag === 1)
        {
            return redirect('user/password-change');
        }
        else
        {
            //団体情報を取得 20231215 t_futamura
            $organizations = $tOrganizations->getOrganization($targetOrgId);
            //主催大会情報を取得
            $organizedTournaments = $tTournaments->getTournamentsFromOrgId($targetOrgId);        
            //団体所属選手情報を取得
            $orgPlayers = $tOrganizationPlayers->getOrganizationPlayers($targetOrgId);
            //選手情報取得のための条件文を生成する
            $playerIdColumnName = 'player_id';
            $organizedPlayerIdCondition = $this->generateIdCondition($orgPlayers,$playerIdColumnName);
            //選手情報を取得
            $organizedPlayers = [];
            if(!empty($organizedPlayerIdCondition))
            {
                $organizedPlayers = $tPlayers->getPlayers($organizedPlayerIdCondition);
            }
            //出漕結果記録情報を取得
            $tournamentIds = $tRaceResultRecord->getTournamentIdForResultsRecord($targetOrgId);
            //エントリー大会情報取得のための条件文を生成する
            $tournamentIdColumnName = 'tourn_id';
            $tournamentsIdCondition = $this->generateIdCondition($tournamentIds,$tournamentIdColumnName);        
            //エントリー大会情報を取得
            $entryTournaments = [];
            if(!empty($tournamentsIdCondition))
            {
                $entryTournaments = $tTournaments->getEntryTournaments($tournamentsIdCondition);
            }
            //団体所属スタッフテーブルを取得 20231215 t_futamura
            $organizedStaff = $tOrganizationStaff->getOrganizationStaffFromOrgId($targetOrgId);
            
            //ユーザー種別を取得
            $user_type = Auth::user()->user_type;
            return view('organizations.reference',["pagemode"=>"refer",
                                                    "organization_info"=>$organizations,
                                                    "organized_tournaments"=>$organizedTournaments,
                                                    "organized_players"=>$organizedPlayers,
                                                    "entryTournaments"=>$entryTournaments,
                                                    "organized_staff"=>$organizedStaff,
                                                    "user_type"=>$user_type
                                                ]);
        }
    }

    //団体情報削除画面を開く
    public function createDeleteView($targetOrgId,
                                        T_organizations $tOrganizations,
                                        T_tournaments $tTournaments,
                                        T_organization_players $tOrganizationPlayers,
                                        T_players $tPlayers,
                                        T_raceResultRecord $tRaceResultRecord,
                                        T_organization_staff $tOrganizationStaff)
    {
        if(Auth::user()->temp_password_flag === 1)
        {
            return redirect('user/password-change');
        }
        else
        {
            //団体情報を取得 20231215 t_futamura
            $organizations = $tOrganizations->getOrganization($targetOrgId);
            //主催大会情報を取得
            $organizedTournaments = $tTournaments->getTournamentsFromOrgId($targetOrgId);
            //団体所属選手情報を取得
            $orgPlayers = $tOrganizationPlayers->getOrganizationPlayers($targetOrgId);
            //選手情報取得のための条件文を生成する
            $playerIdColumnName = 'player_id';
            $organizedPlayerIdCondition = $this->generateIdCondition($orgPlayers,$playerIdColumnName);
            //選手情報を取得
            $organizedPlayers = [];
            if(!empty($organizedPlayerIdCondition))
            {
                $organizedPlayers = $tPlayers->getPlayers($organizedPlayerIdCondition);
            }
            //出漕結果記録情報を取得
            $tournamentIds = $tRaceResultRecord->getTournamentIdForResultsRecord($targetOrgId);
            //エントリー大会情報取得のための条件文を生成する
            $tournamentIdColumnName = 'tourn_id';
            $tournamentsIdCondition = $this->generateIdCondition($tournamentIds,$tournamentIdColumnName);
            //エントリー大会情報を取得
            $entryTournaments = [];
            if(!empty($tournamentsIdCondition))
            {
                $entryTournaments = $tTournaments->getEntryTournaments($tournamentsIdCondition);
            }
            //団体所属スタッフテーブルを取得 20231215 t_futamura
            $organizedStaff = $tOrganizationStaff->getOrganizationStaffFromOrgId($targetOrgId);

            //ユーザー種別を取得
            $user_type = Auth::user()->user_type;
            return view('organizations.reference',["pagemode"=>"delete",
                                                    "organization_info"=>$organizations,
                                                    "organized_tournaments"=>$organizedTournaments,
                                                    "organized_players"=>$organizedPlayers,
                                                    "entryTournaments"=>$entryTournaments,
                                                    "organized_staff"=>$organizedStaff,
                                                    "user_type"=>$user_type
                                                ]);
        }
    }

    //団体検索画面を開く
    public function createSearchView(M_prefectures $mPrefectures,
                                        M_organization_type $mOrganizationType,
                                        M_organization_class $mOrganizationClass,
                                        M_countries $mCountries) : View
    {
        if(Auth::user()->temp_password_flag === 1)
        {
            return redirect('user/password-change');
        }
        else
        {
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
            return view('organizations.search',['countries'=>$countries,
                                                'prefectures'=>$prefectures,
                                                'organization_class'=>$organizationClass,
                                                'organization_type'=>$organizationType,
                                                'user_type'=>$user_type
                                                ]);
        }
    }

    //団体情報登録画面で確認ボタンを押したときに発生するイベント
    public function storeConfirm(Request $request,
                                    T_organizations $t_organizations,
                                    M_prefectures $m_prefectures,
                                    T_users $t_users,
                                    M_organization_class $m_organization_class,
                                    M_staff_type $mStaffType)
    {
        if(Auth::user()->temp_password_flag === 1)
        {
            return redirect('user/password-change');
        }
        else
        {
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
            $validator = Validator::make($request->all(), $rules,$errMessages);
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
            if($duplicateCount > 0)
            {
                //エントリー団体IDから団体名を取得
                $duplicateOrgName = $t_organizations->getEntrysystemOrgIdCount($entrysystemOrgId);
                //エラーメッセージを整形
                $errorMessage = str_replace('[団体名]',$duplicateOrgName,str_replace('[団体ID]', $organizationInfo['entrysystemOrgId'],$entrysystemOrgId_registered));
                $validator->errors()->add('entrysystemOrgId', $errorMessage);
            }

            //創立年が、数値ではない、1750年より前、現在より後、のいずれかの場合エラー
            //不正な値です。適切な西暦を入力してください。
            if( !empty($foundingYear) &&
                (!is_numeric($foundingYear)
                    || $foundingYear < $foundingYear_min
                    || $foundingYear > date('Y'))
                ){
                $validator->errors()->add('foundingYear_failed', $foundingYear_failed);
            }
            //不正な郵便番号です、適切な郵便番号を入力してください（数字３桁-数字４桁）
            if ( !is_numeric($post_code_upper)
                || !is_numeric($post_code_lower)
                || (strlen($post_code_upper) != 3)
                || (strlen($post_code_lower) != 4)
                ){
                $validator->errors()->add('postCode_failed', $postCode_failed);
            }
            //JARA証跡を設定しない場合、JARA団体種別は"任意"を選択してください。
            if ( empty($jara_org_reg_trail) &&  $jara_org_type == "1") {
                $validator->errors()->add('jaraOrgType_official_failed', $jaraOrgType_official_failed);
            }
            //JARA証跡を設定する場合、JARA団体種別は"正式"を選択してください。
            if ( !empty($jara_org_reg_trail) &&  $jara_org_type == "0") {
                $validator->errors()->add('jaraOrgType_private_failed', $jaraOrgType_private_failed);
            }
            //県ボ証跡を設定しない場合、県ボ団体種別は"任意"を選択してください。
            if ( empty($pref_org_reg_trail) &&  $pref_org_type == "1") {
                $validator->errors()->add('prefOrgType_official_failed', $prefOrgType_official_failed);
            }
            //県ボ証跡を設定する場合、県ボ団体種別は"正式"を選択してください。
            if ( !empty($pref_org_reg_trail) &&  $pref_org_type == "0") {
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
            $organizationInfo['post_code'] = $organizationInfo['postCodeUpper'].$organizationInfo['postCodeLower'];
            $organizationInfo['previousPageStatus'] = "success";
            //団体区分名をセット
            $organizationInfo['org_class_name'] = $m_organization_class->getOrganizationClassName($organizationInfo['orgClass']);

            //スタッフ名の取得
            $staff_index = 1;
            while(true){
                //無限に繰り返す処理を記載
                if(isset($organizationInfo['staff'.$staff_index.'_user_id'])){
                    //取得できているのでユーザー名を取得
                    $user_name = $t_users->getUserName($organizationInfo['staff'.$staff_index.'_user_id']);
                    //ユーザー名を取得できたら「staff_user_nameX」で$organizationInfoに追加
                    //ユーザーID、ユーザー名がセットで入ってたら存在するユーザーとする
                    $organizationInfo['staff'.$staff_index.'_user_name'] = $user_name;
                    //スタッフ種別を取得する
                    $target_staff_type_id = $organizationInfo['staff'.$staff_index.'_type'];
                    $organizationInfo['staff'.$staff_index.'_type_display'] = $mStaffType->getStaffTypeName($target_staff_type_id);
                }
                else{
                    //スタッフが入力されていなかったらループを抜ける
                    break;
                }
                $staff_index++;
            }
            return redirect('organization/register/confirm')->with('organizationInfo',$organizationInfo);
        }
    }

    //団体更新画面で確認ボタンを押下したときに発生するイベント
    public function storeEditConfirm(Request $request,
                                        T_organizations $t_organizations,
                                        M_prefectures $m_prefectures,
                                        T_users $t_users,
                                        M_organization_class $m_organization_class,
                                        M_staff_type $mStaffType) : RedirectResponse
    {
        if(Auth::user()->temp_password_flag === 1)
        {
            return redirect('user/password-change');
        }
        else
        {
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
            $validator = Validator::make($request->all(), $rules,$errMessages);
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
            $duplicateCount = $t_organizations->getEntrysystemOrgIdCountWithOrgId($entrysystemOrgId,$org_id);
            if($duplicateCount > 0)
            {
                //エントリー団体IDから団体名を取得
                $duplicateOrgInfo = $t_organizations->getOrgInfoFromEntrySystemOrgId($entrysystemOrgId);
                //エラーメッセージを整形
                $errorMessage = str_replace('[団体名]',$duplicateOrgInfo->org_name,str_replace('[団体ID]', $duplicateOrgInfo->org_id,$entrysystemOrgId_registered));
                $validator->errors()->add('entrysystemOrgId', $errorMessage);
            }

            //創立年が、数値ではない、1750年より前、現在より後、のいずれかの場合エラー
            //不正な値です。適切な西暦を入力してください。
            if( !is_numeric($foundingYear)
                || $foundingYear < $foundingYear_min
                || $foundingYear > date('Y')){
                $validator->errors()->add('foundingYear_failed', $foundingYear_failed);
            }
            //不正な郵便番号です、適切な郵便番号を入力してください（数字３桁-数字４桁）
            if ( !is_numeric($post_code_upper)
                || !is_numeric($post_code_lower)
                || (strlen($post_code_upper) != 3)
                || (strlen($post_code_lower) != 4)
                ){
                $validator->errors()->add('postCode_failed', $postCode_failed);
            }
            //JARA証跡を設定しない場合、JARA団体種別は"任意"を選択してください。
            if ( empty($jara_org_reg_trail) &&  $jara_org_type == "1") {
                $validator->errors()->add('jaraOrgType_official_failed', $jaraOrgType_official_failed);
            }
            //JARA証跡を設定する場合、JARA団体種別は"正式"を選択してください。
            if ( !empty($jara_org_reg_trail) &&  $jara_org_type == "0") {
                $validator->errors()->add('jaraOrgType_private_failed', $jaraOrgType_private_failed);
            }
            //県ボ証跡を設定しない場合、県ボ団体種別は"任意"を選択してください。
            if ( empty($pref_org_reg_trail) &&  $pref_org_type == "1") {
                $validator->errors()->add('prefOrgType_official_failed', $prefOrgType_official_failed);
            }
            //県ボ証跡を設定する場合、県ボ団体種別は"正式"を選択してください。
            if ( !empty($pref_org_reg_trail) &&  $pref_org_type == "0") {
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
            $organizationInfo['post_code'] = $organizationInfo['postCodeUpper'].$organizationInfo['postCodeLower'];
            //団体区分名をセット
            $organizationInfo['org_class_name'] = $m_organization_class->getOrganizationClassName($organizationInfo['orgClass']);
            $organizationInfo['previousPageStatus'] = "success";

            //スタッフ名の取得
            $staff_index = 1;
            while(true){
                //無限に繰り返す処理を記載
                if(isset($organizationInfo['staff'.$staff_index.'_user_id'])){
                    //取得できているのでユーザー名を取得
                    $user_name = $t_users->getUserName($organizationInfo['staff'.$staff_index.'_user_id']);
                    //ユーザー名を取得できたら「staff_user_nameX」で$organizationInfoに追加
                    //ユーザーID、ユーザー名がセットで入ってたら存在するユーザーとする
                    $organizationInfo['staff'.$staff_index.'_user_name'] = $user_name;
                    //スタッフ種別を取得する
                    $target_staff_type_id = $organizationInfo['staff'.$staff_index.'_type'];
                    $organizationInfo['staff'.$staff_index.'_type_display'] = $mStaffType->getStaffTypeName($target_staff_type_id);
                }
                else{
                    //スタッフが入力されていなかったらループを抜ける
                    break;
                }
                $staff_index++;
            }

            $targetUrl = 'organization/edit/'.$organizationInfo['org_id'].'/confirm';
            return redirect($targetUrl)->with(['organizationInfo'=>$organizationInfo]);
        }
    }

    //登録（挿入）実行
    public function storeConfirmRegister(Request $request,T_organizations $tOrganizations,T_organization_staff $tOrganizationStaff)
    {
        if(Auth::user()->temp_password_flag === 1)
        {
            return redirect('user/password-change');
        }
        else
        {
            DB::beginTransaction();
            try{
                //確認画面から登録
                $organizationInfo = $request->all();
                $lastInsertId = $tOrganizations->insertOrganization($organizationInfo);
                //新しく入力されたスタッフをInsertする
                $insert_values = array();
                $insertValues = $this->generateInsertStaffValues($organizationInfo,$lastInsertId,$insert_values);
                $tOrganizationStaff->insertOrganizationStaff($insertValues,$insert_values);

                DB::commit();
                $page_status = "完了しました";
                $page_url = route('my-page');
                $page_url_text = "マイページ";
                    
                return view('change-notification',['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
            }
            catch (\Throwable $e){
                DB::rollBack();
                dd($e);
                dd("stop");
            }
        }
    }

    //団体所属スタッフテーブルを更新するための条件文を生成する
    private function generateUpdateStaffCondition($organizationInfo,&$values)
    {
        $staff_index = 1;        
        $condition = "";
        while(true)
        {
            if(empty($organizationInfo["staff".$staff_index."_user_id"]))
            {
                break;
            }

            if(isset($organizationInfo["staff".$staff_index."_user_id"])
                && isset($organizationInfo["staff".$staff_index."_user_name"]))
            {
                //SQLのstringを置き換える文字列の生成
                $condition .= "or ( `user_id`= :staff".$staff_index."_user_id"
                                         ."' and `staff_type_id`= :staff".$staff_index."_type)";
                //代入する変数を連想配列に格納
                $values["staff".$staff_index."_user_id"] = $organizationInfo["staff".$staff_index."_user_id"];
                $values["staff".$staff_index."_type"] = $organizationInfo["staff".$staff_index."_type"];
            }

            $staff_index++;
        }
        $condition = ltrim($condition,"or ");
        return $condition;
    }

    //団体所属スタッフテーブルに挿入するValueを生成する
    private function generateInsertStaffValues($organizationInfo,$org_id,&$values)
    {   
        $staff_index = 1;
        $currentDatetime = NOW();
        $replace_string = "";

        //共通の値を先に配列に格納しておく
        $values["org_id"] = $org_id;
        $values["current_datetime"] = $currentDatetime;
        $values["user_id"] = Auth::user()->user_id;
        $values["delete_flag"] = 0;
        //スタッフごとの処理
        while(true)
        {
            if(empty($organizationInfo["staff".$staff_index."_user_id"]))
            {
                break;
            }

            if(isset($organizationInfo["staff".$staff_index."_user_id"])
                && isset($organizationInfo["staff".$staff_index."_user_name"]))
            {
                //置き換える文字列を生成
                $replace_string .= "union select :org_id AS `org_id`,";
                $replace_string .= ":staff".$staff_index."_user_id AS `user_id`,";
                $replace_string .= ":staff".$staff_index."_type AS `staff_type_id`,";
                $replace_string .= ":current_datetime AS `registered_time`,";
                $replace_string .= ":user_id AS `registered_user_id`,";
                $replace_string .= ":current_datetime AS `updated_time`,";
                $replace_string .= ":user_id AS `updated_user_id`,";
                $replace_string .= ":delete_flag AS `delete_flag`";

                //SQLに代入する値の配列を生成
                $values["staff".$staff_index."_user_id"] = $organizationInfo["staff".$staff_index."_user_id"];
                $values["staff".$staff_index."_type"] = $organizationInfo["staff".$staff_index."_type"];
            }
            $staff_index++;
        }
        //置き換えるときselectに続くようにしたいので「union select」を除く
        $values = ltrim($replace_string,"union select ");
        return $values;
    }

    //in句に置き換えられるような選手IDの条件文を生成する
    //id1,id2,・・・
    private function generateIdCondition($ids,$idName)
    {
        $conditionStr = "";
        foreach($ids as $id)
        {
            $conditionStr .= $id->$idName.',';
        }
        $conditionStr = rtrim($conditionStr,",");
        return $conditionStr;
    }

    //削除画面の[削除]ボタンで、団体情報の削除を実行
    public function deleteOrganization(Request $request,
                                        T_organizations $tOrganization,
                                        T_organization_players $tOrganizationPlayers,
                                        T_organization_staff $tOrganizationStaff)
    {
        if(Auth::user()->temp_password_flag === 1)
        {
            return redirect('user/password-change');
        }
        else{
            DB::beginTransaction();
            try{
                $organizationInfo = $request->all();
                $org_id = $organizationInfo['org_id'];

                //団体所属スタッフを削除
                $tOrganizationStaff->updateDeleteFlagByOrganizationDeletion($org_id);
                //団体所属選手を削除
                $tOrganizationPlayers->updateDeleteFlagByOrganizationDeletion($org_id);
                //団体を削除
                $tOrganization->updateDeleteFlag($org_id);
                
                DB::commit();
                $page_status = "完了しました";
                $page_url = route('my-page');
                $page_url_text = "マイページ";
                    
                return view('change-notification',['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
            }
            catch(\Throwable $e){
                DB::rollBack();
                dd($e);
                dd("stop");
            }
        }
    }

    //更新実行
    public function storeConfirmEdit(Request $request,T_organizations $tOrganizations,T_organization_staff $tOrganizationStaff)
    {
        if(Auth::user()->temp_password_flag === 1){
            return redirect('user/password-change');
        }
        else
        {
            DB::beginTransaction();
            try{
                //確認画面から登録
                $organizationInfo = $request->all();
                $tOrganizations->updateOrganization($organizationInfo);

                //前のスタッフをupdateする。
                $update_values = array();
                $updateCondition = $this->generateUpdateStaffCondition($organizationInfo,$update_values);
                $tOrganizationStaff->updateDeleteFlagInOrganizationStaff($updateCondition,$update_values);
                //新しく入力されたスタッフをInsertする
                $insert_values = array();
                $insertValues = $this->generateInsertStaffValues($organizationInfo,$organizationInfo['org_id'],$insert_values);
                $tOrganizationStaff->insertOrganizationStaff($insertValues,$insert_values);
                
                DB::commit();
                $page_status = "完了しました";
                $page_url = route('my-page');
                $page_url_text = "マイページ";            
                return view('change-notification',['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
            }
            catch(\Throwable $e){
                DB::rollBack();
                dd($e);
                dd("stop");
            }
        }
    }

    //団体検索を実行
    public function searchOrganization(Request $request,T_organizations $tOrganizations) : View
    {
        $searchInfo = $request->all();
        $searchValue = [];
        $searchCondition = $this->generateOrganizationSearchCondition($searchInfo, $searchValue);        
        $organizations = $tOrganizations->getOrganizationWithSearchCondition($searchCondition,$searchValue);
        dd($organizations);
    }

    private function generateOrganizationSearchCondition($searchInfo, &$searchValue)
    {
        $condition = "";
        //エントリーシステムの団体IDの条件
        if(isset($searchInfo['entrysystemOrgId']))
        {
            $condition .= " and `t_organizations`.`entrysystem_org_id`= ?";
            array_push($searchValue,$searchInfo['entrysystemOrgId']);
        }
        //団体IDの条件
        if(isset($searchInfo['org_id']))
        {
            $condition .= " and `t_organizations`.`org_id`= ?";
            array_push($searchValue,$searchInfo['org_id']);
        }
        //団体名の条件
        if(isset($searchInfo['org_name']))
        {
            $condition .= "and `t_organizations`.`org_name` LIKE ?";
            array_push($searchValue,'%'.$searchInfo['org_name'].'%');
        }
        //団体種別の条件
        if(isset($searchInfo['org_type']))
        {
            if($searchInfo['org_type'] === "1")
            {
                $condition .= " and (`t_organizations`.`jara_org_type`= ? or `t_organizations`.`pref_org_type`= ?)";
            }
            elseif($searchInfo['org_type'] === "0")
            {
                $condition .= " and (`t_organizations`.`jara_org_type`= ? and `t_organizations`.`pref_org_type`= ?)";
            }
            array_push($searchValue,$searchInfo['org_type']);
            array_push($searchValue,$searchInfo['org_type']);
        }
        //団体区分の条件
        if(isset($searchInfo['org_class']))
        {
            $condition .= " and `t_organizations`.`org_class`= ?";
            array_push($searchValue,$searchInfo['org_class']);
        }
        //創立年開始の条件
        if(isset($searchInfo['foundingYear_start']))
        {
            $condition .= " and `t_organizations`.`founding_year`>= ?";
            array_push($searchValue,$searchInfo['foundingYear_start']);
        }
        //創立年終了の条件
        if(isset($searchInfo['foundingYear_end']))
        {
            $condition .= " and `t_organizations`.`founding_year`<= ?";
            array_push($searchValue,$searchInfo['foundingYear_end']);
        }
        //国の条件
        if(isset($searchInfo['country']))
        {
            $condition .= " and `t_organizations`.`location_country`= ?";
            array_push($searchValue,$searchInfo['country']);
        }
        //都道府県の条件
        $japanCode = "112";   //日本の国コード
        if(isset($searchInfo['prefecture']) && ($searchInfo['country'] === $japanCode))
        {
            $condition .= " and `t_organizations`.`location_prefecture`= ?";
            array_push($searchValue,$searchInfo['prefecture']);
        }
        return $condition;
    }
    
    public function createManagement(): View
    {
        $organizations = DB::select('select * from t_organizations');
        return view('organizations.management', ['organizations' => $organizations]);
    }
}