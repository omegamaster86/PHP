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
        //return view('tournament.register-edit',["pageMode"=>"register"]);

        //登録ユーザIDがログイン中のユーザIDと一致する大会情報を取得
        $retrive_tournamentsData = DB::select('select * from t_tournaments where registered_user_id = ?', [Auth::user()->userId]);
        if(empty($retrive_tournamentsData[0])){
            //return view('player.register',["pageMode"=>"register"]);
        }
            
        $recent_tournaments_array = count($retrive_tournamentsData)-1;
        if($retrive_tournamentsData[$recent_tournaments_array]->delete_flag) {
            //return view('player.register',["pageMode"=>"register"]);
        }

        //大会情報更新画面に必要な項目をDBからデータ構造として$collectionに入れる
        $collection = collect([
            [
                'tourn_id' => $retrive_tournamentsData[$recent_tournaments_array]->delete_flag, 
                'tourn_name' => $retrive_tournamentsData[$recent_tournaments_array]->tourn_name, 
                'sponsor_org_id' => $retrive_tournamentsData[$recent_tournaments_array]->sponsor_org_id, 
                'event_start_date' => $retrive_tournamentsData[$recent_tournaments_array]->event_start_date, 
                'event_end_date' => $retrive_tournamentsData[$recent_tournaments_array]->event_end_date, 
                'venue_id' => $retrive_tournamentsData[$recent_tournaments_array]->venue_id, 
                'venue_name' => $retrive_tournamentsData[$recent_tournaments_array]->venue_name, 
                'tourn_type' => $retrive_tournamentsData[$recent_tournaments_array]->tourn_type, 
                'tourn_url' => $retrive_tournamentsData[$recent_tournaments_array]->tourn_url, 
                'tourn_info_faile_path' => $retrive_tournamentsData[$recent_tournaments_array]->tourn_info_faile_path, 
                'entrysystem_tourn_id' => $retrive_tournamentsData[$recent_tournaments_array]->entrysystem_tourn_id, 
                'registered_time' => $retrive_tournamentsData[$recent_tournaments_array]->registered_time, 
                'registered_user_id' => $retrive_tournamentsData[$recent_tournaments_array]->registered_user_id, 
                'updated_time' => $retrive_tournamentsData[$recent_tournaments_array]->updated_time, 
                'updated_user_id' => $retrive_tournamentsData[$recent_tournaments_array]->updated_user_id
            ],
        ]);

        return view('tournament.register-edit',["pageMode"=>"register","tournamentData"=>$collection]);
    }
    // 大会情報変更画面呼び出し
    public function create01(Request $request): View
    {
        //登録ユーザIDがログイン中のユーザIDと一致する大会情報を取得
        $retrive_tournamentsData = DB::select('select * from t_tournaments where registered_user_id = ?', [Auth::user()->userId]);
        if(empty($retrive_tournamentsData[0])){
            //return view('player.register',["pageMode"=>"register"]);
        }
        
        // 最近のデータを取得する
        $recent_tournaments_array = count($retrive_tournamentsData)-1;
        if($retrive_tournamentsData[$recent_tournaments_array]->delete_flag) {
            //return view('player.register',["pageMode"=>"register"]);
        }

        //大会情報更新画面に必要な項目をDBからデータ構造として$collectionに入れる
        $collection = collect([
            [
                'tourn_id' => $retrive_tournamentsData[$recent_tournaments_array]->delete_flag, 
                'tourn_name' => $retrive_tournamentsData[$recent_tournaments_array]->tourn_name, 
                'sponsor_org_id' => $retrive_tournamentsData[$recent_tournaments_array]->sponsor_org_id, 
                'event_start_date' => $retrive_tournamentsData[$recent_tournaments_array]->event_start_date, 
                'event_end_date' => $retrive_tournamentsData[$recent_tournaments_array]->event_end_date, 
                'venue_id' => $retrive_tournamentsData[$recent_tournaments_array]->venue_id, 
                'venue_name' => $retrive_tournamentsData[$recent_tournaments_array]->venue_name, 
                'tourn_type' => $retrive_tournamentsData[$recent_tournaments_array]->tourn_type, 
                'tourn_url' => $retrive_tournamentsData[$recent_tournaments_array]->tourn_url, 
                'tourn_info_faile_path' => $retrive_tournamentsData[$recent_tournaments_array]->tourn_info_faile_path, 
                'entrysystem_tourn_id' => $retrive_tournamentsData[$recent_tournaments_array]->entrysystem_tourn_id, 
                'registered_time' => $retrive_tournamentsData[$recent_tournaments_array]->registered_time, 
                'registered_user_id' => $retrive_tournamentsData[$recent_tournaments_array]->registered_user_id, 
                'updated_time' => $retrive_tournamentsData[$recent_tournaments_array]->updated_time, 
                'updated_user_id' => $retrive_tournamentsData[$recent_tournaments_array]->updated_user_id
            ],
        ]);

        return view('tournament.register-edit',["pageMode"=>"edit","tournamentData"=>$collection]);
    }
    // 大会情報確認画面呼び出し
    public function create02(Request $request): View
    {
        return view('tournament.register-edit',["pageMode"=>"confirm"]);
    }
    // 大会情報削除画面呼び出し
    public function create03(Request $request): View
    {
        return view('tournament.register-edit',["pageMode"=>"delete"]);
    }
    // 大会情報参照画面呼び出し
    public function createReference(Request $request): View
    {
        return view('tournament.register-edit',["pageMode"=>"reference"]);
    }

    //登録画面から確認画面に遷移する際に呼ばれる
    public function storeRegister(Request $request) : RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        $request->validate([
            'tournamentName' => ['required', 'string', 'max:32','regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_][ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]*[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_]$/'],
            'sponsoreTeamId' => ['required'],
            'startDay' => ['required'],
            'endDay' => ['required'],
            'venueSelect' => ['required'],
            'venueTxt' => ['nullable','required_if:venueSelect,other','string'],
            'race_number' => ['required'],
            'races_event' => ['required'],
            'races_name' => ['required'],
            'races_group' => ['required'],
            'races_distance' => ['required'],
            'races_dayTime' => ['required'],
        ],[
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
    public function storeEdit(Request $request) : RedirectResponse
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
        ],[
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

    public function storeRegisterConfirm( Request $request): RedirectResponse
    {
        // Insert new tournament info in the database.(t_tournaments table)
        //$userId = (string) (Auth::user()->userId);
        DB::beginTransaction();
        try {
            DB::insert('insert into t_tournaments (tourn_id, tourn_name, sponsor_org_id, event_start_date, event_end_date, venue_id, venue_name,tourn_type,tourn_url,tourn_info_faile_path,entrysystem_tourn_id,registered_time,registered_user_id,updated_time,updated_user_id,delete_flag) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [210,$request->tournamentName,$request->sponsoreTeamId,$request->startDay,$request->endDay,0001,0001,0001,0001,0001,0001,now(),0001,now(),0001,000]);
            DB::commit();
            $page_status = "完了しました";
            $page_url = route('my-page');
            $page_url_text = "マイページ";
                
            return redirect('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
        } catch (\Throwable $e) {
            dd($e);
            // dd($request->all());
            dd("stop");
            DB::rollBack();
        }
    }
    
}
