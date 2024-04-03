<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
// use App\Providers\RouteServiceProvider;
// use Illuminate\Auth\Events\Registered;
// use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Hash;
// use Illuminate\Support\Str;
use Illuminate\View\View;
// use Illuminate\Support\Facades\Mail;
// use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

// use Illuminate\Validation\ValidationException;
// use League\CommonMark\Node\Inline\Newline;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Session;
use App\Models\T_tournaments;
use App\Models\T_races;
use App\Models\T_raceResultRecord;
use App\Models\T_organizations;
use App\Models\T_players;
use App\Models\M_venue;
use Exception;
use Illuminate\Support\Facades\Validator;

/*
登録：register
変更：edit
確認：confirm
削除：delete
参照：reference
*/

class TournamentController extends Controller
{
    
    //----------------大会検索で使用　ここから----------------------------
    private function generateSearchCondition($searchInfo)
    {
        Log::debug(sprintf("generateSearchCondition start"));
        $condition = "";

        if (isset($searchInfo['tourn_name'])) {
            $condition .= " and `t_tournaments`.`tourn_name` like " . "\"%" . $searchInfo['tourn_name'] . "%\""; //大会名
        }
        if (isset($searchInfo['tourn_type'])) {
            $condition .= " and `t_tournaments`.`tourn_type`=" . $searchInfo['tourn_type']; //大会種別
        }
        if (isset($searchInfo['venue_id'])) {
            $condition .= " and `t_tournaments`.`venue_id` = " . $searchInfo['venue_id']; //開催場所
        }
        if (isset($searchInfo['event_start_date'])) {
            $condition .= " and `t_tournaments`.`event_start_date`>= CAST('" . $searchInfo['event_start_date'] . "' AS DATE)"; //開催開始年月日
        }
        if (isset($searchInfo['event_end_date'])) {
            $condition .= " and `t_tournaments`.`event_end_date` <= CAST('" . $searchInfo['event_end_date'] . "' AS DATE)"; //開催終了年月日
        }
        if (isset($searchInfo['jara_player_id'])) {
            $condition .= " and `t_race_result_record`.`jara_player_id`=" . $searchInfo['jara_player_id']; //JARA選手コード
        }
        if (isset($searchInfo['player_id'])) {
            $condition .= " and `t_race_result_record`.`player_id`=" . $searchInfo['player_id']; //選手ID
        }
        if (isset($searchInfo['player_name'])) {
            $condition .= " and `t_race_result_record`.`player_name` like " . "\"%" . $searchInfo['player_name'] . "%\""; //選手名
        }
        if (isset($searchInfo['sponsor_org_id'])) {
            $condition .= " and `t_tournaments`.`sponsor_org_id`= " . $searchInfo['sponsor_org_id']; //主催団体ID
        }
        if (isset($searchInfo['sponsorOrgName'])) {
            $condition .= " and `t_organizations`.`org_name` like " . "\"%" . $searchInfo['sponsorOrgName'] . "%\""; //主催団体名
        }
        Log::debug(sprintf("generateSearchCondition end"));
        return $condition;
    }

    public function searchTournament(Request $request, T_tournaments $tTournaments, M_venue $venueData)
    {
        Log::debug(sprintf("searchTournament start"));
        $searchInfo = $request->all();
        Log::debug($searchInfo);
        $searchCondition = $this->generateSearchCondition($searchInfo);
        Log::debug($searchCondition);
        $tournamentList =  $tTournaments->getTournamentWithSearchCondition($searchCondition);
        $venueList = $venueData->getVenueList();

        Log::debug(sprintf("searchTournament end"));
        return response()->json(['reqData' => $venueList, 'result' => $tournamentList]); //送信データ(debug用)とDBの結果を返す
        // return view('tournament.search', ["pagemode" => "search", "tournamentInfo" => $searchInfo, "tournamentList" => $tournamentList, "venueList" => $venueList]);
    }

    public function index(T_tournaments $tTournaments, T_races $tRace) //Laravel_Reactデータ送信テスト 20231227
    {
        $tTours = $tTournaments->getTournament(1); //大会情報を取得
        $tRaceData = $tRace->getRace(1); //レース情報を取得

        return $tTours;
    }

    public function postTest(Request $request) //React_Laravelデータ送信テスト 20231227
    {
        $reqData = $request->all();
        return response()->json(['reqData' => $reqData]);
    }

    //大会エントリー一括登録
    // public function createEntryRegister(T_tournaments $tourn)
    // {
    //     $tournament_name_list = $tourn->getTournamentName();
    //     return view("tournament.entry-register", ["dataList" => [], "errorMsg" => "", "checkList" => "", "tournament_name_list" => $tournament_name_list]);

