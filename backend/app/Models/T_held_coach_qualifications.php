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
                `held_coach_qualification_id` AS `heldCoachQualificationId`,
                `qual_name` AS `qualName`,
                `acquisition_date` AS `acquisitionDate`,
                `expiry_date` AS `expiryDate`,
                `coach_qual`.`coach_qualification_id` AS `coachQualificationId`
            FROM `t_held_coach_qualifications` `held_coach_qual`
            INNER JOIN `m_coach_qualifications` `coach_qual` ON
                `coach_qual`.`coach_qualification_id` = `held_coach_qual`.`coach_qualification_id`
                AND `coach_qual`.delete_flag = 0
            WHERE 1=1
                AND `held_coach_qual`.delete_flag = 0
                AND `held_coach_qual`.user_id = ?
            ORDER BY
                `coach_qual`.display_order',
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
            'INSERT INTO `t_held_coach_qualifications` SET
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
            'UPDATE `t_held_coach_qualifications` SET
                `coach_qualification_id` = ?,
                `acquisition_date` = ?,
                `expiry_date` = ?,
                `updated_time` = ?,
                `updated_user_id` = ?,
                `delete_flag` = ?
            WHERE 1=1
                AND held_coach_qualification_id = ?',
            [
                $coachQualificationData['coachQualificationId'],
                $coachQualificationData['acquisitionDate'],
                $coachQualificationData['expiryDate'],
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $coachQualificationData['isDeleted'],
                $coachQualificationData['heldCoachQualificationId']
            ]
        );
    }

    //指導者・審判プロフィール用データ取得 20241112
    public function getHeldCoachQualificationsDataForProfile()
    {
        $result = DB::select(
            'SELECT
                thcq.`held_coach_qualification_id` AS `heldCoachQualificationId`,
                mcq.`qual_name` AS `qualName`,
                thcq.`expiry_date` AS `expiryDate`
            FROM `t_held_coach_qualifications` thcq
            INNER JOIN `m_coach_qualifications` mcq ON
                mcq.`coach_qualification_id` = thcq.`coach_qualification_id`
                AND mcq.delete_flag = 0
            WHERE 1=1
                AND thcq.delete_flag = 0
                AND thcq.user_id = ?
            ORDER BY
                mcq.display_order',
            [
                Auth::user()->user_id
            ]
        );
        return $result;
    }
}
