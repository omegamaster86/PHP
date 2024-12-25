<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MWindDirectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement("
            INSERT INTO m_wind_direction (wind_direction_id, wind_direction, abbr_name, display_order, registered_time, registered_user_id, updated_time, updated_user_id, delete_flag) VALUES 
            (1, '北', 'N', 1, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (2, '北北西', 'NNW', 2, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (3, '北西', 'NW', 3, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (4, '西北西', 'WNW', 4, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (5, '西', 'WNW', 5, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (6, '西南西', 'WSW', 6, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (7, '南西', 'SW', 7, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (8, '南南西', 'SSW', 8, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (9, '南', 'S', 9, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (10, '南南東', 'SSE', 10, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (11, '南東', 'SE', 11, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (12, '東南東', 'ESE', 12, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (13, '東', 'E', 13, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (14, '東北東', 'ENE', 14, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (15, '北東', 'NE', 15, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (16, '北北東', 'NNE', 16, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (99, '無風', 'No wind', 17, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0)
            ;
            ");
    }
}
