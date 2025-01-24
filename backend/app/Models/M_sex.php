<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_sex extends Model
{
    use HasFactory;

    //テーブルがm_sexと結びつくように指定する
    protected $table = 'm_sex';
    protected $primaryKey = 'sex_id';

    //全カラムの変更を許可しない
    protected $guarded = [
        'sex_id',
        'sex',
        'display_order',
        'registered_time',
        'registered_user_id',
        'updated_time',
        'updated_user_id',
        'delete_flag'
    ];

    public function getSexList()
    {
        $sex_list = DB::select(
            'select sex_id,sex
            from m_sex
            where delete_flag = ?
            order by display_order',
            [0]
        );
        return $sex_list;
    }
}
