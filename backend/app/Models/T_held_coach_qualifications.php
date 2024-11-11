<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_held_coach_qualifications extends Model
{
    use HasFactory;

    //指導者・審判情報取得 20241105
    public function getHeldCoachQualificationsData()
    {
        $result = DB::select(
            'SELECT
                `held_coach_qualification_id` as `heldCoachQualificationId`,
                `qual_name`as `qualName`,
                `acquisition_date`as `acquisitionDate`,
                `expiry_date` as `expiryDate`
                FROM `t_held_coach_qualifications` `held_coach_qual`
                left join `m_coach_qualifications` `coach_qual`
                on `held_coach_qual`.`coach_qualification_id` = `coach_qual`.`coach_qualification_id` 
                and `coach_qual`.delete_flag = 0
                where 1=1
                and `held_coach_qual`.delete_flag = 0
                and `held_coach_qual`.user_id = ?
                order by `acquisition_date` DESC',
            [
                Auth::user()->user_id
            ]
        );
        return $result;
    }

    //指導者・審判情報の追加 20241105
    public function insertHeldCoachQualificationsData($coachQualificationData)
    {
        DB::insert(
            'insert into `t_held_coach_qualifications`
                    set
                    `user_id` = ?,
                    `coach_qualification_id` = ?,
                    `acquisition_date` = ?,
                    `expiry_date` = ?,
                    `registered_time` = ?,
                    `registered_user_id` = ?,
                    `updated_time` = ?,
                    `updated_user_id` = ?,
                    `delete_flag` = 0',
            [
                Auth::user()->user_id,
                $coachQualificationData['coachQualificationId'],
                $coachQualificationData['acquisitionDate'],
                $coachQualificationData['expiryDate'],
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id
            ]
        );
    }

    //指導者・審判情報の更新 20241105
    public function updateHeldCoachQualificationsData($coachQualificationData)
    {
        DB::update(
            'update `t_held_coach_qualifications`
                    set
                    `coach_qualification_id` = ?,
                    `acquisition_date` = ?,
                    `expiry_date` = ?,
                    `updated_time` = ?,
                    `updated_user_id` = ?,
                    `delete_flag` = ?
                    where 1=1
                    and held_coach_qualification_id = ?',
            [
                $coachQualificationData['coachQualificationId'],
                $coachQualificationData['acquisitionDate'],
                $coachQualificationData['expiryDate'],
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $coachQualificationData['isDeleted'],
                $coachQualificationData['heldGoachQualificationId']
            ]
        );
    }
}
