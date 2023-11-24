{{--*************************************************************************
* Project name: JARA
* File name: details.blade.php
* File extension: .blade.php
* Description: This is the ui of profile edit page
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
    <title>Profile Details</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
        integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">

    <link rel="stylesheet" type="text/css" href="{{ asset('css/profile-edit.css') }}">


</head>

<body>
    <div class="container bootstrap snippets bootdey">
        @if($pageMode=="details")
        <h1 class="text-center">ユーザー情報参照
        </h1>
        @elseif($pageMode=="delete")
        <h1 class="text-center">退会
        </h1>
        @endif
        <hr>
        <div class="row">
            <!-- left column -->


            <!-- edit form column -->
            <div class="col-md-9 ">

                <form class="form-horizontal" style="display: flex" method="POST" action="{{route('profile.delete')}}">
                    @csrf
                    <div class=" col-md-3">
                        <div style="margin: 0px 0px 5px 15px">写真
                        </div>
                        <div class="text-center">
                            @if(Auth::user()->photo)
                            <img class="avatar img-circle img-thumbnail"
                                src="{{ asset('images/' . ((Auth::user()->photo??"")?Auth::user()->photo:session()->get('userInfo')['photo'])) }}"
                                alt="avatar" />
                            @else
                            <img class="avatar img-circle img-thumbnail" src="{{ asset('images/no-image.png')}}"
                                alt="avatar" />
                            @endif
                        </div>
                    </div>
                    <div class="col-md-1"></div>
                    <div class="col-md-8">
                        <x-input-error :messages="$errors->get('datachecked')" class="mt-2" />

                        <div class="form-group ">
                            <label style="margin-left:1rem;cursor:pointer" for="userName" class=" control-label">ユーザー名
                                : {{Auth::user()->userName}}
                            </label>

                        </div>
                        <div class="form-group">
                            <p class="col-lg-12 control-label" id="emailChange">メールアドレス :
                                {{Auth::user()->mailAddress}}
                            </p>


                        </div>
                        <div class="form-group">
                            <label class="col-lg-3 control-label">性別 : @if(Auth::user()->sex=="1")
                                男
                                @elseif (Auth::user()->sex=="2")
                                女
                                @else
                                @endif
                            </label>

                        </div>
                        <div class="form-group">
                            <label class=" control-label" style="margin-left:1rem; cursor:pointer">生年月日:</label>
                            {{Auth::user()->dateOfBirth}}

                        </div>
                        <div class="form-group">
                            <label class="col-lg-3 control-label">居住地 :
                                {{Auth::user()->residenceCountry}}
                            </label>



                        </div>
                        @if(Auth::user()->residenceCountry=="日本")
                        <div class="form-group">
                            <label class="col-lg-6 control-label">都道府県 :
                                {{Auth::user()->residencePrefecture }}
                            </label>


                        </div>
                        @endif
                        <div class="form-group" style="display: flex">
                            <div class="col-lg-6">
                                <label style="cursor:pointer" class=" control-label">身長
                                    :
                                </label>
                                {{Auth::user()->height}} cm




                            </div>
                            <div class="col-lg-6">
                                <label style="cursor:pointer" class=" control-label">体重
                                    :
                                </label>
                                {{Auth::user()->weight}} kg


                            </div>

                        </div>
                        <div class="form-group" style="display: flex; margin-top:2rem;gap: 4rem;">
                            @if($pageMode=="delete")
                            <div class="col-lg-5" style="text-align: right">
                                <button type="submit" class=" btn btn-success btn-lg btn-block ">
                                    {{ __('退会') }}
                                </button>
                            </div>
                            @endif
                            <div class="col-lg-5" style="text-align: right">
                                <a class="btn btn-danger btn-lg btn-block" href="/profile" role="button">
                                    @if($pageMode=="details")
                                    戻る
                                    @else
                                    キャンセル
                                    @endif
                                </a>
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
                @if($pageMode=="details")
                <p class="col-lg-9 control-label"
                    style="font-weight: bold; text-decoration:underline; color:blue;cursor: pointer">
                    <a href="profile">ユーザー情報更新</a>
                </p>
                <p id="passwordChangeButton" onclick="passwordChangeConfirm()" class="col-lg-9 control-label"
                    style="font-weight: bold; text-decoration:underline; color:blue;cursor: pointer">
                    パスワードの変更
                </p>
                @endif
                @if($pageMode=="delete")
                <p class="col-lg-9 control-label"
                    style="font-weight: bold; text-decoration:underline; color:blue;cursor: pointer">
                    <a href="profile">退会規約</a>
                </p>
                <p class="col-lg-9 control-label"
                    style="font-weight: bold; text-decoration:underline; color:blue;cursor: pointer">
                    <a href="profile">退会規約同意チェック</a>
                </p>
                @endif
            </div>
        </div>
    </div>
    <hr>
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
        integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous">
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous">
    </script>

    <script src="{{ asset('js/main.js') }}"></script>
</body>

</html>