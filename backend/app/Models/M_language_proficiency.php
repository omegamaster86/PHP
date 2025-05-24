<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_language_proficiency extends Model
{
    use HasFactory;

    public function getLanguageProficiency()
    {
        $languageProficiency = DB::select(
            'select
            lang_pro_id
            ,lang_pro_name
            from m_language_proficiency
            where delete_flag = ?
            order by display_order'
            ,[0]
        );
        return $languageProficiency;
    }
}
