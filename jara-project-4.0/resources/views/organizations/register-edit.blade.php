{{--*************************************************************************
* Project name: JARA
* File name: profile-edit.blade.php
* File extension: .blade.php
* Description: This is the ui for the edit and update page of the organization.
*************************************************************************
* Author: t_futamura
* Created At: 2023/11/27
* Updated At: 
*************************************************************************
*
* Copyright 2023 by DPT INC.
*
************************************************************************--}}
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Profile Edit</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
        integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">

    <link rel="stylesheet" type="text/css" href="{{ asset('css/organization.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/nav.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/style.css') }}">

    {{-- Date Picker --}}
    <link rel="stylesheet" href="https://unpkg.com/flatpickr/dist/flatpickr.min.css">
</head>

<body>
    {{-- background-color: #9FD9F6; --}}
    <div class="container-fluid bootstrap snippets bootdey">
        <!--style="background: linear-gradient(to right,#1991FC,  #45b796);padding:0;color: #000;font-weight:500">-->
        <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
            <a href="#">ダッシュボード</a>
            <a href="#">情報更新</a>
            <a href="#">情報参照</a>
            <a href="#">アカウント削除</a>
        </div>
        <!--1.引数によって表示を変える-->
        <div style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff;padding-top:15px;">
            <span class="col-md-3 " style="font-size:30px;cursor:pointer" onclick="openNav()">&#9776; メニュー</span>
            @if(Session::has('fromLoginPage'))
                <h1 class="text-right col-md-8">{{ Session::get('fromLoginPage') }}</h1>
            @else
                @if($pagemode=="register")
                    <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">団体登録</h1>
                @elseif($pagemode=="edit")
                    <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">更新</h1>
                @endif
            @endif
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">
        
        <!--19.マイページ -->
        <input type="submit" value="マイページ" id="mypageButton">
        <form class="form-horizontal" enctype="multipart/form-data" role="form" style="display: flex" method="POST">        
            @csrf
            {{-- <div class="alert alert-info alert-dismissable">
                        <a class="panel-close close" data-dismiss="alert">×</a>
                        <i class="fa fa-coffee"></i>
                        This is an <strong>.alert</strong>. Use this to show important messages to the user.
                </div> --}}
            @if($pagemode==="edit")
                <input name="org_id" type="hidden" value="{{$organization->org_id}}">
            @endif
            <div class="row" style="padding:10px 0px;width: 100%;">
                <div class="col-md-8 offset-md-1">
                    <div class="form-group">
                        <!-- <div id="organizations-edit-error1">
                            <label>2.複数要因によるエラーメッセージ表示エリア</label>
                        </div> -->
                        <!--3.エントリーシステムの団体ID -->
                        <label for="entrysystemOrgId" class="col-md-5" style="text-align: right">エントリーシステムの団体ID</label>
                        @if($pagemode==="register")
                            <input type="text" id="entrysystemOrgId" name="entrysystemOrgId" value="{{old('entrysystemOrgId')}}" size="10">
                        @elseif($pagemode==="edit")
                            <input type="text" id="entrysystemOrgId" name="entrysystemOrgId" value="{{ old('entrysystemOrgId',$organization->entrysystem_org_id) }}" size="10">
                        @endif
                        @if ($errors->has('entrysystemOrgId'))
                            <p style="margin: 1rem; font-weight:bold; color:red; text-align: center">{{ $errors->first('entrysystemOrgId') }}</p>
                        @endif
                    </div>
                    <!--5.団体名 -->
                    <div class="form-group">
                        <label for="orgName" class="col-md-5" style="text-align: right">*団体名</label>                        
                        @if($pagemode==="register")
                            <input type="text" name="orgName" id="orgName" value="{{old('orgName')}}">    
                        @elseif($pagemode==="edit")
                            <input type="text" name="orgName" id="orgName" value="{{old('orgName',$organization->org_name)}}">
                        @endif
                        <!--6.エラーメッセージ表示エリア -->
                        @if ($errors->has('orgName'))
                            <p style="margin: 1rem; font-weight:bold; color:red; text-align: center">{{ $errors->first('orgName') }}</p>
                        @endif
                    </div>
                    <div class="form-group">
                        <label for="foundingYear" class="col-md-5" style="text-align: right">創立年</label>
                        @if($pagemode==="register")
                            <input type="input" name="foundingYear" id="foundingYear" value="{{old('foundingYear')}}">
                        @elseif($pagemode==="edit")
                            <input type="input" name="foundingYear" id="foundingYear" value="{{old('foundingYear',$organization->founding_year)}}">
                        @endif
                        <!--8.エラーメッセージ表示エリア -->
                        @if ($errors->has('foundingYear_failed'))
                            <p style="margin: 1rem; font-weight:bold; color:red; text-align: center">{{ $errors->first('foundingYear_failed') }}</p>
                        @endif
                    </div>
                    <div class="form-group">
                        <label for="postCode" class="col-md-5" style="text-align: right">*所在地</label>
                        <label>〒</label>
                        @if($pagemode==="register")
                            <input type="text" name="postCodeUpper" id="postCodeUpper" size="3" maxlength="3" value="{{old('postCodeUpper')}}">
                        @elseif($pagemode==="edit")
                            <input type="text" name="postCodeUpper" id="postCodeUpper" size="3" maxlength="3" value="{{old('postCodeUpper',$organization->post_code_upper)}}">
                        @endif
                        <label>－</label>
                        @if($pagemode==="register")
                            <input type="text" name="postCodeLower" id="postCodeLower" size="4" maxlength="4" value="{{old('postCodeLower')}}">
                        @elseif($pagemode==="edit")
                            <input type="text" name="postCodeLower" id="postCodeLower" size="4" maxlength="4" value="{{old('postCodeLower',$organization->post_code_lower)}}">
                        @endif
                            <input type="button" value="住所検索" onclick=getAddressFromPostCode()>
                    </div>
                    <div class="form-group">
                        <label for="prefecture" class="col-md-6" style="text-align: right">都道府県</label>
                        <select id="prefecture" name="prefecture">
                        @foreach($prefectures as $prefecture)
                            @if($pagemode==="register")
                                <option value="{{$prefecture->pref_code_jis}}" {{ old('prefecture') == $prefecture->pref_code_jis ? "selected" : ""}}>{{$prefecture->pref_name}}</option>
                            @elseif($pagemode==="edit")                                
                                @if(empty(old('prefecture')))
                                    <option value="{{$prefecture->pref_code_jis}}" {{ $organization->location_prefecture === $prefecture->pref_id ? "selected" : ""}}>{{$prefecture->pref_name}}</option>                                    
                                @else
                                    <option value="{{$prefecture->pref_code_jis}}" {{ old('prefecture') == $prefecture->pref_code_jis ? "selected" : ""}}>{{$prefecture->pref_name}}</option>                                    
                                @endif
                            @endif
                        @endforeach
                        </select>
                    </div>
                    <div class="form-group">
                        @if($pagemode==="register")
                            <input type="text" id="address1" name="address1" class="col-md-4 offset-md-6" value="{{old('address1')}}">
                        @elseif($pagemode==="edit")
                            <input type="text" id="address1" name="address1" class="col-md-4 offset-md-6" value="{{old('address1',$organization->address1)}}">
                        @endif
                        <label for="address1" style="margin-left:1rem;">市区町村・町字番地</label>
                    </div>
                    <div class="form-group">
                        @if($pagemode==="register")
                            <input type="text" id="address2" name="address2" class="col-md-4 offset-md-6" value="{{old('address2')}}">
                        @elseif($pagemode==="edit")
                            <input type="text" id="address2" name="address2" value="{{old('address2',$organization->address2)}}" class="col-md-4 offset-md-6">
                        @endif
                        <label for="address2" style="margin-left:1rem;">マンション・アパート</label>
                        <!--10.エラーメッセージ表示エリア -->                        
                        @if ($errors->has('postCodeUpper'))
                            <p style="margin: 1rem; font-weight:bold; color:red; text-align: center">{{ $errors->first('postCodeUpper') }}</p>
                        @elseif(!$errors->has('postCodeUpper') && $errors->has('postCodeLower'))
                            <p style="margin: 1rem; font-weight:bold; color:red; text-align: center">{{ $errors->first('postCodeLower') }}</p>
                        @elseif ($errors->has('postCode_failed'))
                            <p style="margin: 1rem; font-weight:bold; color:red; text-align: center">{{ $errors->first('postCode_failed') }}</p>
                        @endif

                        @if ($errors->has('prefecture'))
                            <p style="margin: 1rem; font-weight:bold; color:red; text-align: center">{{ $errors->first('prefecture') }}</p>
                        @endif
                        @if ($errors->has('address1'))
                            <p style="margin: 1rem; font-weight:bold; color:red; text-align: center">{{ $errors->first('address1') }}</p>
                        @endif
                        @if($errors->has('address2'))
                            <p style="margin: 1rem; font-weight:bold; color:red; text-align: center">{{ $errors->first('address2') }}</p>
                        @endif
                    </div>
                    <!-- 11.団体区分 -->
                    <div class="form-group">
                        <label for="orgClass" class="col-md-5" style="text-align: right">*団体区分</label>
                        <select id="orgClass" name="orgClass">
                        @foreach($organizationClass as $class)                            
                            @if($pagemode==="register")
                                <!-- <option value="{{$class->org_class_id}}">{{$class->org_class_name}}</option> -->
                                <option value="{{$class->org_class_id}}" {{ old('orgClass') == $class->org_class_id ? "selected" : ""}}>{{$class->org_class_name}}</option>
                            @elseif($pagemode==="edit")
                                @if(empty(old('orgClass')))
                                    <option value="{{$class->org_class_id}}" {{ $organization->org_class === $class->org_class_id ? "selected" : ""}}>{{$class->org_class_name}}</option>
                                @else
                                    <option value="{{$class->org_class_id}}" {{ old('orgClass') == $class->org_class_id ? "selected" : ""}}>{{$class->org_class_name}}</option>
                                @endif
                            @endif
                        @endforeach
                        </select>
                        <!--12.エラーメッセージ表示エリア -->
                        @if ($errors->has('orgClass'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('orgClass') }}</p>
                        @endif
                    </div>
                    <!--13.管理者（監督）のユーザID -->
                    <div class="form-group row">
                        <label for="managerUserId" class="col-md-5" style="text-align: right">*管理者（監督）のユーザID</label>
                        <input type="text" name="managerUserId" id="managerUserId" size="10">
                        <label for="managerUserName" style="margin-left:3px;">ユーザ名</label><!--入力されたIDのユーザ名を表示するエリア-->
                    </div>
                    <!--13.部長のユーザID -->
                    <div class="form-group row">
                        <label for="headUserId" class="col-md-5" style="text-align: right">部長のユーザID</label>
                        <input type="text" name="headUserId" id="headUserId" size="10">
                        <label for="headUserName"style="margin-left:3px;">ユーザ名</label><!--入力されたIDのユーザ名を表示するエリア-->
                    </div>
                    <!--13.コーチのユーザID -->
                    <div class="form-group row">                        
                        <label for="coachUserId" class="col-md-5" style="text-align: right">コーチのユーザID</label>
                        <input type="text" name="coachUserId" id="coachUserId" size="10">
                        <label for="coachUserName" style="margin-left:3px;">ユーザ名</label><!--入力されたIDのユーザ名を表示するエリア-->                       
                    </div>
                    <!--13.監督代理のユーザID -->
                    <div class="form-group row" id="actingManagerUser">                        
                        <label for="actingManagerUserId" class="col-md-5" style="text-align: right">監督代理のユーザID</label>
                        <div id="target">                            
                                <input type="text" name="actingManagerUserId" id="actingManagerUserId" size="10">
                                <label id="actingManagerUserName" style="margin-left:3px; margin-right:3px;">ユーザ名</label>
                        </div>
                    </div>
                    <div class="form-group">
                        {!! $staff_tag !!}
                    <!--14.追加ボタン -->
                        <!-- <div class="col-md-1 offset-md-5">
                            <input type="button" value="追加" onclick=actingManagerAddButtonClick()>
                        </div> -->
                    <!--15.エラーメッセージ表示エリア -->
                    @if($errors->has('managerUserId'))
                        <p style="margin: 1rem; font-weight:bold; color:red; text-align: center">{{ $errors->first('managerUserId') }}</p>
                    @endif
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="row">
                        @if($errors->has('jaraOrgType_official_failed'))
                            <p style="margin: 1rem; font-weight:bold; color:red; text-align: center">{{ $errors->first('jaraOrgType_official_failed') }}</p>
                        @elseif($errors->has('jaraOrgType_private_failed'))
                            <p style="margin: 1rem; font-weight:bold; color:red; text-align: center">{{ $errors->first('jaraOrgType_private_failed') }}</p>
                        @endif
                        @if($errors->has('prefOrgType_official_failed'))
                            <p style="margin: 1rem; font-weight:bold; color:red; text-align: center">{{ $errors->first('prefOrgType_official_failed') }}</p>
                        @elseif($errors->has('prefOrgType_private_failed'))
                            <p style="margin: 1rem; font-weight:bold; color:red; text-align: center">{{ $errors->first('prefOrgType_private_failed') }}</p>
                        @endif
                        <fieldset>
                            <legend>証跡</legend>
                            <p for="jaraOrg">
                                <div class='form-group'>
                                    <label for="jaraOrgRegTrail">JARA証跡</label>
                                    @if($pagemode==="register")
                                        <input type="text" id="jaraOrgRegTrail" name="jaraOrgRegTrail" value="{{old('jaraOrgRegTrail')}}">
                                    @elseif($pagemode==="edit")
                                        <input type="text" id="jaraOrgRegTrail" name="jaraOrgRegTrail" value="{{old('jaraOrgRegTrail',$organization->jara_org_reg_trail)}}">
                                    @endif
                                </div>
                                <div class='form-group'>
                                    <label for="jaraOrgType">JARA団体種別</label>
                                    <select id="jaraOrgType" name="jaraOrgType">
                                    @foreach($organizationType as $type)
                                        @if($pagemode==="register")
                                            <option value="{{$type->org_type}}" {{ old('jaraOrgType') == $type->org_type ? "selected" : ""}}>{{$type->org_type_display_name}}</option>
                                        @elseif($pagemode==="edit")
                                            @if(empty(old('jaraOrgType')))
                                                <option value="{{$type->org_type}}" {{ $organization->jara_org_type === $type->org_type ? "selected" : ""}}>{{$type->org_type_display_name }}</option>
                                            @else
                                                <option value="{{$type->org_type}}" {{ old('jaraOrgType') == $type->org_type ? "selected" : ""}}>{{$type->org_type_display_name}}</option>
                                            @endif
                                        @endif
                                    @endforeach
                                    </select>
                                </div>
                            </p>
                            <p for="prefOrg">
                                <div class='form-group'>
                                    <label for="prefOrgRegTrail">県ボ証跡</label>
                                    @if($pagemode==="register")
                                        <input type="text" id="prefOrgRegTrail" name="prefOrgRegTrail" value="{{old('prefOrgRegTrail')}}">
                                    @elseif($pagemode==="edit")
                                        <input type="text" id="prefOrgRegTrail" name="prefOrgRegTrail" value="{{old('prefOrgRegTrail',$organization->pref_org_reg_trail)}}">
                                    @endif
                                </div>
                                <div class='form-group'>
                                    <label for="prefOrgType">県ボ団体種別</label>
                                    <select id="prefOrgType" name="prefOrgType">
                                    @foreach($organizationType as $type)                                        
                                        @if($pagemode==="register")
                                            <option value="{{$type->org_type}}" {{ old('prefOrgType') == $type->org_type ? "selected" : ""}}>{{$type->org_type_display_name}}</option>
                                        @elseif($pagemode==="edit")
                                            @if(empty(old('prefOrgType')))
                                                <option value="{{$type->org_type}}" {{ $organization->pref_org_type === $type->org_type ? "selected" : ""}}>{{$type->org_type_display_name}}</option>
                                            @else
                                                <option value="{{$type->org_type}}" {{ old('prefOrgType') == $type->org_type ? "selected" : ""}}>{{$type->org_type_display_name}}</option>
                                            @endif
                                        @endif
                                    @endforeach
                                    </select>
                                </div>
                            </p>
                        </fieldset>
                    </div>
                </div>      
                <!-- 確認・戻るボタン -->
                <div class="col-md-8 offset-md-1">
                    <div class="form-group row" style="padding: 2rem">
                        <div class="col-sm-2 offset-sm-4">                            
                            <button class="btn btn-success btn-lg btn-block">確認</button>
                        </div>                        
                        <div class="col-sm-2">
                            <a class="btn btn-danger btn-lg btn-block" href="javascript:history.back()" role="button">戻る</a>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
        integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous">
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous">
    </script>
    {{-- Date Picker Start --}}
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="https://unpkg.com/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js"></script>

    <script>
        // date Picker
        $(".lib-flatpickr3").flatpickr({
            "locale": "ja",
            dateFormat: 'Y/m/d',
            allowInput: true,
            defaultDate: 'null',
        });
    </script>
    {{-- Date Picker End --}}

    <script src="{{ asset('js/nav.js') }}"></script>
    <script src="{{ asset('js/main.js') }}"></script>
    <script src="{{ asset('js/organization.js') }}"></script>
</body>

</html>