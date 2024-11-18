<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\T_notifications;
use Illuminate\Support\Facades\DB;

class NotificationsController extends Controller
{
    //通知参照画面用のデータを取得 20241113
    public function getNotificationsInfoList(
        Request $request,
        T_notifications $tNotifications
    ) {
        Log::debug(sprintf("getNotificationsInfoList start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $notificationId = $reqData["notificationId"];

        $result = $tNotifications->getNotificationsInfoData($notificationId); //通知情報を取得 20241112

        Log::debug(sprintf("getNotificationsInfoList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //通知一覧画面用(送信)のデータを取得 20241115
    public function getSenderNotificationsList(
        Request $request,
        T_notifications $tNotifications
    ) {
        Log::debug(sprintf("getSenderNotificationsList start"));
        $reqData = $request->all();
        Log::debug($reqData);

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
        Log::debug($reqData);

        $result = $tNotifications->getRecipientsNotificationsListData(); //受信通知情報を取得 20241115

        Log::debug(sprintf("getRecipientsNotificationsList end"));
        return response()->json(['result' => $result]); //DBの結果を返す
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
            Log::debug($reqData);
            $notificationId = $reqData["notificationId"];
            $tNotifications->deleteNotificationData($notificationId); //通知情報の削除 20241118

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            abort(500, '通知情報の削除に失敗しました。');
        }

        Log::debug(sprintf("deleteNotification end"));
    }
}
