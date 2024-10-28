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
    public function getFollowedTournamentsId($tourn_id)
    {
        $result = DB::select(
            'select
                    `followed_tourn_id`
                    FROM `t_followed_tournaments`
                    where 1=1
                    and `user_id` = ?
                    and `tourn_id` = ?',
            [
                Auth::user()->user_id, 
                $tourn_id
            ]
        );

        $targetTrn = null;
        if (!empty($result)) {
            $targetTrn = $result[0];
        }
        return $targetTrn;
    }

    //追加
    public function insertPlayerForPlayerInfoAlignment($playerInfo)
    {
        Log::debug("insertPlayerForPlayerInfoAlignment start.");
        $current_datetime = now()->format('Y-m-d H:i:s.u');
        $user_id = Auth::user()->user_id;
        DB::insert(
            'insert into t_players
                    (
                        `jara_player_id`,
                        `registered_time`,
                        `registered_user_id`,
                        `updated_time`,
                        `updated_user_id`,
                        `delete_flag`
                    )
                    values
                    (?,?,?,?,?,?)',
            [
                $playerInfo["oldPlayerId"],
                $current_datetime,
                $user_id,
                $current_datetime,
                $user_id,
                0
            ]
        );
        $insertId = DB::getPdo()->lastInsertId(); //挿入したIDを取得
        Log::debug("insertPlayerForPlayerInfoAlignment end.");
        return $insertId; //Insertを実行して、InsertしたレコードのID（主キー）を返す
    }

    //更新
    public function updateFollowedTournaments($tourn_id)
    {
        DB::update(
            'update `t_followed_tournaments`
                    set `delete_flag` = 1
                    ,updated_time = ?
                    ,updated_user_id = ?
                    where 1=1
                    and `delete_flag` = 0
                    and `user_id` = ?
                    and `user_id` = ?
                    and `tourn_id` = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                Auth::user()->user_id,
                $tourn_id
            ]
        );
    }
}
