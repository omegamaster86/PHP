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
    <title>Player Search</title>
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
                選手検索
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
            <div class="col-md-3"></div>
            <div class="col-md-6 ">
                    <form class="d-flex" action="">

                        <div class="col-md-12 " style="background-color:#005BFC;padding:2rem ; border-radius: 10px ; color:#fff">
                            
                            <div class="form-group row ">
                                <label onclick="details('playerCodeInfo')" style="cursor:pointer;text-align:right" for="playerCode" class="col-sm-5  col-form-label">＊JARA選手コード　
                                    <span>
                                        <i class="fa fa-question-circle" aria-hidden="true"></i>
                                    </span>
                                </label>
                                <div class="col-sm-7">
                                    <input id="playerCode" class="form-control rounded  col-form-label"
                                        name="jara_player_id" maxlength="12" type="text"
                                        value="{{old('jara_player_id')?old('jara_player_id'):$player_info->jara_player_id??""}}">
                                    <input id="registeredPlayerCode"  type="hidden"
                                        value="{{$player_info->jara_player_id??""}}">
                                    
                                </div>
    
                                <div id="playerCodeInfo" style="margin-left:2rem">あああああああああああああああああああ</div>
                                @if ($errors->has('jara_player_id'))
                                <p class="error-css text-danger">
                                    {{
                                    $errors->first('jara_player_id') }}</p>
                                @endif
    
                            </div>
                            <div class="form-group row ">
                                <label onclick="details('playerIdInfo')" style="cursor:pointer;text-align:right"
                                    for="playerCode" class="col-sm-5  col-form-label">選手ID　<span><i class="fa fa-question-circle" aria-hidden="true"></i></span>
                                </label>
                                
                                <div class="col-sm-7">
                                
                                <input id="playerCode" class="form-control rounded  col-form-label" name="player_id" maxlength="12" type="text" value="{{old('player_id')}}">
                                </div>
                                
                                <div id="playerIdInfo" style="margin-left:6rem">あああああああああああ</div>
                            </div>
    
                            <div class="form-group row ">
                                <label onclick="details('playerNameInfo')" style="cursor:pointer;text-align:right"
                                    for="playerName" class="col-sm-5  col-form-label">＊選手名　<span><i
                                            class="fa fa-question-circle" aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7">
                                    <input id="playerName" maxlength="50" class="form-control rounded  col-form-label"
                                        name="player_name" type="text"
                                        value="{{old('player_name')?old('player_name'):$player_info->player_name??""}}">
                                </div>
    
                                <div id="playerNameInfo" style="margin-left:6rem">あああああああああああああああああああ</div>
                                @if ($errors->has('player_name'))
                                <p class="error-css text-danger">
                                    {{
                                    $errors->first('player_name') }}</p>
                                @endif
    
                            </div>
    
                            <div class="form-group row ">
                                <label onclick="details('sexInfo')" style="cursor:pointer;text-align:right" for="sex"
                                    class="col-sm-5  col-form-label">＊性別　<span><i class="fa fa-question-circle"
                                            aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7">
                                    <select id="sex" name="sex" class="form-control rounded">
                                        <option value="" {{(old('sex')?old('sex'):$player_info->sex??"")=="" ? "selected" : "" }}></option>
                                        <option value=1 {{(old('sex')?old('sex'):$player_info->sex??"")=="1" ? "selected" : "" }}>男</option>
                                        <option value=2 {{(old('sex')?old('sex'):$player_info->sex??"")=="2" ? "selected" : "" }}>女</option>
    
                                    </select>
                                </div>
    
                                <div id="sexInfo" style="margin-left:7rem">あああああああああああああああああああ</div>
                                @if ($errors->has('sex'))
                                <p class="error-css text-danger">
                                    {{
                                    $errors->first('sex') }}</p>
                                @endif
    
                            </div>
                            
                            <div class="form-group row ">
                                <label onclick="details('birthDayInfo')" style="cursor:pointer;text-align:right"
                                    class="col-sm-5  col-form-label">＊生年月日　<span><i class="fa fa-question-circle"
                                            aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7">
                                    <input id="dateOfBirth" name="date_of_birth" type="text"
                                        style="color: #000;background-color: #fff;"
                                        class="flatpickr form-control rounded  col-form-label"
                                        value="{{(old('date_of_birth')?old('date_of_birth'):$player_info->date_of_birth??"年/月/日" )}}" readonly="readonly">
                                </div>
    
                                <div id="birthDayInfo" style="margin-left:5rem;">あああああああああああああああああああ</div>
                                @if ($errors->has('date_of_birth'))
                                <p class="error-css text-danger">
                                    {{
                                    $errors->first('date_of_birth') }}</p>
                                @endif
    
                            </div>
    
                            
                            <div class="form-group row ">
                                <label onclick="details('heightInfo')" style="text-align:right" for="height"
                                    class="col-sm-5  col-form-label">＊身長　　
                                </label>
                                <div class="col-sm-5">
                                    <input class="form-control" id="height" name="height" type="text" maxlength=6
                                        style="float: left" value={{old('height')?old('height'):$player_info->height??""}}>
                                </div>
                                <label class="col-form-label">
                                    cm
                                </label>
    
                                @if ($errors->has('height'))
                                <p class="error-css text-danger">
                                    {{$errors->first('height') }}</p>
                                @endif
    
                            </div>
                            <div class="form-group row ">
                                <label onclick="details('weightInfo')" style="text-align:right" for="weight"
                                    class="col-sm-5  col-form-label">＊体重　　
                                </label>
                                <div class="col-sm-5">
                                    <input class="form-control" id="weight" name="weight" type="text" maxlength=6
                                        style="float: left" value={{old('weight')?old('weight'):$player_info->weight??""}}>
                                </div>
    
                                <label class="col-form-label">
                                    kg
                                </label>
    
                                @if ($errors->has('weight'))
                                <p class="error-css text-danger">
                                    {{$errors->first('weight') }}</p>
                                @endif
    
                            </div>
                            <div class="form-group row ">
                                <label onclick="details('sideInfo')" style="cursor:pointer;text-align:right"
                                    class="col-sm-5  col-form-label">＊サイド情報　<span><i class="fa fa-question-circle"
                                            aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7 row">
                                    <div class="col-sm-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="side_info[]"
                                                value="00000001" {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00000001")==="00000001")? 'checked' : '' }} id="checkS">
                                            <label class="form-check-label" for="checkS">
                                                : S
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="side_info[]"
                                                value="00000010" {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00000010")==="00000010")? 'checked' : '' }} id="checkbox">
                                            <label class="form-check-label" for="checkB">
                                                : B
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-sm-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="side_info[]"
                                                value="00000100" {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00000100")==="00000100")? 'checked' : '' }} id="checkX">
                                            <label class="form-check-label" for="checkX">
                                                : X
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="side_info[]"
                                                value="00001000" {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00001000")==="00001000")? 'checked' : '' }} id="checkCOX">
                                            <label class="form-check-label" for="checkCOX">
                                                : COX
                                            </label>
                                        </div>
                                    </div>
    
                                </div>
    
                                <div id="sideInfo" style="margin-left:4rem">あああああああああああああああああああ</div>
                                @if ($errors->has('sideInfo'))
                                <p class="error-css text-danger">
                                    {{$errors->first('sideInfo') }}</p>
                                @endif
    
                            </div>
    
                            <div class="form-group row ">
                                <label onclick="details('birthCountryInfo')" style="cursor:pointer;text-align:right"
                                        class="col-sm-5  col-form-label">＊出身地　<span><i
                                            class="fa fa-question-circle" aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7">
                                    <select id="birthCountry" name="birth_country" class="form-control" value="">
                                        <option value=1 {{(old('birth_country')?old('birth_country'):$player_info->birth_country??"")==1 ? "selected" : "" }}>日本</option>
                                        <option value=2 {{(old('birth_country')?old('birth_country'):$player_info->birth_country??"")==2 ? "selected" : "" }}>アメリカ</option>
                                        <option value=3 {{(old('birth_country')?old('birth_country'):$player_info->birth_country??"")==3 ? "selected" : "" }}>インド</option>
                                    </select>
                                </div>
    
                                <div id="birthCountryInfo" style="margin-left:7rem">あああああああああああああああああああ</div>
                                <input type="hidden" id="status" value=""/>
                            </div>
                            <div class="form-group row " id="birthPrefectures">
                                <label onclick="details('birthPrefectureInfo')" style="cursor:pointer;text-align:right"
                                    class="col-sm-5  col-form-label">＊都道府県　<span><i class="fa fa-question-circle"
                                            aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7">
                                    <select id="birthPrefecture" name="birth_prefecture" class="form-control">
                                        <option value=1 {{(old('birth_prefecture')?old('birth_prefecture'):$player_info->birth_prefecture??"")==1 ? "selected" : "" }}>東京</option>
                                        <option value=2 {{(old('birth_prefecture')?old('birth_prefecture'):$player_info->birth_prefecture??"")==2 ? "selected" : "" }}>愛知</option>
                                        <option value=3  {{(old('birth_prefecture')?old('birth_prefecture'):$player_info->birth_prefecture??"")==3 ? "selected" : "" }}>宮崎</option>
                                    </select>
                                </div>
    
                                <div id="birthPrefectureInfo" style="margin-left:6rem">ああああああああ</div>
    
                            </div>
                            <div class="form-group row ">
                                <label onclick="details('countryInfo')" style="cursor:pointer;text-align:right"
                                        class="col-sm-5  col-form-label">＊居住地　<span><i
                                            class="fa fa-question-circle" aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7">
                                    <select id="country" name="residence_country" class="form-control">
                                        <option value=1 {{(old('residence_country')?old('residence_country'):$player_info->residence_country??"")==1 ? "selected" : "" }}>日本</option>
                                        <option value=2 {{(old('residence_country')?old('residence_country'):$player_info->residence_country??"")==2 ? "selected" : "" }}>アメリカ</option>
                                        <option value=3 {{(old('residence_country')?old('residence_country'):$player_info->residence_country??"")==3 ? "selected" : "" }}>インド</option>
                                    </select>
                                </div>
    
                                <div id="countryInfo" style="margin-left:7rem">あああああああああああああああああああ</div>
    
                            </div>
                            <div class="form-group row " id="prefectures">
                                <label onclick="details('residencePrefectureInfo')"
                                    style="cursor:pointer;text-align:right"
                                    class="col-sm-5  col-form-label">＊都道府県　<span><i class="fa fa-question-circle"
                                            aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7">
                                    <select id="prefecture" name="residencePrefecture" class="form-control">
                                        <option value=1 {{(old('residenceCountry')?old('residenceCountry'):$player_info->residenceCountry??"")==1 ? "selected" : "" }}>東京</option>
                                        <option value=2 {{(old('residenceCountry')?old('residenceCountry'):$player_info->residenceCountry??"")==2 ? "selected" : "" }}>愛知</option>
                                        <option value=3 {{(old('residenceCountry')?old('residenceCountry'):$player_info->residenceCountry??"")==3 ? "selected" : "" }}>宮崎</option>
                                    </select>
                                </div>
    
                                <div id="residencePrefectureInfo" style="margin-left:6rem">ああああああああ</div>
                            </div>
                        </div>

                        <div class="col-md-1"></div>

                    </form>
            </div>
            <div class="col-md-3">
                
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
            
            <div class="col-12" id="scrollableTable" style="padding :0rem 2rem 0rem 2rem; width:100%; overflow-x: auto; margin-top : 50px" >
                <table class="table table-striped table-bordered" >
                    <thead >
                        <tr>
                            <th scope="col">sfsf</th>
                        </tr>
                    </thead>
                    <tbody class=" ">

                        <tr >
                            <td>ssffs
                            <td>
                        </tr>
                        {{-- @endforeach --}}
                        
                    </tbody>
                </table>
            </div>
            <div class="col-12" style="text-align: right;margin:2rem 0rem" >
                <a role="button" style="width: 120px;height:60px; font-size:28px" class="btn btn-secondary" href="javascript:history.back()">
                    戻る
                </a>
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