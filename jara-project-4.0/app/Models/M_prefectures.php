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
        'pref_name',
        'display_order',
        'registered_time',
        'registered_user_id',
        'updated_time',
        'updated_user_id',
        'delete_flag'
    ];

    //都道府県マスタを取得
    public function getPrefecures()
    {
        $prefectures = DB::select('select pref_id
                                        ,pref_name
                                        from m_prefectures
                                        where delete_flag=0
                                        order by display_order'
                                    );
        return $prefectures;
    }

    //pref_idに該当するpref_Nameを取得
    public function getPrefecureName($prefId)
    {
        $prefectureName = DB::select('select pref_name
                                        from m_prefectures
                                        where delete_flag=0
                                        and pref_id = ?
                                        order by display_order'
                                        ,[$prefId]
                                    );
        return $prefectureName;
    }
}
