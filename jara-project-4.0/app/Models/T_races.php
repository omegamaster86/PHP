<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_races extends Model
{
    use HasFactory;

    public function insertRaces($racesInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::insert(
                'insert into t_races
                                (
                                    race_result_record_id,
                                    user_id,
                                    jara_player_id,
                                    player_name,
                                    entrysystem_tourn_id,
                                    tourn_id,
                                    tourn_name,
                                    race_id,		
                                    entrysystem_race_id,
                                    race_number,
                                    race_name,
                                    org_id,
                                    registered_user_id,
                                    updated_time,
                                    updated_user_id,
                                    delete_flag,
                                )values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
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

    public function updateRaces($racesInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            // DB::update(
            //     'update t_races set jara_player_id = ?, updated_time = ?, updated_user_id = ? where user_id = ?',
            //     [$racesInfo['jaraPlayerId'], now(), Auth::user()->user_id, $racesInfo['playerId']]
            // );

            // DB::commit();
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
