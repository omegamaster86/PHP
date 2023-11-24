<?php

// Register error check message
$email_register_check = "既に登録されているメールアドレスです。同じメールアドレスでユーザーの登録は出来ません。";
$registration_failed = "仮登録に失敗しました。ユーザーサポートにお問い合わせください。";
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