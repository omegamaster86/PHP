<?php

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
    public function create(): View
    {
        
        return view('player.register-confirm',["pageMode"=>"edit-confirm"]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function store( Request $request): RedirectResponse
    {
        if (DB::table('t_player')->where('JARAPlayerCode',$request->playerCode)->where('deleteFlag',0)->exists()){
            $retrive_player = DB::select('select * from t_player where userId = ?', [Auth::user()->userId]);
            if(empty($retrive_player)){
                dd("stop");
                $retrive_player_name = DB::select('select playerName from t_player where JARAPlayerCode = ?', [$request->playerCode]);
                $existing_player_name = $retrive_player_name[0]->playerName;
                //Display error message to the client
                return redirect('player/edit')->with('system_error', "登録に失敗しました。別のユーザーによってJARA選手コードが別の選手と紐づけられています。紐づいていた選手ID：[$request->playerCode] [$existing_player_name]");
            }
            else{
                DB::beginTransaction();
                try {
                    DB::update(
                        'update t_player set JARAPlayerCode = ? , playerName = ?, birthDate = ?, sex = ?, height = ?,   weight = ?,sideInfo = ?,birthCountry = ?,birthPrefecture = ?,residenceCountry = ?,residencePrefecture = ?,photo = ? where userId = ?',
                        [ $request->playerCode, $request->playerName,$request->dateOfBirth,$request->sex,$request->height,$request->weight,$request->sideInfo,$request->birthCountry,$request->birthPrefecture,$request->residenceCountry,$request->residencePrefecture,$request->photo,Auth::user()->userId]
                    );

                    DB::commit();
                    return redirect('player/edit')->with('status', "選手情報の更新が正常に完了しました。");
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
                
                return redirect('player/edit')->with('status', "選手情報の更新が正常に完了しました。");
            }
        }
        else{
            DB::beginTransaction();
                try {
                    DB::update(
                        'update t_player set JARAPlayerCode = ? , playerName = ?, birthDate = ?, sex = ?, height = ?,   weight = ?,sideInfo = ?,birthCountry = ?,birthPrefecture = ?,residenceCountry = ?,residencePrefecture = ?,photo = ? where userId = ?',
                        [ $request->playerCode, $request->playerName,$request->dateOfBirth,$request->sex,$request->height,$request->weight,$request->sideInfo,$request->birthCountry,$request->birthPrefecture,$request->residenceCountry,$request->residencePrefecture,$request->photo,Auth::user()->userId]
                    );

                    DB::commit();
                    return redirect('player/edit')->with('status', "選手情報の更新が正常に完了しました。");
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
                
                return redirect('player/edit')->with('status', "選手情報の更新が正常に完了しました。");
        }
        return redirect('player/edit');
    }
}
