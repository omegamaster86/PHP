<?php
/*************************************************************************
*  Project name: JARA
*  File name: UserDeleteController.php
*  File extension: .php
*  Description: This is the controller file to manage user delete request
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
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationMail;

class UserDeleteController extends Controller
{
    //
    public function createUserDelete(Request $request): View
    {
        return view('user.details');
    }
    public function storeUserDelete(Request $request) : RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        $certification_number = Str::random(6); // For Creating random password
        $date = date('Y-m-d H:i:s');
        $new_date = date('Y-m-d H:i:s', strtotime($date. ' + 24 hours'));
                
        DB::beginTransaction();
        try {
            DB::update(
                'update t_users set  certification_number = ? , expiry_time_of_certification = ? where user_id = ?',
                [ $certification_number, $new_date, Auth::user()->user_id]
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
            Log::channel('user_delete')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailaddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
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
        
        //Sending mail to the user
        $mail_date = date('Y/m/d H:i');
        $new_mail_date = date('Y/m/d H:i', strtotime($mail_date. ' + 24 hours'));
        $mail_data = [
            'name' => Auth::user()->user_name,
            'email' => Auth::user()->mailaddress,
            'certification' => $certification_number,
            'expiryTimeOfCertification'=> $new_mail_date
        ];
        Mail::to( Auth::user()->mailaddress)->send(new VerificationMail($mail_data));

        return redirect('user/delete/verification');
    }
}
