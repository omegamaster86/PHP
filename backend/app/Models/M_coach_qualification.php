<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_coach_qualification extends Model
{
    public function getCoachQualifications()
    {
        $result = DB::select(
            '
            select
                coach_qualification_id as `key`, 
                qual_name as `value`
            from
                m_coach_qualifications 
            where
                delete_flag = 0
            order by display_order
            ',
        );

        return $result;
    }
}
