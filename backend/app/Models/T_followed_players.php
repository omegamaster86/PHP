<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class T_followed_players extends Model
{
    use HasFactory;

    //フォロー情報の取得 20241029
    public function getFollowedPlayersData($playerId)
    {
        $result = DB::select(
            'select
                    `followed_player_id`
                    ,`delete_flag`
                    FROM `t_followed_players`
                    where 1=1
                    and `user_id` = ?
                    and `player_id` = ?',
            [
                Auth::user()->user_id, 
                $playerId
            ]
        );

        $targetTrn = null;
        if (!empty($result)) {
            $targetTrn = $result[0];
        }
        return $targetTrn;
    }

    //選手のフォロー追加 202401028
    public function insertFollowedPlayers($playerId)
    {
        DB::insert(
            'insert into `t_followed_players`
                    set
                    user_id = ?
                    ,player_id = ?
                    ,`registered_time` = ?
                    ,`registered_user_id` = ?
                    ,`updated_time` = ?
                    ,`updated_user_id` = ?
                    ,`delete_flag` = 0',
            [
                Auth::user()->user_id,
                $playerId,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id
            ]
        );
    }

    //選手のフォロー更新 202401028
    public function updateFollowedPlayers($deleteFlag,$playerId)
    {
        DB::update(
            'update `t_followed_players`
                    set `delete_flag` = ?
                    ,updated_time = ?
                    ,updated_user_id = ?
                    where 1=1
                    and `user_id` = ?
                    and `player_id` = ?',
            [
                $deleteFlag,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                Auth::user()->user_id,
                $playerId
            ]
        );
    }

    //フォロー情報の取得 20241029
    public function getFollowerCount($playerId)
    {
        $result = DB::select(
            'select
                    COUNT(`followed_player_id`) as follower
                    FROM `t_followed_players`
                    left join `t_users`
                    on `t_followed_players`.`user_id` = `t_users`.`user_id`
                    where 1=1
                    and `t_followed_players`.`delete_flag` = 0
                    and `t_users`.`delete_flag` = 0
                    and `t_followed_players`.`player_id` = ?',
            [
                $playerId
            ]
        );

        return !empty($result) ? (int) $result[0]->follower : 0;

    }
}