    //     //user can visit this page if he/she is an admin
    //     // if (((Auth::user()->user_type & "01000000") === "01000000") or ((Auth::user()->user_type & "00100000") === "00100000") or ((Auth::user()->user_type & "00010000") === "00010000") or ((Auth::user()->user_type & "00001000") === "00001000")) {
    //     //     $tournament_name_list = $tourn->getTournamentName();
    //     //     return view("tournament.entry-register", ["dataList" => [], "errorMsg" => "", "checkList" => "", "tournament_name_list" => $tournament_name_list]);
    //     // }
    //     // //redirect to my-page those have no permission to access tournament-entry-register page
    //     // else {
    //     //     return redirect('my-page');
    //     // }
    // }
    // public function csvReadEntryRegister(Request $request, T_tournaments $tourn, T_races $tRace, T_raceResultRecord $tRaceResultRecord)
    // {

    //     $tournament_name_list = $tourn->getTournamentName();

    //     if ($request->has('csvRead')) { // 参照ボタンクリック
    //         // CSVファイルが存在するかの確認
    //         if ($request->hasFile('csvFile')) {
    //             //拡張子がCSVであるかの確認
    //             if ($request->csvFile->getClientOriginalExtension() !== "csv") {
    //                 // throw new Exception('このファイルはCSVファイルではありません');
    //                 return view('tournament.entry-register', ["dataList" => [], "errorMsg" => "このファイルはCSVファイルではありません", "checkList" => "", "tournament_name_list" => $tournament_name_list]);
    //             }
    //             //ファイルの保存
    //             $newCsvFileName = $request->csvFile->getClientOriginalName();
    //             $request->csvFile->storeAs('public/csv', $newCsvFileName);
    //         } else {
    //             // throw new Exception('ファイルを取得できませんでした');
    //             return view('tournament.entry-register', ["dataList" => [], "errorMsg" => "ファイルを取得できませんでした。<br/>入力したファイルパスを確認してください", "checkList" => "", "tournament_name_list" => $tournament_name_list]);
    //         }
    //         //保存したCSVファイルの取得
    //         $csv = Storage::disk('local')->get("public/csv/{$newCsvFileName}");
    //         // OS間やファイルで違う改行コードをexplode統一
    //         $csv = str_replace(array("\r\n", "\r"), "\n", $csv);
    //         // $csvを元に行単位のコレクション作成。explodeで改行ごとに分解

    //         $csvList = collect(explode("\n", $csv));
    //         $csvList = $csvList->toArray();
    //         $checkList = array();
    //         $dataList = array();
    //         for ($i = 1; $i < count($csvList); $i++) {
    //             $value = explode(',', $csvList[$i]);
    //             $dataList[$i] = $value;
    //         }

    //         return view('tournament.entry-register', ["dataList" => $dataList, "errorMsg" => "", "checkList" => $checkList, "tournament_name_list" => $tournament_name_list]);
    //     } else if ($request->has('dbUpload')) { // 登録ボタンクリック
    //         $csvData = Session::get('dataList');
    //         // dd($csvData[1][5]);
    //         // $result = explode(',', $request->Flag01);
    //         $result = "1";
    //         //dd($csvData);
    //         for ($i = 1; $i < count($csvData); $i++) {
    //             if ($result == "1") {
    //                 $tRaceResultRecord::$raceResultRecordInfo['player_id'] = $csvData[$i][17]; //選手ID
    //                 $tRaceResultRecord::$raceResultRecordInfo['tourn_id'] = $csvData[$i][1]; //大会ID
    //                 $tRaceResultRecord::$raceResultRecordInfo['race_id'] = $csvData[$i][7]; //レースID
    //                 $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][10]; //レースNo
    //                 $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][5]; //レース区分ID 仮実装
    //                 $tRaceResultRecord::$raceResultRecordInfo['org_id'] = $csvData[$i][12]; //団体ID
    //                 $tRaceResultRecord::$raceResultRecordInfo['crew_name'] = $csvData[$i][14]; //クルー名
    //                 $tRaceResultRecord::$raceResultRecordInfo['by_group'] = $csvData[$i][9]; //組別
    //                 $tRaceResultRecord::$raceResultRecordInfo['event_id'] = $csvData[$i][3]; //種目ID
    //                 $log = $tRaceResultRecord->insertRaceResultRecord($tRaceResultRecord::$raceResultRecordInfo);
    //             } else if ($result == "2") {
    //                 $tRaceResultRecord::$raceResultRecordInfo['player_id'] = $csvData[$i][17]; //選手ID
    //                 $tRaceResultRecord::$raceResultRecordInfo['tourn_id'] = $csvData[$i][1]; //大会ID
    //                 $tRaceResultRecord::$raceResultRecordInfo['race_id'] = $csvData[$i][7]; //レースID
    //                 $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][10]; //レースNo
    //                 $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][5]; //レース区分ID 仮実装
    //                 $tRaceResultRecord::$raceResultRecordInfo['org_id'] = $csvData[$i][12]; //団体ID
    //                 $tRaceResultRecord::$raceResultRecordInfo['crew_name'] = $csvData[$i][14]; //クルー名
    //                 $tRaceResultRecord::$raceResultRecordInfo['by_group'] = $csvData[$i][9]; //組別
    //                 $tRaceResultRecord::$raceResultRecordInfo['event_id'] = $csvData[$i][3]; //種目ID
    //                 $tRaceResultRecord->updateRaceResultRecord($tRaceResultRecord::$raceResultRecordInfo);
    //             } else {
    //                 continue;
    //             }
    //         }
    //         //dd($playersInfo);

