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
            CREATE TABLE `t_donation_history_csv_upload` (
                `donation_history_csv_upload_id` int NOT NULL AUTO_INCREMENT,
                `transaction_uuid` BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID(), true)),
                `row_number` int NOT NULL,
                `mailaddress` varchar(320) COLLATE utf8mb4_general_ci,
                `donator_name` varchar(128) COLLATE utf8mb4_general_ci,
                `donated_date` date DEFAULT NULL,
                `donation_amount` int NOT NULL,
                `donation_target` varchar(256) COLLATE utf8mb4_general_ci,
                `registered_time` timestamp(6) NOT NULL,
                `registered_user_id` int NOT NULL,
                `updated_time` timestamp(6) NOT NULL,
                `updated_user_id` int NOT NULL,
                `delete_flag` int NOT NULL DEFAULT '0',
                PRIMARY KEY (`donation_history_csv_upload_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");

        DB::statement("
            CREATE INDEX t_donation_history_csv_upload_transaction_uuid ON t_donation_history_csv_upload (transaction_uuid);
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_donation_history_csv_upload');
    }
};
