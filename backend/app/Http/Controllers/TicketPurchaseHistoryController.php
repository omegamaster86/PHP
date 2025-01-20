<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\T_teket_sales_history_csv_upload;
use App\Models\T_ticket_purchase_histories;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Ramsey\Uuid\Uuid;

class TicketPurchaseHistoryController extends Controller
{
    //teket販売履歴CSVアップロードテーブルにデータを追加 20241224
    public function insertTeketSalesHistoryCsvUpload(
        Request $request,
        T_teket_sales_history_csv_upload $tTeketSalesHistoryCsvUpload,
        T_ticket_purchase_histories $tTicketPurchaseHistory,
    ) {
        Log::debug(sprintf("insertTeketSalesHistoryCsvUpload start"));
        try {
            DB::beginTransaction();

            $req = $request->only(['fileName', 'csvData', 'tournId']);
            $fileName = $req['fileName'];
            $csvData = $req['csvData'];
            $tournId = $req['tournId'];

            if (empty($tournId)) {
                abort(400, '大会IDを指定してください。');
            }
            if (!isset($csvData) || empty($csvData)) {
                abort(400, '取り込み対象データが存在しません。');
            }

            $timeData = now()->format('Y-m-d H:i:s.u');
            $uuid = Uuid::uuid4()->getBytes(); //UUIDの生成 20250110

            $dataList = [];
            foreach ($csvData as $data) {
                $dataList[] = [
                    'transaction_uuid' => $uuid,
                    'row_number' => $data['rowNumber'],
                    'file_name' => $fileName,
                    'purchased_time' => $data['purchasedTime'],
                    'purchaser_name' => $data['purchaserName'],
                    'mailaddress' => $data['mailaddress'],
                    'event_date' => $data['eventDate'],
                    'ticket_name' => $data['ticketName'],
                    'ticket_number' => $data['ticketNumber'],
                    'sub_ticket_name' => $data['subTicketName'],
                    'ticket_count' => $data['ticketCount'],
                    'ticket_amount' => $data['ticketAmount'],
                    'admission_count' => $data['admissionCount'],
                    'questionnaire_mailaddress' => $data['questionnaireMailaddress'],
                    'registered_time' => $timeData,
                    'registered_user_id' => Auth::user()->user_id,
                    'updated_time' => $timeData,
                    'updated_user_id' => Auth::user()->user_id,
                ];
            }

            //teket販売履歴CSVの追加
            $tTeketSalesHistoryCsvUpload->insertTeketSalesHistoryCsvUploadData($dataList); //バルクインサート 20250107

            //チケット購入履歴に追加する
            $tTicketPurchaseHistory->insertTicketPurchaseHistory($tournId, $uuid); //20250107

            DB::commit();
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, 'teket販売履歴の登録に失敗しました。');
        }

        Log::debug(sprintf("insertTeketSalesHistoryCsvUpload end"));
    }
}
