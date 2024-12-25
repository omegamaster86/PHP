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
            CREATE TABLE `t_players` (
            `player_id` int NOT NULL AUTO_INCREMENT,
            `user_id` int DEFAULT NULL,
            `jara_player_id` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `player_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
            `date_of_birth` date DEFAULT NULL,
            `sex_id` int DEFAULT NULL,
            `height` double DEFAULT NULL,
            `weight` double DEFAULT NULL,
            `side_info` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `birth_country` int DEFAULT NULL,
            `birth_prefecture` int DEFAULT NULL,
            `residence_country` int DEFAULT NULL,
            `residence_prefecture` int DEFAULT NULL,
            `photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `registered_time` timestamp(6) NOT NULL,
            `registered_user_id` int NOT NULL,
            `updated_time` timestamp(6) NOT NULL,
            `updated_user_id` int NOT NULL,
            `delete_flag` int NOT NULL DEFAULT '0',
            PRIMARY KEY (`player_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_players');
    }
};
