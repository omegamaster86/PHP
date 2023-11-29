<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\T_user;
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

class TournamentController extends Controller
{
    // 大会登録画面呼び出し
    public function create(Request $request): View
    {
        return view('tournament.register-edit',["pageMode"=>"register"]);
    }
    // 大会情報変更画面呼び出し
    public function create01(Request $request): View
    {
        return view('tournament.register-edit',["pageMode"=>"edit"]);
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

    //登録画面から確認画面に遷移する際に呼ばれる
    public function storeRegister(Request $request) : RedirectResponse
    {
        $param = $request->all();
        dd($param);

        include('Auth/ErrorMessages/ErrorMessages.php');
        $request->validate([
            'tournamentName' => ['required'],
            'sponsoreTeamId' => ['required'],
            'startDay' => ['required'],
            'endDay' => ['required'],
            'venueSelect' => ['required'],
        ],[
            'tournamentName.required' => $tournament_name_required,
            'sponsoreTeamId.required' => $tournament_id,
            'startDay.required' => $tournament_startDay,
            'endDay.required' => $tournament_endDay,
            'venueSelect.required' => $tournament_venueSelect,
        ]);

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
        ],[
            'tournamentName.required' => $tournament_name_required,
            'sponsoreTeamId.required' => $tournament_id,
            'startDay.required' => $tournament_startDay,
            'endDay.required' => $tournament_endDay,
            'venueSelect.required' => $tournament_venueSelect,
        ]);

    }
    
}
