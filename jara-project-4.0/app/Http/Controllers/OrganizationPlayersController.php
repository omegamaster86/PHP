<?php

namespace App\Http\Controllers;

use App\Models\M_events;
use App\Models\T_organization_players;
use App\Models\T_organizations;
use App\Models\T_players;
use App\Models\M_sex;
use App\Models\M_prefectures;
use App\Models\T_users;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class OrganizationPlayersController extends Controller
{
    //団体所属選手登録画面を開く
    public function createEdit(
        $targetOrgId,
        T_organizations $t_organizations,
        T_organization_players $t_organization_players
    ) {
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        } else {
            $organization = $t_organizations->getOrganization($targetOrgId);
            $org_name = $organization->org_name;
            $organization_players = $t_organization_players->getOrganizationPlayersInfo($targetOrgId);

            return view('organization-players.edit', ['org_name' => $org_name, 'org_players' => $organization_players]);
        }
    }

    //団体選手検索画面を開く
    public function createSearchView(
        $targetOrgId,
        T_organizations $t_organizations,
        M_sex $m_sex,
        M_prefectures $m_prefectures,
        M_events $m_events
    ) {
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        } else {
            $organization = $t_organizations->getOrganization($targetOrgId);
            $org_name = $organization->org_name;
            $sex = $m_sex->getSexList();
            $prefectures = $m_prefectures->getPrefecures();
            $events = $m_events->getEvents();

            return view('organization-players.search', [
                'org_name' => $org_name,
                'm_sex' => $sex,
                'prefectures' => $prefectures,
                'events' => $events
            ]);
        }
    }

    //団体所属追加選手検索画面で、選手を検索する
    public function searchOrganizationPlayers(Request $request, T_organization_players $t_organization_players)
    {
        $searchInfo = $request->all();
        $searchValue = [];
        $searchCondition = $this->generateOrganizationPlayersSearchCondition($searchInfo, $searchValue);
        $players = $t_organization_players->getOrganizationPlayersFromCondition($searchCondition, $searchValue);
        dd($players);
    }

    //団体所属選手を検索するための条件を生成する
    private function generateOrganizationPlayersSearchCondition($searchInfo, &$conditionValue)
    {
        $condition = "";
        //JARA選手コード
        if (isset($searchInfo['jara_player_id'])) {
            $condition .= "and tp.jara_player_id = :jara_player_id\r\n";
            $conditionValue['jara_player_id'] = $searchInfo['jara_player_id'];
        }
        //選手ID
        if (isset($searchInfo['player_id'])) {
            $condition .= "and tp.player_id = :player_id\r\n";
            $conditionValue['player_id'] = $searchInfo['player_id'];
        }
        //選手名
        if (isset($searchInfo['player_name'])) {
            $condition .= "and tp.player_name LIKE :player_name\r\n";
            $conditionValue['player_name'] = "%" . $searchInfo['player_name'] . "%";
        }
        //性別
        if (isset($searchInfo['sex'])) {
            $condition .= "and `m_sex`.`sex_id` = :sex\r\n";
            $conditionValue['sex'] = $searchInfo['sex'];
        }
        //出身地（都道府県）
        if (isset($searchInfo['birth_prefecture'])) {
            $condition .= "and bir_pref.pref_id =:birth_prefecture\r\n";
            $conditionValue['birth_prefecture'] = $searchInfo['birth_prefecture'];
        }
        //居住地（都道府県）
        if (isset($searchInfo['residence_prefecture'])) {
            $condition .= "and res_pref.pref_id =:residence_prefecture\r\n";
            $conditionValue['residence_prefecture'] = $searchInfo['residence_prefecture'];
        }
        //S(ストロークサイド)
        if (isset($searchInfo['side_S'])) {
            $condition .= "and SUBSTRING(tp.`side_info`,8,1) = 1\r\n";
        }
        //B(バウサイド)
        if (isset($searchInfo['side_B'])) {
            $condition .= "and SUBSTRING(tp.`side_info`,7,1) = 1\r\n";
        }
        //X(スカルサイド)
        if (isset($searchInfo['side_X'])) {
            $condition .= "and SUBSTRING(tp.`side_info`,6,1) = 1\r\n";
        }
        //C(コックスサイド)
        if (isset($searchInfo['side_C'])) {
            $condition .= "and SUBSTRING(tp.`side_info`,5,1) = 1\r\n";
        }
        //団体ID
        if (isset($searchInfo['org_id'])) {
            $condition .= "and org.org_id = :org_id\r\n";
            $conditionValue['org_id'] = $searchInfo['org_id'];
        }
        //エントリーシステムID
        if (isset($searchInfo['entry_system_id'])) {
            $condition .= "and org.entrysystem_org_id =:entry_system_id\r\n";
            $conditionValue['entry_system_id'] = $searchInfo['entry_system_id'];
        }
        //団体名
        if (isset($searchInfo['org_name'])) {
            $condition .= "and org.org_name LIKE :org_name\r\n";
            $conditionValue['org_name'] = "%" . $searchInfo['org_name'] . "%";
        }
        //出漕大会名
        if (isset($searchInfo['tourn_name'])) {
            $condition .= "and tour.tourn_name LIKE :tourn_name\r\n";
            $conditionValue['tourn_name'] = "%" . $searchInfo['tourn_name'] . "%";
        }
        //出漕履歴情報
        if (isset($searchInfo['event_id'])) {
            $condition .= "and trrr.event_id = :event_id\r\n";
            $conditionValue['event_id'] = $searchInfo['event_id'];
        }
        return $condition;
    }

    //団体所属選手一括登録画面を開く
    public function createOrganizationPlayerRegister(T_organizations $organizations)
    {
        $organization_name_list = $organizations->getOrganizationName();
        return view("organizations.player-register", ["dataList" => [], "errorMsg" => "", "checkList" => "", "organization_name_list" => $organization_name_list]);

        //user can visit this page if he/she is an admin
        // if (((Auth::user()->user_type & "01000000") === "01000000") or ((Auth::user()->user_type & "00100000") === "00100000") or ((Auth::user()->user_type & "00010000") === "00010000") or ((Auth::user()->user_type & "00001000") === "00001000")) {
        //     $tournament_name_list = $tourn->getTournamentName();
        //     return view("tournament.entry-register", ["dataList" => [], "errorMsg" => "", "checkList" => "", "tournament_name_list" => $tournament_name_list]);
        // }
        // //redirect to my-page those have no permission to access tournament-entry-register page
        // else {
        //     return redirect('my-page');
        // }
    }
    //団体所属選手一括登録画面で読み込みと登録を行う
    public function csvReadOrganizationPlayerRegister(
        Request $request,
        T_organizations $t_organizations,
        T_players $t_players,
        T_users $t_users,
        T_organization_players $t_organization_players
    ) {
        $organization_name_list = $t_organizations->getOrganizationName();
        if ($request->has('csvRead')) { // 読み込みボタンクリック
            // CSVファイルが存在するかの確認
            if ($request->hasFile('csvFile')) {
                //拡張子がCSVであるかの確認
                if ($request->csvFile->getClientOriginalExtension() !== "csv") {
                    // throw new Exception('このファイルはCSVファイルではありません');
                    return view('organizations.player-register', ["dataList" => [], "errorMsg" => "このファイルはCSVファイルではありません", "checkList" => "", "organization_name_list" => $organization_name_list]);
                }
                //ファイルの保存
                $newCsvFileName = $request->csvFile->getClientOriginalName();
                $request->csvFile->storeAs('public/csv', $newCsvFileName);
            } else {
                // throw new Exception('ファイルを取得できませんでした');
                return view('organizations.player-register', ["dataList" => [], "errorMsg" => "ファイルを取得できませんでした。<br/>入力したファイルパスを確認してください", "checkList" => "", "organization_name_list" => $organization_name_list]);
            }
            //保存したCSVファイルの取得
            $csv = Storage::disk('local')->get("public/csv/{$newCsvFileName}");
            // OS間やファイルで違う改行コードをexplode統一
            $csv = str_replace(array("\r\n", "\r"), "\n", $csv);
            // $csvを元に行単位のコレクション作成。explodeで改行ごとに分解
            $csvList = collect(explode("\n", $csv));
            $csvList = $csvList->toArray();
            $checkList = array();
            $dataList = array();    //フロントエンドに渡す多次元配列
            $renkei = "";       //読み込み結果
            #$tagName = 0;
            $disabled = "";
            #$jaraIdList = array();
            $csv_column_count = 5;
            $csvHeaderLine = "既存選手ID,新選手ID,ユーザーID,メールアドレス,選手名";

            //入力値の所属団体名のID
            $input_org_id = $request->input_org_id;

            //それぞれの項目の列番号
            $jara_player_code_col = 0;
            $player_id_col = 1;
            $user_id_col = 2;
            $mailaddress_col = 3;
            $player_name_col = 4;

            for ($rowIndex = 0; $rowIndex < count($csvList); $rowIndex++) {
                $rowArray = array();
                $value = explode(',', $csvList[$rowIndex]); //一行ごとのデータをカンマ区切りでリストに入れる
                //各フィールドの値
                //不正データの場合は全てNULLとするため初期値を"NULL"とする.
                $rowArray['jara_player_code'] = null;   //JARA選手コード
                $rowArray['player_id'] = null;          //選手ID
                $rowArray['user_id'] = null;            //ユーザーID
                $rowArray['mailaddress'] = null;        //メールアドレス
                $rowArray['player_name'] = null;        //選手名

                if (($rowIndex == 0 && $csvList[$rowIndex] == $csvHeaderLine) || empty($value[0]) /*|| in_array($value[0], $jaraIdList)*/) {
                    continue; //各行がヘッダ行と一致する場合,ユーザーIDがない場合,ユーザーIDが重複リストに含まれている場合、以降の処理を行わない。
                } elseif (count($value) != $csv_column_count) {
                    //行のデータ個数が正しくない場合
                    // $renkei = '無効データ';
                    // $disabled = "disabled";
                    $rowArray['renkei'] = '無効データ';
                    $rowArray['disabled'] = "disabled";
                } else {
                    $checkResult = true;
                    //対象行の各項目の値を変数に格納
                    $jara_player_code = $csvList[$rowIndex][$jara_player_code_col];
                    $player_id = $csvList[$rowIndex][$player_id_col];
                    $user_id = $csvList[$rowIndex][$user_id_col];
                    $mail_address = $csvList[$rowIndex][$mailaddress_col];
                    $player_name = $csvList[$rowIndex][$player_name_col];
                    //メールアドレスのチェック
                    //メールアドレスが設定されていることを確認
                    if (empty($mail_address)) {
                        //メールアドレスが設定されてなかったら
                        //読み込み結果を「無効データ（メールアドレス未設定）」にする
                        $this->assignInvalidData('無効データ（メールアドレス未設定）', $renkei, $disabled, $checkResult);
                        $rowArray['renkei'] = $renkei;
                        $rowArray['disabled'] = $disabled;
                    } else {
                        //メールアドレスのフォーマットとして適切であることを確認
                        if (!filter_var($mail_address, FILTER_VALIDATE_EMAIL)) {
                            $this->assignInvalidData('無効データ（メールアドレス不正）', $renkei, $disabled, $checkResult);
                            $rowArray['renkei'] = $renkei;
                            $rowArray['disabled'] = $disabled;
                        }
                    }
                    //選手名のチェック
                    //選手が設定されていることを確認
                    if ($checkResult) {
                        if (empty($player_name)) {
                            $this->assignInvalidData('無効データ（選手名未設定）', $renkei, $disabled, $checkResult);
                            $rowArray['renkei'] = $renkei;
                            $rowArray['disabled'] = $disabled;
                        } else {
                            //選手名のフォーマットとして適切であることを確認
                            if (mb_strlen($player_name) > 50) {
                                $this->assignInvalidData('無効データ（選手名不正）', $renkei, $disabled, $checkResult);
                                $rowArray['renkei'] = $renkei;
                                $rowArray['disabled'] = $disabled;
                            }
                        }
                    }
                    //取り込み可能かをチェックする
                    //入力組み合わせ①
                    if (isset($user_id) && isset($player_id) && isset($jara_player_code)) {
                        //ユーザーID、選手ID、JARA選手コードが全て入力されているとき
                        //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
                        //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
                        $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                        if (!in_array($user_id, array_column($user_data, 'user_id'))) {
                            $this->assignInvalidData('無効データ（メールアドレス不正）', $renkei, $disabled, $checkResult);
                            $rowArray['renkei'] = $renkei;
                            $rowArray['disabled'] = $disabled;
                        }
                        if ($checkResult) {
                            //選手データが登録されているか確認
                            $player_data = $t_players->getPlayer($player_id);
                            if (empty($player_data)) {
                                $this->assignInvalidData('無効データ（未登録選手）', $renkei, $disabled, $checkResult);
                                $rowArray['renkei'] = $renkei;
                                $rowArray['disabled'] = $disabled;
                            }
                            //「選手テーブル」.「ユーザーID」とファイルに入力されている「ユーザーID」が一致するか確認
                            if ($checkResult) {
                                if ($player_data['user_id'] != $user_id) {
                                    $this->assignInvalidData('無効データ（ユーザーデータと選手データ不一致）', $renkei, $disabled, $checkResult);
                                    $rowArray['renkei'] = $renkei;
                                    $rowArray['disabled'] = $disabled;
                                }
                            }
                            //「選手テーブル」.「JARA選手コード」とファイルに入力されている「JARA選手コード」が一致するか確認
                            if ($checkResult) {
                                if ($player_data['jara_player_code'] != $jara_player_code) {
                                    $this->assignInvalidData('無効データ（JARA選手コード不一致）', $renkei, $disabled, $checkResult);
                                    $rowArray['renkei'] = $renkei;
                                    $rowArray['disabled'] = $disabled;
                                }
                            }
                            if ($checkResult) {
                                //所属情報テーブルを取得
                                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
                                //団体テーブルから団体名を取得
                                $target_organization = $t_organizations->getOrganization($input_org_id);
                                //選手テーブルから出身地と居住地を取得
                                $player_data = $t_players->getPlayersFromPlayerId($player_id);
                                //所属情報を取得できなかった場合
                                if (empty($org_player_info)) {
                                    $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, null, null, $player_data);
                                }
                                //取得情報が取得できた場合
                                else {
                                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                                    if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
                                        //存在するとき
                                        $this->assignRowArray($rowArray, "無効データ（重複選手）", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
                                    }
                                    //入力値が団体所属情報のorg_id列に存在しない
                                    else {
                                        $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
                                    }
                                }
                            }
                        }
                    }
                    //入力組み合わせ②
                    elseif (isset($user_id) && isset($player_id) && !isset($jara_player_code)) {
                        //ユーザーID、選手IDが全て入力されているとき
                        //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
                        //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
                        $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                        if (!in_array($user_id, array_column($user_data, 'user_id'))) {
                            $this->assignInvalidData('無効データ（メールアドレス不正）', $renkei, $disabled, $checkResult);
                            $rowArray['renkei'] = $renkei;
                            $rowArray['disabled'] = $disabled;
                        }
                        if ($checkResult) {
                            //選手データが登録されているか確認
                            $player_data = $t_players->getPlayer($player_id);
                            if (empty($player_data)) {
                                $this->assignInvalidData('無効データ（未登録選手）', $renkei, $disabled, $checkResult);
                                $rowArray['renkei'] = $renkei;
                                $rowArray['disabled'] = $disabled;
                            }
                            //「選手テーブル」.「ユーザーID」とファイルに入力されている「ユーザーID」が一致するか確認
                            if ($checkResult) {
                                if ($player_data['user_id'] != $user_id) {
                                    $this->assignInvalidData('無効データ（ユーザーデータと選手データ不一致）', $renkei, $disabled, $checkResult);
                                    $rowArray['renkei'] = $renkei;
                                    $rowArray['disabled'] = $disabled;
                                }
                            }
                            if ($checkResult) {
                                //所属情報テーブルを取得
                                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
                                //団体テーブルから団体名を取得
                                $target_organization = $t_organizations->getOrganization($input_org_id);
                                //選手テーブルから出身地と居住地を取得
                                $player_data = $t_players->getPlayersFromPlayerId($player_id);
                                //所属情報を取得できなかった場合
                                if (empty($org_player_info)) {
                                    $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $player_data['jara_player_code'], $player_name, $mail_address, null, null, $player_data);
                                }
                                //取得情報が取得できた場合
                                else {
                                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                                    if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
                                        //存在するとき
                                        $this->assignRowArray($rowArray, "無効データ（重複選手）", $user_id, $player_id, $player_data['jara_player_code'], $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
                                    }
                                    //入力値が団体所属情報のorg_id列に存在しない
                                    else {
                                        $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $player_data['jara_player_code'], $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
                                    }
                                }
                            }
                        }
                    }
                    //入力組み合わせ③
                    elseif (isset($user_id) && !isset($player_id) && isset($jara_player_code)) {
                        //ユーザーID、JARA選手コードが全て入力されているとき
                        //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
                        //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
                        $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                        if (!in_array($user_id, array_column($user_data, 'user_id'))) {
                            $this->assignInvalidData('無効データ（メールアドレス不正）', $renkei, $disabled, $checkResult);
                            $rowArray['renkei'] = $renkei;
                            $rowArray['disabled'] = $disabled;
                        }
                        if ($checkResult) {
                            //JARA選手コードで選手データが登録されているかを確認
                            $player_data = $t_players->getPlayerFromJaraPlayerCode($jara_player_code);
                            if (empty($player_data)) {
                                $this->assignInvalidData('無効データ（無効選手ID）', $renkei, $disabled, $checkResult);
                                $rowArray['renkei'] = $renkei;
                                $rowArray['disabled'] = $disabled;
                            }
                            //「選手テーブル」.「ユーザーID」とファイルに入力されている「ユーザーID」が一致するか確認
                            if ($checkResult) {
                                if ($player_data['user_id'] != $user_id) {
                                    $this->assignInvalidData('無効データ（ユーザーデータと選手データ不一致）', $renkei, $disabled, $checkResult);
                                    $rowArray['renkei'] = $renkei;
                                    $rowArray['disabled'] = $disabled;
                                }
                            }

                            if ($checkResult) {
                                //所属情報テーブルを取得
                                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
                                //団体テーブルから団体名を取得
                                $target_organization = $t_organizations->getOrganization($input_org_id);
                                //所属情報を取得できなかった場合
                                if (empty($org_player_info)) {
                                    $this->assignRowArray($rowArray, "登録可能", $user_id, $player_data['player_id'], $jara_player_code, $player_name, $mail_address, null, null, $player_data);
                                }
                                //取得情報が取得できた場合
                                else {
                                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                                    if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
                                        //存在するとき
                                        $this->assignRowArray($rowArray, "無効データ（重複選手）", $user_id, $player_data['player_id'], $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
                                    }
                                    //入力値が団体所属情報のorg_id列に存在しない
                                    else {
                                        $this->assignRowArray($rowArray, "登録可能", $user_id, $player_data['player_id'], $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
                                    }
                                }
                            }
                        }
                    }
                    //入力組み合わせ④
                    elseif (isset($user_id) && !isset($player_id) && !isset($jara_player_code)) {
                        //ユーザーIDだけが入力されているとき
                        //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
                        //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
                        $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                        if (!in_array($user_id, array_column($user_data, 'user_id'))) {
                            $this->assignInvalidData('無効データ（メールアドレス不正）', $renkei, $disabled, $checkResult);
                            $rowArray['renkei'] = $renkei;
                            $rowArray['disabled'] = $disabled;
                        }
                        if ($checkResult) {
                            $temp_password_flag = $user_data['$temp_password_flag'];
                            if ($temp_password_flag == 0) {
                                //本登録の場合
                                //ファイルに入力されている「ユーザーID」で「選手テーブル」検索
                                $player_data = $t_players->getPlayerData($user_id);
                                if (empty($player_data)) {
                                    //選手登録されていなかった場合
                                    $rowArray['renkei'] = "選手未登録のため選手登録後、所属選手登録を実施";
                                    $rowArray['user_id'] = $user_id;
                                    $rowArray['player_id'] = null;
                                    $rowArray['jara_player_code'] = null;
                                    $rowArray['player_name'] = $player_name;
                                    $rowArray['mail_address'] = $mail_address;
                                    $rowArray['org_id'] = null;
                                    $rowArray['org_name'] = null;
                                    $rowArray['birth_place'] =  null;
                                    $rowArray['residence'] = null;
                                } else {
                                    //選手登録されている場合
                                    //所属情報テーブルを取得
                                    $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
                                    //団体テーブルから団体名を取得
                                    $target_organization = $t_organizations->getOrganization($org_player_info['org_id']);

                                    $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $org_player_info['org_id'], $target_organization['org_name'], $player_data);
                                }
                            } elseif ($temp_password_flag == 1) {
                                //仮登録の場合
                                $rowArray['renkei'] = "無効データ（仮登録ユーザー）";
                                $rowArray['user_id'] = $user_id;
                                $rowArray['player_id'] = $player_id;
                                $rowArray['jara_player_code'] = $jara_player_code;
                                $rowArray['player_name'] = $player_name;
                                $rowArray['mail_address'] = $mail_address;
                                $rowArray['org_id'] = null;
                                $rowArray['org_name'] = null;
                                $rowArray['birth_place'] =  null;
                                $rowArray['residence'] = null;
                            }
                        }
                    }
                    //入力組み合わせ⑤
                    elseif (!isset($user_id) && isset($player_id) && isset($jara_player_code)) {
                        //選手ID、JARA選手コードが全て入力されているとき
                        //選手データが登録されているか確認
                        $player_data = $t_players->getPlayer($player_id);
                        if (empty($player_data)) {
                            $this->assignInvalidData('無効データ（未登録選手）', $renkei, $disabled, $checkResult);
                            $rowArray['renkei'] = $renkei;
                            $rowArray['disabled'] = $disabled;
                        }
                        if ($checkResult) {
                            //「選手テーブル」.「ユーザーID」に値が設定されているか確認
                            if (empty($player_data['user_id'])) {
                                $this->assignInvalidData('無効データ（無効選手ID）', $renkei, $disabled, $checkResult);
                                $rowArray['renkei'] = $renkei;
                                $rowArray['disabled'] = $disabled;
                            }

                            if ($checkResult) {
                                //「選手テーブル」.「ユーザーID」と紐づく「ユーザーテーブル」.「メールアドレス」と
                                //ファイルに入力されている「メールアドレス」が一致するか確認
                                $user_data = $t_users->getUserDataFromUserId($player_data['user_id']);
                                if (!in_array($mail_address, array_column($user_data, 'mail_address'))) {
                                    $this->assignInvalidData('無効データ（メールアドレス不正）', $renkei, $disabled, $checkResult);
                                    $rowArray['renkei'] = $renkei;
                                    $rowArray['disabled'] = $disabled;
                                }
                            }

                            if ($checkResult) {
                                //「選手テーブル」.「JARA選手コード」とファイルに入力されている「JARA選手コード」が一致するか確認
                                if ($player_data['jara_player_code'] != $jara_player_code) {
                                    $this->assignInvalidData('無効データ（JARA選手コード不一致）', $renkei, $disabled, $checkResult);
                                    $rowArray['renkei'] = $renkei;
                                    $rowArray['disabled'] = $disabled;
                                }
                            }
                        }
                        if ($checkResult) {
                            //所属情報テーブルを取得
                            $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
                            //団体テーブルから団体名を取得
                            $target_organization = $t_organizations->getOrganization($input_org_id);
                            //選手テーブルから出身地と居住地を取得
                            $player_data = $t_players->getPlayersFromPlayerId($player_id);
                            //所属情報を取得できなかった場合
                            if (empty($org_player_info)) {
                                $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, null, null, $player_data);
                            }
                            //取得情報が取得できた場合
                            else {
                                //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                                if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
                                    //存在するとき
                                    $this->assignRowArray($rowArray, "無効データ（重複選手）", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
                                }
                                //入力値が団体所属情報のorg_id列に存在しない
                                else {
                                    $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
                                }
                            }
                        }
                    }
                    //入力組み合わせ⑥
                    elseif (!isset($user_id) && isset($player_id) && !isset($jara_player_code)) {
                        //選手IDだけが入力されているとき
                        //選手データが登録されているか確認
                        $player_data = $t_players->getPlayer($player_id);
                        if (empty($player_data)) {
                            $this->assignInvalidData('無効データ（未登録選手）', $renkei, $disabled, $checkResult);
                            $rowArray['renkei'] = $renkei;
                            $rowArray['disabled'] = $disabled;
                        }
                        if ($checkResult) {
                            //「選手テーブル」.「ユーザーID」に値が設定されているか確認
                            if (empty($player_data['user_id'])) {
                                $this->assignInvalidData('無効データ（無効選手ID）', $renkei, $disabled, $checkResult);
                                $rowArray['renkei'] = $renkei;
                                $rowArray['disabled'] = $disabled;
                            }

                            if ($checkResult) {
                                //「選手テーブル」.「ユーザーID」と紐づく「ユーザーテーブル」.「メールアドレス」と
                                //ファイルに入力されている「メールアドレス」が一致するか確認
                                $user_data = $t_users->getUserDataFromUserId($player_data['user_id']);
                                if (!in_array($mail_address, array_column($user_data, 'mail_address'))) {
                                    $this->assignInvalidData('無効データ（メールアドレス不正）', $renkei, $disabled, $checkResult);
                                    $rowArray['renkei'] = $renkei;
                                    $rowArray['disabled'] = $disabled;
                                }
                            }
                        }
                        if ($checkResult) {
                            //所属情報テーブルを取得
                            $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
                            //団体テーブルから団体名を取得
                            $target_organization = $t_organizations->getOrganization($input_org_id);
                            //選手テーブルから出身地と居住地を取得
                            $player_data = $t_players->getPlayersFromPlayerId($player_id);
                            //所属情報を取得できなかった場合
                            if (empty($org_player_info)) {
                                $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, null, null, $player_data);
                            }
                            //取得情報が取得できた場合
                            else {
                                //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                                if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
                                    //存在するとき
                                    $this->assignRowArray($rowArray, "無効データ（重複選手）", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
                                }
                                //入力値が団体所属情報のorg_id列に存在しない
                                else {
                                    $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
                                }
                            }
                        }
                    }
                    //入力組み合わせ⑦
                    elseif (!isset($user_id) && !isset($player_id) && isset($jara_player_code)) {
                        //JARA選手コードだけが入力されているとき
                        $player_data = $t_players->getPlayerFromJaraPlayerCode($jara_player_code);
                        if (empty($player_data)) {
                            $this->assignInvalidData('無効データ（未登録JARA選手コード）', $renkei, $disabled, $checkResult);
                            $rowArray['renkei'] = $renkei;
                            $rowArray['disabled'] = $disabled;
                        }

                        if ($checkResult) {
                            //「選手テーブル」.「ユーザーID」に値が設定されているか確認
                            if (empty($player_data['user_id'])) {
                                $this->assignInvalidData('無効データ（連携待ちJARA選手コード）', $renkei, $disabled, $checkResult);
                                $rowArray['renkei'] = $renkei;
                                $rowArray['disabled'] = $disabled;
                            }

                            if ($checkResult) {
                                //「選手テーブル」.「ユーザーID」と紐づく「ユーザーテーブル」.「メールアドレス」と
                                //ファイルに入力されている「メールアドレス」が一致するか確認
                                $user_data = $t_users->getUserData($player_data['user_id']);
                                if ($user_data['mail_address'] != $mail_address) {
                                    $this->assignInvalidData('無効データ（メールアドレス不一致）', $renkei, $disabled, $checkResult);
                                    $rowArray['renkei'] = $renkei;
                                    $rowArray['disabled'] = $disabled;
                                }
                            }

                            if ($checkResult) {
                                //所属情報テーブルを取得
                                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_data['player_id']);
                                //団体テーブルから団体名を取得
                                $target_organization = $t_organizations->getOrganization($input_org_id);
                                //選手テーブルから出身地と居住地を取得
                                $player_data = $t_players->getPlayersFromPlayerId($player_data['player_id']);
                                //所属情報を取得できなかった場合
                                if (empty($org_player_info)) {
                                    $this->assignRowArray($rowArray, "登録可能", $user_id, $player_data['player_id'], $jara_player_code, $player_name, $mail_address, null, null, $player_data);
                                }
                                //取得情報が取得できた場合
                                else {
                                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                                    if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
                                        //存在するとき
                                        $this->assignRowArray($rowArray, "無効データ（重複選手）", $user_id, $player_data['player_id'], $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
                                    }
                                    //入力値が団体所属情報のorg_id列に存在しない
                                    else {
                                        $this->assignRowArray($rowArray, "登録可能", $user_id, $player_data['player_id'], $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
                                    }
                                }
                            }
                        }
                    }
                    //入力組み合わせ⑧
                    else {
                        //ユーザーID、選手ID、JARA選手コードのいずれも入力されていないとき                        
                        //ファイルに記載されている「メールアドレス」で、「ユーザーテーブル」を検索
                        $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                        if (empty($user_data)) {
                            //ユーザー情報が登録されていない場合
                            $rowArray['renkei'] = "ユーザー未登録";
                            $rowArray['user_id'] = null;
                            $rowArray['player_id'] = null;
                            $rowArray['jara_player_code'] = null;
                            $rowArray['player_name'] = $player_name;
                            $rowArray['mail_address'] = $mail_address;
                            $rowArray['org_id'] = null;
                            $rowArray['org_name'] = null;
                            $rowArray['birth_place'] =  null;
                            $rowArray['residence'] = null;
                        } else {
                            //ユーザー情報が登録されていた場合
                            $temp_password_flag = $user_data['$temp_password_flag'];
                            if ($temp_password_flag == 0) {
                                //本登録の場合
                                //ファイルに入力されている「ユーザーID」で「選手テーブル」検索
                                $player_data = $t_players->getPlayerData($user_id);
                                if (empty($player_data)) {
                                    //選手登録されていなかった場合
                                    $rowArray['renkei'] = "選手未登録のため選手登録後、所属選手登録を実施";
                                    $rowArray['user_id'] = $user_id;
                                    $rowArray['player_id'] = null;
                                    $rowArray['jara_player_code'] = null;
                                    $rowArray['player_name'] = $player_name;
                                    $rowArray['mail_address'] = $mail_address;
                                    $rowArray['org_id'] = null;
                                    $rowArray['org_name'] = null;
                                    $rowArray['birth_place'] =  null;
                                    $rowArray['residence'] = null;
                                } else {
                                    //選手登録されている場合
                                    //所属情報テーブルを取得
                                    $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
                                    //団体テーブルから団体名を取得
                                    $target_organization = $t_organizations->getOrganization($org_player_info['org_id']);

                                    $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $org_player_info['org_id'], $target_organization['org_name'], $player_data);
                                }
                            } elseif ($temp_password_flag == 1) {
                                //仮登録の場合
                                $rowArray['renkei'] = "無効データ（仮登録ユーザー）";
                                $rowArray['user_id'] = $user_id;
                                $rowArray['player_id'] = $player_id;
                                $rowArray['jara_player_code'] = $jara_player_code;
                                $rowArray['player_name'] = $player_name;
                                $rowArray['mail_address'] = $mail_address;
                                $rowArray['org_id'] = null;
                                $rowArray['org_name'] = null;
                                $rowArray['birth_place'] =  null;
                                $rowArray['residence'] = null;
                            }
                        }
                    }
                }
                $dataList[$rowIndex] = $rowArray;
            }
            return view('organizations.player-register', ["dataList" => $dataList, "errorMsg" => "", "checkList" => $checkList, "organization_name_list" => $organization_name_list]);
        } else if ($request->has('dbUpload')) { // 登録ボタンクリック
            $csvData = Session::get('dataList');
            // dd($csvData[1][5]);
            // $result = explode(',', $request->Flag01);
            $result = "1";
            //dd($csvData);
            // for ($i = 1; $i < count($csvData); $i++) {
            //     if ($result == "1") {
            //         $tRaceResultRecord::$raceResultRecordInfo['player_id'] = $csvData[$i][17]; //選手ID
            //         $tRaceResultRecord::$raceResultRecordInfo['tourn_id'] = $csvData[$i][1]; //大会ID
            //         $tRaceResultRecord::$raceResultRecordInfo['race_id'] = $csvData[$i][7]; //レースID
            //         $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][10]; //レースNo
            //         $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][5]; //レース区分ID 仮実装
            //         $tRaceResultRecord::$raceResultRecordInfo['org_id'] = $csvData[$i][12]; //団体ID
            //         $tRaceResultRecord::$raceResultRecordInfo['crew_name'] = $csvData[$i][14]; //クルー名
            //         $tRaceResultRecord::$raceResultRecordInfo['by_group'] = $csvData[$i][9]; //組別
            //         $tRaceResultRecord::$raceResultRecordInfo['event_id'] = $csvData[$i][3]; //種目ID
            //         $log = $tRaceResultRecord->insertRaceResultRecord($tRaceResultRecord::$raceResultRecordInfo);
            //     } else if ($result == "2") {
            //         $tRaceResultRecord::$raceResultRecordInfo['player_id'] = $csvData[$i][17]; //選手ID
            //         $tRaceResultRecord::$raceResultRecordInfo['tourn_id'] = $csvData[$i][1]; //大会ID
            //         $tRaceResultRecord::$raceResultRecordInfo['race_id'] = $csvData[$i][7]; //レースID
            //         $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][10]; //レースNo
            //         $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][5]; //レース区分ID 仮実装
            //         $tRaceResultRecord::$raceResultRecordInfo['org_id'] = $csvData[$i][12]; //団体ID
            //         $tRaceResultRecord::$raceResultRecordInfo['crew_name'] = $csvData[$i][14]; //クルー名
            //         $tRaceResultRecord::$raceResultRecordInfo['by_group'] = $csvData[$i][9]; //組別
            //         $tRaceResultRecord::$raceResultRecordInfo['event_id'] = $csvData[$i][3]; //種目ID
            //         $tRaceResultRecord->updateRaceResultRecord($tRaceResultRecord::$raceResultRecordInfo);
            //     } else {
            //         continue;
            //     }
            // }
            //dd($playersInfo);

            //return view('tournament.entry-register', ["dataList" => [], "errorMsg" => $log, "checkList" => "", "tournament_name_list" => $tournament_name_list]);
        }
        // else {
        //     return view('tournament.entry-register', ["dataList" => [], "errorMsg" => "", "checkList" => "", "tournament_name_list" => $tournament_name_list]);
        // }
    }

    //データのチェックで不備があったときの変数代入処理
    private function assignInvalidData($error_description, &$renkei, &$disabled, &$checkResult)
    {
        $renkei = $error_description;
        $disabled = "disabled";
        $checkResult = false;
    }

    //フロントエンドに返す１行データの配列に値を代入する
    private function assignRowArray(&$rowArray, $renkei, $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $org_id, $ord_name, $player_data)
    {
        $rowArray['renkei'] = $renkei;
        $rowArray['user_id'] = $user_id;
        $rowArray['player_id'] = $player_id;
        $rowArray['jara_player_code'] = $jara_player_code;
        $rowArray['player_name'] = $player_name;
        $rowArray['mail_address'] = $mail_address;
        $rowArray['org_id'] = $org_id;
        $rowArray['org_name'] = $ord_name;
        $rowArray['birth_country_id'] = $player_data['birth_country_id'];
        $rowArray['birth_pref_id'] = $player_data['birth_pref_id'];
        $rowArray['birth_place'] =  $player_data['birth_country_name'] . $player_data['birth_pref_name'];
        $rowArray['residence_country_id'] = $player_data['residence_country_id'];
        $rowArray['residence_pref_id'] = $player_data['residence_pref_id'];
        $rowArray['residence'] = $player_data['residence_country_name'] . $player_data['residence_pref_name'];
    }

    //団体所属追加選手検索画面で、選手を検索する
    public function searchOrganizationPlayersForTeamRef(Request $request, T_organization_players $t_organization_players)
    {
        Log::debug(sprintf("searchOrganizationPlayersForTeamRef start"));
        $searchInfo = $request->all();
        $searchValue = [];
        $searchCondition = $this->generateOrganizationPlayersSearchCondition($searchInfo, $searchValue);
        $players = $t_organization_players->getOrganizationPlayersFromCondition($searchCondition, $searchValue);
        Log::debug(sprintf("searchOrganizationPlayersForTeamRef end"));
        return response()->json(['result' => $players]); //DBの結果を返す
    }
}
