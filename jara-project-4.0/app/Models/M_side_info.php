<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_side_info extends Model
{
    use HasFactory;

    //サイド情報
    public function getSideInfo()
    {
        $result = DB::select(
            '
            select
                side_id
                , side_name
                , abbr_name
                , side_code
                , display_order
                , registered_time
                , registered_user_id
                , updated_time
                , updated_user_id
                , delete_flag 
            from
                jara_new_pf.m_side_info 
            where
                delete_flag = ? 
            order by display_order
            ',
            [0]
        );
        return $result;
    }
}
