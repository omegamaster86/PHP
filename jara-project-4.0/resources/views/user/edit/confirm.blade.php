{{--*************************************************************************
* Project name: JARA
* File name: confirm.blade.php
* File extension: .blade.php
* Description: This is the ui of user edit confirm page
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
    <title>User Edit Confirm</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
        integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/nav.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/style.css') }}">
    {{-- Date Picker --}}
    <link rel="stylesheet" href="https://unpkg.com/flatpickr/dist/flatpickr.min.css">

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
            <h1 style="display: inline;margin-left:29.5%" class="text-right col-md-9">
                ユーザー情報確認画面
            </h1>
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">

        <div class="row">
            <div class="col-md-9 ">

                <form class="form-horizontal" style="display: flex" method="POST"
                    action="{{route('user.edit.confirm')}}">
                    @csrf
                    <div class=" col-md-5">
                        <div class=" col-md-5" style="margin-left: 17%;">
                            <div style="margin: 0px 0px 5px 15px">写真
                            </div>
                            <div class="text-center">
                                @if(session()->get('userInfo')['photo']??"")
                                <img class="avatar img-circle img-thumbnail"
                                    src="{{ asset('images/users/' .session()->get('userInfo')['photo']) }}"
                                    alt="avatar" />
                                @else
                                    @if(Auth::user()->photo??"")
                                    <img class="avatar img-circle img-thumbnail"
                                    src="{{ asset('images/users/' . Auth::user()->photo) }}"
                                    alt="avatar" />
                                    @else
                                    <img class="avatar img-circle img-thumbnail"
                                    src="{{ asset('images/no-image.png') }}"
                                    alt="avatar" />
                                    @endif
                                @endif
                                <div style="display: none">
                                    <input type="text" id="photo" name="photo"
                                        value="{{session()->get('userInfo')['photo']}}" class="form-control">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-1"></div>
                    <div class="col-md-5" style="background-color: #005BFC;padding-top: 15px;border-radius: 10px; color: #fff;padding:3rem">
                        <x-input-error :messages="$errors->get('datachecked')" class="mt-2" />

                        <div class="form-group ">
                            <label  class=" control-label">ユーザー名
                                : {{ session()->get('userInfo')['userName']}}
                            </label>
                            <input name="userName" class="form-control" type="hidden"
                                value="{{ session()->get('userInfo')['userName']}}">
                        </div>
                        <div style="display:none">
                            <input type="text" id="mailAddressStatus" name="mailAddressStatus"
                                value="{{session()->get('userInfo')['mailAddressStatus']}}" />
                        </div>
                        <div class="form-group">
                            <p class="control-label" id="emailChange">メールアドレス :
                                {{(session()->get('userInfo')['mailAddress']??"")?session()->get('userInfo')['mailAddress']:Auth::user()->mailAddress}}
                            </p>
                            <input name="mailAddress" class="form-control" type="hidden"
                                value="{{(session()->get('userInfo')['mailAddress']??"")?session()->get('userInfo')['mailAddress']:Auth::user()->mailAddress}}">


                        </div>
                        <div class="form-group">
                            <label class="control-label">性別 : @if(session()->get('userInfo')['sex']=="1")
                                男
                                @elseif (session()->get('userInfo')['sex']=="2")
                                女
                                @else
                                @endif
                            </label>

                            <input name="sex" class="form-control" type="hidden"
                                value="{{session()->get('userInfo')['sex']}}">
                        </div>
                        <div class="form-group">
                            @if(session()->get('userInfo')['dateOfBirth']!="")
                            <label class="control-label" >生年月日:</label>
                            @endif
                            {{session()->get('userInfo')['dateOfBirth']}}
                            <input name="dateOfBirth" class="form-control" type="hidden"
                                value="{{session()->get('userInfo')['dateOfBirth']}}">
                        </div>
                        <div class="form-group">
                            <label class="control-label">居住地 :
                                {{session()->get('userInfo')['residenceCountry']}}
                            </label>


                            <input id="residenceCountry" name="residenceCountry" class="form-control" type="hidden"
                                value="{{session()->get('userInfo')['residenceCountry']}}">
                        </div>
                        @if(session()->get('userInfo')['residenceCountry']=="日本")
                        <div class="form-group">
                            <label class="control-label">都道府県 :
                                {{session()->get('userInfo')['residencePrefecture']}}
                            </label>

                            <input id="residencePrefecture" name="residencePrefecture" class="form-control"
                                type="hidden" value="{{session()->get('userInfo')['residencePrefecture']}}">
                        </div>
                        @endif
                        <div class="form-group" style="display: flex">
                            <div class="col-lg-6" style="margin: 0rem 0rem 0rem -1rem;">
                                <label class=" control-label">身長 :
                                </label>
                                {{session()->get('userInfo')['height']?session()->get('userInfo')['height']:0}} cm

                                <input name="height" class="form-control" type="hidden"
                                    value="{{session()->get('userInfo')['height']}}">

                            </div>
                            <div class="col-lg-6">
                                <label class=" control-label">体重 :</label>
                                {{session()->get('userInfo')['weight']?session()->get('userInfo')['weight']:0}} kg

                                <input name="weight" class="form-control" type="hidden"
                                    value="{{session()->get('userInfo')['weight']}}">
                            </div>

                        </div>
                        @if(session()->get('userInfo')['mailAddressStatus'])
                        <div class="form-group alert alert-success" role="alert">
                            メールアドレスが変更されている為、表示されている<br />
                            メールアドレス宛に6桁の認証番号が送られます。<br />
                            メール本文に記載されている認証番号を入力してください。<br />
                            ※認証番号の有効期限は30分間です。
                        </div>
                        @endif
                        <div class="form-group" style="display: flex; gap: 4rem; margin: 2rem 0rem 0rem -1rem;">
                            <div class="col-lg-5" style="text-align: left">
                                <button type="submit" class=" btn btn-success btn-lg btn-block ">
                                    {{ __('更新') }}
                                </button>
                            </div>
                            <div class="col-lg-5" style="text-align: right">
                                <a class="btn btn-danger btn-lg btn-block" href="javascript:history.back()"
                                    role="button">戻る</a>
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
        });
    </script>
    {{-- Date Picker End --}}
    {{-- <script>
        // Get the modal
        var modal = document.getElementById('id01');
        
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
          if (event.target == modal) {
            modal.style.display = "none";
          }
        }
    </script> --}}
    <script src="{{ asset('js/main.js') }}"></script>
    <script src="{{ asset('js/nav.js') }}"></script>
</body>

</html>