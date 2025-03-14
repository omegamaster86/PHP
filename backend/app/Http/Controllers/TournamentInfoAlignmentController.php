<?php

namespace App\Http\Controllers;

use App\Models\T_organizations;
use App\Models\T_raceResultRecord;
use App\Models\T_tournaments;
use App\Models\T_races;
use App\Models\T_players;
use App\Models\M_seat_number;
use App\Models\M_events;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class TournamentInfoAlignmentController extends Controller
{
    //大会エントリー一括登録 20240229
    public function tournamentEntryYearSearch(Request $request, T_tournaments $t_tournaments)
    {
        Log::debug(sprintf("tournamentEntryYearSearch start."));
        $reqData = $request->all();
        $event_start_year = $reqData["event_start_year"];
        $user_type = Auth::user()->user_type;

        if (substr($user_type, 1, 1) == '1' || substr($user_type, 2, 1) == '1') {
            // 管理者/JARA権限を持つユーザーならば、開催年に該当する大会をすべて表示する。
            $tournaments = $t_tournaments->getTournamentsFromEntryYear($event_start_year);
        } else {
            // ユーザーがスタッフとして所属する団体が主催した大会だけを表示する。
            $tournaments = $t_tournaments->getTournamentsFromEntryYearAndUserId($event_start_year, Auth::user()->user_id);
        }
        Log::debug(sprintf("tournamentEntryYearSearch end."));
        return response()->json(['result' => $tournaments]); //DBの結果を返す
    }

    //大会エントリー一括登録 読み込むボタン押下 20240419
    public function sendTournamentEntryCsvData(
        Request $request,
        T_races $t_races,
        T_organizations $t_organizations,
        M_seat_number $m_seat_number,
        T_players $t_players,
        T_raceResultRecord $t_raceResultRecord
    ) {
        Log::debug(sprintf("sendTournamentEntryCsvData start"));
        $inputData = $request->all();
        $input_tourn_id = $inputData['tournData']['tournId'];

        for ($rowIndex = 0; $rowIndex < count($inputData['csvDataList']); $rowIndex++) {

            //フロント側のバリデーション結果に未入力が存在する場合、以降の処理を実行しない 20240419
            if ($inputData['csvDataList'][$rowIndex]['loadingResult'] != '') {
                continue;
            }

            //レーステーブルからレース情報が1件見つかること
            $search_values = array();
            $search_values['tourn_id'] = $inputData['csvDataList'][$rowIndex]['tournId'];
            $search_values['event_id'] = $inputData['csvDataList'][$rowIndex]['eventId'];
            $search_values['race_class_id'] = $inputData['csvDataList'][$rowIndex]['raceTypeId'];
            $search_values['by_group'] = $inputData['csvDataList'][$rowIndex]['byGroup'];
            $search_values['race_number'] = $inputData['csvDataList'][$rowIndex]['raceNumber'];
            //選択されている大会の大会IDと一致していること
            if ($input_tourn_id != $inputData['csvDataList'][$rowIndex]['tournId']) {
                Log::debug("選択されている大会の大会IDと一致していません.");
                $errorMessage = "選択されている大会の大会IDと一致していません。";
                $inputData['csvDataList'][$rowIndex]['checked'] = false;
                $inputData['csvDataList'][$rowIndex]['loadingResult'] = "登録情報と不一致あり";
                $inputData['csvDataList'][$rowIndex]['tournIdError'] = $errorMessage;
                continue;
            }
            $replace_condition_string = $this->generateRaceSearchCondition($inputData['csvDataList'][$rowIndex], $search_values);
            $race_count_array = $t_races->getRaceCount($replace_condition_string, $search_values);
            $race_count = $race_count_array[0]->{"count"};
            //「レーステーブル」から条件が全て一致するレース情報を検索し、1件のみ見つかること
            if ($race_count != 1) {
                Log::debug("「レーステーブル」から条件が全て一致するレース情報を検索し、1件のみ見つかることが不正.");
                $errorMessage = "大会ID、種目ID、レース区分ID、組別、レースNoの組み合わせが不正です。";
                $inputData['csvDataList'][$rowIndex]['checked'] = false;
                $inputData['csvDataList'][$rowIndex]['loadingResult'] = "登録情報と不一致あり";
                // 代表でtournIdErrorを設定する
                $inputData['csvDataList'][$rowIndex]['tournIdError'] = $errorMessage;
                $inputData['csvDataList'][$rowIndex]['eventIdError'] = "";
                $inputData['csvDataList'][$rowIndex]['raceTypeIdError'] = "";
                $inputData['csvDataList'][$rowIndex]['byGroupError'] = "";
                $inputData['csvDataList'][$rowIndex]['raceNumberError'] = "";
                continue;
            }
            //団体名
            $org_id = $inputData['csvDataList'][$rowIndex]['orgId'];
            $org_name = $inputData['csvDataList'][$rowIndex]['orgName'];
            $org_count_array = $t_organizations->getOrganizationCountFromCsvData($org_id, $org_name);
            $org_count = $org_count_array[0]->{"count"};
            if ($org_count != 1) {
                $errorMessage = "団体ID、団体名の組み合わせが不正です。";
                $inputData['csvDataList'][$rowIndex]['checked'] = false;
                $inputData['csvDataList'][$rowIndex]['loadingResult'] = "登録情報と不一致あり";
                $inputData['csvDataList'][$rowIndex]['orgIdError'] = $errorMessage;
                $inputData['csvDataList'][$rowIndex]['orgNameError'] = "";
                continue;
            }
            //シート番号
            $seat_number = $inputData['csvDataList'][$rowIndex]['mSeatNumber'];
            $seat_name = $inputData['csvDataList'][$rowIndex]['seatName'];
            $seat_count_array = $m_seat_number->getSeatNumberCountFromCsvData($seat_number, $seat_name);
            $seat_count = $seat_count_array[0]->{"count"};
            if ($seat_count != 1) {
                $errorMessage = "シート番号ID、シート番号の組み合わせが不正です。";
                $inputData['csvDataList'][$rowIndex]['checked'] = false;
                $inputData['csvDataList'][$rowIndex]['loadingResult'] = "登録情報と不一致あり";
                $inputData['csvDataList'][$rowIndex]['mSeatNumberError'] = $errorMessage;
                $inputData['csvDataList'][$rowIndex]['seatNameError'] = "";
                continue;
            }
            //選手名
            $player_id = $inputData['csvDataList'][$rowIndex]['playerId'];
            $player_name = $inputData['csvDataList'][$rowIndex]['playerName'];
            $player_count_array = $t_players->getPlayerCountFromCsvData($player_id, $player_name);
            $player_count = $player_count_array[0]->{"count"};
            if ($player_count != 1) {
                $errorMessage = "選手ID、選手名の組み合わせが不正です。";
                $inputData['csvDataList'][$rowIndex]['checked'] = false;
                $inputData['csvDataList'][$rowIndex]['loadingResult'] = "登録情報と不一致あり";
                $inputData['csvDataList'][$rowIndex]['playerIdError'] = $errorMessage;
                $inputData['csvDataList'][$rowIndex]['playerNameError'] = "";
                continue; //不一致情報が存在する場合、以降の処理を実行しない
            }
            //出漕結果記録テーブルを検索して判定する
            $condition_values = array();
            $condition_values['tourn_id'] = $inputData['csvDataList'][$rowIndex]['tournId']; //大会ID
            $condition_values['race_id'] = $inputData['csvDataList'][$rowIndex]['raceId'];   //レースID
            $condition_values['org_id'] = $inputData['csvDataList'][$rowIndex]['orgId'];     //団体ID
            $condition_values['player_id'] = $inputData['csvDataList'][$rowIndex]['playerId']; //選手ID
            $race_result_record_array = $t_raceResultRecord->getRaceResultRecordsWithSearchCondition($condition_values);
            if (count($race_result_record_array) == 0) {
                //一致するデータがなかった場合
                $inputData['csvDataList'][$rowIndex]['loadingResult'] = "新規登録";
            } else {
                $laptime_500m = $race_result_record_array[0]->{"laptime_500m"};
                $laptime_1000m = $race_result_record_array[0]->{"laptime_1000m"};
                $laptime_1500m = $race_result_record_array[0]->{"laptime_1500m"};
                $laptime_2000m = $race_result_record_array[0]->{"laptime_2000m"};
                $final_time = $race_result_record_array[0]->{"final_time"};
                if (
                    isset($laptime_500m)
                    && isset($laptime_1000m)
                    && isset($laptime_1500m)
                    && isset($laptime_2000m)
                    && isset($final_time)
                ) {
                    //レース結果情報が登録されているデータの場合
                    $inputData['csvDataList'][$rowIndex]['loadingResult'] = "記録情報あり";
                } else {
                    //レース結果情報が登録されていないデータの場合
                    $inputData['csvDataList'][$rowIndex]['loadingResult'] = "エントリー情報変更";
                }
            }
        }

        Log::debug(sprintf("sendTournamentEntryCsvData end"));
        return response()->json(['result' => $inputData]); //DBの結果を返す
    }

    //大会エントリー一括登録 登録ボタン押下 20240301
    public function registerTournamentEntryCsvData(
        Request $request,
        T_raceResultRecord $t_raceResultRecord,
        T_tournaments $t_tournaments,
        T_races $t_races,
        T_organizations $t_organizations,
        T_players $t_players,
        M_events $m_events,
        M_seat_number $m_seat_number
    ) {
        Log::debug(sprintf("registerTournamentEntryCsvData start"));
        $inputData = $request->all();
        //$inputData['csvDataList'] = $request->all();

        $current_datetime = now()->format('Y-m-d H:i:s.u');
        $user_id = Auth::user()->user_id;

        //読み込み結果の選択にチェックが入ってるレコード単位でチェック
        DB::beginTransaction();
        try {
            for ($rowIndex = 0; $rowIndex < count($inputData['csvDataList']); $rowIndex++) {
                if ($inputData['csvDataList'][$rowIndex]["checked"] == true) {
                    $player_id = $inputData['csvDataList'][$rowIndex]["playerId"];               //選手ID
                    $target_player = $t_players->getPlayer($player_id);         //対象の選手データを取得
                    $player_name = $target_player[0]->{"player_name"};               //選手名
                    $jara_player_id = $target_player[0]->{"jara_player_id"};         //JARA選手ID
                    $tourn_id = $inputData['csvDataList'][$rowIndex]["tournId"];               //大会ID
                    $target_tournament = $t_tournaments->getTournament($tourn_id);  //対象の大会データを取得
                    $entrysystem_tourn_id = $target_tournament->entrysystem_tourn_id; //エントリー大会ID                    
                    $tourn_name = $target_tournament->tourn_name;             //大会名
                    $official = $target_tournament->tourn_type; //公式・非公式区分
                    $race_id = $inputData['csvDataList'][$rowIndex]["raceId"];                 //レースID                    
                    $target_race = $t_races->getRaceFromRaceId($race_id);       //対象のレースデータを取得
                    $entrysystem_race_id = $target_race[0]->entrysystem_race_id; //エントリーレースID                    
                    $race_number = $inputData['csvDataList'][$rowIndex]["raceNumber"];         //レースNo.
                    $race_name = $target_race[0]->race_name;                  //レース名
                    $race_class_id = $inputData['csvDataList'][$rowIndex]["raceTypeId"];       //レース区分ID
                    if ($race_class_id == "999") {
                        $race_class_name = $inputData['csvDataList'][$rowIndex]["raceTypeName"];
                    } else {
                        $race_class_name = $target_race[0]->race_class_name;
                    }
                    $org_id = $inputData['csvDataList'][$rowIndex]["orgId"];                   //団体ID
                    $target_organization = $t_organizations->getOrganization($org_id, $user_id);  //対象の団体データを取得
                    $entrysystem_org_id = $target_organization->entrysystem_org_id;   //エントリー団体ID
                    $org_name = $target_organization->org_name;               //団体名
                    $crew_name = $inputData['csvDataList'][$rowIndex]["crewName"];             //クルー名
                    $by_group = $inputData['csvDataList'][$rowIndex]["byGroup"];               //組別
                    $event_id = $inputData['csvDataList'][$rowIndex]["eventId"];               //種目ID
                    $event = $m_events->getEventForEventID($event_id);        //種目マスタから対象の種目情報を取得
                    if ($event_id == "999") {
                        $event_name = $inputData['csvDataList'][$rowIndex]["eventName"];         //種目名
                    } else {
                        $event_name = $event[0]->event_name;                      //種目名
                    }
                    $seatId = $inputData['csvDataList'][$rowIndex]["mSeatNumber"]; //シートID
                    $seat = $m_seat_number->getSeatFromSeatId($seatId);
                    $seatName = $seat[0]->seat_name; //シート名
                    $range = $target_race[0]->range;                          //距離
                    $start_datetime = $target_race[0]->start_date_time;       //発艇日時

                    //レース結果情報の検索
                    $search_values = array();
                    $search_values["tourn_id"] = $tourn_id;
                    $search_values["race_id"] = $race_id;
                    $search_values["org_id"] = $org_id;
                    $search_values["player_id"] = $player_id;
                    $race_result_record_array = $t_raceResultRecord->getRaceResultRecordsWithSearchCondition($search_values);
                    //検索結果を確認
                    if (count($race_result_record_array) == 1) {
                        //レース結果データが1件だけ存在する場合
                        //レース結果が登録されているかを確認
                        $race_result_record_id = $race_result_record_array[0]->{"race_result_record_id"};
                        $laptime_500m = $race_result_record_array[0]->{"laptime_500m"};
                        $laptime_1000m = $race_result_record_array[0]->{"laptime_1000m"};
                        $laptime_1500m = $race_result_record_array[0]->{"laptime_1500m"};
                        $laptime_2000m = $race_result_record_array[0]->{"laptime_2000m"};
                        $final_time = $race_result_record_array[0]->{"final_time"};
                        if (
                            isset($laptime_500m)
                            || isset($laptime_1000m)
                            || isset($laptime_1500m)
                            || isset($laptime_2000m)
                            || isset($final_time)
                        ) {
                            //登録されている場合
                            $inputData['csvDataList'][$rowIndex]['loadingResult'] = "登録エラー（記録情報あり）";
                            // throw new Exception("他のユーザーによりレース結果が登録されたレースが有ります。\r\n当該レースのエントリー情報は更新することは出来ません。");
                            return response()->json(['hasError' => "他のユーザーによりレース結果が登録されたレースが有ります。\r\n当該レースのエントリー情報は更新することは出来ません。"]);
                        } else {
                            //登録されていない場合
                            $update_values = array();
                            $update_values["player_id"] = $player_id;
                            $update_values["jara_player_id"] = $jara_player_id;
                            $update_values["player_name"] = $player_name;
                            $update_values["entrysystem_tourn_id"] = $entrysystem_tourn_id;
                            $update_values["tourn_id"] = $tourn_id;
                            $update_values["tourn_name"] = $tourn_name;
                            $update_values["race_id"] = $race_id;
                            $update_values["entrysystem_race_id"] = $entrysystem_race_id;
                            $update_values["race_number"] = $race_number;
                            $update_values["race_name"] = $race_name;
                            $update_values["race_class_id"] = $race_class_id;
                            $update_values["race_class_name"] = $race_class_name;
                            $update_values["org_id"] = $org_id;
                            $update_values["entrysystem_org_id"] = $entrysystem_org_id;
                            $update_values["org_name"] = $org_name;
                            $update_values["crew_name"] = $crew_name;
                            $update_values["by_group"] = $by_group;
                            $update_values["event_id"] = $event_id;
                            $update_values["event_name"] = $event_name;
                            $update_values["range"] = $range;
                            $update_values["official"] = $official;
                            $update_values["seat_number"] = $seatId;
                            $update_values["seat_name"] = $seatName;
                            $update_values["start_datetime"] = $start_datetime;
                            $update_values["updated_time"] = $current_datetime;
                            $update_values["updated_user_id"] = $user_id;
                            $update_values["race_result_record_id"] = $race_result_record_id;
                            //更新実行
                            $t_raceResultRecord->updateRaceResultRecordsResponse($update_values);
                        }
                    } elseif (count($race_result_record_array) == 0) {
                        //レース結果データが0件の場合
                        $insert_values = array();
                        $insert_values["player_id"] = $player_id;
                        $insert_values["jara_player_id"] = $jara_player_id;
                        $insert_values["player_name"] = $player_name;
                        $insert_values["entrysystem_tourn_id"] = $entrysystem_tourn_id;
                        $insert_values["tourn_id"] = $tourn_id;
                        $insert_values["tourn_name"] = $tourn_name;
                        $insert_values["race_id"] = $race_id;
                        $insert_values["entrysystem_race_id"] = $entrysystem_race_id;
                        $insert_values["race_number"] = $race_number;
                        $insert_values["race_name"] = $race_name;
                        $insert_values["race_class_id"] = $race_class_id;
                        $insert_values["race_class_name"] = $race_class_name;
                        $insert_values["org_id"] = $org_id;
                        $insert_values["entrysystem_org_id"] = $entrysystem_org_id;
                        $insert_values["org_name"] = $org_name;
                        $insert_values["crew_name"] = $crew_name;
                        $insert_values["by_group"] = $by_group;
                        $insert_values["event_id"] = $event_id;
                        $insert_values["event_name"] = $event_name;
                        $insert_values["range"] = $range;
                        $insert_values["official"] = $official;
                        $insert_values["seat_number"] = $seatId;
                        $insert_values["seat_name"] = $seatName;
                        $insert_values["start_datetime"] = $start_datetime;
                        $insert_values["current_datetime"] = $current_datetime;
                        $insert_values["user_id"] = $user_id;
                        //新規登録実行
                        $inserted_id = $t_raceResultRecord->insertRaceResultRecordResponse($insert_values);
                    }
                }
            }
            DB::commit();
            Log::debug(sprintf("registerTournamentEntryCsvData end"));
            return response()->json(['result' => $inputData['csvDataList']]); //DBの結果を返す
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, $e->getMessage());
        }
    }

    //レース結果一括 読み込むボタン押下 20240301
    public function sendTournamentResultCsvData(
        Request $request,
        T_tournaments $t_tournaments,
        T_races $t_races,
        T_organizations $t_organizations,
        T_players $t_players,
        T_raceResultRecord $t_raceResultRecord
    ) {
        Log::debug(sprintf("sendTournamentResultCsvData start"));
        $reqData = $request->all();
        try {
            //フロントエンドで入力された大会ID
            $input_tourn_id = $reqData['tournData']['tournId'];
            // //対象の大会情報
            $target_tournament = $t_tournaments->getTournamentInfoFromTournId($input_tourn_id);
            // //対象の大会が公式かどうか
            $is_target_tournament_official = $target_tournament[0]->{'tourn_type'};
            //団体情報
            $organizations = $t_organizations->getOrganizations();
            //選手情報
            $players = $t_players->getPlayers();
            //チェック結果
            for ($rowIndex = 0; $rowIndex < count($reqData['csvDataList']); $rowIndex++) {
                $checkResult = true;
                $target_row = &$reqData['csvDataList'][$rowIndex];
                $entrysystem_tourn_id = isset($target_row['entrysystemTournId']) ? $target_row['entrysystemTournId'] : null;  //既存大会ID
                $entrysystem_race_id = isset($target_row['entrysystemRaceId']) ? $target_row['entrysystemRaceId'] : null;   //既存レースID
                $jara_player_id = isset($target_row['jaraPlayerId']) ? $target_row['jaraPlayerId'] : null; //既存選手ID
                $tourn_id = isset($target_row['tournId']) ? $target_row['tournId'] : null;  //大会ID
                $race_id = isset($target_row['raceId']) ? $target_row['raceId'] : null;   //レースID
                $player_id = isset($target_row['playerId']) ? $target_row['playerId'] : null; //選手ID

                //非公式
                if ($is_target_tournament_official == 0) {
                    // 大会ID   非公式大会は必須入力
                    if (!isset($tourn_id)) {
                        $errorMessage = "大会IDは必須入力です。";
                        $checkResult = false;
                        $target_row['tournIdError'] = $errorMessage;
                    }
                    // エントリー大会ID
                    if (isset($entrysystem_tourn_id)) {
                        $errorMessage = "エントリー大会IDは8桁以内の整数で入力してください。";
                        $this->checkInteger($entrysystem_tourn_id, 8, $checkResult, $target_row['entrysystemTournIdError'], $errorMessage);
                    }
                    // 大会名
                    if (isset($target_row['tournName'])) {
                        $errorMessage = "大会名は255文字以内で入力してください。";
                        $this->checkWithinByte($target_row['tournName'], 255, $checkResult, $target_row['tournNameError'], $errorMessage);
                    }
                    // 選手ID   非公式大会は必須入力
                    if (!isset($player_id)) {
                        $errorMessage = "選手IDは必須入力です。";
                        $checkResult = false;
                        $target_row['playerIdError'] = $errorMessage;
                    }
                    // JARA選手コード
                    if (isset($jara_player_id)) {
                        //半角数字かつ12桁でなければエラーとする
                        if (!(is_numeric($jara_player_id) && mb_strlen($jara_player_id) == 12)) {
                            $errorMessage = "JARA選手コードは12桁の半角数字で入力してください。";
                            $checkResult = false;
                            $target_row['jaraPlayerIdError'] = $errorMessage;
                        }
                    }
                    // 選手名
                    if (isset($target_row['playerName'])) {
                        $errorMessage = "選手名は100文字以内で入力してください。";
                        $this->checkWithinByte($target_row['playerName'], 100, $checkResult, $target_row['playerNameError'], $errorMessage);
                    } else {
                        $errorMessage = "選手名は必須入力です。";
                        $checkResult = false;
                        $target_row['playerNameError'] = $errorMessage;
                    }
                    // レースID
                    if (!isset($race_id)) {
                        $errorMessage = "レースIDは必須入力です。";
                        $checkResult = false;
                        $target_row['raceIdError'] = $errorMessage;
                    }
                    // エントリーレースID
                    if (isset($entrysystem_race_id)) {
                        $errorMessage = "エントリーレースIDは8桁以内の整数で入力してください。";
                        $this->checkInteger($entrysystem_race_id, 8, $checkResult, $target_row['entrysystemRaceIdError'], $errorMessage);
                    }
                    //レースNo.
                    if (isset($target_row['raceNumber'])) {
                        $errorMessage = "レースNo.は3桁以内の整数で入力してください。";
                        $this->checkInteger($target_row['raceNumber'], 3, $checkResult, $target_row['raceNumberError'], $errorMessage);
                    } else {
                        $errorMessage = "レースNo.は必須入力です。";
                        $checkResult = false;
                        $target_row['raceNumberError'] = $errorMessage;
                    }
                    //レース名
                    if (isset($target_row['raceName'])) {
                        $errorMessage = "レース名は255文字以内で入力してください。";
                        $this->checkWithinByte($target_row['raceName'], 255, $checkResult, $target_row['raceNameError'], $errorMessage);
                    }
                    //レース区分ID
                    if (!isset($target_row['raceTypeId'])) {
                        $errorMessage = "レース区分IDは必須入力です。";
                        $checkResult = false;
                        $target_row['raceTypeIdError'] = $errorMessage;
                    }
                    // レース区分名
                    if (isset($target_row['raceTypeName'])) {
                        $errorMessage = "レース区分名は255文字以内で入力してください。";
                        $this->checkWithinByte($target_row['raceTypeName'], 255, $checkResult, $target_row['raceTypeNameError'], $errorMessage);
                    }
                    //団体名
                    if (!(isset($target_row['orgId']))) {
                        $errorMessage = "団体IDは必須入力です。";
                        $checkResult = false;
                        $target_row['orgIdError'] = $errorMessage;
                    }
                }
                //公式
                else {
                    //大会IDかエントリー大会IDのどちらかが入力されていることを確認
                    //どちらも入力されていなかったら両項目をエラーとする
                    if (!(isset($target_row['tournId']) || isset($target_row['entrysystemTournId']))) {
                        $tournIdErrorMessage = "大会ID、エントリー大会IDのいずれかは必須入力です。";
                        $checkResult = false;
                        $target_row['tournIdError'] = $tournIdErrorMessage;
                        $target_row['entrysystemTournIdError'] = "";
                    }
                    // エントリー大会ID
                    if (isset($target_row['entrysystemTournId'])) {
                        $errorMessage = "エントリー大会IDは8桁以内の整数で入力してください。";
                        $this->checkInteger($target_row['entrysystemTournId'], 8, $checkResult, $target_row['entrysystemTournIdError'], $errorMessage);
                    }
                    //大会名
                    if (isset($target_row['tournName'])) {
                        $errorMessage = "大会名は255文字以内で入力してください。";
                        $this->checkWithinByte($target_row['tournName'], 255, $checkResult, $target_row['tournNameError'], $errorMessage);
                    }
                    //選手IDかJARA選手コードのいずれかが入力されていることを確認する
                    //どちらも入力されていない場合、両項目をエラーとする
                    if (!isset($player_id) && !isset($target_row['jaraPlayerId'])) {
                        $playerIdErrorMessage = "選手ID、JARA選手コードのいずれかは必須入力です。";
                        $checkResult = false;
                        $target_row['playerIdError'] = $playerIdErrorMessage;
                        $target_row['jaraPlayerIdError'] = "";
                    }
                    // JARA選手コード
                    //jara_player_codeにデータがあれば判定する
                    if (isset($target_row['jaraPlayerId'])) {
                        if (!(is_numeric($target_row['jaraPlayerId']) && mb_strlen($target_row['jaraPlayerId']) == 12)) {
                            $errorMessage = "JARA選手コードは12桁の半角数字で入力してください。";
                            $checkResult = false;
                            $target_row['jaraPlayerIdError'] = $errorMessage;
                        }
                    }
                    // 選手名
                    if (isset($target_row['playerName'])) {
                        $errorMessage = "選手名は100文字以内で入力してください。";
                        $this->checkWithinByte($target_row['playerName'], 100, $checkResult, $target_row['playerNameError'], $errorMessage);
                    } else {
                        $errorMessage = "選手名は必須入力です。";
                        $checkResult = false;
                        $target_row['playerNameError'] = $errorMessage;
                    }
                    //レースIDかエントリーレースIDのいずれかが入力されていることを確認
                    //どちらも入力されていなかったら両項目をエラーとする
                    if (!(isset($race_id) || isset($target_row['entrysystemRaceId']))) {
                        $raceIdErrorMessage = "レースID、エントリーレースIDのいずれかは必須入力です。";
                        $checkResult = false;
                        $target_row['raceIdError'] = $raceIdErrorMessage;
                        $target_row['entrysystemRaceIdError'] = "";
                    }
                    // エントリーレースID
                    if (isset($target_row['entrysystemRaceId'])) {
                        $errorMessage = "エントリーレースIDは8桁以内の整数で入力してください。";
                        $this->checkInteger($target_row['entrysystemRaceId'], 8, $checkResult, $target_row['entrysystemRaceIdError'], $errorMessage);
                    }
                    //レースNo.
                    if (isset($target_row['raceNumber'])) {
                        $errorMessage = "レースNo.は3桁以内の整数で入力してください。";
                        $this->checkInteger($target_row['raceNumber'], 3, $checkResult, $target_row['raceNumberError'], $errorMessage);
                    } else {
                        $errorMessage = "レースNo.は必須入力です。";
                        $checkResult = false;
                        $target_row['raceNumberError'] = $errorMessage;
                    }
                    //レース名
                    if (isset($target_row['raceName'])) {
                        $errorMessage = "レース名は255文字以内で入力してください。";
                        $this->checkWithinByte($target_row['raceName'], 255, $checkResult, $target_row['raceNameError'], $errorMessage);
                    } else {
                        $errorMessage = "レース名は必須入力です。";
                        $checkResult = false;
                        $target_row['raceNameError'] = $errorMessage;
                    }
                    //レース区分ID
                    if (!isset($target_row['raceTypeId'])) {
                        $errorMessage = "レース区分IDは必須入力です。";
                        $checkResult = false;
                        $target_row['raceTypeIdError'] = $errorMessage;
                    }
                    //レース区分名
                    if (isset($target_row['raceTypeName'])) {
                        $errorMessage = "レース区分名は255文字以内で入力してください。";
                        $this->checkWithinByte($target_row['raceTypeName'], 255, $checkResult, $target_row['raceTypeNameError'], $errorMessage);
                    } else {
                        $errorMessage = "レース区分名は必須入力です。";
                        $checkResult = false;
                        $target_row['raceTypeNameError'] = $errorMessage;
                    }
                    //団体IDとエントリー団体コードのいずれかが入力されていることを確認
                    //どちらも入力されていなかったら両項目をエラーとする
                    if (!isset($target_row['orgId']) && !isset($target_row['entrysystemOrgId'])) {
                        $orgIdErrorMessage = "団体ID、エントリー団体コードのいずれかは必須入力です。";
                        $checkResult = false;
                        $target_row['orgIdError'] = $orgIdErrorMessage;
                        $target_row['entrysystemOrgIdError'] = "";
                    }
                    //団体名
                    if (!(isset($target_row['orgName']))) {
                        $errorMessage = "団体名は必須入力です。";
                        $checkResult = false;
                        $target_row['orgNameError'] = $errorMessage;
                    }
                }
                //公式・非公式で区別しない項目
                // エントリー団体コード
                if (isset($target_row['entrysystemOrgId'])) {
                    if (!(is_numeric($target_row['entrysystemOrgId']) && mb_strlen($target_row['entrysystemOrgId']) == 6)) {
                        $errorMessage = "エントリー団体コードは6桁の半角数字で入力してください。";
                        $checkResult = false;
                        $target_row['entrysystemOrgIdError'] = $errorMessage;
                    }
                }
                //団体名
                if (isset($target_row['orgName'])) {
                    $errorMessage = "団体名は255文字以内で入力してください。";
                    $this->checkWithinByte($target_row['orgName'], 255, $checkResult, $target_row['orgNameError'], $errorMessage);
                }
                //クルー名
                if (isset($target_row['crewName'])) {
                    $errorMessage = "クルー名は255文字以内で入力してください。";
                    $this->checkWithinByte($target_row['crewName'], 255, $checkResult, $target_row['crewNameError'], $errorMessage);
                } else {
                    $errorMessage = "クルー名は必須入力です。";
                    $checkResult = false;
                    $target_row['crewNameError'] = $errorMessage;
                }
                //組別
                if (isset($target_row['byGroup'])) {
                    $errorMessage = "組別は255文字以内で入力してください。";
                    $this->checkWithinByte($target_row['byGroup'], 255, $checkResult, $target_row['byGroupError'], $errorMessage);
                } else {
                    $errorMessage = "組別は必須入力です。";
                    $checkResult = false;
                    $target_row['byGroupError'] = $errorMessage;
                }
                //種目ID
                if (!isset($target_row['eventId'])) {
                    $errorMessage = "種目IDは必須入力です。";
                    $checkResult = false;
                    $target_row['eventIdError'] = $errorMessage;
                }
                //種目名
                if (isset($target_row['eventName'])) {
                    $errorMessage = "種目名は255文字以内で入力してください。";
                    $this->checkWithinByte($target_row['eventName'], 255, $checkResult, $target_row['eventNameError'], $errorMessage);
                } else {
                    $errorMessage = "種目名は必須入力です。";
                    $checkResult = false;
                    $target_row['eventNameError'] = $errorMessage;
                }
                //距離
                if (isset($target_row['range'])) {
                    $errorMessage = "距離は4桁以内の整数で入力してください。";
                    $this->checkInteger($target_row['range'], 4, $checkResult, $target_row['rangeError'], $errorMessage);
                }
                //順位
                if (isset($target_row['rank'])) {
                    $errorMessage = "順位は3桁以内の整数で入力してください。";
                    $this->checkInteger($target_row['rank'], 3, $checkResult, $target_row['rankError'], $errorMessage);
                } else {
                    $errorMessage = "順位は必須入力です。";
                    $checkResult = false;
                    $target_row['rankError'] = $errorMessage;
                }

                //ラップタイムは500m～最終までの何れかの入力が必須（すべて空の場合、エラーとする） 20240417
                if (!(isset($target_row['fiveHundredmLaptime']) || isset($target_row['tenHundredmLaptime']) || isset($target_row['fifteenHundredmLaptime']) || isset($target_row['twentyHundredmLaptime']) || isset($target_row['finalTime']))) {
                    $errorMessage = "500mラップタイム、1000mラップタイム、1500mラップタイム、2000mラップタイム、最終タイムのいずれかの入力が必須です。";
                    $checkResult = false;
                    // フロントエンドでxxxErrorはfalse以外のセルを黄色にさせるので空文字を設定
                    $target_row['fiveHundredmLaptimeError'] = "";
                    $target_row['tenHundredmLaptimeError'] = "";
                    $target_row['fifteenHundredmLaptimeError'] = "";
                    $target_row['twentyHundredmLaptimeError'] = "";
                    // 代表して最終タイムのエラーメッセージを設定
                    $target_row['finalTimeError'] = $errorMessage;
                }

                // 500mlapタイム
                if (isset($target_row['fiveHundredmLaptime'])) {
                    $errorMessage = "500mラップタイムは整数部5桁以内、小数部2桁以内の数値で入力してください。";
                    $this->checkDecimal($target_row['fiveHundredmLaptime'], "5.2", $checkResult, $target_row['fiveHundredmLaptimeError'], $errorMessage);
                }
                //1000mlapタイム
                if (isset($target_row['tenHundredmLaptime'])) {
                    $errorMessage = "1000mラップタイムは整数部5桁以内、小数部2桁以内の数値で入力してください。";
                    $this->checkDecimal($target_row['tenHundredmLaptime'], "5.2", $checkResult, $target_row['tenHundredmLaptimeError'], $errorMessage);
                }
                // 1500mlapタイム
                if (isset($target_row['fifteenHundredmLaptime'])) {
                    $errorMessage = "1500mラップタイムは整数部5桁以内、小数部2桁以内の数値で入力してください。";
                    $this->checkDecimal($target_row['fifteenHundredmLaptime'], "5.2", $checkResult, $target_row['fifteenHundredmLaptimeError'], $errorMessage);
                }
                // 2000mlapタイム
                if (isset($target_row['twentyHundredmLaptime'])) {
                    $errorMessage = "2000mラップタイムは整数部5桁以内、小数部2桁以内の数値で入力してください。";
                    $this->checkDecimal($target_row['twentyHundredmLaptime'], "5.2", $checkResult, $target_row['twentyHundredmLaptimeError'], $errorMessage);
                }
                // 最終タイム
                if (isset($target_row['finalTime'])) {
                    $errorMessage = "最終タイムは整数部5桁以内、小数部2桁以内の数値で入力してください。";
                    $this->checkDecimal($target_row['finalTime'], "5.2", $checkResult, $target_row['finalTimeError'], $errorMessage);
                }
                // ストロークレート（平均）
                if (isset($target_row['strokeRateAvg'])) {
                    $errorMessage = "ストロークレート（平均）は99以下の整数で入力してください。";
                    $this->checkInteger($target_row['strokeRateAvg'], 2, $checkResult, $target_row['strokeRateAvgError'], $errorMessage);
                }
                // 500mストロークレート
                if (isset($target_row['fiveHundredmStrokeRat'])) {
                    $errorMessage = "500mストロークレートは99以下の整数で入力してください。";
                    $this->checkInteger($target_row['fiveHundredmStrokeRat'], 2, $checkResult, $target_row['fiveHundredmStrokeRatError'], $errorMessage);
                }
                // 1000mストロークレート
                if (isset($target_row['tenHundredmStrokeRat'])) {
                    $errorMessage = "1000mストロークレートは99以下の整数で入力してください。";
                    $this->checkInteger($target_row['tenHundredmStrokeRat'], 2, $checkResult, $target_row['tenHundredmStrokeRatError'], $errorMessage);
                }
                // 1500mストロークレート
                if (isset($target_row['fifteenHundredmStrokeRat'])) {
                    $errorMessage = "1500mストロークレートは99以下の整数で入力してください。";
                    $this->checkInteger($target_row['fifteenHundredmStrokeRat'], 2, $checkResult, $target_row['fifteenHundredmStrokeRatError'], $errorMessage);
                }
                // 2000mストロークレート
                if (isset($target_row['twentyHundredmStrokeRat'])) {
                    $errorMessage = "2000mストロークレートは99以下の整数で入力してください。";
                    $this->checkInteger($target_row['twentyHundredmStrokeRat'], 2, $checkResult, $target_row['twentyHundredmStrokeRatError'], $errorMessage);
                }
                // 心拍数（平均）
                if (isset($target_row['heartRateAvg'])) {
                    $errorMessage = "心拍数（平均）は3桁以内の整数で入力してください。";
                    $this->checkInteger($target_row['heartRateAvg'], 3, $checkResult, $target_row['heartRateAvgError'], $errorMessage);
                }
                // 500m心拍数
                if (isset($target_row['fiveHundredmHeartRate'])) {
                    $errorMessage = "500m心拍数は3桁以内の整数で入力してください。";
                    $this->checkInteger($target_row['fiveHundredmHeartRate'], 3, $checkResult, $target_row['fiveHundredmHeartRateError'], $errorMessage);
                }
                // 1000m心拍数
                if (isset($target_row['tenHundredmHeartRate'])) {
                    $errorMessage = "1000m心拍数は3桁以内の整数で入力してください。";
                    $this->checkInteger($target_row['tenHundredmHeartRate'], 3, $checkResult, $target_row['tenHundredmHeartRateError'], $errorMessage);
                }
                // 1500m心拍数
                if (isset($target_row['fifteenHundredmHeartRate'])) {
                    $errorMessage = "1500m心拍数は3桁以内の整数で入力してください。";
                    $this->checkInteger($target_row['fifteenHundredmHeartRate'], 3, $checkResult, $target_row['fifteenHundredmHeartRateError'], $errorMessage);
                }
                // 2000m心拍数
                if (isset($target_row['twentyHundredmHeartRate'])) {
                    $errorMessage = "2000m心拍数は3桁以内の整数で入力してください。";
                    $this->checkInteger($target_row['twentyHundredmHeartRate'], 3, $checkResult, $target_row['twentyHundredmHeartRateError'], $errorMessage);
                }
                // 公式／非公式
                if (isset($target_row['official'])) {
                    $errorMessage = "公式／非公式は0または1で入力してください。";
                    $this->checkZeroOrOne($target_row['official'], $checkResult, $target_row['officialError'], $errorMessage);
                    //選択した大会と公式／非公式が一致していることを確認する
                    if ($is_target_tournament_official != $target_row['official']) {
                        $errorMessage = "選択した大会と公式／非公式が一致していません。";
                        $checkResult = false;
                        $target_row['officialError'] = $errorMessage;
                    }
                }
                // 立ち合い有無
                if (isset($target_row['attendance'])) {
                    $errorMessage = "立ち合い有無は0または1で入力してください。";
                    $this->checkZeroOrOne($target_row['attendance'], $checkResult, $target_row['attendanceError'], $errorMessage);
                }
                // 選手身長
                if (isset($target_row['playerHeight'])) {
                    $errorMessage = "選手身長は整数部3桁以内、小数部2桁以内の数値で入力してください。";
                    $this->checkDecimal($target_row['playerHeight'], "3.2", $checkResult, $target_row['playerHeightError'], $errorMessage);
                }
                // 選手体重
                if (isset($target_row['playerWeight'])) {
                    $errorMessage = "選手体重は整数部3桁以内、小数部2桁以内の数値で入力してください。";
                    $this->checkDecimal($target_row['playerWeight'], "3.2", $checkResult, $target_row['playerWeightError'], $errorMessage);
                }
                // シート番号ID
                if (!isset($target_row['mSeatNumber'])) {
                    $errorMessage = "シート番号IDは必須入力です。";
                    $checkResult = false;
                    $target_row['mSeatNumberError'] = $errorMessage;
                }
                // シート番号
                if (isset($target_row['seatName'])) {
                    $errorMessage = "シート番号は255文字以内で入力してください。";
                    $this->checkWithinByte($target_row['seatName'], 255, $checkResult, $target_row['seatNameError'], $errorMessage);
                } else {
                    $errorMessage = "シート番号は必須入力です。";
                    $checkResult = false;
                    $target_row['seatNameError'] = $errorMessage;
                }
                // 出漕結果記録名
                if (isset($target_row['raceResultRecordName'])) {
                    $errorMessage = "出漕結果記録名は255文字以内で入力してください。";
                    $this->checkWithinByte($target_row['raceResultRecordName'], 255, $checkResult, $target_row['raceResultRecordNameError'], $errorMessage);
                }
                // 発艇日時
                if (isset($target_row['startDatetime'])) {
                    //文字数が16文字(YYYY/MM/DD hh:mm)でない場合、エラーとする
                    if (mb_strlen($target_row['startDatetime']) != 16) {
                        $errorMessage = "発艇日時は16文字で入力してください。";
                        $checkResult = false;
                        $target_row['startDatetimeError'] = $errorMessage;
                    }
                    if (!($target_row['startDatetime'] === date('Y/m/d H:i', strtotime($target_row['startDatetime'])))) {
                        $errorMessage = "発艇日時はYYYY/mm/dd hh:ssの形式で入力してください。";
                        $checkResult = false;
                        $target_row['startDatetimeError'] = $errorMessage;
                    }
                } else {
                    $errorMessage = "発艇日時は必須入力です。";
                    $checkResult = false;
                    $target_row['startDatetimeError'] = $errorMessage;
                }
                // 天候
                if (isset($target_row['weather'])) {
                    $errorMessage = "天候は255文字以内で入力してください。";
                    $this->checkWithinByte($target_row['weather'], 255, $checkResult, $target_row['weatherError'], $errorMessage);
                }
                // 2000m地点風速
                if (isset($target_row['windSpeedTwentyHundredmPoint'])) {
                    $errorMessage = "2000m地点風速は整数部3桁以内、小数部2桁以内の数値で入力してください。";
                    $this->checkDecimal($target_row['windSpeedTwentyHundredmPoint'], "3.2", $checkResult, $target_row['windSpeedTwentyHundredmPointError'], $errorMessage);
                }
                // 2000m地点風向
                if (isset($target_row['windDirectionTwentyHundredmPoint'])) {
                    $errorMessage = "2000m地点風向は255文字以内で入力してください。";
                    $this->checkWithinByte($target_row['windDirectionTwentyHundredmPoint'], 255, $checkResult, $target_row['windDirectionTwentyHundredmPointError'], $errorMessage);
                }
                // 1000m地点風速
                if (isset($target_row['windSpeedTenHundredmPoint'])) {
                    $errorMessage = "1000m地点風速は整数部3桁以内、小数部2桁以内の数値で入力してください。";
                    $this->checkDecimal($target_row['windSpeedTenHundredmPoint'], "3.2", $checkResult, $target_row['windSpeedTenHundredmPointError'], $errorMessage);
                }
                // 1000m地点風向
                if (isset($target_row['windDirectionTenHundredmPoint'])) {
                    $errorMessage = "1000m地点風向は255文字以内で入力してください。";
                    $this->checkWithinByte($target_row['windDirectionTenHundredmPoint'], 255, $checkResult, $target_row['windDirectionTenHundredmPointError'], $errorMessage);
                }
                // 備考
                if (isset($target_row['raceResultNote'])) {
                    $errorMessage = "備考は255文字以内で入力してください。";
                    $this->checkWithinByte($target_row['raceResultNote'], 255, $checkResult, $target_row['raceResultNoteError'], $errorMessage);
                }
                //大会ID情報
                if ($checkResult == true) {
                    //Log::debug("大会ID情報　チェック");
                    $is_tournament_exists = false;
                    foreach ($target_tournament as $tourn) {
                        if (isset($target_row['entrysystemTournId']) && isset($target_row['tournId'])) {
                            if (
                                $tourn->tourn_id == $target_row['tournId']
                                && $tourn->entrysystem_tourn_id == $target_row['entrysystemTournId']
                                && $tourn->tourn_name == $target_row['tournName']
                            ) {
                                $is_tournament_exists = true;
                                break;
                            }
                        } elseif (!isset($target_row['entrysystemTournId']) && isset($target_row['tournId'])) {
                            if (
                                $tourn->tourn_id == $target_row['tournId']
                                && $tourn->tourn_name == $target_row['tournName']
                            ) {
                                $is_tournament_exists = true;
                                break;
                            }
                        } elseif (isset($target_row['entrysystemTournId']) && !isset($target_row['tournId'])) {
                            if (
                                $tourn->entrysystem_tourn_id == $target_row['entrysystemTournId']
                                && $tourn->tourn_name == $target_row['tournName']
                            ) {
                                $is_tournament_exists = true;
                                break;
                            }
                        }
                    }
                    if (!$is_tournament_exists) {
                        $tournIdErrorMessage = "大会ID、エントリー大会ID、大会名に一致する大会が存在しません。";
                        $entrysystemTournIdErrorMessage = "";
                        $tournNameErrorMessage = "";
                        //大会ID
                        $target_row['tournIdError'] = isset($target_row['tournId']) ? $tournIdErrorMessage : false;
                        //既存大会ID
                        $target_row['entrysystemTournIdError'] = isset($target_row['entrysystemTournId']) ? $entrysystemTournIdErrorMessage : false;
                        //大会名
                        $target_row['tournNameError'] = $tournNameErrorMessage;
                        $checkResult = false;
                    }
                }

                //レース情報の一致確認
                if ($checkResult == true) {
                    $is_race_exists = false;    //一致するレースの有無
                    //対象の大会に登録されているレース情報
                    $target_races = $t_races->getRace($input_tourn_id);
                    foreach ($target_races as $race) {
                        if (
                            $race->race_number == $target_row['raceNumber']          //レースNo.
                            && $race->race_name == $target_row['raceName']           //レース名
                            && $race->race_class_id == $target_row['raceTypeId']     //レース区分ID
                            && $race->race_class_name == $target_row['raceTypeName'] //レース区分名
                            && $race->by_group == $target_row['byGroup']             //組別
                            && $race->event_id == $target_row['eventId']             //種目ID
                            && $race->event_name == $target_row['eventName']         //種目名
                        ) {
                            //レースIDとエントリーシステムのレースIDが入力されていたら両方の一致確認
                            //いずれかが入力されていたらそれだけを一致確認
                            if (
                                (isset($target_row['raceId']) && isset($target_row['entrysystemRaceId']) && $race->race_id == $target_row['raceId'] && $race->entrysystem_race_id == $target_row['entrysystemRaceId'])
                                || (!isset($target_row['raceId']) && isset($target_row['entrysystemRaceId']) && $race->entrysystem_race_id == $target_row['entrysystemRaceId'])
                                || (isset($target_row['raceId']) && !isset($target_row['entrysystemRaceId']) && $race->race_id == $target_row['raceId'])
                            ) {
                                $is_race_exists = true;
                            }
                        }
                        //一致するレースがあればループを抜ける
                        if ($is_race_exists) {
                            break;
                        }
                    }
                    //一致の結果を確認して登録不可データかどうかを判断する
                    if (!$is_race_exists) {
                        $raceIdErrorMessage = "レースID、エントリーレースID、レースNo.、レース名、レース区分ID、レース区分名、組別、種目ID、種目名に一致するレースが存在しません。";
                        $entrysystemRaceIdErrorMessage = "";
                        $raceNumberErrorMessage = "";
                        $raceNameErrorMessage = "";
                        $raceTypeIdErrorMessage = "";
                        $raceTypeNameErrorMessage = "";
                        $byGroupErrorMessage = "";
                        $eventIdErrorMessage = "";
                        $eventNameErrorMessage = "";

                        //レースID
                        $target_row['raceIdError'] = isset($target_row['raceId']) ? $raceIdErrorMessage : false;
                        //エントリーシステムのレースID
                        $target_row['entrysystemRaceIdError'] = isset($target_row['entrysystemRaceId']) ? $entrysystemRaceIdErrorMessage : false;
                        //レースNo.                        
                        $target_row['raceNumberError'] = isset($target_row['raceNumber']) ? $raceNumberErrorMessage : false;
                        //レース名
                        $target_row['raceNameError'] = isset($target_row['raceName']) ? $raceNameErrorMessage : false;
                        //レース区分ID                        
                        $target_row['raceTypeIdError'] = isset($target_row['raceTypeId']) ? $raceTypeIdErrorMessage : false;
                        //レース区分名                        
                        $target_row['raceTypeNameError'] = isset($target_row['raceTypeName']) ? $raceTypeNameErrorMessage : false;
                        //組別
                        $target_row['byGroupError'] = isset($target_row['byGroup']) ? $byGroupErrorMessage : false;
                        //種目ID
                        $target_row['eventIdError'] = isset($target_row['eventId']) ? $eventIdErrorMessage : false;
                        //種目名                       
                        $target_row['eventNameError'] = isset($target_row['eventName']) ? $eventNameErrorMessage : false;

                        $checkResult = false;
                    }
                }
                //団体情報の一致確認
                if ($checkResult == true) {
                    //Log::debug("団体情報　チェック");
                    $is_organization_exists = false;
                    foreach ($organizations as $organization) {
                        if (!isset($target_row['orgId'])) {                     // 団体IDが未入力の場合、エントリーシステムの団体IDで一致確認
                            if (
                                $organization->entrysystem_org_id == $target_row['entrysystemOrgId']
                                && $organization->org_name == $target_row['orgName']
                            ) {
                                $is_organization_exists = true;
                                break;
                            }
                        } else if (!isset($target_row['entrysystemOrgId'])) {    // エントリーシステムの団体IDが未入力の場合、団体IDで一致確認
                            if (
                                $organization->org_id == $target_row['orgId']
                                && $organization->org_name == $target_row['orgName']
                            ) {
                                $is_organization_exists = true;
                                break;
                            }
                        } else {                                                  // 団体IDとエントリーシステムの団体IDともに入力の場合、両方で一致確認
                            if (
                                $organization->org_id == $target_row['orgId']
                                && $organization->entrysystem_org_id == $target_row['entrysystemOrgId']
                                && $organization->org_name == $target_row['orgName']
                            ) {
                                $is_organization_exists = true;
                                break;
                            }
                        }
                    }
                    if (!$is_organization_exists) {
                        $orgIdErrorMessage = "団体ID、エントリー団体コード、団体名に一致する団体が存在しません。";
                        $entrysystemOrgIdErrorMessage = "";
                        $orgNameErrorMessage = "";
                        //団体ID
                        $target_row['orgIdError'] = $orgIdErrorMessage;
                        //既存団体ID
                        $target_row['entrysystemOrgIdError'] = isset($target_row['entrysystemOrgId']) ? $entrysystemOrgIdErrorMessage : false;
                        //団体名
                        $target_row['orgNameError'] = $orgNameErrorMessage;

                        $checkResult = false;
                    }
                }
                //選手情報の一致確認
                if ($checkResult == true) {
                    $is_player_exists = false;
                    foreach ($players as $player) {
                        if (!isset($target_row['playerId'])) {                     // 選手IDが未入力の場合、JARA選手コードで一致確認
                            if (
                                $player->jara_player_id == $target_row['jaraPlayerId']
                                && $player->player_name == $target_row['playerName']
                            ) {
                                $is_player_exists = true;
                                break;
                            }
                        } else if (!isset($target_row['jaraPlayerId'])) {        // JARA選手コードが未入力の場合、選手IDで一致確認
                            if (
                                $player->player_id == $target_row['playerId']
                                && $player->player_name == $target_row['playerName']
                            ) {
                                $is_player_exists = true;
                                break;
                            }
                        } else {                                                  // 選手IDとJARA選手コードともに入力の場合、両方で一致確認
                            if (
                                $player->player_id == $target_row['playerId']
                                && $player->jara_player_id == $target_row['jaraPlayerId']
                                && $player->player_name == $target_row['playerName']
                            ) {
                                $is_player_exists = true;
                                break;
                            }
                        }
                    }
                    if (!$is_player_exists) {
                        $playerIdErrorMessage = "選手ID、JARA選手コード、選手名に一致する選手が存在しません。";
                        $jaraPlayerIdErrorMessage = "";
                        $playerNameErrorMessage = "";
                        //選手ID
                        $target_row['playerIdError'] = $playerIdErrorMessage;
                        //JARA選手コード
                        $target_row['jaraPlayerIdError'] = isset($target_row['jaraPlayerId']) ? $jaraPlayerIdErrorMessage : false;
                        //選手名
                        $target_row['playerNameError'] = $playerNameErrorMessage;

                        $checkResult = false;
                    }
                }

                if ($checkResult) {
                    //新規データか更新データかのチェック
                    $tournament_condition_array = array();   //レース結果データ検索のための条件値を格納する配列
                    $target_race_count = null;
                    //非公式大会の場合
                    if ($is_target_tournament_official == 0) {
                        Log::debug("非公式大会の場合");
                        $tournament_condition_array['tourn_id'] = $tourn_id;
                        $tournament_condition_array['race_id'] = $race_id;
                        $tournament_condition_array['player_id'] = $player_id;
                        $target_race_count = $t_raceResultRecord->getTargetUnofficialRaceCount($tournament_condition_array);
                    }
                    //公式大会の場合
                    elseif ($is_target_tournament_official == 1) {
                        Log::debug("公式大会の場合");
                        $replaceString = $this->generateCondStrOfOfficialRaceRecCnt($target_row, $tournament_condition_array); //試作中 20240419
                        $target_race_count = $t_raceResultRecord->getTargetOfficialRaceCount($tournament_condition_array, $replaceString);
                    }
                    //一致するレース結果データがあった場合
                    if ($target_race_count[0]->target_race_count > 0) {
                        $target_row['checked'] = true;
                        $target_row['loadingResult'] = "更新登録";
                    }
                    //一致するレース結果データがなかった場合
                    else {
                        $target_row['checked'] = true;
                        $target_row['loadingResult'] = "新規登録";
                    }
                }
                //checkResultがfalseのとき、不正データとする
                else {
                    $target_row['checked'] = false;
                    $target_row['loadingResult'] = "登録不可データ";
                }
            }

            Log::debug(sprintf("sendTournamentResultCsvData end"));
            return response()->json(['result' => $reqData]); //DBの結果を返す
        } catch (\Throwable $e) {
            Log::error($e);
            abort(500, $e->getMessage());
        }
    }

    //レース結果一括 登録ボタン押下 20240301
    public function registerTournamentResultCsvData(
        Request $request,
        T_tournaments $t_tournaments,
        T_races $t_races,
        T_organizations $t_organizations,
        T_players $t_players,
        T_raceResultRecord $t_raceResultRecord
    ) {
        Log::debug(sprintf("registerTournamentResultCsvData start"));
        $reqData = $request->all();

        //選択された大会ID
        $input_tourn_id = $reqData['tournData']['tournId'];
        // 対象の大会情報
        $target_tournament = $t_tournaments->getTournamentInfoFromTournId($input_tourn_id);
        // 対象の大会が公式かどうか
        $is_target_tournament_official = $target_tournament[0]->{'tourn_type'};

        //登録・更新するユーザー名を取得
        $register_user_id = Auth::user()->user_id;
        //登録・更新日時のために現在の日時を取得
        $current_datetime = now()->format('Y-m-d H:i:s.u');
        DB::beginTransaction();
        try {
            for ($rowIndex = 0; $rowIndex < count($reqData['csvDataList']); $rowIndex++) {
                //対象の行情報
                $target_row = &$reqData['csvDataList'][$rowIndex];
                if (
                    $target_row['checked'] == false
                    || ($target_row['loadingResult'] != '新規登録' && $target_row['loadingResult'] != '更新登録')
                ) {
                    continue;
                }

                //出漕結果記録テーブルに挿入する要素を格納するための配列
                $race_result_array = array();
                //入力データが公式／非公式を取得
                $is_official = $target_row['official'];
                //入力値の公式／非公式が空の場合、選択した大会の公式／非公式で補完する
                if (!isset($is_official)) {
                    $is_official = $is_target_tournament_official;
                }
                //大会情報が既に登録済みかどうかをチェック
                //大会情報の検索に必要なデータを変数に用意
                $tournament_condition_array = array();
                //対象のレース結果の件数
                $race_count = 0;
                //非公式のとき
                if ($is_official == '0') {
                    $tournament_condition_array['tourn_id'] = $target_row['tournId'];
                    $tournament_condition_array['race_id'] = $target_row['raceId'];
                    $tournament_condition_array['player_id'] = $target_row['playerId'];

                    $race_count = $t_raceResultRecord->getTargetUnofficialRaceCount($tournament_condition_array);
                }
                //公式のとき
                else {
                    // $replaceString = $this->generateConditionStringOfOfficialRaceRecordCount($target_row, $tournament_condition_array);
                    $replaceString = $this->generateCondStrOfOfficialRaceRecCnt($target_row, $tournament_condition_array); //試作中 20240419
                    $race_count = $t_raceResultRecord->getTargetOfficialRaceCount($tournament_condition_array, $replaceString);
                }
                $target_race_count = $race_count[0]->{'target_race_count'};
                if ($target_race_count == 1) {
                    Log::debug("update execute.");
                    //更新登録
                    //DBから取得したレース結果情報を格納する変数
                    $race_data = null;
                    if ($is_official == '0') {
                        //非公式のレースデータを取得
                        $race_data = $t_raceResultRecord->getTargetUnofficialRace($tournament_condition_array);
                    } else {
                        // $replace_string = $this->generateConditionStringOfOfficialRaceRecordCount($target_row, $tournament_condition_array);
                        $replace_string = $this->generateCondStrOfOfficialRaceRecCnt($target_row, $tournament_condition_array); //試作中 20240419
                        //公式のレースデータを取得
                        $race_data = $t_raceResultRecord->getTargetOfficialRace($tournament_condition_array, $replace_string);
                    }
                    //更新データの各要素を配列に格納する
                    //DBのテーブルから取得した値を格納
                    $race_result_array['tourn_id'] = $race_data[0]->{'tourn_id'};                                         //大会ID
                    $race_result_array['entrysystem_tourn_id'] = $race_data[0]->{'entrysystem_tourn_id'};                 //既存大会ID
                    $race_result_array['tourn_name'] = $race_data[0]->{'tourn_name'};                                     //大会名
                    $race_result_array['race_id'] = $race_data[0]->{'race_id'};                                           //レースID
                    $race_result_array['entrysystem_race_id'] = $race_data[0]->{'entrysystem_race_id'};                   //既存レースID
                    $race_result_array['race_number'] = $race_data[0]->{'race_number'};                                   //レースNo
                    $race_result_array['race_name'] = $race_data[0]->{'race_name'};                                       //レース名
                    $race_result_array['race_class_id'] = $target_row['raceTypeId'];                                  //レース区分ID
                    $race_result_array['race_class_name'] = $target_row['raceTypeName'];                              //レース区分名
                    $race_result_array['crew_name'] = $target_row['crewName'];                                          //クルー名
                    $race_result_array['by_group'] = $target_row['byGroup'];                                            //組別
                    $race_result_array['event_id'] = $target_row['eventId'];                                            //種目ID
                    $race_result_array['event_name'] = $target_row['eventName'];                                        //種目名
                    $race_result_array['range'] = $target_row['range'];                                                 //距離
                    $race_result_array['org_id'] = $race_data[0]->{'org_id'};                                             //団体ID
                    $race_result_array['entrysystem_org_id'] = $race_data[0]->{'entrysystem_org_id'};                     //既存団体ID
                    $race_result_array['org_name'] = $race_data[0]->{'org_name'};                                         //団体名
                    $race_result_array['player_id'] = $race_data[0]->{'player_id'};                                       //選手ID
                    $race_result_array['jara_player_id'] = $race_data[0]->{'jara_player_id'};                             //既存選手ID
                    $race_result_array['player_name'] = $race_data[0]->{'player_name'};                                   //選手名
                    $race_result_array['rank'] = $target_row['rank'];                                                   //順位
                    $race_result_array['laptime_500m'] = $target_row['fiveHundredmLaptime'];                            //500mlapタイム
                    $race_result_array['laptime_1000m'] = $target_row['tenHundredmLaptime'];                            //1000mlapタイム
                    $race_result_array['laptime_1500m'] = $target_row['fifteenHundredmLaptime'];                        //1500mlapタイム
                    $race_result_array['laptime_2000m'] = $target_row['twentyHundredmLaptime'];                         //2000mlapタイム
                    $race_result_array['final_time'] = $target_row['finalTime'];                                        //最終タイム
                    $race_result_array['stroke_rate_avg'] = $target_row['strokeRateAvg'];                               //ストロークレート(平均)
                    $race_result_array['stroke_rat_500m'] = $target_row['fiveHundredmStrokeRat'];                       //500mストロークレート
                    $race_result_array['stroke_rat_1000m'] = $target_row['tenHundredmStrokeRat'];                       //1000mストロークレート
                    $race_result_array['stroke_rat_1500m'] = $target_row['fifteenHundredmStrokeRat'];                   //1500mストロークレート
                    $race_result_array['stroke_rat_2000m'] = $target_row['twentyHundredmStrokeRat'];                    //2000mストロークレート
                    $race_result_array['heart_rate_avg'] = $target_row['heartRateAvg'];                                 //心拍数（平均）
                    $race_result_array['heart_rate_500m'] = $target_row['fiveHundredmHeartRate'];                       //500m心拍数
                    $race_result_array['heart_rate_1000m'] = $target_row['tenHundredmHeartRate'];                       //1000m心拍数
                    $race_result_array['heart_rate_1500m'] = $target_row['fifteenHundredmHeartRate'];                   //1500m心拍数
                    $race_result_array['heart_rate_2000m'] = $target_row['twentyHundredmHeartRate'];                    //2000m心拍数                        
                    $race_result_array['official'] = $is_official;                                                     //公式／非公式                        
                    $race_result_array['attendance'] = $target_row['attendance'];                                       //立会有無
                    $race_result_array['player_height'] = $target_row['playerHeight'];                                      //選手身長
                    $race_result_array['player_weight'] = $target_row['playerWeight'];                                      //選手体重
                    $race_result_array['seat_number'] = $target_row['mSeatNumber'];                                    //シート番号ID
                    $race_result_array['seat_name'] = $target_row['seatName'];                                         //シート名
                    $race_result_array['race_result_record_name'] = $target_row['raceResultRecordName'];                //出漕結果記録名
                    $race_result_array['start_datetime'] = $target_row['startDatetime'];                                //発艇日時
                    $race_result_array['weather'] = $target_row['weather'];                                             //天候
                    $race_result_array['wind_speed_2000m_point'] = $target_row['windSpeedTwentyHundredmPoint'];         //2000m地点風速
                    $race_result_array['wind_direction_2000m_point'] = $target_row['windDirectionTwentyHundredmPoint']; //2000m地点風向
                    $race_result_array['wind_speed_1000m_point'] = $target_row['windSpeedTenHundredmPoint'];            //1000m地点風速
                    $race_result_array['wind_direction_1000m_point'] = $target_row['windDirectionTenHundredmPoint'];    //1000m地点風向
                    $race_result_array['race_result_note'] = isset($target_row['race_result_note']) ? $target_row['race_result_note'] : ''; // 備考
                    $race_result_array['updated_time'] = $current_datetime; //更新日時
                    $race_result_array['user_id'] = $register_user_id; //更新ユーザーID
                    //検索条件
                    $race_result_array['race_result_record_id'] = $race_data[0]->{'race_result_record_id'};

                    //更新実行
                    $t_raceResultRecord->updateBulkRaceResultRecord($race_result_array);
                } elseif ($target_race_count == 0) {
                    Log::debug("insert execute.");
                    //未登録ならレース結果情報をinsertする
                    //大会データをテーブルから取得
                    if (isset($target_row['tournId'])) {
                        $target_tournament = $t_tournaments->getTournamentInfoFromTournId($target_row['tournId']);
                        if (isset($target_tournament)) {
                            $race_result_array['tourn_id'] = $target_tournament[0]->{'tourn_id'};                           //大会ID
                            $race_result_array['entrysystem_tourn_id'] = $target_tournament[0]->{'entrysystem_tourn_id'};   //エントリー大会ID
                            $race_result_array['tourn_name'] = $target_tournament[0]->{'tourn_name'};                       //大会名
                        } else {
                            $race_result_array['tourn_id'] = $target_row['tournId'];                                        //大会ID    
                            $race_result_array['entrysystem_tourn_id'] = $target_row['entrysystemTournId'];                 //エントリー大会ID
                            $race_result_array['tourn_name'] = $target_row['tournName'];                                    //大会名
                        }
                    } else {
                        $race_result_array['tourn_id'] = $target_row['tournId'];                                            //大会ID
                        $race_result_array['entrysystem_tourn_id'] = $target_row['entrysystemTournId'];                     //エントリー大会ID       
                        $race_result_array['tourn_name'] = $target_row['tournName'];                                        //大会名
                    }
                    //レースデータをテーブルから取得
                    if (isset($target_row['raceId'])) {
                        $target_race = $t_races->getRaceFromRaceId($target_row['raceId']);
                        if (isset($target_race)) {
                            $race_result_array['race_id'] = $target_race[0]->{'race_id'};                                   //レースID
                            $race_result_array['entrysystem_race_id'] = $target_race[0]->{'entrysystem_race_id'};           //エントリーレースID
                            $race_result_array['race_name'] = $target_race[0]->{'race_name'};                               //レース名
                            $race_result_array['race_number'] = $target_race[0]->{'race_number'};                           //レース番号
                        } else {
                            $race_result_array['race_id'] = $target_row['raceName'];                                        //レースID    
                            $race_result_array['entrysystem_race_id'] = $target_row['entrysystemRaceId'];                   //エントリーレースID
                            $race_result_array['race_name'] = $target_row['raceName'];                                      //レース名     
                            $race_result_array['race_number'] = $target_row['raceNumber'];                                  //レース番号
                        }
                    } else {
                        $race_result_array['race_id'] = $target_row['raceId'];                                              //レースID    
                        $race_result_array['entrysystem_race_id'] = $target_row['entrysystemRaceId'];                       //エントリーレースID
                        $race_result_array['race_name'] = $target_row['raceName'];                                          //レース名     
                        $race_result_array['race_number'] = $target_row['raceNumber'];                                      //レース番号    
                    }
                    //団体情報をテーブルから取得
                    if (isset($target_row['orgId'])) {
                        $target_organization = $t_organizations->getOrganization($target_row['orgId'], $register_user_id);
                        if (isset($target_organization)) {
                            $race_result_array['org_id'] = $target_organization->org_id;                                    //団体ID
                            $race_result_array['entrysystem_org_id'] = $target_organization->entrysystem_org_id;            //エントリーシステム団体ID
                            $race_result_array['org_name'] = $target_organization->org_name;                                //団体名
                        } else {
                            $race_result_array['org_id'] = $target_row['orgId'];                                            //団体ID
                            $race_result_array['entrysystem_org_id'] = $target_row['entrysystemOrgId'];                     //エントリーシステム団体ID
                            $race_result_array['org_name'] = $target_row['orgName'];                                        //団体名
                        }
                    } else {
                        $race_result_array['org_id'] = $target_row['org_id'];                                               //団体ID
                        $race_result_array['entrysystem_org_id'] = $target_row['entrysystemOrgId'];                         //エントリーシステム団体ID
                        $race_result_array['org_name'] = $target_row['orgName'];                                            //団体名
                    }
                    //選手情報をテーブルから取得
                    if (isset($target_row['playerId'])) {
                        $target_player = $t_players->getPlayer($target_row['playerId']);
                        if (isset($target_player)) {
                            $race_result_array['player_id'] = $target_player[0]->{'player_id'};                             //選手ID
                            $race_result_array['jara_player_id'] = $target_player[0]->{'jara_player_id'};                   //エントリー選手ID
                            $race_result_array['player_name'] = $target_player[0]->{'player_name'};                         //選手名
                        } else {
                            $race_result_array['player_id'] = $target_row['playerId'];                                        //選手ID    
                            $race_result_array['jara_player_id'] = $target_row['jaraPlayerId'];                             //エントリー選手ID    
                            $race_result_array['player_name'] = $target_row['playerName'];                                  //選手名    
                        }

                        //選手身長    
                        if ($target_row['playerHeight']) {
                            $race_result_array['player_height'] = $target_row['playerHeight'];
                        } else {
                            $race_result_array['player_height'] = $target_player[0]->{'height'};
                        }

                        //選手体重
                        if ($target_row['playerWeight']) {
                            $race_result_array['player_weight'] = $target_row['playerWeight'];
                        } else {
                            $race_result_array['player_weight'] = $target_player[0]->{'weight'};
                        }
                    } else {
                        $race_result_array['player_id'] = $target_row['playerId'];                                            //選手ID    
                        $race_result_array['jara_player_id'] = $target_row['jaraPlayerId'];                                 //エントリー選手ID
                        $race_result_array['player_name'] = $target_row['playerName'];                                      //選手名
                        $race_result_array['player_height'] = $target_row['playerHeight'];                                  //選手身長    
                        $race_result_array['player_weight'] = $target_row['playerWeight'];                                  //選手体重
                    }
                    //他の要素を$race_result_arrayに格納する
                    //入力データを格納
                    $race_result_array['crew_name'] = $target_row['crewName'];                                              //クルー名
                    $race_result_array['by_group'] = $target_row['byGroup'];                                                //組別
                    $race_result_array['event_id'] = $target_row['eventId'];                                                //種目ID
                    $race_result_array['event_name'] = $target_row['eventName'];                                            //種目名
                    $race_result_array['range'] = $target_row['range'];                                                     //距離
                    $race_result_array['rank'] = $target_row['rank'];                                                       //順位
                    $race_result_array['race_class_id'] = $target_row['raceTypeId'];                                        //レース区分ID
                    $race_result_array['race_class_name'] = $target_row['raceTypeName'];                                    //レース区分名
                    $race_result_array['laptime_500m'] = $target_row['fiveHundredmLaptime'];                                //500mlapタイム
                    $race_result_array['laptime_1000m'] = $target_row['tenHundredmLaptime'];                                //1000mlapタイム
                    $race_result_array['laptime_1500m'] = $target_row['fifteenHundredmLaptime'];                            //1500mlapタイム
                    $race_result_array['laptime_2000m'] = $target_row['twentyHundredmLaptime'];                             //2000mlapタイム
                    $race_result_array['final_time'] = $target_row['finalTime'];                                            //最終タイム
                    $race_result_array['stroke_rate_avg'] = $target_row['strokeRateAvg'];                                   //ストロークレート(平均)
                    $race_result_array['stroke_rat_500m'] = $target_row['fiveHundredmStrokeRat'];                           //500mストロークレート
                    $race_result_array['stroke_rat_1000m'] = $target_row['tenHundredmStrokeRat'];                           //1000mストロークレート
                    $race_result_array['stroke_rat_1500m'] = $target_row['fifteenHundredmStrokeRat'];                       //1500mストロークレート
                    $race_result_array['stroke_rat_2000m'] = $target_row['twentyHundredmStrokeRat'];                        //2000mストロークレート
                    $race_result_array['heart_rate_avg'] = $target_row['heartRateAvg'];                                     //心拍数（平均）
                    $race_result_array['heart_rate_500m'] = $target_row['fiveHundredmHeartRate'];                           //500m心拍数
                    $race_result_array['heart_rate_1000m'] = $target_row['tenHundredmHeartRate'];                           //1000m心拍数
                    $race_result_array['heart_rate_1500m'] = $target_row['fifteenHundredmHeartRate'];                       //1500m心拍数
                    $race_result_array['heart_rate_2000m'] = $target_row['twentyHundredmHeartRate'];                        //2000m心拍数
                    $race_result_array['official'] = isset($target_row['official']) ? $target_row['official'] : $is_target_tournament_official; //公式・非公式
                    $race_result_array['attendance'] = $target_row['attendance'];                                           //立会有無
                    $race_result_array['seat_number'] = $target_row['mSeatNumber'];                                        //シート番号ID
                    $race_result_array['seat_name'] = $target_row['seatName'];                                             //シート番号
                    $race_result_array['race_result_record_name'] = $target_row['raceResultRecordName'];                    //出漕結果記録名
                    $race_result_array['start_datetime'] = $target_row['startDatetime'];                                    //発艇日時
                    $race_result_array['weather'] = $target_row['weather'];                                                 //天候
                    $race_result_array['wind_speed_2000m_point'] = $target_row['windSpeedTwentyHundredmPoint'];             //2000m地点風速
                    $race_result_array['wind_direction_2000m_point'] = $target_row['windDirectionTwentyHundredmPoint'];     //2000m地点風向
                    $race_result_array['wind_speed_1000m_point'] = $target_row['windSpeedTenHundredmPoint'];                //1000m地点風速
                    $race_result_array['wind_direction_1000m_point'] = $target_row['windDirectionTenHundredmPoint'];        //1000m地点風向
                    $race_result_array['race_result_note'] = isset($target_row['race_result_note']) ? $target_row['race_result_note'] : ''; // 備考
                    //その他データを格納
                    $race_result_array['registered_time'] = $current_datetime;
                    $race_result_array['registered_user_id'] = $register_user_id;
                    $race_result_array['updated_time'] = $current_datetime;
                    $race_result_array['updated_user_id'] = $register_user_id;
                    //挿入実行
                    $t_raceResultRecord->insertBulkRaceResultRecord($race_result_array);
                }
            }
            DB::commit();
            Log::debug(sprintf("registerTournamentResultCsvData end"));
            return response()->json(['result' => true]); //DBの結果を返す
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, "レース結果一括登録に失敗しました。");
        }
    }

    //レースの検索条件を生成
    private function generateRaceSearchCondition($read_record, &$search_values)
    {
        $replace_condition_string = "";
        $search_values['race_id'] = $read_record['raceId'];           //大会ID
        $search_values['tourn_id'] = $read_record['tournId'];           //大会ID
        $search_values['event_id'] = $read_record['eventId'];           //種目ID
        $search_values['race_class_id'] = $read_record['raceTypeId'];   //レース区分ID
        $search_values['by_group'] = $read_record['byGroup'];           //組別
        $search_values['race_number'] = $read_record['raceNumber'];     //レースNo.
        //種目IDが999(その他)の場合のみ条件に入れる
        if ($read_record['eventId'] == 999) {
            $search_values['event_name'] = $read_record['eventName'];           //種目名
            $replace_condition_string .= "and event_name = :event_name\r\n";
        }
        //レース区分IDが999(その他)の場合のみ条件に入れる
        if ($read_record['raceTypeId'] == 999) {
            $search_values['race_class_name'] = $read_record['raceTypeName'];           //レース区分名
            $replace_condition_string .= "and race_class_name = :race_class_name\r\n";
        }
        return $replace_condition_string;
    }

    //公式大会のレース結果数を取得するための条件文を生成する
    private function generateConditionStringOfOfficialRaceRecordCount($target_row, &$value_array)
    {
        $condition = "";
        if (!isset($target_row['entrysystemTournId'])) {
            $condition .= "and rrr.`entrysystem_tourn_id` is null\r\n";
        } else {
            $condition .= "and rrr.`entrysystem_tourn_id` = :entrysystem_tourn_id\r\n";
            $value_array['entrysystem_tourn_id'] = $target_row['entrysystemTournId'];
        }
        if (!isset($target_row['entrysystemRaceId'])) {
            $condition .= "and rrr.`entrysystem_race_id` is null\r\n";
        } else {
            $condition .= "and rrr.`entrysystem_race_id` = :entrysystem_race_id\r\n";
            $value_array['entrysystem_race_id'] = $target_row['entrysystemRaceId'];
        }
        if (!isset($target_row['jaraPlayerId'])) {
            $condition .= "and rrr.`jara_player_id` is null\r\n";
        } else {
            $condition .= "and rrr.`jara_player_id` = :jara_player_id\r\n";
            $value_array['jara_player_id'] = $target_row['jaraPlayerId'];
        }
        return $condition;
    }

    // 公式大会のレース結果数を取得するための条件文を生成する 20240419
    // 必須入力チェックは全てOKを前提
    private function generateCondStrOfOfficialRaceRecCnt($target_row, &$value_array)
    {
        $condition = "";
        // エントリーシステムの大会IDが未入力の場合、大会IDをセット
        if (isset($target_row['entrysystemTournId'])) {
            $condition .= "and rrr.`entrysystem_tourn_id` = :entrysystem_tourn_id\r\n";
            $value_array['entrysystem_tourn_id'] = $target_row['entrysystemTournId'];
        } else {
            $condition .= "and rrr.`tourn_id` = :tourn_id\r\n";
            $value_array['tourn_id'] = $target_row['tournId'];
        }

        // エントリーシステムのレースIDが未入力の場合、レースIDをセット
        if (isset($target_row['entrysystemRaceId'])) {
            $condition .= "and rrr.`entrysystem_race_id` = :entrysystem_race_id\r\n";
            $value_array['entrysystem_race_id'] = $target_row['entrysystemRaceId'];
        } else {
            $condition .= "and rrr.`race_id` = :race_id\r\n";
            $value_array['race_id'] = $target_row['raceId'];
        }

        // JARA選手コードが未入力の場合、選手IDをセット
        if (isset($target_row['jaraPlayerId'])) {
            $condition .= "and rrr.`jara_player_id` = :jara_player_id\r\n";
            $value_array['jara_player_id'] = $target_row['jaraPlayerId'];
        } else {
            $condition .= "and rrr.`player_id` = :player_id\r\n";
            $value_array['player_id'] = $target_row['playerId'];
        }
        return $condition;
    }

    //対象の変数が整数かつX桁以内であることをチェックする
    private function checkInteger($value, $digits, &$checkResult, mixed &$cellError, string $errorMessage)
    {
        //数値かつX桁以内であることをチェック
        if (!is_numeric($value) || mb_strlen($value) > $digits) {
            $checkResult = false;
            $cellError = $errorMessage;
        }
    }

    //対象の変数が0か1であるかをチェックする
    private function checkZeroOrOne($value, &$checkResult, mixed &$cellError, string $errorMessage)
    {
        //0または1でないときは登録不可データとする
        if (!($value == '0' || $value == '1')) {
            $checkResult = false;
            $cellError = $errorMessage;
        }
    }

    //対象の変数が小数かつ指定の桁数であるかを判定する
    //整数部3桁、小数部2桁をチェックしたいときは$format="3.2"とする
    private function isDecimal($value, $format)
    {
        list($il, $dl) = explode(".", $format);

        return (bool) preg_match('/^([0-9]|([1-9][0-9]{1,' . ($il - 1) . '}))(\.[0-9]{1,' . $dl . '}){0,1}$/', $value);
    }

    //対象の変数が小数かつ指定の桁数であるかをチェックする
    private function checkDecimal($value, $format, &$checkResult, mixed &$cellError, string $errorMessage)
    {
        //小数かつ指定の桁数かチェック
        if (!($this->isDecimal($value, $format))) {
            $checkResult = false;
            $cellError = $errorMessage;
        }
    }

    //対象の変数が$byteバイト以内であることをチェックする
    private function checkWithinByte($value, $byte, &$checkResult, mixed &$cellError, string $errorMessage)
    {
        //Xバイト以内であることをチェック
        if (strlen($value) > $byte) {
            $checkResult = false;
            $cellError = $errorMessage;
        }
    }
}
