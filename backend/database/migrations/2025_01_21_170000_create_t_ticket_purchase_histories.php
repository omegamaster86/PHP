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
            CREATE TABLE `t_ticket_purchase_histories` (
                `ticket_purchase_history_id` int NOT NULL AUTO_INCREMENT,
                `user_id` int,
                `tourn_id` int NOT NULL,
                `order_number` varchar(16) COLLATE utf8mb4_general_ci,
                `purchased_time` timestamp(6) NOT NULL,
                `purchaser_name` varchar(32) COLLATE utf8mb4_general_ci,
                `event_date` date DEFAULT NULL,
                `ticket_name` varchar(256) COLLATE utf8mb4_general_ci,
                `ticket_number` varchar(8) COLLATE utf8mb4_general_ci,
                `sub_ticket_name` varchar(256) COLLATE utf8mb4_general_ci,
                `ticket_count` int NOT NULL,
                `ticket_amount` int NOT NULL,
                `admission_count` int NOT NULL,
                `registered_time` timestamp(6) NOT NULL,
                `registered_user_id` int NOT NULL,
                `updated_time` timestamp(6) NOT NULL,
                `updated_user_id` int NOT NULL,
                `delete_flag` int NOT NULL DEFAULT '0',
                PRIMARY KEY (`ticket_purchase_history_id`),
                FOREIGN KEY (user_id) REFERENCES t_users(user_id),
                FOREIGN KEY (tourn_id) REFERENCES t_tournaments(tourn_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_ticket_purchase_histories');
    }
};
