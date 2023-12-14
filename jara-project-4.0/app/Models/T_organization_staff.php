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
}
