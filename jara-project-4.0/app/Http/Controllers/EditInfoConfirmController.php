<?php
/*************************************************************************
*  Project name: JARA
*  File name: EditInfoConfirmController.php
*  File extension: .php
*  Description: This is the controller file to manage edit user request
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
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EditInfoConfirmController extends Controller
{
    public function create(Request $request): View
    {
        return view('user.edit.confirm');
    }
    public function store(Request $request): View
    {
            if((int)$request->mailaddress_status===1){ 
            
                $certification_number = Str::random(6); // For Creating random password
                $date = date('Y-m-d H:i:s');
                $new_date = date('Y-m-d H:i:s', strtotime($date. ' + 30 minutes'));
                
                DB::beginTransaction();
                try {
                    DB::update(
                        'update t_users set  certification = ? , expiryTimeOfCertification = ? where userId = ?',
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
                    Log::channel('user_update')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailaddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
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
                $new_mail_date = date('Y/m/d H:i', strtotime($mail_date. ' + 30 minutes'));
                $mail_data = [
                    'name' => $request->user_name,
                    'email' => $request->mailaddress,
                    'certification' => $certification_number,
                    'expiryTimeOfCertification'=> $new_mail_date
                ];
                Mail::to($request->get('mailaddress'))->send(new VerificationMail($mail_data));

                $user_info = $request->all();
                
                // return redirect('user/edit/verification')->with('user_info', $user_info);
                return view('user/edit/verification')->with(compact('user_info'));
                dd("mail sent");

            }
            else{
                 
                DB::beginTransaction();
                try {
                    DB::update(
                        'update t_users set photo = ? , user_name = ? , mailaddress = ?, sex = ?, residence_country = ?, residence_prefecture = ?, date_of_birth = ?, height = ?, weight = ? where user_id = ?',
                        [$request->photo, $request->user_name, $request->mailaddress,$request->sex,$request->residence_country,$request->residence_prefecture,$request->date_of_birth,$request->height,$request->weight,Auth::user()->user_id]
                    );

                    DB::commit();
                } catch (\Throwable $e) {
                    DB::rollBack();
                    // dd($request->all());
                    $e_message = $e->getMessage();
                    $e_code = $e->getCode();
                    $e_file = $e->getFile();
                    $e_line = $e->getLine();
                    $e_sql = $e->getSql();
                    $e_errorCode = $e->errorInfo[1];
                    $e_bindings = implode(", ",$e->getBindings());
                    $e_connectionName = $e->connectionName;

                     //Store error message in the user update log file.
                    Log::channel('user_update')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailaddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
                     throw ValidationException::withMessages([
                         'datachecked_error' => $update_failed
                     ]); 
                }
                $page_status = "更新の件、完了になりました。";
                $page_url = route('my-page');
                $page_url_text = "マイページ";
                
                return view('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
                
                // return redirect('profile')->with('status', "更新の件、完了になりました。");
            }
    }
}