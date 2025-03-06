<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Http\Controllers\Controller;
use App\Mail\VerificationMail;
use App\Mail\PasswordResetMail;
use App\Models\T_users;

class UserController extends Controller
{
    public function sentCertificationNumber(Request $request)
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        // $certification_number = Str::random(6); // For Creating random password
        // $certification_number = rand(1000000,100); // For Creating random password
        if ($request->mailaddress !== Auth::user()->mailaddress) {
            $user = DB::select(
                'select user_name
                                from t_users
                                where delete_flag=0
                                and mailaddress = ?',
                [$request->mailaddress]
            );
            //userは一意に決まるため0番目を返す
            if (isset($user[0])) {
                abort(409, $mailAddress_already_exists);
            }
        }
        $certification_number = substr(number_format(time() * rand(), 0, '', ''), 0, 6);
        $date = now()->format('Y-m-d H:i:s.u');

        // For adding 30 minutes with current time
        $converting_date = date_create($date);
        date_add($converting_date, date_interval_create_from_date_string("30 minutes"));
        $newDate = date_format($converting_date, "Y-m-d H:i:s.u");

        DB::beginTransaction();
        try {
            DB::update(
                'update t_users set  certification_number = ? , expiry_time_of_certification_number = ?,updated_time = ?,updated_user_id = ? where 1=1 and user_id = ?',
                [Hash::make($certification_number), $newDate, $date, Auth::user()->user_id, Auth::user()->user_id]
            );
            DB::commit();
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();

            abort(500, "メールを送信に失敗しました。ユーザーサポートにお問い合わせください。");
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
        try {
            Mail::to($request->get('mailaddress'))->send(new VerificationMail($mail_data));
        } catch (\Throwable $e) {
            Log::error($e);
            abort(500, "メールを送信に失敗しました。ユーザーサポートにお問い合わせください。");
        }

        return response()->json(["メールを送信しました。"], 200);
    }

    public function verifyCertificationNumber(Request $request)
    {
        include('Auth/ErrorMessages/ErrorMessages.php');

        if (!Auth::user()->delete_flag) {
            if (Hash::check($request->certification_number, Auth::user()->certification_number)) {
                if (Auth::user()->expiry_time_of_certification_number < now()->format('Y-m-d H:i:s.u')) {
                    abort(400, $code_timed_out);
                } else {
                    DB::beginTransaction();
                    try {
                        DB::update(
                            'update t_users set certification_number = ?,expiry_time_of_certification_number=?, updated_time = ?, updated_user_id = ?  where 1=1 and user_id = ?',
                            [NULL, NULL, now()->format('Y-m-d H:i:s.u'), Auth::user()->user_id, Auth::user()->user_id]
                        );

                        DB::commit();
                    } catch (\Throwable $e) {
                        Log::error($e);
                        DB::rollBack();

                        abort(500, "失敗しました。ユーザーサポートと連絡してください。");
                    }
                    return response()->json("承認されました。「更新」ボタンを押して情報更新してください。", 200);
                }
            } else {
                abort(400, $code_not_found);
            }
        } else {
            redirect('/logout');
        }
    }

    public function storePasswordChange(Request $request)
    {
        include('Auth/ErrorMessages/ErrorMessages.php');

        if (Auth::user()->temp_password_flag) {
            //If the entered password does matched with the database information
            if (Hash::check($request->currentPassword, Auth::user()->password)) {
                DB::beginTransaction();
                try {
                    $tempPasswordFlag = 0;
                    DB::update(
                        'update t_users set password = ?, expiry_time_of_temp_password = ?, temp_password_flag = ?, updated_time =?, updated_user_id = ?  where user_id = ?',
                        [Hash::make($request->newPassword), NULL, $tempPasswordFlag, now()->format('Y-m-d H:i:s.u'), Auth::user()->user_id, Auth::user()->user_id]
                    );

                    DB::commit();
                    return response()->json([
                        'result' => [
                            'message' => 'パスワードを変更しました',
                            'tempPasswordFlag' => $tempPasswordFlag
                        ]
                    ]);
                } catch (\Throwable $e) {
                    Log::error($e);
                    DB::rollBack();

                    abort(500, $database_system_error);
                }
            } else {
                abort(400, $previous_password_not_matched);
            }
        }
        //When logged as a registered user
        else {
            //If the entered password does matched with the database information
            if (Hash::check($request->currentPassword, Auth::user()->password)) {
                DB::beginTransaction();
                try {
                    DB::update(
                        'update t_users set password = ?, updated_time =?, updated_user_id =?  where user_id = ?',
                        [Hash::make($request->newPassword),  now()->format('Y-m-d H:i:s.u'),  Auth::user()->user_id, Auth::user()->user_id]
                    );
                    DB::commit();
                } catch (\Throwable $e) {
                    Log::error($e);
                    DB::rollBack();

                    abort(500, $database_system_error);
                }
                return response()->json(['result_message' => 'パスワードを変更しました', 'temp_password_flag' => Auth::user()->temp_password_flag]); //DBの結果を返す
            } else {
                abort(400, $previous_password_not_matched);
            }
        }
    }

