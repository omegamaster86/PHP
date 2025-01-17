<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class T_donation_histories extends Model
{
    use HasFactory;

    //寄付履歴csvデータの登録 20250116
    public function insertDonationHistoriesData($valuesArr)
    {
        DB::table('t_donation_histories')->insert($valuesArr);
    }
}
