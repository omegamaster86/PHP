{{--*************************************************************************
* Project name: JARA
* File name: confirm.blade.php
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

    {{-- Date Picker --}}
    <link rel="stylesheet" href="https://unpkg.com/flatpickr/dist/flatpickr.min.css">

</head>

<body>
    <div class="container bootstrap snippets bootdey">
        <h1 class="text-center">ユーザー情報確認画面</h1>
        <hr>
        <div class="row">
            <!-- left column -->


            <!-- edit form column -->
            <div class="col-md-9 ">

                {{-- <div class="alert alert-info alert-dismissable">
                    <a class="panel-close close" data-dismiss="alert">×</a>
                    <i class="fa fa-coffee"></i>
                    This is an <strong>.alert</strong>. Use this to show important messages to the user.
                </div> --}}

                <form class="form-horizontal" style="display: flex" method="POST"
                    action="{{route('profile.edit.confirm')}}">
                    @csrf
                    <div class=" col-md-3">
                        <div style="margin: 0px 0px 5px 15px">写真
                        </div>
                        <div class="text-center">
                            <img class="avatar img-circle img-thumbnail"
                                src="{{ asset('images/' . (((Auth::user()->photo??"")?Auth::user()->photo:session()->get('userInfo')['photo'])||'no-image.png')) }}"
                                alt="avatar" />
                            <div style="display: none">
                                <input type="text" id="photo" name="photo"
                                    value="{{session()->get('userInfo')['photo']}}" class="form-control">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-1"></div>
                    <div class="col-md-8">
                        <x-input-error :messages="$errors->get('datachecked')" class="mt-2" />

                        <div class="form-group ">
                            <label style="margin-left:1rem;cursor:pointer" for="userName" class=" control-label">ユーザー名
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
                            <p class="col-lg-12 control-label" id="emailChange">メールアドレス :
                                {{(session()->get('userInfo')['mailAddress']??"")?session()->get('userInfo')['mailAddress']:Auth::user()->mailAddress}}
                            </p>
                            <input name="mailAddress" class="form-control" type="hidden"
                                value="{{(session()->get('userInfo')['mailAddress']??"")?session()->get('userInfo')['mailAddress']:Auth::user()->mailAddress}}">


                        </div>
                        <div class="form-group">
                            <label class="col-lg-3 control-label">性別 : @if(session()->get('userInfo')['sex']=="1")
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
                            <label class=" control-label" style="margin-left:1rem; cursor:pointer">生年月日:</label>
                            @endif
                            {{session()->get('userInfo')['dateOfBirth']}}
                            <input name="dateOfBirth" class="form-control" type="hidden"
                                value="{{session()->get('userInfo')['dateOfBirth']}}">
                        </div>
                        <div class="form-group">
                            <label class="col-lg-3 control-label">居住地 :
                                {{session()->get('userInfo')['residenceCountry']}}
                            </label>


                            <input id="residenceCountry" name="residenceCountry" class="form-control" type="hidden"
                                value="{{session()->get('userInfo')['residenceCountry']}}">
                        </div>
                        @if(session()->get('userInfo')['residenceCountry']=="日本")
                        <div class="form-group">
                            <label class="col-lg-6 control-label">都道府県 :
                                {{session()->get('userInfo')['residencePrefecture']}}
                            </label>

                            <input id="residencePrefecture" name="residencePrefecture" class="form-control"
                                type="hidden" value="{{session()->get('userInfo')['residencePrefecture']}}">
                        </div>
                        @endif
                        <div class="form-group" style="display: flex">
                            <div class="col-lg-6">
                                <label style="cursor:pointer" class=" control-label">身長
                                    :
                                </label>
                                {{session()->get('userInfo')['height']?session()->get('userInfo')['height']:0}} cm

                                <input name="height" class="form-control" type="hidden"
                                    value="{{session()->get('userInfo')['height']}}">


                            </div>
                            <div class="col-lg-6">
                                <label style="cursor:pointer" class=" control-label">体重
                                    :
                                </label>
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
                        <div class="form-group" style="display: flex; margin-top:2rem;gap: 4rem;">
                            <div class="col-lg-5" style="text-align: right">
                                <button type="submit" class=" btn btn-success btn-lg btn-block ">
                                    {{ __('更新') }}
                                </button>
                            </div>
                            <div class="col-lg-5" style="text-align: right">
                                <a class="btn btn-danger btn-lg btn-block" href="javascript:history.go(-1)"
                                    role="button">戻る</a>
                            </div>
                        </div>
                    </div>
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
    <hr>
    <script src="{{ asset('js/main.js') }}"></script>
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
</body>

</html>