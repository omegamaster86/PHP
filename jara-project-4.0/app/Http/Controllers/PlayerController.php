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
use App\Services\FileUploadService;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\FileUploadRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\DB;

use Illuminate\Validation\ValidationException;
use League\CommonMark\Node\Inline\Newline;

class PlayerController extends Controller
{
    //
    public function createRegister(): View
    {
        $retrive_player_ID = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);

        if(empty($retrive_player_ID[0])){
            return view('player.register-edit',["page_mode"=>"register"]);
        }
        else {
            if($retrive_player_ID[count($retrive_player_ID)-1]->delete_flag){
                return view('player.register-edit',["page_mode"=>"register"]);
            }
            else {
                $player_info = $retrive_player_ID[count($retrive_player_ID)-1]->all();
                $player_info->date_of_birth = date('Y/m/d', strtotime($retrive_player_ID[count($retrive_player_ID)-1]->date_of_birth));

                return view('player.register-edit',["page_mode"=>"edit","player_info"=>$player_info]);
            }
        }
            
        
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function storeRegister( Request $request): RedirectResponse
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
        if (DB::table('t_players')->where('jara_player_id',$request->playerCode)->where('delete_flag',0)->exists()){
            $retrive_player_name = DB::select('select player_name from t_players where jara_player_id = ?', [$request->playerCode]);
            $existing_player_name = $retrive_player_name[0]->player_name;
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
                $playerInfo['photo']=DB::table('t_players')->where('user_id', Auth::user()->user_id)->value('photo');
        }
        $sideInfo_xor = "00000000";
        foreach($request->sideInfo as $sideInfo){
            $sideInfo_xor = $sideInfo_xor ^ $sideInfo;
        }
        if(count($request->sideInfo)%2)
            $sideInfo_xor= $sideInfo_xor ^ "00000000";
        $playerInfo['side_info'] = $sideInfo_xor; 
        $playerInfo['previousPageStatus'] = "success"; 
        return redirect('player/register/confirm')->with('playerInfo', $playerInfo);
        
    }
    /**
     * Display the edit view.
     */
    public function createEdit(): View
    {
        $retrive_player_by_ID = DB::select('select * from t_player where userId = ?', [Auth::user()->userId]);

        if(!count($retrive_player_by_ID))
            return view('player.register-edit',["page_mode"=>"register"]);

        $recent_player_array = count($retrive_player_by_ID)-1;

        if($retrive_player_by_ID[$recent_player_array]->delete_flag)
            return view('player.register-edit',["page_mode"=>"register"]);

        $player_info = $retrive_player_by_ID[$recent_player_array]->all();

        $player_info->date_of_birth = date('Y/m/d', strtotime($retrive_player_by_ID[$recent_player_array]->date_of_birth));

        return view('player.register-edit',["page_mode"=>"edit",["player_info"=>$player_info]]);
    }

    /**
     * Handle an incoming edit request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function storeEdit(Request $request): RedirectResponse
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
    /**
     * Display the registration view.
     */
    public function createRegisterConfirm(): View
    {
        return view('player.register-edit-confirm',["page_mode"=>"register-confirm"]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function storeRegisterConfirm( Request $request): RedirectResponse
    {
        if (DB::table('t_players')->where('jara_player_id',$request->jar_player_id)->where('delete_flag',0)->exists()){
            $retrive_player_name = DB::select('select player_name from t_players where jara_player_id = ?', [$request->jara_player_id]);
            $existing_player_name = $retrive_player_name[0]->player_name;
            //Display error message to the client
            return redirect('player/register')->with('system_error', "登録に失敗しました。別のユーザーによってJARA選手コードが別の選手と紐づけられています。紐づいていた選手ID：[$request->jara_player_id] [$existing_player_name]");
            dd("stop");
        }
        else{
            // Insert new user info in the database.(t_user table)
            $user_id = (string) (Auth::user()->user_id);
            DB::beginTransaction();
            try {
                $user = DB::insert('insert into t_players ( user_id, jara_player_id,  player_name, date_of_birth, sex, height, weight, side_info, birth_country, birth_prefecture, residence_country,residence_prefecture, photo, registered_time, registered_user_id,updated_time,updated_user_id) values (?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [$user_id,$request->jara_player_id, $request->player_name,$request->date_of_birth, $request->sex, $request->height, $request->weight, $request->side_info, $request->birth_country,$request->birth_prefecture, $request->residence_country,$request->residence_prefecture, $request->photo, now(), Auth::user()->user_id , now(), Auth::user()->user_id ]);
                DB::commit();
                $page_status = "選手情報の登録が正常に完了しました。";
                $page_url = route('my-page');
                $page_url_text = "マイページ";
                
                return redirect('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
            } catch (\Throwable $e) {
                DB::rollBack();

                $e_message = $e->getMessage();
                $e_code = $e->getCode();
                $e_file = $e->getFile();
                $e_line = $e->getLine();
                $e_errorCode = $e->errorInfo[1];
                $e_bindings = implode(", ",$e->getBindings());
                $e_connectionName = $e->connectionName;

                $userId = Auth::user()->user_id;
                //Store error message in the player register log file.
                Log::channel('player_register')->info("\r\n \r\n ＊＊＊「USER_ID」 ：  $userId,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
                if($e_errorCode == 1213||$e_errorCode == 1205)
                {
                    throw ValidationException::withMessages([
                        'datachecked_error' => $database_registration_failed
                    ]); 
                }
                else{
                    throw ValidationException::withMessages([
                        'datachecked_error' => $database_registration_failed
                    ]); 
                }
            }
            
        }
    }

    /**
     * Display the edit confirm view.
     */
    public function createEditConfirm(): View
    {
        
        return view('player.register-edit-confirm',["page_mode"=>"edit-confirm"]);
    }

    /**
     * Handle an incoming edit request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function storeEditConfirm( Request $request): RedirectResponse
    {
        if (DB::table('t_players')->where('jara_player_id', '=', $request->jara_player_id)->where('delete_flag', '=', 0)->exists()){
            $retrive_player = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);
            if(empty($retrive_player)){
                dd("stop");
                $retrive_player_name = DB::select('select player_name from t_players where jara_player_id = ?', [$request->jara_player_id]);
                $existing_player_name = $retrive_player_name[0]->player_name;
                //Display error message to the client
                return redirect('player/edit')->with('system_error', "登録に失敗しました。別のユーザーによってJARA選手コードが別の選手と紐づけられています。紐づいていた選手ID：[$request->jara_player_id] [$existing_player_name]");
            }
            else{
                DB::beginTransaction();
                try {
                    DB::update(
                        'update t_players set jara_player_id = ? , player_name = ?, date_of_birth = ?, sex = ?, height = ?, weight = ?,side_info = ?,birth_country = ?,birth_prefecture = ?,residence_country = ?,residence_prefecture = ?,photo = ? where user_id = ?',
                        [ $request->jara_player_id, $request->player_name,$request->date_of_birth,$request->sex,$request->height,$request->weight,$request->side_info,$request->birth_country,$request->birth_prefecture,$request->residence_country,$request->residence_prefecture,$request->photo,Auth::user()->user_id]
                    );

                    DB::commit();
                    $page_status = "選手情報の更新が正常に完了しました。";
                    $page_url = route('my-page');
                    $page_url_text = "マイページ";
                    
                    return redirect('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
                } catch (\Throwable $e) {
                    dd($request->all());
                    dd("stop");
                    DB::rollBack();
                     //Store error message in the register log file.
                     Log::channel('player_update')->info(" error-message  -> $update_failed");
                     throw ValidationException::withMessages([
                         'datachecked_error' => $update_failed
                     ]); 
                }
                
                $page_status = "選手情報の更新が正常に完了しました。";
                    $page_url = route('my-page');
                    $page_url_text = "マイページ";
                    
                    return redirect('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
            }
        }
        else{
            DB::beginTransaction();
                try {
                    DB::update(
                        'update t_players set jara_player_id = ? , player_name = ?, date_of_birth = ?, sex = ?, height = ?, weight = ?,side_info = ?,birth_country = ?,birth_prefecture = ?,residence_country = ?,residence_prefecture = ?,photo = ? where user_id = ?',
                        [ $request->jara_player_id, $request->player_name,$request->date_of_birth,$request->sex,$request->height,$request->weight,$request->side_info,$request->birth_country,$request->birth_prefecture,$request->residence_country,$request->residence_prefecture,$request->photo,Auth::user()->user_id]
                    );

                    DB::commit();
                    $page_status = "選手情報の更新が正常に完了しました。";
                    $page_url = route('my-page');
                    $page_url_text = "マイページ";
                    
                    return redirect('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
                } catch (\Throwable $e) {
                    DB::rollBack();
                    //Store error message in the player update log file.
                    Log::channel('player_update')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailaddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
                     throw ValidationException::withMessages([
                         'datachecked_error' => $update_failed
                     ]); 
                }
                
                $page_status = "選手情報の更新が正常に完了しました。";
                    $page_url = route('my-page');
                    $page_url_text = "マイページ";
                    
                    return redirect('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
        }
        return redirect('player/edit');
    }

    /**
     * Display the edit confirm view.
     */
    public function createDetails(): View
    {
        $retrive_player_by_ID = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);

        if(!count($retrive_player_by_ID))
            return view('player.register-edit',["page_mode"=>"register"]);

        $recent_player_array = count($retrive_player_by_ID)-1;

        if($retrive_player_by_ID[$recent_player_array]->delete_flag)
            return view('player.register-edit',["page_mode"=>"register"]);

        $player_info = $retrive_player_by_ID[$recent_player_array]->all();
       
        $player_info->date_of_birth = date('Y/m/d', strtotime($retrive_player_by_ID[$recent_player_array]->date_of_birth));

        return view('player.details',["player_info"=>$player_info]);
    }
    public function createDelete(): View
    {
        $retrive_player_ID = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);
        if(empty($retrive_player_ID)){
            return view('player.register-edit',["page_mode"=>"register"]);
        }

        $player_info = $retrive_player_ID[count($retrive_player_ID)-1];
        
        if($playerInfo->delete_flag){
            return view('player.register-edit',["page_mode"=>"register"]);
        }
        if($player_info->sex===1){
            $player_info->sex = "男";
        }
        elseif($player_info->sex===2){
            $playerInfo->sex = "女";
        }
        else{
            $player_info->sex = "";
        }
        return view('player.register-edit-confirm',["page_mode"=>"delete","player_info"=>$player_info]);
    }

    /**
     * Handle an incoming edit request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function storeDelete(Request $request, ): RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');

        DB::beginTransaction();
        try {
            DB::update(
                'update t_players set delete_flag = ?  where user_id = ?',
                [ "1",Auth::user()->user_id]
            );

            DB::commit();
            $page_status = "選手情報の削除が完了しました。";
            $page_url = route('my-page');
            $page_url_text = "マイページ";
            
            return redirect('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
        } catch (\Throwable $e) {
            dd($request->all());
            dd("stop");
            DB::rollBack();
            $e_message = $e->getMessage();
            $e_code = $e->getCode();
            $e_file = $e->getFile();
            $e_line = $e->getLine();
            $e_errorCode = $e->errorInfo[1];
            $e_bindings = implode(", ",$e->getBindings());
            $e_connectionName = $e->connectionName;

            $userId = Auth::user()->userId;
            //Store error message in the player delete log file.
            Log::channel('player_delete')->info("\r\n \r\n ＊＊＊「USER_ID」 ：  $userId,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
        }
                
        return redirect('player/register')->with('status', "選手情報の削除が完了しました。"); 
    }

}
