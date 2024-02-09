<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_organization_type extends Model
{
    use HasFactory;

    //テーブルがm_organization_typeと結びつくように指定する
    protected $table = 'm_organization_type';
    protected $primaryKey = 'org_type_id';

    //全カラムの変更を許可しない
    protected $guarded = [
        'org_type_id',
        'org_type',
        'display_order',
        'registered_time',
        'registered_user_id',
        'updated_time',
        'updated_user_id',
        'delete_flag'
    ];

    //団体種別マスタを取得
    public function getOrganizationType()
    {
        $organizationType = DB::select('select org_type
                                        ,case org_type
                                            when 1 then "正式"
                                            when 0 then "任意"
                                            else ""
                                            end as "org_type_display_name"
                                        from m_organization_type 
                                        where delete_flag=0
                                        order by display_order'
                                    );
        return $organizationType;
    }

    //団体種別マスタを取得 react用 20240209
    public function getOrganizationTypeData()
    {
        $organizationType = DB::select('select 
                                        org_type_id
                                        ,org_type
                                        from m_organization_type 
                                        where delete_flag=0
                                        order by display_order'
                                    );
        return $organizationType;
    }
}