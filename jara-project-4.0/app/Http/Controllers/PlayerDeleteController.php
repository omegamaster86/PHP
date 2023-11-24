<?php

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
        $retrive_player_ID = DB::select('select * from t_player where userId = ?', [Auth::user()->userId]);

        $playerInfo = $retrive_player_ID[0];
        
        if($playerInfo->deleteFlag)
        return view('player.register',["pageMode"=>"register"]);
        if($playerInfo->sex===1)
        $playerInfo->sex = "男";
        elseif($playerInfo->sex===2)
        $playerInfo->sex = "女";
        else
        $playerInfo->sex = "";
        return view('player.register-confirm',["pageMode"=>"delete","playerInfo"=>$playerInfo]);
    }

    /**
     * Handle an incoming edit request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function store(Request $request, ): RedirectResponse
    {

        DB::beginTransaction();
                try {
                    DB::update(
                        'update t_player set deleteFlag = ?  where userId = ?',
                        [ "1",Auth::user()->userId]
                    );

                    DB::commit();
                    return redirect('player/register')->with('status', "選手情報の削除が完了しました。");
                } catch (\Throwable $e) {
                    dd($request->all());
                    dd("stop");
                    DB::rollBack();
                     //Store error message in the register log file.
                     $e_message = $e->getMessage();
            $e_code = $e->getCode();
            $e_file = $e->getFile();
            $e_line = $e->getLine();
            $e_errorCode = $e->errorInfo[1];
            $e_bindings = implode(", ",$e->getBindings());
            $e_connectionName = $e->connectionName;

            $userId = Auth::user()->userId;
            //Store error message in the register log file.
            Log::channel('player_delete')->info("\r\n \r\n ＊＊＊「USER_ID」 ：  $userId,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
                }
                
                return redirect('player/register')->with('status', "選手情報の削除が完了しました。"); 
        dd("delete");
    }
}
