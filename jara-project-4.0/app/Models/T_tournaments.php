<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_tournaments extends Model
{
    use HasFactory;

    public static $tournamentInfo = [
        'tourn_id' => null,
        'tourn_name' => "testName",
        'sponsor_org_id' => null,
        'event_start_date' => null,
        'event_end_date' => null,
        'venue_id' => null,
        'venue_name' => null,
        'tourn_type' => null,
        'tourn_url' => null,
        'tourn_info_faile_path' => null,
        'entrysystem_tourn_id' => null,
        'delete_flag' => 0,
    ];

    public function getTournament($trnId)
    {
        $tournaments = DB::select('select `tourn_id`, `tourn_name`, `sponsor_org_id`, `event_start_date`, `event_end_date`, `venue_id`, `venue_name`, `tourn_type`, `tourn_url`, `tourn_info_faile_path`, `entrysystem_tourn_id`, `registered_time`, `registered_user_id`, `updated_time`, `updated_user_id`, `delete_flag` from t_tournaments where delete_flag=0 and tourn_id = ?', [$trnId]);
        //1つの団体IDを取得するため0番目だけを返す
        $targetTrn = null;
        if (!empty($tournaments)) {
            $targetTrn = $tournaments[0];
        }
        return $targetTrn;
    }

    public function insertTournaments($tournamentsInfo)
    {
        $result =  array();
        array_push($result, "success");

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
                    1, //Auth::user()->user_id,
                    NOW(),
                    1, // Auth::user()->user_id,
                    $tournamentsInfo['delete_flag']
                ]
            );
            array_push($result, DB::getPdo()->lastInsertId());

            DB::commit();
            return $result;
        } catch (\Throwable $e) {
            DB::rollBack();

            //$result = "failed";
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
                    $tournamentsInfo['delete_flag'],
                    $tournamentsInfo['tourn_id'], //where条件
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
        $tournaments = DB::select(
            'select 
                                    `tourn_id`,
                                    `tourn_name`,
                                    `sponsor_org_id`,
                                    `event_start_date`,
                                    `event_end_date`,
                                    `t_tournaments`.`venue_id`,
                                    case `m_venue`.`venue_name`
                                        when "その他" then `t_tournaments`.`venue_name`
                                        else `m_venue`.`venue_name`
                                        end as `venue_name`,
                                    `tourn_type`,
                                    case `tourn_type`
                                        when 0 then "非公式"
                                        when 1 then "公式"
                                        else ""
                                        end as `tourn_type_display`,
                                    `tourn_url`
                                    from `t_tournaments`
                                    left join `m_venue`
                                    on `t_tournaments`.`venue_id` = `m_venue`.`venue_id`
                                    where `t_tournaments`.`delete_flag` =0
                                    and `sponsor_org_id` = ?
                                    order by `event_start_date`',
            [$target_org_id]
        );
        return $tournaments;
    }

    //20231218 エントリー大会情報を取得
    //出漕結果記録の大会IDから大会情報を取得
    public function getEntryTournaments($tournamentIdCondition)
    {
        $sqlString = 'select
                        `tourn_id`,
                        `tourn_name`,
                        `sponsor_org_id`,
                        `event_start_date`,
                        `event_end_date`,
                        `t_tournaments`.`venue_id`,
                        case `m_venue`.`venue_name`
                            when "その他" then `t_tournaments`.`venue_name`
                            else `m_venue`.`venue_name`
                            end as `venue_name`,
                        `tourn_type`,
                        case `tourn_type`
                            when 0 then "非公式"
                            when 1 then "公式"
                            else ""
                            end as `tourn_type_display`,
                        `tourn_url`
                        from `t_tournaments`
                        left join `m_venue`
                        on `t_tournaments`.`venue_id` = `m_venue`.`venue_id`
                        where `t_tournaments`.`delete_flag`=0
                        and `tourn_id` in (#TournamentIdCondition#)
                        order by event_start_date';
        $sqlString = str_replace('#TournamentIdCondition#', $tournamentIdCondition, $sqlString);
        $entryTournaments = DB::select($sqlString);
        return $entryTournaments;
    }

    public function getTournamentWithSearchCondition($searchCondition)
    {
        //大会種別(公式・非公式)　大会名　開催開始年月日　開催終了年月日　開催場所　主催団体ID　主催団体名　を取得
        $sqlString = 'select `t_tournaments`.`tourn_id`, `t_tournaments`.`tourn_type`,`t_tournaments`.`tourn_name`, 
                        `t_tournaments`.`event_start_date`, `t_tournaments`.`event_end_date`, `t_tournaments`.`venue_name` as `venue_name_tournament`, 
                        `t_tournaments`.`sponsor_org_id`, `t_organizations`.`org_name`, `m_venue`.`venue_name` as `venue_name_master`
                        from `t_tournaments`
                        left join `t_race_result_record`
                        on `t_tournaments`.`tourn_id`=`t_race_result_record`.`tourn_id`
                        left join `t_organizations`
                        on `t_tournaments`.`sponsor_org_id` = `t_organizations`.`org_id`
                        left join `m_venue`
                        on `t_tournaments`.`venue_id` = `m_venue`.`venue_id`
                        where `t_tournaments`.`delete_flag` = 0
                        #SearchCondition#';
        $sqlString = str_replace('#SearchCondition#', $searchCondition, $sqlString);
        $tournaments = DB::select($sqlString);
        return $tournaments;
    }
    public function getTournamentName()
    {
        $tournament_name_list = DB::select('select tourn_name
                                        from t_tournaments
                                        where delete_flag = 0
                                        order by tourn_id'
                                    );
        return $tournament_name_list;
    }

    //大会IDを条件に大会情報を取得する
    public function getTournamentFromTournId($tourn_id)
    {
        $tournament = DB::select('select
                                    `tourn_id`,
                                    `tourn_name`,
                                    `sponsor_org_id`,
                                    `event_start_date`,
                                    `event_end_date`,
                                    `venue_id`,
                                    `venue_name`,
                                    `tourn_type`,
                                    `tourn_url`,
                                    `tourn_info_faile_path`,
                                    `entrysystem_tourn_id`,
                                    FROM `t_tournaments`
                                    where 1=1
                                    and delete_flag = 0
                                    and tourn_id = :tourn_id'
                                ,[$tourn_id]);
        return $tournament;
    }

    //フロントエンドで入力された大会IDを条件に、該当の大会情報を取得する
    public function getTournamentInfoFromTournId($tourn_id)
    {
        $target_tournament = DB::select('select 
                                            `tourn_id`,
                                            `tourn_name`,
                                            `sponsor_org_id`,
                                            `event_start_date`,
                                            `event_end_date`,
                                            `venue_id`,
                                            `venue_name`,
                                            `tourn_type`,
                                            `tourn_url`,
                                            `tourn_info_faile_path`,
                                            `entrysystem_tourn_id`
                                        FROM `t_tournaments`
                                        WHERE 1=1
                                        and `delete_flag` = 0
                                        and `tourn_id` = :tourn_id'
                                        ,$tourn_id);
        return $target_tournament;
    }
}
