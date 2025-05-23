<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\T_notifications;
use App\Models\T_notified_coach_qualifications;
use App\Models\T_notified_referee_qualifications;
use App\Models\T_notification_recipients;
use App\Mail\NotificationMail;
use App\Models\T_users;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class NotificationsController extends Controller
{
    //通知参照画面用のデータを取得 20241113
    public function getNotificationInfoData(
        Request $request,
        T_notifications $tNotifications
    ) {
        Log::debug(sprintf("getNotificationInfoData start"));
        $reqData = $request->only(['notificationId', 'notificationType']);
        $notificationId = $reqData["notificationId"];
        $notificationType = $reqData["notificationType"];
        $userId = Auth::user()->user_id;

        if (empty($notificationId)) {
            abort(400, '通知IDが指定されていません。');
        }

        if ($notificationType != 'sent' && $notificationType != 'received') {
            abort(400, '通知タイプが指定されていません。');
        }

        if ($notificationType == 'sent') {
            $result = $tNotifications->getSenderNotificationInfoData($notificationId);
        }
        if ($notificationType == 'received') {
            $result = $tNotifications->getRecipientNotificationInfoData($userId, $notificationId);
        }

        if (empty($result->notificationId)) {
            abort(404, '通知情報が見つかりません。');
        }

        Log::debug(sprintf("getNotificationInfoData end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //通知一覧画面用(送信)のデータを取得 20241115
    public function getSenderNotificationsList(
        Request $request,
        T_notifications $tNotifications
    ) {
        Log::debug(sprintf("getSenderNotificationsList start"));
        $reqData = $request->all();

        $result = $tNotifications->getSenderNotificationsListData(); //送信通知情報を取得 20241115

        Log::debug(sprintf("getSenderNotificationsList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //通知一覧画面用(受信)のデータを取得 20241115
    public function getRecipientsNotificationsList(
        Request $request,
        T_notifications $tNotifications
    ) {
        Log::debug(sprintf("getRecipientsNotificationsList start"));
        $reqData = $request->all();

        $result = $tNotifications->getRecipientsNotificationsListData(); //受信通知情報を取得 20241115

        Log::debug(sprintf("getRecipientsNotificationsList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    // 未読通知カウントを取得
    public function unreadCount(
        T_notifications $tNotifications
    ) {
        Log::debug(sprintf("unreadCount start"));

        $userId = Auth::user()->user_id;
        $unreadCount = $tNotifications->getUnreadNotificationCount($userId);

        $result = [
            'unreadCount' => $unreadCount
        ];

        Log::debug(sprintf("unreadCount end"));
        return response()->json(['result' => $result]);
    }

    //通知情報の削除 20241108
    public function deleteNotification(
        Request $request,
        T_notifications $tNotifications
    ) {
        Log::debug(sprintf("deleteNotification start"));

        try {
            DB::beginTransaction();

            $reqData = $request->all();
            $notificationId = $reqData["notificationId"];
            $userId = Auth::user()->user_id;

            $targetNotification = $tNotifications->getSenderNotificationInfoData($notificationId);
            $targetSenderId = $targetNotification->senderId;
            if (empty($targetSenderId) || $targetSenderId !== $userId) {
                abort(403, '削除権限がありません。');
            }

            $tNotifications->deleteNotificationData($notificationId); //通知情報の削除 20241118

            DB::commit();
        } catch (HttpException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            if ($e instanceof HttpException) {
                throw $e;
            }

            abort(500, '通知情報の削除に失敗しました。');
        }

        Log::debug(sprintf("deleteNotification end"));
        return response()->noContent();
    }

    //通知情報の登録 20241119
    public function insertNotification(
        Request $request,
        T_notifications $tNotifications,
        T_notified_coach_qualifications $tNotifiedCoachQualifications,
        T_notified_referee_qualifications $tNotifiedRefereeQualifications,
        T_notification_recipients $tNotificationRecipients,
        T_users $tUsers
    ) {
        Log::debug(sprintf("insertNotification start"));

        try {
            DB::beginTransaction();

            $req = $request->all();
            $userId = Auth::user()->user_id;
            $notificationDestinationTypeId = $req["notificationData"]["notificationDestinationTypeId"];

            $userType = $tUsers->getIDsAssociatedWithUser($userId);
            $firstOfUserType = reset($userType);
            if (empty($firstOfUserType)) {
                abort(403, '権限がありません。');
            }
            if ($notificationDestinationTypeId == 1 && $firstOfUserType->is_player == 0) {
                abort(403, '権限がありません。');
            }
            if ($notificationDestinationTypeId == 2 && $firstOfUserType->is_organization_manager == 0) {
                abort(403, '権限がありません。');
            }
            if ($notificationDestinationTypeId == 3 && $firstOfUserType->is_jara == 0) {
                abort(403, '権限がありません。');
            }
            if ($notificationDestinationTypeId == 4 && $firstOfUserType->is_jara == 0) {
                abort(403, '権限がありません。');
            }

            $req["notificationData"]["senderId"] = $userId;
            $req["notificationData"]["sentTime"] = now()->format('Y-m-d H:i:s.u');
            $insertId = $tNotifications->insertNotificationData($req["notificationData"]); //通知情報の登録 20241118
            //指導者資格の追加
            if (!empty($req["coachQualificationsData"])) {
                for ($i = 0; $i < count($req['coachQualificationsData']); $i++) {
                    $req['coachQualificationsData'][$i]["notificationId"] = $insertId;
                    $tNotifiedCoachQualifications->insertNotifiedCoachQualificationsData($req['coachQualificationsData'][$i]);
                }
            }

            //審判資格の追加
            if (!empty($req["refereeQualificationsData"])) {
                for ($i = 0; $i < count($req['refereeQualificationsData']); $i++) {
                    $req['refereeQualificationsData'][$i]["notificationId"] = $insertId;
                    $tNotifiedRefereeQualifications->insertNotifiedRefereeQualificationsData($req['refereeQualificationsData'][$i]);
                }
            }

            //通知先区分IDごと条件分け
            if ($req["notificationData"]["notificationDestinationTypeId"] == 1) {
                //選手フォロー
                $tNotificationRecipients->insertFollowedPlayersNotificationData($insertId);
            } else if ($req["notificationData"]["notificationDestinationTypeId"] == 2) {
                //大会フォロー
                $tNotificationRecipients->insertFollowedTournamentsNotificationData($insertId);
            } else if ($req["notificationData"]["notificationDestinationTypeId"] == 3) {
                //有資格者
                $tNotificationRecipients->insertHeldQualificationNotificationData($insertId);
            } else {
                //全ユーザー
                $tNotificationRecipients->insertAllUserNotificationData($insertId);
            }
            $mailData = $tNotifications->getNotificationMailData($insertId); //メール送信用データ取得 20241128
            $mailData = (array)$mailData[0];

            $mailData['user_name'] = Auth::user()->user_name; //送信者を設定 20241128
            $mailData['received_notifications_url'] = config('env-data.frontend-url') . '/notifications/received';
            $mailList = explode(',', $mailData['to']); //メール送信用のリストを作成 20241128
            foreach ($mailList as $recipient) {
                try {
                    Mail::to($recipient)->send(new NotificationMail($mailData)); // 個別にメール送信 20250121
                } catch (\Exception $e) {
                    Log::error('ErrorMailAddress: ' . $recipient . ' ErrorMessage: ' . $e->getMessage()); //送信エラーのメールアドレスとメッセージをログに出力 20250121
                    continue;
                }
            }

            DB::commit();
        } catch (HttpException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, '通知情報の登録に失敗しました。');
        }

        Log::debug(sprintf("insertNotification end"));
    }

    //通知情報の更新 20241119
    public function updateNotification(
        Request $request,
        T_notifications $tNotifications,
        T_users $tUsers
    ) {
        Log::debug(sprintf("updateNotification start"));

        try {
            DB::beginTransaction();

            $req = $request->all();
            $notificationId = $req['notificationId'];
            $userId = Auth::user()->user_id;

            $targetNotification = $tNotifications->getSenderNotificationInfoData($notificationId);
            $targetSenderId = $targetNotification->senderId;
            $targetNotificationDestinationTypeId = $targetNotification->notificationDestinationTypeId;
            if (empty($targetSenderId) || $targetSenderId !== $userId) {
                abort(403, '編集権限がありません。');
            }

            $userType = $tUsers->getIDsAssociatedWithUser($userId);
            $firstOfUserType = reset($userType);
            if (empty($firstOfUserType)) {
                abort(403, '編集権限がありません。');
            }
            if ($targetNotificationDestinationTypeId == 1 && $firstOfUserType->is_player == 0) {
                abort(403, '編集権限がありません。');
            }
            if ($targetNotificationDestinationTypeId == 2 && $firstOfUserType->is_organization_manager == 0) {
                abort(403, '編集権限がありません。');
            }
            if ($targetNotificationDestinationTypeId == 3 && $firstOfUserType->is_jara == 0) {
                abort(403, '編集権限がありません。');
            }
            if ($targetNotificationDestinationTypeId == 4 && $firstOfUserType->is_jara == 0) {
                abort(403, '編集権限がありません。');
            }

            $tNotifications->updateNotificationData($req); //通知情報の更新 20241118

            DB::commit();
        } catch (HttpException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();

            abort(500, '通知情報の更新に失敗しました。');
        }

        Log::debug(sprintf("updateNotification end"));
    }

    //既読フラグの更新 20241120
    public function updateNotificationReadFlag(
        Request $request,
        T_notification_recipients $tNotificationRecipients
    ) {
        Log::debug(sprintf("updateNotificationReadFlag start"));

        try {
            DB::beginTransaction();

            $req = $request->all();
            $tNotificationRecipients->updateNotificationReadFlagData($req); //通知情報の更新 20241118

            DB::commit();
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, '既読フラグの更新に失敗しました。');
        }

        Log::debug(sprintf("updateNotificationReadFlag end"));
    }
}
