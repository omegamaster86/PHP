<?php
/*************************************************************************
*  Project name: JARA
*  File name: PlayerEditController.php
*  File extension: .php
*  Description: This is the controller file to manage player edit request
*************************************************************************
*  Author: DEY PRASHANTA KUMAR
*  Created At: 2023/11/04
*  Updated At: 2023/11/09
*************************************************************************
*
*  Copyright 2023 by DPT INC.
*
************************************************************************/
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use App\Services\FileUploadService;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\FileUploadRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class PlayerEditController extends Controller
{

    /**
     * Display the edit view.
     */
    public function create(): View
    {
        $retrive_player_by_ID = DB::select('select * from t_player where userId = ?', [Auth::user()->userId]);

        if(!count($retrive_player_by_ID))
            return view('player.register',["page_mode"=>"register"]);

        $recent_player_array = count($retrive_player_by_ID)-1;

        if($retrive_player_by_ID[$recent_player_array]->delete_flag)
            return view('player.register',["page_mode"=>"register"]);

        $player_info = $retrive_player_by_ID[$recent_player_array]->all();

        $player_info->date_of_birth = date('Y/m/d', strtotime($retrive_player_by_ID[$recent_player_array]->date_of_birth));

        return view('player.register',["pageMode"=>"edit",["player_info"=>$player_info]]);
    }

    /**
     * Handle an incoming edit request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function store(Request $request): RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        if ($request->hasFile('photo')) {
            
            // Storage::disk('local')->put('example.txt', $request->file('photo'));
            
            $file = $request->file('photo');
            // $file->store('toPath', ['disk' => 'public']);

            
            $fileName = DB::table('t_players')->where('user_id', Auth::user()->user_id)->value('player_id'). '.' . $request->file('photo')->getClientOriginalExtension();
            // Storage::disk('public')->put($fileName, $file);



            // Storage::disk('public')->putFileAs('uploads', $file, $fileName);

            $destinationPath = public_path().'/images/players/' ;
            $file->move($destinationPath,$fileName);


            // You can now save the $filePath to the database or use it as needed
            // ...
            // return response()->json(['message' => 'File uploaded successfully']);
        }
        
        $request->validate([
            'playerCode' => ['required', 'string', 'regex:/^[0-9a-zA-Z]+$/'],
            'playerName' => ['required', 'string', 'regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]+$/'],
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
        if (DB::table('t_players')->where('jara_player_id',$request->playerCode)->where('delete_flag',0)->exists()){
            $retrive_player = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);
            if($retrive_player[count($retrive_player)-1]->JARAPlayerCode===$request->playerCode){
                $playerInfo = $request->all();
                if ($request->hasFile('photo')){
                    $playerInfo['photo']=DB::table('t_players')->where('user_id', Auth::user()->user_id)->value('player_id'). '.' . $request->file('photo')->getClientOriginalExtension();
                }
                else{
                    if($request->playerPictureStatus==="delete")
                        $playerInfo['photo']="";
                    else
                        $playerInfo['photo']=DB::table('t_players')->where('user_id', Auth::user()->user_id)->value('photo');
                }
                $sideInfo_xor = "00000000";
                foreach($request->sideInfo as $sideInfo){
                    $sideInfo_xor = $sideInfo_xor ^ $sideInfo;
                }
                if(count($request->sideInfo)%2)
                    $sideInfo_xor= $sideInfo_xor ^ "00000000";
                $playerInfo['sideInfo'] = $sideInfo_xor; 
                $playerInfo['playerId'] = $retrive_player[0]->playerId;
                // dd($playerInfo['photo']);
                return redirect('player/edit/confirm')->with('playerInfo', $playerInfo);
            }
            $retrive_player_name = DB::select('select player_name from t_players where jara_player_id = ?', [$request->playerCode]);
            $existing_player_name = $retrive_player_name[0]->player_name;
            //Display error message to the client
            throw ValidationException::withMessages([
                'system_error' => "この既存選手IDは既に別の選手と紐づいています。入力した既存選手IDを確認してください。紐づいていた選手I：[$request->playerCode] [$existing_player_name]"
            ]); 
        }
        else{

        }
        $retrive_player_by_ID = DB::select('select * from t_player where userId = ?', [Auth::user()->userId]);

        $playerInfo = $request->all();
        
        
        
        $sideInfo_xor = "00000000";
        foreach($request->sideInfo as $sideInfo){
            $sideInfo_xor = $sideInfo_xor ^ $sideInfo;
        }
        if(count($request->sideInfo)%2)
            $sideInfo_xor= $sideInfo_xor ^ "00000000";
        $playerInfo['sideInfo'] = $sideInfo_xor; 
        $playerInfo['playerId'] = $retrive_player_by_ID[0]->playerId;
        $playerInfo['previousPageStatus'] = "success"; 
        return redirect('player/edit/confirm')->with('playerInfo', $playerInfo);
        dd("stop");
    }
}
