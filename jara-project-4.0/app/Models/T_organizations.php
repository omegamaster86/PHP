<?php

namespace App\Models;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class T_organizations extends Model
{
    use HasFactory;

    //テーブルがt_organizationsと結びつくように指定する
    protected $table = 't_organizations';
    protected $primaryKey = 'org_id';

    public function getOrganization($orgId)
    {
        $organization = DB::select('select 
                                    `org_id`,
                                    `entrysystem_org_id`,
                                    `org_name`,
                                    `jara_org_type`,
                                    case jmot.org_type
                                        when 0 then "任意"
                                        when 1 then "正式"
                                    end as `jaraOrgTypeName`,
                                    `jara_org_reg_trail`,
                                    `pref_org_type`,
                                    case pmot.org_type
                                        when 0 then "任意"
                                        when 1 then "正式"
                                    end as `prefOrgTypeName`,
                                    `pref_org_reg_trail`,
                                    case
                                        when `jara_org_type` = 1 and `pref_org_type` = 1 then "JARA・県ボ"
                                        when `jara_org_type` = 1 then "JARA"
                                        when `pref_org_type` = 1 then "県ボ"
                                        else "任意"
                                    end as `orgTypeName`,
                                    `org_class`,
                                    `org_class_name`    as `orgClassName`,
                                    `founding_year`,
                                    `post_code`,
                                    `location_country`,
                                    `country_name`,
                                    `country_name` as `locationCountry`,
                                    `location_prefecture`,
                                    `pref_name` as `locationPrefectureName`,
                                    `address1`,
                                    `address2`
                                    from `t_organizations`
                                    left join `m_countries`
                                    on `t_organizations`.`location_country` = `m_countries`.`country_id`
                                    left join `m_prefectures`
                                    on `t_organizations`.`location_prefecture` = `m_prefectures`.`pref_id`
                                    left join `m_organization_class`
                                    on `t_organizations`.`org_class` = `m_organization_class`.`org_class_id`
                                    left join `m_organization_type` jmot
                                    on `t_organizations`.`jara_org_type` = jmot.`org_type_id`
                                    left join `m_organization_type` pmot
                                    on `t_organizations`.`pref_org_type` = pmot.`org_type_id`
                                    where 1=1
                                    and `t_organizations`.`delete_flag`=0
                                    and (`m_countries`.`delete_flag` = 0 or `m_countries`.`delete_flag` is null)
                                    and (`m_prefectures`.`delete_flag` = 0 or `m_prefectures`.`delete_flag` is null)
                                    and (`m_organization_class`.`delete_flag` = 0 or `m_organization_class`.`delete_flag` is null)
                                    and (jmot.`delete_flag` = 0 or jmot.`delete_flag` is null)
                                    and (pmot.`delete_flag` = 0 or pmot.`delete_flag` is null)
                                    and `org_id`=?'
                                    ,[$orgId]);
        //1つの団体IDを取得するため0番目だけを返す
        $targetOrg = null;
        if(!empty($organization)){
            $targetOrg = $organization[0];
        }
        return $targetOrg;
    }

