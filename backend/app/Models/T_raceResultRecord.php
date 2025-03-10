<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
    public function getRaceResultRecord_raceId($raceId)
    {
        $racesResultRecord = DB::select(
            'SELECT DISTINCT
                `t_race_result_record`.`race_id`, 
                `t_race_result_record`.`race_number`, 
                `t_race_result_record`.`race_name`, 
                `t_race_result_record`.`crew_name`, 
                `t_race_result_record`.`by_group`, 
                `t_race_result_record`.`event_id`, 
                `t_race_result_record`.`event_name`,
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
                `t_race_result_record`.`official`, 
                `t_race_result_record`.`start_datetime`, 
                `t_race_result_record`.`wind_speed_2000m_point`, 
                wd2000p.`wind_direction` AS wind_direction_2000m_point, 
                `t_race_result_record`.`wind_speed_1000m_point`, 
                wd1000p.`wind_direction` AS wind_direction_1000m_point, 
                mrrn.race_result_notes,
                `t_tournaments`.`tourn_id`,
                `t_tournaments`.`tourn_name`,
                `t_race_result_record`.range,
                `t_tournaments`.`venue_id` AS `venue_id`,
                `t_tournaments`.`venue_name`,
                `t_race_result_record`.org_id
            FROM `t_race_result_record` 
            INNER JOIN `t_tournaments` ON
                `t_tournaments`.`tourn_id` = `t_race_result_record`.`tourn_id`
                AND `t_tournaments`.`delete_flag` = 0
            LEFT OUTER JOIN `m_wind_direction` wd2000p ON
                wd2000p.`wind_direction_id` = `t_race_result_record`.`wind_direction_2000m_point`
                AND wd2000p.`delete_flag` = 0
            LEFT OUTER JOIN `m_wind_direction` wd1000p ON
                wd1000p.`wind_direction_id` = `t_race_result_record`.`wind_direction_1000m_point`
                AND wd1000p.`delete_flag` = 0
            LEFT OUTER JOIN `m_venue` ON
                `m_venue`.venue_id = `t_tournaments`.venue_id
                AND `m_venue`.`delete_flag` = 0
            LEFT OUTER JOIN `m_race_result_notes` mrrn ON
                mrrn.race_result_notes_id = `t_race_result_record`.race_result_notes_id
                AND mrrn.`delete_flag` = 0
            WHERE 1=1
                AND `t_race_result_record`.delete_flag = 0                                        
                AND `t_race_result_record`.race_id = ?',
            [$raceId]
        );
        return $racesResultRecord;
    }

    //選手IDに紐づいたレース結果情報を取得 20240201
    public function getRaceResultRecord_playerId($playerId)
    {
        $racesResultRecord = DB::select(
            'SELECT 
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
                `t_race_result_record`.`event_name` AS eventName, 
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
                `t_race_result_record`.`player_height`, 
                `t_race_result_record`.`player_weight`, 
                `t_race_result_record`.`seat_number`, 
                `t_race_result_record`.`seat_name`, 
                `t_race_result_record`.`race_result_record_name`, 
                `t_race_result_record`.`start_datetime`, 
                `t_race_result_record`.`wind_speed_2000m_point`, 
                `t_race_result_record`.`wind_direction_2000m_point`, 
                `mwd2000`.`wind_direction` AS `twentyHundredmWindDirectionName`,                                         
                `t_race_result_record`.`wind_speed_1000m_point`, 
                `t_race_result_record`.`wind_direction_1000m_point`, 
                `mwd1000`.`wind_direction` AS `tenHundredmWindDirectionName`,
                mrrn.race_result_notes,
                `m_seat_number`.`display_order` AS "order",
                `t_tournaments`.`event_start_date` AS "eventStartDate",
                `m_venue`.`venue_name`,
                `m_events`.`event_name` 
            FROM `t_race_result_record` 
            LEFT OUTER JOIN `m_seat_number` ON
                `m_seat_number`.`seat_id` = `t_race_result_record`.`seat_number`
                AND `m_seat_number`.`delete_flag` = 0
            # NOTE: 関連テーブルが削除されたとしてもレース結果は表示するため外部結合する。
            LEFT OUTER JOIN `t_tournaments` ON
                `t_tournaments`.`tourn_id` = `t_race_result_record`.`tourn_id`
                AND `t_tournaments`.`delete_flag` = 0
            LEFT OUTER JOIN `m_venue` ON
                `m_venue`.`venue_id` = `t_tournaments`.`venue_id`
                AND `m_venue`.`delete_flag` = 0
            LEFT OUTER JOIN `m_events` ON
                `m_events`.`event_id` = `t_race_result_record`.`event_id`
                AND `m_events`.`delete_flag` = 0
            LEFT OUTER JOIN `m_wind_direction` mwd1000 ON
                mwd1000.`wind_direction_id` = `t_race_result_record`.`wind_direction_1000m_point`
                AND `mwd1000`.`delete_flag` = 0
            LEFT OUTER JOIN `m_wind_direction` mwd2000 ON
                mwd2000.`wind_direction_id` = `t_race_result_record`.`wind_direction_2000m_point`
                AND `mwd2000`.`delete_flag` = 0
            LEFT OUTER JOIN `m_race_result_notes` mrrn ON
                mrrn.race_result_notes_id = `t_race_result_record`.race_result_notes_id
                AND mrrn.`delete_flag` = 0
            WHERE 1=1
                AND `t_race_result_record`.delete_flag = 0                                        
                AND `t_race_result_record`.player_id = ?',
            [$playerId]
        );
        return $racesResultRecord;
    }

    //マイページ 出漕履歴用 選手IDに紐づいたレース結果情報を取得 20241015
    public function getMyPageRaceResultRecordInfo($playerId, $official)
    {
        $racesResultRecord = DB::select(
            'SELECT 
                `t_race_result_record`.`race_id` as `raceId`,
                `t_race_result_record`.`tourn_name` as `tournName`,
                `t_race_result_record`.`official`,
                `t_race_result_record`.`start_datetime` as `startDateTime`, 
                `t_race_result_record`.`race_number` as `raceNumber`, 
                `t_race_result_record`.`race_name` as `raceName`, 
                `t_race_result_record`.`by_group` as `byGroup`
            FROM `t_race_result_record`
            # 大会、レースが削除されていても出漕結果記録は表示する。
            LEFT OUTER JOIN `t_tournaments` ON
                `t_tournaments`.`tourn_id` = `t_race_result_record`.`tourn_id`
                AND `t_tournaments`.delete_flag = 0
            LEFT OUTER JOIN `t_races` ON
                `t_races`.`race_id` = `t_race_result_record`.`race_id`
                AND `t_races`.delete_flag = 0
            WHERE 1=1
                AND `t_race_result_record`.delete_flag = 0
                AND `t_race_result_record`.player_id = ?
                AND `t_race_result_record`.official = ?
                ORDER BY `t_race_result_record`.`start_datetime` DESC',
            [$playerId, $official]
        );
        return $racesResultRecord;
    }

    //出漕結果情報一覧のinterfaceでinsert実行
    //登録日時、更新日時は「current_time」
    //登録ユーザー、更新ユーザーは「user_id」
    //で指定すること
    public function insertRaceResultRecordResponse($raceResultRecordResponse)
    {
        DB::insert(
            'insert into t_race_result_record
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
                        `official`, 
                        `seat_number`,
                        `seat_name`,
                        `start_datetime`, 
                        `registered_time`, 
                        `registered_user_id`, 
                        `updated_time`, 
                        `updated_user_id`, 
                        `delete_flag`
                    )VALUES
                    (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [
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
                $raceResultRecordResponse["official"],
                $raceResultRecordResponse["seat_number"],
                $raceResultRecordResponse["seat_name"],
                $raceResultRecordResponse["start_datetime"],
                $raceResultRecordResponse["current_datetime"],
                $raceResultRecordResponse["user_id"],
                $raceResultRecordResponse["current_datetime"],
                $raceResultRecordResponse["user_id"],
                0
            ]
        );
        //挿入したIDを取得
        $insertId =  DB::getPdo()->lastInsertId();
        return $insertId;
    }

    public function updateRaceResultRecordsResponse($raceResultRecordsResponse)
    {
        DB::update(
            'update t_race_result_record
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
                    ,`official` = :official
                    ,`seat_number` = :seat_number
                    ,`seat_name` = :seat_name
                    ,`start_datetime` = :start_datetime
                    ,`updated_time` = :updated_time
                    ,`updated_user_id` = :updated_user_id
                    WHERE `race_result_record_id` = :race_result_record_id',
            $raceResultRecordsResponse
        );
    }

    //団体IDを条件として出漕結果記録テーブル内の大会IDを取得する
    public function getTournamentIdForResultsRecord($targetOrgId)
    {
        $tournamentIds = DB::select(
            'SELECT
                `tourn_id`
            FROM `t_race_result_record`
            WHERE 1=1
                AND `delete_flag` = 0
                AND `org_id` = :org_id',
            $targetOrgId
        );
        return $tournamentIds;
    }

    //エントリー大会ID、エントリーレースID、JARA選手IDが一致する公式のレース結果の件数を取得する
    public function getTargetOfficialRaceCount($values, $searchCondition)
    {
        Log::debug("getTargetOfficialRaceCount start.");
        $sqlString = 'select count(*)    as "target_race_count"
                        FROM `t_race_result_record` rrr
                        where 1=1
                        and rrr.`delete_flag` = 0
                        and rrr.`official` = 1
                        #ReplaceConditionString#';
        $sqlString = str_replace('#ReplaceConditionString#', $searchCondition, $sqlString);
        $target_race_count = DB::select($sqlString, $values);
        Log::debug("getTargetOfficialRaceCount end.");
        return $target_race_count;
    }

    //エントリー大会ID、エントリーレースID、JARA選手IDが一致する公式のレース結果を取得する
    public function getTargetOfficialRace($values, $searchCondition)
    {
        $sqlString = 'select
                        rrr.`race_result_record_id`
                        ,tour.`tourn_id`                #大会ID
                        ,tour.`entrysystem_tourn_id`    #既存大会ID
                        ,tour.`tourn_name`              #大会名
                        ,race.`race_id`                 #レースID
                        ,race.`entrysystem_race_id`     #既存レースID
                        ,race.`race_number`             #レースNo.
                        ,race.`race_name`               #レース名
                        ,org.`org_id`                   #団体ID
                        ,org.`entrysystem_org_id`       #既存団体ID
                        ,org.`org_name`                 #団体名
                        ,ply.`player_id`                #選手名
                        ,ply.`jara_player_id`           #既存選手ID
                        ,ply.`player_name`              #選手名
                        ,ply.`height`                   #選手身長
                        ,ply.`weight`                   #選手体重
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
                        and  tour.`delete_flag` = 0
                        and  race.`delete_flag` = 0
                        and  org.`delete_flag` = 0
                        and  ply.`delete_flag` = 0
                        and rrr.`official` = 1 #公式大会
                        #ReplaceConditionString#';
        $sqlString = str_replace('#ReplaceConditionString#', $searchCondition, $sqlString);
        $target_race = DB::select($sqlString, $values);
        return $target_race;
    }

    //大会ID、レースID、選手IDが一致する非公式のレース結果件数を取得する
    public function getTargetUnofficialRaceCount($conditions)
    {
        Log::debug("getTargetUnofficialRaceCount start.");
        $target_race_count = DB::select('select count(*)    as "target_race_count"
                                            FROM `t_race_result_record` rrr
                                            where 1=1
                                            and rrr.`delete_flag` = 0
                                            and rrr.`official` = 0              #非公式大会
                                            and rrr.`tourn_id` = :tourn_id      #大会ID
                                            and rrr.`race_id` = :race_id        #レースID
                                            and rrr.`player_id` = :player_id    #選手ID
                                        ', $conditions);
        Log::debug("getTargetUnofficialRaceCount end.");
        return $target_race_count;
    }

    //大会ID、レースID、選手IDが一致する非公式のレース結果を取得する
    public function getTargetUnofficialRace($conditions)
    {
        $target_race_count = DB::select(
            'select
                                            rrr.`race_result_record_id`     
                                            ,tour.`tourn_id`                #大会ID
                                            ,tour.`entrysystem_tourn_id`    #既存大会ID
                                            ,tour.`tourn_name`              #大会名
                                            ,race.`race_id`                 #レースID
                                            ,race.`entrysystem_race_id`     #既存レースID
                                            ,race.`race_number`             #レースNo.
                                            ,race.`race_name`               #レース名
                                            ,org.`org_id`                   #団体ID
                                            ,org.`entrysystem_org_id`       #既存団体ID
                                            ,org.`org_name`                 #団体名
                                            ,ply.`player_id`                #選手名
                                            ,ply.`jara_player_id`           #既存選手ID
                                            ,ply.`player_name`              #選手名
                                            ,ply.`height`                   #選手身長
                                            ,ply.`weight`                   #選手体重
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
                                            and  tour.`delete_flag` = 0
                                            and  race.`delete_flag` = 0
                                            and  org.`delete_flag` = 0
                                            and  ply.`delete_flag` = 0
                                            and rrr.`official` = 0 #非公式大会
                                            and rrr.tourn_id = :tourn_id    #大会ID
                                            and rrr.race_id = :race_id      #レースID
                                            and rrr.player_id = :player_id  #選手ID',
            $conditions
        );
        return $target_race_count;
    }

    //出漕結果記録テーブルを更新する
    //レース結果情報一括登録画面用
    public function updateBulkRaceResultRecord($values)
    {
        DB::update(
            'update `t_race_result_record`
                        SET `player_id` = :player_id,
                            `jara_player_id` = :jara_player_id,
                            `player_name` = :player_name,
                            `entrysystem_tourn_id` = :entrysystem_tourn_id,
                            `tourn_id` = :tourn_id,
                            `tourn_name` = :tourn_name,
                            `race_id` = :race_id,
                            `entrysystem_race_id` = :entrysystem_race_id,
                            `race_number` = :race_number,
                            `race_name` = :race_name,
                            `race_class_id` = :race_class_id,
                            `race_class_name` = :race_class_name,
                            `org_id` = :org_id,
                            `entrysystem_org_id` = :entrysystem_org_id,
                            `org_name` = :org_name,
                            `crew_name` = :crew_name,
                            `by_group` = :by_group,
                            `event_id` = :event_id,
                            `event_name` = :event_name,
                            `range` = :range,
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
                            `player_height`= :player_height,
                            `player_weight`= :player_weight,
                            `seat_number`= :seat_number,
                            `seat_name`= :seat_name,
                            `race_result_record_name`= :race_result_record_name,
                            `start_datetime` = :start_datetime,
                            `weather` = :weather,
                            `wind_speed_2000m_point` = :wind_speed_2000m_point,
                            `wind_direction_2000m_point` = :wind_direction_2000m_point,
                            `wind_speed_1000m_point` = :wind_speed_1000m_point,
                            `wind_direction_1000m_point` = :wind_direction_1000m_point,
                            `race_result_notes_id` = :race_result_notes_id,
                            `updated_time`= :updated_time,
                            `updated_user_id`= :user_id
                            WHERE 1=1
                            and `race_result_record_id` = :race_result_record_id',
            $values
        );
    }

    //出漕結果記録テーブルに挿入する
    //レース結果情報一括登録画面用
    public function insertBulkRaceResultRecord($values)
    {
        DB::insert(
            'INSERT INTO `t_race_result_record` (
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
                `race_result_notes_id`, 
                `registered_time`,
                `registered_user_id`, 
                `updated_time`, 
                `updated_user_id`
            ) VALUES (
                :player_id,
                :jara_player_id, 
                :player_name, 
                :entrysystem_tourn_id, 
                :tourn_id, 
                :tourn_name, 
                :race_id,
                :entrysystem_race_id, 
                :race_number, 
                :race_name, 
                :race_class_id,
                :race_class_name,
                :org_id, 
                :entrysystem_org_id, 
                :org_name, 
                :crew_name, 
                :by_group, 
                :event_id, 
                :event_name, 
                :range, 
                :rank, 
                :laptime_500m, 
                :laptime_1000m, 
                :laptime_1500m, 
                :laptime_2000m, 
                :final_time, 
                :stroke_rate_avg, 
                :stroke_rat_500m, 
                :stroke_rat_1000m, 
                :stroke_rat_1500m, 
                :stroke_rat_2000m, 
                :heart_rate_avg, 
                :heart_rate_500m, 
                :heart_rate_1000m, 
                :heart_rate_1500m, 
                :heart_rate_2000m, 
                :official, 
                :attendance, 
                :player_height, 
                :player_weight, 
                :seat_number, 
                :seat_name, 
                :race_result_record_name, 
                :start_datetime, 
                :weather,
                :wind_speed_2000m_point, 
                :wind_direction_2000m_point, 
                :wind_speed_1000m_point, 
                :wind_direction_1000m_point,
                :race_result_notes_id, 
                :registered_time,
                :registered_user_id, 
                :updated_time, 
                :updated_user_id 
            )',
            $values
        );
        //挿入したIDを取得
        $insertId =  DB::getPdo()->lastInsertId();
        return $insertId;
    }

    //クルーの情報を取得
    public function getCrews($values)
    {
        //DB::enableQueryLog();
        $crews = DB::select(
            'SELECT
                rrr.`player_id`
                ,tp.`delete_flag` AS playerDeleteFlag
                ,msn.`seat_id`
                ,msn.`seat_name`
                ,msn.`seat_addr_name`
                ,rrr.`player_name`
                ,rrr.`player_height`
                ,rrr.`player_weight`
                ,msn.`display_order` AS `order`
            FROM `t_race_result_record` rrr
            INNER JOIN `m_seat_number` msn ON
                msn.seat_id = rrr.seat_number
                AND msn.`delete_flag` = 0
            LEFT OUTER JOIN `t_players` tp ON
                # NOTE: 削除された選手も表示する。
                tp.player_id = rrr.player_id
            WHERE 1=1
                AND rrr.`delete_flag` = 0
                AND rrr.race_id = :race_id
                AND rrr.crew_name = :crew_name
                AND rrr.org_id = :org_id
            ORDER BY msn.`display_order`',
            $values
        );
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
                            ', $conditionValues);
        return $races;
    }

    //対象のレースに出漕結果の件数を取得する
    public function getIsExistsTargetRaceResult($race_id)
    {
        $counts = DB::select(
            'select count(*) as "count"
                                from t_race_result_record
                                where 1=1
                                and delete_flag = 0
                                and race_id = ?',
            [$race_id]
        );
        $count = $counts[0]->count;
        return $count;
    }

    //対象の出漕結果の件数を取得する
    public function getIsExistsTargetRaceResultRecord($race_result_record_id)
    {
        $is_exists = DB::select(
            "select count(*) as `result`
                                from t_race_result_record
                                where 1=1
                                and race_result_record_id = ?
                                and delete_flag = 0",
            [$race_result_record_id]
        );
        return $is_exists;
    }

    //対象のレース結果情報の削除フラグを有効にする（つまりレコードの論理削除を実行）
    public function updateDeleteFlagToValid($values)
    {
        DB::update(
            "update t_race_result_record
                    set delete_flag = 1
                    ,updated_time = ?
                    ,updated_user_id = ?
                    where 1=1
                    and race_result_record_id = ?",
            [$values['updated_datetime'], $values['updated_user_id'], $values['race_result_record_id']]
        );
    }

    //出漕時点情報を取得
    //レース結果編集画面更新モード用
    //レース結果参照・削除画面用
    public function getRaceResultRecordOnRowingPoint($race_id)
    {
        Log::debug("getRaceResultRecordOnRowingPoint start.");
        $race_result_record = DB::select(
            "SELECT DISTINCT
                rrr.race_id
                ,mwt.`weather_name` AS weatherName
                ,rrr.`range`                        #距離
                ,rrr.`start_datetime` AS `startDateTime` #発艇日時
                ,rrr.`weather`  AS `weatherId`      #天候
                ,rrr.`wind_direction_1000m_point`   #1000m地点風向
                ,wd1000p.`wind_direction` AS tenHundredmWindDirectionName
                ,rrr.`wind_speed_1000m_point`       #1000m地点風速
                ,rrr.`wind_direction_2000m_point`   #2000m地点風向
                ,wd2000p.`wind_direction` AS twentyHundredmWindDirectionName
                ,rrr.`wind_speed_2000m_point`       #2000m地点風速
                #,CASE
                #    WHEN rrr.`org_id` IS NULL THEN rrr.`org_id`
                #    ELSE rrr.`org_name`
                #    END AS `org_name`             #所属団体
                ,rrr.`crew_name`                  #クルー名
                ,rrr.`lane_number`                #出漕レーンNo.
                ,rrr.`rank`                       #順位
                ,rrr.`laptime_500m`               #500mラップタイム
                ,rrr.`laptime_1000m`              #1000mラップタイム
                ,rrr.`laptime_1500m`              #1500mラップタイム
                ,rrr.`laptime_2000m`              #2000mラップタイム
                ,rrr.`final_time`                 #最終タイム
                ,mrrn.`race_result_notes`         #備考
                ,rrr.`stroke_rat_500m`            #500mストロークレート
                ,rrr.`stroke_rat_1000m`           #1000mストロークレート
                ,rrr.`stroke_rat_1500m`           #1500mストロークレート
                ,rrr.`stroke_rat_2000m`           #2000mストロークレート
                ,rrr.`stroke_rate_avg`            #ストロークレート(平均)
                ,rrr.org_id
                ,org.org_name
            FROM `t_race_result_record` rrr
            INNER JOIN `t_organizations` org ON
                org.org_id = rrr.org_id
                AND org.`delete_flag` = 0
            LEFT OUTER JOIN `m_weather_type` mwt ON
                mwt.`weather_id` = rrr.`weather`
                AND mwt.`delete_flag` = 0
            LEFT OUTER JOIN `m_wind_direction` wd2000p ON
                wd2000p.`wind_direction_id` = rrr.`wind_direction_2000m_point`
                AND wd2000p.`delete_flag` = 0
            LEFT OUTER JOIN `m_wind_direction` wd1000p ON
                wd1000p.`wind_direction_id` = rrr.`wind_direction_1000m_point`
                AND wd1000p.`delete_flag` = 0
            LEFT OUTER JOIN `m_race_result_notes` mrrn ON
                mrrn.race_result_notes_id = rrr.race_result_notes_id
                AND mrrn.`delete_flag` = 0
            WHERE 1=1
                AND rrr.`delete_flag` = 0
                AND rrr.race_id = :race_id",
            ["race_id" => $race_id]
        );
        Log::debug("getRaceResultRecordOnRowingPoint end.");
        return $race_result_record;
    }

    //レース結果情報を取得
    //レース結果編集画面 更新モード用
    //レース結果参照・削除画面用 ※出漕結果記録IDも取得する 
    public function getRaceResultRecordList($race_id, $crew_name, $org_id)
    {
        $race_result_record_list = DB::select(
            'SELECT 
                ply.player_id AS playerId
                ,rrr.player_name AS playerName
                ,msex.sex_id
                ,msex.sex
                ,rrr.player_height AS height
                ,rrr.player_weight AS weight
                ,rrr.race_result_record_id
                ,rrr.seat_number AS seatNameId
                ,seat.seat_name AS seatName
                ,rrr.heart_rate_500m AS fiveHundredmHeartRate
                ,rrr.heart_rate_1000m AS tenHundredmHeartRate
                ,rrr.heart_rate_1500m AS fifteenHundredmHeartRate
                ,rrr.heart_rate_2000m AS twentyHundredmHeartRate
                ,rrr.heart_rate_avg AS heartRateAvg
                ,rrr.attendance
                ,rrr.org_id
                ,rrr.crew_name
                ,0 AS `deleteFlg`
            FROM `t_race_result_record` rrr
            LEFT JOIN `t_players` ply ON
                ply.player_id = rrr.player_id
                AND ply.delete_flag = 0
            LEFT JOIN `m_sex` msex ON
                msex.sex_id = ply.sex_id
                AND msex.delete_flag = 0
            LEFT JOIN `m_seat_number` seat ON
                seat.seat_id = rrr.seat_number
                AND seat.delete_flag = 0
            WHERE 1=1
                AND rrr.delete_flag = 0
                AND rrr.race_id = :race_id
                AND rrr.org_id = :org_id
                AND rrr.crew_name = :crew_name
            ORDER BY seat_number',
            [
                "race_id" => $race_id,
                "crew_name" => $crew_name,
                "org_id" => $org_id,
            ]
        );
        return $race_result_record_list;
    }

    //出漕結果記録テーブルに挿入する
    //レース結果登録画面で入力し、レース結果入力確認画面で登録を実行するときに使用
    public function insertRaceResultRecordForInputConfirm($values)
    {
        Log::debug("insertRaceResultRecordForInputConfirm start.");
        DB::insert("insert into jara_new_pf.t_race_result_record
                    ( 
                        `player_id`
                        , `jara_player_id`
                        , `player_name`
                        , `entrysystem_tourn_id`
                        , `tourn_id`
                        , `tourn_name`
                        , `race_id`
                        , `entrysystem_race_id`
                        , `race_number`
                        , `race_name`
                        , `race_class_id`
                        , `race_class_name`
                        , `org_id`
                        , `entrysystem_org_id`
                        , `org_name`
                        , `crew_name`
                        , `lane_number`
                        , `by_group`
                        , `event_id`
                        , `event_name`
                        , `range`
                        , `rank`
                        , `laptime_500m`
                        , `laptime_1000m`
                        , `laptime_1500m`
                        , `laptime_2000m`
                        , `final_time`
                        , `stroke_rate_avg`
                        , `stroke_rat_500m`
                        , `stroke_rat_1000m`
                        , `stroke_rat_1500m`
                        , `stroke_rat_2000m`
                        , `heart_rate_avg`
                        , `heart_rate_500m`
                        , `heart_rate_1000m`
                        , `heart_rate_1500m`
                        , `heart_rate_2000m`
                        , `official`
                        , `attendance`
                        , `player_height`
                        , `player_weight`
                        , `seat_number`
                        , `seat_name`
                        , `start_datetime`
                        , `weather`
                        , `wind_speed_2000m_point`
                        , `wind_direction_2000m_point`
                        , `wind_speed_1000m_point`
                        , `wind_direction_1000m_point`
                        , `race_result_notes_id`
                        , `registered_time`
                        , `registered_user_id`
                        , `updated_time`
                        , `updated_user_id`
                        , `delete_flag`
                    ) 
                    VALUES
                    ( 
                        :player_id
                        , :jara_player_id
                        , :player_name
                        , :entrysystem_tourn_id
                        , :tourn_id
                        , :tourn_name
                        , :race_id
                        , :entrysystem_race_id
                        , :race_number
                        , :race_name
                        , :race_class_id
                        , :race_class_name
                        , :org_id
                        , :entrysystem_org_id
                        , :org_name
                        , :crew_name
                        , :lane_number
                        , :by_group
                        , :event_id
                        , :event_name
                        , :range
                        , :rank
                        , :laptime_500m
                        , :laptime_1000m
                        , :laptime_1500m
                        , :laptime_2000m
                        , :final_time
                        , :stroke_rate_avg
                        , :stroke_rat_500m
                        , :stroke_rat_1000m
                        , :stroke_rat_1500m
                        , :stroke_rat_2000m
                        , :heart_rate_avg
                        , :heart_rate_500m
                        , :heart_rate_1000m
                        , :heart_rate_1500m
                        , :heart_rate_2000m
                        , :official
                        , :attendance
                        , :player_height
                        , :player_weight
                        , :seat_number
                        , :seat_name
                        , :start_datetime
                        , :weather
                        , :wind_speed_2000m_point
                        , :wind_direction_2000m_point
                        , :wind_speed_1000m_point
                        , :wind_direction_1000m_point
                        , :race_result_notes_id
                        , :registered_time
                        , :registered_user_id
                        , :updated_time
                        , :updated_user_id
                        , :delete_flag
                    )", $values);
        Log::debug("insertRaceResultRecordForInputConfirm end.");
    }

    //出走結果記録テーブルを更新する
    //レース結果更新画面で入力し、レース結果入力確認画面で更新を実行するときに使用
    public function updateRaceResultRecordForUpdateConfirm($values)
    {
        DB::update(
            "update `t_race_result_record`
                    SET
                        `jara_player_id` = :jara_player_id
                        , `race_id` = :race_id
                        , `player_name` = :player_name
                        , `player_id` = :player_id
                        , `entrysystem_org_id` = :entrysystem_org_id
                        , `org_name` = :org_name
                        , `org_id` = :org_id
                        , `crew_name` = :crew_name
                        , `lane_number` = :lane_number
                        , `rank` = :rank
                        , `laptime_500m` = :laptime_500m
                        , `laptime_1000m` = :laptime_1000m
                        , `laptime_1500m` = :laptime_1500m
                        , `laptime_2000m` = :laptime_2000m
                        , `final_time` = :final_time
                        , `stroke_rate_avg` = :stroke_rate_avg
                        , `stroke_rat_500m` = :stroke_rat_500m
                        , `stroke_rat_1000m` = :stroke_rat_1000m
                        , `stroke_rat_1500m` = :stroke_rat_1500m
                        , `stroke_rat_2000m` = :stroke_rat_2000m
                        , `heart_rate_avg` = :heart_rate_avg
                        , `heart_rate_500m` = :heart_rate_500m
                        , `heart_rate_1000m` = :heart_rate_1000m
                        , `heart_rate_1500m` = :heart_rate_1500m
                        , `heart_rate_2000m` = :heart_rate_2000m
                        , `attendance` = :attendance
                        , `player_height` = :player_height
                        , `player_weight` = :player_weight
                        , `seat_number` = :seat_number
                        , `seat_name` = :seat_name
                        , `start_datetime` = :start_datetime
                        , `weather` = :weather
                        , `wind_speed_2000m_point` = :wind_speed_2000m_point
                        , `wind_direction_2000m_point` = :wind_direction_2000m_point
                        , `wind_speed_1000m_point` = :wind_speed_1000m_point
                        , `wind_direction_1000m_point` = :wind_direction_1000m_point
                        , `race_result_notes_id` = :race_result_notes_id
                        , `updated_time` = :updated_time
                        , `updated_user_id` = :updated_user_id
                        WHERE 1=1
                        and delete_flag = 0
                        and `race_result_record_id` = :race_result_record_id",
            $values
        );
    }

    //「レースID」と「クルー名」と「団体ID」を条件に
    //対象のレース結果情報の削除フラグを有効にする（つまりレコードの論理削除を実行）
    public function updateTargetCrewDeleteFlagToValid($values)
    {
        DB::update(
            "update t_race_result_record
                    set delete_flag = 1
                    ,updated_time = :updated_datetime
                    ,updated_user_id = :updated_user_id
                    where 1=1
                    and delete_flag = 0
                    and race_id = :race_id
                    and org_id = :org_id
                    and crew_name = :crew_name",
            $values
        );
    }

    //レースID、クルー名、選手ID、団体IDを条件とした出漕結果記録が存在するかを取得
    //レース結果更新で登録か更新を判断するため
    public function getIsExistsTargetResultRecordForConditions($race_result_record_id)
    {
        $is_record_exists = DB::select(
            "select race_result_record_id
                                        from `t_race_result_record`
                                        where 1=1
                                        and delete_flag = 0
                                        and race_result_record_id = :race_result_record_id",
            [
                "race_result_record_id" => $race_result_record_id
            ]
        );
        //1つの結果を取得するため0番目だけを返す
        $target_result = null;
        if (!empty($is_record_exists)) {
            $target_result = $is_record_exists[0];
        }
        return $target_result;
    }
}
