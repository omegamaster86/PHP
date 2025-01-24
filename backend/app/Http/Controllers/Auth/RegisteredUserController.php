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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RegisteredUserController extends Controller
{
    public function store(Request $request)
    {
        // Change frontend field according to the developped laravel field 
        $request->merge(['user_name' => $request->userName, 'mailaddress' => $request->email, 'confirm_email' => $request->confirmEmail, 'terms_of_service' => $request->checked]);

        include('ErrorMessages/ErrorMessages.php');


        if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? and delete_flag = 0', [$request->mailaddress]))) {
            if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? and temp_password_flag = 0', [$request->mailaddress]))) {

                abort(400, $email_register_check);
            }
        }

        // For Generate random password
        $temp_password = Str::random(8);
        //For getting current time
        $date = now()->format('Y-m-d H:i:s.u');

        //For adding 1day with current time
        $converting_date = date_create($date);
        date_add($converting_date, date_interval_create_from_date_string("1 day"));
        $newDate = date_format($converting_date, "Y-m-d H:i:s.u");

        // Insert new user info in the database.(t_user table)

        DB::beginTransaction();
        try {
            $hashed_password = Hash::make($temp_password);
            $find_user_id = DB::select('SELECT user_id FROM t_users where mailaddress = ? and delete_flag = 0 and temp_password_flag = 1 ', [$request->mailaddress]);
            $user_id = '';
            if (!empty($find_user_id)) {
                $user_id = $find_user_id[0]->user_id;
            }

            if ($user_id) {
                DB::update('update t_users set user_name = ?, password  = ?, expiry_time_of_temp_password  = ?, registered_time  = ?, registered_user_id  = ?, updated_time  = ?, updated_user_id  = ? where mailaddress = ? and temp_password_flag  = 1', [$request->user_name, $hashed_password, $newDate,  $date, $user_id, $date, $user_id,  $request->mailaddress]);
            } else {
                DB::insert('insert into t_users (user_name, mailaddress, password, expiry_time_of_temp_password, temp_password_flag, registered_time, registered_user_id, updated_time, updated_user_id, delete_flag) values ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [$request->user_name, $request->mailaddress, $hashed_password, $newDate, 1, $date, 9999999, $date, 9999999, 0]);
            }


            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e);

            abort(500, $registration_failed);
        }

        //For getting current time
        $mail_date = date('Y/m/d H:i');
        //For adding 24hour with current time
        $new_mail_date = date('Y/m/d H:i', strtotime($mail_date . ' + 24 hours'));

        //Getting url information from env file.
        $frontend_url  = config('env-data.frontend-url');

        //Store user information for sending email.

        $mail_data = [
            'user_name' => $request->user_name,
            'to_mailaddress' => $request->mailaddress,
            'from_mailaddress' => 'xxxxx@jara.or.jp',
            'temporary_password' => $temp_password,
            'temporary_password_expiration_date' => $new_mail_date,
            'login_url' => $frontend_url . '/login'
        ];
        //Sending mail to the user

        try {
            Mail::to($request->get('mailaddress'))->send(new WelcomeMail($mail_data));
        } catch (\Throwable $e) {
            Log::error($e);

            abort(500, $registration_failed);
        }

        //Refresh the requested data
        $request->merge(['user_name' => '']);
        $request->merge(['mailaddress' => '']);
        $request->merge(['confirm_email' => '']);

        return response()->json("入力されたメールアドレスに、\n「仮パスワード通知メール」を送信しました。\n\nメール本文に記載された「仮パスワード」を使用して、\nログイン画面よりログインしてください。\n");
    }
}
