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
            <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">団体検索</h1>
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">

        <!--19.マイページ -->
        <input type="submit" value="マイページ" id="mypageButton">
        <form class="form-horizontal" enctype="multipart/form-data" role="form" style="display: flex" method="POST">
            @csrf            
            <div class="row" style="padding:10px 0px;width: 100%;">
                <!-- 複数要因によるエラーメッセージ表示エリア -->
                @if ($errors->has('organization_commit_failed'))
                <p style="margin: 1rem; font-weight:bold; color:red; text-align: center"></p>
                @endif
                <div class="col-md-10">
                    @if(bindec($user_type) >= 128)
                    <div class="form-group">
                        <label for="entrysystemOrgId" class="col-md-6" style="text-align: right"><b>エントリーシステムの団体ID</b></label>
                        <input id="entrysystemOrgId" name="entrysystemOrgId" value="">
                    </div>
                    @endif
                    <div class="form-group">
                        <label for="org_id" class="col-md-6" style="text-align: right"><b>団体ID</b></label>
                        <input id="org_id" name="org_id" value="">
                    </div>
                    <div class="form-group">
                        <label for="org_name" class="col-md-6" style="text-align: right"><b>団体名</b></label>
                        <input id="org_name" name="org_name" value="">
                    </div>
                    <div class="form-group">
                        <label for="org_type" class="col-md-6" style="text-align: right"><b>団体種別</b></label>
                        <select id="org_type" name="org_type">
                            <option value="">--</option>
                        @foreach($organization_type as $type)                                
                            <option value="{{$type->org_type}}">{{$type->org_type_display_name}}</option>
                        @endforeach
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="prefecture" class="col-md-6" style="text-align: right"><b>団体区分</b></label>                        
                        <select id="org_class" name="org_class">
                            <option value="">--</option>
                        @foreach($organization_class as $class)
                            <option value="{{$class->org_class_id}}">{{$class->org_class_name}}</option>
                        @endforeach
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="foundingYear" class="col-md-6" style="text-align: right"><b>創立年</b></label>
                        <input id="foundingYear_start" name="foundingYear_start" value="">
                        <label style="text-align: center">～</label>
                        <input id="foundingYear_end" name="foundingYear_end" value="">
                    </div>
                    <div class="form-group">
                        <label for="country" class="col-md-6" style="text-align: right"><b>国</b></label>
                        <select id="country" name="country">
                            <option value="">--</option>
                        @foreach($countries as $country)
                            <option value="{{$country->country_id}}" {{ $country->country_id === 112 ? "selected" : ""}}>{{$country->country_name}}</option>
                        @endforeach
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="prefecture" class="col-md-6" style="text-align: right"><b>都道府県</b></label>
                        <select id="prefecture" name="prefecture">
                            <option value="">--</option>
                        @foreach($prefectures as $prefecture)
                            <option value="{{$prefecture->pref_id}}">{{$prefecture->pref_name}}</option>
                        @endforeach
                        </select>
                    </div>
                    <!-- 確認・戻るボタン -->
                    <div class="form-group row" style="padding: 2rem">
                        <div class="col-sm-2 offset-sm-4">
                            <button class="btn btn-success btn-lg btn-block">検索</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <table class="table table-bordered">
                            <thead>
                                <tr class="table-primary">
                                    <th colspan="6" class="text-center">団体一覧</th>
                                </tr>
                            </thead>
                            <thead>
                                <tr>
                                <th>エントリーシステムの団体ID</th>
                                <th>団体ID</th>
                                <th>団体名</th>
                                <th>創立年</th>
                                <th>団体種別</th>
                                <th>団体区分</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>XXXX</td>
                                    <td>XXXXXXXX</td>
                                    <td>XXXXXXXX</td>
                                    <td>XXXX</td>
                                    <td>XXXX</td>
                                    <td>XXXX</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
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