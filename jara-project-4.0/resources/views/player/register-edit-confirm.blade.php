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
    @if($page_mode==="register-confirm")
    <title>Player Registration</title>
    @elseif($page_mode==="edit-confirm")
    <title>Player Edit</title>
    @endif
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
        integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">

    <link rel="stylesheet" type="text/css" href="{{ asset('css/player-register.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/nav.css') }}">

    {{-- Date Picker --}}
    <link rel="stylesheet" href="https://unpkg.com/flatpickr/dist/flatpickr.min.css">

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
            <h1 style="display: inline;margin-left:28%" class="text-right col-md-9">
                @if($page_mode==="delete")
                選手情報削除
                @else
                選手情報入力確認
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
                        <p class="text-danger"
                            style="margin: 1rem; padding:1rem;background-color:pink;border-radius:5px;font-weight:bold; ">
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
                @if($page_mode==="register-confirm")
                <form class="form-horizontal"  role="form" style="display: flex"
                    method="POST" action="{{route('player.register.confirm')}}">
                    @elseif($page_mode==="edit-confirm")
                    <form class="form-horizontal"  role="form" style="display: flex"
                        method="POST" action="{{route('player.edit.confirm')}}">
                    @elseif($page_mode==="delete")
                    <form class="form-horizontal" id="editForm" onsubmit="return validateEditForm();"  role="form" style="display: flex"
                        method="POST" action="{{route('player.delete')}}">
                        @endif
                        @csrf
                        @if($page_mode==="delete")
                        <input type="hidden" id="status" value=""/>
                        @endif
                        <div class="col-md-5 ">
                            <div class=" col-md-5" style="margin-left: 17%;">
                                <div style="margin: 0px 0px 5px 15px; text-align:center">
                                    写真

                                </div>
                                @if($player_Info['photo']??"")
                                <img id = "playerPicture" src="{{ asset('images/players/'.$player_Info['photo']) }}" class="avatar img-circle img-thumbnail" alt="avatar">
                                @else
                                    @if($player_Info->photo??"")
                                    <img id = "playerPicture" src="{{ asset('images/players/'.$player_Info->photo) }}"
                                class="avatar img-circle img-thumbnail" alt="avatar">
                                    @else
                                    <img id = "playerPicture" src="{{ asset('images/no-image.png') }}"
                                class="avatar img-circle img-thumbnail" alt="avatar">
                                    @endif
                                @endif

                            </div>
                            <input type="hidden" name="photo" value="{{$player_Info['photo']??($player_Info->photo??"")}}" style="display:none">
                        </div>
                        <div class="col-md-1"></div>

                        <div class="col-md-5 "
                            style="background-color:#005BFC;padding:2rem ; border-radius: 10px ; color:#fff">
                            @if($page_mode==="edit-confirm" or $page_mode==="delete")
                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" for="playerCode"
                                    class="col-sm-5  col-form-label">選手ID
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    @if($page_mode==="delete")
                                    {{str_pad(($player_Info->playerId??""), 8, "0", STR_PAD_LEFT)}}
                                    @else
                                    {{ str_pad(($player_Info['playerId']??""), 8, "0", STR_PAD_LEFT)}}
                                    @endif
                                </div>
                            </div>
                            @endif

                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" for="playerCode"
                                    class="col-sm-5  col-form-label">JARA選手コード
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    @if($page_mode==="delete")
                                    {{$player_Info->jara_player_id??""}}
                                    @else
                                    {{$player_Info['jara_player_id']??""}}
                                    <input name="playerCode" type="hidden"
                                        value="{{$player_Info['jara_player_id']??""}}">
                                    @endif
                                </div>

                            </div>
                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" for="playerName"
                                    class="col-sm-5  col-form-label">選手名
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    @if($page_mode==="delete")
                                    {{$player_Info->playerName??""}}
                                    @else
                                    {{$player_Info['playerName']??""}}
                                    <input name="playerName" type="hidden"
                                        value="{{$player_Info['playerName']??""}}">
                                    @endif
                                </div>
                            </div>

                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" class="col-sm-5  col-form-label">生年月日
                                </label>

                                <div class="col-sm-7 col-form-label">
                                    @if($page_mode==="delete")
                                    {{date('Y/m/d', strtotime($player_Info->date_of_birth))}}
                                    @else
                                    {{$player_Info['date_of_birth']??""}}
                                    <input name="date_of_birth" type="hidden"
                                        value="{{$player_Info['date_of_birth']??""}}">
                                    @endif
                                </div>

                            </div>

                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" for="sex"
                                    class="col-sm-5  col-form-label">性別
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    @if($page_mode==="delete")
                                    {{$player_info->sex??""}}
                                    @else
                                    @if(($player_Info['sex']??"")==="1")
                                    男
                                    @elseif(($player_Info['sex']??"")==="2")
                                    女
                                    @else
                                    ""
                                    @endif
                                    <input name="sex" type="hidden" value="{{
                                        $player_Info['sex']??""
                                        }}">
                                    @endif
                                </div>
                            </div>
                            <div class="form-group row ">
                                <label style="text-align:right" class="col-sm-5  col-form-label">身長
                                </label>

                                <div class="col-sm-7 col-form-label">
                                    @if($page_mode==="delete")
                                    {{$player_info->height??""}} cm
                                    @else
                                    {{
                                    $player_Info['height']??""
                                    }} cm
                                    <input name="height" type="hidden" value="{{
                                        $player_Info['height']??""
                                        }}">
                                    @endif
                                </div>
                            </div>
                            <div class="form-group row ">
                                <label style="text-align:right" class="col-sm-5  col-form-label">体重
                                </label>

                                <div class="col-sm-7 col-form-label">
                                    @if($page_mode === "delete")
                                    {{$player_info->weight??""}} kg
                                    @else
                                    
                                    {{
                                    $player_Info['weight']??""
                                    }} kg
                                    <input name="weight" type="hidden" value="{{
                                        $player_Info['weight']??""
                                        }}">
                                    @endif
                                </div>

                            </div>
                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" class="col-sm-5  col-form-label">サイド情報
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    
                                    @if($page_mode === "delete")
                                    {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00000001")==="00000001")? 'S　' : '' }}
                                    {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00000010")==="00000010")? 'B　' : '' }}
                                    {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00000100")==="00000100")? 'X　' : '' }}
                                    {{((str_pad(($player_info->side_info??""), 8, "0", STR_PAD_LEFT)&"00001000")==="00001000")? 'COX' : '' }}
                                    @else
                                    {{((str_pad(($player_Info['side_info']??""), 8, "0", STR_PAD_LEFT)&"00000001")==="00000001")? 'S　' : '' }}
                                    {{((str_pad(($player_Info['side_info']??""), 8, "0", STR_PAD_LEFT)&"00000010")==="00000010")? 'B　' : '' }}
                                    {{((str_pad(($player_Info['side_info']??""), 8, "0", STR_PAD_LEFT)&"00000100")==="00000100")? 'X　' : '' }}
                                    {{((str_pad(($player_Info['side_info']??""), 8, "0", STR_PAD_LEFT)&"00001000")==="00001000")? 'COX' : '' }}
                                   
                                    <input name="side_info" type="hidden" value="{{
                                        $player_Info['side_info']??""}}">
                                    @endif
                                </div>
                            </div>

                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" for="sex"
                                    class="col-sm-5  col-form-label">出身地
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    
                                    @if($page_mode === "delete")
                                    {{$player_info->birth_country??""}}
                                    @else
                                    {{
                                    $player_Info['birthCountry']??""
                                    }}
                                    
                                    @endif
                                    <input name="birth_country" id="confirmBirthCountry" type="hidden" value="{{($player_info->birth_country??"")?$player_info->birth_country :
                                        ($player_Info['birth_country']??"")
                                        }}">
                                </div>

                            </div>
                            <div class="form-group row " id="confirmBirthPrefectures" style="display: none">
                                <label style="cursor:pointer;text-align:right" class="col-sm-5  col-form-label">都道府県
                                </label>

                                <div class="col-sm-7 col-form-label">
                                    @if($page_mode === "delete")
                                    {{$player_info->birth_prefecture??""}}
                                    @else
                                    {{
                                    $player_Info['birth_prefecture']??""}}
                                    
                                    @endif
                                    <input name="birth_prefecture" type="hidden" value="{{($player_info->birth_prefecture??"")?$player_info->birth_prefecture :
                                        $player_Info['birth_prefecture']??""}}">
                                </div>

                            </div>
                            <div class="form-group row ">
                                <label style="text-align:right" for="sex" class="col-sm-5  col-form-label">居住地
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    
                                    @if($page_mode==="delete")
                                    {{$player_info->residence_country??""}}
                                    @else
                                    {{
                                    $player_Info['residence_country']??""}}
                                    @endif
                                    <input id="confirmCountry" name="residence_country" type="hidden" value="{{
                                        ($player_info->residence_country??"")?$player_info->residence_country : ($player_Info['residence_country']??"")}}">
                                </div>

                            </div>
                            <div class="form-group row " id="confirmPrefectures" style="display: none">
                                <label style="text-align:right" class="col-sm-5  col-form-label">都道府県
                                </label>
                                <div class="col-sm-7 col-form-label">
                                    @if($page_mode === "delete")
                                    {{$player_Info->residence_prefecture??""}}
                                    @else
                                    {{
                                    $player_Info['residence_prefecture']??""}}
                                    @endif
                                    <input name="residence_prefecture" type="hidden" value="{{($player_info->residence_prefecture??"")?$player_info->residence_prefecture :
                                        ($player_Info['residence_prefecture']??"")}}">
                                </div>

                            </div>

                            <div class="form-group row" style="padding: 2rem">
                                <div class="col-sm-2"></div>
                                <div class="col-sm-4">
                                    <button class="btn btn-success btn-lg btn-block">
                                        @if($page_mode==="register-confirm")
                                        登録
                                        @elseif($page_mode==="edit-confirm")
                                        変更
                                        @elseif($page_mode==="delete")
                                        削除
                                        @endif
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
                @if($page_mode==="delete")
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
                                選手情報を削除します。<br/>よろしいですか？
                            </div>
                            <div class="modal-footer">
                                <button onclick="changeStatus()" role="button" class="btn btn-success" data-dismiss="modal">OK</button>
                                <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
                @endif

                @if(($player_Info['previous_page_status']??"")==="success")
                <!-- Button trigger modal -->
                <button style="display: none" type="button" id="idCheckedMessage" class="btn btn-secondary btn-lg"
                    data-toggle="modal" data-target="#staticBackdrop">
                    ID Check Message
                </button>

                <!-- Modal -->
                <div class="modal fade" id="staticBackdrop" data-backdrop="static" data-keyboard="false" tabindex="-1"
                    aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header" >
                                <h5 style="color:#000; margin-left:37%" class="modal-title" id="staticBackdropLabel">メッセージ</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    {{-- <span aria-hidden="true">&times;</span> --}}
                                </button>
                            </div>
                            <div class="modal-body" style="color: #000; text-align:center">
                                入力したJARA選手コードと紐づくデータが存在しません。<br />このJARA選手コードで登録しますか？
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-success" data-dismiss="modal">OK</button>
                                @if($page_mode==="register-confirm")
                                <a href="../register" role="button" class="btn btn-danger">Cancel</a>
                                @elseif($page_mode==="edit-confirm")
                                <a href="../edit" role="button" class="btn btn-danger">Cancel</a>
                                @endif
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
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="https://unpkg.com/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js"></script>

    <script>
        // date Picker
        $(".lib-flatpickr3").flatpickr({
            "locale": "ja",
            dateFormat: 'Y/m/d',
            defaultDate: 'null',
        });
    </script>
    {{-- Date Picker End --}}
    <script>

        // For showing warning message

        (function (){
            document.getElementById("idCheckedMessage").click();

            if(document.getElementById("confirmBirthCountry").value === "日本"){
                document.getElementById("confirmBirthPrefectures").style.display='flex';
            }
            if(document.getElementById("confirmCountry").value === "日本"){
                document.getElementById("confirmPrefectures").style.display='flex';
            }
        })();
        
        

    </script>
       <script>
        //for page reloading when using back button is click from web page
        (function () {
        window.onpageshow = function(event) {
            if (event.persisted) {
                window.location.reload();
            }
        };
        })();
        function changeStatus()
        {
            document.getElementById("status").value="true";
            document.getElementById("editForm").submit();
        }
        function validateEditForm()
        {
            if(document.getElementById("status").value==="true")
                return true;
            else
            document.getElementById("checkeWarningMessage").click();
            return false;
        }
    </script>

    <script src="{{ asset('js/nav.js') }}"></script>
    <script src="{{ asset('js/main.js') }}"></script>
</body>

</html>