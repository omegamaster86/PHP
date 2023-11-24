<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Validation\ValidationException;
use App\Models\T_user;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EditVerifiCationController extends Controller
{
    
    public function create(Request $request): View
    {
        return view('profile.edit.verification');
    }
    public function store(Request $request): RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        // dd(DB::table('t_user')->where('mailAddress', $this->only('mailAddress'))->value('certification'));
        if($request->certificationNumber===""){
            throw ValidationException::withMessages([
                'verification_error' => $code_not_found
            ]); 
        }
        if($request->mailAddressStatus=="1"){
            if (DB::table('t_user')->where('mailAddress', Auth::user()->mailAddress)->where('certification', '=', $request->certificationNumber)->exists()){
                if (DB::table('t_user')->where('mailAddress', Auth::user()->mailAddress)->where('expiryTimeOfCertification', '<', date('Y-m-d H:i:s'))->exists()) {
                    throw ValidationException::withMessages([
                        'verification_error' => $code_timed_out
                    ]); 
                    
                }
                else{
                    DB::beginTransaction();
                    try {
                        DB::update(
                            'update t_user set photo = ? , userName = ? , mailAddress = ?, sex = ?, residenceCountry = ?, residencePrefecture = ?, dateOfBirth = ?, height = ?, weight = ?, certification = ?,expiryTimeOfCertification=?  where userId = ?',
                            [$request->photo, $request->userName, $request->mailAddress,$request->sex,$request->residenceCountry,$request->residencePrefecture,$request->dateOfBirth,$request->height,$request->weight,NULL,NULL,Auth::user()->userId]
                        );
                        //Store log data of the new registered user.
                        Log::channel('update')->info("$request->mailAddress は更新されました。");

                        DB::commit();
                    } catch (\Throwable $e) {
                        DB::rollBack();
                        $e_message = $e->getMessage();
                        $e_code = $e->getCode();
                        $e_file = $e->getFile();
                        $e_line = $e->getLine();
                        $e_sql = $e->getSql();
                        $e_errorCode = $e->errorInfo[1];
                        $e_bindings = implode(", ",$e->getBindings());
                        $e_connectionName = $e->connectionName;


                        //Store error message in the register log file.
                        Log::channel('update')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailAddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
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
        
                    

                    return redirect('profile')->with('status', "更新の件、完了になりました。");
                }
            }
            else{
                throw ValidationException::withMessages([
                    'verification_error' => $code_not_found
                ]); 
            }
            
            
        }
        else{
            
            return redirect('profile');
        }
    }
}
