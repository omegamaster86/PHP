<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class T_volunteer_language_proficiency extends Model
{
    use HasFactory;

    public static $volunteerInfo = [
        'lang_pro_id' => 1,
        'volunteer_id' => 1,
        'lang_id' => 1,
        'lang_pro' => 0,
        'registered_time' => null,
        'registered_user_id' => null,
        'updated_time' => null,
        'updated_user_id' => null,
        'delete_flag' => 0,
    ];

    public function getVolunteerLanguageProficiency($vlntrId)
    {
        $volunteers = DB::select('select `t_volunteer_language_proficiency`.`lang_pro_id`, `t_volunteer_language_proficiency`.`volunteer_id`, `t_volunteer_language_proficiency`.`lang_id`, 
        `t_volunteer_language_proficiency`.`lang_pro`, `t_volunteer_language_proficiency`.`registered_time`, `t_volunteer_language_proficiency`.`registered_user_id`, 
        `t_volunteer_language_proficiency`.`updated_time`, `t_volunteer_language_proficiency`.`updated_user_id`, `t_volunteer_language_proficiency`.`delete_flag`, 
        `m_languages`.`lang_name`, `m_language_proficiency`.`lang_pro_name`
        FROM `t_volunteer_language_proficiency` 
        left join `m_languages`
        on `t_volunteer_language_proficiency`.`lang_id` = `m_languages`.`lang_id`
        left join `m_language_proficiency`
        on `t_volunteer_language_proficiency`.`lang_pro_id` = `m_language_proficiency`.`lang_pro_id`
        where `t_volunteer_language_proficiency`.delete_flag=0 and `t_volunteer_language_proficiency`.volunteer_id = ?', [$vlntrId]);
        //1つの団体IDを取得するため0番目だけを返す
        $targetTrn = null;
        if (!empty($volunteers)) {
            $targetTrn = $volunteers[0];
        }
        return $targetTrn;
    }

    public function updateVolunteerLanguageProficiency($volunteersInfo)
    {
        DB::update(
            'update t_volunteer_language_proficiency set `lang_pro_id`=?,`volunteer_id`=?,`lang_id`=?,`lang_pro`=?,`registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? 
            where volunteer_id = ?',
            [
                $volunteersInfo['lang_pro_id'],
                $volunteersInfo['volunteer_id'],
                $volunteersInfo['lang_id'],
                $volunteersInfo['lang_pro'],
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
