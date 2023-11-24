<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class PlayerEditController extends Controller
{
    /**
     * Display the edit view.
     */
    public function create(): View
    {
        $retrive_player_ID = DB::select('select * from t_player where userId = ?', [Auth::user()->userId]);

        
        if($retrive_player_ID[0]->deleteFlag)
        return view('player.register',["pageMode"=>"register"]);
        $playerID = $retrive_player_ID[0]->playerId;
        $JARAPlayerCode = $retrive_player_ID[0]->JARAPlayerCode;
        $playerName = $retrive_player_ID[0]->playerName;
        $birthDate = date('Y/m/d', strtotime($retrive_player_ID[0]->birthDate));
        $sex = $retrive_player_ID[0]->sex;
        $height = $retrive_player_ID[0]->height;
        $weight = $retrive_player_ID[0]->weight;
        $sideInfo = $retrive_player_ID[0]->sideInfo;
        $birthCountry = $retrive_player_ID[0]->birthCountry;
        $birthPrefecture = $retrive_player_ID[0]->birthPrefecture;
        $birthPrefecture = $retrive_player_ID[0]->birthPrefecture;
        $residenceCountry = $retrive_player_ID[0]->residenceCountry;
        $residencePrefecture = $retrive_player_ID[0]->residencePrefecture;
        $photo = $retrive_player_ID[0]->photo;

        return view('player.register',["pageMode"=>"edit","playerId"=>$playerID,"JARAPlayerCode"=>$JARAPlayerCode,"playerName"=>$playerName,"birthDate"=>$birthDate,"sex"=>$sex,"height"=>$height,"weight"=>$weight,"sideInfo"=>$sideInfo,"birthCountry"=>$birthCountry,"birthPrefecture"=>$birthPrefecture,"residenceCountry"=>$residenceCountry,"residencePrefecture"=>$residencePrefecture,"photo"=>$photo]);
    }

    /**
     * Handle an incoming edit request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function store(Request $request, ): RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        $request->validate([
            'playerCode' => ['required', 'string', 'regex:/^[0-9a-zA-Z]+$/'],
            'playerName' => ['required', 'string', 'regex:/^[0-9a-zA-ZＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ]+$/'],
            'dateOfBirth' => ['required'],
            'sex' => ['required','regex:/^[1-3]+$/'],
            'height' => ['required'],
            'weight' => ['required'],
            'sideInfo' => ['required_without_all'],
        ],[
            'playerCode.required' => $playerCode_required,
            'playerCode.regex' => $playerCode_regex,
            'playerName.required' => $playerName_required,
            'playerName.regex' => $playerName_regex,
            'dateOfBirth.required' => $dateOfBirth_required,
            'dateOfBirth.regex' => $dateOfBirth_required,
            'sex.required' => $sex_required,
            'sex.regex' => $sex_required,
            'height.required' => $height_required,
            'weight.required' => $weight_required,
            'sideInfo.required_without_all' => $sideInfo_required,
        ]);
        if (DB::table('t_player')->where('JARAPlayerCode',$request->playerCode)->where('deleteFlag',0)->exists()){
            $retrive_player = DB::select('select * from t_player where userId = ?', [Auth::user()->userId]);
            if($retrive_player[0]->JARAPlayerCode===$request->playerCode){
                $playerInfo = $request->all();
                $sideInfo_xor = "00000000";
                foreach($request->sideInfo as $sideInfo){
                    $sideInfo_xor = $sideInfo_xor ^ $sideInfo;
                }
                if(count($request->sideInfo)%2)
                    $sideInfo_xor= $sideInfo_xor ^ "00000000";
                $playerInfo['sideInfo'] = $sideInfo_xor; 
                $playerInfo['playerId'] = $retrive_player[0]->playerId;
                return redirect('player/edit/confirm')->with('playerInfo', $playerInfo);
            }
            $retrive_player_name = DB::select('select playerName from t_player where JARAPlayerCode = ?', [$request->playerCode]);
            $existing_player_name = $retrive_player_name[0]->playerName;
            //Display error message to the client
            throw ValidationException::withMessages([
                'system_error' => "この既存選手IDは既に別の選手と紐づいています。入力した既存選手IDを確認してください。紐づいていた選手I：[$request->playerCode] [$existing_player_name]"
            ]); 
        }
        else{

        }
        $retrive_player_ID = DB::select('select playerId from t_player where userId = ?', [Auth::user()->userId]);

        $playerInfo = $request->all();
        $sideInfo_xor = "00000000";
        foreach($request->sideInfo as $sideInfo){
            $sideInfo_xor = $sideInfo_xor ^ $sideInfo;
        }
        if(count($request->sideInfo)%2)
            $sideInfo_xor= $sideInfo_xor ^ "00000000";
        $playerInfo['sideInfo'] = $sideInfo_xor; 
        $playerInfo['playerId'] = $retrive_player_ID[0]->playerId;
        $playerInfo['previousPageStatus'] = "success"; 
        return redirect('player/edit/confirm')->with('playerInfo', $playerInfo);
        dd("stop");
    }
}
