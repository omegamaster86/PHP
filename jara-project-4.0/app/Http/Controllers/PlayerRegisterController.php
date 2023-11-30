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
use App\Services\FileUploadService;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\FileUploadRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\DB;

use Illuminate\Validation\ValidationException;
use League\CommonMark\Node\Inline\Newline;



class PlayerRegisterController extends Controller
{
    /**
     * Display the player registration view.
     */
    public function create(): View
    {
        $retrive_player_ID = DB::select('select * from t_player where userId = ?', [Auth::user()->userId]);

        if(empty($retrive_player_ID[0])){
            return view('player.register',["pageMode"=>"register"]);
        }
        else {
            if($retrive_player_ID[count($retrive_player_ID)-1]->deleteFlag){
                return view('player.register',["pageMode"=>"register"]);
            }
            else {
                $playerID = $retrive_player_ID[count($retrive_player_ID)-1]->playerId;
                $JARAPlayerCode = $retrive_player_ID[count($retrive_player_ID)-1]->JARAPlayerCode;
                $playerName = $retrive_player_ID[count($retrive_player_ID)-1]->playerName;
                $birthDate = date('Y/m/d', strtotime($retrive_player_ID[count($retrive_player_ID)-1]->birthDate));
                $sex = $retrive_player_ID[count($retrive_player_ID)-1]->sex;
                $height = $retrive_player_ID[count($retrive_player_ID)-1]->height;
                $weight = $retrive_player_ID[count($retrive_player_ID)-1]->weight;
                $sideInfo = $retrive_player_ID[count($retrive_player_ID)-1]->sideInfo;
                $birthCountry = $retrive_player_ID[count($retrive_player_ID)-1]->birthCountry;
                $birthPrefecture = $retrive_player_ID[count($retrive_player_ID)-1]->birthPrefecture;
                $birthPrefecture = $retrive_player_ID[count($retrive_player_ID)-1]->birthPrefecture;
                $residenceCountry = $retrive_player_ID[count($retrive_player_ID)-1]->residenceCountry;
                $residencePrefecture = $retrive_player_ID[count($retrive_player_ID)-1]->residencePrefecture;
                $photo = $retrive_player_ID[count($retrive_player_ID)-1]->photo;

                return view('player.register',["pageMode"=>"edit","playerId"=>$playerID,"JARAPlayerCode"=>$JARAPlayerCode,"playerName"=>$playerName,"birthDate"=>$birthDate,"sex"=>$sex,"height"=>$height,"weight"=>$weight,"sideInfo"=>$sideInfo,"birthCountry"=>$birthCountry,"birthPrefecture"=>$birthPrefecture,"residenceCountry"=>$residenceCountry,"residencePrefecture"=>$residencePrefecture,"photo"=>$photo]);
            }
        }
            
        
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function store( Request $request): RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        $random_file_name = Str::random(12);
        if ($request->hasFile('photo')) {
            
            $file = $request->file('photo');
            
            $fileName = $random_file_name. '.' . $request->file('photo')->getClientOriginalExtension();

            $destinationPath = public_path().'/images/players/' ;
            $file->move($destinationPath,$fileName);
        }
        $request->validate([
            'playerCode' => ['required', 'string', 'regex:/^[0-9a-zA-Z]+$/'],
            'playerName' => ['required', 'string', 'regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_][ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]*[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_]$/'],
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
        if ($request->hasFile('photo')){
            $playerInfo['photo']=$random_file_name. '.' . $request->file('photo')->getClientOriginalExtension();
        }
        else{
            if($request->playerPictureStatus==="delete")
                $playerInfo['photo']="";
            else
                $playerInfo['photo']=DB::table('t_player')->where('userId', Auth::user()->userId)->value('photo');
        }
        $sideInfo_xor = "00000000";
        foreach($request->sideInfo as $sideInfo){
            $sideInfo_xor = $sideInfo_xor ^ $sideInfo;
        }
        if(count($request->sideInfo)%2)
            $sideInfo_xor= $sideInfo_xor ^ "00000000";
        $playerInfo['sideInfo'] = $sideInfo_xor; 
        $playerInfo['previousPageStatus'] = "success"; 
        return redirect('player/register/confirm')->with('playerInfo', $playerInfo);
        
    }
}