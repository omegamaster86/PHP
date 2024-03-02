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
    public function getStaffType()
    {
        $staff_types = DB::select('select 
                                    staff_type_id
                                    ,staff_type_name                                    
                                    from m_staff_type
                                    where delete_flag=0
                                    order by display_order'
                                );
        return $staff_types;
    }

    //スタッフ種別IDに対するスタッフ種別名を取得する
    public function getStaffTypeName($staff_type_id)
    {
        $staff_types = DB::select('select                                     
                                    staff_type_name                                    
                                    from m_staff_type
                                    where delete_flag=0
                                    and staff_type_id = ?'
                                    ,[$staff_type_id]
                                );
        //1つに決まるので0番目を取得して返す
        if(isset($staff_types[0]))
        {
            $staff_type_name = $staff_types[0]->staff_type_name;
        }
        return $staff_type_name;
    }
}
