<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_approval_type extends Model
{
    use HasFactory;

    //団体種別を取得
    public function getApprovalType()
    {
        $result = DB::select(
            '
            select
                appro_type_id
                , appro_type_id_name
                , display_order
                , registered_time
                , registered_user_id
                , updated_time
                , updated_user_id
                , delete_flag 
            from
                jara_new_pf.m_approval_type 
            where
                delete_flag = ?
            order by display_order
            ',
            [0]
        );
        return $result;
    }
}
