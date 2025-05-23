<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_notified_referee_qualifications extends Model
{
    use HasFactory;

    //審判資格の追加 20241119
    public function insertNotifiedRefereeQualificationsData($refereeQualification)
    {
        $now = now()->format('Y-m-d H:i:s.u');
        $userId = Auth::user()->user_id;

        DB::insert(
            'INSERT into t_notified_referee_qualifications
                SET
                    notification_id = ?,
                    referee_qualification_id = ?,
                    registered_time = ?,
                    registered_user_id = ?,
                    updated_time = ?,
                    updated_user_id = ?,
                    delete_flag = 0',
            [
                $refereeQualification['notificationId'],
                $refereeQualification['refereeQualificationId'],
                $now,
                $userId,
                $now,
                $userId
            ]
        );
    }
}
