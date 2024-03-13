<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class T_raceResultRecord extends Model
{
    use HasFactory;

    public static $raceResultRecordInfo = [
        'race_result_record_id' => null,
        'player_id' => null,
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
        'player_height' => null,
        'player_weight' => null,
        'seat_number' => null,
        'seat_name' => null,
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
        $racesResultRecord = DB::select('select 
                                        `t_race_result_record`.`race_result_record_id`, 
                                        `t_race_result_record`.`player_id`, 
                                        `t_race_result_record`.`jara_player_id`, 
                                        `t_race_result_record`.`player_name`, 
                                        `t_race_result_record`.`entrysystem_tourn_id`, 
                                        `t_race_result_record`.`tourn_id`, 
                                        `t_race_result_record`.`tourn_name`, 
                                        `t_race_result_record`.`race_id`, 
                                        `t_race_result_record`.`entrysystem_race_id`, 
                                        `t_race_result_record`.`race_number`, 
                                        `t_race_result_record`.`race_name`, 
                                        `t_race_result_record`.`org_id`, 
                                        `t_race_result_record`.`entrysystem_org_id`, 
                                        `t_race_result_record`.`org_name`, 
                                        `t_race_result_record`.`crew_name`, 
                                        `t_race_result_record`.`by_group`, 
                                        `t_race_result_record`.`event_id`, 
                                        `t_race_result_record`.`event_name`, 
                                        `t_race_result_record`.`range`, 
                                        `t_race_result_record`.`rank`, 
                                        `t_race_result_record`.`laptime_500m`, 
                                        `t_race_result_record`.`laptime_1000m`, 
                                        `t_race_result_record`.`laptime_1500m`, 
                                        `t_race_result_record`.`laptime_2000m`, 
                                        `t_race_result_record`.`final_time`, 
                                        `t_race_result_record`.`stroke_rate_avg`, 
                                        `t_race_result_record`.`stroke_rat_500m`, 
                                        `t_race_result_record`.`stroke_rat_1000m`, 
                                        `t_race_result_record`.`stroke_rat_1500m`, 
                                        `t_race_result_record`.`stroke_rat_2000m`, 
                                        `t_race_result_record`.`heart_rate_avg`, 
                                        `t_race_result_record`.`heart_rate_500m`, 
                                        `t_race_result_record`.`heart_rate_1000m`, 
                                        `t_race_result_record`.`heart_rate_1500m`, 
                                        `t_race_result_record`.`heart_rate_2000m`, 
                                        `t_race_result_record`.`official`, 
                                        `t_race_result_record`.`attendance`, 
                                        `t_race_result_record`.`ergo_weight`, 
                                        `t_race_result_record`.`player_height`, 
                                        `t_race_result_record`.`player_weight`, 
                                        `t_race_result_record`.`seat_number`, 
                                        `t_race_result_record`.`seat_name`, 
                                        `t_race_result_record`.`race_result_record_name`, 
                                        `t_race_result_record`.`start_datetime`, 
                                        `t_race_result_record`.`wind_speed_2000m_point`, 
                                        `t_race_result_record`.`wind_direction_2000m_point`, 
                                        `t_race_result_record`.`wind_speed_1000m_point`, 
                                        `t_race_result_record`.`wind_direction_1000m_point`, 
                                        `t_race_result_record`.`race_result_notes`,
                                        `m_seat_number`.`display_order` 	as "order",
                                        `t_tournaments`.`event_start_date` as "eventStartDate",
                                        `m_venue`.`venue_name`
                                        FROM `t_race_result_record` 
                                        left join `m_seat_number`
                                        on `t_race_result_record`.`seat_number` = `m_seat_number`.`seat_id`
                                        left join `t_tournaments`
                                        on `t_race_result_record`.`tourn_id` = `t_tournaments`.`tourn_id`
                                        left join `m_venue`
                                        on `t_tournaments`.`venue_id` = `m_venue`.`venue_id`
                                        where 1=1
                                        and `t_race_result_record`.delete_flag = 0                                        
                                        and  (`t_tournaments`.`delete_flag` = 0 or `t_tournaments`.`delete_flag` is null)
                                        and  (`m_seat_number`.`delete_flag` = 0 or `m_seat_number`.`delete_flag` is null)
                                        and  (`m_venue`.`delete_flag` = 0 or `m_venue`.`delete_flag` is null)
                                        and `t_race_result_record`.race_id = ?', [$raceId]);
        return $racesResultRecord;
    }

    //大会IDに紐づいたレース結果情報を取得
    public function getRaceResultRecord_tournId($tournId)
    {
        $racesResultRecord = DB::select('select 
                                        `t_race_result_record`.`race_result_record_id`, 
                                        `t_race_result_record`.`player_id`, 
                                        `t_race_result_record`.`jara_player_id`, 
                                        `t_race_result_record`.`player_name`, 
                                        `t_race_result_record`.`entrysystem_tourn_id`, 
                                        `t_race_result_record`.`tourn_id`, 
                                        `t_race_result_record`.`tourn_name`, 
                                        `t_race_result_record`.`race_id`, 
                                        `t_race_result_record`.`entrysystem_race_id`, 
                                        `t_race_result_record`.`race_number`, 
                                        `t_race_result_record`.`race_name`, 
                                        `t_race_result_record`.`org_id`, 
                                        `t_race_result_record`.`entrysystem_org_id`, 
                                        `t_race_result_record`.`org_name`, 
                                        `t_race_result_record`.`crew_name`, 
                                        `t_race_result_record`.`by_group`, 
                                        `t_race_result_record`.`event_id`, 
                                        `t_race_result_record`.`event_name`, 
                                        `t_race_result_record`.`range`, 
                                        `t_race_result_record`.`rank`, 
                                        `t_race_result_record`.`laptime_500m`, 
                                        `t_race_result_record`.`laptime_1000m`, 
                                        `t_race_result_record`.`laptime_1500m`, 
                                        `t_race_result_record`.`laptime_2000m`, 
                                        `t_race_result_record`.`final_time`, 
                                        `t_race_result_record`.`stroke_rate_avg`, 
                                        `t_race_result_record`.`stroke_rat_500m`, 
                                        `t_race_result_record`.`stroke_rat_1000m`, 
                                        `t_race_result_record`.`stroke_rat_1500m`, 
                                        `t_race_result_record`.`stroke_rat_2000m`, 
                                        `t_race_result_record`.`heart_rate_avg`, 
                                        `t_race_result_record`.`heart_rate_500m`, 
                                        `t_race_result_record`.`heart_rate_1000m`, 
                                        `t_race_result_record`.`heart_rate_1500m`, 
                                        `t_race_result_record`.`heart_rate_2000m`, 
                                        `t_race_result_record`.`official`, 
                                        `t_race_result_record`.`attendance`, 
                                        `t_race_result_record`.`ergo_weight`, 
                                        `t_race_result_record`.`player_height`, 
                                        `t_race_result_record`.`player_weight`, 
                                        `t_race_result_record`.`seat_number`, 
                                        `t_race_result_record`.`seat_name`, 
                                        `t_race_result_record`.`race_result_record_name`, 
                                        `t_race_result_record`.`start_datetime`, 
                                        `t_race_result_record`.`wind_speed_2000m_point`, 
                                        `t_race_result_record`.`wind_direction_2000m_point`, 
                                        `t_race_result_record`.`wind_speed_1000m_point`, 
                                        `t_race_result_record`.`wind_direction_1000m_point`, 
                                        `t_race_result_record`.`race_result_notes`,
                                        `m_seat_number`.`display_order` 	as "order",
                                        `t_tournaments`.`event_start_date` as "eventStartDate",
                                        `m_venue`.`venue_name`
                                        FROM `t_race_result_record` 
                                        left join `m_seat_number`
                                        on `t_race_result_record`.`seat_number` = `m_seat_number`.`seat_id`
                                        left join `t_tournaments`
                                        on `t_race_result_record`.`tourn_id` = `t_tournaments`.`tourn_id`
                                        left join `m_venue`
                                        on `t_tournaments`.`venue_id` = `m_venue`.`venue_id`
                                        where 1=1
                                        and `t_race_result_record`.delete_flag = 0                                        
                                        and  (`t_tournaments`.`delete_flag` = 0 or `t_tournaments`.`delete_flag` is null)
                                        and  (`m_seat_number`.`delete_flag` = 0 or `m_seat_number`.`delete_flag` is null)
                                        and  (`m_venue`.`delete_flag` = 0 or `m_venue`.`delete_flag` is null)
                                        and `t_race_result_record`.tourn_id = ?', [$tournId]);
        return $racesResultRecord;
    }

    //選手IDに紐づいたレース結果情報を取得 20240201
    public function getRaceResultRecord_playerId($playerId)
    {
        $racesResultRecord = DB::select('select 
                                        `t_race_result_record`.`race_result_record_id`, 
                                        `t_race_result_record`.`player_id`, 
                                        `t_race_result_record`.`jara_player_id`, 
                                        `t_race_result_record`.`player_name`, 
                                        `t_race_result_record`.`entrysystem_tourn_id`, 
                                        `t_race_result_record`.`tourn_id`, 
                                        `t_race_result_record`.`tourn_name`, 
                                        `t_race_result_record`.`race_id`, 
                                        `t_race_result_record`.`entrysystem_race_id`, 
                                        `t_race_result_record`.`race_number`, 
                                        `t_race_result_record`.`race_name`, 
                                        `t_race_result_record`.`org_id`, 
                                        `t_race_result_record`.`entrysystem_org_id`, 
                                        `t_race_result_record`.`org_name`, 
                                        `t_race_result_record`.`crew_name`, 
                                        `t_race_result_record`.`by_group`, 
                                        `t_race_result_record`.`event_id`, 
                                        `t_race_result_record`.`event_name` as eventName, 
                                        `t_race_result_record`.`range`, 
                                        `t_race_result_record`.`rank`, 
                                        `t_race_result_record`.`laptime_500m`, 
                                        `t_race_result_record`.`laptime_1000m`, 
                                        `t_race_result_record`.`laptime_1500m`, 
                                        `t_race_result_record`.`laptime_2000m`, 
                                        `t_race_result_record`.`final_time`, 
                                        `t_race_result_record`.`stroke_rate_avg`, 
                                        `t_race_result_record`.`stroke_rat_500m`, 
                                        `t_race_result_record`.`stroke_rat_1000m`, 
                                        `t_race_result_record`.`stroke_rat_1500m`, 
                                        `t_race_result_record`.`stroke_rat_2000m`, 
                                        `t_race_result_record`.`heart_rate_avg`, 
                                        `t_race_result_record`.`heart_rate_500m`, 
                                        `t_race_result_record`.`heart_rate_1000m`, 
                                        `t_race_result_record`.`heart_rate_1500m`, 
                                        `t_race_result_record`.`heart_rate_2000m`, 
                                        `t_race_result_record`.`official`, 
                                        `t_race_result_record`.`attendance`, 
                                        `t_race_result_record`.`ergo_weight`, 
                                        `t_race_result_record`.`player_height`, 
                                        `t_race_result_record`.`player_weight`, 
                                        `t_race_result_record`.`seat_number`, 
                                        `t_race_result_record`.`seat_name`, 
                                        `t_race_result_record`.`race_result_record_name`, 
                                        `t_race_result_record`.`start_datetime`, 
                                        `t_race_result_record`.`wind_speed_2000m_point`, 
                                        `t_race_result_record`.`wind_direction_2000m_point`, 
                                        `t_race_result_record`.`wind_speed_1000m_point`, 
                                        `t_race_result_record`.`wind_direction_1000m_point`, 
                                        `t_race_result_record`.`race_result_notes`,
                                        `m_seat_number`.`display_order` 	as "order",
                                        `t_tournaments`.`event_start_date` as "eventStartDate",
                                        `m_venue`.`venue_name`,
                                        `m_events`.`event_name` 
                                        FROM `t_race_result_record` 
                                        left join `m_seat_number`
                                        on `t_race_result_record`.`seat_number` = `m_seat_number`.`seat_id`
                                        left join `t_tournaments`
                                        on `t_race_result_record`.`tourn_id` = `t_tournaments`.`tourn_id`
                                        left join `m_venue`
                                        on `t_tournaments`.`venue_id` = `m_venue`.`venue_id`
                                        left join `m_events`
                                        on `t_race_result_record`.`event_id` = `m_events`.`event_id`
                                        where 1=1
                                        and `t_race_result_record`.delete_flag = 0                                        
                                        and  (`t_tournaments`.`delete_flag` = 0 or `t_tournaments`.`delete_flag` is null)
                                        and  (`m_seat_number`.`delete_flag` = 0 or `m_seat_number`.`delete_flag` is null)
                                        and  (`m_venue`.`delete_flag` = 0 or `m_venue`.`delete_flag` is null)
                                        and `t_race_result_record`.player_id = ?', [$playerId]);
        // Log::debug($racesResultRecord);
        return $racesResultRecord;
    }

    //クルー一覧に表示する選手の情報を取得
    public function getRaceResultRecord_crewData($raceId, $crewName, $orgId)
    {
        $racesResultRecord = DB::select('select `race_result_record_id`,  
        `player_name`, 
        `player_height`, 
        `player_weight`, 
        `seat_number`, 
        `t_race_result_record`.`seat_name`, 
        `t_race_result_record`.`delete_flag`, 
        `m_seat_number`.`display_order`
        FROM `t_race_result_record` 
        left join `m_seat_number`
        on `t_race_result_record`.`seat_number` = `m_seat_number`.`seat_id`
        where `t_race_result_record`.delete_flag=0 
        and `t_race_result_record`.race_id = ?
        and `t_race_result_record`.crew_name = ?
        and `t_race_result_record`.org_id = ?', [$raceId, $crewName, $orgId]);

        return $racesResultRecord;
    }

    public function insertRaceResultRecord($raceResultRecordInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::insert(
                'insert into t_race_result_record
                (
                    `race_result_record_id`, 
                    `player_id`, 
                    `jara_player_id`, 
                    `player_name`, 
                    `entrysystem_tourn_id`,
                    `tourn_id`, 
                    `tourn_name`, 
                    `race_id`, 
                    `entrysystem_race_id`, 
                    `race_number`, 
                    `race_name`, 
                    `org_id`, 
                    `entrysystem_org_id`, 
                    `org_name`, 
                    `crew_name`, 
                    `by_group`, 
                    `event_id`, 
                    `event_name`, 
                    `range`, 
                    `rank`, 
                    `laptime_500m`, 
                    `laptime_1000m`, 
                    `laptime_1500m`, 
                    `laptime_2000m`, 
                    `final_time`, 
                    `stroke_rate_avg`, 
                    `stroke_rat_500m`, 
                    `stroke_rat_1000m`, 
                    `stroke_rat_1500m`, 
                    `stroke_rat_2000m`, 
                    `heart_rate_avg`, 
                    `heart_rate_500m`, 
                    `heart_rate_1000m`, 
                    `heart_rate_1500m`, 
                    `heart_rate_2000m`, 
                    `official`, 
                    `attendance`, 
                    `ergo_weight`, 
                    `player_height`, 
                    `player_weight`, 
                    `seat_number`, 
                    `seat_name`, 
                    `race_result_record_name`, 
                    `start_datetime`, 
                    `wind_speed_2000m_point`, 
                    `wind_direction_2000m_point`, 
                    `wind_speed_1000m_point`, 
                    `wind_direction_1000m_point`, 
                    `registered_time`, 
                    `registered_user_id`, 
                    `updated_time`, 
                    `updated_user_id`, 
                    `delete_flag`
                    )VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [
                    $raceResultRecordInfo['race_result_record_id'],
                    $raceResultRecordInfo['player_id'],
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
                    $raceResultRecordInfo['player_height'],
                    $raceResultRecordInfo['player_weight'],
                    $raceResultRecordInfo['seat_number'],
                    $raceResultRecordInfo['seat_name'],
                    $raceResultRecordInfo['race_result_record_name'],
                    $raceResultRecordInfo['start_datetime'],
                    $raceResultRecordInfo['wind_speed_2000m_point'],
                    $raceResultRecordInfo['wind_direction_2000m_point'],
                    $raceResultRecordInfo['wind_speed_1000m_point'],
                    $raceResultRecordInfo['wind_direction_1000m_point'],
                    now()->format('Y-m-d H:i:s.u'),
                    Auth::user()->user_id,
                    now()->format('Y-m-d H:i:s.u'),
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

    //出漕結果情報一覧のinterfaceでinsert実行
    //登録日時、更新日時は「current_time」
    //登録ユーザー、更新ユーザーは「user_id」
    //で指定すること
    public function insertRaceResultRecordResponse($raceResultRecordResponse)
    {
        DB::insert('insert into t_race_result_record
                    (
                        `player_id`, 
                        `jara_player_id`, 
                        `player_name`, 
                        `entrysystem_tourn_id`,
                        `tourn_id`, 
                        `tourn_name`, 
                        `race_id`, 
                        `entrysystem_race_id`, 
                        `race_number`, 
                        `race_name`, 
                        `race_class_id`,
                        `race_class_name`,                        
                        `org_id`, 
                        `entrysystem_org_id`, 
                        `org_name`, 
                        `crew_name`, 
                        `by_group`, 
                        `event_id`, 
                        `event_name`, 
                        `range`, 
                        `start_datetime`, 
                        `registered_time`, 
                        `registered_user_id`, 
                        `updated_time`, 
                        `updated_user_id`, 
                        `delete_flag`
                    )VALUES
                    (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                ,[
                    $raceResultRecordResponse["player_id"],
                    $raceResultRecordResponse["jara_player_id"],
                    $raceResultRecordResponse["player_name"],
                    $raceResultRecordResponse["entrysystem_tourn_id"],
                    $raceResultRecordResponse["tourn_id"],
                    $raceResultRecordResponse["tourn_name"],
                    $raceResultRecordResponse["race_id"],
                    $raceResultRecordResponse["entrysystem_race_id"],
                    $raceResultRecordResponse["race_number"],
                    $raceResultRecordResponse["race_name"],
                    $raceResultRecordResponse["race_class_id"],
                    $raceResultRecordResponse["race_class_name"],
                    $raceResultRecordResponse["org_id"],
                    $raceResultRecordResponse["entrysystem_org_id"],
                    $raceResultRecordResponse["org_name"],
                    $raceResultRecordResponse["crew_name"],
                    $raceResultRecordResponse["by_group"],
                    $raceResultRecordResponse["event_id"],
                    $raceResultRecordResponse["event_name"],
                    $raceResultRecordResponse["range"],
                    $raceResultRecordResponse["start_datetime"],
                    $raceResultRecordResponse["current_datetime"],
                    $raceResultRecordResponse["user_id"],
                    $raceResultRecordResponse["current_datetime"],
                    $raceResultRecordResponse["user_id"],
                    0
                ]);
        //挿入したIDを取得
        $insertId =  DB::getPdo()->lastInsertId();
        return $insertId;
    }

    public function updateRaceResultRecord($raceResultRecordInfo)
    {
        //dd($raceResultRecordInfo['tourn_id'],$raceResultRecordInfo['delete_flag']);
        $result = "success";
        DB::beginTransaction();
        try {
            DB::update(
                'update t_race_result_record set `player_id`=?,`jara_player_id`=?,`player_name`=?,`entrysystem_tourn_id`=?,`tourn_id`=?,`tourn_name`=?,`race_id`=?,`entrysystem_race_id`=?,`race_number`=?,`race_name`=?,`org_id`=?, `entrysystem_org_id`=?,`org_name`=?,`crew_name`=?,`by_group`=?,`event_id`=?,`event_name`=?,`range`=?,`rank`=?,`laptime_500m`=?,`laptime_1000m`=?,`laptime_1500m`=?,`laptime_2000m`=?,`final_time`=?, `stroke_rate_avg`=?,`stroke_rat_500m`=?,`stroke_rat_1000m`=?,`stroke_rat_1500m`=?,`stroke_rat_2000m`=?,`heart_rate_avg`=?,`heart_rate_500m`=?,`heart_rate_1000m`=?,`heart_rate_1500m`=?,`heart_rate_2000m`=?, `official`=?,`attendance`=?,`ergo_weight`=?,`player_height`=?,`player_weight`=?,`seat_number`=?,`seat_name`=?,`race_result_record_name`=?,`start_datetime`=?,`wind_speed_2000m_point`=?,`wind_direction_2000m_point`=?,`wind_speed_1000m_point`=?,`wind_direction_1000m_point`=?,`registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? WHERE `tourn_id` = ?',
                [
                    $raceResultRecordInfo['player_id'],
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
                    $raceResultRecordInfo['player_height'],
                    $raceResultRecordInfo['player_weight'],
                    $raceResultRecordInfo['seat_number'],
                    $raceResultRecordInfo['seat_name'],
                    $raceResultRecordInfo['race_result_record_name'],
                    $raceResultRecordInfo['start_datetime'],
                    $raceResultRecordInfo['wind_speed_2000m_point'],
                    $raceResultRecordInfo['wind_direction_2000m_point'],
                    $raceResultRecordInfo['wind_speed_1000m_point'],
                    $raceResultRecordInfo['wind_direction_1000m_point'],
                    now()->format('Y-m-d H:i:s.u'),
                    1, //Auth::user()->user_id,
                    now()->format('Y-m-d H:i:s.u'),
                    1, //Auth::user()->user_id,
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

    public function updateRaceResultRecordsResponse($raceResultRecordsResponse)
    {
        DB::update('update t_race_result_record
                    set
                    `player_id` = :player_id
                    ,`jara_player_id` = :jara_player_id
                    ,`player_name` = :player_name
                    ,`entrysystem_tourn_id` = :entrysystem_tourn_id
                    ,`tourn_id` = :tourn_id
                    ,`tourn_name` = :tourn_name
                    ,`race_id` = :race_id
                    ,`entrysystem_race_id` = :entrysystem_race_id
                    ,`race_number` = :race_number
                    ,`race_name` = :race_name
                    ,`race_class_id` = :race_class_id
                    ,`race_class_name` = :race_class_name
                    ,`org_id` = :org_id
                    ,`entrysystem_org_id` = :entrysystem_org_id
                    ,`org_name` = :org_name
                    ,`crew_name` = :crew_name
                    ,`by_group` = :by_group
                    ,`event_id` = :event_id
                    ,`event_name` = :event_name
                    ,`range` = :range
                    ,`start_datetime` = :start_datetime
                    ,`updated_time` = :updated_time
                    ,`updated_user_id` = :updated_user_id
                    WHERE `race_result_record_id` = :race_result_record_id'
                    ,$raceResultRecordsResponse);
    }

    public function deleteRaceResultRecord_playerId($raceResultRecordInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::update(
                'update t_race_result_record set `registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? where `player_id` = ?',
                [
                    now()->format('Y-m-d H:i:s.u'),
                    Auth::user()->user_id,
                    now()->format('Y-m-d H:i:s.u'),
                    Auth::user()->user_id,
                    1,
                    $raceResultRecordInfo['player_id'], //where条件
                ]
            );

            DB::commit();
            return $result;
        } catch (\Throwable $e) {
            $result = "failed";
            return $result;
        }
    }

    //団体IDを条件として出漕結果記録テーブル内の大会IDを取得する
    public function getTournamentIdForResultsRecord($targetOrgId)
    {
        $tournamentIds = DB::select(
            'select `tourn_id`
                                        from `t_race_result_record`
                                        where `delete_flag`=0
                                        and `org_id`= :org_id',
            $targetOrgId
        );
        return $tournamentIds;
    }

    //エントリー大会ID、エントリーレースID、JARA選手IDが一致する公式のレース結果の件数を取得する
    public function getTargetOfficialRaceCount($values,$searchCondition)
    {
        Log::debug("getTargetOfficialRaceCount start.");
        $sqlString = 'select count(*)    as "target_race_count"
                        FROM `t_race_result_record` rrr
                        where 1=1
                        and rrr.`delete_flag` = 0
                        and rrr.`official` = 1	#公式大会
                        #ReplaceConditionString#';
        $sqlString = str_replace('#SearchCondition#', $searchCondition, $sqlString);
        $target_race_count = DB::select($sql_string,$values);
        Log::debug("getTargetOfficialRaceCount end.");
        return $target_race_count;
    }

    //エントリー大会ID、エントリーレースID、JARA選手IDが一致する公式のレース結果を取得する
    public function getTargetOfficialRace($conditions)
    {
        $target_race = DB::select('select
                                        rrr.`race_result_record_id`
                                        ,tour.`tourn_id`				#大会ID
                                        ,tour.`entrysystem_tourn_id`	#既存大会ID
                                        ,tour.`tourn_name`				#大会名
                                        ,race.`race_id`					#レースID
                                        ,race.`entrysystem_race_id`		#既存レースID
                                        ,race.`race_number`             #レースNo.
                                        ,race.`race_name`				#レース名
                                        ,org.`org_id`					#団体ID
                                        ,org.`entrysystem_org_id`		#既存団体ID
                                        ,org.`org_name`					#団体名
                                        ,ply.`player_id`				#選手名
                                        ,ply.`jara_player_id`			#既存選手ID
                                        ,ply.`player_name`				#選手名
                                        ,ply.`height`					#選手身長
                                        ,ply.`weight`					#選手体重
                                        FROM `t_race_result_record` rrr
                                        left join `t_tournaments` tour
                                        on rrr.`tourn_id` = tour.`tourn_id`
                                        left join `t_races` race
                                        on rrr.`race_id` = race.`race_id`
                                        left join `t_organizations` org
                                        on rrr.`org_id` = org.`org_id`
                                        left join t_players ply
                                        on rrr.`player_id` = ply.`player_id`
                                        where 1=1
                                        and rrr.`delete_flag` = 0
                                        and  (tour.`delete_flag` = 0 or tour.`delete_flag` is null)
                                        and  (race.`delete_flag` = 0 or race.`delete_flag` is null)
                                        and  (org.`delete_flag` = 0 or org.`delete_flag` is null)
                                        and  (ply.`delete_flag` = 0 or ply.`delete_flag` is null)
                                        and rrr.`official` = 1	#公式大会
                                        and rrr.`entrysystem_tourn_id` = :entrysystem_tourn_id	#エントリーシステムID
                                        and rrr.`entrysystem_race_id` = :entrysystem_race_id	#エントリーレースID
                                        and rrr.`jara_player_id` = :jara_player_id				#jara選手コード
                                    ',$conditions);
        return $target_race;
    }

    //大会ID、レースID、選手IDが一致する非公式のレース結果件数を取得する
    public function getTargetUnofficialRaceCount($conditions)
    {
        $target_race_count = DB::select('select count(*)    as "target_race_count"
                                            FROM `t_race_result_record` rrr
                                            where 1=1
                                            and rrr.`delete_flag` = 0
                                            and rrr.`official` = 0	                                #非公式大会
                                            and rrr.`tourn_id` = :tourn_id	        #大会ID
                                            and rrr.`race_id` = :race_id	        #レースID
                                            and rrr.`player_id` = :player_id		#選手ID
                                        ',$conditions);
        return $target_race_count;
    }

    //大会ID、レースID、選手IDが一致する非公式のレース結果を取得する
    public function getTargetUnofficialRace($conditions)
    {
        $target_race_count = DB::select('select
                                            rrr.`race_result_record_id`     
                                            ,tour.`tourn_id`				#大会ID
                                            ,tour.`entrysystem_tourn_id`	#既存大会ID
                                            ,tour.`tourn_name`				#大会名
                                            ,race.`race_id`					#レースID
                                            ,race.`entrysystem_race_id`		#既存レースID
                                            ,race.`race_number`             #レースNo.
                                            ,race.`race_name`				#レース名
                                            ,org.`org_id`					#団体ID
                                            ,org.`entrysystem_org_id`		#既存団体ID
                                            ,org.`org_name`					#団体名
                                            ,ply.`player_id`				#選手名
                                            ,ply.`jara_player_id`			#既存選手ID
                                            ,ply.`player_name`				#選手名
                                            ,ply.`height`					#選手身長
                                            ,ply.`weight`					#選手体重
                                            FROM `t_race_result_record` rrr
                                            left join `t_tournaments` tour
                                            on rrr.`tourn_id` = tour.`tourn_id`
                                            left join `t_races` race
                                            on rrr.`race_id` = race.`race_id`
                                            left join `t_organizations` org
                                            on rrr.`org_id` = org.`org_id`
                                            left join t_players ply
                                            on rrr.`player_id` = ply.`player_id`
                                            where 1=1
                                            and rrr.`delete_flag` = 0
                                            and  (tour.`delete_flag` = 0 or tour.`delete_flag` is null)
                                            and  (race.`delete_flag` = 0 or race.`delete_flag` is null)
                                            and  (org.`delete_flag` = 0 or org.`delete_flag` is null)
                                            and  (ply.`delete_flag` = 0 or ply.`delete_flag` is null)
                                            and rrr.`official` = 0	#非公式大会
                                            and rrr.`entrysystem_tourn_id` = :entrysystem_tourn_id	#エントリーシステムID
                                            and rrr.`entrysystem_race_id` = :entrysystem_race_id	#エントリーレースID
                                            and rrr.`jara_player_id` = :jara_player_id				#jara選手コード
                                        ',$conditions);
        return $target_race_count;
    }

    //出漕結果記録テーブルを更新する
    //大会結果情報一括登録画面用
    public function updateBulkRaceResultRecord($values)
    {
        DB::update('update `t_race_result_record`
                        SET `player_id`= :player_id,
                            `jara_player_id`= :jara_player_id,
                            `player_name`= :player_name,
                            `entrysystem_tourn_id`= :entrysystem_tourn_id,
                            `tourn_id`= :tourn_id,
                            `tourn_name`= :tourn_name,
                            `race_id`= :race_id,
                            `entrysystem_race_id`= :entrysystem_race_id,
                            `race_name`= :race_name,
                            `org_id`= :org_id,
                            `entrysystem_org_id`= :entrysystem_org_id,
                            `org_name`= :org_name,
                            `crew_name`= :crew_name,
                            `rank`= :rank,
                            `laptime_500m`= :laptime_500m,
                            `laptime_1000m`= :laptime_1000m,
                            `laptime_1500m`= :laptime_1500m,
                            `laptime_2000m`= :laptime_2000m,
                            `final_time`= :final_time,
                            `stroke_rate_avg`= :stroke_rate_avg,
                            `stroke_rat_500m`= :stroke_rat_500m,
                            `stroke_rat_1000m`= :stroke_rat_1000m,
                            `stroke_rat_1500m`= :stroke_rat_1500m,
                            `stroke_rat_2000m`= :stroke_rat_2000m,
                            `heart_rate_avg`= :heart_rate_avg,
                            `heart_rate_500m`= :heart_rate_500m,
                            `heart_rate_1000m`= :heart_rate_1000m,
                            `heart_rate_1500m`= :heart_rate_1500m,
                            `heart_rate_2000m`= :heart_rate_2000m,
                            `official`= :official,
                            `attendance`= :attendance,
                            `ergo_weight`= :ergo_weight,
                            `player_height`= :player_height,
                            `player_weight`= :player_weight,
                            `seat_number`= :seat_number,
                            `race_result_record_name`= :race_result_record_name,
                            `updated_time`= :updated_time,
                            `updated_user_id`= :user_id
                            WHERE 1=1
                            and `race_result_record_id` = :race_result_record_id'
                            ,$values);
    }

    //出漕結果記録テーブルに挿入する
    //大会結果情報一括登録画面用
    public function insertBulkRaceResultRecord($values)
    {
        DB::insert('insert INTO `t_race_result_record`
                    (
                        `player_id`,
                        `jara_player_id`, 
                        `player_name`, 
                        `entrysystem_tourn_id`, 
                        `tourn_id`, 
                        `tourn_name`, 
                        `race_id`,
                        `entrysystem_race_id`, 
                        `race_number`, 
                        `race_name`, 
                        `race_class_id`,
                        `race_class_name`,
                        `org_id`, 
                        `entrysystem_org_id`, 
                        `org_name`, 
                        `crew_name`, 
                        `by_group`, 
                        `event_id`, 
                        `event_name`, 
                        `range`, 
                        `rank`, 
                        `laptime_500m`, 
                        `laptime_1000m`, 
                        `laptime_1500m`, 
                        `laptime_2000m`, 
                        `final_time`, 
                        `stroke_rate_avg`, 
                        `stroke_rat_500m`, 
                        `stroke_rat_1000m`, 
                        `stroke_rat_1500m`, 
                        `stroke_rat_2000m`, 
                        `heart_rate_avg`, 
                        `heart_rate_500m`, 
                        `heart_rate_1000m`, 
                        `heart_rate_1500m`, 
                        `heart_rate_2000m`, 
                        `official`, 
                        `attendance`, 
                        `ergo_weight`, 
                        `player_height`, 
                        `player_weight`, 
                        `seat_number`, 
                        `seat_name`, 
                        `race_result_record_name`, 
                        `start_datetime`, 
                        `weather`,
                        `wind_speed_2000m_point`, 
                        `wind_direction_2000m_point`, 
                        `wind_speed_1000m_point`, 
                        `wind_direction_1000m_point`,
                        `race_result_notes`, 
                        `registered_time`,
                        `registered_user_id`, 
                        `updated_time`, 
                        `updated_user_id`, 
                        `delete_flag`
                    )
                    VALUES
                    (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                ,[
                    $values['player_id']
                    ,$values['jara_player_id']
                    ,$values['player_name']
                    ,$values['entrysystem_tourn_id']
                    ,$values['tourn_id']
                    ,$values['tourn_name']
                    ,$values['race_id']
                    ,$values['entrysystem_race_id']
                    ,$values['race_number']
                    ,$values['race_name']
                    ,$values['race_class_id']
                    ,$values['race_class_name']
                    ,$values['org_id']
                    ,$values['entrysystem_org_id']
                    ,$values['org_name']
                    ,$values['crew_name']
                    ,$values['by_group']
                    ,$values['event_id']
                    ,$values['event_name']
                    ,$values['range']
                    ,$values['rank']
                    ,$values['laptime_500m']
                    ,$values['laptime_1000m']
                    ,$values['laptime_1500m']
                    ,$values['laptime_2000m']
                    ,$values['final_time']
                    ,$values['stroke_rate_avg']
                    ,$values['stroke_rat_500m']
                    ,$values['stroke_rat_1000m']
                    ,$values['stroke_rat_1500m']
                    ,$values['stroke_rat_2000m']
                    ,$values['heart_rate_avg']
                    ,$values['heart_rate_500m']
                    ,$values['heart_rate_1000m']
                    ,$values['heart_rate_1500m']
                    ,$values['heart_rate_2000m']
                    ,$values['official']
                    ,$values['attendance']
                    ,$values['ergo_weight']
                    ,$values['player_height']
                    ,$values['player_weight']
                    ,$values['seat_number']
                    ,$values['seat_name']
                    ,$values['race_result_record_name']
                    ,$values['start_datetime']
                    ,$values['weather']
                    ,$values['wind_speed_2000m_point']
                    ,$values['wind_direction_2000m_point']
                    ,$values['wind_speed_1000m_point']
                    ,$values['wind_direction_1000m_point']
                    ,$values['race_result_notes']
                    ,$values['registered_time']
                    ,$values['user_id']
                    ,$values['registered_time']
                    ,$values['user_id']
                    ,0
                ]);
        //挿入したIDを取得
        $insertId =  DB::getPdo()->lastInsertId();
        return $insertId;
    }

    //クルーの情報を取得
    public function getCrews($values)
    {
        $crews = DB::select('select
                            rrr.`player_id`
                            ,msn.`seat_id`
                            ,msn.`seat_name`
                            ,msn.`seat_addr_name`
                            ,rrr.`player_name`
                            ,rrr.`player_height`
                            ,rrr.`player_weight`
                            ,msn.`display_order` as `order`
                            from `t_race_result_record` rrr
                            left join `m_seat_number` msn
                            on rrr.seat_number = msn.seat_id
                            where 1=1
                            and rrr.`delete_flag` = 0
                            and (msn.`delete_flag` = 0 or msn.`delete_flag` is null)
                            and rrr.race_id = :race_id
                            and rrr.crew_name = :crew_name
                            and rrr.org_id = :org_id
                            order by msn.`display_order`'
                        ,$values);
        return $crews;    
    }

    //検索条件により、レース結果を取得する
    public function getRaceResultRecordsWithSearchCondition($conditionValues)
    {
        $races = DB::select('select
                            `race_result_record_id`
                            ,`race_id`
                            ,`race_name`
                            ,`race_number`
                            ,`race_class_id`
                            ,`race_class_name` 
                            ,`by_group`
                            ,`laptime_500m`
                            ,`laptime_1000m`
                            ,`laptime_1500m`
                            ,`laptime_2000m`
                            ,`final_time`
                            FROM `t_race_result_record`
                            where 1=1
                            and delete_flag = 0
                            and tourn_id = :tourn_id
                            and race_id = :race_id
                            and org_id = :org_id
                            and player_id = :player_id
                            ',$conditionValues);
        return $races;
    }

    //レースIDを条件としてレース結果情報を取得する
    public function getRaceResultRecordsFromRaceId($race_id)
    {
        $race_result_records = DB::select("select
                                            rrr.`race_result_record_id`
                                            ,rrr.`range`                        #距離
                                            ,rrr.`start_datetime`               #発艇日時
                                            ,rrr.`weather`                      #天候
                                            ,rrr.`wind_direction_1000m_point`   #1000m地点風向
                                            ,rrr.`wind_speed_1000m_point`       #1000m地点風速
                                            ,rrr.`wind_direction_2000m_point`   #2000m地点風向
                                            ,rrr.`wind_speed_2000m_point`       #2000m地点風速
                                            ,case
                                                when rrr.`org_id` is null then rrr.`org_id`
                                                else rrr.`org_name`
                                                end as `org_name              #所属団体`
                                            ,rrr.`crew_name`                  #クルー名
                                            ,rrr.`lane_number`                #出漕レーンNo.
                                            ,rrr.`rank`                       #順位
                                            ,rrr.`laptime_500m`               #500mラップタイム
                                            ,rrr.`laptime_1000m`              #1000mラップタイム
                                            ,rrr.`laptime_1500m`              #1500mラップタイム
                                            ,rrr.`laptime_2000m`              #2000mラップタイム
                                            ,rrr.`final_time`                 #最終タイム
                                            ,rrr.`race_result_notes`          #備考
                                            ,rrr.`stroke_rat_500m`            #500mストロークレート
                                            ,rrr.`stroke_rat_1000m`           #1000mストロークレート
                                            ,rrr.`stroke_rat_1500m`           #1500mストロークレート
                                            ,rrr.`stroke_rat_2000m`           #2000mストロークレート
                                            ,rrr.`stroke_rate_avg`            #ストロークレート(平均)
                                            ,rrr.`player_id`                  #選手ID
                                            ,rrr.`player_name`                #選手名
                                            ,sex.`sex`                        #性別
                                            ,case
                                                when rrr.`player_height` is null then ply.`height`
                                                else rrr.`player_height`
                                                end as `player_height`        #身長
                                            ,case
                                                when rrr.`player_weight` is null then ply.`weight`
                                                else rrr.`player_weight`
                                                end as `player_weight`        #体重
                                            ,rrr.`seat_number`                #シート番号
                                            ,rrr.`heart_rate_500m`            #500m心拍数
                                            ,rrr.`heart_rate_1000m`           #1000m心拍数
                                            ,rrr.`heart_rate_1500m`           #1500m心拍数
                                            ,rrr.`heart_rate_2000m`           #2000m心拍数
                                            ,rrr.`heart_rate_avg`             #心拍数（平均）
                                            ,rrr.`attendance`                 #立会有無
                                            FROM `t_race_result_record` rrr
                                            left join `t_players` ply
                                            on rrr.`player_id` = ply.`player_id`
                                            left join `m_sex` sex
                                            on ply.`sex_id` = sex.`sex_id`
                                            where 1=1
                                            and rrr.`delete_flag` = 0
                                            and (ply.`delete_flag` = 0 or ply.`delete_flag` is null)
                                            and (sex.`delete_flag` = 0 or sex.`delete_flag` is null)
                                            and rrr.race_id = :race_id"
                                            ,$race_id);
        return $race_result_records;
    }

    //対象のレースに出漕結果の件数を取得する
    public function getIsExistsTargetRaceResult($race_id)
    {
        $is_exists = DB::select("select count(*) as `result`
                                from t_race_result_record
                                where 1=1
                                and race_id = :race_id
                                and delete_flag = 0"
                                ,$race_id);
        return $is_exists;
    }

    //対象の出漕結果の件数を取得する
    public function getIsExistsTargetRaceResultRecord($race_result_record_id)
    {
        $is_exists = DB::select("select count(*) as `result`
                                from t_race_result_record
                                where 1=1
                                and race_result_record_id = :race_result_record_id
                                and delete_flag = 1"
                                ,$race_result_record_id);
        return $is_exists;
    }

    //対象のレース結果情報の削除フラグを有効にする
    public function updateDeleteFlagToValid($values)
    {
        DB::update("update t_race_result_record
                    set delete_flag = 1
                    ,updated_time = :updated_datetime
                    ,updated_user_id = :updated_user_id
                    where 1=1
                    and race_result_record_id = :race_result_record_id"
                    ,$values);
    }
}