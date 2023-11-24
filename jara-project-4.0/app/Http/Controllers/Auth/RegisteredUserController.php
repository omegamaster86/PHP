<?php
/*************************************************************************
*  Project name: JARA
*  File name: RegisteredUserController.php
*  File extension: .php
*  Description: This is the controller file to manage register request
*************************************************************************
*  Author: DEY PRASHANTA KUMAR
*  Created At: 2023/11/04
*  Updated At: 2023/11/09
*************************************************************************
*
*  Copyright 2023 by DPT INC.
*
************************************************************************/
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\T_user;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
// use Illuminate\Validation\Rules;
use Illuminate\View\View;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Illuminate\Validation\ValidationException;
use League\CommonMark\Node\Inline\Newline;



class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
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
        
        //'unique:' . T_user::class //for unique email check
        $request->validate([
            // Username validation rule
            'userName' => ['required', 'string', 'max:32','regex:/^[0-9a-zA-Z-_]+$/'], 
            // Mail address validation rule
            'mailAddress' => ['required','email', 'string', 'lowercase',  'max:255',
            function($attribute,$value,$fail) {
                include('ErrorMessages/ErrorMessages.php');
                if (DB::table('t_user')->where('mailAddress',$value)->exists()){
                    if (DB::table('t_user')->where('mailAddress',$value)->where('deleteFlag',0)->exists()){
                        if (DB::table('t_user')->where('mailAddress',$value)->where('tempPasswordFlag',0)->exists()){
                            // $fail('write message here');//To show error message beside the same field.

                            //Store error message in the register log file.
                            Log::channel('register')->info("email -> $value , error-message  -> $email_register_check");

                            //Display error message to the client
                            throw ValidationException::withMessages([
                                'datachecked_error' => $email_register_check
                            ]); 
                        }
                        else{
                            if (DB::table('t_user')->where('mailAddress', $value)->where('expiryTimeOfTempPassword', '<', date('Y-m-d H:i:s'))->exists()) {

                                //Store error message in the register log file.
                                Log::channel('register')->info("email -> $value , error-message  -> $registration_failed");

                                //Display error message to the client
                                throw ValidationException::withMessages([
                                    'datachecked_error' => $registration_failed
                                ]); 
                            }
                            else{
                                //Store error message in the register log file.
                                Log::channel('register')->info("email -> $value , error-message  -> $already_registered");

                                //Display error message to the client
                                throw ValidationException::withMessages([
                                    'datachecked_error' => $already_registered,
                                ]); 
                            }
                        }
                    }
                    else {

                        //Store error message in the register log file.
                        Log::channel('register')->info("email -> $value , error-message  -> $registration_failed");

                        //Display error message to the client
                        throw ValidationException::withMessages([
                            'datachecked_error' => $registration_failed,
                        ]);
                    }
                }
            }],
            // Confirm mail address validation rule
            'confirm_email' => ['required','email', 'string', 'lowercase',  'max:255', 'same:mailAddress'],

            // terms of service validation rule
            'terms_of_service' => ['accepted']
            // 'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ],
        [
            //Error message for Username validation rule 
            'userName.required' => $userName_required,
            'userName.max' => $userName_max_limit,
            'userName.regex' => $userName_regex,

            //Error message for mail address validation rule 
            'mailAddress.required' => $mailAddress_required,
            'mailAddress.email' => $email_validation,
            'mailAddress.lowercase' =>$mailAddress_lowercase,
            'mailAddress.unique' => $mailAddress_unique,

            //Error message for confirm mail address validation rule 
            'confirm_email.required' => $confirm_email_required,
            'confirm_email.email' => $email_validation,
            'confirm_email.lowercase' => $mailAddress_lowercase,
            'confirm_email.same' => $confirm_email_compare,

            //Error message for terms of service validation rule 
            'terms_of_service.accepted' => $terms_of_service,
        ]);
        
        
        // For Generate random password
        $temp_password = Str::random(8); 
        //For getting current time
        $date = date('Y-m-d H:i:s');
        //For adding 24hour with current time
        $newDate = date('Y-m-d H:i:s', strtotime($date. ' + 24 hours'));

        // Insert new user info in the database.(t_user table)

        DB::beginTransaction();
        try {
            $user = DB::insert('insert into t_user (userName, mailAddress,password,expiryTimeOfTempPassword,created_at,updated_at) values (?, ?, ?, ?, ?, ?)', [$request->userName, $request->mailAddress, Hash::make($temp_password),$newDate,$newDate,$newDate ]);

            
            //Store log data of the new registered user.
            Log::channel('register')->info("$request->mailAddress は登録されました。");

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
            Log::channel('register')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailAddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
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
        

        //For getting current time
        $mailDate = date('Y/m/d H:i');
        //For adding 24hour with current time
        $newmailDate = date('Y/m/d H:i', strtotime($mailDate. ' + 24 hours'));

        //Store user information for sending email.
        $mailData = [
            'name' => $request->userName,
            'email' => $request->mailAddress,
            'temporary_password' => $temp_password,
            'temporary_password_expiration_date'=> $newmailDate
        ];

        //Sending mail to the user
        Mail::to($request->get('mailAddress'))->send(new WelcomeMail($mailData));

         
        //event(new Registered($user));
        //Refresh the requested data
        $request->merge(['userName' => '']);
        $request->merge(['mailAddress' => '']);
        $request->merge(['confirm_email' => '']);
        $request->merge(['terms_of_service' => false]);

        //Redirect to registered user to the login page with success status.
        return redirect('login')->with('status', "入力されたメールアドレスに、<br/>「仮パスワード通知メール」を送信しました。<br/>メール本文に記載された「仮パスワード」を使用して、<br/>ログイン画面よりログインしてください。");
    }
}
