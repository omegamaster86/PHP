<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\T_followed_players;
use App\Models\T_players;
use App\Models\T_raceResultRecord;
use App\Models\T_users;
use App\Models\T_organization_players;

class PlayerController extends Controller
{
    //選手検索で使用する関数 200240309
    public function playerSearch(Request $request, T_players $tPlayersData)
    {
        Log::debug(sprintf("playerSearch start"));
        $searched_data = $request->all();
        //Log::debug($searched_data);
        $search_values_array = array();
        $replace_condition_string = $this->generateSearchCondition($searched_data, $search_values_array);

        $search_result = null;
        try {
            if (isset($searched_data['org_id'])) {
                Log::debug("団体IDの条件が入力されている場合");
                $search_result = $tPlayersData->getPlayerSearchResultWithOrgIdCondition($replace_condition_string, $search_values_array);
            } else if (isset($searched_data['entrysystem_org_id'])) {
                Log::debug("エントリーシステムの団体IDの条件が入力されている場合");
                $search_result = $tPlayersData->getPlayerSearchResultWithEntrySystemIdCondition($replace_condition_string, $search_values_array);
            } else if (isset($searched_data['org_name'])) {
                Log::debug("団体名の条件が入力されている場合");
                $search_result = $tPlayersData->getPlayerSearchResultWithOrgNameCondition($replace_condition_string, $search_values_array);
            } else {
                Log::debug("エントリーシステムの団体ID、団体ID、団体名以外の条件が入力されている場合");
                $search_result = $tPlayersData->getPlayerSearchResult($replace_condition_string, $search_values_array);
            }
            //Log::debug($search_result);
            Log::debug(sprintf("playerSearch end"));
            return response()->json(['result' => $search_result]); //送信データ(debug用)とDBの結果を返す
        } catch (\Exception $e) {
            Log::error($e);
            abort(500, $e->getMessage());
        }
    }

    //===============================================================================================
    //===============================================================================================

    //reactからの選手登録 20240131
    public function storePlayerData(Request $request, T_players $tPlayersData, T_users $t_users)
    {
        $random_file_name = Str::random(12);
        //If new picture is uploaded
        if ($request->hasFile('uploadedPhoto')) {
            $file = $request->file('uploadedPhoto');
            $fileName = $random_file_name . '.' . $request->file('uploadedPhoto')->getClientOriginalExtension();
            try {
                if (config('app.env') === 'local') {
                    // ローカル環境ではpublic配下に保存する。
                    $destinationPath = public_path() . '/images/players/';
                    $file->move($destinationPath, $fileName);
                } else {
                    // 本番環境ではS3にアップロードする。
                    $path = $file->storeAs('images/players/', $fileName, 's3');
                    Log::debug('S3 Upload Path:', ['path' => $path]);
                }
            } catch (\Exception $e) {
                Log::error('File Upload Error:', ['message' => $e->getMessage()]);
            }
        }
        Log::debug(sprintf("storePlayerData start"));

        //登録するユーザーIDを持つ選手情報の有無を確認
        $target_user_id = Auth::user()->user_id;
        $target_player_data = $tPlayersData->getPlayerFromUserId($target_user_id);
        Log::debug("********************target_player_data********************");
        Log::debug($target_player_data);
        //登録するユーザーIDを持つ選手が未登録なら登録実行
        if (empty($target_player_data)) {
            $reqData = $request->all();

            $tPlayersData::$playerInfo['jara_player_id'] = $reqData['jara_player_id']; //JARA選手コード
            $tPlayersData::$playerInfo['player_name'] = $reqData['player_name']; //選手名
            $tPlayersData::$playerInfo['date_of_birth'] = $reqData['date_of_birth']; //誕生日
            $tPlayersData::$playerInfo['height'] = $reqData['height']; //身長
            $tPlayersData::$playerInfo['weight'] = $reqData['weight']; //体重
            $tPlayersData::$playerInfo['sex_id'] = $reqData['sex_id']; //性別ID
            // $tPlayersData::$playerInfo['photo'] = $reqData['photo']; //写真
            //サイド情報
            $side_info = null;
            for ($i = 0; $i < 8; $i++) {
                if ($reqData['side_info'][$i] == "true") {
                    $side_info .= "1";
                } else {
                    $side_info .= "0";
                }
            }
            $tPlayersData::$playerInfo['side_info'] = $side_info;

            $tPlayersData::$playerInfo['birth_country'] = $reqData['birth_country']; //出身地(国)
            $tPlayersData::$playerInfo['birth_prefecture'] =  $reqData['birth_prefecture']; //出身地(都道府県名)
            $tPlayersData::$playerInfo['residence_country'] = $reqData['residence_country']; //居住地(国)
            $tPlayersData::$playerInfo['residence_prefecture'] =  $reqData['residence_prefecture']; //居住地(都道府県)
            //If new picture is uploaded
            if ($request->hasFile('uploadedPhoto')) {
                $file_name = $random_file_name . '.' . $request->file('uploadedPhoto')->getClientOriginalExtension();
                $tPlayersData::$playerInfo['photo'] = $file_name; //写真
            } else {
                //If  picture is not uploaded

                $tPlayersData::$playerInfo['photo'] = ''; //写真
            }

            try {
                DB::beginTransaction();
                $result = $tPlayersData->insertPlayers($tPlayersData::$playerInfo); //DBに選手を登録 20240131

                DB::commit();

                //ユーザ種別の更新
                //右から3桁目が0のときだけユーザー種別を更新する
                $user_type = (string)Auth::user()->user_type;
                Log::debug("user_type_is_player = " . substr($user_type, -3, 1));
                if (mb_substr($user_type, -3, 1) == '0') {
                    $hoge = array();
                    $hoge['user_id'] = Auth::user()->user_id;
                    $hoge['input'] = '00000100'; //選手のユーザ種別を変更する
                    $t_users->updateUserTypeRegist($hoge);
                }
                $users = $t_users->getIDsAssociatedWithUser(Auth::user()->user_id); //ユーザIDに関連づいたIDの取得

                Log::debug(sprintf("storePlayerData end"));
                return response()->json(['users' => $users, 'result' => $result]); //送信データ(debug用)とDBの結果を返す
            } catch (\Throwable $e) {
                Log::error($e);
                DB::rollBack();
                abort(500, "失敗しました。ユーザーサポートにお問い合わせください。");
            }
        } else {
            Log::debug(sprintf("選手登録済み"));
            return response()->json(['errMessage' => "選手IDはすでに登録されています。複数作成することはできません。"]); //エラーメッセージを返す
            abort(500, "失敗しました。ユーザーサポートにお問い合わせください。");
        }
    }

