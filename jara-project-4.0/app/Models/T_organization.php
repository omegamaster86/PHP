<?php

namespace App\Models;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class T_organization extends Model
{
    use HasFactory;

    //テーブルがm_prefecturesと結びつくように指定する
    protected $table = 'm_prefectures';
    protected $primaryKey = 'pref_id';

    public function getOrganization($orgId)
    {
        $organization = DB::select('select *
                                        from t_organizations
                                        where delete_flag=0
                                        and org_id = ?'
                                    ,[$orgId]
                                );
        //1つの団体IDを取得するため0番目だけを返す
        $targetOrg = $organization[0];
        return $targetOrg;
    }

    public function insertOrganization($organizationInfo)
    {
        $result = true;
        DB::beginTransaction();
        try{
                DB::insert('insert into t_organizations
                                (
                                    entrysystem_org_id,
                                    org_name,
                                    jara_org_type,
                                    jara_org_reg_trail,
                                    pref_org_type,
                                    pref_org_reg_trail,
                                    org_class,
                                    founding_year,
                                    post_code,
                                    location_country,
                                    location_prefecture,
                                    address1,
                                    address2,
                                    registered_time,
                                    registered_user_id,
                                    updated_time,
                                    updated_user_id,
                                    delete_flag
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
                                    $organizationInfo['prefecture'],
                                    $organizationInfo['address1'],
                                    $organizationInfo['address2'],
                                    NOW(),
                                    Auth::user()->user_id,
                                    NOW(),
                                    Auth::user()->user_id,
                                    0
                                ]
                            );
                DB::commit();
                return $result;
        }
        catch (\Throwable $e){
                dd($e);
                dd("stop");
                DB::rollBack();
                
                $result = false;
                return $result;
        }
    }

    //任意の団体情報を更新する
    public function updateOrganization($organizationInfo)
    {
        $result = true;
        DB::beginTransaction();
        try{
                DB::update('update t_organizations
                            set entrysystem_org_id = ?,
                                org_name = ?,
                                jara_org_type = ?,
                                jara_org_reg_trail = ?,
                                pref_org_type = ?,
                                pref_org_reg_trail = ?,
                                org_class = ?,
                                founding_year = ?,
                                post_code = ?,
                                location_country = ?,
                                location_prefecture = ?,
                                address1 = ?,
                                address2 = ?,                                
                                updated_time = ?,
                                updated_user_id = ?
                                where org_id = ?
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
                                    $organizationInfo['prefecture'],
                                    $organizationInfo['address1'],
                                    $organizationInfo['address2'],
                                    NOW(),
                                    Auth::user()->user_id,
                                    $organizationInfo['org_id'],
                                ]
                            );
                DB::commit();
                return $result;
        }
        catch (\Throwable $e){
                dd($e);
                dd("stop");
                DB::rollBack();
                
                $result = false;
                return $result;
        }
    }

    //エントリーシステムの団体IDの数を取得する
    //重複有無を確認するため
    //org_idが一致するレコードを除く（更新画面用）
    public function getEntrysystemOrgIdCountWithOrgId($entrySystemOrgId,$org_id)
    {
        $counts = DB::select('select count(*) as "count"
                                    from t_organizations
                                    where delete_flag=0
                                    and entrysystem_org_id = ?
                                    and org_id <> ?'
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
                                    from t_organizations
                                    where delete_flag=0
                                    and entrysystem_org_id = ?'
                                ,[$entrySystemOrgId]
                            );
        $count = $counts[0]->count;
        return $count;
    }
}