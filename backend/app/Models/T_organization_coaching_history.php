<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_organization_coaching_history extends Model
{
    use HasFactory;

    //指導者・審判情報取得 20241105
    public function getOrganizationCoachingHistoryData()
    {
        $result = DB::select(
            'SELECT 
                t_organization_coaching_history.org_coaching_history_id as `orgCoachingHistoryId`,
                t_organization_coaching_history.start_date as `startDate`,
                t_organization_coaching_history.end_date as `endDate`,
                t_organizations.org_name as `orgName`,
                m_staff_type.staff_type_name as `staffTypeName`
                FROM t_organization_coaching_history
                left join t_organizations 
                on t_organization_coaching_history.org_id = t_organizations.org_id
                left join m_staff_type 
                on t_organization_coaching_history.staff_type_id = m_staff_type.staff_type_id
                where 1=1
                and m_staff_type.delete_flag = 0
                and t_organizations.delete_flag = 0
                and t_organization_coaching_history.delete_flag = 0
                and t_organization_coaching_history.user_id = ?
                order by `startDate` DESC',
            [
                Auth::user()->user_id
            ]
        );
        return $result;
    }

    //指導者・審判情報の追加 20241105
    public function insertOrganizationCoachingHistoryData($coachingHistoriesData)
    {
        DB::insert(
            'insert into `t_organization_coaching_history`
                    set
                    `user_id` = ?,
                    `org_id` = ?,
                    `staff_type_id` = ?,
                    `start_date` = ?,
                    `end_date` = ?,
                    `registered_time` = ?,
                    `registered_user_id` = ?,
                    `updated_time` = ?,
                    `updated_user_id` = ?,
                    `delete_flag` = 0',
            [
                Auth::user()->user_id,
                $coachingHistoriesData['orgId'],
                $coachingHistoriesData['staffTypeId'],
                $coachingHistoriesData['startDate'],
                $coachingHistoriesData['endDate'],
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id
            ]
        );
    }

    //指導者・審判情報の更新 20241105
    public function updateOrganizationCoachingHistoryData($coachingHistoriesData)
    {
        DB::update(
            'update `t_organization_coaching_history`
                    set 
                    `org_id` = ?,
                    `staff_type_id` = ?,
                    `start_date` = ?,
                    `end_date` = ?,
                    `updated_time` = ?,
                    `updated_user_id` = ?,
                    `delete_flag` = ?
                    where 1=1
                    and `org_coaching_history_id` = ?',
            [
                $coachingHistoriesData['orgId'],
                $coachingHistoriesData['staffTypeId'],
                $coachingHistoriesData['startDate'],
                $coachingHistoriesData['endDate'],
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $coachingHistoriesData['isDeleted'],
                $coachingHistoriesData['orgCoachingHistoryId']
            ]
        );
    }
}
