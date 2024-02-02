{{--*************************************************************************
* Project name: JARA
* File name: my-page.blade.php
* File extension: .blade.php
* Description: This is the ui of my page
*************************************************************************
* Author: t.futamura
* Created At: 2024/2/2
* Updated At: 2024/2/2
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
            <h1 style="display: inline;margin-left:29.5%" class=" col-md-9">レース結果一括登録</h1>
            <br />
            <h5 style="color:red">
                {!! $errorMsg !!}
            </h5>
        </div>
        <!-- CSVファイル読み込み -->
        <label name="csvFile">読み込みCSVファイル</label>
        <form method="post" action="{{ route('tournament.csv.read') }}" enctype="multipart/form-data">
            @csrf
            <div id="drop_zone" ondragover="dragOverHandler(event);">
                <p id="dropItemName">ここにドロップ</p>
                <input id="input_file" type="file" accept=".csv" name="csvFile" class="" id="csvFile" />
            </div>
            <input id="bt_file" type="button" value="参照" onclick="clickHoge()">
            <input id="bbb_file" type="button" value="CSVフォーマット出力" onclick="clickHoge()">
            <br />
            <font color="red">
            <p>[読み込み方法]<br/>
                &#009;[準備]<br/>
                &#009;定形フォーマットにエントリー情報を入力してください。<br/>
                &#009;※定形フォーマットが必要な場合は、「CSVフォーマット出力」をクリックしてください。<br/>
                &#009;　定型フォーマットがダウンロードされます<br/>
                [読み込む]<br/>
                ①「読み込みCSVファイル」に、読み込ませるCSVファイルをドラッグ＆ドロップしてください。<br/>
                &#009;※参照からファイルを指定することもできます。<br/>
                ②「読み込み」をクリックすると、CSVフォーマットの内容を読み込み、内容を画面下部の読み込み結果に表示します。</P>
            </font>
            <br />
            <div>
                <input type="submit" name="csvRead" value="読み込む"></input>
            </div>
            <br />
            <font color="red">
                <p>[登録方法]<br/>
                    ①「読み込む結果」にCSVフォーマットを読み込んだ結果が表示されます。<br/>
                    ②読み込むデータの「選択」にチェックを入れてください。※「全選択」で、全てのデータを選択状態にできます。<br/>
                    ③「登録」をクリックすると「読み込み結果」にて「選択」にチェックが入っているデータを対象に、本システムに登録されます。<br/>
                    ※それまで登録されていたデータは全て削除され、読み込んだデータに置き換わります。</P>
            </font>
            <!-- 読み込み結果リスト -->
            <table border="1" id="tb2" name="tableData">
                <tr>
                    <td colspan="35">
                        <input type="button" value="全選択" onclick="allChecked()">
                        <input type="button" value="全選択解除" onclick="allUnChecked()">
                        読み込み結果
                    </td>
                </tr>
                <tr>
                    <td rowspan="2" nowrap>選択</td>
                    <td rowspan="2" nowrap>読み込み結果</td>
                    <td rowspan="2" nowrap>ユーザーID</td>
                    <td rowspan="2" nowrap>氏名</td>
                    <td rowspan="2" nowrap>生年月日</td>
                    <td rowspan="2" nowrap>居住地</td>
                    <td rowspan="2" nowrap>性別</td>
                    <td rowspan="2" nowrap>服のサイズ</td>
                    <td rowspan="2" nowrap>メールアドレス</td>
                    <td rowspan="2" nowrap>電話番号</td>
                    <td colspan="3" nowrap>補助が可能な障碍タイプ</td>
                    <td colspan="5" nowrap>保有資格情報</td>
                    <td colspan="6" nowrap>言語</td>
                    <td colspan="7" nowrap>参加しやすい曜日</td>
                    <td colspan="4" nowrap>参加しやすい時間帯</td>
                </tr>
                <tr>
                    <th scope="col">PR1</th>
                    <th scope="col">PR2</th>
                    <th scope="col">PR3</th>
                    <th scope="col">保有資格1</th>
                    <th scope="col">保有資格2</th>
                    <th scope="col">保有資格3</th>
                    <th scope="col">保有資格4</th>
                    <th scope="col">保有資格5</th>
                    <th scope="col">言語1</th>
                    <th scope="col">言語レベル1</th>
                    <th scope="col">言語2</th>
                    <th scope="col">言語レベル2</th>
                    <th scope="col">言語3</th>
                    <th scope="col">言語レベル3</th>
                    <th scope="col">日</th>
                    <th scope="col">月</th>
                    <th scope="col">火</th>
                    <th scope="col">水</th>
                    <th scope="col">木</th>
                    <th scope="col">金</th>
                    <th scope="col">土</th>
                    <th scope="col">早朝</th>
                    <th scope="col">午前</th>
                    <th scope="col">午後</th>
                    <th scope="col">夜</th>
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
            <input id="alignmentButton" enable type="submit" name="regist" value="登録"></input>
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