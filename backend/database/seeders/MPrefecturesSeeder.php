<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MPrefecturesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement("
            INSERT INTO m_prefectures (pref_id, pref_code, pref_code_jis, pref_name, display_order, registered_time, registered_user_id, updated_time, updated_user_id, delete_flag) VALUES 
            (1, '01', 1, '北海道', 1, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (2, '02', 2, '青森', 2, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (3, '03', 3, '岩手', 3, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (4, '04', 4, '宮城', 4, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (5, '05', 5, '秋田', 5, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (6, '06', 6, '山形', 6, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (7, '07', 7, '福島', 7, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (8, '08', 8, '茨城', 8, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (9, '09', 9, '栃木', 9, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (10, '10', 10, '群馬', 10, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (11, '11', 11, '埼玉', 11, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (12, '12', 12, '千葉', 12, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (13, '13', 13, '東京', 13, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (14, '14', 14, '神奈川', 14, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (15, '15', 19, '山梨', 15, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (16, '16', 15, '新潟', 16, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (17, '17', 20, '長野', 17, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (18, '18', 16, '富山', 18, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (19, '19', 17, '石川', 19, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (20, '20', 18, '福井', 20, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (21, '21', 22, '静岡', 21, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (22, '22', 23, '愛知', 22, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (23, '23', 24, '三重', 23, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (24, '24', 21, '岐阜', 24, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (25, '25', 25, '滋賀', 25, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (26, '26', 26, '京都', 26, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (27, '27', 27, '大阪', 27, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (28, '28', 28, '兵庫', 28, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (29, '29', 29, '奈良', 29, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (30, '30', 30, '和歌山', 30, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (31, '31', 31, '鳥取', 31, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (32, '32', 32, '島根', 32, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (33, '33', 33, '岡山', 33, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (34, '34', 34, '広島', 34, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (35, '35', 35, '山口', 35, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (36, '36', 37, '香川', 36, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (37, '37', 36, '徳島', 37, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (38, '38', 38, '愛媛', 38, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (39, '39', 39, '高知', 39, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (40, '40', 40, '福岡', 40, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (41, '41', 41, '佐賀', 41, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (42, '42', 42, '長崎', 42, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (43, '43', 43, '熊本', 43, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (44, '44', 44, '大分', 44, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (45, '45', 45, '宮崎', 45, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (46, '46', 46, '鹿児島', 46, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (47, '47', 47, '沖縄', 47, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0)
            ;
            ");
    }
}
