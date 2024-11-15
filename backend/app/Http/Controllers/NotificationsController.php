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
}
