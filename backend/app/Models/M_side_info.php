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
            'select 
            CONCAT(abbr_name, "(", side_name, ")") as sideName,
            case 
                when side_code = 8 then ?
                when side_code = 4 then ?
                when side_code = 2 then ?
                when side_code = 1 then ?
                else null
            end as isEnable
            from m_side_info 
            where 1=1
            and delete_flag = 0
            and side_code IN (8, 4, 2, 1)
            order by display_order',
            [
                intval(substr($side, 4, 1)),
                intval(substr($side, 5, 1)),
                intval(substr($side, 6, 1)),
                intval(substr($side, 7, 1))
            ]
        );
        return $result;
    }
}