    public function storePasswordReset(Request $request)
    {
        Log::debug(sprintf("storePasswordReset start"));

        include('Auth/ErrorMessages/ErrorMessages.php');

        if (empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? and delete_flag = 0', [$request->mailaddress]))) {
            return response(200);
        } 
        // For Generate random password
        $password = Str::random(8);
        // //For getting current time
        // $date = date('Y-m-d H:i:s');
        // //For adding 30 minutes with current time
        // $new_date = date('Y-m-d H:i:s', strtotime($date . ' + 30 minutes'));

        //For getting current time
        $date = now()->format('Y-m-d H:i:s.u');

        //For adding 1day with current time
        $converting_date = date_create($date);
        date_add($converting_date, date_interval_create_from_date_string("30 minutes"));
        $new_date = date_format($converting_date, "Y-m-d H:i:s.u");

        //For converting date format from H:i:s to H:i 
        $mail_date  = date("Y/m/d H:i", strtotime($new_date));

        //Getting url information from env file.
        $frontend_url  = config('env-data.frontend-url');

        // Insert new password info in the database.(t_user table)

        $find_user_id = DB::select('SELECT user_id,user_name FROM t_users where mailaddress = ? and delete_flag = 0', [$request->mailaddress]);
        $user_id = $find_user_id[0]->user_id;
        $user_name = $find_user_id[0]->user_name;

        DB::beginTransaction();
        try {
            $hashed_password = Hash::make($password);
            DB::update('update t_users set password = ? ,  expiry_time_of_temp_password = ?, temp_password_flag = ?, updated_time = ?, updated_user_id = ? where mailaddress = ? and delete_flag = 0 ', [$hashed_password,  $new_date, '1', now()->format('Y-m-d H:i:s.u'), $user_id, $request->mailaddress]);
            DB::commit();
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();

            abort(500, $registration_failed);
        }

        //Store user information for sending email.
        $mail_data = [
            'user_name' => $user_name,
            'mailaddress' => $request->mailaddress,
            'temporary_password' => $password,
            'temporary_password_expiration_date' => $mail_date,
            'login_url' => $frontend_url . '/login'
        ];

        //Sending mail to the user
        try {
            Mail::to($request->get('mailaddress'))->send(new PasswordResetMail($mail_data));
        } catch (\Throwable $e) {
            //Store error message in the user_password_reset log file.
            Log::error($e);
            //Display error message to the client
            abort(500, $registration_failed);
        }

        // $page_status = "仮パスワードを記載したメールアドレスを送信しました。<br/>送信されたメールに記載されたパスワードを使用して、パスワードの再設定を行ってください。";
        //Redirect to password-reset page with success status.
        // return redirect('password-reset')->with(['status' => $page_status]);
        return response()->json("パスワード再発行の件、完了しました。", 200);
        
        Log::debug(sprintf("storePasswordReset end"));
    }

