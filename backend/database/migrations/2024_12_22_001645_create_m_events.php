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
            CREATE TABLE `m_events` (
            `event_id` int NOT NULL AUTO_INCREMENT,
            `event_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
            `abbr_name` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
            `mixed_sex` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
            `crew_number` int NOT NULL,
            `seat_b` int NOT NULL DEFAULT '0',
            `seat_2` int NOT NULL DEFAULT '0',
            `seat_3` int NOT NULL DEFAULT '0',
            `seat_4` int NOT NULL DEFAULT '0',
            `seat_5` int NOT NULL DEFAULT '0',
            `seat_6` int NOT NULL DEFAULT '0',
            `seat_7` int NOT NULL DEFAULT '0',
            `seat_s` int NOT NULL DEFAULT '0',
            `seat_c` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0',
            `display_order` int NOT NULL,
            `registered_time` timestamp(6) NOT NULL,
            `registered_user_id` int NOT NULL,
            `updated_time` timestamp(6) NOT NULL,
            `updated_user_id` int NOT NULL,
            `delete_flag` int NOT NULL DEFAULT '0',
            PRIMARY KEY (`event_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_events');
    }
};
