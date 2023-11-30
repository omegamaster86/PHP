{{--*************************************************************************
* Project name: JARA
* File name: details.blade.php
* File extension: .blade.php
* Description: This is the ui of user details page
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/11/15
* Updated At: 2023/11/15
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
    <title>User Details</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
        integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">

    <link rel="stylesheet" type="text/css" href="{{ asset('css/user-edit.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/nav.css') }}">


</head>

<body>
    <div class="container-fluid bootstrap snippets bootdey" style="background: linear-gradient(to right,#1991FC,  #45b796);padding:0;color: #000;font-weight:500;min-height:100vh; width:100vw">
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
        @if($pageMode=="details")
        <h1 style="display: inline;margin-left:25%" class="text-right col-md-9" class="text-center">ユーザー情報参照
        </h1>
        @elseif($pageMode=="delete")
        <h1  style="display: inline;margin-left:30%" class="text-right col-md-9" class="text-center">退会
        </h1>
        @endif

    </div>
    <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">
        
        <div class="row">
            <div class="col-md-9 ">

                <form class="form-horizontal" style="display: flex" method="POST" action="{{route('user.delete')}}">
                    @csrf
                    <div class=" col-md-5">
                        <div class=" col-md-5" style="margin-left: 17%;">
                            <div style="margin: 0px 0px 5px 15px">写真
                            </div>
                            <div class="text-center">
                                @if(Auth::user()->photo??"")
                                <img class="avatar img-circle img-thumbnail"
                                    src="{{ asset('images/users/' . Auth::user()->photo) }}"
                                    alt="avatar" />
                                @else
                                <img class="avatar img-circle img-thumbnail" src="{{ asset('images/no-image.png')}}"
                                    alt="avatar" />
                                @endif
                            </div>
                        </div>
                    </div>
                    <div class="col-md-1"></div>
                    <div class="col-md-5" style="background-color: #005BFC;padding-top: 15px;border-radius: 10px; color: #fff;padding:3rem">
                        <x-input-error :messages="$errors->get('datachecked')" class="mt-2" />

                        <div class="form-group ">
                            <label  for="userName" class=" control-label">ユーザー名
                                : {{Auth::user()->userName}}
                            </label>

                        </div>
                        <div class="form-group">
                            <p class="control-label" id="emailChange">メールアドレス :
                                {{Auth::user()->mailAddress}}
                            </p>


                        </div>
                        <div class="form-group">
                            <label class="control-label">性別 : @if(Auth::user()->sex=="1")
                                男
                                @elseif (Auth::user()->sex=="2")
                                女
                                @else
                                @endif
                            </label>

                        </div>
                        <div class="form-group">
                            <label class=" control-label" >生年月日:</label>
                            {{Auth::user()->dateOfBirth}}

                        </div>
                        <div class="form-group">
                            <label class="control-label">居住地 :
                                {{Auth::user()->residenceCountry}}
                            </label>
                        </div>
                        @if(Auth::user()->residenceCountry=="日本")
                        <div class="form-group">
                            <label class="control-label">都道府県 :
                                {{Auth::user()->residencePrefecture }}
                            </label>
                        </div>
                        @endif
                        <div class="form-group" style="display: flex" >
                            <div class="col-lg-6" style="margin: 0rem 0rem 0rem -1rem;">
                                <label style="cursor:pointer" class=" control-label">身長
                                    :
                                </label>
                                @if(Auth::user()->height)
                                {{Auth::user()->height}} cm
                                @endif
                            </div>
                            <div class="col-lg-6">
                                <label style="cursor:pointer" class=" control-label">体重
                                    :
                                </label>
                                @if(Auth::user()->weight)
                                {{Auth::user()->weight}} kg
                                @endif

                            </div>

                        </div>
                        <div class="form-group col-lg-12" style="display: flex;  margin: 2rem 0rem 0rem -1rem;">
                            @if($pageMode=="delete")
                            <div class="col-lg-5" style="text-align: right">
                                <button type="submit" class=" btn btn-danger btn-lg btn-block ">
                                    {{ __('退会') }}
                                </button>
                            </div>
                            @endif
                            <div class="col-lg-7" style="text-align: right">
                                <a class="btn btn-success btn-lg btn-block" href="javascript:history.go(-1)" role="button">
                                    @if($pageMode=="details")
                                    戻る
                                    @else
                                    キャンセル
                                    @endif
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-1"></div>
                </form>
            </div>
            <div class="col-md-3" style="text-align: right">
                <p class="col-lg-9 control-label" style="font-weight: bold">ユーザーID :
                    {{ str_pad(Auth::user()->userId, 7, "0", STR_PAD_LEFT)}}
                </p>
                <p class="col-lg-9 control-label" style="font-weight: bold">ユーザー種別 :
                    {{str_pad(Auth::user()->userType, 8, "0", STR_PAD_LEFT)}}
                </p>
                @if($pageMode=="details")
                <p class="col-lg-9 control-label"
                    style="font-weight: bold; text-decoration:underline; color:blue;cursor: pointer">
                    <a href={{route('user.edit')}}>ユーザー情報更新</a>
                </p>
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
    <script src="{{ asset('js/nav.js') }}"></script>
    <script src="{{ asset('js/main.js') }}"></script>
</body>

</html>