<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class T_volunteer_availables extends Model
{
    use HasFactory;

    public static $volunteerInfo = [
        'available_id' => 1,
        'volunteer_id' => 1,
        'day_of_week' => "1111100",
        'time_zone' => "10101",
        'registered_time' => null,
        'registered_user_id' => null,
        'updated_time' => null,
        'updated_user_id' => null,
        'delete_flag' => 0,
    ];

    public function getVolunteerAvailables($vlntrId)
    {
        $volunteers = DB::select('select `available_id`, `volunteer_id`, `day_of_week`, `time_zone`, `registered_time`, `registered_user_id`, `updated_time`, `updated_user_id`, `delete_flag` FROM `t_volunteer_availables` where delete_flag=0 and volunteer_id = ?', [$vlntrId]);
        //1つの団体IDを取得するため0番目だけを返す
        $targetTrn = null;
        if (!empty($volunteers)) {
            $targetTrn = $volunteers[0];
        }
        return $targetTrn;
    }

    public function updateVolunteerAvailables($volunteersInfo)
    {
        DB::update(
            'update t_volunteer_availables set `available_id`=?,`volunteer_id`=?,`day_of_week`=?,`time_zone`=?,`registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? where volunteer_id = ?',
            [
                $volunteersInfo['available_id'],
                $volunteersInfo['volunteer_id'],
                $volunteersInfo['day_of_week'],
                $volunteersInfo['time_zone'],
                NOW(),
                Auth::user()->user_id,
                NOW(),
                Auth::user()->user_id,
                $volunteersInfo['delete_flag'],
                $volunteersInfo['volunteer_id'], //where条件
            ]
        );
    }

    //ボランティアアベイラブルテーブルに挿入する
    //ボランティア一括登録画面用
    public function insertVolunteerAvailables($values)
    {
        DB::insert('INSERT INTO `t_volunteer_availables`
                    (
                        `volunteer_id`,
                        `day_of_week`,
                        `time_zone`,
                        `registered_time`,
                        `registered_user_id`,
                        `updated_time`,
                        `updated_user_id`,
                        `delete_flag`
                    )
                    VALUES
                    (
                        :volunteer_id
                        ,:day_of_week
                        ,:time_zone
                        ,:registered_time
                        ,:registered_user_id
                        ,:updated_time
                        ,:updated_user_id
                        ,:delete_flag
                    )',$values);
        //挿入したIDを取得
        $insertId =  DB::getPdo()->lastInsertId();
        return $insertId;
    }
}
