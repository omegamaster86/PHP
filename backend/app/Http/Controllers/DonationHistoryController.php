<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\T_donation_histories;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Ramsey\Uuid\Uuid;
use Symfony\Component\HttpKernel\Exception\HttpException;

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

            $req = $request->only(['csvData']);
            $csvData = $req['csvData'];

            if (!isset($csvData) || empty($csvData)) {
                abort(400, '取り込み対象データが存在しません。');
            }

            $uuid = Uuid::uuid4()->getBytes();
            $now = now()->format('Y-m-d H:i:s.u');
            $userId = Auth::user()->user_id;

            $dataList = [];
            foreach ($csvData as $data) {
                $dataList[] = [
                    'transaction_uuid' => $uuid,
                    'row_number' => $data['rowNumber'],
                    'mailaddress' => $data['mailaddress'],
                    'donator_name' => $data['donatorName'],
                    'donated_date' => $data['donatedDate'],
                    'donation_amount' => $data['donationAmount'],
                    'donation_target' => $data['donationTarget'],
                    'registered_time' => $now,
                    'registered_user_id' => $userId,
                    'updated_time' => $now,
                    'updated_user_id' => $userId,
                ];
            }

            $tDonationHistories->insertDonationHistoryCsvUploadData($dataList);
            $tDonationHistories->insertDonationHistoriesData($uuid);

            DB::commit();
        } catch (HttpException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, '寄付履歴の登録に失敗しました。');
        }

        Log::debug(sprintf("insertDonationHistory end"));
    }
}
