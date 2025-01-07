<?php

/*************************************************************************
 *  Project name: JARA
 *  File name: ErrorMessages.php
 *  File extension: .php
 *  Description: This is the error message file for validation error and system error 
 *************************************************************************
 *  Author: DEY PRASHANTA KUMAR
 *  Created At: 2023/11/02
 *  Updated At: 2023/11/29
 *************************************************************************
 *
 *  Copyright 2023 by DPT INC.
 *
 ************************************************************************/
// Register error check message
$email_register_check = ["既に登録されているメールアドレスです。", "同じメールアドレスでユーザーの登録は出来ません。"];
$registration_failed = ["仮登録に失敗しました。", "ユーザーサポートにお問い合わせください。"];
$mail_sent_failed = ["メールの送信に失敗しました。", "入力したメールアドレスを確認してください。"];
$mail_sent_failed_for_contact_us = ["メールの送信に失敗しました。", "もう一度送信してください。"];
$database_system_error = ["内部処理エラーが発生しました、", "サポートにご連絡ください。"];
$database_registration_failed_try_again = ["他のユーザーが登録処理中です、", "しばらく待ってから再度操作をお願いします。"];
$already_registered = ["既に仮登録がされています。", "発行された仮パスワードで、", "ログイン画面からログインしてください。"];
$this_mail_deleted = "メールアドレスかパスワードに誤りがあります。";

