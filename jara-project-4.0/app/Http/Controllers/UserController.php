<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Services\FileUploadService;
use App\Models\T_users;
use App\Http\Requests\FileUploadRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationMail;
use App\Mail\PasswordResetMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;


use App\Models\M_sex;
use App\Models\M_countries;
use App\Models\M_prefectures;

class UserController extends Controller
{
    public static $loginUserInfo = [
        'user_id' => null,
        'user_name' => ""
    ];

    //
    public function createEdit(Request $request, M_sex $sex, M_countries $countries, M_prefectures $prefectures): View
    {
        if (Auth::user()->date_of_birth)
            $date_of_birth = date('Y/m/d', strtotime(Auth::user()->date_of_birth));
        else
            $date_of_birth = "年/月/日";

        $user = array(
            "user_name" => Auth::user()->user_name,
            "user_id" => Auth::user()->user_id,
            "user_type" => Auth::user()->user_type,
            "mailaddress" => Auth::user()->mailaddress,
            "sex" => Auth::user()->sex,
            "residence_country" => Auth::user()->residence_country, "residence_prefecture" => Auth::user()->residence_prefecture,
            "photo" => Auth::user()->photo,
            "date_of_birth" => $date_of_birth,
            "height" => Auth::user()->height,
            "weight" => Auth::user()->weight
        );

        //Fetch sex list from master table
        $sex_list = $sex->getSexList();
        //Fetch country list from master table
        $countries = $countries->getCountries();
        //Fetch prefecture list from master table
        $prefectures = $prefectures->getPrefecures();

        return view('user.edit', ["user" => (object)$user, "sex_list" => $sex_list, "countries" => $countries, "prefectures" => $prefectures]);
    }
    public function storeEdit(Request $request, M_sex $sex, M_countries $countries, M_prefectures $prefectures): View
    {

        include('Auth/ErrorMessages/ErrorMessages.php');
        // dd($request->photo);
        if ($request->hasFile('photo')) {

            // Storage::disk('local')->put('example.txt', $request->file('photo'));

            $file = $request->file('photo');
            // $file->store('toPath', ['disk' => 'public']);
            $file_name = Auth::user()->user_id . '.' . $request->file('photo')->getClientOriginalExtension();
            // Storage::disk('public')->put($fileName, $file);

            // Storage::disk('public')->putFileAs('uploads', $file, $fileName);

            $destination_path = public_path() . '/images/users/';
            $file->move($destination_path, $file_name);

            // You can now save the $filePath to the database or use it as needed
            // ...
            // return response()->json(['message' => 'File uploaded successfully']);
        }


        // Type Conversion
        $request->mailaddress_status = (int)$request->mailaddress_status;
        $request->height = doubleval($request->height);
        $request->weight = (int)$request->weight;

        if ((int)$request->mailaddress_status === 1) {
            $request->validate(
                [
                    // Username validation rule
                    'user_name' => ['required', 'string', 'max:32', 'regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_][ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]*[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_]$/'],

                    // Mail address validation rule
                    'mailaddress' => ['required', 'email', 'string', 'lowercase',  'max:255', 'unique:' . T_users::class],
                    //Confirm mail address validation rule
                    'confirm_email' => ['required', 'email', 'string', 'lowercase',  'max:255', 'same:mailaddress'],

                    //Confirm sex validation rule
                    'sex' => ['required', 'string'],

                    //Confirm date of birth validation rule
                    'date_of_birth' => ['required', 'string'],

                    //Confirm residence country validation rule
                    'residence_country' => ['required', 'string'],

                    //Confirm residence prefecture validation rule
                    'residence_prefecture' => ['nullable', 'required_if:residence_country,"112"', 'string']
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
                    'confirm_email.required' => $confirm_email_required,
                    'confirm_email.email' => $email_validation,
                    'confirm_email.lowercase' => $mailAddress_lowercase,
                    'confirm_email.same' => $confirm_email_compare,

                    //Error message for sex validation rule
                    'sex.required' => $sex_required,
                    //Error message for date of birth validation rule 
                    'date_of_birth.required' => $dateOfBirth_required,

                    //Error message for residence country validation rule
                    'residence_country.required' => $residenceCountry_required,

                    //Error message for residence prefecture validation rule
                    'residence_prefecture.required_if' => $residencePrefecture_required_if,
                ]
            );
        } else {
            $request->validate(
                [
                    // user name validation rule
                    'user_name' => ['required', 'string', 'max:32', 'regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_][ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]*[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_]$/'],

                    // sex validation rule
                    'sex' => ['required', 'string'],

                    // date of birth validation rule
                    'date_of_birth' => ['required', 'string'],

                    // residence country validation rule
                    'residence_country' => ['required', 'string'],

                    // residence prefecture validation rule
                    'residence_prefecture' => ['nullable', 'required_if:residence_country,"112"', 'string']

                ],
                [
                    //Error message for user name validation rule 
                    'user_name.required' => $userName_required,
                    'user_name.regex' => $userName_regex,
                    'user_name.max' => $userName_max_limit,

                    //Error message for sex validation rule 
                    'sex.required' => $sex_required,

                    //Error message for date of birth validation rule 
                    'date_of_birth.required' => $dateOfBirth_required,

                    //Error message for residence country validation rule 
                    'residence_country.required' => $residenceCountry_required,

                    //Error message for residence prefecture validation rule 
                    'residence_prefecture.required_if' => $residencePrefecture_required_if,
                ]
            );
        }
        //For getting current time
        $date = date('Y-m-d H:i:s');
        //For adding 24hour with current time
        $new_date = date('Y-m-d H:i:s', strtotime($date . ' + 24 hours'));


        $user = $request->all();
        $user['sex_name'] = $sex->getSexName($user['sex']);
        $user['country_name'] = $countries->getCountryName($user['residence_country']);
        $user['pref_name'] = $prefectures->getPrefName($user['residence_prefecture']);

        if ($request->hasFile('photo')) {
            $user['photo'] = Auth::user()->user_id . '.' . $request->file('photo')->getClientOriginalExtension();
        } else {
            if ($request->user_picture_status === "delete")
                $user['photo'] = "";
            else
                $user['photo'] = Auth::user()->photo;
        }
        return view('user/edit/confirm', ["user" => (object)$user]);
    }

