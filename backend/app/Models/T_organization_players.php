<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
//use App\Models\Auth;

class T_organization_players extends Model
{
    use HasFactory;

    //テーブルがt_organization_staffと結びつくように指定する
    protected $table = 't_organization_players';
    protected $primaryKey = 'org_player_id';

    //団体削除による団体所属選手の削除
    //org_idをキーとして、該当所属選手のdelete_flagを1にする
    public function updateDeleteFlagByOrganizationDeletion($org_id)
    {
        Log::debug("updateDeleteFlagByOrganizationDeletion start.");
        DB::update(
            'update `t_organization_players`
                    set `delete_flag` = 1
                    ,updated_time = ?
                    ,updated_user_id = ?
                    where 1=1
                    and `delete_flag` = 0
                    and `org_id` = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $org_id
            ]
        );
        Log::debug("updateDeleteFlagByOrganizationDeletion end.");
    }

    //interfaceのTeamPlayerInformationResponseを引数としてinsertを実行する
    //登録日時、更新日時は「current_datetime」
    //登録ユーザー、更新ユーザーは「user_id」
    //で指定する
    public function insertOrganizationPlayer($playerId, $orgId)
    {
        Log::debug('insertOrganizationPlayer start.');
        //DB::enableQueryLog();
        $current_datetime = now()->format('Y-m-d H:i:s.u');
        $user_id = Auth::user()->user_id;
        DB::insert(
            'insert INTO `t_organization_players`
                    (
                        `org_id`,
                        `player_id`,
                        `registered_time`,
                        `registered_user_id`,
                        `updated_time`,
                        `updated_user_id`,
                        `delete_flag`
                    )
                    VALUES(?,?,?,?,?,?,?)',
            [
                $orgId,
                $playerId,
                $current_datetime,
                $user_id,
                $current_datetime,
                $user_id,
                0
            ]
        );
        $insertId = DB::getPdo()->lastInsertId(); //挿入したIDを取得
        Log::debug('insertOrganizationPlayer end.');
        return $insertId; //Insertを実行して、InsertしたレコードのID（主キー）を返す
    }

    // 団体所属選手を論理削除する。
    public function inactivateOrganizationPlayer($orgId, $playerId)
    {
        DB::update(
            'UPDATE `t_organization_players` SET
                `delete_flag` = 1,
                updated_time = ?,
                updated_user_id = ?
            WHERE 1=1
                AND `delete_flag` = 0
                AND `org_id` = ?
                AND `player_id` = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $orgId,
                $playerId
            ]
        );
    }

    // 論理削除されたレコードをactivateする。
    public function activateOrganizationPlayer($orgId, $playerId)
    {
        DB::update(
            'UPDATE `t_organization_players` SET
                `delete_flag` = 0,
                updated_time = ?,
                updated_user_id = ?
            WHERE 1=1
                AND `delete_flag` = 1
                AND `org_id` = ?
                AND `player_id` = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $orgId,
                $playerId
            ]
        );
    }

    //団体所属選手を削除する
    //delete_flagを1にする
    public function  updateDeleteFlagAllOrganizations($player_id)
    {
        DB::update(
            'update `t_organization_players`
                    set `delete_flag` = 1
                    ,updated_time = ?
                    ,updated_user_id = ?
                    where 1=1
                    and `delete_flag` = 0
                    and `player_id` = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $player_id
            ]
        );
    }

    // 団体に所属する選手を取得する。
    public function getOrgPlayers($orgId)
    {
        Log::debug('getOrgPlayers start.');
        $sqlString =
            "SELECT
                top.`player_id`
                ,tp.`jara_player_id`
                ,tp.`player_name`
                ,tp.height
                ,tp.weight
                ,tp.photo
                ,bir_cont.`country_name` AS `birthCountryName`
                ,bir_pref.`pref_name` AS birthPrefectureName
                ,res_cont.`country_name` AS `residenceCountryName`
                ,res_pref.`pref_name` AS residencePrefectureName
                ,m_sex.sex AS sexName
                ,CASE
                    when SUBSTRING(tp.`side_info`,8,1) = 1 then 1
                    else 0
                    end AS side_S
                ,CASE
                    when SUBSTRING(tp.`side_info`,7,1) = 1 then 1
                    else 0
                    end AS side_B
                ,CASE
                    when SUBSTRING(tp.`side_info`,6,1) = 1 then 1
                    else 0
                    end AS side_X
                ,CASE
                    when SUBSTRING(tp.`side_info`,5,1) = 1 then 1
                    else 0
                    end AS side_C
                ,org.org_id AS `org_id`
                ,org.org_name AS `org_name`
            FROM `t_organization_players` top
            INNER JOIN `t_players` tp on
                tp.`player_id` = top.`player_id`
                AND tp.`delete_flag` = 0
            LEFT OUTER JOIN `m_sex` on
                `m_sex`.`sex_id` = tp.`sex_id`
                AND m_sex.`delete_flag` = 0
            LEFT OUTER JOIN m_countries bir_cont on
                bir_cont.country_id = tp.birth_country
                AND bir_cont.`delete_flag` = 0
            LEFT OUTER JOIN m_prefectures bir_pref on
                bir_pref.pref_id = tp.birth_prefecture
                AND bir_pref.`delete_flag` = 0
            LEFT OUTER JOIN m_countries res_cont on
                res_cont.country_id = tp.residence_country
                AND res_cont.`delete_flag` = 0
            LEFT OUTER JOIN m_prefectures res_pref on
                res_pref.pref_id = tp.residence_prefecture
                AND res_pref.`delete_flag` = 0
            INNER JOIN t_organizations org on
                org.org_id = top.org_id
                AND org.`delete_flag` = 0
            WHERE 1=1
            AND top.`delete_flag` = 0
            AND top.org_id = :org_id
            ";
        $players = DB::select($sqlString, ['org_id' => $orgId]);
        Log::debug('getOrgPlayers end.');
        return $players;
    }

    //団体に登録する選手検索 20240417
    public function getOrgPlayersForAddPlayerSearch($condition, $conditionValue)
    {
        DB::enableQueryLog();
        Log::debug('getOrgPlayersForAddPlayerSearch start.');
        $sqlString = '
            select
                player_id
                , jara_player_id
                , player_name
                , date_of_birth
                , height
                , weight
                , photo
                , birth_country
                , birthCountryName
                , birth_prefecture
                , residence_country
                , residenceCountryName
                , residence_prefecture
                , sexName
                , sex_id
                , birthPrefectureName
                , residencePrefectureName
                , side_S
                , side_B
                , side_X
                , side_C
                , players.org_id
                , org.org_name 
            from ( 
                select
                    tp.player_id AS player_id
                    , jara_player_id
                    , player_name
                    , date_of_birth
                    , height
                    , weight
                    , photo
                    , birth_country
                    , birthCountryName
                    , birth_prefecture
                    , residence_country
                    , residenceCountryName
                    , residence_prefecture
                    , sexName
                    , sex_id
                    , birthPrefectureName
                    , residencePrefectureName
                    , side_S
                    , side_B
                    , side_X
                    , side_C
                    , MAX(top.org_id) AS org_id 
                from ( 
                    select
                        p.player_id
                        , p.jara_player_id
                        , p.player_name
                        , p.date_of_birth
                        , p.height
                        , p.weight
                        , p.photo
                        , p.birth_country
                        , bir_cont.country_name AS birthCountryName
                        , p.birth_prefecture
                        , p.residence_country
                        , res_cont.country_name AS residenceCountryName
                        , p.residence_prefecture
                        , ms.sex AS sexName
                        , p.sex_id
                        , bir_pref.`pref_name` as birthPrefectureName
                        , res_pref.`pref_name` as residencePrefectureName
                        , p.side_info
                        , CASE 
                            when SUBSTRING(p.side_info, 8, 1) = 1 
                                then 1 
                            else 0 
                            end as side_S
                        , CASE 
                            when SUBSTRING(p.side_info, 7, 1) = 1 
                                then 1 
                            else 0 
                            end as side_B
                        , CASE 
                            when SUBSTRING(p.side_info, 6, 1) = 1 
                                then 1 
                            else 0 
                            end as side_X
                        , CASE 
                            when SUBSTRING(p.`side_info`, 5, 1) = 1 
                                then 1 
                            else 0 
                            end as side_C 
                    from
                        t_players p 
                    LEFT OUTER JOIN m_sex ms ON
                        p.sex_id = ms.sex_id
                        and `ms`.`delete_flag` = 0
                    LEFT OUTER JOIN m_countries bir_cont ON
                        p.birth_country = bir_cont.country_id
                        and bir_cont.`delete_flag` = 0
                    LEFT OUTER JOIN m_prefectures bir_pref ON
                        p.birth_prefecture = bir_pref.pref_id
                        and bir_pref.`delete_flag` = 0
                    LEFT OUTER JOIN m_countries res_cont ON
                        p.residence_country = res_cont.country_id
                        and res_cont.`delete_flag` = 0
                    LEFT OUTER JOIN m_prefectures res_pref ON
                        p.residence_prefecture = res_pref.pref_id
                        and res_pref.`delete_flag` = 0
                    where
                        1 = 1 
                        and p.`delete_flag` = 0 
                ) tp 
                LEFT JOIN ( 
                    select
                        player_id
                        , org_p.org_id
                        , torg.entrysystem_org_id
                        , torg.org_name 
                    from
                        t_organization_players org_p 
                    LEFT JOIN t_organizations torg ON
                        org_p.org_id = torg.org_id 
                        AND torg.delete_flag = 0 
                    where
                        org_p.delete_flag = 0
                ) top ON tp.player_id = top.player_id 
                LEFT JOIN ( 
                    select
                        trrr.player_id
                        , tourn.tourn_name
                        , trrr.event_id 
                    from
                        t_race_result_record trrr 
                    LEFT JOIN t_tournaments tourn ON
                        trrr.tourn_id = tourn.tourn_id 
                    where
                        trrr.delete_flag = 0
                ) tr ON tp.player_id = tr.player_id 
                where
                    1 = 1
                    #ReplaceConditionString# 
                GROUP BY
                    player_id
            ) players 
            LEFT JOIN t_organizations org on
                players.org_id = org.org_id
            ';
        $sqlString = str_replace("#ReplaceConditionString#", $condition, $sqlString);
        $players = DB::select($sqlString, $conditionValue);
        Log::debug('getOrgPlayersForAddPlayerSearch end.');
        return $players;
    }

    //選手IDを条件に所属選手情報を取得する
    public function getOrganizationPlayersInfoFromPlayerId($player_id)
    {
        $org_players_info = DB::select(
            'SELECT 
                `org_player_id` AS `id`
                ,op.player_id
                ,op.org_id
                ,tp.jara_player_id
                ,tp.player_name
                ,tp.date_of_birth
                ,sex.`sex` AS `sexName`
                ,tp.`sex_id`
                ,tp.height
                ,tp.weight
                ,tp.side_info
                ,bir_cont.`country_name` AS `birthCountryName`
                ,`birth_country`
                ,bir_pref.`pref_name` AS `birthPrefectureName`
                ,`birth_prefecture`
                ,res_cont.`country_name` AS `residenceCountryName`
                ,`residence_country`
                ,res_pref.`pref_name` AS `residencePrefectureName`
                ,`residence_prefecture`
                ,tp.photo
                ,tp.delete_flag
            FROM `t_organization_players` op
            INNER JOIN `t_players` tp ON
                op.player_id = tp.player_id
                AND tp.`delete_flag` = 0
            LEFT OUTER JOIN `m_sex` sex ON
                tp.sex_id = sex.sex_id
                AND sex.`delete_flag` = 0
            LEFT OUTER JOIN m_countries bir_cont ON
                tp.birth_country = bir_cont.country_id
                AND bir_cont.`delete_flag` = 0
            LEFT OUTER JOIN m_prefectures bir_pref ON
                tp.birth_prefecture = bir_pref.pref_id
                AND bir_pref.`delete_flag` = 0
            LEFT OUTER JOIN m_countries res_cont ON
                tp.residence_country = res_cont.country_id
                AND res_cont.`delete_flag` = 0
            LEFT OUTER JOIN m_prefectures res_pref ON
                tp.residence_prefecture = res_pref.pref_id
                AND res_pref.`delete_flag` = 0
            WHERE 1=1
                AND op.`delete_flag` = 0
                AND op.`player_id` = ?',
            [$player_id]
        );
        return $org_players_info;
    }

    //JARA選手コードを条件に所属選手情報を取得する
    public function getOrganizationPlayersInfoFromJaraPlayerId($jara_player_id)
    {
        $org_players_info = DB::select(
            'select 
                                        `org_player_id` as `id`
                                        ,op.player_id
                                        ,op.org_id
                                        ,tp.jara_player_id
                                        ,tp.player_name
                                        ,tp.date_of_birth
                                        ,sex.`sex` as `sexName`
                                        ,tp.`sex_id`
                                        ,tp.height
                                        ,tp.weight
                                        ,tp.side_info
                                        ,bir_cont.`country_name` as `birthCountryName`
                                        ,`birth_country`
                                        ,bir_pref.`pref_name` as `birthPrefectureName`
                                        ,`birth_prefecture`
                                        ,res_cont.`country_name` as `residenceCountryName`
                                        ,`residence_country`
                                        ,res_pref.`pref_name` as `residencePrefectureName`
                                        ,`residence_prefecture`
                                        ,tp.photo
                                        ,tp.delete_flag
                                        from `t_organization_players` op
                                        left join `t_players` tp
                                        on op.player_id = tp.player_id
                                        left join `m_sex` sex
                                        on tp.sex_id = sex.sex_id
                                        left join m_countries bir_cont
                                        on tp.birth_country = bir_cont.country_id
                                        left join m_prefectures bir_pref
                                        on tp.birth_prefecture = bir_pref.pref_id
                                        left join m_countries res_cont
                                        on tp.residence_country = res_cont.country_id
                                        left join m_prefectures res_pref
                                        on tp.residence_prefecture = res_pref.pref_id
                                        where 1=1
                                        and op.`delete_flag` = 0
                                        and  tp.`delete_flag` = 0
                                        and  sex.`delete_flag` = 0
                                        and  bir_cont.`delete_flag` = 0
                                        and  bir_pref.`delete_flag` = 0
                                        and  res_cont.`delete_flag` = 0
                                        and  res_pref.`delete_flag` = 0
                                        and tp.`jara_player_id` = ?',
            [$jara_player_id]
        );
        return $org_players_info;
    }

    //選手IDと団体IDを指定した団体所属選手が存在するかを確認する
    public function countOrganizationPlayers($orgId, $playerId)
    {
        $result = DB::select(
            'SELECT COUNT(*) AS count
            FROM `t_organization_players`
            WHERE 1=1
                # NOTE: Activeなレコードであっても構わずUPDATEすればよいのでdelete_flagは条件に入れない。
                AND org_id = :org_id
                AND player_id= :player_id',
            ['org_id' => $orgId, 'player_id' => $playerId]
        );

        return $result[0]->count;
    }
}
