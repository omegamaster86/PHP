<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\DB;

class T_users extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

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
}
