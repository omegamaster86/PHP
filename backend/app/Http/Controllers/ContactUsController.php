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
    public function store(Request $request)
    {
        include('Auth/ErrorMessages/ErrorMessages.php');

        Log::debug(sprintf("contact-us start"));
        Log::debug($request->all());

        $mail_data = [
            'user_name' => $request->user_name,
            'mailaddress' => $request->mailaddress,
            'content' => $request->content,
            'user_id' => Auth::user()->user_id ?? ""
        ];


        //Sending mail to the user

        try {
            Mail::to($request->get('mailaddress'))->send(new ContactUsMail($mail_data));
        } catch (\Throwable $e) {

            Log::error($e);

            //Display error message to the client
            Log::debug(sprintf("contact-us end"));
            abort(400, $mail_sent_failed_for_contact_us);
        }
        Log::debug(sprintf("contact-us end"));
        return response()->json(["メール送信の件、完了しました。"], 200);
    }
}
