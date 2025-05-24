<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_languages extends Model
{
    use HasFactory;

    public function getLanguages()
    {
        $languages = DB::select(
            'select
            lang_id
            ,lang_name
            from m_languages
            where delete_flag = ?
            order by display_order'
            ,[0]
        );
        return $languages;
    }
}
