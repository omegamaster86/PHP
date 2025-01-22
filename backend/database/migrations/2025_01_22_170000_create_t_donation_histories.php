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
            CREATE TABLE `t_donation_histories` (
                `donation_history_id` int NOT NULL AUTO_INCREMENT,
                `user_id` int,
                `donator_name` varchar(128) COLLATE utf8mb4_general_ci,
                `donated_date` date DEFAULT NULL,
                `donation_amount` int NOT NULL,
                `donation_target` varchar(256) COLLATE utf8mb4_general_ci,
                `registered_time` timestamp(6) NOT NULL,
                `registered_user_id` int NOT NULL,
                `updated_time` timestamp(6) NOT NULL,
                `updated_user_id` int NOT NULL,
                `delete_flag` int NOT NULL DEFAULT '0',
                PRIMARY KEY (`donation_history_id`),
                FOREIGN KEY (user_id) REFERENCES t_users(user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_donation_histories');
    }
};
