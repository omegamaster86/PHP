<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class T_followed_tournaments extends Model
{
    use HasFactory;

    //取得
    public function getFollowedTournamentsId($tournId)
    {
        $result = DB::select(
            'select
                    `followed_tourn_id`
                    ,`delete_flag`
                    FROM `t_followed_tournaments`
                    where 1=1
                    and `user_id` = ?
                    and `tourn_id` = ?',
            [
                Auth::user()->user_id, 
                $tournId
            ]
        );

        $targetTrn = null;
        if (!empty($result)) {
            $targetTrn = $result[0];
        }
        return $targetTrn;
    }

    //追加
    public function insertFollowedTournaments($tournId)
    {
        DB::insert(
            'insert into `t_followed_tournaments`
                    set
                    user_id = ?
                    ,tourn_id = ?
                    ,`registered_time` = ?
                    ,`registered_user_id` = ?
                    ,`updated_time` = ?
                    ,`updated_user_id` = ?
                    ,`delete_flag` = 0',
            [
                Auth::user()->user_id,
                $tournId,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id
            ]
        );
        $insertId = DB::getPdo()->lastInsertId(); //挿入したIDを取得
        return $insertId; //Insertを実行して、InsertしたレコードのID（主キー）を返す
    }

    //更新
    public function updateFollowedTournaments($deleteFlag,$tournId)
    {
        DB::update(
            'update `t_followed_tournaments`
                    set `delete_flag` = ?
                    ,updated_time = ?
                    ,updated_user_id = ?
                    where 1=1
                    and `user_id` = ?
                    and `tourn_id` = ?',
            [
                $deleteFlag,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                Auth::user()->user_id,
                $tournId
            ]
        );
    }
}
