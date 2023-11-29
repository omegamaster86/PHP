<?php

// Register error check message
$email_register_check = "既に登録されているメールアドレスです。同じメールアドレスでユーザーの登録は出来ません。";
$registration_failed = "仮登録に失敗しました。ユーザーサポートにお問い合わせください。";
$database_registration_failed = "内部処理エラーが発生しました、サポートにご連絡ください。";
$database_registration_failed_try_again = "他のユーザーが登録処理中です、しばらく待ってから再度操作をお願いします。";
$already_registered = "既に仮登録がされています。発行された仮パスワードで、ログイン画面からログインしてください。";

$userName_required = '名前を入力してください。';
$userName_max_limit = '入力制限は 32 文字です。';
$userName_regex = 'ユーザー名に使用できる文字は以下になります。
[ユーザー名の文字制限の内容を表示][A-Z,a-z,0-9,-,_]';

$mailAddress_required = 'メールアドレスを入力してください。';
$email_validation = 'メールアドレスの書式が誤っています。メールアドレスを確認してください。';
$mailAddress_lowercase = 'メールアドレスの書式が誤っています。メールアドレスを確認してください。';
$mailAddress_unique = 'このメールアドレスは既に登録されています。';
$mailAddress_not_found = 'このメールアドレスは登録されていません';

$confirm_email_required = '確認用のメールアドレスを入力してください。';
$confirm_email_compare = 'メールアドレスは一致しません。';

$terms_of_service = 'ユーザーの仮登録には利用契約への同意が必要です。';


$password_required = 'パスワードを入力してください。';
$password_compare = 'パスワードが一致しませんでした。';
$temp_password_timed_out = 'このパスワードは有効期限が切れています。
新規登録からユーザー仮登録を行ってくさい。';


$code_not_found = '認証番号が不正です。';
$code_timed_out = '認証番号の有効期限が切れています。
再度「更新ボタン」を押してください。';

$update_failed = "更新できませんでした。ユーザーサポートにお問い合わせください。";


// Player
$playerCode_required = 'JARA選手コードを入力してください。';
$playerCode_regex = ['JARA選手コードに使用できる文字は以下になります。JARA選手コードの文字制限の内容を表示[A-Z,a-z,0-9]'];
$playerName_required = '選手名を入力してください。';
$playerName_regex = ['選手名に使用できる文字は以下になります。選手名の文字制限の内容を表示[A-Z,a-z,0-9,ＡーＺａーｚ]'];

$dateOfBirth_required = '生年月日を入力してください。';
$sex_required = '性別を入力してください。';
$height_required = '身長を入力してください。';
$weight_required = '体重を入力してください。';
$sideInfo_required = 'サイド情報を入力してください。';

$system_player_registration_failed = "この既存選手IDは既に別の選手と紐づいています。入力した既存選手IDを確認してください。紐づいていた選手I：[選手ID] [選手名]";


// 大会関連
$tournament_name_required = "大会名を入力してください";
$tournament_id= "主催団体IDを入力してください";
$tournament_startDay = "開始日時を選択してください";
$tournament_endDay = "修了日時を選択してください";
$tournament_venueSelect = "開催場所を選択するか、入力欄に開催場所を入力して下さい";
$tournament_c = "URLが正しいことを確認してください";
$tournament_raceNo = "レースNo.を入力してください";
$tournament_syumoku ="種目を入力してください";
$tournament_sosiki = "組織を入力してください";
$tournament_kyori = "距離を入力してください";
$tournament_hattei = "発艇日時を入力してください";