    //react 選手情報参照画面に表示するuserIDに紐づいたデータを送信 20240131
    public function getUserData(T_users $t_users)
    {
        $result = $t_users->getUserData(Auth::user()->user_id); //ユーザ情報の取得
        return response()->json(['result' => $result]); //DBの結果を返す
    }
    public function getUserName(Request $request)
    {
        $result = DB::select('SELECT user_name FROM t_users where user_id = ? and delete_flag = 0', [$request->user_id]);
        if (empty($result)) {
            return response()->json(['error' => '該当ユーザーなし'], 400);
        }
        return response()->json(['result' => $result[0]->user_name]);
    }
    

    //react 選手情報参照画面に表示するuserIDに紐づいたデータを送信 20240131
    public function updateUserData(Request $request, T_users $t_users)
    {
        //If new picture is uploaded
        if ($request->hasFile('uploadedPhoto')) {
            $file = $request->file('uploadedPhoto');
            $fileName = Auth::user()->user_id . '.' . $file->getClientOriginalExtension();
            try {
                if (config('app.env') === 'local') {
                    // ローカル環境ではpublic配下に保存する。
                    $destinationPath = public_path() . '/images/users/';
                    $file->move($destinationPath, $fileName);
                } else {
                    // 本番環境ではS3にアップロードする。
                    $path = $file->storeAs('images/users/', $fileName, 's3');
                    Log::debug('S3 Upload Path:', ['path' => $path]);
                }
            } catch (\Exception $e) {
                Log::error('File Upload Error:', ['message' => $e->getMessage()]);
            }
        }

        //store all requested information
        $reqData = $request->all();
        //確認画面から登録
        $t_users::$userInfo['user_id'] = $reqData['user_id']; //ユーザID
        $t_users::$userInfo['user_name'] = $reqData['user_name']; //ユーザ名
        $t_users::$userInfo['mailaddress'] = $reqData['mailaddress']; //メールアドレス
        $t_users::$userInfo['sex'] = $reqData['sex']; //性別
        $t_users::$userInfo['residence_country'] = $reqData['residence_country']; //居住地国
        $t_users::$userInfo['residence_prefecture'] = $reqData['residence_prefecture'] ?? NULL; //居住都道府県
        $t_users::$userInfo['date_of_birth'] = $reqData['date_of_birth'] ?? NULL; //誕生日
        $t_users::$userInfo['height'] = $reqData['height'] ?? NULL; //身長
        $t_users::$userInfo['weight'] = $reqData['weight'] ?? NULL; //体重
        $t_users::$userInfo['user_type'] = $reqData['user_type']; //ユーザ種別

        //If new picture is uploaded
        if ($request->hasFile('uploadedPhoto')) {
            $fileName = Auth::user()->user_id . '.' . $file->getClientOriginalExtension();
            $t_users::$userInfo['photo'] = $fileName; //写真
        } else {
            //If  picture is not uploaded
            if ($reqData['photo'] ?? "") {
                $t_users::$userInfo['photo'] = $reqData['photo']; //写真
            } else {
                $t_users::$userInfo['photo'] = ''; //写真
            }
        }
        DB::beginTransaction();
        try {
            //更新実行
            $t_users->updateUserData($t_users::$userInfo);
            DB::commit();
            return response()->json(['result' => "success"]); //DBの結果を返す
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e);
            abort(500, $e->getMessage());
        }
    }

    //react ユーザー情報の削除 20240212
    //delete_flagを1にupdateする
    public function updateDeleteFlagInUserData(T_users $t_users)
    {
        $orgFlag = substr(Auth::user()->user_type, 4, 1); //団体管理者の場合、削除処理を行わない
        if ($orgFlag == 1) {
            abort(401, "団体管理者権限を保有しています。団体管理画面から権限の破棄を行ってください。");
        }

        DB::beginTransaction();
        try {
            $t_users->updateDeleteFlagToInvalid();
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollback();
            Log::error($e);

            abort(500, "失敗しました。ユーザーサポートにお問い合わせください。");
        }
        return response()->json(["退会が完了しました。"], 200); //処理結果を返す
    }

    //ユーザーに関連付いたIDを取得する
    public function getIDsAssociatedWithUser(T_users $t_users)
    {
        $users = $t_users->getIDsAssociatedWithUser(Auth::user()->user_id); //ユーザIDに関連づいたIDの取得
        return response()->json(['result' => $users]); //DBの結果を返す
    }
}
