{{--*************************************************************************
* Project name: JARA
* File name: my-page.blade.php
* File extension: .blade.php
* Description: This is the ui of my page
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
    <title>MyPage</title>
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
            <a href={{route('player.delete')}}>選手情報削除</a>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <a href="route('logout')" onclick="event.preventDefault(); this.closest('form').submit();">ログアウト</a>
            </form>
        </div>
        <div style="padding-top:15px;">
            <span class="col-md-3 " style="font-size:30px;cursor:pointer" onclick="openNav()">&#9776; メニュー</span>
            <h1 style="display: inline;margin-left:29.5%" class=" col-md-9">選手情報連携</h1>
            <br />
            <h5 style="color:red">
                {!! $errorMsg !!}
            </h5>
        </div>

        <!-- <div class="col-md-10 text-center">
            <label id="dropzone">読み込みCSVファイル</label>
            <div id="drop_zone" ondrop="dropHandler(event);" ondragover="dragOverHandler(event);">
                <p id="dropItemName">ここにドロップ</p>
            </div>

            <input id="input_file" type="file" accept="*.*" name="photo">
            <input id="bt_file" type="button" value="参照" onclick="clickHoge()">
            <input type="button" value="CSVフォーマット出力" onclick="">
        </div> -->

        <!-- CSVファイル読み込み -->
        <label name="csvFile">読み込みCSVファイル</label>
        <form method="post" action="{{ route('csv.upload') }}" enctype="multipart/form-data">
            @csrf
            <div id="drop_zone" ondragover="dragOverHandler(event);">
                <p id="dropItemName">ここにドロップ</p>
                <input id="input_file" type="file" accept=".csv" name="csvFile" class="" id="csvFile" />
            </div>
            <input id="bt_file" type="button" value="参照" onclick="clickHoge()">
            <input id="bbb_file" type="button" value="CSVフォーマット出力" onclick="clickHoge()">
            <br />
            <p>※新規ファイルを読み込む場合、既に読み込まれた結果はクリアされます。</P>
            <br />
            <div>
                <input type="submit" name="csvRead" value="読み込む"></input>
            </div>
            <br />

            <!-- 読み込み結果リスト -->
            <table border="1" id="tb2" name="tableData">
                <tr>
                    <td colspan="9">
                        <input type="button" value="全選択" onclick="allChecked()">
                        <input type="button" value="全選択解除" onclick="allUnChecked()">
                        読み込み結果
                    </td>
                </tr>
                <tr>
                    <td nowrap>選択</td>
                    <td nowrap>連携</td>
                    <td nowrap>選手ID</td>
                    <td nowrap>既存選手ID</td>
                    <td nowrap>選手名</td>
                    <td nowrap>メールアドレス</td>
                    <td nowrap>エラー内容</td>
                </tr>
                {!! $csvList !!}
            </table>
            <br />
            <br />
            {!!
            Session::put('csvList', $csvList);
            Session::put('checkListData', $checkList);
            !!}
            <input type="hidden" id="Flag01" name="Flag01" value=""></input>
            <!-- 連携 -->
            <input id="alignmentButton" disabled type="submit" name="dbUpload" value="連携"></input>
            <input type="button" value="戻る" onclick="location.href='{{route('my-page')}}'">
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
    <script src="{{ asset('js/playerInfoAlignment.js') }}"></script>
    <script>
        var name = '@json($csvList)';
        var checkList = '@json($checkList)';
        //console.log(name.replace('\'', ''));
    </script>
</body>

</html>