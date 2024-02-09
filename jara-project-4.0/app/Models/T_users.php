<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class T_users extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public static $userInfo = [
        'user_id' => null,
        'user_name' => "testName",
        'mailaddress' => null,
        'sex' => null,
        'residence_country' => null,
        'residence_prefecture' => null,
        'date_of_birth' => null,
        'height' => null,
        'weight' => null,
        'user_type' => null,
        'photo' => null,
        'password' => null,
        'temp_password' => null,
        'expiry_time_of_temp_password' => null,
        'certification_number' => null,
        'expiry_time_of_certification_number' => null,
        'temp_password_flag' => null,
        'registered_time' => null,
        'registered_user_id' => null,
        'updated_time' => null,
        'updated_user_id' => null,
        'delete_flag' => 0,
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $table = 't_users';
    protected $primaryKey = 'user_id';
    
    public function getUserName($targetUserId)
    {
        $users = DB::select('select user_name
                                from t_users
                                where delete_flag=0
                                and user_id = ?'
                                ,[$targetUserId]
                            );
        $userName = "";
        //userは一意に決まるため0番目を返す
        if(isset($users[0])){
            $userName = $users[0]->user_name;
        }
        return $userName;
    }

    //全てのユーザーIDを取得する
    //ボランティア一括登録画面でユーザーIDの存在チェック用
    public function getUserIDList()
    {
        $user_ids = DB::select('select user_id
                                from t_users
                                where delete_flag = ?',
                                [0]
                            );
        return $user_ids;
    }


    public function getUserData($targetUserId)
    {
        $users = DB::select('select `user_id`, 
                                `user_name`, 
                                `mailaddress`, 
                                `sex`, 
                                `residence_country`, 
                                `residence_prefecture`, 
                                `date_of_birth`, 
                                `height`, 
                                `weight`, 
                                `user_type`, 
                                `photo`, 
                                `password`, 
                                `temp_password`, 
                                `expiry_time_of_temp_password`, 
                                `certification_number`, 
                                `expiry_time_of_certification_number`, 
                                `temp_password_flag`
                                from t_users
                                where delete_flag = 0
                                and user_id = ?'
                                ,[$targetUserId]
                            );
        
        if(isset($users[0])){
            $users = $users[0];
        }
        return $users;
    }

    public function updateUserData($targetUserId)
    {
        Log::debug(Auth::user()->user_id);
        $result = "success";
        DB::beginTransaction();
        try {
            DB::update(
                'update `t_users` set 
                `user_id`=?,
                `user_name`=?,
                `mailaddress`=?,
                `sex`=?,
                `residence_country`=?,
                `residence_prefecture`=?,
                `date_of_birth`=?,
                `height`=?,
                `weight`=?,
                `user_type`=?,
                `photo`=?,
                `registered_time`=?,
                `registered_user_id`=?,
                `updated_time`=?,
                `updated_user_id`=?,
                `delete_flag`=?
                where user_id = ?',
                [
                    $targetUserId['user_id'],
                    $targetUserId['user_name'],
                    $targetUserId['mailaddress'],
                    $targetUserId['sex'],
                    $targetUserId['residence_country'],
                    $targetUserId['residence_prefecture'],
                    $targetUserId['date_of_birth'],
                    $targetUserId['height'],
                    $targetUserId['weight'],
                    $targetUserId['user_type'],
                    $targetUserId['photo'],
                    NOW(),
                    Auth::user()->user_id,
                    NOW(),
                    Auth::user()->user_id,
                    $targetUserId['delete_flag'],
                    $targetUserId['user_id'], //where条件
                ]
            );

            DB::commit();
            return $result;
        } catch (\Throwable $e) {
            DB::rollBack();

            $result = "failed";
            return $result;
        }
    }

    
}
