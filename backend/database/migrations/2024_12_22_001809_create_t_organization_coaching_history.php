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
            CREATE TABLE `t_organization_coaching_history` (
                `org_coaching_history_id` int NOT NULL AUTO_INCREMENT,
                `user_id` int NOT NULL,
                `org_id` int NOT NULL,
                `staff_type_id` int NOT NULL,
                `start_date` date NOT NULL,
                `end_date` date DEFAULT NULL,
                `registered_time` timestamp(6) NOT NULL,
                `registered_user_id` int NOT NULL,
                `updated_time` timestamp(6) NOT NULL,
                `updated_user_id` int NOT NULL,
                `delete_flag` int NOT NULL DEFAULT '0',
                PRIMARY KEY (`org_coaching_history_id`),
                FOREIGN KEY (user_id) REFERENCES t_users(user_id),
                FOREIGN KEY (org_id) REFERENCES t_organizations(org_id),
                FOREIGN KEY (staff_type_id) REFERENCES m_staff_type(staff_type_id),
                FOREIGN KEY (registered_user_id) REFERENCES t_users(user_id),
                FOREIGN KEY (updated_user_id) REFERENCES t_users(user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_organization_coaching_history');
    }
};
