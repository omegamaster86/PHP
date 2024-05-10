{{--*************************************************************************
* Project name: JARA
* File name: search.blade.php
* File extension: .blade.php
* Description: This is the ui of organization's edit and update confirmation page
*************************************************************************
* Author: t_futamura
* Created At: 2024/1/23
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
            <h2 style="display: inline;margin-left:25%" class="text-right col-md-7">{{$org_name}}</h2><br/>
            <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">団体に登録する選手検索</h1>
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">

        <!--19.マイページ -->
        <input type="submit" value="マイページ" id="mypageButton">
        <form class="form-horizontal" enctype="multipart/form-data" role="form" style="display: flex" method="POST">
            @csrf            
            <!-- <div class="row" style="padding:10px 0px;width: 100%;"> -->
            <div class="form-group row" style="padding: 10px; margin-bottom: 10px; border: 1px solid #333333;">
                <div class="col-md-10">
                <!-- <div class="form-group row" style="padding: 10px; margin-bottom: 10px; border: 1px solid #333333;"> -->
                    <div class="form-group row">
                        <fieldset>
                            <legend><b>選手情報</b></legend>
                            <div class="form-group row">
                                <div class="col-md-4">
                                    <label for="jara_player_id"><b>JARA選手コード</b></label>
                                    <input id="jara_player_id" name="jara_player_id">
                                </div>
                                <div class="col-md-4">
                                    <label for="player_id"><b>選手ID</b></label>
                                    <input id="player_id" name="player_id">
                                </div>
                                <div class="col-md-4">
                                    <label for="player_name"><b>選手名</b></label>
                                    <input id="player_name" name="player_name">
                                </div>
                            </div>
                            <div class="form-group row">
                                <div class="col-md-4">
                                    <label for="sex"><b>性別</b></label>
                                    <select id="sex" name="sex">
                                        <option value="">--</option>
                                    @foreach($m_sex as $sex)                                
                                        <option value="{{$sex->sex_id}}">{{$sex->sex}}</option>
                                    @endforeach
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label for="birth_place"><b>出身地(都道府県)</b></label>
                                    <select id="birth_prefecture" name="birth_prefecture">
                                        <option value="">--</option>
                                    @foreach($prefectures as $prefecture)
                                        <option value="{{$prefecture->pref_id}}">{{$prefecture->pref_name}}</option>
                                    @endforeach
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label for="residence"><b>居住地(都道府県)</b></label>
                                    <select id="residence_prefecture" name="residence_prefecture">
                                        <option value="">--</option>
                                    @foreach($prefectures as $prefecture)
                                        <option value="{{$prefecture->pref_id}}">{{$prefecture->pref_name}}</option>
                                    @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="form-group row">
                                <div class="col-md-12">
                                    <!-- サイド情報 -->
                                    <label for="side_info"><b>サイド情報</b></label>                        
                                    <input name="side_S" type="checkbox" value="side_S">：S（ストロークサイド）
                                    <input name="side_B" type="checkbox"  value="side_B">：B（バウサイド）
                                    <input name="side_X" type="checkbox"  value="side_X">：X（スカル）
                                    <input name="side_C" type="checkbox"  value="side_C">：C（コックス）
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div class="form-group row">
                        <fieldset>
                            <legend><b>選手情報</b></legend>
                            <div class="col-md-3">
                                <label for="org_id"><b>団体ID</b></label>
                                <input id="org_id" name="org_id">
                            </div>
                            <div class="col-md-3">
                                <label for="entry_system_id"><b>エントリーシステムID</b></label>
                                <input id="entry_system_id" name="entry_system_id">
                            </div>
                            <div class="col-md-3">
                                <label for="org_name"><b>団体名</b></label>
                                <input id="org_name" name="org_name">
                            </div>
                        </fieldset>
                    </div>
                    <div class="form-group row">
                        <fieldset>
                            <legend><b>出漕履歴情報</b></legend>
                            <div class="form-group">
                                <label for="tourn_name"><b>出漕大会名</b></label>
                                <input id="tourn_name" name="tourn_name">
                                <label for="event_id"><b>出漕種目</b></label>
                                <select id="event_id" name="event_id">
                                    <option value="">--</option>
                                @foreach($events as $event)
                                    <option value="{{$event->event_id}}">{{$event->event_name}}</option>
                                @endforeach
                                </select>
                            </div>
                        </fieldset>
                    </div>
                    <!-- 確認・戻るボタン -->
                    <div class="form-group" style="padding: 2rem">
                        <div>
                            <button class="btn btn-success btn-lg btn-block">検索</button>
                        </div>
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