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
}
