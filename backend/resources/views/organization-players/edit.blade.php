{{--*************************************************************************
* Project name: JARA
* File name: edit.blade.php
* File extension: .blade.php
* Description: This is the ui for the edit and update page of the organization-players.
*************************************************************************
* Author: t_futamura
* Created At: 2024/01/18
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
            <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">{{ $org_name }}</h1>
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">
        
        <!--19.マイページ -->
        <input type="submit" value="マイページ" id="mypageButton">
        <form class="form-horizontal" enctype="multipart/form-data" role="form" style="display: flex" method="POST">        
            @csrf
            <div class="row" style="padding:10px 0px;width: 100%;">
                <div>
                    <label><b>団体への選手追加・削除</b></label><br>
                    <label>新たに所属選手を追加したい場合は、「追加選手の検索」ボタンを押下し、<br>
                        遷移先の検索画面にて追加したい選手を検索し、検索結果から選択してください。</label>
                    <label>所属選手から除外したい場合は、「削除」にチェックを入れてください。</label>
                </div>
                <div class="form-group">
                    <table class="table table-bordered">
                        <thead>
                            <tr class="table-primary">
                                <th colspan="13" class="text-center">所属選手</th>
                            </tr>
                        </thead>
                        <thead>
                            <tr>
                            <th>種▼</th>
                            <th>削除▼</th>
                            <th>選手ID</th>
                            <th>JARA選手コード</th>
                            <th>選手名</th>
                            <th>出身地</th>
                            <th>居住地</th>
                            <th>S</th>
                            <th>B</th>
                            <th>X</th>
                            <th>C</th>
                            </tr>
                        </thead>
                        <tbody> 
                            @foreach($org_players as $player)                           
                            <tr>
                                <td>既存</td>
                                <td class='pointer'><input type="checkbox" id="delete_check"></td>
                                <td>{{$player->player_id}}</td>
                                <td>{{$player->jara_player_id}}</td>
                                <td>{{$player->player_name}}</td>
                                <td>{{$player->birth_place}}</td>
                                <td>{{$player->residence}}</td>
                                <td>{{$player->side_S}}</td>
                                <td>{{$player->side_B}}</td>
                                <td>{{$player->side_X}}</td>
                                <td>{{$player->side_C}}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
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
    <!-- <script src="{{ asset('js/organization.js') }}"></script> -->
</body>

</html>