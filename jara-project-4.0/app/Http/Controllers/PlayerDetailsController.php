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
    {$retrive_player_ID = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);
        if(empty($retrive_player_ID[0]))
            return view('player.register',["pageMode"=>"register"]);
        $recent_player_array = count($retrive_player_ID)-1;
        if($retrive_player_ID[$recent_player_array]->deleteFlag)
            return view('player.register',["pageMode"=>"register"]);
        $playerID = $retrive_player_ID[$recent_player_array]->playerId;
        $JARAPlayerCode = $retrive_player_ID[$recent_player_array]->JARAPlayerCode;
        $playerName = $retrive_player_ID[$recent_player_array]->playerName;
        $birthDate = date('Y/m/d', strtotime($retrive_player_ID[$recent_player_array]->birthDate));
        $sex = $retrive_player_ID[$recent_player_array]->sex;
        $height = $retrive_player_ID[$recent_player_array]->height;
        $weight = $retrive_player_ID[$recent_player_array]->weight;
        $sideInfo = $retrive_player_ID[$recent_player_array]->sideInfo;
        $birthCountry = $retrive_player_ID[$recent_player_array]->birthCountry;
        $birthPrefecture = $retrive_player_ID[$recent_player_array]->birthPrefecture;
        $birthPrefecture = $retrive_player_ID[$recent_player_array]->birthPrefecture;
        $residenceCountry = $retrive_player_ID[$recent_player_array]->residenceCountry;
        $residencePrefecture = $retrive_player_ID[$recent_player_array]->residencePrefecture;
        $photo = $retrive_player_ID[$recent_player_array]->photo;

        return view('player.details',["playerId"=>$playerID,"JARAPlayerCode"=>$JARAPlayerCode,"playerName"=>$playerName,"birthDate"=>$birthDate,"sex"=>$sex,"height"=>$height,"weight"=>$weight,"sideInfo"=>$sideInfo,"birthCountry"=>$birthCountry,"birthPrefecture"=>$birthPrefecture,"residenceCountry"=>$residenceCountry,"residencePrefecture"=>$residencePrefecture,"photo"=>$photo]);
        
        return view('player.details');
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
