<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class T_volunteer_supportable_disability extends Model
{
    use HasFactory;

    public static $volunteerInfo = [
        'volunteer_sprt_id' => 1,
        'volunteer_id' => 1,
        'dis_type_id' => 1,
        'registered_time' => null,
        'registered_user_id' => null,
        'updated_time' => null,
        'updated_user_id' => null,
        'delete_flag' => 0,
    ];

    public function getVolunteerSupportableDisability($vlntrId)
    {
        $volunteers = DB::select('select `t_volunteer_supportable_disability`.`volunteer_sprt_id`, `t_volunteer_supportable_disability`.`volunteer_id`, 
        `t_volunteer_supportable_disability`.`dis_type_id`, `t_volunteer_supportable_disability`.`registered_time`, `t_volunteer_supportable_disability`.`registered_user_id`, 
        `t_volunteer_supportable_disability`.`updated_time`, `t_volunteer_supportable_disability`.`updated_user_id`, `t_volunteer_supportable_disability`.`delete_flag`, 
        `m_disability_type`.`dis_type_name`
        FROM `t_volunteer_supportable_disability` 
        left join `m_disability_type`
        on `t_volunteer_supportable_disability`.`dis_type_id` = `m_disability_type`.`dis_type_id`
        where `t_volunteer_supportable_disability`.delete_flag=0 and `t_volunteer_supportable_disability`.volunteer_id = ?', [$vlntrId]);

        return $volunteers;
    }

    public function insertVolunteerSupportableDisability($values)
    {
        //DB::enableQueryLog();
        DB::insert(
            'insert into `t_volunteer_supportable_disability`
                    (
                        `volunteer_id`,
                        `dis_type_id`,
                        `registered_time`,
                        `registered_user_id`,
                        `updated_time`,
                        `updated_user_id`,
                        `delete_flag`
                    )
                    VALUES(?,?,?,?,?,?,?)',
            [
                $values['volunteer_id'],
                $values['dis_type_id'],
                $values['registered_time'],
                $values['registered_user_id'],
                $values['updated_time'],
                $values['updated_user_id'],
                $values['delete_flag']
            ]
        );
        //挿入したIDを取得
        $insertId =  DB::getPdo()->lastInsertId();
        return $insertId;
    }

    //ボランティア削除
    //delete_flagを1にする
    public function updateDeleteFlag($volunteer_id)
    {
        DB::update(
            'update `t_volunteer_supportable_disability`
                    set `delete_flag` = 1
                    ,updated_time = ?
                    ,updated_user_id = ?
                    where 1=1
                    and `delete_flag` = 0
                    and `volunteer_id` = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $volunteer_id
            ]
        );
    }

    //マイページ ボランティア情報 20241017
    public function getMyPageVolunteerSupportableDisability($vlntrId)
    {
        $volunteers = DB::select(
            'SELECT 
                `m_disability_type`.`dis_type_id` AS disTypeId,
                `m_disability_type`.`dis_type_name` AS disTypeName,
                CASE
                    WHEN `t_volunteer_supportable_disability`.`dis_type_id` IS NULL THEN 0
                    ELSE 1
                END AS `isEnable`
            FROM `m_disability_type`
                LEFT JOIN `t_volunteer_supportable_disability`
                ON `m_disability_type`.`dis_type_id` = `t_volunteer_supportable_disability`.`dis_type_id`
                AND `t_volunteer_supportable_disability`.delete_flag = 0
                AND `t_volunteer_supportable_disability`.volunteer_id = ?
            ORDER BY `m_disability_type`.`display_order` ASC
            ',
            [$vlntrId]
        );


        return $volunteers;
    }
}
