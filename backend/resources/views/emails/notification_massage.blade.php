{{--*************************************************************************
* Project name: JARA
* File name: notification_massage.blade.blade.php
* File extension: .blade.php
* Description: This is the main content of contact mail notification
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2024/11/25
* Updated At: 2024/11/25
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
        @if($mail_data['notification_destination_type_id'] == 1 || $mail_data['notification_destination_type_id'] == 2)
        {{$mail_data['user_name']}} さんから新しいお知らせがあります。
        @else
        JARAから新しいお知らせがあります。
        @endif
    </p>
    <p>
        {{$mail_data['received_notifications_url']}}
    </p>
</body>

</html>
