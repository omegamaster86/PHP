<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_notification_recipients extends Model
{
    use HasFactory;

    //既読フラグの更新 20241119
    public function updateNotificationReadFlagData($notificationRecipientsData)
    {
        DB::update(
            'UPDATE t_notification_recipients
                    set
                    read_flag = 1
                    updated_time = ?,
                    updated_user_id = ?,
                    where 1=1
                    and delete_flag = 0
                    and notification_id = ?
                    and recipient_id = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $notificationRecipientsData['notificationId'],
                Auth::user()->user_id,
            ]
        );
    }
}