    //reactの団体管理画面用に作成
    public function getOrganizationForOrgManagement($orgId)
    {
        $organization = DB::select('select 
                                    `org_id`,
                                    `entrysystem_org_id`,
                                    `org_name`,
                                    `jara_org_type`,
                                    case jmot.org_type
                                        when 0 then "任意"
                                        when 1 then "正式"
                                    end as `jaraOrgTypeName`,
                                    `jara_org_reg_trail`,
                                    `pref_org_type`,
                                    case pmot.org_type
                                        when 0 then "任意"
                                        when 1 then "正式"
                                    end as `prefOrgTypeName`,
                                    `pref_org_reg_trail`,
                                    case
                                        when `jara_org_type` = 1 and `pref_org_type` = 1 then "JARA・県ボ"
                                        when `jara_org_type` = 1 then "JARA"
                                        when `pref_org_type` = 1 then "県ボ"
                                        else "任意"
                                    end as `orgTypeName`,
                                    `org_class`,
                                    `org_class_name`    as `orgClassName`,
                                    `founding_year`,
                                    `post_code`,
                                    `location_country`,
                                    `country_name`,
                                    `country_name` as `locationCountry`,
                                    `location_prefecture`,
                                    `pref_name` as `locationPrefectureName`,
                                    `address1`,
                                    `address2`
                                    from `t_organizations`
                                    left join `m_countries`
                                    on `t_organizations`.`location_country` = `m_countries`.`country_id`
                                    left join `m_prefectures`
                                    on `t_organizations`.`location_prefecture` = `m_prefectures`.`pref_id`
                                    left join `m_organization_class`
                                    on `t_organizations`.`org_class` = `m_organization_class`.`org_class_id`
                                    left join `m_organization_type` jmot
                                    on `t_organizations`.`jara_org_type` = jmot.`org_type_id`
                                    left join `m_organization_type` pmot
                                    on `t_organizations`.`pref_org_type` = pmot.`org_type_id`
                                    where 1=1
                                    and `t_organizations`.`delete_flag`=0
                                    and (`m_countries`.`delete_flag` = 0 or `m_countries`.`delete_flag` is null)
                                    and (`m_prefectures`.`delete_flag` = 0 or `m_prefectures`.`delete_flag` is null)
                                    and (`m_organization_class`.`delete_flag` = 0 or `m_organization_class`.`delete_flag` is null)
                                    and (jmot.`delete_flag` = 0 or jmot.`delete_flag` is null)
                                    and (pmot.`delete_flag` = 0 or pmot.`delete_flag` is null)
                                    and `org_id`=?'
                                    ,[$orgId]);
        return $organization;
    }

