<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    //団体情報登録画面を開く
    public function create()
    {
        return view('organizations.register-edit',["pagemode"=>"register"]);
    }

    //団体情報更新画面を開く
    public function createEditPage(Request $request)
    {
        return view('organizations.register-edit',["pagemode"=>"edit","request"=>$request->all()]);
    }

    //団体情報登録・更新確認画面を開く
    public function createConfirm()
    {
        return view('organizations.register-confirm',["pagemode"=>"register"]);
    }

    public function storeRegister(Request $request)
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
         $organizationInfo['previousPageStatus'] = "success";
         $pagemode = "register";         
         return view('organizations.register-confirm')->with(['organizationInfo' => $organizationInfo,'pagemode' => $pagemode,]);         
    }
}