<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_race_result_notes extends Model
{
    use HasFactory;

    //備考欄に表示する項目
    public function getRaceResultNotes()
    {
        $result = DB::select(
            '
            select
                race_result_notes_id
                , race_result_notes
                , display_order
                , registered_time
                , registered_user_id
                , updated_time
                , updated_user_id
                , delete_flag 
            from
                jara_new_pf.m_race_result_notes 
            where
                delete_flag = ?
            order by display_order
            ',
            [0]
        );
        return $result;
    }
}
