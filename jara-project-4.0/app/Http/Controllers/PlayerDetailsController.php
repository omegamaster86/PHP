<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class PlayerDetailsController extends Controller
{
    /**
     * Display the edit confirm view.
     */
    public function create(): View
    {
        $retrive_player_by_ID = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);

        if(!count($retrive_player_by_ID))
            return view('player.register',["page_mode"=>"register"]);

        $recent_player_array = count($retrive_player_by_ID)-1;

        if($retrive_player_by_ID[$recent_player_array]->delete_flag)
            return view('player.register',["page_mode"=>"register"]);

        $player_info = $retrive_player_by_ID[$recent_player_array]->all();
       
        $player_info->date_of_birth = date('Y/m/d', strtotime($retrive_player_by_ID[$recent_player_array]->date_of_birth));

        return view('player.details',["player_info"=>$player_info]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function store( Request $request): RedirectResponse
    {
        dd($request->all());
    }
}
