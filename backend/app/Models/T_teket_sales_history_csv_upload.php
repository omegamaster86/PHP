<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class T_teket_sales_history_csv_upload extends Model
{
    use HasFactory;

    //teket販売履歴CSVデータ登録 20250106
    public function insertTeketSalesHistoryCsvUploadData($valuesArr)
    {
        DB::table('t_teket_sales_history_csv_upload')->insert($valuesArr);
    }
}
