<?php
/**************************************************************
* Project name: JARA
* File name: PlayerRegisterController.php
* File extension: .php
* Description: This is the controller of player register page
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/11/17
* Updated At: 2023/11/17
*************************************************************************
*
* Copyright 2023 by DPT INC.
*
**************************************************************/
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



class PlayerRegisterController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): View
    {
        return view('player.register',["pageMode"=>"register"]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function store( Request $request): RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        $request->validate([
            'playerCode' => ['required', 'string', 'regex:/^[0-9a-zA-Z]+$/'],
            'playerName' => ['required', 'string', 'regex:/^[0-9a-zA-ZＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ]+$/'],
            'dateOfBirth' => ['required','regex:/^[0-9\/]+$/'],
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
            $retrive_player_name = DB::select('select playerName from t_player where JARAPlayerCode = ?', [$request->playerCode]);
            $existing_player_name = $retrive_player_name[0]->playerName;
            //Display error message to the client
            throw ValidationException::withMessages([
                'system_error' => "この既存選手IDは既に別の選手と紐づいています。入力した既存選手IDを確認してください。紐づいていた選手I：[$request->playerCode] [$existing_player_name]"
            ]); 
        }
        else{

        }
        $playerInfo = $request->all();
        $sideInfo_xor = "00000000";
        foreach($request->sideInfo as $sideInfo){
            $sideInfo_xor = $sideInfo_xor ^ $sideInfo;
        }
        if(count($request->sideInfo)%2)
            $sideInfo_xor= $sideInfo_xor ^ "00000000";
        $playerInfo['sideInfo'] = $sideInfo_xor; 
        $playerInfo['previousPageStatus'] = "success"; 
        return redirect('player/register/confirm')->with('playerInfo', $playerInfo);

        dd("stop");
        // INSERT INTO `t_player`(`playerId`, `userId`, `JARAPlayerId`, `playerName`, `birthDate`, `sex`, `height`, `weight`, `sideInfo`, `birthCountry`, `birthPrefecture`, `residenceCountry`, `residencePrefecture`, `photo`, `registeredTime`, `registeredUserId`, `UpdatedTime`, `UpdatedUserId`, `deleteFlag`) VALUES ('[value-1]','[value-2]','[value-3]','[value-4]','[value-5]','[value-6]','[value-7]','[value-8]','[value-9]','[value-10]','[value-11]','[value-12]','[value-13]','[value-14]','[value-15]','[value-16]','[value-17]','[value-18]','[value-19]')
    }
}