{{--*************************************************************************
* Project name: JARA
* File name: for_unregistered_player_organization_registration_notification_mail.blade.php
* File extension: .blade.php
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2024/3/12
* Updated At: 2024/3/12
*************************************************************************
*
* Copyright 2024 by DPT INC.
*
************************************************************************--}}
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
</head>

<body>
    <p>
        ※本メールはシステムから自動送信されています。<br /><br />

        {{$unregistered_player_mail_data['player_name']}} 様
        ({{$unregistered_player_mail_data['to_mailaddress']}})

        {{$unregistered_player_mail_data['manager_type']}}の管理者により、団体の所属選手として登録されました。
        選手情報は、ユーザー情報を元に作成しています。
        システムにログインし、「選手情報更新」から選手情報の更新を行ってください。
        【確認が必要な情報】
        　　選手名
        　　生年月日
        　　性別
        　　身長
        　　体重
        　　サイド情報
        　　出身地
        　　居住地


        ※ このメールは送信専用です。返信できませんのでご注意ください。
        ※ このメールに心当たりがない場合、お手数ですが管理者までお問い合わせください。
        　問い合わせ：{{$unregistered_player_mail_data['inquiry_url']}}

        ====================================<br />
        日本ローイング協会<br />
        ====================================<br />
    </p>
</body>

</html>