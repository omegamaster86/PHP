{{--*************************************************************************
* Project name: JARA
* File name: register_notification.blade.php
* File extension: .blade.php
* Description: This is the main content of register notification
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/11/07
* Updated At: 2023/11/09
*************************************************************************
*
* Copyright 2023 by DPT INC.
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
        件名: 【日本ローイング協会】仮パスワードが発行されました<br />
        送信元: xxxxx@jara.or.jp<br />
        宛先: {{$mailData['email']}}<br /><br />

        ※本メールはシステムから自動送信されています。<br /><br />

        {{$mailData['name']}} 様<br />
        {{$mailData['email']}}<br /><br />

        日本ローイング協会のポータルサイトに登録いただき有難うございます。<br />
        仮パスワードが新規発行されました。<br /><br />

        --------------------<br />
        [ログインID]<br />
        {{$mailData['email']}}<br /><br />

        [仮パスワード]<br />
        {{$mailData['temporary_password']}}<br />
        {{$mailData['temporary_password_expiration_date']}} まで有効<br /><br />

        [ログイン用URL]<br />
        https://www.[ポータルサイトのURL]/login/<br />
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