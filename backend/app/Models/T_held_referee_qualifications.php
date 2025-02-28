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
                `held_referee_qualification_id` AS `heldRefereeQualificationId`,
                `qual_name` AS `qualName`,
                `acquisition_date` AS `acquisitionDate`,
                `expiry_date` AS `expiryDate`,
                `referee_qual`.`referee_qualification_id` AS `refereeQualificationId`
            FROM `t_held_referee_qualifications` `held_referee_qual`
            INNER JOIN `m_referee_qualifications` `referee_qual` ON
                `referee_qual`.`referee_qualification_id` = `held_referee_qual`.`referee_qualification_id`
                AND `referee_qual`.delete_flag = 0
            WHERE 1=1
                AND `held_referee_qual`.delete_flag = 0
                AND `held_referee_qual`.user_id = ?
            ORDER BY
                `referee_qual`.display_order',
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
            'INSERT INTO `t_held_referee_qualifications` SET
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
            'UPDATE `t_held_referee_qualifications` SET 
                `referee_qualification_id` = ?,
                `acquisition_date` = ?,
                `expiry_date` = ?,
                `updated_time` = ?,
                `updated_user_id` = ?,
                `delete_flag` = ?
            WHERE 1=1
                AND `held_referee_qualification_id` = ?',
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
                thrq.`held_referee_qualification_id` AS `heldRefereeQualificationId`,
                mrq.`qual_name` AS `qualName`,
                thrq.`expiry_date` AS `expiryDate`
            FROM `t_held_referee_qualifications` thrq
            INNER JOIN `m_referee_qualifications` mrq ON
                mrq.`referee_qualification_id` = thrq.`referee_qualification_id`
                AND mrq.delete_flag = 0
            WHERE 1=1
                    AND thrq.delete_flag = 0
                    AND thrq.user_id = ?
            ORDER BY
                mrq.display_order',
            [
                Auth::user()->user_id
            ]
        );
        return $result;
    }
}
