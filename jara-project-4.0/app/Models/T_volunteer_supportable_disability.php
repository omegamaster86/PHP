<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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
        //1つの団体IDを取得するため0番目だけを返す
        $targetTrn = null;
        if (!empty($volunteers)) {
            $targetTrn = $volunteers[0];
        }
        return $targetTrn;
    }

    public function updateVolunteerSupportableDisability($volunteersInfo)
    {
        DB::update(
            'update t_volunteer_supportable_disability set `volunteer_sprt_id`=?,`volunteer_id`=?,`dis_type_id`=?,`registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? where volunteer_id = ?',
            [
                $volunteersInfo['volunteer_sprt_id'],
                $volunteersInfo['volunteer_id'],
                $volunteersInfo['dis_type_id'],
                NOW(),
                Auth::user()->user_id,
                NOW(),
                Auth::user()->user_id,
                $volunteersInfo['delete_flag'],
                $volunteersInfo['volunteer_id'], //where条件
            ]
        );
    }

    public function insertVolunteerSupportableDisability($values)
    {
        DB::insert('INSERT INTO `t_volunteer_supportable_disability`
                    (
                        `volunteer_id`,
                        `dis_type_id`,
                        `registered_time`,
                        `registered_user_id`,
                        `updated_time`,
                        `updated_user_id`,
                        `delete_flag`
                    )
                    VALUES
                    (
                        :volunteer_id
                        ,:dis_type_id
                        ,:registered_time
                        ,:registered_user_id
                        ,:updated_time
                        ,:updated_user_id
                        ,:delete_flag
                    )',$values);
        //挿入したIDを取得
        $insertId =  DB::getPdo()->lastInsertId();
        return $insertId;
    }
}