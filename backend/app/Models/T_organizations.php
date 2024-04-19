<?php

namespace App\Models;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class T_organizations extends Model
{
    use HasFactory;

    //テーブルがt_organizationsと結びつくように指定する
    protected $table = 't_organizations';
    protected $primaryKey = 'org_id';

    //団体更新用
    public static $tournamentUpdateInfo = [
        'org_id' => null, //団体ID
        'entrysystem_org_id' => "", //エントリーシステムの団体ID
        'org_name' => null, //団体名
        'jara_org_type' => null, //JARA団体種別
        'jara_org_reg_trail' => null, //JARA団体証跡
        'pref_org_type' => null, //県ボ団体種別
        'pref_org_reg_trail' => null, //県ボ団体証跡
        'org_class' => null, //団体区分
        'founding_year' => null, //創立年
        'location_country' => null, //所在地　国
        'location_prefecture' => null, //所在地　都道府県
        'post_code' => 0, //郵便番号 
        'address1' => null, //住所1
        'address2' => null, //住所2
        'updated_time' => null, //更新日時
        'updated_user_id' => null, //更新ユーザID
    ];

    public function getOrganization($orgId)
    {
        $organization = DB::select('select 
                                    `org_id`,
                                    `entrysystem_org_id`,
                                    `org_name`,
                                    `jara_org_type`,
                                    case jmot.`org_type_id`
                                        when 0 then "任意"
                                        when 1 then "正規"
                                    end as `jaraOrgTypeName`,
                                    `jara_org_reg_trail`,
                                    `pref_org_type`,
                                    case pmot.`org_type_id`
                                        when 0 then "任意"
                                        when 1 then "正規"
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
    // public function getOrganizationForOrgManagement($orgId)
    // {
    //     $organization = DB::select('select 
    //                                 `org_id`,
    //                                 `entrysystem_org_id`,
    //                                 `org_name`,
    //                                 `jara_org_type`,
    //                                 case jmot.org_type
    //                                     when 0 then "任意"
    //                                     when 1 then "正式"
    //                                 end as `jaraOrgTypeName`,
    //                                 `jara_org_reg_trail`,
    //                                 `pref_org_type`,
    //                                 case pmot.org_type
    //                                     when 0 then "任意"
    //                                     when 1 then "正式"
    //                                 end as `prefOrgTypeName`,
    //                                 `pref_org_reg_trail`,
    //                                 case
    //                                     when `jara_org_type` = 1 and `pref_org_type` = 1 then "JARA・県ボ"
    //                                     when `jara_org_type` = 1 then "JARA"
    //                                     when `pref_org_type` = 1 then "県ボ"
    //                                     else "任意"
    //                                 end as `orgTypeName`,
    //                                 `org_class`,
    //                                 `org_class_name`    as `orgClassName`,
    //                                 `founding_year`,
    //                                 `post_code`,
    //                                 `location_country`,
    //                                 `country_name`,
    //                                 `country_name` as `locationCountry`,
    //                                 `location_prefecture`,
    //                                 `pref_name` as `locationPrefectureName`,
    //                                 `address1`,
    //                                 `address2`
    //                                 from `t_organizations`
    //                                 left join `m_countries`
    //                                 on `t_organizations`.`location_country` = `m_countries`.`country_id`
    //                                 left join `m_prefectures`
    //                                 on `t_organizations`.`location_prefecture` = `m_prefectures`.`pref_id`
    //                                 left join `m_organization_class`
    //                                 on `t_organizations`.`org_class` = `m_organization_class`.`org_class_id`
    //                                 left join `m_organization_type` jmot
    //                                 on `t_organizations`.`jara_org_type` = jmot.`org_type_id`
    //                                 left join `m_organization_type` pmot
    //                                 on `t_organizations`.`pref_org_type` = pmot.`org_type_id`
    //                                 where 1=1
    //                                 and `t_organizations`.`delete_flag`=0
    //                                 and (`m_countries`.`delete_flag` = 0 or `m_countries`.`delete_flag` is null)
    //                                 and (`m_prefectures`.`delete_flag` = 0 or `m_prefectures`.`delete_flag` is null)
    //                                 and (`m_organization_class`.`delete_flag` = 0 or `m_organization_class`.`delete_flag` is null)
    //                                 and (jmot.`delete_flag` = 0 or jmot.`delete_flag` is null)
    //                                 and (pmot.`delete_flag` = 0 or pmot.`delete_flag` is null)
    //                                 and `org_id`=?'
    //                                 ,[$orgId]);
    //     return $organization;
    // }

    //interfaceのOrganizationを引数としてInsertを実行し、InsertしたレコードのID（主キー）を返す
    public function insertOrganization($organization)
    {        
        $current_datetime = now()->format('Y-m-d H:i:s.u');
        $register_user_id = Auth::user()->user_id;
        DB::insert('insert into t_organizations
                    (
                        org_name,
                        entrysystem_org_id,
                        founding_year,
                        post_code,
                        location_country,
                        location_prefecture,
                        address1,
                        address2,
                        org_class,
                        jara_org_type,
                        jara_org_reg_trail,
                        pref_org_type,
                        pref_org_reg_trail,
                        registered_time,
                        registered_user_id,
                        updated_time,
                        updated_user_id,
                        delete_flag
                    )
                    values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                    ,[
                        $organization['formData']['org_name'],
                        $organization['formData']['entrysystem_org_id'],
                        $organization['formData']['founding_year'],
                        $organization['formData']['post_code'],
                        $organization['formData']['location_country'],
                        $organization['formData']['location_prefecture'],
                        $organization['formData']['address1'],
                        $organization['formData']['address2'],
                        $organization['formData']['org_class'],
                        $organization['formData']['jara_org_type'],
                        $organization['formData']['jara_org_reg_trail'],
                        $organization['formData']['pref_org_type'],
                        $organization['formData']['pref_org_reg_trail'],
                        $current_datetime,
                        $register_user_id,
                        $current_datetime,
                        $register_user_id,
                        0
                    ]);
        //挿入したIDを取得
        $insertId =  DB::getPdo()->lastInsertId();
        //Log::debug($insertId);
        Log::debug(sprintf("insertOrganization end."));
        return $insertId;
    }

    //interfaceのorganizationを引数として、任意の団体情報のupdateを実行する
    public function updateOrganization($organization)
    {
        Log::debug('updateOrganization start.');
        DB::update('update `t_organizations`
                    set
                    `entrysystem_org_id` = :entrysystem_org_id,
                    `org_name` = :org_name,
                    `jara_org_type` = :jara_org_type,
                    `jara_org_reg_trail` = :jara_org_reg_trail,
                    `pref_org_type` = :pref_org_type,
                    `pref_org_reg_trail` = :pref_org_reg_trail,
                    `org_class` = :org_class,
                    `founding_year` = :founding_year,
                    `location_country` = :location_country,
                    `location_prefecture` = :location_prefecture,
                    `post_code` = :post_code,
                    `address1` = :address1,
                    `address2` = :address2,
                    `updated_time` = :updated_time,
                    `updated_user_id` = :updated_user_id
                    where `org_id` = :org_id
                ',$organization);
        Log::debug('updateOrganization end.');
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
        // 確認したいSQLの前にこれを仕込んで
        //DB::enableQueryLog();
        DB::update('update `t_organizations`
                    set `delete_flag` = ?
                    ,`updated_time` = ?
                    ,`updated_user_id` = ?
                    where 1=1
                    and `org_id` = ?'
                    ,[
                        1
                        ,now()->format('Y-m-d H:i:s.u')
                        ,Auth::user()->user_id
                        ,$org_id
                    ]);
        // Log::debug("***************************SQL LOG***************************");
        // Log::debug(DB::getQueryLog());
    }

    //検索条件を受け取って、t_organizationを検索し、その結果を返す
    public function getOrganizationWithSearchCondition($searchCondition,$value_array)
    {
        //DB::enableQueryLog();

        $sqlString = 'select 
                        `org_id`,
                        `entrysystem_org_id`,
                        `org_name`,
                        `jara_org_type`,
                        case jmot.org_type
                            when 0 then "任意"
                            when 1 then "正規"
                        end as `jaraOrgTypeName`,
                        `jara_org_reg_trail`,
                        `pref_org_type`,
                        case pmot.org_type
                            when 0 then "任意"
                            when 1 then "正規"
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
        //Log::debug($sqlString);
        $organizations = DB::select($sqlString,$value_array);
        //Log::debug(DB::getQueryLog());
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
                                        when 1 then "正規"
                                    end as `jaraOrgTypeName`,
                                    `jara_org_reg_trail`,
                                    `pref_org_type`,
                                    case pmot.org_type
                                        when 0 then "任意"
                                        when 1 then "正規"
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
                                    and (pmot.`delete_flag` = 0 or pmot.`delete_flag` is null)'
                                );
        return $organizations;
    }

    //ユーザーIDを条件にinterfaceのTeamResponseを取得する
    public function getManagementOrganizations($user_id)
    {
        $organizations = DB::select("select distinct
                                    case
                                        when org.jara_org_type = 0 and org.pref_org_type = 0 then '任意'
                                        else '正規'
                                        end as `teamTyp`
                                    ,org.entrysystem_org_id
                                    ,org.org_id
                                    ,org.org_name
                                    from `t_organizations` org
                                    left join `t_organization_staff` staff
                                    on org.org_id = staff.org_id
                                    left join `t_users` users
                                    on staff.`user_id` = users.`user_id`
                                    where 1=1
                                    and org.delete_flag = 0
                                    and (staff.delete_flag = 0 or staff.delete_flag is null)
                                    and (users.delete_flag = 0 or users.delete_flag is null)
                                    and users.user_id = ?
                                    order by org.org_id"
                                    ,[$user_id]);
        return $organizations;
    }

    //interfaceのTeamResponseを取得する 20240410
    public function getAllOrganizations()
    {
        $organizations = DB::select("select distinct
                                    case
                                        when org.jara_org_type = 0 and org.pref_org_type = 0 then '任意'
                                        else '正規'
                                        end as `teamTyp`
                                    ,org.entrysystem_org_id
                                    ,org.org_id
                                    ,org.org_name
                                    from `t_organizations` org
                                    where 1=1
                                    and org.delete_flag = 0
                                    order by org.org_id");
        return $organizations;
    }

    //csvの団体ID、団体名に一致する団体情報が登録済みかを確認するため、
    //条件に合う団体の数を返す
    //大会結果情報一括登録画面用
    public function getOrganizationCountFromCsvData($org_id,$org_name)
    {
        $org_count = DB::select("select count(*)    as `count`
                                from t_organizations
                                where 1=1
                                and delete_flag = 0
                                and org_id = :org_id
                                and org_name = :org_name",
                                ["org_id"=>$org_id,"org_name"=>$org_name]);
        return $org_count;
    }
}