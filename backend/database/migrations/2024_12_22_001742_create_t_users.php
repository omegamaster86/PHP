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
            CREATE TABLE `t_users` (
            `user_id` int NOT NULL AUTO_INCREMENT,
            `user_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
            `mailaddress` varchar(320) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
            `sex` int DEFAULT NULL,
            `residence_country` int DEFAULT NULL,
            `residence_prefecture` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `date_of_birth` date DEFAULT NULL,
            `height` double DEFAULT NULL,
            `weight` double DEFAULT NULL,
            `user_type` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '00000001',
            `photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `jspo_number` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `temp_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `expiry_time_of_temp_password` timestamp(6) NULL DEFAULT NULL,
            `certification_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
            `expiry_time_of_certification_number` timestamp(6) NULL DEFAULT NULL,
            `temp_password_flag` int DEFAULT NULL,
            `registered_time` timestamp(6) NOT NULL,
            `registered_user_id` int NOT NULL,
            `updated_time` timestamp(6) NOT NULL,
            `updated_user_id` int NOT NULL,
            `delete_flag` int NOT NULL DEFAULT '0',
            PRIMARY KEY (`user_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_users');
    }
};
