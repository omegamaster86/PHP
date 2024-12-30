<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class T_races extends Model
{
    use HasFactory;

    public static $racesData = [
        'race_id' => null,
        'race_number' => 1,
        'entrysystem_race_id' => null,
        'tourn_id' => null,
        'race_name' => null,
        'event_id' => null,
        'event_name' => null,
        'race_class_id' => null,
        'race_class_name' => null,
        'by_group' => null,
        'range' => null,
        'start_date_time' => null,
        'delete_flag' => 0,
    ];

    public function getRace($trnId)
    {
        $race = DB::select('select
                            `race_id`
                            ,`race_number`
                            ,`entrysystem_race_id`
                            ,`tourn_id`
                            ,`race_name`
                            ,`event_id`
                            ,`event_name`
                            ,`race_class_id`
                            ,`race_class_name`
                            ,`by_group`
                            ,`range`
                            ,`start_date_time`
                            ,`registered_time`
                            ,`registered_user_id`
                            ,`updated_time`
                            ,`updated_user_id`
                            ,`delete_flag`
                            FROM `t_races`
                            where delete_flag=0
                            and tourn_id = ?', [$trnId]);
        return $race;
    }

    public function insertRaces($racesInfo)
    {
        DB::insert(
            'insert into t_races (
                `race_id`, 
                `race_number`, 
                `entrysystem_race_id`, 
                `tourn_id`, 
                `race_name`, 
                `event_id`, 
                `event_name`, 
                `race_class_id`, 
                `race_class_name`, 
                `by_group`, 
                `range`,
                `start_date_time`, 
                `registered_time`, 
                `registered_user_id`, 
                `updated_time`,
                `updated_user_id`, 
                `delete_flag`
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [
                null,
                $racesInfo['race_number'],
                $racesInfo['entrysystem_race_id'],
                $racesInfo['tourn_id'],
                $racesInfo['race_name'],
                $racesInfo['event_id'],
                $racesInfo['event_name'],
                $racesInfo['race_class_id'],
                $racesInfo['race_class_name'],
                $racesInfo['by_group'],
                $racesInfo['range'],
                $racesInfo['start_date_time'],
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                0,
            ]
        );
        $insertId = DB::getPdo()->lastInsertId(); //挿入したIDを取得
        return $insertId; //Insertを実行して、InsertしたレコードのID（主キー）を返す
    }

    //interfaceのRaceを引数としてinsertを実行する
    //登録日時、更新日時は「current_datetime」
    //登録ユーザー、更新ユーザーは「user_id」
    //で指定する
    public function insertRace($race)
    {
        DB::insert(
            'insert into t_races
                    (
                        `race_id`,
                        `entrysystem_race_id`, 
                        `tourn_id`,
                        `race_number`,
                        `event_id`, 
                        `event_name`,
                        `race_name`,
                        `race_class_id`, 
                        `race_class_name`, 
                        `by_group`, 
                        `range`, 
                        `start_date_time`, 
                        `registered_time`, 
                        `registered_user_id`, 
                        `updated_time`,
                        `updated_user_id`,
                        `delete_flag`
                    )
                    VALUES
                    (
                        :race_id,
                        :entrysystem_race_id, 
                        :tourn_id,
                        :race_number,
                        :event_id, 
                        :event_name,
                        :race_name,
                        :race_class_id, 
                        :race_class_name, 
                        :by_group, 
                        :range, 
                        :start_date_time, 
                        :current_datetime, 
                        :user_id, 
                        :current_datetime,
                        :user_id,
                        0
                    )',
            $race
        );
        $insertId = DB::getPdo()->lastInsertId(); //挿入したIDを取得
        return $insertId; //Insertを実行して、InsertしたレコードのID（主キー）を返す
    }

    //レース更新
    public function updateRaces($racesInfo)
    {
        DB::update(
            'update t_races set 
            `race_number`=?,
            `entrysystem_race_id`=?,
            `tourn_id`=?,
            `race_name`=?,
            `event_id`=?,
            `event_name`=?,
            `race_class_id`=?,
            `race_class_name`=?,
            `by_group`=?,
            `range`=?,
            `start_date_time`=?,
            `updated_time`=?,
            `updated_user_id`=?,
            `delete_flag`=?
             where 1=1
             and delete_flag = 0
             and tourn_id = ?
             and race_id = ?',
            [
                $racesInfo['race_number'],
                $racesInfo['entrysystem_race_id'],
                $racesInfo['tourn_id'],
                $racesInfo['race_name'],
                $racesInfo['event_id'],
                $racesInfo['event_name'],
                $racesInfo['race_class_id'],
                $racesInfo['race_class_name'],
                $racesInfo['by_group'],
                $racesInfo['range'],
                $racesInfo['start_date_time'],
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $racesInfo['delete_flag'],
                $racesInfo['tourn_id'],
                $racesInfo['race_id'],
            ]
        );
    }

    //interfaceのRaceを引数としてupdateを実行する
    public function updateRace($race)
    {
        DB::update(
            'update t_races
                    set
                    `race_number`= :race_number,
                    `entrysystem_race_id`= :entrysystem_race_id,
                    `tourn_id`= :tourn_id,
                    `race_name`= :race_name,
                    `event_id`= :event_id,
                    `event_name`= :event_name,
                    `race_class_id`= :race_class_id,
                    `race_class_name`= :race_class_name,
                    `by_group`= :by_group,
                    `range`= :range,
                    `start_date_time`= :start_date_time,
                    `updated_time`= :updated_time,
                    `updated_user_id`= :updated_user_id,
                    where `tourn_id` = :',
            $race
        );
    }

    //大会IDを条件にレース情報を取得する
    public function getRaces($trnId)
    {
        $races = DB::select(
            'select
                            race.`race_id`
                            ,race.`race_number`
                            ,race.`entrysystem_race_id`
                            ,race.`tourn_id`
                            ,race.`race_name`
                            ,race.`event_id`
                            ,`m_events`.`event_name`
                            ,race.`race_class_id`
                            ,race.`race_class_name` as otherRaceName
                            ,`m_race_class`.`race_class_name`
                            ,race.`by_group`
                            ,race.`range`
                            ,race.`start_date_time`
                            ,case
                                when sum(case rrr.delete_flag when 0 then 1 else 0 end) > 0 then 1
                                else 0
                                end as `hasHistory`
                            FROM `t_races` race
                            left join `t_race_result_record` rrr
                            on race.race_id = rrr.race_id
                            left join `m_race_class`
                            on race.`race_class_id` = `m_race_class`.`race_class_id`
                            left join `m_events`
                            on race.`event_id` = `m_events`.`event_id`
                            where 1=1
                            and race.delete_flag = 0
                            and race.`tourn_id` = :tourn_id
                            group by race.`race_id`',
            $trnId
        );
        return $races;
    }

    //大会IDと種目IDを条件に出漕結果記録テーブルに登録されていないレース情報を取得する
    public function getRacesWithoutRaceResult($values)
    {
        $races = DB::select(
            'select
                                race.`race_id`
                                ,race.`race_number`
                                ,race.`entrysystem_race_id`
                                ,race.`tourn_id`
                                ,race.`race_name`
                                ,race.`event_id`
                                ,race.`event_name`
                                ,race.`race_class_id`
                                ,race.`race_class_name`
                                ,race.`by_group`
                                ,race.`range`
                                ,race.`start_date_time`
                                ,case
                                    when count(rrr.race_result_record_id) = 0 then 0
                                    else 1
                                    end as `hasHistory`
                                FROM `t_races` race
                                left join `t_race_result_record` rrr
                                on race.race_id = rrr.race_id
                                where 1=1
                                and race.delete_flag = 0
                                and rrr.delete_flag = 0
                                and race.`tourn_id` = :tourn_id
                                and race.`race_class_id` = :race_class_id
                                group by race.`race_id`
                                having count(rrr.race_result_record_id) = 0',
            $values
        );
        return $races;
    }

    //レースIDを条件にレース情報を取得する
    public function getRaceFromRaceId($race_id)
    {
        Log::debug("getRaceFromRaceId start.");
        $race = DB::select(
            "select
                            race.`race_id`
                            ,race.`race_number`
                            ,race.`entrysystem_race_id`
                            ,race.`tourn_id`
                            ,race.`race_name`
                            ,race.`event_id`
                            ,case
                                when race.`event_name` is null then eve.`event_name` 
                                else race.`event_name`
                                end as `event_name`
                            ,race.`race_class_id`
                            ,mrc.`race_class_name`
                            ,race.`by_group`
                            ,race.`range`
                            ,race.`start_date_time`
                            FROM `t_races` race
                            left join `m_events` eve
                            on race.`event_id` = eve.`event_id`
                            left join `m_race_class` mrc
                            on race.`race_class_id` = mrc.`race_class_id`
                            where 1=1
                            and race.`delete_flag` = 0
                            and eve.`delete_flag` = 0
                            and race.race_id = ?",
            [$race_id]
        );
        //Log::debug($race);
        Log::debug("getRaceFromRaceId end.");
        return $race;
    }

    //条件に合致するレースの件数を取得する
    //大会エントリー一括登録画面用
    public function getRaceCount($condition, $values)
    {
        $sql_string = "select count(*)  as `count`
                        from `t_races`
                        where 1=1
                        and delete_flag = 0
                        and race_id = :race_id
                        and tourn_id = :tourn_id
                        and event_id = :event_id
                        and race_class_id = :race_class_id
                        and by_group = :by_group
                        and race_number = :race_number
                        #ReplaceConditionString#";
        $sql_string = str_replace("#ReplaceConditionString#", $condition, $sql_string);
        $race_count = DB::select($sql_string, $values);
        return $race_count;
    }

    //大会IDと種目IDに紐づいたレース結果のないレースを取得 20240422
    public function getLinkRaces($racesInfo)
    {
        $races = DB::select(
            'select
                            race.`race_id`
                            ,race.`race_number`
                            ,race.`entrysystem_race_id`
                            ,race.`tourn_id`
                            ,race.`race_name`
                            ,race.`event_id`
                            ,case
                                when race.`event_name` is null then eve.`event_name` 
                                else race.`event_name`
                                end as `event_name`
                            ,race.`race_class_id`
                            ,mrc.`race_class_name`
                            ,race.`by_group`
                            ,race.`range`
                            ,race.`start_date_time` as `startDateTime`
                            FROM `t_races` race
                            left join `m_events` eve
                            on race.`event_id` = eve.`event_id`
                            left join `m_race_class` mrc
                            on race.`race_class_id` = mrc.`race_class_id`
                            where 1=1
                            and race.`delete_flag` = 0
                            and eve.`delete_flag` = 0
                            and race.`race_id` NOT IN ( 
                                SELECT
                                    `t_race_result_record`.`race_id` 
                                FROM
                                    `t_race_result_record`
                                WHERE
                                    `t_race_result_record`.delete_flag = 0
                            )
                            and race.`tourn_id` = ?
                            and race.`event_id` = ?',
            [
                $racesInfo['tourn_id'],
                $racesInfo['event_id'],
            ]
        );
        return $races;
    }

    //大会レース結果管理画面用
    //検索条件を入力して出漕記録結果が存在するレース情報を取得する
    public function getRaceResultWithCondition($conditionString, $values)
    {
        $sqlString = 'select
                        race.`race_id`
                        ,race.`race_name`
                        ,race.`race_number`
                        ,race.`race_class_id`
                        ,case
                            when race.race_class_name is null then mrc.`race_class_name` 
                            else race.race_class_name
                            end as race_class_name
                        ,race.`by_group`
                        FROM `t_races` race
                        left join `t_race_result_record` rrr
                        on race.race_id = rrr.race_id
                        left join `m_race_class` mrc
                        on race.`race_class_id` = mrc.`race_class_id`
                        where 1=1
                        and race.delete_flag = 0
                        and mrc.delete_flag = 0
                        #ReplaceConditionString#
                        group by race.`race_id`
                        having sum(case rrr.delete_flag when 0 then 1 else 0 end) > 0   -- 出漕記録結果が存在するレースを条件とする
                        ';
        $sqlString = str_replace('#ReplaceConditionString#', $conditionString, $sqlString);
        $races = DB::select($sqlString, $values);
        return $races;
    }

    //レース基本情報を取得
    //レース結果編集画面登録モード用
    public function getBasicRaceInfoList($tourn_id, $event_id)
    {
        $races = DB::select(
            "select
                            row_number() over (order by race_id) as `id`
                            ,race.race_id
                            ,race.race_name
                            ,race.race_number
                            ,race.event_id
                            ,case
                                when race.event_name is null then me.event_name
                                else race.event_name
                                end as event_name
                            ,race.race_class_id
                            ,case
                                when race.race_class_name is null then mrc.race_class_name
                                else race.race_class_name
                                end as race_class_name
                            ,race.by_group
                            ,race.range
                            ,race.start_date_time as `startDateTime`
                            ,race.tourn_id
                            from `t_races` race
                            left join `m_events` me
                            on race.event_id = me.event_id
                            left join `m_race_class` mrc
                            on race.race_class_id = mrc.race_class_id 
                            where 1=1
                            and race.delete_flag = 0
                            and race.tourn_id = :tourn_id
                            and race.event_id = :event_id",
            ["tourn_id" => $tourn_id, "event_id" => $event_id]
        );
        return $races;
    }

    //対象のレース情報の削除フラグを有効にする 20240403
    public function updateDeleteFlagToValid($values)
    {
        DB::update(
            'update t_races
                    set `delete_flag` = 1
                    ,updated_time = ?
                    ,updated_user_id = ?
                    where 1=1
                    and `delete_flag` = 0
                    and `tourn_id` = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $values
            ]
        );
    }

    //エントリーシステムのレースIDの数を取得する
    //重複有無を確認するため
    //race_idが一致するレコードを除く（更新画面用）
    public function getEntrysystemRaceIdCountWithRaceId($entrySystemRaceId, $race_id)
    {
        $counts = DB::select(
            'select count(*) as "count"
                                from `t_races`
                                where 1=1
                                and `delete_flag`=0
                                and `entrysystem_race_id` = ?
                                and `race_id` <> ?',
            [$entrySystemRaceId, $race_id]
        );
        $count = $counts[0]->count;
        return $count;
    }

    //エントリーシステムのレースIDの数を取得する
    //重複有無を確認するため
    //（登録画面用）
    public function getEntrysystemRaceIdCount($entrySystemRaceId)
    {
        $counts = DB::select(
            'select count(*) as "count"
                                from `t_races`
                                where 1=1
                                and `delete_flag`=0
                                and `entrysystem_race_id` = ?',
            [$entrySystemRaceId]
        );
        $count = $counts[0]->count;
        return $count;
    }
}
