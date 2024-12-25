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
            CREATE TABLE `t_held_referee_qualifications` (
                `held_referee_qualification_id` int NOT NULL AUTO_INCREMENT,
                `user_id` int NOT NULL,
                `referee_qualification_id` int NOT NULL,
                `acquisition_date` date NOT NULL,
                `expiry_date` date DEFAULT NULL,
                `registered_time` timestamp(6) NOT NULL,
                `registered_user_id` int NOT NULL,
                `updated_time` timestamp(6) NOT NULL,
                `updated_user_id` int NOT NULL,
                `delete_flag` int NOT NULL DEFAULT '0',
                PRIMARY KEY (`held_referee_qualification_id`),
                FOREIGN KEY (user_id) REFERENCES t_users(user_id),
                FOREIGN KEY (referee_qualification_id) REFERENCES m_referee_qualifications(referee_qualification_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_held_referee_qualifications');
    }
};
