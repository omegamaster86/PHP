{{--*************************************************************************
* Project name: JARA
* File name: contact_us_notification.blade.blade.php
* File extension: .blade.php
* Description: This is the main content of contact mail notification
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2024/1/15
* Updated At: 2024/1/15
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

        {{$mail_data['user_name']}} 様<br />

        --------------------<br />
        [お問い合わせ内容]<br />
        {!! nl2br(e($mail_data['content'])) !!}<br />
        @if($mail_data['user_id'])
        [User ID]　:　{{$mail_data['user_id']}}<br />
        @endif
        --------------------<br /><br />

        ※ このメールは送信専用です。返信できませんのでご注意ください。<br />
        ※ このメールに心当たりがない場合、お手数ですが管理者までお問い合わせください。<br /><br />

        ====================================<br />
        日本ローイング協会<br />
        ====================================<br />
    </p>
</body>

</html>
