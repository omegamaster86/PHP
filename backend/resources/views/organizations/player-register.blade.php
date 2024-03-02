{{--*************************************************************************
* Project name: JARA
* File name: player-register.blade.php
* File extension: .blade.php
* Description: This is the ui of organization player register page
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2024/02/03
* Updated At: 2024/02/06
*************************************************************************
*
* Copyright 2024 by DPT INC.
*
************************************************************************--}}
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Organization player register</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/nav.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/playerInfoalignment.css') }}">
</head>

<body>
    {{-- background-color: #9FD9F6; --}}
    <div class="container-fluid bootstrap snippets bootdey">
        <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
            <a href={{route('my-page')}}>マイページ</a>
            <a href={{route('user.edit')}}>情報更新</a>
            <a href={{route('user.details')}}>情報参照</a>
            <a href={{route('user.delete')}}>退会</a>
            <a href={{route('user.password-change')}}>パスワード変更</a>
            <a href={{route('player.register')}}>選手情報登録</a>
            <a href={{route('player.edit')}}>選手情報更新</a>
            {{-- <a href={{route('player.details',["user_id"=>Auth::user()->user_id])}}>選手情報参照</a> --}}
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
            <span class="col-md-3 " style="font-size:30px;cursor:pointer" onclick="openNav()">&#9776; メニュー</span>
            <h1 style="display: inline;margin-left:29.5%" class="text-right col-md-9">
                団体選手一括登録
            </h1>
        </div>
        <br />
        <h5 style="color:red">
            {!! $errorMsg !!}
        </h5>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">

        <!-- <div class="col-md-10 text-center">
            <label id="dropzone">読み込みCSVファイル</label>
            <div id="drop_zone" ondrop="dropHandler(event);" ondragover="dragOverHandler(event);">
                <p id="dropItemName">ここにドロップ</p>
            </div>

            <input id="input_file" type="file" accept="*.*" name="photo">
            <input id="bt_file" type="button" value="参照" onclick="clickHoge()">
            <input type="button" value="CSVフォーマット出力" onclick="">
        </div> -->
        <div>
            <!-- CSVファイル読み込み -->
            
            <form method="post" action="{{ route('organization-player-register') }}" enctype="multipart/form-data" >
                @csrf
                <div class="col-md-12" style="display: flex">
                    <div class="col-md-3"></div>
                    <div class="col-md-6" style="background-color:#005BFC;padding-top:15px; border-radius: 10px ; color:#fff">
                        
                        <div class="form-group">
                            <label class=" control-label" for = "organizationName">所属団体名</label>
                            <select id="organizationName" name="organization_name" class="form-control" >
                                <option value="" >--</option>
                                @foreach($organization_name_list as $organization)
                                <option value= {{$organization->org_name}} {{ (old('organization_name')===$organization->org_name) ? "selected" : ""}} >{{$organization->org_name}}</option>
                                @endforeach
                            </select>
                        </div>
                        <p> ＊読み込みCSVファイル</p>
                        <div id="drop_zone" class="form-group " ondragover="dragOverHandler(event);">
                            <div id="dropItemName" class="form-control border " >ここにドロップ</div>
                            <input id="input_file" type="file" accept=".csv" name="csvFile" class="form-control border "  id="csvFile" />
                        </div>
                        <div class="form-group ">
                       
                        <input id="bt_file" class="form-group " type="button" value="参照" onclick="clickHoge()">
                        <input id="bbb_file" class="form-group " type="button" value="CSVフォーマット出力" onclick="clickHoge()">
                        </div>
                        
                        <br />
                        <div class="form-group ">
                            <input type="submit" name="csvRead" value="読み込む"/>
                        </div>
                        <br />
                    </div>
                    <div class="col-md-3"></div>
                </div>
                <br/>
                <br/>
                <div class="col-md-12" style="background-color:#fff;padding-top:15px;  color:#000">
                    <!-- 読み込み結果リスト -->
                    <table border="1" id="tb2" name="tableData" style="width: 98%">
                        <tr>
                            <td colspan="12">
                                <input type="button" value="全選択" onclick="allChecked()">
                                <input type="button" value="全選択解除" onclick="allUnChecked()">
                                読み込み選手一覧
                            </td>
                        </tr>
                        <tr>
                            <td nowrap>選択</td>
                            <td nowrap>ユーザーID</td>
                            <td nowrap>選手ID</td>
                            <td nowrap>JARA選手コード</td>
                            <td nowrap>選手名</td>
                            <td nowrap>メールアドレス</td>
                            <td nowrap>所属団体ID</td>
                            <td nowrap>所属団体名</td>
                            <td nowrap>出身地</td>
                            <td nowrap>居住地</td>
                        </tr>
                        @foreach ($dataList as $data)
                            <tr>
                                <td><input type="checkbox"/></td>
                                <td>{{$data[2]??""}}</td>
                                <td>{{$data[1]??""}}</td>
                                <td>{{$data[0]??""}}</td>
                                <td>{{$data[4]??""}}</td>
                                <td>{{$data[3]??""}}</td>
                                <td>ーーー</td>
                                <td>ーーー</td>
                                <td>ーーー</td>
                                <td>ーーー</td>
                            </tr>
                        @endforeach
                    </table>
                    <br />
                    <br />
                    {!!
                    Session::put('dataList', $dataList);
                    Session::put('checkListData', $checkList);
                    !!} 
                    <input type="hidden" id="Flag01" name="Flag01" value=""/>
                    <!-- 登録 -->
                    <input id="alignmentButton" type="submit" name="dbUpload" value="登録"/>
                    <input type="button" value="戻る" onclick="location.href='{{route('my-page')}}'">
                </div>
            </form>

        </div>

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
            defaultDate: 'null',
            "maxDate": "today",
        });
    </script>
    {{-- Date Picker End --}}
    <script>
        function changeStatus() {
            document.getElementById("status").value = "true";
            document.getElementById("editForm").submit();
        }

        function validateEditForm() {
            if (document.getElementById("status").value === "true") {
                return true;
            }
            if (document.getElementById("registeredPlayerCode").value !== document.getElementById("playerCode").value) {
                document.getElementById("checkeWarningMessage").click();
            } else {
                return true;
            }
            return false;
        }
    </script>
    <script src="{{ asset('js/nav.js') }}"></script>
    <script src="{{ asset('js/main.js') }}"></script>
    <script src="{{ asset('js/organizationPlayerRegister.js') }}"></script>
    <script>
        // var name = '@json($dataList)';
        // var checkList = '@json($checkList)';
        //console.log(name.replace('\'', ''));
    </script>
</body>

</html>