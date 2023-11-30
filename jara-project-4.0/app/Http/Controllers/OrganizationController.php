<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    //
    public function create()
    {
        return view('organizations.register-edit');
    }

    public function store(Request $request)
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        $request->validate([
            'orgName' => ['required'],          //団体名
            'foundingYear' => ['required'],     //創立年
            'postCode' => ['required'],         //郵便番号
            'prefecture' => ['required'],       //都道府県
            'municipalities' => ['required'],   //市区町村
            'streetAddress' => ['required'],    //町字番地
            'apartment' => ['required'],        //建物名 マンション・アパート
            'orgClass' => ['required'],         //団体区分
            'managerUserId' => ['required'],    //管理者のユーザID
        ],[
           'orgName.required' => $orgName_required, 
           'foundingYear.required' => $foundingYear_required,
           'postCode.require' => $postCode_required,
           'prefecture.require' => $prefecture_required,
           'municipalities.require' => $municipalities_required,
           'streetAddress.require' => $streetAddress_required,
           'apartment.require' => $apartment_required,
           'orgClass.require' => $orgClass_required,
           'managerUserId.require' => $managerUserId_required,
        ]);
    }
}