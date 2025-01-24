<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class T_players extends Model
{
    use HasFactory;

    public static $playerInfo = [
        'player_id' => null,
        'user_id' => null,
        'jara_player_id' => null,
        'player_name' => null,
        'date_of_birth' => null,
        'sex_id' => null,
        'height' => null,
        'weight' => null,
        'side_info' => null,
        'birth_country' => null,
        'birth_prefecture' => null,
        'residence_country' => null,
        'residence_prefecture' => null,
        'photo' => null,
        'registered_time' => null,
        'registered_user_id' => null,
        'updated_time' => null,
        'updated_user_id' => null,
        'delete_flag' => 0,
    ];

    //選手情報更新画面用 plauerIdに紐づいた選手情報を取得 20240215
    public function getPlayerData($player_id)
    {
        $result = DB::select(
            'select
                                `player_id`
                                ,`user_id`
                                ,`jara_player_id`
                                ,`player_name`
                                ,`date_of_birth`
                                ,`m_sex`.`sex` as `sexName`
                                ,`t_players`.`sex_id`
                                ,`height`
                                ,`weight`
                                ,`side_info`
                                ,bir_cont.`country_name` as `birthCountryName`
                                ,`birth_country`
                                ,bir_pref.`pref_name` as `birthPrefectureName`
                                ,`birth_prefecture`
                                ,res_cont.`country_name` as `residenceCountryName`
                                ,`residence_country`
                                ,res_pref.`pref_name` as `residencePrefectureName`
                                ,`residence_prefecture`
                                ,`photo`
                                ,`t_players`.`registered_time`
                                ,`t_players`.`registered_user_id`
                                ,`t_players`.`updated_time`
                                ,`t_players`.`updated_user_id`
                                ,`t_players`.`delete_flag`
                                ,`m_sex`.`sex` as `sex_name`
                                FROM `t_players`
                                left join `m_sex`
                                on `t_players`.`sex_id`=`m_sex`.`sex_id`
                                left join m_countries bir_cont
                                on `t_players`.birth_country = bir_cont.country_id
                                left join m_prefectures bir_pref
                                on `t_players`.birth_prefecture = bir_pref.pref_id
                                and  bir_pref.`delete_flag` = 0
                                left join m_countries res_cont
                                on `t_players`.residence_country = res_cont.country_id
                                left join m_prefectures res_pref
                                on `t_players`.residence_prefecture = res_pref.pref_id
                                and  res_pref.`delete_flag` = 0
                                where 1=1
                                and `t_players`.delete_flag = 0
                                and  `m_sex`.`delete_flag` = 0
                                and  bir_cont.`delete_flag` = 0
                                and  res_cont.`delete_flag` = 0
                                and `t_players`.player_id = ?',
            [$player_id]
        );

        //1つのデータを取得するため0番目だけを返す
        $targetTrn = null;
        if (!empty($result)) {
            $targetTrn = $result[0];
        }
        return $targetTrn;
    }

    //団体選手一括登録画面用 user_idに紐づいた選手情報を取得
    public function getPlayerDataFromUserId($user_id)
    {
        $result = DB::select(
            'select
                                `player_id`
                                ,`user_id`
                                ,`jara_player_id`
                                ,`player_name`
                                ,`date_of_birth`
                                ,`m_sex`.`sex` as `sexName`
                                ,`t_players`.`sex_id`
                                ,`height`
                                ,`weight`
                                ,`side_info`
                                ,bir_cont.`country_name` as `birthCountryName`
                                ,`birth_country`
                                ,bir_pref.`pref_name` as `birthPrefectureName`
                                ,`birth_prefecture`
                                ,res_cont.`country_name` as `residenceCountryName`
                                ,`residence_country`
                                ,res_pref.`pref_name` as `residencePrefectureName`
                                ,`residence_prefecture`
                                ,`photo`
                                ,`t_players`.`registered_time`
                                ,`t_players`.`registered_user_id`
                                ,`t_players`.`updated_time`
                                ,`t_players`.`updated_user_id`
                                ,`t_players`.`delete_flag`
                                ,`m_sex`.`sex` as `sex_name`
                                FROM `t_players`
                                left join `m_sex`
                                on `t_players`.`sex_id`=`m_sex`.`sex_id`
                                left join m_countries bir_cont
                                on `t_players`.birth_country = bir_cont.country_id
                                left join m_prefectures bir_pref
                                on `t_players`.birth_prefecture = bir_pref.pref_id
                                left join m_countries res_cont
                                on `t_players`.residence_country = res_cont.country_id
                                left join m_prefectures res_pref
                                on `t_players`.residence_prefecture = res_pref.pref_id
                                where 1=1
                                and `t_players`.delete_flag = 0
                                and  `m_sex`.`delete_flag` = 0
                                and  bir_cont.`delete_flag` = 0
                                and  bir_pref.`delete_flag` = 0
                                and  res_cont.`delete_flag` = 0
                                and  res_pref.`delete_flag` = 0
                                and `t_players`.user_id = ?',
            [$user_id]
        );

        //1つのデータを取得するため0番目だけを返す
        $targetTrn = null;
        if (!empty($result)) {
            $targetTrn = $result[0];
        }
        return $targetTrn;
    }

    //マイページ 選手プロフィール user_idに紐づいた選手情報を取得 20241016
    public function getPlayerProfileInfo($user_id)
    {
        $result = DB::select(
            'select
                                `player_name` as `playerName`
                                ,`player_id` as `playerId`
                                ,`jara_player_id` as `jaraPlayerId`
                                ,`date_of_birth` as `dateOfBirth`
                                ,`height`
                                ,`weight`
                                ,`side_info` as `sideInfoString`
                                ,bir_cont.`country_name` as `birthCountryName`
                                ,bir_pref.`pref_name` as `birthPrefectureName`
                                ,res_cont.`country_name` as `residenceCountryName`
                                ,res_pref.`pref_name` as `residencePrefectureName`
                                ,`photo`
                                ,`m_sex`.`sex`
                                FROM `t_players`
                                left join `m_sex`
                                on `t_players`.`sex_id`=`m_sex`.`sex_id`
                                left join m_countries bir_cont
                                on `t_players`.birth_country = bir_cont.country_id
                                left join m_prefectures bir_pref
                                on `t_players`.birth_prefecture = bir_pref.pref_id
                                left join m_countries res_cont
                                on `t_players`.residence_country = res_cont.country_id
                                left join m_prefectures res_pref
                                on `t_players`.residence_prefecture = res_pref.pref_id
                                where 1=1
                                and `t_players`.delete_flag = 0
                                and `m_sex`.`delete_flag` = 0
                                and  bir_cont.`delete_flag` = 0
                                and  bir_pref.`delete_flag` = 0
                                and  res_cont.`delete_flag` = 0
                                and  res_pref.`delete_flag` = 0
                                and `t_players`.user_id = ?',
            [$user_id]
        );

        //1つのデータを取得するため0番目だけを返す
        $targetTrn = null;
        if (!empty($result)) {
            $targetTrn = $result[0];
        }
        return $targetTrn;
    }

    //react 選手情報更新画面用 選手情報の更新を行う 20240131
    public function updatePlayerData($playersInfo)
    {
        $searchingMappingData = DB::select(
            'select `user_id`, `player_id`, `player_name` from `t_players` where `delete_flag` = 0 and `jara_player_id` = ? and user_id is null',
            [
                $playersInfo['jara_player_id']
            ]
        );

        if (!empty($searchingMappingData)) {
            DB::update(
                'update `t_players` set `updated_time` = ? , `updated_user_id` = ? , `delete_flag` = ? where 1=1 and `delete_flag` = ? and `jara_player_id` = ? and user_id is null',
                [
                    now()->format('Y-m-d H:i:s.u'),
                    Auth::user()->user_id,
                    1,
                    0,
                    $playersInfo['jara_player_id']
                ]
            );
        }
        DB::update(
            'update `t_players` set `jara_player_id`=?,`player_name`=?,`date_of_birth`=?,`sex_id`=?,`height`=?,`weight`=?,`side_info`=?,`birth_country`=?, `birth_prefecture`=?,`residence_country`=?,`residence_prefecture`=?,`photo`=?,`updated_time`=?,`updated_user_id`=? where user_id = ?',
            [
                $playersInfo['jara_player_id'],
                $playersInfo['player_name'],
                $playersInfo['date_of_birth'],
                $playersInfo['sex_id'],
                $playersInfo['height'],
                $playersInfo['weight'],
                $playersInfo['side_info'],
                $playersInfo['birth_country'],
                $playersInfo['birth_prefecture'],
                $playersInfo['residence_country'],
                $playersInfo['residence_prefecture'],
                $playersInfo['photo'],
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                Auth::user()->user_id //where条件用
            ]
        );
    }

    //react 選手情報更新画面用 選手情報の更新を行う 20240131
    public function deletePlayerData($playersInfo)
    {
        DB::update(
            'update `t_players` set `updated_time`=?,`updated_user_id`=?,`delete_flag`=? where player_id = ? and delete_flag = 0',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                1,
                $playersInfo['player_id'] //where条件用
            ]
        );
    }

    // jara_player_idで登録されたことありますかどうかチェック
    public function checkJARAPlayerId($playersInfo)
    {
        $result = DB::select(
            'select `user_id`, `player_id`, `player_name` from `t_players` where `delete_flag` = 0 and `jara_player_id` = ?',
            [
                $playersInfo['jara_player_id'] //where条件用
            ]
        );
        $registeredPlayer = [];
        if (!empty($result)) {
            $registeredPlayer = $result[0];
        }
        return $registeredPlayer;
    }

    //選手テーブルに挿入する
    //選手登録時に使用
    public function insertPlayers($playersInfo)
    {
        $result = DB::insert(
            'insert into t_players
                            (
                                user_id,
                                jara_player_id,
                                player_name,
                                date_of_birth,
                                sex_id,
                                height,
                                weight,
                                side_info,
                                birth_country,
                                birth_prefecture,
                                residence_country,
                                residence_prefecture,
                                photo,
                                registered_time,
                                registered_user_id,
                                updated_time,
                                updated_user_id,
                                delete_flag
                            )values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                Auth::user()->user_id, //選手登録時に入力されるuserIdはログイン中のuserId
                $playersInfo['jara_player_id'],
                $playersInfo['player_name'],
                $playersInfo['date_of_birth'],
                $playersInfo['sex_id'],
                $playersInfo['height'],
                $playersInfo['weight'],
                $playersInfo['side_info'],
                $playersInfo['birth_country'],
                $playersInfo['birth_prefecture'],
                $playersInfo['residence_country'],
                $playersInfo['residence_prefecture'],
                $playersInfo['photo'],
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                0
            ]
        );

        return $result;
    }

    //PlayerInformationResponseを引数としてinsertを実行する
    //登録日時、更新日時は「current_datetime」
    //登録ユーザー、更新ユーザーは「user_id」
    //で指定する
    public function insertPlayer($playerInfo)
    {
        Log::debug('insertPlayer start.');
        DB::insert(
            'insert into t_players
                    (
                        `user_id`,
                        `jara_player_id`,
                        `player_name`,
                        `date_of_birth`,
                        `sex_id`,
                        `height`,
                        `weight`,
                        `side_info`,
                        `birth_country`,
                        `birth_prefecture`,
                        `residence_country`,
                        `residence_prefecture`,
                        `registered_time`,
                        `registered_user_id`,
                        `updated_time`,
                        `updated_user_id`,
                        `delete_flag`
                    )
                    values
                    (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [
                $playerInfo['user_id'],
                $playerInfo['jara_player_id'],
                $playerInfo['player_name'],
                $playerInfo['date_of_birth'],
                $playerInfo['sex_id'],
                $playerInfo['height'],
                $playerInfo['weight'],
                $playerInfo['side_info'],
                $playerInfo['birth_country'],
                $playerInfo['birth_prefecture'],
                $playerInfo['residence_country'],
                $playerInfo['residence_prefecture'],
                $playerInfo['current_datetime'],
                $playerInfo['update_user_id'],
                $playerInfo['current_datetime'],
                $playerInfo['update_user_id'],
                0
            ]
        );
        $insertId = DB::getPdo()->lastInsertId(); //挿入したIDを取得
        Log::debug('insertPlayer end.');
        return $insertId; //Insertを実行して、InsertしたレコードのID（主キー）を返す
    }

    //選手連携画面で選手登録を行うためのメソッド
    public function insertPlayerForPlayerInfoAlignment($playerInfo)
    {
        Log::debug("insertPlayerForPlayerInfoAlignment start.");
        $current_datetime = now()->format('Y-m-d H:i:s.u');
        $user_id = Auth::user()->user_id;
        DB::insert(
            'insert into t_players
                    (
                        `jara_player_id`,
                        `registered_time`,
                        `registered_user_id`,
                        `updated_time`,
                        `updated_user_id`,
                        `delete_flag`
                    )
                    values
                    (?,?,?,?,?,?)',
            [
                $playerInfo["oldPlayerId"],
                $current_datetime,
                $user_id,
                $current_datetime,
                $user_id,
                0
            ]
        );
        $insertId = DB::getPdo()->lastInsertId(); //挿入したIDを取得
        Log::debug("insertPlayerForPlayerInfoAlignment end.");
        return $insertId; //Insertを実行して、InsertしたレコードのID（主キー）を返す
    }

    //選手連携時の更新
    public function updatePlayers($playersInfo)
    {
        DB::enableQueryLog();
        DB::update(
            'update t_players set jara_player_id = ?, updated_time = ?, updated_user_id = ? where player_id = ?',
            [$playersInfo['oldPlayerId'], now()->format('Y-m-d H:i:s.u'), Auth::user()->user_id, $playersInfo['playerId']]
        );
    }

    //20231218 選手IDに一致する全ての選手情報を取得
    //選手IDの条件はin句に置き換える
    public function getPlayersFromPlayerId($PlayerIdCondition)
    {
        $sqlString = 'select
                        `player_id`
                        ,`user_id`
                        ,`jara_player_id`
                        ,`player_name`
                        ,`date_of_birth`
                        ,`m_sex`.`sex` as `sexName`
                        ,`t_players`.`sex_id`
                        ,`height`
                        ,`weight`
                        ,`side_info`
                        ,bir_cont.`country_name` as `birthCountryName`
                        ,`birth_country`
                        ,bir_pref.`pref_name` as `birthPrefectureName`
                        ,`birth_prefecture`
                        ,res_cont.`country_name` as `residenceCountryName`
                        ,`residence_country`
                        ,res_pref.`pref_name` as `residencePrefectureName`
                        ,`residence_prefecture`
                        ,`photo`
                        ,`t_players`.`registered_time`
                        ,`t_players`.`registered_user_id`
                        ,`t_players`.`updated_time`
                        ,`t_players`.`updated_user_id`
                        ,`t_players`.`delete_flag`
                        ,`m_sex`.`sex` as `sex_name`
                        FROM `t_players`
                        left join `m_sex`
                        on `t_players`.`sex_id`=`m_sex`.`sex_id`
                        left join m_countries bir_cont
                        on `t_players`.birth_country = bir_cont.country_id
                        left join m_prefectures bir_pref
                        on `t_players`.birth_prefecture = bir_pref.pref_id
                        left join m_countries res_cont
                        on `t_players`.residence_country = res_cont.country_id
                        left join m_prefectures res_pref
                        on `t_players`.residence_prefecture = res_pref.pref_id
                        where 1=1
                        and `t_players`.delete_flag = 0
                        and  `m_sex`.`delete_flag` = 0
                        and  bir_cont.`delete_flag` = 0
                        and  bir_pref.`delete_flag` = 0
                        and  res_cont.`delete_flag` = 0
                        and  res_pref.`delete_flag` = 0
                        and `player_id` in (#PlayerIdCondition#)';
        $sqlString = str_replace('#PlayerIdCondition#', $PlayerIdCondition, $sqlString);
        $players = DB::select($sqlString);
        return $players;
    }

    //全選手情報を取得
    //レース結果一括登録画面用
    //修正 マッピング用選手を除外するよう修正　2024.04.20 吉川 
    public function getPlayers()
    {
        $players = DB::select('select
                                `player_id`
                                ,`user_id`
                                ,`jara_player_id`
                                ,`player_name`
                                ,`date_of_birth`
                                ,`m_sex`.`sex` as `sexName`
                                ,`t_players`.`sex_id`
                                ,`height`
                                ,`weight`
                                ,`side_info`
                                ,bir_cont.`country_name` as `birthCountryName`
                                ,`birth_country`
                                ,bir_pref.`pref_name` as `birthPrefectureName`
                                ,`birth_prefecture`
                                ,res_cont.`country_name` as `residenceCountryName`
                                ,`residence_country`
                                ,res_pref.`pref_name` as `residencePrefectureName`
                                ,`residence_prefecture`
                                ,`photo`
                                ,`t_players`.`registered_time`
                                ,`t_players`.`registered_user_id`
                                ,`t_players`.`updated_time`
                                ,`t_players`.`updated_user_id`
                                ,`t_players`.`delete_flag`
                                ,`m_sex`.`sex` as `sex_name`
                                FROM `t_players`
                                left join `m_sex`
                                on `t_players`.`sex_id`=`m_sex`.`sex_id`
                                left join m_countries bir_cont
                                on `t_players`.birth_country = bir_cont.country_id
                                left join m_prefectures bir_pref
                                on `t_players`.birth_prefecture = bir_pref.pref_id
                                left join m_countries res_cont
                                on `t_players`.residence_country = res_cont.country_id
                                left join m_prefectures res_pref
                                on `t_players`.residence_prefecture = res_pref.pref_id
                                where 1=1
                                and `t_players`.delete_flag = 0
                                and `t_players`.user_id IS NOT NULL
                                and  `m_sex`.`delete_flag` = 0
                                and  bir_cont.`delete_flag` = 0
                                and  bir_pref.`delete_flag` = 0
                                and  res_cont.`delete_flag` = 0
                                and  res_pref.`delete_flag` = 0');
        return $players;
    }

    //player_idが一致するプレイヤーを抽出する
    public function getPlayer($player_id)
    {
        $player = DB::select(
            'select
                                `player_id`
                                ,`user_id`
                                ,`jara_player_id`
                                ,`player_name`
                                ,`date_of_birth`
                                ,`m_sex`.`sex` as `sexName`
                                ,`t_players`.`sex_id`
                                ,`height`
                                ,`weight`
                                ,`side_info`
                                ,bir_cont.`country_name` as `birthCountryName`
                                ,`birth_country`
                                ,bir_pref.`pref_name` as `birthPrefectureName`
                                ,`birth_prefecture`
                                ,res_cont.`country_name` as `residenceCountryName`
                                ,`residence_country`
                                ,res_pref.`pref_name` as `residencePrefectureName`
                                ,`residence_prefecture`
                                ,`photo`
                                ,`t_players`.`registered_time`
                                ,`t_players`.`registered_user_id`
                                ,`t_players`.`updated_time`
                                ,`t_players`.`updated_user_id`
                                ,`t_players`.`delete_flag`
                                ,`m_sex`.`sex` as `sex_name`
                                FROM `t_players`
                                left join `m_sex`
                                on `t_players`.`sex_id`=`m_sex`.`sex_id`
                                left join m_countries bir_cont
                                on `t_players`.birth_country = bir_cont.country_id
                                left join m_prefectures bir_pref
                                on `t_players`.birth_prefecture = bir_pref.pref_id
                                left join m_countries res_cont
                                on `t_players`.residence_country = res_cont.country_id
                                left join m_prefectures res_pref
                                on `t_players`.residence_prefecture = res_pref.pref_id
                                where 1=1
                                and `t_players`.delete_flag = 0
                                and  `m_sex`.`delete_flag` = 0
                                and  bir_cont.`delete_flag` = 0
                                and  bir_pref.`delete_flag` = 0
                                and  res_cont.`delete_flag` = 0
                                and  res_pref.`delete_flag` = 0
                                and player_id = ?',
            [$player_id]
        );
        return $player;
    }

    //JARA選手IDを条件にプレイヤー情報を取得する
    public function getPlayerFromJaraPlayerId($jara_player_id)
    {
        $players = DB::select(
            'select
                                `player_id`
                                ,`user_id`
                                ,`jara_player_id`
                                ,`player_name`
                                ,`date_of_birth`
                                ,`m_sex`.`sex` as `sexName`
                                ,`t_players`.`sex_id`
                                ,`height`
                                ,`weight`
                                ,`side_info`
                                ,bir_cont.`country_name` as `birthCountryName`
                                ,`birth_country`
                                ,bir_pref.`pref_name` as `birthPrefectureName`
                                ,`birth_prefecture`
                                ,res_cont.`country_name` as `residenceCountryName`
                                ,`residence_country`
                                ,res_pref.`pref_name` as `residencePrefectureName`
                                ,`residence_prefecture`
                                ,`photo`
                                ,`t_players`.`registered_time`
                                ,`t_players`.`registered_user_id`
                                ,`t_players`.`updated_time`
                                ,`t_players`.`updated_user_id`
                                ,`t_players`.`delete_flag`
                                ,`m_sex`.`sex` as `sex_name`
                                FROM `t_players`
                                left join `m_sex`
                                on `t_players`.`sex_id`=`m_sex`.`sex_id`
                                left join m_countries bir_cont
                                on `t_players`.birth_country = bir_cont.country_id
                                left join m_prefectures bir_pref
                                on `t_players`.birth_prefecture = bir_pref.pref_id
                                left join m_countries res_cont
                                on `t_players`.residence_country = res_cont.country_id
                                left join m_prefectures res_pref
                                on `t_players`.residence_prefecture = res_pref.pref_id
                                where 1=1
                                and `t_players`.delete_flag = 0
                                and  `m_sex`.`delete_flag` = 0
                                and  bir_cont.`delete_flag` = 0
                                and  bir_pref.`delete_flag` = 0
                                and  res_cont.`delete_flag` = 0
                                and  res_pref.`delete_flag` = 0
                                and `jara_player_id` = ?',
            [$jara_player_id]
        );
        return $players;
    }

    //UserIDを条件にプレイヤー情報を取得する
    public function getPlayerFromUserId($user_id)
    {
        $players = DB::select(
            'select
                                `player_id`
                                ,`user_id`
                                ,`jara_player_id`
                                ,`player_name`
                                ,`date_of_birth`
                                ,`m_sex`.`sex` as `sexName`
                                ,`t_players`.`sex_id`
                                ,`height`
                                ,`weight`
                                ,`side_info`
                                ,bir_cont.`country_name` as `birthCountryName`
                                ,`birth_country`
                                ,bir_pref.`pref_name` as `birthPrefectureName`
                                ,`birth_prefecture`
                                ,res_cont.`country_name` as `residenceCountryName`
                                ,`residence_country`
                                ,res_pref.`pref_name` as `residencePrefectureName`
                                ,`residence_prefecture`
                                ,`photo`
                                ,`t_players`.`registered_time`
                                ,`t_players`.`registered_user_id`
                                ,`t_players`.`updated_time`
                                ,`t_players`.`updated_user_id`
                                ,`t_players`.`delete_flag`
                                ,`m_sex`.`sex` as `sex_name`
                                FROM `t_players`
                                left join `m_sex`
                                on `t_players`.`sex_id`=`m_sex`.`sex_id`
                                left join m_countries bir_cont
                                on `t_players`.birth_country = bir_cont.country_id
                                left join m_prefectures bir_pref
                                on `t_players`.birth_prefecture = bir_pref.pref_id
                                left join m_countries res_cont
                                on `t_players`.residence_country = res_cont.country_id
                                left join m_prefectures res_pref
                                on `t_players`.residence_prefecture = res_pref.pref_id
                                where 1=1
                                and `t_players`.delete_flag = 0
                                and  `m_sex`.`delete_flag` = 0
                                and  bir_cont.`delete_flag` = 0
                                and  bir_pref.`delete_flag` = 0
                                and  res_cont.`delete_flag` = 0
                                and  res_pref.`delete_flag` = 0
                                and `user_id` = ?',
            [$user_id]
        );
        return $players;
    }

    //選手検索でエントリーシステムの団体IDの条件込みで検索実行した結果を取得する
    public function getPlayerSearchResultWithEntrySystemIdCondition($searchCondition, $conditionValues)
    {
        $sqlString = 'with player as
                        (
                            SELECT
                            tp.`player_id`
                            ,org.entrysystem_org_id
                            ,org.org_id
                            ,org.org_name
                            FROM `t_players` tp
                            left join `t_organization_players` top
                            on tp.`player_id` = top.`player_id`
                            left join `t_organizations` org
                            on top.`org_id` = org.`org_id`
                            left join `t_race_result_record` rrr
                            on tp.player_id = rrr.player_id
                            where 1=1
                            and tp.`delete_flag` = 0
                            and top.`delete_flag` = 0
                            and org.`delete_flag` = 0
                            #ここにエントリーシステムの団体ID、団体ID、団体名以外の条件を入力#
                            #SearchCondition#
                        )
                        select
                        tp.photo
                        ,tp.player_name
                        ,tp.jara_player_id
                        ,pwo.player_id
                        ,sex.sex_id
                        ,sex.sex
                        ,pwo.entrysystemOrgId1
                        ,pwo.orgId1
                        ,pwo.orgName1
                        ,pwo.entrysystemOrgId2
                        ,pwo.orgId2
                        ,pwo.orgName2
                        ,pwo.entrysystemOrgId3
                        ,pwo.orgId3
                        ,pwo.orgName3
                        from
                        (
                            select
                            pwo.player_id
                            ,group_concat(Nullif(entrysystemOrgId1,"")) as `entrysystemOrgId1`
                            ,group_concat(Nullif(orgId1,"")) as `orgId1`
                            ,group_concat(Nullif(orgName1,"")) as `orgName1`
                            ,group_concat(Nullif(entrysystemOrgId2,"")) as `entrysystemOrgId2`
                            ,group_concat(Nullif(orgId2,"")) as `orgId2`
                            ,group_concat(Nullif(orgName2,"")) as `orgName2`
                            ,group_concat(Nullif(entrysystemOrgId3,"")) as `entrysystemOrgId3`
                            ,group_concat(Nullif(orgId3,"")) as `orgId3`
                            ,group_concat(Nullif(orgName3,"")) as `orgName3`
                            FROM
                            (
                                select `player_id`
                                ,case `org_index`
                                    when 0 then `entrysystem_org_id`
                                    else null end as `entrysystemOrgId1`
                                ,case `org_index`
                                    when 0 then `org_id`
                                    else null end as `orgId1`
                                ,case `org_index`
                                    when 0 then `org_name`
                                    else null end as `orgName1`
                                ,case `org_index`
                                    when 1 then `entrysystem_org_id`
                                    else null end as `entrysystemOrgId2`
                                ,case `org_index`
                                    when 1 then `org_id`
                                    else null end as `orgId2`
                                ,case `org_index`
                                    when 1 then `org_name`
                                    else null end as `orgName2`
                                ,case `org_index`
                                    when 2 then `entrysystem_org_id`
                                    else null end as `entrysystemOrgId3`
                                ,case `org_index`
                                    when 2 then `org_id`
                                    else null end as `orgId3`
                                ,case `org_index`
                                    when 2 then `org_name`
                                    else null end as `orgName3`
                                FROM
                                (
                                    select distinct
                                    `player_id`
                                    ,entrysystem_org_id
                                    ,org_id
                                    ,org_name
                                    ,0 as `org_index`
                                    from player
                                    where 1=1
                                    and entrysystem_org_id = :entrysystem_id_1
                                    union select distinct
                                    `player_id`
                                    ,entrysystem_org_id
                                    ,org_id
                                    ,org_name
                                    ,ROW_NUMBER() OVER (PARTITION BY `player_id` ORDER BY `entrysystem_org_id`) as `org_index`
                                    from player
                                    where 1=1
                                    and (entrysystem_org_id <> :entrysystem_id_2 or entrysystem_org_id is null)
                                )pwo
                            )pwo
                            group by player_id
                        )pwo
                        left join `t_players` tp
                        on pwo.player_id = tp.player_id
                        left join `m_sex` sex
                        on tp.`sex_id` = sex.`sex_id`
                        where 1=1
                        and sex.`delete_flag` = 0
                        and tp.`delete_flag` = 0
                        and orgId1 is not null';  //入力した団体IDに所属していない選手を除外する条件
        $sqlString = str_replace('#SearchCondition#', $searchCondition, $sqlString);
        $players = DB::select($sqlString, $conditionValues);
        return $players;
    }

    //選手検索で団体IDの条件込みで検索実行した結果を取得する
    public function getPlayerSearchResultWithOrgIdCondition($searchCondition, $conditionValues)
    {
        $sqlString = 'with player as
                        (
                            SELECT
                            tp.`player_id`
                            ,org.entrysystem_org_id
                            ,org.org_id
                            ,org.org_name
                            FROM `t_players` tp
                            left join `t_organization_players` top
                            on tp.`player_id` = top.`player_id`
                            left join `t_organizations` org
                            on top.`org_id` = org.`org_id`
                            left join `t_race_result_record` rrr
                            on tp.player_id = rrr.player_id
                            where 1=1
                            and tp.`delete_flag` = 0
                            and top.`delete_flag` = 0
                            and org.`delete_flag` = 0
                            #ここにエントリーシステムの団体ID、団体ID、団体名以外の条件を入力#
                            #SearchCondition#
                        )
                        select
                        tp.photo
                        ,tp.player_name
                        ,tp.jara_player_id
                        ,pwo.player_id
                        ,sex.sex_id
                        ,sex.sex
                        ,pwo.entrysystemOrgId1
                        ,pwo.orgId1
                        ,pwo.orgName1
                        ,pwo.entrysystemOrgId2
                        ,pwo.orgId2
                        ,pwo.orgName2
                        ,pwo.entrysystemOrgId3
                        ,pwo.orgId3
                        ,pwo.orgName3
                        from
                        (
                            select
                            pwo.player_id
                            ,group_concat(Nullif(entrysystemOrgId1,"")) as `entrysystemOrgId1`
                            ,group_concat(Nullif(orgId1,"")) as `orgId1`
                            ,group_concat(Nullif(orgName1,"")) as `orgName1`
                            ,group_concat(Nullif(entrysystemOrgId2,"")) as `entrysystemOrgId2`
                            ,group_concat(Nullif(orgId2,"")) as `orgId2`
                            ,group_concat(Nullif(orgName2,"")) as `orgName2`
                            ,group_concat(Nullif(entrysystemOrgId3,"")) as `entrysystemOrgId3`
                            ,group_concat(Nullif(orgId3,"")) as `orgId3`
                            ,group_concat(Nullif(orgName3,"")) as `orgName3`
                            FROM
                            (
                                select `player_id`
                                ,case `org_index`
                                    when 0 then `entrysystem_org_id`
                                    else null end as `entrysystemOrgId1`
                                ,case `org_index`
                                    when 0 then `org_id`
                                    else null end as `orgId1`
                                ,case `org_index`
                                    when 0 then `org_name`
                                    else null end as `orgName1`
                                ,case `org_index`
                                    when 1 then `entrysystem_org_id`
                                    else null end as `entrysystemOrgId2`
                                ,case `org_index`
                                    when 1 then `org_id`
                                    else null end as `orgId2`
                                ,case `org_index`
                                    when 1 then `org_name`
                                    else null end as `orgName2`
                                ,case `org_index`
                                    when 2 then `entrysystem_org_id`
                                    else null end as `entrysystemOrgId3`
                                ,case `org_index`
                                    when 2 then `org_id`
                                    else null end as `orgId3`
                                ,case `org_index`
                                    when 2 then `org_name`
                                    else null end as `orgName3`
                                FROM
                                (
                                    select distinct
                                    `player_id`
                                    ,entrysystem_org_id
                                    ,org_id
                                    ,org_name
                                    ,0 as `org_index`
                                    from player
                                    where 1=1
                                    and org_id = :org_id_1
                                    union select distinct
                                    `player_id`
                                    ,entrysystem_org_id
                                    ,org_id
                                    ,org_name
                                    ,ROW_NUMBER() OVER (PARTITION BY `player_id` ORDER BY `org_id`) as `org_index`
                                    from player
                                    where 1=1
                                    and (org_id <> :org_id_2 or org_id is null)
                                )pwo
                            )pwo
                            group by player_id
                        )pwo
                        left join `t_players` tp
                        on pwo.player_id = tp.player_id
                        left join `m_sex` sex
                        on tp.`sex_id` = sex.`sex_id`
                        where 1=1
                        and sex.`delete_flag` = 0
                        and tp.`delete_flag` = 0
                        and orgId1 is not null';  //入力した団体IDに所属していない選手を除外する条件
        $sqlString = str_replace('#SearchCondition#', $searchCondition, $sqlString);
        $players = DB::select($sqlString, $conditionValues);
        return $players;
    }

    //選手検索で団体名の条件込みで検索実行した結果を取得する
    public function getPlayerSearchResultWithOrgNameCondition($searchCondition, $conditionValues)
    {
        $sqlString = 'with player as
                    (
                        SELECT
                        tp.`player_id`
                        ,org.entrysystem_org_id
                        ,org.org_id
                        ,org.org_name
                        FROM `t_players` tp
                        left join `t_organization_players` top
                        on tp.`player_id` = top.`player_id`
                        left join `t_organizations` org
                        on top.`org_id` = org.`org_id`
                        left join `t_race_result_record` rrr
                        on tp.player_id = rrr.player_id
                        where 1=1
                        and tp.`delete_flag` = 0
                        and top.`delete_flag` = 0
                        and org.`delete_flag` = 0
                        #ここにエントリーシステムの団体ID、団体ID、団体名以外の条件を入力#
                        #SearchCondition#
                    )
                    select
                    tp.photo
                    ,tp.player_name
                    ,tp.jara_player_id
                    ,pwo.player_id
                    ,sex.sex_id
                    ,sex.sex
                    ,pwo.entrysystemOrgId1
                    ,pwo.orgId1
                    ,pwo.orgName1
                    ,pwo.entrysystemOrgId2
                    ,pwo.orgId2
                    ,pwo.orgName2
                    ,pwo.entrysystemOrgId3
                    ,pwo.orgId3
                    ,pwo.orgName3
                    from
                    (
                        select
                        pwo.player_id
                        ,group_concat(Nullif(entrysystemOrgId1,"")) as `entrysystemOrgId1`
                        ,group_concat(Nullif(orgId1,"")) as `orgId1`
                        ,group_concat(Nullif(orgName1,"")) as `orgName1`
                        ,group_concat(Nullif(entrysystemOrgId2,"")) as `entrysystemOrgId2`
                        ,group_concat(Nullif(orgId2,"")) as `orgId2`
                        ,group_concat(Nullif(orgName2,"")) as `orgName2`
                        ,group_concat(Nullif(entrysystemOrgId3,"")) as `entrysystemOrgId3`
                        ,group_concat(Nullif(orgId3,"")) as `orgId3`
                        ,group_concat(Nullif(orgName3,"")) as `orgName3`
                        FROM
                        (
                            select `player_id`
                            ,case `org_index`
                                when 1 then `entrysystem_org_id`
                                else null end as `entrysystemOrgId1`
                            ,case `org_index`
                                when 1 then `org_id`
                                else null end as `orgId1`
                            ,case `org_index`
                                when 1 then `org_name`
                                else null end as `orgName1`
                            ,case `org_index`
                                when 2 then `entrysystem_org_id`
                                else null end as `entrysystemOrgId2`
                            ,case `org_index`
                                when 2 then `org_id`
                                else null end as `orgId2`
                            ,case `org_index`
                                when 2 then `org_name`
                                else null end as `orgName2`
                            ,case `org_index`
                                when 3 then `entrysystem_org_id`
                                else null end as `entrysystemOrgId3`
                            ,case `org_index`
                                when 3 then `org_id`
                                else null end as `orgId3`
                            ,case `org_index`
                                when 3 then `org_name`
                                else null end as `orgName3`
                            FROM
                            (
                                select
                                `player_id`
                                ,`entrysystem_org_id`
                                ,`org_id`
                                ,`org_name`
                                ,ROW_NUMBER() OVER (PARTITION BY `player_id` ORDER BY pwo.`org_index`) as `org_index`
                                from
                                (
                                    select 
                                    `player_id`
                                    ,entrysystem_org_id
                                    ,org_id
                                    ,org_name
                                    ,ROW_NUMBER() OVER (PARTITION BY `player_id` ORDER BY `org_id`) as `org_index`
                                    from
                                    (
                                        select distinct
                                        `player_id`
                                        ,entrysystem_org_id
                                        ,org_id
                                        ,org_name
                                        from player
                                        where 1=1
                                        and org_name like :org_name_1
                                    )mt
                                    union 
                                    select distinct
                                    `player_id`
                                    ,entrysystem_org_id
                                    ,org_id
                                    ,org_name
                                    ,1000 + ROW_NUMBER() OVER (PARTITION BY `player_id` ORDER BY `org_id`) as `org_index`
                                    from player
                                    where 1=1
                                    and (org_name not like :org_name_2 or org_name is null)
                                    and player_id in
                                    (
                                        select distinct `player_id`
                                        from player
                                        where 1=1
                                        and org_name like :org_name_3
                                    )
                                    order by player_id,org_index
                                )pwo
                            )pwo
                        )pwo
                        group by player_id
                    )pwo
                    left join `t_players` tp
                    on pwo.player_id = tp.player_id
                    left join `m_sex` sex
                    on tp.`sex_id` = sex.`sex_id`
                    where 1=1
                    and sex.`delete_flag` = 0
                    and tp.`delete_flag` = 0';
        $sqlString = str_replace('#SearchCondition#', $searchCondition, $sqlString);
        $players = DB::select($sqlString, $conditionValues);
        return $players;
    }

    //エントリーシステムの団体ID、団体ID、団体名以外の条件だけで選手検索
    public function getPlayerSearchResult($searchCondition, $conditionValues)
    {
        //DB::enableQueryLog();
        $sqlString = 'with player as
                        (
                            SELECT
                            tp.`player_id`
                            ,org.entrysystem_org_id
                            ,org.org_id
                            ,org.org_name
                            FROM `t_players` tp
                            left join `t_organization_players` top
                            on tp.`player_id` = top.`player_id`
                            and top.`delete_flag` = 0
                            left join `t_organizations` org
                            on top.`org_id` = org.`org_id`
                            and org.`delete_flag` = 0
                            left join `t_race_result_record` rrr
                            on tp.player_id = rrr.player_id
                            and rrr.`delete_flag` = 0
                            where 1=1
                            and tp.`delete_flag` = 0
                            #ここにエントリーシステムの団体ID、団体ID、団体名以外の条件を入力#
                            #SearchCondition#
                        )
                        select
                        tp.photo
                        ,tp.player_name
                        ,tp.jara_player_id
                        ,pwo.player_id
                        ,sex.sex_id
                        ,sex.sex
                        ,pwo.entrysystemOrgId1
                        ,pwo.orgId1
                        ,pwo.orgName1
                        ,pwo.entrysystemOrgId2
                        ,pwo.orgId2
                        ,pwo.orgName2
                        ,pwo.entrysystemOrgId3
                        ,pwo.orgId3
                        ,pwo.orgName3
                        from
                        (
                            select
                            pwo.player_id
                            ,group_concat(Nullif(entrysystemOrgId1,"")) as `entrysystemOrgId1`
                            ,group_concat(Nullif(orgId1,"")) as `orgId1`
                            ,group_concat(Nullif(orgName1,"")) as `orgName1`
                            ,group_concat(Nullif(entrysystemOrgId2,"")) as `entrysystemOrgId2`
                            ,group_concat(Nullif(orgId2,"")) as `orgId2`
                            ,group_concat(Nullif(orgName2,"")) as `orgName2`
                            ,group_concat(Nullif(entrysystemOrgId3,"")) as `entrysystemOrgId3`
                            ,group_concat(Nullif(orgId3,"")) as `orgId3`
                            ,group_concat(Nullif(orgName3,"")) as `orgName3`
                            FROM
                            (
                                select `player_id`
                                ,case `org_index`
                                    when 1 then `entrysystem_org_id`
                                    else null end as `entrysystemOrgId1`
                                ,case `org_index`
                                    when 1 then `org_id`
                                    else null end as `orgId1`
                                ,case `org_index`
                                    when 1 then `org_name`
                                    else null end as `orgName1`
                                ,case `org_index`
                                    when 2 then `entrysystem_org_id`
                                    else null end as `entrysystemOrgId2`
                                ,case `org_index`
                                    when 2 then `org_id`
                                    else null end as `orgId2`
                                ,case `org_index`
                                    when 2 then `org_name`
                                    else null end as `orgName2`
                                ,case `org_index`
                                    when 3 then `entrysystem_org_id`
                                    else null end as `entrysystemOrgId3`
                                ,case `org_index`
                                    when 3 then `org_id`
                                    else null end as `orgId3`
                                ,case `org_index`
                                    when 3 then `org_name`
                                    else null end as `orgName3`
                                FROM
                                (
                                    select
                                    `player_id`
                                    ,entrysystem_org_id
                                    ,org_id
                                    ,org_name
                                    ,ROW_NUMBER() OVER (PARTITION BY `player_id` ORDER BY `org_id`) as `org_index`
                                    FROM
                                    (
                                        select distinct
                                        `player_id`
                                        ,entrysystem_org_id
                                        ,org_id
                                        ,org_name
                                        from player
                                    )pwo
                                )pwo
                            )pwo
                            group by player_id
                        )pwo
                        left join `t_players` tp
                        on pwo.player_id = tp.player_id
                        left join `m_sex` sex
                        on tp.`sex_id` = sex.`sex_id`
                        where 1=1
                        and sex.`delete_flag` = 0
                        and tp.`delete_flag` = 0';
        $sqlString = str_replace('#SearchCondition#', $searchCondition, $sqlString);
        $players = DB::select($sqlString, $conditionValues);
        return $players;
    }

    //選手IDと選手名に一致する選手の件数を抽出する
    //レース結果情報一括登録画面用
    public function getPlayerCountFromCsvData($player_id, $player_name)
    {
        $player_count = DB::select(
            "select count(*) as `count`
                                    FROM `t_players`
                                    WHERE 1=1
                                    and delete_flag = 0
                                    and player_id = :player_id
                                    and player_name = :player_name",
            ["player_id" => $player_id, "player_name" => $player_name]
        );
        return $player_count;
    }
}
