{{--*************************************************************************
* Project name: JARA
* File name: verification_notification.blade.php
* File extension: .blade.php
* Description: This is the main content of register notification
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/11/14
* Updated At: 2023/11/14
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
        件名: 【日本ローイング協会】認証番号<br />
        送信元: xxxxx@jara.or.jp<br />
        宛先: {{$mailData['email']}}<br /><br />

        ※本メールはシステムから自動送信されています。<br /><br />

        {{$mailData['name']}} 様<br />
        {{$mailData['email']}}<br /><br />

        メールアドレス変更の為の認証番号になります。<br /><br />

        --------------------<br />
        [ログインID]<br />
        {{$mailData['email']}}<br /><br />

        [認証番号]<br />
        {{$mailData['certification']}}<br />
        {{$mailData['expiryTimeOfCertification']}} まで有効<br />
        --------------------<br /><br />

        有効期限が切れた場合は、再度ユーザー情報の更新を行ってください。<br /><br />

        ※ このメールは送信専用です。返信できませんのでご注意ください。<br />
        ※ このメールに心当たりがない場合、お手数ですが管理者までお問い合わせください。<br /><br />

        ====================================<br />
        日本ローイング協会<br />
        ====================================<br />
    </p>
</body>

</html>