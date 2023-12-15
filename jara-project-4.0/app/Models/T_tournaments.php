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
                (`tourn_id`, `tourn_name`, `sponsor_org_id`, `event_start_date`, `event_end_date`, `venue_id`, `venue_name`, `tourn_type`, `tourn_url`,
                 `tourn_info_faile_path`, `entrysystem_tourn_id`, `registered_time`, `registered_user_id`, `updated_time`, `updated_user_id`, `delete_flag`)
                values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [
                    $tournamentsInfo['tourn_id'],
                    $tournamentsInfo['tourn_name'],
                    $tournamentsInfo['sponsor_org_id'],
                    $tournamentsInfo['event_start_date'],
                    $tournamentsInfo['event_end_date'],
                    $tournamentsInfo['venue_id'],
                    $tournamentsInfo['venue_name'],
                    $tournamentsInfo['tourn_type'],
                    $tournamentsInfo['tourn_url'],
                    $tournamentsInfo['tourn_info_faile_path'],
                    $tournamentsInfo['entrysystem_tourn_id'],
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
            DB::update(
                'update t_tournaments set `tourn_id`=?,`tourn_name`=?,`sponsor_org_id`=?,`event_start_date`=?,`event_end_date`=?,`venue_id`=?,`venue_name`=?,`tourn_type`=?,`tourn_url`=?,`tourn_info_faile_path`=?,`entrysystem_tourn_id`=?,`registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? where tourn_id = ?',
                [
                    $tournamentsInfo['tourn_id'],
                    $tournamentsInfo['tourn_name'],
                    $tournamentsInfo['sponsor_org_id'],
                    $tournamentsInfo['event_start_date'],
                    $tournamentsInfo['event_end_date'],
                    $tournamentsInfo['venue_id'],
                    $tournamentsInfo['venue_name'],
                    $tournamentsInfo['tourn_type'],
                    $tournamentsInfo['tourn_url'],
                    $tournamentsInfo['tourn_info_faile_path'],
                    $tournamentsInfo['entrysystem_tourn_id'],
                    NOW(),
                    Auth::user()->user_id,
                    NOW(),
                    Auth::user()->user_id,
                    0,
                    1, //$raceResultRecordInfo['playerId'] //where条件
                ]
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

    //20231215 団体IDをキーとして大会情報を取得する
    public function getTournamentsFromOrgId($target_org_id)
    {
        $tournaments = DB::select('select *
                                        from `t_tournaments`
                                        where `delete_flag` =0
                                        and `sponsor_org_id` = ?
                                        order by 並び順を決めるフィールド名を書く'
                                    ,[$target_org_id]
                                );
        return $tournaments;
    }
}
