{{--*************************************************************************
* Project name: JARA
* File name: profile-edit.blade.php
* File extension: .blade.php
* Description: This is the ui of profile edit page
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/11/07
* Updated At: 2023/11/09
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

    <link rel="stylesheet" type="text/css" href="{{ asset('css/profile-edit.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/nav.css') }}">

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
            @if(Session::has('fromLoginPage'))
            <h1 class="text-right col-md-9">{{ Session::get('fromLoginPage') }}</h1>
            @else
            <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">
                ユーザー情報変更画面
            </h1>
            @endif
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">

        <div class="row"
            style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff;padding:30px 0px;width: 100%;">
            <div class="col-md-9 ">

                {{-- <div class="alert alert-info alert-dismissable">
                    <a class="panel-close close" data-dismiss="alert">×</a>
                    <i class="fa fa-coffee"></i>
                    This is an <strong>.alert</strong>. Use this to show important messages to the user.
                </div> --}}

                <form class="form-horizontal" enctype="multipart/form-data" role="form" style="display: flex"
                    method="POST" action="{{route('profile.edit')}}">
                    @csrf

                    <div class="col-md-5 ">
                        <div class=" col-md-5" style="margin-left: 17%;">
                            <div style="margin: 0px 0px 5px 15px; text-align:center">写真　<span id="photoDeleteButton"
                                    onclick="photoDelete()" style="display: none" class=" btn btn-danger btn-sm"
                                    type="button"> 取消
                                </span>
                                <img src="{{ asset('images/'.((Auth::user()->photo??"")?Auth::user()->photo:'no-image.png')) }}"
                                    class="avatar img-circle img-thumbnail" alt="avatar">
                            </div>
                            <div style="margin: 0px 0px 5px 15px" id="photoStatus"></div>

                        </div>
                        <div class="col-md-10 text-center">

                            <h6>アップロードする画像</h6>

                            {{-- <form method="post" enctype="multipart/form-data">
                                <div>
                                    <label for="profile_pic">アップロードするファイルを選択してください</label>
                                    <input type="file" id="profile_pic" name="profile_pic" accept=".jpg, .jpeg, .png" />
                                </div>
                                <div>
                                    <button>送信</button>
                                </div>
                            </form> --}}
                            {{-- image/png, image/jpeg, image/jpeg //image format--}}

                            <input type="text" id="photoFileName" readonly="readonly" class="form-control"
                                style="width: 70%;display:inline ">
                            <input type="file" id="photo" name="photo" accept="image/*" class="form-control"
                                style="width: 80%; display:none">
                            <i onclick="document.getElementById('photo').click();" style="cursor:pointer"
                                class="fa fa-file" aria-hidden="true"></i>
                            <i style="cursor:pointer" onclick="details('uploadInfo')" class="fa fa-question-circle"
                                aria-hidden="true"></i>

                            <div id="uploadInfo" style="margin-left: 15px">ああああああああああ</div>
                            <p style="font-size:14px;margin-top:5px">ドラッグ＆ドロップで貼り付けることができます。</p>
                        </div>
                    </div>
                    <div class="col-md-1"></div>

                    <div class="col-md-5 "
                        style="background-color:#005BFC;padding-top:15px; border-radius: 10px ; color:#fff">
                        @if(Session::has('status'))
                        <div class="alert alert-success" role="alert">
                            <a class="panel-close close" data-dismiss="alert" style="cursor: pointer">×</a>
                            {!! Session::get('status') !!}
                        </div>
                        @endif
                        <div style="margin-right: 0.75rem;display:none;">
                            <div class=" alert alert-info alert-dismissable text-success"
                                style="font-weight: bold; margin-left:1rem">
                                <a class="panel-close close" data-dismiss="alert" style="cursor: pointer">×</a>
                                {!! Session::get('message')!!}
                            </div>
                        </div>
                        <x-input-error :messages="$errors->get('datachecked')" class="mt-2" />

                        <div class="form-group ">
                            <label onclick="details('userInfo')" style="margin-left:1rem;cursor:pointer" for="userName"
                                class=" control-label">＊ユーザー名 :
                            </label>
                            <i onclick="details('userInfo')" style="cursor:pointer" class=" fa fa-question-circle"
                                aria-hidden="true"></i>
                            <div id="userInfo" style="margin-left:1rem">あああああああああああああああああああ</div>
                            @if ($errors->has('userName'))
                            <div class="col-lg-12">
                                <input id="userName" name="userName" class="form-control border "
                                    style="border-radius: 50px" type="text" value="{{old('userName')}}">
                            </div>
                            @else
                            <div class="col-lg-12">
                                <input id="userName" name="userName" class="form-control " type="text"
                                    value="{{old('userName')?old('userName'):Auth::user()->userName}}">
                            </div>
                            @endif
                            @if ($errors->has('userName'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{
                                $errors->first('userName') }}</p>
                            @endif
                        </div>
                        <div class="form-group">
                            <div style="display:none">
                                <input type="text" id="mailAddressStatus" name="mailAddressStatus"
                                    value="{{old('mailAddressStatus')}}" />
                            </div>
                            {{-- <input type="hidden" display="none;" id="mailAddressStatus" name="mailAddressStatus"
                                value=0 /> --}}
                            <p class="col-lg-12 control-label" id="emailChange">＊メールアドレス :　
                                @if(Auth::user()->tempPasswordFlag==0)
                                <span onclick="emailChangeBox()" class=" btn btn-secondary btn-sm" type="button">
                                    変更
                                </span>
                                @endif
                            </p>
                            <p id="emailChangeButton" class="col-lg-12" style="margin-left:1rem">
                                {{Auth::user()->mailAddress}}
                            </p>

                        </div>
                        @if(Auth::user()->tempPasswordFlag==0)
                        <div class="form-group" id="emailChangeBox" style="border: 1px solid #000;margin:1rem">
                            <div class="form-group" style="margin-top:1rem">
                                <label for="mailAddress" class="col-lg-12 control-label">＊メールアドレス :
                                </label>
                                <div class="col-lg-12">
                                    <input id="mailAddress" name="mailAddress" class="form-control" type="text"
                                        value="{{old('mailAddress')}}">
                                </div>

                                @if ($errors->has('mailAddress'))
                                <p id="emailStatus" style="margin: 1rem; font-weight:bold; color:red;">{{
                                    $errors->first('mailAddress')
                                    }}</p>
                                @endif
                            </div>
                            <div class="form-group">
                                <label for="confirm_email" class="col-lg-12 control-label">＊メールアドレス確認 :
                                </label>
                                <div class="col-lg-12">
                                    <input id="confirm_email" name="confirm_email" class="form-control" type="text"
                                        value="{{old('confirm_email')}}">
                                </div>
                                @if ($errors->has('confirm_email'))
                                <p id="confirmEmailStatus" style="margin: 1rem; font-weight:bold; color:red;">{{
                                    $errors->first('confirm_email')
                                    }}</p>
                                @endif
                            </div>
                            <div class="col-lg-12" style=" text-align:right">
                                <span id="mailChange" onclick="emailChangeBox()" class="  btn btn-danger btn-sm"
                                    type="button" style="margin: 1rem;">
                                    取消
                                </span>
                            </div>

                        </div>
                        @endif
                        <div class="form-group">
                            <label class="col-lg-3 control-label">＊性別 :
                            </label>

                            <div class="col-lg-12">

                                <select id="sex" name="sex" class="form-control" value=>
                                    @if((old('sex')??"")?old('sex'):Auth::user()->sex===1)
                                    <option value=1>男</option>
                                    <option value=2>女</option>
                                    @elseif((old('sex')??"")?old('sex'):Auth::user()->sex===2)
                                    <option value=2>女</option>
                                    <option value=1>男</option>
                                    @else
                                    <option value=0>-</option>
                                    <option value=1>男</option>
                                    <option value=2>女</option>
                                    @endif

                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label onclick="details('birthDayInfo')" class=" control-label"
                                style="margin-left:1rem; cursor:pointer">生年月日 :
                            </label>
                            <i onclick="details('birthDayInfo')" style="cursor:pointer" class=" fa fa-question-circle"
                                aria-hidden="true"></i>
                            <div id="birthDayInfo" style="margin-left:1rem">あああああああああああああああああああ</div>
                            <div class="col-lg-12">
                                {{-- {{ old('dateOfBirth', date('Y/m/d')) }} --}}
                                {{-- {{request()->has('dateOfBirth')?old('dateOfBirth',
                                date('Y/m/d')):Auth::user()->dateOfBirth}} --}}

                                <input id="dateOfBirth" name="dateOfBirth" type="text"
                                    style="color: #000;background-color: #fff;" class="lib-flatpickr3 form-control"
                                    value="{{old('dateOfBirth')?old('dateOfBirth'):Auth::user()->dateOfBirth}}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-lg-3 control-label">＊居住地 :
                            </label>
                            <div class="col-lg-12">
                                <select id="residenceCountry" name="residenceCountry" class="form-control">
                                    <option value="日本" selected>日本</option>
                                    <option value="アメリカ">アメリカ</option>
                                    <option value="インド">インド</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group" id="residencePrefectures">
                            <label class="col-lg-6 control-label">＊都道府県 :
                            </label>
                            <div class="col-lg-12">
                                <select id="residencePrefecture" name="residencePrefecture" class="form-control">
                                    <option value="愛知">愛知</option>
                                    <option value="宮崎">宮崎</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group" style="display: flex">
                            <div class="col-lg-6">
                                <label onclick="details('hightInfo')" style="cursor:pointer" class=" control-label">身長
                                    :
                                </label>
                                <i onclick="details('hightInfo')" style="cursor:pointer" class=" fa fa-question-circle"
                                    aria-hidden="true"></i>
                                <div id="hightInfo" style="margin-left:1rem">あああああ</div>
                                <div class="col-lg-12 " style="display: flex; margin-left:-1rem">
                                    <input class="form-control" id="height" name="height" type="text" maxlength=6
                                        style="float: left" value={{old('height')?old('height'):Auth::user()->height}}>
                                    <span>cm</span>
                                </div>

                            </div>
                            <div class="col-lg-6">
                                <label onclick="details('weightInfo')" style="cursor:pointer" class=" control-label">体重
                                    :
                                </label>
                                <i onclick="details('weightInfo')" style="cursor:pointer" class=" fa fa-question-circle"
                                    aria-hidden="true"></i>
                                <div id="weightInfo" style="margin-left:1rem">ああああああ</div>
                                <div class="col-lg-12" style="display: flex;margin-left:-1rem">
                                    <input maxlength=6 class="form-control" id="weight" name="weight" type="text"
                                        style="float: left" value={{old('weight')?old('weight'):Auth::user()->weight}}>
                                    <span>kg</span>
                                </div>
                            </div>

                        </div>
                        <div class="form-group" style="display: flex; margin-top:2rem;gap: 4rem;">

                            <div class="col-lg-5" style="text-align: right">
                                <x-primary-button class=" btn btn-success btn-lg btn-block">
                                    {{ __('確認') }}
                                </x-primary-button>

                                {{-- <input class="btn btn-success btn-lg btn-block" type="submit" value="確認">
                                --}}
                            </div>
                            <div class="col-lg-5" style="text-align: right">
                                <a class="btn btn-danger btn-lg btn-block" href="./dashboard" role="button">戻る</a>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-1"></div>

                </form>
            </div>
            <div class="col-md-3" style="text-align: right">
                <p class="col-lg-9 control-label" style="font-weight: bold">ユーザーID :
                    {{Auth::user()->userId}}
                </p>
                <p class="col-lg-9 control-label" style="font-weight: bold">ユーザー種別 :
                    {{Auth::user()->userType}}
                </p>
                @if(Auth::user()->tempPasswordFlag==0)
                <p id="passwordChangeButton" onclick="passwordChangeConfirm()" class="col-lg-9 control-label"
                    style="font-weight: bold; text-decoration:underline; color:blue;cursor: pointer">
                    パスワードの変更
                </p>
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
            allowInput: true,
            defaultDate: 'null',
        });
    </script>
    {{-- Date Picker End --}}

    <script src="{{ asset('js/nav.js') }}"></script>
    <script src="{{ asset('js/main.js') }}"></script>
</body>

</html>