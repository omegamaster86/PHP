<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_volunteers extends Model
{
    use HasFactory;

    public static $volunteerInfo = [
        'volunteer_id' => 1,
        'user_id' => 1,
        'volunteer_name' => "aaa",
        'residence_country' => 34,
        'residence_prefecture' => 1,
        'sex' => 2,
        'date_of_birth' => "2024/01/01",
        'dis_type_id' => 1,
        'telephone_number' => "2354523532",
        'mailaddress' => "1223442",
        'users_email_flag' => 0,
        'clothes_size' => 1,
        'registered_time' => null,
        'registered_user_id' => null,
        'updated_time' => null,
        'updated_user_id' => null,
        'delete_flag' => 0,
    ];

    public function getVolunteers($vlntrId)
    {
        $volunteers = DB::select('select `t_volunteers`.`volunteer_id`, `t_volunteers`.`user_id`, `t_volunteers`.`volunteer_name`, `t_volunteers`.`residence_country`, 
        `t_volunteers`.`residence_prefecture`, `t_volunteers`.`sex`, `t_volunteers`.`date_of_birth`, `t_volunteers`.`dis_type_id`, `t_volunteers`.`telephone_number`, 
        `t_volunteers`.`mailaddress`, `t_volunteers`.`users_email_flag`, `t_volunteers`.`clothes_size`, `t_volunteers`.`registered_time`, `t_volunteers`.`registered_user_id`, 
        `t_volunteers`.`updated_time`, `t_volunteers`.`updated_user_id`, `t_volunteers`.`delete_flag` , 
        `m_countries`.`country_name`, `m_prefectures`.`pref_name`, `m_sex`.`sex` as `master_sex_type`, `m_clothes_size`.`clothes_size` as `master_clothes_size`
        FROM `t_volunteers` 
        left join `m_countries`
        on `t_volunteers`.`residence_country` = `m_countries`.`country_id`
        left join `m_prefectures`
        on `t_volunteers`.`residence_prefecture` = `m_prefectures`.`pref_id`
        left join `m_sex`
        on `t_volunteers`.`sex` = `m_sex`.`sex_id`
        left join `m_clothes_size`
        on `t_volunteers`.`clothes_size` = `m_clothes_size`.`clothes_size_id`
        where `t_volunteers`.delete_flag=0 and `t_volunteers`.volunteer_id = ?', [$vlntrId]);
        //1つの団体IDを取得するため0番目だけを返す
        $targetTrn = null;
        if (!empty($volunteers)) {
            $targetTrn = $volunteers[0];
        }
        return $targetTrn;
    }

    public function updateVolunteers($volunteersInfo)
    {
        DB::update(
            'update t_volunteers set `volunteer_id`=?,`user_id`=?,`volunteer_name`=?,`residence_country`=?,`residence_prefecture`=?,`sex`=?,`date_of_birth`=?,`dis_type_id`=?,`telephone_number`=?,`mailaddress`=?,`users_email_flag`=?,`clothes_size`=?,`registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? where volunteer_id = ?',
            [
                $volunteersInfo['volunteer_id'],
                $volunteersInfo['user_id'],
                $volunteersInfo['volunteer_name'],
                $volunteersInfo['residence_country'],
                $volunteersInfo['residence_prefecture'],
                $volunteersInfo['sex'],
                $volunteersInfo['date_of_birth'],
                $volunteersInfo['dis_type_id'],
                $volunteersInfo['telephone_number'],
                $volunteersInfo['mailaddress'],
                $volunteersInfo['users_email_flag'],
                $volunteersInfo['clothes_size'],
                NOW(),
                Auth::user()->user_id,
                NOW(),
                Auth::user()->user_id,
                $volunteersInfo['delete_flag'],
                $volunteersInfo['volunteer_id'], //where条件
            ]
        );
    }
}
