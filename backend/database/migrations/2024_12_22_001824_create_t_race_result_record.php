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
            CREATE TABLE `t_race_result_record` (
            `race_result_record_id` int NOT NULL AUTO_INCREMENT,
            `player_id` int NOT NULL,
            `jara_player_id` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `player_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `entrysystem_tourn_id` int DEFAULT NULL,
            `tourn_id` int NOT NULL,
            `tourn_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `race_id` int NOT NULL,
            `entrysystem_race_id` int DEFAULT NULL,
            `race_number` int DEFAULT NULL,
            `race_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `race_class_id` int DEFAULT NULL,
            `race_class_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `org_id` int DEFAULT NULL,
            `entrysystem_org_id` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `org_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `crew_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `lane_number` int DEFAULT NULL,
            `by_group` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `event_id` int DEFAULT NULL,
            `event_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `range` int DEFAULT NULL,
            `rank` int DEFAULT NULL,
            `laptime_500m` double DEFAULT NULL,
            `laptime_1000m` double DEFAULT NULL,
            `laptime_1500m` double DEFAULT NULL,
            `laptime_2000m` double DEFAULT NULL,
            `final_time` double DEFAULT NULL,
            `stroke_rate_avg` double DEFAULT NULL,
            `stroke_rat_500m` double DEFAULT NULL,
            `stroke_rat_1000m` double DEFAULT NULL,
            `stroke_rat_1500m` double DEFAULT NULL,
            `stroke_rat_2000m` double DEFAULT NULL,
            `heart_rate_avg` double DEFAULT NULL,
            `heart_rate_500m` int DEFAULT NULL,
            `heart_rate_1000m` int DEFAULT NULL,
            `heart_rate_1500m` int DEFAULT NULL,
            `heart_rate_2000m` int DEFAULT NULL,
            `official` int DEFAULT NULL,
            `attendance` int DEFAULT NULL,
            `player_height` double DEFAULT NULL,
            `player_weight` double DEFAULT NULL,
            `seat_number` int DEFAULT NULL,
            `seat_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `race_result_record_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `start_datetime` datetime DEFAULT NULL,
            `weather` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `wind_speed_2000m_point` double DEFAULT NULL,
            `wind_direction_2000m_point` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `wind_speed_1000m_point` double DEFAULT NULL,
            `wind_direction_1000m_point` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `race_result_note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '',
            `registered_time` timestamp(6) NOT NULL,
            `registered_user_id` int NOT NULL,
            `updated_time` timestamp(6) NOT NULL,
            `updated_user_id` int NOT NULL,
            `delete_flag` int NOT NULL DEFAULT '0',
            PRIMARY KEY (`race_result_record_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_race_result_record');
    }
};
