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
    

    public function store(Request $request): RedirectResponse
    {
        
        include('ErrorMessages/ErrorMessages.php');

        $request->validate([
            // User name validation rule
            'user_name' => ['required', 'max:32', 'regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_][ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]*[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_]$/'], 
            // Mail address validation rule
            'mailaddress' => ['required', 'email', 'string', 'lowercase',  'max:255'],
            // Confirm mail address validation rule
            'confirm_email' => ['required', 'email', 'string', 'lowercase',  'max:255', 'same:mailaddress'],

            // Terms of service validation rule
            'terms_of_service' => ['accepted'],
        ],
        [
            //Error message for Username validation rule 
            'user_name.required' => $userName_required,
            'user_name.max' => $userName_max_limit,
            'user_name.regex' => $userName_regex,

            //Error message for mail address validation rule 
            'mailaddress.required' => $mailAddress_required,
            'mailaddress.email' => $email_validation,
            'mailaddress.lowercase' =>$mailAddress_lowercase,
            'mailaddress.unique' => $mailAddress_unique,

            //Error message for confirm mail address validation rule 
            'confirm_email.required' => $confirm_email_required,
            'confirm_email.email' => $email_validation,
            'confirm_email.lowercase' => $mailAddress_lowercase,
            'confirm_email.same' => $confirm_email_compare,

            //Error message for terms of service validation rule 
            'terms_of_service.accepted' => $terms_of_service,
        ]);

        if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? ',[$request->mailaddress]))){
            if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? and delete_flag = 0',[$request->mailaddress]))){
                if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? and temp_password_flag = 0',[$request->mailaddress]))){
                    //Display error message to the client
                    throw ValidationException::withMessages([
                        'datachecked_error' => $email_register_check
                    ]); 
                }
                else {
                    
                    if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? and expiry_time_of_temp_password < ?',[$request->mailaddress, date('Y-m-d H:i:s')]))) {
                        //Display error message to the client
                        throw ValidationException::withMessages([
                            'datachecked_error' => $registration_failed
                        ]); 
                    }
                    else {
                        //Display error message to the client
                        throw ValidationException::withMessages([
                            'datachecked_error' => $already_registered,
                        ]); 
                    }
                }
            }
            else {
                //Display error message to the client
                throw ValidationException::withMessages([
                    'datachecked_error' => $registration_failed,
                ]);
            }
        }
        
        // For Generate random password
        $temp_password = Str::random(8); 
        //For getting current time
        $date = date('Y-m-d H:i:s');
        //For adding 24hour with current time
        $newDate = date('Y-m-d H:i:s', strtotime($date. ' + 24 hours'));

        // Insert new user info in the database.(t_user table)

        DB::beginTransaction();
        try {
            $hashed_password = Hash::make($temp_password);
            $user = DB::insert('insert into t_users (user_name, mailaddress, password, temp_password, expiry_time_of_temp_password, temp_password_flag, registered_time, registered_user_id, updated_time, updated_user_id, delete_flag) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [$request->user_name, $request->mailaddress, $hashed_password, $hashed_password , $newDate, 1, now(), 9999999,now(), 9999999, 0 ]);

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
                throw ValidationException::withMessages([
                    'datachecked_error' => $registration_failed
                ]); 
            }
            else{
                throw ValidationException::withMessages([
                    'datachecked_error' => $registration_failed
                ]); 
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
            'temporary_password_expiration_date'=> $new_mail_date
        ];

        
        //Sending mail to the user
        
        try {
            Mail::to($request->get('mailaddress'))->send(new WelcomeMail($mail_data));
        } catch (Exception $e) {
            DB::delete('delete from t_users where mailaddress = ?', [$request->mailaddress ]);
            //Store error message in the user_register log file.
            Log::channel('user_register')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailaddress,  \r\n \r\n ＊＊＊「EMAIL_SENT_ERROR_MESSAGE」  ： $e\r\n  \r\n ============================================================ \r\n \r\n");
            //Display error message to the client
            throw ValidationException::withMessages([
                'datachecked_error' => $mail_sent_failed,
            ]);
        }

        //Refresh the requested data
        $request->merge(['user_name' => '']);
        $request->merge(['mailaddress' => '']);
        $request->merge(['confirm_email' => '']);
        $request->merge(['terms_of_service' => false]);

        $page_status = "入力されたメールアドレスに、「仮パスワード通知メール」を送信しました。<br/><br/>メール本文に記載された「仮パスワード」を使用して、ログイン画面よりログインしてください。";
        $page_url = route('login');
        $page_url_text = "OK";
        
        //Redirect to registered user to the login page with success status.
        return redirect('status')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
    }
}