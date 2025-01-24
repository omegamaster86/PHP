<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
        on `t_volunteer_language_proficiency`.`lang_pro` = `m_language_proficiency`.`lang_pro_id`
        where `t_volunteer_language_proficiency`.delete_flag=0 and `t_volunteer_language_proficiency`.volunteer_id = ?', [$vlntrId]);

        return $volunteers;
    }

    //ボランティア言語レベルテーブルに挿入する
    //ボランティア一括登録画面用
    public function insertVolunteerLanguageProficiency($values)
    {
        //DB::enableQueryLog();
        DB::insert(
            'insert into `t_volunteer_language_proficiency`
                    (
                        `volunteer_id`,
                        `lang_id`,
                        `lang_pro`,
                        `registered_time`,
                        `registered_user_id`,
                        `updated_time`,
                        `updated_user_id`,
                        `delete_flag`
                    )
                    VALUES(?,?,?,?,?,?,?,?)',
            [
                $values['volunteer_id'],
                $values['lang_id'],
                $values['lang_pro'],
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
            'update `t_volunteer_language_proficiency`
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
    public function getMyPageVolunteerLanguageProficiency($vlntrId)
    {
        $volunteers = DB::select('select 
        `m_languages`.`lang_id` as `langId`, 
        `m_languages`.`lang_name` as `langName`, 
        `m_language_proficiency`.`lang_pro_name` as `langProName`
        FROM `t_volunteer_language_proficiency` 
        left join `m_languages`
        on `t_volunteer_language_proficiency`.`lang_id` = `m_languages`.`lang_id`
        left join `m_language_proficiency`
        on `t_volunteer_language_proficiency`.`lang_pro` = `m_language_proficiency`.`lang_pro_id`
        where 1=1
        and `t_volunteer_language_proficiency`.delete_flag = 0 
        and `t_volunteer_language_proficiency`.volunteer_id = ?', [$vlntrId]);

        return $volunteers;
    }
}
