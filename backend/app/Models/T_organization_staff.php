<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class T_organization_staff extends Model
{
    use HasFactory;

    //テーブルがt_organization_staffと結びつくように指定する
    protected $table = 't_organization_staff';
    protected $primaryKey = 'org_staff_id';

    public function getOrganizationStaffFromOrgId($orgId)
    {
        $orgStaffs = DB::select(
            'select
                                `org_id`
                                ,`user_id`
                                ,`user_name`
                                ,`jspo_id`
                                ,`coach_qual_name` as `coachQualificationNames`
                                ,`referee_qual_name` as `refereeQualificationNames`
                                ,case
                                    when instr(`staff_type_array`,"1") > 0 then 1
                                    else 0
                                    end as `is_director`
                                ,case
                                    when instr(`staff_type_array`,"2") > 0 then 1
                                    else 0
                                    end as `is_head`
                                ,case
                                    when instr(`staff_type_array`,"3") > 0 then 1
                                    else 0
                                    end as `is_coach`
                                ,case
                                    when instr(`staff_type_array`,"4") > 0 then 1
                                    else 0
                                    end as `is_manager`
                                ,case
                                    when instr(`staff_type_array`,"5") > 0 then 1
                                    else 0
                                    end as `is_acting_director`
                                ,`enable`
                                from
                                (
                                    SELECT 
                                    `staff`.`org_id`
                                    ,`user`.`user_id`
                                    ,`user`.`jspo_id`
                                    ,case
                                        when `user`.`user_name` is null then "該当ユーザー無し"
                                        else `user`.`user_name`
                                        end as `user_name`
                                    ,GROUP_CONCAT(distinct(`coach_qual`.`qual_name`) order by `coach_qual`.`display_order`) AS "coach_qual_name"
                                    ,GROUP_CONCAT(distinct(`referee_qual`.`qual_name`) order by `referee_qual`.`display_order`) AS "referee_qual_name"
                                    ,GROUP_CONCAT(`staff_type_id` order by `staff_type_id`) AS "staff_type_array"
                                    ,case
                                        when `user`.`user_id` is null then false
                                        when `user`.`temp_password_flag` = 1 then false
                                        when `user`.`delete_flag` = 1 then false
                                        else true
                                        end as `enable`
                                    from `t_organization_staff` `staff`
                                    left join `t_users` `user` on
                                        `staff`.`user_id` = `user`.`user_id`
                                    left join `t_held_coach_qualifications` `held_coach_qual` on
                                        `user`.`user_id` = `held_coach_qual`.`user_id`
                                        and `held_coach_qual`.`delete_flag` = 0
                                        and (
                                            `held_coach_qual`.`expiry_date` IS NULL
                                            OR `held_coach_qual`.`expiry_date` >= CURDATE()
                                        )
                                    left join `m_coach_qualifications` `coach_qual` on
                                        `held_coach_qual`.`coach_qualification_id` = `coach_qual`.`coach_qualification_id`
                                        and `coach_qual`.`delete_flag` = 0
                                    left join `t_held_referee_qualifications` `held_referee_qual`
                                        on `user`.`user_id` = `held_referee_qual`.`user_id`
                                        and `held_referee_qual`.`delete_flag` = 0
                                        and (
                                            `held_referee_qual`.`expiry_date` IS NULL
                                            OR `held_referee_qual`.`expiry_date` >= CURDATE()
                                        )
                                    left join `m_referee_qualifications` `referee_qual` on
                                        `held_referee_qual`.`referee_qualification_id` = `referee_qual`.`referee_qualification_id`
                                        and `referee_qual`.`delete_flag` = 0
                                    where 
                                        `staff`.`delete_flag` = 0
                                        and `user`.`delete_flag` = 0
                                        and `staff`.`org_id` = ?
                                    group by `staff`.`org_id`, `staff`.`user_id`,`user`.`user_name`,`user`.`jspo_id`
                                ) as `staff`',
            [$orgId]
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
        DB::update($sqlString, ["org_id" => $values]);
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
    public function getIsOrgManager($tourn_id, $org_id, $user_id)
    {
        $is_org_manager = DB::select(
            "select 
                                        case count(*)
                                            when 0 then 0
                                            else 1
                                            end as 'is_org_manager'
                                        from `t_organization_staff` staff
                                        join `t_tournaments` tour
                                        on staff.org_id = tour.sponsor_org_id
                                        where 1=1
                                        and tour.delete_flag = 0
                                        and staff.delete_flag = 0 
                                        and tourn_id = :tourn_id
                                        and staff.org_id = :org_id
                                        and user_id = :user_id",
            [
                "tourn_id" => $tourn_id,
                "org_id" => $org_id,
                "user_id" => $user_id
            ]
        );
        //主催団体管理者であれば1、そうでなければ0を返す
        return $is_org_manager;
    }
}
