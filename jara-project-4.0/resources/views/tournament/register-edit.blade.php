{{--*************************************************************************
* Project name: JARA
* File name: profile-edit.blade.php
* File extension: .blade.php
* Description: This is the ui for the edit and update page of the organization.
*************************************************************************
* Author: t_futamura
* Created At: 2023/11/27
* Updated At: 
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
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">

    <link rel="stylesheet" type="text/css" href="{{ asset('css/tornament.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/nav.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/style.css') }}">

    {{-- Date Picker --}}
    <link rel="stylesheet" href="https://unpkg.com/flatpickr/dist/flatpickr.min.css">
</head>

<body>
    {{-- background-color: #9FD9F6; --}}
    <div class="container-fluid bootstrap snippets bootdey">
        <!--style="background: linear-gradient(to right,#1991FC,  #45b796);padding:0;color: #000;font-weight:500">-->
        <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
            @if($pagemode==="register")
                <a href="{{route('tournament.edit')}}">大会更新画面(デバッグ)</a>
                <a href="{{route('tournament.register.confirm')}}">大会確認画面(デバッグ)</a>
                <a href="{{route('tournament.delete')}}">大会削除画面(デバッグ)</a>
            @elseif($pagemode==="edit")
                <a href="{{route('tournament.register')}}">大会登録画面(デバッグ)</a>
                <a href="{{route('tournament.edit.confirm')}}">大会確認画面(デバッグ)</a>
                <a href="{{route('tournament.delete')}}">大会削除画面(デバッグ)</a>
            @endif
            <a href="#">ダッシュボード</a>
            <a href="#">情報更新</a>
            <a href="#">情報参照</a>
            <a href="#">アカウント削除</a>
        </div>
        <!--1.引数によって表示を変える-->
        <div style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff;padding-top:15px;">
            <span class="col-md-3 " style="font-size:30px;cursor:pointer" onclick="openNav()">&#9776; メニュー</span>
            @if(Session::has('fromLoginPage'))
            <h1 class="text-right col-md-8">{{ Session::get('fromLoginPage') }}</h1>
            @else
            @if($pagemode=="register")
            <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">大会登録</h1>
            @elseif($pagemode=="edit")
            <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">大会情報更新</h1>
            @endif
            @endif
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">

        <form class="form-horizontal" enctype="multipart/form-data" role="form" method="POST">
            @csrf
            <div>
                <!-- 大会ID  ※大会登録画面以外表示する-->
                @if($pagemode!="register")
                <div>
                    <label for="entrySystem" class=" control-label">大会ID :</label>
                    <label for="entrySystem" class=" control-label">00001</label>
                </div>
                @endif

                <!-- エントリーシステムの大会ID -->
                <div>
                    <div id="entrySystemInfo" style="display:none;">エントリーシステムの大会IDの情報</div>
                    <label onclick="details('entrySystemInfo')" for="entrySystem" class=" control-label">エントリーシステムの大会ID :</label>
                    <i onclick="details('entrySystemInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                    <input id="entrySystemId" name="entrySystemId" type="text" value="">
                </div>

                <!-- 大会名 -->
                <div>
                    <div id="tournamentNameInfo" style="margin-left:1rem; display:none;">大会名の情報</div>
                    <label onclick="details('tournamentNameInfo')" class=" control-label">＊大会名 :</label>
                    <i onclick="details('tournamentNameInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                    @if($pagemode==="register")
                    <input id="tName" name="tName" type="text" value="{{old('tName')}}">
                    @elseif($pagemode==="edit")
                    <input id="tName" name="tName" type="text" value="{{old('tName')}}">
                    @endif
                    <select>
                        <option value=1 selected>非公式</option>
                        <option value=2>公式</option>
                    </select>
                    <!--エラーメッセージ表示エリア -->
                    @if ($errors->has('tName'))
                    <p style="color:red;">{{ $errors->first('tName') }}</p>
                    @endif
                </div>

                <!-- 主催団体ID -->
                <div>
                    <div id="sponsoreTeamIdInfo" style="margin-left:1rem; display:none;">主催団体IDの情報</div>
                    <label onclick="details('sponsoreTeamIdInfo')" for="userName" class=" control-label">＊主催団体ID :</label>
                    <i onclick="details('sponsoreTeamIdInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                    @if($pagemode==="register")
                    <input id="tId" name="tId" type="text" value="{{old('tId')}}">
                    @elseif($pagemode==="edit")
                    <input id="tId" name="tId" type="text" value="{{old('tId')}}">
                    @endif
                    <!--エラーメッセージ表示エリア -->
                    @if ($errors->has('tId'))
                    <p style="color:red;">{{ $errors->first('tId') }}</p>
                    @endif
                </div>

                <!-- 開催開始年月日 -->
                <div>
                    <div id="startDayInfo" style="margin-left:1rem; display:none;">開催開始年月日の情報</div>
                    <label onclick="details('startDayInfo')" class=" control-label">＊開催開始年月日 :</label>
                    <i onclick="details('startDayInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                    @if($pagemode==="register")
                    <input id="tStartDay" name="tStartDay" type="text" value="{{old('tStartDay')}}">
                    @elseif($pagemode==="edit")
                    <input id="tStartDay" name="tStartDay" type="text" value="{{old('tStartDay')}}">
                    @endif
                    <!--エラーメッセージ表示エリア -->
                    @if ($errors->has('tStartDay'))
                    <p style="color:red;">{{ $errors->first('tStartDay') }}</p>
                    @endif
                </div>
                <!-- 開催修了年月日 -->
                <div>
                    <div id="endDayInfo" style="margin-left:1rem; display:none;">開催修了年月日の情報</div>
                    <label onclick="details('endDayInfo')" class=" control-label">＊開催修了年月日 : </label>
                    <i onclick="details('endDayInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                    @if($pagemode==="register")
                    <input id="tEndDay" name="tEndDay" type="text" value="{{old('tEndDay')}}">
                    @elseif($pagemode==="edit")
                    <input id="tEndDay" name="tEndDay" type="text" value="{{old('tEndDay')}}">
                    @endif
                    <!--エラーメッセージ表示エリア -->
                    @if ($errors->has('tEndDay'))
                    <p style="color:red;">{{ $errors->first('tEndDay') }}</p>
                    @endif
                </div>

                <!-- 開催場所 -->
                <div>
                    <div id="venueInfo" style="margin-left:1rem; display:none;">開催場所の情報</div>
                    <label class="control-label">＊開催場所 :</label>
                    <i onclick="details('venueInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                    <select id="tVenueSelect" name="tVenueSelect" onchange="venueTxtVisibilityChange()">
                        <option value="" selected>--</option>
                        <option value="jp">日本</option>
                        <option value="other">その他</option>
                    </select>
                    <input id="venueTxt" name="venueTxt" type="text" value="" style="display:none;">
                    <!--エラーメッセージ表示エリア -->
                    @if ($errors->has('tVenueSelect'))
                    <p style="color:red;">{{ $errors->first('tVenueSelect') }}</p>
                    @endif
                </div>

                <!-- 大会個別URL -->
                <div>
                    <div id="tournamentUrlInfo" style="margin-left:1rem; display:none;">大会個別URLの情報</div>
                    <label onclick="details('tournamentUrlInfo')" class=" control-label">大会個別URL :</label>
                    <i onclick="details('tournamentUrlInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                    <input id="tournamentUrl" name="tournamentUrl" type="text" value="">
                </div>

                <!-- 大会要項PDFファイル -->
                <div>
                    <div id="tournamentPdfInfo" style="margin-left:1rem; display:none;">大会要項PDFファイルの情報</div>
                    <label onclick="details('tournamentPdfInfo')" for="tournamentPdf" class=" control-label">大会要項PDFファイル :</label>
                    <i onclick="details('tournamentPdfInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                    <input id="tournamentPdf" name="tournamentPdf" type="text" value="">
                    <input type="button" value="参照">
                </div>


                <!-- 確認・戻るボタン -->
                <div class="col-md-8 offset-md-1">
                    <div class="form-group row" style="padding: 2rem">
                        <div class="col-sm-2 offset-sm-4">
                            <button class="btn btn-success btn-lg btn-block">確認</button>
                        </div>
                        <div class="col-sm-2">
                            <a class="btn btn-danger btn-lg btn-block" href="javascript:history.back()" role="button">戻る</a>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous">
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous">
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
    <script src="{{ asset('js/tournament.js') }}"></script>
</body>

</html>