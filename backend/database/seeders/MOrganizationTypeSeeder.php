<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MOrganizationTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement("
            INSERT INTO m_organization_type (org_type_id, org_type, display_order, registered_time, registered_user_id, updated_time, updated_user_id, delete_flag) VALUES 
            (0, '任意', 2, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (1, '正規', 1, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0)
            ;
            ");
    }
}
