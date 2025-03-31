<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class T_organization_staff extends Model
{
    use HasFactory;

    //テーブルがt_organization_staffと結びつくように指定する
    protected $table = 't_organization_staff';
    protected $primaryKey = 'org_staff_id';

    public function getOrganizationStaffFromOrgId($orgId, $canShowQualification)
    {
        $orgStaffs = DB::select(
            'SELECT
                `org_id`
                ,`user_id`
                ,`user_name`
                , CASE
                    WHEN ? THEN `jspo_number`
                    ELSE NULL
                    END AS `jspo_number`
                , CASE
                    WHEN ? THEN `coach_qual_name`
                    ELSE ""
                    END AS `coachQualificationNames`
                , CASE
                    WHEN ? THEN `referee_qual_name`
                    ELSE ""
                    END AS `refereeQualificationNames`
                , CASE
                    WHEN INSTR(`staff_type_array`,"1") > 0 THEN 1
                    ELSE 0
                    END AS `is_director`
                , CASE
                    WHEN INSTR(`staff_type_array`,"2") > 0 THEN 1
                    ELSE 0
                    END AS `is_head`
                , CASE
                    WHEN INSTR(`staff_type_array`,"3") > 0 THEN 1
                    ELSE 0
                    END as `is_coach`
                , CASE
                    WHEN INSTR(`staff_type_array`,"4") > 0 THEN 1
                    ELSE 0
                    END AS `is_manager`
                , CASE
                    WHEN INSTR(`staff_type_array`,"5") > 0 THEN 1
                    ELSE 0
                    END AS `is_acting_director`
                ,`enable`
            FROM
            (
                SELECT 
                `staff`.`org_id`
                ,`user`.`user_id`
                ,`user`.`jspo_number`
                ,CASE
                    WHEN `user`.`user_name` IS NULL THEN "該当ユーザー無し"
                    ELSE `user`.`user_name`
                    END AS `user_name`
                ,GROUP_CONCAT(DISTINCT(`coach_qual`.`qual_name`) ORDER BY `coach_qual`.`display_order`) AS "coach_qual_name"
                ,GROUP_CONCAT(DISTINCT(`referee_qual`.`qual_name`) ORDER BY `referee_qual`.`display_order`) AS "referee_qual_name"
                ,GROUP_CONCAT(`staff_type_id` ORDER BY `staff_type_id`) AS "staff_type_array"
                ,CASE
                    WHEN `user`.`user_id` IS NULL THEN false
                    WHEN `user`.`temp_password_flag` = 1 THEN false
                    WHEN `user`.`delete_flag` = 1 THEN false
                    ELSE true
                    END AS `enable`
                FROM `t_organization_staff` `staff`
                INNER JOIN `t_users` `user` ON
                    `user`.`user_id` = `staff`.`user_id`
                    AND `user`.`delete_flag` = 0
                LEFT JOIN `t_held_coach_qualifications` `held_coach_qual` ON
                    `held_coach_qual`.`user_id` = `user`.`user_id`
                    AND `held_coach_qual`.`delete_flag` = 0
                    AND (
                        `held_coach_qual`.`expiry_date` IS NULL
                        OR `held_coach_qual`.`expiry_date` >= CURDATE()
                    )
                LEFT JOIN `m_coach_qualifications` `coach_qual` ON
                    `coach_qual`.`coach_qualification_id` = `held_coach_qual`.`coach_qualification_id`
                    AND `coach_qual`.`delete_flag` = 0
                LEFT JOIN `t_held_referee_qualifications` `held_referee_qual` ON
                    `held_referee_qual`.`user_id` = `user`.`user_id`
                    AND `held_referee_qual`.`delete_flag` = 0
                    AND (
                        `held_referee_qual`.`expiry_date` IS NULL
                        OR `held_referee_qual`.`expiry_date` >= CURDATE()
                    )
                LEFT JOIN `m_referee_qualifications` `referee_qual` ON
                    `referee_qual`.`referee_qualification_id` = `held_referee_qual`.`referee_qualification_id`
                    AND `referee_qual`.`delete_flag` = 0
                WHERE 
                    `staff`.`delete_flag` = 0
                    AND `staff`.`org_id` = ?
                GROUP BY
                    `staff`.`org_id`,
                    `staff`.`user_id`,
                    `user`.`user_name`,
                    `user`.`jspo_number`
            ) AS `staff`',
            [
                $canShowQualification,
                $canShowQualification,
                $canShowQualification,
                $orgId
            ]
        );
        return $orgStaffs;
    }

    //団体所属スタッフテーブルの削除フラグを更新する    
    public function updateDeleteFlagInOrganizationStaff($condition, $values)
    {
        //Log::debug('updateDeleteFlagInOrganizationStaff start.');        
        $sqlString = 'with target_ids as
                        (
                            SELECT `org_staff_id`
                            FROM `t_organization_staff`
                            where 1=1
                            and
                            (
                                #ConditionReplace#
                            )
                        )
                        update `t_organization_staff`
                        set `delete_flag` = 1
                        where 1=1
                        and `delete_flag` = 0
                        and `org_id` = :org_id
                        and `org_staff_id` not in
                        (
                            SELECT `org_staff_id`
                            FROM target_ids
                        )';
        $sqlString = str_replace('#ConditionReplace#', $condition, $sqlString);
        DB::update($sqlString, $values);
        //Log::debug('updateDeleteFlagInOrganizationStaff end.');
    }

    //団体所属スタッフテーブルに挿入する
    public function insertOrganizationStaff($replace_str, $org_id)
    {
        //Log::debug('insertOrganizationStaff start.');
        $sqlString = "insert into `t_organization_staff`
                    (
                        `org_id`,
                        `user_id`,
                        `staff_type_id`,
                        `registered_time`,
                        `registered_user_id`,
                        `updated_time`,
                        `updated_user_id`,
                        `delete_flag`
                    )
                    select *
                    FROM
                    (
                        SELECT
                        #ValuesReplace#
                    ) `value_table`
                    where 1=1
                    and not EXISTS
                    (
                        select *
                        from `t_organization_staff`
                        where 1=1
                        and `delete_flag` = 0
                        and `org_id` = ?
                        and `t_organization_staff`.`user_id` = `value_table`.`user_id`
                        and `t_organization_staff`.`staff_type_id` = `value_table`.`staff_type_id`
                    )";
        $sqlString = str_replace("#ValuesReplace#", $replace_str, $sqlString);
        // Log::debug('**********insertOrganizationStaff**********');
        // Log::debug($sqlString);

        DB::insert($sqlString, [$org_id]);
        $insertId = DB::getPdo()->lastInsertId(); //挿入したIDを取得

        //Log::debug('insertOrganizationStaff end.');
        return $insertId; //Insertを実行して、InsertしたレコードのID（主キー）を返す
    }

    //団体削除による団体所属スタッフの削除
    //org_idをキーとして、該当所属スタッフのdelete_flagを1にする
    public function updateDeleteFlagByOrganizationDeletion($org_id)
    {
        //Log::debug("updateDeleteFlagByOrganizationDeletion start.");
        DB::update(
            'update `t_organization_staff`
                    set `delete_flag` = 1
                    ,`updated_time` = ?
                    ,`updated_user_id` = ?
                    where 1=1
                    and `org_id` = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $org_id
            ]
        );
        //Log::debug("updateDeleteFlagByOrganizationDeletion end.");
    }

    //団体削除による団体所属スタッフの削除
    //org_idをキーとして、該当所属スタッフのdelete_flagを1にする
    public function updateDeleteFlagByUserDeletion($user_id, $org_id)
    {
        //Log::debug("updateDeleteFlagByUserDeletion start.");
        DB::update(
            'update `t_organization_staff`
                    set `delete_flag` = 1
                    ,`updated_time` = ?
                    ,`updated_user_id` = ?
                    where 1=1
                    and `user_id` = ?
                    and `org_id` = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $user_id,
                $org_id
            ]
        );
        //Log::debug("updateDeleteFlagByUserDeletion end.");
    }

    //ユーザーが大会の主催団体に所属しているスタッフかを判定する
    public function getIsOrgManager($tournId, $userId)
    {
        $isOrgManager = DB::selectOne(
            "SELECT
                CASE COUNT(*)
                    WHEN 0 THEN 0
                    ELSE 1
                END AS 'isOrgManager'
                FROM `t_organization_staff` staff
                INNER JOIN `t_tournaments` tourn
                ON staff.org_id = tourn.sponsor_org_id
                WHERE 1=1
                AND tourn.delete_flag = 0
                AND staff.delete_flag = 0 
                AND tourn.tourn_id = :tourn_id
                AND staff.user_id = :user_id",
            [
                "tourn_id" => $tournId,
                "user_id" => $userId
            ]
        );
        //主催団体管理者であれば1、そうでなければ0を返す
        return $isOrgManager;
    }
}
