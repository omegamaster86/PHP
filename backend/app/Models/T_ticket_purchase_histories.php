<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_ticket_purchase_histories extends Model
{
    use HasFactory;

    //teket販売履歴CSVのデータから、最後に追加した項目を追加 20250106
    public function insertTicketPurchaseHistory($tournId, $uuid)
    {
        $now = now()->format('Y-m-d H:i:s.u');
        $userId = Auth::user()->user_id;

        DB::insert(
            'INSERT INTO t_ticket_purchase_histories (
                `user_id`, 
                `tourn_id`, 
                `order_number`,
                `purchased_time`,
                `purchaser_name`,
                `event_date`,
                `ticket_name`,
                `ticket_number`,
                `sub_ticket_name`,
                `ticket_count`,
                `ticket_amount`,
                `admission_count`,
                `registered_time`,
                `registered_user_id`,
                `updated_time`,
                `updated_user_id`
                )
            SELECT 
                t_users.`user_id`,
                ?,
                teket.`order_number`,
                teket.`purchased_time`,
                teket.`purchaser_name`,
                CAST(teket.`event_date` AS DATE),
                teket.`ticket_name`,
                teket.`ticket_number`,
                teket.`sub_ticket_name`,
                CAST(teket.`ticket_count` AS SIGNED),
                CAST(teket.`ticket_amount` AS SIGNED),
                CAST(teket.`admission_count` AS SIGNED),
                ?,
                ?,
                ?,
                ?
            FROM (
                SELECT
                    `order_number`,
                    `purchased_time`,
                    `purchaser_name`,
                    `event_date`,
                    `ticket_name`,
                    `ticket_number`,
                    `sub_ticket_name`,
                    `ticket_count`,
                    `ticket_amount`,
                    `admission_count`,
                    `questionnaire_mailaddress`
                FROM t_teket_sales_history_csv_upload
                WHERE transaction_uuid = ?
            ) AS teket
            LEFT OUTER JOIN t_users
            ON teket.questionnaire_mailaddress = t_users.mailaddress AND t_users.delete_flag = 0',
            [
                $tournId,
                $now,
                $userId,
                $now,
                $userId,
                $uuid
            ]
        );
    }
}
