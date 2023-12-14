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

    public function updateOrganizationStaff($organizationInfo)
    {
        //example
        // update `t_organization_staff`
        // set delete_flag = 1
        // where 1=1
        // and org_staff_id not in
        // (
        //     SELECT org_staff_id
        //     FROM `t_organization_staff`
        //     where 1=1
        //     and org_id = 1
        //     and
        //     (
        //         (user_id = 1 and staff_type_id = 1)
        //         or (user_id = 2 and staff_type_id = 2)
        //     )
        // )
    }

    public function insertOrganizationStaff($organizationInfo)
    {
        // INSERT INTO `t_organization_staff`(
                                        //     `org_staff_id`,
                                        //     `org_id`,
                                        //     `user_id`,
                                        //     `staff_type_id`,
                                        //     `appointment_date`,
                                        //     `retirement_date`,
                                        //     `registered_time`,
                                        //     `registered_user_id`,
                                        //     `updated_time`,
                                        //     `updated_user_id`,
                                        //     `delete_flag`
                                        // )
                                        // VALUES
                                        //(
                                        //     '[value-1]',
                                        //     '[value-2]',
                                        //     '[value-3]',
                                        //     '[value-4]',
                                        //     '[value-5]',
                                        //     '[value-6]',
                                        //     '[value-7]',
                                        //     '[value-8]',
                                        //     '[value-9]',
                                        //     '[value-10]',
                                        //     '[value-11]'
                                        // )
    }
}