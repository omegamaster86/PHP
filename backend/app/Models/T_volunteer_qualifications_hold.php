<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class T_volunteer_qualifications_hold extends Model
{
    use HasFactory;

    public static $volunteerInfo = [
        'qual_hold_id' => 1,
        'volunteer_id' => 1,
        'qual_id' => 1,
        'others_qual' => "",
        'registered_time' => null,
        'registered_user_id' => null,
        'updated_time' => null,
        'updated_user_id' => null,
        'delete_flag' => 0,
    ];

    public function getVolunteerQualificationsHold($vlntrId)
    {
        $volunteers = DB::select('select `t_volunteer_qualifications_hold`.`qual_hold_id`, `t_volunteer_qualifications_hold`.`volunteer_id`, `t_volunteer_qualifications_hold`.`qual_id`, 
        `t_volunteer_qualifications_hold`.`others_qual`, `t_volunteer_qualifications_hold`.`registered_time`, `t_volunteer_qualifications_hold`.`registered_user_id`, 
        `t_volunteer_qualifications_hold`.`updated_time`, `t_volunteer_qualifications_hold`.`updated_user_id`, `t_volunteer_qualifications_hold`.`delete_flag`, 
        `m_volunteer_qualifications`.`qual_name`
        FROM `t_volunteer_qualifications_hold` 
        left join `m_volunteer_qualifications`
        on `t_volunteer_qualifications_hold`.`qual_id` = `m_volunteer_qualifications`.`qual_id`
        where `t_volunteer_qualifications_hold`.delete_flag=0 and `t_volunteer_qualifications_hold`.volunteer_id = ?', [$vlntrId]);

        return $volunteers;
    }

    public function updateVolunteerQualificationsHold($volunteersInfo)
    {
        DB::update(
            'update t_volunteer_qualifications_hold set `qual_hold_id`=?,`volunteer_id`=?,`qual_id`=?,`others_qual`=?,`registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? where volunteer_id = ?',
            [
                $volunteersInfo['qual_hold_id'],
                $volunteersInfo['volunteer_id'],
                $volunteersInfo['qual_id'],
                $volunteersInfo['others_qual'],
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $volunteersInfo['delete_flag'],
                $volunteersInfo['volunteer_id'], //where条件
            ]
        );
    }

    //ボランティア保有資格情報テーブルに挿入する
    //ボランティア一括登録画面用
    public function insertVolunteerQualificationsHold($values)
    {
        DB::insert('insert into `t_volunteer_qualifications_hold`
                    (
                        `volunteer_id`,
                        `qual_id`,
                        #`others_qual`,
                        `registered_time`,
                        `registered_user_id`,
                        `updated_time`,
                        `updated_user_id`,
                        `delete_flag`
                    )
                    VALUES(?,?,?,?,?,?,?)'
                    ,[
                        $values['volunteer_id']
                        ,$values['qual_id']
                        ,$values['registered_time']
                        ,$values['registered_user_id']
                        ,$values['updated_time']
                        ,$values['updated_user_id']
                        ,$values['delete_flag']
                    ]);
        //挿入したIDを取得
        $insertId =  DB::getPdo()->lastInsertId();
        return $insertId;
    }

    //ボランティア削除
    //delete_flagを1にする
    public function updateDeleteFlag($volunteer_id)
    {
        Log::debug($volunteer_id);
        DB::update('update `t_volunteer_qualifications_hold`
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
