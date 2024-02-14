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
    //対象ユーザーの情報を取得する
    public function getUserData($targetUserId)
    {
        $users = DB::select('select 
                                user.`user_id`
                                ,user.`user_name`
                                ,user.`mailaddress`
                                ,user.`sex`
                                ,user.`sex_name`
                                ,user.`residence_country`
                                ,user.`residenceCountryName`
                                ,user.`residence_prefecture`
                                ,user.`residencePrefectureName`
                                ,user.`date_of_birth`
                                ,user.`height`
                                ,user.`weight`
                                ,user.`user_type`
                                ,trim("・" from CONCAT(is_administrator,
                                        is_jara,
                                        is_pref_boat_officer,
                                        is_organization_manager,
                                        is_player,
                                        is_volunteer,
                                        is_audience)) as `userTypeName`
                                ,user.`photo`
                                ,user.`password`
                                ,user.`temp_password`
                                ,user.`expiry_time_of_temp_password`
                                ,user.`certification_number`
                                ,user.`expiry_time_of_certification_number`
                                ,user.`temp_password_flag`
                                FROM
                                (
                                    select user.`user_id`
                                    ,user.`user_name`
                                    ,user.`mailaddress`
                                    ,user.`sex`
                                    ,sex.sex	as `sex_name`
                                    ,user.`residence_country`
                                    ,coun.country_name	as `residenceCountryName`
                                    ,user.`residence_prefecture`
                                    ,pref.pref_name	as `residencePrefectureName`
                                    ,user.`date_of_birth`
                                    ,user.`height`
                                    ,user.`weight`
                                    ,user.`user_type`
                                    ,case 
                                        when SUBSTR(user.`user_type`,2,1) = 1 then "管理者・"
                                        else ""
                                        end as `is_administrator`
                                    ,case 
                                        when SUBSTR(user.`user_type`,3,1) = 1 then "JARA・"
                                        else ""
                                        end as `is_jara`
                                    ,case 
                                        when SUBSTR(user.`user_type`,4,1) = 1 then "県ボ職員・"
                                        else ""
                                        end as `is_pref_boat_officer`
                                    ,case 
                                        when SUBSTR(user.`user_type`,5,1) = 1 then "団体管理者・"
                                        else ""
                                        end as `is_organization_manager`
                                    ,case 
                                        when SUBSTR(user.`user_type`,6,1) = 1 then "選手・"
                                        else ""
                                        end as `is_player`
                                    ,case 
                                        when SUBSTR(user.`user_type`,7,1) = 1 then "ボランティア・"
                                        else ""
                                        end as `is_volunteer`
                                    ,case 
                                        when SUBSTR(user.`user_type`,8,1) = 1 then "一般ユーザー（観客）"
                                        else ""
                                        end as `is_audience`
                                    ,user.`photo`
                                    ,user.`password`
                                    ,user.`temp_password`
                                    ,user.`expiry_time_of_temp_password`
                                    ,user.`certification_number`
                                    ,user.`expiry_time_of_certification_number`
                                    ,user.`temp_password_flag`
                                    FROM `t_users` user
                                    left join `m_sex` sex
                                    on user.sex = sex.sex_id
                                    left join m_countries coun
                                    on user.residence_country = coun.country_id
                                    left join m_prefectures	pref
                                    on user.residence_prefecture = pref.pref_id
                                    WHERE 1=1
                                    and user.delete_flag = 0
                                    and sex.delete_flag = 0
                                    and coun.delete_flag = 0
                                    and pref.delete_flag = 0
                                    and user_id = ?
                                )user'
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
                    NOW()->format('Y-m-d H:i:s.u'),
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

    //メールアドレスを条件にユーザー情報を取得する
    public function getUserDataFromMailAddress($mailaddress)
    {
        $users = DB::select('select 
                                `user_id`, 
                                `user_name`, 
                                `mailaddress`, 
                                `temp_password_flag`
                                FROM `t_users`
                                WHERE 1=1
                                and `mailaddress` = ?'
                            ,$mailaddress);
        return $users;
    }

    //ユーザーIDを条件にユーザー情報を取得する
    public function getUserDataFromUserId($user_id)
    {
        $users = DB::select('select 
                                `user_id`, 
                                `user_name`, 
                                `mailaddress`, 
                                `temp_password_flag`
                                FROM `t_users`
                                WHERE 1=1
                                and `user_id` = ?'
                            ,$user_id);
        return $users;
    }
    //対象のユーザーの削除フラグを「１＝削除データ」に更新する 20240212
    public function updateDeleteFlagToInvalid($target_user_id)
    {
        DB::update('update `t_users`
                    SET `updated_time`= ?,
                    `updated_user_id`= ?,
                    delete_flag = 1
                    where 1=1
                    and user_id = ?'
                    ,now()->format('Y-m-d H:i:s.u')
                    ,Auth::user()->user_id
                    ,$target_user_id);
    }
}