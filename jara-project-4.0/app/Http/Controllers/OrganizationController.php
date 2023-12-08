<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;

use App\Models\T_organization;
use App\Models\M_organization_type;
use App\Models\M_organization_class;
use App\Models\M_prefectures;
use Illuminate\Support\Str;

class OrganizationController extends Controller
{
    //団体情報登録画面を開く
    public function create(M_organization_type $mOrganizationType,
                            M_organization_class $mOrganizationClass,
                            M_prefectures $mPrefectures)
    {
        $mOrgType = $mOrganizationType->getOrganizationType();
        $mOrgClass = $mOrganizationClass->getOrganizationClass();
        $mPref = $mPrefectures->getPrefecures();
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
                                    M_prefectures $mPrefectures)
    {
        $tOrg = $tOrganization->getOrganization($targetOrgId);
        $mOrgType = $mOrganizationType->getOrganizationType();
        $mOrgClass = $mOrganizationClass->getOrganizationClass();
        $mPref = $mPrefectures->getPrefecures();

        //郵便番号を分割して持たせておく
        $post_code = $tOrg->post_code;
        $tOrg->post_code_upper = Str::substr($post_code,0,3);
        $tOrg->post_code_lower = Str::substr($post_code,3,4);
        return view('organizations.register-edit',["pagemode"=>"edit"
                                                    ,"organization"=>$tOrg
                                                    ,"organizationType"=>$mOrgType
                                                    ,"organizationClass"=>$mOrgClass
                                                    ,"prefectures"=>$mPref]
                                                );
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

    //登録画面でボタンを押したとき
    public function submitRegister(Request $request)
    {
        if($request->has('confirmButton'))
        {
            $this->storeConfirm($request);
        }
    }

    //更新画面でボタンを押したとき
    public function submitEdit(Request $request)
    {
        if($request->has('confirmButton'))
        {
            storeConfirmEdit($request);
        }
    }

    //団体情報登録画面で確認ボタンを押したときに発生するイベント
    private function storeConfirm(Request $request)
    {
        $organizationInfo = $request->all();
        include('Auth/ErrorMessages/ErrorMessages.php');
        $request->validate([
            'entrysystemOrgId' => ['unique:t_organizations,entrysystem_org_id'],    //エントリー団体ID
            'orgName' => ['required'],          //団体名
            'foundingYear' => ['required'],     //創立年
            'postCodeUpper' => ['required'],    //郵便番号上3桁
            'postCodeLower' => ['required'],    //郵便番号下4桁
            'prefecture' => ['required'],       //都道府県
            'address1' => ['required'],   //市区町村・町字番地
            'address2' => ['required'],    //建物名 マンション・アパート
            'orgClass' => ['required'],         //団体区分
            'managerUserId' => ['required'],    //管理者のユーザID
        ],[
            'entrysystemOrgId.unique' => str_replace('[団体ID]', $organizationInfo['entrysystemOrgId'],$entrysystemOrgId_unique),
            'orgName.required' => $orgName_required, 
            'foundingYear.required' => $foundingYear_required,
            'postCodeUpper.required' => $postCode_required,
            'postCodeLower.required' => $postCode_required,
            'prefecture.required' => $prefecture_required,
            'address1.required' => $address1_required,
            'address2.required' => $address2_required,
            'orgClass.required' => $orgClass_required,
            'managerUserId.required' => $managerUserId_required,
        ]);
         
         $organizationInfo['post_code'] = $organizationInfo['postCodeUpper'].$organizationInfo['postCodeLower'];
         $organizationInfo['previousPageStatus'] = "success";
         return redirect('organization/register/confirm')->with('organizationInfo',$organizationInfo);
    }

    //団体更新画面で確認ボタンを押下したときに発生するイベント
    private function storeEditConfirm(Request $request)
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        $request->validate([
            'orgName' => ['required'],          //団体名
            'foundingYear' => ['required'],     //創立年
            'postCodeUpper' => ['required'],    //郵便番号
            'postCodeLower' => ['required'],    //郵便番号
            'prefecture' => ['required'],       //都道府県
            'municipalities' => ['required'],   //市区町村
            'streetAddress' => ['required'],    //町字番地
            'apartment' => ['required'],        //建物名 マンション・アパート
            'orgClass' => ['required'],         //団体区分
            'managerUserId' => ['required'],    //管理者のユーザID
        ],[
           'orgName.required' => $orgName_required, 
           'foundingYear.required' => $foundingYear_required,
           'postCodeUpper.required' => $postCode_required,
           'postCodeLower.required' => $postCode_required,
           'prefecture.required' => $prefecture_required,
           'municipalities.required' => $municipalities_required,
           'streetAddress.required' => $streetAddress_required,
           'apartment.required' => $apartment_required,
           'orgClass.required' => $orgClass_required,
           'managerUserId.required' => $managerUserId_required,
        ]);
        $organizationInfo = $request->all();
        $organizationInfo['post_code'] = $organizationInfo['postCodeUpper'].$organizationInfo['postCodeLower'];
        $organizationInfo['previousPageStatus'] = "success";        
        return redirect('organization/edit/confirm')->with('organizationInfo',$organizationInfo);
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
                
            return redirect('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
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
                
            return redirect('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
        }
    }

    public function createManagement(): View
    {
        $organizations = DB::select('select * from t_organizations');
        return view('organizations.management', ['organizations' => $organizations]);
    }

}