<?php

namespace App\Models;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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
        //org_idに一致する情報を返したいので、配列の先頭を返す
        $targetOrg = array_shift($organization);
        return $targetOrg;
    }

    public function insertOrganization($organizationInfo)
    {
        $result = "success";
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
                                    location_country,
                                    location_prefecture,
                                    address1,
                                    address2,
                                    registered_time,
                                    registered_user_id,
                                    updated_time,
                                    updated_user_id,
                                    delete_flag
                                )values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                [
                                    $organizationInfo['entrysystemOrgId'],
                                    $organizationInfo['orgName'],
                                    $organizationInfo['jaraOrgType'],
                                    $organizationInfo['jaraOrgRegTrail'],
                                    $organizationInfo['prefOrgType'],
                                    $organizationInfo['prefOrgRegTrail'],
                                    $organizationInfo['orgClass'],
                                    $organizationInfo['foundingYear'],
                                    112,                        //country=日本
                                    $organizationInfo['prefecture'],
                                    (($organizationInfo['municipalities']).($organizationInfo['streetAddress'])),
                                    $organizationInfo['apartment'],
                                    NOW(),
                                    9001,
                                    NOW(),
                                    9001,
                                    0
                                ]
                            );
                DB::commit();
                return $result;
        }
        catch (\Throwable $e){
                dd($e);
                // dd($request->all());
                dd("stop");
                DB::rollBack();
                
                $result = "failed";
                return $result;
        }
    }
}
