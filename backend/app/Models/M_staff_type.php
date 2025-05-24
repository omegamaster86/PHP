<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_staff_type extends Model
{
    use HasFactory;
    //テーブルがm_staff_typeと結びつくように指定する
    protected $table = 'm_staff_type';
    protected $primaryKey = 'staff_type_id';

    //スタッフ種別タイプマスタを取得
    //セレクトボックス要素作成用
    public function getStaffTypes()
    {
        $staff_types = DB::select(
            'select 
            staff_type_id as `key`,
            staff_type_name as `value`
            from m_staff_type
            where delete_flag=0
            order by display_order'
        );
        return $staff_types;
    }
}
