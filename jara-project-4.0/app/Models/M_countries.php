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
        $countryies = DB::select('select `country_id`,
                                    `country_code`,
                                    `country_name`
                                    from `m_countries`
                                    where `delete_flag`=0
                                    order by `display_order`'
                                );
        return $countryies;
    }
    public function getCountryName($country_id)
    {
        $country_name_info = DB::select('select country_name
                                from m_countries
                                where delete_flag = 0
                                and country_id = ?'
                                ,[$country_id]
                            );
        //country_name_infoは一意に決まるため0番目を返す
        $country_name = $country_name_info[0]->country_name;
        return $country_name;
    }
}
