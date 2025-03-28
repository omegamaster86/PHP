<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MSideInfoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement("
            INSERT INTO m_side_info (side_id, side_name, abbr_name, side_code, display_order, registered_time, registered_user_id, updated_time, updated_user_id, delete_flag) VALUES 
            (1, '--', '-', 0, 1, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (2, 'ストロークサイド', 'S', 1, 2, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (3, 'バウサイド', 'B', 2, 3, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (4, 'スカル', 'X', 4, 4, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (5, 'コックス', 'C', 8, 5, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (6, 'コースタル', '', 16, 6, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (7, '予備', '', 32, 7, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (8, '予備', '', 64, 8, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (9, '予備', '', 128, 9, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0)
            ;
            ");
    }
}
