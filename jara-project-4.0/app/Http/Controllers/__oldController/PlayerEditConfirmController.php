<?php
/*************************************************************************
*  Project name: JARA
*  File name: PlayerEditConfirmController.php
*  File extension: .php
*  Description: This is the controller file to manage edit player request
*************************************************************************
*  Author: DEY PRASHANTA KUMAR
*  Created At: 2023/11/04
*  Updated At: 2023/11/30
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
use Illuminate\Support\Facades\Auth;

class PlayerEditConfirmController extends Controller
{
    /**
     * Display the edit confirm view.
     */
    public function createEditConfirm(): View
    {
        
        return view('player.register-confirm',["pageMode"=>"edit-confirm"]);
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
}
