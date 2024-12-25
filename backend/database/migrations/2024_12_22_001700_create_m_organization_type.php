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
            CREATE TABLE `m_organization_type` (
            `org_type_id` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
            `org_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
            `display_order` int NOT NULL,
            `registered_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `registered_user_id` int NOT NULL,
            `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_user_id` int NOT NULL,
            `delete_flag` int NOT NULL DEFAULT '0',
            PRIMARY KEY (`org_type_id`),
            UNIQUE KEY `UNIQUE_KEY_country_name` (`org_type`),
            UNIQUE KEY `UNIQUE_KEY_display_order` (`display_order`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_organization_type');
    }
};
