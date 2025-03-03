<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MCoachQualificationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement("
            INSERT INTO m_coach_qualifications (coach_qualification_id, qual_name, display_order, registered_time, registered_user_id, updated_time, updated_user_id, delete_flag) VALUES 
            (1, 'ローイングコーチ4', 1, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (2, 'ローイングコーチ3', 2, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (3, 'ローイングコーチ2', 3, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (4, 'ローイングコーチ1', 4, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (5, 'ローイングスタートコーチ', 5, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (6, 'スポーツドクター', 6, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (7, 'スポーツデンティスト', 7, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (8, 'アスレティックトレーナー', 8, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (9, 'スポーツ栄養士', 9, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (10, 'スタートコーチ（教員免許保持者）', 10, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0)
            ;
            ");
    }
}
