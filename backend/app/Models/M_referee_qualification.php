<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_referee_qualification extends Model
{
public function getRefereeQualifications()
    {
        $result = DB::select(
            '
            select
                referee_qualification_id as `key`,
                qual_name as `value`
            from
                m_referee_qualifications
            where
                delete_flag = 0
            order by display_order
            ',
        );
        return $result;
    }
}
