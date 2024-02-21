<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

    public function getVolunteers($volunteer_id)
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
        where `t_volunteers`.delete_flag=0 and `t_volunteers`.volunteer_id = ?', [$volunteer_id]);
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

    //検索条件を以て、ボランティア情報を取得する
    public function getVolunteersWithSearchCondition($supportableDisabilityCondition,
                                                        $languageCondition,
                                                        $condition,
                                                        $langJoinType,
                                                        $SupportableDisabilityJoinType,
                                                        $conditionValue)
    {
        $sqlString = 'select distinct
                    `t_volunteers`.`volunteer_id`
                    ,`t_volunteers`.`volunteer_name`
                    ,`t_volunteers`.`date_of_birth`
                    ,`t_volunteers`.`clothes_size`
                    ,`m_countries`.`country_name` as residence_country
                    ,`m_prefectures`.`pref_name` as residence_prefecture
                    ,CASE
                        WHEN `t_volunteers`.`residence_country` = 112 then `m_prefectures`.`pref_name`
                        else `m_countries`.`country_name`
                        end as residence
                    ,`m_sex`.`sex`
                    ,TIMESTAMPDIFF(YEAR, `t_volunteers`.`date_of_birth`, CURDATE()) AS age
                    ,CASE
                        WHEN instr(`dis_type_id_array`,"1") > 0 THEN 1
                        ELSE 0
                        END as is_pr1
                    ,CASE
                        WHEN instr(`dis_type_id_array`,"2") > 0 THEN 1
                        ELSE 0
                        END as is_pr2
                    ,CASE
                        WHEN instr(`dis_type_id_array`,"3") > 0 THEN 1
                        ELSE 0
                        END as is_pr3
                    ,v_lang.LANGUAGE_1
                    ,v_lang.LANGUAGE_2
                    ,v_lang.LANGUAGE_3
                    ,t_volunteers.telephone_number
                    ,CASE
                        WHEN t_volunteers.users_email_flag = 1 then t_users.mailaddress
                        ELSE t_volunteers.mailaddress
                        end as mailaddress
                    FROM t_volunteers
                    #SupportableDisabilityJoinType#
                    (
                        select vol.volunteer_id
                        ,GROUP_CONCAT(v_sup.dis_type_id) as dis_type_id_array
                        from t_volunteers vol
                        left join t_volunteer_supportable_disability v_sup
                        on vol.volunteer_id = v_sup.volunteer_id
                        where vol.delete_flag = 0
                        and v_sup.delete_flag = 0
                        group by vol.volunteer_id
                        #SupportableDisabilityCondition#
                    )v_type
                    on t_volunteers.volunteer_id = v_type.volunteer_id
                    left join m_countries
                    on t_volunteers.residence_country = m_countries.country_id
                    left join m_prefectures
                    on t_volunteers.residence_prefecture = m_prefectures.pref_id
                    left join m_sex
                    on t_volunteers.sex = m_sex.sex_id
                    left join t_users
                    on t_volunteers.user_id = t_users.user_id
                    #langJoinType#
                    (
                        select volunteer_id
                        ,group_concat(Nullif(LANGUAGE_1,"")) as `LANGUAGE_1`
                        ,group_concat(Nullif(LANGUAGE_2,"")) as `LANGUAGE_2`
                        ,group_concat(Nullif(LANGUAGE_3,"")) as `LANGUAGE_3`
                        FROM
                        (
                            select volunteer_id
                            ,CASE `lang_index`
                                WHEN 1 THEN `lang_name`
                                ELSE NULL END AS LANGUAGE_1
                            ,CASE `lang_index`
                                WHEN 2 THEN `lang_name`
                                ELSE NULL END AS LANGUAGE_2
                            ,CASE `lang_index`
                                WHEN 3 THEN `lang_name`
                                ELSE NULL END AS LANGUAGE_3
                            from
                            (
                                select vol.`volunteer_id`
                                ,vpro.`lang_id`
                                ,lang.`lang_name`
                                ,ROW_NUMBER() OVER (PARTITION BY vol.`volunteer_id` ORDER BY vpro.`lang_id`) as `lang_index`
                                from t_volunteers vol
                                left join t_volunteer_language_proficiency vpro
                                on vol.volunteer_id = vpro.volunteer_id
                                left join m_languages lang
                                on vpro.lang_id = lang.lang_id
                                where 1=1
                                and vol.delete_flag = 0
                                and vpro.delete_flag = 0
                                and lang.delete_flag = 0
                                #languageCondition#
                            )v_lang
                        )v_lang
                        group by volunteer_id
                    )v_lang
                    on `t_volunteers`.`volunteer_id` = `v_lang`.`volunteer_id`
                    left join t_volunteer_availables
                    on t_volunteers.volunteer_id = t_volunteer_availables.volunteer_id
                    left join t_volunteer_histories
                    on t_volunteers.volunteer_id = t_volunteer_histories.volunteer_id
                    left join t_tournaments
                    on t_volunteer_histories.`tourn_id` = t_tournaments.`tourn_id`
                    where 1=1
                    and t_volunteers.delete_flag = 0
                    and (m_countries.delete_flag = 0 or m_countries.delete_flag is null)
                    and (m_prefectures.delete_flag = 0 or m_prefectures.delete_flag is null)
                    and (m_sex.delete_flag = 0 or m_sex.delete_flag is null)
                    and t_users.delete_flag = 0                    
                    and (t_volunteer_availables.delete_flag = 0 or t_volunteer_availables.delete_flag is null)
                    and (t_volunteer_histories.delete_flag = 0 or t_volunteer_histories.delete_flag is null)
                    and (t_tournaments.delete_flag = 0 or t_tournaments.delete_flag is null)
                    #Condition#
                    ';
        $sqlString = str_replace("#SupportableDisabilityCondition#",$supportableDisabilityCondition,$sqlString);
        $sqlString = str_replace("#languageCondition#",$languageCondition,$sqlString);
        $sqlString = str_replace("#Condition#",$condition,$sqlString);
        $sqlString = str_replace("#langJoinType#",$langJoinType,$sqlString);
        $sqlString = str_replace("#SupportableDisabilityJoinType#",$SupportableDisabilityJoinType,$sqlString);
        Log::debug($sqlString);
        $volunteers = DB::select($sqlString,$conditionValue);
        return $volunteers;
    }

    //ボランティアの一覧を取得
    public function getVolunteer()
    {
        $volunteer = DB::select('select
                                `volunteer_id`,
                                `user_id`,
                                `volunteer_name`
                                from t_volunteers
                                where delete_flag = ?'
                                ,[0]);
        
        return $volunteer;
    }

    //ボランティアテーブルに挿入する
    //文字を置き換えて複数の挿入を可能とする
    //$replaceCondition：置き換え後の文字列
    //$values：挿入する値
    public function insertVolunteer($values)
    {
        DB::insert("INSERT INTO `t_volunteers`
                    (
                        `user_id`,
                        `volunteer_name`,
                        `residence_country`,
                        `residence_prefecture`,
                        `sex`,
                        `date_of_birth`,
                        `dis_type_id`,
                        `telephone_number`,
                        `mailaddress`,
                        `users_email_flag`,
                        `clothes_size`,
                        `registered_time`,
                        `registered_user_id`,
                        `updated_time`,
                        `updated_user_id`,
                        `delete_flag`
                    )
                    VALUES
                    (
                        :user_id
                        ,:volunteer_name
                        ,:residence_country
                        ,:residence_prefecture
                        ,:sex
                        ,:date_of_birth
                        ,:dis_type_id
                        ,:telephone_number
                        ,:mailaddress
                        ,:users_email_flag
                        ,:clothes_size
                        ,:registered_time
                        ,:register_user_id
                        ,:updated_time
                        ,updated_user_id
                        ,:delete_flag
                    )",$values);
        //挿入したIDを取得
        $insertId =  DB::getPdo()->lastInsertId();
        return $insertId;
    }
}