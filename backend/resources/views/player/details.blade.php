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
        .filterDiv{
            display: none;
        }
        .show {
            display: table-row;
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
            <a href={{route('player.details',["user_id"=>Auth::user()->user_id])}}>選手情報参照</a>
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
            style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff; padding:30px 0px; width: 100%; ">
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
                                    {{$player_info->sex_name}}
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
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="side_info[]"
                                            value="00000001" {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00000001")==="00000001")? 'checked' : '' }} id="checkS">
                                        <label class="form-check-label" for="checkS">
                                            : S（ストロークサイド）
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="side_info[]"
                                            value="00000010" {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00000010")==="00000010")? 'checked' : '' }} id="checkB">
                                        <label class="form-check-label" for="checkB">
                                            : B（バウサイド）
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="side_info[]"
                                            value="00000100" {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00000100")==="00000100")? 'checked' : '' }} id="checkX">
                                        <label class="form-check-label" for="checkX">
                                            : X（スカル）
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="side_info[]"
                                            value="00001000" {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00001000")==="00001000")? 'checked' : '' }} id="checkC">
                                        <label class="form-check-label" for="checkC">
                                            : C（コックス）
                                        </label>
                                    </div>
                                    
                                    
                                    
                                    
                                </div>
                            </div>

                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" for="sex"
                                    class="col-sm-5  col-form-label">出身地
                                </label>
                                <div class="col-sm-7 col-form-label">

                                    {{$player_info->birth_country_name}}
                                    <input type="hidden" id = "birthCountry" value="{{$player_info->birth_country_name}}"/>
                                    
                                </div>

                            </div>
                            <div class="form-group row " id="birthPrefectures" style="display: none">
                                <label style="cursor:pointer;text-align:right" class="col-sm-5  col-form-label">
                                    都道府県
                                </label>

                                <div class="col-sm-7 col-form-label">
                                    {{$player_info->birth_prefecture_name??""}}
                                    <input type="hidden" id = "birthPrefecture" value="{{$player_info->birth_prefecture_name}}"/>
                                </div>

                            </div>
                            <div class="form-group row ">
                                <label style="text-align:right" for="sex" class="col-sm-5  col-form-label">居住地
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    {{$player_info->residence_country_name}}
                                    <input type="hidden" id = "residenceCountry" value="{{$player_info->residence_country_name}}"/>
                                </div>

                            </div>
                            <div class="form-group row " id="prefectures" style="display: none">
                                <label style="text-align:right" class="col-sm-5  col-form-label">都道府県
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    {{$player_info->residence_prefecture_name??""}}
                                </div>
                                <input type="hidden" id = "residencePrefecture" value="{{$player_info->residence_prefecture_name}}"/>

                            </div>
                        </div>

                        <div class="col-md-1"></div>

                    </form>
            </div>
            <div class="col-md-3" style="text-align: right">
                <a class="btn btn-secondary btn-lg" href="{{route('my-page')}}" >
                    マイページ
                </a>
                <br/>
                <br/>
                @if((int)$user_id===Auth::user()->user_id or ((Auth::user()->user_type&"01000000")==="01000000"))
                <a style="text-decoration: underline; color:#000;" href="{{route('player.edit')}}" >
                    選手情報を更新
                </a>
                <br/>
                <br/>
                <a style="text-decoration: underline; color:#000;"  href="{{route('player.delete')}}" >
                    選手情報を削除
                </a>
                @endif
            </div>
            <br/>
            <br/>
            <div class="col-12 d-flex" style="margin:5rem 0rem 0rem 2rem ; background-color:#00c77b;">
                <div id="myBtnContainer" class="col-4" style="margin: 0rem 0rem 0rem -2rem" >
                    <a role="button" style="width: 120px;height:60px; font-size:28px" class="btn btn-secondary active" onclick="filterSelection('all')">すべて</a>
                    <a role="button" style="width: 120px;height:60px; font-size:28px" class="btn btn-secondary" onclick="filterSelection('official') ">公式</a>
                    <a role="button" style="width: 120px;height:60px; font-size:28px" class="btn btn-secondary" onclick="filterSelection('hyoukoushiki')">非公式</a>
                </div>
                <div class="col-4" style="text-align: center;font-size:28px" >個人記録</div>
                @if((int)$user_id===Auth::user()->user_id or ((Auth::user()->user_type&"01000000")==="01000000"))
                <div class="col-4" style="text-align:right;margin-left:2rem" >
                    <a role="button" style="width: 400px;height:60px; font-size:28px" class="btn btn-secondary" >個人記録の追加・編集</a>
                </div>
                @endif
            </div>
            <div class="col-12" id="scrollableTable" style="padding :0rem 2rem 0rem 2rem; width:100%; overflow-x: auto; " >
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
                            {{-- <th scope="col">発艇日時</th>
                            <th scope="col">ゴール地点風速</th>
                            <th scope="col">ゴール地点風向</th>
                            <th scope="col">スタート地点風速</th>
                            <th scope="col">スタート地点風向</th> --}}
                        </tr>
                    </thead>
                    <tbody class=" ">
                        {{-- @dd($all_race_records) --}}
                        @foreach($all_race_records as $race_record)

                        <tr @if($race_record->official) 
                            class="filterDiv official" 
                            @else 
                            class="filterDiv hyoukoushiki" 
                            @endif>
                            <td>
                                {{$race_record->tourn_name}}
                            </td>
                            <td>
                                @if($race_record->official)
                                公式
                                @else
                                非公式
                                @endif
                            </td>
                            <td>    
                                {{$race_record->event_start_date}}
                            </td>
                            <td>
                                {{$race_record->org_name}}
                            </td>
                            <td>
                                {{$race_record->race_number}}
                            </td>
                            <td>{{$race_record->event_name}}</td>
                            <td>{{$race_record->race_name}}</td>
                            <td>{{$race_record->by_group}}</td>
                            <td>{{$race_record->crew_name}}</td>
                            <td>{{$race_record->rank}}</td>
                            <td>{{$race_record->laptime_500m}}</td>
                            <td>{{$race_record->laptime_1000m}}</td>
                            <td>{{$race_record->laptime_1500m}}</td>
                            <td>{{$race_record->laptime_2000m}}</td>
                            <td>{{$race_record->final_time}}</td>
                            <td>{{$race_record->stroke_rate_avg}}</td>
                            <td>{{$race_record->stroke_rat_500m}}</td>
                            <td>{{$race_record->stroke_rat_1000m}}</td>
                            <td>{{$race_record->stroke_rat_1500m}}</td>
                            <td>{{$race_record->stroke_rat_2000m}}</td>
                            <td>{{$race_record->attendance}}</td>
                            <td>{{$race_record->ergo_weight}}</td>
                            <td>{{$race_record->player_height}}</td>
                            <td>{{$race_record->player_weight}}</td>
                            <td>{{$race_record->sheet_name}}</td>
                            <td>{{$race_record->race_result_record_name}}</td>
                            {{-- <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td> --}}
                            
                        </tr>
                        @endforeach
                        
                    </tbody>
                </table>
            </div>
            <div class="col-12" style="text-align: right;margin:2rem 0rem" >
                <a role="button" style="width: 120px;height:60px; font-size:28px" class="btn btn-secondary" href="javascript:history.back()">戻る</a>
            </div>    
            
        </div>
        <div class="row" style="margin: 1rem ">
            
        </div> 
    </div>
    <script>

        (function(){
            if(document.getElementById("birthCountry").value === "日本国 （jpn）"){
                document.getElementById("birthPrefectures").style.display='flex';
            }
            if(document.getElementById("residenceCountry").value === "日本国 （jpn）"){
                document.getElementById("prefectures").style.display = 'flex';
            }
        })()

        filterSelection("all");
        function filterSelection(c) {
            var x, i;
            x = document.getElementsByClassName("filterDiv");
            if (c == "all") c = "";
            // Add the "show" class (display:block) to the filtered elements, and remove the "show" class from the elements that are not selected
            for (i = 0; i < x.length; i++) {
                
                w3RemoveClass(x[i], "show");
                if (x[i].className.indexOf(c) > -1) w3AddClass(x[i], "show");
            }
        }

        // Show filtered elements
        function w3AddClass(element, name) {
            var i, arr1, arr2;
            arr1 = element.className.split(" ");
            arr2 = name.split(" ");
            for (i = 0; i < arr2.length; i++) {
                if (arr1.indexOf(arr2[i]) == -1) {
                element.className += " " + arr2[i];
                }
            }
        }

        // Hide elements that are not selected
        function w3RemoveClass(element, name) {
            var i, arr1, arr2;
            arr1 = element.className.split(" ");
            arr2 = name.split(" ");
            for (i = 0; i < arr2.length; i++) {
                while (arr1.indexOf(arr2[i]) > -1) {
                arr1.splice(arr1.indexOf(arr2[i]), 1);
                }
            }
            element.className = arr1.join(" ");
        }

        // Add active class to the current control button (highlight it)
        var btnContainer = document.getElementById("myBtnContainer");
        var btns = btnContainer.getElementsByClassName("btn");
        for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function() {
            var current = document.getElementsByClassName("active");
            current[0].className = current[0].className.replace(" active", "");
            this.className += " active";
        });
        }

    </script>

    

    <script src="{{ asset('js/nav.js') }}"></script>
    {{-- <script src="{{ asset('js/main.js') }}"></script> --}}
    
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous">
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
</body>

</html>