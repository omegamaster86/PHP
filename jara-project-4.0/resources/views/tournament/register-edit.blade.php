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
    <!-- <style>
        table, th, td {
        border: 1px #000000 solid;
        }
    </style> -->
</head>

<body>
    {{-- background-color: #9FD9F6; --}}
    <div class="container-fluid bootstrap snippets bootdey"
        style="padding:0;color: #000;font-weight:500">
        <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
            @if($pageMode==="register")
                <a href="{{route('tournament.edit')}}">大会更新画面(デバッグ)</a>
                <a href="{{route('tournament.confirm')}}">大会確認画面(デバッグ)</a>
                <a href="{{route('tournament.delete')}}">大会削除画面(デバッグ)</a>
            @elseif($pageMode==="edit")
                <a href="{{route('tournament.register')}}">大会登録画面(デバッグ)</a>
                <a href="{{route('tournament.confirm')}}">大会確認画面(デバッグ)</a>
                <a href="{{route('tournament.delete')}}">大会削除画面(デバッグ)</a>
            @elseif($pageMode==="confirm")
                <a href="{{route('tournament.register')}}">大会登録画面(デバッグ)</a>
                <a href="{{route('tournament.edit')}}">大会更新画面(デバッグ)</a>
                <a href="{{route('tournament.delete')}}">大会削除画面(デバッグ)</a>
            @elseif($pageMode==="delete")
                <a href="{{route('tournament.register')}}">大会登録画面(デバッグ)</a>
                <a href="{{route('tournament.edit')}}">大会更新画面(デバッグ)</a>
                <a href="{{route('tournament.confirm')}}">大会確認画面(デバッグ)</a>
            @endif
            
            <a href="#">マイページ</a>
        </div>

        <!-- 画面名 -->
        <div style=" padding-top:15px;">
            <span class="col-md-3 " style="font-size:30px;cursor:pointer" onclick="openNav()">&#9776; メニュー</span>
            <h1 style="display: inline;margin-left:29.5%" class="text-right col-md-9">
                @if($pageMode==="register")
                大会登録
                @elseif($pageMode==="edit")
                大会情報更新
                @elseif($pageMode==="confirm")
                大会情報確認
                @elseif($pageMode==="delete")
                大会情報削除
                @elseif($pageMode==="reference")
                大会情報参照
                @endif
            </h1>
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">

        <div class="row" style="padding:30px 0px;width: 100%;">
            <div class="col-md-9 ">

                {{-- <div class="alert alert-info alert-dismissable">
                    <a class="panel-close close" data-dismiss="alert">×</a>
                    <i class="fa fa-coffee"></i>
                    This is an <strong>.alert</strong>. Use this to show important messages to the user.
                </div> --}}

                <!-- <form class="form-horizontal" enctype="multipart/form-data" role="form" style="display: flex" method="POST" action="{{route('tournament.register')}}"> -->
                @if($pageMode==="register")
                <form class="form-horizontal" enctype="multipart/form-data" role="form" style="display: flex" method="POST" action="{{route('tournament.register')}}">
                @elseif($pageMode==="edit")
                <form class="form-horizontal" enctype="multipart/form-data" role="form" style="display: flex" method="POST" action="{{route('tournament.edit')}}">
                @elseif($pageMode==="confirm")
                <form class="form-horizontal" enctype="multipart/form-data" role="form" style="display: flex" method="POST" action="{{route('tournament.confirm')}}">
                @elseif($pageMode==="delete")
                <form class="form-horizontal" enctype="multipart/form-data" role="form" style="display: flex" method="POST" action="{{route('tournament.register')}}">
                @endif
                    @csrf

                    <div class="col-md-5"></div>
                    <div class="col-md-1"></div>

                    <div class="col-md-5 " style="padding-top:15px; border-radius: 10px ; ">
                        @if(Session::has('status'))
                        <div class="alert alert-success" role="alert">
                            <a class="panel-close close" data-dismiss="alert" style="cursor: pointer">×</a>
                            {!! Session::get('status') !!}
                        </div>
                        @endif
                        <div style="margin-right: 0.75rem;display:none;">
                            <div class=" alert alert-info alert-dismissable text-success" style="font-weight: bold; margin-left:1rem">
                                <a class="panel-close close" data-dismiss="alert" style="cursor: pointer">×</a>
                                {!! Session::get('message')!!}
                            </div>
                        </div>
                        <x-input-error :messages="$errors->get('datachecked')" class="mt-2" />
                        
                        <!-- 大会ID  ※大会登録画面以外表示する-->
                        @if($pageMode!="register")
                        <div class="form-group ">
                            <label for="entrySystem" class=" control-label">大会ID :</label>
                            <label for="entrySystem" class=" control-label">00001</label>
                        </div>
                        @endif

                        <!-- エントリーシステムの大会ID -->
                        <div class="form-group ">
                        <div id="entrySystemInfo" style="display:none;">エントリーシステムの大会IDの情報</div>
                            <label onclick="details('entrySystemInfo')" for="entrySystem" class=" control-label">エントリーシステムの大会ID :</label>
                            @if($pageMode=="register" || $pageMode=="edit")
                            <i onclick="details('entrySystemInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                            <input id="entrySystemId" name="entrySystemId" type="text" value="">
                            @elseif($pageMode=="confirm" || $pageMode=="delete")
                            <label class=" control-label">XXXXXXXXXXXXXXX</label>
                            @endif
                            
                        </div>
                        
                        <!-- 大会名 -->
                        <div class="form-group ">
                            <div id="tournamentNameInfo" style="margin-left:1rem; display:none;">大会名の情報</div>    
                            @if($pageMode=="register" || $pageMode=="edit")
                            <label onclick="details('tournamentNameInfo')" class=" control-label">＊大会名 :</label>
                            <i onclick="details('tournamentNameInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                            <input id="tournamentName" name="tournamentName" type="text" value="">
                            <select>
                            <option value=1 selected>非公式</option>
                            <option value=2>公式</option>
                            </select>
                            @elseif($pageMode=="confirm" || $pageMode=="delete")
                                <label onclick="details('tournamentNameInfo')" class=" control-label">大会名 :</label>
                                @if($pageMode==="delete")
                                    {{$tournamentInfo->tournamentName??""}}
                                @else
                                    {{session()->get('tournamentInfo')['tournamentName']??""}}
                                    <input name="tournamentName" type="hidden" value="{{session()->get('tournamentInfo')['tournamentName']??""}}">
                                @endif
                            @endif
                            @if ($errors->has('tournamentName'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('tournamentName') }}</p>
                            @endif
                        </div>

                        <!-- 主催団体ID -->
                        <div class="form-group ">
                        <div id="sponsoreTeamIdInfo" style="margin-left:1rem; display:none;">主催団体IDの情報</div>
                            @if($pageMode=="register" || $pageMode=="edit")
                            <label onclick="details('sponsoreTeamIdInfo')" for="userName" class=" control-label">＊主催団体ID :</label>
                            <i onclick="details('sponsoreTeamIdInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                            <input id="sponsoreTeamId" name="sponsoreTeamId" type="text" value="">
                            @elseif($pageMode=="confirm" || $pageMode=="delete")
                            <label onclick="details('sponsoreTeamIdInfo')" for="userName" class=" control-label">主催団体ID :</label>
                                @if($pageMode==="delete")
                                    {{$tournamentInfo->sponsoreTeamId??""}}
                                @else
                                    {{session()->get('tournamentInfo')['sponsoreTeamId']??""}}
                                    <input name="sponsoreTeamId" type="hidden" value="{{session()->get('tournamentInfo')['sponsoreTeamId']??""}}">
                                @endif
                            @endif
                            @if ($errors->has('sponsoreTeamId'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('sponsoreTeamId') }}</p>
                            @endif
                        </div>


                        <!-- 開催開始年月日 -->
                        <div class="form-group">
                        <div id="startDayInfo" style="margin-left:1rem; display:none;">開催開始年月日の情報</div>
                            @if($pageMode=="register" || $pageMode=="edit")
                            <label onclick="details('startDayInfo')" class=" control-label">＊開催開始年月日 :</label>
                            <i onclick="details('startDayInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                                {{-- {{ old('startDay', date('Y/m/d')) }} --}}
                                {{-- {{request()->has('startDay')?old('startDay',
                                date('Y/m/d')):Auth::user()->startDay}} --}}
                                <input id="startDay" name="startDay" type="text" class="lib-flatpickr3" value="{{old('startDay')?old('startDay'):Auth::user()->startDay}}">
                            @elseif($pageMode=="confirm" || $pageMode=="delete")
                            <label onclick="details('startDayInfo')" class=" control-label">開催開始年月日 :</label>
                                @if($pageMode==="delete")
                                    {{$tournamentInfo->startDay??""}}
                                @else
                                    {{session()->get('tournamentInfo')['startDay']??""}}
                                    <input name="startDay" type="hidden" value="{{session()->get('tournamentInfo')['startDay']??""}}">
                                @endif
                            @endif
                            @if ($errors->has('startDay'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('startDay') }}</p>
                            @endif
                        </div>
                        <!-- 開催修了年月日 -->
                        <div class="form-group">
                        <div id="endDayInfo" style="margin-left:1rem; display:none;">開催修了年月日の情報</div>
                            @if($pageMode=="register" || $pageMode=="edit")
                            <label onclick="details('endDayInfo')" class=" control-label" >＊開催修了年月日 : </label>
                            <i onclick="details('endDayInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                                {{-- {{ old('endDay', date('Y/m/d')) }} --}}
                                {{-- {{request()->has('endDay')?old('endDay',
                                date('Y/m/d')):Auth::user()->endDay}} --}}
                                <input id="endDay" name="endDay" type="text" class="lib-flatpickr3" value="{{old('endDay')?old('endDay'):Auth::user()->endDay}}">
                            @elseif($pageMode=="confirm" || $pageMode=="delete")
                            <label onclick="details('endDayInfo')" class=" control-label" >開催修了年月日 : </label>
                                @if($pageMode==="delete")
                                    {{$tournamentInfo->endDay??""}}
                                @else
                                    {{session()->get('tournamentInfo')['endDay']??""}}
                                    <input name="endDay" type="hidden" value="{{session()->get('tournamentInfo')['endDay']??""}}">
                                @endif
                            @endif
                            @if ($errors->has('endDay'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('endDay') }}</p>
                            @endif
                        </div>

                        <!-- 開催場所 -->
                        <div class="form-group">
                        <div id="venueInfo" style="margin-left:1rem; display:none;">開催場所の情報</div>  
                            @if($pageMode=="register" || $pageMode=="edit")
                            <label class="control-label">＊開催場所 :</label>
                            <i onclick="details('venueInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                            <select id="venueSelect" name="venueSelect" onchange="venueTxtVisibilityChange()">
                                <option value="" selected></option>
                                <option value="jp">日本</option>
                                <option value="other">その他</option>
                            </select>
                            <input id="venueTxt" name="venueTxt" type="text" value="" style="display:none;">
                            @elseif($pageMode=="confirm" || $pageMode=="delete")
                            <label class="control-label">開催場所 :</label>
                                @if($pageMode==="delete")
                                    {{$tournamentInfo->venueSelect??""}}
                                @else
                                    {{session()->get('tournamentInfo')['venueSelect']??""}}
                                    <input name="venueSelect" type="hidden" value="{{session()->get('tournamentInfo')['venueSelect']??""}}">
                                    {{session()->get('tournamentInfo')['venueTxt']??""}}
                                    <input name="venueTxt" type="hidden" value="{{session()->get('tournamentInfo')['venueTxt']??""}}">
                                @endif
                            @endif
                            @if ($errors->has('venueSelect'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('venueSelect') }}</p>
                            @endif
                            @if ($errors->has('venueTxt'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('venueTxt') }}</p>
                            @endif
                        </div>

                        <!-- 大会個別URL -->
                        <div class="form-group ">
                        <div id="tournamentUrlInfo" style="margin-left:1rem; display:none;">大会個別URLの情報</div>    
                        <label onclick="details('tournamentUrlInfo')" class=" control-label">大会個別URL :</label>
                        @if($pageMode=="register" || $pageMode=="edit")
                        <i onclick="details('tournamentUrlInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                        <input id="userName" name="userName" type="text" value="">
                        @elseif($pageMode=="confirm" || $pageMode=="delete")
                        <label class=" control-label">XXXXXXXXXXXXXXX</label>
                        @endif
                        </div>

                         <!-- 大会要項PDFファイル -->
                        <div class="form-group ">
                            <div id="tournamentPdfInfo" style="margin-left:1rem; display:none;">大会要項PDFファイルの情報</div>
                            <label onclick="details('tournamentPdfInfo')" for="tournamentPdf" class=" control-label">大会要項PDFファイル :</label>
                            @if($pageMode=="register" || $pageMode=="edit")
                            <i onclick="details('tournamentPdfInfo')" style="cursor:pointer" class=" fa fa-question-circle" aria-hidden="true"></i>
                            <input id="tournamentPdf" name="tournamentPdf" type="text" value="">
                            <input type="button" value="参照">
                            @elseif($pageMode=="confirm" || $pageMode=="delete")
                            <a class=" control-label" href="#">XXXXXXXXXXXXXXX</a>
                            <input type="button" value="大会要項ダウンロード">
                            @endif
                        </div>
                      
                        <!-- レース登録リスト -->
                        @if($pageMode==="register")
                        <table border="1" id="tbl">
                        <tr>
                        <td colspan="8">レース登録
                        <input type="button" value="追加" onclick="appendRow()">
                        </td>
                        </tr>
                        <tr>
                        <td nowrap>操作</td><td nowrap>エントリーシステムのレースID</td><td nowrap>＊レースNo.</td><td nowrap>＊種目</td>
                        <td nowrap>＊レース名</td><td nowrap>＊組別</td><td nowrap>＊距離</td><td nowrap>＊発艇日時</td>
                        </tr>
                        </table>
                            <!-- レース登録リストのエラーメッセージ -->
                            @if ($errors->has('race_number'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('race_number') }}</p>
                            @endif
                            @if ($errors->has('races_event'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('races_event') }}</p>
                            @endif
                            @if ($errors->has('races_name'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('races_name') }}</p>
                            @endif
                            @if ($errors->has('races_group'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('races_group') }}</p>
                            @endif
                            @if ($errors->has('races_distance'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('races_distance') }}</p>
                            @endif
                            @if ($errors->has('races_dayTime'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('races_dayTime') }}</p>
                            @endif
                        @elseif($pageMode==="edit")
                        <table border="1" id="tb2">
                        <tr>
                        <td colspan="9">
                        <input type="button" value="全選択" onclick="allChecked()">
                        <input type="button" value="全選択解除" onclick="allUnChecked()">
                        レース登録
                        <input type="button" value="追加" onclick="appendRow2()">
                        </td>
                        </tr>
                        <tr>
                        <td nowrap>削除</td><td nowrap>レースID</td><td nowrap>エントリーシステムのレースID</td><td nowrap>＊レースNo.</td>
                        <td nowrap>＊種目</td><td nowrap>＊レース名</td><td nowrap>＊組別</td><td nowrap>＊距離</td><td nowrap>＊発艇日時</td>
                        </tr>
                        </table>
                            <!-- レース登録リストのエラーメッセージ -->
                            @if ($errors->has('race_number'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('race_number') }}</p>
                            @endif
                            @if ($errors->has('races_event'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('races_event') }}</p>
                            @endif
                            @if ($errors->has('races_name'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('races_name') }}</p>
                            @endif
                            @if ($errors->has('races_group'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('races_group') }}</p>
                            @endif
                            @if ($errors->has('races_distance'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('races_distance') }}</p>
                            @endif
                            @if ($errors->has('races_dayTime'))
                            <p style="margin: 1rem; font-weight:bold; color:red;">{{ $errors->first('races_dayTime') }}</p>
                            @endif
                        @elseif($pageMode==="confirm")
                        <table border="1" id="tb3">
                        <tr>
                        <td colspan="2">開催レース</td>
                        </tr>
                        <tr>
                        <td nowrap>男子種目</td><td nowrap>女子種目</td>
                        </tr>
                        </table>
                        @elseif($pageMode==="delete")
                        <table border="1" id="tb4">
                        <tr>
                        <td colspan="6">開催レース</td>
                        </tr>
                        <tr>
                        <td nowrap>レースID</td><td nowrap>種目</td><td nowrap>レース名</td><td nowrap>組別</td><td nowrap>距離</td><td nowrap>発艇日時</td>
                        </tr>
                        </table>
                        @endif


                        <!-- 確認・戻るボタン -->
                        <div class="form-group row" style="padding: 2rem">
                                <div class="col-sm-2"></div>
                                <div class="col-sm-4">
                                    @if($pageMode=="register" || $pageMode=="edit")
                                    <button class="btn btn-success btn-lg btn-block">確認</button>
                                    @elseif($pageMode=="confirm")
                                    <button class="btn btn-success btn-lg btn-block">登録</button>
                                    @elseif($pageMode=="delete")
                                    <button class="btn btn-success btn-lg btn-block">削除</button>
                                    @endif
                                </div>
                                <div class="col-sm-2"></div>
                                <div class="col-sm-4">
                                    <a class="btn btn-danger btn-lg btn-block" href="../../dashboard" role="button">戻る</a>
                                </div>
                            </div>
                    </div>

                    <div class="col-md-1"></div>

                </form>
            </div>
            <div class="col-md-3" style="text-align: right">
            @if($pageMode=="confirm")
            <button class="btn btn-success btn-lg btn-block">大会情報削除</button>
            <button class="btn btn-success btn-lg btn-block">大会情報更新</button>
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
    <script src="{{ asset('js/tournament.js') }}"></script>
</body>

</html>