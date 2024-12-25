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
            CREATE TABLE `t_organizations` (
            `org_id` int NOT NULL AUTO_INCREMENT COMMENT '団体ID',
            `entrysystem_org_id` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'エントリー団体ID',
            `org_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '団体名',
            `jara_org_type` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'JARA団体種別',
            `jara_org_reg_trail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'JARA正式団体登録証跡',
            `pref_org_type` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '県ボ団体種別',
            `pref_org_reg_trail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '県ボ正式団体登録証跡',
            `org_class` int NOT NULL COMMENT '団体区分',
            `founding_year` int DEFAULT NULL COMMENT '創立年',
            `location_country` int DEFAULT NULL COMMENT '所在地（国）',
            `location_prefecture` int DEFAULT NULL COMMENT '所在地（都道府県）',
            `post_code` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
            `address1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '住所1',
            `address2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '住所2',
            `registered_time` timestamp(6) NOT NULL COMMENT '登録日時',
            `registered_user_id` int NOT NULL COMMENT '登録ユーザーID',
            `updated_time` timestamp(6) NOT NULL COMMENT '更新日時',
            `updated_user_id` int NOT NULL COMMENT '更新ユーザーID',
            `delete_flag` int NOT NULL DEFAULT '0' COMMENT '削除フラグ',
            PRIMARY KEY (`org_id`)
            ) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='団体情報が登録されるテーブル';
            ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_organizations');
    }
};
