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
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">

    <link rel="stylesheet" type="text/css" href="{{ asset('css/tournament.css') }}">
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
            <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">確認</h1>
            @endif
            @endif
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">

        <form class="form-horizontal" enctype="multipart/form-data" role="form" style="display: flex" method="POST">
            @csrf

            @if($pagemode == "edit")
            <input id="org_id" name="org_id" type="hidden" value="">
            @endif
            <input id="pagemode" name="pagemode" type="hidden" value="{{$pagemode}}">
            <div class="row" style="padding:10px 0px;width: 100%;">
                <!-- 複数要因によるエラーメッセージ表示エリア -->
                @if ($errors->has('organization_commit_failed'))
                <p style="margin: 1rem; font-weight:bold; color:red; text-align: center"></p>
                @endif
                <div class="col-md-10">
                    <div class="form-group">
                        <label for="entrysystemOrgId" class="col-md-6" style="text-align: right"><b>大会ID</b></label>
                        <input id="entrysystemOrgId" name="entrysystemOrgId" value="" readonly>
                    </div>
                    <div class="form-group">
                        <label for="entrysystemOrgId" class="col-md-6" style="text-align: right"><b>エントリーシステムの大会ID：</b></label>
                        <input id="entrysystemOrgId" name="entrysystemOrgId" value="" readonly>
                    </div>
                    <div class="form-group">
                        <label for="orgName" class="col-md-6" style="text-align: right"><b>大会名：</b></label>
                        <input id="orgName" name="orgName" value="" readonly>
                    </div>
                    <div class="form-group">
                        <label for="foundingYear" class="col-md-6" style="text-align: right"><b>主催団体ID：</b></label>
                        <input id="foundingYear" name="foundingYear" value="" readonly>
                    </div>
                    <div class="form-group">
                        <label for="post_code" class="col-md-6" style="text-align: right"><b>主催団体名：</b></label>
                        <input id="post_code" name="post_code" type="hidden" value="" readonly>
                    </div>
                    <div class="form-group">
                        <label for="prefecture" class="col-md-6" style="text-align: right"><b>開催開始年月日：</b></label>
                        <input id="pref_id" name="pref_id" type="hidden" value="" readonly>
                        <input id="prefecture" name="prefecture" value="" readonly>
                    </div>
                    <div class="form-group">
                        <label for="address1" class="col-md-6" style="text-align: right"><b>開催終了年月日：</b></label>
                        <input id="address1" name="address1" value="" readonly>
                    </div>
                    <div class="form-group">
                        <label for="address2" class="col-md-6" style="text-align: right"><b>開催場所：</b></label>
                        <input id="address2" name="address2" value="" readonly>
                    </div>
                    <div class="form-group">
                        <label for="orgClass" class="col-md-6" style="text-align: right"><b>大会個別URL：</b></label>
                        <input id="orgClass" name="orgClass" type="hidden" value="" readonly>
                        <input id="org_class_name" name="org_class_name" value="" readonly>
                        <input type="button" value="大会要項ダウンロード">
                    </div>


                    <!-- 確認・戻るボタン -->
                    <div class="form-group row" style="padding: 2rem">
                        <div class="col-sm-2 offset-sm-4">
                            @if($pagemode == "register")
                            <button class="btn btn-success btn-lg btn-block">登録</button>
                            @elseif($pagemode == "edit")
                            <button class="btn btn-success btn-lg btn-block">更新</button>
                            @endif
                        </div>
                        <div class="col-sm-2">
                            <a class="btn btn-danger btn-lg btn-block" href="javascript:history.back()" role="button">戻る</a>
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
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous">
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous">
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