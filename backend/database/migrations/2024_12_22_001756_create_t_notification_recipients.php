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
            CREATE TABLE `t_notification_recipients` (
                `notification_recipient_id` int NOT NULL AUTO_INCREMENT,
                `notification_id` int NOT NULL,
                `recipient_id` int NOT NULL,
                `read_flag` int NOT NULL,
                `registered_time` timestamp(6) NOT NULL,
                `registered_user_id` int NOT NULL,
                `updated_time` timestamp(6) NOT NULL,
                `updated_user_id` int NOT NULL,
                `delete_flag` int NOT NULL DEFAULT '0',
                PRIMARY KEY (`notification_recipient_id`),
                FOREIGN KEY (notification_id) REFERENCES t_notifications(notification_id),
                FOREIGN KEY (recipient_id) REFERENCES t_users(user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_notification_recipients');
    }
};
