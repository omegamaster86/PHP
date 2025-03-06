<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_prefectures extends Model
{
    use HasFactory;

    //テーブルがm_prefecturesと結びつくように指定する
    protected $table = 'm_prefectures';
    protected $primaryKey = 'pref_id';

    //全カラムの変更を許可しない
    protected $guarded = [
        'pref_id',
        'pref_code',
        'pref_code_jis',
        'pref_name',
        'display_order',
        'registered_time',
        'registered_user_id',
        'updated_time',
        'updated_user_id',
        'delete_flag'
    ];

    //都道府県マスタを取得
    public function getPrefectures()
    {
        $prefectures = DB::select(
            'SELECT
                pref_id
                ,pref_code_jis
                ,pref_name
            FROM m_prefectures
            WHERE
                delete_flag = 0
            ORDER BY display_order'
        );
        return $prefectures;
    }
}
