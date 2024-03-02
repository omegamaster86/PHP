<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_wind_direction extends Model
{
    use HasFactory;

    //風向きマスター
    public function getWindDirection()
    {
        $result = DB::select(
            '
            select
                wind_direction_id
                , wind_direction
                , abbr_name
                , display_order
                , registered_time
                , registered_user_id
                , updated_time
                , updated_user_id
                , delete_flag 
            from
                jara_new_pf.m_wind_direction 
            where
                delete_flag = ?
            order by display_order
            ',
            [0]
        );
        return $result;
    }
}
