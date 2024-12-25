<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MStaffTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement("
            INSERT INTO m_staff_type (staff_type_id, staff_type_name, display_order, registered_time, registered_user_id, updated_time, updated_user_id, delete_flag) VALUES 
            (1, '監督', 1, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (2, '部長', 2, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (3, 'コーチ', 3, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (4, 'マネージャー', 4, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (5, '管理代理', 5, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0)
            ;
            ");
    }
}
