{{--*************************************************************************
* Project name: JARA
* File name: registered-confirm.blade.php
* File extension: .blade.php
* Description: This is the ui of organization's edit and update confirmation page
*************************************************************************
* Author: t_futamura
* Created At: 2023/11/30
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

    <link rel="stylesheet" type="text/css" href="{{ asset('css/organization-edit.css') }}">
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
                @if($pagemode == "register")
                    <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">確認</h1>
                @elseif($pagemode == "edit")
                    <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">確認［団体名］</h1>
                @endif
            @endif
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">
        <form class="form-horizontal" enctype="multipart/form-data" role="form" style="display: flex" method="POST">
            @csrf
            {{-- <div class="alert alert-info alert-dismissable">
                        <a class="panel-close close" data-dismiss="alert">×</a>
                        <i class="fa fa-coffee"></i>
                        This is an <strong>.alert</strong>. Use this to show important messages to the user.
                </div> --}}
            <div class="row" style="padding:10px 0px;width: 100%;">
                <!-- 複数要因によるエラーメッセージ表示エリア -->
                <div class="col-md-10">
                    <div class="form-group">
                        <label for="entrysystemOrgId" class="col-md-6" style="text-align: right"><b>エントリーシステムの団体ID：</b></label>
                        <input id="entrysystemOrgId" name="entrysystemOrgId" value="{{session()->get('organizationInfo')['entrysystemOrgId']}}" readonly>
                    </div>
                    <div class="form-group">
                        <label for="orgName" class="col-md-6" style="text-align: right"><b>団体名：</b></label>
                        <input id="orgName" name="orgName" value="{{session()->get('organizationInfo')['orgName']}}" readonly>
                    </div>
                    <div class="form-group">
                        <label for="foundingYear" class="col-md-6" style="text-align: right"><b>創立年：</b></label>
                        <input id="foundingYear" name="foundingYear" value="{{session()->get('organizationInfo')['foundingYear']}}" readonly>
                    </div>
                    <div class="form-group">
                        <label for="prefecture" class="col-md-6" style="text-align: right"><b>所在地(都道府県)：</b></label>
                        <input id="prefecture" name="prefecture" value="{{session()->get('organizationInfo')['prefecture']}}" readonly>
                    </div>
                    <div class="form-group">
                        <label for="municipalities" class="col-md-6" style="text-align: right"><b>所在地(市区町村)：</b></label>
                        <input id="municipalities" name="municipalities" value="{{session()->get('organizationInfo')['municipalities']}}" readonly>
                    </div>
                    <div class="form-group">
                        <label for="streetAddress" class="col-md-6" style="text-align: right"><b>所在地(町字番地)：</b></label>
                        <input id="streetAddress" name="streetAddress" value="{{session()->get('organizationInfo')['streetAddress']}}" readonly>
                    </div>
                    <div class="form-group">
                        <label for="apartment" class="col-md-6" style="text-align: right"><b>所在地(建物)：</b></label>
                        <input id="apartment" name="apartment" value="{{session()->get('organizationInfo')['apartment']}}" readonly>
                    </div>
                    <div class="form-group">
                        <label for="orgClass" class="col-md-6" style="text-align: right"><b>団体区分：</b></label>
                        <input id="orgClass" name="orgClass" value="{{session()->get('organizationInfo')['orgClass']}}" readonly>
                    </div>
                    <div class="form-group">
                        <div class="row">
                            <label for="jaraOrgRegTrail" class="col-md-6" style="text-align: right"><b>証跡：</b></label>
                            <label class="col-md-1" style="text-align: right">JARA：</label>
                            <input id="jaraOrgRegTrail" name="jaraOrgRegTrail" value="{{session()->get('organizationInfo')['jaraOrgRegTrail']}}" readonly>
                        </div>
                        <div class="row">
                            <label for="prefOrgRegTrail" class="col-md-6" style="text-align: right"></label>
                            <label class="col-md-1" style="text-align: right">県ボ：</label>
                            <input id="prefOrgRegTrail" name="prefOrgRegTrail" value="{{session()->get('organizationInfo')['prefOrgRegTrail']}}" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="row">
                            <label for="jaraOrgType" class="col-md-6" style="text-align: right"><b>団体種別：</b></label>
                            <label class="col-md-1" style="text-align: right">JARA：</label>
                            <input id="jaraOrgType" name="jaraOrgType" value="{{session()->get('organizationInfo')['jaraOrgType']}}" readonly>
                        </div>
                        <div class="row">
                            <label for="prefOrgType" class="col-md-6" style="text-align: right"></label>
                            <label class="col-md-1" style="text-align: right">県ボ：</label>
                            <input id="prefOrgType" name="prefOrgType" value="{{session()->get('organizationInfo')['prefOrgType']}}" readonly>
                        </div>
                    </div>
<!--      
                    <div class="form-group">
                        <label for="managerUser" class="col-md-6" style="text-align: right"><b>管理者（監督）：</b></label>

                    </div>
                    <div class="form-group">
                        <label for="headUser" class="col-md-6" style="text-align: right"><b>部長：</b></label>
                        
                    </div>
                    <div class="form-group">
                        <label for="coachUser" class="col-md-6" style="text-align: right"><b>コーチ：</b></label>
                        
                    </div>
                    <div class="form-group">
                        <label for="actingManagerUser1" class="col-md-6" style="text-align: right"><b>監督代行１：</b></label>
                        
                    </div>
                    <div class="form-group">
                        <label for="actingManagerUser2" class="col-md-6" style="text-align: right"><b>監督代行２：</b></label>
                        
                    </div>
                    <div class="form-group">
                        <label for="actingManagerUser3" class="col-md-6" style="text-align: right"><b>監督代行３：</b></label>
                        
                    </div>
                     -->
                    <!-- 確認・戻るボタン -->
                    <div class="form-group row" style="padding: 2rem">
                        <div class="col-sm-2 offset-sm-4">
                            <button class="btn btn-success btn-lg btn-block">登録</button>
                        </div>                        
                        <div class="col-sm-2">
                            <a class="btn btn-danger btn-lg btn-block" href="../../dashboard" role="button">戻る</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <!--19.マイページ -->
                    <input type="submit" value="マイページ" id="mypageButton">
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