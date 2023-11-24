{{--*************************************************************************
* Project name: JARA
* File name: register.blade.php
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
    @if($pageMode==="register")
    <title>Player Registration</title>
    @elseif($pageMode==="edit")
    <title>Player Edit</title>
    @endif
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
        integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">

    <link rel="stylesheet" type="text/css" href="{{ asset('css/player-register.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/nav.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/style.css') }}">

    {{-- Date Picker --}}
    <link rel="stylesheet" href="https://unpkg.com/flatpickr/dist/flatpickr.min.css">

</head>

<body>
    {{-- background-color: #9FD9F6; --}}
    <div class="container-fluid bootstrap snippets bootdey"
        style="background: linear-gradient(to right,#1991FC,  #45b796);padding:0;color: #000;font-weight:500">
        <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
            <a href="#">ダッシュボード</a>
            <a href="#">情報更新</a>
            <a href="#">情報参照</a>
            <a href="#">アカウント削除</a>
        </div>
        <div style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff;padding-top:15px;">
            <span class="col-md-3 " style="font-size:30px;cursor:pointer" onclick="openNav()">&#9776; メニュー</span>
            <h1 style="display: inline;margin-left:29.5%" class="text-right col-md-9">

                @if($pageMode==="register")
                選手情報登録
                @elseif($pageMode==="edit")
                選手情報更新
                @endif

            </h1>
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">
        <div class="row">
            <div class="col-md-10 ">
                <div class="row">
                    <div class="col-md-5"></div>
                    <div class="col-md-5">
                        @if ($errors->has('system_error'))
                        <p class="system-error-css text-danger">
                            {{
                            $errors->first('system_error') }}</p>
                        @endif
                    </div>
                    <div class="col-md-1"></div>
                </div>
            </div>

        </div>
        <div class="row"
            style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff;padding:30px 0px;width: 100%;">
            <div class="col-md-9 ">
                @if($pageMode==="register")
                <form class="form-horizontal"  enctype="multipart/form-data" role="form" style="display: flex"
                    method="POST" action="{{route('player.register')}}">
                    @elseif($pageMode==="edit")
                    <form class="form-horizontal" id = "editForm" onsubmit="return validateEditForm();" enctype="multipart/form-data" role="form" style="display: flex"
                        method="POST" action="{{route('player.edit')}}">
                        @endif
                        @csrf
                        <div class="col-md-5 ">
                            <div class=" col-md-5" style="margin-left: 17%;">
                                <div style="margin: 0px 0px 5px 15px; text-align:center"
                                    onclick="details('uploadInfo')">
                                    写真<i style="cursor:pointer" class="fa fa-question-circle" aria-hidden="true"></i>
                                    @if($pageMode==="edit")
                                    @if(($photo??""))
                                    <button class="btn btn-danger " style="margin:10px">
                                        削除
                                    </button>
                                    @endif
                                    @endif
                                    <div id="uploadInfo" style="margin-left: 15px">ああああああ</div>
                                </div>
                                <img style="margin: 0px 0px 5px 15px; text-align:center"
                                    src="{{asset('images/no-image.png')}}" class="avatar img-circle img-thumbnail"
                                    alt="avatar">
                                {{-- <div style="margin: 0px 0px 5px 15px" id="photoStatus"></div> --}}

                            </div>
                            <div class="col-md-10 text-center">

                                <h6>アップロードする画像</h6>

                                <input type="text" id="photoFileName" readonly="readonly" class="form-control"
                                    style="width: 70%;display:inline ">
                                <input type="file" id="photo" name="photo" accept="image/*" class="form-control"
                                    style="width: 80%; display:none">
                                <i onclick="document.getElementById('photo').click();" style="cursor:pointer"
                                    class="fa fa-file" aria-hidden="true"></i>

                                <p style="font-size:14px;margin-top:5px">ドラッグ＆ドロップで貼り付けることができます。</p>
                            </div>
                        </div>
                        <div class="col-md-1"></div>

                        <div class="col-md-5 "
                            style="background-color:#005BFC;padding:1rem 0.75rem; border-radius: 10px ; color:#fff">
                            @if(Session::has('status'))
                            <div class="alert alert-success" role="alert">
                                <a class="panel-close close" data-dismiss="alert" style="cursor: pointer">×</a>
                                {!! Session::get('status') !!}
                            </div>
                            @endif
                            @if(Session::has('system_error'))
                            <div class="alert alert-danger" style="color: red; font-weight:bold" role="alert">
                                <a class="panel-close close" data-dismiss="alert" style="cursor: pointer">×</a>
                                {!! Session::get('system_error') !!}
                            </div>
                            @endif
                            <div style="margin-right: 0.75rem;display:none;">
                                <div class=" alert alert-info alert-dismissable text-success"
                                    style="font-weight: bold; margin-left:1rem">
                                    <a class="panel-close close" data-dismiss="alert" style="cursor: pointer">×</a>
                                    {!! Session::get('message')!!}
                                </div>
                            </div>

                            {{--
                            <x-input-error :messages="$errors->get('system_error')" class="mt-2" /> --}}
                            @if($pageMode==="edit")
                            <div class="form-group row ">
                                <label onclick="details('playerIdInfo')" style="cursor:pointer;text-align:right"
                                    for="playerCode" class="col-sm-5  col-form-label">選手ID　<span><i
                                            class="fa fa-question-circle" aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7 col-form-label">{{ str_pad($playerId, 8, "0", STR_PAD_LEFT)}}</div>
                                <div id="playerIdInfo" style="margin-left:6rem">あああああああああああ</div>
                            </div>
                            @endif

                            <div class="form-group row ">
                                <label onclick="details('playerCodeInfo')" style="cursor:pointer;text-align:right"
                                    for="playerCode" class="col-sm-5  col-form-label">＊JARA選手コード　<span><i
                                            class="fa fa-question-circle" aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7">
                                    <input id="playerCode" class="form-control rounded  col-form-label"
                                        name="playerCode" maxlength="12" type="text"
                                        value="{{old('playerCode')?old('playerCode'):$JARAPlayerCode??""}}">
                                    <input id="registeredPlayerCode"  type="hidden"
                                        value="{{$JARAPlayerCode??""}}">
                                    
                                </div>

                                <div id="playerCodeInfo" style="margin-left:2rem">あああああああああああああああああああ</div>
                                {{-- @dd($errors->playerCode) --}}
                                @if ($errors->has('playerCode'))
                                <p class="error-css text-danger">
                                    {{
                                    $errors->first('playerCode') }}</p>
                                @endif

                            </div>
                            <div class="form-group row ">
                                <label onclick="details('playerNameInfo')" style="cursor:pointer;text-align:right"
                                    for="playerName" class="col-sm-5  col-form-label">＊選手名　<span><i
                                            class="fa fa-question-circle" aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7">
                                    <input id="playerName" maxlength="50" class="form-control rounded  col-form-label"
                                        name="playerName" type="text"
                                        value="{{old('playerName')?old('playerName'):$playerName??""}}">
                                </div>

                                <div id="playerNameInfo" style="margin-left:6rem">あああああああああああああああああああ</div>
                                @if ($errors->has('playerName'))
                                <p class="error-css text-danger">
                                    {{
                                    $errors->first('playerName') }}</p>
                                @endif

                            </div>

                            <div class="form-group row ">
                                <label onclick="details('birthDayInfo')" style="cursor:pointer;text-align:right"
                                    class="col-sm-5  col-form-label">＊生年月日　<span><i class="fa fa-question-circle"
                                            aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7">
                                    <input id="dateOfBirth" name="dateOfBirth" type="text"
                                        style="color: #000;background-color: #fff;"
                                        class="lib-flatpickr3 form-control rounded  col-form-label"
                                        value="{{(old('dateOfBirth')?old('dateOfBirth'):$birthDate??"年/月/日" )}}">
                                    {{-- OR(--}}

                                    {{-- {{old('playerCode')?old('playerCode'):$playerName??""}} --}}
                                </div>

                                <div id="birthDayInfo" style="margin-left:5rem;">あああああああああああああああああああ</div>
                                @if ($errors->has('dateOfBirth'))
                                <p class="error-css text-danger">
                                    {{
                                    $errors->first('dateOfBirth') }}</p>
                                @endif

                            </div>

                            <div class="form-group row ">
                                <label onclick="details('sexInfo')" style="cursor:pointer;text-align:right" for="sex"
                                    class="col-sm-5  col-form-label">＊性別　<span><i class="fa fa-question-circle"
                                            aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7">
                                    <select id="sex" name="sex" class="form-control rounded">
                                        <option value="" {{(old('sex')?old('sex'):$sex??"")=="" ? "selected" : "" }}></option>
                                        <option value=1 {{(old('sex')?old('sex'):$sex??"")=="1" ? "selected" : "" }}>男</option>
                                        <option value=2 {{(old('sex')?old('sex'):$sex??"")=="2" ? "selected" : "" }}>女</option>

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
                                <label onclick="details('heightInfo')" style="text-align:right" for="height"
                                    class="col-sm-5  col-form-label">＊身長　　
                                </label>
                                <div class="col-sm-5">
                                    <input class="form-control" id="height" name="height" type="text" maxlength=6
                                        style="float: left" value={{old('height')?old('height'):$height??""}}>
                                </div>
                                <label class="col-form-label">
                                    cm
                                </label>
                                {{-- <div class="col-sm-1">cm</div> --}}

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
                                        style="float: left" value={{old('weight')?old('weight'):$weight??""}}>
                                </div>

                                <label class="col-form-label">
                                    kg
                                </label>
                                {{-- <div class="col-sm-1">cm</div> --}}

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
                                            <input class="form-check-input" type="checkbox" name="sideInfo[]"
                                                value="00000001" {{((str_pad(($sideInfo??""), 8, "0", STR_PAD_LEFT)&"00000001")==="00000001")? 'checked' : '' }} id="checkS">
                                            <label class="form-check-label" for="checkS">
                                                : S
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="sideInfo[]"
                                                value="00000010" {{((str_pad(($sideInfo??""), 8, "0", STR_PAD_LEFT)&"00000010")==="00000010")? 'checked' : '' }} id="checkbox">
                                            <label class="form-check-label" for="checkB">
                                                : B
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="sideInfo[]"
                                                value="00000100" {{((str_pad(($sideInfo??""), 8, "0", STR_PAD_LEFT)&"00000100")==="00000100")? 'checked' : '' }}  id="checkSB">
                                            <label class="form-check-label" for="checkSB">
                                                : SB
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-sm-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="sideInfo[]"
                                                value="00001000" {{((str_pad(($sideInfo??""), 8, "0", STR_PAD_LEFT)&"00001000")==="00001000")? 'checked' : '' }} id="checkX">
                                            <label class="form-check-label" for="checkX">
                                                : X
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="sideInfo[]"
                                                value="00010000" {{((str_pad(($sideInfo??""), 8, "0", STR_PAD_LEFT)&"00010000")==="00010000")? 'checked' : '' }} id="checkCOX">
                                            <label class="form-check-label" for="checkCOX">
                                                : COX
                                            </label>
                                        </div>
                                    </div>

                                </div>
                                {{-- <div class="col-sm-1">cm</div> --}}

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
                                    <select id="birthCountry" name="birthCountry" class="form-control" value="">
                                        <option value="日本" {{(old('birthCountry')?old('birthCountry'):$birthCountry??"")=="日本" ? "selected" : "" }}>日本</option>
                                        <option value="アメリカ" {{(old('birthCountry')?old('birthCountry'):$birthCountry??"")=="アメリカ" ? "selected" : "" }}>アメリカ</option>
                                        <option value="インド" {{(old('birthCountry')?old('birthCountry'):$birthCountry??"")=="インド" ? "selected" : "" }}>インド</option>
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
                                    <select id="birthPrefecture" name="birthPrefecture" class="form-control">
                                        <option value="東京" {{(old('birthPrefecture')?old('birthPrefecture'):$birthPrefecture??"")=="東京" ? "selected" : "" }}>東京</option>
                                        <option value="愛知" {{(old('birthPrefecture')?old('birthPrefecture'):$birthPrefecture??"")=="愛知" ? "selected" : "" }}>愛知</option>
                                        <option value="宮崎"  {{(old('birthPrefecture')?old('birthPrefecture'):$birthPrefecture??"")=="宮崎" ? "selected" : "" }}>宮崎</option>
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
                                    <select id="country" name="residenceCountry" class="form-control">
                                        <option value="日本" {{(old('residenceCountry')?old('residenceCountry'):$residenceCountry??"")=="日本" ? "selected" : "" }}>日本</option>
                                        <option value="アメリカ" {{(old('residenceCountry')?old('residenceCountry'):$residenceCountry??"")=="アメリカ" ? "selected" : "" }}>アメリカ</option>
                                        <option value="インド" {{(old('residenceCountry')?old('residenceCountry'):$residenceCountry??"")=="インド" ? "selected" : "" }}>インド</option>
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
                                        <option value="東京" {{(old('residenceCountry')?old('residenceCountry'):$residenceCountry??"")=="東京" ? "selected" : "" }}>東京</option>
                                        <option value="愛知" {{(old('residenceCountry')?old('residenceCountry'):$residenceCountry??"")=="愛知" ? "selected" : "" }}>愛知</option>
                                        <option value="宮崎" {{(old('residenceCountry')?old('residenceCountry'):$residenceCountry??"")=="宮崎" ? "selected" : "" }}>宮崎</option>
                                    </select>
                                </div>

                                <div id="residencePrefectureInfo" style="margin-left:6rem">ああああああああ</div>
                            </div>

                            <div class="form-group row" style="padding: 2rem">
                                <div class="col-sm-2"></div>
                                <div class="col-sm-4">
                                    <button class="btn btn-success btn-lg btn-block">
                                        確認
                                    </button>
                                </div>
                                <div class="col-sm-2"></div>
                                <div class="col-sm-4">
                                    <a class="btn btn-danger btn-lg btn-block" href="../../dashboard" role="button">戻る</a>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-1"></div>

                    </form>
            </div>
            <div class="col-md-3" style="text-align: right">
                @if($pageMode==="edit")
                <!-- Button trigger modal -->
                <button type="button" class="btn btn-secondary btn-lg" data-toggle="modal" id="checkeWarningMessage"
                    data-target="#staticBackdrop" style="display: none">
                    マイページ
                </button>

                <!-- Modal -->
                <div class="modal fade" id="staticBackdrop" data-backdrop="static" data-keyboard="false" tabindex="-1"
                    aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 style="color:#000" class="modal-title" id="staticBackdropLabel">メッセージ</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body" style="color: #000; text-align:center">
                                JARA選手コードが変更されています。<br/>
                                過去のレース結果との紐づけが失われます。<br/>
                                変更しますか？
                            </div>
                            <div class="modal-footer">
                                <button onclick="changeStatus()" role="button" class="btn btn-success" data-dismiss="modal">OK</button>
                                <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
                @endif


                @if($pageMode==="delete")
                <!-- Button trigger modal -->
                <button type="button" class="btn btn-secondary btn-lg" data-toggle="modal"
                    data-target="#staticBackdrop">
                    マイページ
                </button>

                <!-- Modal -->
                <div class="modal fade" id="staticBackdrop" data-backdrop="static" data-keyboard="false" tabindex="-1"
                    aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 style="color:#000" class="modal-title" id="staticBackdropLabel">メッセージ</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body" style="color: #000; text-align:center">
                                マイページに遷移します。<br />
                                入力された内容は破棄されますが、よろしいですか？
                            </div>
                            <div class="modal-footer">
                                <a href="../../dashboard" role="button" class="btn btn-success">OK</a>
                                <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
                @endif
            </div>
        </div>
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
            defaultDate: 'null',
            "maxDate": "today",
        });
    </script>
    {{-- Date Picker End --}}
    <script>
        // for page reloading when using back button is click from web page
        // (function () {
        // window.onpageshow = function(event) {
        //     if (event.persisted) {
        //         window.location.reload();
        //     }
        // };
        // })();
        function changeStatus()
        {
            document.getElementById("status").value="true";
            document.getElementById("editForm").submit();
        }
        function validateEditForm()
        {
            if(document.getElementById("status").value==="true")
                return true;
            if(document.getElementById("registeredPlayerCode").value!==document.getElementById("playerCode").value)
                document.getElementById("checkeWarningMessage").click();
            else
                return true;
            return false;
        // if(check if your conditions are not satisfying)
        // { 
        //     alert("validation failed false");
        //     returnToPreviousPage();
        //     return false;
        // }

        // alert("validations passed");
        // return true;
        }
    </script>
    <script src="{{ asset('js/nav.js') }}"></script>
    <script src="{{ asset('js/main.js') }}"></script>
</body>

</html>