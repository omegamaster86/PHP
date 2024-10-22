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

    //マイページ サイド情報 20241021
    public function getMyPageSideInfo($side)
    {
        $result = DB::select(
            'select side_name as sideName
            from m_side_info 
            where 1=1
            and delete_flag = 0
            and side_code IN (?, ?, ?, ?)',
            [
                (substr($side, 4, 1) * 8) == 0 ? null : (substr($side, 4, 1) * 8),
                (substr($side, 5, 1) * 4) == 0 ? null : (substr($side, 5, 1) * 4),
                (substr($side, 6, 1) * 2) == 0 ? null : (substr($side, 6, 1) * 2),
                substr($side, 7, 1) == 0 ? null : substr($side, 7, 1)
            ]
        );
        return $result;
    }
}
