<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

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

    //対象ユーザーの情報を取得する
    public function getUserData($targetUserId)
    {
        $users = DB::select(
            'SELECT
                user.`user_id`,
                user.`user_name`,
                user.`mailaddress`,
                user.`sex`,
                user.`sexName`,
                user.`residence_country`,
                user.`residenceCountryName`,
                user.`residence_prefecture`,
                user.`residencePrefectureName`,
                user.`date_of_birth`,
                user.`height`,
                user.`weight`,
                user.`user_type`,
                user.`photo`,
                user.`temp_password_flag`,
                trim("・" from CONCAT(is_administrator,
                        is_jara,
                        is_pref_boat_officer,
                        is_organization_manager,
                        is_player,
                        is_volunteer,
                        is_audience)
                ) as `userTypeName`
                FROM
                (
                    SELECT user.`user_id`,
                    user.`user_name`,
                    user.`mailaddress`,
                    user.`sex`,
                    sex.sex as `sexName`,
                    user.`residence_country`,
                    coun.country_name as `residenceCountryName`,
                    user.`residence_prefecture`,
                    pref.pref_name as `residencePrefectureName`,
                    user.`date_of_birth`,
                    user.`height`,
                    user.`weight`,
                    user.`user_type`,
                    user.`photo`,
                    user.`temp_password_flag`,
                    case 
                        when SUBSTR(user.`user_type`,2,1) = 1 then "管理者・"
                        else ""
                    end as `is_administrator`,
                    case 
                        when SUBSTR(user.`user_type`,3,1) = 1 then "JARA・"
                        else ""
                    end as `is_jara`,
                    case 
                        when SUBSTR(user.`user_type`,4,1) = 1 then "県ボ職員・"
                        else ""
                    end as `is_pref_boat_officer`,
                    case 
                        when SUBSTR(user.`user_type`,5,1) = 1 then "団体管理者・"
                        else ""
                    end as `is_organization_manager`,
                    case 
                        when SUBSTR(user.`user_type`,6,1) = 1 then "選手・"
                        else ""
                    end as `is_player`,
                    case 
                        when SUBSTR(user.`user_type`,7,1) = 1 then "ボランティア・"
                        else ""
                    end as `is_volunteer`,
                    case 
                        when SUBSTR(user.`user_type`,8,1) = 1 then "一般ユーザー（観客）"
                        else ""
                    end as `is_audience`
                    FROM `t_users` user
                    -- NOTE: ユーザー仮登録時には性別、居住地、生年月日が未入力のため、LEFT OUTER JOIN
                    LEFT OUTER JOIN `m_sex` sex
                    on user.sex = sex.sex_id and sex.delete_flag = 0
                    LEFT OUTER JOIN m_countries coun
                    on user.residence_country = coun.country_id and coun.delete_flag = 0
                    LEFT OUTER JOIN m_prefectures pref
                    on user.residence_prefecture = pref.pref_id and pref.delete_flag = 0
                    WHERE 1=1
                    and user.delete_flag = 0
                    and user_id = ?
                ) user',
            [$targetUserId]
        );
        if (isset($users[0])) {
            $users = $users[0];
        }
        return $users;
    }

    //ユーザー更新
    public function updateUserData($targetUserId)
    {
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
    }

    //メールアドレスを条件にユーザー情報を取得する
    public function getUserDataFromMailAddress($mailaddress)
    {
        // DB::enableQueryLog(); //SQLの実行ログを表示 20240419
        $users = DB::select(
            'select 
                            `user_id`, 
                            `user_name`, 
                            `mailaddress`, 
                            `temp_password_flag`
                            FROM `t_users`
                            WHERE 1=1
                            and `delete_flag` = 0
                            and `mailaddress` = ?',
            [$mailaddress]
        );
        return $users;
    }

    //ユーザーIDを条件にユーザー情報を取得する
    public function getUserDataFromUserId($user_id)
    {
        $users = DB::select(
            'select 
                                `user_id`, 
                                `user_name`, 
                                `mailaddress`, 
                                `user_type`,
                                `temp_password_flag`
                                FROM `t_users`
                                WHERE 1=1
                                and `delete_flag` = 0
                                and `user_id` = ?',
            [$user_id]
        );
        return $users;
    }

    //対象のユーザーの削除フラグを「１＝削除データ」に更新する 20240212
    public function updateDeleteFlagToInvalid()
    {
        DB::update(
            'update `t_users`
                    SET `updated_time`= ?,
                    `updated_user_id`= ?,
                    `delete_flag` = 1
                    where 1=1
                    and `user_id` = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                Auth::user()->user_id
            ]
        );
    }


    //ユーザー種別を更新する
    //フラグを立てる場合の関数
    //更新対象のユーザーIDを「user_id」
    //更新する値を「input」
    //で指定すること
    public function updateUserTypeRegist($updateInfo)
    {
        // Log::debug("updateUserTypeRegist start.");
        DB::update(
            'update `t_users`
                    set `user_type` = 
                    (
                        select
                        LPAD(conv((`user_type_decimal` + `input_decimal`),10,2),8,"0") as `user_type`
                        FROM
                        (
                            SELECT
                            conv(`user_type`,2,10) as `user_type_decimal`
                            ,conv(`input`,2,10) as `input_decimal`
                            FROM
                            (
                                select `user_type`
                                , ? as `input`
                                from `t_users`
                                where 1=1
                                and user_id = ?
                            )t
                        )t
                    )
                    where `user_id` = ?',
            [
                $updateInfo['input'],
                $updateInfo['user_id'],
                $updateInfo['user_id']
            ]
        );
        // Log::debug("updateUserTypeRegist end.");
    }

    //ユーザー種別を更新する
    //フラグを戻す場合の関数
    //更新対象のユーザーIDを「user_id」
    //更新する値を「input」
    //で指定すること
    public function updateUserTypeDelete($updateInfo)
    {
        // Log::debug("updateUserTypeDelete start.");
        DB::update(
            'update `t_users`
                    set `user_type` = 
                    (
                        select
                        LPAD(conv((`user_type_decimal` - `input_decimal`),10,2),8,"0") as `user_type`
                        FROM
                        (
                            SELECT
                            conv(`user_type`,2,10) as `user_type_decimal`
                            ,conv(`input`,2,10) as `input_decimal`
                            FROM
                            (
                                select `user_type`
                                , ? as `input`
                                from `t_users`
                                where 1=1
                                and user_id = ?
                            )t
                        )t
                    )
                    where `user_id` = ?',
            [
                $updateInfo['input'],
                $updateInfo['user_id'],
                $updateInfo['user_id']
            ]
        );
        // Log::debug("updateUserTypeDelete end.");
    }

    //読み込んだcsvの情報を条件としてユーザー情報を取得
    public function getUserDataFromInputCsv($mailaddress)
    {
        $user = DB::select(
            'SELECT
                `user_id`
                ,`user_name`
                ,`mailaddress`
                ,`sex`
                ,`date_of_birth`
                ,`height`
                ,`weight`
                ,`user_type`
                ,CASE
                    WHEN SUBSTR(`user_type`, 6, 1) > 0 THEN 1
                    ELSE 0
                    END AS `is_player`
                ,`expiry_time_of_temp_password`
                ,`temp_password_flag`
            FROM `t_users`
            WHERE 1=1
                AND `delete_flag` = 0
                AND `mailaddress` = :mailaddress',
            ['mailaddress' => $mailaddress]
        );
        return $user;
    }

    //仮ユーザーをinsertする
    public function insertTemporaryUser($userInfo)
    {
        DB::insert(
            'insert into t_users
                    (
                        user_name, 
                        mailaddress, 
                        photo,
                        password, 
                        expiry_time_of_temp_password, 
                        temp_password_flag, 
                        registered_time, 
                        registered_user_id, 
                        updated_time, 
                        updated_user_id, 
                        delete_flag
                    )
                    values
                    (
                        :user_name, 
                        :mailaddress, 
                        "",
                        :password, 
                        :expiry_time_of_temp_password, 
                        :temp_password_flag, 
                        :registered_time, 
                        :registered_user_id, 
                        :updated_time, 
                        :updated_user_id, 
                        0
                    )',
            $userInfo
        );
        //挿入したIDを取得
        $insertId =  DB::getPdo()->lastInsertId();
        return $insertId;
    }

    //ユーザーに関連付いたIDを取得する
    public function getIDsAssociatedWithUser($user_id)
    {
        $users = DB::select(
            'select
                            `t_users`.`user_id`
                            ,SUBSTR(`t_users`.`user_type`,2,1) as `is_administrator`
                            ,SUBSTR(`t_users`.`user_type`,3,1) as `is_jara`
                            ,SUBSTR(`t_users`.`user_type`,4,1) as `is_pref_boat_officer`
                            ,SUBSTR(`t_users`.`user_type`,5,1) as `is_organization_manager`
                            ,SUBSTR(`t_users`.`user_type`,6,1) as `is_player`
                            ,SUBSTR(`t_users`.`user_type`,7,1) as `is_volunteer`
                            ,SUBSTR(`t_users`.`user_type`,8,1) as `is_audience`
                            ,`t_players`.`player_id`
                            ,`t_volunteers`.`volunteer_id`
                            from `t_users`
                            left join `t_players`
                            on `t_users`.`user_id` = `t_players`.`user_id`
                            and `t_players`.`delete_flag` = 0
                            left join `t_volunteers`
                            on `t_users`.`user_id` = `t_volunteers`.`user_id`
                            and `t_volunteers`.`delete_flag` = 0
                            where 1=1
                            and `t_users`.`delete_flag` = 0
                            and `t_users`.`user_id` = ?',
            [$user_id]
        );
        return $users;
    }

    //団体所属スタッフテーブルに存在するユーザーのユーザー種別について、
    //団体管理者のフラグを立てる
    public function updateOrganizationManagerFlagAllUser()
    {
        DB::update(
            "update `t_users`
                    ,(
                        select
                        user_id
                        ,LPAD(conv((`user_type_decimal` + `input_decimal`),10,2),8,'0') as `user_type`
                        from
                        (
                            select
                            user_id
                            ,conv(`user_type`,2,10) as `user_type_decimal`
                            ,conv(`input`,2,10) as `input_decimal`
                            from
                            (
                                select user_id
                                ,`user_type`
                                , '1000' as `input`
                                from `t_users`
                                where 1=1
                                and user_id in
                                (
                                    select user_id
                                    from `t_organization_staff`
                                    where 1=1
                                    and delete_flag = 0
                                )
                                and SUBSTR(`t_users`.`user_type`,5,1) = 0
                            )uuser
                        )uuser
                    )uuser
                    set `t_users`.user_type = uuser.user_type
                    ,`t_users`.`updated_time`= ?
                    ,`t_users`.`updated_user_id`= ?
                    where 1=1
                    and `t_users`.user_id = uuser.user_id",
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id
            ]
        );
    }

    //団体所属スタッフテーブルに存在しないユーザーのユーザー種別について、
    //団体管理者のフラグを戻す
    public function updateDeleteOrganizationManagerFlagAllUser()
    {
        DB::update(
            "update `t_users`
                    ,(
                        select
                        user_id
                        ,LPAD(conv((`user_type_decimal` - `input_decimal`),10,2),8, '0') as `user_type`
                        from
                        (
                            select
                            user_id
                            ,conv(`user_type`,2,10) as `user_type_decimal`
                            ,conv(`input`,2,10) as `input_decimal`
                            from
                            (
                                select user_id
                                ,`user_type`
                                , '1000' as `input`
                                from `t_users`
                                where 1=1
                                and user_id not in
                                (
                                    select user_id
                                    from `t_organization_staff`
                                    where 1=1
                                    and delete_flag = 0
                                )
                                and SUBSTR(`t_users`.`user_type`,5,1) = 1
                            )uuser
                        )uuser
                    )uuser
                    set `t_users`.user_type = uuser.user_type
                    ,`t_users`.`updated_time` = ?
                    ,`t_users`.`updated_user_id` = ?
                    where 1=1
                    and `t_users`.user_id = uuser.user_id",
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id
            ]
        );
    }

    //ユーザーIDが有効かを確認してその結果を返す
    public function getUserIdIsValid($user_id)
    {
        $is_valid = DB::select(
            "select
                                user_id
                                ,user_name
                                ,case
                                    when count(`user_id`) = 0 then false
                                    when `temp_password_flag` = 1 then false
                                    when `delete_flag` = 1 then false
                                    else true
                                    end as `is_valid`
                                from `t_users`
                                where 1=1
                                and user_id = :user_id",
            ['user_id' => $user_id]
        );
        return $is_valid;
    }

    //マイページ プロフィール情報を取得する 20241023
    public function getUserProfileInfo($userId)
    {
        $users = DB::select('select 
                    `t_users`.`user_id` as `userId`, 
                    `t_users`.`user_name` as `userName`, 
                    `t_users`.`mailaddress`, 
                    `t_users`.`user_type` as `userTypeString`,
                    `t_users`.`date_of_birth` as `dateOfBirth`,
                    `t_users`.`height`, 
                    `t_users`.`weight`, 
                    `t_users`.`photo`, 
                    `m_countries`.`country_name` as `countryName`, 
                    `m_prefectures`.`pref_name` as `prefName`, 
                    `m_sex`.`sex`
                    from `t_users`
                    left join `m_sex`
                    on `t_users`.`sex` = `m_sex`.`sex_id`
                    and `m_sex`.`delete_flag` = 0
                    left join `m_countries`
                    on `t_users`.`residence_country` = `m_countries`.`country_id`
                    and `m_countries`.delete_flag = 0
                    left join `m_prefectures`
                    on `t_users`.`residence_prefecture` = `m_prefectures`.`pref_id`
                    and `m_prefectures`.delete_flag = 0
                    where 1=1
                    and `t_users`.`delete_flag` = 0
                    and `user_id` = ?', [$userId]);
        $targetTrn = null;
        if (!empty($users)) {
            $targetTrn = $users[0];
        }
        return $targetTrn;
    }

    //指導者・審判情報の取得 20241106
    public function getCoachRefereeInfoData($user_id, $canShowQualification)
    {
        $users = DB::select(
            'SELECT 
                `t_users`.user_id as `userId`,
                `t_users`.user_name as `userName`,
                CASE
                    WHEN ? THEN `t_users`.jspo_id
                    ELSE NULL
                    END as `jspoId`,
                CASE
                    WHEN ? THEN GROUP_CONCAT(distinct(`coach_qual`.`qual_name`) order by `coach_qual`.`display_order`)
                    ELSE ""
                    END AS "coachQualificationNames",
                CASE
                    WHEN ? THEN GROUP_CONCAT(distinct(`referee_qual`.`qual_name`) order by `referee_qual`.`display_order`)
                    ELSE ""
                    END AS "refereeQualificationNames"
                FROM `t_users`
                left join `t_held_coach_qualifications` `held_coach_qual`
                on `t_users`.`user_id` = `held_coach_qual`.`user_id` 
                and `held_coach_qual`.delete_flag = 0 
                and (`held_coach_qual`.`expiry_date` >= CURDATE() OR `held_coach_qual`.`expiry_date` IS NULL)
                left join `m_coach_qualifications` `coach_qual`
                on `held_coach_qual`.`coach_qualification_id` = `coach_qual`.`coach_qualification_id` and `coach_qual`.delete_flag = 0
                left join `t_held_referee_qualifications` `held_referee_qual`
                on `t_users`.`user_id` = `held_referee_qual`.`user_id` 
                and `held_referee_qual`.delete_flag = 0
                and (`held_referee_qual`.`expiry_date` >= CURDATE() OR `held_referee_qual`.`expiry_date` IS NULL)
                left join `m_referee_qualifications` `referee_qual`
                on `held_referee_qual`.`referee_qualification_id` = `referee_qual`.`referee_qualification_id` and `referee_qual`.delete_flag = 0
                where 1=1
                and `t_users`.delete_flag = 0
                and `t_users`.user_id = ?',
            [
                $canShowQualification,
                $canShowQualification,
                $canShowQualification,
                $user_id
            ]
        );
        $targetTrn = null;
        if (!empty($users)) {
            $targetTrn = $users[0];
        }
        return $targetTrn;
    }

    //JSPO IDの更新 20241108
    public function updateJspoId($jspoId)
    {
        DB::update(
            'update `t_users`
                    SET 
                    `jspo_id` = ?,
                    `updated_time`= ?,
                    `updated_user_id`= ?
                    where 1=1
                    and `user_id` = ?',
            [
                $jspoId,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                Auth::user()->user_id
            ]
        );
    }

    // 選手権限を付与する。
    public function updateUserTypeForPlayer($userId)
    {
        DB::update(
            'UPDATE `t_users` SET 
                # 下3桁目を1に更新する。
                `user_type` = CONCAT(SUBSTRING(`user_type`, 1, 5), "1", SUBSTRING(`user_type`, 7, 2)),
                `updated_time`= ?,
                `updated_user_id`= ?
            where 1=1
                and `user_id` = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $userId
            ]
        );
    }
}
