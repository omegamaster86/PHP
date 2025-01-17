<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\T_donation_histories;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DonationHistoryController extends Controller
{
    //寄付履歴データを追加 20250116
    public function insertDonationHistory(
        Request $request,
        T_donation_histories $tDonationHistories,
    ) {
        Log::debug(sprintf("insertDonationHistory start"));
        try {
            DB::beginTransaction();

            $req = $request->all();
            if (!isset($req['csvData']) || empty($req['csvData'])) {
                abort(400, '取り込み対象データが存在しません。');
            }

            $timeData = now()->format('Y-m-d H:i:s.u');
            $dataList = [];
            foreach ($req['csvData'] as $data) {
                $dataList[] = [
                    'user_id' => $data['userId'],
                    'donator_name' => $data['donatorName'],
                    'donated_date' => $data['donatedDate'],
                    'donation_amount' => $data['donationAmount'],
                    'donation_target' => $data['donationTarget'],
                    'registered_time' => $timeData,
                    'registered_user_id' => Auth::user()->user_id,
                    'updated_time' => $timeData,
                    'updated_user_id' => Auth::user()->user_id,
                ];
            }

            $tDonationHistories->insertDonationHistoriesData($dataList);

            DB::commit();
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, '寄付履歴の登録に失敗しました。');
        }

        Log::debug(sprintf("insertDonationHistory end"));
    }
}
