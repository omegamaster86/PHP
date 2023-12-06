{{--*************************************************************************
* Project name: JARA
* File name: edit.blade.php
* File extension: .blade.php
* Description: This is the ui of user edit page
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
    <title>User Edit</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
        integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">

    <link rel="stylesheet" type="text/css" href="{{ asset('css/style.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/nav.css') }}">

    {{-- Date Picker --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    

</head>

<body>
    {{-- background-color: #9FD9F6; --}}
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
            <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">
                ユーザー情報変更画面
            </h1>
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">

        <div class="row"
            style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff;padding:30px 0px;width: 100%;">
            <div class="col-md-9 ">

                <form class="form-horizontal" onsubmit="return validateProfileEditForm();" enctype="multipart/form-data" role="form" style="display: flex"
                    method="POST" action="{{route('user.edit')}}">
                    @csrf

                    <div class="col-md-5 ">
                        <div class=" col-md-5" style="margin-left: 17%;">
                            <div style="margin: 0px 20px 5px 15px; text-align:center">写真　
                                @if(($user['photo']))
                                    <span id="userPictureDeleteButton" onclick="userPictureDelete()"  class=" btn btn-danger btn-sm" type="button"> 取消
                                    </span>
                                @endif
                                <input name="userPictureStatus" id="userPictureStatus" type="hidden" value="">
                            </div>
                            @if(($user['photo']))
                            <img id= "userPicture" src="{{ asset('images/users/'.$user['photo']) }}"
                            class="avatar img-circle img-thumbnail" alt="avatar">
                            @else
                            <img id= "userPicture" src="{{ asset('images/no-image.png') }}"
                            class="avatar img-circle img-thumbnail" alt="avatar">
                            @endif
                           
                            <div style="margin: 0px 0px 5px 15px" id="photoStatus"></div>

                        </div>
                        <div class="col-md-10 text-center">

                            <h6>アップロードする画像</h6>
                            <div style="vertical-align: middle ">
                                <input type="file"  accept="image/png, image/jpeg, image/jpeg, image/svg " name="photo" id="input-file-03">
                                <label id="dropzone-03" >ファイルをここにドロップ</label>
                                <p id="bt-file-03" role="button" class="btn btn-secondary " style="margin-right:5px ;"  aria-hidden="true">参照</p>
                                <i class="fa fa-times" onclick="deleteUploadedPhoto()" id="deleteUploadedPhoto"  style="color:#6c757d;font-size:40px;display:none;cursor:pointer" aria-hidden="true"></i>
                            </div>
                            <div id="output-03" style="margin-left:70px;text-align:left" class="output"></div>
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
                            
                            <div class="col-lg-12">
                                @if (old('user_name')??"" or $errors->has('user_name'))
                                <input id="userName" name="user_name" class="form-control border " type="text" value="{{old('user_name')}}">
                                @else
                                    <input id="userName" name="user_name" class="form-control " type="text"
                                        value="{{$user['user_name']}}">
                                @endif
                                @if ($errors->has('user_name'))
                                    <p class="error-css text-danger" style="margin: 1rem 0rem">{{
                                    $errors->first('user_name') }}</p>
                                @endif

                            </div>
                            
                        </div>
                        <div class="form-group">
                            <div style="display:none">
                                <input type="text" id="mailAddressStatus" name="mailAddressStatus"
                                    value="{{old('mailAddressStatus')}}" />
                            </div>
                            <p class="col-lg-12 control-label" id="emailChange">＊メールアドレス :　
                                <span onclick="emailChangeBox()" class=" btn btn-secondary btn-sm" type="button">
                                    変更
                                </span>
                            </p>
                            <p id="emailChangeButton" class="col-lg-12" style="margin-left:1rem">
                                {{$user['mailaddress']}}
                            </p>

                        </div>
                        <div class="form-group" id="emailChangeBox" style="border: 1px solid #000;margin:1rem">
                            <div class="form-group" style="margin-top:1rem">
                                <label for="mailAddress" class="col-lg-12 control-label">＊メールアドレス :
                                </label>
                                <div class="col-lg-12">
                                    <input id="mailAddress" name="mailaddress" class="form-control" type="text" value="{{old('mailaddress')}}">
                                    @if ($errors->has('mailaddress'))
                                    <p id="emailStatus" class="error-css text-danger" style="margin: 1rem 0rem">{{$errors->first('mailaddress')}}</p>
                                    @endif
                                </div>

                                
                            </div>
                            <div class="form-group">
                                <label for="confirm_email" class="col-lg-12 control-label">＊メールアドレス確認 :
                                </label>
                                <div class="col-lg-12">
                                    <input id="confirm_email" name="confirm_email" class="form-control" type="text" value="{{old('confirm_email')}}">
                                    @if ($errors->has('confirm_email'))
                                    <p id="confirmEmailStatus" class="error-css text-danger" style="margin: 1rem 0rem">{{
                                        $errors->first('confirm_email')
                                        }}</p>
                                    @endif
                                </div>
                                
                            </div>
                            <div class="col-lg-12" style=" text-align:right">
                                <span id="mailChange" onclick="emailChangeBox()" class="  btn btn-danger btn-sm"
                                    type="button" style="margin: 1rem;">
                                    取消
                                </span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-lg-3 control-label">＊性別 :
                            </label>

                            <div class="col-lg-12">

                                @if (old('sex')??"" or $errors->has('sex'))
                                <select id="sex" name="sex" class="form-control" >
                                    <option value="" >--</option>
                                    <option value=1 {{(old('sex')===1) ? "selected" : ""}} >男</option>
                                    <option value=2 {{(old('sex')===2) ? "selected" : ""}}>女</option>
                                </select>
                                @else
                                <select id="sex" name="sex" class="form-control" >
                                    <option value="" selected >--</option>
                                    <option value=1 {{($user['sex']===1) ? "selected" : ""}} >男</option>
                                    <option value=2 {{($user['sex']===2) ? "selected" : ""}}>女</option>
                                </select>
                                @endif

                                
                                @if ($errors->has('sex'))
                                    <p class="error-css text-danger" style="margin: 1rem 0rem">{{
                                        $errors->first('sex') }}</p>
                                @endif
                            </div>
                        </div>
                        <div class="form-group">
                            <label onclick="details('birthDayInfo')" class=" control-label" style="margin-left:1rem; cursor:pointer">＊生年月日 :
                            </label>
                            <i onclick="details('birthDayInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                            <div id="birthDayInfo" style="margin-left:1rem">あああああああああああああああああああ</div>
                            <div class="col-lg-12">
                                <input id="dateOfBirth" name="date_of_birth" type="text" style="color: #000;background-color: #fff;" class="flatpickr form-control" value="{{old('date_of_birth')?old('date_of_birth'):($user['date_of_birth']??"年/月/日")}}" readonly="readonly">
                            </div>
                            @if ($errors->has('date_of_birth'))
                            <div class="col-lg-12">
                                <p class="error-css text-danger" style="margin: 1rem 0rem">{{ $errors->first('date_of_birth') }}</p>
                            </div>
                            @endif
                        </div>
                        <div class="form-group">
                            <label class="control-label" style="margin-left: 1rem">＊居住地 :
                            </label>
                            <div class="col-lg-12">
                                @if (old('residence_country')??"" or ($errors->has('residence_country')))
                                
                                <select id="residenceCountry" name="residence_country" class="form-control">
                                    <option value="" selected>--</option>
                                    <option value="日本"  {{(old('residence_country')==="日本") ? "selected" : ""}}>日本</option>
                                    <option value="アメリカ" {{(old('residence_country')==="アメリカ") ? "selected" : ""}}>アメリカ</option>
                                    <option value="インド" {{(old('residence_country')==="インド") ? "selected" : ""}}>インド</option>
                                </select>
                                @else
                                <select id="residenceCountry" name="residence_country" class="form-control">
                                    <option value="" selected>--</option>
                                    <option value="日本"  {{($user['residence_country']==="日本")?"selected" : ""}}>日本</option>
                                    <option value="アメリカ" {{($user['residence_country']==="アメリカ")?"selected" : ""}}>アメリカ</option>
                                    <option value="インド" {{($user['residence_country']==="インド")?"selected" : ""}}>インド</option>
                                </select>
                                @endif
                                @if ($errors->has('residence_country'))
                                
                                    <p class="error-css text-danger" style="margin: 1rem 0rem">{{
                                        $errors->first('residence_country') }}</p>
                                @endif
                            </div>
                            
                        </div>
                        <div class="form-group" id="residencePrefectures" style="display: none">
                            <label class="col-lg-6 control-label">＊都道府県 :
                            </label>
                            <div class="col-lg-12">
                                @if (old('residence_prefecture')??"" or ($errors->has('residence_prefecture')))
                                <select id="residencePrefecture" name="residence_prefecture" class="form-control">
                                    <option value="" selected>--</option>
                                    <option value="愛知" {{(old('residence_prefecture')==="愛知") ? "selected" : ""}}>愛知</option>
                                    <option value="宮崎" {{(old('residence_prefecture')==="宮崎") ? "selected" : ""}}>宮崎</option>
                                </select>
                               
                                @else
                                <select id="residencePrefecture"  name="residence_prefecture" class="form-control">
                                    <option value="">--</option>
                                    <option value="愛知" {{($user['residence_prefecture']==="愛知")?"selected" : ""}}>愛知</option>
                                    <option value="宮崎" {{($user['residence_prefecture']==="宮崎")?"selected" : ""}}>宮崎</option>
                                </select>
                                @endif
                                @if ($errors->has('residence_prefecture'))
                                    <p class="error-css text-danger"  style="margin: 1rem 0rem">{{
                                        $errors->first('residence_prefecture') }}</p>
                                @endif
                               
                            </div>
                            
                        </div>
                        <div class="form-group" style="display: flex">
                            <div class="col-lg-6">
                                <label onclick="details('heightInfo')" style="cursor:pointer" class=" control-label">身長
                                    :
                                </label>
                                <i onclick="details('heightInfo')" style="cursor:pointer" class=" fa fa-question-circle"
                                    aria-hidden="true"></i>
                                <div id="heightInfo" style="margin-left:1rem">あああああ</div>
                                <div class="col-lg-12 " style="display: flex; margin-left:-1rem">
                                    <input class="form-control" id="height" name="height" type="text" maxlength=6
                                        style="float: left" value={{old('height')?old('height'):$user['height']}}>
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
                                        style="float: left" value={{old('weight')?old('weight'):$user['weight']}}>
                                    <span>kg</span>
                                </div>
                            </div>

                        </div>
                        <div class="form-group" style="display: flex; margin-top:2rem;gap: 4rem;">

                            <div class="col-lg-5" style="text-align: right">
                                <button class=" btn btn-success btn-lg btn-block">
                                    確認
                                </button>
                            </div>
                            <div class="col-lg-5" style="text-align: right">
                                <a class="btn btn-danger btn-lg btn-block" href="javascript:history.back()" role="button">戻る</a>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-1"></div>

                </form>
            </div>
            <div class="col-md-3" style="text-align: right">
                <p class="col-lg-9 control-label" style="font-weight: bold">ユーザーID :
                    {{ str_pad($user['user_id'], 7, "0", STR_PAD_LEFT)}}
                </p>
                <p class="col-lg-9 control-label" style="font-weight: bold">ユーザー種別 :
                    {{str_pad($user['user_type'], 8, "0", STR_PAD_LEFT)}}
                </p>
                <p id="passwordChangeButton" onclick="passwordChangeConfirm()" class="col-lg-9 control-label"
                    style="font-weight: bold; text-decoration:underline; color:blue;cursor: pointer">
                    パスワードの変更
                </p>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous">
    </script>
    {{-- Date Picker Start --}}
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js"></script>
    <script>    
        flatpickr('.flatpickr', {
            locale: "ja",
            dateFormat: 'Y/m/d',
            maxDate: "today"
        });
    </script>
    {{-- Date Picker End --}}
    <script>
        function validateProfileEditForm()
        {
            const dateOfBirth = document.getElementById("dateOfBirth");
            if(dateOfBirth.value==="年/月/日")
                dateOfBirth.value = "";
            return true;
        }
    </script>

    <script src="{{ asset('js/nav.js') }}"></script>
    <script src="{{ asset('js/main.js') }}"></script>
</body>

</html>