    //react 選手情報更新画面に表示するuserIDに紐づいたデータを送信 20240131
    public function getUpdatePlayerData(Request $request, T_players $tPlayersData)
    {
        Log::debug(sprintf("getUpdatePlayerData start"));
        // $retrieve_player_by_ID = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);
        $reqData = $request->all();
        Log::debug($reqData);
        $retrieve_player_by_ID = $tPlayersData->getPlayerData($reqData['player_id']); //DBに選手を登録 20240131
        Log::debug(sprintf("getUpdatePlayerData end"));
        return response()->json(['result' => $retrieve_player_by_ID]); //DBの結果を返す
    }
    //reactからの選手登録 20240131
    public function updatePlayerData(Request $request, T_players $tPlayersData, T_users $t_users)
    {
        $random_file_name = Str::random(12);
        //If new picture is uploaded
        if ($request->hasFile('uploadedPhoto')) {
            $file = $request->file('uploadedPhoto');
            $fileName = $random_file_name . '.' . $request->file('uploadedPhoto')->getClientOriginalExtension();
            try {
                if (config('app.env') === 'local') {
                    // ローカル環境ではpublic配下に保存する。
                    $destinationPath = public_path() . '/images/players/';
                    $file->move($destinationPath, $fileName);
                } else {
                    // 本番環境ではS3にアップロードする。
                    $path = $file->storeAs('images/players/', $fileName, 's3');
                    Log::debug('S3 Upload Path:', ['path' => $path]);
                }
            } catch (\Exception $e) {
                Log::error('File Upload Error:', ['message' => $e->getMessage()]);
            }
        }
        Log::debug(sprintf("updatePlayerData start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $tPlayersData::$playerInfo['jara_player_id'] = $reqData['jara_player_id']; //JARA選手コード
        $tPlayersData::$playerInfo['player_name'] = $reqData['player_name']; //選手名
        $tPlayersData::$playerInfo['date_of_birth'] = $reqData['date_of_birth']; //誕生日
        $tPlayersData::$playerInfo['height'] = $reqData['height']; //身長
        $tPlayersData::$playerInfo['weight'] = $reqData['weight']; //体重
        $tPlayersData::$playerInfo['sex_id'] = $reqData['sex_id']; //性別ID
        // $tPlayersData::$playerInfo['photo'] = $reqData['photo']; //写真
        //サイド情報
        $side_info = null;
        for ($i = 0; $i < 8; $i++) {
            if ($reqData['side_info'][$i] == "true") {
                $side_info .= "1";
            } else {
                $side_info .= "0";
            }
        }
        $tPlayersData::$playerInfo['side_info'] = $side_info;

        $tPlayersData::$playerInfo['birth_country'] = $reqData['birth_country']; //出身地(国)
        $tPlayersData::$playerInfo['birth_prefecture'] =  $reqData['birth_prefecture']; //出身地(都道府県名)
        $tPlayersData::$playerInfo['residence_country'] = $reqData['residence_country']; //居住地(国)
        $tPlayersData::$playerInfo['residence_prefecture'] =  $reqData['residence_prefecture']; //居住地(都道府県)

        //If new picture is uploaded
        if ($request->hasFile('uploadedPhoto')) {
            $file_name = $random_file_name . '.' . $request->file('uploadedPhoto')->getClientOriginalExtension();
            $tPlayersData::$playerInfo['photo'] = $file_name; //写真


            if ($reqData['previousPhotoName'] ?? "") {
                $file_path = public_path() . '/images/players/' . $reqData['previousPhotoName'];
                if (file_exists($file_path)) {
                    unlink($file_path); //前の写真削除
                }
            }
        } else {
            //If  picture is not uploaded
            if ($reqData['photo'] ?? "") {
                $tPlayersData::$playerInfo['photo'] = $reqData['photo']; //写真
            } else {
                $tPlayersData::$playerInfo['photo'] = ''; //写真
                if ($reqData['previousPhotoName'] ?? "") {
                    $file_path = public_path() . '/images/players/' . $reqData['previousPhotoName'];
                    if (file_exists($file_path)) {
                        unlink($file_path); //前の写真削除
                    }
                }
            }
        }

        DB::beginTransaction();
        try {
            Log::debug($tPlayersData::$playerInfo);
            $result = $tPlayersData->updatePlayerData($tPlayersData::$playerInfo); //DBに選手を更新 20240131

            $users = $t_users->getIDsAssociatedWithUser(Auth::user()->user_id); //ユーザIDに関連づいたIDの取得
            DB::commit();
            Log::debug(sprintf("updatePlayerData end"));
            return response()->json(['users' => $users, 'result' => $result]); //送信データ(debug用)とDBの結果を返す
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();

            abort(500, "選手情報の更新に失敗しました。ユーザーサポートにお問い合わせください。");
        }
    }

    //react 選手情報参照画面に表示するuserIDに紐づいたデータを送信 20240131
    public function getPlayerInfoData(Request $request, T_players $tPlayersData)
    {
        Log::debug(sprintf("getPlayerInfoData start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $result = $tPlayersData->getPlayerData($reqData['playerId']);
        Log::debug(sprintf("getPlayerInfoData end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    // 選手のフォロー状態・フォロワー数を取得する。
    public function getPlayerFollowStatus(Request $request, T_followed_players $tFollowedPlayers)
    {
        Log::debug(sprintf("getPlayerFollowStatus start"));
        $reqData = $request->all();
        $followedPlayer = $tFollowedPlayers->getFollowedPlayersData($reqData['player_id']);
        $isFollowed = false;
        if (isset($followedPlayer) && $followedPlayer->delete_flag == 0) {
            $isFollowed = true;
        }
        $followerCount = $tFollowedPlayers->getFollowerCount($reqData['player_id']);
        Log::debug(sprintf("getPlayerFollowStatus end"));
        return response()->json([
            'result' => ([
                'isFollowed' => $isFollowed,
                'followerCount' => $followerCount
            ])
        ]);
    }

    //react 選手情報参照画面に表示するplayerIDに紐づいたデータを送信 20240131
    public function getRaceResultRecordsData(Request $request, T_raceResultRecord $tRaceResultRecord)
    {
        Log::debug(sprintf("getRaceResultRecordsData start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $result = $tRaceResultRecord->getRaceResultRecord_playerId($reqData['playerId']); //選手IDを元に出漕結果記録を取得 20240212

        //laptimeをSS.msからMM:SS.msに変換 20240423
        for ($result_index = 0; $result_index < count($result); $result_index++) {
            $result[$result_index]->{"laptime_500m"} = $this->convertToTimeFormat($result[$result_index]->{"laptime_500m"});
            $result[$result_index]->{"laptime_1000m"} = $this->convertToTimeFormat($result[$result_index]->{"laptime_1000m"});
            $result[$result_index]->{"laptime_1500m"} = $this->convertToTimeFormat($result[$result_index]->{"laptime_1500m"});
            $result[$result_index]->{"laptime_2000m"} = $this->convertToTimeFormat($result[$result_index]->{"laptime_2000m"});
            $result[$result_index]->{"final_time"} = $this->convertToTimeFormat($result[$result_index]->{"final_time"});
        }

        Log::debug(sprintf("getRaceResultRecordsData end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //react 選手情報削除画面から受け取ったデータを削除する 20240201
    public function deletePlayerData(Request $request, T_players $tPlayersData, T_raceResultRecord $tRaceResultRecord, T_users $t_users, T_organization_players $t_org_players)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            Log::debug(sprintf("deletePlayerData start"));
            $reqData = $request->all();
            if (empty($reqData['playerInformation'])) {
                abort(400, "選手情報がないため選手を削除できません。");
            }
            Log::debug($reqData);

            $tPlayersData::$playerInfo['player_id'] = $reqData['playerInformation']['player_id']; //選手ID
            $tPlayersData->deletePlayerData($tPlayersData::$playerInfo); //該当選手に削除フラグを立てる 20240208

            // $tRaceResultRecord::$raceResultRecordInfo['player_id'] = $reqData['playerInformation']['player_id']; //選手ID
            // $result = $tRaceResultRecord->deleteRaceResultRecord_playerId($tRaceResultRecord::$raceResultRecordInfo); //該当選手に削除フラグを立てる 20240208

            $t_org_players->updateDeleteFlagAllOrganizations($reqData['playerInformation']['player_id']);

            //ユーザ種別の更新
            $hoge = array();
            $hoge['user_id'] = Auth::user()->user_id;
            $hoge['input'] = '00000100'; //選手のユーザ種別を変更する
            Log::debug($hoge);
            $user_type = (string)Auth::user()->user_type;
            //右から3桁目が1のときだけユーザー種別を更新する
            if (substr($user_type, -3, 1) == '1') {
                $t_users->updateUserTypeDelete($hoge);
            }

            DB::commit();

            Log::debug(sprintf("deletePlayerData end"));
            if ($result === "success") {
                return response()->json("選手情報の削除が完了しました。", 200);
            }
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, "失敗しました。選手を削除できませんでした。");
        }
        // return response()->json(['reqData' => $reqData, 'result' => $result]); //送信データ(debug用)とDBの結果を返す
    }


    public function checkJARAPlayerId(Request $request, T_players $tPlayersData)
    {
        Log::debug(sprintf("checkJARAPlayerId start"));

        $reqData = $request->all();

        Log::debug($reqData['jara_player_id']);

        if ($reqData['jara_player_id'] == "") {
            //選手更新の際に、JARA選手コードが空欄で渡された場合、ユーザの変更によるものかを判定する 20240507
            if ($request["mode"] == "update") {
                $jara_player_id_result = DB::select('select `jara_player_id` from `t_players` where `delete_flag` = 0 and `user_id` = ?', [Auth::user()->user_id]);
                Log::debug($jara_player_id_result);
                if (!empty($jara_player_id_result) && $jara_player_id_result[0]->jara_player_id != NULL && $jara_player_id_result[0]->jara_player_id != "") {
                    Log::debug(sprintf("checkJARAPlayerId update jara_player_id end 1"));
                    return response()->json(["エントリーシステムの選手IDが変更されています。\n過去のレース結果との紐づけが失われます。\n変更しますか？"]);
                }
            }
            return response()->json([""]);
        } //JARA選手コードを入力されてない場合

        if ($request["mode"] === "create") {

            $result = DB::select(
                'select `player_id`, `player_name` from `t_players` where `delete_flag` = 0 and `user_id` = ?',
                [
                    Auth::user()->user_id
                ]
            );
            if (!empty($result)) {
                Log::debug(sprintf("checkJARAPlayerId end 1"));
                abort(400, "選手IDはすでに登録されています。 複数作成することはできません。");
            }
        }
        $tPlayersData::$playerInfo['jara_player_id'] = $reqData['jara_player_id']; //JARA選手コード
        $registered_player = $tPlayersData->checkJARAPlayerId($tPlayersData::$playerInfo);



        if (!empty($registered_player)) {
            Log::debug($registered_player->user_id);

            if ($registered_player->user_id === NULL or $registered_player->user_id === "") {
                return response()->json([""]);
            } //マッピング用なJARA選手コードの場合

            else {
                if ($request["mode"] === "create") {
                    if ($registered_player->user_id === Auth::user()->user_id) {
                        Log::debug(sprintf("checkJARAPlayerId end 2"));
                        abort(403, "選手IDはすでに登録されています。 複数作成することはできません。");
                    } else {
                        Log::debug(sprintf("checkJARAPlayerId end 3"));
                        abort(401, "このJARA選手IDは既に別の選手と紐づいています。入力したJARA選手IDを確認してください。紐づいていた選手：「" . $registered_player->player_id . " 」「" .  $registered_player->player_name . "」");
                    }
                }
                if ($request["mode"] === "create_confirm") {
                    if ($registered_player->user_id === Auth::user()->user_id) {
                        Log::debug(sprintf("checkJARAPlayerId end 4"));
                        abort(403, "登録に失敗しました。選手IDはすでに登録されています。 複数作成することはできません。");
                    } else {
                        Log::debug(sprintf("checkJARAPlayerId end 5"));
                        abort(401, "登録に失敗しました。別のユーザーによってJARA選手コードが別の選手と紐づけられています。紐づいていた選手ID：「" . $registered_player->player_id . " 」「" . $registered_player->player_name . "」");
                    }
                } else if ($request["mode"] === "update") {
                    if ($registered_player->user_id === Auth::user()->user_id) {
                        Log::debug(sprintf("checkJARAPlayerId end 6"));
                        return response()->json("");
                    } else {
                        Log::debug(sprintf("checkJARAPlayerId end 7"));
                        abort(401, "このJARA選手IDは既に別の選手と紐づいています。入力したJARA選手IDを確認してください。紐づいていた選手：「" . $registered_player->player_id . "」「" . $registered_player->player_name . "」");
                    }
                } else if ($request["mode"] === "update_confirm") {
                    if ($registered_player->user_id === Auth::user()->user_id) {
                        Log::debug(sprintf("checkJARAPlayerId end 8"));
                        return response()->json("");
                    } else {
                        Log::debug(sprintf("checkJARAPlayerId end 9"));
                        abort(401, "更新に失敗しました。
                        別のユーザーによってJARA選手コードが別の選手と紐づけられています。紐づいていた選手ID：「" . $registered_player->player_id . "」「" . $registered_player->player_name . "」");
                    }
                } else {
                    Log::debug(sprintf("checkJARAPlayerId end 10"));

                    abort(400, "失敗しました。");
                }
            }
        } else {
            if ($request["mode"] === "create") {
                Log::debug(sprintf("checkJARAPlayerId end 11"));
                return response()->json(["入力したJARA選手IDと紐づくデータが存在しません。\nこのJARA選手IDで登録しますか？"]);
            }
            if ($request["mode"] === "create_confirm") {
                Log::debug(sprintf("checkJARAPlayerId end 12"));
                return response()->json([""]);
            } else if ($request["mode"] === "update") {
                Log::debug(sprintf("checkJARAPlayerId end 13"));
                return response()->json(["エントリーシステムの選手IDが変更されています。\n過去のレース結果との紐づけが失われます。\n変更しますか？"]);
            } else if ($request["mode"] === "update_confirm") {
                Log::debug(sprintf("checkJARAPlayerId end 14"));
                return response()->json([""]);
            } else {
                Log::debug(sprintf("checkJARAPlayerId end 14"));

                abort(400, "失敗しました。");
            }
        }
    }

    //選手フォロー機能 20241029
    public function playerFollowed(Request $request, T_followed_players $tFollowedPlayers)
    {
        Log::debug(sprintf("playerFollowed start"));

        try {
            DB::beginTransaction();

            $reqData = $request->all();
            Log::debug($reqData);
            $playerId = $reqData["playerId"];
            $followPlayer = $tFollowedPlayers->getFollowedPlayersData($playerId); //選手IDとユーザIDを元にフォロー情報が存在するかを確認 202401029

            //フォロー選手テーブルにデータが存在しない場合、新規追加する 20241029
            if (empty($followPlayer)) {
                $tFollowedPlayers->insertFollowedPlayers($playerId); //選手のフォロー追加 202401029
            } else {
                if ($followPlayer->delete_flag == 0) {
                    $tFollowedPlayers->updateFollowedPlayers(1, $playerId); //選手のフォロー解除 202401029
                } else {
                    $tFollowedPlayers->updateFollowedPlayers(0, $playerId); //選手のフォロー 202401029
                }
            }
            DB::commit();
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, '選手フォローに失敗しました。');
        }

        Log::debug(sprintf("playerFollowed end"));
    }

    //選手検索で使用する関数 200240309
    private function generateSearchCondition($searchInfo, &$search_values_array)
    {
        Log::debug(sprintf("generateSearchCondition start"));
        Log::debug($searchInfo);
        $condition = "";
        //JARA選手コード
        if (isset($searchInfo['jara_player_id'])) {
            $condition .= " and `tp`.`jara_player_id`= :jara_player_id\r\n";
            $search_values_array['jara_player_id'] = $searchInfo['jara_player_id'];
        }
        //選手ID
        if (isset($searchInfo['player_id'])) {
            $condition .= " and `tp`.`player_id`= :player_id\r\n";
            $search_values_array['player_id'] = $searchInfo['player_id'];
        }
        //選手名
        if (isset($searchInfo['player_name'])) {
            $condition .= " and `tp`.`player_name` LIKE :player_name\r\n";
            $search_values_array['player_name'] = "%" . $searchInfo['player_name'] . "%";
        }
        //性別
        if (isset($searchInfo['sexId'])) {
            $condition .= "and tp.`sex_id`= :sex_id\r\n";
            $search_values_array['sex_id'] = $searchInfo['sexId'];
        }
        //生年月日
        if (isset($searchInfo['startDateOfBirth'])) {
            $condition .= "and tp.date_of_birth >= :start_date_of_birth\r\n";
            $search_values_array['start_date_of_birth'] = $searchInfo['startDateOfBirth'];
        }
        if (isset($searchInfo['endDateOfBirth'])) {
            $condition .= "and tp.date_of_birth <= :end_date_of_birth\r\n";
            $search_values_array['end_date_of_birth'] = $searchInfo['endDateOfBirth'];
        }
        //サイド情報
        if ($searchInfo['side_info']['S'] == true) {
            $condition .= "and SUBSTRING(tp.`side_info`,8,1) = 1\r\n";
        }
        if ($searchInfo['side_info']['B'] == true) {
            $condition .= "and SUBSTRING(tp.`side_info`,7,1) = 1\r\n";
        }
        if ($searchInfo['side_info']['X'] == true) {
            $condition .= "and SUBSTRING(tp.`side_info`,6,1) = 1\r\n";
        }
        if ($searchInfo['side_info']['X'] == true) {
            $condition .= "and SUBSTRING(tp.`side_info`,5,1) = 1\r\n";
        }
        //出漕大会名
        if (isset($searchInfo['race_class_name'])) {
            $condition .= "and rrr.tourn_name LIKE :tourn_name\r\n";
            $search_values_array['tourn_name'] = "%" . $searchInfo['race_class_name'] . "%";
        }
        //出漕種目
        if (isset($searchInfo['event_id'])) {
            $condition .= "and rrr.event_id = :event_id\r\n";
            $search_values_array['event_id'] = $searchInfo['event_id'];
        }

        if (isset($searchInfo['org_id'])) {
            Log::debug("org_idがNULLでない");
            $search_values_array['org_id_1'] = $searchInfo['org_id'];
            $search_values_array['org_id_2'] = $searchInfo['org_id'];
        } else if (isset($searchInfo['entrysystem_org_id'])) {
            Log::debug("entrysystem_org_idがNULLでない");
            $search_values_array['entrysystem_id_1'] = $searchInfo['entrysystem_org_id'];
            $search_values_array['entrysystem_id_2'] = $searchInfo['entrysystem_org_id'];
        } else if (isset($searchInfo['org_name'])) {
            Log::debug("org_nameがNULLでない");
            $search_values_array['org_name_1'] = "%" . $searchInfo['org_name'] . "%";
            $search_values_array['org_name_2'] = "%" . $searchInfo['org_name'] . "%";
            $search_values_array['org_name_3'] = "%" . $searchInfo['org_name'] . "%";
        }

        Log::debug(sprintf("generateSearchCondition end"));
        return $condition;
    }

    //浮動小数点型を時間フォーマット文字列に変換する 20240423
    //example.)70.34 → 01:10.34
    private function convertToTimeFormat($floatNumber)
    {
        $hours = floor($floatNumber / 60);
        $minutes = floor($floatNumber % 60);
        $seconds = round(($floatNumber - floor($floatNumber)) * 100);

        return sprintf("%02d:%02d.%02d", $hours, $minutes, $seconds);
    }
}
