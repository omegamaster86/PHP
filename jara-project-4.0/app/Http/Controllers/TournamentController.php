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
    public $tournamentInfo = [
        'tourn_id' => null,
        'tourn_name' => "testName",
        'sponsor_org_id' => null,
        'event_start_date' => null,
        'event_end_date' => null,
        'venue_id' => null,
        'venue_name' => null,
        'tourn_type' => null,
        'tourn_url' => null,
        'tourn_info_faile_path' => null,
        'entrysystem_tourn_id' => null,
    ];

    public $raceResultRecordInfo = [
        'race_result_record_id' => null,
        'user_id' => null,
        'jara_player_id' => null,
        'player_name' => null,
        'entrysystem_tourn_id' => null,
        'tourn_id' => null,
        'tourn_name' => null,
        'race_id' => null,
        'entrysystem_race_id' => null,
        'race_number' => null,
        'race_name' => null,
        'org_id' => null,
        'entrysystem_org_id' => null,
        'org_name' => null,
        'crew_name' => null,
        'by_group' => null,
        'event_id' => null,
        'event_name' => null,
        'range' => null,
        'rank' => null,
        'laptime_500m' => null,
        'laptime_1000m' => null,
        'laptime_1500m' => null,
        'laptime_2000m' => null,
        'final_time' => null,
        'stroke_rate_avg' => null,
        'stroke_rat_500m' => null,
        'stroke_rat_1000m' => null,
        'stroke_rat_1500m' => null,
        'stroke_rat_2000m' => null,
        'heart_rate_avg' => null,
        'heart_rate_500m' => null,
        'heart_rate_1000m' => null,
        'heart_rate_1500m' => null,
        'heart_rate_2000m' => null,
        'official' => null,
        'attendance' => null,
        'ergo_weight' => null,
        'crew_rep_record_flag' => null,
        'player_height' => null,
        'player_weight' => null,
        'm_sheet_number' => null,
        'sheet_name' => null,
        'race_result_record_name' => null,
        'start_datetime' => null,
        'wind_speed_2000m_point' => null,
        'wind_direction_2000m_point' => null,
        'wind_speed_1000m_point' => null,
        'wind_direction_1000m_point' => null,
    ];

    // 大会登録画面呼び出し
    public function create(Request $request): View
    {
        //一旦デバッグ用に登録・変更に同じコードを記述
        return view('tournament.register-edit', ["pagemode" => "register"]);
    }

    // 大会情報変更画面呼び出し
    public function createEdit(Request $request): View
    {
        //大会情報更新画面に必要な項目をDBからデータ構造として$collectionに入れる
        $collection = collect([
            [],
        ]);

        return view('tournament.register-edit', ["pagemode" => "edit", "tournamentData" => $collection]);
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

    public function createReference()
    {
        return view('tournament.reference', ["pagemode" => "refer"]);
    }

    public function createDelete()
    {
        return view('tournament.reference', ["pagemode" => "delete"]);
    }

    // 大会情報参照画面呼び出し
    public function dbDelete(Request $request): View
    {
        //DB::delete('delete from t_users where mailaddress = ?', [$request->mailaddress ]);
        return view('tournament.register-edit', ["pagemode" => "reference"]);
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
            'orgName' => ['required'],          //団体名
            'postCodeUpper' => ['required'],    //郵便番号            
            'postCodeLower' => ['required'],    //郵便番号            
            'prefecture' => ['required'],       //都道府県
            'address1' => ['required'],         //市区町村・町字番地
            'orgClass' => ['required'],         //団体区分
            'managerUserId' => ['required'],    //管理者のユーザID
        ];

        $errMessages = [
            'orgName.required' => $orgName_required,
            'foundingYear.required' => $foundingYear_required,
            'postCodeUpper.required' => $postCode_required,
            'postCodeLower.required' => $postCode_required,
            'prefecture.required' => $prefecture_required,
            'address1.required' => $address1_required,
            'orgClass.required' => $orgClass_required,
            'managerUserId.required' => $managerUserId_required,
        ];
        //
        $validator = Validator::make($request->all(), $rules, $errMessages);
        //追加でチェックを行う
        // $entrysystemOrgId = $tournamentInfo['entrysystemOrgId'];
        // $foundingYear = $tournamentInfo['foundingYear'];
        // $foundingYear_min = 1750;                                   //創立年最小値
        // $post_code_upper = $tournamentInfo['postCodeUpper'];
        // $post_code_lower = $tournamentInfo['postCodeLower'];
        // $jara_org_reg_trail = $tournamentInfo['jaraOrgRegTrail'];
        // $jara_org_type = $tournamentInfo['jaraOrgType'];
        // $pref_org_reg_trail = $tournamentInfo['prefOrgRegTrail'];
        // $pref_org_type = $tournamentInfo['prefOrgType'];

        return redirect('tournament/edit/confirm')->with('tournamentInfo', $tournamentInfo);
    }

    //登録（挿入）実行
    public function storeConfirmRegister(Request $request, T_tournaments $tTournament, T_raceResultRecord $tRaceResultRecord)
    {
        //確認画面から登録
        //$tournamentInfo = $request->all();
        $result = $tTournament->insertTournaments($this->tournamentInfo);
        $ListCout = 2; //レース登録リスト行数分更新する
        for ($i = 0; $i < $ListCout; $i++) {
            $result = $tRaceResultRecord->insertRaceResultRecord($this->raceResultRecordInfo);
        }

        if ($result == "success") {
            $page_status = "完了しました";
            $page_url = route('my-page');
            $page_url_text = "マイページ";

            return view('change-notification', ['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
        }
    }

    //更新実行
    public function storeConfirmEdit(Request $request, T_tournaments $tTournament, T_raceResultRecord $tRaceResultRecord)
    {
        //確認画面から登録
        //$tournamentInfo = $request->all();
        $result = $tTournament->updateTournaments($this->tournamentInfo);

        $ListCout = 2; //レース登録リスト行数分更新する
        for ($i = 0; $i < $ListCout; $i++) {
            $result = $tRaceResultRecord->updateRaceResultRecord($this->raceResultRecordInfo);
        }
        if ($result == "success") {
            $page_status = "完了しました";
            $page_url = route('my-page');
            $page_url_text = "マイページ";
            return view('change-notification', ['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
        }
    }
}
