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
            (20, '準々決勝', 'Quarterfinal', 5, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (30, '準決勝', 'Semi-Final', 6, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (40, '決勝', 'Final', 7, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (41, '決勝A', 'FinalA', 8, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (42, '決勝B', 'FinalB', 9, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (43, '決勝C', 'FinalC', 10, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (44, '決勝D', 'FinalD', 11, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (45, '決勝E', 'FinalE', 12, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (46, '決勝F', 'FinalF', 13, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (51, '決勝I', 'Final 1', 14, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (52, '決勝II', 'Final 2', 15, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (98, '再レース', 'Re Row', 16, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (99, 'OpenTrial', 'OpenTrial', 17, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (999, 'その他', 'Others', 18, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0)
            ;
            ");
    }
}
