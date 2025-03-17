<!DOCTYPE html>
<html lang="jp">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
</head>

<body>
    <p>
        JARAポータルサイトにお問い合わせがありました。<br /><br />

        お名前：{{$mail_data['user_name']}} 様<br />
        メールアドレス：{{$mail_data['mailaddress']}}<br />
        <br />
        --------------------<br />
        [お問い合わせ内容]<br />
        {{$mail_data['content']}}<br />
        @if($mail_data['user_id'])
        [User ID]　:　{{$mail_data['user_id']}}<br />
        @endif
        --------------------<br /><br />
    </p>
</body>

</html>
