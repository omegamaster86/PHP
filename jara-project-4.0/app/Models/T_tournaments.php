<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_tournaments extends Model
{
    use HasFactory;

    public function insertTournaments($tournamentsInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::insert(
                'insert into t_tournaments
                                (
                                    tourn_id,
                                    tourn_name,
                                    sponsor_org_id,
                                    event_start_date,
                                    event_end_date,
                                    venue_id,
                                    venue_name,
                                    tourn_type,		
                                    tourn_url,
                                    tourn_info_faile_path,
                                    entrysystem_tourn_id,
                                    registered_time,
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

    public function updateTournaments($tournamentsInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            // DB::update(
            //     'update t_tournaments set jara_player_id = ?, updated_time = ?, updated_user_id = ? where user_id = ?',
            //     [$tournamentsInfo['jaraPlayerId'], now(), Auth::user()->user_id, $tournamentsInfo['playerId']]
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
