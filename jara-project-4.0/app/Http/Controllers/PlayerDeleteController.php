<?php
/*************************************************************************
*  Project name: JARA
*  File name: PlayerDeleteController.php
*  File extension: .php
*  Description: This is the controller file to manage player delete request
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


class PlayerDeleteController extends Controller
{
    //
    public function create(): View
    {
        $retrive_player_ID = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);
        if(empty($retrive_player_ID)){
            return view('player.register',["pageMode"=>"register"]);
        }

        $player_info = $retrive_player_ID[count($retrive_player_ID)-1];
        
        if($playerInfo->delete_flag){
            return view('player.register',["pageMode"=>"register"]);
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
        return view('player.register-confirm',["pageMode"=>"delete","player_info"=>$player_info]);
    }

    /**
     * Handle an incoming edit request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function store(Request $request, ): RedirectResponse
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
