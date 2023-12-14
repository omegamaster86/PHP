<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Validator;
use Illuminate\Support\Facades\Session;

use App\Models\T_organization;
use App\Models\M_organization_type;
use App\Models\M_organization_class;
use App\Models\M_prefectures;
use App\Models\T_organization_staff;
use App\Models\M_staff_type;

class OrganizationController extends Controller
{
    private $t_organization_staff;

    //団体情報登録画面を開く
    public function create(M_organization_type $mOrganizationType,
                            M_organization_class $mOrganizationClass,
                            M_prefectures $mPrefectures,
                            M_staff_type $mStaffType)
    {
        $mOrgType = $mOrganizationType->getOrganizationType();
        $mOrgClass = $mOrganizationClass->getOrganizationClass();
        $mPref = $mPrefectures->getPrefecures();
        $mStfType = $mStaffType->getStaffType();
        return view('organizations.register-edit',["pagemode"=>"register"
                                                    ,"organizationType"=>$mOrgType
                                                    ,"organizationClass"=>$mOrgClass
                                                    ,"prefectures"=>$mPref
                                                ]);
    }

    //団体情報更新画面を開く
    public function createEdit($targetOrgId,
                                    T_organization $tOrganization,
                                    M_organization_type $mOrganizationType,
                                    M_organization_class $mOrganizationClass,
                                    M_prefectures $mPrefectures,
                                    T_organization_staff $tOrganizationStaff,
                                    M_staff_type $mStaffType)
    {
        $tOrg = $tOrganization->getOrganization($targetOrgId);
        $mOrgType = $mOrganizationType->getOrganizationType();
        $mOrgClass = $mOrganizationClass->getOrganizationClass();
        $mPref = $mPrefectures->getPrefecures();
        $tStaff = $tOrganizationStaff->getOrganizationStaffFromOrgId($targetOrgId);
        $t_organization_staff = $tStaff;
        $mStfType = $mStaffType->getStaffType();
        //郵便番号を分割して持たせておく
        $post_code = $tOrg->post_code;
        $tOrg->post_code_upper = Str::substr($post_code,0,3);
        $tOrg->post_code_lower = Str::substr($post_code,3,4);

        $staff_tag = $this->createStaffTag($tStaff,$mStfType);        
        //Session::put('staff_tag',$staff_tag);
        return view('organizations.register-edit',["pagemode"=>"edit"
                                                    ,"organization"=>$tOrg
                                                    ,"organizationType"=>$mOrgType
                                                    ,"organizationClass"=>$mOrgClass
                                                    ,"prefectures"=>$mPref
                                                    ,"staff_tag"=>$staff_tag]
                                                );
    }
    
    private function createStaffTag($tStaff, $mStaffType)
    {
        $staff_count = 0;
        $tag = "";

        foreach($tStaff as $staff){            
            $tag .= '<input type="text" id="staff'.($staff_count+1).' name="'.($staff_count+1).' size="10" value="'.$staff->user_id.'">';
            $tag .= '<label for="staff'.($staff_count+1).'">'.$staff->user_name.'</label>';
            $tag .= '<select id="staff'.($staff_count+1).'_type" name="staff'.($staff_count+1).'_type">';

            //<option value="{{$type->org_type}}" {{ old('jaraOrgType') == $type->org_type ? "selected" : ""}}>{{$type->org_type_display_name}}</option>
            foreach($mStaffType as $type)
            {
                if($type->staff_type_id === $staff->staff_type_id){
                    $tag .= '<option value='.$type->staff_type_id.' selected>'.$type->staff_type_name.'</option>';
                }
                else{
                    $tag .= '<option value='.$type->staff_type_id.'>'.$type->staff_type_name.'</option>';
                }
            }
            $tag .= '</select>';
            $staff_count +=1;
        }

        return $tag;
    }

    //団体情報登録・更新確認画面を開く
    public function createConfirm()
    {
        return view('organizations.register-confirm',["pagemode"=>"register"]);
    }

