<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_seat_number extends Model
{
    use HasFactory;

    //シート番号
    public function getSeatNumber()
    {
        $result = DB::select(
            '
            select
                seat_id
                , seat_name
                , seat_addr_name
                , display_order
                , registered_time
                , registered_user_id
                , updated_time
                , updated_user_id
                , delete_flag 
            from
                jara_new_pf.m_seat_number 
            where
                delete_flag = ?
            order by display_order
            ',
            [0]
        );
        return $result;
    }
}
