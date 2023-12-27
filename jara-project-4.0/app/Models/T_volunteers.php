<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_volunteers extends Model
{
    use HasFactory;

    public static $volunteerInfo = [
        'volunteer_id' => null,
        'user_id' => null,
        'volunteer_name' => null,
        'residence_country' => null,
        'residence_prefecture' => null,
        'sex' => null,
        'date_of_birth' => null,
        'dis_type_id' => null,
        'telephone_number' => null,
        'mailaddress' => null,
        'users_email_flag' => null,
        'clothes_size' => null,
        'registered_time' => null,
        'registered_user_id' => null,
        'updated_time' => null,
        'updated_user_id' => null,
        'delete_flag' => 0,
    ];

    public function getVolunteers($vlntrId)
    {
        $volunteers = DB::select('select `volunteer_id`, `user_id`, `volunteer_name`, `residence_country`, `residence_prefecture`, `sex`, `date_of_birth`, `dis_type_id`, `telephone_number`, `mailaddress`, `users_email_flag`, `clothes_size`, `registered_time`, `registered_user_id`, `updated_time`, `updated_user_id`, `delete_flag` FROM `t_volunteers` where delete_flag=0 and volunteer_id = ?', [$vlntrId]);
        //1つの団体IDを取得するため0番目だけを返す
        $targetTrn = null;
        if (!empty($volunteers)) {
            $targetTrn = $volunteers[0];
        }
        return $targetTrn;
    }
}
