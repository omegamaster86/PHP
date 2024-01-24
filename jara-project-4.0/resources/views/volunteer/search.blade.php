{{--*************************************************************************
* Project name: JARA
* File name: search.blade.php
* File extension: .blade.php
* Description: This is the ui of organization's edit and update confirmation page
*************************************************************************
* Author: t_futamura
* Created At: 2024/1/17
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

    <link rel="stylesheet" type="text/css" href="{{ asset('css/tournament.css') }}">
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
            <a href="#">ダッシュボード</a>
            <a href="#">情報更新</a>
            <a href="#">情報参照</a>
            <a href="#">アカウント削除</a>
        </div>
        <!--1.引数によって表示を変える-->
        <div style="background: linear-gradient(to right,#1991FC,  #45b796); color:#fff;padding-top:15px;">
            <span class="col-md-3 " style="font-size:30px;cursor:pointer" onclick="openNav()">&#9776; メニュー</span>
            <h1 style="display: inline;margin-left:25%" class="text-right col-md-9">ボランティア検索</h1>
        </div>
        <hr style="height:1px;border-width:0;color:#9AF8FD;background-color:#9AF8FD">

        <!--19.マイページ -->
        <input type="submit" value="マイページ" id="mypageButton">
        <form class="form-horizontal" enctype="multipart/form-data" role="form" style="display: flex" method="POST">
            @csrf            
            <div class="row" style="padding:10px 0px;width: 100%;">
                <div class="col-md-10">
                    <div class="form-group">
                        <label for="volunteer_id" class="col-md-5" style="text-align: right"><b>ボランティアID</b></label>
                        <input id="volunteer_id" name="volunteer_id" value="">
                    </div>
                    <div class="form-group">
                        <label for="volunteer_name" class="col-md-5" style="text-align: right"><b>氏名</b></label>
                        <input id="volunteer_name" name="volunteer_name" value="">
                    </div>
                    <div class="form-group">
                        <label for="date_of_birth_start" class="col-md-5" style="text-align: right"><b>生年月日</b></label>
                        <input id="date_of_birth_start" name="date_of_birth_start" value="">
                        <label>～</label>
                        <input id="date_of_birth_end" name="date_of_birth_end" value="">
                    </div>
                    <div class="form-group">
                        <label for="sex" class="col-md-5" style="text-align: right"><b>性別</b></label>
                        <select id="sex" name="sex">
                            <option value="">--</option>
                        @foreach($m_sex as $sex)                                
                            <option value="{{$sex->sex_id}}">{{$sex->sex}}</option>
                        @endforeach
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="residence" class="col-md-5" style="text-align: right"><b>居住地</b></label>                        
                        <select id="residence_country" name="residence_country">
                            <option value="">--</option>
                        @foreach($countries as $country)
                            <option value="{{$country->country_id}}" {{ $country->country_id === 112 ? "selected" : ""}}>{{$country->country_name}}</option>
                        @endforeach
                        </select>
                        <label for="residence" class="col-md-5" style="text-align: right"><b>都道府県</b></label>                        
                        <select id="residence_prefecture" name="residence_prefecture">
                            <option value="">--</option>
                        @foreach($prefectures as $prefecture)
                            <option value="{{$prefecture->pref_id}}">{{$prefecture->pref_name}}</option>
                        @endforeach
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="qualifications" class="col-md-5" style="text-align: right"><b>資格情報</b></label>
                        <input id="qualifications1" name="qualifications1" value="">                        
                        <input id="qualifications2" name="qualifications2" value="">
                        <label for="foundingYear" class="col-md-5" style="text-align: right"><b>その他資格</b></label>
                        <input id="other_qualification" name="other_qualification" value="">
                    </div>
                    <div class="form-group">
                        <label for="language1" class="col-md-5" style="text-align: right"><b>言語</b></label>
                        <select id="language1" name="language1">
                            <option value="">--</option>
                        @foreach($languages as $language)
                            <option value="{{$language->lang_id}}">{{$language->lang_name}}</option>
                        @endforeach
                        </select>
                        <label for="language_proficiency1" class="col-md-5" style="text-align: right"><b>語学レベル</b></label>
                        <select id="lang_pro1" name="lang_pro1">
                            <option value="">--</option>
                        @foreach($language_proficiency as $lang_pro)
                            <option value="{{$lang_pro->lang_pro_id}}">{{$lang_pro->lang_pro_name}}</option>
                        @endforeach
                        </select>
                        <label>以上</label>
                    </div>
                    <div class="form-group">
                        <label for="language2" class="col-md-5" style="text-align: right"><b>言語</b></label>
                        <select id="language2" name="language2">
                            <option value="">--</option>
                        @foreach($languages as $language)
                            <option value="{{$language->lang_id}}">{{$language->lang_name}}</option>
                        @endforeach
                        </select>
                        <label for="language_proficiency2" class="col-md-5" style="text-align: right"><b>語学レベル</b></label>
                        <select id="lang_pro2" name="lang_pro2">
                            <option value="">--</option>
                        @foreach($language_proficiency as $lang_pro)
                            <option value="{{$lang_pro->lang_pro_id}}">{{$lang_pro->lang_pro_name}}</option>
                        @endforeach
                        </select>
                        <label>以上</label>
                    </div>
                    <div class="form-group">
                        <label for="language3" class="col-md-5" style="text-align: right"><b>言語</b></label>
                        <select id="language3" name="language3">
                            <option value="">--</option>
                        @foreach($languages as $language)
                            <option value="{{$language->lang_id}}">{{$language->lang_name}}</option>
                        @endforeach
                        </select>
                        <label for="language_proficiency3" class="col-md-5" style="text-align: right"><b>語学レベル</b></label>
                        <select id="lang_pro3" name="lang_pro3">
                            <option value="">--</option>
                        @foreach($language_proficiency as $lang_pro)
                            <option value="{{$lang_pro->lang_pro_id}}">{{$lang_pro->lang_pro_name}}</option>
                        @endforeach
                        </select>
                        <label>以上</label>
                    </div>
                    <div class="form-group">
                        <!-- 補助が可能な障碍タイプ -->
                        <label for="supportable_disability" class="col-md-5" style="text-align: right"><b>補助が可能な障碍タイプ</b></label>                        
                        <input name="PR1" type="checkbox" value="PR1">PR1
                        <input name="PR2" type="checkbox"  value="PR2">PR2
                        <input name="PR3" type="checkbox"  value="PR3">PR3
                    </div>
                    <div>
                        <!-- 参加しやすい日時 -->
                        <label for="availables" class="col-md-5" style="text-align: right"><b>参加しやすい日時</b></label>
                        <label for="availables_day">■参加しやすい曜日</label>                        
                        <input name="sunday" type="checkbox"  value="日曜日">日曜日                        
                        <input name="monday" type="checkbox"  value="月曜日">月曜日
                        <input name="tuesday" type="checkbox"  value="火曜日">火曜日
                        <input name="wednesday" type="checkbox"  value="水曜日">水曜日
                        <input name="thursday" type="checkbox"  value="木曜日">木曜日
                        <input name="friday" type="checkbox"  value="金曜日">金曜日
                        <input name="saturday" type="checkbox"  value="土曜日">土曜日
                        <input name="holiday" type="checkbox"  value="祝日は可">祝日は可
                        <input name="day_negotiable" type="checkbox"  value="相談可能">相談可能
                    </div>
                    <div class="form-group">
                        <!-- 参加可能時間帯 -->
                        <label for="availables" class="col-md-5" style="text-align: right"></label>
                        <label for="availables_day">■参加可能時間帯</label>
                        <input name="early_morning" type="checkbox"  value="早朝">早朝　06:00～08:00
                        <input name="morning" type="checkbox"  value="午前">午前　08:00～12:00
                        <input name="afternoon" type="checkbox"  value="午後">午後　12:00～16:00
                        <input name="night" type="checkbox"  value="夜">夜　　16:00～20:00
                        <input name="time_negotiable" type="checkbox"  value="相談可能">相談可能
                    </div>
                    <div class="form-group">
                        <!-- 過去参加した大会 -->
                        <label for="tournaments" class="col-md-5" style="text-align: right"><b>過去参加した大会</b></label>
                        <input id="tournament1" name="tournament1" value="">
                        <input id="tournament2" name="tournament2" value="">
                        <input id="tournament3" name="tournament3" value="">
                    </div>
                    <!-- 確認・戻るボタン -->
                    <div class="form-group row" style="padding: 2rem">
                        <div class="col-sm-2 offset-sm-4">
                            <button class="btn btn-success btn-lg btn-block">検索</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <table class="table table-bordered">
                            <thead>
                                <tr class="table-primary">
                                    <th colspan="13" class="text-center">ボランティア一覧</th>
                                </tr>
                            </thead>
                            <thead>
                                <tr>
                                <th>ボランティアID</th>
                                <th>氏名</th>
                                <th>居住地</th>
                                <th>性別</th>
                                <th>年齢</th>
                                <th>PR1</th>
                                <th>PR2</th>
                                <th>PR3</th>
                                <th>言語1</th>
                                <th>言語2</th>
                                <th>言語3</th>
                                <th>電話番号</th>
                                <th>メールアドレス</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>XXXXXXXX</td>
                                    <td>XXXX XXXX</td>
                                    <td>XXXXXXX</td>
                                    <td>X</td>
                                    <td>XX</td>
                                    <td>◯</td>
                                    <td>◯</td>
                                    <td>◯</td>
                                    <td>XXXX</td>
                                    <td>XXXX</td>
                                    <td>XXXX</td>
                                    <td>XXX-XXX-XXXX</td>
                                    <td>XXXXX@XX.XX.XX</td>
                                </tr>
                            </tbody>
                        </table>
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
    <script src="{{ asset('js/organization.js') }}"></script>
</body>

</html>