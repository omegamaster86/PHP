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
    public function getPrefecures()
    {
        $prefectures = DB::select('select pref_id
                                        ,pref_code_jis
                                        ,pref_name
                                        from m_prefectures
                                        where delete_flag=0
                                        order by display_order'
                                    );
        return $prefectures;
    }

    public function getPrefIdFromPrefCodeJis($pref_code_jis)
    {
        $pref_ids = DB::select('select pref_id
                                from m_prefectures
                                where delete_flag=0
                                and pref_code_jis = ?'
                                ,[$pref_code_jis]
                            );
        //pref_idは一意に決まるため0番目を返す
        $pref_id = $pref_ids[0]->pref_id;
        return $pref_id;
    }

    public function getPrefInfoFromPrefCodeJis($pref_code_jis)
    {
        $pred_info = DB::select('select
                                pref_id
                                ,pref_name
                                from m_prefectures
                                where delete_flag=0
                                and pref_code_jis = ?'
                                ,[$pref_code_jis]
                            );
        //pref_infoは一意に決まるため0番目を返す
        if(!empty($pred_info)){
            $target_pref = $pred_info[0];
        }
        return $target_pref;
    }
    public function getPrefName($pref_id)
    {
        $pref_name_info = DB::select('select pref_name
                                from m_prefectures
                                where delete_flag=0
                                and pref_id = ?'
                                ,[$pref_id]
                            );
        //pref_name_infoは一意に決まるため0番目を返す
        if(!empty($pref_name_info))
            $pref_name = $pref_name_info[0]->pref_name;
        else
            $pref_name = "";
        return $pref_name;
    }
    
}