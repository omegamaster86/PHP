<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class T_volunteer_histories extends Model
{
    use HasFactory;

    public static $volunteerInfo = [
        'volunteer_history_id' => 1,
        'volunteer_id' => 1,
        'tourn_id' => 1,
        'role' => "",
        'date_type' => 0,
        'day_of_week' => "",
        'time_zone' => "",
        'authority' => 1,
        'number_of_days' => 1,
        'registered_time' => null,
        'registered_user_id' => null,
        'updated_time' => null,
        'updated_user_id' => null,
        'delete_flag' => 0,
    ];

    public function getVolunteerHistories($vlntrId)
    {
        $volunteers = DB::select('select `volunteer_history_id`, `volunteer_id`, `t_volunteer_histories`.`tourn_id`, `role`, `date_type`, 
        `day_of_week`, `time_zone`, `authority`, `number_of_days`, `t_volunteer_histories`.`registered_time`, `t_volunteer_histories`.`registered_user_id`, 
        `t_volunteer_histories`.`updated_time`, `t_volunteer_histories`.`updated_user_id`, `t_volunteer_histories`.`delete_flag`, 
        `t_tournaments`.`tourn_name`, `t_tournaments`.`event_start_date`, `t_tournaments`.`event_end_date`
        FROM `t_volunteer_histories` 
        left join `t_tournaments`
        on `t_volunteer_histories`.`tourn_id` = `t_tournaments`.`tourn_id`
        where `t_volunteer_histories`.delete_flag=0 and `t_volunteer_histories`.volunteer_id = ?', [$vlntrId]);
        
        return $volunteers;
    }

    public function updateVolunteerHistories($volunteersInfo)
    {
        DB::update(
            'update t_volunteer_histories set `volunteer_history_id`=?,`volunteer_id`=?,`tourn_id`=?,`role`=?,`date_type`=?,`day_of_week`=?,`time_zone`=?,`authority`=?,`number_of_days`=?,`registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? where volunteer_id = ?',
            [
                $volunteersInfo['volunteer_history_id'],
                $volunteersInfo['volunteer_id'],
                $volunteersInfo['tourn_id'],
                $volunteersInfo['role'],
                $volunteersInfo['date_type'],
                $volunteersInfo['day_of_week'],
                $volunteersInfo['time_zone'],
                $volunteersInfo['authority'],
                $volunteersInfo['number_of_days'],
                NOW(),
                Auth::user()->user_id,
                NOW(),
                Auth::user()->user_id,
                $volunteersInfo['delete_flag'],
                $volunteersInfo['volunteer_id'], //where条件
            ]
        );
    }
}
