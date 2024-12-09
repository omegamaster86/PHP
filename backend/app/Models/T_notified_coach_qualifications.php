<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_notified_coach_qualifications extends Model
{
    use HasFactory;

    //指導者資格の追加 20241119
    public function insertNotifiedCoachQualificationsData($coachQualification)
    {
        $now = now()->format('Y-m-d H:i:s.u');
        $userId = Auth::user()->user_id;

        DB::insert(
            'INSERT INTO t_notified_coach_qualifications
                    SET
                    notification_id = ?,
                    coach_qualification_id = ?,
                    registered_time = ?,
                    registered_user_id = ?,
                    updated_time = ?,
                    updated_user_id = ?,
                    delete_flag = 0',
            [
                $coachQualification['notificationId'],
                $coachQualification['coachQualificationId'],
                $now,
                $userId,
                $now,
                $userId
            ]
        );
    }
}
