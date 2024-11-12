<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_held_referee_qualifications extends Model
{
    use HasFactory;

    //指導者・審判情報取得 20241105
    public function getHeldRefereeQualificationsData()
    {
        $result = DB::select(
            'SELECT
                `held_referee_qualification_id` as `heldRefereeQualificationId`,
                `qual_name`as `qualName`,
                `acquisition_date`as `acquisitionDate`,
                `expiry_date` as `expiryDate`
                FROM `t_held_referee_qualifications` `held_referee_qual`
                left join `m_referee_qualifications` `referee_qual`
                on `held_referee_qual`.`referee_qualification_id` = `referee_qual`.`referee_qualification_id` 
                and `referee_qual`.delete_flag = 0
                where 1=1
                and `held_referee_qual`.delete_flag = 0
                and `held_referee_qual`.user_id = ?
                order by `acquisition_date` DESC',
            [
                Auth::user()->user_id
            ]
        );
        return $result;
    }

    //指導者・審判情報の追加 20241105
    public function insertHeldRefereeQualificationsData($refereeQualificationData)
    {
        DB::insert(
            'insert into `t_held_referee_qualifications`
                    set
                    `user_id` = ?,
                    `referee_qualification_id` = ?,
                    `acquisition_date` = ?,
                    `expiry_date` = ?,
                    `registered_time` = ?,
                    `registered_user_id` = ?,
                    `updated_time` = ?,
                    `updated_user_id` = ?,
                    `delete_flag` = 0',
            [
                Auth::user()->user_id,
                $refereeQualificationData['refereeQualificationId'],
                $refereeQualificationData['acquisitionDate'],
                $refereeQualificationData['expiryDate'],
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id
            ]
        );
    }

    //指導者・審判情報の更新 20241105
    public function updateHeldRefereeQualificationsData($refereeQualificationData)
    {
        DB::update(
            'update `t_held_referee_qualifications`
                    set 
                    `referee_qualification_id` = ?,
                    `acquisition_date` = ?,
                    `expiry_date` = ?,
                    `updated_time` = ?,
                    `updated_user_id` = ?,
                    `delete_flag` = ?
                    where 1=1
                    and `held_referee_qualification_id` = ?',
            [
                $refereeQualificationData['refereeQualificationId'],
                $refereeQualificationData['acquisitionDate'],
                $refereeQualificationData['expiryDate'],
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $refereeQualificationData['isDeleted'],
                $refereeQualificationData['heldRefereeQualificationId']
            ]
        );
    }

    //指導者・審判プロフィール用データ取得 20241112
    public function getHeldRefereeQualificationsDataForProfile()
    {
        $result = DB::select(
            'SELECT
                `held_referee_qualification_id` as `heldRefereeQualificationId`,
                `qual_name`as `qualName`,
                `expiry_date` as `expiryDate`
                FROM `t_held_referee_qualifications` `held_referee_qual`
                left join `m_referee_qualifications` `referee_qual`
                on `held_referee_qual`.`referee_qualification_id` = `referee_qual`.`referee_qualification_id` 
                and `referee_qual`.delete_flag = 0
                where 1=1
                and `held_referee_qual`.delete_flag = 0
                and `held_referee_qual`.user_id = ?',
            [
                Auth::user()->user_id
            ]
        );
        return $result;
    }
}
