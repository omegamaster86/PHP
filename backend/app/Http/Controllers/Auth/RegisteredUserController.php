<?php
/*************************************************************************
*  Project name: JARA
*  File name: RegisteredUserController.php
*  File extension: .php
*  Description: This is the controller file to manage register request
*************************************************************************
*  Author: DEY PRASHANTA KUMAR
*  Created At: 2023/11/04
*  Updated At: 2023/12/04
*************************************************************************
*
*  Copyright 2023 by DPT INC.
*
************************************************************************/
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\View\View;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Mail\Mailer;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Illuminate\Validation\ValidationException;



class RegisteredUserController extends Controller
{
    /**
     * Display the user registration view.
     */
    public function create(): View
    {
        return view('auth.register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    

    public function store(Request $request)
    {
        // Change frontend field according to the developped laravel field 
        $request->merge(['user_name'=>$request->userName,'mailaddress'=>$request->email,'confirm_email'=>$request->confirmEmail,'terms_of_service'=>$request->checked]);
        
        include('ErrorMessages/ErrorMessages.php');
        

        if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? ',[$request->mailaddress]))){
            if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? and delete_flag = 0',[$request->mailaddress]))){
                if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? and temp_password_flag = 0',[$request->mailaddress]))){
                    
                    return response()->json(['system_error' => $email_register_check],400);
                    //Status code 400 is for bad request from user
                }
                // else {
                    
                //     if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? and expiry_time_of_temp_password < ?',[$request->mailaddress, date('Y-m-d H:i:s')]))) {
                        
                //         return response()->json(['system_error' => $registration_failed],400);
                //         //Status code 400 is for bad request from user
                //     }
                //     else {
                        
                //         // return response()->json(['system_error' => $already_registered],400);
                //         //Status code 400 is for bad request from user
                //     }
                // }
            }
            else {
                return response()->json(['system_error' => $registration_failed],400);
                //Status code 400 is for bad request from user
            }
        }
        
        // For Generate random password
        $temp_password = Str::random(8); 
        //For getting current time
        $date = now()->format('Y-m-d H:i:s.u');

        //For adding 1day with current time
        $converting_date=date_create($date);
        date_add($converting_date,date_interval_create_from_date_string("1 day"));
        $newDate = date_format($converting_date,"Y-m-d H:i:s.u");

        // Insert new user info in the database.(t_user table)

        DB::beginTransaction();
        try {
            $hashed_password = Hash::make($temp_password);
            $find_user_id = DB::select('SELECT user_id FROM t_users where mailaddress = ? and delete_flag = 0 and temp_password_flag = 1 ',[$request->mailaddress]);
            $user_id = '';
            if(!empty($find_user_id)){
                $user_id = $find_user_id[0]->user_id;
            }

            if($user_id){
                DB::update('update t_users set user_name = ?, password  = ?, expiry_time_of_temp_password  = ?, registered_time  = ?, registered_user_id  = ?, updated_time  = ?, updated_user_id  = ? where mailaddress = ? and temp_password_flag  = 1', [$request->user_name, $hashed_password , $newDate,  $date, $user_id, $date, $user_id,  $request->mailaddress ]);
            }
            else{
                DB::insert('insert into t_users (user_name, mailaddress, password, expiry_time_of_temp_password, temp_password_flag, registered_time, registered_user_id, updated_time, updated_user_id, delete_flag) values ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [$request->user_name, $request->mailaddress, $hashed_password , $newDate, 1, $date, 9999999,$date, 9999999, 0 ]);
            }
            

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
            Log::channel('user_register')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailAddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
            if($e_errorCode == 1213||$e_errorCode == 1205)
            {
                // throw ValidationException::withMessages([
                //     'datachecked_error' => $registration_failed
                // ]);
                return response()->json(['system_error' => $registration_failed],500);
                //Status code 500 for internal server error
            }
            else{
                // throw ValidationException::withMessages([
                //     'datachecked_error' => $registration_failed
                // ]); 
                return response()->json(['system_error' => $registration_failed],500);
                //Status code 500 for internal server error
            }
        }
        
        //For getting current time
        $mail_date = date('Y/m/d H:i');
        //For adding 24hour with current time
        $new_mail_date = date('Y/m/d H:i', strtotime($mail_date. ' + 24 hours'));

        //Store user information for sending email.
        $mail_data = [
            'user_name' => $request->user_name,
            'to_mailaddress' => $request->mailaddress,
            'from_mailaddress' => 'xxxxx@jara.or.jp',
            'temporary_password' => $temp_password,
            'temporary_password_expiration_date'=> $new_mail_date,
            'login_url'=> env('FRONTEND_URL').'/login'
        ];

        
        //Sending mail to the user
        
        try {
            Mail::to($request->get('mailaddress'))->send(new WelcomeMail($mail_data));
        } catch (Exception $e) {
            // DB::delete('delete from t_users where mailaddress = ?', [$request->mailaddress ]);
            // //Store error message in the user_register log file.
            // Log::channel('user_register')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailaddress,  \r\n \r\n ＊＊＊「EMAIL_SENT_ERROR_MESSAGE」  ： $e\r\n  \r\n ============================================================ \r\n \r\n");
            //Display error message to the client
            // throw ValidationException::withMessages([
            //     'datachecked_error' => $mail_sent_failed,
            // ]);
            return response()->json(['system_error' => $registration_failed],500);
                //Status code 500 for internal server error
        }

        //Refresh the requested data
        $request->merge(['user_name' => '']);
        $request->merge(['mailaddress' => '']);
        $request->merge(['confirm_email' => '']);

        // $page_status = "入力されたメールアドレスに、「仮パスワード通知メール」を送信しました。<br/><br/>メール本文に記載された「仮パスワード」を使用して、ログイン画面よりログインしてください。";
        // $page_url = route('login');
        // $page_url_text = "OK";

        return response()->json("入力されたメールアドレスに、\n「仮パスワード通知メール」を送信しました。\n\nメール本文に記載された「仮パスワード」を使用して、\nログイン画面よりログインしてください。\n");
        
        //Redirect to registered user to the login page with success status.
        // return redirect('status')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
    }
}