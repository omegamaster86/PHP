<?php
/*************************************************************************
*  Project name: JARA
*  File name: PlayerRegisterConfirmController.php
*  File extension: .php
*  Description: This is the controller file to manage register request
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
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class PlayerRegisterConfirmController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): View
    {
        return view('player.register-confirm',["pageMode"=>"register-confirm"]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function store( Request $request): RedirectResponse
    {
        if (DB::table('t_players')->where('jara_player_id',$request->playerCode)->where('delete_flag',0)->exists()){
            $retrive_player_name = DB::select('select player_name from t_players where jara_player_id = ?', [$request->playerCode]);
            $existing_player_name = $retrive_player_name[0]->player_name;
            //Display error message to the client
            return redirect('player/register')->with('system_error', "登録に失敗しました。別のユーザーによってJARA選手コードが別の選手と紐づけられています。紐づいていた選手ID：[$request->playerCode] [$existing_player_name]");
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
}
