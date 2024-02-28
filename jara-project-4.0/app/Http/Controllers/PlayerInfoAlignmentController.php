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
    // 大会情報確認画面呼び出し
    // public function createInfoAlignment(Request $request): View
    // {
    //     //$csvList = array();
    //     $csvList = "";
    //     return view('player.info_alignment', ["csvList" => $csvList, "errorMsg" => "", "checkList" => ""]);
    // }

    public function csvread(Request $request, T_players $tPlayersData): View
    {
        if ($request->has('csvRead')) { // 参照ボタンクリック
            // CSVファイルが存在するかの確認
            if ($request->hasFile('csvFile')) {
                //拡張子がCSVであるかの確認
                if ($request->csvFile->getClientOriginalExtension() !== "csv") {
                    // throw new Exception('このファイルはCSVファイルではありません');
                    return view('player.info_alignment', ["csvList" => "", "errorMsg" => "このファイルはCSVファイルではありません", "checkList" => ""]);
                }
                //ファイルの保存
                $newCsvFileName = $request->csvFile->getClientOriginalName();
                $request->csvFile->storeAs('public/csv', $newCsvFileName);
            } else {
                // throw new Exception('ファイルを取得できませんでした');
                return view('player.info_alignment', ["csvList" => "", "errorMsg" => "ファイルを取得できませんでした。<br/>入力したファイルパスを確認してください", "checkList" => ""]);
            }
            //保存したCSVファイルの取得
            $csv = Storage::disk('local')->get("public/csv/{$newCsvFileName}");
            // OS間やファイルで違う改行コードをexplode統一
            $csv = str_replace(array("\r\n", "\r"), "\n", $csv);
            // $csvを元に行単位のコレクション作成。explodeで改行ごとに分解
            $csvList = collect(explode("\n", $csv));
            $csvList = $csvList->toArray();

            $checkList = array();
            $dataList = "";
            $renkei = "";
            $eMessage = "";
            $tagName = 0;
            $disabled = "";
            $jaraIdList = array();
            $csvHeaderLine = "既存選手ID,新選手ID,メールアドレス,選手名";
            for ($i = 0; $i < count($csvList); $i++) {
                $value = explode(',', $csvList[$i]); //一行ごとのデータをカンマ区切りでリストに入れる
                if ((count($value) != 4) || ($csvList[$i] == $csvHeaderLine) || empty($value[0]) || in_array($value[0], $jaraIdList)) {
                    continue; //行のデータ個数が正しくない場合,各行がヘッダ行と一致する場合,既存選手IDがない場合,既存選手IDが重複リストに含まれている場合、以降の処理を行わない。
                }

                $playerData = DB::select('select * from t_players where jara_player_id = ? and delete_flag = ?', [$value[0], 0]);
                if (empty($playerData)) { //既存選手IDが登録されていない場合
                    if ($value[1] == "") { // ファイルの新選手IDにIDが設定されていない
                        if ($value[2] == "") { // ファイルのメールアドレスが設定されていない
                            $renkei = "連携待ち";
                            $eMessage = "連携待ちデータとして登録します。";
                            //9のパターン
                        } else { // ファイルのメールアドレスが設定されている
                            $playerData = DB::select('select * from t_users where mailaddress = ? and delete_flag = ?', [$value[2], 0]);
                            if (empty($playerData)) { //ユーザテーブルにデータなし
                                $renkei = "連携待ち";
                                $eMessage = "連携待ちデータとして登録します。";
                                //9のパターン
                            } else { // ユーザテーブルにデータあり
                                $playerData = DB::select('select * from t_players where user_id = ? and delete_flag = ?', [$playerData[0]->user_id, 0]);
                                if (empty($playerData)) { //選手テーブルに選手データなし
                                    $renkei = "連携待ち";
                                    $eMessage = "連携待ちデータとして登録します。";
                                    //9のパターン
                                } else { //選手テーブルに選手データあり
                                    if (empty($playerData[0]->user_id)) { // ユーザIDが登録されていない場合
                                        $renkei = "連携可能";
                                        $eMessage = "登録されている選手と連結できます。選手：[選手名]([選手ID])";
                                        //8のパターン

                                    } else { // ユーザIDが登録されている場合
                                        $renkei = "連携不可";
                                        $eMessage = "既にマッピングされている既存選手IDです。マッピングされてる選手:[選手名]([選手ID])";
                                        $disabled = "disabled";
                                        //7のパターン
                                    }
                                }
                            }
                        }
                    } else { //ファイルの新選手IDにIDが設定されている
                        $playerData = DB::select('select * from t_players where player_id = ? and delete_flag = ?', [$value[1], 0]);
                        if (empty($playerData)) { //新選手IDが登録されていない場合
                            $renkei = "連携不可";
                            $eMessage = "システムに登録されていない選手IDです。";
                            $disabled = "disabled";
                            //6のパターン
                        } else { // 新選手IDが登録されている場合
                            if (empty($playerData[0]->user_id)) { // ユーザIDが登録されていない場合
                                $renkei = "連携不可";
                                $eMessage = "使用できない選手IDです。";
                                $disabled = "disabled";
                                //5のパターン
                            } else { // ユーザIDが登録されている場合
                                if (empty($playerData[0]->jara_player_id)) { //既存選手IDが登録されていない場合
                                    $renkei = "連携可能";
                                    $eMessage = "登録されている選手と連結できます。選手：[選手名]([選手ID])。";
                                    //4のパターン
                                } else { // 既存選手IDが登録されている場合
                                    $renkei = "連携不可";
                                    $eMessage = "既にマッピングされている既存選手IDです。マッピングされてる選手:[選手名]([選手ID])。";
                                    $disabled = "disabled";
                                    //3のパターン
                                }
                            }
                        }
                    }
                } else { //既存選手IDが登録されている場合
                    $playerData[0]->user_id;
                    if (empty($playerData[0]->user_id)) { // ユーザIDが登録されていない場合
                        $renkei = "連携不可";
                        $eMessage = "既に連携待ちデータとして登録されています。";
                        $disabled = "disabled";
                        //２のパターン

                    } else { // ユーザIDが登録されている場合
                        $renkei = "連携不可";
                        $eMessage = "既にマッピングされている既存選手IDです。マッピングされてる選手:[選手名]([選手ID])。";
                        $disabled = "disabled";
                        //１のパターン
                    }
                }
                array_push($checkList, 0); //連携状態チェック用リストに初期値を追加
                array_push($jaraIdList, $value[0]); //重複チェック用リストに既存選手IDを追加
                $tagData1 = "<tr><td nowrap><input " . $disabled . " class=\"checkval\" type=\"checkbox\" name=\"" . $tagName . "\" onchange=\"checkChange(event)\"></td><td nowrap class=\"renkei\">" . $renkei;
                $tagData2 = "</td><td nowrap>" . $value[1] . "</td><td nowrap>" . $value[0] . "</td><td nowrap>" . $value[3] . "</td><td nowrap>" . $value[2] . "</td><td nowrap>" . $eMessage . "</td></tr>";
                $dataList .= $tagData1 . $tagData2;
                $disabled = "";
                $tagName++;
            }

            return view('player.info_alignment', ["csvList" => $dataList, "errorMsg" => "", "checkList" => $checkList]);
        } elseif ($request->has('dbUpload')) { // 連携ボタンクリック
            $csvData = explode("</td><td nowrap>",  Session::get('csvList'));
            $result = explode(',', $request->Flag01);
            //dd($csvData);
            for ($i = 0; $i < count($result); $i++) {
                if ($result[$i] == "1") {
                    //連携待ち
                    $playersInfo = collect([
                        'playerId'  => $csvData[(1 + $i * 5)],
                        'jaraPlayerId' => $csvData[(2 + $i * 5)],
                    ]);
                    $log = $tPlayersData->insertPlayers($playersInfo);
                } else if ($result[$i] == "2") {
                    //連携可能
                    $playersInfo = collect([
                        'playerId'  => $csvData[(1 + $i * 5)],
                        'jaraPlayerId' => $csvData[(2 + $i * 5)],
                    ]);
                    $tPlayersData->updatePlayers($playersInfo);
                } else {
                    continue;
                }
            }
            //dd($playersInfo);

            return view('player.info_alignment', ["csvList" => "", "errorMsg" => $log, "checkList" => ""]);
        } else {
            return view('player.info_alignment', ["csvList" => "", "errorMsg" => "", "checkList" => ""]);
        }
    }

    //大会レース結果参照画面に表示する用 20240216
    public function sendCsvData(Request $request,T_players $t_players,T_users $t_users)
    {
        Log::debug(sprintf("sendCsvData start"));
        $reqData = $request->all();
        Log::debug($reqData);
        //1行ずつ処理する
        foreach($reqData as $rowData)
        {
            $checked = $rowData["checked"]; //チェック状態
            $link = $rowData["link"];       //リンク
            //連携対象か判定
            if($checked == true && $link == "連携")
            {
                //既存選手IDが登録されていないことを確認
                $registered_player = $t_players->checkJARAPlayerId($rowData["oldPlayerId"]);
                if(empty($registered_player)) //既存選手IDが登録されていない場合
                {
                    $player_id = $rowData["playerId"];  //新選手ID                    
                    if(isset($player_id))               //ファイルの新選手IDにIDが設定されている
                    {
                        $player_data = $t_players->getPlayer($player_id);
                        if(empty($player_data))     //選手テーブルに選手データなし
                        {
                            $rowData["link"] = "連携待ち";
                            $rowData["message"] = "連携待ちデータとして登録します。";
                            $rowData["checked"] = true;
                        }
                        else    //ユーザーIDが登録されている場合
                        {
                            $rowData["link"] = "連携不可";
                            $rowData["message"] = "既にマッピングされている既存選手IDです。マッピングされてる選手:[".$player_data[0]->player_name."]([".$player_data[0]->player_id."])";
                            $rowData["checked"] = false;
                        }
                    }
                    else    //ファイルの新選手IDにIDが設定されていない
                    {
                        $mailaddress = $rowData["mailaddress"]; //メールアドレス
                        if(isset($mailaddress))                 //ファイルのメールアドレスが設定されている
                        {
                            $user_data = $t_users->getUserDataFromMailAddress($mailaddress);
                            if(empty($user_data))   //ユーザーテーブルにデータなし
                            {
                                $rowData["link"] = "連携待ち";
                                $rowData["message"] = "連携待ちデータとして登録します。";
                                $rowData["checked"] = true;
                            }
                            else    //ユーザーテーブルにデータあり
                            {
                                $player_data = $t_players->getPlayer($user_data[0]->user_id);
                                if(empty($player_data)) //選手テーブルに選手データなし
                                {
                                    $rowData["link"] = "連携待ち";
                                    $rowData["message"] = "連携待ちデータとして登録します。";
                                    $rowData["checked"] = true;
                                }
                                else                    //選手テーブルに選手データあり
                                {
                                    if(empty($player_data[0]->user_id)) //ユーザーIDが登録されていない場合
                                    {
                                        $rowData["link"] = "連携可能";
                                        $rowData["message"] = "登録されている選手と連結できます。選手：[".$player_data[0]->player_name."]([".$player_data[0]->player_id."])";
                                        $rowData["checked"] = true;
                                    }
                                    else    //ユーザーIDが登録されている場合
                                    {
                                        $renkei = "連携不可";
                                        $eMessage = "既にマッピングされている既存選手IDです。マッピングされてる選手:[選手名]([選手ID])";
                                        $disabled = "disabled";

                                        $rowData["link"] = "連携不可";
                                        $rowData["message"] = "既にマッピングされている既存選手IDです。マッピングされてる選手:[".$player_data[0]->player_name."]([".$player_data[0]->player_id."])";
                                        $rowData["checked"] = false;
                                    }
                                }
                            }
                        }
                        else
                        {
                            //ファイルのメールアドレスが設定されていない
                            $rowData["link"] = "連携待ち";
                            $rowData["message"] = "連携待ちデータとして登録します。";
                            $rowData["checked"] = true;
                        }
                    }
                }
                else //既存選手IDが登録されている場合
                {
                    $registered_player_user_id = $registered_player[0]->user_id;
                    if(empty($registered_player_user_id))   //ユーザーIDが登録されていない場合
                    {
                        $rowData["link"] = "連携不可";
                        $rowData["message"] = "既に連携待ちデータとして登録されています。";
                        $rowData["checked"] = false;
                    }
                    else    //ユーザーIDが登録されている場合
                    {
                        $rowData["link"] = "連携不可";
                        $rowData["message"] = "既にマッピングされている既存選手IDです。マッピングされてる選手:[".$registered_player[0]->player_name."]([".$registered_player[0]->player_id."])。";
                        $rowData["checked"] = false;
                    }
                }
            }
            else
            {
                continue;
            }
        }

        Log::debug(sprintf("sendCsvData end"));
        return response()->json(['result' => $reqData]); //DBの結果を返す
    }
}
