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
            CREATE TABLE `m_wind_direction` (
            `wind_direction_id` int NOT NULL AUTO_INCREMENT,
            `wind_direction` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
            `abbr_name` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
            `display_order` int NOT NULL,
            `registered_time` timestamp(6) NOT NULL,
            `registered_user_id` int NOT NULL,
            `updated_time` timestamp(6) NOT NULL,
            `updated_user_id` int NOT NULL,
            `delete_flag` int NOT NULL DEFAULT '0',
            PRIMARY KEY (`wind_direction_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_wind_direction');
    }
};
