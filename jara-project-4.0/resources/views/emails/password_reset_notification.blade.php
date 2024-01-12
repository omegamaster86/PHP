{{--*************************************************************************
* Project name: JARA
* File name: password_reset_notification.blade.php
* File extension: .blade.php
* Description: This is the main content of password reset notification
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2024/1/12
* Updated At: 2024/1/12
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
        件名: 【日本ローイング協会】パスワードが再発行されました<br />
        送信元: xxxxx@jara.or.jp<br />
        宛先: {{$mail_data['mailaddress']}}<br /><br />

        ※本メールはシステムから自動送信されています。<br /><br />

        {{$mail_data['user_name']}} 様<br />

        パスワードが再発行されました。<br /><br />

        --------------------<br />
        [ログインID]<br />
        {{$mail_data['mailaddress']}}<br /><br />

        [仮パスワード]<br />
        {{$mail_data['temporary_password']}}<br />
        {{$mail_data['temporary_password_expiration_date']}} まで有効<br /><br />

        [ログイン用URL]<br />
        https://www.[ポータルサイトのURL]/login/<br />
        --------------------<br /><br />

        有効期限が切れた場合は、パスワードを再発行してください。<br /><br />

        ※ このメールは送信専用です。返信できませんのでご注意ください。<br />
        ※ このメールに心当たりがない場合、お手数ですが管理者までお問い合わせください。<br /><br />

        ====================================<br />
        日本ローイング協会<br />
        ====================================<br />
    </p>
</body>

</html>