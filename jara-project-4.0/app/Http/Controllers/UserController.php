<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;
use Illuminate\Validation\ValidationException;
use App\Services\FileUploadService;
use App\Models\T_user;
use App\Http\Requests\FileUploadRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;

class UserController extends Controller
{
    //
    public function createEdit(Request $request): View
    {   
        if(Auth::user()->date_of_birth)
            $date_of_birth = date('Y/m/d', strtotime(Auth::user()->date_of_birth));
        else
            $date_of_birth = "年/月/日";

        $user = array(
            "user_name" => Auth::user()->user_name, 
            "user_id" => Auth::user()->user_id, 
            "user_type" => Auth::user()->user_type, 
            "mailaddress" => Auth::user()->mailaddress, 
            "sex" => Auth::user()->sex, 
            "residence_country" => Auth::user()->residence_country, "residence_prefecture" => Auth::user()->residence_prefecture ,
            "photo" => Auth::user()->photo, 
            "date_of_birth" => $date_of_birth, 
            "height" => Auth::user()->height, 
            "weight" => Auth::user()->weight );

        return view('user.edit')->with(compact('user'));
    }
    public function storeEdit(Request $request) : View
    {

        include('Auth/ErrorMessages/ErrorMessages.php');
        // dd($request->photo);
        if ($request->hasFile('photo')) {
            
            // Storage::disk('local')->put('example.txt', $request->file('photo'));
            
            $file = $request->file('photo');
            // $file->store('toPath', ['disk' => 'public']);
            $file_name = DB::table('t_users')->where('mailaddress', '=', Auth::user()->mailaddress)->value('user_id'). '.' . $request->file('photo')->getClientOriginalExtension();
            // Storage::disk('public')->put($fileName, $file);

            // Storage::disk('public')->putFileAs('uploads', $file, $fileName);

            $destination_path = public_path().'/images/users/' ;
            $file->move($destination_path,$file_name);

            // You can now save the $filePath to the database or use it as needed
            // ...
            // return response()->json(['message' => 'File uploaded successfully']);
        }
        
        
        // Type Conversion
        $request->mailaddress_status = (int)$request->mailaddress_status;
        $request->height = doubleval($request->height);
        $request->weight = (int)$request->weight;

        if((int)$request->mailaddress_status===1){
            $request->validate([
                // [^\x01-\x7E]
                // ^[0-9a-zA-Z-_]+$
                // Username validation rule
                'user_name' => ['required', 'string', 'max:32','regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_][ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]*[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_]$/'],   

                // Mail address validation rule
                'mailaddress' => ['required','email', 'string', 'lowercase',  'max:255','unique:' . T_user::class],
                //Confirm mail address validation rule
                'confirm_email' => ['required','email', 'string', 'lowercase',  'max:255', 'same:mailAddress'],

                'sex' => ['required','string'],
                'date_of_birth' => ['required','string'],
                'residence_country' => ['required','string'],
                'residence_prefecture' => ['nullable','required_if:residence_country,日本','string'
                
                // function($attribute,$value,$fail) {
                    //     include('ErrorMessages/ErrorMessages.php');
                            
                    // },
                    ]
                ], 
                [
                //Error message for Username validation rule 
                'user_name.required' => $userName_required,
                'user_name.max' => $userName_max_limit,
                'user_name.regex' => $userName_regex,
                //Error message for mail address validation rule 
                'mailaddress.required' => $mailAddress_required,
                'mailaddress.email' => $email_validation,
                'mailaddress.lowercase' => $mailAddress_lowercase,
                'mailaddress.unique' => $mailAddress_unique,

                //Error message for confirm mail address validation rule 
                'confirm_email.required' => $confirm_email_required ,
                'confirm_email.email' => $email_validation,
                'confirm_email.lowercase' => $mailAddress_lowercase,
                'confirm_email.same' => $confirm_email_compare,
                //Error message for date of birth validation rule 
                'sex.required' => $sex_required,
                'date_of_birth.required' => $dateOfBirth_required,
                'residence_country.required' => $residenceCountry_required,
                'residence_prefecture.required_if' => $residencePrefecture_required_if,
            ]);
        }
        else{
            $request->validate([
                // Username validation rule
                'user_name' => ['required', 'string', 'max:32','regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_][ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]*[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_]$/'],
                'sex' => ['required','string'],
                'date_of_birth' => ['required','string'],
                'residence_country' => ['required','string'],
                'residence_prefecture' => ['nullable','required_if:residence_country,日本','string']

            ],
                [
                    //Error message for Username validation rule 
                    'user_name.required' => $userName_required,
                    'user_name.regex' => $userName_regex,
                    'user_name.max' => $userName_max_limit,
                    'sex.required' => $sex_required,
                    //Error message for date of birth validation rule 
                    'date_of_birth.required' => $dateOfBirth_required,
                    'residence_country.required' => $residenceCountry_required,
                    'residence_prefecture.required_if' => $residencePrefecture_required_if,
                ]
            );
        }
        //For getting current time
        $date = date('Y-m-d H:i:s');
        //For adding 24hour with current time
        $new_date = date('Y-m-d H:i:s', strtotime($date. ' + 24 hours'));

        
        $user_info = $request->all();
        
        if ($request->hasFile('photo')){
            $user_info['photo']=DB::table('t_users')->where('mailaddress', '=', Auth::user()->mailaddress)->value('user_id'). '.' . $request->file('photo')->getClientOriginalExtension();
        }
        else{
            if($request->user_picture_status==="delete")
                $user_info['photo']="";
            else
                $user_info['photo']=DB::table('t_users')->where('mailaddress', '=', Auth::user()->mailaddress)->value('photo');
        }
        // dd($userInfo['photo']);->with(compact('user')->with('user_info', $user_info)
        return view('user/edit/confirm')->with(compact('user_info'));       
        
    }

