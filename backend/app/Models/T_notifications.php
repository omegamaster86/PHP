<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_notifications extends Model
{
    use HasFactory;

    //通知参照画面用(送信)データ取得
    public function getSenderNotificationInfoData($notificationId)
    {
        $result = DB::selectOne(
            'SELECT
                t_notifications.notification_id as notificationId,
                MAX(t_notifications.title) as title,
                t_notifications.notification_destination_type_id as notificationDestinationTypeId,
                t_notifications.tourn_id as tournId,
                GROUP_CONCAT(DISTINCT t_notified_coach_qualifications.coach_qualification_id) as coachQualIdsStr,
                GROUP_CONCAT(DISTINCT t_notified_referee_qualifications.referee_qualification_id) as refereeQualIdsStr,
                t_players.player_id as playerId,
                CASE 
                    WHEN t_notifications.notification_destination_type_id = 1 THEN "フォロワー"
                    WHEN t_notifications.notification_destination_type_id = 2 THEN CONCAT(MAX(t_tournaments.tourn_name), "フォロワー")
                    WHEN t_notifications.notification_destination_type_id = 3 THEN CONCAT(
                        IFNULL(GROUP_CONCAT(DISTINCT CONCAT(m_coach_qualifications.qual_name, "保有者") ORDER BY m_coach_qualifications.display_order), ""),
                        ",",                 
                        IFNULL(GROUP_CONCAT(DISTINCT CONCAT(m_referee_qualifications.qual_name, "保有者") ORDER BY m_referee_qualifications.display_order) , "")
                    )
                    WHEN t_notifications.notification_destination_type_id = 4 THEN "全ユーザー"
                    ELSE ""
                END AS "to",
                t_users.user_id as senderId,
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
            where t_notifications.notification_id = ?
            and t_notifications.delete_flag = 0',
            [
                $notificationId
            ]
        );

        // toを配列に変換
        $result->to = array_values(array_filter(explode(',', $result->to), fn($value) => !empty($value)));

        // 指導者資格IDを配列に変換
        $coachQualIdsStr = $result->coachQualIdsStr;
        if (empty($coachQualIdsStr)) {
            $result->coachQualIds = [];
        } else {
            $coachQualIdsToArr = explode(',', $coachQualIdsStr);
            $result->coachQualIds = array_map('intval', $coachQualIdsToArr);
        }

        // 審判資格IDを配列に変換
        $refereeQualIdsStr = $result->refereeQualIdsStr;
        if (empty($refereeQualIdsStr)) {
            $result->refereeQualIds = [];
        } else {
            $refereeQualIdsToArr = explode(',', $refereeQualIdsStr);
            $result->refereeQualIds = array_map('intval', $refereeQualIdsToArr);
        }

        // 不要なプロパティを削除
        unset($result->coachQualIdsStr);
        unset($result->refereeQualIdsStr);

        return $result;
    }

    //通知参照画面用(受信)データ取得
    public function getRecipientNotificationInfoData($userId, $notificationId)
    {
        $result = DB::selectOne(
            'SELECT
                t_notifications.notification_id as notificationId,
                MAX(t_notifications.title) as title,
                t_notifications.notification_destination_type_id as notificationDestinationTypeId,
                t_notifications.tourn_id as tournId,
                GROUP_CONCAT(DISTINCT t_notified_coach_qualifications.coach_qualification_id) as coachQualIdsStr,
                GROUP_CONCAT(DISTINCT t_notified_referee_qualifications.referee_qualification_id) as refereeQualIdsStr,
                t_players.player_id as playerId,
                CASE 
                    WHEN t_notifications.notification_destination_type_id = 1 THEN "フォロワー"
                    WHEN t_notifications.notification_destination_type_id = 2 THEN CONCAT(MAX(t_tournaments.tourn_name), "フォロワー")
                    WHEN t_notifications.notification_destination_type_id = 3 THEN CONCAT(
                        IFNULL(GROUP_CONCAT(DISTINCT CONCAT(m_coach_qualifications.qual_name, "保有者") ORDER BY m_coach_qualifications.display_order), ""),
                        ",",                 
                        IFNULL(GROUP_CONCAT(DISTINCT CONCAT(m_referee_qualifications.qual_name, "保有者") ORDER BY m_referee_qualifications.display_order) , "")
                    )
                    WHEN t_notifications.notification_destination_type_id = 4 THEN "全ユーザー"
                    ELSE ""
                END AS "to",
                t_users.user_id as senderId,
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
            INNER JOIN t_notification_recipients
            ON t_notifications.notification_id = t_notification_recipients.notification_id
            AND t_notification_recipients.recipient_id = :user_id
            AND t_notification_recipients.delete_flag = 0
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
            where t_notifications.notification_id = :notification_id
            and t_notifications.delete_flag = 0',
            [
                'user_id' => $userId,
                'notification_id' => $notificationId,
            ]
        );

        // toを配列に変換
        $result->to = array_values(array_filter(explode(',', $result->to), fn($value) => !empty($value)));

        // 指導者資格IDを配列に変換
        $coachQualIdsStr = $result->coachQualIdsStr;
        if (empty($coachQualIdsStr)) {
            $result->coachQualIds = [];
        } else {
            $coachQualIdsToArr = explode(',', $coachQualIdsStr);
            $result->coachQualIds = array_map('intval', $coachQualIdsToArr);
        }

        // 審判資格IDを配列に変換
        $refereeQualIdsStr = $result->refereeQualIdsStr;
        if (empty($refereeQualIdsStr)) {
            $result->refereeQualIds = [];
        } else {
            $refereeQualIdsToArr = explode(',', $refereeQualIdsStr);
            $result->refereeQualIds = array_map('intval', $refereeQualIdsToArr);
        }

        // 不要なプロパティを削除
        unset($result->coachQualIdsStr);
        unset($result->refereeQualIdsStr);

        return $result;
    }

    //通知一覧画面(送信)のデータを取得 20241115
    public function getSenderNotificationsListData()
    {
        $result = DB::select(
            'SELECT distinct 
                t_notifications.notification_id as notificationId,
                t_notifications.title,
                t_notifications.notification_destination_type_id as notificationDestinationTypeId,
                t_users.user_id as senderId,
                CASE 
                    WHEN t_notifications.notification_destination_type_id = 1 THEN t_players.photo
                    WHEN t_notifications.notification_destination_type_id = 2 THEN SUBSTRING(t_organizations.org_name, 1, 1)
                    WHEN t_notifications.notification_destination_type_id in (3, 4) THEN NULL
                    ELSE NULL
                END AS senderIcon,
                CASE 
                    WHEN t_notifications.notification_destination_type_id = 1 THEN t_players.player_name
                    WHEN t_notifications.notification_destination_type_id = 2 THEN t_tournaments.tourn_name
                    WHEN t_notifications.notification_destination_type_id in (3, 4) THEN "JARA"
                    ELSE NULL
                END AS senderName,
                DATE_FORMAT(t_notifications.sent_time, "%Y-%m-%d %H:%i") as sentTime
            FROM t_notifications
            left join t_tournaments
            on t_notifications.tourn_id = t_tournaments.tourn_id and t_tournaments.delete_flag = 0
            left join t_organizations
            on t_tournaments.sponsor_org_id = t_organizations.org_id and t_organizations.delete_flag = 0
            left join t_users
            on t_notifications.sender_id = t_users.user_id and t_users.delete_flag = 0
            left join t_players
            on t_users.user_id = t_players.user_id and t_players.delete_flag = 0
            where 1=1
            and t_notifications.delete_flag = 0
            and t_notifications.sender_id = ?
            order by t_notifications.sent_time DESC',
            [
                Auth::user()->user_id
            ]
        );
        return $result;
    }

    //通知一覧画面(受信)のデータを取得 20241115
    public function getRecipientsNotificationsListData()
    {
        $result = DB::select(
            'SELECT distinct 
                t_notifications.notification_id as notificationId,
                t_notifications.title,
                t_notifications.notification_destination_type_id as notificationDestinationTypeId,
                t_users.user_id as senderId,
                t_notification_recipients.read_flag as isRead,
                CASE 
                    WHEN t_notifications.notification_destination_type_id = 1 THEN t_players.photo
                    WHEN t_notifications.notification_destination_type_id = 2 THEN SUBSTRING(t_organizations.org_name, 1, 1)
                    WHEN t_notifications.notification_destination_type_id in (3, 4) THEN NULL
                    ELSE NULL
                END AS senderIcon,
                CASE 
                    WHEN t_notifications.notification_destination_type_id = 1 THEN t_players.player_name
                    WHEN t_notifications.notification_destination_type_id = 2 THEN t_tournaments.tourn_name
                    WHEN t_notifications.notification_destination_type_id in (3, 4) THEN "JARA"
                    ELSE NULL
                END AS senderName,
                DATE_FORMAT(t_notifications.sent_time, "%Y-%m-%d %H:%i") as sentTime
            FROM t_notifications
            left join t_tournaments
            on t_notifications.tourn_id = t_tournaments.tourn_id and t_tournaments.delete_flag = 0
            left join t_organizations
            on t_tournaments.sponsor_org_id = t_organizations.org_id and t_organizations.delete_flag = 0
            left join t_users
            on t_notifications.sender_id = t_users.user_id and t_users.delete_flag = 0
            left join t_players
            on t_users.user_id = t_players.user_id and t_players.delete_flag = 0
            left join t_notification_recipients
            on t_notifications.notification_id = t_notification_recipients.notification_id and t_notification_recipients.delete_flag = 0
            where 1=1
            and t_notifications.delete_flag = 0
            and t_notification_recipients.recipient_id = ?
            order by t_notifications.sent_time DESC',
            [
                Auth::user()->user_id
            ]
        );
        return $result;
    }

    // 未読通知カウントを取得
    public function getUnreadNotificationCount($userId)
    {
        $unreadCount = DB::table('t_notification_recipients')
            ->join('t_notifications', function (JoinClause $join) {
                $join->on('t_notification_recipients.notification_id', '=', 't_notifications.notification_id');
                $join->on('t_notifications.delete_flag', '=', DB::raw(0));
            })
            ->where('t_notification_recipients.recipient_id', $userId)
            ->where('t_notification_recipients.read_flag', 0)
            ->where('t_notification_recipients.delete_flag', 0)
            ->count();

        return $unreadCount;
    }

    //通知情報を削除する 20241118
    public function deleteNotificationData($notificationId)
    {
        DB::update(
            'UPDATE t_notifications
                    set
                    updated_time = ?,
                    updated_user_id = ?,
                    delete_flag = 1
                    where 1=1
                    and notification_id = ?',
            [
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $notificationId
            ]
        );
    }

    //通知情報の追加 20241119
    public function insertNotificationData($notificationData)
    {
        $now = now()->format('Y-m-d H:i:s.u');
        $userId = Auth::user()->user_id;

        DB::insert(
            'INSERT into t_notifications set 
                    sender_id = ?,
                    notification_destination_type_id = ?,
                    tourn_id = ?,
                    sent_time = ?,
                    title = ?,
                    body = ?,
                    registered_time = ?,
                    registered_user_id = ?,
                    updated_time = ?,
                    updated_user_id = ?,
                    delete_flag = 0',
            [
                $notificationData['senderId'],
                $notificationData['notificationDestinationTypeId'],
                $notificationData['tournId'],
                $notificationData['sentTime'],
                $notificationData['title'],
                $notificationData['body'],
                $now,
                $userId,
                $now,
                $userId
            ]
        );

        $insertId =  DB::getPdo()->lastInsertId();
        return $insertId;
    }

    //通知情報の更新 20241119
    public function updateNotificationData($notificationData)
    {
        DB::update(
            'UPDATE t_notifications
                    set 
                    title = ?,
                    body = ?,
                    updated_time = ?,
                    updated_user_id = ?
                    where 1=1
                    and delete_flag = 0
                    and notification_id = ?',
            [
                $notificationData['title'],
                $notificationData['body'],
                now()->format('Y-m-d H:i:s.u'),
                Auth::user()->user_id,
                $notificationData['notificationId']
            ]
        );
    }

    //メール送信用データを取得 20241206
    public function getNotificationMailData($notificationId)
    {
        $result = DB::select(
            'SELECT 
                t_notifications.notification_destination_type_id as notification_destination_type_id,
                GROUP_CONCAT(t_users.mailaddress) as `to`
            FROM t_notifications
            inner join t_notification_recipients on t_notifications.notification_id = t_notification_recipients.notification_id and t_notification_recipients.delete_flag = 0
            inner join t_users on t_notification_recipients.recipient_id = t_users.user_id and t_users.delete_flag = 0
            where 1=1
            and t_notifications.delete_flag = 0
            and t_notifications.notification_id = ?',
            [
                $notificationId
            ]
        );
        return $result;
    }
}
