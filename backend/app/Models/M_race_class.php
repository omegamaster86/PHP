<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_race_class extends Model
{
    use HasFactory;

    //レースクラスマスターを取得
    public function getRaceClass()
    {
        $raceClassList = DB::select(
            'select 
                `race_class_id`, 
                `race_class_name` 
            from 
                `m_race_class` 
            where 
                `delete_flag`= 0 order by `display_order`');
        return $raceClassList;
    }
}
