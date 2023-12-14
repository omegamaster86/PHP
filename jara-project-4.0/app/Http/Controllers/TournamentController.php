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

    public function createRefecence()
    {
        return view('tournament.reference', ["pagemode" => "refer"]);
    }

    public function createDelete()
    {
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
    public function storeConfirmRegister(Request $request, T_tournaments $tTournament,)
    {
        //確認画面から登録
        $tournamentInfo = $request->all();
        $result = $tTournament->insertTournaments($tournamentInfo);

        if ($result == "success") {
            $page_status = "完了しました";
            $page_url = route('my-page');
            $page_url_text = "マイページ";

            return view('change-notification', ['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
        }
    }

    //更新実行
    public function storeConfirmEdit(Request $request, T_tournaments $tTournament)
    {
        //確認画面から登録
        $tournamentInfo = $request->all();
        $result = $tTournament->updateTournaments($tournamentInfo);
        if ($result == "success") {
            $page_status = "完了しました";
            $page_url = route('my-page');
            $page_url_text = "マイページ";
            return view('change-notification', ['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
        }
    }

    // 大会情報確認画面呼び出し
    public function create02(Request $request): View
    {
        return view('tournament.register-edit', ["pagemode" => "confirm"]);
    }
    // 大会情報削除画面呼び出し
    public function create03(Request $request): View
    {
        return view('tournament.register-edit', ["pagemode" => "delete"]);
    }
    // 大会情報参照画面呼び出し
    public function createReference(Request $request): View
    {
        return view('tournament.register-edit', ["pagemode" => "reference"]);
    }

    //登録画面から確認画面に遷移する際に呼ばれる
    public function storeRegister(Request $request): RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        $request->validate([
            'tournamentName' => ['required', 'string', 'max:32', 'regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_][ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]*[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_]$/'],
            'sponsoreTeamId' => ['required'],
            'startDay' => ['required'],
            'endDay' => ['required'],
            'venueSelect' => ['required'],
            'venueTxt' => ['nullable', 'required_if:venueSelect,other', 'string'],
            'race_number' => ['required'],
            'races_event' => ['required'],
            'races_name' => ['required'],
            'races_group' => ['required'],
            'races_distance' => ['required'],
            'races_dayTime' => ['required'],
        ], [
            'tournamentName.required' => $tournament_name_required,
            'tournamentName.max' => $tournament_name_max_limit,
            'tournamentName.regex' => $tournament_name_regex,
            'sponsoreTeamId.required' => $tournament_id,
            'startDay.required' => $tournament_startDay,
            'endDay.required' => $tournament_endDay,
            'venueSelect.required' => $tournament_venueSelect,
            'venueTxt.required_if' => $tournament_venueSelectTxt,
            'race_number.required' => $tournament_races_No,
            'races_event.required' => $tournament_races_event,
            'races_name.required' => $tournament_races_name,
            'races_group.required' => $tournament_races_group,
            'races_distance.required' => $tournament_races_distance,
            'races_dayTime.required' => $tournament_races_dayTime,
        ]);

        $tournamentInfo = $request->all();
        $tournamentInfo['previousPageStatus'] = "success";
        return redirect('tournament/register/confirm')->with('tournamentInfo', $tournamentInfo);
    }

    //変更画面から確認画面に遷移する際に呼ばれる
    public function storeEdit(Request $request): RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        $request->validate([
            'tournamentName' => ['required'],
            'sponsoreTeamId' => ['required'],
            'startDay' => ['required'],
            'endDay' => ['required'],
            'venueSelect' => ['required'],

            'race_number' => ['required'],
            'races_event' => ['required'],
            'races_name' => ['required'],
            'races_group' => ['required'],
            'races_distance' => ['required'],
            'races_dayTime' => ['required'],
        ], [
            'tournamentName.required' => $tournament_name_required,
            'sponsoreTeamId.required' => $tournament_id,
            'startDay.required' => $tournament_startDay,
            'endDay.required' => $tournament_endDay,
            'venueSelect.required' => $tournament_venueSelect,

            'race_number.required' => $tournament_races_No,
            'races_event.required' => $tournament_races_event,
            'races_name.required' => $tournament_races_name,
            'races_group.required' => $tournament_races_group,
            'races_distance.required' => $tournament_races_distance,
            'races_dayTime.required' => $tournament_races_dayTime,
        ]);

        $tournamentInfo = $request->all();
        $tournamentInfo['previousPageStatus'] = "success";
        return redirect('tournament/edit/confirm')->with('tournamentInfo', $tournamentInfo);
    }

    public function storeRegisterConfirm(Request $request): RedirectResponse
    {
        // Insert new tournament info in the database.(t_tournaments table)
        //$userId = (string) (Auth::user()->userId);
        DB::beginTransaction();
        try {
            DB::insert('insert into t_tournaments (tourn_id, tourn_name, sponsor_org_id, event_start_date, event_end_date, venue_id, venue_name,tourn_type,tourn_url,tourn_info_faile_path,entrysystem_tourn_id,registered_time,registered_user_id,updated_time,updated_user_id,delete_flag) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [210, $request->tournamentName, $request->sponsoreTeamId, $request->startDay, $request->endDay, 0001, 0001, 0001, 0001, 0001, 0001, now(), 0001, now(), 0001, 000]);
            DB::commit();
            $page_status = "完了しました";
            $page_url = route('my-page');
            $page_url_text = "マイページ";

            return redirect('change-notification')->with(['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
        } catch (\Throwable $e) {
            dd($e);
            // dd($request->all());
            dd("stop");
            DB::rollBack();
        }
    }
}
