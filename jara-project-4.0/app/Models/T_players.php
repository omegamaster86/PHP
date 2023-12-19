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

    //20231218 選手IDに一致する全ての選手情報を取得
    //選手IDの条件はin句に置き換える
    public function getPlayers($PlayerIdCondition)
    {
        $sqlString = 'select 
                        `player_id`
                        ,`user_id`
                        ,`player_name`
                        ,`country_name`
                        ,`height`
                        ,`weight`
                        from `t_players`
                        left join `m_countries`
                        on `t_players`.`birth_country` = `m_countries`.`country_id`
                        where `t_players`.`delete_flag`=0
                        and `player_id` in (#PlayerIdCondition#)';        
        $sqlString = str_replace('#PlayerIdCondition#',$PlayerIdCondition,$sqlString);
        $players = DB::select($sqlString);
        return $players;
    }
}
