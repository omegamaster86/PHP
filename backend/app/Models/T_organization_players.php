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
    public function insertOrganizationPlayer($organizationPlayer, $org_id)
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
                $org_id,
                $organizationPlayer["player_id"],
                $current_datetime,
                $user_id,
                $current_datetime,
                $user_id,
                0
            ]
        );
        $insertId = DB::getPdo()->lastInsertId(); //挿入したIDを取得
        //Log::debug(DB::getQueryLog());
        Log::debug('insertOrganizationPlayer end.');
        return $insertId; //Insertを実行して、InsertしたレコードのID（主キー）を返す
    }

    //団体所属選手を削除する
    //delete_flagを1にする
    public function updateDeleteFlagOrganizationPlayers($org_id, $player_id)
    {
        DB::update(
            'update `t_organization_players`
                    set `delete_flag` = 1
                    ,updated_time = ?
                    ,updated_user_id = ?
                    where 1=1
                    and `delete_flag` = 0
                    and `org_id` = ?
                    and `player_id` = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $org_id,
                $player_id
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

    //検索条件で所属選手を取得する
    public function getOrganizationPlayersFromCondition($condition, $conditionValue)
    {
        DB::enableQueryLog();
        Log::debug('getOrganizationPlayersFromCondition start.');
        $sqlString = 'select
                        player_id
                        ,jara_player_id
                        ,player_name
                        ,date_of_birth
                        ,height
                        ,weight
                        ,photo
                        ,birth_country
                        ,birthCountryName
                        ,birth_prefecture
                        ,residence_country
                        ,residenceCountryName
                        ,residence_prefecture
                        ,sexName
                        ,sex_id
                        ,birthPrefectureName
                        ,residencePrefectureName
                        ,side_S
                        ,side_B
                        ,side_X
                        ,side_C
                        ,players.org_id
                        ,org.org_name
                        from
                        (
                            select
                            top.`player_id`			#選手ID
                            ,tp.`jara_player_id`	#JARA選手コード
                            ,tp.`player_name`		#選手名
                            ,tp.date_of_birth
                            ,tp.height
                            ,tp.weight
                            ,tp.photo
                            ,tp.`birth_country`
                            ,bir_cont.`country_name` as `birthCountryName`
                            ,`birth_prefecture`
                            ,tp.`residence_country`
                            ,res_cont.`country_name` as `residenceCountryName`
                            ,`residence_prefecture`
                            ,m_sex.sex as sexName	#性別
                            ,m_sex.sex_id		    #性別ID
                            ,CASE 
                                when tp.`birth_country` = 112 then bir_pref.`pref_name`
                                else null
                                end as birthPrefectureName	#出身地
                            ,CASE
                                when tp.`residence_country` = 112 then res_pref.`pref_name`
                                else null
                                end as residencePrefectureName	#居住地
                            ,CASE
                                when SUBSTRING(tp.`side_info`,8,1) = 1 then 1
                                else 0
                                end as side_S
                            ,CASE
                                when SUBSTRING(tp.`side_info`,7,1) = 1 then 1
                                else 0
                                end as side_B
                            ,CASE
                                when SUBSTRING(tp.`side_info`,6,1) = 1 then 1
                                else 0
                                end as side_X
                            ,CASE
                                when SUBSTRING(tp.`side_info`,5,1) = 1 then 1
                                else 0
                                end as side_C
                            ,min(org.org_id) as `org_id`
                            from `t_organization_players` top
                            join `t_players` tp
                            on top.`player_id` = tp.`player_id`
                            left join `m_sex`
                            on tp.`sex_id` = `m_sex`.`sex_id`
                            left join m_countries bir_cont
                            on tp.birth_country = bir_cont.country_id
                            left join m_prefectures bir_pref
                            on tp.birth_prefecture = bir_pref.pref_id
                            left join m_countries res_cont
                            on tp.residence_country = res_cont.country_id
                            left join m_prefectures res_pref
                            on tp.residence_prefecture = res_pref.pref_id
                            join t_organizations org
                            on top.org_id = org.org_id
                            left join t_race_result_record trrr
                            on tp.player_id = trrr.player_id
                            left join t_tournaments tour
                            on trrr.`tourn_id` = tour.`tourn_id`
                            where 1=1
                            and top.`delete_flag` = 0
                            and tp.`delete_flag` = 0
                            and `m_sex`.`delete_flag` = 0
                            and bir_cont.`delete_flag` = 0
                            and bir_pref.`delete_flag` = 0
                            and res_cont.`delete_flag` = 0
                            and res_pref.`delete_flag` = 0
                            and org.`delete_flag` = 0
                            and trrr.`delete_flag` = 0
                            and tour.`delete_flag` = 0
                            #ReplaceConditionString#
                            group by top.player_id
                        )players
                        join t_organizations org
                        on players.org_id = org.org_id
                        ';
        $sqlString = str_replace("#ReplaceConditionString#", $condition, $sqlString);
        $players = DB::select($sqlString, $conditionValue);
        Log::debug(DB::getQueryLog());
        Log::debug('getOrganizationPlayersFromCondition end.');
        return $players;
    }

    //団体に登録する選手検索 20240417
    public function getOrgPlayersForAddPlayerSearch($condition, $conditionValue)
    {
        DB::enableQueryLog();
        Log::debug('getOrgPlayersForAddPlayerSearch start.');
        $sqlString = 'select
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
                    from
                        ( 
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
                            from
                                ( 
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
                                        , CASE 
                                            when p.birth_country = 112 
                                                then bir_pref.`pref_name` 
                                            else null 
                                            end as birthPrefectureName #出身地
                                        , CASE 
                                            when p.residence_country = 112 
                                                then res_pref.`pref_name` 
                                            else null 
                                            end as residencePrefectureName #居住地
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
                                        LEFT JOIN m_sex ms 
                                            ON p.sex_id = ms.sex_id 
                                        LEFT JOIN m_countries bir_cont 
                                            ON p.birth_country = bir_cont.country_id 
                                        LEFT JOIN m_prefectures bir_pref 
                                            ON p.birth_prefecture = bir_pref.pref_id 
                                        LEFT JOIN m_countries res_cont 
                                            ON p.residence_country = res_cont.country_id 
                                        LEFT JOIN m_prefectures res_pref 
                                            ON p.residence_prefecture = res_pref.pref_id 
                                    where
                                        1 = 1 
                                        and p.`delete_flag` = 0 
                                        and `ms`.`delete_flag` = 0
                                        and bir_cont.`delete_flag` = 0
                                        and bir_pref.`delete_flag` = 0
                                        and res_cont.`delete_flag` = 0
                                        and res_pref.`delete_flag` = 0
                                        and p.user_id IS NOT NULL
                                ) tp 
                                LEFT JOIN ( 
                                    select
                                        player_id
                                        , org_p.org_id
                                        , torg.entrysystem_org_id
                                        , torg.org_name 
                                    from
                                        t_organization_players org_p 
                                        LEFT JOIN t_organizations torg 
                                            ON org_p.org_id = torg.org_id 
                                            AND torg.delete_flag = 0 
                                    where
                                        org_p.delete_flag = 0
                                ) top 
                                    ON tp.player_id = top.player_id 
                                LEFT JOIN ( 
                                    select
                                        trrr.player_id
                                        , tourn.tourn_name
                                        , trrr.event_id 
                                    from
                                        t_race_result_record trrr 
                                        LEFT JOIN t_tournaments tourn 
                                            ON trrr.tourn_id = tourn.tourn_id 
                                    where
                                        trrr.delete_flag = 0
                                ) tr 
                                    ON tp.player_id = tr.player_id 
                            where
                                1 = 1
                                #ReplaceConditionString# 
                            GROUP BY
                                player_id
                        ) players 
                        LEFT JOIN t_organizations org 
                        on players.org_id = org.org_id
                        ';
        $sqlString = str_replace("#ReplaceConditionString#", $condition, $sqlString);
        $players = DB::select($sqlString, $conditionValue);
        Log::debug(DB::getQueryLog());
        Log::debug('getOrgPlayersForAddPlayerSearch end.');
        return $players;
    }

    //選手IDを条件に所属選手情報を取得する
    public function getOrganizationPlayersInfoFromPlayerId($player_id)
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
                                        and op.`player_id` = ?',
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
    public function checkOrganizationPlayerIsExists($org_id, $player_id)
    {
        $check_count = DB::select(
            'select count(*) as count
                                    from `t_organization_players`
                                    where 1=1
                                    and delete_flag = 0
                                    and org_id = :org_id
                                    and player_id= :player_id',
            ['org_id' => $org_id, 'player_id' => $player_id]
        );
        //select文の返り値は配列型なので0番目を返す
        return $check_count;
    }
}
