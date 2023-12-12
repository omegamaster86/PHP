{{--*************************************************************************
* Project name: JARA
* File name: password-change-page.blade.php
* File extension: .blade.php
* Description: This is the ui of password change page
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/11/25
* Updated At: 2023/11/25
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
    <title>Password Change</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/nav.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/style.css') }}">



</head>

<body>
    {{-- background-color: #9FD9F6; --}}
    <div class="container-fluid bootstrap snippets bootdey"
        style="background: linear-gradient(to right,#1991FC,  #45b796);padding:0;color: #000;font-weight:500;min-height:100vh; width:100vw">
        <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
            @if($user['temp_password_flag']===0)
                <a href={{route('my-page')}}>マイページ</a>
                <a href={{route('user.edit')}}>情報更新</a>
                <a href={{route('user.details')}}>情報参照</a>
                <a href={{route('user.delete')}}>退会</a>
                <a href={{route('player.register')}}>選手情報登録</a>
                <a href={{route('player.edit')}}>選手情報更新</a>
                <a href={{route('player.delete')}}>選手情報削除</a>
                <a href={{route('organization.management')}}>団体管理</a>
            @endif
            <form method="POST" action="{{ route('logout') }}">
                @csrf
    
                <a href="route('logout')" onclick="event.preventDefault();
                                    this.closest('form').submit();">
                    ログアウト
                </a>
            </form>
        </div>
        <div class="col-md-12 d-flex" style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff;padding-top:15px;">
            <span class="col-md-3 " style="font-size:30px;cursor:pointer" onclick="openNav()">&#9776; メニュー</span>
            <div class="col-md-6 " style="text-align: center">
                <h1 >
                    パスワード変更
                </h1>
                <p >ユーザー名　：　{{$user['user_name']}}</p>
            </div>
            
            <div class="col-md-1"></div>
            <div class="col-md-2" style="text-align: right">
                <p class="col-lg-12 control-label" style="font-weight: bold">ユーザーID :
                    {{ str_pad($user['user_id'], 7, "0", STR_PAD_LEFT)}}
                </p>
                <p class="col-lg-12 control-label" style="font-weight: bold">ユーザー種別 :
                    {{str_pad($user['user_type'], 8, "0", STR_PAD_LEFT)}}
                </p>
            </div>
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">
        <div class="col-lg-12 mt-5 " style="display: flex">
            <div class="col-lg-3"></div>
            <div class="col-lg-6 mb-5" style="background-color: #005BFC;padding-top: 15px;border-radius: 10px; color: #fff;padding:3rem">
                <form class="form-horizontal" style="display: flex" method="POST" action="{{route('user.password-change')}}">
                    @csrf
                    <div class="col-md-12 ">
                        @if ($errors->has('system_error'))
                            <div  class="col-lg-12 form-group " >
                                <p class="error-css" style="color: red;margin:0rem">
                                    {!! $errors->first('system_error') !!}
                                </p>
                            </div>
                        @endif
                        <div class="col-lg-12 d-flex form-group ">
                            <label  class="col-lg-4 control-label">＊旧パスワード　:　</label>
                            <input id="previousPassword" name="previous_password" class="col-lg-8 form-control" type="password" maxlength="16" value="{{old('previous_password')}}">
                        </div>
                        @if ($errors->has('previous_password'))
                            <div  class="col-lg-12 form-group " >
                                <p class="error-css" style="color: red;margin:0rem">
                                    {!! $errors->first('previous_password') !!}
                                </p>
                            </div>
                        @endif
                        <div class=" col-lg-12 form-group d-flex" >
                            <p class="col-lg-4 control-label" >＊新パスワード　:　
                            </p>
                            <input name="new_password" id="newPassword" class=" col-lg-8 form-control" type="password" maxlength="16"
                            value="{{old('new_password')}}">
                        </div>
                        @if ($errors->has('new_password'))
                            <div  class="col-lg-12 form-group " >
                                <p class="error-css" style="color: red;margin:0rem">
                                    {!! $errors->first('new_password') !!}
                                </p>
                            </div>
                        @endif
                        <div class=" col-lg-12 form-group d-flex" >
                            <p class="col-lg-4 control-label" >＊パスワード確認　:　
                            </p>
                            <input name="new_password_confirm" id="newPasswordConfirm" class=" col-lg-8 form-control" type="password" maxlength="16"
                            value="{{old('new_password_confirm')}}">
                        </div>
                        @if ($errors->has('new_password_confirm'))
                            <div  class="col-lg-12 form-group " >
                                <p class="error-css" style="color: red;margin:0rem">
                                    {!! $errors->first('new_password_confirm') !!}
                                </p>
                            </div>
                        @endif
                        
                        <div class="col-lg-12 d-flex mt-4" class="form-group" >
                            @if($user['temp_password_flag']===1)
                            <div class="col-lg-8"></div>
                            <div class="col-lg-4" style="text-align: left">
                                <button type="submit" class=" btn btn-success btn-lg btn-block ">
                                    変更
                                </button>
                            </div>
                            <div class="col-lg-1"></div>
                            @else
                            <div class="col-lg-12 d-flex">
                                <div class="col-lg-5" style="text-align: left">
                                    <button type="submit" class=" btn btn-success btn-lg btn-block ">
                                        変更
                                    </button>
                                </div>
                                <div class="col-lg-1"></div>
                                <div class="col-lg-1"></div>
                                <div class="col-lg-5" style="text-align: right">
                                    <a class="btn btn-secondary btn-lg btn-block" href="javascript:history.back()"
                                        role="button">戻る</a>
                                </div>
                            </div>
                            @endif
                            
                        </div>
                    </div>
                </form>
            </div>
            <div class="col-lg-3"></div>
        </div>
            
    </div>
        
    </div>
    {{-- <div class="container-fluid bootstrap snippets bootdey"
        style="background: linear-gradient(to right,#1991FC,  #45b796);padding:0;color: #000;font-weight:500">
        
        <div style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff;padding-top:15px;">
            <h1 style="display: inline;margin-left:40%" class="text-right col-md-9">
                パスワード変更
            </h1>
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">
        
    </div> --}}
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