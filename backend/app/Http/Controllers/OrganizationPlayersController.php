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
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\WelcomeMail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class OrganizationPlayersController extends Controller
{
    //団体所属選手登録画面を開く
    // public function createEdit(
    //     $targetOrgId,
    //     T_organizations $t_organizations,
    //     T_organization_players $t_organization_players
    // ) {
    //     if (Auth::user()->temp_password_flag === 1) {
    //         return redirect('user/password-change');
    //     } else {
    //         $organization = $t_organizations->getOrganization($targetOrgId);
    //         $org_name = $organization->org_name;
    //         $organization_players = $t_organization_players->getOrganizationPlayersInfo($targetOrgId);

    //         return view('organization-players.edit', ['org_name' => $org_name, 'org_players' => $organization_players]);
    //     }
    // }

    //団体選手検索画面を開く
    // public function createSearchView(
    //     $targetOrgId,
    //     T_organizations $t_organizations,
    //     M_sex $m_sex,
    //     M_prefectures $m_prefectures,
    //     M_events $m_events
    // ) {
    //     if (Auth::user()->temp_password_flag === 1) {
    //         return redirect('user/password-change');
    //     } else {
    //         $organization = $t_organizations->getOrganization($targetOrgId);
    //         $org_name = $organization->org_name;
    //         $sex = $m_sex->getSexList();
    //         $prefectures = $m_prefectures->getPrefecures();
    //         $events = $m_events->getEvents();

    //         return view('organization-players.search', [
    //             'org_name' => $org_name,
    //             'm_sex' => $sex,
    //             'prefectures' => $prefectures,
    //             'events' => $events
    //         ]);
    //     }
    // }

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
            $condition .= "and `m_sex`.`sex_id` = :sex\r\n";
            $conditionValue['sex'] = $searchInfo['sexId'];
        }
        //出身地（都道府県）
        if (isset($searchInfo['birthPrefectureId'])) {
            $condition .= "and bir_pref.pref_id =:birth_prefecture\r\n";
            $conditionValue['birth_prefecture'] = $searchInfo['birthPrefectureId'];
        }
        //居住地（都道府県）
        if (isset($searchInfo['residencePrefectureId'])) {
            $condition .= "and res_pref.pref_id =:residence_prefecture\r\n";
            $conditionValue['residence_prefecture'] = $searchInfo['residencePrefectureId'];
        }
        if (isset($searchInfo['sideInfo'])) {
            //S(ストロークサイド)
            if ($searchInfo['sideInfo']['S'] == true) {
                $condition .= "and SUBSTRING(tp.`side_info`,8,1) = 1\r\n";
            }
            //B(バウサイド)
            if ($searchInfo['sideInfo']['B'] == true) {
                $condition .= "and SUBSTRING(tp.`side_info`,7,1) = 1\r\n";
            }
            //X(スカルサイド)
            if ($searchInfo['sideInfo']['X'] == true) {
                $condition .= "and SUBSTRING(tp.`side_info`,6,1) = 1\r\n";
            }
            //C(コックスサイド)
            if ($searchInfo['sideInfo']['C'] == true) {
                $condition .= "and SUBSTRING(tp.`side_info`,5,1) = 1\r\n";
            }
        }
        //団体ID
        if (isset($searchInfo['orgId'])) {
            $condition .= "and org.org_id = :org_id\r\n";
            $conditionValue['org_id'] = $searchInfo['orgId'];
        }
        elseif (isset($searchInfo['org_id'])) {
            $condition .= "and org.org_id = :org_id\r\n";
            $conditionValue['org_id'] = $searchInfo['org_id'];
        }
        //エントリーシステムID
        if (isset($searchInfo['entrysystemOrgId'])) {
            $condition .= "and org.entrysystem_org_id =:entry_system_id\r\n";
            $conditionValue['entry_system_id'] = $searchInfo['entrysystemOrgId'];
        }
        //団体名
        if (isset($searchInfo['orgName'])) {
            $condition .= "and org.org_name LIKE :org_name\r\n";
            $conditionValue['org_name'] = "%" . $searchInfo['orgName'] . "%";
        }
        //出漕大会名
        if (isset($searchInfo['raceEventName'])) {
            $condition .= "and trrr.tourn_name LIKE :tourn_name\r\n";
            $conditionValue['tourn_name'] = "%" . $searchInfo['raceEventName'] . "%";
        }
        //出漕履歴情報
        if (isset($searchInfo['eventId'])) {
            $condition .= "and trrr.event_id = :event_id\r\n";
            $conditionValue['event_id'] = $searchInfo['eventId'];
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
    // public function csvReadOrganizationPlayerRegister(
    //     Request $request,
    //     T_organizations $t_organizations,
    //     T_players $t_players,
    //     T_users $t_users,
    //     T_organization_players $t_organization_players
    // ) {
    //     $organization_name_list = $t_organizations->getOrganizationName();
    //     if ($request->has('csvRead')) { // 読み込みボタンクリック
    //         // CSVファイルが存在するかの確認
    //         if ($request->hasFile('csvFile')) {
    //             //拡張子がCSVであるかの確認
    //             if ($request->csvFile->getClientOriginalExtension() !== "csv") {
    //                 // throw new Exception('このファイルはCSVファイルではありません');
    //                 return view('organizations.player-register', ["dataList" => [], "errorMsg" => "このファイルはCSVファイルではありません", "checkList" => "", "organization_name_list" => $organization_name_list]);
    //             }
    //             //ファイルの保存
    //             $newCsvFileName = $request->csvFile->getClientOriginalName();
    //             $request->csvFile->storeAs('public/csv', $newCsvFileName);
    //         } else {
    //             // throw new Exception('ファイルを取得できませんでした');
    //             return view('organizations.player-register', ["dataList" => [], "errorMsg" => "ファイルを取得できませんでした。<br/>入力したファイルパスを確認してください", "checkList" => "", "organization_name_list" => $organization_name_list]);
    //         }
    //         //保存したCSVファイルの取得
    //         $csv = Storage::disk('local')->get("public/csv/{$newCsvFileName}");
    //         // OS間やファイルで違う改行コードをexplode統一
    //         $csv = str_replace(array("\r\n", "\r"), "\n", $csv);
    //         // $csvを元に行単位のコレクション作成。explodeで改行ごとに分解
    //         $csvList = collect(explode("\n", $csv));
    //         $csvList = $csvList->toArray();
    //         $checkList = array();
    //         $dataList = array();    //フロントエンドに渡す多次元配列
    //         $renkei = "";       //読み込み結果
    //         #$tagName = 0;
    //         $disabled = "";
    //         #$jaraIdList = array();
    //         $csv_column_count = 5;
    //         $csvHeaderLine = "既存選手ID,新選手ID,ユーザーID,メールアドレス,選手名";

    //         //入力値の所属団体名のID
    //         $input_org_id = $request->input_org_id;

    //         //それぞれの項目の列番号
    //         $jara_player_code_col = 0;
    //         $player_id_col = 1;
    //         $user_id_col = 2;
    //         $mailaddress_col = 3;
    //         $player_name_col = 4;

    //         for ($rowIndex = 0; $rowIndex < count($csvList); $rowIndex++) {
    //             $rowArray = array();
    //             $value = explode(',', $csvList[$rowIndex]); //一行ごとのデータをカンマ区切りでリストに入れる
    //             //各フィールドの値
    //             //不正データの場合は全てNULLとするため初期値を"NULL"とする.
    //             $rowArray['jara_player_code'] = null;   //JARA選手コード
    //             $rowArray['player_id'] = null;          //選手ID
    //             $rowArray['user_id'] = null;            //ユーザーID
    //             $rowArray['mailaddress'] = null;        //メールアドレス
    //             $rowArray['player_name'] = null;        //選手名

    //             if (($rowIndex == 0 && $csvList[$rowIndex] == $csvHeaderLine) || empty($value[0]) /*|| in_array($value[0], $jaraIdList)*/) {
    //                 continue; //各行がヘッダ行と一致する場合,ユーザーIDがない場合,ユーザーIDが重複リストに含まれている場合、以降の処理を行わない。
    //             } elseif (count($value) != $csv_column_count) {
    //                 //行のデータ個数が正しくない場合
    //                 // $renkei = '無効データ';
    //                 // $disabled = "disabled";
    //                 $rowArray['renkei'] = '無効データ';
    //                 $rowArray['disabled'] = "disabled";
    //             } else {
    //                 $checkResult = true;
    //                 //対象行の各項目の値を変数に格納
    //                 $jara_player_code = $csvList[$rowIndex][$jara_player_code_col];
    //                 $player_id = $csvList[$rowIndex][$player_id_col];
    //                 $user_id = $csvList[$rowIndex][$user_id_col];
    //                 $mail_address = $csvList[$rowIndex][$mailaddress_col];
    //                 $player_name = $csvList[$rowIndex][$player_name_col];
    //                 //メールアドレスのチェック
    //                 //メールアドレスが設定されていることを確認
    //                 if (empty($mail_address)) {
    //                     //メールアドレスが設定されてなかったら
    //                     //読み込み結果を「無効データ（メールアドレス未設定）」にする
    //                     $this->assignInvalidData('無効データ（メールアドレス未設定）', $renkei, $disabled, $checkResult);
    //                     $rowArray['renkei'] = $renkei;
    //                     $rowArray['disabled'] = $disabled;
    //                 } else {
    //                     //メールアドレスのフォーマットとして適切であることを確認
    //                     if (!filter_var($mail_address, FILTER_VALIDATE_EMAIL)) {
    //                         $this->assignInvalidData('無効データ（メールアドレス不正）', $renkei, $disabled, $checkResult);
    //                         $rowArray['renkei'] = $renkei;
    //                         $rowArray['disabled'] = $disabled;
    //                     }
    //                 }
    //                 //選手名のチェック
    //                 //選手が設定されていることを確認
    //                 if ($checkResult) {
    //                     if (empty($player_name)) {
    //                         $this->assignInvalidData('無効データ（選手名未設定）', $renkei, $disabled, $checkResult);
    //                         $rowArray['renkei'] = $renkei;
    //                         $rowArray['disabled'] = $disabled;
    //                     } else {
    //                         //選手名のフォーマットとして適切であることを確認
    //                         if (mb_strlen($player_name) > 50) {
    //                             $this->assignInvalidData('無効データ（選手名不正）', $renkei, $disabled, $checkResult);
    //                             $rowArray['renkei'] = $renkei;
    //                             $rowArray['disabled'] = $disabled;
    //                         }
    //                     }
    //                 }
    //                 //取り込み可能かをチェックする
    //                 //入力組み合わせ①
    //                 if (isset($user_id) && isset($player_id) && isset($jara_player_code)) {
    //                     //ユーザーID、選手ID、JARA選手コードが全て入力されているとき
    //                     //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
    //                     //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
    //                     $user_data = $t_users->getUserDataFromMailAddress($mail_address);
    //                     if (!in_array($user_id, array_column($user_data, 'user_id'))) {
    //                         $this->assignInvalidData('無効データ（メールアドレス不正）', $renkei, $disabled, $checkResult);
    //                         $rowArray['renkei'] = $renkei;
    //                         $rowArray['disabled'] = $disabled;
    //                     }
    //                     if ($checkResult) {
    //                         //選手データが登録されているか確認
    //                         $player_data = $t_players->getPlayer($player_id);
    //                         if (empty($player_data)) {
    //                             $this->assignInvalidData('無効データ（未登録選手）', $renkei, $disabled, $checkResult);
    //                             $rowArray['renkei'] = $renkei;
    //                             $rowArray['disabled'] = $disabled;
    //                         }
    //                         //「選手テーブル」.「ユーザーID」とファイルに入力されている「ユーザーID」が一致するか確認
    //                         if ($checkResult) {
    //                             if ($player_data['user_id'] != $user_id) {
    //                                 $this->assignInvalidData('無効データ（ユーザーデータと選手データ不一致）', $renkei, $disabled, $checkResult);
    //                                 $rowArray['renkei'] = $renkei;
    //                                 $rowArray['disabled'] = $disabled;
    //                             }
    //                         }
    //                         //「選手テーブル」.「JARA選手コード」とファイルに入力されている「JARA選手コード」が一致するか確認
    //                         if ($checkResult) {
    //                             if ($player_data['jara_player_code'] != $jara_player_code) {
    //                                 $this->assignInvalidData('無効データ（JARA選手コード不一致）', $renkei, $disabled, $checkResult);
    //                                 $rowArray['renkei'] = $renkei;
    //                                 $rowArray['disabled'] = $disabled;
    //                             }
    //                         }
    //                         if ($checkResult) {
    //                             //所属情報テーブルを取得
    //                             $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
    //                             //団体テーブルから団体名を取得
    //                             $target_organization = $t_organizations->getOrganization($input_org_id);
    //                             //選手テーブルから出身地と居住地を取得
    //                             $player_data = $t_players->getPlayersFromPlayerId($player_id);
    //                             //所属情報を取得できなかった場合
    //                             if (empty($org_player_info)) {
    //                                 $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, null, null, $player_data);
    //                             }
    //                             //取得情報が取得できた場合
    //                             else {
    //                                 //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
    //                                 if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
    //                                     //存在するとき
    //                                     $this->assignRowArray($rowArray, "無効データ（重複選手）", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
    //                                 }
    //                                 //入力値が団体所属情報のorg_id列に存在しない
    //                                 else {
    //                                     $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //                 //入力組み合わせ②
    //                 elseif (isset($user_id) && isset($player_id) && !isset($jara_player_code)) {
    //                     //ユーザーID、選手IDが全て入力されているとき
    //                     //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
    //                     //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
    //                     $user_data = $t_users->getUserDataFromMailAddress($mail_address);
    //                     if (!in_array($user_id, array_column($user_data, 'user_id'))) {
    //                         $this->assignInvalidData('無効データ（メールアドレス不正）', $renkei, $disabled, $checkResult);
    //                         $rowArray['renkei'] = $renkei;
    //                         $rowArray['disabled'] = $disabled;
    //                     }
    //                     if ($checkResult) {
    //                         //選手データが登録されているか確認
    //                         $player_data = $t_players->getPlayer($player_id);
    //                         if (empty($player_data)) {
    //                             $this->assignInvalidData('無効データ（未登録選手）', $renkei, $disabled, $checkResult);
    //                             $rowArray['renkei'] = $renkei;
    //                             $rowArray['disabled'] = $disabled;
    //                         }
    //                         //「選手テーブル」.「ユーザーID」とファイルに入力されている「ユーザーID」が一致するか確認
    //                         if ($checkResult) {
    //                             if ($player_data['user_id'] != $user_id) {
    //                                 $this->assignInvalidData('無効データ（ユーザーデータと選手データ不一致）', $renkei, $disabled, $checkResult);
    //                                 $rowArray['renkei'] = $renkei;
    //                                 $rowArray['disabled'] = $disabled;
    //                             }
    //                         }
    //                         if ($checkResult) {
    //                             //所属情報テーブルを取得
    //                             $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
    //                             //団体テーブルから団体名を取得
    //                             $target_organization = $t_organizations->getOrganization($input_org_id);
    //                             //選手テーブルから出身地と居住地を取得
    //                             $player_data = $t_players->getPlayersFromPlayerId($player_id);
    //                             //所属情報を取得できなかった場合
    //                             if (empty($org_player_info)) {
    //                                 $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $player_data['jara_player_code'], $player_name, $mail_address, null, null, $player_data);
    //                             }
    //                             //取得情報が取得できた場合
    //                             else {
    //                                 //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
    //                                 if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
    //                                     //存在するとき
    //                                     $this->assignRowArray($rowArray, "無効データ（重複選手）", $user_id, $player_id, $player_data['jara_player_code'], $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
    //                                 }
    //                                 //入力値が団体所属情報のorg_id列に存在しない
    //                                 else {
    //                                     $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $player_data['jara_player_code'], $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //                 //入力組み合わせ③
    //                 elseif (isset($user_id) && !isset($player_id) && isset($jara_player_code)) {
    //                     //ユーザーID、JARA選手コードが全て入力されているとき
    //                     //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
    //                     //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
    //                     $user_data = $t_users->getUserDataFromMailAddress($mail_address);
    //                     if (!in_array($user_id, array_column($user_data, 'user_id'))) {
    //                         $this->assignInvalidData('無効データ（メールアドレス不正）', $renkei, $disabled, $checkResult);
    //                         $rowArray['renkei'] = $renkei;
    //                         $rowArray['disabled'] = $disabled;
    //                     }
    //                     if ($checkResult) {
    //                         //JARA選手コードで選手データが登録されているかを確認
    //                         $player_data = $t_players->getPlayerFromJaraPlayerCode($jara_player_code);
    //                         if (empty($player_data)) {
    //                             $this->assignInvalidData('無効データ（無効選手ID）', $renkei, $disabled, $checkResult);
    //                             $rowArray['renkei'] = $renkei;
    //                             $rowArray['disabled'] = $disabled;
    //                         }
    //                         //「選手テーブル」.「ユーザーID」とファイルに入力されている「ユーザーID」が一致するか確認
    //                         if ($checkResult) {
    //                             if ($player_data['user_id'] != $user_id) {
    //                                 $this->assignInvalidData('無効データ（ユーザーデータと選手データ不一致）', $renkei, $disabled, $checkResult);
    //                                 $rowArray['renkei'] = $renkei;
    //                                 $rowArray['disabled'] = $disabled;
    //                             }
    //                         }

    //                         if ($checkResult) {
    //                             //所属情報テーブルを取得
    //                             $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
    //                             //団体テーブルから団体名を取得
    //                             $target_organization = $t_organizations->getOrganization($input_org_id);
    //                             //所属情報を取得できなかった場合
    //                             if (empty($org_player_info)) {
    //                                 $this->assignRowArray($rowArray, "登録可能", $user_id, $player_data['player_id'], $jara_player_code, $player_name, $mail_address, null, null, $player_data);
    //                             }
    //                             //取得情報が取得できた場合
    //                             else {
    //                                 //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
    //                                 if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
    //                                     //存在するとき
    //                                     $this->assignRowArray($rowArray, "無効データ（重複選手）", $user_id, $player_data['player_id'], $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
    //                                 }
    //                                 //入力値が団体所属情報のorg_id列に存在しない
    //                                 else {
    //                                     $this->assignRowArray($rowArray, "登録可能", $user_id, $player_data['player_id'], $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //                 //入力組み合わせ④
    //                 elseif (isset($user_id) && !isset($player_id) && !isset($jara_player_code)) {
    //                     //ユーザーIDだけが入力されているとき
    //                     //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
    //                     //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
    //                     $user_data = $t_users->getUserDataFromMailAddress($mail_address);
    //                     if (!in_array($user_id, array_column($user_data, 'user_id'))) {
    //                         $this->assignInvalidData('無効データ（メールアドレス不正）', $renkei, $disabled, $checkResult);
    //                         $rowArray['renkei'] = $renkei;
    //                         $rowArray['disabled'] = $disabled;
    //                     }
    //                     if ($checkResult) {
    //                         $temp_password_flag = $user_data['$temp_password_flag'];
    //                         if ($temp_password_flag == 0) {
    //                             //本登録の場合
    //                             //ファイルに入力されている「ユーザーID」で「選手テーブル」検索
    //                             $player_data = $t_players->getPlayerData($user_id);
    //                             if (empty($player_data)) {
    //                                 //選手登録されていなかった場合
    //                                 $rowArray['renkei'] = "選手未登録のため選手登録後、所属選手登録を実施";
    //                                 $rowArray['user_id'] = $user_id;
    //                                 $rowArray['player_id'] = null;
    //                                 $rowArray['jara_player_code'] = null;
    //                                 $rowArray['player_name'] = $player_name;
    //                                 $rowArray['mail_address'] = $mail_address;
    //                                 $rowArray['org_id'] = null;
    //                                 $rowArray['org_name'] = null;
    //                                 $rowArray['birth_place'] =  null;
    //                                 $rowArray['residence'] = null;
    //                             } else {
    //                                 //選手登録されている場合
    //                                 //所属情報テーブルを取得
    //                                 $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
    //                                 //団体テーブルから団体名を取得
    //                                 $target_organization = $t_organizations->getOrganization($org_player_info['org_id']);

    //                                 $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $org_player_info['org_id'], $target_organization['org_name'], $player_data);
    //                             }
    //                         } elseif ($temp_password_flag == 1) {
    //                             //仮登録の場合
    //                             $rowArray['renkei'] = "無効データ（仮登録ユーザー）";
    //                             $rowArray['user_id'] = $user_id;
    //                             $rowArray['player_id'] = $player_id;
    //                             $rowArray['jara_player_code'] = $jara_player_code;
    //                             $rowArray['player_name'] = $player_name;
    //                             $rowArray['mail_address'] = $mail_address;
    //                             $rowArray['org_id'] = null;
    //                             $rowArray['org_name'] = null;
    //                             $rowArray['birth_place'] =  null;
    //                             $rowArray['residence'] = null;
    //                         }
    //                     }
    //                 }
    //                 //入力組み合わせ⑤
    //                 elseif (!isset($user_id) && isset($player_id) && isset($jara_player_code)) {
    //                     //選手ID、JARA選手コードが全て入力されているとき
    //                     //選手データが登録されているか確認
    //                     $player_data = $t_players->getPlayer($player_id);
    //                     if (empty($player_data)) {
    //                         $this->assignInvalidData('無効データ（未登録選手）', $renkei, $disabled, $checkResult);
    //                         $rowArray['renkei'] = $renkei;
    //                         $rowArray['disabled'] = $disabled;
    //                     }
    //                     if ($checkResult) {
    //                         //「選手テーブル」.「ユーザーID」に値が設定されているか確認
    //                         if (empty($player_data['user_id'])) {
    //                             $this->assignInvalidData('無効データ（無効選手ID）', $renkei, $disabled, $checkResult);
    //                             $rowArray['renkei'] = $renkei;
    //                             $rowArray['disabled'] = $disabled;
    //                         }

    //                         if ($checkResult) {
    //                             //「選手テーブル」.「ユーザーID」と紐づく「ユーザーテーブル」.「メールアドレス」と
    //                             //ファイルに入力されている「メールアドレス」が一致するか確認
    //                             $user_data = $t_users->getUserDataFromUserId($player_data['user_id']);
    //                             if (!in_array($mail_address, array_column($user_data, 'mail_address'))) {
    //                                 $this->assignInvalidData('無効データ（メールアドレス不正）', $renkei, $disabled, $checkResult);
    //                                 $rowArray['renkei'] = $renkei;
    //                                 $rowArray['disabled'] = $disabled;
    //                             }
    //                         }

    //                         if ($checkResult) {
    //                             //「選手テーブル」.「JARA選手コード」とファイルに入力されている「JARA選手コード」が一致するか確認
    //                             if ($player_data['jara_player_code'] != $jara_player_code) {
    //                                 $this->assignInvalidData('無効データ（JARA選手コード不一致）', $renkei, $disabled, $checkResult);
    //                                 $rowArray['renkei'] = $renkei;
    //                                 $rowArray['disabled'] = $disabled;
    //                             }
    //                         }
    //                     }
    //                     if ($checkResult) {
    //                         //所属情報テーブルを取得
    //                         $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
    //                         //団体テーブルから団体名を取得
    //                         $target_organization = $t_organizations->getOrganization($input_org_id);
    //                         //選手テーブルから出身地と居住地を取得
    //                         $player_data = $t_players->getPlayersFromPlayerId($player_id);
    //                         //所属情報を取得できなかった場合
    //                         if (empty($org_player_info)) {
    //                             $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, null, null, $player_data);
    //                         }
    //                         //取得情報が取得できた場合
    //                         else {
    //                             //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
    //                             if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
    //                                 //存在するとき
    //                                 $this->assignRowArray($rowArray, "無効データ（重複選手）", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
    //                             }
    //                             //入力値が団体所属情報のorg_id列に存在しない
    //                             else {
    //                                 $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
    //                             }
    //                         }
    //                     }
    //                 }
    //                 //入力組み合わせ⑥
    //                 elseif (!isset($user_id) && isset($player_id) && !isset($jara_player_code)) {
    //                     //選手IDだけが入力されているとき
    //                     //選手データが登録されているか確認
    //                     $player_data = $t_players->getPlayer($player_id);
    //                     if (empty($player_data)) {
    //                         $this->assignInvalidData('無効データ（未登録選手）', $renkei, $disabled, $checkResult);
    //                         $rowArray['renkei'] = $renkei;
    //                         $rowArray['disabled'] = $disabled;
    //                     }
    //                     if ($checkResult) {
    //                         //「選手テーブル」.「ユーザーID」に値が設定されているか確認
    //                         if (empty($player_data['user_id'])) {
    //                             $this->assignInvalidData('無効データ（無効選手ID）', $renkei, $disabled, $checkResult);
    //                             $rowArray['renkei'] = $renkei;
    //                             $rowArray['disabled'] = $disabled;
    //                         }

    //                         if ($checkResult) {
    //                             //「選手テーブル」.「ユーザーID」と紐づく「ユーザーテーブル」.「メールアドレス」と
    //                             //ファイルに入力されている「メールアドレス」が一致するか確認
    //                             $user_data = $t_users->getUserDataFromUserId($player_data['user_id']);
    //                             if (!in_array($mail_address, array_column($user_data, 'mail_address'))) {
    //                                 $this->assignInvalidData('無効データ（メールアドレス不正）', $renkei, $disabled, $checkResult);
    //                                 $rowArray['renkei'] = $renkei;
    //                                 $rowArray['disabled'] = $disabled;
    //                             }
    //                         }
    //                     }
    //                     if ($checkResult) {
    //                         //所属情報テーブルを取得
    //                         $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
    //                         //団体テーブルから団体名を取得
    //                         $target_organization = $t_organizations->getOrganization($input_org_id);
    //                         //選手テーブルから出身地と居住地を取得
    //                         $player_data = $t_players->getPlayersFromPlayerId($player_id);
    //                         //所属情報を取得できなかった場合
    //                         if (empty($org_player_info)) {
    //                             $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, null, null, $player_data);
    //                         }
    //                         //取得情報が取得できた場合
    //                         else {
    //                             //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
    //                             if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
    //                                 //存在するとき
    //                                 $this->assignRowArray($rowArray, "無効データ（重複選手）", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
    //                             }
    //                             //入力値が団体所属情報のorg_id列に存在しない
    //                             else {
    //                                 $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
    //                             }
    //                         }
    //                     }
    //                 }
    //                 //入力組み合わせ⑦
    //                 elseif (!isset($user_id) && !isset($player_id) && isset($jara_player_code)) {
    //                     //JARA選手コードだけが入力されているとき
    //                     $player_data = $t_players->getPlayerFromJaraPlayerCode($jara_player_code);
    //                     if (empty($player_data)) {
    //                         $this->assignInvalidData('無効データ（未登録JARA選手コード）', $renkei, $disabled, $checkResult);
    //                         $rowArray['renkei'] = $renkei;
    //                         $rowArray['disabled'] = $disabled;
    //                     }

    //                     if ($checkResult) {
    //                         //「選手テーブル」.「ユーザーID」に値が設定されているか確認
    //                         if (empty($player_data['user_id'])) {
    //                             $this->assignInvalidData('無効データ（連携待ちJARA選手コード）', $renkei, $disabled, $checkResult);
    //                             $rowArray['renkei'] = $renkei;
    //                             $rowArray['disabled'] = $disabled;
    //                         }

    //                         if ($checkResult) {
    //                             //「選手テーブル」.「ユーザーID」と紐づく「ユーザーテーブル」.「メールアドレス」と
    //                             //ファイルに入力されている「メールアドレス」が一致するか確認
    //                             $user_data = $t_users->getUserData($player_data['user_id']);
    //                             if ($user_data['mail_address'] != $mail_address) {
    //                                 $this->assignInvalidData('無効データ（メールアドレス不一致）', $renkei, $disabled, $checkResult);
    //                                 $rowArray['renkei'] = $renkei;
    //                                 $rowArray['disabled'] = $disabled;
    //                             }
    //                         }

    //                         if ($checkResult) {
    //                             //所属情報テーブルを取得
    //                             $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_data['player_id']);
    //                             //団体テーブルから団体名を取得
    //                             $target_organization = $t_organizations->getOrganization($input_org_id);
    //                             //選手テーブルから出身地と居住地を取得
    //                             $player_data = $t_players->getPlayersFromPlayerId($player_data['player_id']);
    //                             //所属情報を取得できなかった場合
    //                             if (empty($org_player_info)) {
    //                                 $this->assignRowArray($rowArray, "登録可能", $user_id, $player_data['player_id'], $jara_player_code, $player_name, $mail_address, null, null, $player_data);
    //                             }
    //                             //取得情報が取得できた場合
    //                             else {
    //                                 //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
    //                                 if (in_array($input_org_id, array_column($org_player_info, 'org_id'))) {
    //                                     //存在するとき
    //                                     $this->assignRowArray($rowArray, "無効データ（重複選手）", $user_id, $player_data['player_id'], $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
    //                                 }
    //                                 //入力値が団体所属情報のorg_id列に存在しない
    //                                 else {
    //                                     $this->assignRowArray($rowArray, "登録可能", $user_id, $player_data['player_id'], $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization['org_name'], $player_data);
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //                 //入力組み合わせ⑧
    //                 else {
    //                     //ユーザーID、選手ID、JARA選手コードのいずれも入力されていないとき                        
    //                     //ファイルに記載されている「メールアドレス」で、「ユーザーテーブル」を検索
    //                     $user_data = $t_users->getUserDataFromMailAddress($mail_address);
    //                     if (empty($user_data)) {
    //                         //ユーザー情報が登録されていない場合
    //                         $rowArray['renkei'] = "ユーザー未登録";
    //                         $rowArray['user_id'] = null;
    //                         $rowArray['player_id'] = null;
    //                         $rowArray['jara_player_code'] = null;
    //                         $rowArray['player_name'] = $player_name;
    //                         $rowArray['mail_address'] = $mail_address;
    //                         $rowArray['org_id'] = null;
    //                         $rowArray['org_name'] = null;
    //                         $rowArray['birth_place'] =  null;
    //                         $rowArray['residence'] = null;
    //                     } else {
    //                         //ユーザー情報が登録されていた場合
    //                         $temp_password_flag = $user_data['$temp_password_flag'];
    //                         if ($temp_password_flag == 0) {
    //                             //本登録の場合
    //                             //ファイルに入力されている「ユーザーID」で「選手テーブル」検索
    //                             $player_data = $t_players->getPlayerData($user_id);
    //                             if (empty($player_data)) {
    //                                 //選手登録されていなかった場合
    //                                 $rowArray['renkei'] = "選手未登録のため選手登録後、所属選手登録を実施";
    //                                 $rowArray['user_id'] = $user_id;
    //                                 $rowArray['player_id'] = null;
    //                                 $rowArray['jara_player_code'] = null;
    //                                 $rowArray['player_name'] = $player_name;
    //                                 $rowArray['mail_address'] = $mail_address;
    //                                 $rowArray['org_id'] = null;
    //                                 $rowArray['org_name'] = null;
    //                                 $rowArray['birth_place'] =  null;
    //                                 $rowArray['residence'] = null;
    //                             } else {
    //                                 //選手登録されている場合
    //                                 //所属情報テーブルを取得
    //                                 $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
    //                                 //団体テーブルから団体名を取得
    //                                 $target_organization = $t_organizations->getOrganization($org_player_info['org_id']);

    //                                 $this->assignRowArray($rowArray, "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $org_player_info['org_id'], $target_organization['org_name'], $player_data);
    //                             }
    //                         } elseif ($temp_password_flag == 1) {
    //                             //仮登録の場合
    //                             $rowArray['renkei'] = "無効データ（仮登録ユーザー）";
    //                             $rowArray['user_id'] = $user_id;
    //                             $rowArray['player_id'] = $player_id;
    //                             $rowArray['jara_player_code'] = $jara_player_code;
    //                             $rowArray['player_name'] = $player_name;
    //                             $rowArray['mail_address'] = $mail_address;
    //                             $rowArray['org_id'] = null;
    //                             $rowArray['org_name'] = null;
    //                             $rowArray['birth_place'] =  null;
    //                             $rowArray['residence'] = null;
    //                         }
    //                     }
    //                 }
    //             }
    //             $dataList[$rowIndex] = $rowArray;
    //         }
    //         return view('organizations.player-register', ["dataList" => $dataList, "errorMsg" => "", "checkList" => $checkList, "organization_name_list" => $organization_name_list]);
    //     } else if ($request->has('regist')) { // 登録ボタンクリック
    //         $result = "1";
    //         include('ErrorMessages/ErrorMessages.php');
    //         //入力値（テーブルの各要素）の配列をフロントから受け取る
    //         //配列は行列の形式、また1行の各フィールドはその名称で取得可能の想定
    //         $postData = $request->all();
    //         //foreachで1行ずつ処理
    //         foreach ($postData as $rowData) {
    //             if ($rowData['check'] == "checked" && $rowData['renkei'] == "登録可能データ") {
    //                 //登録・更新するユーザー名を取得
    //                 $register_user_id = Auth::user()->user_id;
    //                 //登録・更新日時のために現在の日時を取得
    //                 $current_datetime = now()->format('Y-m-d H:i:s.u');

    //                 //対象のユーザーデータを取得
    //                 $target_user_data = $t_users->getUserDataFromInputCsv($rowData);

    //                 //ユーザーデータが存在するかチェック
    //                 if (empty($target_user_data)) {
    //                     //ユーザーが存在しない場合、ユーザーテーブルにinsertして仮登録のメール送信

    //                     // For Generate random password
    //                     $temp_password = Str::random(8);

    //                     //For adding 1day with current time
    //                     $converting_date = date_create($current_datetime);
    //                     date_add($converting_date, date_interval_create_from_date_string("1 day"));
    //                     $newDate = date_format($converting_date, "Y-m-d H:i:s.u");

    //                     // Insert new user info in the database.(t_user table)

    //                     DB::beginTransaction();
    //                     try {
    //                         //ユーザー生成のためのデータを配列に格納
    //                         $hashed_password = Hash::make($temp_password);
    //                         $insert_user = [];
    //                         $insert_user['user_name'] = $rowData['player_name'];
    //                         $insert_user['mailaddress'] = $rowData['mailaddress'];
    //                         $insert_user['password'] = $hashed_password;
    //                         $insert_user['temp_password'] = $hashed_password;
    //                         $insert_user['expiry_time_of_temp_password'] = $newDate;
    //                         $insert_user['temp_password_flag'] = 1;
    //                         $insert_user['current_datetime'] = $current_datetime;
    //                         //登録ユーザーIDはカレントユーザー？
    //                         //$insert_user['user_id'] = 9999999;
    //                         $insert_user['user_id'] = $register_user_id;
    //                         //insert実行
    //                         $t_users->insertTemporaryUser($insert_user);

    //                         DB::commit();
    //                     } catch (\Throwable $e) {
    //                         DB::rollBack();

    //                         $e_message = $e->getMessage();
    //                         $e_code = $e->getCode();
    //                         $e_file = $e->getFile();
    //                         $e_line = $e->getLine();
    //                         $e_sql = $e->getSql();
    //                         $e_errorCode = $e->errorInfo[1];
    //                         $e_bindings = implode(", ", $e->getBindings());
    //                         $e_connectionName = $e->connectionName;


    //                         //Store error message in the register log file.
    //                         Log::channel('user_register')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailAddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
    //                         if ($e_errorCode == 1213 || $e_errorCode == 1205) {
    //                             // throw ValidationException::withMessages([
    //                             //     'datachecked_error' => $registration_failed
    //                             // ]);
    //                             return response()->json(['system_error' => $registration_failed], 500);
    //                             //Status code 500 for internal server error
    //                         } else {
    //                             // throw ValidationException::withMessages([
    //                             //     'datachecked_error' => $registration_failed
    //                             // ]); 
    //                             return response()->json(['system_error' => $registration_failed], 500);
    //                             //Status code 500 for internal server error
    //                         }
    //                     }

    //                     //For getting current time
    //                     $mail_date = date('Y/m/d H:i');
    //                     //For adding 24hour with current time
    //                     $new_mail_date = date('Y/m/d H:i', strtotime($mail_date . ' + 24 hours'));

    //                     //Store user information for sending email.
    //                     $mail_data = [
    //                         'user_name' => $request->user_name,
    //                         'to_mailaddress' => $request->mailaddress,
    //                         'from_mailaddress' => 'xxxxx@jara.or.jp',
    //                         'temporary_password' => $temp_password,
    //                         'temporary_password_expiration_date' => $new_mail_date
    //                     ];

    //                     //Sending mail to the user

    //                     try {
    //                         //Mail::to($request->get('mailaddress'))->send(new WelcomeMail($mail_data));
    //                     } catch (Exception $e) {
    //                         DB::delete('delete from t_users where mailaddress = ?', [$request->mailaddress]);
    //                         //Store error message in the user_register log file.
    //                         Log::channel('user_register')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailaddress,  \r\n \r\n ＊＊＊「EMAIL_SENT_ERROR_MESSAGE」  ： $e\r\n  \r\n ============================================================ \r\n \r\n");
    //                         //Display error message to the client
    //                         // throw ValidationException::withMessages([
    //                         //     'datachecked_error' => $mail_sent_failed,
    //                         // ]);
    //                         return response()->json(['system_error' => $registration_failed], 500);
    //                         //Status code 500 for internal server error
    //                     }
    //                 }

    //                 //選手情報が存在しているかチェック
    //                 //直近に挿入した選手のID
    //                 $insert_player_id = 0;
    //                 //選手情報を取得
    //                 $target_player_data = $t_players->getPlayer($rowData['player_id']);
    //                 //対象の選手が選手テーブルに存在するかをチェック
    //                 if (empty($target_player_data)) {
    //                     //選手未登録の場合、選手テーブルにinsertして通知メールを送信
    //                     $insert_player_data = [];
    //                     $insert_player_data['user_id'] = $rowData['user_id'];
    //                     $insert_player_data['jara_player_id'] = $rowData['jara_player_id'];
    //                     $insert_player_data['player_name'] = $rowData['player_name'];
    //                     $insert_player_data['date_of_birth'] = $target_user_data['date_of_birth'];
    //                     $insert_player_data['sex_id'] = $target_user_data['sex'];
    //                     $insert_player_data['height'] = $target_user_data['height'];
    //                     $insert_player_data['weight'] = $target_user_data['weight'];
    //                     $insert_player_data['side_info'] = $rowData['side_info'];
    //                     $insert_player_data['birth_country'] = $rowData['birth_country'];
    //                     $insert_player_data['birth_prefecture'] = $rowData['birth_prefecture'];
    //                     $insert_player_data['residence_country'] = $rowData['residence_country'];
    //                     $insert_player_data['photo'] = $rowData['photo'];
    //                     $insert_player_data['current_datetime'] = $current_datetime;
    //                     $insert_player_data['user_id'] = $register_user_id;

    //                     DB::beginTransaction();
    //                     try {
    //                         //insertを実行して、insertしたレコードのIDを取得
    //                         $insert_player_id = $t_players->insertPlayer($insert_player_data);
    //                         DB::commit();
    //                     } catch (\Throwable $e) {
    //                         DB::rollBack();
    //                     }
    //                 }
    //                 //団体所属選手テーブルに挿入
    //                 $insert_organization_player_data = [];
    //                 $insert_organization_player_data['org_id'] = $input_org_id;
    //                 //選手IDは入力値になければ直近にinsertした選手IDを代入
    //                 if (isset($rowData['player_id'])) {
    //                     $insert_organization_player_data['player_id'] = $rowData['player_id'];
    //                 } else {
    //                     $insert_organization_player_data['player_id'] = $insert_player_id;
    //                 }
    //                 $insert_organization_player_data['joining_date'] = $rowData['joining_date'];
    //                 $insert_organization_player_data['deperture_date'] = $rowData['deperture_date'];
    //                 $insert_organization_player_data['current_datetime'] = $current_datetime;
    //                 $insert_organization_player_data['user_id'] = $register_user_id;

    //                 DB::beginTransaction();
    //                 try {
    //                     //insertを実行して、insertしたレコードのIDを取得
    //                     $insert_organization_player_id = $t_organization_players->insertOrganizationPlayer($insert_organization_player_data);
    //                     DB::commit();
    //                 } catch (\Throwable $e) {
    //                     DB::rollBack();
    //                 }

    //                 try {
    //                     //メール送信
    //                 } catch (\Throwable $e) {
    //                     //メール送信に失敗したときのエラー
    //                 }
    //             }
    //         }
    //     }
    // }

    //データのチェックで不備があったときの変数代入処理
    private function assignInvalidData($error_description, &$renkei, &$disabled, &$checkResult)
    {
        $renkei = $error_description;
        $disabled = "disabled";
        $checkResult = false;
    }

    //データのチェックで不備があったときの変数代入処理
    private function assignInvalidRowdata($error_description, &$rowData)
    {
        $rowData["result"] = $error_description;
        $rowData["checked"] = false;
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
        $rowData['birthPlace'] =  $player_data->birthCountryName.$player_data->birthPrefectureName;
        $rowData['residenceCountryId'] = $player_data->residence_country;
        $rowData['residencePrefId'] = $player_data->residence_prefecture;
        $rowData['residence'] = $player_data->residenceCountryName.$player_data->residencePrefectureName;
        $rowData['checked'] = $checked;

        Log::debug($rowData);

        Log::debug("assignRowData End.");
    }

    //団体所属追加選手検索画面で、選手を検索する
    public function searchOrganizationPlayersForTeamRef(Request $request, T_organization_players $t_organization_players)
    {
        Log::debug(sprintf("searchOrganizationPlayersForTeamRef start"));
        $searchInfo = $request->all();
        //Log::Debug($searchInfo);
        $searchValue = [];
        $searchCondition = $this->generateOrganizationPlayersSearchCondition($searchInfo, $searchValue);
        $players = $t_organization_players->getOrganizationPlayersFromCondition($searchCondition, $searchValue);
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

        Log::debug(sprintf("searchOrganizationPlayersForTeamRef end"));
        return response()->json(['result' => $players]); //DBの結果を返す
    }

    //メールの送信
    private function sendMail($user_name, $mailaddress, $temp_password, $mail_template, $error_message)
    {
        //任意のテンプレートを引数で選択してメールを送信
        //ユーザー名、メールアドレスなど必要な値は引数で指定する

        //For getting current time
        $mail_date = date('Y/m/d H:i');
        //For adding 24hour with current time
        $new_mail_date = date('Y/m/d H:i', strtotime($mail_date . ' + 24 hours'));

        //Store user information for sending email.
        $mail_data = [
            'user_name' => $user_name,
            'to_mailaddress' => $mailaddress,
            'from_mailaddress' => 'xxxxx@jara.or.jp',
            'temporary_password' => $temp_password,
            'temporary_password_expiration_date' => $new_mail_date
        ];

        //Sending mail to the user

        try {
            //Mail::to($mailaddress)->send(new WelcomeMail($mail_data));
        } catch (Exception $e) {
            //DB::delete('delete from t_users where mailaddress = ?', [$mailaddress ]);
            //Store error message in the user_register log file.
            Log::channel('user_register')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $mailaddress,  \r\n \r\n ＊＊＊「EMAIL_SENT_ERROR_MESSAGE」  ： $e\r\n  \r\n ============================================================ \r\n \r\n");
            //Display error message to the client
            // throw ValidationException::withMessages([
            //     'datachecked_error' => $mail_sent_failed,
            // ]);
            return response()->json(['system_error' => $error_message], 500);
            //Status code 500 for internal server error
        }
    }

    // 団体所属選手の更新処理 20240226
    public function updateOrgPlayerData(Request $request,T_organization_players $t_organization_players)
    {
        Log::debug(sprintf("updateOrgPlayerData start"));
        $reqData = $request->all();
        DB::beginTransaction();
        try
        {
            foreach($reqData as $player)
            {
                $player_type = $player["type"];
                $player_delete_flag = $player["deleteFlag"];
                //既存、かつ削除にチェックが入っている場合
                if($player_type == "既存" && $player_delete_flag == true)
                {
                    $t_organization_players->updateDeleteFlagOrganizationPlayers($player["org_id"],$player["player_id"]);
                }
                //追加、かつ削除にチェックが入っていない場合
                elseif($player_type == "追加" && $player_delete_flag == false)
                {
                    $t_organization_players->insertOrganizationPlayer($player);
                }
            }
            DB::commit();
            Log::debug(sprintf("updateOrgPlayerData end"));
            return response()->json(['result' => $reqData]);
        }
        catch (\Throwable $e)
        {
            DB::rollBack();
            return response()->json(['errMessage' => $e->getMessage()]); //エラーメッセージを返す
        }
    }

    // 団体に登録する選手検索 20240226
    public function teamPlayerSearch(Request $request, T_organization_players $t_organization_players)
    {
        Log::debug(sprintf("teamPlayerSearch start"));
        $searchInfo = $request->all();
        Log::debug($searchInfo);
        $searchValue = [];
        $searchCondition = $this->generateOrganizationPlayersSearchCondition($searchInfo, $searchValue);
        $players = $t_organization_players->getOrganizationPlayersFromCondition($searchCondition, $searchValue);
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

    //団体一括 読み込むボタン押下 20240301
    public function sendOrgCsvData(Request $request,
                                    T_organizations $t_organizations,
                                        T_players $t_players,
                                        T_users $t_users,
                                        T_organization_players $t_organization_players)
    {
        Log::debug(sprintf("sendOrgCsvData start"));
        $inputData = $request->all();
        $reqData = $inputData["csvDataList"];
        //Log::debug($reqData);
        $input_org_id = $inputData["targetOrgData"]["targetOrgId"];
        for($rowIndex = 0;$rowIndex < count($reqData);$rowIndex++)
        {
            //フロントからの送信データ
            $jara_player_code = $reqData[$rowIndex]["jaraPlayerId"];
            $player_id = $reqData[$rowIndex]["playerId"];
            $user_id = $reqData[$rowIndex]["userId"];
            $mail_address = $reqData[$rowIndex]["mailaddress"];
            $player_name = $reqData[$rowIndex]["playerName"];

            //取り込み可能かをチェックする
            //入力組み合わせ①
            if (isset($user_id) && isset($player_id) && isset($jara_player_code))
            {
                Log::debug("入力組み合わせ①");
                //ユーザーID、選手ID、JARA選手コードが全て入力されているとき
                //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
                //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
                $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                if (in_array($user_id, array_column($user_data, 'user_id')))
                {
                    $this->assignInvalidRowdata('無効データ（メールアドレス不正）', $reqData[$rowIndex]);
                    continue;
                }
                //選手データが登録されているか確認
                $player_data = $t_players->getPlayer($player_id);
                if (empty($player_data))
                {
                    $this->assignInvalidRowdata('無効データ（未登録選手）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」とファイルに入力されている「ユーザーID」が一致するか確認
                if ($player_data[0]->{'user_id'} != $user_id)
                {
                    $this->assignInvalidRowdata('無効データ（ユーザーデータと選手データ不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「JARA選手コード」とファイルに入力されている「JARA選手コード」が一致するか確認
                if ($player_data[0]->{'jara_player_id'} != $jara_player_code)
                {
                    $this->assignInvalidRowdata('無効データ（JARA選手コード不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //所属情報テーブルを取得
                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);                
                //団体テーブルから団体名を取得
                $target_organization = $t_organizations->getOrganization($input_org_id);
                //選手テーブルから出身地と居住地を取得
                $player_data = $t_players->getPlayersFromPlayerId($player_id);                
                //所属情報を取得できなかった場合
                if (empty($org_player_info))
                {
                    //Log::debug("所属情報を取得できなかった場合");
                    $this->assignRowData($reqData[$rowIndex], "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, null, null, $player_data[0], true);
                }
                //取得情報が取得できた場合
                else
                {
                    //Log::debug("所属情報を取得できた場合");
                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                    if (in_array($input_org_id, array_column($org_player_info, 'org_id')))
                    {
                        //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在する場合");
                        //存在するとき
                        $this->assignRowData($reqData[$rowIndex], "無効データ（重複選手）", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0],false);
                    }
                    //入力値が団体所属情報のorg_id列に存在しない
                    else
                    {
                        //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在しない場合");
                        $this->assignRowData($reqData[$rowIndex], "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0],true);
                    }
                }
            }
            //入力組み合わせ②
            elseif (isset($user_id) && isset($player_id) && !isset($jara_player_code))
            {
                Log::debug("入力組み合わせ②");
                //ユーザーID、選手IDが全て入力されているとき
                //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
                //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
                $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                if (in_array($user_id, array_column($user_data, 'user_id')))
                {
                    $this->assignInvalidRowdata('無効データ（メールアドレス不正）', $reqData[$rowIndex]);
                    continue;
                }
                //選手データが登録されているか確認
                $player_data = $t_players->getPlayer($player_id);
                if (empty($player_data))
                {
                    $this->assignInvalidRowdata('無効データ（未登録選手）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」とファイルに入力されている「ユーザーID」が一致するか確認
                if ($player_data[0]->{'user_id'} != $user_id)
                {
                    $this->assignInvalidRowdata('無効データ（ユーザーデータと選手データ不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //所属情報テーブルを取得
                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
                //団体テーブルから団体名を取得
                $target_organization = $t_organizations->getOrganization($input_org_id);
                //選手テーブルから出身地と居住地を取得
                $player_data = $t_players->getPlayersFromPlayerId($player_id);
                //Log::debug($player_data);
                //所属情報を取得できなかった場合
                if (empty($org_player_info))
                {
                    $this->assignRowData($reqData[$rowIndex], "登録可能", $user_id, $player_id, $player_data[0]->{'jara_player_id'}, $player_name, $mail_address, null, null, $player_data[0],true);
                }
                //取得情報が取得できた場合
                else
                {
                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                    if (in_array($input_org_id, array_column($org_player_info, 'org_id')))
                    {
                        //存在するとき
                        $this->assignRowData($reqData[$rowIndex], "無効データ（重複選手）", $user_id, $player_id, $player_data[0]->{'jara_player_id'}, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0],false);
                    }
                    //入力値が団体所属情報のorg_id列に存在しない
                    else
                    {
                        $this->assignRowData($reqData[$rowIndex], "登録可能", $user_id, $player_id, $player_data[0]->{'jara_player_id'}, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0],true);
                    }
                }
            }
            //入力組み合わせ③
            elseif (isset($user_id) && !isset($player_id) && isset($jara_player_code))
            {
                Log::debug("入力組み合わせ③");
                //ユーザーID、JARA選手コードが全て入力されているとき
                //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
                //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
                $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                if (in_array($user_id, array_column($user_data, 'user_id')))
                {
                    $this->assignInvalidRowdata('無効データ（メールアドレス不正）', $reqData[$rowIndex]);
                    continue;
                }
                //JARA選手コードで選手データが登録されているかを確認
                $player_data = $t_players->getPlayerFromJaraPlayerId($jara_player_code);
                if (empty($player_data))
                {
                    $this->assignInvalidRowdata('無効データ（無効選手ID）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」とファイルに入力されている「ユーザーID」が一致するか確認
                if ($player_data[0]->{'user_id'} != $user_id)
                {
                    $this->assignInvalidRowdata('無効データ（ユーザーデータと選手データ不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //所属情報テーブルを取得
                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromJaraPlayerId($jara_player_code);                
                //団体テーブルから団体名を取得
                $target_organization = $t_organizations->getOrganization($input_org_id);
                //所属情報を取得できなかった場合
                if (empty($org_player_info))
                {
                    //Log::debug("所属情報を取得できなかった場合");
                    $this->assignRowData($reqData[$rowIndex], "登録可能", $user_id, $player_data[0]->{'player_id'}, $jara_player_code, $player_name, $mail_address, null, null, $player_data[0], true);
                }
                //取得情報が取得できた場合
                else
                {
                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                    if (in_array($input_org_id, array_column($org_player_info, 'org_id')))
                    {
                        //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在する");
                        //存在するとき
                        $this->assignRowData($reqData[$rowIndex], "無効データ（重複選手）", $user_id, $player_data[0]->{'player_id'}, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0], false);
                    }
                    //入力値が団体所属情報のorg_id列に存在しない
                    else
                    {
                        //Log::debug("入力値が団体所属情報のorg_id列に存在しない");
                        $this->assignRowData($reqData[$rowIndex], "登録可能", $user_id, $player_data[0]->{'player_id'}, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0],true);
                    }
                }
            }
            //入力組み合わせ④
            elseif (isset($user_id) && !isset($player_id) && !isset($jara_player_code))
            {
                Log::debug("入力組み合わせ④");
                //ユーザーIDだけが入力されているとき
                //ファイルに入力されている「メールアドレス」で「ユーザーテーブル」を検索し、
                //ファイルに入力されている「ユーザーID」と一致するユーザー情報を取得できるか確認
                $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                $temp_password_flag = $user_data[0]->temp_password_flag;
                //Log::debug("temp_password_flag = ".$temp_password_flag);
                if ($temp_password_flag == 0)
                {
                    //Log::debug("本登録の場合");
                    //本登録の場合
                    //ファイルに入力されている「ユーザーID」で「選手テーブル」検索
                    $player_data = $t_players->getPlayerDataFromUserId($user_id);
                    if (empty($player_data))
                    {
                        //Log::debug("選手登録されていなかった場合");
                        //選手登録されていなかった場合
                        $reqData[$rowIndex]['result'] = "選手未登録のため選手登録後、所属選手登録を実施";
                        $reqData[$rowIndex]['userId'] = $user_id;
                        $reqData[$rowIndex]['playerName'] = $player_name;
                        $reqData[$rowIndex]['mailaddress'] = $mail_address;
                        $rowData['checked'] = false;
                    }
                    else
                    {
                        //Log::debug("選手登録されている場合");
                        //選手登録されている場合
                        //所属情報テーブルを取得
                        $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_data->player_id);
                        //Log::debug($org_player_info);
                        if(empty($org_player_info))
                        {
                            //Log::debug("所属情報を取得できなかった場合");
                            $this->assignRowData($reqData[$rowIndex], "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, null, null, $player_data, true);
                        }
                        else
                        {
                            //Log::debug("所属情報を取得できた場合");
                            //団体テーブルから団体名を取得
                            $org_player_org_id = $org_player_info[0]->{'org_id'};
                            $target_organization = $t_organizations->getOrganization($org_player_org_id);
                            //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                            if (in_array($input_org_id, array_column($org_player_info, 'org_id')))
                            {
                                //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在する場合");
                                //存在するとき
                                $this->assignRowData($reqData[$rowIndex], "無効データ（重複選手）", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data,false);
                            }
                            else
                            {
                                //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在しない場合");
                                //入力値が団体所属情報のorg_id列に存在しない
                                $this->assignRowData($reqData[$rowIndex], "登録可能", $user_id, null, null, $player_name, $mail_address, $org_player_org_id, $target_organization->org_name, $player_data,true);
                            }
                        }
                    }
                }
                elseif ($temp_password_flag == 1)
                {
                    Log::debug("仮登録の場合");
                    //仮登録の場合
                    $reqData[$rowIndex]['result'] = "無効データ（仮登録ユーザー）";
                    $reqData[$rowIndex]['userId'] = $user_id;
                    $reqData[$rowIndex]['playerName'] = $player_name;
                    $reqData[$rowIndex]['mailaddress'] = $mail_address;
                    $rowData['checked'] = false;
                }
            }
            //入力組み合わせ⑤
            elseif (!isset($user_id) && isset($player_id) && isset($jara_player_code))
            {
                Log::debug("入力組み合わせ⑤");
                //選手ID、JARA選手コードが全て入力されているとき
                //選手データが登録されているか確認
                $player_data = $t_players->getPlayer($player_id);
                //Log::debug($player_data);
                if (empty($player_data))
                {
                    $this->assignInvalidRowdata('無効データ（未登録選手）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」に値が設定されているか確認
                if (empty($player_data[0]->{'user_id'}))
                {
                    $this->assignInvalidRowdata('無効データ（無効選手ID）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」と紐づく「ユーザーテーブル」.「メールアドレス」と
                //ファイルに入力されている「メールアドレス」が一致するか確認
                $user_data = $t_users->getUserDataFromUserId($player_data[0]->{'user_id'});
                if (in_array($mail_address, array_column($user_data, 'mailaddress')))
                {
                    $this->assignInvalidRowdata('無効データ（メールアドレス不正）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「JARA選手コード」とファイルに入力されている「JARA選手コード」が一致するか確認
                if ($player_data[0]->{'jara_player_id'} != $jara_player_code) 
                {
                    $this->assignInvalidRowdata('無効データ（JARA選手コード不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //所属情報テーブルを取得
                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
                //団体テーブルから団体名を取得
                $target_organization = $t_organizations->getOrganization($input_org_id);
                //選手テーブルから出身地と居住地を取得
                $player_data = $t_players->getPlayersFromPlayerId($player_id);
                //所属情報を取得できなかった場合
                if (empty($org_player_info))
                {
                    //Log::debug("所属情報を取得できなかった場合");
                    $this->assignRowData($reqData[$rowIndex], "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, null, null, $player_data[0], true);
                }
                //取得情報が取得できた場合
                else
                {
                    //Log::debug("所属情報を取得できた場合");
                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                    if (in_array($input_org_id, array_column($org_player_info, 'org_id')))
                    {
                        //存在するとき
                        //Log::debug("入力値が団体所属情報のorg_id列に存在する");
                        $this->assignRowData($reqData[$rowIndex], "無効データ（重複選手）", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0], false);
                    }
                    //入力値が団体所属情報のorg_id列に存在しない
                    else
                    {
                        //Log::debug("入力値が団体所属情報のorg_id列に存在しない");
                        $this->assignRowData($reqData[$rowIndex], "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0], false);
                    }
                }
            }
            //入力組み合わせ⑥
            elseif (!isset($user_id) && isset($player_id) && !isset($jara_player_code))
            {
                Log::debug("入力組み合わせ⑥");
                //選手IDだけが入力されているとき
                //選手データが登録されているか確認
                $player_data = $t_players->getPlayer($player_id);                
                if (empty($player_data))
                {
                    $this->assignInvalidRowdata('無効データ（未登録選手）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」に値が設定されているか確認
                if (empty($player_data[0]->{'user_id'}))
                {
                    $this->assignInvalidRowdata('無効データ（無効選手ID）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」と紐づく「ユーザーテーブル」.「メールアドレス」と
                //ファイルに入力されている「メールアドレス」が一致するか確認
                $user_data = $t_users->getUserDataFromUserId($player_data[0]->{'user_id'});
                if (in_array($mail_address, array_column($user_data, 'mailaddress')))
                {
                    $this->assignInvalidRowdata('無効データ（メールアドレス不正）', $reqData[$rowIndex]);
                    continue;
                }
                //所属情報テーブルを取得
                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_id);
                //団体テーブルから団体名を取得
                $target_organization = $t_organizations->getOrganization($input_org_id);
                //選手テーブルから出身地と居住地を取得
                $player_data = $t_players->getPlayersFromPlayerId($player_id);
                //所属情報を取得できなかった場合
                if (empty($org_player_info))
                {
                    //Log::debug("所属情報を取得できなかった場合");
                    $this->assignRowData($reqData[$rowIndex], "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, null, null, $player_data[0], true);
                }
                //取得情報が取得できた場合
                else
                {
                    //Log::debug("所属情報を取得できた場合");
                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                    if (in_array($input_org_id, array_column($org_player_info, 'org_id')))
                    {
                        //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在する場合");
                        //存在するとき
                        $this->assignRowData($reqData[$rowIndex], "無効データ（重複選手）", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0],false);
                    }
                    //入力値が団体所属情報のorg_id列に存在しない
                    else
                    {
                        //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在しない場合");
                        $this->assignRowData($reqData[$rowIndex], "登録可能", $user_id, $player_id, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0], true);
                    }
                }
            }
            //入力組み合わせ⑦
            elseif (!isset($user_id) && !isset($player_id) && isset($jara_player_code))
            {
                Log::debug("入力組み合わせ⑦");
                //JARA選手コードだけが入力されているとき
                $player_data = $t_players->getPlayerFromJaraPlayerId($jara_player_code);
                //Log::debug($player_data);
                if (empty($player_data))
                {
                    $this->assignInvalidRowdata('無効データ（未登録JARA選手コード）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」に値が設定されているか確認
                if (empty($player_data[0]->{'user_id'}))
                {
                    $this->assignInvalidRowdata('無効データ（連携待ちJARA選手コード）', $reqData[$rowIndex]);
                    continue;
                }
                //「選手テーブル」.「ユーザーID」と紐づく「ユーザーテーブル」.「メールアドレス」と
                //ファイルに入力されている「メールアドレス」が一致するか確認
                $user_data = $t_users->getUserData($player_data[0]->{'user_id'});
                if ($user_data->mailaddress != $mail_address)
                {
                    $this->assignInvalidRowdata('無効データ（メールアドレス不一致）', $reqData[$rowIndex]);
                    continue;
                }
                //所属情報テーブルを取得
                $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_data[0]->{'player_id'});
                //団体テーブルから団体名を取得
                $target_organization = $t_organizations->getOrganization($input_org_id);
                //選手テーブルから出身地と居住地を取得
                $player_data = $t_players->getPlayersFromPlayerId($player_data[0]->{'player_id'});
                //所属情報を取得できなかった場合
                if (empty($org_player_info))
                {
                    //Log::debug("所属情報を取得できなかった場合");
                    $this->assignRowData($reqData[$rowIndex], "登録可能", $user_id, $player_data[0]->{'player_id'}, $jara_player_code, $player_name, $mail_address, null, null, $player_data[0], true);
                }
                //取得情報が取得できた場合
                else
                {
                    //Log::debug("所属情報を取得できた場合");
                    //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                    if (in_array($input_org_id, array_column($org_player_info, 'org_id')))
                    {
                        //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在する場合");
                        //存在するとき
                        $this->assignRowData($reqData[$rowIndex], "無効データ（重複選手）", $user_id, $player_data[0]->{'player_id'}, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0],false);
                    }
                    //入力値が団体所属情報のorg_id列に存在しない
                    else
                    {
                        //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在しない場合");
                        $this->assignRowData($reqData[$rowIndex], "登録可能", $user_id, $player_data[0]->{'player_id'}, $jara_player_code, $player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data[0],true);
                    }
                }
            }
            //入力組み合わせ⑧
            else
            {
                Log::debug("入力組み合わせ⑧");
                //ユーザーID、選手ID、JARA選手コードのいずれも入力されていないとき                        
                //ファイルに記載されている「メールアドレス」で、「ユーザーテーブル」を検索
                $user_data = $t_users->getUserDataFromMailAddress($mail_address);
                //Log::debug($user_data);
                if (empty($user_data))
                {
                    //Log::debug("ユーザー情報が登録されていない場合");
                    //ユーザー情報が登録されていない場合
                    $reqData[$rowIndex]['result'] = "ユーザー未登録";
                    $reqData[$rowIndex]['playerName'] = $player_name;
                    $reqData[$rowIndex]['mailaddress'] = $mail_address;
                    $reqData[$rowIndex]['checked'] = false;
                }
                else
                {
                    //Log::debug("ユーザー情報が登録されていた場合");
                    //ユーザー情報が登録されていた場合
                    $temp_password_flag = $user_data[0]->{'temp_password_flag'};
                    if ($temp_password_flag == 0)
                    {
                        //Log::debug("本登録の場合");
                        //本登録の場合
                        //ファイルに入力されている「ユーザーID」で「選手テーブル」検索
                        //$player_data = $t_players->getPlayerData($user_data[0]->{'user_id'});
                        $player_data = $t_players->getPlayerDataFromUserId($user_data[0]->{'user_id'});
                        //Log::debug(print_r($player_data, true));
                        if (empty($player_data))
                        {
                            //Log::debug("選手登録されていなかった場合");
                            //選手登録されていなかった場合
                            $reqData[$rowIndex]['result'] = "選手未登録のため選手登録後、所属選手登録を実施";
                            $reqData[$rowIndex]['userId'] = $user_id;
                            $reqData[$rowIndex]['playerName'] = $player_name;
                            $reqData[$rowIndex]['mailaddress'] = $mail_address;
                            $reqData[$rowIndex]['checked'] = false;
                        }
                        else
                        {
                            //Log::debug("選手登録されている場合");
                            //選手登録されている場合
                            //所属情報テーブルを取得
                            //Log::debug("player_id = ".$player_data->player_id);
                            $org_player_info = $t_organization_players->getOrganizationPlayersInfoFromPlayerId($player_data->player_id);
                            //団体テーブルから団体名を取得
                            $target_organization = $t_organizations->getOrganization($input_org_id);
                            //Log::debug($org_player_info);
                            if(empty($org_player_info))
                            {
                                //所属情報が取得できなかった場合                                
                                //Log::debug("所属情報を取得できなかった場合");
                                $this->assignRowData($reqData[$rowIndex], "登録可能", $user_data[0]->{'user_id'}, $player_data->player_id, $player_data->jara_player_id, $player_data->player_name, $user_data[0]->{'mailaddress'}, null, null, $player_data,true);                                
                            }
                            else
                            {
                                //Log::debug("所属情報を取得できた場合");
                                //所属情報が取得できた場合
                                //画面の所属団体の入力値が団体所属情報のorg_id列に存在するかをチェック
                                if(in_array($input_org_id, array_column($org_player_info, 'org_id')))
                                {
                                    //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在する場合");
                                    //存在するとき
                                    $this->assignRowData($reqData[$rowIndex], "無効データ（重複選手）", $user_data[0]->{'user_id'}, $player_data->player_id, $player_data->jara_player_id, $player_data->player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data,false);
                                }
                                else
                                {
                                    //Log::debug("画面の所属団体の入力値が団体所属情報のorg_id列に存在しない場合");
                                    //一致しなかった場合
                                    $this->assignRowData($reqData[$rowIndex], "登録可能", $user_data[0]->{'user_id'}, $player_data->player_id, $player_data->jara_player_id, $player_data->player_name, $mail_address, $input_org_id, $target_organization->org_name, $player_data,true);
                                }
                            }
                        }
                    }
                    elseif ($temp_password_flag == 1)
                    {
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
    public function registerOrgCsvData(Request $request,
                                        T_users $t_users,
                                        T_players $t_players,
                                        T_organization_players $t_organization_players)
    {
        Log::debug(sprintf("registerOrgCsvData start"));
        $inputData = $request->all();
        $reqData = $inputData["csvDataList"];
        //Log::debug($reqData);
        $input_org_id = $inputData["targetOrgData"]["targetOrgId"];
        $input_org_name = $inputData["targetOrgData"]["targetOrgName"];
        DB::beginTransaction();
        try
        {
            //登録・更新するユーザー名を取得
            $register_user_id = Auth::user()->user_id;
            //登録・更新日時のために現在の日時を取得
            $current_datetime = now()->format('Y-m-d H:i:s.u');
            for($rowIndex = 0;$rowIndex < count($reqData); $rowIndex++)
            {
                if($reqData[$rowIndex]['checked'] == true && $reqData[$rowIndex]['result'] == "登録可能")
                {
                    //対象のユーザーデータを取得
                    $target_user_data = $t_users->getUserDataFromInputCsv($reqData[$rowIndex]);
                    if(empty($target_user_data))
                    {
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
                        $insert_user_value['user_name'] = $reqData[$rowIndex]['player_name'];
                        $insert_user_value['mailaddress'] = $reqData[$rowIndex]['mailaddress'];
                        $insert_user_value['password'] = $hashed_password;
                        $insert_user_value['temp_password'] = $hashed_password;
                        $insert_user_value['expiry_time_of_temp_password'] = $newDate;
                        $insert_user_value['temp_password_flag'] = 1;
                        $insert_user_value['current_datetime'] = $current_datetime;
                        $insert_user_value['user_id'] = $register_user_id;
                        //insert実行
                        $t_users->insertTemporaryUser($insert_user_value);

                        //For getting current time
                        $mail_date = date('Y/m/d H:i');
                        //For adding 24hour with current time
                        $new_mail_date = date('Y/m/d H:i', strtotime($mail_date . ' + 24 hours'));

                        //Store user information for sending email.
                        // $mail_data = [
                        //     'user_name' => $request->user_name,
                        //     'to_mailaddress' => $request->mailaddress,
                        //     'from_mailaddress' => 'xxxxx@jara.or.jp',
                        //     'temporary_password' => $temp_password,
                        //     'temporary_password_expiration_date' => $new_mail_date
                        // ];

                        //Sending mail to the user
                        //Mail::to($request->get('mailaddress'))->send(new WelcomeMail($mail_data));
                    }
                    //選手情報が存在しているかチェック
                    //直近に挿入した選手のID
                    $insert_player_id = 0;
                    //選手情報を取得
                    $target_player_data = $t_players->getPlayer($reqData[$rowIndex]['player_id']);
                    
                    //対象の選手が選手テーブルに存在するかをチェック
                    if (empty($target_player_data))
                    {
                        //選手未登録の場合、選手テーブルにinsertして通知メールを送信
                        $insert_player_data = [];
                        $insert_player_data['user_id'] = $reqData[$rowIndex]['userId'];
                        $insert_player_data['jara_player_id'] = $reqData[$rowIndex]['jaraPlayerId'];
                        $insert_player_data['player_name'] = $reqData[$rowIndex]['playerName'];
                        $insert_player_data['date_of_birth'] = $target_user_data['date_of_birth'];
                        $insert_player_data['sex_id'] = $target_user_data['sex'];
                        $insert_player_data['height'] = $target_user_data['height'];
                        $insert_player_data['weight'] = $target_user_data['weight'];
                        //$insert_player_data['side_info'] = $rowData['side_info'];
                        $insert_player_data['birth_country'] = $reqData[$rowIndex]['birthCountryId'];
                        $insert_player_data['birth_prefecture'] = $reqData[$rowIndex]['birthPrefectureId'];
                        $insert_player_data['residence_country'] = $reqData[$rowIndex]['residenceCountryId'];
                        $insert_player_data['residence_prefecture'] = $reqData[$rowIndex]['residencePrefectureId'];
                        
                        $insert_player_data['current_datetime'] = $current_datetime;
                        $insert_player_data['user_id'] = $register_user_id;
                        
                        //insertを実行して、insertしたレコードのIDを取得
                        $insert_player_id = $t_players->insertPlayer($insert_player_data);
                    }
                    //団体所属選手テーブルに挿入
                    $insert_organization_player_data = [];
                    $insert_organization_player_data['org_id'] = $input_org_id;
                    //選手IDは入力値になければ直近にinsertした選手IDを代入
                    if (isset($reqData[$rowIndex]['playerId']))
                    {
                        $insert_organization_player_data['player_id'] = $reqData[$rowIndex]['playerId'];
                    }
                    else
                    {
                        $insert_organization_player_data['player_id'] = $insert_player_id;
                    }
                    // $insert_organization_player_data['joining_date'] = $reqData[$rowIndex]['joining_date'];
                    // $insert_organization_player_data['deperture_date'] = $reqData[$rowIndex]['deperture_date'];
                    $insert_organization_player_data['current_datetime'] = $current_datetime;
                    $insert_organization_player_data['user_id'] = $register_user_id;
                    //insertを実行して、insertしたレコードのIDを取得
                    $insert_organization_player_id = $t_organization_players->insertOrganizationPlayer($insert_organization_player_data);
                    
                    //ユーザー種別の更新処理
                    $is_player = $target_user_data['is_player'];
                    if($is_player == 0)
                    {
                        $user_info = array();
                        $user_info['user_info'] = $target_user_data['user_id'];
                        $user_info['input'] = '100';
                        $t_users->updateUserTypeRegist($user_info);
                    }

                    //メール送信
                }
            }
            DB::commit();
            Log::debug(sprintf("registerOrgCsvData end"));
            return response()->json(['result' => $reqData]); //DBの結果を返す
        }
        catch(\Throwable $e)
        {
            DB::rollBack();
            Log::error($e->getMessage());
            return response()->json(['errMessage' => $e->getMessage()]); //エラーメッセージを返す
        }
    }
}