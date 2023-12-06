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
		$user = array("user_name" => Auth::user()->user_name, "user_id" => Auth::user()->user_id, "user_type" => Auth::user()->user_type, "temp_password_flag" => Auth::user()->temp_password_flag);
        
        return view('user.password-change')->with(compact('user'));

    }
    public function store(Request $request) : RedirectResponse
    {
        // dd($request->all());
        include('Auth/ErrorMessages/ErrorMessages.php');
        $request->validate([
            // previousPassword validation rule
            'previous_password' => ['required', 'min:8', 'max:16','regex:/^.*(?=.{8,})(?=.*[a-zA-Z0-9!"#$%&\'()*+,-.:;<=>?@_`{|}~^]).*$/'], 
            // newPassword validation rule
            'new_password' => ['required','min:8', 'max:16','regex:/^.*(?=.{8,})(?=.*[a-zA-Z0-9!"#$%&\'()*+,-.:;<=>?@_`{|}~^]).*$/'],
            // Confirm new Password validation rule
            'new_password_confirm' => ['required','min:8', 'max:16','regex:/^.*(?=.{8,})(?=.*[a-zA-Z0-9!"#$%&\'()*+,-.:;<=>?@_`{|}~^]).*$/', 'same:new_password'],
        ],
        [
            //Error message for previousPassword validation rule 
            'previous_password.required' => $previous_password_required,
            'previous_password.min' => $password_condition,
            'previous_password.max' => $password_condition,
            'previous_password.regex' => $password_condition,

            //Error message for newPassword validation rule 
            'new_password.required' => $new_password_required,
            'new_password.min' => $password_condition,
            'new_password.max' => $password_condition,
            'new_password.regex' => $password_condition,

            
            //Error message for confirm new password validation rule 
            'new_password_confirm.required' => $new_password_confirm_required,
            'new_password_confirm.min' => $password_condition,
            'new_password_confirm.max' => $password_condition,
            'new_password_confirm.regex' => $password_condition,
            'new_password_confirm.same' => $password_compare,

           
        ]);
        if($request->previous_password === $request->new_password_required){
            throw ValidationException::withMessages([
                'system_error' => $previous_and_new_password_compare
            ]); 
        }
        //When logged with a temporary flag
        if(Auth::user()->temp_password){
            //If the entered password does matched with the database information
            if(Hash::check($request->previous_password, Auth::user()->temp_password)){
                
                DB::beginTransaction();
                    try {
                        
                        DB::update(
                            'update t_users set password = ? , temp_password = ? , expiry_time_of_temp_password = ?, temp_password_flag = ?,registered_time = ?, updated_time =?  where user_id = ?',
                            [Hash::make($request->new_password), NULL, NULL, 0, now(), now(), Auth::user()->user_id]
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
                            'update t_users set password = ?, registered_time = ?,updated_time =?  where user_id = ?',
                            [Hash::make($request->new_password), now(), now(),  Auth::user()->user_id]
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
