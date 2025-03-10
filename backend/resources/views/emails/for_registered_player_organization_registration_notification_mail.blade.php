{{--*************************************************************************
* Project name: JARA
* File name: for_registered_player_organization_registration_notification_mail.blade.php
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
<html lang="jp">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
</head>

<body>
    <p>
        ※本メールはシステムから自動送信されています。<br /><br />

        {{$registered_player_mail_data['player_name']}} 様<br />
        {{$registered_player_mail_data['to_mailaddress']}}<br />

        {{$registered_player_mail_data['manager_type']}}の管理者により、団体の所属選手として登録されました。<br />

        ※ このメールは送信専用です。返信できませんのでご注意ください。<br />
        ※ このメールに心当たりがない場合、お手数ですが管理者までお問い合わせください。<br />
        　　問い合わせ：{{$registered_player_mail_data['inquiry_url']}}<br />


        ====================================<br />
        日本ローイング協会<br />
        ====================================<br />
    </p>
</body>

</html>
