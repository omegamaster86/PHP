<?php

namespace App\Http\Controllers;

use App\Models\M_events;
use App\Models\T_organization_players;
use App\Models\T_organizations;
use App\Models\T_players;
use App\Models\M_sex;
use App\Models\M_prefectures;
use App\Models\T_organization_staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class OrganizationPlayersController extends Controller
{
    //団体所属選手登録画面を開く
    public function createEdit($targetOrgId,
                                T_organizations $t_organizations,
                                T_organization_players $t_organization_players)
    {
        if(Auth::user()->temp_password_flag === 1)
        {
            return redirect('user/password-change');
        }
        else
        {
            $organization = $t_organizations->getOrganization($targetOrgId);            
            $org_name = $organization->org_name;
            $organization_players = $t_organization_players->getOrganizationPlayersInfo($targetOrgId);

            return view('organization-players.edit',['org_name'=>$org_name,'org_players'=>$organization_players]);
        }
    }

    //団体選手検索画面を開く
    public function createSearchView($targetOrgId,
                                        T_organizations $t_organizations,
                                        M_sex $m_sex,
                                        M_prefectures $m_prefectures,
                                        M_events $m_events)
    {
        if(Auth::user()->temp_password_flag === 1)
        {
            return redirect('user/password-change');
        }
        else
        {
            $organization = $t_organizations->getOrganization($targetOrgId);
            $org_name = $organization->org_name;
            $sex = $m_sex->getSexList();
            $prefectures = $m_prefectures->getPrefecures();
            $events = $m_events->getEvents();

            return view('organization-players.search',['org_name' => $org_name,
                                                        'm_sex' => $sex,
                                                        'prefectures' => $prefectures,
                                                        'events' => $events]);
        }
    }

    //団体所属追加選手検索画面で、選手を検索する
    public function searchOrganizationPlayers(Request $request,T_organization_players $t_organization_players)
    {
        $searchInfo = $request->all();
        $searchValue = [];
        $searchCondition = $this->generateOrganizationPlayersSearchCondition($searchInfo, $searchValue);
        $players = $t_organization_players->getOrganizationPlayersFromCondition($searchCondition,$searchValue);
        dd($players);
    }

    //団体所属選手を検索するための条件を生成する
    private function generateOrganizationPlayersSearchCondition($searchInfo, &$conditionValue)
    {
        $condition = "";
        //JARA選手コード
        if(isset($searchInfo['jara_player_id']))
        {
            $condition .= "and tp.jara_player_id = :jara_player_id\r\n";
            $conditionValue['jara_player_id'] = $searchInfo['jara_player_id'];
        }
        //選手ID
        if(isset($searchInfo['player_id']))
        {
            $condition .= "and tp.player_id = :player_id\r\n";
            $conditionValue['player_id'] = $searchInfo['player_id'];
        }
        //選手名
        if(isset($searchInfo['player_name']))
        {
            $condition .= "and tp.player_name LIKE :player_name\r\n";
            $conditionValue['player_name'] = "%".$searchInfo['player_name']."%";
        }
        //性別
        if(isset($searchInfo['sex']))
        {
            $condition .= "and `m_sex`.`sex_id` = :sex\r\n";
            $conditionValue['sex'] = $searchInfo['sex'];
        }
        //出身地（都道府県）
        if(isset($searchInfo['birth_prefecture']))
        {
            $condition .= "and bir_pref.pref_id =:birth_prefecture\r\n";
            $conditionValue['birth_prefecture'] = $searchInfo['birth_prefecture'];
        }
        //居住地（都道府県）
        if(isset($searchInfo['residence_prefecture']))
        {
            $condition .= "and res_pref.pref_id =:residence_prefecture\r\n";
            $conditionValue['residence_prefecture'] = $searchInfo['residence_prefecture'];
        }
        //S(ストロークサイド)
        if(isset($searchInfo['side_S']))
        {
            $condition .= "and SUBSTRING(tp.`side_info`,8,1) = 1\r\n";            
        }
        //B(バウサイド)
        if(isset($searchInfo['side_B']))
        {
            $condition .= "and SUBSTRING(tp.`side_info`,7,1) = 1\r\n";
        }
        //X(スカルサイド)
        if(isset($searchInfo['side_X']))
        {
            $condition .= "and SUBSTRING(tp.`side_info`,6,1) = 1\r\n";
        }
        //C(コックスサイド)
        if(isset($searchInfo['side_C']))
        {
            $condition .= "and SUBSTRING(tp.`side_info`,5,1) = 1\r\n";
        }
        //団体ID
        if(isset($searchInfo['org_id']))
        {
            $condition .= "and org.org_id = :org_id\r\n";
            $conditionValue['org_id'] = $searchInfo['org_id'];
        }
        //エントリーシステムID
        if(isset($searchInfo['entry_system_id']))
        {
            $condition .= "and org.entrysystem_org_id =:entry_system_id\r\n";
            $conditionValue['entry_system_id'] = $searchInfo['entry_system_id'];
        }
        //団体名
        if(isset($searchInfo['org_name']))
        {
            $condition .= "and org.org_name LIKE :org_name\r\n";
            $conditionValue['org_name'] = "%".$searchInfo['org_name']."%";
        }
        //出漕大会名
        if(isset($searchInfo['tourn_name']))
        {
            $condition .= "and tour.tourn_name LIKE :tourn_name\r\n";
            $conditionValue['tourn_name'] = "%".$searchInfo['tourn_name']."%";
        }
        //出漕履歴情報
        if(isset($searchInfo['event_id']))
        {
            $condition .= "and trrr.event_id = :event_id\r\n";
            $conditionValue['event_id'] = $searchInfo['event_id'];
        }
        return $condition;
    }

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
    public function csvReadOrganizationPlayerRegister(Request $request, T_organizations $organizations, T_players $players)
    {

        $organization_name_list = $organizations->getOrganizationName();

        if ($request->has('csvRead')) { // 参照ボタンクリック
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
            $dataList = array();
            for ($i = 1; $i < count($csvList); $i++) {
                $value = explode(',', $csvList[$i]);
                $dataList[$i] = $value;
            }

            return view('organizations.player-register', ["dataList" => $dataList, "errorMsg" => "", "checkList" => $checkList, "organization_name_list" => $organization_name_list]);
        } else if ($request->has('dbUpload')) { // 登録ボタンクリック
            $csvData = Session::get('dataList');
            // dd($csvData[1][5]);
            // $result = explode(',', $request->Flag01);
            $result = "1";
            //dd($csvData);
            for ($i = 1; $i < count($csvData); $i++) {
                if ($result == "1") {
                    $tRaceResultRecord::$raceResultRecordInfo['player_id'] = $csvData[$i][17]; //選手ID
                    $tRaceResultRecord::$raceResultRecordInfo['tourn_id'] = $csvData[$i][1]; //大会ID
                    $tRaceResultRecord::$raceResultRecordInfo['race_id'] = $csvData[$i][7]; //レースID
                    $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][10]; //レースNo
                    $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][5]; //レース区分ID 仮実装
                    $tRaceResultRecord::$raceResultRecordInfo['org_id'] = $csvData[$i][12]; //団体ID
                    $tRaceResultRecord::$raceResultRecordInfo['crew_name'] = $csvData[$i][14]; //クルー名
                    $tRaceResultRecord::$raceResultRecordInfo['by_group'] = $csvData[$i][9]; //組別
                    $tRaceResultRecord::$raceResultRecordInfo['event_id'] = $csvData[$i][3]; //種目ID
                    $log = $tRaceResultRecord->insertRaceResultRecord($tRaceResultRecord::$raceResultRecordInfo);
                } else if ($result == "2") {
                    $tRaceResultRecord::$raceResultRecordInfo['player_id'] = $csvData[$i][17]; //選手ID
                    $tRaceResultRecord::$raceResultRecordInfo['tourn_id'] = $csvData[$i][1]; //大会ID
                    $tRaceResultRecord::$raceResultRecordInfo['race_id'] = $csvData[$i][7]; //レースID
                    $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][10]; //レースNo
                    $tRaceResultRecord::$raceResultRecordInfo['race_number'] = $csvData[$i][5]; //レース区分ID 仮実装
                    $tRaceResultRecord::$raceResultRecordInfo['org_id'] = $csvData[$i][12]; //団体ID
                    $tRaceResultRecord::$raceResultRecordInfo['crew_name'] = $csvData[$i][14]; //クルー名
                    $tRaceResultRecord::$raceResultRecordInfo['by_group'] = $csvData[$i][9]; //組別
                    $tRaceResultRecord::$raceResultRecordInfo['event_id'] = $csvData[$i][3]; //種目ID
                    $tRaceResultRecord->updateRaceResultRecord($tRaceResultRecord::$raceResultRecordInfo);
                } else {
                    continue;
                }
            }
            //dd($playersInfo);

            return view('tournament.entry-register', ["dataList" => [], "errorMsg" => $log, "checkList" => "", "tournament_name_list" => $tournament_name_list]);
        } else {
            return view('tournament.entry-register', ["dataList" => [], "errorMsg" => "", "checkList" => "", "tournament_name_list" => $tournament_name_list]);
        }
    }
}