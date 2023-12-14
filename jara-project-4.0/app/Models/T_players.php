<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_players extends Model
{
    use HasFactory;

    public function insertPlayers($playersInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::insert(
                'insert into t_players
                                (
                                    player_id,
                                    user_id,
                                    jara_player_id,
                                    player_name,
                                    date_of_birth,
                                    sex,
                                    height,
                                    weight,		
                                    side_info,
                                    birth_country,
                                    birth_prefecture,
                                    residence_country,
                                    residence_prefecture,
                                    photo,
                                    registered_time,
                                    registered_user_id,
                                    updated_time,
                                    updated_user_id,
                                    delete_flag
                                )values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    null,
                    null,
                    $playersInfo['jaraPlayerId'],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    NOW(),
                    Auth::user()->user_id,
                    NOW(),
                    Auth::user()->user_id,
                    0
                ]
            );
            DB::commit();
            return "登録完了";
        } catch (\Throwable $e) {
            dd($e);
            // dd($request->all());
            dd("stop");
            DB::rollBack();

            $result = "failed";
            return $result;
        }
    }

    public function updatePlayers($playersInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::update(
                'update t_players set jara_player_id = ?, updated_time = ?, updated_user_id = ? where user_id = ?',
                [$playersInfo['jaraPlayerId'], now(), Auth::user()->user_id, $playersInfo['playerId']]
            );

            DB::commit();
            return $result;
        } catch (\Throwable $e) {
            dd($e);
            // dd($request->all());
            dd("stop");
            DB::rollBack();

            $result = "failed";
            return $result;
        }
    }
}
