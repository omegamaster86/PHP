<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_events extends Model
{
    use HasFactory;

    public function getEvents()
    {
        $events = DB::select('select 
                                event_id
                                ,event_name
                                ,abbr_name
                                ,mixed_sex
                                from m_events
                                where delete_flag = ?
                                order by display_order',[0]
                            );
        return $events;
    }
}
