<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_coach_qualification extends Model
{
    public function getCoachQualifications()
    {
        $result = DB::select(
            'SELECT
                coach_qualification_id AS `key`, 
                qual_name AS `value`
            FROM
                m_coach_qualifications 
            WHERE
                delete_flag = 0
            ORDER BY display_order
            ',
        );

        return $result;
    }
}
