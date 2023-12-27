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

use App\Models\T_volunteers;
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

class VolunteerController extends Controller
{
    //大会情報参照画面に遷移した時
    public function createReference(T_volunteers $tVolunteer, T_races $tRace)
    {
        //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        }
        $tTours = $tVolunteer->getVolunteers(1); //大会情報を取得
        $tRaceData = $tRace->getRace(1); //レース情報を取得
        return view('volunteer.reference', ["pagemode" => "refer", "TournamentData" => $tTours, "RaceData" => $tRaceData]);
    }

    //大会情報削除画面に遷移した時
    public function createDelete(T_volunteers $tVolunteer, T_races $tRace)
    {
        //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        }
        $tTours = $tVolunteer->getVolunteers(1); //大会情報を取得
        $tRaceData = $tRace->getRace(1); //レース情報を取得
        return view('volunteer.reference', ["pagemode" => "delete", "TournamentData" => $tTours, "RaceData" => $tRaceData]);
    }
}
