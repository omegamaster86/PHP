<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

use App\Models\T_followed_tournaments;
use App\Models\T_tournaments;
use App\Models\T_races;
use App\Models\T_raceResultRecord;
use App\Models\T_organizations;
use App\Models\T_players;
use App\Models\T_organization_staff;
use App\Models\M_venue;
use App\Models\M_events;
use Symfony\Component\HttpKernel\Exception\HttpException;

class TournamentController extends Controller
{
    // レース結果編集可能な大会情報を取得
    public function getRaceResultEditableTournamentById(Request $request, T_tournaments $TTournaments)
    {
        Log::debug(sprintf("getRaceResultEditableTournamentById start"));

        $reqData = $request->only(['tourn_id']);
        $userType = Auth::user()->user_type;

        // 管理者/JARA権限を持たないユーザーの場合は、スタッフとして所属する団体が主催する大会のみ取得
        $isOnlyStaff = substr($userType, 1, 1) == '0' && substr($userType, 2, 1) == '0';

        $result = $TTournaments->getRaceResultEditableTournamentById($reqData['tourn_id'], $isOnlyStaff);
        if (empty($result)) {
            abort(404, '存在しない、または編集権限がない大会です。');
        }

        Log::debug(sprintf("getRaceResultEditableTournamentById end"));
        return response()->json(['result' => $result]);
    }

    public function searchTournament(Request $request, T_tournaments $tTournaments, M_venue $venueData)
    {
        Log::debug(sprintf("searchTournament start"));
        $searchInfo = $request->all();
        $bindingParams = [];
        $searchCondition = $this->generateSearchCondition($searchInfo, $bindingParams);
        $tournamentList =  $tTournaments->getTournamentWithSearchCondition($searchCondition, $bindingParams);
        $venueList = $venueData->getVenueList();

        Log::debug(sprintf("searchTournament end"));
        return response()->json(['reqData' => $venueList, 'result' => $tournamentList]); //送信データ(debug用)とDBの結果を返す
        // return view('tournament.search', ["pagemode" => "search", "tournamentInfo" => $searchInfo, "tournamentList" => $tournamentList, "venueList" => $venueList]);
    }

    public function getTournaments(T_tournaments $tTournaments)
    {
        Log::debug(sprintf("getTournaments start"));
        $tournaments = $tTournaments->getTournaments();
        Log::debug(sprintf("getTournaments end"));

        return response()->json(['result' => $tournaments]);
    }

    //react 大会情報参照画面に表示するuserIDに紐づいたデータを送信 20240131
    public function getTournamentInfoData(Request $request, T_tournaments $tourn)
    {
        try {
            Log::debug(sprintf("getTournamentInfoData start"));

            $reqData = $request->all();
            Log::debug($reqData['tourn_id']);
            $result = $tourn->getTournament($reqData['tourn_id']);
            if (empty($result)) {
                abort(404, '大会情報が見つかりません。');
            }

            Log::debug(sprintf("getTournamentInfoData end"));
            return response()->json(['result' => $result]); //DBの結果を返す
        } catch (HttpException $e) {
            throw $e;
        }
    }

    // 大会のフォロー状態・フォロワー数を取得する。
    public function getTournamentFollowStatus(Request $request, T_followed_tournaments $tFollowedTournaments)
    {
        Log::debug(sprintf("getTournamentFollowStatus start"));
        $reqData = $request->all();
        $followTourn = $tFollowedTournaments->getFollowedTournamentsData($reqData['tourn_id']);
        $isFollowed = false;
        if (isset($followTourn) && $followTourn->delete_flag == 0) {
            $isFollowed = true;
        }
        $followerCount = $tFollowedTournaments->getFollowerCount($reqData['tourn_id']);
        Log::debug(sprintf("getTournamentFollowStatus end"));
        return response()->json([
            'result' => ([
                'isFollowed' => $isFollowed,
                'followerCount' => $followerCount
            ])
        ]);
    }

