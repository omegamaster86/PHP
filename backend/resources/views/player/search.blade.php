{{--*************************************************************************
* Project name: JARA
* File name: search.blade.php
* File extension: .blade.php
* Description: This is the ui of player register page
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/12/20
* Updated At: 2023/12/20
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
    <title>Player Search</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/nav.css') }}">

    {{-- Date Picker --}}
    <link rel="stylesheet" href="https://unpkg.com/flatpickr/dist/flatpickr.min.css">
    <style>
        .container {
            padding: 2rem 0rem;
        }

        h4 {
            margin: 2rem 0rem 1rem;
        }

        .table-image {
            td, th {
                vertical-align: middle;
            }
        }
        .table{
            background-color: #f1f1f1;
            margin: 0rem
            
        }
        .table thead th,td{ text-align: center; vertical-align: middle;}
        .table-striped>tbody>tr:nth-of-type(odd) {
            background-color: #f9f9f9;
        }
        .do-scroll{
            width: 100%
            height: 650px; 
            overflow-y: auto;    /* Trigger vertical scroll    */
        }
        .filterDiv{
            display: none;
        }
        .show {
            display: table-row;
        }
    </style>
</head>

<body>
    <div class="container-fluid bootstrap snippets bootdey" style="background: linear-gradient(to right,#1991FC,  #45b796);padding:0;color: #000;font-weight:500;min-height:100vh; width:100vw">
        <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">
                &times;
            </a>
            <a href={{route('my-page')}}>マイページ</a>
            <a href={{route('user.edit')}}>情報更新</a>
            <a href={{route('user.details')}}>情報参照</a>
            <a href={{route('user.delete')}}>退会</a>
            <a href={{route('user.password-change')}}>パスワード変更</a>
            <a href={{route('player.register')}}>選手情報登録</a>
            <a href={{route('player.edit')}}>選手情報更新</a>
            <a href={{route('player.details',["user_id"=>Auth::user()->user_id])}}>選手情報参照</a>
            <a href={{route('player.delete')}}>選手情報削除</a>
            <a href={{route('organization.management')}}>団体管理</a>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <a href="route('logout')" onclick="event.preventDefault(); this.closest('form').submit();">
                    ログアウト
                </a>
            </form>
        </div>
        <div style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff;padding-top:15px;">
            <span class="col-md-3" style="font-size:30px; cursor:pointer" onclick="openNav()">
                &#9776; メニュー
            </span>
            <h1 style="display: inline;margin-left:28%" class="text-right col-md-9">
                選手検索
            </h1>
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">
        <div class="row">
            <div class="col-md-10 ">
                <div class="row">
                    <div class="col-md-5"></div>
                    <div class="col-md-5">
                        @if ($errors->has('system_error'))
                        <p class="text-danger" style="margin: 1rem; padding:1rem;background-color:pink; border-radius:5px; font-weight:bold; ">
                            {{$errors->first('system_error') }}
                        </p>
                        @endif
                    </div>
                    <div class="col-md-1"></div>
                </div>
            </div>

        </div>
        <div class="row"
            style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff; padding:30px 0px; width: 100%; ">
            <div class="col-md-3"></div>
            <div class="col-md-6 ">
                    <form class="d-flex" action="{{route('player.search')}}" method="POST">
                        @csrf
                        <div class="col-md-12" style="background-color:#005BFC;padding:2rem ; border-radius: 10px ; color:#fff">
                            
                            <div class="form-group row ">
                                <label onclick="details('playerCodeInfo')" style="cursor:pointer;text-align:right" for="playerCode" class="col-sm-5  col-form-label">JARA選手コード　
                                    <span><i class="fa fa-question-circle" aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7">
                                    <input id="playerCode" class="form-control rounded  col-form-label" name="jara_player_id" maxlength="12" type="text" value="{{($searched_data->jara_player_id)??""}}">
                                </div>
    
                                <div id="playerCodeInfo" style="margin-left:2rem; display:none">あああああああああああああああああああ</div>
    
                            </div>
                            <div class="form-group row ">
                                <label onclick="details('playerIdInfo')" style="cursor:pointer;text-align:right"
                                    for="playerCode" class="col-sm-5  col-form-label">選手ID　
                                    <span><i class="fa fa-question-circle" aria-hidden="true"></i></span>
                                </label>
                                
                                <div class="col-sm-7">
                                
                                <input id="playerCode" class="form-control rounded  col-form-label" name="player_id" maxlength="12" type="text" value="{{($searched_data->player_id)??""}}">
                                </div>
                                
                                <div id="playerIdInfo" style="margin-left:6rem; display:none">あああああああああああ</div>
                            </div>
    
                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" for="playerName" class="col-sm-5  col-form-label">選手名　
                                </label>
                                <div class="col-sm-7">
                                    <input id="playerName" maxlength="50" class="form-control rounded col-form-label"
                                    name="player_name" type="text" value="{{($searched_data->player_name)??""}}">
                                </div>
    
                            </div>
    
                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" for="sex"
                                    class="col-sm-5  col-form-label">性別　
                                </label>
                                <div class="col-sm-7">
                                    
                                    <select id="sex" name="sex" class="form-control rounded">
                                        <option value="" >--</option>
                                        @foreach($sex_list as $sex)
                                        <option value= {{$sex->sex_id}} {{ ((($searched_data->sex)??"")==$sex->sex_id) ? "selected" : ""}} >{{$sex->sex}}</option>
                                        @endforeach
                                        
                                    </select>
                                </div>
    
                            </div>
                            
                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right"
                                    class="col-sm-5  col-form-label">生年月日　
                                </label>
                                <div class="col-sm-7 d-flex">
                                    <div class="col-sm-5" style="padding-left: 0px">
                                        <input id="dateOfBirth" name="date_of_birth_start" type="text"
                                        style="color: #000;background-color: #fff;"
                                        class="flatpickr form-control rounded  col-form-label"
                                        value="{{($searched_data->date_of_birth_start)??"年/月/日"}}" readonly="readonly">
                                    </div>
                                    <div class="col-sm-2">～</div>
                                    <div class="col-sm-5" style="padding-right: 0px">
                                        <input id="dateOfBirth" name="date_of_birth_end" type="text"
                                        style="color: #000;background-color: #fff;"
                                        class="flatpickr form-control rounded  col-form-label"
                                        value="{{($searched_data->date_of_birth_end)??"年/月/日"}}" readonly="readonly">
                                    </div>
                                </div>
    
                            </div>
    
                            
                            <div class="form-group row ">
                                <label onclick="details('sideInfo')" style="cursor:pointer;text-align:right"
                                    class="col-sm-5  col-form-label">サイド情報　<span><i class="fa fa-question-circle"
                                            aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7 row">
                                    <div class="col-sm-12">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="side_info[]"
                                                value="00000001" {{((str_pad(($searched_data->side_info??""), 8, "0", STR_PAD_LEFT)&"00000001")==="00000001")? 'checked' : '' }} id="checkS">
                                            <label class="form-check-label" for="checkS">
                                                : S（ストロークサイド）
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="side_info[]"
                                                value="00000010" {{((str_pad(($searched_data->side_info??""), 8, "0", STR_PAD_LEFT)&"00000010")==="00000010")? 'checked' : '' }}  id="checkbox">
                                            <label class="form-check-label" for="checkB">
                                                : B（バウサイド）
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="side_info[]"
                                                value="00000100" {{((str_pad(($searched_data->side_info??""), 8, "0", STR_PAD_LEFT)&"00000100")==="00000100")? 'checked' : '' }} id="checkX">
                                            <label class="form-check-label" for="checkX">
                                                : X（スカル）
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="side_info[]"
                                                value="00001000" {{((str_pad(($searched_data->side_info??""), 8, "0", STR_PAD_LEFT)&"00001000")==="00001000")? 'checked' : '' }}  id="checkCOX">
                                            <label class="form-check-label" for="checkCOX">
                                                : C（コックス）
                                            </label>
                                        </div>
                                    
                                    </div>
    
                                </div>
    
                                <div id="sideInfo" style="margin-left:4rem; display:none">あああああああああああああああああああ</div>
    
                            </div>
                            @if(((Auth::user()->user_type&"01000000")==="01000000") or ((Auth::user()->user_type&"00010000")==="00010000") or ((Auth::user()->user_type&"00001000")==="00001000"))
                            <div class="form-group row ">
                                <label onclick="details('entrySystemOrgInfo')" style="cursor:pointer;text-align:right"
                                        class="col-sm-5  col-form-label">エントリーシステムの団体ID　<span><i
                                            class="fa fa-question-circle" aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7">
                                    <input id="entrySystemOrg" maxlength="50" class="form-control rounded col-form-label"
                                    name="entrysystem_org_id" type="text" value="{{(($searched_data->entrysystem_org_id)??"")}}">
                                </div>
    
                                <div id="entrySystemOrgInfo" style="margin-left:7rem; display:none">あああああああああああああああああああ</div>
                                <input type="hidden" id="status" value=""/>
                            </div>
                            @endif
                            <div class="form-group row ">
                                <label onclick="details('orgIDInfo')" style="cursor:pointer;text-align:right"
                                        class="col-sm-5  col-form-label">団体ID　<span><i class="fa fa-question-circle" aria-hidden="true"></i></span>
                                </label>
                                <div class="col-sm-7">
                                    <input id="org" maxlength="50" class="form-control rounded col-form-label"
                                    name="org_id" type="text" value="{{(($searched_data->org_id)??"")}}">
                                </div>
    
                                <div id="orgIDInfo" style="margin-left:7rem; display:none">あああああああああああああああああああ</div>
                                <input type="hidden" id="status" value=""/>
                            </div>
                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right" class="col-sm-5  col-form-label">団体名
                                </label>
                                <div class="col-sm-7">
                                    <input id="orgName" maxlength="50" class="form-control rounded col-form-label"
                                    name="org_name" type="text" value="
                                    
                                    {{(($searched_data->org_name)??"")}}">
                                </div>
    
                                <input type="hidden" id="status" value=""/>
                            </div>
                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right"
                                        class="col-sm-5  col-form-label">出漕大会名　
                                </label>
                                <div class="col-sm-7">
                                    <input id="tournName" maxlength="50" class="form-control rounded col-form-label"
                                    name="tourn_name" type="text" value="{{(($searched_data->tourn_name)??"")}}">
                                </div>
                                <input type="hidden" id="status" value=""/>
                            </div>
                            <div class="form-group row ">
                                <label style="cursor:pointer;text-align:right"
                                        class="col-sm-5  col-form-label">出漕種目　
                                </label>
                                <div class="col-sm-7">
                                    <input id="eventID" maxlength="50" class="form-control rounded col-form-label"
                                    name="event_name" type="text" value="{{(($searched_data->event_name)??"")}}">
                                </div>
    
                                <input type="hidden" id="status" value=""/>
                            </div>
                            
                            <div class="form-group row" style="padding: 2rem">
                                <div class="col-sm-12 text-center" >
                                    <button class="btn btn-success btn-lg ">検索</button>
                                </div>
                            </div>
                        </div>

                    </form>
            </div>
            <div class="col-md-3">
                <div class="col-sm-12 text-center" >
                    <a role="button" href ="{{route('my-page')}}" class="btn btn-secondary btn-lg ">マイページ</a>
                </div>
                
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
            
            <div class="col-12" id="scrollableTable" style="padding :0rem 2rem 0rem 2rem; width:100%; overflow-x: auto; margin-top : 50px" >
                <table class="table table-striped table-bordered" >
                    <thead >
                        <tr>
                            <th scope="col">JARA選手コード</th>
                            <th scope="col">選手ID</th>
                            <th scope="col">選手名</th>
                            <th scope="col">性別</th>
                            <th scope="col">エントリーシステムの団体ID</th>
                            <th scope="col">団体ID</th>
                            <th scope="col">所属団体名</th>
                            {{-- <th scope="col">団体ID2</th>
                            <th scope="col">所属団体名2</th>
                            <th scope="col">団体ID3</th>
                            <th scope="col">所属団体名3</th> --}}
                        </tr>
                    </thead>
                    <tbody class=" ">
                        @if(count($player_list??[])===0)
                        <tr >
                            <td>---</td>
                            <td>---</td>
                            <td>---</td>
                            <td>---</td>
                            <td>---</td>
                            <td>---</td>
                            <td>---</td>
                        </tr>
                        @else
                        @if(count($player_list)>=100)
                        <script>alert("検索結果が100件を超えました、\n上位100件を表示しています。");</script>
                        @endif
                        @foreach($player_list as $player)
                        <tr >
                            <td><a role = "button" href="{{route('player.details',["user_id"=>$player->player_id])}}">{{$player->jara_player_id}}</a></td>
                            </a>
                            <td><a role = "button" href="{{route('player.details',["user_id"=>$player->player_id])}}" >{{$player->player_id}}</a></td>
                            <td><a role = "button" href="{{route('player.details',["user_id"=>$player->player_id])}}" >{{$player->player_name}}</a></td>
                            <td>{{$player->sex}}</td>
                            <td><a role = "button" href="#" >{{$player->entrysystem_org_id}}</a></td>
                            <td><a role = "button" href="#" >{{$player->org_id}}</a></td>
                            <td><a role = "button" href="#" >{{$player->org_name}}</a></td>
                        </tr>
                        @endforeach
                        @endif
                        
                    </tbody>
                </table>
            </div>
            <div class="col-12" style="text-align: right;margin:2rem 0rem" >
                <a role="button" style="width: 120px;height:60px; font-size:28px" class="btn btn-secondary" href="javascript:history.back()">
                    戻る
                </a>
            </div>    
            
        </div>
        <div class="row" style="margin: 1rem ">
            
        </div> 
    </div>
    <script>

        

        

    </script>

    

    <script src="{{ asset('js/nav.js') }}"></script>
    
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
        integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous">
    </script>
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
        $(document).ready(function(){
            var rowCount = $('tbody tr').length;
            if(rowCount > 10){
                console.log(rowCount);
                $('#scrollableTable').addClass('do-scroll');
            }
        });
    </script>
    
    <script src="{{ asset('js/main.js') }}"></script>
</body>

</html>