<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_side_info extends Model
{
    use HasFactory;

    //マイページ サイド情報 20241021
    public function getMyPageSideInfo($side)
    {
        $result = DB::select(
            "SELECT 
                CASE
                    WHEN abbr_name = '' THEN side_name
                    ELSE CONCAT(abbr_name, '(', side_name, ')')
                END AS sideName,
                CASE 
                    WHEN side_code = 16 THEN ?
                    WHEN side_code = 8 THEN ?
                    WHEN side_code = 4 THEN ?
                    WHEN side_code = 2 THEN ?
                    WHEN side_code = 1 THEN ?
                    ELSE NULL
                END AS isEnable
            FROM m_side_info 
            WHERE 1=1
                AND delete_flag = 0
                AND side_code IN (16, 8, 4, 2, 1)
            ORDER BY display_order",
            [
                intval(substr($side, 3, 1)),
                intval(substr($side, 4, 1)),
                intval(substr($side, 5, 1)),
                intval(substr($side, 6, 1)),
                intval(substr($side, 7, 1))
            ]
        );
        return $result;
    }
}
