<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\View\View;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Illuminate\Validation\ValidationException;
use League\CommonMark\Node\Inline\Newline;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Session;
use App\Models\T_tournaments;
use App\Models\T_races;
use App\Models\T_raceResultRecord;
use App\Models\T_organizations;
use App\Models\M_venue;
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
    // 大会登録画面呼び出し
    public function create(Request $request)
    {
        //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        }
        return view('tournament.register-edit', ["pagemode" => "register"]);
    }

    // 大会情報変更画面呼び出し
    public function createEdit(Request $request, T_tournaments $tTournaments, T_races $tRace)
    {
        //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        }
        //大会情報更新に必要な、大会IDなどを取得
        $tTours = $tTournaments->getTournament(1); //大会情報を取得
        $tRaceData = $tRace->getRace(1); //レース情報を取得
        return view('tournament.register-edit', ["pagemode" => "edit", "TournamentData" => $tTours, "RaceData" => $tRaceData]);
    }

    //大会登録確認画面を開く
    public function createConfirm()
    {
        //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        }
        return view('tournament.register-confirm', ["pagemode" => "register"]);
    }

    //大会更新確認画面を開く
    public function createEditConfirm()
    {
        //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        }
        return view('tournament.register-confirm', ["pagemode" => "edit"]);
    }

    //大会情報参照画面に遷移した時
    public function createReference(T_tournaments $tTournaments, T_races $tRace)
    {
        //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        }
        $tTours = $tTournaments->getTournament(1); //大会情報を取得
        $tRaceData = $tRace->getRace(1); //レース情報を取得
        return view('tournament.reference', ["pagemode" => "refer", "TournamentData" => $tTours, "RaceData" => $tRaceData]);
    }

    //大会情報削除画面に遷移した時
    public function createDelete(T_tournaments $tTournaments, T_races $tRace)
    {
        //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        }
        $tTours = $tTournaments->getTournament(1); //大会情報を取得
        $tRaceData = $tRace->getRace(1); //レース情報を取得
        return view('tournament.reference', ["pagemode" => "delete", "TournamentData" => $tTours, "RaceData" => $tRaceData]);
    }

    //大会検索画面に遷移した時
    public function createSearch(T_tournaments $tTournaments, T_races $tRace, M_venue $venueData)
    {
        //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        }
        $tournamentInfo = "";
        $tournamentList = "";
        $venueList = $venueData->getVenueList();
        return view('tournament.search', ["pagemode" => "search", "tournamentInfo" => $tournamentInfo, "tournamentList" => $tournamentList, "venueList" => $venueList]);
    }

    //大会情報登録画面で確認ボタンを押した時
    public function storeConfirm(Request $request, T_tournaments $t_organization, T_organizations $tOrganization)
    {
        $tournamentInfo = $request->all();
        include('Auth/ErrorMessages/ErrorMessages.php');
        $rules = [
            'tName' => ['required'],          //大会名
            'tId' => ['required'],    //主催団体ID            
            'tStartDay' => ['required'],    //開催開始年月日            
            'tEndDay' => ['required'],       //開催終了年月日
            'tVenueSelect' => ['required'],         //開催場所
            //'addrtVenueSelectTxtess1' => ['required'],         //開催場所入力欄
        ];

        $errMessages = [
            'tName.required' => $tournament_name_required,
            'tId.required' => $tournament_id_required,
            'tStartDay.required' => $tournament_startDay_required,
            'tEndDay.required' => $tournament_endDay_required,
            'tVenueSelect.required' => $tournament_venueSelect_required,
            //'tVenueSelectTxt.required' => $tournament_venueSelectTxt_required,
        ];
        //
        $validator = Validator::make($request->all(), $rules, $errMessages);

        //追加でチェックを行う        
        //主催団体が「任意団体」で大会種別が「公式」だった場合エラーメッセージを表示
        if (!empty($tournamentInfo['tId'])) {
            $orgDataList = $tOrganization->getOrganization((int)$tournamentInfo['tId']); //団体IDを元に団体情報を取得
            $officialFlag = $tournamentInfo['officialFlag'];
            if (($orgDataList->jara_org_type == 0 && $orgDataList->pref_org_type == 0) &&  $officialFlag == "2") {
                $validator->errors()->add('officialFlag', $tournament_official);
            }
        }

        //開催開始年月日と終了年月日のチェックを行う
        $tStartDay = (int)str_replace('-', '', $tournamentInfo['tStartDay']);
        $tEndDay = (int)str_replace('-', '', $tournamentInfo['tEndDay']);
        if (!empty($tStartDay) && !empty($tEndDay) && ($tEndDay < $tStartDay)) {
            $validator->errors()->add('tEndDay', $tournament_endDayRange);
        }

        //バリデーション失敗時、セッションにエラーメッセージをフラッシュデータとして保存
        if ($validator->errors()->count() > 0) {
            return back()->withInput()->withErrors($validator);
        }

        return redirect('tournament/register/confirm')->with('tournamentInfo', $tournamentInfo);
    }


    //大会情報更新画面で確認ボタンを押した時
    public function storeEditConfirm(Request $request, T_tournaments $t_organization, T_organizations $tOrganization)
    {
        $tournamentInfo = $request->all();
        include('Auth/ErrorMessages/ErrorMessages.php');
        $rules = [
            'tName' => ['required'],          //大会名
            'tId' => ['required'],    //主催団体ID            
            'tStartDay' => ['required'],    //開催開始年月日            
            'tEndDay' => ['required'],       //開催終了年月日
            'tVenueSelect' => ['required'],         //開催場所
            //'addrtVenueSelectTxtess1' => ['required'],         //開催場所入力欄
        ];

        $errMessages = [
            'tName.required' => $tournament_name_required,
            'tId.required' => $tournament_id_required,
            'tStartDay.required' => $tournament_startDay_required,
            'tEndDay.required' => $tournament_endDay_required,
            'tVenueSelect.required' => $tournament_venueSelect_required,
            //'tVenueSelectTxt.required' => $tournament_venueSelectTxt_required,
        ];
        //
        $validator = Validator::make($request->all(), $rules, $errMessages);

        //追加でチェックを行う
        //主催団体が「任意団体」で大会種別が「公式」だった場合エラーメッセージを表示
        if (!empty($tournamentInfo['tId'])) {
            $orgDataList = $tOrganization->getOrganization((int)$tournamentInfo['tId']); //団体IDを元に団体情報を取得
            $officialFlag = $tournamentInfo['officialFlag'];
            if (($orgDataList->jara_org_type == 0 && $orgDataList->pref_org_type == 0) &&  $officialFlag == "2") {
                $validator->errors()->add('officialFlag', $tournament_official);
            }
        }

        //開催開始年月日と終了年月日のチェックを行う
        $tStartDay = (int)str_replace('-', '', $tournamentInfo['tStartDay']);
        $tEndDay = (int)str_replace('-', '', $tournamentInfo['tEndDay']);
        if (!empty($tStartDay) && !empty($tEndDay) && ($tEndDay < $tStartDay)) {
            $validator->errors()->add('tEndDay', $tournament_endDayRange);
        }

        //バリデーション失敗時、セッションにエラーメッセージをフラッシュデータとして保存
        if ($validator->errors()->count() > 0) {
            return back()->withInput()->withErrors($validator);
        }

        return redirect('tournament/edit/confirm')->with('tournamentInfo', $tournamentInfo);
    }

    //登録ボタンを押した時
    public function storeConfirmRegister(Request $request, T_tournaments $tTournament, T_races $tRace, T_raceResultRecord $tRaceResultRecord)
    {
        //確認画面から登録
        //$tournamentInfo = $request->all();
        $tTournament::$tournamentInfo['tourn_id'] = 1;
        $tTournament::$tournamentInfo['tourn_name'] = "Register";
        $result = $tTournament->insertTournaments($tTournament::$tournamentInfo);
        $ListCout = 3; //レース登録リスト行数分更新する
        for ($i = 0; $i < $ListCout; $i++) {
            $tRace::$racesData['race_number'] = $i;
            $tRace::$racesData['tourn_id'] = $result[1]; //大会IDに紐づける
            $tRace::$racesData['race_name'] = $i;
            $tRace::$racesData['event_id'] = $i;
            $tRace->insertRaces($tRace::$racesData); //レーステーブルの挿入
        }

        $ListCout = 2; //出漕結果リスト行数分更新する
        for ($i = 0; $i < $ListCout; $i++) {
            $result = $tRaceResultRecord->insertRaceResultRecord($tRaceResultRecord::$raceResultRecordInfo); //出漕結果テーブルの挿入
        }

        if ($result == "success") {
            $page_status = "完了しました";
            $page_url = route('my-page');
            $page_url_text = "マイページ";

            return view('change-notification', ['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
        }
    }

    //更新ボタンを押した時
    public function storeConfirmEdit(Request $request, T_tournaments $tTournament, T_races $tRace, T_raceResultRecord $tRaceResultRecord)
    {
        $targetTournamentId = 1;
        $result = "success";

        //$tournamentInfo = $request->all();
        $tTournament::$tournamentInfo['tourn_id'] = $targetTournamentId;
        $tTournament::$tournamentInfo['tourn_name'] = "Update";
        $result = $tTournament->updateTournaments($tTournament::$tournamentInfo); //大会テーブルの更新

        $tRace::$racesData['tourn_id'] = $targetTournamentId;
        $tRace::$racesData['race_name'] = "Update";
        $tRace::$racesData['event_id'] = 9;
        $result = $tRace->updateRaces($tRace::$racesData); //レーステーブルの更新

        $tRaceResultRecord::$raceResultRecordInfo['tourn_id'] = $targetTournamentId;
        $result = $tRaceResultRecord->updateRaceResultRecord($tRaceResultRecord::$raceResultRecordInfo); //出漕結果テーブルの更新

        if ($result == "success") {
            $page_status = "完了しました";
            $page_url = route('my-page');
            $page_url_text = "マイページ";
            return view('change-notification', ['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
        }
    }

    //削除ボタンを押した時（削除フラグの更新）
    public function deleteTournament(Request $request, T_tournaments $tTournament, T_races $tRace, T_raceResultRecord $tRaceResultRecord): View
    {
        $targetTournamentId = 1;
        $result = "success";

        //$tournamentInfo = $request->all();
        $tTournament::$tournamentInfo['tourn_id'] = $targetTournamentId;
        $tTournament::$tournamentInfo['tourn_name'] = "Delete";
        $tTournament::$tournamentInfo['delete_flag'] = 1;
        $result = $tTournament->updateTournaments($tTournament::$tournamentInfo); //大会テーブルの更新

        $tRace::$racesData['tourn_id'] = $targetTournamentId;
        $tRace::$racesData['race_name'] = "Delete";
        $tRace::$racesData['event_id'] = 0;
        $tRace::$racesData['delete_flag'] = 1;
        $result = $tRace->updateRaces($tRace::$racesData); //レーステーブルの更新

        $tRaceResultRecord::$raceResultRecordInfo['tourn_id'] = $targetTournamentId;
        $tRaceResultRecord::$raceResultRecordInfo['delete_flag'] = 1;
        $result = $tRaceResultRecord->updateRaceResultRecord($tRaceResultRecord::$raceResultRecordInfo); //出漕結果テーブルの更新

        if ($result == "success") {
            $page_status = "完了しました";
            $page_url = route('my-page');
            $page_url_text = "マイページ";
            return view('change-notification', ['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
        }
    }

    //----------------大会検索で使用　ここから----------------------------
    private function generateSearchCondition($searchInfo)
    {
        $condition = "";
        if (isset($searchInfo['jaraPId'])) {
            $condition .= " and `t_race_result_record`.`jara_player_id`=" . $searchInfo['jaraPId']; //JARA選手コード
        }
        if (isset($searchInfo['pId'])) {
            $condition .= " and `t_race_result_record`.`player_id`=" . $searchInfo['pId']; //選手ID
        }
        if (isset($searchInfo['pName'])) {
            $condition .= " and `t_race_result_record`.`player_name` like " . "\"%" . $searchInfo['pName'] . "%\""; //選手名
        }
        if (isset($searchInfo['tName'])) {
            $condition .= " and `t_tournaments`.`tourn_name` like " . "\"%" . $searchInfo['tName'] . "%\""; //大会名
        }
        if (isset($searchInfo['startDay'])) {
            $condition .= " and `t_tournaments`.`event_start_date`>= CAST('" . $searchInfo['startDay'] . "' AS DATE)"; //開催開始年月日
        }
        if (isset($searchInfo['endDay'])) {
            $condition .= " and `t_tournaments`.`event_end_date` <= CAST('" . $searchInfo['endDay'] . "' AS DATE)"; //開催終了年月日
        }
        if (isset($searchInfo['tVenueSelect'])) {
            $condition .= " and `t_tournaments`.`venue_id` = " . $searchInfo['tVenueSelect']; //開催場所
        }
        if (isset($searchInfo['sponsorOrgId'])) {
            $condition .= " and `t_tournaments`.`sponsor_org_id`= " . $searchInfo['sponsorOrgId']; //主催団体ID
        }
        if (isset($searchInfo['sponsorOrgName'])) {
            $condition .= " and `t_organizations`.`org_name` like " . "\"%" . $searchInfo['sponsorOrgName'] . "%\""; //主催団体名
        }

        return $condition;
    }

    public function searchTournament(Request $request, T_tournaments $tTournaments, M_venue $venueData)
    {
        $searchInfo = $request->all();
        $searchCondition = $this->generateSearchCondition($searchInfo);
        $tournamentList =  $tTournaments->getTournamentWithSearchCondition($searchCondition);
        $venueList = $venueData->getVenueList();

        if ($searchInfo['tVenueSelect'] == "") {
            //選択された開催場所が「その他」の場合、大会テーブルの「venue_name」を表示
        } else {
            //「その他」以外が選択されていた場合、水域マスターに紐づいた水域名を表示
        }

        return view('tournament.search', ["pagemode" => "search", "tournamentInfo" => $searchInfo, "tournamentList" => $tournamentList, "venueList" => $venueList]);
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
    public function createEntryRegister(T_tournaments $tourn)
    {
        $tournament_name_list = $tourn->getTournamentName();
        return view("tournament.entry-register", ["dataList" => [], "errorMsg" => "", "checkList" => "", "tournament_name_list" => $tournament_name_list]);

        //user can visit this page if he/she is an admin
        // if (((Auth::user()->user_type & "01000000") === "01000000") or ((Auth::user()->user_type & "00100000") === "00100000") or ((Auth::user()->user_type & "00010000") === "00010000") or ((Auth::user()->user_type & "00001000") === "00001000")) {
        //     $tournament_name_list = $tourn->getTournamentName();
        //     return view("tournament.entry-register", ["dataList" => [], "errorMsg" => "", "checkList" => "", "tournament_name_list" => $tournament_name_list]);
        // }
        // //redirect to my-page those have no permission to access tournament-entry-register page
        // else {
        //     return redirect('my-page');
        // }
    }
    public function csvReadEntryRegister(Request $request, T_tournaments $tourn, T_races $tRace, T_raceResultRecord $tRaceResultRecord)
    {

        $tournament_name_list = $tourn->getTournamentName();

        if ($request->has('csvRead')) { // 参照ボタンクリック
            // CSVファイルが存在するかの確認
            if ($request->hasFile('csvFile')) {
                //拡張子がCSVであるかの確認
                if ($request->csvFile->getClientOriginalExtension() !== "csv") {
                    // throw new Exception('このファイルはCSVファイルではありません');
                    return view('tournament.entry-register', ["dataList" => [], "errorMsg" => "このファイルはCSVファイルではありません", "checkList" => "", "tournament_name_list" => $tournament_name_list]);
                }
                //ファイルの保存
                $newCsvFileName = $request->csvFile->getClientOriginalName();
                $request->csvFile->storeAs('public/csv', $newCsvFileName);
            } else {
                // throw new Exception('ファイルを取得できませんでした');
                return view('tournament.entry-register', ["dataList" => [], "errorMsg" => "ファイルを取得できませんでした。<br/>入力したファイルパスを確認してください", "checkList" => "", "tournament_name_list" => $tournament_name_list]);
            }
            //保存したCSVファイルの取得
            $csv = Storage::disk('local')->get("public/csv/{$newCsvFileName}");
            // OS間やファイルで違う改行コードをexplode統一
            $csv = str_replace(array("\r\n", "\r"), "\n", $csv);
            // $csvを元に行単位のコレクション作成。explodeで改行ごとに分解

            $csvList = collect(explode("\n", $csv));
            $csvList = $csvList->toArray();
            $checkList = array();
            $dataList = array();
            for ($i = 1; $i < count($csvList); $i++) {
                $value = explode(',', $csvList[$i]);
                $dataList[$i] = $value;
            }

            return view('tournament.entry-register', ["dataList" => $dataList, "errorMsg" => "", "checkList" => $checkList, "tournament_name_list" => $tournament_name_list]);
        } else if ($request->has('dbUpload')) { // 登録ボタンクリック
            $csvData = Session::get('dataList');
            // dd($csvData[1][5]);
            // $result = explode(',', $request->Flag01);
            $result = "1";
            //dd($csvData);
            for ($i = 1; $i < count($csvData); $i++) {
                if ($result == "1") {
                    $tRaceResultRecord::$raceResultRecordInfo['player_id'] = $csvData[$i][17]; //選手ID
                    $tRaceResultRecord::$raceResultRecordInfo['tourn_id'] = $csvData[$i][1]; //大会ID
                    $tRaceResultRecord::$raceResultRecordInfo['race_id'] = $csvData[$i][7]; //レースID
                    $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][10]; //レースNo
                    $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][5]; //レース区分ID 仮実装
                    $tRaceResultRecord::$raceResultRecordInfo['org_id'] = $csvData[$i][12]; //団体ID
                    $tRaceResultRecord::$raceResultRecordInfo['crew_name'] = $csvData[$i][14]; //クルー名
                    $tRaceResultRecord::$raceResultRecordInfo['by_group'] = $csvData[$i][9]; //組別
                    $tRaceResultRecord::$raceResultRecordInfo['event_id'] = $csvData[$i][3]; //種目ID
                    $log = $tRaceResultRecord->insertRaceResultRecord($tRaceResultRecord::$raceResultRecordInfo);
                } else if ($result == "2") {
                    $tRaceResultRecord::$raceResultRecordInfo['player_id'] = $csvData[$i][17]; //選手ID
                    $tRaceResultRecord::$raceResultRecordInfo['tourn_id'] = $csvData[$i][1]; //大会ID
                    $tRaceResultRecord::$raceResultRecordInfo['race_id'] = $csvData[$i][7]; //レースID
                    $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][10]; //レースNo
                    $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][5]; //レース区分ID 仮実装
                    $tRaceResultRecord::$raceResultRecordInfo['org_id'] = $csvData[$i][12]; //団体ID
                    $tRaceResultRecord::$raceResultRecordInfo['crew_name'] = $csvData[$i][14]; //クルー名
                    $tRaceResultRecord::$raceResultRecordInfo['by_group'] = $csvData[$i][9]; //組別
                    $tRaceResultRecord::$raceResultRecordInfo['event_id'] = $csvData[$i][3]; //種目ID
                    $tRaceResultRecord->updateRaceResultRecord($tRaceResultRecord::$raceResultRecordInfo);
                } else {
                    continue;
                }
            }
            //dd($playersInfo);

            return view('tournament.entry-register', ["dataList" => [], "errorMsg" => $log, "checkList" => "", "tournament_name_list" => $tournament_name_list]);
        } else {
            return view('tournament.entry-register', ["dataList" => [], "errorMsg" => "", "checkList" => "", "tournament_name_list" => $tournament_name_list]);
        }
    }

    //======================================================================================================
    //======================================================================================================

    //react 選手情報参照画面に表示するuserIDに紐づいたデータを送信 20240131
    public function getTournamentInfoData(T_tournaments $tourn)
    {
        Log::debug(sprintf("getTournamentInfoData start"));
        // $retrieve_player_by_ID = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);
        $result = $tourn->getTournament(1); //DBに選手を登録 20240131
        Log::debug(sprintf("getTournamentInfoData end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //reactからの大会登録 20240202
    public function storeTournamentInfoData(Request $request, T_tournaments $tTournament, T_races $tRace)
    {
        Log::debug(sprintf("storeTournamentInfoData start"));
        $reqData = $request->all();
       
        //確認画面から登録
        // $tTournament::$tournamentInfo['tourn_id'] = 1;
        $tTournament::$tournamentInfo['tourn_name'] = $reqData['tournamentFormData']['tournName']; //大会名
        $tTournament::$tournamentInfo['sponsor_org_id'] = $reqData['tournamentFormData']['sponsorOrgId']; //主催団体ID
        $tTournament::$tournamentInfo['event_start_date'] = $reqData['tournamentFormData']['eventStartDate']; //大会開始日
        $tTournament::$tournamentInfo['event_end_date'] = $reqData['tournamentFormData']['eventEndDate']; //大会終了日 
        $tTournament::$tournamentInfo['venue_id'] = $reqData['tournamentFormData']['venueId']; //水域ID
        $tTournament::$tournamentInfo['venue_name'] = $reqData['tournamentFormData']['venueIdName']; //水域名
        $tTournament::$tournamentInfo['entrysystem_tourn_id'] = $reqData['tournamentFormData']['entrysystemRaceId']; //エントリーシステムの大会ID
        $result = $tTournament->insertTournaments($tTournament::$tournamentInfo);

        //レース登録リスト行数分登録する
        for ($i = 0; $i < count($reqData['tableData']); $i++) {
            $tRace::$racesData['race_number'] = $reqData['tableData'][$i]['raceNumber']; //レース番号
            $tRace::$racesData['entrysystem_race_id'] = $reqData['tableData'][$i]['entrysystemRaceId']; //エントリーシステムのレースID
            $tRace::$racesData['tourn_id'] = $reqData['tableData'][$i]['id']; //大会IDに紐づける
            $tRace::$racesData['race_name'] = $reqData['tableData'][$i]['raceName']; //レース名
            $tRace::$racesData['event_id'] = $reqData['tableData'][$i]['eventId']; //イベントID
            $tRace::$racesData['event_name'] = $reqData['tableData'][$i]['eventName']; //イベント名
            $tRace::$racesData['race_class_id'] = $reqData['tableData'][$i]['raceType']; //レース区分ID
            $tRace::$racesData['race_class_name'] = $reqData['tableData'][$i]['raceTypeName']; //レース区分
            $tRace::$racesData['by_group'] = $reqData['tableData'][$i]['byGroup']; //レース区分
            $tRace::$racesData['range'] = $reqData['tableData'][$i]['range']; //距離
            $tRace::$racesData['start_datetime'] = $reqData['tableData'][$i]['startDateTime']; //発艇日時
            $tRace->insertRaces($tRace::$racesData); //レーステーブルの挿入
        }

        Log::debug(sprintf("storeTournamentInfoData end"));
        return response()->json(['reqData' => $reqData, 'result' => $result]); //送信データ(debug用)とDBの結果を返す
    }
}
