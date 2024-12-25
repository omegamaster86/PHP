<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement(
            <<<'SQL'
            INSERT INTO t_users (user_id, user_name, mailaddress, sex, residence_country, residence_prefecture, date_of_birth, height, weight, user_type, photo, jspo_id, password, temp_password, expiry_time_of_temp_password, certification_number, expiry_time_of_certification_number, temp_password_flag, registered_time, registered_user_id, updated_time, updated_user_id, delete_flag) VALUES 
            (1, 'JARA1', 'demo1@jara.or.jp', 1, 112, 13, '1972/07/23', 170.5, 66.5, '00101001', '', '', '$2y$10$iQ7EqdbkaBvcmB7/McPph.sjgJc3uNe6lp1R2YYDcNWz7Sl5QZbrW', NULL, NULL, NULL, NULL, 0, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (2, 'JARA2', 'demo2@jara.or.jp', 1, 112, 13, '1972/07/23', 170.5, 66.5, '00101001', '', '', '$2y$10$iQ7EqdbkaBvcmB7/McPph.sjgJc3uNe6lp1R2YYDcNWz7Sl5QZbrW', NULL, NULL, NULL, NULL, 0, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0)
            ;
            SQL
        );
    }
}
