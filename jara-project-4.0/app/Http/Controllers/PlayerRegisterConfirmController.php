<?php

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
        if (DB::table('t_player')->where('JARAPlayerCode',$request->playerCode)->where('deleteFlag',0)->exists()){
            $retrive_player_name = DB::select('select playerName from t_player where JARAPlayerCode = ?', [$request->playerCode]);
            $existing_player_name = $retrive_player_name[0]->playerName;
            //Display error message to the client
            return redirect('player/register')->with('system_error', "登録に失敗しました。別のユーザーによってJARA選手コードが別の選手と紐づけられています。紐づいていた選手ID：[$request->playerCode] [$existing_player_name]");
            dd("stop");
        }
        else{
            // Insert new user info in the database.(t_user table)
        $userId = (string) (Auth::user()->userId);
        DB::beginTransaction();
        try {
            $user = DB::insert('insert into t_player (userId,JARAPlayerCode, playerName,birthDate,sex,height,weight,sideInfo,birthCountry,birthPrefecture,residenceCountry,residencePrefecture,photo) values (?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?)', [$userId,$request->playerCode, $request->playerName,$request->dateOfBirth,$request->sex,$request->height,$request->weight,$request->sideInfo,$request->birthCountry,$request->birthPrefecture,$request->residenceCountry,$request->residencePrefecture,$request->photo ]);
            DB::commit();
            return redirect('player/register')->with('status', "選手情報の登録が正常に完了しました。");
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
            //Store error message in the register log file.
            Log::channel('register_update')->info("\r\n \r\n ＊＊＊「USER_ID」 ：  $userId,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
            if($e_errorCode == 1213||$e_errorCode == 1205)
            {
                throw ValidationException::withMessages([
                    'datachecked_error' => $database_registration_failed_try_again
                ]); 
            }
            else{
                throw ValidationException::withMessages([
                    'datachecked_error' => $database_registration_failed
                ]); 
            }
        }
        

            
            dd("stop");
        }
    }
}