    //団体情報登録・更新確認画面を開く
    public function createEditConfirm()
    {
        return view('organizations.register-confirm',["pagemode"=>"edit"]);
    }

    public function createRefecence()
    {
        return view('organizations.reference',["pagemode"=>"refer"]);
    }

    public function createDelete()
    {
        return view('organizations.reference',["pagemode"=>"delete"]);
    }

    //団体情報登録画面で確認ボタンを押したときに発生するイベント
    public function storeConfirm(Request $request,T_organization $t_organization, M_prefectures $m_prefectures)
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
            'managerUserId' => ['required'],    //管理者のユーザID
        ];

        $errMessages = [
            'orgName.required' => $orgName_required, 
            'foundingYear.required' => $foundingYear_required,
            'postCodeUpper.required' => $postCode_required,            
            'postCodeLower.required' => $postCode_required,            
            'prefecture.required' => $prefecture_required,
            'address1.required' => $address1_required,
            'orgClass.required' => $orgClass_required,
            'managerUserId.required' => $managerUserId_required,
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
        $duplicateCount = $t_organization->getEntrysystemOrgIdCount($entrysystemOrgId);
        if($duplicateCount > 0)
        {
            //エントリー団体IDから団体名を取得
            $duplicateOrgName = $t_organization->getOrgNameFromEntrySystemOrgId($entrysystemOrgId);
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

        $organizationInfo['post_code'] = $organizationInfo['postCodeUpper'].$organizationInfo['postCodeLower'];
        $organizationInfo['previousPageStatus'] = "success";

        dd($organizationInfo);
        return redirect('organization/register/confirm')->with('organizationInfo',$organizationInfo);
    }

    //団体更新画面で確認ボタンを押下したときに発生するイベント
    public function storeEditConfirm(Request $request,T_organization $t_organization,M_prefectures $m_prefectures) : RedirectResponse
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
            'managerUserId' => ['required'],    //管理者のユーザID
        ];

        $errMessages = [
            'orgName.required' => $orgName_required, 
            'foundingYear.required' => $foundingYear_required,
            'postCodeUpper.required' => $postCode_required,
            'postCodeLower.required' => $postCode_required,
            'prefecture.required' => $prefecture_required,
            'address1.required' => $address1_required,
            'orgClass.required' => $orgClass_required,
            'managerUserId.required' => $managerUserId_required,
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
        $duplicateCount = $t_organization->getEntrysystemOrgIdCountWithOrgId($entrysystemOrgId,$org_id);
        if($duplicateCount > 0)
        {
            //エントリー団体IDから団体名を取得
            $duplicateOrgInfo = $t_organization->getOrgInfoFromEntrySystemOrgId($entrysystemOrgId);
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
        
        $organizationInfo['post_code'] = $organizationInfo['postCodeUpper'].$organizationInfo['postCodeLower'];
        $organizationInfo['previousPageStatus'] = "success";

        $targetUrl = 'organization/edit/'.$organizationInfo['org_id'].'/confirm';
        return redirect($targetUrl)->with(['organizationInfo'=>$organizationInfo]);
    }

    //登録（挿入）実行
    public function storeConfirmRegister(Request $request,T_organization $tOrganization,)
    {
        //確認画面から登録
        $organizationInfo = $request->all();
        $result = $tOrganization->insertOrganization($organizationInfo);

        if($result == "success")
        {
            $page_status = "完了しました";
            $page_url = route('my-page');
            $page_url_text = "マイページ";
                
            return view('change-notification',['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
        }
    }

    //更新実行
    public function storeConfirmEdit(Request $request,T_organization $tOrganization)
    {
        //確認画面から登録
        $organizationInfo = $request->all();
        $result = $tOrganization->updateOrganization($organizationInfo);
        if($result == "success")
        {
            $page_status = "完了しました";
            $page_url = route('my-page');
            $page_url_text = "マイページ";            
            return view('change-notification',['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
        }
    }
    public function createManagement(): View
    {
        $organizations = DB::select('select * from t_organizations');
        return view('organizations.management', ['organizations' => $organizations]);
    }

}