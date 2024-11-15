<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_notifications extends Model
{
    use HasFactory;

    //通知参照画面用データ取得 20241113
    public function getNotificationsInfoData($notificationId)
    {
        $result = DB::select(
            'SELECT 
                MAX(t_notifications.title) as title,
                CASE 
                    WHEN t_notifications.notification_destination_type_id = 1 THEN "フォロワー"
                    WHEN t_notifications.notification_destination_type_id = 2 THEN CONCAT(MAX(t_tournaments.tourn_name), "フォロワー")
                    WHEN t_notifications.notification_destination_type_id = 3 THEN CONCAT(
                        GROUP_CONCAT(DISTINCT CONCAT(m_coach_qualifications.qual_name, "保有者") ORDER BY m_coach_qualifications.display_order),
                        GROUP_CONCAT(DISTINCT CONCAT(m_referee_qualifications.qual_name, "保有者") ORDER BY m_referee_qualifications.display_order)
                    )
                    WHEN t_notifications.notification_destination_type_id = 4 THEN "全ユーザー"
                    ELSE NULL
                END AS "to",
                CASE 
                    WHEN t_notifications.notification_destination_type_id = 1 THEN MAX(t_players.photo)
                    WHEN t_notifications.notification_destination_type_id = 2 THEN MAX(SUBSTRING(t_organizations.org_name, 1, 1))
                    WHEN t_notifications.notification_destination_type_id in (3, 4) THEN NULL
                    ELSE NULL
                END AS senderIcon,
                CASE 
                    WHEN t_notifications.notification_destination_type_id = 1 THEN MAX(t_players.player_name)
                    WHEN t_notifications.notification_destination_type_id = 2 THEN MAX(t_tournaments.tourn_name)
                    WHEN t_notifications.notification_destination_type_id in (3, 4) THEN "JARA"
                    ELSE NULL
                END AS senderName,
                DATE_FORMAT(MAX(t_notifications.sent_time), "%Y-%m-%d %H:%i") as sentTime,
                MAX(t_notifications.body) as body
            FROM t_notifications
            left join t_tournaments
            on t_notifications.tourn_id = t_tournaments.tourn_id and t_tournaments.delete_flag = 0
            left join t_organizations
            on t_tournaments.sponsor_org_id = t_organizations.org_id and t_organizations.delete_flag = 0
            left join t_users
            on t_notifications.sender_id = t_users.user_id and t_users.delete_flag = 0
            left join t_players
            on t_users.user_id = t_players.user_id and t_players.delete_flag = 0
            left join t_notified_coach_qualifications
            on t_notifications.notification_id = t_notified_coach_qualifications.notification_id and t_notified_coach_qualifications.delete_flag = 0
            left join m_coach_qualifications
            on t_notified_coach_qualifications.coach_qualification_id = m_coach_qualifications.coach_qualification_id and m_coach_qualifications.delete_flag = 0
            left join t_notified_referee_qualifications
            on t_notifications.notification_id = t_notified_referee_qualifications.notification_id and t_notified_referee_qualifications.delete_flag = 0
            left join m_referee_qualifications
            on t_notified_referee_qualifications.referee_qualification_id = m_referee_qualifications.referee_qualification_id and m_referee_qualifications.delete_flag = 0
            where t_notifications.notification_id = ?',
            [
                $notificationId
            ]
        );
        return $result;
    }
}
