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
    @if($page_mode==="register")
    <title>Player Registration</title>
    @elseif($page_mode==="edit")
    <title>Player Edit</title>
    @endif
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
        integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">

    <link rel="stylesheet" type="text/css" href="{{ asset('css/player-register.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/nav.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/style.css') }}">

    {{-- Date Picker --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">

</head>

<body>
    <div class="container-fluid bootstrap snippets bootdey"
        style="background: linear-gradient(to right,#1991FC,  #45b796);padding:0;color: #000;font-weight:500;min-height:100vh; width:100vw">
        <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
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
    
                <a href="route('logout')" onclick="event.preventDefault();
                                    this.closest('form').submit();">
                    ログアウト
                </a>
            </form>
        </div>
        <div style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff;padding-top:15px;">
            <span class="col-md-3 " style="font-size:30px;cursor:pointer" onclick="openNav()">&#9776; メニュー</span>
            <h1 style="display: inline;margin-left:29.5%" class="text-right col-md-9">

                @if($page_mode==="register")
                選手情報登録
                @elseif($page_mode==="edit")
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
                @if($page_mode==="register")
                    <form class="form-horizontal"  enctype="multipart/form-data" role="form" style="display: flex" method="POST" action="{{route('player.register')}}">
                @elseif($page_mode==="edit")
                    <form class="form-horizontal" id = "editForm" onsubmit="return validateEditForm();" enctype="multipart/form-data" role="form" style="display: flex" method="POST" action="{{route('player.edit')}}">
                @endif
                    @csrf
                    <div class="col-md-5">
                        <div class=" col-md-5" style="margin-left: 17%;">
                            <div style="display: flex" >
                            <p class="col-form-label" style="margin: 8px 0px 5px 15px; text-align:center"
                                onclick="details('uploadInfo')">
                                写真<i style="cursor:pointer" class="fa fa-question-circle" aria-hidden="true"></i>
                                
                                
                            </p>
                            @if($page_mode==="edit")
                                @if(($photo??""))
                                <p id="playerPictureDeleteButton" onclick="playerPictureDelete()" class="btn btn-secondary " style="margin:10px;">
                                    削除
                                </p>
                                <input name="player_picture_status" id="playerPictureStatus" type="hidden" value="">
                                @endif
                            @endif
                            </div>
                            <div id="uploadInfo" style="margin-left: 15px">ああああああ</div>
                            
                            @if($page_mode==="edit")
                                @if($photo??"")
                                <img id = "playerPicture" src="{{ asset('images/players/'.$photo) }}" class="avatar img-circle img-thumbnail" alt="avatar">
                                @else
                                <img id = "playerPicture" src="{{ asset('images/no-image.png') }}" class="avatar img-circle img-thumbnail" alt="avatar">
                                @endif
                            
                            @else
                            <img style="margin: 0px 0px 5px 15px; text-align:center"
                                src="{{asset('images/no-image.png')}}" class="avatar img-circle img-thumbnail"
                                alt="avatar">
                            @endif

                        </div>
                        <div class="col-md-10 text-center">
                            <br/>
                            <div style="vertical-align: middle ">
                                <input type="file"  accept="image/*" name="photo" id="input-file-03">
                                
                                <label id="dropzone-03" >ファイルをここにドロップ</label>
                                <p id="bt-file-03" role="button" class="btn btn-secondary " style="margin-right:5px ;"  aria-hidden="true">参照</p>
                                <i class="fa fa-times" onclick="deleteUploadedPhoto()" id="deleteUploadedPhoto"  style="color:red;font-size:40px;display:none;cursor:pointer" aria-hidden="true"></i>
                            </div>
                            <div id="output-03" style="margin-left:70px;text-align:left" class="output"></div>

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
                        @if($page_mode==="edit")
                        <div class="form-group row ">
                            <label onclick="details('playerIdInfo')" style="cursor:pointer;text-align:right"
                                for="playerCode" class="col-sm-5  col-form-label">選手ID　<span><i
                                        class="fa fa-question-circle" aria-hidden="true"></i></span>
                            </label>
                            <div class="col-sm-7 col-form-label">{{ str_pad($player_info->player_id, 8, "0", STR_PAD_LEFT)}}</div>
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

                        <div class="form-group row" style="padding: 2rem">
                            <div class="col-sm-2"></div>
                            <div class="col-sm-4">
                                <button class="btn btn-success btn-lg btn-block">
                                    確認
                                </button>
                            </div>
                            <div class="col-sm-2"></div>
                            <div class="col-sm-4">
                                <a class="btn btn-danger btn-lg btn-block" href="javascript:history.back()" role="button">戻る</a>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-1"></div>

                </form>
            </div>
            <div class="col-md-3" style="text-align: right">
                @if($page_mode==="edit")
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


                @if($page_mode==="delete")
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
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js"></script>
    <script>    
        flatpickr('.flatpickr', {
            locale: "ja",
            dateFormat: 'Y/m/d',
            maxDate: "today",
            // defaultDate: "年/月/日" //'null',
        });
    </script>
    {{-- Date Picker End --}}
    <script>
        function changeStatus()
        {
            document.getElementById("status").value="true";
            document.getElementById("editForm").submit();
        }
        function validateEditForm()
        {
            const registeredPlayerCode = document.getElementById("registeredPlayerCode");
            const playerCode = document.getElementById("playerCode");
            if(document.getElementById("status").value==="true")
                return true;
            if(registeredPlayerCode){
                if(registeredPlayerCode.value!==playerCode.value)
                    document.getElementById("checkeWarningMessage").click();
                else
                    return true;
            }
            else
            return true;
            
            return false;
        }
    </script>
    <script src="{{ asset('js/nav.js') }}"></script>
    <script src="{{ asset('js/main.js') }}"></script>
</body>

</html>