{{--*************************************************************************
* Project name: JARA
* File name: register-confirm.blade.php
* File extension: .blade.php
* Description: This is the ui of player register page
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/11/17
* Updated At: 2023/11/17
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
    <title>Player Deatils</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">

    <link rel="stylesheet" type="text/css" href="{{ asset('css/player-register.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/nav.css') }}">

    {{-- Date Picker --}}
    <link rel="stylesheet" href="https://unpkg.com/flatpickr/dist/flatpickr.min.css">
    <style>
        .container {
            padding: 2rem 0rem;
        }

        h4 {
            margin: 2rem 0rem 1rem;
        }

        .table-image {
            td, th {
                vertical-align: middle;
            }
        }
        .table{
            background-color: #f1f1f1;
            margin: 0rem
            
        }
        .table thead th,td{ text-align: center; vertical-align: middle;}
        .table-striped>tbody>tr:nth-of-type(odd) {
            background-color: #f9f9f9;
        }
        .do-scroll{
            width: 100%
            height: 650px; 
            overflow-y: auto;    /* Trigger vertical scroll    */
        }
    </style>
</head>

<body>
    <div class="container-fluid bootstrap snippets bootdey" style="background: linear-gradient(to right,#1991FC,  #45b796);padding:0;color: #000;font-weight:500;min-height:100vh; width:100vw">
        <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">
                &times;
            </a>
            <a href={{route('my-page')}}>マイページ</a>
            <a href={{route('user.edit')}}>情報更新</a>
            <a href={{route('user.details')}}>情報参照</a>
            <a href={{route('user.delete')}}>退会</a>
            <a href={{route('user.password-change')}}>パスワード変更</a>
            <a href={{route('player.register')}}>選手情報登録</a>
            <a href={{route('player.edit')}}>選手情報更新</a>
            <a href={{route('player.delete')}}>選手情報削除</a>
            <a href={{route('organization.management')}}>団体管理</a>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <a href="route('logout')" onclick="event.preventDefault(); this.closest('form').submit();">
                    ログアウト
                </a>
            </form>
        </div>
        <div style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff;padding-top:15px;">
            <span class="col-md-3" style="font-size:30px; cursor:pointer" onclick="openNav()">
                &#9776; メニュー
            </span>
            <h1 style="display: inline;margin-left:28%" class="text-right col-md-9">
                選手情報
            </h1>
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">
        <div class="row">
            <div class="col-md-10 ">
                <div class="row">
                    <div class="col-md-5"></div>
                    <div class="col-md-5">
                        @if ($errors->has('system_error'))
                        <p class="text-danger" style="margin: 1rem; padding:1rem;background-color:pink; border-radius:5px; font-weight:bold; ">
                            {{$errors->first('system_error') }}
                        </p>
                        @endif
                    </div>
                    <div class="col-md-1"></div>
                </div>
            </div>

        </div>
        <div class="row"
            style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff; padding:30px 0px; width: 100%;">
            <div class="col-md-9 ">
                    <form class="d-flex" action="">
                        <div class="col-md-5 ">
                            <div class=" col-md-5" style="margin-left: 17%;">
                                <div style="margin: 0px 0px 5px 15px; text-align:center">
                                    写真
                                </div>
                                @if($player_info->photo??"")
                                    <img id = "playerPicture" src="{{ asset('images/players/'.$player_info->photo) }}" class="avatar img-circle img-thumbnail" alt="avatar">
                                @else
                                    <img id = "playerPicture" src="{{ asset('images/no-image.png') }}" class="avatar img-circle img-thumbnail" alt="avatar">
                                @endif

                            </div>
                        </div>
                        <div class="col-md-1"></div>

                        <div class="col-md-5 " style="background-color:#005BFC;padding:2rem ; border-radius: 10px ; color:#fff">
                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" for="jara_player_id" class="col-sm-5  col-form-label">選手ID
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    {{str_pad(($player_info->player_id), 8, "0", STR_PAD_LEFT)}}
                                </div>
                            </div>

                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" class="col-sm-5  col-form-label">JARA選手コード
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    {{$player_info->jara_player_id??""}}
                                </div>
                            </div>
                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" class="col-sm-5  col-form-label">
                                    選手名
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    {{$player_info->player_name??""}}
                                </div>
                            </div>

                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" class="col-sm-5  col-form-label">
                                    生年月日
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    {{date('Y/m/d', strtotime($player_info->date_of_birth))}}
                                </div>

                            </div>

                            <div class="form-group row ">
                                <label style="cursor:pointer; text-align:right" class="col-sm-5  col-form-label">
                                    性別
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    {{$player_info->sex??""}}
                                </div>
                            </div>
                            <div class="form-group row ">
                                <label style="text-align:right" class="col-sm-5  col-form-label">身長
                                </label>

                                <div class="col-sm-7 col-form-label">

                                    {{$player_info->height??""}} 
                                    {{($player_info->height??"") ? "cm" : ""}}
                                    
                                </div>
                            </div>
                            <div class="form-group row ">
                                <label style="text-align:right" class="col-sm-5  col-form-label">
                                    体重
                                </label>

                                <div class="col-sm-7 col-form-label">
                                    {{$player_info->weight??""}} {{($player_info->weight??"") ? "kg" : ""}}
                                </div>

                            </div>
                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" class="col-sm-5  col-form-label">サイド情報
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00000001")==="00000001")? 'S　' : '' }}
                                    {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00000010")==="00000010")? 'B　' : '' }}
                                    {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00000100")==="00000100")? 'X　' : '' }}
                                    {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00001000")==="00001000")? 'COX' : '' }}
                                </div>
                            </div>

                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" for="sex"
                                    class="col-sm-5  col-form-label">出身地
                                </label>
                                <div class="col-sm-7 col-form-label">

                                    {{$player_info->birth_country??""}}
                                    
                                </div>

                            </div>
                            <div class="form-group row " id="confirmBirthPrefectures" style="display: none">
                                <label style="cursor:pointer;text-align:right" class="col-sm-5  col-form-label">
                                    都道府県
                                </label>

                                <div class="col-sm-7 col-form-label">
                                    {{$player_info->birth_prefecture??""}}
                                </div>

                            </div>
                            <div class="form-group row ">
                                <label style="text-align:right" for="sex" class="col-sm-5  col-form-label">居住地
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    {{$player_info->residence_country??""}}
                                </div>

                            </div>
                            <div class="form-group row " id="confirmPrefectures" style="display: none">
                                <label style="text-align:right" class="col-sm-5  col-form-label">都道府県
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    {{$player_info->residence_prefecture??""}}
                                </div>

                            </div>
                        </div>

                        <div class="col-md-1"></div>

                    </form>
            </div>
            <div class="col-md-3" style="text-align: right">
                <button type="button" class="btn btn-secondary btn-lg" data-toggle="modal"
                    data-target="#staticBackdrop">
                    マイページ
                </button>
            </div>
        </div>
        <div class="row" style="margin: 0rem 2rem">
            <div class="col-12" id="scrollableTable" style="width: 100%; overflow-x: auto; " >
                <div class="col-12" style="margin:0rem -1rem" >
                    <a role="button" style="width: 120px;height:60px; font-size:28px" class="btn btn-secondary" href="javascript:history.back()">すべて</a>
                    <a role="button" style="width: 120px;height:60px; font-size:28px" class="btn btn-secondary" href="javascript:history.back()">公式</a>
                    <a role="button" style="width: 120px;height:60px; font-size:28px" class="btn btn-secondary" href="javascript:history.back()">非公式</a>
                </div>
                <table class="table table-striped table-bordered" >
                    <thead >
                        <tr>
                            <th scope="col">大会名</th>
                            <th scope="col">公式／非公式</th>
                            <th scope="col">開催日</th>
                            <th scope="col">団体所属</th>
                            <th scope="col">レースNo.</th>
                            <th scope="col">種目</th>
                            <th scope="col">レース名</th>
                            <th scope="col">組別</th>
                            <th scope="col">クルー名</th>
                            <th scope="col">順位</th>
                            <th scope="col">500m</th>
                            <th scope="col">1000m</th>
                            <th scope="col">1500m</th>
                            <th scope="col">2000m</th>
                            <th scope="col">最終タイム</th>
                            <th scope="col">ストロークレート（平均）</th>
                            <th scope="col">500mlapストロークレート</th>
                            <th scope="col">1000mlapストロークレート</th>
                            <th scope="col">1500mlapストロークレート</th>
                            <th scope="col">2000mlapストロークレート</th>
                            <th scope="col">立ち合い有無</th>
                            <th scope="col">エルゴ体重</th>
                            <th scope="col">選手身長（出漕時点）</th>
                            <th scope="col">選手体重（出漕時点）</th>
                            <th scope="col">シート番号（出漕時点）</th>
                            <th scope="col">出漕結果記録名</th>
                            <th scope="col">発艇日時</th>
                            <th scope="col">ゴール地点風速</th>
                            <th scope="col">ゴール地点風向</th>
                            <th scope="col">スタート地点風速</th>
                            <th scope="col">スタート地点風向</th>
                        </tr>
                    </thead>
                    <tbody class=" ">
                        {{-- @foreach($organizations as $organization) --}}
                        <tr>
                            {{-- <th>{{$user->id}}</th>
                            <th>{{$user->name}}</th> --}}
                            {{-- <th scope="row">公式</th> --}}
                            <td>
                                {{-- @if($organization->jara_org_type)
                                正規
                                @else
                                任意
                                @endif --}}
                            </td>
                            <td>
                                {{-- <a target="_blank" style="text-decoration: underline" href="{{route('organizations.edit',['targetOrgId' => $organization->org_id])}}">
                                    {{$organization->entrysystem_org_id}}
                                </a> --}}
                            </td>
                            <td>    
                                {{-- <a target="_blank" style="text-decoration: underline" href="{{route('organizations.edit',['targetOrgId' => $organization->org_id])}}">
                                    D{{ str_pad($organization->org_id, 4, "0", STR_PAD_LEFT)}}
                                </a> --}}
                            </td>
                            <td>
                                {{-- <a target="_blank" style="text-decoration: underline" href="{{route('organizations.edit',['targetOrgId' => $organization->org_id])}}">
                                    {{$organization->org_name}}
                                </a> --}}
                            </td>
                            <td>
                                {{-- <a href="{{route('organizations.edit',['targetOrgId' => $organization->org_id])}}" role="button" class="btn btn-primary" >更新</a> --}}
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            
                        </tr>
                        {{-- @endforeach --}}
                        
                    </tbody>
                </table>
            </div>    
        </div> 
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous">
    </script>
    <script>

        // For showing warning message

        (function (){
            document.getElementById("idCheckedMessage").click();

            if(document.getElementById("confirmBirthCountry").value === "日本"){
                document.getElementById("confirmBirthPrefectures").style.display='flex';
            }
            if(document.getElementById("confirmCountry").value === "日本"){
                document.getElementById("confirmPrefectures").style.display = 'flex';
            }
        })();
        
        

    </script>
       <script>
        //for page reloading when using back button is click from web page
        (function () {
        window.onpageshow = function(event) {
            if (event.persisted) {
                window.location.reload();
            }
        };
        })();
        function changeStatus()
        {
            document.getElementById("status").value = "true";
            document.getElementById("editForm").submit();
        }
        function validateEditForm()
        {
            if(document.getElementById("status").value === "true")
                return true;
            else
            document.getElementById("checkeWarningMessage").click();
            return false;
        }
    </script>
    <script>
        $(document).ready(function(){
        var rowCount = $('tbody tr').length;
        if(rowCount > 10){
            console.log(rowCount);
            $('#scrollableTable').addClass('do-scroll');
        }
        });
    </script>

    <script src="{{ asset('js/nav.js') }}"></script>
    <script src="{{ asset('js/main.js') }}"></script>
</body>

</html>