    public function createEditConfirmController(Request $request): View
    {
        return view('user.edit.confirm');
    }
    public function storeEditConfirmController(Request $request): View
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

    public function createEditVerifiCation(Request $request): View
    {
        return view('user.edit.verification');
    }
    public function storeEditVerifiCation(Request $request): RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        if($request->certification_number === ""){
            throw ValidationException::withMessages([
                'verification_error' => $code_not_found
            ]); 
        }
        if($request->mailaddress_status=="1"){
            if (DB::table('t_users')->where('mailaddress', Auth::user()->mailaddress)->where('certification_number', '=', $request->certification_number)->exists()){
                if (DB::table('t_users')->where('mailaddress', Auth::user()->mailaddress)->where('expiry_time_of_certification_number', '<', date('Y-m-d H:i:s'))->exists()) {
                    throw ValidationException::withMessages([
                        'verification_error' => $code_timed_out
                    ]); 
                    
                }
                else{
                    DB::beginTransaction();
                    try {
                        
                        DB::update(
                            'update t_users set photo = ? , user_name = ? , mailaddress = ?, sex = ?, residence_country = ?, residence_prefecture = ?, date_of_birth = ?, height = ?, weight = ?, certification_number = ?,expiry_time_of_certification_number=?  where user_id = ?',
                            [$request->photo, $request->user_name, $request->mailaddress,$request->sex,$request->residence_country,$request->residence_prefecture,$request->date_of_birth,$request->height,$request->weight,NULL,NULL,Auth::user()->user_id]
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
                        Log::channel('user_update')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailAddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
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
        
                    
                    $page_status = "更新の件、完了になりました。";
                    $page_url = route('my-page');
                    $page_url_text = "マイページ";
                    
                    return redirect('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
                    
                }
            }
            else{
                throw ValidationException::withMessages([
                    'verification_error' => $code_not_found
                ]); 
            }
            
            
        }
        else{
            
            return redirect('user/edit');
        }
    }

    public function createDetails(Request $request): View
    {
        $user = array(
            "user_name" => Auth::user()->user_name, 
            "user_id" => Auth::user()->user_id, 
            "user_type" => Auth::user()->user_type, 
            "mailaddress" => Auth::user()->mailaddress, 
            "sex" => Auth::user()->sex, 
            "residence_country" => Auth::user()->residence_country, "residence_prefecture" => Auth::user()->residence_prefecture ,
            "photo" => Auth::user()->photo, 
            "date_of_birth" => Auth::user()->date_of_birth, 
            "height" => Auth::user()->height, 
            "weight" => Auth::user()->weight );

        return view('user.details',["page_mode" => "details"])->with(compact('user'));
    }
    public function createDelete(Request $request): View
    {
        $user = array(
            "user_name" => Auth::user()->user_name, 
            "user_id" => Auth::user()->user_id, 
            "user_type" => Auth::user()->user_type, 
            "mailaddress" => Auth::user()->mailaddress, 
            "sex" => Auth::user()->sex, 
            "residence_country" => Auth::user()->residence_country, "residence_prefecture" => Auth::user()->residence_prefecture ,
            "photo" => Auth::user()->photo, 
            "date_of_birth" => Auth::user()->date_of_birth, 
            "height" => Auth::user()->height, 
            "weight" => Auth::user()->weight );

        return view('user.details',["page_mode" => "delete"])->with(compact('user'));
    }
    public function storeDelete(Request $request) : RedirectResponse
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
    public function createDeleteVerification(Request $request): View
    {
        return view('user.delete.verification');
    }
    public function storeDeleteVerification(Request $request): RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        if($request->certification_number === ""){
            throw ValidationException::withMessages([
                'verification_error' => $code_not_found
            ]); 
        }
        
        if (DB::table('t_users')->where('mailaddress', '=', Auth::user()->mailaddress)->where('certification_number', '=', $request->certification_number)->exists()){
            if (DB::table('t_users')->where('mailaddress', '=', Auth::user()->mailaddress)->where('expiry_time_of_certification_number', '<', date('Y-m-d H:i:s'))->exists()) {
                throw ValidationException::withMessages([
                    'verification_error' => $code_timed_out
                ]); 
                
            }
            else{

                DB::beginTransaction();
            try {
                DB::update(
                    'update t_users set delete_flag = ?  where mailaddress = ?',
                    [ "1",Auth::user()->mailaddress]
                );

                // Logout Function
                Auth::guard('web')->logout();

                //Destroy current session
                $request->session()->invalidate();

                //Destroy current  token
                $request->session()->regenerateToken();

                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();

                $e_message = $e->getMessage(                                        );
                $e_code = $e->getCode();
                $e_file = $e->getFile();
                $e_line = $e->getLine();
                $e_sql = $e->getSql();
                $e_errorCode = $e->errorInfo[1];
                $e_bindings = implode(", ",$e->getBindings());
                $e_connectionName = $e->connectionName;


                //Store error message in the user delete log file.
                Log::channel('user_delete')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailAddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
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
                
            $page_status = "退会の件、完了しました。";
            $page_url = route('register');
            $page_url_text = "仮登録ページ";
            
            //Redirect to registered user to the login page with success status.
            return redirect('status')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
            }
        }
        else{
            throw ValidationException::withMessages([
                'verification_error' => $code_not_found
            ]); 
        }
    }

    public function createPasswordChange(Request $request): View
    {
		$user = array("user_name" => Auth::user()->user_name, "user_id" => Auth::user()->user_id, "user_type" => Auth::user()->user_type, "temp_password_flag" => Auth::user()->temp_password_flag);
        
        return view('user.password-change')->with(compact('user'));

    }
    public function storePasswordChange(Request $request) : View
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
                    
                    return view('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
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
