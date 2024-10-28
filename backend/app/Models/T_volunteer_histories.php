<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
        $volunteers = DB::select('select 
        `volunteer_history_id`
        , `volunteer_id`
        , `t_volunteer_histories`.`tourn_id`
        , `role`
        , `date_type`
        , `day_of_week`
        , `time_zone`
        , `authority` as ad
        , `number_of_days`
        , `t_volunteer_histories`.`registered_time`
        , `t_volunteer_histories`.`registered_user_id`
        , `t_volunteer_histories`.`updated_time`
        , `t_volunteer_histories`.`updated_user_id`
        , `t_volunteer_histories`.`delete_flag`
        , `t_tournaments`.`tourn_name`
        , `t_tournaments`.`event_start_date`
        , `t_tournaments`.`event_end_date`
        , `t_tournaments`.`tourn_type`
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
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $volunteersInfo['delete_flag'],
                $volunteersInfo['volunteer_id'], //where条件
            ]
        );
    }

    //volunteer_idを条件としてボランティア履歴を取得
    public function getVolunteerHistoriesResponse($volunteer_id)
    {
        $histories = DB::select("select
                                tvh.tourn_id
                                ,tourn.tourn_name
                                ,tourn.tourn_type
                                ,tourn.event_start_date
                                ,tourn.event_end_date
                                ,tvh.`role`
                                ,tvh.date_type
                                ,tvh.day_of_week
                                ,tvh.time_zone
                                from `t_volunteer_histories` tvh
                                left join `t_tournaments` tourn
                                on tvh.tourn_id = tourn.tourn_id
                                where 1=1
                                and tvh.delete_flag = 0
                                and tourn.delete_flag = 0
                                and `volunteer_id` = :volunteer_id"
                            ,$volunteer_id);
        return $histories;
    }

    //delete_flagを有効にupdateする
    public function updateDeleteFlagToValid($values)
    {
        DB::update("update `t_volunteer_histories`
                    set updated_time = :current_datetime
                    ,updated_user_id = :user_id
                    ,delete_flag = 1
                    where 1=1
                    and volunteer_history_id = :volunteer_history_id
                    ",$values);
    }

    //ボランティア削除
    //delete_flagを1にする
    public function updateDeleteFlag($volunteer_id)
    {
        Log::debug($volunteer_id);
        DB::update('update `t_volunteer_histories`
                    set `delete_flag` = 1
                    ,updated_time = ?
                    ,updated_user_id = ?
                    where 1=1
                    and `delete_flag` = 0
                    and `volunteer_id` = ?'
                    ,[
                        now()->format('Y-m-d H:i:s.u')
                        ,Auth::user()->user_id
                        ,$volunteer_id
                    ]
                );
    }
}
