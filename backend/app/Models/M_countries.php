<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class M_countries extends Model
{
    use HasFactory;

    //テーブルがm_prefecturesと結びつくように指定する
    protected $table = 'm_countries';
    protected $primaryKey = 'country_id';

    //全カラムの変更を許可しない
    protected $guarded = [
        'country_id',
        'country_code',
        'country_name',
        'abbr_name',
        'display_order',
        'registered_time',
        'registered_user_id',
        'updated_time',
        'updated_user_id',
        'delete_flag'
    ];

    //国マスタを取得
    public function getCountries()
    {
        $countries = DB::select(
            'select `country_id`,
                                    `country_code`,
                                    `country_name`
                                    from `m_countries`
                                    where `delete_flag`=0
                                    order by `display_order`'
        );
        return $countries;
    }
}
