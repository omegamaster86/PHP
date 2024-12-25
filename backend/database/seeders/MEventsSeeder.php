<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MEventsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement("
            INSERT INTO m_events (event_id, event_name, abbr_name, mixed_sex, crew_number, seat_b, seat_2, seat_3, seat_4, seat_5, seat_6, seat_7, seat_s, seat_c, display_order, registered_time, registered_user_id, updated_time, updated_user_id, delete_flag) VALUES 
            (11, '女子舵手つきフォア', 'W4+', 'W', 5, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (12, '男子舵手つきフォア', 'M4+', 'M', 5, 1, 1, 1, 0, 0, 0, 0, 1, 1, 2, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (21, '女子ダブルスカル', 'W2X', 'W', 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 3, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (22, '男子ダブルスカル', 'M2X', 'M', 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 4, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (31, '女子舵手なしペア', 'W2-', 'W', 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 5, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (32, '男子ペア', 'M2-', 'M', 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 6, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (41, '女子シングルスカル', 'W1X', 'W', 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 7, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (42, '男子シングルスカル', 'M1X', 'M', 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 8, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (45, '女子シングルスカル(40歳以上)', 'W1X40', 'W', 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 9, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (46, '男子シングルスカル(40歳以上)', 'M1X40', 'M', 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 10, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (47, '男子シングルスカル(50歳以上)', 'M1X50', 'M', 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 11, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (48, '男子シングルスカル(60歳以上)', 'M1X60', 'M', 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 12, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (51, '女子舵手つきペア', 'W2+', 'W', 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 13, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (52, '男子舵手つきペア', 'M2+', 'M', 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 14, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (61, '女子舵手なしフォア', 'W4-', 'W', 4, 1, 1, 1, 0, 0, 0, 0, 1, 0, 15, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (62, '男子フォア', 'M4-', 'M', 4, 1, 1, 1, 0, 0, 0, 0, 1, 0, 16, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (71, '女子クォドルプル', 'W4X', 'W', 4, 1, 1, 1, 0, 0, 0, 0, 1, 0, 17, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (72, '男子クォドルプル', 'M4X', 'M', 4, 1, 1, 1, 0, 0, 0, 0, 1, 0, 18, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (81, 'ｵｯｸｽﾌｫｰﾄﾞﾚｶﾞｯﾀ', 'OX', 'M', 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 19, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (82, '女子エイト', 'W8+', 'W', 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 20, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (83, '男子エイト', 'M8+', 'M', 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 21, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (92, '男子舵手つきクォドルプル', 'M4X+', 'M', 5, 1, 1, 1, 0, 0, 0, 0, 1, 1, 22, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (112, '男子舵手つきフォア[B1000m]', 'BM4+', 'M', 5, 1, 1, 1, 0, 0, 0, 0, 1, 1, 23, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (121, '女子ダブルスカル[B1000m]', 'BW2X', 'W', 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 24, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (122, '男子ダブルスカル[B1000m]', 'BM2X', 'M', 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 25, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (141, '女子シングルスカル[B1000m]', 'BW1X', 'W', 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 26, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (142, '男子シングルスカル[B1000m]', 'BM1X', 'M', 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 27, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (191, '女子舵手つきクォドルプル[B1000m]', 'BW4X+', 'W', 5, 1, 1, 1, 0, 0, 0, 0, 1, 1, 28, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (500, 'パラローイング', 'PARA', 'MIX', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (511, 'ＰＲ３混合舵手つきフォア', 'PR3 Mix4+', 'MIX', 5, 1, 1, 1, 0, 0, 0, 0, 1, 1, 30, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (512, 'ＰＲ３混合ダブルスカル', 'PR3 Mix2+', 'MIX', 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 31, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (513, 'ＰＲ３男子ペア', 'PR3 M2-', 'M', 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 32, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (514, 'ＰＲ３女子ペア', 'PR3 W2-', 'W', 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 33, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (521, 'ＰＲ２混合ダブルスカル', 'PR2 Mix2x', 'MIX', 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 34, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (522, 'ＰＲ２男子シングルスカル', 'PR2 M1x', 'M', 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 35, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (523, 'ＰＲ２女子シングルスカル', 'PR2 W1x', 'W', 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 36, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (531, 'ＰＲ１男子シングルスカル', 'PR1 M1x', 'M', 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 37, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (532, 'ＰＲ１女子シングルスカル', 'PR1 W1x', 'W', 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 38, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (600, 'コースタル', 'COASTAL', 'MIX', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (611, '女子コースタルソロ', 'CW1x', 'W', 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 40, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (612, '男子コースタルソロ', 'CM1x', 'M', 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 41, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (621, '女子コースタルペア', 'CW2x', 'W', 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 42, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (622, '男子コースタルペア', 'CM2x', 'M', 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 43, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (623, '混合コースタルペア', 'CMix2x', 'MIX', 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 44, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (631, '女子コースタルクアッド', 'CW4x+', 'W', 5, 1, 1, 1, 0, 0, 0, 0, 1, 1, 45, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (632, '男子コースタルクアッド', 'CM4x+', 'M', 5, 1, 1, 1, 0, 0, 0, 0, 1, 1, 46, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (641, '女子コースタルクフォア', 'CW4+', 'W', 5, 1, 1, 1, 0, 0, 0, 0, 1, 1, 47, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (642, '男子コースタルクフォア', 'CM4+', 'M', 5, 1, 1, 1, 0, 0, 0, 0, 1, 1, 48, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (999, 'その他', 'OTHERS', 'MIX', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 49, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0)
            ;
            ");
    }
}
