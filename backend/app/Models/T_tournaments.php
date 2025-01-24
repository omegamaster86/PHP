<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

    public function getTournaments()
    {
        $tournaments = DB::table('t_tournaments')
            ->select(
                'tourn_id as tournId',
                'tourn_name as tournName',
            )
            ->where('delete_flag', 0)
            ->get();

        return $tournaments;
    }

    public function getTournament($trnId)
    {
        $tournaments = DB::select(
            'select
                                    `t_tournaments`.`tourn_id`,
                                    `tourn_name`,
                                    `sponsor_org_id`,
                                    `t_organizations`.`org_name` as `sponsorOrgName`,
                                    `event_start_date`,
                                    `event_end_date`,
                                    `t_tournaments`.`venue_id`,
                                    case `m_venue`.`venue_name`
                                        when "その他" then `t_tournaments`.`venue_name`
                                        else `m_venue`.`venue_name`
                                        end as `venue_name`,
                                    `tourn_type`,
                                    CASE
                                        when `tourn_type` = 0 then "非公式"
                                        when `tourn_type` = 1 then "公式"
                                        end as `tournTypeName`,
                                    `tourn_url`,
                                    `tourn_info_faile_path`,
                                    `entrysystem_tourn_id`,
                                    `t_tournaments`.`registered_time`,
                                    `t_tournaments`.`registered_user_id`,
                                    `t_tournaments`.`updated_time`,
                                    `t_tournaments`.`updated_user_id`,
                                    `t_tournaments`.`delete_flag`
                                    from `t_tournaments`
                                    left join `t_organizations`
                                    on `t_tournaments`.`sponsor_org_id` = `t_organizations`.`org_id`
                                    left join `m_venue`
                                    on `t_tournaments`.`venue_id` = `m_venue`.`venue_id`
                                    where 1=1
                                    and `t_tournaments`.`delete_flag` = 0
                                    and `t_organizations`.`delete_flag` = 0
                                    and `m_venue`.`delete_flag` = 0
                                    and tourn_id = ?',
            [$trnId]
        );
        //1つの団体IDを取得するため0番目だけを返す
        $targetTrn = null;
        if (!empty($tournaments)) {
            $targetTrn = $tournaments[0];
        }
        return $targetTrn;
    }

    public function insertTournaments($tournamentsInfo)
    {
        DB::insert(
            'insert into t_tournaments
            (`tourn_id`, `tourn_name`, `sponsor_org_id`, `event_start_date`, `event_end_date`, `venue_id`, `venue_name`, `tourn_type`, `tourn_url`,
             `tourn_info_faile_path`, `entrysystem_tourn_id`, `registered_time`, `registered_user_id`, `updated_time`, `updated_user_id`, `delete_flag`)
            values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [
                null,
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
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $tournamentsInfo['delete_flag']
            ]
        );

        $insertId = DB::getPdo()->lastInsertId(); //挿入したIDを取得
        return $insertId; //Insertを実行して、InsertしたレコードのID（主キー）を返す
    }

    public function updateTournaments($tournamentsInfo)
    {
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
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $tournamentsInfo['delete_flag'],
                $tournamentsInfo['tourn_id'], //where条件
            ]
        );
    }

    //20231215 団体IDをキーとして大会情報を取得する
    public function getTournamentsFromOrgId($target_org_id)
    {
        $tournaments = DB::select(
            'select 
                                    `tourn_id`,
                                    `tourn_name`,
                                    `sponsor_org_id`,
                                    `org_name` as `sponsorOrgName`,
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
                                        end as `tournTypeName`,
                                    `tourn_url`,
                                    `tourn_info_faile_path`,
                                    `entrysystem_tourn_id`
                                    from `t_tournaments`
                                    left join `m_venue`
                                    on `t_tournaments`.`venue_id` = `m_venue`.`venue_id`
                                    left join `t_organizations`
                                    on `t_tournaments`.`sponsor_org_id` = `t_organizations`.`org_id`
                                    where 1=1
                                    and `t_tournaments`.`delete_flag` = 0
                                    and `t_organizations`.`delete_flag` = 0
                                    and `m_venue`.`delete_flag` = 0
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
                        `org_name` as `sponsorOrgName`,
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
                            end as `tournTypeName`,
                        `tourn_url`,
                        `tourn_info_faile_path`,
                        `entrysystem_tourn_id`
                        from `t_tournaments`
                        left join `m_venue`
                        on `t_tournaments`.`venue_id` = `m_venue`.`venue_id`
                        left join `t_organizations`
                        on `t_tournaments`.`sponsor_org_id` = `t_organizations`.`org_id`
                        where 1=1
                        and `t_tournaments`.`delete_flag` = 0
                        and `t_organizations`.`delete_flag` = 0
                        and `m_venue`.`delete_flag` = 0
                        and `tourn_id` in (#TournamentIdCondition#)
                        order by event_start_date';
        $sqlString = str_replace('#TournamentIdCondition#', $tournamentIdCondition, $sqlString);
        $entryTournaments = DB::select($sqlString);
        return $entryTournaments;
    }

    public function getTournamentWithSearchCondition($searchCondition)
    {
        //大会種別(公式・非公式)　大会名　開催開始年月日　開催終了年月日　開催場所　主催団体ID　主催団体名　を取得
        $sqlString = 'select distinct
                        `t_tournaments`.`tourn_id`,
                        `t_tournaments`.`tourn_name`,
                        `t_tournaments`.`sponsor_org_id`,
                        `t_organizations`.`org_name` as `sponsorOrgName`,
                        `t_tournaments`.`event_start_date`,
                        `t_tournaments`.`event_end_date`,
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
                            end as `tournTypeName`,
                        `tourn_url`,
                        `tourn_info_faile_path`,
                        `t_tournaments`.`entrysystem_tourn_id`
                        from `t_tournaments`
                        inner join `t_organizations`
                        on `t_tournaments`.`sponsor_org_id` = `t_organizations`.`org_id` and `t_organizations`.`delete_flag` = 0
                        inner join `m_venue`
                        on `t_tournaments`.`venue_id` = `m_venue`.`venue_id` and `m_venue`.`delete_flag` = 0
                        left join `t_race_result_record`
                        on `t_tournaments`.`tourn_id` = `t_race_result_record`.`tourn_id` and `t_race_result_record`.`delete_flag` = 0
                        where `t_tournaments`.`delete_flag` = 0
                        #SearchCondition#';
        $sqlString = str_replace('#SearchCondition#', $searchCondition, $sqlString);
        $tournaments = DB::select($sqlString);
        return $tournaments;
    }

    //フロントエンドで入力された大会IDを条件に、該当の大会情報を取得する
    public function getTournamentInfoFromTournId($tourn_id)
    {
        $target_tournament = DB::select(
            'select
                                        `tourn_id`,
                                        `tourn_name`,
                                        `sponsor_org_id`,
                                        `org_name` as `sponsorOrgName`,
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
                                            end as `tournTypeName`,
                                        `tourn_url`,
                                        `tourn_info_faile_path`,
                                        `entrysystem_tourn_id`
                                        from `t_tournaments`
                                        left join `t_organizations`
                                        on `t_tournaments`.`sponsor_org_id` = `t_organizations`.`org_id`
                                        left join `m_venue`
                                        on `t_tournaments`.`venue_id` = `m_venue`.`venue_id`
                                        where `t_tournaments`.`delete_flag` = 0
                                        and `t_organizations`.`delete_flag` = 0
                                        and `m_venue`.`delete_flag` = 0
                                        and `t_tournaments`.`tourn_id` = :tourn_id',
            ['tourn_id' => $tourn_id]
        );
        return $target_tournament;
    }

    public function getTournament_allData()
    {
        $tournaments = DB::select('select
                                    `tourn_id`,
                                    `tourn_name`,
                                    `sponsor_org_id`,
                                    `t_organizations`.`org_name` as `sponsorOrgName`,
                                    `event_start_date`,
                                    `event_end_date`,
                                    `venue_id`,
                                    `venue_name`,
                                    `tourn_type`,
                                    CASE
                                        when `tourn_type` = 0 then "非公式"
                                        when `tourn_type` = 1 then "公式"
                                        end as `tournTypeName`,
                                    `tourn_url`,
                                    `tourn_info_faile_path`,
                                    `entrysystem_tourn_id`,
                                    `t_tournaments`.`registered_time`,
                                    `t_tournaments`.`registered_user_id`,
                                    `t_tournaments`.`updated_time`,
                                    `t_tournaments`.`updated_user_id`,
                                    `t_tournaments`.`delete_flag`
                                    from `t_tournaments`
                                    left join `t_organizations`
                                    on `t_tournaments`.`sponsor_org_id` = `t_organizations`.`org_id`
                                    where 1=1
                                    and `t_tournaments`.`delete_flag` = 0
                                    and `t_organizations`.`delete_flag` = 0
                                    ');

        return $tournaments; //大会テーブルの項目すべて渡す
    }

    //開催年を条件に大会情報を取得する
    public function getTournamentsFromEntryYear($entry_year)
    {
        $tournaments = DB::select(
            "select
                                    `tourn_id`
                                    ,`tourn_name`
                                    ,`sponsor_org_id`
                                    ,`event_start_date`
                                    ,`event_end_date`
                                    ,`venue_id`
                                    ,`venue_name`
                                    ,`tourn_type`
                                    ,`tourn_url`
                                    ,`tourn_info_faile_path`
                                    ,`entrysystem_tourn_id`
                                    FROM `t_tournaments`
                                    WHERE 1=1
                                    and DATE_FORMAT(event_start_date, '%Y') = ?",
            [$entry_year]
        );
        return $tournaments;
    }

    //開催年とユーザーIDを条件に大会情報を取得する
    //団体管理者用
    public function getTournamentsFromEntryYearAndUserId($entry_year, $user_id)
    {
        $tournaments = DB::select(
            "select distinct
                                    `tourn_id`
                                    ,`tourn_name`
                                    ,`sponsor_org_id`
                                    ,`event_start_date`
                                    ,`event_end_date`
                                    ,`venue_id`
                                    ,`venue_name`
                                    ,`tourn_type`
                                    ,`tourn_url`
                                    ,`tourn_info_faile_path`
                                    ,`entrysystem_tourn_id`
                                    FROM `t_tournaments` tour
                                    left join `t_organizations` org
                                    on `tour`.sponsor_org_id = org.org_id
                                    left join `t_organization_staff` staff
                                    on org.org_id = staff.org_id 
                                    WHERE 1=1
                                    and DATE_FORMAT(event_start_date, '%Y') = ?
                                    and staff.user_id = ?",
            [
                $entry_year,
                $user_id
            ]
        );
        return $tournaments;
    }

    //大会を削除する
    //delete_flagを1にする
    public function updateDeleteFlag($tourn_id)
    {
        DB::update(
            'update `t_tournaments`
                    set `delete_flag` = 1
                    ,updated_time = ?
                    ,updated_user_id = ?
                    where 1=1
                    and `delete_flag` = 0
                    and `tourn_id` = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $tourn_id
            ]
        );
    }

    //エントリーシステムの大会IDが一致する大会を取得する
    //重複有無を確認するため
    //tourn_idが一致するレコードを除く（更新画面用）
    public function getEntrysystemTournIdDuplicateRecordWithTournId($entrySystemTournId, $tourn_id)
    {
        $tournaments = DB::select(
            'select 
                                    tourn_id
                                    ,tourn_name
                                    from `t_tournaments`
                                    where `delete_flag`=0
                                    and `entrysystem_tourn_id` = ?
                                    and `tourn_id` <> ?',
            [$entrySystemTournId, $tourn_id]
        );
        return $tournaments;
    }

    //エントリーシステムの大会IDが一致する大会を取得する
    //重複有無を確認するため
    //（登録画面用）
    public function getEntrysystemTournIdDuplicateRecord($entrySystemTournId)
    {
        $tournaments = DB::select(
            'select 
                                    tourn_id
                                    ,tourn_name
                                    from `t_tournaments`
                                    where `delete_flag`=0
                                    and `entrysystem_tourn_id` = ?',
            [$entrySystemTournId]
        );
        return $tournaments;
    }

    //マイページ 大会情報用 選手IDに紐づいたレース結果情報及び、フォロー大会情報を取得 20241028
    public function getMyPageTournamentInfo($playerId, $tournType)
    {
        $tournaments = DB::select(
            'select 
                                            `t_tournaments`.`tourn_id` as `tournId`,
                                            `t_tournaments`.`tourn_name` as `tournName`,
                                            `t_tournaments`.`tourn_type` as `tournType`, 
                                            `t_tournaments`.`event_start_date` as `eventStartDate`,
                                            `m_venue`.`venue_name` as `venueName`,
                                            `t_organizations`.`org_name` as `sponsorOrgName`
                                            FROM `t_tournaments` 
                                            left join `m_venue`
                                            on `t_tournaments`.`venue_id` = `m_venue`.`venue_id`
                                            left join `t_organizations`
                                            on `t_tournaments`.`sponsor_org_id` = `t_organizations`.`org_id`
                                            where 1=1
                                            and (
                                                exists (
                                                    select 1
                                                        FROM `t_followed_tournaments`
                                                        WHERE 1=1
                                                        and `t_tournaments`.`tourn_id` = `t_followed_tournaments`.`tourn_id`
                                                        and `t_followed_tournaments`.delete_flag = 0
                                                        and `t_followed_tournaments`.user_id = ?
                                                )
                                                or exists (
                                                    select 1
                                                        FROM `t_race_result_record` 
                                                        left join `t_followed_players` 
													    on `t_race_result_record`.`player_id` = `t_followed_players`.`player_id`
                                                        WHERE 1=1
                                                        and `t_tournaments`.`tourn_id` = `t_race_result_record`.`tourn_id`
                                                        and `t_race_result_record`.delete_flag = 0
                                                        and (
                                                            `t_race_result_record`.player_id = ?
                                                            or (
                                                                `t_followed_players`.delete_flag = 0
														        and `t_followed_players`.user_id = ?
                                                            )
                                                        )
                                                )
                                            )
                                            and `t_tournaments`.`delete_flag` = 0
                                            and `m_venue`.`delete_flag` = 0
                                            and `t_organizations`.`delete_flag` = 0
                                            and `t_tournaments`.tourn_type = ?
                                            and `t_tournaments`.event_start_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 9 MONTH) AND DATE_ADD(CURDATE(), INTERVAL 3 MONTH)
                                            ORDER BY `t_tournaments`.`event_start_date` DESC',
            [Auth::user()->user_id, $playerId, Auth::user()->user_id, $tournType]
        );
        return $tournaments;
    }


    // 自分が、選手もしくはスタッフとして所属している団体(複数)でその団体が主催している大会を取得
    public function getMyOrgsHostedTournaments()
    {
        $userId = Auth::user()->user_id;

        $tournaments = DB::select(
            'SELECT 
                `t_tournaments`.`tourn_id` AS `tournId`,
                `t_tournaments`.`tourn_name` AS `tournName`,
                `t_tournaments`.`tourn_type` AS `tournType`, 
                `t_tournaments`.`event_start_date` AS `eventStartDate`, 
                `inv`.`org_name` AS `sponsorOrgName`
                FROM `t_tournaments`
                INNER JOIN (
                    SELECT `org_id`, `org_name`
                    FROM `t_organizations` `to`
                    WHERE (
                        EXISTS (
                            SELECT `org_staff_id`
                            FROM `t_organization_staff` `tos`
                            WHERE `tos`.`org_id` = `to`.`org_id`
                            AND `tos`.`user_id` = ?
                            AND `tos`.`delete_flag` = 0
                        )
                        OR EXISTS (
                            SELECT `org_player_id`
                            FROM `t_organization_players` `top`
                            INNER JOIN `t_players` `tp`
                                ON `top`.`player_id` = `tp`.`player_id`
                                AND `tp`.`user_id` = ?
                                AND `tp`.`delete_flag` = 0
                            WHERE `top`.`org_id` = `to`.`org_id`
                            AND `top`.`delete_flag` = 0
                        )
                    )
                    AND `to`.`delete_flag` = 0
                ) AS `inv`
                ON `t_tournaments`.`sponsor_org_id` = `inv`.`org_id`
                WHERE 1=1
                AND `t_tournaments`.`delete_flag` = 0 
                ORDER BY `t_tournaments`.`event_start_date` DESC',
            [$userId, $userId]
        );

        return $tournaments;
    }

    //大会出場回数を取得
    public function getParticipatedTournCount()
    {
        $userId = Auth::user()->user_id;

        $racesResultRecord = DB::select(
            '
            SELECT 
                COUNT(DISTINCT t_race_result_record.tourn_name) as raceCount
            FROM 
                t_race_result_record
            INNER JOIN t_players
                ON t_race_result_record.player_id = t_players.player_id
            WHERE 
                t_race_result_record.delete_flag = 0
                AND t_players.delete_flag = 0
                AND t_players.user_id = ?
            ',
            [$userId]
        );

        return $racesResultRecord[0];
    }
}