    public function createEditConfirm(Request $request): View
    {
        return view('user.edit.confirm');
    }
    public function storeEditConfirm(Request $request): View
    {
        if ((int)$request->mailaddress_status === 1) {

            $certification_number = Str::random(6); // For Creating random password
            $date = date('Y-m-d H:i:s');
            $new_date = date('Y-m-d H:i:s', strtotime($date . ' + 30 minutes'));

            DB::beginTransaction();
            try {
                DB::update(
                    'update t_users set  certification_number = ? , expiry_time_of_certification_number = ? where user_id = ?',
                    [Hash::make($certification_number), $new_date, Auth::user()->user_id]
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
                $e_bindings = implode(", ", $e->getBindings());
                $e_connectionName = $e->connectionName;


                //Store error message in the register log file.
                Log::channel('user_update')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailaddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
                if ($e_errorCode == 1213 || $e_errorCode == 1205) {
                    throw ValidationException::withMessages([
                        'datachecked_error' => $database_registration_failed_try_again
                    ]);
                } else {
                    throw ValidationException::withMessages([
                        'datachecked_error' => $database_registration_failed
                    ]);
                }
            }

            //Sending mail to the user
            $mail_date = date('Y/m/d H:i');
            $new_mail_date = date('Y/m/d H:i', strtotime($mail_date . ' + 30 minutes'));
            $mail_data = [
                'user_name' => $request->user_name,
                'mailaddress' => $request->mailaddress,
                'certification_number' => $certification_number,
                'expiry_time_of_certification_number' => $new_mail_date
            ];
            Mail::to($request->get('mailaddress'))->send(new VerificationMail($mail_data));

            $user = $request->all();

            // return redirect('user/edit/verification')->with('user', $user);
            return view('user/edit/verification', ["user" => (object)$user]);
        } else {

            DB::beginTransaction();
            try {
                DB::update(
                    'update t_users set photo = ? , user_name = ? , mailaddress = ?, sex = ?, residence_country = ?, residence_prefecture = ?, date_of_birth = ?, height = ?, weight = ? where user_id = ?',
                    [$request->photo, $request->user_name, $request->mailaddress, $request->sex, $request->residence_country, $request->residence_prefecture, $request->date_of_birth, $request->height, $request->weight, Auth::user()->user_id]
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
                $e_bindings = implode(", ", $e->getBindings());
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

            return view('change-notification', ['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
        }
    }

    public function createEditVerifiCation(Request $request): View
    {
        return view('user.edit.verification');
    }
    public function storeEditVerifiCation(Request $request): View
    {

        include('Auth/ErrorMessages/ErrorMessages.php');
        if ($request->certification_number === "") {
            throw ValidationException::withMessages([
                'verification_error' => $code_not_found
            ]);
        }
        if ($request->mailaddress_status == "1") {
            if (!Auth::user()->delete_flag) {
                if (Hash::check($request->certification_number, Auth::user()->certification_number)) {
                    if (Auth::user()->expiry_time_of_certification_number < date('Y-m-d H:i:s')) {
                        throw ValidationException::withMessages([
                            'verification_error' => $code_timed_out
                        ]);
                    } else {
                        DB::beginTransaction();
                        try {

                            DB::update(
                                'update t_users set photo = ? , user_name = ? , mailaddress = ?, sex = ?, residence_country = ?, residence_prefecture = ?, date_of_birth = ?, height = ?, weight = ?, certification_number = ?,expiry_time_of_certification_number=?  where user_id = ?',
                                [$request->photo, $request->user_name, $request->mailaddress, $request->sex, $request->residence_country, $request->residence_prefecture, $request->date_of_birth, $request->height, $request->weight, NULL, NULL, Auth::user()->user_id]
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
                            $e_bindings = implode(", ", $e->getBindings());
                            $e_connectionName = $e->connectionName;

                            //Store error message in the register log file.
                            Log::channel('user_update')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailAddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
                            if ($e_errorCode == 1213 || $e_errorCode == 1205) {
                                throw ValidationException::withMessages([
                                    'datachecked_error' => $database_registration_failed_try_again
                                ]);
                            } else {
                                throw ValidationException::withMessages([
                                    'datachecked_error' => $database_registration_failed
                                ]);
                            }
                        }


                        $page_status = "更新の件、完了になりました。";
                        $page_url = route('my-page');
                        $page_url_text = "マイページ";

                        return view('change-notification', ['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
                    }
                } else {
                    throw ValidationException::withMessages([
                        'verification_error' => $code_not_found
                    ]);
                }
            } else {
                throw ValidationException::withMessages([
                    'verification_error' => $code_not_found
                ]);
            }
        } else {

            return redirect('user/edit');
        }
    }

    public function createDetails(Request $request, M_sex $sex, M_countries $countries, M_prefectures $prefectures): View
    {
        $user = array(
            "user_name" => Auth::user()->user_name,
            "user_id" => Auth::user()->user_id,
            "user_type" => Auth::user()->user_type,
            "mailaddress" => Auth::user()->mailaddress,
            "sex" => Auth::user()->sex,
            "residence_country" => Auth::user()->residence_country, "residence_prefecture" => Auth::user()->residence_prefecture,
            "photo" => Auth::user()->photo,
            "date_of_birth" => Auth::user()->date_of_birth,
            "height" => Auth::user()->height,
            "weight" => Auth::user()->weight
        );


        $user['sex_name'] = $sex->getSexName($user['sex']);
        $user['country_name'] = $countries->getCountryName($user['residence_country']);
        $user['pref_name'] = $prefectures->getPrefName($user['residence_prefecture']);

        return view('user.details', ["page_mode" => "details", "user" => (object)$user]);
    }
    public function createDelete(Request $request, M_sex $sex, M_countries $countries, M_prefectures $prefectures): View
    {
        $user = array(
            "user_name" => Auth::user()->user_name,
            "user_id" => Auth::user()->user_id,
            "user_type" => Auth::user()->user_type,
            "mailaddress" => Auth::user()->mailaddress,
            "sex" => Auth::user()->sex,
            "residence_country" => Auth::user()->residence_country, "residence_prefecture" => Auth::user()->residence_prefecture,
            "photo" => Auth::user()->photo,
            "date_of_birth" => Auth::user()->date_of_birth,
            "height" => Auth::user()->height,
            "weight" => Auth::user()->weight
        );


        $user['sex_name'] = $sex->getSexName($user['sex']);
        $user['country_name'] = $countries->getCountryName($user['residence_country']);
        $user['pref_name'] = $prefectures->getPrefName($user['residence_prefecture']);

        return view('user.details', ["page_mode" => "delete", "user" => (object)$user]);
    }
    public function storeDelete(Request $request): RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        $certification_number = Str::random(6); // For Creating random password
        $date = date('Y-m-d H:i:s');
        $new_date = date('Y-m-d H:i:s', strtotime($date . ' + 24 hours'));

        DB::beginTransaction();
        try {
            DB::update(
                'update t_users set  certification_number = ? , expiry_time_of_certification_number = ? where user_id = ?',
                [Hash::make($certification_number), $new_date, Auth::user()->user_id]
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
            $e_bindings = implode(", ", $e->getBindings());
            $e_connectionName = $e->connectionName;


            //Store error message in the register log file.
            Log::channel('user_delete')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailaddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
            if ($e_errorCode == 1213 || $e_errorCode == 1205) {
                throw ValidationException::withMessages([
                    'datachecked_error' => $database_registration_failed_try_again
                ]);
            } else {
                throw ValidationException::withMessages([
                    'datachecked_error' => $database_registration_failed
                ]);
            }
        }

        //Sending mail to the user
        $mail_date = date('Y/m/d H:i');
        $new_mail_date = date('Y/m/d H:i', strtotime($mail_date . ' + 24 hours'));
        $mail_data = [
            'user_name' => Auth::user()->user_name,
            'mailaddress' => Auth::user()->mailaddress,
            'certification_number' => $certification_number,
            'expiry_time_of_certification_number' => $new_mail_date
        ];
        Mail::to(Auth::user()->mailaddress)->send(new VerificationMail($mail_data));

        return redirect('user/delete/verification');
    }
    public function createDeleteVerification(Request $request): View
    {
        return view('user.delete.verification');
    }
    public function storeDeleteVerification(Request $request): RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        if ($request->certification_number === "") {
            throw ValidationException::withMessages([
                'verification_error' => $code_not_found
            ]);
        }

        if (!Auth::user()->delete_flag) {
            if (Hash::check($request->certification_number, Auth::user()->certification_number)) {
                if (Auth::user()->expiry_time_of_certification_number < date('Y-m-d H:i:s')) {
                    throw ValidationException::withMessages([
                        'verification_error' => $code_timed_out
                    ]);
                } else {

                    DB::beginTransaction();
                    try {
                        DB::update(
                            'update t_users set delete_flag = ?, certification_number = ?, expiry_time_of_certification_number = ?   where mailaddress = ?',
                            ["1", Null, Null, Auth::user()->mailaddress]
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
                        $e_message = $e->getMessage();
                        $e_code = $e->getCode();
                        $e_file = $e->getFile();
                        $e_line = $e->getLine();
                        $e_sql = $e->getSql();
                        $e_errorCode = $e->errorInfo[1];
                        $e_bindings = implode(", ", $e->getBindings());
                        $e_connectionName = $e->connectionName;


                        //Store error message in the user delete log file.
                        Log::channel('user_delete')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailAddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
                        if ($e_errorCode == 1213 || $e_errorCode == 1205) {
                            throw ValidationException::withMessages([
                                'datachecked_error' => $database_registration_failed_try_again
                            ]);
                        } else {
                            throw ValidationException::withMessages([
                                'datachecked_error' => $database_registration_failed
                            ]);
                        }
                    }

                    $page_status = "退会の件、完了しました。";
                    $page_url = route('register');
                    $page_url_text = "OK";

                    //Redirect to registered user to the login page with success status.
                    return redirect('status', ['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
                }
            } else {
                throw ValidationException::withMessages([
                    'verification_error' => $code_not_found
                ]);
            }
        } else {
            throw ValidationException::withMessages([
                'verification_error' => $code_not_found
            ]);
        }
    }

    public function createPasswordChange(Request $request): View
    {
        $user = array("user_name" => Auth::user()->user_name, "user_id" => Auth::user()->user_id, "user_type" => Auth::user()->user_type, "temp_password_flag" => Auth::user()->temp_password_flag);

        return view('user.password-change', ["user" => (object)$user]);
    }
    public function storePasswordChange(Request $request)
    {
        Log::debug(sprintf("storePasswordChange start"));
        //$request->all()
        Log::debug($request->all());
        include('Auth/ErrorMessages/ErrorMessages.php');
        $request->validate(
            [
                // previousPassword validation rule
                'currentPassword' => ['required', 'min:8', 'max:16', 'regex:/^.*(?=.{8,})(?=.*[a-zA-Z0-9!"#$%&\'()*+,-.:;<=>?@_`{|}~^]).*$/'],
                // newPassword validation rule
                'newPassword' => ['required', 'min:8', 'max:16', 'regex:/^.*(?=.{8,})(?=.*[a-zA-Z0-9!"#$%&\'()*+,-.:;<=>?@_`{|}~^]).*$/'],
                // Confirm new Password validation rule
                'confirmNewPassword' => ['required', 'min:8', 'max:16', 'regex:/^.*(?=.{8,})(?=.*[a-zA-Z0-9!"#$%&\'()*+,-.:;<=>?@_`{|}~^]).*$/', 'same:newPassword'],
            ],
            [
                //Error message for previousPassword validation rule 
                'currentPassword.required' => $previous_password_required,
                'currentPassword.min' => $password_condition,
                'currentPassword.max' => $password_condition,
                'currentPassword.regex' => $password_condition,

                //Error message for newPassword validation rule 
                'newPassword.required' => $new_password_required,
                'newPassword.min' => $password_condition,
                'newPassword.max' => $password_condition,
                'newPassword.regex' => $password_condition,


                //Error message for confirm new password validation rule 
                'confirmNewPassword.required' => $new_password_confirm_required,
                'confirmNewPassword.min' => $password_condition,
                'confirmNewPassword.max' => $password_condition,
                'confirmNewPassword.regex' => $password_condition,
                'confirmNewPassword.same' => $password_compare,
            ]
        );
        if ($request->currentPassword === $request->new_password_required) {
            throw ValidationException::withMessages([
                'system_error' => $previous_and_new_password_compare
            ]);
        }
        //When logged with a temporary flag
        if (Auth::user()->temp_password) {
            //If the entered password does matched with the database information
            if (Hash::check($request->currentPassword, Auth::user()->temp_password)) {

                DB::beginTransaction();
                try {
                    DB::update(
                        'update t_users set password = ? , temp_password = ? , expiry_time_of_temp_password = ?, temp_password_flag = ?,registered_time = ?, updated_time =?  where user_id = ?',
                        [Hash::make($request->newPassword), NULL, NULL, 0, now(), now(), Auth::user()->user_id]
                    );

                    DB::commit();
                } catch (\Throwable $e) {
                    DB::rollBack();
                    $e_errorCode = $e->errorInfo[1];
                    if ($e_errorCode == 1213 || $e_errorCode == 1205) {
                        throw ValidationException::withMessages([
                            'datachecked_error' => $database_system_error
                        ]);
                    } else {
                        throw ValidationException::withMessages([
                            'datachecked_error' => $database_system_error
                        ]);
                    }
                }

                $page_status = "パスワードを変更の件、完了になりました。";
                $page_url_text = "OK";
                //return view('change-notification',['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
                return response()->json(['reqData' => $page_url_text, 'result' => $page_status]); //送信データ(debug用)とDBの結果を返す

            }
            //If the entered password does not matched with the database information
            else {
                throw ValidationException::withMessages([
                    'system_error' => $previous_password_not_matched
                ]);
            }
        }
        //When logged as a registered user
        else {
            //If the entered password does matched with the database information
            Log::debug($request->currentPassword);
            Log::debug(Auth::user()->password);
            if (Hash::check($request->currentPassword, Auth::user()->password)) {

                DB::beginTransaction();
                try {

                    DB::update(
                        'update t_users set password = ?, registered_time = ?,updated_time =?  where user_id = ?',
                        [Hash::make($request->newPassword), now(), now(),  Auth::user()->user_id]
                    );

                    DB::commit();
                } catch (\Throwable $e) {
                    DB::rollBack();
                    $e_errorCode = $e->errorInfo[1];
                    if ($e_errorCode == 1213 || $e_errorCode == 1205) {
                        throw ValidationException::withMessages([
                            'datachecked_error' => $database_system_error
                        ]);
                    } else {
                        throw ValidationException::withMessages([
                            'datachecked_error' => $database_system_error
                        ]);
                    }
                }
                $page_status = "パスワードを変更の件、完了になりました。";
                $page_url_text = "OK";
                // return view('change-notification',['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
                return response()->json(['reqData' => $page_url_text, 'result' => $page_status]); //送信データ(debug用)とDBの結果を返す
            }
            //If the entered password does not matched with the database information
            else {
                throw ValidationException::withMessages([
                    'system_error' => $previous_password_not_matched
                ]);
            }
        }
        Log::debug(sprintf("storePasswordChange end"));
    }

    public function createPasswordReset(Request $request): View
    {
        // $user = array("user_name" => Auth::user()->user_name, "user_id" => Auth::user()->user_id, "user_type" => Auth::user()->user_type, "temp_password_flag" => Auth::user()->temp_password_flag);

        return view('auth.password-reset');
    }
    public function storePasswordReset(Request $request)
    {

        include('Auth/ErrorMessages/ErrorMessages.php');

        $request->validate(
            [
                // Mail address validation rule
                'mailaddress' => ['required', 'email'],
                // Confirm mail address validation rule
                'confirm_email' => ['required', 'same:mailaddress'],
            ],
            [
                //Error message for mail address validation rule 
                'mailaddress.required' => $mailAddress_required,
                'mailaddress.email' => $email_validation,

                //Error message for confirm mail address validation rule 
                'confirm_email.required' => $mailAddress_required,
                'confirm_email.same' => $confirm_email_for_password_reset_page,
            ]
        );

        if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? and delete_flag = 0', [$request->mailaddress]))) {
            // For Generate random password
            $temp_password = Str::random(8);
            //For getting current time
            $date = date('Y-m-d H:i:s');
            //For adding 30 minutes with current time
            $new_date = date('Y-m-d H:i:s', strtotime($date . ' + 30 minutes'));

            //For converting date format from H:i:s to H:i 
            $mail_date  = date("Y/m/d H:i", strtotime($new_date));

            // Insert new password info in the database.(t_user table)

            $find_user_id = DB::select('SELECT user_id,user_name FROM t_users where mailaddress = ? and delete_flag = 0', [$request->mailaddress]);
            $user_id = $find_user_id[0]->user_id;
            $user_name = $find_user_id[0]->user_name;

            DB::beginTransaction();
            try {
                $hashed_password = Hash::make($temp_password);
                DB::update('update t_users set password = ? , temp_password = ?, expiry_time_of_temp_password = ?, temp_password_flag = ?, registered_time = ?, registered_user_id = ?, updated_time = ?, updated_user_id = ? where mailaddress = ? and delete_flag = 0 ', [$hashed_password, $hashed_password,  $new_date, '1', now(), $user_id, now(), $user_id, $request->mailaddress]);

                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();

                $e_message = $e->getMessage();
                $e_code = $e->getCode();
                $e_file = $e->getFile();
                $e_line = $e->getLine();
                $e_sql = $e->getSql();
                $e_errorCode = $e->errorInfo[1];
                $e_bindings = implode(", ", $e->getBindings());
                $e_connectionName = $e->connectionName;


                //Store error message in the register log file.
                Log::channel('user_password_reset')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailAddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
                if ($e_errorCode == 1213 || $e_errorCode == 1205) {
                    throw ValidationException::withMessages([
                        'datachecked_error' => $registration_failed
                    ]);
                } else {
                    throw ValidationException::withMessages([
                        'datachecked_error' => $registration_failed
                    ]);
                }
            }



            //Store user information for sending email.
            $mail_data = [
                'user_name' => $user_name,
                'mailaddress' => $request->mailaddress,
                'temporary_password' => $temp_password,
                'temporary_password_expiration_date' => $mail_date
            ];


            //Sending mail to the user

            try {
                Mail::to($request->get('mailaddress'))->send(new PasswordResetMail($mail_data));
            } catch (Exception $e) {
                //Store error message in the user_password_reset log file.
                Log::channel('user_password_reset')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailaddress,  \r\n \r\n ＊＊＊「EMAIL_SENT_ERROR_MESSAGE」  ： $e\r\n  \r\n ============================================================ \r\n \r\n");
                //Display error message to the client
                throw ValidationException::withMessages([
                    'datachecked_error' => $mail_sent_failed,
                ]);
            }
            //Refresh the requested data
            $request->merge(['mailaddress' => '']);
            $request->merge(['confirm_email' => '']);

            $page_status = "仮パスワードを記載したメールアドレスを送信しました。<br/>送信されたメールに記載されたパスワードを使用して、パスワードの再設定を行ってください。";
            //Redirect to password-reset page with success status.
            return redirect('password-reset')->with(['status' => $page_status]);
        } else {
            throw ValidationException::withMessages([
                'datachecked_error' => $mailaddress_not_registered
            ]);
        }
    }

    //======================================================================================
    //======================================================================================

    public function setLoginUserData(Request $request, T_users $t_users)
    {
        Log::debug(sprintf("setLoginUserData start"));
        Log::debug($request->user());
        $reqData = $request->user();
        $this::$loginUserInfo['user_id'] = $reqData['user_id'];
        $this::$loginUserInfo['user_name'] = $reqData['user_name'];
        Log::debug("==============");
        Log::debug($this::$loginUserInfo);
        Log::debug(sprintf("setLoginUserData end"));
        return $request->user();
    }

    //react 選手情報参照画面に表示するuserIDに紐づいたデータを送信 20240131
    public function getUserData(T_users $t_users)
    {
        Log::debug(sprintf("getUserData start"));
        // Log::debug($this::$loginUserInfo);
        // 実装　ー　クマール　ー開始
        Log::debug(Auth::user()->user_name);
        $result = $t_users->getUserData(Auth::user()->user_id); //ユーザ情報の取得
        // 実装　ー　クマール　ー終了
        Log::debug(sprintf("getUserData end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }
    //react 選手情報参照画面に表示するuserIDに紐づいたデータを送信 20240131
    public function updateUserData(Request $request, T_users $t_users)
    {
        Log::debug(sprintf("updateUserData start"));
        $reqData = $request->all();
        //確認画面から登録
        $t_users::$userInfo['user_id'] = $reqData['user_id']; //ユーザID
        $t_users::$userInfo['user_name'] = $reqData['user_name']; //ユーザ名
        $t_users::$userInfo['mailaddress'] = $reqData['mailaddress']; //メールアドレス
        $t_users::$userInfo['sex'] = $reqData['sex']; //性別
        $t_users::$userInfo['residence_country'] = $reqData['residence_country']; //居住地国
        $t_users::$userInfo['residence_prefecture'] = $reqData['residence_prefecture']; //居住都道府県
        $t_users::$userInfo['date_of_birth'] = $reqData['date_of_birth']; //誕生日
        $t_users::$userInfo['height'] = $reqData['height']; //身長
        $t_users::$userInfo['weight'] = $reqData['weight']; //体重
        $t_users::$userInfo['user_type'] = $reqData['user_type']; //ユーザ種別
        $t_users::$userInfo['photo'] = $reqData['photo']; //写真
        $result = $t_users->updateUserData($t_users::$userInfo); //レース情報を取得
        Log::debug(sprintf("updateUserData end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }
    //react ユーザー情報の削除 20240212
    //delete_flagを1にupdateする
    public function updateDeleteFlagInUserData(Request $requests,T_users $t_users)
    {
        Log::debug(sprintf("updateDeleteFlagInUserData start."));
        $result = true;
        $reqData = $requests->all();
        $target_user_id = $reqData['user_id'];
        try
        {
            DB::beginTransaction();
            $t_users->updateDeleteFlagToInvalid($target_user_id);
            DB::commit();
        }
        catch(\Throwable $e)
        {
            DB::rollback();
            $result = false;
        }
        Log::debug(sprintf("updateDeleteFlagInUserData end."));
        return response()->json(['result' => $result]); //処理結果を返す
    }
}
