<?php

namespace App\Http\Controllers;

use App\Models\T_organizations;
use App\Models\T_raceResultRecord;
use App\Models\T_tournaments;
use Illuminate\Http\Request;
use Illuminate\View\View;

class TournamentInfoAlignmentController extends Controller
{
    //
    //レース結果一括登録画面呼び出し
    // public function createEntryRegister(Request $request): View
    // {
    //     $csvList = "";
    //     return view('tournament.info_alignment', ["csvList" => $csvList, "errorMsg" => "", "checkList" => ""]);
    // }

    //csv操作
    public function csvReadEntryRegister(Request $request,
                                        T_tournaments $t_tournaments,
                                        T_races $t_races,
                                        T_organizations $t_organizations,
                                        T_players $t_players,
                                        T_raceResultRecord $t_raceResultRecord)
    {
        //csv読み込み
        if($request->has('csvRead'))
        {//参照ボタンクリック
            //拡張子がCSVであるかの確認
            //getClientOriginalExtensionで拡張子を取得
            if ($request->csvFile->getClientOriginalExtension() !== "csv")
            {
                //拡張子がCSVであるかの確認
                //getClientOriginalExtensionで拡張子を取得
                if ($request->csvFile->getClientOriginalExtension() !== "csv") {
                    // throw new Exception('このファイルはCSVファイルではありません');
                    return view('volunteer.info_alignment', ["csvList" => "", "errorMsg" => "このファイルはCSVファイルではありません", "checkList" => ""]);
                }
                //ファイルの保存
                $newCsvFileName = $request->csvFile->getClientOriginalName();                
                $path = $request->csvFile->storeAs('public/csv', $newCsvFileName);                
            }
            elseif(!isset($request->csvFile))
            {
                // throw new Exception('読み込むCSVファイルをフルパスで入力してください。');
                return view('volunteer.info_alignment', ["csvList" => "", "errorMsg" => "読み込むCSVファイルをフルパスで入力してください。", "checkList" => ""]);
            }
            else
            {
                // throw new Exception('ファイルを取得できませんでした');
                return view('volunteer.info_alignment', ["csvList" => "", "errorMsg" => "ファイルを取得できませんでした。<br/>入力したファイルパスを確認してください", "checkList" => ""]);
            }
            //保存したCSVファイルの取得
            $csv = Storage::disk('local')->get("public/csv/{$newCsvFileName}");
            // OS間やファイルで違う改行コードをexplode統一
            $csv = str_replace(array("\r\n", "\r"), "\n", $csv);
            // $csvを元に行単位のコレクション作成。explodeで改行ごとに分解
            $csvList = collect(explode("\n", $csv));
            $csvList = $csvList->toArray();

            //$checkList = array();
            $dataList = array();    //フロントエンドに渡す多次元配列
            $renkei = "";       //読み込み結果
            //$tagName = 0;
            $disabled = "";
            $jaraIdList = array();
            $csv_column_count = 51;
            $csvHeaderLine = "大会ID,エントリー大会ID,大会名,選手ID,JARA選手コード,選手名,レースID,エントリーレースID,レースNo,レース名,レース区分ID,レース区分名,団体ID,エントリー団体コード,団体名,クルー名,組別,種目ID,種目名,距離,順位,500mlapタイム,1000mlapタイム,1500mlapタイム,2000mlapタイム,最終タイム,ストロークレート（平均）,500mストロークレート,1000mストロークレート,1500mストロークレート,2000mストロークレート,心拍数（平均）,500m心拍数,1000m心拍数,1500m心拍数,2000m心拍数,公式／非公式,立ち合い有無,エルゴ体重,選手身長,選手体重,シート番号ID,シート番号,出漕結果記録名,発艇日時,天候,2000m地点風速,2000m地点風向,1000m地点風速,1000m地点風向,備考";

            //フロントエンドで入力された大会ID
            $input_tourn_id = $request->tourn_id;
            //対象の大会情報
            $target_tournament = $t_tournaments->getTournamentInfoFromTournId($input_tourn_id);
            //対象の大会が公式かどうか
            $is_target_tournament_official = $target_tournament['official'];

            //対象の大会に登録されているレース情報
            $target_races = $t_races->getRace($input_tourn_id);
            
            //団体情報
            $organizations = $t_organizations->getOrganizations();
            //選手情報
            $players = $t_players->getPlayers();

            for ($rowIndex = 0; $rowIndex < count($csvList); $rowIndex++)
            {
                $rowArray = array();
                $value = explode(',', $csvList[$rowIndex]); //一行ごとのデータをカンマ区切りでリストに入れる
                //各フィールドの値
                //不正データの場合は全て「-]のため初期値を"-"にしておく
                $rowArray['tourn_id'] = "-";                // 大会ID
                $rowArray['entrysystem_tourn_id'] = "-";    // エントリー大会ID
                $rowArray['tourn_name'] = "-";              // 大会名
                $rowArray['player_id'] = "-";               // 選手ID
                $rowArray['jara_player_code'] = "-";        // JARA選手コード
                $rowArray['player_name'] = "-";             // 選手名
                $rowArray['race_id'] = "-";                 // レースID
                $rowArray['entrysystem_race_id'] = "-";     // エントリーレースID
                $rowArray['race_number'] = "-";             // レースNo
                $rowArray['race_name'] = "-";               // レース名
                $rowArray['race_class_id'] = "-";           // レース区分ID
                $rowArray['race_class_name'] = "-";         // レース区分名
                $rowArray['org_id'] = "-";                  // 団体ID
                $rowArray['entrysystem_org_id'] = "-";      // エントリー団体コード
                $rowArray['org_name'] = "-";                // 団体名
                $rowArray['crew_name'] = "-";               // クルー名
                $rowArray['by_group'] = "-";                // 組別
                $rowArray['event_id'] = "-";                // 種目ID
                $rowArray['event_name'] = "-";              // 種目名
                $rowArray['range'] = "-";                   // 距離
                $rowArray['rank'] = "-";                    // 順位
                $rowArray['laptime_500m'] = "-";            // 500mlapタイム
                $rowArray['laptime_1000m'] = "-";           // 1000mlapタイム
                $rowArray['laptime_1500m'] = "-";           // 1500mlapタイム
                $rowArray['laptime_2000m'] = "-";           // 2000mlapタイム
                $rowArray['final_time'] = "-";              // 最終タイム
                $rowArray['stroke_rate_avg'] = "-";         // ストロークレート（平均）
                $rowArray['stroke_rat_500m'] = "-";         // 500mストロークレート
                $rowArray['stroke_rat_1000m'] = "-";        // 1000mストロークレート
                $rowArray['stroke_rat_1500m'] = "-";        // 1500mストロークレート
                $rowArray['stroke_rat_2000m'] = "-";        // 2000mストロークレート
                $rowArray['heart_rate_avg'] = "-";          // 心拍数（平均）
                $rowArray['heart_rate_500m'] = "-";         // 500m心拍数
                $rowArray['heart_rate_1000m'] = "-";        // 1000m心拍数
                $rowArray['heart_rate_1500m'] = "-";        // 1500m心拍数
                $rowArray['heart_rate_2000m'] = "-";        // 2000m心拍数
                $rowArray['official'] = "-";                // 公式／非公式
                $rowArray['attendance'] = "-";              // 立ち合い有無
                $rowArray['ergo_weight'] = "-";             // エルゴ体重
                $rowArray['player_height'] = "-";           // 選手身長
                $rowArray['player_weight'] = "-";           // 選手体重
                $rowArray['seat_number'] = "-";            // シート番号ID
                $rowArray['seat_name'] = "-";              // シート番号
                $rowArray['race_result_record_name'] = "-"; // 出漕結果記録名
                $rowArray['start_datetime'] = "-";          // 発艇日時
                $rowArray['weather'] = "-";                 // 天候
                $rowArray['wind_speed_2000m_point'] = "-";  // 2000m地点風速
                $rowArray['wind_direction_2000m_point'] = "-";  // 2000m地点風向
                $rowArray['wind_speed_1000m_point'] = "-";      // 1000m地点風速
                $rowArray['wind_direction_1000m_point'] = "-";  // 1000m地点風向
                $rowArray['race_result_notes'] = "-";          // 備考

                if (($csvList[$rowIndex] == $csvHeaderLine) || empty($value[0]) || in_array($value[0], $jaraIdList))
                {
                    continue; //各行がヘッダ行と一致する場合,ユーザーIDがない場合,ユーザーIDが重複リストに含まれている場合、以降の処理を行わない。
                }
                elseif(count($value) != $csv_column_count)
                {
                    //行のデータ個数が正しくない場合
                    $renkei = '無効データ';
                    $disabled = "disabled";
                }
                else
                {
                    //項目のチェック結果
                    $checkResult = true;
                    // 大会ID
                    $rowArray['tourn_id'] = $value[0];
                    if($checkResult == true)
                    {
                        //非公式
                        if($is_target_tournament_official == 0)
                        {
                            $this->checkInteger($rowArray['tourn_id'],5,true,$renkei,$disabled,$checkResult);
                        }
                        //公式
                        else
                        {
                            $this->checkInteger($rowArray['tourn_id'],5,false,$renkei,$disabled,$checkResult);
                        }
                    }
                    // エントリー大会ID
                    $rowArray['entrysystem_tourn_id'] = $value[1];
                    if($checkResult == true)
                    {
                        //非公式
                        if($is_target_tournament_official == 0)
                        {
                            $this->checkInteger($rowArray['entrysystem_tourn_id'],8,false,$renkei,$disabled,$checkResult);
                        }
                        //公式
                        else
                        {
                            $this->checkInteger($rowArray['entrysystem_tourn_id'],8,true,$renkei,$disabled,$checkResult);
                        }

                        //対象大会の既存大会IDが一致するかを確認
                        if($checkResult == true)
                        {
                            $this->checkTableExists($rowArray['entrysystem_tourn_id'],$target_tournament,'entrysystem_tourn_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    // 大会名
                    $rowArray['tourn_name'] = $value[2];
                    if($checkResult == true)
                    {
                        //非公式
                        if($is_target_tournament_official == 0)
                        {
                            $this->checkWithinByte($rowArray['tourn_name'],255,false,$renkei,$disabled,$checkResult);
                        }
                        //公式
                        else
                        {
                            $this->checkWithinByte($rowArray['tourn_name'],255,true,$renkei,$disabled,$checkResult);
                        }
                    }
                    // 選手ID
                    $rowArray['player_id'] = $value[3];
                    if($checkResult == true)
                    {
                        //非公式
                        if($is_target_tournament_official == 0)
                        {
                            $this->checkInteger($rowArray['player_id'],7,false,$renkei,$disabled,$checkResult);
                        }
                        //公式
                        else
                        {
                            $this->checkInteger($rowArray['player_id'],7,true,$renkei,$disabled,$checkResult);
                        }
                    }
                    // JARA選手コード
                    $rowArray['jara_player_code'] = $value[4];
                    if($checkResult == true)
                    {
                        //非公式
                        if($is_target_tournament_official == 0)
                        {
                            if(!(isset($rowArray['jara_player_code']) 
                                    && is_numeric($rowArray['jara_player_code']) 
                                    && mb_strlen($rowArray['jara_player_code']) == 12))
                            {
                                $this->assignInvalidData($renkei,$disabled,$checkResult);
                            }
                        }
                        //公式
                        else
                        {
                            //jara_player_codeにデータがあれば判定する
                            if(isset($rowArray['jara_player_code']))
                            {
                                if(!(is_numeric($rowArray['jara_player_code'])
                                        && mb_strlen($rowArray['jara_player_code']) == 12))
                                {
                                    $this->assignInvalidData($renkei,$disabled,$checkResult);
                                }
                            }
                        }
                    }
                    // 選手名
                    $rowArray['player_name'] = $value[5];
                    if($checkResult == true)
                    {
                        //非公式
                        if($is_target_tournament_official == 0)
                        {
                            $this->checkWithinByte($rowArray['player_name'],100,false,$renkei,$disabled,$checkResult);
                        }
                        //公式
                        else
                        {
                            $this->checkWithinByte($rowArray['player_name'],100,true,$renkei,$disabled,$checkResult);
                        }
                    }
                    // レースID
                    $rowArray['race_id'] = $value[6];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['race_id'],8,true,$renkei,$disabled,$checkResult);
                    }
                    // エントリーレースID
                    $rowArray['entrysystem_race_id'] = $value[7];
                    if($checkResult == true)
                    {
                        //非公式
                        if($is_target_tournament_official == 0)
                        {
                            $this->checkInteger($rowArray['entrysystem_race_id'],8,true,$renkei,$disabled,$checkResult);
                        }
                        //公式
                        else
                        {
                            $this->checkInteger($rowArray['entrysystem_race_id'],8,false,$renkei,$disabled,$checkResult);
                        }
                    }
                    // レースNo
                    $rowArray['race_number'] = $value[8];
                    if($checkResult == true)
                    {
                        //非公式
                        if($is_target_tournament_official == 0)
                        {
                            $this->checkInteger($rowArray['race_number'],3,true,$renkei,$disabled,$checkResult);
                        }
                        //公式
                        else
                        {
                            $this->checkInteger($rowArray['race_number'],3,false,$renkei,$disabled,$checkResult);
                        }
                    }
                    // レース名
                    $rowArray['race_name'] = $value[9];
                    if($checkResult == true)
                    {
                        $this->checkWithinByte($rowArray['race_name'],255,false,$renkei,$disabled,$checkResult);
                    }
                    // レース区分ID
                    $rowArray['race_class_id'] = $value[10];
                    if($checkResult == true)
                    {
                        //非公式
                        if($is_target_tournament_official == 0)
                        {
                            $this->checkInteger($rowArray['race_class_id'],3,true,$renkei,$disabled,$checkResult);
                        }
                        //公式
                        else
                        {
                            $this->checkInteger($rowArray['race_class_id'],3,false,$renkei,$disabled,$checkResult);
                        }
                    }
                    // レース区分名
                    $rowArray['race_class_name'] = $value[11];
                    if($checkResult == true)
                    {
                        //非公式
                        if($is_target_tournament_official == 0)
                        {
                            $this->checkWithinByte($rowArray['race_class_name'],255,false,$renkei,$disabled,$checkResult);
                        }
                        //公式
                        else
                        {
                            $this->checkWithinByte($rowArray['race_class_name'],255,true,$renkei,$disabled,$checkResult);
                        }
                    }
                    // 団体ID
                    $rowArray['org_id'] = $value[12];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['org_id'],4,false,$renkei,$disabled,$checkResult);
                    }
                    // エントリー団体コード
                    $rowArray['entrysystem_org_id'] = $value[13];
                    if($checkResult == true)
                    {
                        if(!(is_numeric($rowArray['entrysystem_org_id']) && mb_strlen($rowArray['entrysystem_org_id']) == 6))
                        {
                            $this->assignInvalidData($renkei,$disabled,$checkResult);
                        }
                    }
                    // 団体名
                    $rowArray['org_name'] = $value[14];
                    if($checkResult == true)
                    {
                        $this->checkWithinByte($rowArray['org_name'],255,false,$renkei,$disabled,$checkResult);
                    }
                    // クルー名
                    $rowArray['crew_name'] = $value[15];
                    if($checkResult == true)
                    {
                        $this->checkWithinByte($rowArray['crew_name'],255,false,$renkei,$disabled,$checkResult);
                    }
                    // 組別
                    $rowArray['by_group'] = $value[16];
                    if($checkResult == true)
                    {
                        $this->checkWithinByte($rowArray['by_group'],255,false,$renkei,$disabled,$checkResult);
                    }
                    // 種目ID
                    $rowArray['event_id'] = $value[17];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['event_id'],3,false,$renkei,$disabled,$checkResult);
                    }
                    // 種目名
                    $rowArray['event_name'] = $value[18];
                    if($checkResult == true)
                    {
                        $this->checkWithinByte($rowArray['event_name'],255,false,$renkei,$disabled,$checkResult);
                    }
                    // 距離
                    $rowArray['range'] = $value[19];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['range'],4,false,$renkei,$disabled,$checkResult);
                    }
                    // 順位
                    $rowArray['rank'] = $value[20];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['rank'],3,false,$renkei,$disabled,$checkResult);
                    }
                    // 500mlapタイム
                    $rowArray['laptime_500m'] = $value[21];
                    if($checkResult == true)
                    {
                        $this->checkDecimal($rowArray['laptime_500m'],"5.2",false,$renkei,$disabled,$checkResult);
                    }
                    // 1000mlapタイム
                    $rowArray['laptime_1000m'] = $value[22];
                    if($checkResult == true)
                    {
                        $this->checkDecimal($rowArray['laptime_1000m'],"5.2",false,$renkei,$disabled,$checkResult);
                    }
                    // 1500mlapタイム
                    $rowArray['laptime_1500m'] = $value[23];
                    if($checkResult == true)
                    {
                        $this->checkDecimal($rowArray['laptime_1500m'],"5.2",false,$renkei,$disabled,$checkResult);
                    }
                    // 2000mlapタイム
                    $rowArray['laptime_2000m'] = $value[24];
                    if($checkResult == true)
                    {
                        $this->checkDecimal($rowArray['laptime_2000m'],"5.2",false,$renkei,$disabled,$checkResult);
                    }
                    // 最終タイム
                    $rowArray['final_time'] = $value[25];
                    if($checkResult == true)
                    {
                        $this->checkDecimal($rowArray['final_time'],"5.2",false,$renkei,$disabled,$checkResult);
                    }
                    // ストロークレート（平均）
                    $rowArray['stroke_rate_avg'] = $value[26];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['stroke_rate_avg'],3,false,$renkei,$disabled,$checkResult);
                    }
                    // 500mストロークレート
                    $rowArray['stroke_rat_500m'] = $value[27];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['stroke_rat_500m'],3,false,$renkei,$disabled,$checkResult);
                    }
                    // 1000mストロークレート
                    $rowArray['stroke_rat_1000m'] = $value[28];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['stroke_rat_1000m'],3,false,$renkei,$disabled,$checkResult);
                    }
                    // 1500mストロークレート
                    $rowArray['stroke_rat_1500m'] = $value[29];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['stroke_rat_1500m'],3,false,$renkei,$disabled,$checkResult);
                    }
                    // 2000mストロークレート
                    $rowArray['stroke_rat_2000m'] = $value[30];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['stroke_rat_2000m'],3,false,$renkei,$disabled,$checkResult);
                    }
                    // 心拍数（平均）
                    $rowArray['heart_rate_avg'] = $value[31];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['heart_rate_avg'],3,false,$renkei,$disabled,$checkResult);
                    }
                    // 500m心拍数
                    $rowArray['heart_rate_500m'] = $value[32];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['heart_rate_500m'],3,false,$renkei,$disabled,$checkResult);
                    }
                    // 1000m心拍数
                    $rowArray['heart_rate_1000m'] = $value[33];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['heart_rate_1000m'],3,false,$renkei,$disabled,$checkResult);
                    }
                    // 1500m心拍数
                    $rowArray['heart_rate_1500m'] = $value[34];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['heart_rate_1500m'],3,false,$renkei,$disabled,$checkResult);
                    }
                    // 2000m心拍数
                    $rowArray['heart_rate_2000m'] = $value[35];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['heart_rate_2000m'],3,false,$renkei,$disabled,$checkResult);
                    }
                    // 公式／非公式
                    $rowArray['official'] = $value[36];
                    if($checkResult == true)
                    {
                        $this->checkZeroOrOne($rowArray['official'],$renkei,$disabled,$checkResult);
                    }
                    // 立ち合い有無
                    $rowArray['attendance'] = $value[37];
                    if($checkResult == true)
                    {
                        $this->checkZeroOrOne($rowArray['attendance'],$renkei,$disabled,$checkResult);
                    }
                    // エルゴ体重
                    $rowArray['ergo_weight'] = $value[38];
                    if($checkResult == true)
                    {
                        $this->checkDecimal($rowArray['ergo_weight'],"3.2",false,$renkei,$disabled,$checkResult);
                    }
                    // 選手身長
                    $rowArray['player_height'] = $value[39];
                    if($checkResult == true)
                    {
                        $this->checkDecimal($rowArray['player_height'],"3.2",false,$renkei,$disabled,$checkResult);
                    }
                    // 選手体重
                    $rowArray['player_weight'] = $value[40];
                    if($checkResult == true)
                    {
                        $this->checkDecimal($rowArray['player_weight'],"3.2",false,$renkei,$disabled,$checkResult);
                    }
                    // シート番号ID
                    $rowArray['seat_number'] = $value[41];
                    if($checkResult == true)
                    {
                        $this->checkInteger($rowArray['seat_number'],3,false,$renkei,$disabled,$checkResult);
                    }
                    // シート番号
                    $rowArray['seat_name'] = $value[42];
                    if($checkResult == true)
                    {
                        $this->checkWithinByte($rowArray['seat_name'],255,false,$renkei,$disabled,$checkResult);
                    }
                    // 出漕結果記録名
                    $rowArray['race_result_record_name'] = $value[43];
                    if($checkResult == true)
                    {
                        $this->checkWithinByte($rowArray['race_result_record_name'],255,false,$renkei,$disabled,$checkResult);
                    }
                    // 発艇日時
                    $rowArray['start_datetime'] = $value[44];
                    if($checkResult == true)
                    {
                        if(!$rowArray['start_datetime'] === date('YYYY/MM/DD H:i', strtotime($rowArray['start_datetime']))) 
                        {
                            $this->assignInvalidData($renkei,$disabled,$checkResult);
                        }
                    }
                    // 天候
                    $rowArray['weather'] = $value[45];
                    if($checkResult == true)
                    {
                        $this->checkWithinByte($rowArray['weather'],255,false,$renkei,$disabled,$checkResult);
                    }
                    // 2000m地点風速
                    $rowArray['wind_speed_2000m_point'] = $value[46];
                    if($checkResult == true)
                    {
                        $this->checkDecimal($rowArray['wind_speed_2000m_point'],"3.2",false,$renkei,$disabled,$checkResult);
                    }
                    // 2000m地点風向
                    $rowArray['wind_direction_2000m_point'] = $value[47];
                    if($checkResult == true)
                    {
                        $this->checkWithinByte($rowArray['wind_direction_2000m_point'],255,false,$renkei,$disabled,$checkResult);
                    }
                    // 1000m地点風速
                    $rowArray['wind_speed_1000m_point'] = $value[48];
                    if($checkResult == true)
                    {
                        $this->checkDecimal($rowArray['wind_speed_1000m_point'],"3.2",false,$renkei,$disabled,$checkResult);
                    }
                    // 1000m地点風向
                    $rowArray['wind_direction_1000m_point'] = $value[49];
                    if($checkResult == true)
                    {
                        $this->checkWithinByte($rowArray['wind_direction_1000m_point'],255,false,$renkei,$disabled,$checkResult);
                    }
                    // 備考
                    $rowArray['race_result_notes'] = $value[50];
                    if($checkResult == true)
                    {
                        $this->checkWithinByte($rowArray['race_result_notes'],255,false,$renkei,$disabled,$checkResult);
                    }

                    //レース情報の一致確認
                    if($checkResult == true)
                    {
                        $is_race_exists = false;    //一致するレースの有無
                        foreach($target_races as $race)
                        {
                            //種目IDがその他、かつレース区分IDがその他の場合
                            if($rowArray['event_id'] == 999 && $rowArray['race_class_id'] == 99)                            
                            {
                                if($race['event_id'] == $rowArray['event_id']                   //種目ID
                                    && $race['event_name'] == $rowArray['event_name']           //種目名
                                    && $race['race_class_id'] == $rowArray['race_class_id']     //レース区分ID
                                    && $race['race_class_name'] == $rowArray['race_class_name'] //レース区分名
                                    && $race['by_group'] == $rowArray['by_group']               //組別
                                    && $race['race_number'] == $rowArray['race_number'])        //レースNo.
                                {
                                    $is_race_exists = true;
                                }
                            }
                            //種目IDがその他の場合
                            elseif($race['event_id'] == 999)
                            {
                                if($race['event_id'] == $rowArray['event_id']                   //種目ID
                                    && $race['event_name'] == $rowArray['event_name']           //種目名
                                    && $race['race_class_id'] == $rowArray['race_class_id']     //レース区分ID
                                    && $race['by_group'] == $rowArray['by_group']               //組別
                                    && $race['race_number'] == $rowArray['race_number'])        //レースNo.
                                {
                                    $is_race_exists = true;
                                }
                            }
                            //レース区分がその他の場合
                            elseif($race['race_class_id'] == 99)
                            {
                                if($race['event_id'] == $rowArray['event_id']                   //種目ID
                                    && $race['race_class_id'] == $rowArray['race_class_id']     //レース区分ID
                                    && $race['race_class_name'] == $rowArray['race_class_name'] //レース区分名
                                    && $race['by_group'] == $rowArray['by_group']               //組別
                                    && $race['race_number'] == $rowArray['race_number'])        //レースNo.
                                {
                                    $is_race_exists = true;
                                }
                            }
                            else
                            {
                                if($race['event_id'] == $rowArray['event_id']                   //種目ID
                                    && $race['race_class_id'] == $rowArray['race_class_id']     //レース区分ID
                                    && $race['by_group'] == $rowArray['by_group']               //組別
                                    && $race['race_number'] == $rowArray['race_number'])        //レースNo.
                                {
                                    $is_race_exists = true;
                                }
                            }

                            if($is_race_exists)
                            {
                                break;
                            }
                        }
                        //一致の結果を確認して登録不可データかどうかを判断する
                        if(!$is_race_exists)
                        {
                            $this->assignInvalidData($renkei,$disabled,$checkResult);
                        }
                    }

                    //団体情報の一致確認
                    if($checkResult == true)
                    {
                        $is_organization_exists = false;
                        foreach($organizations as $organization)
                        {
                            if(isset($entrysystem_org_id))
                            {
                                if($organization['org_id'] == $rowArray['org_id']
                                    && $organization['entrysystem_org_id'] == $entrysystem_org_id)
                                {
                                    $is_organization_exists = true;
                                }
                            }
                            else
                            {
                                if($organization['org_id'] == $rowArray['org_id'])
                                {
                                    $is_organization_exists = true;
                                }
                            }

                            if($is_organization_exists)
                            {
                                break;
                            }
                        }
                        if(!$is_organization_exists)
                        {
                            $this->assignInvalidData($renkei,$disabled,$checkResult);
                        }
                    }

                    //選手情報の一致確認
                    if($checkResult == true)
                    {
                        $is_player_exists = false;
                        foreach($players as $player)
                        {
                            if(isset($jara_player_code))
                            {
                                if($player['player_id'] == $rowArray['player_id']
                                    && $player['jara_player_code'] == $jara_player_code)
                                {
                                    $is_player_exists = true;
                                }
                            }
                            else
                            {
                                if($player['player_id'] == $rowArray['player_id'])
                                {
                                    $is_player_exists = true;
                                }
                            }

                            if($is_player_exists)
                            {
                                break;
                            }
                        }
                        if(!$is_player_exists)
                        {
                            $this->assignInvalidData($renkei,$disabled,$checkResult);
                        }
                    }
                }
                $rowArray['renkei'] = $renkei;
                $rowArray['disabled'] = $disabled;
                //ここまでで作成した行のデータをフロントエンドに返すための配列に追加する
                $dataList[$rowIndex] = $rowArray;
            }
            return $dataList;
        }
        //csv登録
        elseif ($request->has('regist'))
        {
            //入力値（テーブルの各要素）の配列をフロントから受け取る
            //配列は行列の形式、また1行の各フィールドはその名称で取得可能の想定
            $postData = $request->all();
            //foreachで1行ずつ処理
            foreach($postData as $rowData)
            {
                //チェック済み、かつ登録可能データを登録する
                //そうでなければ次の行の処理
                if($rowData['check'] == "checked" 
                    && ($rowData['renkei'] == "新規登録" || $rowData['renkei'] == "更新登録"))
                {
                    //登録・更新するユーザー名を取得
                    $register_user_id = Auth::user()->user_id;
                    //登録・更新日時のために現在の日時を取得
                    $current_datetime = now()->format('Y-m-d H:i:s.u');
                    //削除フラグは全て0で登録する
                    $delete_flag = 0;

                    //出漕結果記録テーブルに挿入する要素を格納するための配列
                    $race_result_record = array();
                    //入力データが公式／非公式を取得
                    $is_official = $rowData['official'];
                    //大会情報が既に登録済みかどうかをチェック
                    //大会情報の検索に必要なデータを変数に用意
                    $tournament_condition_data = array();                    
                    //非公式のとき
                    if($is_official == 0)
                    {
                        $tournament_condition_data['tourn_id'] = $rowData['tourn_id'];
                        $tournament_condition_data['race_id'] = $rowData['race_id'];
                        $tournament_condition_data['player_id'] = $rowData['player_id'];

                        $race_count = $t_raceResultRecord->getTargetUnofficialRaceCount($tournament_condition_data);
                    }
                    //公式のとき
                    else
                    {
                        $tournament_condition_data['entrysystem_tourn_id'] = $rowData['entrysystem_tourn_id'];
                        $tournament_condition_data['entrysystem_race_id'] = $rowData['entrysystem_race_id'];
                        $tournament_condition_data['jara_player_id'] = $rowData['jara_player_id'];

                        $race_count = $t_raceResultRecord->getTargetOfficialRaceCount($tournament_condition_data);
                    }

                    DB::beginTransaction();
                    try
                    {
                        //登録済みならレース結果情報をupdate
                        if($race_count == 1)
                        {
                            if($is_official == 0)
                            {
                                //非公式のレースデータを取得
                                $race_data = $t_raceResultRecord->getTargetUnofficialRace($tournament_condition_data);
                            }
                            else
                            {
                                //公式のレースデータを取得
                                $race_data = $t_raceResultRecord->getTargetOfficialRace($tournament_condition_data);
                            }
                            //更新データの各要素を配列に格納する
                            //DBのテーブルから取得した値を格納
                            $race_result_record['player_id'] = $race_data['player_id'];
                            $race_result_record['jara_player_id'] = $race_data['jara_player_id'];
                            $race_result_record['player_name'] = $race_data['player_name'];
                            $race_result_record['entrysystem_tourn_id'] = $race_data['entrysystem_tourn_id'];
                            $race_result_record['tourn_id'] = $race_data['tourn_id'];
                            $race_result_record['tourn_name'] = $race_data['tourn_name'];
                            $race_result_record['race_id'] = $race_data['race_id'];
                            $race_result_record['entrysystem_race_id'] = $race_data['entrysystem_race_id'];
                            $race_result_record['race_number'] = $race_data['race_number'];
                            $race_result_record['race_name'] = $race_data['race_name'];
                            $race_result_record['org_id'] = $race_data['org_id'];
                            $race_result_record['entrysystem_org_id'] = $race_data['entrysystem_org_id'];
                            $race_result_record['org_name'] = $race_data['org_name'];
                            $race_result_record['player_height'] = $race_data['height'];
                            $race_result_record['player_weight'] = $race_data['weight'];

                            //入力データを格納
                            $race_result_record['crew_name'] = $rowData['crew_name'];
                            $race_result_record['rank'] = $rowData['rank'];
                            $race_result_record['laptime_500m'] = $rowData['laptime_500m'];
                            $race_result_record['laptime_1000m'] = $rowData['laptime_1000m'];
                            $race_result_record['laptime_1500m'] = $rowData['laptime_1500m'];
                            $race_result_record['laptime_2000m'] = $rowData['laptime_2000m'];
                            $race_result_record['final_time'] = $rowData['final_time'];
                            $race_result_record['stroke_rate_avg'] = $rowData['stroke_rate_avg'];
                            $race_result_record['stroke_rat_500m'] = $rowData['stroke_rat_500m'];
                            $race_result_record['stroke_rat_1000m'] = $rowData['stroke_rat_1000m'];
                            $race_result_record['stroke_rat_1500m'] = $rowData['stroke_rat_1500m'];
                            $race_result_record['stroke_rat_2000m'] = $rowData['stroke_rat_2000m'];
                            $race_result_record['heart_rate_avg'] = $rowData['heart_rate_avg'];
                            $race_result_record['heart_rate_500m'] = $rowData['heart_rate_500m'];
                            $race_result_record['heart_rate_1000m'] = $rowData['heart_rate_1000m'];
                            $race_result_record['heart_rate_1500m'] = $rowData['heart_rate_1500m'];
                            $race_result_record['heart_rate_2000m'] = $rowData['heart_rate_2000m'];
                            $race_result_record['official'] = $rowData['official'];
                            $race_result_record['attendance'] = $rowData['attendance'];
                            $race_result_record['ergo_weight'] = $rowData['ergo_weight'];
                            $race_result_record['crew_rep_record_flag'] = $rowData['crew_rep_record_flag'];
                            $race_result_record['m_seat_number'] = $rowData['m_seat_number'];
                            $race_result_record['race_result_record_name'] = $rowData['race_result_record_name'];
                            //その他データを格納
                            $race_result_record['updated_time'] = $register_user_id;
                            $race_result_record['user_id'] = $current_datetime;

                            //更新実行
                            $t_raceResultRecord->updateBulkRaceResultRecord($race_result_record);
                        }
                        //未登録ならレース結果情報をinsertする
                        elseif($race_count == 0)
                        {
                            //大会データをテーブルから取得
                            if(isset($rowData['tourn_id']))
                            {
                                $target_tournament = $t_tournaments->getTournamentInfoFromTournId($rowData['tourn_id']);
                                if(isset($target_tournament))
                                {
                                    $race_result_record['entrysystem_tourn_id'] = $target_tournament['entrysystem_tourn_id'];
                                    $race_result_record['tourn_id'] = $target_tournament['tourn_id'];
                                    $race_result_record['tourn_name'] = $target_tournament['tourn_name'];
                                }
                                else
                                {
                                    $race_result_record['entrysystem_tourn_id'] = $rowData['entrysystem_tourn_id'];
                                    $race_result_record['tourn_id'] = $rowData['tourn_id'];
                                    $race_result_record['tourn_name'] = $rowData['tourn_name'];
                                }
                            }
                            else
                            {
                                $race_result_record['entrysystem_tourn_id'] = $rowData['entrysystem_tourn_id'];
                                $race_result_record['tourn_id'] = $rowData['tourn_id'];
                                $race_result_record['tourn_name'] = $rowData['tourn_name'];
                            }
                            //レースデータをテーブルから取得
                            if(isset($rowData['race_id']))
                            {
                                $target_race = $t_races->getRace($rowData['race_id']);
                                if(isset($target_race))
                                {
                                    $race_result_record['race_id'] = $target_race['race_id'];
                                    $race_result_record['entrysystem_race_id'] = $target_race['entrysystem_race_id'];
                                    $race_result_record['race_name'] = $target_race['race_name'];
                                }
                                else
                                {
                                    $race_result_record['race_id'] = $rowData['race_id'];
                                    $race_result_record['entrysystem_race_id'] = $rowData['entrysystem_race_id'];
                                    $race_result_record['race_name'] = $rowData['race_name'];
                                }
                            }
                            else
                            {
                                $race_result_record['race_id'] = $rowData['race_id'];
                                $race_result_record['entrysystem_race_id'] = $rowData['entrysystem_race_id'];
                                $race_result_record['race_name'] = $rowData['race_name'];
                            }
                            //団体情報をテーブルから取得
                            if(isset($rowData['org_id']))
                            {
                                $target_organization = $t_organizations->getOrganization($rowData['org_id']);
                                if(isset($target_organization))
                                {
                                    $race_result_record['org_id'] = $target_organization['org_id'];
                                    $race_result_record['entrysystem_org_id'] = $target_organization['entrysystem_org_id'];
                                    $race_result_record['org_name'] = $target_organization['org_name'];
                                }
                                else
                                {
                                    $race_result_record['org_id'] = $rowData['org_id'];
                                    $race_result_record['entrysystem_org_id'] = $rowData['entrysystem_org_id'];
                                    $race_result_record['org_name'] = $rowData['org_name'];
                                }
                            }
                            else
                            {
                                $race_result_record['org_id'] = $rowData['org_id'];
                                $race_result_record['entrysystem_org_id'] = $rowData['entrysystem_org_id'];
                                $race_result_record['org_name'] = $rowData['org_name'];
                            }
                            //選手情報をテーブルから取得
                            if(isset($rowData['player_id']))
                            {
                                $target_player = $t_players->getPlayer($rowData['player_id']);
                                if(isset($target_player))
                                {
                                    $race_result_record['player_id'] = $target_player['player_id'];
                                    $race_result_record['jara_player_id'] = $target_player['jara_player_id'];
                                    $race_result_record['player_name'] = $target_player['player_name'];
                                    $race_result_record['player_height'] = $target_player['height'];
                                    $race_result_record['player_weight'] = $target_player['weight'];
                                }
                                else
                                {
                                    $race_result_record['player_id'] = $rowData['player_id'];
                                    $race_result_record['jara_player_id'] = $rowData['jara_player_id'];
                                    $race_result_record['player_name'] = $rowData['player_name'];
                                    $race_result_record['player_height'] = $rowData['player_height'];
                                    $race_result_record['player_weight'] = $rowData['player_weight'];
                                }
                            }
                            else
                            {
                                $race_result_record['player_id'] = $rowData['player_id'];
                                $race_result_record['jara_player_id'] = $rowData['jara_player_id'];
                                $race_result_record['player_name'] = $rowData['player_name'];
                                $race_result_record['player_height'] = $rowData['player_height'];
                                $race_result_record['player_weight'] = $rowData['player_weight'];
                            }
                            //他の要素を$race_result_recordに格納する
                            //入力データを格納
                            $race_result_record['crew_name'] = $rowData['crew_name'];
                            $race_result_record['rank'] = $rowData['rank'];
                            $race_result_record['laptime_500m'] = $rowData['laptime_500m'];
                            $race_result_record['laptime_1000m'] = $rowData['laptime_1000m'];
                            $race_result_record['laptime_1500m'] = $rowData['laptime_1500m'];
                            $race_result_record['laptime_2000m'] = $rowData['laptime_2000m'];
                            $race_result_record['final_time'] = $rowData['final_time'];
                            $race_result_record['stroke_rate_avg'] = $rowData['stroke_rate_avg'];
                            $race_result_record['stroke_rat_500m'] = $rowData['stroke_rat_500m'];
                            $race_result_record['stroke_rat_1000m'] = $rowData['stroke_rat_1000m'];
                            $race_result_record['stroke_rat_1500m'] = $rowData['stroke_rat_1500m'];
                            $race_result_record['stroke_rat_2000m'] = $rowData['stroke_rat_2000m'];
                            $race_result_record['heart_rate_avg'] = $rowData['heart_rate_avg'];
                            $race_result_record['heart_rate_500m'] = $rowData['heart_rate_500m'];
                            $race_result_record['heart_rate_1000m'] = $rowData['heart_rate_1000m'];
                            $race_result_record['heart_rate_1500m'] = $rowData['heart_rate_1500m'];
                            $race_result_record['heart_rate_2000m'] = $rowData['heart_rate_2000m'];
                            $race_result_record['official'] = $rowData['official'];
                            $race_result_record['attendance'] = $rowData['attendance'];
                            $race_result_record['ergo_weight'] = $rowData['ergo_weight'];
                            $race_result_record['crew_rep_record_flag'] = $rowData['crew_rep_record_flag'];
                            $race_result_record['m_seat_number'] = $rowData['m_seat_number'];
                            $race_result_record['race_result_record_name'] = $rowData['race_result_record_name'];
                            //その他データを格納
                            $race_result_record['updated_time'] = $register_user_id;
                            $race_result_record['user_id'] = $current_datetime;

                            //挿入実行
                            $t_raceResultRecord->insertBulkRaceResultRecord($race_result_record);
                        }
                        DB::commit();
                    }
                    catch (\Throwable $e)
                    {
                        DB::rollBack();
                        dd($e);
                        dd("stop");
                    }
                }
            }
        }
    }

    //フロントエンドから大会IDを取得し、
    //大会開催年（西暦）、大会名をフロントエンドへ返す
    public function getTournamentInfo(Request $request,
                                        T_tournaments $t_tournaments)
    {
        $inputValue = $request->all();
        $tourn_id = $inputValue['tourn_id'];
        $tournament = $t_tournaments->getTournamentFromTournId($tourn_id);
        
        return $tournament;
    }

    //データのチェックで不備があったときの変数代入処理
    private function assignInvalidData(&$renkei,&$disabled,&$checkResult)
    {
        $renkei = '登録不可データ';
        $disabled = "disabled";
        $checkResult = false;
    }

    //対象の変数が整数かつX桁以内であることをチェックする
    private function checkInteger($value,$digits,$nullCheck,&$renkei,&$disabled,&$checkResult)
    {
        //nullCheck=trueとしたとき、nullチェックをする
        if($nullCheck && is_null($value))
        {
            $this->assignInvalidData($renkei,$disabled,$checkResult);
        }
        //整数かつX桁以内であることをチェック
        if(!is_int($value) || mb_strlen($value) > $digits)
        {   
            $this->assignInvalidData($renkei,$disabled,$checkResult);
        }
    }

    //対象の変数が0か1であるかをチェックする
    private function checkZeroOrOne($value,&$renkei,&$disabled,&$checkResult)
    {
        //空でない、かつ0または1でないときは登録不可データとする
        if(!isset($value) && !($value == '0' || $value == '1'))
        {
            $this->assignInvalidData($renkei,$disabled,$checkResult);
        }
    }

    //対象の変数が小数かつ指定の桁数であるかを判定する
    //整数部3桁、小数部2桁をチェックしたいときは$format="3.2"とする
    private function isDecimal($value,$format)
    {
        list($il,$dl) = explode(".", $format); 
     
        return (bool) preg_match('/^([0-9]|([1-9][0-9]{1,'.($il-1).'}))(\.[0-9]{1,'.$dl. '}){0,1}$/', $value);
    }

    //対象の変数が小数かつ指定の桁数であるかをチェックする
    private function checkDecimal($value,$format,$nullCheck,&$renkei,&$disabled,&$checkResult)
    {
        //nullチェック
        if($nullCheck && is_null($value))
        {
            $this->$this->assignInvalidData($renkei,$disabled,$checkResult);
        }
        //小数かつ指定の桁数かチェック
        if(!($this->isDecimal($value,$format)))
        {
            $this->assignInvalidData($renkei,$disabled,$checkResult);
        }
    }

    //対象の変数がXバイト以内であることをチェックする
    private function checkWithinByte($value,$byte,$nullCheck,&$renkei,&$disabled,&$checkResult)
    {
        //nullチェック
        if($nullCheck && is_null($value))
        {
            $this->$this->assignInvalidData($renkei,$disabled,$checkResult);
        }
        //Xバイト以内であることをチェック
        if(strlen($value) > $byte)
        {
            $this->$this->assignInvalidData($renkei,$disabled,$checkResult);
        }
    }

    //変数がテーブルの任意の列に含まれるかをチェックする
    private function checkTableExists($value,$table,$column_name,&$renkei,&$disabled,&$checkResult)
    {
        if(!in_array($value,array_column($table,$column_name)))
        {
            $this->assignInvalidData($renkei,$disabled,$checkResult);
        }
    }
}
