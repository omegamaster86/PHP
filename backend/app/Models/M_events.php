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

    //種目IDを条件に対象の種目情報を取得する
    public function getEventForEventID($event_id)
    {
        $event = DB::select('select 
                                `event_id`
                                ,`event_name`
                                ,`abbr_name`
                                ,`mixed_sex`
                                from `m_events`
                                where 1=1
                                and `delete_flag` = ?
                                and `event_id` = ?
                                order by display_order',[0,$event_id]
                            );
        return $event;
    }
}