    //         return view('tournament.entry-register', ["dataList" => [], "errorMsg" => $log, "checkList" => "", "tournament_name_list" => $tournament_name_list]);
    //     } else {
    //         return view('tournament.entry-register', ["dataList" => [], "errorMsg" => "", "checkList" => "", "tournament_name_list" => $tournament_name_list]);
    //     }
    //}

    //======================================================================================================
    //======================================================================================================

    //react 選手情報参照画面に表示するuserIDに紐づいたデータを送信 20240131
    public function getTournamentInfoData(Request $request, T_tournaments $tourn)
    {
        Log::debug(sprintf("getTournamentInfoData start"));
        $reqData = $request->all();
        Log::debug($reqData['tourn_id']);
        $result = $tourn->getTournament($reqData['tourn_id']); //DBに選手を登録 20240131
        // Log::debug($result);
        Log::debug(sprintf("getTournamentInfoData end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //主催大会
    public function getTournamentInfoData_org(Request $request, T_tournaments $tourn)
    {
        Log::debug(sprintf("getTournamentInfoData_org start"));
        $reqData = $request->all();
        Log::debug($reqData['org_id']);
        $result = $tourn->getTournamentsFromOrgId($reqData['org_id']); //DBに選手を登録 20240215
        Log::debug(sprintf("getTournamentInfoData_org end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //ボランティア検索用
    public function getTournamentInfoData_allData(Request $request, T_tournaments $tourn)
    {
        Log::debug(sprintf("getTournamentInfoData_allData start"));
        // $reqData = $request->all();
        $result = $tourn->getTournament_allData();
        // Log::debug($result);
        Log::debug(sprintf("getTournamentInfoData_allData end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //reactからの大会登録 20240202
    public function storeTournamentInfoData(Request $request, T_tournaments $tTournament, T_races $tRace)
    {
        Log::debug(sprintf("storeTournamentInfoData start"));
        Log::debug($request);
        $random_file_name = Str::random(12);
        //If new PDF is uploaded
        if ($request->hasfile('tournamentFormData')) {
            $file = $request->tournamentFormData['uploadedPDFFile'];
            $file_name = $random_file_name . '.' . $file->getClientOriginalExtension();
            $destination_path = public_path() . '/pdf/tournaments/';
            $file->move($destination_path, $file_name);
        }
        $reqData = $request->all();
        // Log::debug($reqData);
        // Log::debug(isset($reqData['tableData']));
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
                    $tRace::$racesData['race_class_id'] = $reqData['tableData'][$i]['race_class_id']; //レース区分ID
                    $tRace::$racesData['race_class_name'] = $reqData['tableData'][$i]['race_class_name']; //レース区分
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
            DB::rollBack();
            Log::error('Line:' . $e->getLine() . ' message:' . $e->getMessage());
            return response()->json("失敗しました。大会登録できませんでした。", 500); //エラーメッセージを返す
        }
    }

    //reactからの大会登録 20240202
    public function updateTournamentInfoData(Request $request, T_tournaments $tTournament, T_races $tRace)
    {
        Log::debug(sprintf("updateTournamentInfoData start"));
        $random_file_name = Str::random(12);
        //If new PDF is uploaded
        if ($request->hasfile('tournamentFormData')) {
            $file = $request->tournamentFormData['uploadedPDFFile'];
            $file_name = $random_file_name . '.' . $file->getClientOriginalExtension();
            $destination_path = public_path() . '/pdf/tournaments/';
            $file->move($destination_path, $file_name);
        }
        $reqData = $request->all();

        Log::debug($reqData);
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

        if(empty($reqData['tableData']??[])){
            return response()->json("success",200);
        }   
        else{
            DB::beginTransaction();
            try {
                //レース登録リスト行数分登録する
                for ($i = 0; $i < count($reqData['tableData']); $i++) {
                    $tRace::$racesData['race_number'] = $reqData['tableData'][$i]['race_number']; //レース番号
                    if (isset($reqData['tableData'][$i]['entrysystem_race_id'])) {
                        $tRace::$racesData['entrysystem_race_id'] = $reqData['tableData'][$i]['entrysystem_race_id']; //エントリーシステムのレースID
                    }
                    $tRace::$racesData['tourn_id'] = $reqData['tableData'][$i]['tourn_id']; //大会IDに紐づける
                    $tRace::$racesData['race_name'] = $reqData['tableData'][$i]['race_name']; //レース名
                    $tRace::$racesData['event_id'] = $reqData['tableData'][$i]['event_id']; //イベントID
                    $tRace::$racesData['event_name'] = $reqData['tableData'][$i]['event_name']; //イベント名
                    $tRace::$racesData['race_class_id'] = $reqData['tableData'][$i]['race_class_id']; //レース区分ID
                    $tRace::$racesData['race_class_name'] = $reqData['tableData'][$i]['race_class_name']; //レース区分
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
                        $tRace->updateRaces($tRace::$racesData); //レースIDが存在する場合、更新処理
                        Log::debug("race update");
                    } else {
                        $tRace->insertRaces($tRace::$racesData); //レースIDが存在しない場合、挿入処理
                        Log::debug("race insert");
                    }
                }
                DB::commit();
                Log::debug(sprintf("updateTournamentInfoData end"));
                return response()->json(['reqData' => $reqData]); //DBの結果を返す
            } catch (\Throwable $e) {
                DB::rollBack();
                Log::error('Line:' . $e->getLine() . ' message:' . $e->getMessage());
                return response()->json("失敗しました。大会更新できませんでした。", 500); //エラーメッセージを返す
            }
        }
        
    }

    //react 選手情報参照画面に表示するuserIDに紐づいたデータを送信 20240131
    public function getRaceInfoData(T_races $tRace)
    {
        Log::debug(sprintf("getRaceInfoData start"));
        // $retrieve_player_by_ID = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);
        $result = $tRace->getRace(1); //レース情報を取得
        Log::debug(sprintf("getRaceInfoData end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //reactからの大会登録 20240202
    public function deleteTournamentInfoData(Request $request, T_tournaments $tTournament, T_races $tRace)
    {
        Log::debug(sprintf("deleteTournamentInfoData start"));
        $reqData = $request->all();

        //確認画面から登録
        // $tTournament::$tournamentInfo['tourn_id'] = 1;
        $tTournament::$tournamentInfo['tourn_name'] = $reqData['tournamentFormData']['tourn_name']; //大会名
        $tTournament::$tournamentInfo['sponsor_org_id'] = $reqData['tournamentFormData']['sponsor_org_id']; //主催団体ID
        $tTournament::$tournamentInfo['event_start_date'] = $reqData['tournamentFormData']['event_start_date']; //大会開始日
        $tTournament::$tournamentInfo['event_end_date'] = $reqData['tournamentFormData']['event_end_date']; //大会終了日 
        $tTournament::$tournamentInfo['venue_id'] = $reqData['tournamentFormData']['venue_id']; //水域ID
        $tTournament::$tournamentInfo['venue_name'] = $reqData['tournamentFormData']['venue_name']; //水域名
        $tTournament::$tournamentInfo['entrysystem_tourn_id'] = $reqData['tournamentFormData']['entrysystem_tourn_id']; //エントリーシステムの大会ID
        $tTournament::$tournamentInfo['delete_flag'] = 1; //エントリーシステムの大会ID
        $result = $tTournament->updateTournaments($tTournament::$tournamentInfo);

        //レース登録リスト行数分登録する
        for ($i = 0; $i < count($reqData['tableData']); $i++) {
            $tRace::$racesData['race_number'] = $reqData['tableData'][$i]['race_number']; //レース番号
            $tRace::$racesData['entrysystem_race_id'] = $reqData['tableData'][$i]['entrysystem_race_id']; //エントリーシステムのレースID
            $tRace::$racesData['tourn_id'] = $reqData['tableData'][$i]['id']; //大会IDに紐づける
            $tRace::$racesData['race_name'] = $reqData['tableData'][$i]['race_name']; //レース名
            $tRace::$racesData['event_id'] = $reqData['tableData'][$i]['event_id']; //イベントID
            $tRace::$racesData['event_name'] = $reqData['tableData'][$i]['event_name']; //イベント名
            $tRace::$racesData['race_class_id'] = $reqData['tableData'][$i]['race_class_id']; //レース区分ID
            $tRace::$racesData['race_class_name'] = $reqData['tableData'][$i]['race_class_name']; //レース区分
            $tRace::$racesData['by_group'] = $reqData['tableData'][$i]['byGroup']; //レース区分
            $tRace::$racesData['range'] = $reqData['tableData'][$i]['range']; //距離
            $tRace::$racesData['start_date_time'] = $reqData['tableData'][$i]['start_date_time']; //発艇日時
            $tRace::$racesData['delete_flag'] = 1; //削除フラグ
            $tRace->updateRaces($tRace::$racesData); //レーステーブルの挿入
        }

        Log::debug(sprintf("deleteTournamentInfoData end"));
        return response()->json(['reqData' => $reqData, 'result' => $result]); //送信データ(debug用)とDBの結果を返す
    }

    //react 選手情報参照画面に表示するuserIDに紐づいたデータを送信 20240131
    public function getRaceData(Request $request, T_races $tRace)
    {
        Log::debug(sprintf("getRaceData start"));
        $reqData = $request->all();
        Log::debug($reqData['tourn_id']);
        //$result = $tRace->getRace($reqData['tourn_id']); //レース情報を取得
        $result = $tRace->getRaces($reqData); //レース情報を取得
        if (isset($result)) {
            for ($i = 0; $i < count($result); $i++) {
                $result[$i]->id = $i;
            }
        }
        // Log::debug($result);
        Log::debug(sprintf("getRaceData end"));
        Log::debug($result);
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //大会レース結果参照画面に表示する用 20240216
    public function getTournRaceResultRecords(Request $request, T_raceResultRecord $tRaceResultRecord)
    {
        Log::debug(sprintf("getTournRaceResultRecords start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $result = $tRaceResultRecord->getRaceResultRecord_raceId($reqData['race_id']);
        Log::debug(sprintf("getTournRaceResultRecords end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //クルー情報取得 20240216
    public function getCrewData(Request $request, T_raceResultRecord $tRaceResultRecord)
    {
        Log::debug(sprintf("getCrewData start"));
        $reqData = $request->all();
        // Log::debug($reqData);
        foreach ($reqData as $key => $val) { //foreachで取り出す配列と要素の値を格納する変数を指定する。
            if ($key == 'race_id' || $key == 'crew_name' || $key == 'org_id') {
                continue;
            }
            unset($reqData[$key]);
        }
        Log::debug($reqData);
        $result = $tRaceResultRecord->getCrews($reqData);
        Log::debug(sprintf("getCrewData end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //レース結果一覧を取得 
    // public function getRaceResultsData(Request $request,T_raceResultRecord $T_raceResultRecord)
    // {
    //     $input = $request->all();
    //     //検索条件の値
    //     $searchValues = [];
    //     //置換文字列の生成
    //     $replaceString = $this->generateRaceResultSearchCondition($input,$searchValues);
    //     //レース結果一覧を取得
    //     $result = $T_raceResultRecord->getRacesWithSearchCondition($replaceString,$searchValues);
    //     return response()->json(['result' => $result]); //取得結果を返す
    // }

    //レース結果一覧を取得するための検索条件の文字列を生成する
    //SQLの文字列を置き換える
    private function generateRaceResultSearchCondition($request, &$searchValues)
    {
        $condition = "";
        //大会名
        if (isset($request['tourn_name'])) {
            $condition .= "and `tourn_name` LIKE :tourn_name\r\n";
            $searchValues['event_year'] = "%" . $request['tourn_name'] . "%";
        }
        //種目
        if (isset($request['event_id'])) {
            $condition .= "and `event_id` = :event_id\r\n";
            $searchValues['event_id'] = $request['event_id'];
        }
        //種目名
        if (isset($request['event_name'])) {
            $condition .= "and event_name LIKE :event_name\r\n";
            $searchValues['event_name'] = "%" . $request['event_name'] . "%";
        }
        //レース区分
        if (isset($request['race_class_id'])) {
            $condition .= "and race_class_id = :race_class_id\r\n";
            $searchValues['race_class_id'] = $request['race_class_id'];
        }
        //組別
        if (isset($request['by_group'])) {
            $condition .= "and by_group LIKE :by_group\r\n";
            $searchValues['by_group'] = "%" . $request['by_group'] . "%";
        }
        //レースNo.
        if (isset($request['race_number'])) {
            $condition .= "and race_number = :race_number\r\n";
            $searchValues['race_number'] = $request['race_number'];
        }
        return $condition;
    }

    //レース結果情報を登録(insert)する
    public function registRaceResultRecord(Request $request, T_raceResultRecord $t_raceResultRecord)
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        try {
            DB::beginTransaction();
            //出漕結果記録テーブルを検索
            $reqData = $request->all();
            $reqData['current_datetime'] = now()->format('Y-m-d H:i:s.u');
            $reqData['user_id'] = Auth::user()->user_id;
            $result_count = $t_raceResultRecord->getIsExistsTargetRaceResult($reqData);
            //結果が0件なら、insertを実行
            if ($result_count['result'] == 0) {
                $t_raceResultRecord->insertRaceResultRecordResponse($reqData);
                DB::commit();
                return response()->json(['errMessage' => ""]); //エラーメッセージを返す
            } else {
                DB::commit();
                //結果が1件以上存在するとき
                return response()->json(['errMessage' => $race_result_record_have_been_registred]); //エラーメッセージを返す
            }
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Line:' . $e->getLine() . ' message:' . $e->getMessage());
            return response()->json(['errMessage' => $e->getMessage()]); //エラーメッセージを返す
        }
    }

    //レース結果情報を更新(update)する
    public function updateRaceResultRecord(Request $request, T_raceResultRecord $t_raceResultRecord)
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        try {
            DB::transaction();
            //出漕結果記録テーブルを検索
            $reqData = $request->all();
            $reqData['updated_time'] = now()->format('Y-m-d H:i:s.u');
            $reqData['updated_user_id'] = Auth::user()->user_id;
            $result_count = $t_raceResultRecord->getIsExistsTargetRaceResult($reqData);
            //結果が0件なら、insertを実行
            if ($result_count['result'] > 0) {
                $t_raceResultRecord->updateRaceResultRecordsResponse($reqData);
                DB::commit();
            } else {
                DB::commit();
                //結果が存在しないとき
                return response()->json(['errMessage' => $race_result_record_have_been_deleted]); //エラーメッセージを返す
            }
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Line:' . $e->getLine() . ' message:' . $e->getMessage());
            return response()->json(['errMessage' => $e->getMessage()]); //エラーメッセージを返す
        }
    }

    //レース結果情報を削除（update delete_flag)する
    public function updateDeleteFlagOfRaceResultRecord(Request $request, T_raceResultRecord $t_raceResultRecord)
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        try {
            DB::transaction();
            //出漕結果記録テーブルを検索
            $reqData = $request->all();
            $reqData['updated_datetime'] = now()->format('Y-m-d H:i:s.u');
            $reqData['updated_user_id'] = Auth::user()->user_id;
            $result_count = $t_raceResultRecord->getIsExistsTargetRaceResultRecord($reqData);
            //結果が0件なら、insertを実行
            if ($result_count['result'] == 0) {
                $t_raceResultRecord->updateDeleteFlagToValid($reqData);
                DB::commit();
            } else {
                DB::commit();
                //結果が存在しないとき
                return response()->json(['errMessage' => $race_result_record_have_been_deleted]); //エラーメッセージを返す
            }
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Line:' . $e->getLine() . ' message:' . $e->getMessage());
            return response()->json(['errMessage' => $e->getMessage()]); //エラーメッセージを返す
        }
    }

    //DBから大会情報を削除する 20240309
    public function deleteTournamentData(Request $request, T_tournaments $tTournament)
    {
        Log::debug(sprintf("deleteTournamentData start"));
        DB::beginTransaction();
        try {
            $reqData = $request->all();
            // Log::debug($reqData);
            Log::debug($reqData['tournamentFormData']['tourn_id']);

            if (isset($reqData['tournamentFormData']['tourn_id'])) {
                $tTournament->updateDeleteFlag($reqData['tournamentFormData']['tourn_id']);
                DB::commit();
            } else {
                DB::commit();
                //結果が存在しないとき
                Log::debug(sprintf("deleteTournamentData end"));
                return response()->json(['errMessage' => "エラーメッセージ"]); //エラーメッセージを返す
            }
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Line:' . $e->getLine() . ' message:' . $e->getMessage());
            return response()->json(['errMessage' => $e->getMessage()]); //エラーメッセージを返す
        }
        Log::debug(sprintf("deleteTournamentData end"));
        return response()->json(['result' => $reqData]); //DBの結果を返す
    }

    //エントリーシステム大会ID、団体ID、エントリーシステムレースID、レースNoのバリデーションチェック
    public function tournamentRegistOrUpdateValidationCheck(Request $request, T_tournaments $tTournament)
    {
        Log::debug(sprintf("checkTournIdOrgId start"));

        $reqData = $request->all();

        Log::debug($reqData);

        $result_org_id = DB::select(
            'select `org_id`, `org_name`, `jara_org_type` from `t_organizations` where `delete_flag` = 0 and `org_id` = ?',
            [
                $request["sponsor_org_id"]
            ]
        );  //エントリーシステム大会ID確認

        $orgInfo = $result_org_id[0] ?? [];

        $response_org_id = '';
        $response_tourn_type = '';
        $response_tourn_id = '';
        $response_race_id = [];

        // Log::debug($orgInfo);
        if (empty($orgInfo)) {
            $response_org_id = "[対象項目名]の団体は、既にシステムより削除されているか、本登録されていない団体IDが入力されています。";
        } else {
            if ($request["tourn_type"] === "1") {
                if ($orgInfo->jara_org_type !== $request["tourn_type"]) {
                    $response_tourn_type = " $orgInfo->org_id ：  $orgInfo->org_name は、任意団体の為、公式大会を主催することはできません。";
                }
            }
        }

        if ($request["entrysystem_tourn_id"] !== "") {
            $result_tourn_id = DB::select(
                'select `tourn_id`, `tourn_name` from `t_tournaments` where `delete_flag` = 0 and `entrysystem_tourn_id` = ?',
                [
                    $request["entrysystem_tourn_id"]
                ]
            );
        }

        $tournInfo = $result_tourn_id[0] ?? [];

        if (!empty($tournInfo)) {
            if($reqData["mode"] === "update"){
                if($tournInfo->tourn_id !== $request["tourn_id"]){
                    $response_tourn_id = "入力されたエントリーシステムの大会IDは、既に別の大会で使用されています。 [$tournInfo->tourn_id]：[$tournInfo->tourn_name]";
                }
            }
            else{
                $response_tourn_id = "入力されたエントリーシステムの大会IDは、既に別の大会で使用されています。 [$tournInfo->tourn_id]：[$tournInfo->tourn_name]";
            }
        }

        for ($i = 0; $i < count($reqData['race_data'] ?? []); $i++) {

            $result_race_id = DB::select(
                'select `race_id`, `entrysystem_race_id` from jara_new_pf.`t_races` where `delete_flag` = 0 and `entrysystem_race_id` = ?',
                [
                    $reqData['race_data'][$i]['entrysystem_race_id']
                ]
            );

            $raceInfo = $result_race_id[0] ?? [];


            if (!empty($raceInfo)) {
                if($reqData["mode"] === "update"){
                    if($raceInfo->race_id !== $reqData['race_data'][$i]['race_id']){
                        array_push($response_race_id, "「エントリーシステムのレースID」$raceInfo->entrysystem_race_id が重複しています。");
                    }
                }
                else{
                    array_push($response_race_id, "「エントリーシステムのレースID」$raceInfo->entrysystem_race_id が重複しています。");
                }
                
            }


            $result_race_number = DB::select(
                'select `race_id`, `race_number` from jara_new_pf.`t_races` where `delete_flag` = 0 and `race_number` = ?',
                [
                    $reqData['race_data'][$i]['race_number']
                ]
            );

            $raceInfo2 = $result_race_number[0] ?? [];

            // Log::debug($raceInfo->entrysystem_race_id);

            if (!empty($raceInfo2)) {
                if($reqData["mode"] === "update"){
                    if($raceInfo2->race_id !== $reqData['race_data'][$i]['race_id']){
                        array_push($response_race_id, "「レースNo.」$raceInfo2->race_number が重複しています。");
                    }
                }
                else{
                    array_push($response_race_id, "「レースNo.」$raceInfo2->race_number が重複しています。");
                }
                
            }
            
            
        }
        if ($response_tourn_id or $response_tourn_type or $response_org_id or $response_race_id) {
            return response()->json(["response_tourn_id" => $response_tourn_id, "response_tourn_type" => $response_tourn_type, "response_org_id" => $response_org_id, "response_race_id" => $response_race_id], 400); //エラーメッセージを返す
        }


        return response()->json(["success" => $orgInfo], 200); //登録できる

    }

    //大会レース結果管理画面
    //レース結果検索
    public function searchRaceData(Request $request, T_races $t_races)
    {
        Log::debug(sprintf("searchRaceData start."));
        $reqData = $request->all();
        Log::debug($reqData);        
        $values = array();
        //検索条件の文字列を生成
        $conditionString = $this->generateRaceSearchCondition($reqData,$values);
        $getData = $t_races->getRaceResultWithCondition($conditionString,$values);
        Log::debug($getData);
        Log::debug(sprintf("searchRaceData end."));
        return response()->json(['result' => $getData]); //DBの結果を返す
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
        if(isset($reqData["raceTypeId"]))
        {
            $condition .= "and race.race_class_id = :race_class_id\r\n";
            $valueArray["race_class_id"] = $reqData["raceTypeId"];
        }
        //組別
        if(isset($reqData["byGroup"]))
        {
            $condition .= "and race.by_group = :by_group\r\n";
            $valueArray["by_group"] = $reqData["byGroup"];
        }
        //レースNo.
        if(isset($reqData["raceNo"]))
        {
            $condition .= "and race.race_number = :race_number\r\n";
            $valueArray["race_number"] = $reqData["raceNo"];
        }
        return $condition;
    }

    //大会レース結果入力画面
    //選手情報とレース情報を取得
    public function getRaceResultRecord(Request $request,T_players $t_players)
    {
        Log::debug(sprintf("getRaceResultRecord start."));
        $reqData = $request->all();
        Log::debug($reqData);
        $player_id = $reqData['player_id'];
        $race_id = $reqData['race_id'];
        $getData = $t_players->getPlayerInfoAndRaceResultRecord($player_id,$race_id);
        Log::debug(sprintf("getRaceResultRecord end."));
        return response()->json(['result' => $getData]); //DBの結果を返す
    }

    //大会レース結果入力画面
    //レース結果情報をフロントエンドに返す
    public function postRaceResultInfo()
    {

    }

    //大会レース結果入力確認画面
    //レース結果情報を登録する
    public function registerRaceResultRecord(Request $request,T_raceResultRecord $t_raceResultRecord)
    {
        Log::debug(sprintf("registerRaceResultRecord start."));
        $reqData = $request->all();
        Log::debug($reqData);
        
        //登録処理


        Log::debug(sprintf("registerRaceResultRecord end."));
        return response()->json(['result' => true]); //DBの結果を返す
    }

    //大会レース結果入力確認画面
    //更新ボタンを押して大会レース結果入力画面に遷移するときに、レース情報を取得する
    public function getRaceDataRaceId(Request $request, T_races $tRace, T_raceResultRecord $t_raceResultRecord)
    {
        Log::debug(sprintf("getRaceDataRaceId start"));
        try
        {
            $reqData = $request->all();
            Log::debug($reqData['race_id']);
            $race_result = $tRace->getRaceFromRaceId($reqData['race_id']); //レース情報を取得
            //検索結果にインデックスを付与する 20240330
            if (isset($race_result)) {
                for ($i = 0; $i < count($race_result); $i++) {
                    $race_result[$i]->id = $i;
                }
            }
            //出漕時点情報を取得
            $record_result = $t_raceResultRecord->getRaceResultRecordOnRowingPoint($reqData['race_id']);

            //レース結果情報を取得
            //$

            //レース結果情報の選手情報を取得して、レース結果情報に配列のプロパティを作成する
            // foreach($record_result as $record)
            // {
            //     $target_player_id = $record["player_id"];
            //     $target_crew_name = $record["crew_name"];
            // }
            Log::debug($race_result);
            Log::debug($record_result);
            Log::debug(sprintf("getRaceDataRaceId end"));
            return response()->json(['race_result' => $race_result,'record_result' => $record_result]); //DBの結果を返す
            //return response()->json(['race_result' => $race_result,'record_result' => $record_result, 'record_result_list' => $record_result_list]); //DBの結果を返す
        }
        catch(\Throwable $e)
        {
            Log::error('Line:'.$e->getLine().' message:'.$e->getMessage());
        }
    }

    //大会レース結果入力確認画面
    //レース結果追加ボタンを押して大会レース結果入力画面に遷移するときに、レース情報を取得する
    public function getRaceDataFromTournIdAndEventId(Request $request, T_races $tRace)
    {
        Log::debug(sprintf("getRaceDataFromTournIdAndEventId start."));
        $reqData = $request->all();
        Log::debug($reqData);
        $tourn_id = $reqData['tourn_id'];
        $event_id = $reqData['event_id'];
        $result = $tRace->getBasicRaceInfoList($tourn_id,$event_id); //レース情報を取得
        Log::debug(sprintf("getRaceDataFromTournIdAndEventId end."));
        Log::debug($result);
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //大会情報参照画面用 主催団体管理者の判別 20240402
    public function checkOrgManager(Request $request)
    {
        Log::debug(sprintf("checkOrgManager start"));
        $reqData = $request->all();
        Log::debug($reqData);

        Log::debug(sprintf("checkOrgManager end"));
        return response()->json(['result' => $reqData]); //DBの結果を返す
    }
}