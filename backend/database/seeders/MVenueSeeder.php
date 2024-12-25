<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MVenueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement("
            INSERT INTO m_venue (venue_id, venue_country, venue_region, venue_name, display_order, registered_time, registered_user_id, updated_time, updated_user_id, delete_flag) VALUES 
            (1, '日本', 'オンライン', 'オンライン', 1, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (2, '日本', '岐阜県', '長良川国際レガッタコース', 2, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (3, '日本', '愛知県東郷町', '愛知池ボートコース', 3, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (4, '日本', '愛媛県今治市', '玉川湖ボートコース', 4, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (5, '日本', '茨城県潮来市', '潮来ボートコース', 5, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (6, '日本', '岡山県', '百間川漕艇場', 6, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (7, '日本', '沖縄県大宜味村', '塩屋湾特設ボート場', 7, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (8, '日本', '岩手県花巻市', '田瀬湖ボートコース', 8, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (9, '日本', '岐阜県', '川辺漕艇場', 9, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (10, '日本', '岐阜県', '木曽三川公園コース', 10, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (11, '日本', '岐阜県海津市', '長良川ボートコース', 11, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (12, '日本', '岐阜県海津市', '長良川国際ボートコース', 12, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (13, '日本', '岐阜県川辺町', '川辺漕艇場', 13, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (14, '日本', '宮城県登米市', '長沼ボートコース', 14, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (15, '日本', '熊本県菊池市', '斑蛇口湖ボートコース', 15, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (16, '日本', '群馬県館林市', '城沼ボートコース', 16, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (17, '日本', '広島県福山市', '芦田川漕艇場', 17, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (18, '日本', '香港', '沙田', 18, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (19, '日本', '高知県', '四万十川ボートコース', 19, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (20, '日本', '佐賀県佐賀市', '富士しゃくなげ湖ボートコース', 20, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (21, '日本', '佐賀県唐津市', '松浦川漕艇場', 21, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (22, '日本', '埼玉県戸田市', '戸田ボートコース', 22, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (23, '日本', '三重県大台町', '奥伊勢湖漕艇場', 23, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (24, '日本', '山口県下関市', '豊田湖ボートコース', 24, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (25, '日本', '山梨県富士河口湖町', '河口湖漕艇場', 25, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (26, '日本', '滋賀県大津市', '琵琶湖漕艇場', 26, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (27, '日本', '鹿児島県鹿屋市', '輝北ダム特設ローイングコース', 27, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (28, '日本', '秋田県大潟村', '大潟漕艇場', 28, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (29, '日本', '新潟県阿賀町', '新潟県立津川漕艇場', 29, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (30, '日本', '静岡県浜松市', '天竜ボートコース', 30, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (31, '日本', '千葉県香取市', '小見川ボートコース', 31, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (32, '日本', '大阪府高石市', '大阪府立漕艇センター(浜寺)', 32, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (33, '日本', '長崎県長崎市', '形上湾ボートコース', 33, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (34, '日本', '長崎県諫早市', '本明川水上競技場', 34, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (35, '日本', '長野県下諏訪町', '下諏訪ローイングパーク', 35, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (36, '日本', '東京都江戸川区', '平井運動公園周辺流域(仮)', 36, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (37, '日本', '東京都江東区', '海の森水上競技場', 37, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (38, '日本', '栃木県栃木市', '谷中湖特設ボート競技場', 38, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (39, '日本', '富山県', '富山県漕艇場', 39, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (40, '日本', '福井県三方郡美浜町', '久々子湖ボートコース', 40, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (41, '日本', '福岡県遠賀町', '遠賀川漕艇場', 41, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (42, '日本', '福島県', '県営荻野漕艇場', 42, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (43, '日本', '福島県喜多方市', '荻野漕艇場', 43, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (44, '日本', '兵庫県豊岡市', '円山川 城崎漕艇場', 44, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (45, '日本', '北海道網走市', '網走湖ボートコース', 45, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
            (9999, '日本', 'その他', 'その他', 46, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0)
            ;
            ");
    }
}