    //Insertを実行して、InsertしたレコードのID（主キー）を返す
    public function insertOrganization($organizationInfo)
    {
        DB::insert('insert into `t_organizations`
                    (
                        `entrysystem_org_id`,
                        `org_name`,
                        `jara_org_type`,
                        `jara_org_reg_trail`,
                        `pref_org_type`,
                        `pref_org_reg_trail`,
                        `org_class`,
                        `founding_year`,
                        `post_code`,
                        `location_country`,
                        `location_prefecture`,
                        `address1`,
                        `address2`,
                        `registered_time`,
                        `registered_user_id`,
                        `updated_time`,
                        `updated_user_id`,
                        `delete_flag`
                    )values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        $organizationInfo['entrysystemOrgId'],
                        $organizationInfo['orgName'],
                        $organizationInfo['jaraOrgType'],
                        $organizationInfo['jaraOrgRegTrail'],
                        $organizationInfo['prefOrgType'],
                        $organizationInfo['prefOrgRegTrail'],
                        $organizationInfo['orgClass'],
                        $organizationInfo['foundingYear'],
                        $organizationInfo['post_code'],
                        //$organizationInfo['country'],
                        112,                        //country=日本
                        $organizationInfo['pref_id'],
                        $organizationInfo['address1'],
                        $organizationInfo['address2'],
                        now()->format('Y-m-d H:i:s.u'),
                        Auth::user()->user_id,
                        now()->format('Y-m-d H:i:s.u'),
                        Auth::user()->user_id,
                        0
                    ]
                );
        //挿入したIDを取得
        $insertId =  DB::getPdo()->lastInsertId();
        return $insertId;
    }

    //任意の団体情報を更新する
    public function updateOrganization($organizationInfo)
    {
        DB::update(
                'update `t_organizations`
                set `entrysystem_org_id` = ?,
                `org_name` = ?,
                `jara_org_type` = ?,
                `jara_org_reg_trail` = ?,
                `pref_org_type` = ?,
                `pref_org_reg_trail` = ?,
                `org_class` = ?,
                `founding_year` = ?,
                `post_code` = ?,
                `location_country` = ?,
                `location_prefecture` = ?,
                `address1` = ?,
                `address2` = ?,                                
                `updated_time` = ?,
                `updated_user_id` = ?
                where `org_id` = ?
            ',[
                $organizationInfo['entrysystemOrgId'],
                $organizationInfo['orgName'],
                $organizationInfo['jaraOrgType'],
                $organizationInfo['jaraOrgRegTrail'],
                $organizationInfo['prefOrgType'],
                $organizationInfo['prefOrgRegTrail'],
                $organizationInfo['orgClass'],
                $organizationInfo['foundingYear'],
                $organizationInfo['post_code'],
                112,                                    //country=日本
                $organizationInfo['pref_id'],
                $organizationInfo['address1'],
                $organizationInfo['address2'],
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $organizationInfo['org_id'],
            ]
        );
    }

    //エントリーシステムの団体IDの数を取得する
    //重複有無を確認するため
    //org_idが一致するレコードを除く（更新画面用）
    public function getEntrysystemOrgIdCountWithOrgId($entrySystemOrgId,$org_id)
    {
        $counts = DB::select('select count(*) as "count"
                                    from `t_organizations`
                                    where `delete_flag`=0
                                    and `entrysystem_org_id` = ?
                                    and `org_id` <> ?'
                                ,[$entrySystemOrgId,$org_id]
                            );
        $count = $counts[0]->count;
        return $count;
    }

    //エントリーシステムの団体IDの数を取得する
    //重複有無を確認するため
    //（登録画面用）
    public function getEntrysystemOrgIdCount($entrySystemOrgId)
    {
        $counts = DB::select('select count(*) as "count"
                                    from `t_organizations`
                                    where `delete_flag`=0
                                    and `entrysystem_org_id` = ?'
                                ,[$entrySystemOrgId]
                            );
        $count = $counts[0]->count;
        return $count;
    }

    //エントリー団体IDから団体名を取得する
    public function getOrgInfoFromEntrySystemOrgId($entrySystemOrgId)
    {
        $orgInfos = DB::select('select 
                                `org_id`
                                ,`org_name`
                                from `t_organizations`
                                where `delete_flag`=0
                                and `entrysystem_org_id`=?'
                                ,[$entrySystemOrgId]
                            );
        $orgInfo = $orgInfos[0];
        return $orgInfo;
    }

    //団体の削除
    //org_idをキーとして、delete_flagを1にする
    public function updateDeleteFlag($org_id)
    {
        DB::update('update `t_organizations`
                    set `delete_flag` = ?
                    where 1=1
                    and `org_id` = ?'
                    ,[1,$org_id]);
    }

    //検索条件を受け取って、t_organizationを検索し、その結果を返す
    public function getOrganizationWithSearchCondition($searchCondition,$value_array)
    {
        DB::enableQueryLog();

        $sqlString = 'select 
                        `org_id`,
                        `entrysystem_org_id`,
                        `org_name`,
                        `jara_org_type`,
                        case jmot.org_type
                            when 0 then "任意"
                            when 1 then "正式"
                        end as `jaraOrgTypeName`,
                        `jara_org_reg_trail`,
                        `pref_org_type`,
                        case pmot.org_type
                            when 0 then "任意"
                            when 1 then "正式"
                        end as `prefOrgTypeName`,
                        `pref_org_reg_trail`,
                        case
                            when `jara_org_type` = 1 and `pref_org_type` = 1 then "JARA・県ボ"
                            when `jara_org_type` = 1 then "JARA"
                            when `pref_org_type` = 1 then "県ボ"
                            else "任意"
                        end as `orgTypeName`,
                        `org_class`,
                        `org_class_name`    as `orgClassName`,
                        `founding_year`,
                        `post_code`,
                        `location_country`,
                        `country_name`,
                        `country_name` as `locationCountry`,
                        `location_prefecture`,
                        `pref_name` as `locationPrefectureName`,
                        `address1`,
                        `address2`
                        from `t_organizations`
                        left join `m_countries`
                        on `t_organizations`.`location_country` = `m_countries`.`country_id`
                        left join `m_prefectures`
                        on `t_organizations`.`location_prefecture` = `m_prefectures`.`pref_id`
                        left join `m_organization_class`
                        on `t_organizations`.`org_class` = `m_organization_class`.`org_class_id`
                        left join `m_organization_type` jmot
                        on `t_organizations`.`jara_org_type` = jmot.`org_type_id`
                        left join `m_organization_type` pmot
                        on `t_organizations`.`pref_org_type` = pmot.`org_type_id`
                        where 1=1
                        and `t_organizations`.`delete_flag`=0
                        and (`m_countries`.`delete_flag` = 0 or `m_countries`.`delete_flag` is null)
                        and (`m_prefectures`.`delete_flag` = 0 or `m_prefectures`.`delete_flag` is null)
                        and (`m_organization_class`.`delete_flag` = 0 or `m_organization_class`.`delete_flag` is null)
                        and (jmot.`delete_flag` = 0 or jmot.`delete_flag` is null)
                        and (pmot.`delete_flag` = 0 or pmot.`delete_flag` is null)
                        #SearchCondition#
                        order by `org_id`';
        $sqlString = str_replace('#SearchCondition#',$searchCondition,$sqlString);
        $organizations = DB::select($sqlString,$value_array);
        return $organizations;
    }

    public function getOrganizationName()
    {
        $organization_name_list = DB::select('select org_name
                                        from t_organizations
                                        where delete_flag = 0
                                        order by org_id'
                                    );
        return $organization_name_list;
    }

    public function getOrganizations()
    {
        $organizations = DB::select('select 
                                    `org_id`,
                                    `entrysystem_org_id`,
                                    `org_name`,
                                    `jara_org_type`,
                                    case jmot.org_type
                                        when 0 then "任意"
                                        when 1 then "正式"
                                    end as `jaraOrgTypeName`,
                                    `jara_org_reg_trail`,
                                    `pref_org_type`,
                                    case pmot.org_type
                                        when 0 then "任意"
                                        when 1 then "正式"
                                    end as `prefOrgTypeName`,
                                    `pref_org_reg_trail`,
                                    case
                                        when `jara_org_type` = 1 and `pref_org_type` = 1 then "JARA・県ボ"
                                        when `jara_org_type` = 1 then "JARA"
                                        when `pref_org_type` = 1 then "県ボ"
                                        else "任意"
                                    end as `orgTypeName`,
                                    `org_class`,
                                    `org_class_name`    as `orgClassName`,
                                    `founding_year`,
                                    `post_code`,
                                    `location_country`,
                                    `country_name` as `locationCountry`,
                                    `location_prefecture`,
                                    `pref_name` as `locationPrefectureName`,
                                    `address1`,
                                    `address2`
                                    from `t_organizations`
                                    left join `m_countries`
                                    on `t_organizations`.`location_country` = `m_countries`.`country_id`
                                    left join `m_prefectures`
                                    on `t_organizations`.`location_prefecture` = `m_prefectures`.`pref_id`
                                    left join `m_organization_class`
                                    on `t_organizations`.`org_class` = `m_organization_class`.`org_class_id`
                                    left join `m_organization_type` jmot
                                    on `t_organizations`.`jara_org_type` = jmot.`org_type_id`
                                    left join `m_organization_type` pmot
                                    on `t_organizations`.`pref_org_type` = pmot.`org_type_id`
                                    where 1=1
                                    and `t_organizations`.`delete_flag`=0
                                    and (`m_countries`.`delete_flag` = 0 or `m_countries`.`delete_flag` is null)
                                    and (`m_prefectures`.`delete_flag` = 0 or `m_prefectures`.`delete_flag` is null)
                                    and (`m_organization_class`.`delete_flag` = 0 or `m_organization_class`.`delete_flag` is null)
                                    and (jmot.`delete_flag` = 0 or jmot.`delete_flag` is null)
                                    and (pmot.`delete_flag` = 0 or pmot.`delete_flag` is null)
                                    and `delete_flag` = 0');
        return $organizations;
    }
}