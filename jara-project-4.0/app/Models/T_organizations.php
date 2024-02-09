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
                                        `jara_org_reg_trail`,
                                        `pref_org_type`,
                                        `pref_org_reg_trail`,
                                        `org_class`,
                                        `org_class_name`,
                                        `founding_year`,
                                        `post_code`,
                                        `location_country`,
                                        `country_name`,
                                        `location_prefecture`,
                                        `pref_name`,
                                        `address1`,
                                        `address2`
                                        from `t_organizations`
                                        left join `m_countries`
                                        on `t_organizations`.`location_country` = `m_countries`.`country_id`
                                        left join `m_prefectures`
                                        on `t_organizations`.`location_prefecture` = `m_prefectures`.`pref_id`
                                        left join `m_organization_class`
                                        on `t_organizations`.`org_class` = `m_organization_class`.`org_class_id`
                                        where `t_organizations`.`delete_flag`=0
                                        and `org_id`=?'
                                    ,[$orgId]
                                );
        //1つの団体IDを取得するため0番目だけを返す
        $targetOrg = null;
        if(!empty($organization)){
            $targetOrg = $organization[0];
        }
        return $targetOrg;
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
                        `founding_year`,
                        case
                            when `jara_org_type` = 1 and `pref_org_type` then "JARA・県ボ"
                            when `jara_org_type` = 1 then "JARA"
                            when `pref_org_type` = 1 then "県ボ"
                            else "任意"
                        end as `org_type`,
                        `org_class`,
                        `m_organization_class`.`org_class_name`
                        from `t_organizations`
                        left join `m_organization_class`
                        on `t_organizations`.`org_class` = `m_organization_class`.`org_class_id`
                        where 1=1
                        and `t_organizations`.`delete_flag`=0
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
                                        `jara_org_reg_trail`, 
                                        `pref_org_type`, 
                                        `pref_org_reg_trail`, 
                                        `org_class`, 
                                        `founding_year`, 
                                        `location_country`, 
                                        `location_prefecture`, 
                                        `post_code`, 
                                        `address1`, 
                                        `address2` 
                                        FROM `t_organizations`
                                        WHERE 1=1
                                        and `delete_flag` = 0');
        return $organizations;
    }
}