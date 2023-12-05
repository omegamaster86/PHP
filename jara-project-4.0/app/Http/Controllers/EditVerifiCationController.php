<?php
/*************************************************************************
*  Project name: JARA
*  File name: EditVerifiCationController.php
*  File extension: .php
*  Description: This is the controller file to edit user request when mail address changed
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

use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Validation\ValidationException;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EditVerifiCationController extends Controller
{
    
    public function create(Request $request): View
    {
        return view('user.edit.verification');
    }
    public function store(Request $request): RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        if($request->certification_number === ""){
            throw ValidationException::withMessages([
                'verification_error' => $code_not_found
            ]); 
        }
        if($request->mailaddress_status=="1"){
            if (DB::table('t_users')->where('mailaddress', Auth::user()->mailaddress)->where('certification_number', '=', $request->certification_number)->exists()){
                if (DB::table('t_users')->where('mailaddress', Auth::user()->mailaddress)->where('expiry_time_of_certification_number', '<', date('Y-m-d H:i:s'))->exists()) {
                    throw ValidationException::withMessages([
                        'verification_error' => $code_timed_out
                    ]); 
                    
                }
                else{
                    DB::beginTransaction();
                    try {
                        
                        DB::update(
                            'update t_users set photo = ? , user_name = ? , mailaddress = ?, sex = ?, residence_country = ?, residence_prefecture = ?, date_of_birth = ?, height = ?, weight = ?, certification_number = ?,expiry_time_of_certification_number=?  where user_id = ?',
                            [$request->photo, $request->user_name, $request->mailaddress,$request->sex,$request->residence_country,$request->residence_prefecture,$request->date_of_birth,$request->height,$request->weight,NULL,NULL,Auth::user()->user_id]
                        );

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
                        Log::channel('user_update')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailAddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
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
        
                    
                    $page_status = "更新の件、完了になりました。";
                    $page_url = route('my-page');
                    $page_url_text = "マイページ";
                    
                    return redirect('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
                    
                }
            }
            else{
                throw ValidationException::withMessages([
                    'verification_error' => $code_not_found
                ]); 
            }
            
            
        }
        else{
            
            return redirect('user/edit');
        }
    }
}
