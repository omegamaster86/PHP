<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_clothes_size extends Model
{
    use HasFactory;
    public function getClothesSize()
    {
        $clothes_size = DB::select(
            'select
                clothes_size_id,
                clothes_size                                    
                from `m_clothes_size`
                where delete_flag = ?
                order by display_order'
            ,[0]);
        return $clothes_size;
    }
}
