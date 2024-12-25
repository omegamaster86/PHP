<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MWeatherTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement("
            INSERT INTO m_weather_type (weather_id, weather_name, display_order, registered_time, registered_user_id, updated_time, updated_user_id, delete_flag) VALUES 
            (1, '晴れ', 1, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (2, '曇り', 2, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (3, '雨', 3, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (4, '小雨', 4, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0)
            ;
            ");
    }
}
