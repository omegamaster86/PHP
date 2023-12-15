<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_raceResultRecord extends Model
{
    use HasFactory;

    public function insertRaceResultRecord($raceResultRecordInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::insert(
                'insert into t_race_result_record(`race_result_record_id`, `user_id`, `jara_player_id`, `player_name`, `entrysystem_tourn_id`, `tourn_id`, `tourn_name`, `race_id`, `entrysystem_race_id`, `race_number`, `race_name`, `org_id`, `entrysystem_org_id`, `org_name`, `crew_name`, `by_group`, `event_id`, `event_name`, `range`, `rank`, `laptime_500m`, `laptime_1000m`, `laptime_1500m`, `laptime_2000m`, `final_time`, `stroke_rate_avg`, `stroke_rat_500m`, `stroke_rat_1000m`, `stroke_rat_1500m`, `stroke_rat_2000m`, `heart_rate_avg`, `heart_rate_500m`, `heart_rate_1000m`, `heart_rate_1500m`, `heart_rate_2000m`, `official`, `attendance`, `ergo_weight`, `crew_rep_record_flag`, `player_height`, `player_weight`, `m_sheet_number`, `sheet_name`, `race_result_record_name`, `start_datetime`, `wind_speed_2000m_point`, `wind_direction_2000m_point`, `wind_speed_1000m_point`, `wind_direction_1000m_point`, `registered_time`, `registered_user_id`, `updated_time`, `updated_user_id`, `delete_flag`)VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [
                    $raceResultRecordInfo['race_result_record_id'],
                    $raceResultRecordInfo['user_id'],
                    $raceResultRecordInfo['jara_player_id'],
                    $raceResultRecordInfo['player_name'],
                    $raceResultRecordInfo['entrysystem_tourn_id'],
                    $raceResultRecordInfo['tourn_id'],
                    $raceResultRecordInfo['tourn_name'],
                    $raceResultRecordInfo['race_id'],
                    $raceResultRecordInfo['entrysystem_race_id'],
                    $raceResultRecordInfo['race_number'],
                    $raceResultRecordInfo['race_name'],
                    $raceResultRecordInfo['org_id'],
                    $raceResultRecordInfo['entrysystem_org_id'],
                    $raceResultRecordInfo['org_name'],
                    $raceResultRecordInfo['crew_name'],
                    $raceResultRecordInfo['by_group'],
                    $raceResultRecordInfo['event_id'],
                    $raceResultRecordInfo['event_name'],
                    $raceResultRecordInfo['range'],
                    $raceResultRecordInfo['rank'],
                    $raceResultRecordInfo['laptime_500m'],
                    $raceResultRecordInfo['laptime_1000m'],
                    $raceResultRecordInfo['laptime_1500m'],
                    $raceResultRecordInfo['laptime_2000m'],
                    $raceResultRecordInfo['final_time'],
                    $raceResultRecordInfo['stroke_rate_avg'],
                    $raceResultRecordInfo['stroke_rat_500m'],
                    $raceResultRecordInfo['stroke_rat_1000m'],
                    $raceResultRecordInfo['stroke_rat_1500m'],
                    $raceResultRecordInfo['stroke_rat_2000m'],
                    $raceResultRecordInfo['heart_rate_avg'],
                    $raceResultRecordInfo['heart_rate_500m'],
                    $raceResultRecordInfo['heart_rate_1000m'],
                    $raceResultRecordInfo['heart_rate_1500m'],
                    $raceResultRecordInfo['heart_rate_2000m'],
                    $raceResultRecordInfo['official'],
                    $raceResultRecordInfo['attendance'],
                    $raceResultRecordInfo['ergo_weight'],
                    $raceResultRecordInfo['crew_rep_record_flag'],
                    $raceResultRecordInfo['player_height'],
                    $raceResultRecordInfo['player_weight'],
                    $raceResultRecordInfo['m_sheet_number'],
                    $raceResultRecordInfo['sheet_name'],
                    $raceResultRecordInfo['race_result_record_name'],
                    $raceResultRecordInfo['start_datetime'],
                    $raceResultRecordInfo['wind_speed_2000m_point'],
                    $raceResultRecordInfo['wind_direction_2000m_point'],
                    $raceResultRecordInfo['wind_speed_1000m_point'],
                    $raceResultRecordInfo['wind_direction_1000m_point'],
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

    public function updateRaceResultRecord($raceResultRecordInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::update(
                'update t_race_result_record set `race_result_record_id`=?,`user_id`=?,`jara_player_id`=?,`player_name`=?,`entrysystem_tourn_id`=?,`tourn_id`=?,`tourn_name`=?,`race_id`=?,`entrysystem_race_id`=?,`race_number`=?,`race_name`=?,`org_id`=?, `entrysystem_org_id`=?,`org_name`=?,`crew_name`=?,`by_group`=?,`event_id`=?,`event_name`=?,`range`=?,`rank`=?,`laptime_500m`=?,`laptime_1000m`=?,`laptime_1500m`=?,`laptime_2000m`=?,`final_time`=?, `stroke_rate_avg`=?,`stroke_rat_500m`=?,`stroke_rat_1000m`=?,`stroke_rat_1500m`=?,`stroke_rat_2000m`=?,`heart_rate_avg`=?,`heart_rate_500m`=?,`heart_rate_1000m`=?,`heart_rate_1500m`=?,`heart_rate_2000m`=?, `official`=?,`attendance`=?,`ergo_weight`=?,`crew_rep_record_flag`=?,`player_height`=?,`player_weight`=?,`m_sheet_number`=?,`sheet_name`=?,`race_result_record_name`=?,`start_datetime`=?,`wind_speed_2000m_point`=?,`wind_direction_2000m_point`=?,`wind_speed_1000m_point`=?,`wind_direction_1000m_point`=?,`registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? where user_id = ?',
                [
                    $raceResultRecordInfo['race_result_record_id'],
                    $raceResultRecordInfo['user_id'],
                    $raceResultRecordInfo['jara_player_id'],
                    $raceResultRecordInfo['player_name'],
                    $raceResultRecordInfo['entrysystem_tourn_id'],
                    $raceResultRecordInfo['tourn_id'],
                    $raceResultRecordInfo['tourn_name'],
                    $raceResultRecordInfo['race_id'],
                    $raceResultRecordInfo['entrysystem_race_id'],
                    $raceResultRecordInfo['race_number'],
                    $raceResultRecordInfo['race_name'],
                    $raceResultRecordInfo['org_id'],
                    $raceResultRecordInfo['entrysystem_org_id'],
                    $raceResultRecordInfo['org_name'],
                    $raceResultRecordInfo['crew_name'],
                    $raceResultRecordInfo['by_group'],
                    $raceResultRecordInfo['event_id'],
                    $raceResultRecordInfo['event_name'],
                    $raceResultRecordInfo['range'],
                    $raceResultRecordInfo['rank'],
                    $raceResultRecordInfo['laptime_500m'],
                    $raceResultRecordInfo['laptime_1000m'],
                    $raceResultRecordInfo['laptime_1500m'],
                    $raceResultRecordInfo['laptime_2000m'],
                    $raceResultRecordInfo['final_time'],
                    $raceResultRecordInfo['stroke_rate_avg'],
                    $raceResultRecordInfo['stroke_rat_500m'],
                    $raceResultRecordInfo['stroke_rat_1000m'],
                    $raceResultRecordInfo['stroke_rat_1500m'],
                    $raceResultRecordInfo['stroke_rat_2000m'],
                    $raceResultRecordInfo['heart_rate_avg'],
                    $raceResultRecordInfo['heart_rate_500m'],
                    $raceResultRecordInfo['heart_rate_1000m'],
                    $raceResultRecordInfo['heart_rate_1500m'],
                    $raceResultRecordInfo['heart_rate_2000m'],
                    $raceResultRecordInfo['official'],
                    $raceResultRecordInfo['attendance'],
                    $raceResultRecordInfo['ergo_weight'],
                    $raceResultRecordInfo['crew_rep_record_flag'],
                    $raceResultRecordInfo['player_height'],
                    $raceResultRecordInfo['player_weight'],
                    $raceResultRecordInfo['m_sheet_number'],
                    $raceResultRecordInfo['sheet_name'],
                    $raceResultRecordInfo['race_result_record_name'],
                    $raceResultRecordInfo['start_datetime'],
                    $raceResultRecordInfo['wind_speed_2000m_point'],
                    $raceResultRecordInfo['wind_direction_2000m_point'],
                    $raceResultRecordInfo['wind_speed_1000m_point'],
                    $raceResultRecordInfo['wind_direction_1000m_point'],
                    NOW(),
                    Auth::user()->user_id,
                    NOW(),
                    Auth::user()->user_id,
                    0,
                    1, //$raceResultRecordInfo['playerId'] //where条件
                ]
            );

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
