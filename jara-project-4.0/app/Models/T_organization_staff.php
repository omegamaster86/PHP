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
                                    org_staff_id
                                    ,staff.user_id
                                    ,staff.staff_type_id
                                    ,user.user_name
                                    from t_organization_staff staff
                                    join t_users user
                                    on staff.user_id = user.user_id
                                    where staff.delete_flag = 0
                                    and user.delete_flag = 0
                                    and staff.org_id = ?'
                                    ,[$orgId]
                                );
        return $orgStaffs;
    }

    //団体所属スタッフテーブルの削除フラグを更新する
    public function updateDeleteFlagInOrganizationStaff($condition,$org_id)
    {
        $sqlString = 'update `t_organization_staff`
                        set `delete_flag` = 1
                        where 1=1
                        and `delete_flag` = 0
                        and `org_id` = #OrgIdReplace#
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
        $sqlString = str_replace('#OrgIdReplace#',$org_id,$sqlString);
        $result = true;
        DB::beginTransaction();
        try{
                DB::update($sqlString);
                DB::commit();
                return $result;
        }
        catch (\Throwable $e){
                dd($e);
                dd("stop");
                DB::rollBack();
                
                $result = false;
                return $result;
        }
    }

    //団体所属スタッフテーブルに挿入する
    public function insertOrganizationStaff($values,$orgId)
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
                        and `org_id` = #OrgIdCondition#
                        and `t_organization_staff`.`user_id` = `value_table`.`user_id`
                        and `t_organization_staff`.`staff_type_id` = `value_table`.`staff_type_id`
                    )";
        $sqlString = str_replace("#ValuesReplace#",$values,$sqlString);
        $sqlString = str_replace("#OrgIdCondition#",$orgId,$sqlString);
        $result = true;
        DB::beginTransaction();
        try{
                DB::insert($sqlString);
                DB::commit();
                return $result;
        }
        catch (\Throwable $e){
                dd($e);
                dd("stop");
                DB::rollBack();
                
                $result = false;
                return $result;
        }
    }
}