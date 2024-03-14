<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
// use App\Providers\RouteServiceProvider;
// use Illuminate\Auth\Events\Registered;
// use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Hash;
// use Illuminate\Support\Str;
use Illuminate\View\View;
// use Illuminate\Support\Facades\Mail;
// use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
// use App\Models\Item;
// use Illuminate\Validation\ValidationException;
// use League\CommonMark\Node\Inline\Newline;
// use Exception;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use App\Models\T_players;
use App\Models\T_users;

class PlayerInfoAlignmentController extends Controller
{
    //大会レース結果参照画面に表示する用 20240216
    public function sendCsvData(Request $request,T_players $t_players,T_users $t_users)
    {
        $reqData = $request->all();
        //Log::debug($reqData);
        //処理済み行の既存選手IDを格納する
        $processed_player_id_array = [];
        //1行ずつ処理する
        for($rowIndex = 1; $rowIndex<count($reqData); $rowIndex++)
        {
            $old_player_id = $reqData[$rowIndex]["oldPlayerId"];    //既存選手ID
            //既存選手IDが記載されているかをチェック
            if(empty($old_player_id))
            {
                $reqData[$rowIndex]["link"] = "連携不可";
                $reqData[$rowIndex]["message"] = "無効なデータ";
                $reqData[$rowIndex]["checked"] = false;
                continue;
            }
            else
            {
                //既存選手IDが半角数字かつ12桁以内であることを判定
                if(!preg_match( '/^[0-9]+$/', $old_player_id) or mb_strlen($old_player_id) > 12)
                {  
                    $reqData[$rowIndex]["link"] = "連携不可";
                    $reqData[$rowIndex]["message"] = "無効なデータ";
                    $reqData[$rowIndex]["checked"] = false;
                    continue;
                }
            }
            //重複チェック
            if(isset($processed_player_id_array))
            {
                //重複しているか判定
                $is_duplicate = in_array($old_player_id, $processed_player_id_array);
            }
            if($is_duplicate)
            {
                $reqData[$rowIndex]["link"] = "連携不可";
                $reqData[$rowIndex]["message"] = "読み込みファイル内重複データ";
                $reqData[$rowIndex]["checked"] = false;
                continue;
            }

            //既存選手IDが登録されていないことを確認
            $registered_player = $t_players->getPlayerFromJaraPlayerId($old_player_id);
            if(empty($registered_player)) //既存選手IDが登録されていない場合
            {
                $player_id = $reqData[$rowIndex]["playerId"];  //新選手ID
                if(isset($player_id))               //ファイルの新選手IDにIDが設定されている
                {
                    $player_data = $t_players->getPlayer($player_id);
                    if(empty($player_data))     //選手テーブルに選手データなし
                    {
                        $reqData[$rowIndex]["link"] = "連携待ち";
                        $reqData[$rowIndex]["message"] = "連携待ちデータとして登録します。";
                        $reqData[$rowIndex]["checked"] = true;
                    }
                    else    //ユーザーIDが登録されている場合
                    {
                        $reqData[$rowIndex]["link"] = "連携不可";
                        $reqData[$rowIndex]["message"] = "既にマッピングされている既存選手IDです。マッピングされてる選手:[".$player_data[0]->player_name."]([".$player_data[0]->player_id."])";
                        $reqData[$rowIndex]["checked"] = false;
                    }
                }
                else    //ファイルの新選手IDにIDが設定されていない
                {
                    $mailaddress = $reqData[$rowIndex]["mailaddress"]; //メールアドレス
                    if(isset($mailaddress))     //ファイルのメールアドレスが設定されている
                    {
                        $user_data = $t_users->getUserDataFromMailAddress($mailaddress);
                        if(empty($user_data))   //ユーザーテーブルにデータなし
                        {
                            $reqData[$rowIndex]["link"] = "連携待ち";
                            $reqData[$rowIndex]["message"] = "連携待ちデータとして登録します。";
                            $reqData[$rowIndex]["checked"] = true;
                        }
                        else    //ユーザーテーブルにデータあり
                        {
                            $player_data = $t_players->getPlayer($user_data[0]->user_id);
                            if(empty($player_data)) //選手テーブルに選手データなし
                            {
                                $reqData[$rowIndex]["link"] = "連携待ち";
                                $reqData[$rowIndex]["message"] = "連携待ちデータとして登録します。";
                                $reqData[$rowIndex]["checked"] = true;
                            }
                            else    //選手テーブルに選手データあり
                            {
                                if(empty($player_data[0]->user_id)) //ユーザーIDが登録されていない場合
                                {
                                    $reqData[$rowIndex]["link"] = "連携可能";
                                    $reqData[$rowIndex]["message"] = "登録されている選手と連結できます。選手：[".$player_data[0]->player_name."]([".$player_data[0]->player_id."])";
                                    $reqData[$rowIndex]["checked"] = true;
                                }
                                else    //ユーザーIDが登録されている場合
                                {
                                    $reqData[$rowIndex]["link"] = "連携不可";
                                    $reqData[$rowIndex]["message"] = "既にマッピングされている既存選手IDです。マッピングされてる選手:[".$player_data[0]->player_name."]([".$player_data[0]->player_id."])";
                                    $reqData[$rowIndex]["checked"] = false;
                                }
                            }
                        }
                    }
                    else
                    {
                        //ファイルのメールアドレスが設定されていない
                        $reqData[$rowIndex]["link"] = "連携待ち";
                        $reqData[$rowIndex]["message"] = "連携待ちデータとして登録します。";
                        $reqData[$rowIndex]["checked"] = true;
                    }
                }
            }
            else //既存選手IDが登録されている場合
            {
                $registered_player_user_id = $registered_player[0]->user_id;
                if(empty($registered_player_user_id))   //ユーザーIDが登録されていない場合
                {
                    $reqData[$rowIndex]["link"] = "連携不可";
                    $reqData[$rowIndex]["message"] = "既に連携待ちデータとして登録されています。";
                    $reqData[$rowIndex]["checked"] = false;
                }
                else    //ユーザーIDが登録されている場合
                {
                    $reqData[$rowIndex]["link"] = "連携不可";
                    $reqData[$rowIndex]["message"] = "既にマッピングされている既存選手IDです。マッピングされてる選手:[".$registered_player[0]->player_name."]([".$registered_player[0]->player_id."])。";
                    $reqData[$rowIndex]["checked"] = false;
                }
            }
            array_push($processed_player_id_array, $reqData[$rowIndex]["oldPlayerId"]);
        }
        return response()->json(['result' => $reqData]); //DBの結果を返す
    }

