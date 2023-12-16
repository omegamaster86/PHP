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
        return view('tournament.register-edit', ["pagemode" => "edit"]);
    }

    //団体情報登録・更新確認画面を開く
    public function createConfirm()
    {
        return view('tournament.register-confirm', ["pagemode" => "register"]);
    }

    //団体情報登録・更新確認画面を開く
    public function createEditConfirm()
    {
        return view('tournament.register-confirm', ["pagemode" => "edit"]);
    }

    public function createReference(T_tournaments $tTournaments, T_races $tRace)
    {
        $tTours = $tTournaments->getTournament(1); //大会情報を取得
        $tRaceData = $tRace->getRace(1); //レース情報を取得
        return view('tournament.reference', ["pagemode" => "refer"]);
    }

    public function createDelete(T_tournaments $tTournaments, T_races $tRace)
    {
        $tTours = $tTournaments->getTournament(1); //大会情報を取得
        $tRaceData = $tRace->getRace(1); //レース情報を取得
        return view('tournament.reference', ["pagemode" => "delete"]);
    }

    //団体情報登録画面で確認ボタンを押したときに発生するイベント
    public function storeConfirm(Request $request, T_tournaments $t_organization)
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

        // $validator->errors()->add('entrysystemOrgId', $errorMessage);
        // $validator->errors()->add('entrysystemOrgId', $errorMessage);
        // $validator->errors()->add('entrysystemOrgId', $errorMessage);
        // $validator->errors()->add('entrysystemOrgId', $errorMessage);
        // $validator->errors()->add('entrysystemOrgId', $errorMessage);

        //バリデーション失敗時、セッションにエラーメッセージをフラッシュデータとして保存
        if ($validator->errors()->count() > 0) {
            return back()->withInput()->withErrors($validator);
        }

        return redirect('tournament/register/confirm')->with('tournamentInfo', $tournamentInfo);
    }


    //団体情報登録画面で確認ボタンを押したときに発生するイベント
    public function storeEditConfirm(Request $request, T_tournaments $t_organization)
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

        // $validator->errors()->add('entrysystemOrgId', $errorMessage);
        // $validator->errors()->add('entrysystemOrgId', $errorMessage);
        // $validator->errors()->add('entrysystemOrgId', $errorMessage);
        // $validator->errors()->add('entrysystemOrgId', $errorMessage);
        // $validator->errors()->add('entrysystemOrgId', $errorMessage);

        //バリデーション失敗時、セッションにエラーメッセージをフラッシュデータとして保存
        if ($validator->errors()->count() > 0) {
            return back()->withInput()->withErrors($validator);
        }

        return redirect('tournament/edit/confirm')->with('tournamentInfo', $tournamentInfo);
    }

    //登録
    public function storeConfirmRegister(Request $request, T_tournaments $tTournament, T_races $tRace, T_raceResultRecord $tRaceResultRecord)
    {
        //確認画面から登録
        //$tournamentInfo = $request->all();
        $tTournament::$tournamentInfo['tourn_id'] = 1;
        $tTournament::$tournamentInfo['tourn_name'] = "nameRegister";
        $result = $tTournament->insertTournaments($tTournament::$tournamentInfo);
        $ListCout = 3; //レース登録リスト行数分更新する
        for ($i = 0; $i < $ListCout; $i++) {
            $tRace::$racesData['race_number'] = $i;
            $tRace::$racesData['tourn_id'] = 1;
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

    //更新
    public function storeConfirmEdit(Request $request, T_tournaments $tTournament, T_races $tRace, T_raceResultRecord $tRaceResultRecord)
    {
        $targetTournamentId = 1;
        $result = "success";

        //$tournamentInfo = $request->all();
        $tTournament::$tournamentInfo['tourn_id'] = $targetTournamentId;
        $result = $tTournament->updateTournaments($tTournament::$tournamentInfo); //大会テーブルの更新

        $tRace::$racesData['tourn_id'] = $targetTournamentId;
        $tRace::$racesData['race_name'] = "nameUpdate";
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

    //削除（削除フラグの更新）
    public function deleteTournament(Request $request, T_tournaments $tTournament, T_races $tRace, T_raceResultRecord $tRaceResultRecord): View
    {
        $targetTournamentId = 1;
        $result = "success";

        //$tournamentInfo = $request->all();
        $tTournament::$tournamentInfo['tourn_id'] = $targetTournamentId;
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
}
