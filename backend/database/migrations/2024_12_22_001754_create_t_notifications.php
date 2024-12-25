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
            CREATE TABLE `t_notifications` (
                `notification_id` int NOT NULL AUTO_INCREMENT,
                `sender_id` int NOT NULL,
                `notification_destination_type_id` int NOT NULL,
                `tourn_id` int DEFAULT NULL,
                `sent_time` timestamp(6) NOT NULL,
                `title` TEXT COLLATE utf8mb4_general_ci NOT NULL,
                `body` TEXT COLLATE utf8mb4_general_ci NOT NULL,
                `registered_time` timestamp(6) NOT NULL,
                `registered_user_id` int NOT NULL,
                `updated_time` timestamp(6) NOT NULL,
                `updated_user_id`int NOT NULL,
                `delete_flag` int NOT NULL DEFAULT '0',
                PRIMARY KEY (`notification_id`),
                FOREIGN KEY (sender_id) REFERENCES t_users(user_id),
                FOREIGN KEY (notification_destination_type_id) REFERENCES m_notification_destination_type(notification_destination_type_id),
                FOREIGN KEY (tourn_id) REFERENCES t_tournaments(tourn_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_notifications');
    }
};
