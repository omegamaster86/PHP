<?php

namespace App\Http\Controllers;

use App\Models\T_organization_players;
use App\Models\T_organizations;
use App\Models\T_players;
use App\Models\T_users;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;
use App\Mail\ForRegisteredPlayerOrganizationRegistrationNotificationMail;
use App\Mail\ForUnregisteredPlayerOrganizationRegistrationNotificationMail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class OrganizationPlayersController extends Controller
{
    // 団体に所属する選手を取得する。
    public function getOrgPlayers(Request $request, T_organization_players $t_organization_players)
    {
        Log::debug(sprintf("getOrgPlayers start"));
        $req = $request->only(['org_id']);
        $orgId = $req['org_id'];
        $players = $t_organization_players->getOrgPlayers($orgId);
        for ($i = 0; $i < count($players); $i++) {
            $side_info = array();
            if ($players[$i]->side_S == 1) {
                array_push($side_info, 1);
            } else {
                array_push($side_info, 0);
            }
            if ($players[$i]->side_B == 1) {
                array_push($side_info, 1);
            } else {
                array_push($side_info, 0);
            }
            if ($players[$i]->side_X == 1) {
                array_push($side_info, 1);
            } else {
                array_push($side_info, 0);
            }
            if ($players[$i]->side_C == 1) {
                array_push($side_info, 1);
            } else {
                array_push($side_info, 0);
            }
            $players[$i]->side_info = $side_info;
            $players[$i]->id = ($i + 1);
        }

        Log::debug(sprintf("getOrgPlayers end"));
        return response()->json(['result' => $players]); //DBの結果を返す
    }

    // 団体所属選手の更新処理 20240226
    public function updateOrgPlayerData(Request $request, T_organization_players $t_organization_players)
    {
        Log::debug(sprintf("updateOrgPlayerData start"));
        $reqData = $request->all();
        $formData = $reqData['formData'];
        $target_org_id = $reqData['target_org_id'];
        DB::beginTransaction();
        try {
            foreach ($formData as $player) {
                $player_type = $player['type'];
                $player_delete_flag = $player['deleteFlag'];
                //既存、かつ削除にチェックが入っている場合
                if ($player_type == "既存" && $player_delete_flag == 1) {
                    $t_organization_players->updateDeleteFlagOrganizationPlayers($player["org_id"], $player["player_id"]);
                }
                //追加の場合
                //追加の場合deleteFlagが空
                elseif ($player_type == "追加") {
                    $target_player_id = $player['player_id'];
                    $check_count = $t_organization_players->checkOrganizationPlayerIsExists($target_org_id, $target_player_id);
                    if ($check_count[0]->count == 0) {
                        $t_organization_players->insertOrganizationPlayer($player, $target_org_id);
                    }
                }
            }
            DB::commit();
            Log::debug(sprintf("updateOrgPlayerData end"));
            return response()->json(['result' => $reqData]);
        } catch (\Throwable $e) {
            Log::error($e);
            DB::rollBack();
            abort(500, $e->getMessage());
        }
    }

    // 団体に登録する選手検索 20240226
    public function teamPlayerSearch(Request $request, T_organization_players $t_organization_players)
    {
        Log::debug(sprintf("teamPlayerSearch start"));
        $searchInfo = $request->all();
        $searchValue = [];
        $searchCondition = $this->generatePlayersSearchCondition($searchInfo, $searchValue);
        $players = $t_organization_players->getOrgPlayersForAddPlayerSearch($searchCondition, $searchValue);
        for ($i = 0; $i < count($players); $i++) {
            $side_info = array();
            if ($players[$i]->side_S == 1) {
                array_push($side_info, 1);
            } else {
                array_push($side_info, 0);
            }
            if ($players[$i]->side_B == 1) {
                array_push($side_info, 1);
            } else {
                array_push($side_info, 0);
            }
            if ($players[$i]->side_X == 1) {
                array_push($side_info, 1);
            } else {
                array_push($side_info, 0);
            }
            if ($players[$i]->side_C == 1) {
                array_push($side_info, 1);
            } else {
                array_push($side_info, 0);
            }
            $players[$i]->side_info = $side_info;
            $players[$i]->id = ($i + 1);
        }
        Log::debug(sprintf("teamPlayerSearch end"));
        return response()->json(['result' => $players]);
    }

    //団体一括 読み込むボタン押下 20240420
    public function sendOrgCsvData(
        Request $request,
        T_organizations $t_organizations,
        T_players $t_players,
        T_users $t_users,
        T_organization_players $t_organization_players
    ) {
        Log::debug(sprintf("sendOrgCsvData start"));
        $inputData = $request->all();
        $reqData = $inputData["csvDataList"];
        $input_org_id = $inputData["targetOrgData"]["targetOrgId"];
        $userId = Auth::user()->user_id;
        for ($rowIndex = 0; $rowIndex < count($reqData); $rowIndex++) {
            //フロントからの送信データ
            $jara_player_code = $reqData[$rowIndex]["jaraPlayerId"];
            $player_id = $reqData[$rowIndex]["playerId"];
            $user_id = $reqData[$rowIndex]["userId"];
            $mail_address = $reqData[$rowIndex]["mailaddress"];
            $player_name = $reqData[$rowIndex]["playerName"];

            //フロント側のバリデーション結果が「無効データ」だった場合、判定処理は行わない 20240419
            if ($reqData[$rowIndex]['result'] != '登録可能') {
                continue;
            }

            //取り込み可能かをチェックする
            //入力組み合わせ１
            if (isset($user_id) && isset($player_id) && isset($jara_player_code)) {
                Log::debug("入力組み合わせ１");
                //ユーザーID、選手ID、JARA選手コードが全て入力されているとき
                //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
                //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
                $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                if (!in_array($user_id, array_column($user_data, 'user_id'))) {
                    $this->assignInvalidRowdata('無効データ（メールアドレス不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //選手データが登録されているか確認
                $player_data = $t_players->getPlayer($player_id);
                if (empty($player_data)) {
                    $this->assignInvalidRowdata('無効データ（未登録選手）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」とファイルに入力されている「ユーザーID」が一致するか確認
                if ($player_data[0]->{'user_id'} != $user_id) {
                    $this->assignInvalidRowdata('無効データ（ユーザーデータと選手データ不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「JARA選手コード」とファイルに入力されている「JARA選手コード」が一致するか確認
                if ($player_data[0]->{'jara_player_id'} != $jara_player_code) {
                    $this->assignInvalidRowdata('無効データ（JARA選手コード不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //所属情報テーブルを取得
                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
                //団体テーブルから団体名を取得
                $target_organization = $t_organizations->getOrganization($input_org_id, $userId);
                //選手テーブルから出身地と居住地を取得
                $player_data = $t_players->getPlayersFromPlayerId($player_id);
                //所属情報を取得できなかった場合
                if (empty($org_player_info)) {
                    //Log::debug("所属情報を取得できなかった場合");
                    $this->assignRowData(
                        $reqData[$rowIndex],
                        $reqData[$rowIndex]['result'],
                        $user_id,
                        $player_id,
                        $jara_player_code,
                        $player_name,
                        $mail_address,
                        null,
                        null,
                        $player_data[0],
                        $reqData[$rowIndex]['checked']
                    );
                }
                //取得情報が取得できた場合
                else {
                    $affiliation_org = $t_organizations->getOrganization($org_player_info[0]->org_id, $userId); //既に所属している団体の情報を取得 20240420
                    //Log::debug("所属情報を取得できた場合");
                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                    if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
                        //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在する場合");
                        //存在するとき
                        $this->assignRowData(
                            $reqData[$rowIndex],
                            "無効データ（重複選手）",
                            $user_id,
                            $player_id,
                            $jara_player_code,
                            $player_name,
                            $mail_address,
                            $input_org_id,
                            $target_organization->org_name,
                            $player_data[0],
                            false
                        );
                    }
                    //入力値が団体所属情報のorg_id列に存在しない
                    else {
                        //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在しない場合");
                        $this->assignRowData(
                            $reqData[$rowIndex],
                            $reqData[$rowIndex]['result'],
                            $user_id,
                            $player_id,
                            // $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0], $reqData[$rowIndex]['checked']);
                            $jara_player_code,
                            $player_name,
                            $mail_address,
                            $org_player_info[0]->org_id,
                            $affiliation_org->org_name,
                            $player_data[0],
                            $reqData[$rowIndex]['checked']
                        );
                    }
                }
            }
            //入力組み合わせ２
            elseif (isset($user_id) && isset($player_id) && !isset($jara_player_code)) {
                Log::debug("入力組み合わせ２");
                //ユーザーID、選手IDが全て入力されているとき
                //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
                //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
                $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                if (!in_array($user_id, array_column($user_data, 'user_id'))) {
                    $this->assignInvalidRowdata('無効データ（メールアドレス不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //選手データが登録されているか確認
                $player_data = $t_players->getPlayer($player_id);
                if (empty($player_data)) {
                    $this->assignInvalidRowdata('無効データ（未登録選手）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」とファイルに入力されている「ユーザーID」が一致するか確認
                if ($player_data[0]->{'user_id'} != $user_id) {
                    $this->assignInvalidRowdata('無効データ（ユーザーデータと選手データ不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //所属情報テーブルを取得
                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
                //団体テーブルから団体名を取得
                $target_organization = $t_organizations->getOrganization($input_org_id, $userId);
                //選手テーブルから出身地と居住地を取得
                $player_data = $t_players->getPlayersFromPlayerId($player_id);
                //所属情報を取得できなかった場合
                if (empty($org_player_info)) {
                    $this->assignRowData(
                        $reqData[$rowIndex],
                        $reqData[$rowIndex]['result'],
                        $user_id,
                        $player_id,
                        $player_data[0]->{'jara_player_id'},
                        $player_name,
                        $mail_address,
                        null,
                        null,
                        $player_data[0],
                        $reqData[$rowIndex]['checked']
                    );
                }
                //取得情報が取得できた場合
                else {
                    $affiliation_org = $t_organizations->getOrganization($org_player_info[0]->org_id, $userId); //既に所属している団体の情報を取得 20240420
                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                    if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
                        //存在するとき
                        $this->assignRowData(
                            $reqData[$rowIndex],
                            "無効データ（重複選手）",
                            $user_id,
                            $player_id,
                            $player_data[0]->{'jara_player_id'},
                            $player_name,
                            $mail_address,
                            $input_org_id,
                            $target_organization->org_name,
                            $player_data[0],
                            false
                        );
                    }
                    //入力値が団体所属情報のorg_id列に存在しない
                    else {
                        $this->assignRowData(
                            $reqData[$rowIndex],
                            $reqData[$rowIndex]['result'],
                            $user_id,
                            $player_id,
                            // $player_data[0]->{'jara_player_id'}, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0], $reqData[$rowIndex]['checked']);
                            $player_data[0]->{'jara_player_id'},
                            $player_name,
                            $mail_address,
                            $org_player_info[0]->org_id,
                            $affiliation_org->org_name,
                            $player_data[0],
                            $reqData[$rowIndex]['checked']
                        );
                    }
                }
            }
            //入力組み合わせ３
            elseif (isset($user_id) && !isset($player_id) && isset($jara_player_code)) {
                Log::debug("入力組み合わせ３");
                //ユーザーID、JARA選手コードが全て入力されているとき
                //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
                //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
                $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                if (!in_array($user_id, array_column($user_data, 'user_id'))) {
                    $this->assignInvalidRowdata('無効データ（メールアドレス不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //JARA選手コードで選手データが登録されているかを確認
                $player_data = $t_players->getPlayerFromJaraPlayerId($jara_player_code);
                if (empty($player_data)) {
                    $this->assignInvalidRowdata('無効データ（未登録JARA選手コード）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」とファイルに入力されている「ユーザーID」が一致するか確認
                if ($player_data[0]->{'user_id'} != $user_id) {
                    $this->assignInvalidRowdata('無効データ（ユーザーデータと選手データ不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //所属情報テーブルを取得
                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromJaraPlayerId($jara_player_code);
                //団体テーブルから団体名を取得
                $target_organization = $t_organizations->getOrganization($input_org_id, $userId);
                //所属情報を取得できなかった場合
                if (empty($org_player_info)) {
                    //Log::debug("所属情報を取得できなかった場合");
                    $this->assignRowData(
                        $reqData[$rowIndex],
                        $reqData[$rowIndex]['result'],
                        $user_id,
                        $player_data[0]->{'player_id'},
                        $jara_player_code,
                        $player_name,
                        $mail_address,
                        null,
                        null,
                        $player_data[0],
                        $reqData[$rowIndex]['checked']
                    );
                }
                //取得情報が取得できた場合
                else {
                    $affiliation_org = $t_organizations->getOrganization($org_player_info[0]->org_id, $userId); //既に所属している団体の情報を取得 20240420
                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                    if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
                        //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在する");
                        //存在するとき
                        $this->assignRowData(
                            $reqData[$rowIndex],
                            "無効データ（重複選手）",
                            $user_id,
                            $player_data[0]->{'player_id'},
                            $jara_player_code,
                            $player_name,
                            $mail_address,
                            $input_org_id,
                            $target_organization->org_name,
                            $player_data[0],
                            false
                        );
                    }
                    //入力値が団体所属情報のorg_id列に存在しない
                    else {
                        //Log::debug("入力値が団体所属情報のorg_id列に存在しない");
                        $this->assignRowData(
                            $reqData[$rowIndex],
                            $reqData[$rowIndex]['result'],
                            $user_id,
                            $player_data[0]->{'player_id'},
                            // $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0], $reqData[$rowIndex]['checked']);
                            $jara_player_code,
                            $player_name,
                            $mail_address,
                            $org_player_info[0]->org_id,
                            $affiliation_org->org_name,
                            $player_data[0],
                            $reqData[$rowIndex]['checked']
                        );
                    }
                }
            }
            //入力組み合わせ４
            elseif (isset($user_id) && !isset($player_id) && !isset($jara_player_code)) {
                Log::debug("入力組み合わせ４");
                //ユーザーIDだけが入力されているとき
                //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
                //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
                $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                $temp_password_flag = $user_data[0]->temp_password_flag;
                if ($temp_password_flag == 0) {
                    //Log::debug("本登録の場合");
                    //本登録の場合
                    //ファイルに入力されている「ユーザーID」で「選手テーブル」検索
                    $player_data = $t_players->getPlayerDataFromUserId($user_id);
                    if (empty($player_data)) {
                        //Log::debug("選手登録されていなかった場合");
                        //選手登録されていなかった場合
                        $reqData[$rowIndex]['result'] = "選手未登録のため選手登録後、所属選手登録を実施";
                        $reqData[$rowIndex]['userId'] = $user_id;
                        $reqData[$rowIndex]['playerName'] = $player_name;
                        $reqData[$rowIndex]['mailaddress'] = $mail_address;
                        $rowData['checked'] = false;
                    } else {
                        //Log::debug("選手登録されている場合");
                        //選手登録されている場合
                        //所属情報テーブルを取得
                        $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_data->player_id);
                        //団体テーブルから団体名を取得
                        $target_organization = $t_organizations->getOrganization($input_org_id, $userId); //重複する団体の検索用 20240420
                        if (empty($org_player_info)) {
                            //Log::debug("所属情報を取得できなかった場合");
                            $this->assignRowData(
                                $reqData[$rowIndex],
                                $reqData[$rowIndex]['result'],
                                $user_id,
                                $player_id,
                                $jara_player_code,
                                $player_name,
                                $mail_address,
                                null,
                                null,
                                $player_data,
                                $reqData[$rowIndex]['checked']
                            );
                        } else {
                            $affiliation_org = $t_organizations->getOrganization($org_player_info[0]->org_id, $userId); //既に所属している団体の情報を取得 20240420
                            //Log::debug("所属情報を取得できた場合");
                            //団体テーブルから団体名を取得
                            // $org_player_org_id = $org_player_info[0]->{'org_id'};
                            // $target_organization = $t_organizations->getOrganization($org_player_org_id);
                            //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                            if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
                                //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在する場合");
                                //存在するとき
                                $this->assignRowData(
                                    $reqData[$rowIndex],
                                    "無効データ（重複選手）",
                                    $user_id,
                                    $player_id,
                                    $jara_player_code,
                                    $player_name,
                                    $mail_address,
                                    $input_org_id,
                                    $target_organization->org_name,
                                    $player_data,
                                    false
                                );
                            } else {
                                //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在しない場合");
                                //入力値が団体所属情報のorg_id列に存在しない
                                $this->assignRowData(
                                    $reqData[$rowIndex],
                                    $reqData[$rowIndex]['result'],
                                    $user_id,
                                    null,
                                    // null, $player_name, $mail_address, $org_player_org_id, $target_organization->org_name, $player_data, $reqData[$rowIndex]['checked']);
                                    null,
                                    $player_name,
                                    $mail_address,
                                    $org_player_info[0]->org_id,
                                    $affiliation_org->org_name,
                                    $player_data,
                                    $reqData[$rowIndex]['checked']
                                );
                            }
                        }
                    }
                } elseif ($temp_password_flag == 1) {
                    Log::debug("仮登録の場合");
                    //仮登録の場合
                    $reqData[$rowIndex]['result'] = "無効データ（仮登録ユーザー）";
                    $reqData[$rowIndex]['userId'] = $user_id;
                    $reqData[$rowIndex]['playerName'] = $player_name;
                    $reqData[$rowIndex]['mailaddress'] = $mail_address;
                    $reqData[$rowIndex]['checked'] = false;
                    $rowData['checked'] = false;
                }
            }
            //入力組み合わせ５
            elseif (!isset($user_id) && isset($player_id) && isset($jara_player_code)) {
                Log::debug("入力組み合わせ５");
                //選手ID、JARA選手コードが全て入力されているとき
                //選手データが登録されているか確認
                $player_data = $t_players->getPlayer($player_id);
                if (empty($player_data)) {
                    $this->assignInvalidRowdata('無効データ（未登録選手）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」に値が設定されているか確認
                if (empty($player_data[0]->{'user_id'})) {
                    $this->assignInvalidRowdata('無効データ（無効選手）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」と紐づく「ユーザーテーブル」.「メールアドレス」と
                //ファイルに入力されている「メールアドレス」が一致するか確認
                $user_data = $t_users->getUserDataFromUserId($player_data[0]->{'user_id'});
                if (!in_array($mail_address, array_column($user_data, 'mailaddress'))) {
                    $this->assignInvalidRowdata('無効データ（メールアドレス不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「JARA選手コード」とファイルに入力されている「JARA選手コード」が一致するか確認
                if ($player_data[0]->{'jara_player_id'} != $jara_player_code) {
                    $this->assignInvalidRowdata('無効データ（JARA選手コード不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //所属情報テーブルを取得
                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
                //団体テーブルから団体名を取得
                $target_organization = $t_organizations->getOrganization($input_org_id, $userId);
                //選手テーブルから出身地と居住地を取得
                $player_data = $t_players->getPlayersFromPlayerId($player_id);
                //所属情報を取得できなかった場合
                if (empty($org_player_info)) {
                    //Log::debug("所属情報を取得できなかった場合");
                    $this->assignRowData(
                        $reqData[$rowIndex],
                        $reqData[$rowIndex]['result'],
                        $user_id,
                        $player_id,
                        $jara_player_code,
                        $player_name,
                        $mail_address,
                        null,
                        null,
                        $player_data[0],
                        $reqData[$rowIndex]['checked']
                    );
                }
                //取得情報が取得できた場合
                else {
                    $affiliation_org = $t_organizations->getOrganization($org_player_info[0]->org_id, $userId); //既に所属している団体の情報を取得 20240420
                    //Log::debug("所属情報を取得できた場合");
                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                    if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
                        //存在するとき
                        //Log::debug("入力値が団体所属情報のorg_id列に存在する");
                        $this->assignRowData(
                            $reqData[$rowIndex],
                            "無効データ（重複選手）",
                            $user_id,
                            $player_id,
                            $jara_player_code,
                            $player_name,
                            $mail_address,
                            $input_org_id,
                            $target_organization->org_name,
                            $player_data[0],
                            false
                        );
                    }
                    //入力値が団体所属情報のorg_id列に存在しない
                    else {
                        //Log::debug("入力値が団体所属情報のorg_id列に存在しない");
                        $this->assignRowData(
                            $reqData[$rowIndex],
                            $reqData[$rowIndex]['result'],
                            $user_id,
                            $player_id,
                            // $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0], $reqData[$rowIndex]['checked']);
                            $jara_player_code,
                            $player_name,
                            $mail_address,
                            $org_player_info[0]->org_id,
                            $affiliation_org->org_name,
                            $player_data[0],
                            $reqData[$rowIndex]['checked']
                        );
                    }
                }
            }
            //入力組み合わせ６
            elseif (!isset($user_id) && isset($player_id) && !isset($jara_player_code)) {
                Log::debug("入力組み合わせ６");
                //選手IDだけが入力されているとき
                //選手データが登録されているか確認
                $player_data = $t_players->getPlayer($player_id);
                if (empty($player_data)) {
                    $this->assignInvalidRowdata('無効データ（未登録選手）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」に値が設定されているか確認
                if (empty($player_data[0]->{'user_id'})) {
                    $this->assignInvalidRowdata('無効データ（無効選手）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」と紐づく「ユーザーテーブル」.「メールアドレス」と
                //ファイルに入力されている「メールアドレス」が一致するか確認
                $user_data = $t_users->getUserDataFromUserId($player_data[0]->{'user_id'});
                if (!in_array($mail_address, array_column($user_data, 'mailaddress'))) {
                    $this->assignInvalidRowdata('無効データ（メールアドレス不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //所属情報テーブルを取得
                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
                //団体テーブルから団体名を取得
                $target_organization = $t_organizations->getOrganization($input_org_id, $userId);
                //選手テーブルから出身地と居住地を取得
                $player_data = $t_players->getPlayersFromPlayerId($player_id);
                //所属情報を取得できなかった場合
                if (empty($org_player_info)) {
                    //Log::debug("所属情報を取得できなかった場合");
                    $this->assignRowData(
                        $reqData[$rowIndex],
                        $reqData[$rowIndex]['result'],
                        $user_id,
                        $player_id,
                        $jara_player_code,
                        $player_name,
                        $mail_address,
                        null,
                        null,
                        $player_data[0],
                        $reqData[$rowIndex]['checked']
                    );
                }
                //取得情報が取得できた場合
                else {
                    $affiliation_org = $t_organizations->getOrganization($org_player_info[0]->org_id, $userId); //既に所属している団体の情報を取得 20240420
                    //Log::debug("所属情報を取得できた場合");
                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                    if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
                        //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在する場合");
                        //存在するとき
                        $this->assignRowData(
                            $reqData[$rowIndex],
                            "無効データ（重複選手）",
                            $user_id,
                            $player_id,
                            $jara_player_code,
                            $player_name,
                            $mail_address,
                            $input_org_id,
                            $target_organization->org_name,
                            $player_data[0],
                            false
                        );
                    }
                    //入力値が団体所属情報のorg_id列に存在しない
                    else {
                        //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在しない場合");
                        $this->assignRowData(
                            $reqData[$rowIndex],
                            $reqData[$rowIndex]['result'],
                            $user_id,
                            $player_id,
                            // $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0], $reqData[$rowIndex]['checked']);
                            $jara_player_code,
                            $player_name,
                            $mail_address,
                            $org_player_info[0]->org_id,
                            $affiliation_org->org_name,
                            $player_data[0],
                            $reqData[$rowIndex]['checked']
                        );
                    }
                }
            }
            //入力組み合わせ７
            elseif (!isset($user_id) && !isset($player_id) && isset($jara_player_code)) {
                Log::debug("入力組み合わせ７");
                //JARA選手コードだけが入力されているとき
                $player_data = $t_players->getPlayerFromJaraPlayerId($jara_player_code);
                if (empty($player_data)) {
                    $this->assignInvalidRowdata('無効データ（未登録JARA選手コード）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」に値が設定されているか確認
                if (empty($player_data[0]->{'user_id'})) {
                    $this->assignInvalidRowdata('無効データ（連携待ちJARA選手コード）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」と紐づく「ユーザーテーブル」.「メールアドレス」と
                //ファイルに入力されている「メールアドレス」が一致するか確認
                $user_data = $t_users->getUserData($player_data[0]->{'user_id'});
                if ($user_data->mailaddress != $mail_address) {
                    $this->assignInvalidRowdata('無効データ（メールアドレス不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //所属情報テーブルを取得
                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_data[0]->{'player_id'});
                //団体テーブルから団体名を取得
                $target_organization = $t_organizations->getOrganization($input_org_id, $userId);
                //選手テーブルから出身地と居住地を取得
                $player_data = $t_players->getPlayersFromPlayerId($player_data[0]->{'player_id'});
                //所属情報を取得できなかった場合
                if (empty($org_player_info)) {
                    //Log::debug("所属情報を取得できなかった場合");
                    $this->assignRowData(
                        $reqData[$rowIndex],
                        $reqData[$rowIndex]['result'],
                        $user_id,
                        $player_data[0]->{'player_id'},
                        $jara_player_code,
                        $player_name,
                        $mail_address,
                        null,
                        null,
                        $player_data[0],
                        $reqData[$rowIndex]['checked']
                    );
                }
                //取得情報が取得できた場合
                else {
                    $affiliation_org = $t_organizations->getOrganization($org_player_info[0]->org_id, $userId); //既に所属している団体の情報を取得 20240420
                    //Log::debug("所属情報を取得できた場合");
                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                    if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
                        //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在する場合");
                        //存在するとき
                        $this->assignRowData(
                            $reqData[$rowIndex],
                            "無効データ（重複選手）",
                            $user_id,
                            $player_data[0]->{'player_id'},
                            $jara_player_code,
                            $player_name,
                            $mail_address,
                            $input_org_id,
                            $target_organization->org_name,
                            $player_data[0],
                            false
                        );
                    }
                    //入力値が団体所属情報のorg_id列に存在しない
                    else {
                        //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在しない場合");
                        $this->assignRowData(
                            $reqData[$rowIndex],
                            $reqData[$rowIndex]['result'],
                            $user_id,
                            $player_data[0]->{'player_id'},
                            // $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0], $reqData[$rowIndex]['checked']);
                            $jara_player_code,
                            $player_name,
                            $mail_address,
                            $org_player_info[0]->org_id,
                            $affiliation_org->org_name,
                            $player_data[0],
                            $reqData[$rowIndex]['checked']
                        );
                    }
                }
            }
            //入力組み合わせ８
            else {
                Log::debug("入力組み合わせ８");
                //ユーザーID、選手ID、JARA選手コードのいずれも入力されていないとき                        
                //ファイルに記載されている「メールアドレス」で、「ユーザーテーブル」を検索
                $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                if (empty($user_data)) {
                    //Log::debug("ユーザー情報が登録されていない場合");
                    //フロント側のバリデーション結果が「登録可能」でユーザー情報が登録されていない場合、ユーザ未登録データとしてマッピング出来るようにする 20240419
                    if ($reqData[$rowIndex]['result'] == '登録可能') {
                        $reqData[$rowIndex]['result'] = "ユーザー未登録";
                        $reqData[$rowIndex]['playerName'] = $player_name;
                        $reqData[$rowIndex]['mailaddress'] = $mail_address;
                        $reqData[$rowIndex]['checked'] = false;
                    }
                } else {
                    //Log::debug("ユーザー情報が登録されていた場合");
                    //ユーザー情報が登録されていた場合
                    $temp_password_flag = $user_data[0]->{'temp_password_flag'};
                    if ($temp_password_flag == 0) {
                        //Log::debug("本登録の場合");
                        //本登録の場合
                        //ファイルに入力されている「ユーザーID」で「選手テーブル」検索
                        //$player_data = $t_players->getPlayerData($user_data[0]->{'user_id'});
                        $player_data = $t_players->getPlayerDataFromUserId($user_data[0]->{'user_id'});
                        if (empty($player_data)) {
                            //Log::debug("選手登録されていなかった場合");
                            //選手登録されていなかった場合
                            $reqData[$rowIndex]['result'] = "選手未登録のため選手登録後、所属選手登録を実施";
                            $reqData[$rowIndex]['userId'] = $user_id;
                            $reqData[$rowIndex]['playerName'] = $player_name;
                            $reqData[$rowIndex]['mailaddress'] = $mail_address;
                            $reqData[$rowIndex]['checked'] = false;
                        } else {
                            //Log::debug("選手登録されている場合");
                            //選手登録されている場合
                            //所属情報テーブルを取得
                            $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_data->player_id);
                            //団体テーブルから団体名を取得
                            $target_organization = $t_organizations->getOrganization($input_org_id, $userId);
                            if (empty($org_player_info)) {
                                //所属情報が取得できなかった場合                                
                                //Log::debug("所属情報を取得できなかった場合");
                                $this->assignRowData(
                                    $reqData[$rowIndex],
                                    $reqData[$rowIndex]['result'],
                                    $user_data[0]->{'user_id'},
                                    $player_data->player_id,
                                    $player_data->jara_player_id,
                                    $player_data->player_name,
                                    $user_data[0]->{'mailaddress'},
                                    null,
                                    null,
                                    $player_data,
                                    $reqData[$rowIndex]['checked']
                                );
                            } else {
                                $affiliation_org = $t_organizations->getOrganization($org_player_info[0]->org_id, $userId); //既に所属している団体の情報を取得 20240420
                                //Log::debug("所属情報を取得できた場合");
                                //所属情報が取得できた場合
                                //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                                if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
                                    //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在する場合");
                                    //存在するとき
                                    $this->assignRowData(
                                        $reqData[$rowIndex],
                                        "無効データ（重複選手）",
                                        $user_data[0]->{'user_id'},
                                        $player_data->player_id,
                                        $player_data->jara_player_id,
                                        $player_data->player_name,
                                        $mail_address,
                                        $input_org_id,
                                        $target_organization->org_name,
                                        $player_data,
                                        false
                                    );
                                } else {
                                    //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在しない場合");
                                    //一致しなかった場合
                                    $this->assignRowData(
                                        $reqData[$rowIndex],
                                        $reqData[$rowIndex]['result'],
                                        $user_data[0]->{'user_id'},
                                        $player_data->player_id,
                                        // $player_data->jara_player_id, $player_data->player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data, $reqData[$rowIndex]['checked']);
                                        $player_data->jara_player_id,
                                        $player_data->player_name,
                                        $mail_address,
                                        $org_player_info[0]->org_id,
                                        $affiliation_org->org_name,
                                        $player_data,
                                        $reqData[$rowIndex]['checked']
                                    );
                                }
                            }
                        }
                    } elseif ($temp_password_flag == 1) {
                        //Log::debug("仮登録の場合");
                        //仮登録の場合
                        $reqData[$rowIndex]['result'] = "無効データ（仮登録ユーザー）";
                        $reqData[$rowIndex]['userId'] = $user_id;
                        $reqData[$rowIndex]['playerName'] = $player_name;
                        $reqData[$rowIndex]['mailaddress'] = $mail_address;
                        $reqData[$rowIndex]['checked'] = false;
                    }
                }
            }
        }
        Log::debug(sprintf("sendOrgCsvData end"));
        return response()->json(['result' => $reqData]); //DBの結果を返す
    }

    //団体一括 登録ボタン押下 20240301
    public function registerOrgCsvData(
        Request $request,
        T_users $t_users,
        T_players $t_players,
        T_organization_players $t_organization_players
    ) {
        Log::debug(sprintf("registerOrgCsvData start"));
        $inputData = $request->all();
        $reqData = $inputData["csvDataList"];
        $input_org_id = $inputData["targetOrgData"]["targetOrgId"];
        $input_org_name = $inputData["targetOrgData"]["targetOrgName"];

        //登録・更新するユーザー名を取得
        $register_user_id = Auth::user()->user_id;
        //登録・更新日時のために現在の日時を取得
        $current_datetime = now()->format('Y-m-d H:i:s.u');
        for ($rowIndex = 0; $rowIndex < count($reqData); $rowIndex++) {
            if (
                $reqData[$rowIndex]['checked'] == true &&
                (
                    $reqData[$rowIndex]['result'] == "登録可能"
                    || $reqData[$rowIndex]['result'] == "選手未登録のため選手登録後、所属選手登録を実施"
                )
            ) {
                DB::beginTransaction();
                //対象のユーザーデータを取得
                $target_player_name = $reqData[$rowIndex]['playerName'];
                $target_mailaddress = $reqData[$rowIndex]['mailaddress'];
                $target_user_data = $t_users->getUserDataFromInputCsv($target_mailaddress);
                // if(empty($target_user_data))
                // {
                //     //ユーザーが存在しない場合、ユーザーテーブルにinsertして仮登録のメール送信
                //     // For Generate random password
                //     $temp_password = Str::random(8);
                //     //For adding 1day with current time
                //     $converting_date = date_create($current_datetime);
                //     date_add($converting_date, date_interval_create_from_date_string("1 day"));
                //     $newDate = date_format($converting_date, "Y-m-d H:i:s.u");

                //     //ユーザー生成のためのデータを配列に格納
                //     $hashed_password = Hash::make($temp_password);
                //     $insert_user_value = [];
                //     $insert_user_value['user_name'] = $target_player_name;
                //     $insert_user_value['mailaddress'] = $target_mailaddress;
                //     $insert_user_value['password'] = $hashed_password;
                //     $insert_user_value['expiry_time_of_temp_password'] = $newDate;
                //     $insert_user_value['temp_password_flag'] = 1;
                //     $insert_user_value['registered_time'] = $current_datetime;
                //     $insert_user_value['registered_user_id'] = $register_user_id;
                //     $insert_user_value['updated_time'] = $current_datetime;
                //     $insert_user_value['updated_user_id'] = $register_user_id;

                //     try
                //     {
                //         //insert実行
                //         $t_users->insertTemporaryUser($insert_user_value);
                //     }
                //     catch(\Throwable $e)
                //     {
                //         DB::rollback();
                //         $error_message = "以下の選手のユーザー登録に失敗しました。選手名：".$target_player_name."　メールアドレス：".$target_mailaddress;
                //         Log::error('Line:' . $e->getLine() . ' message:' . $e->getMessage());
                //         return response()->json($error_message,403);
                //     }
                //     //登録したユーザー情報を取得
                //     $target_user_data = $t_users->getUserDataFromInputCsv($target_mailaddress);

                //     //メール送信
                //     //For getting current time
                //     $mail_date = date('Y/m/d H:i');
                //     //For adding 24hour with current time
                //     $new_mail_date = date('Y/m/d H:i', strtotime($mail_date . ' + 24 hours'));
                //     //Getting url information from env file.
                //     $frontend_url  = config ('env-data.frontend-url');                        
                //     //Store user information for sending email.
                //     $mail_data = [
                //         'user_name' => $target_user_data[0]->{'user_name'},
                //         'to_mailaddress' => $target_mailaddress,
                //         'from_mailaddress' => 'xxxxx@jara.or.jp',
                //         'temporary_password' => $temp_password,
                //         'temporary_password_expiration_date' => $new_mail_date,
                //         'login_url'=> $frontend_url.'/login'
                //     ];
                //     try {
                //         //Sending mail to the user
                //         Mail::to($target_mailaddress)->send(new WelcomeMail($mail_data));
                //     }
                //     catch (Exception $e) {
                //         DB::rollBack();
                //         $error_message = "以下の選手のメール送信に失敗しました。選手名：".$target_player_name."　メールアドレス：".$target_mailaddress;
                //         Log::error('Line:' . $e->getLine() . ' message:' . $e->getMessage());
                //         return response()->json($error_message,403);
                //     }
                // }
                //選手情報が存在しているかチェック
                //直近に挿入した選手のID
                $insert_player_id = 0;
                //選手情報を取得
                $target_player_data = $t_players->getPlayer($reqData[$rowIndex]['playerId']);
                //対象の選手が選手テーブルに存在するかをチェック
                if (empty($target_player_data)) {
                    //選手未登録の場合、選手テーブルにinsertして通知メールを送信
                    $insert_player_data = array();
                    $insert_player_data['user_id'] = $target_user_data[0]->{'user_id'};
                    $insert_player_data['jara_player_id'] = isset($reqData[$rowIndex]['jaraPlayerId']) ? $reqData[$rowIndex]['jaraPlayerId'] : null;
                    $insert_player_data['player_name'] = isset($target_player_name) ? $target_player_name : null;
                    $insert_player_data['date_of_birth'] = $target_user_data[0]->{'date_of_birth'};
                    $insert_player_data['sex_id'] = $target_user_data[0]->{'sex'};
                    $insert_player_data['height'] = $target_user_data[0]->{'height'};
                    $insert_player_data['weight'] = $target_user_data[0]->{'weight'};
                    $insert_player_data['side_info'] = "00000000";
                    $insert_player_data['birth_country'] = isset($reqData[$rowIndex]['birthCountryId']) ? $reqData[$rowIndex]['birthCountryId'] : null;
                    $insert_player_data['birth_prefecture'] = isset($reqData[$rowIndex]['birthPrefectureId']) ? $reqData[$rowIndex]['birthPrefectureId'] : null;
                    $insert_player_data['residence_country'] = isset($reqData[$rowIndex]['residenceCountryId']) ? $reqData[$rowIndex]['residenceCountryId'] : null;
                    $insert_player_data['residence_prefecture'] = isset($reqData[$rowIndex]['residencePrefectureId']) ? $reqData[$rowIndex]['residencePrefectureId'] : null;
                    $insert_player_data['current_datetime'] = $current_datetime;
                    $insert_player_data['update_user_id'] = $register_user_id;

                    //insertを実行して、insertしたレコードのIDを取得
                    try {
                        $insert_player_id = $t_players->insertPlayer($insert_player_data);
                    } catch (\Throwable $e) {
                        DB::rollback();
                        $error_message = "以下の選手の選手情報登録に失敗しました。選手名：" . $target_player_name . "　メールアドレス：" . $target_mailaddress;
                        Log::error($e);
                        abort(500, $error_message);
                    }
                }
                //団体所属選手テーブルに挿入
                $insert_organization_player_data = [];
                $insert_organization_player_data['org_id'] = $input_org_id;
                //選手IDは入力値になければ直近にinsertした選手IDを代入
                $insert_organization_player_data['player_id'] = isset($reqData[$rowIndex]['playerId']) ? $reqData[$rowIndex]['playerId'] : $insert_player_id;
                //insertを実行して、insertしたレコードのIDを取得
                try {
                    $insert_organization_player_id = $t_organization_players->insertOrganizationPlayer($insert_organization_player_data, $input_org_id);
                } catch (\Throwable $e) {
                    DB::rollback();
                    $error_message = "以下の選手の団体所属処理に失敗しました。選手名：" . $target_player_name . "　メールアドレス：" . $target_mailaddress;
                    Log::error($e);
                    abort(500, $error_message);
                }

                //ユーザー種別の更新処理
                $is_player = $target_user_data[0]->{'is_player'};
                if ($is_player == 0) {
                    $user_info = array();
                    $user_info['user_id'] = $target_user_data[0]->{'user_id'};
                    $user_info['input'] = '100';
                    // $user_type = (string)Auth::user()->user_type;
                    $user_type = $target_user_data[0]->{'user_type'}; //ログインしていないユーザの選手フラグを更新できるようにする 20240508
                    //右から3桁目が0のときだけユーザー種別を更新する
                    if (substr($user_type, -3, 1) == '0') {
                        try {
                            $t_users->updateUserTypeRegist($user_info);
                        } catch (\Throwable $e) {
                            DB::rollback();
                            $error_message = "以下の選手のユーザー種別の更新処理に失敗しました。選手名：" . $target_player_name . "　メールアドレス：" . $target_mailaddress;
                            Log::error($e);
                            abort(500, $error_message);
                        }
                    }
                }
                //メール送信
                $user_type = Auth::user()->user_type;
                if (substr($user_type, 1, 1) == '1') {
                    $manager_type = "システム";
                } elseif (substr($user_type, 4, 1) == '1') {
                    $manager_type = $input_org_name . "（" . $input_org_id . "）";
                }

                if (empty($target_player_data)) {
                    //Getting url information from env file.
                    $frontend_url  = config('env-data.frontend-url');

                    //Store player information for sending email.
                    $unregistered_player_mail_data = [
                        'to_mailaddress' => $target_user_data[0]->{'mailaddress'},  //[当該選手の「ユーザーテーブル」に登録されているメールアドレス]
                        'from_mailaddress' => 'xxxxx@jara.or.jp',
                        'organization_name' => $input_org_name,
                        'manager_type' => $manager_type,
                        'player_name' => $reqData[$rowIndex]['playerName'],
                        'inquiry_url' => $frontend_url . '/inquiry'
                    ];

                    try {
                        //Sending mail to the unregistered
                        Mail::to($target_user_data[0]->{'mailaddress'})->send(new ForUnregisteredPlayerOrganizationRegistrationNotificationMail($unregistered_player_mail_data));
                    } catch (Exception $e) {
                        Log::error($e);
                        DB::rollBack();
                        $error_message = "以下の選手のメール送信に失敗しました。選手名：" . $target_player_name . "　メールアドレス：" . $target_mailaddress;
                        abort(500, $error_message);
                    }
                } else {
                    $frontend_url = config('env-data.frontend-url'); //url情報の追加 20240422
                    //Store player information for sending email.
                    $registered_player_mail_data = [
                        'to_mailaddress' => $target_user_data[0]->{'mailaddress'},  //[当該選手の「ユーザーテーブル」に登録されているメールアドレス]
                        'from_mailaddress' => 'xxxxx@jara.or.jp',
                        'organization_name' => $input_org_name,
                        'manager_type' => $manager_type,
                        'player_name' => $reqData[$rowIndex]['playerName'],
                        'inquiry_url' => $frontend_url . '/inquiry'
                    ];

                    try {
                        //Sending mail to the unregistered
                        Mail::to($target_user_data[0]->{'mailaddress'})->send(new ForRegisteredPlayerOrganizationRegistrationNotificationMail($registered_player_mail_data));
                    } catch (Exception $e) {
                        Log::error($e);
                        DB::rollBack();
                        $error_message = "以下の選手のメール送信に失敗しました。選手名：" . $target_player_name . "　メールアドレス：" . $target_mailaddress;
                        abort(500, $error_message);
                    }
                }
                DB::commit();
            } elseif ($reqData[$rowIndex]['checked'] == true && $reqData[$rowIndex]['result'] == "ユーザー未登録") {
                DB::beginTransaction();
                //対象のユーザーデータを取得
                $target_player_name = $reqData[$rowIndex]['playerName'];
                $target_mailaddress = $reqData[$rowIndex]['mailaddress'];
                $target_user_data = $t_users->getUserDataFromInputCsv($target_mailaddress);

                //ユーザーが存在しない場合、ユーザーテーブルにinsertして仮登録のメール送信
                // For Generate random password
                $temp_password = Str::random(8);
                //For adding 1day with current time
                $converting_date = date_create($current_datetime);
                date_add($converting_date, date_interval_create_from_date_string("1 day"));
                $newDate = date_format($converting_date, "Y-m-d H:i:s.u");

                //ユーザー生成のためのデータを配列に格納
                $hashed_password = Hash::make($temp_password);
                $insert_user_value = [];
                $insert_user_value['user_name'] = $target_player_name;
                $insert_user_value['mailaddress'] = $target_mailaddress;
                $insert_user_value['password'] = $hashed_password;
                $insert_user_value['expiry_time_of_temp_password'] = $newDate;
                $insert_user_value['temp_password_flag'] = 1;
                $insert_user_value['registered_time'] = $current_datetime;
                $insert_user_value['registered_user_id'] = $register_user_id;
                $insert_user_value['updated_time'] = $current_datetime;
                $insert_user_value['updated_user_id'] = $register_user_id;

                try {
                    //insert実行
                    $t_users->insertTemporaryUser($insert_user_value);
                } catch (\Throwable $e) {
                    DB::rollback();
                    $error_message = "以下の選手のユーザー登録に失敗しました。選手名：" . $target_player_name . "　メールアドレス：" . $target_mailaddress;
                    Log::error($e);
                    abort(500, $error_message);
                }
                //登録したユーザー情報を取得
                $target_user_data = $t_users->getUserDataFromInputCsv($target_mailaddress);

                //メール送信
                //For getting current time
                $mail_date = date('Y/m/d H:i');
                //For adding 24hour with current time
                $new_mail_date = date('Y/m/d H:i', strtotime($mail_date . ' + 24 hours'));
                //Getting url information from env file.
                $frontend_url  = config('env-data.frontend-url');
                //Store user information for sending email.
                $mail_data = [
                    'user_name' => $target_user_data[0]->{'user_name'},
                    'to_mailaddress' => $target_mailaddress,
                    'from_mailaddress' => 'xxxxx@jara.or.jp',
                    'temporary_password' => $temp_password,
                    'temporary_password_expiration_date' => $new_mail_date,
                    'login_url' => $frontend_url . '/login'
                ];
                try {
                    //Sending mail to the user
                    Mail::to($target_mailaddress)->send(new WelcomeMail($mail_data));
                } catch (Exception $e) {
                    Log::error($e);
                    DB::rollBack();
                    $error_message = "以下の選手のメール送信に失敗しました。選手名：" . $target_player_name . "　メールアドレス：" . $target_mailaddress;
                    abort(500, $error_message);
                }
                DB::commit();
            }
        }
        Log::debug(sprintf("registerOrgCsvData end"));
        return response()->json(['result' => $reqData]); //DBの結果を返す
    }

    //団体に登録する選手検索画面用の条件を生成する 20240417
    private function generatePlayersSearchCondition($searchInfo, &$conditionValue)
    {
        $condition = "";
        //JARA選手コード
        if (isset($searchInfo['jaraPlayerId'])) {
            $condition .= "and tp.jara_player_id = :jara_player_id\r\n";
            $conditionValue['jara_player_id'] = $searchInfo['jaraPlayerId'];
        }
        //選手ID
        if (isset($searchInfo['playerId'])) {
            $condition .= "and tp.player_id = :player_id\r\n";
            $conditionValue['player_id'] = $searchInfo['playerId'];
        }
        //選手名
        if (isset($searchInfo['playerName'])) {
            $condition .= "and tp.player_name LIKE :player_name\r\n";
            $conditionValue['player_name'] = "%" . $searchInfo['playerName'] . "%";
        }
        //性別
        if (isset($searchInfo['sex'])) {
            $condition .= "and tp.sex_id = :sex\r\n";
            $conditionValue['sex'] = $searchInfo['sexId'];
        }
        //出身地（都道府県）
        if (isset($searchInfo['birthPrefectureId'])) {
            $condition .= "and tp.birth_prefecture =:birth_prefecture\r\n";
            $conditionValue['birth_prefecture'] = $searchInfo['birthPrefectureId'];
        }
        //居住地（都道府県）
        if (isset($searchInfo['residencePrefectureId'])) {
            $condition .= "and tp.residence_prefecture =:residence_prefecture\r\n";
            $conditionValue['residence_prefecture'] = $searchInfo['residencePrefectureId'];
        }
        if (isset($searchInfo['sideInfo'])) {
            $side_info_list = array();
            //S(ストロークサイド)
            if ($searchInfo['sideInfo']['S'] == true) {
                // $condition .= "and SUBSTRING(tp.`side_info`,8,1) = 1\r\n";
                array_push($side_info_list, "SUBSTRING(tp.`side_info`,8,1) = 1\r\n");
            }
            //B(バウサイド)
            if ($searchInfo['sideInfo']['B'] == true) {
                // $condition .= "and SUBSTRING(tp.`side_info`,7,1) = 1\r\n";
                array_push($side_info_list, "SUBSTRING(tp.`side_info`,7,1) = 1\r\n");
            }
            //X(スカルサイド)
            if ($searchInfo['sideInfo']['X'] == true) {
                // $condition .= "and SUBSTRING(tp.`side_info`,6,1) = 1\r\n";
                array_push($side_info_list, "SUBSTRING(tp.`side_info`,6,1) = 1\r\n");
            }
            //C(コックスサイド)
            if ($searchInfo['sideInfo']['C'] == true) {
                // $condition .= "and SUBSTRING(tp.`side_info`,5,1) = 1\r\n";
                array_push($side_info_list, "SUBSTRING(tp.`side_info`,5,1) = 1\r\n");
            }

            //サイド情報のいずれかにチェックがされている場合or条件で条件式を生成する 20240521
            if (count($side_info_list) > 0) {
                $condition .= "and (\r\n";
                for ($i = 0; $i < count($side_info_list); $i++) {
                    $condition .= $side_info_list[$i] . "\r\n";
                    if ($i != count($side_info_list) - 1) {
                        $condition .= "or "; //末尾のデータ以外はorを追加
                    }
                }
                $condition .= ")\r\n";
            }
        }
        //団体ID
        if (isset($searchInfo['orgId'])) {
            $condition .= "and top.org_id = :org_id\r\n";
            $conditionValue['org_id'] = $searchInfo['orgId'];
        } elseif (isset($searchInfo['org_id'])) {
            $condition .= "and top.org_id = :org_id\r\n";
            $conditionValue['org_id'] = $searchInfo['org_id'];
        }
        //エントリーシステムID
        if (isset($searchInfo['entrysystemOrgId'])) {
            $condition .= "and top.entrysystem_org_id =:entry_system_id\r\n";
            $conditionValue['entry_system_id'] = $searchInfo['entrysystemOrgId'];
        }
        //団体名
        if (isset($searchInfo['orgName'])) {
            $condition .= "and top.org_name LIKE :org_name\r\n";
            $conditionValue['org_name'] = "%" . $searchInfo['orgName'] . "%";
        }
        //出漕大会名
        if (isset($searchInfo['raceEventName'])) {
            $condition .= "and tr.tourn_name LIKE :tourn_name\r\n";
            $conditionValue['tourn_name'] = "%" . $searchInfo['raceEventName'] . "%";
        }
        //出漕履歴情報
        if (isset($searchInfo['eventId'])) {
            $condition .= "and tr.event_id = :event_id\r\n";
            $conditionValue['event_id'] = $searchInfo['eventId'];
        }
        return $condition;
    }

    //データのチェックで不備があったときの変数代入処理
    private function assignInvalidRowdata($error_description, &$rowData)
    {
        $rowData["result"] = $error_description;
        $rowData["checked"] = false;
    }

    //フロントエンドに返す１行データの配列に値を代入する
    private function assignRowData(&$rowData, $renkei, $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $org_id, $ord_name, $player_data, $checked)
    {
        Log::debug("assignRowData");
        $rowData['result'] = $renkei;
        $rowData['userId'] = $user_id;
        $rowData['playerId'] = $player_id;
        $rowData['jaraPlayerId'] = $jara_player_code;
        $rowData['playerName'] = $player_name;
        $rowData['mailaddress'] = $mail_address;
        $rowData['teamId'] = $org_id;
        $rowData['teamName'] = $ord_name;
        $rowData['birthCountryId'] = $player_data->birth_country;
        $rowData['birthPrefId'] = $player_data->birth_prefecture;
        $rowData['birthPlace'] =  $player_data->birthCountryName . $player_data->birthPrefectureName;
        $rowData['residenceCountryId'] = $player_data->residence_country;
        $rowData['residencePrefId'] = $player_data->residence_prefecture;
        $rowData['residence'] = $player_data->residenceCountryName . $player_data->residencePrefectureName;
        $rowData['checked'] = $checked;

        Log::debug("assignRowData End.");
    }
}