//username error message
$userName_required = 'ユーザー名を入力してください。';
$userName_max_limit = '入力制限は 32 文字です。';
$userName_regex = ['ユーザー名に使用できる文字は以下になります。" , "
【ユーザー名の文字制限の内容を表示】" , "【 日本語, A-Z, a-z, 0-9, -, _ 】'];

//mail address error message
$mailAddress_required = 'メールアドレスを入力してください。';
$email_validation = ['メールアドレスの書式が誤っています。" , "メールアドレスを確認してください。'];
$mailAddress_lowercase = ['メールアドレスの書式が誤っています。" , "メールアドレスを確認してください。'];
$mailAddress_already_exists = ['このメールアドレスは既に登録されています。'];
$mailAddress_not_found = 'メールアドレスかパスワードに誤りがあります。';

$confirm_email_required = '確認用のメールアドレスを入力してください。';
$confirm_email_compare = 'メールアドレスは一致しません。';
$confirm_email_for_password_reset_page = '登録済みメールアドレスと一致しません。<br/>メールアドレスを確認してください。';

$mailaddress_not_registered = ["登録されていないメールアドレスです。", "メールアドレスを確認してください。"];


//content error message
$content_required = 'お問い合わせ内容を入力してください。';

//privacy policy error message
$terms_of_service = 'ユーザーの仮登録には利用契約への同意が必要です。';

//privacy policy error message
$terms_of_service_for_contact_us = '個人情報保護方針への同意が必要です。';

// date of birth error message
$dateOfBirth_required = '生年月日を入力してください。';

//sex error message
$sex_required = '性別を入力してください。';

//residence country error message
$residenceCountry_required = '居住地を入力してください。';
$residencePrefecture_required_if = '都道府県を入力してください。';

//password error message
$password_required = 'パスワードを入力してください。';
$password_condition = ["パスワードは、以下の文字種の全てを含む、", "
８文字以上１６文字以内にしてください。", "・半角英文字", "・半角数字", "・以下の記号", "・!\"#$%&\'()*+,-.:;<=>?@_`{|}~^"];
$password_max_limit = '入力制限は 16文字です。';
$password_regex = '入力制限は 16文字です。';

//password change error message
$previous_password_required = '旧パスワードを入力してください。';
$new_password_required = '新パスワードを入力してください。';
$new_password_confirm_required = 'パスワード確認を入力してください。';
$password_compare = 'メールアドレスかパスワードに誤りがあります。';
$previous_and_new_password_compare = ["旧パスワードと新パスワードは同じです。", "異なるパスワードを入力してください。"];
$previous_password_not_matched = ["旧パスワードが正しくありません。", "正しい旧パスワードを入力してください。"];
$temp_password_timed_out = ["このパスワードは有効期限が切れています。", "
新規登録からユーザー仮登録を行ってくさい。"];

//verification code error message
$code_not_found = ['認証番号が不正です。'];
$code_timed_out = ["認証番号の有効期限が切れています。", "
再度「更新ボタン」を押してください。"];

//update error message
$update_failed = ["更新できませんでした。", "ユーザーサポートにお問い合わせください。"];


// Player page error message
$playerCode_required = 'JARA選手コードを入力してください。';
$playerCode_regex = ["JARA選手コードに使用できる文字は以下になります。", "JARA選手コードの文字制限の内容を表示", "【A-Z,a-z,0-9】"];
$playerName_required = '選手名を入力してください。';
$playerName_regex = ["選手名に使用できる文字は以下になります。", "選手名の文字制限の内容を表示", "【A-Z,a-z,0-9,ＡーＺａーｚ】"];

$dateOfBirth_required = '生年月日を入力してください。';
$sex_required = '性別を入力してください。';
$height_required = '身長を入力してください。';
$weight_required = '体重を入力してください。';
$sideInfo_required = 'サイド情報を入力してください。';

$system_player_registration_failed = ["この既存選手IDは既に別の選手と紐づいています。", "入力した既存選手IDを確認してください。", "紐づいていた選手I：[選手ID] [選手名]"];

// 20231130
// 大会関連
$tournament_name_required = "大会名を入力してください";
$tournament_name_max_limit = '入力制限は 32 文字です。';
$tournament_name_regex = '大会名に使用できる文字は以下になります。【 日本語, A-Z, a-z, 0-9, -, _ 】';
$tournament_id_required = "主催団体IDを入力してください";
$tournament_startDay_required = "開始日時を選択してください";
$tournament_endDay_required = "修了日時を選択してください";
$tournament_venueSelect_required = "開催場所を選択して下さい";
$tournament_venueSelectTxt_required = "開催場所を入力して下さい";
$tournament_c = "URLが正しいことを確認してください";
$tournament_raceNo = "レースNo.を入力してください";
$tournament_syumoku = "種目を入力してください";
$tournament_sosiki = "組織を入力してください";
$tournament_kyori = "距離を入力してください";
$tournament_hattei = "発艇日時を入力してください";
$tournament_official = "[団体ID]：[団体名]は、任意団体の為、公式大会を主催することはできません";
$tournament_endDayRange = "開催終了年月日の値が不正です。開催開始年月日より前の日付を選択することはできません。";
//大会登録　レース登録リスト
$tournament_races_No = "レースNo.を入力してください";
$tournament_races_event = "種目を入力してください";
$tournament_races_name = "レース名を入力してください";
$tournament_races_group = "組別を入力してください";
$tournament_races_distance = "距離を入力してください";
$tournament_races_dayTime = "発艇日時を入力してください";

//20231130
//Organization
$orgName_required = '団体名を入力してください。';
$foundingYear_required = '創立年を入力してください。';
$foundingYear_failed = '不正な値です。適切な西暦を入力してください。';
$postCode_required = '郵便番号を入力してください。';
$postCode_failed = '不正な郵便番号です。適切な郵便番号を入力してください。(数字３桁-数字４桁)';
$prefecture_required = '都道府県を入力してください。';
$address1_required = '市区町村・町字番地を入力してください。';
$address2_required = '建物名を入力してください。';
$orgClass_required = '団体区分を入力してください。';
$managerUserId_required = '管理者のユーザIDを入力してください。';
$jaraOrgType_official_failed = 'JARA証跡を設定しない場合、JARA団体種別は"任意"を選択してください。';
$jaraOrgType_private_failed = 'JARA証跡を設定する場合、JARA団体種別は"正式"を選択してください。';
$prefOrgType_official_failed = '県ボ証跡を設定しない場合、県ボ団体種別は"任意"を選択してください。';
$prefOrgType_private_failed = '県ボ証跡を設定する場合、県ボ団体種別は"正式"を選択してください。';
$entrysystemOrgId_registered = '入力されたエントリーシステムの団体IDは、既に別の団体で使用されています。[団体ID]：[団体名]';
//管理者、部長、コーチ、マネージャー、監督代行の全て共通
$userId_not_found = '[対象項目名]のユーザーは、既にシステムより削除されているか、本登録されていないユーザーIDが入力されています。';
$organization_commit_failed = '団体情報の登録に失敗しました。ユーザーサポートにお問い合わせください。';

//レース結果入力画面のエラーメッセージ
$race_result_record_have_been_registred = '当該レースの結果は、既に他のユーザーによって登録されています。';
$race_result_record_have_been_deleted = '当該レースの結果は、他のユーザーによって削除されています。';
