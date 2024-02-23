<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class T_organization_staff extends Model
{
    use HasFactory;

    //テーブルがt_organization_staffと結びつくように指定する
    protected $table = 't_organization_staff';
    protected $primaryKey = 'org_staff_id';

    public function getOrganizationStaffFromOrgId($orgId)
    {
        $orgStaffs = DB::select('select
                                `org_id`
                                ,`user_id`
                                ,`user_name`
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
                                from
                                (
                                    SELECT 
                                    `staff`.`org_id`
                                    ,`staff`.`user_id`
                                    ,`user`.`user_name`
                                    ,GROUP_CONCAT(`staff_type_id` order by `staff_type_id`)	AS "staff_type_array"
                                    from `t_organization_staff` `staff`
                                    join `t_users` `user`
                                    on `staff`.`user_id` = `user`.`user_id`
                                    where `staff`.`delete_flag` = 0
                                    and `user`.`delete_flag` = 0
                                    and `staff`.`org_id` = ?
                                    group by `staff`.`org_id`, `staff`.`user_id`,`user`.`user_name`
                                ) as `staff`'
                                ,[$orgId]
                            );
        return $orgStaffs;
    }

    //団体所属スタッフテーブルの削除フラグを更新する    
    public function updateDeleteFlagInOrganizationStaff($condition,$values)
    {
        $sqlString = 'update `t_organization_staff`
                        set `delete_flag` = 1
                        where 1=1
                        and `delete_flag` = 0
                        and `org_id` = :org_id
                        and `org_staff_id` not in
                        (
                            SELECT `org_staff_id`
                            FROM `t_organization_staff`
                            where 1=1
                            and
                            (
                                #ConditionReplace#
                            )
                        )';
        $sqlString = str_replace('#ConditionReplace#',$condition,$sqlString);
        DB::update($sqlString,$values);
    }

    //団体所属スタッフテーブルに挿入する
    public function insertOrganizationStaff($replace_str,$values)
    {
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
                    ) as `value_table`
                    where 1=1
                    and not EXISTS
                    (
                        select *
                        from `t_organization_staff`
                        where 1=1
                        and `delete_flag` = 0
                        and `org_id` = :org_id
                        and `t_organization_staff`.`user_id` = `value_table`.`user_id`
                        and `t_organization_staff`.`staff_type_id` = `value_table`.`staff_type_id`
                    )";
        $sqlString = str_replace("#ValuesReplace#",$replace_str,$sqlString);
        DB::insert($sqlString,$values);

        $insertId = DB::getPdo()->lastInsertId(); //挿入したIDを取得
        return $insertId; //Insertを実行して、InsertしたレコードのID（主キー）を返す
    }

    //団体削除による団体所属スタッフの削除
    //org_idをキーとして、該当所属スタッフのdelete_flagを1にする
    public function updateDeleteFlagByOrganizationDeletion($org_id)
    {
        DB::update('update `t_organization_staff`
                    set `delete_flag` = 1
                    where 1=1
                    and `org_id` = ?'
                    ,[$org_id]);
    }

    public function getOrganizationStaff($org_id)
    {
        $organizationStaffs = DB::select('select
                                            `org_staff_id`
                                            ,staff.`user_id`
                                            ,users.user_name as `userName`
                                            ,`staff_type_id`
                                            ,0	as `delete_flag`
                                            ,CASE
                                                when users.user_id is null then 0
                                                else 1
                                                end as `isUserFound`
                                            FROM `t_organization_staff` staff
                                            left join `t_users` users
                                            on staff.`user_id` = users.`user_id`
                                            WHERE 1=1
                                            and staff.delete_flag = 0
                                            and (users.delete_flag = 0 or users.delete_flag is null)
                                            and staff.org_id = :org_id'
                                        ,$org_id);
        return $organizationStaffs;
    }
}