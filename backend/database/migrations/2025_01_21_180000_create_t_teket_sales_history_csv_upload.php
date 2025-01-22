<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("
            CREATE TABLE `t_teket_sales_history_csv_upload` (
                `teket_sales_history_csv_upload_id` int NOT NULL AUTO_INCREMENT,
                `transaction_uuid` BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID(), true)),
                `row_number` int NOT NULL,
                `file_name` varchar(256) COLLATE utf8mb4_general_ci,
                `order_number` varchar(16) COLLATE utf8mb4_general_ci,
                `purchased_time` varchar(16) COLLATE utf8mb4_general_ci,
                `purchaser_name` varchar(32) COLLATE utf8mb4_general_ci,
                `mailaddress` varchar(320) COLLATE utf8mb4_general_ci,
                `event_date` varchar(16) COLLATE utf8mb4_general_ci,
                `ticket_name` varchar(256) COLLATE utf8mb4_general_ci,
                `ticket_number` varchar(8) COLLATE utf8mb4_general_ci,
                `sub_ticket_name` varchar(256) COLLATE utf8mb4_general_ci,
                `ticket_count` varchar(8) COLLATE utf8mb4_general_ci,
                `ticket_amount` varchar(16) COLLATE utf8mb4_general_ci,
                `admission_count` varchar(8) COLLATE utf8mb4_general_ci,
                `questionnaire_mailaddress` varchar(32) COLLATE utf8mb4_general_ci,
                `registered_time` timestamp(6) NOT NULL,
                `registered_user_id` int NOT NULL,
                `updated_time` timestamp(6) NOT NULL,
                `updated_user_id` int NOT NULL,
                `delete_flag` int NOT NULL DEFAULT '0',
                PRIMARY KEY (`teket_sales_history_csv_upload_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");

        DB::statement("
            CREATE INDEX t_teket_sales_history_csv_upload_transaction_uuid ON t_teket_sales_history_csv_upload (transaction_uuid);
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_teket_sales_history_csv_upload');
    }
};
