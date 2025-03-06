<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
        $volunteers = DB::select(
            'SELECT
                `available_id`,
                `volunteer_id`,
                `day_of_week`,
                `time_zone`,
                `registered_time`,
                `registered_user_id`,
                `updated_time`,
                `updated_user_id`,
                `delete_flag`
            FROM `t_volunteer_availables`
            WHERE
                delete_flag = 0
                AND volunteer_id = ?',
            [$vlntrId]
        );
        //1つの団体IDを取得するため0番目だけを返す
        $targetTrn = null;
        if (!empty($volunteers)) {
            $targetTrn = $volunteers[0];
        }
        return $targetTrn;
    }

    //ボランティアアベイラブルテーブルに挿入する
    //ボランティア一括登録画面用
    public function insertVolunteerAvailables($values)
    {
        //DB::enableQueryLog();
        DB::insert(
            'insert into `t_volunteer_availables`
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
                    VALUES(?,?,?,?,?,?,?,?)',
            [
                $values['volunteer_id'],
                $values['day_of_week'],
                $values['time_zone'],
                $values['registered_time'],
                $values['registered_user_id'],
                $values['updated_time'],
                $values['updated_user_id'],
                $values['delete_flag']
            ]
        );
        //挿入したIDを取得
        $insertId =  DB::getPdo()->lastInsertId();
        return $insertId;
    }

    //ボランティア削除
    //delete_flagを1にする
    public function updateDeleteFlag($volunteer_id)
    {
        DB::update(
            'update `t_volunteer_availables`
                    set `delete_flag` = 1
                    ,updated_time = ?
                    ,updated_user_id = ?
                    where 1=1
                    and `delete_flag` = 0
                    and `volunteer_id` = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $volunteer_id
            ]
        );
    }
}
