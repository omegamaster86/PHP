<?php
/*************************************************************************
*  Project name: JARA
*  File name: UserPasswordChangeController.php
*  File extension: .php
*  Description: This is the controller file to manage user password change request
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
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\View\View;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class UserPasswordChangeController extends Controller
{
    //
    public function create(Request $request): View
    {

    }
    public function store(Request $request) : RedirectResponse
    {
        // dd($request->all());
        include('Auth/ErrorMessages/ErrorMessages.php');
        $request->validate([
            // previousPassword validation rule
            'previousPassword' => ['required', 'min:8', 'max:16','regex:/^.*(?=.{8,})(?=.*[a-zA-Z0-9!"#$%&\'()*+,-.:;<=>?@_`{|}~^]).*$/'], 
            // newPassword validation rule
            'newPassword' => ['required','min:8', 'max:16','regex:/^.*(?=.{8,})(?=.*[a-zA-Z0-9!"#$%&\'()*+,-.:;<=>?@_`{|}~^]).*$/'],
            // Confirm new Password validation rule
            'newPasswordConfirm' => ['required','min:8', 'max:16','regex:/^.*(?=.{8,})(?=.*[a-zA-Z0-9!"#$%&\'()*+,-.:;<=>?@_`{|}~^]).*$/', 'same:newPassword'],
        ],
        [
            //Error message for previousPassword validation rule 
            'previousPassword.required' => $previous_password_required,
            'previousPassword.min' => $password_condition,
            'previousPassword.max' => $password_condition,
            'previousPassword.regex' => $password_condition,

            //Error message for newPassword validation rule 
            'newPassword.required' => $new_password_required,
            'newPassword.min' => $password_condition,
            'newPassword.max' => $password_condition,
            'newPassword.regex' => $password_condition,

            
            //Error message for confirm new password validation rule 
            'newPasswordConfirm.required' => $new_password_confirm_required,
            'newPasswordConfirm.min' => $password_condition,
            'newPasswordConfirm.max' => $password_condition,
            'newPasswordConfirm.regex' => $password_condition,
            'newPasswordConfirm.same' => $password_compare,

           
        ]);
        if($request->previousPassword === $request->new_password_required){
            throw ValidationException::withMessages([
                'system_error' => $previous_and_new_password_compare
            ]); 
        }
        //When logged with a temporary flag
        if(Auth::user()->tempPassword){
            //If the entered password does matched with the database information
            if(Hash::check($request->previousPassword, Auth::user()->tempPassword)){
                
                DB::beginTransaction();
                    try {
                        
                        DB::update(
                            'update t_user set password = ? , tempPassword = ? , expiryTimeOfTempPassword = ?, tempPasswordFlag = ?,created_at = ?, updated_at =?  where userId = ?',
                            [Hash::make($request->newPassword), NULL, NULL, 0, now(), now(), Auth::user()->userId]
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
                        Log::channel('user_password_change')->info("\r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
                        if($e_errorCode == 1213||$e_errorCode == 1205)
                        {
                            throw ValidationException::withMessages([
                                'datachecked_error' => $database_system_error
                            ]); 
                        }
                        else{
                            throw ValidationException::withMessages([
                                'datachecked_error' => $database_system_error
                            ]); 
                        }
                    }
        
                    
                    $page_status = "パスワードを変更の件、完了になりました。";
                    $page_url = route('user.edit');
                    $page_url_text = "OK";
                    
                    return redirect('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);


            }
            //If the entered password does not matched with the database information
            else{
                throw ValidationException::withMessages([
                    'system_error' => $previous_password_not_matched
                ]); 
            }
        }
        //When logged as a registered user
        else {
            //If the entered password does matched with the database information
            if(Hash::check($request->previousPassword, Auth::user()->password)){
            
                DB::beginTransaction();
                    try {
                        
                        DB::update(
                            'update t_user set password = ?,created_at = ?,updated_at =?  where userId = ?',
                            [Hash::make($request->newPassword), now(), now(),  Auth::user()->userId]
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
                        Log::channel('user_password_change')->info("\r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
                        if($e_errorCode == 1213||$e_errorCode == 1205)
                        {
                            throw ValidationException::withMessages([
                                'datachecked_error' => $database_system_error
                            ]); 
                        }
                        else{
                            throw ValidationException::withMessages([
                                'datachecked_error' => $database_system_error
                            ]); 
                        }
                    }
        
                    
                    $page_status = "パスワードを変更の件、完了になりました。";
                    $page_url = route('my-page');
                    $page_url_text = "OK";
                    
                    return redirect('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
            }
            //If the entered password does not matched with the database information
            else{
                throw ValidationException::withMessages([
                    'system_error' => $previous_password_not_matched
                ]); 
            }
        }
        
        dd("stop");

    }
}
