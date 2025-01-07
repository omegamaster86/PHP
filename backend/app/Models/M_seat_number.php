<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_seat_number extends Model
{
    use HasFactory;

    //シート番号
    public function getSeatNumber()
    {
        $result = DB::select(
            '
            select
                seat_id
                , seat_name
                , seat_addr_name
                , display_order
                , registered_time
                , registered_user_id
                , updated_time
                , updated_user_id
                , delete_flag 
            from
                m_seat_number 
            where
                delete_flag = ?
            order by display_order
            ',
            [0]
        );
        return $result;
    }

    //シート番号IDとシート名に一致するレコードの件数を抽出する
    //レース結果情報一括登録画面用
    public function getSeatNumberCountFromCsvData($seat_id, $seat_name)
    {
        $seat_number_count = DB::select("select count(*) as `count`
                                        FROM `m_seat_number`
                                        WHERE 1=1
                                        and delete_flag = 0
                                        and seat_id = :seat_id
                                        and seat_name = :seat_name
                                        ", ["seat_id" => $seat_id, "seat_name" => $seat_name]);
        return $seat_number_count;
    }
}
