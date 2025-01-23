<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Facades\DB;

class T_donation_histories extends Model
{
    use HasFactory;

    public function insertDonationHistoryCsvUploadData($valuesArr)
    {
        DB::table('t_donation_history_csv_upload')->insert($valuesArr);
    }

    //寄付履歴csvデータの登録 20250116
    public function insertDonationHistoriesData($uuid)
    {
        DB::table('t_donation_histories')->insertUsing(
            [
                'user_id',
                'donator_name',
                'donated_date',
                'donation_amount',
                'donation_target',
                'registered_time',
                'registered_user_id',
                'updated_time',
                'updated_user_id',
            ],
            DB::table('t_donation_history_csv_upload')
                ->select(
                    't_users.user_id',
                    't_donation_history_csv_upload.donator_name',
                    't_donation_history_csv_upload.donated_date',
                    't_donation_history_csv_upload.donation_amount',
                    't_donation_history_csv_upload.donation_target',
                    't_donation_history_csv_upload.registered_time',
                    't_donation_history_csv_upload.registered_user_id',
                    't_donation_history_csv_upload.updated_time',
                    't_donation_history_csv_upload.updated_user_id',
                )
                ->where('transaction_uuid', $uuid)
                ->leftJoin('t_users', function (JoinClause $join) {
                    $join->on('t_users.mailaddress', '=', 't_donation_history_csv_upload.mailaddress');
                    $join->on('t_users.delete_flag', '=', DB::raw('0'));
                })
                ->orderBy('t_donation_history_csv_upload.row_number', 'asc')

        );
    }
}
