<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class T_followed_tournaments extends Model
{
    use HasFactory;

    //フォロー情報の取得 20241028
    public function getFollowedTournamentsData($tournId)
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

    //大会のフォロー追加 202401028
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
    }

    //大会のフォロー更新 202401028
    public function updateFollowedTournaments($deleteFlag, $tournId)
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

    // フォロワー数取得
    public function getFollowerCount($tournId)
    {
        $result = DB::select(
            'select
                    COUNT(`followed_tourn_id`) as follower
                    FROM `t_followed_tournaments`
                    left join `t_users`
                    on `t_followed_tournaments`.`user_id` = `t_users`.`user_id`
                    where 1=1
                    and `t_followed_tournaments`.`delete_flag` = 0
                    and `t_users`.`delete_flag` = 0
                    and `t_followed_tournaments`.`tourn_id` = ?',
            [
                $tournId
            ]
        );

        return !empty($result) ? (int) $result[0]->follower : 0;
    }

    // 大会のフォロワー数取得（mypageのtop画面で使用）
    public function getFollowedTournCount()
    {
        $userId = Auth::user()->user_id;

        $top_page = DB::select(
            '
            SELECT
                COUNT(followed_tourn_id) as followedTournCount
            FROM 
                t_followed_tournaments
            WHERE
                t_followed_tournaments.user_id = ?
                and t_followed_tournaments.delete_flag = 0
            ',
            [$userId]
        );

        return $top_page[0];
    }
}
