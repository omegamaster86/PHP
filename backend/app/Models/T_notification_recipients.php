<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_notification_recipients extends Model
{
    use HasFactory;

    //選手フォローの受信者データを追加 20241121
    public function insertFollowedPlayersNotificationData($notificationId)
    {
        DB::insert(
            'INSERT into  t_notification_recipients (
                notification_id,
                recipient_id,
                read_flag,
                registered_time,
                registered_user_id,
                updated_time,
                updated_user_id,
                delete_flag
            )
            SELECT 
                t_notifications.notification_id,
                t_followed_players.user_id,
                0,
                ?,
                ?,
                ?,
                ?,
                0
            FROM t_notifications
            inner join t_users `sender` on t_notifications.sender_id = `sender`.user_id and `sender`.delete_flag = 0
            inner join t_players on `sender`.user_id = t_players.user_id and t_players.delete_flag = 0
            inner join t_followed_players on t_players.player_id = t_followed_players.player_id and t_followed_players.delete_flag = 0
            inner join t_users `follower` on t_followed_players.user_id = `follower`.user_id and `follower`.delete_flag = 0
            where 1=1
            and t_notifications.delete_flag = 0
            and t_notifications.notification_id = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $notificationId
            ]
        );
    }

    //大会フォローの受信者データを追加 20241121
    public function insertFollowedTournamentsNotificationData($notificationId)
    {
        DB::insert(
            'INSERT into  t_notification_recipients (
                notification_id,
                recipient_id,
                read_flag,
                registered_time,
                registered_user_id,
                updated_time,
                updated_user_id,
                delete_flag
            )
            SELECT 
                t_notifications.notification_id,
                t_followed_tournaments.user_id,
                0,
                ?,
                ?,
                ?,
                ?,
                0
            FROM t_notifications
            inner join t_followed_tournaments on t_notifications.tourn_id = t_followed_tournaments.tourn_id and t_followed_tournaments.delete_flag = 0
            inner join t_users on t_followed_tournaments.user_id = t_users.user_id and t_users.delete_flag = 0
            where 1=1
            and t_notifications.delete_flag = 0
            and t_notifications.notification_id = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $notificationId
            ]
        );
    }

    //有資格者の受信者データを追加 20241121
    public function insertHeldQualificationNotificationData($notificationId)
    {
        DB::insert(
            'INSERT into  t_notification_recipients (
                notification_id,
                recipient_id,
                read_flag,
                registered_time,
                registered_user_id,
                updated_time,
                updated_user_id,
                delete_flag
            )
            SELECT 
                t_notifications.notification_id,
                t_held_coach_qualifications.user_id,
                0,
                ?,
                ?,
                ?,
                ?,
                0
            FROM t_notifications
            inner join t_notified_coach_qualifications on t_notifications.notification_id = t_notified_coach_qualifications.notification_id and t_notified_coach_qualifications.delete_flag = 0
            inner join t_held_coach_qualifications on t_notified_coach_qualifications.coach_qualification_id = t_held_coach_qualifications.coach_qualification_id and t_held_coach_qualifications.delete_flag = 0
            inner join t_users on t_held_coach_qualifications.user_id = t_users.user_id and t_users.delete_flag = 0
            where 1=1
            and t_notifications.delete_flag = 0
            and t_notifications.notification_id = ?
            UNION distinct 
            SELECT  
                t_notifications.notification_id,
                t_held_referee_qualifications.user_id,
                0,
                ?,
                ?,
                ?,
                ?,
                0
            FROM t_notifications
            inner join t_notified_referee_qualifications on t_notifications.notification_id = t_notified_referee_qualifications.notification_id 
            and t_notified_referee_qualifications.delete_flag = 0
            inner join t_held_referee_qualifications on t_notified_referee_qualifications.referee_qualification_id = t_held_referee_qualifications.referee_qualification_id 
            and t_held_referee_qualifications.delete_flag = 0
            inner join t_users on t_held_referee_qualifications.user_id = t_users.user_id and t_users.delete_flag = 0
            where 1=1
            and t_notifications.delete_flag = 0
            and t_notifications.notification_id = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $notificationId,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $notificationId
            ]
        );
    }

    //全ユーザーの受信者データを追加 20241121
    public function insertAllUserNotificationData($notificationId)
    {
        DB::insert(
            'INSERT into  t_notification_recipients (
                notification_id,
                recipient_id,
                read_flag,
                registered_time,
                registered_user_id,
                updated_time,
                updated_user_id,
                delete_flag
            )
            SELECT 
                t_notifications.notification_id,
                t_users.user_id,
                0,
                ?,
                ?,
                ?,
                ?,
                0
            FROM t_notifications 
            inner join t_users on t_notifications.sender_id != t_users.user_id and t_users.delete_flag = 0 and t_users.temp_password_flag = 0
            where 1=1
            and t_notifications.delete_flag = 0
            and t_notifications.notification_id = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $notificationId
            ]
        );
    }

    //既読フラグの更新 20241119
    public function updateNotificationReadFlagData($notificationRecipientsData)
    {
        DB::update(
            'UPDATE t_notification_recipients
                    set
                    read_flag = 1
                    updated_time = ?,
                    updated_user_id = ?,
                    where 1=1
                    and delete_flag = 0
                    and notification_id = ?
                    and recipient_id = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $notificationRecipientsData['notificationId'],
                Auth::user()->user_id,
            ]
        );
    }
}
