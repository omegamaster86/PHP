{{--*************************************************************************
* Project name: JARA
* File name: reference-confirm.blade.php
* File extension: .blade.php
* Description: This is the ui of organization's refer and delete organization page
*************************************************************************
* Author: t_futamura
* Created At: 2023/12/12
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
            @if($pagemode == "delete")
            <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">ボランティア情報削除</h1>
            @elseif($pagemode == "refer")
            <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">ボランティア情報参照</h1>
            @endif
            @endif
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">
        <form class="form-horizontal" enctype="multipart/form-data" role="form" style="display: flex" method="POST">
            @csrf
            <!--19.マイページ -->
            <input type="submit" value="マイページ" id="mypageButton">
            <div class="row" style="padding:10px 0px;width: 100%;">
                <div class="col-md-8 offset-md-1">
                    <!-- <div id="organizations-edit-error1">
                            <label>2.複数要因によるエラーメッセージ表示エリア</label>
                        </div> -->
                    <div class="form-group">
                        <label class="col-md-6" style="text-align: right"><b>ボランティアID：</b></label>
                        <label for="entrysystem_org_id">XXXXXXXX</label>
                        <label class="col-md-6" style="text-align: right"><b>エントリーシステムのボランティアID：</b></label>
                        <label for="entrysystem_org_id">XXXXXXXX</label>
                        <label class="col-md-6" style="text-align: right"><b>ボランティア名：</b></label>
                        <label for="org_name">XXXXXXXX</label>
                        <label class="col-md-6" style="text-align: right"><b>主催団体ID：</b></label>
                        <label for="org_representative_name">XXXXXXXX</label>
                        <label class="col-md-6" style="text-align: right"><b>主催団体名：</b></label>
                        <label for="phone_number">XXX-XXX-XXXX</label>
                        <label class="col-md-6" style="text-align: right"><b>開催開始年月日：</b></label>
                        <label for="org_class">XXXXXXXX</label>
                        <label class="col-md-6" style="text-align: right"><b>開催終了年月日：</b></label>
                        <label for="jara_org_type">XXXXXXXX</label>
                        <label class="col-md-6" style="text-align: right"><b>開催場所：</b></label>
                        <label for="pref_org_type">XXXXXXXX</label>
                        <label class="col-md-6" style="text-align: right"><b>ボランティア個別URL：</b></label>
                        <label for="supervisor_user">XXXXXXXX</label>
                    </div>
                    <div class="form-group">
                        <table class="table table-bordered">
                            <thead>
                                <tr class="table-primary">
                                    <th colspan="5" class="text-center">主催ボランティア</th>
                                </tr>
                            </thead>
                            <thead>
                                <tr>
                                    <th>開催種別</th>
                                    <th>ボランティア名</th>
                                    <th>開催期間</th>
                                    <th>開催場所</th>
                                    <th>ボランティアURL</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>公式</td>
                                    <td>XXXXXXXX</td>
                                    <td>YYYY/MM/DD～YYYY/MM/DD</td>
                                    <td>XXXXXXXX</td>
                                    <td>XXXXXXXXXXXXXXXX</td>
                                </tr>
                                <tr>
                                    <td>公式</td>
                                    <td>XXXXXXXX</td>
                                    <td>YYYY/MM/DD～YYYY/MM/DD</td>
                                    <td>XXXXXXXX</td>
                                    <td>XXXXXXXXXXXXXXXX</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- 確認・戻るボタン -->
                    <div class="form-group row" style="padding: 2rem">
                        <div class="col-sm-2 offset-sm-4">
                            @if($pagemode == "delete")
                            <button class="btn btn-danger btn-lg btn-block">削除</button>
                            @endif
                        </div>
                        <div class="col-sm-2">
                            <a class="btn btn-danger btn-lg btn-block" href="javascript:history.back()" role="button">戻る</a>
                        </div>
                    </div>
                    @dd($TournamentData,$RaceData)
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