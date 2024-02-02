<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_raceResultRecord extends Model
{
    use HasFactory;

    public static $raceResultRecordInfo = [
        'race_result_record_id' => null,
        'user_id' => null,
        'jara_player_id' => null,
        'player_name' => null,
        'entrysystem_tourn_id' => null,
        'tourn_id' => null,
        'tourn_name' => null,
        'race_id' => null,
        'entrysystem_race_id' => null,
        'race_number' => null,
        'race_name' => null,
        'org_id' => null,
        'entrysystem_org_id' => null,
        'org_name' => null,
        'crew_name' => null,
        'by_group' => null,
        'event_id' => null,
        'event_name' => null,
        'range' => null,
        'rank' => null,
        'laptime_500m' => null,
        'laptime_1000m' => null,
        'laptime_1500m' => null,
        'laptime_2000m' => null,
        'final_time' => null,
        'stroke_rate_avg' => null,
        'stroke_rat_500m' => null,
        'stroke_rat_1000m' => null,
        'stroke_rat_1500m' => null,
        'stroke_rat_2000m' => null,
        'heart_rate_avg' => null,
        'heart_rate_500m' => null,
        'heart_rate_1000m' => null,
        'heart_rate_1500m' => null,
        'heart_rate_2000m' => null,
        'official' => null,
        'attendance' => null,
        'ergo_weight' => null,
        'crew_rep_record_flag' => null,
        'player_height' => null,
        'player_weight' => null,
        'sheet_number' => null,
        'sheet_name' => null,
        'race_result_record_name' => null,
        'start_datetime' => null,
        'wind_speed_2000m_point' => null,
        'wind_direction_2000m_point' => null,
        'wind_speed_1000m_point' => null,
        'wind_direction_1000m_point' => null,
        'delete_flag' => 0,
    ];

    //レースIDに紐づいたレース結果情報を取得
    public function getRaceResultRecord_receId($raceId)
    {
        $racesResultRecord = DB::select('select `race_result_record_id`, `user_id`, `jara_player_id`, `player_name`, `entrysystem_tourn_id`, `tourn_id`, `tourn_name`, `race_id`, `entrysystem_race_id`, `race_number`, `race_name`, `org_id`, `entrysystem_org_id`, `org_name`, `crew_name`, `by_group`, `event_id`, `event_name`, `range`, `rank`, `laptime_500m`, `laptime_1000m`, `laptime_1500m`, `laptime_2000m`, `final_time`, `stroke_rate_avg`, `stroke_rat_500m`, `stroke_rat_1000m`, `stroke_rat_1500m`, `stroke_rat_2000m`, `heart_rate_avg`, `heart_rate_500m`, `heart_rate_1000m`, `heart_rate_1500m`, `heart_rate_2000m`, `official`, `attendance`, `ergo_weight`, `crew_rep_record_flag`, `player_height`, `player_weight`, `sheet_number`, `t_race_result_record`.`sheet_name`, `race_result_record_name`, `start_datetime`, `wind_speed_2000m_point`, `wind_direction_2000m_point`, `wind_speed_1000m_point`, `wind_direction_1000m_point`, `t_race_result_record`.`registered_time`, `t_race_result_record`.`registered_user_id`, `t_race_result_record`.`updated_time`, 
        `t_race_result_record`.`updated_user_id`, `t_race_result_record`.`delete_flag`, 
        `m_sheet_number`.`display_order`
        FROM `t_race_result_record` 
        left join `m_sheet_number`
        on `t_race_result_record`.`sheet_number` = `m_sheet_number`.`sheet_id`
        where `t_race_result_record`.delete_flag=0 and `t_race_result_record`.race_id = ?', [$raceId]);

        return $racesResultRecord;
    }

    //大会IDに紐づいたレース結果情報を取得
    public function getRaceResultRecord_tournId($tournId)
    {
        $racesResultRecord = DB::select('select `race_result_record_id`, `user_id`, `jara_player_id`, `player_name`, `entrysystem_tourn_id`, `tourn_id`, `tourn_name`, `race_id`, `entrysystem_race_id`, `race_number`, `race_name`, `org_id`, `entrysystem_org_id`, `org_name`, `crew_name`, `by_group`, `event_id`, `event_name`, `range`, `rank`, `laptime_500m`, `laptime_1000m`, `laptime_1500m`, `laptime_2000m`, `final_time`, `stroke_rate_avg`, `stroke_rat_500m`, `stroke_rat_1000m`, `stroke_rat_1500m`, `stroke_rat_2000m`, `heart_rate_avg`, `heart_rate_500m`, `heart_rate_1000m`, `heart_rate_1500m`, `heart_rate_2000m`, `official`, `attendance`, `ergo_weight`, `crew_rep_record_flag`, `player_height`, `player_weight`, `sheet_number`, `t_race_result_record`.`sheet_name`, `race_result_record_name`, `start_datetime`, `wind_speed_2000m_point`, `wind_direction_2000m_point`, `wind_speed_1000m_point`, `wind_direction_1000m_point`, `t_race_result_record`.`registered_time`, `t_race_result_record`.`registered_user_id`, `t_race_result_record`.`updated_time`, 
        `t_race_result_record`.`updated_user_id`, `t_race_result_record`.`delete_flag`, 
        `m_sheet_number`.`display_order`
        FROM `t_race_result_record` 
        left join `m_sheet_number`
        on `t_race_result_record`.`sheet_number` = `m_sheet_number`.`sheet_id`
        where `t_race_result_record`.delete_flag=0 and `t_race_result_record`.tourn_id = ?', [$tournId]);

        return $racesResultRecord;
    }

    //クルー一覧に表示する選手の情報を取得
    public function getRaceResultRecord_crewData($raceId,$crewName,$orgId)
    {
        $racesResultRecord = DB::select('select `race_result_record_id`,  
        `player_name`, 
        `player_height`, 
        `player_weight`, 
        `sheet_number`, 
        `t_race_result_record`.`sheet_name`, 
        `t_race_result_record`.`delete_flag`, 
        `m_sheet_number`.`display_order`
        FROM `t_race_result_record` 
        left join `m_sheet_number`
        on `t_race_result_record`.`sheet_number` = `m_sheet_number`.`sheet_id`
        where `t_race_result_record`.delete_flag=0 
        and `t_race_result_record`.race_id = ?
        and `t_race_result_record`.crew_name = ?
        and `t_race_result_record`.org_id = ?', [$raceId,$crewName,$orgId]);

        return $racesResultRecord;
    }

    public function insertRaceResultRecord($raceResultRecordInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::insert(
                'insert into t_race_result_record(`race_result_record_id`, `user_id`, `jara_player_id`, `player_name`, `entrysystem_tourn_id`, `tourn_id`, `tourn_name`, `race_id`, `entrysystem_race_id`, `race_number`, `race_name`, `org_id`, `entrysystem_org_id`, `org_name`, `crew_name`, `by_group`, `event_id`, `event_name`, `range`, `rank`, `laptime_500m`, `laptime_1000m`, `laptime_1500m`, `laptime_2000m`, `final_time`, `stroke_rate_avg`, `stroke_rat_500m`, `stroke_rat_1000m`, `stroke_rat_1500m`, `stroke_rat_2000m`, `heart_rate_avg`, `heart_rate_500m`, `heart_rate_1000m`, `heart_rate_1500m`, `heart_rate_2000m`, `official`, `attendance`, `ergo_weight`, `crew_rep_record_flag`, `player_height`, `player_weight`, `sheet_number`, `sheet_name`, `race_result_record_name`, `start_datetime`, `wind_speed_2000m_point`, `wind_direction_2000m_point`, `wind_speed_1000m_point`, `wind_direction_1000m_point`, `registered_time`, `registered_user_id`, `updated_time`, `updated_user_id`, `delete_flag`)VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
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
                    $raceResultRecordInfo['sheet_number'],
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
                    $raceResultRecordInfo['delete_flag']
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
        //dd($raceResultRecordInfo['tourn_id'],$raceResultRecordInfo['delete_flag']);
        $result = "success";
        DB::beginTransaction();
        try {
            DB::update(
                'update t_race_result_record set `user_id`=?,`jara_player_id`=?,`player_name`=?,`entrysystem_tourn_id`=?,`tourn_id`=?,`tourn_name`=?,`race_id`=?,`entrysystem_race_id`=?,`race_number`=?,`race_name`=?,`org_id`=?, `entrysystem_org_id`=?,`org_name`=?,`crew_name`=?,`by_group`=?,`event_id`=?,`event_name`=?,`range`=?,`rank`=?,`laptime_500m`=?,`laptime_1000m`=?,`laptime_1500m`=?,`laptime_2000m`=?,`final_time`=?, `stroke_rate_avg`=?,`stroke_rat_500m`=?,`stroke_rat_1000m`=?,`stroke_rat_1500m`=?,`stroke_rat_2000m`=?,`heart_rate_avg`=?,`heart_rate_500m`=?,`heart_rate_1000m`=?,`heart_rate_1500m`=?,`heart_rate_2000m`=?, `official`=?,`attendance`=?,`ergo_weight`=?,`crew_rep_record_flag`=?,`player_height`=?,`player_weight`=?,`sheet_number`=?,`sheet_name`=?,`race_result_record_name`=?,`start_datetime`=?,`wind_speed_2000m_point`=?,`wind_direction_2000m_point`=?,`wind_speed_1000m_point`=?,`wind_direction_1000m_point`=?,`registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? WHERE `tourn_id` = ?',
                [
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
                    $raceResultRecordInfo['sheet_number'],
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
                    $raceResultRecordInfo['delete_flag'],
                    $raceResultRecordInfo['tourn_id'], //where条件
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

    //団体IDを条件として出漕結果記録テーブル内の大会IDを取得する
    public function getTournamentIdForResultsRecord($targetOrgId)
    {
        $tournamentIds = DB::select('select `tourn_id`
                                        from `t_race_result_record`
                                        where `delete_flag`=0
                                        and `org_id`=?'
                                    ,[$targetOrgId]
                                );
        return $tournamentIds;
    }
}