    //主催大会
    public function getTournamentInfoData_org(Request $request, T_tournaments $tourn)
    {
        Log::debug(sprintf("getTournamentInfoData_org start"));
        $reqData = $request->all();
        $result = $tourn->getTournamentsFromOrgId($reqData['org_id']); //DBに選手を登録 20240215
        Log::debug(sprintf("getTournamentInfoData_org end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //reactからの大会登録 20240202
    public function storeTournamentInfoData(Request $request, T_tournaments $tTournament, T_races $tRace)
    {
        Log::debug(sprintf("storeTournamentInfoData start"));
        $random_file_name = Str::random(12);
        //If new PDF is uploaded
        if ($request->hasfile('tournamentFormData')) {
            $file = $request->tournamentFormData['uploadedPDFFile'];
            $fileName = $random_file_name . '.' . $file->getClientOriginalExtension();
            try {
                if (config('app.env') === 'local') {
                    // ローカル環境ではpublic配下に保存する。
                    $destinationPath = public_path() . '/pdf/tournaments/';
                    $file->move($destinationPath, $fileName);
                } else {
                    // 本番環境ではS3にアップロードする。
                    $path = $file->storeAs('pdf/tournaments/', $fileName, 's3');
                    Log::debug('S3 Upload Path:', ['path' => $path]);
                }
            } catch (\Exception $e) {
                Log::error('File Upload Error:', ['message' => $e->getMessage()]);
            }
        }
        $reqData = $request->all();
        //確認画面から登録
        DB::beginTransaction();
        try {
            $tTournament::$tournamentInfo['tourn_name'] = $reqData['tournamentFormData']['tourn_name']; //大会名
            $tTournament::$tournamentInfo['sponsor_org_id'] = $reqData['tournamentFormData']['sponsor_org_id']; //主催団体ID
            $tTournament::$tournamentInfo['event_start_date'] = $reqData['tournamentFormData']['event_start_date']; //大会開始日
            $tTournament::$tournamentInfo['event_end_date'] = $reqData['tournamentFormData']['event_end_date']; //大会終了日 
            $tTournament::$tournamentInfo['venue_id'] = $reqData['tournamentFormData']['venue_id']; //水域ID
            $tTournament::$tournamentInfo['venue_name'] = $reqData['tournamentFormData']['venue_name']; //水域名
            $tTournament::$tournamentInfo['tourn_type'] = $reqData['tournamentFormData']['tourn_type']; //大会種別
            $tTournament::$tournamentInfo['tourn_url'] = $reqData['tournamentFormData']['tourn_url']; //大会個別URL
            // $tTournament::$tournamentInfo['tourn_info_faile_path'] = $reqData['tournamentFormData']['tourn_info_faile_path']; //大会要項PDFファイル
            //If new PDF is uploaded
            if ($request->hasfile('tournamentFormData')) {
                $file_name = $random_file_name . '.' . $request->tournamentFormData['uploadedPDFFile']->getClientOriginalExtension();
                $tTournament::$tournamentInfo['tourn_info_faile_path'] = $file_name; //PDFファイル
            } else {
                //If  PDF is not uploaded
                $tTournament::$tournamentInfo['tourn_info_faile_path'] = $reqData['tournamentFormData']['tourn_info_faile_path']; //PDFファイル
            }


            $tTournament::$tournamentInfo['entrysystem_tourn_id'] = $reqData['tournamentFormData']['entrysystem_tourn_id']; //エントリーシステムの大会ID
            $result = $tTournament->insertTournaments($tTournament::$tournamentInfo); //Insertを実行して、InsertしたレコードのID（主キー）を返す

            if (isset($reqData['tableData'])) { //レースに関するデータが存在する場合登録する
                //レース登録リスト行数分登録する
                for ($i = 0; $i < count($reqData['tableData']); $i++) {
                    $tRace::$racesData['race_number'] = $reqData['tableData'][$i]['race_number']; //レース番号
                    $tRace::$racesData['entrysystem_race_id'] = $reqData['tableData'][$i]['entrysystem_race_id']; //エントリーシステムのレースID
                    $tRace::$racesData['tourn_id'] = $result; //大会IDに紐づける
                    $tRace::$racesData['race_name'] = $reqData['tableData'][$i]['race_name']; //レース名
                    $tRace::$racesData['event_id'] = $reqData['tableData'][$i]['event_id']; //イベントID
                    $tRace::$racesData['event_name'] = $reqData['tableData'][$i]['event_name']; //イベント名
                    if ($reqData['tableData'][$i]['event_id'] == "999" && isset($reqData['tableData'][$i]['otherEventName'])) {
                        $tRace::$racesData['event_name'] = $reqData['tableData'][$i]['otherEventName'];
                    } else {
                        $tRace::$racesData['event_name'] = $reqData['tableData'][$i]['event_name'];
                    }

                    $tRace::$racesData['race_class_id'] = $reqData['tableData'][$i]['race_class_id']; //レース区分ID
                    if ($reqData['tableData'][$i]['race_class_id'] == "999" && isset($reqData['tableData'][$i]['otherRaceClassName'])) {
                        $tRace::$racesData['race_class_name'] = $reqData['tableData'][$i]['otherRaceClassName'];
                    } else {
                        $tRace::$racesData['race_class_name'] = $reqData['tableData'][$i]['race_class_name'];
                    }

                    $tRace::$racesData['by_group'] = $reqData['tableData'][$i]['by_group']; //レース区分
                    $tRace::$racesData['range'] = $reqData['tableData'][$i]['range']; //距離
                    $tRace::$racesData['start_date_time'] = $reqData['tableData'][$i]['start_date_time']; //発艇日時
                    $tRace->insertRaces($tRace::$racesData); //レーステーブルの挿入
                }
            }

            DB::commit();
            Log::debug(sprintf("storeTournamentInfoData end"));
            return response()->json(['reqData' => $reqData, 'result' => $result]); //送信データ(debug用)とDBの結果を返す
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, "失敗しました。大会登録できませんでした。"); //エラーメッセージを返す
        }
    }

    //大会更新 20240202
    public function updateTournamentInfoData(Request $request, T_tournaments $tTournament, T_races $tRace)
    {
        Log::debug(sprintf("updateTournamentInfoData start"));

        try {
            DB::beginTransaction();

            $random_file_name = Str::random(12);
            //If new PDF is uploaded
            if ($request->hasfile('tournamentFormData')) {
                $file = $request->tournamentFormData['uploadedPDFFile'];
                $fileName = $random_file_name . '.' . $file->getClientOriginalExtension();
                try {
                    if (config('app.env') === 'local') {
                        // ローカル環境ではpublic配下に保存する。
                        $destinationPath = public_path() . '/pdf/tournaments/';
                        $file->move($destinationPath, $fileName);
                    } else {
                        // 本番環境ではS3にアップロードする。
                        $path = $file->storeAs('pdf/tournaments/', $fileName, 's3');
                        Log::debug('S3 Upload Path:', ['path' => $path]);
                    }
                } catch (\Exception $e) {
                    Log::error('File Upload Error:', ['message' => $e->getMessage()]);
                }
            }
            $reqData = $request->all();

            //確認画面から登録
            $tTournament::$tournamentInfo['tourn_id'] = $reqData['tournamentFormData']['tourn_id']; //大会ID
            $tTournament::$tournamentInfo['tourn_name'] = $reqData['tournamentFormData']['tourn_name']; //大会名
            $tTournament::$tournamentInfo['sponsor_org_id'] = $reqData['tournamentFormData']['sponsor_org_id']; //主催団体ID
            $tTournament::$tournamentInfo['event_start_date'] = $reqData['tournamentFormData']['event_start_date']; //大会開始日
            $tTournament::$tournamentInfo['event_end_date'] = $reqData['tournamentFormData']['event_end_date']; //大会終了日 
            $tTournament::$tournamentInfo['venue_id'] = $reqData['tournamentFormData']['venue_id']; //水域ID
            $tTournament::$tournamentInfo['venue_name'] = $reqData['tournamentFormData']['venue_name']; //水域名
            $tTournament::$tournamentInfo['tourn_type'] = $reqData['tournamentFormData']['tourn_type']; //Tourn type
            $tTournament::$tournamentInfo['tourn_url'] = $reqData['tournamentFormData']['tourn_url']; //Tourn URL
            $tTournament::$tournamentInfo['entrysystem_tourn_id'] = $reqData['tournamentFormData']['entrysystem_tourn_id']; //エントリーシステムの大会ID
            //If new PDF is uploaded
            if ($request->hasfile('tournamentFormData')) {
                $file_name = $random_file_name . '.' . $request->tournamentFormData['uploadedPDFFile']->getClientOriginalExtension();
                $tTournament::$tournamentInfo['tourn_info_faile_path'] = $file_name; //PDFファイル
            } else {
                //If  PDF is not uploaded
                $tTournament::$tournamentInfo['tourn_info_faile_path'] = $reqData['tournamentFormData']['tourn_info_faile_path'] ?? ''; //PDFファイル
            }
            $tTournament->updateTournaments($tTournament::$tournamentInfo);

            if (empty($reqData['tableData'] ?? [])) {
                return response()->json("success", 200);
            } else {
                //レース登録リスト行数分登録する
                for ($i = 0; $i < count($reqData['tableData']); $i++) {
                    $tRace::$racesData['race_number'] = $reqData['tableData'][$i]['race_number']; //レース番号
                    if (isset($reqData['tableData'][$i]['entrysystem_race_id'])) {
                        $tRace::$racesData['entrysystem_race_id'] = $reqData['tableData'][$i]['entrysystem_race_id']; //エントリーシステムのレースID
                    } else {
                        $tRace::$racesData['entrysystem_race_id'] = null;
                    }
                    $tRace::$racesData['tourn_id'] = $reqData['tableData'][$i]['tourn_id']; //大会IDに紐づける
                    $tRace::$racesData['race_name'] = $reqData['tableData'][$i]['race_name']; //レース名

                    $tRace::$racesData['event_id'] = $reqData['tableData'][$i]['event_id']; //イベントID
                    if ($reqData['tableData'][$i]['event_id'] == "999" && isset($reqData['tableData'][$i]['otherEventName'])) {
                        $tRace::$racesData['event_name'] = $reqData['tableData'][$i]['otherEventName'];
                    } else {
                        $tRace::$racesData['event_name'] = $reqData['tableData'][$i]['event_name'];
                    }

                    $tRace::$racesData['race_class_id'] = $reqData['tableData'][$i]['race_class_id']; //レース区分ID
                    if ($reqData['tableData'][$i]['race_class_id'] == "999" && isset($reqData['tableData'][$i]['otherRaceClassName'])) {
                        $tRace::$racesData['race_class_name'] = $reqData['tableData'][$i]['otherRaceClassName'];
                    } else {
                        $tRace::$racesData['race_class_name'] = $reqData['tableData'][$i]['race_class_name'];
                    }

                    $tRace::$racesData['by_group'] = $reqData['tableData'][$i]['by_group']; //レース区分
                    $tRace::$racesData['range'] = $reqData['tableData'][$i]['range']; //距離
                    $tRace::$racesData['start_date_time'] = $reqData['tableData'][$i]['start_date_time']; //発艇日時

                    if (!isset($reqData['tableData'][$i]['checked'])) { //削除フラグが存在しない場合、更新データ
                        $tRace::$racesData['delete_flag'] = 0;
                    } else if ($reqData['tableData'][$i]['checked'] == 'true') { //削除フラグがtrueの場合、削除対象
                        $tRace::$racesData['delete_flag'] = 1;
                    } else {
                        $tRace::$racesData['delete_flag'] = 0;
                    }

                    if (isset($reqData['tableData'][$i]['race_id'])) {
                        $tRace::$racesData['race_id'] = $reqData['tableData'][$i]['race_id'];
                        $tRace->updateRaces($tRace::$racesData); //レースIDが存在する場合、更新処理
                        Log::debug("race update");
                    } else {
                        $tRace->insertRaces($tRace::$racesData); //レースIDが存在しない場合、挿入処理
                        Log::debug("race insert");
                    }
                }
            }

            DB::commit();
            Log::debug(sprintf("updateTournamentInfoData end"));
            return response()->json(['reqData' => $reqData]); //DBの結果を返す
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, "失敗しました。大会更新できませんでした。"); //エラーメッセージを返す
        }
    }

    //react 選手情報参照画面に表示するuserIDに紐づいたデータを送信 20240131
    public function getRaceData(Request $request, T_races $tRace)
    {
        Log::debug(sprintf("getRaceData start"));
        $reqData = $request->all();
        $result = $tRace->getRaces($reqData); //レース情報を取得
        if (isset($result)) {
            for ($i = 0; $i < count($result); $i++) {
                $result[$i]->id = $i;
            }
        }
        Log::debug(sprintf("getRaceData end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //レース結果参照画面に表示する用 20240216
    public function getTournRaceResultRecords(Request $request, T_raceResultRecord $tRaceResultRecord)
    {
        Log::debug(sprintf("getTournRaceResultRecords start"));
        $reqData = $request->all();
        $result = $tRaceResultRecord->getRaceResultRecord_raceId($reqData['race_id']);

        if (empty($result)) {
            abort(404, 'レース結果情報が見つかりません。');
        }

        //ラップタイムをsss.msからmm:ss.msに変換 20240423
        for ($result_index = 0; $result_index < count($result); $result_index++) {
            $result[$result_index]->{"laptime_500m"} = $this->convertToTimeFormat($result[$result_index]->{"laptime_500m"});
            $result[$result_index]->{"laptime_1000m"} = $this->convertToTimeFormat($result[$result_index]->{"laptime_1000m"});
            $result[$result_index]->{"laptime_1500m"} = $this->convertToTimeFormat($result[$result_index]->{"laptime_1500m"});
            $result[$result_index]->{"laptime_2000m"} = $this->convertToTimeFormat($result[$result_index]->{"laptime_2000m"});
            $result[$result_index]->{"final_time"} = $this->convertToTimeFormat($result[$result_index]->{"final_time"});
        }

        Log::debug(sprintf("getTournRaceResultRecords end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //クルー情報取得 20240216
    public function getCrewData(Request $request, T_raceResultRecord $tRaceResultRecord)
    {
        Log::debug(sprintf("getCrewData start"));
        $reqData = $request->all();
        foreach ($reqData as $key => $val) { //foreachで取り出す配列と要素の値を格納する変数を指定する。
            if ($key == 'race_id' || $key == 'crew_name' || $key == 'org_id') {
                continue;
            }
            unset($reqData[$key]);
        }

        $search_values = array();
        $search_values['race_id'] = $reqData['race_id'];
        $search_values['crew_name'] = $reqData['crew_name'];
        $search_values['org_id'] = $reqData['org_id'];

        $result = $tRaceResultRecord->getCrews($search_values);
        Log::debug(sprintf("getCrewData end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //レース結果情報を削除（update delete_flag)する 20240520
    public function updateDeleteFlagOfRaceResultRecord(Request $request, T_raceResultRecord $t_raceResultRecord)
    {
        Log::debug(sprintf("updateDeleteFlagOfRaceResultRecord start"));
        include('Auth/ErrorMessages/ErrorMessages.php');
        try {
            DB::beginTransaction();
            //出漕結果記録テーブルを検索
            $reqData = $request->all();

            //レース結果の削除チェックを行う 20240529
            $result_count = $t_raceResultRecord->getIsExistsTargetRaceResult($reqData['raceInfo']['race_id']);
            if ($result_count == 0) {
                return response()->json(['errMessage' => "当該レースの結果は、ほかのユーザーによって削除されています。"]); //エラーメッセージを返す
            }

            // $reqData['updated_datetime'] = now()->format('Y-m-d H:i:s.u');
            // $reqData['updated_user_id'] = Auth::user()->user_id;
            for ($i = 0; $i < count($reqData['raceResultRecords']); $i++) {
                for ($j = 0; $j < count($reqData['raceResultRecords'][$i]['crewPlayer']); $j++) {
                    $delete_race_result_record_id = $reqData['raceResultRecords'][$i]['crewPlayer'][$j]['race_result_record_id'];
                    $result_count = $t_raceResultRecord->getIsExistsTargetRaceResultRecord($delete_race_result_record_id);

                    if (isset($result_count)) {
                        $deleteDataInfo['updated_datetime'] = now()->format('Y-m-d H:i:s.u');
                        $deleteDataInfo['updated_user_id'] = Auth::user()->user_id;
                        $deleteDataInfo['race_result_record_id'] = $delete_race_result_record_id;
                        $t_raceResultRecord->updateDeleteFlagToValid($deleteDataInfo);
                    }
                }
            }
            DB::commit();
            Log::debug(sprintf("updateDeleteFlagOfRaceResultRecord end"));
            return response()->json(['result' => 'success']);
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            Log::debug(sprintf("updateDeleteFlagOfRaceResultRecord end"));
            abort(500, $e->getMessage());
        }
    }

    //DBから大会情報を削除する 20240309
    public function deleteTournamentData(Request $request, T_tournaments $tTournament, T_races $tRace)
    {
        Log::debug(sprintf("deleteTournamentData start"));
        DB::beginTransaction();
        try {
            $reqData = $request->all();
            Log::debug($reqData['tournamentFormData']['tourn_id']);

            if (isset($reqData['tournamentFormData']['tourn_id'])) {
                $tTournament->updateDeleteFlag($reqData['tournamentFormData']['tourn_id']); //大会情報の削除
                $tRace->updateDeleteFlagToValid($reqData['tournamentFormData']['tourn_id']); //レース情報の削除 20240403
                DB::commit();
            } else {
                DB::commit();
                //結果が存在しないとき
                Log::debug(sprintf("deleteTournamentData end"));
                return response()->json(['errMessage' => "エラーメッセージ"]); //エラーメッセージを返す
            }
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, $e->getMessage());
        }
        Log::debug(sprintf("deleteTournamentData end"));
        return response()->json(['result' => $reqData]); //DBの結果を返す
    }

    //エントリーシステム大会ID、団体ID、エントリーシステムレースID、レースNoのバリデーションチェック
    public function tournamentRegistOrUpdateValidationCheck(
        Request $request,
        T_tournaments $t_tournaments,
        T_organizations $t_organizations,
        T_races $t_races
    ) {
        Log::debug(sprintf("tournamentRegistOrUpdateValidationCheck start"));
        $reqData = $request->all();
        //エントリーシステム大会ID
        $mode = $reqData["mode"];   //入力モード
        $entrysystem_tourn_id = $reqData["entrysystem_tourn_id"];
        $userId = Auth::user()->user_id;

        //大会登録の場合、tourn_idは登録時点で存在しないため、条件分岐を追加 20240408
        if ($mode == "update" && isset($reqData["tourn_id"])) {
            $tourn_id = $reqData["tourn_id"];
        }

        if (isset($entrysystem_tourn_id)) {
            //エントリーシステム大会IDが重複する大会を取得
            //更新画面では自身の大会IDを除く
            if ($mode === "create") {
                $duplicate_tournnaments = $t_tournaments->getEntrysystemTournIdDuplicateRecord($entrysystem_tourn_id);
            } elseif ($mode === "update") {
                $duplicate_tournnaments = $t_tournaments->getEntrysystemTournIdDuplicateRecordWithTournId($entrysystem_tourn_id, $tourn_id);
            }
            //重複する大会があればエラーとする
            if (count($duplicate_tournnaments) > 0) {
                $errMessage = "入力されたエントリーシステムの大会IDは、既に別の大会で使用されています。\r\n";
                foreach ($duplicate_tournnaments as $tourn) {
                    $errMessage .= "[大会ID " . $tourn->{"tourn_id"} . "]：[大会名 " . $tourn->{"tourn_name"} . "]\r\n";
                }
                return response()->json(["response_entrysystem_tourn_id" => $errMessage], 403);
            }
        }
        //主催団体ID
        $sponsor_org_id = $reqData["sponsor_org_id"];
        $target_organization = $t_organizations->getOrganization($sponsor_org_id, $userId);
        //主催団体IDに該当する団体が取得できなければエラーとする
        if (empty($target_organization)) {
            Log::debug("主催団体IDに該当する団体が存在しない.");
            $errMessage = "[主催団体ID " . $sponsor_org_id . "]の団体は、既にシステムより削除されているか、本登録されていない団体IDが入力されています。";
            return response()->json(["response_org_id" => $errMessage], 403);
        } else {
            $reqData["org_name"] = $target_organization->org_name;
        }
        //大会種別を確認する
        //JARA、県ボのどちらかが正式なら正式
        $tourn_type = $reqData["tourn_type"];
        //大会種別=公式、かつ団体種別=任意はエラーとする
        $org_type_name = $target_organization->orgTypeName;
        if ($tourn_type == 1 && $org_type_name == "任意") {
            $errMessage = "[団体ID " . $sponsor_org_id . "]：[団体名 " . $target_organization->org_name . "]は、任意団体の為、公式大会を主催することはできません。";
            return response()->json(["response_org_id" => $errMessage], 403);
        }
        //エントリーシステムレースID
        $error_entrysystem_race_id_array = array();
        foreach ($reqData["race_data"] as $race_data) {
            if (!isset($race_data["checked"]) || $race_data["checked"] === false) {
                $target_race_id = $race_data["race_id"];
                $entrysystem_race_id = $race_data["entrysystem_race_id"];
                if (isset($entrysystem_race_id)) {
                    $count = 0;
                    if ($mode === "create") {
                        $count = $t_races->getEntrysystemRaceIdCount($entrysystem_race_id);
                    } elseif ($mode === "update") {
                        $count = $t_races->getEntrysystemRaceIdCountWithRaceId($entrysystem_race_id, $target_race_id);
                    }

                    if ($count > 0) {
                        //エラーとなったエントリーシステムレースIDを配列に格納
                        array_push($error_entrysystem_race_id_array, $entrysystem_race_id);
                    }
                }
            }
        }
        //エラーとしたエントリーシステムレースIDが配列に格納されていたらエラーとする
        if (count($error_entrysystem_race_id_array) > 0) {
            $errorEntrysystemRaceIds = implode(",", $error_entrysystem_race_id_array);
            $errMessage = "エントリーシステムのレースID " . $errorEntrysystemRaceIds . " が重複しています。\r\n";
            return response()->json(["response_race_id" => $errMessage], 403);
        }
        Log::debug(sprintf("tournamentRegistOrUpdateValidationCheck end."));
        return response()->json(["success" => $reqData], 200); //登録できる
    }

    //レース結果管理画面
    //レース結果検索
    public function searchRaceData(Request $request, T_races $t_races)
    {
        Log::debug(sprintf("searchRaceData start."));
        $reqData = $request->all();
        $values = array();
        //検索条件の文字列を生成
        $conditionString = $this->generateRaceSearchCondition($reqData, $values);
        $getData = $t_races->getRaceResultWithCondition($conditionString, $values);
        Log::debug(sprintf("searchRaceData end."));
        return response()->json(['result' => $getData]); //DBの結果を返す
    }

    //レース結果入力確認画面
    //レース結果情報を登録する
    public function registerRaceResultRecordForRegisterConfirm(
        Request $request,
        T_raceResultRecord $t_raceResultRecord,
        T_players $t_players,
        T_races $t_races,
        T_tournaments $t_tournaments,
        T_organizations $t_organizations
    ) {
        Log::debug(sprintf("registerRaceResultRecord start."));
        $reqData = $request->all();
        //挿入時の値を格納する配列
        $insert_values = array();
        //日時 登録用
        $current_datetime = now()->format('Y-m-d H:i:s.u');
        //ユーザーID　登録用
        $update_user_id = Auth::user()->user_id;
        //入力値
        $raceInfo = &$reqData['raceInfo'];
        $raceResultRecordResponse = &$reqData['raceResultRecordResponse'];
        $raceResultRecords = &$reqData['raceResultRecords'];
        DB::beginTransaction();
        try {
            //レース結果の重複チェックを行う 20240529
            $result_count = $t_raceResultRecord->getIsExistsTargetRaceResult($reqData['raceInfo']['race_id']);
            if ($result_count > 0) {
                return response()->json(['errMessage' => "当該レースの結果は、既にほかのユーザーによって登録されています。"]); //エラーメッセージを返す
            }

            //raceInfoからレース情報を取得
            //レースID
            $race_id = $raceInfo["race_id"];
            $insert_values["race_id"] = isset($race_id) ? $race_id : null;
            //レース名
            $insert_values["race_name"] = isset($raceInfo["race_name"]) ? $raceInfo["race_name"] : null;
            //レースNo.
            $insert_values["race_number"] = isset($raceInfo["race_number"]) ? $raceInfo["race_number"] : null;
            //レース区分ID
            $insert_values["race_class_id"] = isset($raceInfo["race_class_id"]) ? $raceInfo["race_class_id"] : null;
            //レース区分名
            $insert_values["race_class_name"] = isset($raceInfo["race_class_name"]) ? $raceInfo["race_class_name"] : null;
            //組別
            $insert_values["by_group"] = isset($raceInfo["by_group"]) ? $raceInfo["by_group"] : null;
            //種目ID
            $insert_values["event_id"] = isset($raceInfo["event_id"]) ? $raceInfo["event_id"] : null;
            //種目名
            $insert_values["event_name"] = isset($raceInfo["event_name"]) ? $raceInfo["event_name"] : null;
            //距離
            $insert_values["range"] = isset($raceInfo["range"]) ? $raceInfo["range"] : null;
            //大会ID
            $tourn_id = isset($raceInfo["tourn_id"]) ? $raceInfo["tourn_id"] : null;
            $insert_values["tourn_id"] = $tourn_id;
            //対象の大会データ
            //getTournamentは取得した0番目だけを返す
            $target_tourn_info = $t_tournaments->getTournament($tourn_id);
            //大会名
            $tourn_name = isset($target_result["tourn_name"]) ? $target_result["tourn_name"] : null;
            if (empty($tourn_name)) {
                $tourn_name = $target_tourn_info->tourn_name;
            }
            $insert_values["tourn_name"] = $tourn_name;
            //出漕時点情報
            //発艇日時
            $insert_values["start_datetime"] = isset($raceResultRecordResponse["startDateTime"]) ? $raceResultRecordResponse["startDateTime"] : null;
            //天候
            $insert_values["weather"] = isset($raceResultRecordResponse["weatherId"]) ? $raceResultRecordResponse["weatherId"] : null;
            //2000m地点風速
            $insert_values["wind_speed_2000m_point"] = isset($raceResultRecordResponse["wind_speed_2000m_point"]) ? $raceResultRecordResponse["wind_speed_2000m_point"] : null;
            //2000m地点風向
            $insert_values["wind_direction_2000m_point"] = isset($raceResultRecordResponse["wind_direction_2000m_point"]) ? $raceResultRecordResponse["wind_direction_2000m_point"] : null;
            //1000m地点風速
            $insert_values["wind_speed_1000m_point"] = isset($raceResultRecordResponse["wind_speed_1000m_point"]) ? $raceResultRecordResponse["wind_speed_1000m_point"] : null;
            //1000m地点風向
            $insert_values["wind_direction_1000m_point"] = isset($raceResultRecordResponse["wind_direction_1000m_point"]) ? $raceResultRecordResponse["wind_direction_1000m_point"] : null;
            //公式/非公式
            if (isset($target_tourn_info)) {
                if ($target_tourn_info->tournTypeName == "非公式") {
                    $insert_values["official"] = 0;
                } elseif ($target_tourn_info->tournTypeName == "公式") {
                    $insert_values["official"] = 1;
                } else {
                    $insert_values["official"] = null;
                }
            } else {
                $insert_values["official"] = null;
            }
            //raceResultRecordsをループで渡す
            for ($record_index = 0; $record_index < count($raceResultRecords); $record_index++) {
                $target_result = $raceResultRecords[$record_index];
                $crew_player = $target_result["crewPlayer"];
                //全crewPlayer共通の値を配列に格納
                //エントリーシステム大会ID
                $entrysystem_tourn_id = isset($target_result["entrysystem_tourn_id"]) ? $target_result["entrysystem_tourn_id"] : null;
                $insert_values["entrysystem_tourn_id"] = $entrysystem_tourn_id;
                //団体ID
                $org_id = isset($target_result["org_id"]) ? $target_result["org_id"] : null;
                $insert_values["org_id"] = $org_id;
                //エントリーシステム団体ID
                $entrysystem_org_id = isset($target_result["entrysystem_org_id"]) ? $target_result["entrysystem_org_id"] : null;
                $insert_values["entrysystem_org_id"] = $entrysystem_org_id;
                //団体名
                $insert_values["org_name"] = isset($target_result["orgName"]) ? $target_result["orgName"] : null;
                //クルー名
                $insert_values["crew_name"] = isset($target_result["crew_name"]) ? $target_result["crew_name"] : null;
                //レーンNo.
                $insert_values["lane_number"] = isset($target_result["lane_number"]) ? $target_result["lane_number"] : null;
                //順位
                $insert_values["rank"] = isset($target_result["rank"]) ? $target_result["rank"] : null;
                //500mlapタイム
                $laptime_500m = isset($target_result["laptime_500m"]) ? $target_result["laptime_500m"] : null;
                $insert_values["laptime_500m"] = isset($laptime_500m) ? $this->convertTimeToFloat($laptime_500m) : null;
                //1000mlapタイム
                $laptime_1000m = isset($target_result["laptime_1000m"]) ? $target_result["laptime_1000m"] : null;
                $insert_values["laptime_1000m"] = isset($laptime_1000m) ? $this->convertTimeToFloat($laptime_1000m) : null;
                //1500mlapタイム
                $laptime_1500m = isset($target_result["laptime_1500m"]) ? $target_result["laptime_1500m"] : null;
                $insert_values["laptime_1500m"] = isset($laptime_1500m) ? $this->convertTimeToFloat($laptime_1500m) : null;
                //2000mlapタイム
                $laptime_2000m = isset($target_result["laptime_2000m"]) ? $target_result["laptime_2000m"] : null;
                $insert_values["laptime_2000m"] = isset($laptime_2000m) ? $this->convertTimeToFloat($laptime_2000m) : null;
                //最終タイム
                $final_time = isset($target_result["final_time"]) ? $target_result["final_time"] : null;
                $insert_values["final_time"] = isset($final_time) ? $this->convertTimeToFloat($final_time) : null;
                //ストロークレート平均
                $insert_values["stroke_rate_avg"] = isset($target_result["stroke_rate_avg"]) ? $target_result["stroke_rate_avg"] : null;
                //500mストロークレート
                $insert_values["stroke_rat_500m"] = isset($target_result["stroke_rat_500m"]) ? $target_result["stroke_rat_500m"] : null;
                //1000mストロークレート
                $insert_values["stroke_rat_1000m"] = isset($target_result["stroke_rat_1000m"]) ? $target_result["stroke_rat_1000m"] : null;
                //1500mストロークレート
                $insert_values["stroke_rat_1500m"] = isset($target_result["stroke_rat_1500m"]) ? $target_result["stroke_rat_1500m"] : null;
                //2000mストロークレート
                $insert_values["stroke_rat_2000m"] = isset($target_result["stroke_rat_2000m"]) ? $target_result["stroke_rat_2000m"] : null;
                //備考
                $insert_values['race_result_note'] = isset($target_result['race_result_note']) ? $target_result['race_result_note'] : ''; // 備考
                //登録日時
                $insert_values["registered_time"] = $current_datetime;
                //登録ユーザーID
                $insert_values["registered_user_id"] = $update_user_id;
                //更新日時
                $insert_values["updated_time"] = $current_datetime;
                //更新ユーザーID
                $insert_values["updated_user_id"] = $update_user_id;
                //削除フラグ
                $insert_values["delete_flag"] = 0;
                //エントリー団体IDが空のとき
                //団体テーブルから団体IDを取得して団体情報を取得
                //取得した団体情報からエントリー団体IDを取得
                if (empty($entrysystem_org_id) && isset($org_id)) {
                    $target_org_info = $t_organizations->getOrganization($org_id, $update_user_id);
                    //getOrganizationは取得した0番目だけを返す
                    if (isset($target_org_info)) {
                        $insert_values["entrysystem_org_id"] = $target_org_info->entrysystem_org_id;
                    }
                }
                //エントリー大会IDが空のとき
                //レーステーブルから大会IDを取得して大会情報を取得
                //取得した大会情報からエントリー大会IDを取得
                if (empty($entrysystem_tourn_id) && isset($tourn_id)) {
                    $target_tourn_info = $t_tournaments->getTournament($tourn_id);
                    //getTournamentは取得した0番目だけを返す
                    if (isset($target_tourn_info)) {
                        $insert_values["entrysystem_tourn_id"] = $target_tourn_info->entrysystem_tourn_id;
                    }
                }
                //選手情報を取得
                foreach ($crew_player as $player) {
                    if (!$player["deleteFlg"]) {
                        //選手の情報を配列に格納
                        //選手ID
                        $player_id = isset($player["playerId"]) ? $player["playerId"] : null;
                        $insert_values["player_id"] = $player_id;
                        //jara選手コード
                        $jara_player_id = isset($player["jaraPlayerId"]) ? $player["jaraPlayerId"] : null;
                        $insert_values["jara_player_id"] = $jara_player_id;
                        //エントリーシステムレースID
                        $entrysystem_race_id = isset($player["entrysystemRaceId"]) ? $player["entrysystemRaceId"] : null;
                        $insert_values["entrysystem_race_id"] = $entrysystem_race_id;
                        //選手名
                        $insert_values["player_name"] = isset($player["playerName"]) ? $player["playerName"] : null;
                        //選手身長
                        $insert_values["player_height"] = isset($player["height"]) ? $player["height"] : null;
                        //選手体重
                        $insert_values["player_weight"] = isset($player["weight"]) ? $player["weight"] : null;
                        //シート番号
                        $insert_values["seat_number"] = isset($player["seatNameId"]) ? $player["seatNameId"] : null;
                        //シート名
                        $insert_values["seat_name"] = isset($player["seatName"]) ? $player["seatName"] : null;
                        //心拍数(平均)
                        $insert_values["heart_rate_avg"] = isset($player["heartRateAvg"]) ? $player["heartRateAvg"] : null;
                        //500m心拍数
                        $insert_values["heart_rate_500m"] = isset($player["fiveHundredmHeartRate"]) ? $player["fiveHundredmHeartRate"] : null;
                        //1000m心拍数
                        $insert_values["heart_rate_1000m"] = isset($player["tenHundredmHeartRate"]) ? $player["tenHundredmHeartRate"] : null;
                        //1500m心拍数
                        $insert_values["heart_rate_1500m"] = isset($player["fifteenHundredmHeartRate"]) ? $player["fifteenHundredmHeartRate"] : null;
                        //2000m心拍数
                        $insert_values["heart_rate_2000m"] = isset($player["twentyHundredmHeartRate"]) ? $player["twentyHundredmHeartRate"] : null;
                        //立ち会い有無
                        //変数が無ければnull
                        //入力値がtrueなら1、falseなら0とする
                        $insert_values["attendance"] = isset($player["attendance"]) ? ($player["attendance"] ? 1 : 0) : null;
                        //jara_player_idが空のとき
                        //選手テーブルからjara_player_idを取得
                        if (empty($jara_player_id)) {
                            $target_player_info = $t_players->getPlayer($player_id);
                            if (isset($target_player_info)) {
                                $insert_values["jara_player_id"] = $target_player_info[0]->{"jara_player_id"};
                            }
                        }
                        //エントリーレースIDが空のとき
                        //レーステーブルからエントリーレースIDを取得
                        if (empty($player->entrysystemRaceId)) {
                            $target_race_info = $t_races->getRaceFromRaceId($race_id);
                            if (isset($target_race_info)) {
                                $insert_values["entrysystem_race_id"] = $target_race_info[0]->{"entrysystem_race_id"};
                            }
                        }
                        //登録処理
                        $t_raceResultRecord->insertRaceResultRecordForInputConfirm($insert_values);
                    }
                }
            }
            DB::commit();
            Log::debug(sprintf("registerRaceResultRecord end."));
            return response()->json(['result' => true]); //DBの結果を返す
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, $e->getMessage());
        }
    }

    //レース結果更新確認画面
    //レース結果更新確認画面で更新処理を実行する
    public function updateRaceResultRecordForUpdateConfirm(
        Request $request,
        T_raceResultRecord $t_raceResultRecord,
        T_players $t_players,
        T_tournaments $t_tournaments,
        T_organizations $t_organizations
    ) {
        Log::debug(sprintf("updateRaceResultRecordForUpdateConfirm start."));
        $reqData = $request->all();
        //日時　更新用
        $current_datetime = now()->format('Y-m-d H:i:s.u');
        //ユーザーID　更新用
        $update_user_id = Auth::user()->user_id;
        //画面からの入力値を変数に格納
        $raceInfo = &$reqData['raceInfo'];
        $raceResultRecordResponse = &$reqData['raceResultRecordResponse'];
        $raceResultRecords = &$reqData['raceResultRecords'];
        DB::beginTransaction();
        try {
            //レース結果の削除チェックを行う 20240529
            $result_count = $t_raceResultRecord->getIsExistsTargetRaceResult($reqData['raceInfo']['race_id']);
            if ($result_count == 0) {
                return response()->json(['errMessage' => "当該レースの結果は、ほかのユーザーによって削除されています。"]); //エラーメッセージを返す
            }

            //レース情報
            //レースID
            $race_id = $raceInfo["race_id"];
            //出漕時点情報
            //発艇日時
            $start_datetime = isset($raceResultRecordResponse["startDateTime"]) ? $raceResultRecordResponse["startDateTime"] : null;
            //天候
            $weatherId = isset($raceResultRecordResponse["weatherId"]) ? $raceResultRecordResponse["weatherId"] : null;
            //2000m地点風速
            $wind_direction_2000m_point = isset($raceResultRecordResponse["wind_direction_2000m_point"]) ? $raceResultRecordResponse["wind_direction_2000m_point"] : null;
            //2000m地点風向
            $wind_speed_2000m_point = isset($raceResultRecordResponse["wind_speed_2000m_point"]) ? $raceResultRecordResponse["wind_speed_2000m_point"] : null;
            //1000m地点風速
            $wind_direction_1000m_point = isset($raceResultRecordResponse["wind_direction_1000m_point"]) ? $raceResultRecordResponse["wind_direction_1000m_point"] : null;
            //1000m地点風向
            $wind_speed_1000m_point = isset($raceResultRecordResponse["wind_speed_1000m_point"]) ? $raceResultRecordResponse["wind_speed_1000m_point"] : null;

            //レース結果情報のデータ数分ループする 20240420
            for ($record_index = 0; $record_index < count($raceResultRecords); $record_index++) {
                $target_result = $raceResultRecords[$record_index];
                $crew_delete_flag = isset($target_result["deleteFlg"]) ? $target_result["deleteFlg"] : null;
                //団体ID
                $org_id = isset($target_result["org_id"]) ? $target_result["org_id"] : null;
                //クルー名
                $crew_name = isset($target_result["crew_name"]) ? $target_result["crew_name"] : null;
                //削除フラグが立っていたら対象のクルー全てのレース結果を削除
                if ($crew_delete_flag) {
                    $delete_values = array();
                    $delete_values["race_id"] = $race_id;
                    $delete_values["org_id"] = $org_id;
                    $delete_values["crew_name"] = $crew_name;
                    $delete_values["updated_datetime"] = $current_datetime;
                    $delete_values["updated_user_id"] = $update_user_id;
                    $t_raceResultRecord->updateTargetCrewDeleteFlagToValid($delete_values);
                } else {
                    //クルー情報
                    $crew_player = $target_result["crewPlayer"];
                    //エントリーシステム団体ID
                    $entrysystem_org_id = isset($target_result["entrysystem_org_id"]) ? $target_result["entrysystem_org_id"] : null;
                    //エントリー団体IDが空のとき
                    //団体テーブルから団体IDを取得して団体情報を取得
                    //取得した団体情報からエントリー団体IDを取得
                    if (empty($entrysystem_org_id) && isset($org_id)) {
                        $target_org_info = $t_organizations->getOrganization($org_id, $update_user_id);
                        //getOrganizationは取得した0番目だけを返す
                        if (isset($target_org_info)) {
                            $entrysystem_org_id = $target_org_info->entrysystem_org_id;
                        }
                    }
                    //団体名
                    $org_name = isset($target_result["orgName"]) ? $target_result["orgName"] : null;
                    //レーンNo.
                    $lane_number = isset($target_result["lane_number"]) ? $target_result["lane_number"] : null;
                    //順位
                    $rank = isset($target_result["rank"]) ? $target_result["rank"] : null;
                    //500mlapタイム
                    $laptime_500m = isset($target_result["laptime_500m"]) ? $this->convertTimeToFloat($target_result["laptime_500m"]) : null;
                    //1000mlapタイム
                    $laptime_1000m = isset($target_result["laptime_1000m"]) ? $this->convertTimeToFloat($target_result["laptime_1000m"]) : null;
                    //1500mlapタイム
                    $laptime_1500m = isset($target_result["laptime_1500m"]) ? $this->convertTimeToFloat($target_result["laptime_1500m"]) : null;
                    //2000mlapタイム
                    $laptime_2000m = isset($target_result["laptime_2000m"]) ? $this->convertTimeToFloat($target_result["laptime_2000m"]) : null;
                    //最終タイム
                    $final_time = isset($target_result["final_time"]) ? $this->convertTimeToFloat($target_result["final_time"]) : null;
                    //ストロークレート平均
                    $stroke_rate_avg = isset($target_result["stroke_rate_avg"]) ? $target_result["stroke_rate_avg"] : null;
                    //500mストロークレート
                    $stroke_rat_500m = isset($target_result["stroke_rat_500m"]) ? $target_result["stroke_rat_500m"] : null;
                    //1000mストロークレート
                    $stroke_rat_1000m = isset($target_result["stroke_rat_1000m"]) ? $target_result["stroke_rat_1000m"] : null;
                    //1500mストロークレート
                    $stroke_rat_1500m = isset($target_result["stroke_rat_1500m"]) ? $target_result["stroke_rat_1500m"] : null;
                    //2000mストロークレート
                    $stroke_rat_2000m = isset($target_result["stroke_rat_2000m"]) ? $target_result["stroke_rat_2000m"] : null;
                    //備考
                    $race_result_note = $target_result["race_result_note"];

                    //選手情報を取得
                    foreach ($crew_player as $player) {
                        //選手ID
                        $player_id = isset($player["playerId"]) ? $player["playerId"] : null;
                        //スプレッドシート不具合項目462 は下記関数に団体ID、クルー名を渡しているから発生する仕様バグ 20240522
                        // $target_race_result_record = $t_raceResultRecord->getIsExistsTargetResultRecordForConditions($race_id,$crew_name,$org_id,$player_id);
                        $target_race_result_record_id = isset($player["race_result_record_id"]) ? $player["race_result_record_id"] : null;
                        $target_race_result_record = $t_raceResultRecord->getIsExistsTargetResultRecordForConditions($target_race_result_record_id);
                        $race_result_record_id = isset($target_race_result_record) ? $target_race_result_record->race_result_record_id : null;
                        //削除にチェック、かつ対象の出漕結果記録IDがテーブルに存在する場合
                        if ($player["deleteFlg"] && isset($race_result_record_id)) {
                            //出漕結果記録の削除
                            $delete_race_result_record_array = array();
                            $delete_race_result_record_array["race_result_record_id"] = $race_result_record_id;
                            $delete_race_result_record_array["updated_datetime"] = $current_datetime;
                            $delete_race_result_record_array["updated_user_id"] = $update_user_id;
                            //削除フラグ更新実行
                            $t_raceResultRecord->updateDeleteFlagToValid($delete_race_result_record_array);
                        } elseif (!$player["deleteFlg"]) {
                            //出漕結果記録の更新
                            //選手の情報を配列に格納                            
                            //jara選手コード
                            $jara_player_id = isset($player["jaraPlayerId"]) ? $player["jaraPlayerId"] : null;
                            //jara_player_idが空のとき
                            //選手テーブルからjara_player_idを取得
                            if (empty($jara_player_id)) {
                                $target_player_info = $t_players->getPlayer($player_id);
                                if (isset($target_player_info)) {
                                    $jara_player_id = $target_player_info[0]->{"jara_player_id"};
                                }
                            }
                            //エントリーシステムレースID
                            $entrysystem_race_id = isset($player["entrysystemRaceId"]) ? $player["entrysystemRaceId"] : null;
                            //選手名
                            $player_name = isset($player["playerName"]) ? $player["playerName"] : null;
                            //選手身長
                            $height = isset($player["height"]) ? $player["height"] : null;
                            //選手体重
                            $weight = isset($player["weight"]) ? $player["weight"] : null;
                            //シート番号
                            $seat_name_id = isset($player["seatNameId"]) ? $player["seatNameId"] : null;
                            //シート名
                            $seat_name = isset($player["seatName"]) ? $player["seatName"] : null;
                            //心拍数(平均)
                            $heart_rate_avg = isset($player["heartRateAvg"]) ? $player["heartRateAvg"] : null;
                            //500m心拍数
                            $heart_rate_500m = isset($player["fiveHundredmHeartRate"]) ? $player["fiveHundredmHeartRate"] : null;
                            //1000m心拍数
                            $heart_rate_1000m = isset($player["tenHundredmHeartRate"]) ? $player["tenHundredmHeartRate"] : null;
                            //1500m心拍数
                            $heart_rate_1500m = isset($player["fifteenHundredmHeartRate"]) ? $player["fifteenHundredmHeartRate"] : null;
                            //2000m心拍数
                            $heart_rate_2000m = isset($player["twentyHundredmHeartRate"]) ? $player["twentyHundredmHeartRate"] : null;
                            //立ち会い有無
                            //変数が無ければnull
                            //入力値がtrueなら1、falseなら0とする
                            $attendance = isset($player["attendance"]) ? ($player["attendance"] ? 1 : 0) : null;
                            //対象の出漕結果記録が存在するかを判定
                            if (empty($target_race_result_record)) {
                                //is_record_existsが0であれば、対象のレコードが存在しないため登録する
                                //登録時の値を格納する配列
                                $insert_values_array = array(); //不足分のデータを追加 20240420

                                //選手ID
                                $insert_values_array["player_id"] = $player_id;
                                //jara選手コード                                
                                $insert_values_array["jara_player_id"] = $jara_player_id;
                                //選手名
                                $insert_values_array["player_name"] = $player_name;
                                //エントリーシステム大会ID
                                $entrysystem_tourn_id = isset($target_result["entrysystem_tourn_id"]) ? $target_result["entrysystem_tourn_id"] : null;
                                $insert_values_array["entrysystem_tourn_id"] = $entrysystem_tourn_id;
                                //大会ID
                                $tourn_id = isset($raceInfo["tourn_id"]) ? $raceInfo["tourn_id"] : null;
                                $insert_values_array["tourn_id"] = $tourn_id;
                                //対象の大会データ
                                //getTournamentは取得した0番目だけを返す
                                $target_tourn_info = $t_tournaments->getTournament($tourn_id);
                                //大会名
                                $tourn_name = isset($target_result["tourn_name"]) ? $target_result["tourn_name"] : null;
                                if (empty($tourn_name)) {
                                    $tourn_name = $target_tourn_info->tourn_name;
                                }
                                $insert_values_array["tourn_name"] = $tourn_name;
                                //レースID
                                $insert_values_array["race_id"] = isset($race_id) ? $race_id : null;
                                //エントリーシステムレースID
                                $insert_values_array["entrysystem_race_id"] = $entrysystem_race_id;
                                //レースNo.
                                $insert_values_array["race_number"] = isset($raceInfo["race_number"]) ? $raceInfo["race_number"] : null;
                                //レース名
                                $insert_values_array["race_name"] = isset($raceInfo["race_name"]) ? $raceInfo["race_name"] : null;
                                //レース区分ID
                                $insert_values_array["race_class_id"] = isset($raceInfo["race_class_id"]) ? $raceInfo["race_class_id"] : null;
                                //レース区分名
                                $insert_values_array["race_class_name"] = isset($raceInfo["race_class_name"]) ? $raceInfo["race_class_name"] : null;
                                //団体ID
                                $insert_values_array["org_id"] = $org_id;
                                //エントリーシステム団体ID
                                $insert_values_array["entrysystem_org_id"] = $entrysystem_org_id;
                                //団体名
                                $insert_values_array["org_name"] = $org_name;
                                //クルー名
                                $insert_values_array["crew_name"] = $crew_name;
                                //レーンNo.                                
                                $insert_values_array["lane_number"] = $lane_number;
                                //組別
                                $insert_values_array["by_group"] = isset($raceInfo["by_group"]) ? $raceInfo["by_group"] : null;
                                //種目ID
                                $insert_values_array["event_id"] = isset($raceInfo["event_id"]) ? $raceInfo["event_id"] : null;
                                //種目名
                                $insert_values_array["event_name"] = isset($raceInfo["event_name"]) ? $raceInfo["event_name"] : null;
                                //距離
                                $insert_values_array["range"] = isset($raceInfo["range"]) ? $raceInfo["range"] : null;
                                //順位
                                $insert_values_array["rank"] = $rank;
                                //500mlapタイム                    
                                $insert_values_array["laptime_500m"] = $laptime_500m;
                                //1000mlapタイム                    
                                $insert_values_array["laptime_1000m"] = $laptime_1000m;
                                //1500mlapタイム
                                $insert_values_array["laptime_1500m"] = $laptime_1500m;
                                //2000mlapタイム
                                $insert_values_array["laptime_2000m"] = $laptime_2000m;
                                //最終タイム                    
                                $insert_values_array["final_time"] = $final_time;
                                //ストロークレート平均
                                $insert_values_array["stroke_rate_avg"] = $stroke_rate_avg;
                                //500mストロークレート
                                $insert_values_array["stroke_rat_500m"] = $stroke_rat_500m;
                                //1000mストロークレート
                                $insert_values_array["stroke_rat_1000m"] = $stroke_rat_1000m;
                                //1500mストロークレート
                                $insert_values_array["stroke_rat_1500m"] = $stroke_rat_1500m;
                                //2000mストロークレート
                                $insert_values_array["stroke_rat_2000m"] = $stroke_rat_2000m;
                                //心拍数(平均)
                                $insert_values_array["heart_rate_avg"] = $heart_rate_avg;
                                //500m心拍数
                                $insert_values_array["heart_rate_500m"] = $heart_rate_500m;
                                //1000m心拍数
                                $insert_values_array["heart_rate_1000m"] = $heart_rate_1000m;
                                //1500m心拍数
                                $insert_values_array["heart_rate_1500m"] = $heart_rate_1500m;
                                //2000m心拍数
                                $insert_values_array["heart_rate_2000m"] = $heart_rate_2000m;
                                //公式/非公式
                                if (isset($target_tourn_info)) {
                                    if ($target_tourn_info->tournTypeName == "非公式") {
                                        $insert_values_array["official"] = 0;
                                    } elseif ($target_tourn_info->tournTypeName == "公式") {
                                        $insert_values_array["official"] = 1;
                                    } else {
                                        $insert_values_array["official"] = null;
                                    }
                                } else {
                                    $insert_values_array["official"] = null;
                                }
                                //立ち会い有無
                                $insert_values_array["attendance"] = $attendance;
                                //選手身長
                                $insert_values_array["player_height"] = $height;
                                //選手体重
                                $insert_values_array["player_weight"] = $weight;
                                //シート番号
                                $insert_values_array["seat_number"] = $seat_name_id;
                                //シート名
                                $insert_values_array["seat_name"] = $seat_name;
                                //発艇日時
                                $insert_values_array["start_datetime"] = $start_datetime;
                                //天候
                                $insert_values_array["weather"] = $weatherId;
                                //2000m地点風速
                                $insert_values_array["wind_speed_2000m_point"] = $wind_speed_2000m_point;
                                //2000m地点風向
                                $insert_values_array["wind_direction_2000m_point"] = $wind_direction_2000m_point;
                                //1000m地点風速
                                $insert_values_array["wind_speed_1000m_point"] = $wind_speed_1000m_point;
                                //1000m地点風向
                                $insert_values_array["wind_direction_1000m_point"] = $wind_direction_1000m_point;
                                //備考
                                $insert_values_array["race_result_note"] = $race_result_note;
                                //登録日時
                                $insert_values_array["registered_time"] = $current_datetime;
                                //登録ユーザーID
                                $insert_values_array["registered_user_id"] = $update_user_id;
                                //更新日時
                                $insert_values_array["updated_time"] = $current_datetime;
                                //更新ユーザーID
                                $insert_values_array["updated_user_id"] = $update_user_id;
                                //削除フラグ
                                $insert_values_array["delete_flag"] = 0;

                                //登録実行
                                $t_raceResultRecord->insertRaceResultRecordForInputConfirm($insert_values_array);
                            } else {
                                //is_record_existsが0でなければ、対象のレコードが存在するため更新する
                                //更新時の値を格納する配列
                                $update_values_array = array();

                                //出漕結果記録ID
                                $update_values_array["race_result_record_id"] = $race_result_record_id;
                                //レースID
                                $update_values_array["race_id"] = $race_id;
                                //発艇日時
                                $update_values_array["start_datetime"] = $start_datetime;
                                //天候
                                $update_values_array["weather"] = $weatherId;
                                //2000m地点風速
                                $update_values_array["wind_speed_2000m_point"] = $wind_speed_2000m_point;
                                //2000m地点風向
                                $update_values_array["wind_direction_2000m_point"] = $wind_direction_2000m_point;
                                //1000m地点風速
                                $update_values_array["wind_speed_1000m_point"] = $wind_speed_1000m_point;
                                //1000m地点風向
                                $update_values_array["wind_direction_1000m_point"] = $wind_direction_1000m_point;
                                //エントリーシステム団体ID
                                $update_values_array["entrysystem_org_id"] = $entrysystem_org_id;
                                //団体ID
                                $update_values_array["org_id"] = $org_id;
                                //団体名
                                $update_values_array["org_name"] = $org_name;
                                //クルー名                    
                                $update_values_array["crew_name"] = $crew_name;
                                //レーンNo.
                                $update_values_array["lane_number"] = $lane_number;
                                //順位
                                $update_values_array["rank"] = $rank;
                                //500mlapタイム
                                $update_values_array["laptime_500m"] = $laptime_500m;
                                //1000mlapタイム
                                $update_values_array["laptime_1000m"] = $laptime_1000m;
                                //1500mlapタイム
                                $update_values_array["laptime_1500m"] = $laptime_1500m;
                                //2000mlapタイム
                                $update_values_array["laptime_2000m"] = $laptime_2000m;
                                //最終タイム
                                $update_values_array["final_time"] = $final_time;
                                //ストロークレート平均
                                $update_values_array["stroke_rate_avg"] = $stroke_rate_avg;
                                //500mストロークレート                    
                                $update_values_array["stroke_rat_500m"] = $stroke_rat_500m;
                                //1000mストロークレート                    
                                $update_values_array["stroke_rat_1000m"] = $stroke_rat_1000m;
                                //1500mストロークレート                    
                                $update_values_array["stroke_rat_1500m"] = $stroke_rat_1500m;
                                //2000mストロークレート                    
                                $update_values_array["stroke_rat_2000m"] = $stroke_rat_2000m;
                                //備考
                                $update_values_array["race_result_note"] = $race_result_note;
                                //選手ID
                                $update_values_array["player_id"] = $player_id;
                                //jara選手コード                                
                                $update_values_array["jara_player_id"] = $jara_player_id;
                                //選手名
                                $update_values_array["player_name"] = $player_name;
                                //選手身長
                                $update_values_array["player_height"] = $height;
                                //選手体重
                                $update_values_array["player_weight"] = $weight;
                                //シート番号
                                $update_values_array["seat_number"] = $seat_name_id;
                                //シート名
                                $update_values_array["seat_name"] = $seat_name;
                                //心拍数(平均)
                                $update_values_array["heart_rate_avg"] = $heart_rate_avg;
                                //500m心拍数
                                $update_values_array["heart_rate_500m"] = $heart_rate_500m;
                                //1000m心拍数
                                $update_values_array["heart_rate_1000m"] = $heart_rate_1000m;
                                //1500m心拍数
                                $update_values_array["heart_rate_1500m"] = $heart_rate_1500m;
                                //2000m心拍数
                                $update_values_array["heart_rate_2000m"] = $heart_rate_2000m;
                                //立ち会い有無
                                $update_values_array["attendance"] = $attendance;
                                //更新日時
                                $update_values_array["updated_time"] = $current_datetime;
                                //更新ユーザーID
                                $update_values_array["updated_user_id"] = $update_user_id;

                                //更新実行
                                $t_raceResultRecord->updateRaceResultRecordForUpdateConfirm($update_values_array);
                            }
                        }
                    }
                }
            }
            DB::commit();
            Log::debug(sprintf("updateRaceResultRecordForUpdateConfirm end."));
            return response()->json(['result' => true]); //DBの結果を返す
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, $e->getMessage());
        }
    }

    //レース結果入力確認画面
    //更新ボタンを押してレース結果入力画面に遷移するときに、レース情報を取得する
    public function getRaceDataRaceId(Request $request, T_races $tRace, T_raceResultRecord $t_raceResultRecord)
    {
        Log::debug(sprintf("getRaceDataRaceId start"));
        try {
            $reqData = $request->all();
            $target_race_id = $reqData['race_id'];
            $race_result = $tRace->getRaceFromRaceId($target_race_id); //レース情報を取得

            //出漕時点情報を取得
            $record_result = $t_raceResultRecord->getRaceResultRecordOnRowingPoint($target_race_id);
            //laptimeをSS.msからMM:SS.msに変換
            for ($result_index = 0; $result_index < count($record_result); $result_index++) {
                $record_result[$result_index]->{"laptime_500m"} = $this->convertToTimeFormat($record_result[$result_index]->{"laptime_500m"});
                $record_result[$result_index]->{"laptime_1000m"} = $this->convertToTimeFormat($record_result[$result_index]->{"laptime_1000m"});
                $record_result[$result_index]->{"laptime_1500m"} = $this->convertToTimeFormat($record_result[$result_index]->{"laptime_1500m"});
                $record_result[$result_index]->{"laptime_2000m"} = $this->convertToTimeFormat($record_result[$result_index]->{"laptime_2000m"});
                $record_result[$result_index]->{"final_time"} = $this->convertToTimeFormat($record_result[$result_index]->{"final_time"});
            }

            //レース結果情報の選手情報を取得して、レース結果情報に配列のプロパティを作成する
            for ($index = 0; $index < count($record_result); $index++) {
                $target_crew_name = $record_result[$index]->{'crew_name'};
                $target_org_id = $record_result[$index]->{'org_id'};
                $player_result = $t_raceResultRecord->getRaceResultRecordList($target_race_id, $target_crew_name, $target_org_id);
                //crewPlayerのプロパティにレース結果情報
                // $record_result[$index]->{'crew_player'} = $player_result;
                $record_result[$index]->{'crewPlayer'} = $player_result;
            }
            Log::debug(sprintf("getRaceDataRaceId end"));
            return response()->json(['race_result' => $race_result, 'record_result' => $record_result]); //DBの結果を返す
        } catch (HttpException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error($e);
            abort(500, "レース結果の取得に失敗しました。");
        }
    }

    //レース結果入力確認画面
    //レース結果追加ボタンを押してレース結果入力画面に遷移するときに、レース情報を取得する
    public function getRaceDataFromTournIdAndEventId(Request $request, T_races $tRace)
    {
        Log::debug(sprintf("getRaceDataFromTournIdAndEventId start."));
        $reqData = $request->all();
        // $tourn_id = $reqData['tourn_id'];
        // $event_id = $reqData['event_id'];
        // $result = $tRace->getBasicRaceInfoList($tourn_id,$event_id); //レース情報を取得
        $result = $tRace->getLinkRaces($reqData); //レース結果のないレース情報を取得 20240422
        Log::debug(sprintf("getRaceDataFromTournIdAndEventId end."));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //大会情報参照画面用 主催団体管理者の判別 20240402
    public function checkOrgManager(Request $request, T_organization_staff $tOrganizationStaff)
    {
        Log::debug(sprintf("checkOrgManager start"));
        $reqData = $request->only(['tournId']);
        $targetTournId = $reqData['tournId'];
        $targetUserId = Auth::user()->user_id;

        $isOrgManager = $tOrganizationStaff->getIsOrgManager($targetTournId, $targetUserId);

        $result = [
            'isOrgManager' => (bool)$isOrgManager->{'isOrgManager'}
        ];

        Log::debug(sprintf("checkOrgManager end"));
        return response()->json(['result' => $result]);
    }

    //種目IDを受け取り、種目テーブルから人数を取得する
    public function getCrewNumberForEventId(Request $request, M_events $m_events)
    {
        Log::debug(sprintf("getCrewNumberForEventId start."));
        $reqData = $request->all();
        $target_event_id = $reqData["event_id"];
        $events = $m_events->getEventForEventID($target_event_id);
        $crew_number = $events[0]->{"crew_number"};
        Log::debug(sprintf("getCrewNumberForEventId end."));
        return response()->json(['result' => $crew_number]); //DBの結果を返す
    }

    //レース結果登録画面
    //クルーの選手情報を取得する
    //選手IDをフロントエンドから受け取り、選手情報を取得して返す
    public function getCrewPlayerInfo(Request $request, T_players $t_players)
    {
        Log::debug(sprintf("getCrewPlayerInfo start."));
        $reqData = $request->all();
        $player_info = $t_players->getPlayer($reqData["player_id"]);
        Log::debug(sprintf("getCrewPlayerInfo end."));
        return response()->json(['result' => $player_info]); //DBの結果を返す
    }

    //レース結果情報一括登録画面用 csvフォーマット出力に使用するレース情報の取得 20240418
    public function getCsvFormatRaceData(Request $request, T_tournaments $tourn, T_races $tRace)
    {
        Log::debug(sprintf("getCsvFormatRaceData start"));
        $reqData = $request->all();
        Log::debug($reqData['tourn_id']);
        $tournResult = $tourn->getTournament($reqData['tourn_id']); //大会情報を取得（公式,非公式の判定用）
        $result = $tRace->getRaces($reqData); //レース情報を取得
        if (isset($result)) {
            for ($i = 0; $i < count($result); $i++) {
                $result[$i]->id = $i;
            }
        }
        Log::debug(sprintf("getCsvFormatRaceData end"));
        return response()->json(['result' => $result, 'tournResult' => $tournResult]); //DBの結果を返す
    }

    //レース結果管理　レース登録画面用 レース情報の取得 20240422
    public function getTournLinkRaces(Request $request, T_tournaments $tourn, T_races $tRace)
    {
        Log::debug(sprintf("getTournLinkRaces start"));
        $reqData = $request->all();
        $result = $tRace->getLinkRaces($reqData); //レース情報を取得
        Log::debug(sprintf("getTournLinkRaces end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //レース結果管理　種目IDを条件に対象の種目に対応するシート位置を取得する 20240514
    public function getEventSeatPosForEventID(Request $request, M_events $m_events)
    {
        Log::debug(sprintf("getEventSeatPosForEventID start"));
        $reqData = $request->all();
        $result = $m_events->getEventSeatPosForEventID($reqData['event_id']); //レース情報を取得
        Log::debug(sprintf("getEventSeatPosForEventID end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    // 自分が、選手もしくはスタッフとして所属している団体(複数)でその団体が主催している大会を取得
    public function getMyOrgsHostedTournaments(T_tournaments $tTournaments)
    {
        Log::debug(sprintf("getMyOrgsHostedTournaments start"));
        $result = $tTournaments->getMyOrgsHostedTournaments();
        Log::debug(sprintf("getMyOrgsHostedTournaments end"));
        return response()->json(['result' => $result]);
    }

    //大会フォロー機能 20241028
    public function tournamentFollowed(Request $request, T_followed_tournaments $tFollowedTournaments)
    {
        Log::debug(sprintf("tournamentFollowed start"));

        try {
            DB::beginTransaction();

            $reqData = $request->all();
            $tournId = $reqData["tournId"];
            $followTourn = $tFollowedTournaments->getFollowedTournamentsData($tournId); //大会IDとユーザIDを元にフォロー情報が存在するかを確認 202401028

            //フォロー大会テーブルにデータが存在しない場合、新規追加する 20241028
            if (empty($followTourn)) {
                $tFollowedTournaments->insertFollowedTournaments($tournId); //大会のフォロー追加 202401028
            } else {
                if ($followTourn->delete_flag == 0) {
                    $tFollowedTournaments->updateFollowedTournaments(1, $tournId); //大会のフォロー解除 202401028
                } else {
                    $tFollowedTournaments->updateFollowedTournaments(0, $tournId); //大会のフォロー 202401028
                }
            }
            DB::commit();
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, '大会フォローに失敗しました。');
        }

        Log::debug(sprintf("tournamentFollowed end"));
    }

    private function generateSearchCondition($searchInfo, &$bindingParams)
    {
        Log::debug(sprintf("generateSearchCondition start"));
        $condition = "";

        if (isset($searchInfo['tourn_name'])) {
            $condition .= " and `t_tournaments`.`tourn_name` like :tourn_name"; //大会名
            $bindingParams["tourn_name"] = '%' . $searchInfo['tourn_name'] . '%';
        }
        if (isset($searchInfo['tourn_type'])) {
            $condition .= " and `t_tournaments`.`tourn_type` = :tourn_type"; //大会種別
            $bindingParams["tourn_type"] = $searchInfo['tourn_type'];
        }
        if ($searchInfo['venue_id'] > 0) {
            $condition .= " and `t_tournaments`.`venue_id` = :venue_id"; //開催場所
            $bindingParams["venue_id"] = $searchInfo['venue_id'];
        }
        if (isset($searchInfo['event_start_date'])) {
            $condition .= " and `t_tournaments`.`event_start_date`>= CAST(:event_start_date AS DATE)"; //開催開始年月日
            $bindingParams["event_start_date"] = $searchInfo['event_start_date'];
        }
        if (isset($searchInfo['event_end_date'])) {
            $condition .= " and `t_tournaments`.`event_end_date` <= CAST(:event_end_date AS DATE)"; //開催終了年月日
            $bindingParams["event_end_date"] = $searchInfo['event_end_date'];
        }
        if (isset($searchInfo['jara_player_id'])) {
            $condition .= " and `t_race_result_record`.`jara_player_id`= :jara_player_id"; //JARA選手コード
            $bindingParams["jara_player_id"] = $searchInfo['jara_player_id'];
        }
        if (isset($searchInfo['player_id'])) {
            $condition .= " and `t_race_result_record`.`player_id` = :player_id"; //選手ID
            $bindingParams["player_id"] = $searchInfo['player_id'];
        }
        if (isset($searchInfo['player_name'])) {
            $condition .= " and `t_race_result_record`.`player_name` like :player_name"; //選手名
            $bindingParams["player_name"] = '%' . $searchInfo['player_name'] . '%';
        }
        if (isset($searchInfo['sponsor_org_id'])) {
            $condition .= " and `t_tournaments`.`sponsor_org_id`= :sponsor_org_id"; //主催団体ID
            $bindingParams["sponsor_org_id"] = $searchInfo['sponsor_org_id'];
        }
        if (isset($searchInfo['sponsorOrgName'])) {
            $condition .= " and `t_organizations`.`org_name` like :sponsorOrgName"; //主催団体名
            $bindingParams["sponsorOrgName"] = '%' . $searchInfo['sponsorOrgName'] . '%';
        }
        Log::debug(sprintf("generateSearchCondition end"));
        return $condition;
    }

    //レース結果一覧を取得する検索条件の文字列を生成する
    private function generateRaceSearchCondition($reqData, &$valueArray)
    {
        $condition = "";
        //大会名(必須項目)
        $condition .= "and race.tourn_id = :tourn_id\r\n";
        $valueArray["tourn_id"] = $reqData["tournId"];
        //種目(必須項目)
        $condition .= "and race.event_id = :event_id\r\n";
        $valueArray["event_id"] = $reqData["eventId"];
        //レース区分
        if (isset($reqData["raceTypeId"])) {
            $condition .= "and race.race_class_id = :race_class_id\r\n";
            $valueArray["race_class_id"] = $reqData["raceTypeId"];
        }
        //組別
        if (isset($reqData["byGroup"])) {
            $condition .= "and race.by_group LIKE :by_group\r\n";
            $valueArray["by_group"] = "%" . $reqData["byGroup"] . "%";
        }
        //レースNo.
        if (isset($reqData["raceNo"])) {
            $condition .= "and race.race_number = :race_number\r\n";
            $valueArray["race_number"] = $reqData["raceNo"];
        }
        return $condition;
    }

    //時間フォーマット文字列を浮動小数点型に変換する
    //example.)01:10.34 → 70.34
    private function convertTimeToFloat($timeString)
    {
        list($minutes, $seconds) = explode(':', $timeString);
        return $minutes * 60 + $seconds;
    }

    //浮動小数点型を時間フォーマット文字列に変換する
    //example.)70.34 → 01:10.34
    private function convertToTimeFormat($floatNumber)
    {
        $hours = floor($floatNumber / 60);
        $minutes = floor($floatNumber % 60);
        $seconds = round(($floatNumber - floor($floatNumber)) * 100);

        return sprintf("%02d:%02d.%02d", $hours, $minutes, $seconds);
    }
}
