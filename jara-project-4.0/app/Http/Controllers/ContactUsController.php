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
namespace App\Http\Controllers;

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
use App\Mail\VerificationMail;
use App\Mail\ContactUsMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ContactUsController extends Controller
{
    /**
     * Display the user registration view.
     */
    public function create(): View
    {
        $user_logged_out = empty(Auth::user());

        if(!$user_logged_out) {

            $user = array("user_id" => str_pad(Auth::user()->user_id, 7, "0", STR_PAD_LEFT),
                "user_name" => Auth::user()->user_name, 
                "mailaddress" => Auth::user()->mailaddress);

            return view('contact-us',["user_logged_out"=>$user_logged_out, "user"=>(object)$user]);
        }
        return view('contact-us',["user_logged_out"=>$user_logged_out]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */

     public function store(Request $request)
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        $request->validate([
            // User name validation rule
            'user_name' => ['required', 'max:32', 'regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_][ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]*[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_]$/'], 
            // Mail address validation rule
            'mailaddress' => ['required', 'email', 'string', 'lowercase',  'max:255'],

            // Content validation rule
            'content' => ['required'],
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

            //Error message for content validation rule 
            'content.required' => $content_required,

            //Error message for terms of service validation rule 
            'terms_of_service.accepted' => $terms_of_service_for_contact_us,
        ]);

        $user = $request->all();
        $user_logged_out = empty(Auth::user());
        $previousPageStatus = true;

        return view('contact-us-confirm',["user_logged_out"=>$user_logged_out, "user"=>(object)$user,'previousPageStatus'=>$previousPageStatus]);
    }
    public function createConfirm()
    {
        if($previousPageStatus??"") {
            return view('contact-us-confirm');
        }
        else{
            return redirect('contact-us');
        }

    }
    public function storeConfirm(Request $request)
    {
        include('Auth/ErrorMessages/ErrorMessages.php');

        //Store user information for sending email.
        if($request->user_id)
            $user_id = $request->user_id;
        else
            $user_id = "";
        $mail_data = [
            'user_name' => $request->user_name,
            'mailaddress' => $request->mailaddress,
            'content' => $request->content,
            'user_id'=> $user_id
        ];

        //Sending mail to the user
            
        try {
            Mail::to($request->get('mailaddress'))->send(new ContactUsMail($mail_data));
        } catch (Exception $e) {
            //Store error message in the user_password_reset log file.
            Log::channel('contact_us')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailaddress,  \r\n \r\n ＊＊＊「EMAIL_SENT_ERROR_MESSAGE」  ： $e\r\n  \r\n ============================================================ \r\n \r\n");
            //Display error message to the client
            throw ValidationException::withMessages([
                'mail_sent_error' => $mail_sent_failed_for_contact_us,
            ]);
        }
        if($request->user_id??""){
            $page_status = "メールの送信が完了しました";
            $page_url = route('my-page');
            $page_url_text = "マイページ";

            return view('change-notification',['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
        }
        else{
            $page_status = "メールの送信が完了しました";
            $page_url = route('login');
            $page_url_text = "ログイン";

            return redirect('status')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
        }
        
    }
}