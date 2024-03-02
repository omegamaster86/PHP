<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_weather_type extends Model
{
    use HasFactory;

    //天気マスター
    public function getWeatherType()
    {
        $result = DB::select(
            '
            select
                weather_id
                , weather_name
                , display_order
                , registered_time
                , registered_user_id
                , updated_time
                , updated_user_id
                , delete_flag 
            from
                jara_new_pf.m_weather_type 
            where
                delete_flag = ?
            order by display_order
            ',
            [0]
        );
        return $result;
    }
}
