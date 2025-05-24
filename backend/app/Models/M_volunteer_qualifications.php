<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_volunteer_qualifications extends Model
{
    use HasFactory;

    public function getQualifications()
    {
        $qualifications =  DB::select(
            'select
                qual_id,
                qual_name
            from `m_volunteer_qualifications`
            where delete_flag = ?'
                                        ,[0]);
        return $qualifications;
    }
}
