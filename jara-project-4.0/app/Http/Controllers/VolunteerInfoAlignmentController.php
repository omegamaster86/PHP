<?php

namespace App\Http\Controllers;

use App\Models\T_users;
use App\Models\T_volunteers;
use App\Models\M_sex;
use App\Models\M_countries;
use App\Models\M_prefectures;
use App\Models\M_clothes_size;
use App\Models\M_volunteer_qualifications;
use App\Models\M_languages;
use App\Models\M_language_proficiency;
use App\Models\T_volunteer_availables;
use App\Models\T_volunteer_language_proficiency;
use App\Models\T_volunteer_qualifications_hold;
use App\Models\T_volunteer_supportable_disability;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Session;

class VolunteerInfoAlignmentController extends Controller
{
    //ボランティア一括登録画面呼び出し
    public function createInfoAlignment(Request $request): View
    {
        $csvList = "";
        return view('volunteer.info_alignment', ["csvList" => $csvList, "errorMsg" => "", "checkList" => ""]);
    }

    //読み込むボタンを押下
    public function csvread(Request $request,
                            T_volunteers $t_volunteers,
                            T_users $t_users,
                            M_sex $m_sex,
                            M_countries $m_countries,
                            M_prefectures $m_prefectures,
                            M_clothes_size $m_clothes_size,
                            M_volunteer_qualifications $m_volunteer_qualifications,
                            M_languages $m_languages,
                            M_language_proficiency $m_language_proficiency,
                            T_volunteer_availables $t_volunteer_availables,
                            T_volunteer_qualifications_hold $t_volunteer_qualifications_hold,
                            T_volunteer_language_proficiency $t_volunteer_language_proficiency,
                            T_volunteer_supportable_disability $t_volunteer_supportable_disability): View
    {
        if ($request->has('csvRead'))
        { // 参照ボタンクリック
            // CSVファイルが存在するかの確認
            if ($request->hasFile('csvFile'))
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

            $checkList = array();
            $dataList = "";
            $renkei = "";       //読み込み結果
            $tagName = 0;
            $disabled = "";
            $jaraIdList = array();
            $csvHeaderLine = "ユーザーID,氏名,生年月日,性別,居住地（国）,居住地（都道府県）,メールアドレス,電話番号,服のサイズ,PR1,PR2,PR3,保有資格1,保有資格2,保有資格3,保有資格4,保有資格5,言語1,言語1語学力,言語2,言語2語学力,言語3,言語3語学力,日曜日,月曜日,火曜日,水曜日,木曜日,金曜日,土曜日,早朝,午前,午後,夜";

            //各マスターからIDの一覧を取得
            //ユーザーIDの一覧
            $user_id_list = $t_users->getUserIDList();
            //ボランティアの一覧
            $volunteer_list = $t_volunteers->getVolunteer();
            //性別の一覧
            $sex_list = $m_sex->getSexList();
            //国の一覧
            $country_list = $m_countries->getCountries();
            //都道府県の一覧
            $prefecture_list = $m_prefectures->getPrefecures();
            //服のサイズ
            $clothes_size_list = $m_clothes_size->getClothesSize();
            //ボランティア保有資格の一覧
            $qualifications_list = $m_volunteer_qualifications->getQualifications();
            //言語の一覧
            $language_list = $m_languages->getLanguages();
            //言語レベルの一覧
            $language_proficientcy_list = $m_language_proficiency->getLanguageProficiency();

            for ($i = 0; $i < count($csvList); $i++)
            {
                $value = explode(',', $csvList[$i]); //一行ごとのデータをカンマ区切りでリストに入れる
                //各フィールドの値
                //不正データの場合は全てNULLのため初期値をNULLにしておく
                $user_id = "NULL";            //ユーザーID
                $volunteer_name = "NULL";    //氏名
                $date_of_birth = "NULL";     //生年月日
                $residence = "NULL";        //居住地
                $sex = "NULL";              //性別
                $cloth_size = "NULL";       //服のサイズ
                $mail_address = "NULL";     //メールアドレス
                $telephone_number = "NULL";  //電話番号
                $PR1 = "NULL";              //PR1
                $PR1_display = "NULL";      //PR1表示記号
                $PR2 = "NULL";              //PR2
                $PR2_display = "NULL";      //PR2表示記号
                $PR3 = "NULL";              //PR3
                $PR3_display = "NULL";      //PR3表示記号
                $qualification1 = "NULL";   //保有資格1
                $qualification2 = "NULL";   //保有資格2
                $qualification3 = "NULL";   //保有資格3
                $qualification4 = "NULL";   //保有資格4
                $qualification5 = "NULL";   //保有資格5
                $language1 = "NULL";        //言語1
                $proficiency1 = "NULL";     //言語レベル1
                $language2 = "NULL";        //言語2
                $proficiency2 = "NULL";     //言語レベル2
                $language3 = "NULL";        //言語3
                $proficiency3 = "NULL";     //言語レベル3
                $sunday = "NULL";           //日曜日
                $monday = "NULL";           //月曜日
                $tuesday = "NULL";          //火曜日
                $wednesday = "NULL";        //水曜日
                $thursday = "NULL";         //木曜日
                $friday = "NULL";           //金曜日
                $saturday = "NULL";         //土曜日
                $early_morning = "NULL";    //早朝
                $morning = "NULL";          //午前
                $afternoon = "NULL";        //午後
                $night = "NULL";            //夜
                if (($csvList[$i] == $csvHeaderLine) || empty($value[0]) || in_array($value[0], $jaraIdList))
                {
                    continue; //各行がヘッダ行と一致する場合,ユーザーIDがない場合,ユーザーIDが重複リストに含まれている場合、以降の処理を行わない。
                }
                elseif(count($value) != 34)
                {
                    //行のデータ個数が正しくない場合
                    $renkei = '無効データ';
                    $disabled = "disabled";
                }
                else
                {
                    //項目のチェック結果
                    $checkResult = true;
                    //ユーザーID
                    $user_id = $value[0];
                    if($checkResult == true)
                    {
                        //空文字でない、整数7桁以下をチェック
                        $this->checkInteger($user_id,7,true,$renkei,$disabled,$checkResult);
                     }
                    //氏名
                    $volunteer_name = $value[1];
                    if($checkResult == true)
                    {
                        //空文字でない、50文字以下をチェック
                        if(empty($volunteer_name) || mb_strlen($volunteer_name) > 50)
                        {   
                            $this->assignInvalidData($renkei,$disabled,$checkResult);
                        }
                    }
                    //生年月日
                    $date_of_birth = $value[2];
                    if($checkResult == true)
                    {
                        //空文字でない、YYYY/MM/DDの形式で日付として適切であるかチェック
                        if(empty($date_of_birth) || !preg_match('/^(19|20)[0-9]{2}\/\d{2}\/\d{2}$/', $date_of_birth))
                        {   
                            $this->assignInvalidData($renkei,$disabled,$checkResult);
                        }
                    }                    
                    //性別
                    $sex = $value[3];
                    if($checkResult == true)
                    {
                        //空文字でない、2桁以下の整数であることをチェック
                        $this->checkInteger($sex,2,true,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($sex,$sex_list,'sex_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    //居住地（国）
                    $country = $value[4];
                    if($checkResult == true)
                    {
                        //空文字でない、3桁以内の整数であることをチェック
                        $this->checkInteger($country,3,false,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($country,$country_list,'country_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    // 居住地（都道府県）
                    $prefecture = $value[5];
                    if($checkResult == true)
                    {
                        //空文字でない、桁以内の整数であることをチェック
                        $this->checkInteger($prefecture,2,false,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($prefecture,$prefecture_list,'pref_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    // メールアドレス
                    $mail_address = $value[6];
                    if($checkResult == true)
                    {
                        //空文字でない、YYYY/MM/DDの形式で日付として適切であるかチェック
                        if(empty($mail_address) || !filter_var($mail_address, FILTER_VALIDATE_EMAIL))
                        {   
                            $this->assignInvalidData($renkei,$disabled,$checkResult);
                        }
                    }
                    // 電話番号
                    $telephone_number = $value[7];
                    if($checkResult == true)
                    {
                        //空文字でない、桁以内の整数であることをチェック
                        $this->checkInteger($telephone_number,15,false,$renkei,$disabled,$checkResult);
                    }
                    // 服のサイズ
                    $cloth_size = $value[8];
                    if($checkResult == true)
                    {
                        //空文字でない、桁以内の整数であることをチェック
                        $this->checkInteger($cloth_size,1,true,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($cloth_size,$clothes_size_list,'clothes_size_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    // PR1
                    $PR1 = $value[9];
                    if($checkResult == true && mb_strlen($PR1) > 0)
                    {
                        $this->checkZeroOrOne($PR1,$renkei,$disabled,$checkResult);
                        $PR1_display = $this->convertPRtoDisplaySign($PR1);
                    }
                    // PR2
                    $PR2 = $value[10];
                    if($checkResult == true && mb_strlen($PR2) > 0)
                    {
                        $this->checkZeroOrOne($PR2,$renkei,$disabled,$checkResult);
                        $PR2_display = $this->convertPRtoDisplaySign($PR2);
                    }
                    // PR3
                    $PR3 = $value[11];                    
                    if($checkResult == true && mb_strlen($PR3) > 0)
                    {
                        $this->checkZeroOrOne($PR3,$renkei,$disabled,$checkResult);
                        $PR3_display = $this->convertPRtoDisplaySign($PR3);
                    }
                    // 保有資格1
                    $qualification1 = $value[12];
                    if($checkResult == true && mb_strlen($qualification1) > 0)
                    {
                        //空文字でない、桁以内の整数であることをチェック
                        $this->checkInteger($qualification1,3,false,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($qualification1,$qualifications_list,'qual_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    // 保有資格2
                    $qualification2 = $value[13];
                    if($checkResult == true && mb_strlen($qualification2) > 0)
                    {
                        //空文字でない、桁以内の整数であることをチェック
                        $this->checkInteger($qualification2,3,false,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($qualification2,$qualifications_list,'qual_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    // 保有資格3
                    $qualification3 = $value[14];
                    if($checkResult == true && mb_strlen($qualification3) > 0)
                    {
                        //空文字でない、桁以内の整数であることをチェック
                        $this->checkInteger($qualification3,3,false,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($qualification3,$qualifications_list,'qual_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    // 保有資格4
                    $qualification4 = $value[15];
                    if($checkResult == true && mb_strlen($qualification4) > 0)
                    {
                        //空文字でない、桁以内の整数であることをチェック
                        $this->checkInteger($qualification4,3,false,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($qualification4,$qualifications_list,'qual_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    // 保有資格5
                    $qualification5 = $value[16];
                    if($checkResult == true && mb_strlen($qualification5) > 0)
                    {
                        //空文字でない、桁以内の整数であることをチェック
                        $this->checkInteger($qualification5,3,false,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($qualification5,$qualifications_list,'qual_id',$renkei,$disabled,$checkResult);
                        }
                    }                    
                    // 言語1
                    $language1 = $value[17];
                    if($checkResult == true && mb_strlen($language1) > 0)
                    {
                        //空文字でない、桁以内の整数であることをチェック
                        $this->checkInteger($language1,3,false,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($language1,$language_list,'lang_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    // 言語1語学力
                    $proficiency1 = $value[18];
                    if($checkResult == true && mb_strlen($proficiency1) > 0)
                    {
                        //空文字でない、桁以内の整数であることをチェック
                        $this->checkInteger($proficiency1,3,false,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($proficiency1,$language_proficientcy_list,'lang_pro_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    // 言語2
                    $language2 = $value[19];
                    if($checkResult == true && mb_strlen($language2) > 0)
                    {
                        //空文字でない、桁以内の整数であることをチェック
                        $this->checkInteger($language2,3,false,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($language2,$language_list,'lang_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    // 言語2語学力
                    $proficiency2 = $value[20];
                    if($checkResult == true && mb_strlen($proficiency2) > 0)
                    {
                        //空文字でない、桁以内の整数であることをチェック
                        $this->checkInteger($proficiency2,3,false,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($proficiency2,$language_proficientcy_list,'lang_pro_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    // 言語3
                    $language3 = $value[21];
                    if($checkResult == true && mb_strlen($language3) > 0)
                    {
                        //空文字でない、桁以内の整数であることをチェック
                        $this->checkInteger($language3,3,false,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($language3,$language_list,'lang_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    // 言語3語学力
                    $proficiency3 = $value[22];
                    if($checkResult == true && mb_strlen($proficiency3) > 0)
                    {
                        //空文字でない、桁以内の整数であることをチェック
                        $this->checkInteger($proficiency3,3,false,$renkei,$disabled,$checkResult);
                        if($checkResult == true)
                        {
                            //マスターデータに含まれるIDかチェック
                            $this->checkMasterExists($proficiency3,$language_proficientcy_list,'lang_pro_id',$renkei,$disabled,$checkResult);
                        }
                    }
                    // 日曜日
                    $sunday = $value[23];
                    if($checkResult == true && mb_strlen($proficiency1) > 0)
                    {
                        $this->checkZeroOrOne($sunday,$renkei,$disabled,$checkResult);
                    }
                    // 月曜日
                    $monday = $value[24];
                    if($checkResult == true && mb_strlen($proficiency1) > 0)
                    {
                        $this->checkZeroOrOne($monday,$renkei,$disabled,$checkResult);
                    }
                    // 火曜日
                    $tuesday = $value[25];
                    if($checkResult == true && mb_strlen($proficiency1) > 0)
                    {
                        $this->checkZeroOrOne($tuesday,$renkei,$disabled,$checkResult);
                    }
                    // 水曜日
                    $wednesday = $value[26];
                    if($checkResult == true && mb_strlen($proficiency1) > 0)
                    {
                        $this->checkZeroOrOne($wednesday,$renkei,$disabled,$checkResult);
                    }
                    // 木曜日
                    $thursday = $value[27];
                    if($checkResult == true && mb_strlen($proficiency1) > 0)
                    {
                        $this->checkZeroOrOne($thursday,$renkei,$disabled,$checkResult);
                    }
                    // 金曜日
                    $friday = $value[28];
                    if($checkResult == true && mb_strlen($proficiency1) > 0)
                    {
                        $this->checkZeroOrOne($friday,$renkei,$disabled,$checkResult);
                    }
                    // 土曜日
                    $saturday = $value[29];
                    if($checkResult == true && mb_strlen($proficiency1) > 0)
                    {
                        $this->checkZeroOrOne($saturday,$renkei,$disabled,$checkResult);
                    }
                    // 早朝
                    $early_morning = $value[30];
                    if($checkResult == true && mb_strlen($proficiency1) > 0)
                    {
                        $this->checkZeroOrOne($early_morning,$renkei,$disabled,$checkResult);
                    }
                    // 午前
                    $morning = $value[31];
                    if($checkResult == true && mb_strlen($proficiency1) > 0)
                    {
                        $this->checkZeroOrOne($morning,$renkei,$disabled,$checkResult);
                    }
                    // 午後
                    $afternoon = $value[32];
                    if($checkResult == true && mb_strlen($proficiency1) > 0)
                    {
                        $this->checkZeroOrOne($afternoon,$renkei,$disabled,$checkResult);
                    }
                    // 夜
                    $night = $value[33];
                    if($checkResult == true && mb_strlen($proficiency1) > 0)
                    {
                        $this->checkZeroOrOne($night,$renkei,$disabled,$checkResult);
                    }

                    //ユーザーIDの重複チェック                    
                    //マスターデータに含まれるIDかチェック                            
                    if(in_array($user_id,array_column($volunteer_list,'user_id')))
                    {
                        $renkei = '重複データ';
                        $disabled = "enabled";
                        $checkResult = false;
                    }
                    
                    if($checkResult == true)
                    {
                        $renkei = '登録可能データ';
                        $disabled = "enabled";
                    }
                }
                array_push($checkList, 0); //連携状態チェック用リストに初期値を追加                
                $tagData1 = "<tr><td nowrap><input " . $disabled . " class=\"checkval\" type=\"checkbox\" name=\"" . $tagName . "\" onchange=\"checkChange(event)\"></td><td nowrap class=\"renkei\">" . $renkei;
                $tagData2 = "</td><td nowrap>" . $user_id             //ユーザーID
                            . "</td><td nowrap>" . $volunteer_name    //氏名
                            . "</td><td nowrap>" . $date_of_birth     //生年月日
                            . "</td><td nowrap>" . $residence         //居住地
                            . "</td><td nowrap>" . $sex               //性別
                            . "</td><td nowrap>" . $cloth_size        //服のサイズ
                            . "</td><td nowrap>" . $mail_address      //メールアドレス
                            . "</td><td nowrap>" . $telephone_number  //電話番号
                            . "</td><td nowrap>" . $PR1_display       //PR1
                            . "</td><td nowrap>" . $PR2_display       //PR2
                            . "</td><td nowrap>" . $PR3_display       //PR3
                            //保有資格情報
                            . "</td><td nowrap>" . $qualification1    //保有資格1
                            . "</td><td nowrap>" . $qualification2    //保有資格2
                            . "</td><td nowrap>" . $qualification3    //保有資格3
                            . "</td><td nowrap>" . $qualification4    //保有資格4
                            . "</td><td nowrap>" . $qualification5    //保有資格5
                            //言語
                            . "</td><td nowrap>" . $language1         //言語1
                            . "</td><td nowrap>" . $proficiency1      //言語レベル1
                            . "</td><td nowrap>" . $language2         //言語2
                            . "</td><td nowrap>" . $proficiency2      //言語レベル2
                            . "</td><td nowrap>" . $language3        //言語3
                            . "</td><td nowrap>" . $proficiency3      //言語レベル3
                            //参加しやすい曜日
                            . "</td><td nowrap>" . $sunday          //日曜日
                            . "</td><td nowrap>" . $monday          //月曜日
                            . "</td><td nowrap>" . $tuesday         //火曜日
                            . "</td><td nowrap>" . $wednesday       //水曜日
                            . "</td><td nowrap>" . $thursday        //木曜日
                            . "</td><td nowrap>" . $friday          //金曜日
                            . "</td><td nowrap>" . $saturday        //土曜日
                            //参加しやすい時間帯
                            . "</td><td nowrap>" . $early_morning   //早朝
                            . "</td><td nowrap>" . $morning         //午前
                            . "</td><td nowrap>" . $afternoon       //午後
                            . "</td><td nowrap>" . $night           //夜
                            . "</td></tr>";
                $dataList .= $tagData1 . $tagData2;
                $disabled = "";
                $tagName++;
            }
            return view('volunteer.info_alignment', ["csvList" => $dataList, "errorMsg" => "", "checkList" => $checkList]);
        }
        elseif ($request->has('regist')) { // 連携ボタンクリック

            //入力値（テーブルの各要素）の配列をフロントから受け取る
            //配列は行列の形式、また1行の各フィールドはその名称で取得可能の想定
            $postData = $request->all();
            //foreachで1行ずつ処理
            foreach($postData as $rowData)
            {
                //チェック済み、かつ登録可能データを登録する
                //そうでなければ次の行の処理
                if($rowData['check'] == "checked" && $rowData['renkei'] == "登録可能データ")
                {
                    //登録・更新するユーザー名を取得
                    $register_user_id = Auth::user()->user_id;
                    //登録・更新日時のために現在の日時を取得
                    $current_datetime = now();
                    //削除フラグは全て0で登録する
                    $delete_flag = 0;

                    //ボランティアテーブルに挿入するための要素を格納する
                    $volunteer_data = array();
                    //ボランティアアベイラブルテーブルに挿入するための要素を格納する
                    $volunteer_available_data = array();
                    //ボランティア支援可能障碍タイプテーブルに挿入
                    $volunteer_supportable_disability = array();
                    //ボランティア保有資格情報テーブルに挿入
                    $volunteer_qualifications_hold_data = array();
                    //ボランティ言語レベルテーブルに挿入
                    $volunteer_language_proficiency_data = array();

                    DB::beginTransaction();
                    try
                    {
                        //Insertの要素を持つ配列を生成する
                        //ボランティアテーブル
                        $volunteer_data['user_id'] = $rowData['user_id'];
                        $volunteer_data['volunteer_name'] = $rowData['volunteer_name'];
                        $volunteer_data['residence_country'] = $rowData['residence_country'];
                        $volunteer_data['residence_prefecture'] = $rowData['residence_prefecture'];
                        $volunteer_data['sex'] = $rowData['sex'];
                        $volunteer_data['date_of_birth'] = $rowData['date_of_birth'];
                        $volunteer_data['dis_type_id'] = $rowData['dis_type_id'];
                        $volunteer_data['telephone_number'] = $rowData['telephone_number'];
                        $volunteer_data['mailaddress'] = $rowData['mailaddress'];
                        //users_email_flagはここで判定する必要がある？
                        $volunteer_data['users_email_flag'] = $rowData['users_email_flag'];                    
                        $volunteer_data['clothes_size'] = $rowData['clothes_size'];
                        $volunteer_data['registered_time'] = $current_datetime;
                        $volunteer_data['registered_user_id'] = $register_user_id;
                        $volunteer_data['updated_time'] = $current_datetime;
                        $volunteer_data['updated_user_id'] = $register_user_id;
                        $volunteer_data['delete_flag'] = $delete_flag;                        
                        //ボランティアテーブルに挿入して、そのvolunteer_idを取得する
                        $volunteer_id = $t_volunteers->insertVolunteer($volunteer_data);

                        //ボランティアアベイラブルテーブル
                        $volunteer_available_data['volunteer_id'] = $volunteer_id;
                        //※データの持ち方次第でday_of_weekを生成する必要がある
                        $volunteer_available_data['day_of_week'] = $rowData['day_of_week'];
                        //※データの持ち方次第でtime_zoneを生成する必要がある
                        $volunteer_available_data['time_zone'] = $rowData['time_zone'];
                        $volunteer_available_data['registered_time'] = $current_datetime;
                        $volunteer_available_data['registered_user_id'] = $register_user_id;
                        $volunteer_available_data['updated_time'] = $current_datetime;
                        $volunteer_available_data['updated_user_id'] = $register_user_id;
                        $volunteer_available_data['delete_flag'] = $delete_flag;                        
                        $t_volunteer_availables->insertVolunteerAvailables($volunteer_available_data);
                        
                        //ボランティア支援可能障碍タイプテーブル                        
                        $volunteer_supportable_disability['volunteer_id'] = $volunteer_id;                        
                        $volunteer_supportable_disability['registered_time'] = $current_datetime;
                        $volunteer_supportable_disability['registered_user_id'] = $register_user_id;
                        $volunteer_supportable_disability['updated_time'] = $current_datetime;
                        $volunteer_supportable_disability['updated_user_id'] = $register_user_id;
                        $volunteer_supportable_disability['delete_flag'] = $delete_flag;
                        //PR1が1なら挿入
                        if(isset($rowData['PR1']) && $rowData['PR1'] == '1')
                        {
                            $volunteer_supportable_disability['dis_type_id'] = $rowData['PR1'];
                            $t_volunteer_supportable_disability->insertVolunteerSupportableDisability($volunteer_supportable_disability);
                        }
                        //PR2が1なら挿入
                        if(isset($rowData['PR2']) && $rowData['PR2'] == '1')
                        {
                            $volunteer_supportable_disability['dis_type_id'] = $rowData['PR2'];
                            $t_volunteer_supportable_disability->insertVolunteerSupportableDisability($volunteer_supportable_disability);
                        }
                        //PR3が1なら挿入
                        if(isset($rowData['PR3']) && $rowData['PR3'] == '1')
                        {
                            $volunteer_supportable_disability['dis_type_id'] = $rowData['PR3'];
                            $t_volunteer_supportable_disability->insertVolunteerSupportableDisability($volunteer_supportable_disability);
                        }

                        //ボランティア保有資格情報テーブルに挿入
                        //volunteer_id
                        $volunteer_qualifications_hold_data['volunteer_id'] = $volunteer_id;                        
                        $volunteer_qualifications_hold_data['registered_time'] = $current_datetime;
                        $volunteer_qualifications_hold_data['registered_user_id'] = $register_user_id;
                        $volunteer_qualifications_hold_data['updated_time'] = $current_datetime;
                        $volunteer_qualifications_hold_data['updated_user_id'] = $register_user_id;
                        $volunteer_qualifications_hold_data['delete_flag'] = $delete_flag;
                        for ($i = 1; $i <= 5; $i++)
                        {
                            if(isset($rowData['qualification'.$i]))
                            {
                                //資格の数だけInsertを実行
                                $volunteer_qualifications_hold_data['qual_id'] = $rowData['qualification'.$i];
                                if(isset($rowData['others_qual1']))
                                {
                                    $volunteer_qualifications_hold_data['others_qual'] = $rowData['others_qual'.$i];
                                }
                                $t_volunteer_qualifications_hold->insertVolunteerQualificationsHold($volunteer_qualifications_hold_data);
                            }
                        }
                        
                        //ボランティア言語レベルテーブルに挿入
                        $volunteer_language_proficiency_data['volunteer_id'] = $volunteer_id;
                        $volunteer_language_proficiency_data['registered_time'] = $current_datetime;
                        $volunteer_language_proficiency_data['registered_user_id'] = $register_user_id;
                        $volunteer_language_proficiency_data['updated_time'] = $current_datetime;
                        $volunteer_language_proficiency_data['updated_user_id'] = $register_user_id;
                        $volunteer_language_proficiency_data['delete_flag'] = $delete_flag;
                        for($i = 0;$i<=3;$i++)
                        {
                            if(isset($rowData['language'.$i]) && isset($rowData['lang_pro'.$i]))
                            {
                                $volunteer_language_proficiency_data['lang_id'] = $rowData['language'.$i];
                                $volunteer_language_proficiency_data['lang_pro'] = $rowData['lang_pro'.$i];
                            }
                            $t_volunteer_language_proficiency->insertVolunteerLanguageProficiency($volunteer_language_proficiency_data);
                        }
                    }
                    catch (\Throwable $e)
                    {
                        DB::rollBack();
                        dd($e);
                        dd("stop");
                    }
                }
            }
            
            //画面を表示
            //return view('player.info_alignment', ["csvList" => "", "errorMsg" => $log, "checkList" => ""]);
        }
        else
        {
            return view('volunteer.info_alignment', ["csvList" => "", "errorMsg" => "", "checkList" => ""]);            
        }
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
        if(!is_numeric($value) || mb_strlen($value) > $digits)
        {   
            $this->assignInvalidData($renkei,$disabled,$checkResult);
        }
    }

    //変数がマスターの任意の列に含まれるかをチェックする
    private function checkMasterExists($value,$master,$column_name,&$renkei,&$disabled,&$checkResult)
    {
        if(!in_array($value,array_column($master,$column_name)))
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

    //PRを記号に変換する
    private function convertPRtoDisplaySign($PR)
    {
        $sign = '';
        if($PR == '0')
        {
            $sign = '×';
        }
        elseif($PR == '1')
        {
            $sign = '◯';
        } 
        return $sign;
    }
}