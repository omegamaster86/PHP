<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MRaceClassSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement("
            INSERT INTO m_race_class (race_class_id, race_class_name, abbr_name, display_order, registered_time, registered_user_id, updated_time, updated_user_id, delete_flag) VALUES 
            (1, '予選', 'Heat', 1, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (2, 'タイムトライアル', 'TimeTrial', 2, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (3, '予備レース', 'Preliminary', 3, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (11, '敗復', 'Repechage', 4, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (21, '準決', 'Semi-Final', 5, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (31, '決勝A', 'FinalA', 6, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (32, '決勝B', 'FinalB', 7, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (33, '決勝C', 'FinalC', 8, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (34, '決勝D', 'FinalD', 9, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (35, '決勝E', 'FinalE', 10, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (36, '決勝F', 'FinalF', 11, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (41, '決勝I', 'Final 1', 12, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (42, '決勝II', 'Final 2', 13, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (98, '再レース', 'Re Row', 14, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (99, 'OpenTrial', 'OpenTrial', 15, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (999, 'その他', 'Others', 16, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0)
            ;
            ");
    }
}
