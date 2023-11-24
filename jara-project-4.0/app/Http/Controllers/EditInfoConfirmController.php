<?php

namespace App\Http\Controllers;
// use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\T_user;
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
        return view('profile.edit.confirm');
    }
    public function store(Request $request): RedirectResponse
    {
            if((int)$request->mailAddressStatus===1){ 
            
                $certification_number = Str::random(6); // For Creating random password
                $date = date('Y-m-d H:i:s');
                $newDate = date('Y-m-d H:i:s', strtotime($date. ' + 24 hours'));
                
                DB::beginTransaction();
                try {
                    DB::update(
                        'update t_user set  certification = ? , expiryTimeOfCertification = ? where userId = ?',
                        [ $certification_number, $newDate, Auth::user()->userId]
                    );
                    //Store log data of the new registered user.
                    Log::channel('update')->info("$request->mailAddress は更新されました。");

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
                    Log::channel('update')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailAddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
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
                $mailDate = date('Y/m/d H:i');
                $newmailDate = date('Y/m/d H:i', strtotime($mailDate. ' + 24 hours'));
                $mailData = [
                    'name' => $request->userName,
                    'email' => $request->mailAddress,
                    'certification' => $certification_number,
                    'expiryTimeOfCertification'=> $newmailDate
                ];
                Mail::to($request->get('mailAddress'))->send(new VerificationMail($mailData));

                $userInfo = $request->all();
                return redirect('profile/edit/verification')->with('userInfo', $userInfo);
                dd("mail sent");

            }
            else{
                 
                DB::beginTransaction();
                try {
                    DB::update(
                        'update t_user set photo = ? , userName = ? , mailAddress = ?, sex = ?, residenceCountry = ?, residencePrefecture = ?, dateOfBirth = ?, height = ?, weight = ? where userId = ?',
                        [$request->photo, $request->userName, $request->mailAddress,$request->sex,$request->residenceCountry,$request->residencePrefecture,$request->dateOfBirth,$request->height,$request->weight,Auth::user()->userId]
                    );

                    DB::commit();
                } catch (\Throwable $e) {
                    DB::rollBack();
                     //Store error message in the register log file.
                     Log::channel('update')->info("email -> $value , error-message  -> $update_failed");
                     throw ValidationException::withMessages([
                         'datachecked_error' => $update_failed
                     ]); 
                }
                
                return redirect('profile')->with('status', "更新の件、完了になりました。");
            }
    }
}