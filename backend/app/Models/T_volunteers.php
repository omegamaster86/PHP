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
        $volunteers = DB::select(
            'SELECT
                `t_volunteers`.`volunteer_id`,
                `t_volunteers`.`user_id`,
                `t_volunteers`.`volunteer_name`,
                `t_volunteers`.`residence_country`,                 
                `m_countries`.`country_code` AS residence_country_code,
                `t_volunteers`.`residence_prefecture`,
                `m_prefectures`.`pref_code_jis` AS residence_prefecture_code_jis,
                `t_volunteers`.`sex`,
                `t_volunteers`.`date_of_birth`,
                `t_volunteers`.`telephone_number`, 
                `t_volunteers`.`mailaddress`,
                `t_volunteers`.`users_email_flag`,
                `t_volunteers`.`clothes_size`,
                `t_volunteers`.`registered_time`,
                `t_volunteers`.`registered_user_id`, 
                `t_volunteers`.`updated_time`,
                `t_volunteers`.`updated_user_id`,
                `t_volunteers`.`delete_flag`, 
                `m_countries`.`country_name`,
                `m_prefectures`.`pref_name`,
                `m_sex`.`sex` AS `master_sex_type`,
                `m_clothes_size`.`clothes_size` AS `master_clothes_size`
            FROM `t_volunteers` 
            LEFT OUTER JOIN `m_countries` on
                `m_countries`.`country_id` = `t_volunteers`.`residence_country`
                AND `m_countries`.delete_flag = 0
            LEFT OUTER JOIN `m_prefectures` on
                `m_prefectures`.`pref_id` = `t_volunteers`.`residence_prefecture`
                AND `m_prefectures`.delete_flag = 0
            LEFT OUTER JOIN `m_sex` on
                `m_sex`.`sex_id` = `t_volunteers`.`sex`
                AND `m_sex`.delete_flag = 0
            LEFT OUTER JOIN `m_clothes_size` on
                `m_clothes_size`.`clothes_size_id` = `t_volunteers`.`clothes_size`
                AND `m_clothes_size`.delete_flag = 0
            WHERE
                `t_volunteers`.delete_flag = 0
                AND `t_volunteers`.volunteer_id = ?',
            [$volunteer_id]
        );
        //1つの団体IDを取得するため0番目だけを返す
        $targetTrn = null;
        if (!empty($volunteers)) {
            $targetTrn = $volunteers[0];
        }
        return $targetTrn;
    }

    //検索条件を以て、ボランティア情報を取得する
    public function getVolunteersWithSearchCondition(
        $supportableDisabilityCondition,
        $languageCondition,
        $condition,
        $langJoinType,
        $SupportableDisabilityJoinType,
        $conditionValue
    ) {
        $sqlString =
            'SELECT DISTINCT
                `t_volunteers`.`volunteer_id`
                ,`t_volunteers`.`volunteer_name`
                ,`t_volunteers`.`date_of_birth`
                ,`t_volunteers`.`clothes_size`
                ,`m_countries`.`country_name` AS residence_country
                ,`m_countries`.`country_code` AS residence_country_code
                ,`m_prefectures`.`pref_name` AS residence_prefecture
                ,`m_prefectures`.`pref_code_jis` AS residence_prefecture_code_jis
                ,CASE
                    WHEN `t_volunteers`.`residence_country` = 112 then `m_prefectures`.`pref_name`
                    else `m_countries`.`country_name`
                END AS residence
                ,`m_sex`.`sex`
                ,TIMESTAMPDIFF(YEAR, `t_volunteers`.`date_of_birth`, CURDATE()) AS age
                ,CASE
                    WHEN instr(`dis_type_id_array`,"1") > 0 THEN 1
                    ELSE 0
                    END AS is_pr1
                ,CASE
                    WHEN instr(`dis_type_id_array`,"2") > 0 THEN 1
                    ELSE 0
                    END AS is_pr2
                ,CASE
                    WHEN instr(`dis_type_id_array`,"3") > 0 THEN 1
                    ELSE 0
                    END AS is_pr3
                ,v_lang.LANGUAGE_1
                ,v_lang.LANGUAGE_2
                ,v_lang.LANGUAGE_3
                ,t_volunteers.telephone_number
                ,CASE
                    WHEN t_volunteers.users_email_flag = 1 then t_users.mailaddress
                    ELSE t_volunteers.mailaddress
                    END AS mailaddress
            FROM t_volunteers
            #SupportableDisabilityJoinType#
            (
                SELECT vol.volunteer_id
                    ,GROUP_CONCAT(v_sup.dis_type_id) AS dis_type_id_array
                FROM t_volunteers vol
                LEFT join t_volunteer_supportable_disability v_sup ON
                    v_sup.volunteer_id = vol.volunteer_id
                    AND v_sup.delete_flag = 0
                WHERE
                    vol.delete_flag = 0
                GROUP by vol.volunteer_id
                #SupportableDisabilityCondition#
            ) v_type ON
                v_type.volunteer_id = t_volunteers.volunteer_id
            INNER JOIN m_countries ON
                m_countries.country_id = t_volunteers.residence_country
                AND m_countries.delete_flag = 0
            LEFT OUTER JOIN m_prefectures ON
                m_prefectures.pref_id = t_volunteers.residence_prefecture
                AND m_prefectures.delete_flag = 0
            INNER JOIN m_sex ON
                m_sex.sex_id = t_volunteers.sex
                AND m_sex.delete_flag = 0
            INNER JOIN t_users ON
                t_users.user_id = t_volunteers.user_id
                AND t_users.delete_flag = 0                    
            #langJoinType#
            (
                SELECT
                    volunteer_id
                    ,group_concat(Nullif(LANGUAGE_1,"")) AS `LANGUAGE_1`
                    ,group_concat(Nullif(LANGUAGE_2,"")) AS `LANGUAGE_2`
                    ,group_concat(Nullif(LANGUAGE_3,"")) AS `LANGUAGE_3`
                FROM (
                    SELECT
                        volunteer_id
                        ,CASE `lang_index`
                            WHEN 1 THEN `lang_name`
                            ELSE NULL END AS LANGUAGE_1
                        ,CASE `lang_index`
                            WHEN 2 THEN `lang_name`
                            ELSE NULL END AS LANGUAGE_2
                        ,CASE `lang_index`
                            WHEN 3 THEN `lang_name`
                            ELSE NULL END AS LANGUAGE_3
                    FROM (
                        SELECT
                            vol.`volunteer_id`
                            ,vpro.`lang_id`
                            ,lang.`lang_name`
                            ,ROW_NUMBER() OVER (PARTITION BY vol.`volunteer_id` ORDER BY vpro.`lang_id`) AS `lang_index`
                        FROM t_volunteers vol
                        INNER JOIN t_volunteer_language_proficiency vpro ON
                            vpro.volunteer_id = vol.volunteer_id
                            AND vpro.delete_flag = 0
                        INNER JOIN m_languages lang ON
                            lang.lang_id = vpro.lang_id
                            AND lang.delete_flag = 0
                        WHERE 1=1
                            AND vol.delete_flag = 0
                        #languageCondition#
                    ) v_lang
                ) v_lang
                GROUP BY volunteer_id
            ) v_lang ON
                `v_lang`.`volunteer_id` = `t_volunteers`.`volunteer_id`
            INNER JOIN t_volunteer_availables ON
                t_volunteer_availables.volunteer_id = t_volunteers.volunteer_id
                AND t_volunteer_availables.delete_flag = 0
            WHERE 1=1
                AND t_volunteers.delete_flag = 0
                #Condition#
            ';
        $sqlString = str_replace("#SupportableDisabilityCondition#", $supportableDisabilityCondition, $sqlString);
        $sqlString = str_replace("#languageCondition#", $languageCondition, $sqlString);
        $sqlString = str_replace("#Condition#", $condition, $sqlString);
        $sqlString = str_replace("#langJoinType#", $langJoinType, $sqlString);
        $sqlString = str_replace("#SupportableDisabilityJoinType#", $SupportableDisabilityJoinType, $sqlString);
        $volunteers = DB::select($sqlString, $conditionValue);
        return $volunteers;
    }

    //ボランティアの一覧を取得
    public function getVolunteer()
    {
        $volunteer = DB::select(
            'select
                                `volunteer_id`,
                                `user_id`,
                                `volunteer_name`
                                from t_volunteers
                                where delete_flag = ?',
            [0]
        );

        return $volunteer;
    }

    //ボランティアテーブルに挿入する
    //文字を置き換えて複数の挿入を可能とする
    //$replaceCondition：置き換え後の文字列
    //$values：挿入する値
    public function insertVolunteer($values)
    {
        //DB::enableQueryLog();
        DB::insert(
            "insert into `t_volunteers`
                    (
                        `user_id`,
                        `volunteer_name`,
                        `residence_country`,
                        `residence_prefecture`,
                        `sex`,
                        `date_of_birth`,
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
                    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
                $values["user_id"],
                $values["volunteer_name"],
                $values["residence_country"],
                $values["residence_prefecture"],
                $values["sex"],
                $values["date_of_birth"],
                $values["telephone_number"],
                $values["mailaddress"],
                $values["users_email_flag"],
                $values["clothes_size"],
                $values["registered_time"],
                $values["registered_user_id"],
                $values["updated_time"],
                $values["updated_user_id"],
                $values["delete_flag"]
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
            'update `t_volunteers`
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

    //マイページ ボランティア情報用 ユーザIDに紐づいたボランティア情報を取得 20241017
    public function getVolunteerInfoFromUserId($user_id)
    {
        $volunteers = DB::select(
            'SELECT
                `t_volunteers`.`volunteer_id`, 
                `t_volunteers`.`volunteer_name` AS `volunteerName`,
                `t_volunteers`.`date_of_birth` AS `dateOfBirth`,
                `t_volunteers`.`telephone_number` AS `telephoneNumber`, 
                `t_volunteers`.`mailaddress`,  
                `m_countries`.`country_name` AS `countryName`,
                `m_prefectures`.`pref_name` AS `prefName`, 
                `m_sex`.`sex`, 
                `m_clothes_size`.`clothes_size` AS `clothesSize`,
                `t_volunteer_availables`.`day_of_week` AS `dayOfWeekStr`,
                `t_volunteer_availables`.`time_zone` AS `timeZoneStr`
            FROM `t_volunteers` 
            INNER JOIN `t_volunteer_availables` ON
                `t_volunteer_availables`.`volunteer_id` = `t_volunteers`.`volunteer_id`
                AND `t_volunteer_availables`.delete_flag = 0
            INNER JOIN `m_countries` ON
                `m_countries`.`country_id` = `t_volunteers`.`residence_country`
                AND `m_countries`.delete_flag = 0 
            LEFT OUTER JOIN `m_prefectures` ON
                `m_prefectures`.`pref_id` = `t_volunteers`.`residence_prefecture`
                AND `m_prefectures`.delete_flag = 0
            INNER JOIN `m_sex` ON
                `m_sex`.`sex_id` = `t_volunteers`.`sex`
                AND `m_sex`.delete_flag = 0 
            INNER JOIN `m_clothes_size` ON
                `m_clothes_size`.`clothes_size_id` = `t_volunteers`.`clothes_size`
                AND `m_clothes_size`.delete_flag = 0 
            WHERE 1=1
                AND `t_volunteers`.delete_flag = 0 
                AND `t_volunteers`.user_id = ?',
            [$user_id]
        );

        return $volunteers;
    }
}