    // 連携ボタン押下後 20240228
    public function registerCsvData(Request $request,T_players $t_players)
    {
        $reqData = $request->all();
        //1行ずつ確認して登録処理を行う
        DB::beginTransaction();
        try
        {
            for($rowIndex = 1; $rowIndex < count($reqData); $rowIndex++)
            {
                $checked = $reqData[$rowIndex]["checked"]; //チェック状態
                $link = $reqData[$rowIndex]["link"];       //リンク
                if(isset($checked) && $checked == true)
                {
                    if($link == "連携可能")
                    {
                        //選手テーブルで対象の選手に既存選手IDを登録（更新）する
                        $t_players->updatePlayers($reqData[$rowIndex]);
                    }
                    elseif($link == "連携待ち")
                    {
                        //選手テーブルに連携待ちデータとして読み込んだ情報を登録（挿入）する
                        $t_players->insertPlayerForPlayerInfoAlignment($reqData[$rowIndex]);
                    }
                }
            }
            DB::commit();
            return response()->json(['result' => true]); //DBの結果を返す
        }
        catch(\Throwable $e)
        {
            DB::rollBack();
            Log::error($e->getMessage());
            return response()->json(['result' => false,'errMessage' => $e->getMessage()]); //エラーメッセージを返す
        }
    }
}
