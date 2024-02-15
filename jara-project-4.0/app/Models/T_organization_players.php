<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class T_organization_players extends Model
{
    use HasFactory;

    //テーブルがt_organization_staffと結びつくように指定する
    protected $table = 't_organization_players';
    protected $primaryKey = 'org_player_id';

    public function getOrganizationPlayers($target_org_id)
    {
        $players = DB::select('select 
                                `org_player_id` as `id`
                                ,op.player_id
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
                                and  (tp.`delete_flag` = 0 or tp.`delete_flag` is null)
                                and  (sex.`delete_flag` = 0 or sex.`delete_flag` is null)
                                and  (bir_cont.`delete_flag` = 0 or bir_cont.`delete_flag` is null)
                                and  (bir_pref.`delete_flag` = 0 or bir_pref.`delete_flag` is null)
                                and  (res_cont.`delete_flag` = 0 or res_cont.`delete_flag` is null)
                                and  (res_pref.`delete_flag` = 0 or res_pref.`delete_flag` is null)
                                and `org_id` = ?
                                order by org_player_id'
                                ,[$target_org_id]
                            );
        return $players;
    }

    //団体削除による団体所属選手の削除
    //org_idをキーとして、該当所属選手のdelete_flagを1にする
    public function updateDeleteFlagByOrganizationDeletion($org_id)
    {   
        DB::update('update `t_organization_players`
                    set `delete_flag` = 1
                    where 1=1
                    and `org_id` = ?'
                    ,[$org_id]);
    }

    //団体所属選手登録画面用
    //団体に所属する選手に選手情報を付与してデータを取得する    
    public function getOrganizationPlayersInfo($target_org_id)
    {
        $players = DB::select('select 
                                top.`org_player_id`		#団体所属ID
                                ,top.`org_id`			#団体ID
                                ,top.`player_id`		#選手ID
                                ,tp.`jara_player_id`	#JARA選手コード
                                ,tp.`player_name`		#選手名
                                ,CASE 
                                    when tp.`birth_country` = 112 then bir_pref.`pref_name`
                                    else bir_cont.`country_name`
                                    end as birth_place	#出身地
                                ,CASE
                                    when tp.`residence_country` = 112 then res_pref.`pref_name`
                                    else res_cont.country_name
                                    end as residence	#居住地
                                ,CASE
                                    when SUBSTRING(tp.`side_info`,8,1) = 1 then "◯"
                                    else "×"
                                    end as side_S
                                ,CASE
                                    when SUBSTRING(tp.`side_info`,7,1) = 1 then "◯"
                                    else "×"
                                    end as side_B
                                ,CASE
                                    when SUBSTRING(tp.`side_info`,6,1) = 1 then "◯"
                                    else "×"
                                    end as side_X
                                ,CASE
                                    when SUBSTRING(tp.`side_info`,5,1) = 1 then "◯"
                                    else "×"
                                    end as side_C
                                from `t_organization_players` top
                                join `t_players` tp
                                on top.`player_id` = tp.`player_id`
                                left join m_countries bir_cont
                                on tp.birth_country = bir_cont.country_id
                                left join m_prefectures bir_pref
                                on tp.birth_prefecture = bir_pref.pref_id
                                left join m_countries res_cont
                                on tp.residence_country = res_cont.country_id
                                left join m_prefectures res_pref
                                on tp.residence_prefecture = res_pref.pref_id
                                where 1=1
                                and top.`delete_flag` = 0
                                and tp.`delete_flag` = 0
                                and `org_id` = ?
                                order by `org_player_id`'
                                ,[$target_org_id]
                            );
        return $players;
    }

    //団体所属選手テーブルへinsertする
    public function insertOrganizationPlayers($replaceValueString,$insertValue)
    {
        $sqlString = 'INSERT INTO `t_organization_players`
                        (
                            `org_player_id`,
                            `org_id`,
                            `player_id`,
                            `registered_time`,
                            `registered_user_id`,
                            `updated_time`,
                            `updated_user_id`,
                            `delete_flag`
                        )VALUES
                        (
                            #ReplaceValueString#
                        )';
        $sqlString = str_replace('#ReplaceValueString#',$replaceValueString,$sqlString);
        DB::insert($sqlString,$insertValue);
    }

    //interfaceのTeamPlayerInformationResponseを引数としてinsertを実行する
    //登録日時、更新日時は「current_datetime」
    //登録ユーザー、更新ユーザーは「user_id」
    //で指定する
    public function insertOrganizationPlayer($organizationPlayer)
    {
        DB::insert('insert INTO `t_organization_players`
                    (
                        `org_id`,
                        `player_id`,
                        `joining_date`,
                        `deperture_date`
                        `registered_time`,
                        `registered_user_id`,
                        `updated_time`,
                        `updated_user_id`,
                        `delete_flag`
                    )
                    VALUES
                    (
                        :org_id,
                        :player_id,
                        :joining_date,
                        :deperture_date
                        :current_datetime,
                        :user_id,
                        :current_datetime,
                        :user_id,
                        0
                    )'
                    ,$organizationPlayer);
        $insertId = DB::getPdo()->lastInsertId(); //挿入したIDを取得
        return $insertId; //Insertを実行して、InsertしたレコードのID（主キー）を返す
    }

    //団体所属選手を削除する
    //delete_flagを1にする
    public function updateDeleteFlagOrganizationPlayers($player_id)
    {
        DB::update('update `t_organization_staff`
                        set `delete_flag` = 1
                        where 1=1
                        and `player_id` = ?'
                    ,[$player_id]);
    }

    //検索条件で所属選手を取得する
    public function getOrganizationPlayersFromCondition($condition,$conditionValue)
    {
        $sqlString = 'select
                        top.`player_id`			#選手ID
                        ,tp.`jara_player_id`	#JARA選手コード
                        ,tp.`player_name`		#選手名
                        ,m_sex.sex				#性別
                        ,CASE 
                            when tp.`birth_country` = 112 then bir_pref.`pref_name`
                            else bir_cont.`country_name`
                            end as birth_place	#出身地
                        ,CASE
                            when tp.`residence_country` = 112 then res_pref.`pref_name`
                            else res_cont.country_name
                            end as residence	#居住地
                        ,CASE
                            when SUBSTRING(tp.`side_info`,8,1) = 1 then "◯"
                            else "×"
                            end as side_S
                        ,CASE
                            when SUBSTRING(tp.`side_info`,7,1) = 1 then "◯"
                            else "×"
                            end as side_B
                        ,CASE
                            when SUBSTRING(tp.`side_info`,6,1) = 1 then "◯"
                            else "×"
                            end as side_X
                        ,CASE
                            when SUBSTRING(tp.`side_info`,5,1) = 1 then "◯"
                            else "×"
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
                        and (`m_sex`.`delete_flag` = 0 or `m_sex`.`delete_flag` is null)
                        and (bir_cont.`delete_flag` = 0 or bir_cont.`delete_flag` is null)
                        and (bir_pref.`delete_flag` = 0 or bir_pref.`delete_flag` is null)
                        and (res_cont.`delete_flag` = 0 or res_cont.`delete_flag` is null)
                        and (res_pref.`delete_flag` = 0 or res_pref.`delete_flag` is null)
                        and org.`delete_flag` = 0
                        and (trrr.`delete_flag` = 0 or trrr.`delete_flag` is null)
                        and (tour.`delete_flag` = 0 or tour.`delete_flag` is null)
                        #ReplaceConditionString#
                        group by top.player_id
                        ';
        $sqlString = str_replace("#ReplaceConditionString#",$condition,$sqlString);
        //dd($sqlString);
        $players = DB::select($sqlString,$conditionValue);
        return $players;
    }

    //選手IDを条件に所属選手情報を取得する
    public function getOrganizationPlayersInfoFromPlayerId($player_id)
    {
        $org_players_info = DB::select('select 
                                        `org_player_id` as `id`
                                        ,op.player_id
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
                                        and  (tp.`delete_flag` = 0 or tp.`delete_flag` is null)
                                        and  (sex.`delete_flag` = 0 or sex.`delete_flag` is null)
                                        and  (bir_cont.`delete_flag` = 0 or bir_cont.`delete_flag` is null)
                                        and  (bir_pref.`delete_flag` = 0 or bir_pref.`delete_flag` is null)
                                        and  (res_cont.`delete_flag` = 0 or res_cont.`delete_flag` is null)
                                        and  (res_pref.`delete_flag` = 0 or res_pref.`delete_flag` is null)
                                        and `player_id` = :player_id
                                        ',$player_id);
        return $org_players_info;
    }
}