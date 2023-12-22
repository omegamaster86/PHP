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
    public function create(Request $request): View
    {
        return view('tournament.register-edit', ["pagemode" => "register"]);
    }

    // 大会情報変更画面呼び出し
    public function createEdit(Request $request, T_tournaments $tTournaments, T_races $tRace): View
    {
        //大会情報更新に必要な、大会IDなどを取得
        $tTours = $tTournaments->getTournament(1); //大会情報を取得
        $tRaceData = $tRace->getRace(1); //レース情報を取得
        return view('tournament.register-edit', ["pagemode" => "edit", "TournamentData" => $tTours, "RaceData" => $tRaceData]);
    }

    //大会登録確認画面を開く
    public function createConfirm()
    {
        return view('tournament.register-confirm', ["pagemode" => "register"]);
    }

    //大会更新確認画面を開く
    public function createEditConfirm()
    {
        return view('tournament.register-confirm', ["pagemode" => "edit"]);
    }

    //大会情報参照画面に遷移した時
    public function createReference(T_tournaments $tTournaments, T_races $tRace)
    {
        $tTours = $tTournaments->getTournament(1); //大会情報を取得
        $tRaceData = $tRace->getRace(1); //レース情報を取得
        return view('tournament.reference', ["pagemode" => "refer", "TournamentData" => $tTours, "RaceData" => $tRaceData]);
    }

    //大会情報削除画面に遷移した時
    public function createDelete(T_tournaments $tTournaments, T_races $tRace)
    {
        $tTours = $tTournaments->getTournament(1); //大会情報を取得
        $tRaceData = $tRace->getRace(1); //レース情報を取得
        return view('tournament.reference', ["pagemode" => "delete", "TournamentData" => $tTours, "RaceData" => $tRaceData]);
    }

    //大会検索画面に遷移した時
    public function createSearch(T_tournaments $tTournaments, T_races $tRace, M_venue $venueData)
    {
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
}
