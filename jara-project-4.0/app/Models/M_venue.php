<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_venue extends Model
{
    use HasFactory;

    //テーブルがm_prefecturesと結びつくように指定する
    protected $table = 'm_venue';
    protected $primaryKey = 'venue_id';

    //水域マスタを取得
    public function getVenueList()
    {
        $venueList = DB::select('select `venue_id`, `venue_name` from `m_venue` where `delete_flag`=0 order by `display_order`');
        return $venueList;
    }
}
