{{--*************************************************************************
* Project name: JARA
* File name: register_notification.blade.php
* File extension: .blade.php
* Description: This is the main content of register notification
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/11/07
* Updated At: 2023/12/05
*************************************************************************
*
* Copyright 2023 by DPT INC.
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
        {{$mail_data['to_mailaddress']}}<br /><br />

        日本ローイング協会のポータルサイトに登録いただき有難うございます。<br />
        仮パスワードが新規発行されました。<br /><br />

        --------------------<br />
        [ログインID]<br />
        {{$mail_data['to_mailaddress']}}<br /><br />

        [仮パスワード]<br />
        {{$mail_data['temporary_password']}}<br />
        {{$mail_data['temporary_password_expiration_date']}} まで有効<br /><br />

        [ログイン用URL]<br />
        {{$mail_data['login_url']}}<br />
        --------------------<br /><br />

        有効期限が切れた場合は、<br />
        ログイン用URLにアクセスして、新規登録を行ってください。<br />
        仮パスワードが新規発行されます。<br /><br />

        ※ このメールは送信専用です。返信できませんのでご注意ください。<br />
        ※ このメールに心当たりがない場合、お手数ですが管理者までお問い合わせください。<br /><br />

        ====================================<br />
        日本ローイング協会<br />
        ====================================<br />
    </p>
</body>

</html>
