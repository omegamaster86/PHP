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

    //選手情報更新画面用 userIDに紐づいた選手情報を取得 20240131
    public function getPlayerData($user_id)
    {
        $result = DB::select('select `player_id`, `user_id`, `jara_player_id`, `player_name`, `date_of_birth`, `t_players`.`sex_id`, `height`, `weight`, `side_info`, `birth_country`, `birth_prefecture`, `residence_country`, `residence_prefecture`, `photo`, `t_players`.`registered_time`, `t_players`.`registered_user_id`, `t_players`.`updated_time`, `t_players`.`updated_user_id`, `t_players`.`delete_flag`,
        `m_sex`.`sex` as `sex_name`,
        bir_cont.`country_name` as `bir_country_name`,
        bir_pref.`pref_name` as `bir_pref_name`,
        res_cont.`country_name` as `res_country_name`,
        res_pref.`pref_name` as `res_pref_name`
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
        where `t_players`.delete_flag = 0 and `t_players`.user_id = ?', [$user_id]);

        //1つのデータを取得するため0番目だけを返す
        //Log::debug($result);
        $targetTrn = null;
        if (!empty($result)) {
            $targetTrn = $result[0];
        }
        return $targetTrn;
    }

    //react 選手情報更新画面用 選手情報の更新を行う 20240131
    public function updatePlayerData($playersInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::update(
                'update `t_players` set `player_id`=?,`user_id`=?,`jara_player_id`=?,`player_name`=?,`date_of_birth`=?,`sex_id`=?,`height`=?,`weight`=?,`side_info`=?,`birth_country`=?, `birth_prefecture`=?,`residence_country`=?,`residence_prefecture`=?,`photo`=?,`registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? where user_id = ?',
                [
                    $playersInfo['player_id'],
                    Auth::user()->user_id, //選手更新時に入力されるuserIdはログイン中のuserId
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
                    NOW(),
                    Auth::user()->user_id,
                    NOW(),
                    Auth::user()->user_id,
                    $playersInfo['delete_flag'],
                    Auth::user()->user_id //where条件用
                ]
            );

            DB::commit();
            return $result = "success";
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::debug($e);
            $result = "failed";
            return $result;
        }
    }

    //react 選手情報更新画面用 選手情報の更新を行う 20240131
    public function deletePlayerData($playersInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::update(
                'update `t_players` set `registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? where player_id = ?',
                [
                    NOW(),
                    Auth::user()->user_id,
                    NOW(),
                    Auth::user()->user_id,
                    1,
                    $playersInfo['player_id'] //where条件用
                ]
            );

            DB::commit();
            return $result = "success";
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::debug($e);
            $result = "failed";
            return $result;
        }
    }


    public function insertPlayers($playersInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::insert(
                'insert into t_players
                                (
                                    player_id,
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
                                )values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    null,
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
                    NOW(),
                    Auth::user()->user_id,
                    NOW(),
                    Auth::user()->user_id,
                    0
                ]
            );
            DB::commit();
            return "登録完了";
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::debug($e);
            $result = "failed";
            return $result;
        }
    }

    public function updatePlayers($playersInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::update(
                'update t_players set jara_player_id = ?, updated_time = ?, updated_user_id = ? where user_id = ?',
                [$playersInfo['jaraPlayerId'], now(), Auth::user()->user_id, $playersInfo['playerId']]
            );

            DB::commit();
            return $result;
        } catch (\Throwable $e) {
            DB::rollBack();

            $result = "failed";
            return $result;
        }
    }

    //20231218 選手IDに一致する全ての選手情報を取得
    //選手IDの条件はin句に置き換える
    public function getPlayersFromPlayerId($PlayerIdCondition)
    {
        $sqlString = 'select 
                        `player_id`
                        ,`user_id`
                        ,`player_name`
                        ,`country_name`
                        ,`height`
                        ,`weight`
                        from `t_players`
                        left join `m_countries`
                        on `t_players`.`birth_country` = `m_countries`.`country_id`
                        where `t_players`.`delete_flag`=0
                        and `player_id` in (#PlayerIdCondition#)';
        $sqlString = str_replace('#PlayerIdCondition#', $PlayerIdCondition, $sqlString);
        $players = DB::select($sqlString);
        return $players;
    }

    public function generateSearchCondition($searched_data)
    {
        $condition = "";
        if (isset($searched_data['jara_player_id'])) {
            $condition .= " and `t_race_result_record`.`jara_player_id`=" . $searched_data['jara_player_id']; //JARA選手コード
        }
        if (isset($searched_data['player_id'])) {
            $condition .= " and `t_race_result_record`.`player_id`=" . $searched_data['player_id']; //選手ID
        }
        if (isset($searched_data['player_name'])) {
            $condition .= " and `t_race_result_record`.`player_name` like " . "\"%" . $searched_data['player_name'] . "%\""; //選手名
        }
        if (isset($searched_data['sex'])) {
            $condition .= " and `t_race_result_record`.`sex` like " . "\"%" . $searched_data['sex'] . "%\""; //大会名
        }
        if (isset($searched_data['date_of_birth'])) {
            $condition .= " and `t_race_result_record`.`date_of_birth`>= CAST('" . $searched_data['date_of_birth'] . "' AS DATE)"; //開催開始年月日
        }


        return $condition;
    }

    public function getPlayerWithSearchCondition($searched_data)
    {
        dump("searched_data : ", $searched_data);
        $condition = "";
        $valid_data_array = array();

        if (isset($searched_data['player_id'])) {
            $condition .= " and player.player_id = ?";
            array_push($valid_data_array, $searched_data['player_id']);
        }
        if (isset($searched_data['jara_player_id'])) {
            $condition .= " and record.jara_player_id = ?";
            array_push($valid_data_array, $searched_data['jara_player_id']);
        }
        if (isset($searched_data['sex'])) {
            $condition .= " and player.sex = ?";
            array_push($valid_data_array, $searched_data['sex']);
        }

        if (isset($searched_data['date_of_birth_start'])) {
            $condition .= " and player.date_of_birth >= CAST(? AS DATE)";
            array_push($valid_data_array, $searched_data['date_of_birth_start']);
        }
        if (isset($searched_data['date_of_birth_end'])) {
            $condition .= " and player.date_of_birth <= CAST(? AS DATE) ";
            array_push($valid_data_array, $searched_data['date_of_birth_end']);
        }
        // dump($searched_data['side_info']);
        if (isset($searched_data['side_info'])) {
            // $searched_data['side_info'] = $searched_data['side_info'][0] & "";
            foreach ($searched_data['side_info'] as $side_info) {
                //CAST(expr AS BINARY)
                $condition .= " and ( (player.side_info  & ?) = ?)";
                array_push($valid_data_array, $side_info);
                array_push($valid_data_array, $side_info);
            }
        }
        if (isset($searched_data['entrysystem_org_id'])) {
            $condition .= " and record.entrysystem_org_id = ?";
            array_push($valid_data_array, $searched_data['entrysystem_org_id']);
        }
        if (isset($searched_data['org_id'])) {
            $condition .= " and record.org_id = ?";
            array_push($valid_data_array, $searched_data['org_id']);
        }
        if (isset($searched_data['player_name'])) {
            //'%' . $query . '%'
            $searched_data['player_name'] = '%' . $searched_data['player_name'] . '%';
            $condition .= " and record.player_name like ?";
            array_push($valid_data_array, $searched_data['player_name']);
        }
        if (isset($searched_data['org_name'])) {
            $searched_data['org_name'] = '%' . $searched_data['org_name'] . '%';
            $condition .= " and record.org_name like ?";
            array_push($valid_data_array, $searched_data['org_name']);
        }
        if (isset($searched_data['tourn_name'])) {
            $searched_data['tourn_name'] = '%' . $searched_data['tourn_name'] . '%';
            $condition .= " and record.tourn_name like ?";
            array_push($valid_data_array, $searched_data['tourn_name']);
        }
        if (isset($searched_data['event_name'])) {
            $searched_data['event_name'] = '%' . $searched_data['event_name'] . '%';
            $condition .= " and record.event_name like ?";
            array_push($valid_data_array, $searched_data['event_name']);
        }

        $sql_string = 'select player.player_id, sex.sex_id, sex.sex, player.date_of_birth, player.side_info, record.jara_player_id, record.player_name, record.entrysystem_org_id, record.org_id, record.org_name from t_race_result_record as record
        left join t_players as player on record.jara_player_id = player.jara_player_id
        left join m_sex as sex on player.sex = sex.sex_id
        where record.delete_flag = 0 #condition# LIMIT 100';
        $sql_string = str_replace('#condition#', $condition, $sql_string);
        dump($sql_string);
        dump($valid_data_array);
        $race_records = DB::select($sql_string, $valid_data_array);
        dump($race_records);
        return $race_records;
    }

    //全選手情報を取得
    //大会結果一括登録画面用
    public function getPlayers()
    {
        $players = DB::select('select
                                `player_id`,
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
                                `photo`, 
                                FROM `t_players`
                                WHERE 1=1
                                and delete_flag = 0');
        return $players;
    }

    //player_idが一致するプレイヤーを抽出する
    public function getPlayer($player_id)
    {
        $player = DB::select('select
                                `player_id`,
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
                                `photo`, 
                                FROM `t_players`
                                WHERE 1=1
                                and delete_flag = 0
                                and player_id = ?
                                ',$player_id);
        return $player;
    }
}
