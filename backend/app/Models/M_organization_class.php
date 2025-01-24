<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_organization_class extends Model
{
    use HasFactory;

    protected $table = 'm_organization_class';
    protected $primaryKey = 'org_class_id';

    //全カラムの変更を許可しない
    protected $guarded = [
        'org_class_id',
        'org_class_name',
        'display_order',
        'registered_time',
        'registered_user_id',
        'updated_time',
        'updated_user_id',
        'delete_flag'
    ];

    //団体区分マスタを取得
    public function getOrganizationClass()
    {
        $organizationClass = DB::select(
            'select 
            org_class_id
            ,org_class_name
            from m_organization_class 
            where delete_flag=0
            order by display_order'
        );
        return $organizationClass;
    }
}
