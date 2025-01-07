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
    //レース結果参照画面に表示する用 20240216
    public function sendCsvData(Request $request, T_players $t_players, T_users $t_users)
    {
        Log::debug("sendCsvData start.");
        $reqData = $request->all();
        Log::debug($reqData);
        //処理済み行の既存選手IDを格納する
        $processed_player_id_array = [];
        //for($rowIndex = 0; $rowIndex < count($reqData); $rowIndex++)
        //1行ずつ処理する
        //ヘッダーが含まれているから0行目は処理対象としない
        for ($rowIndex = 0; $rowIndex < count($reqData); $rowIndex++) {
            if ($reqData[$rowIndex]["link"] == "連携不可") {
                continue; //フロント側のバリデーション結果が「連携不可」の場合、以降の処理を行わない 20240527
            }

            $old_player_id = $reqData[$rowIndex]["oldPlayerId"];    //既存選手ID
            //既存選手IDが記載されているかをチェック
            if (empty($old_player_id)) {
                //Log::debug("csvの既存選手IDが空です.");
                $reqData[$rowIndex]["link"] = "連携不可";
                $reqData[$rowIndex]["message"] = "無効なデータ";
                $reqData[$rowIndex]["checked"] = false;
                continue;
            } else {
                //既存選手IDが半角数字かつ12桁以内であることを判定
                if (!preg_match('/^[0-9]+$/', $old_player_id) or mb_strlen($old_player_id) > 12) {
                    //Log::debug("csvの既存選手IDが半角数字かつ12桁以内です.");
                    $reqData[$rowIndex]["link"] = "連携不可";
                    $reqData[$rowIndex]["message"] = "無効なデータ";
                    $reqData[$rowIndex]["checked"] = false;
                    continue;
                }
            }
            //重複チェック
            if (isset($processed_player_id_array)) {
                //重複しているか判定
                $is_duplicate = in_array($old_player_id, $processed_player_id_array);
            }
            if ($is_duplicate) {
                //Log::debug("重複データです.");
                $reqData[$rowIndex]["link"] = "連携不可";
                $reqData[$rowIndex]["message"] = "読み込みファイル内重複データ";
                $reqData[$rowIndex]["checked"] = false;
                continue;
            }

            //既存選手IDが登録されていないことを確認
            $registered_player = $t_players->getPlayerFromJaraPlayerId($old_player_id);
            if (empty($registered_player)) //既存選手IDが登録されていない場合
            {
                //Log::debug("既存選手IDが登録されていません.");
                $player_id = $reqData[$rowIndex]["playerId"];  //新選手ID
                if (isset($player_id))               //ファイルの新選手IDにIDが設定されている
                {
                    //Log::debug("ファイルの新選手IDにIDが設定されています.");                    
                    $player_data = $t_players->getPlayer($player_id);
                    //Log::debug($player_data);                  
                    if (empty($player_data))     //選手テーブルに選手データなし
                    {
                        //⑥
                        //Log::debug("選手テーブルに選手データがありません.");
                        $reqData[$rowIndex]["link"] = "連携不可";
                        $reqData[$rowIndex]["message"] = "システムに登録されていない選手IDです。";
                        $reqData[$rowIndex]["checked"] = false;
                    } else    //ユーザーIDが登録されている場合
                    {
                        $player_user_id = $player_data[0]->{'user_id'};
                        if (isset($player_user_id)) {
                            if (isset($player_data[0]->{"jara_player_id"})) {
                                //③
                                //当該データに既存選手IDが登録されている
                                //Log::debug("ユーザーIDが登録済みです.");
                                $reqData[$rowIndex]["link"] = "連携不可";
                                $reqData[$rowIndex]["message"] = "既にマッピングされている既存選手IDです。マッピングされてる選手:[" . $player_data[0]->{'player_name'} . "]([" . $player_data[0]->{'player_id'} . "])";
                                $reqData[$rowIndex]["checked"] = false;
                            } else {
                                //④
                                //当該データに既存選手IDが登録されていない
                                $reqData[$rowIndex]["link"] = "連携可能";
                                $reqData[$rowIndex]["message"] = "登録されている選手と連携できます。選手:[" . $player_data[0]->{'player_name'} . "]([" . $player_data[0]->{'player_id'} . "])";
                                $reqData[$rowIndex]["checked"] = true;
                            }
                        } else {
                            //⑤
                            //ユーザーIDが登録されていない
                            $reqData[$rowIndex]["link"] = "連携不可";
                            $reqData[$rowIndex]["message"] = "使用できない選手IDです。";
                            $reqData[$rowIndex]["checked"] = false;
                        }
                    }
                } else    //ファイルの新選手IDにIDが設定されていない
                {
                    //Log::debug("ファイルの新選手IDにIDが設定されていない.");
                    $mailaddress = $reqData[$rowIndex]["mailaddress"]; //メールアドレス
                    if (isset($mailaddress))     //ファイルのメールアドレスが設定されている
                    {
                        //Log::debug("ファイルのメールアドレスが設定されている.");
                        //メールアドレスでユーザーテーブルを検索
                        $user_data = $t_users->getUserDataFromMailAddress($mailaddress);
                        // Log::debug("********************user_data********************");
                        // Log::debug($user_data);
                        if (empty($user_data))   //ユーザーテーブルにデータなし
                        {
                            //⑨
                            //Log::debug("ユーザーテーブルにデータなし.");
                            $reqData[$rowIndex]["link"] = "連携待ち";
                            $reqData[$rowIndex]["message"] = "連携待ちデータとして登録します。";
                            $reqData[$rowIndex]["checked"] = true;
                        } else    //ユーザーテーブルにデータあり
                        {
                            //当該ユーザーデータのユーザーIDで選手データを検索
                            $player_data = $t_players->getPlayerFromUserId($user_data[0]->{'user_id'});
                            if (empty($player_data)) {
                                //⑨
                                //選手テーブルに選手データなし
                                //Log::debug("選手テーブルに選手データなし.");
                                $reqData[$rowIndex]["link"] = "連携待ち";
                                $reqData[$rowIndex]["message"] = "連携待ちデータとして登録します。";
                                $reqData[$rowIndex]["checked"] = true;
                            } else {
                                //選手テーブルに選手データあり
                                //Log::debug("選手テーブルに選手データあり.");
                                //当該データに既存選手IDが登録されているか
                                if (empty($player_data[0]->jara_player_id)) {
                                    //⑧
                                    //既存選手IDが登録されていない場合
                                    //Log::debug("既存選手IDが登録されていない.");
                                    $reqData[$rowIndex]["link"] = "連携可能";
                                    //$reqData[$rowIndex]["player_id"] = $player_data[0]->player_id;
                                    $reqData[$rowIndex]["message"] = "登録されている選手と連結できます。選手：[" . $player_data[0]->player_name . "]([" . $player_data[0]->player_id . "])";
                                    $reqData[$rowIndex]["checked"] = true;
                                } else {
                                    //⑦
                                    //既存選手IDが登録されている場合
                                    //Log::debug("既存選手IDが登録されている.");
                                    $reqData[$rowIndex]["link"] = "連携不可";
                                    $reqData[$rowIndex]["message"] = "既にマッピングされている既存選手IDです。マッピングされてる選手:[" . $player_data[0]->player_name . "]([" . $player_data[0]->player_id . "])";
                                    $reqData[$rowIndex]["checked"] = false;
                                }
                            }
                        }
                    } else {
                        //⑨
                        //ファイルのメールアドレスが設定されていない
                        //Log::debug("ファイルのメールアドレスが設定されていない.");
                        $reqData[$rowIndex]["link"] = "連携待ち";
                        $reqData[$rowIndex]["message"] = "連携待ちデータとして登録します。";
                        $reqData[$rowIndex]["checked"] = true;
                    }
                }
            } else //既存選手IDが登録されている場合
            {
                //Log::debug("既存選手IDが登録されている.");
                $registered_player_user_id = $registered_player[0]->user_id;
                if (empty($registered_player_user_id))   //ユーザーIDが登録されていない場合
                {
                    //②
                    //Log::debug("ユーザーIDが登録されていない.");
                    $reqData[$rowIndex]["link"] = "連携不可";
                    $reqData[$rowIndex]["message"] = "既に連携待ちデータとして登録されています。";
                    $reqData[$rowIndex]["checked"] = false;
                } else    //ユーザーIDが登録されている場合
                {
                    //①
                    //Log::debug("ユーザーIDが登録されている.");
                    $reqData[$rowIndex]["link"] = "連携不可";
                    $reqData[$rowIndex]["message"] = "既にマッピングされている既存選手IDです。マッピングされてる選手:[" . $registered_player[0]->player_name . "]([" . $registered_player[0]->player_id . "])。";
                    $reqData[$rowIndex]["checked"] = false;
                }
            }
            array_push($processed_player_id_array, $reqData[$rowIndex]["oldPlayerId"]);
        }
        Log::debug("sendCsvData end.");
        return response()->json(['result' => $reqData]); //DBの結果を返す
    }

    // 連携ボタン押下後 20240228
    public function registerCsvData(Request $request, T_players $t_players, T_users $t_users)
    {
        $reqData = $request->all();
        Log::debug($reqData);
        //1行ずつ確認して登録処理を行う
        DB::beginTransaction();
        try {
            for ($rowIndex = 0; $rowIndex < count($reqData); $rowIndex++) {
                $checked = $reqData[$rowIndex]["checked"]; //チェック状態
                $link = $reqData[$rowIndex]["link"];       //リンク
                if (isset($checked) && $checked == true) {
                    if ($link == "連携可能") {
                        //選手IDの有無を確認
                        //有る場合はそれを用いてに更新実行
                        //無い場合はメールアドレスを条件にユーザーIDを取得し、そのユーザーIDを条件に選手IDを取得する
                        $target_player_id = $reqData[$rowIndex]['playerId'];
                        Log::debug($target_player_id);
                        if (empty($target_player_id)) {
                            $mailaddress = $reqData[$rowIndex]["mailaddress"]; //メールアドレス
                            $user_data = $t_users->getUserDataFromMailAddress($mailaddress);
                            //当該ユーザーデータのユーザーIDで選手データを検索
                            $player_data = $t_players->getPlayerFromUserId($user_data[0]->{'user_id'});
                            $target_player_id = $player_data[0]->player_id;
                            $reqData[$rowIndex]['playerId'] = $target_player_id;
                        }
                        //選手テーブルで対象の選手に既存選手IDを登録（更新）する
                        $t_players->updatePlayers($reqData[$rowIndex]);
                    } elseif ($link == "連携待ち") {
                        //選手テーブルに連携待ちデータとして読み込んだ情報を登録（挿入）する
                        $t_players->insertPlayerForPlayerInfoAlignment($reqData[$rowIndex]);
                    }
                }
            }
            DB::commit();
            return response()->json(['result' => true]); //DBの結果を返す
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e);
            abort(500, ['result' => false, 'errMessage' => $e->getMessage()]);
        }
    }
}
