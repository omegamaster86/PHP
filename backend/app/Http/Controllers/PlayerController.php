<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
// use App\Providers\RouteServiceProvider;
// use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\View\View;
// use App\Services\FileUploadService;
// use Illuminate\Support\Facades\Storage;
// use App\Http\Requests\FileUploadRequest;
// use Illuminate\Http\UploadedFile;
// use Illuminate\Support\Facades\Mail;
// use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\T_players;
use App\Models\T_raceResultRecord;
use App\Models\T_users;
use App\Models\T_organization_players;
use Illuminate\Validation\ValidationException;


use Illuminate\Support\Facades\File;


use App\Models\M_sex;
// use App\Models\M_countries;
// use App\Models\M_prefectures;

class PlayerController extends Controller
{
    public function createRegister(): View
    {
        $retrieve_player_ID = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);

        if (empty($retrieve_player_ID[0])) {
            return view('player.register-edit', ["page_mode" => "register"]);
        } else {
            if ($retrieve_player_ID[count($retrieve_player_ID) - 1]->delete_flag) {
                return view('player.register-edit', ["page_mode" => "register"]);
            } else {
                $player_info = $retrieve_player_ID[count($retrieve_player_ID) - 1];
                $player_info->date_of_birth = date('Y/m/d', strtotime($retrieve_player_ID[count($retrieve_player_ID) - 1]->date_of_birth));

                return view('player.register-edit', ["page_mode" => "edit", "player_info" => $player_info]);
            }
        }
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */


    public function storeRegister(Request $request): RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        $random_file_name = Str::random(12);
        if ($request->hasFile('photo')) {

            $file = $request->file('photo');

            $fileName = $random_file_name . '.' . $request->file('photo')->getClientOriginalExtension();

            $destinationPath = public_path() . '/images/players/';
            $file->move($destinationPath, $fileName);
        }
        // $request->validate([
        //     'playerCode' => ['required', 'string', 'regex:/^[0-9a-zA-Z]+$/'],
        //     'playerName' => ['required', 'string', 'regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_][ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]*[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_]$/'],
        //     'dateOfBirth' => ['required', 'regex:/^[0-9\/]+$/'],
        //     'sex' => ['required', 'regex:/^[1-3]+$/'],
        //     'height' => ['required'],
        //     'weight' => ['required'],
        //     'sideInfo' => ['required_without_all'],
        // ], [
        //     'playerCode.required' => $playerCode_required,
        //     'playerCode.regex' => $playerCode_regex,
        //     'playerName.required' => $playerName_required,
        //     'playerName.regex' => $playerName_regex,
        //     'dateOfBirth.required' => $dateOfBirth_required,
        //     'dateOfBirth.regex' => $dateOfBirth_required,
        //     'sex.required' => $sex_required,
        //     'sex.regex' => $sex_required,
        //     'height.required' => $height_required,
        //     'weight.required' => $weight_required,
        //     'sideInfo.required_without_all' => $sideInfo_required,
        // ]);
        if (DB::table('t_players')->where('jara_player_id', $request->playerCode)->where('delete_flag', 0)->exists()) {
            $retrieve_player_name = DB::select('select player_name from t_players where jara_player_id = ?', [$request->playerCode]);
            $existing_player_name = $retrieve_player_name[0]->player_name;
            //Display error message to the client
            throw ValidationException::withMessages([
                'system_error' => "このJARA選手IDは既に別の選手と紐づいています。入力したJARA選手IDを確認してください。紐づいていた選手I：[$request->playerCode] [$existing_player_name]"
            ]);
        } else {
        }
        $player_info = $request->all();
        if ($request->hasFile('photo')) {
            $player_info['photo'] = $random_file_name . '.' . $request->file('photo')->getClientOriginalExtension();
        } else {
            if ($request->playerPictureStatus === "delete")
                $player_info['photo'] = "";
            else
                $player_info['photo'] = DB::table('t_players')->where('user_id', Auth::user()->user_id)->value('photo');
        }
        $sideInfo_xor = "00000000";
        foreach ($request->sideInfo as $sideInfo) {
            $sideInfo_xor = $sideInfo_xor ^ $sideInfo;
        }
        if (count($request->sideInfo) % 2)
            $sideInfo_xor = $sideInfo_xor ^ "00000000";
        $player_info['side_info'] = $sideInfo_xor;
        $player_info['previousPageStatus'] = "success";
        return redirect('player/register/confirm')->with('player_info', $player_info);
    }
    /**
     * Display the edit view.
     */
    // public function createEdit(): View
    // {
    //     $retrieve_player_by_ID = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);

    //     if (!count($retrieve_player_by_ID))
    //         return view('player.register-edit', ["page_mode" => "register"]);

    //     $recent_player_array = count($retrieve_player_by_ID) - 1;

    //     if ($retrieve_player_by_ID[$recent_player_array]->delete_flag)
    //         return view('player.register-edit', ["page_mode" => "register"]);

    //     $player_info = $retrieve_player_by_ID[$recent_player_array];

    //     $player_info->date_of_birth = date('Y/m/d', strtotime($retrieve_player_by_ID[$recent_player_array]->date_of_birth));

    //     return view('player.register-edit', ["page_mode" => "edit", "player_info" => $player_info]);
    // }

    /**
     * Handle an incoming edit request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */


    // public function storeEdit(Request $request): RedirectResponse
    // {
    //     include('Auth/ErrorMessages/ErrorMessages.php');
    //     if ($request->hasFile('photo')) {

    //         // Storage::disk('local')->put('example.txt', $request->file('photo'));

    //         $file = $request->file('photo');
    //         // $file->store('toPath', ['disk' => 'public']);

    //         $fileName = DB::table('t_players')->where('user_id', Auth::user()->user_id)->value('player_id') . '.' . $request->file('photo')->getClientOriginalExtension();
    //         // Storage::disk('public')->put($fileName, $file);

    //         // Storage::disk('public')->putFileAs('uploads', $file, $fileName);

    //         $destinationPath = public_path() . '/images/players/';
    //         $file->move($destinationPath, $fileName);

    //         // You can now save the $filePath to the database or use it as needed
    //         // ...
    //         // return response()->json(['message' => 'File uploaded successfully']);
    //     }

    //     $request->validate([
    //         'playerCode' => ['required', 'string', 'regex:/^[0-9a-zA-Z]+$/'],
    //         'playerName' => ['required', 'string', 'regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]+$/'],
    //         'dateOfBirth' => ['required'],
    //         'sex' => ['required', 'regex:/^[1-3]+$/'],
    //         'height' => ['required'],
    //         'weight' => ['required'],
    //         'sideInfo' => ['required_without_all'],
    //     ], [
    //         'playerCode.required' => $playerCode_required,
    //         'playerCode.regex' => $playerCode_regex,
    //         'playerName.required' => $playerName_required,
    //         'playerName.regex' => $playerName_regex,
    //         'dateOfBirth.required' => $dateOfBirth_required,
    //         'dateOfBirth.regex' => $dateOfBirth_required,
    //         'sex.required' => $sex_required,
    //         'sex.regex' => $sex_required,
    //         'height.required' => $height_required,
    //         'weight.required' => $weight_required,
    //         'sideInfo.required_without_all' => $sideInfo_required,
    //     ]);
    //     if (DB::table('t_players')->where('jara_player_id', $request->playerCode)->where('delete_flag', 0)->exists()) {
    //         $retrieve_player = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);
    //         if ($retrieve_player[count($retrieve_player) - 1]->JARAPlayerCode === $request->playerCode) {
    //             $player_info = $request->all();
    //             if ($request->hasFile('photo')) {
    //                 $player_info['photo'] = DB::table('t_players')->where('user_id', Auth::user()->user_id)->value('player_id') . '.' . $request->file('photo')->getClientOriginalExtension();
    //             } else {
    //                 if ($request->playerPictureStatus === "delete")
    //                     $player_info['photo'] = "";
    //                 else
    //                     $player_info['photo'] = DB::table('t_players')->where('user_id', Auth::user()->user_id)->value('photo');
    //             }
    //             $sideInfo_xor = "00000000";
    //             foreach ($request->sideInfo as $sideInfo) {
    //                 $sideInfo_xor = $sideInfo_xor ^ $sideInfo;
    //             }
    //             if (count($request->sideInfo) % 2)
    //                 $sideInfo_xor = $sideInfo_xor ^ "00000000";
    //             $player_info['sideInfo'] = $sideInfo_xor;
    //             $player_info['playerId'] = $retrieve_player[0]->playerId;
    //             // dd($player_info['photo']);
    //             return redirect('player/edit/confirm')->with('player_info', $player_info);
    //         }
    //         $retrieve_player_name = DB::select('select player_name from t_players where jara_player_id = ?', [$request->playerCode]);
    //         $existing_player_name = $retrieve_player_name[0]->player_name;
    //         //Display error message to the client
    //         throw ValidationException::withMessages([
    //             'system_error' => "このJARA選手IDは既に別の選手と紐づいています。入力したJARA選手IDを確認してください。紐づいていた選手I：[$request->playerCode] [$existing_player_name]"
    //         ]);
    //     } else {
    //     }
    //     $retrieve_player_by_ID = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);

    //     $player_info = $request->all();



    //     $sideInfo_xor = "00000000";
    //     foreach ($request->sideInfo as $sideInfo) {
    //         $sideInfo_xor = $sideInfo_xor ^ $sideInfo;
    //     }
    //     if (count($request->sideInfo) % 2)
    //         $sideInfo_xor = $sideInfo_xor ^ "00000000";
    //     $player_info['sideInfo'] = $sideInfo_xor;
    //     $player_info['playerId'] = $retrieve_player_by_ID[0]->playerId;
    //     $player_info['previousPageStatus'] = "success";
    //     return redirect('player/edit/confirm')->with('player_info', $player_info);
    //     dd("stop");
    // }
    /**
     * Display the registration view.
     */
    // public function createRegisterConfirm(): View
    // {
    //     return view('player.register-edit-confirm', ["page_mode" => "register-confirm"]);
    // }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */


    // public function storeRegisterConfirm(Request $request): RedirectResponse
    // {
    //     if (DB::table('t_players')->where('jara_player_id', $request->jar_player_id)->where('delete_flag', 0)->exists()) {
    //         $retrieve_player_name = DB::select('select player_name from t_players where jara_player_id = ?', [$request->jara_player_id]);
    //         $existing_player_name = $retrieve_player_name[0]->player_name;
    //         //Display error message to the client
    //         return redirect('player/register')->with('system_error', "登録に失敗しました。別のユーザーによってJARA選手コードが別の選手と紐づけられています。紐づいていた選手ID：[$request->jara_player_id] [$existing_player_name]");
    //         dd("stop");
    //     } else {
    //         // Insert new user info in the database.(t_user table)
    //         $user_id = (string) (Auth::user()->user_id);
    //         DB::beginTransaction();
    //         try {
    //             $user = DB::insert('insert into t_players ( user_id, jara_player_id,  player_name, date_of_birth, sex, height, weight, side_info, birth_country, birth_prefecture, residence_country,residence_prefecture, photo, registered_time, registered_user_id,updated_time,updated_user_id) values (?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [$user_id, $request->jara_player_id, $request->player_name, $request->date_of_birth, $request->sex, $request->height, $request->weight, $request->side_info, $request->birth_country, $request->birth_prefecture, $request->residence_country, $request->residence_prefecture, $request->photo, now()->format('Y-m-d H:i:s.u'), Auth::user()->user_id, now()->format('Y-m-d H:i:s.u'), Auth::user()->user_id]);
    //             DB::commit();
    //             $page_status = "選手情報の登録が正常に完了しました。";
    //             $page_url = route('my-page');
    //             $page_url_text = "マイページ";

    //             return redirect('change-notification')->with(['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
    //         } catch (\Throwable $e) {
    //             DB::rollBack();

    //             $e_message = $e->getMessage();
    //             $e_code = $e->getCode();
    //             $e_file = $e->getFile();
    //             $e_line = $e->getLine();
    //             $e_errorCode = $e->errorInfo[1];
    //             $e_bindings = implode(", ", $e->getBindings());
    //             $e_connectionName = $e->connectionName;

    //             $user_id = Auth::user()->user_id;
    //             //Store error message in the player register log file.
    //             Log::channel('player_register')->info("\r\n \r\n ＊＊＊「USER_ID」 ：  $user_id,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
    //             if ($e_errorCode == 1213 || $e_errorCode == 1205) {
    //                 throw ValidationException::withMessages([
    //                     'datachecked_error' => $database_registration_failed
    //                 ]);
    //             } else {
    //                 throw ValidationException::withMessages([
    //                     'datachecked_error' => $database_registration_failed
    //                 ]);
    //             }
    //         }
    //     }
    // }

    /**
     * Display the edit confirm view.
     */
    // public function createEditConfirm(): View
    // {

    //     return view('player.register-edit-confirm', ["page_mode" => "edit-confirm"]);
    // }

    /**
     * Handle an incoming edit request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */


    // public function storeEditConfirm(Request $request): RedirectResponse
    // {
    //     if (DB::table('t_players')->where('jara_player_id', '=', $request->jara_player_id)->where('delete_flag', '=', 0)->exists()) {
    //         $retrieve_player = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);
    //         if (empty($retrieve_player)) {
    //             dd("stop");
    //             $retrieve_player_name = DB::select('select player_name from t_players where jara_player_id = ?', [$request->jara_player_id]);
    //             $existing_player_name = $retrieve_player_name[0]->player_name;
    //             //Display error message to the client
    //             return redirect('player/edit')->with('system_error', "登録に失敗しました。別のユーザーによってJARA選手コードが別の選手と紐づけられています。紐づいていた選手ID：[$request->jara_player_id] [$existing_player_name]");
    //         } else {
    //             DB::beginTransaction();
    //             try {
    //                 DB::update(
    //                     'update t_players set jara_player_id = ? , player_name = ?, date_of_birth = ?, sex = ?, height = ?, weight = ?,side_info = ?,birth_country = ?,birth_prefecture = ?,residence_country = ?,residence_prefecture = ?,photo = ? where user_id = ?',
    //                     [$request->jara_player_id, $request->player_name, $request->date_of_birth, $request->sex, $request->height, $request->weight, $request->side_info, $request->birth_country, $request->birth_prefecture, $request->residence_country, $request->residence_prefecture, $request->photo, Auth::user()->user_id]
    //                 );

    //                 DB::commit();
    //                 $page_status = "選手情報の更新が正常に完了しました。";
    //                 $page_url = route('my-page');
    //                 $page_url_text = "マイページ";

    //                 return redirect('change-notification')->with(['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
    //             } catch (\Throwable $e) {
    //                 dd($request->all());
    //                 dd("stop");
    //                 DB::rollBack();
    //                 //Store error message in the register log file.
    //                 Log::channel('player_update')->info(" error-message  -> $update_failed");
    //                 throw ValidationException::withMessages([
    //                     'datachecked_error' => $update_failed
    //                 ]);
    //             }

    //             $page_status = "選手情報の更新が正常に完了しました。";
    //             $page_url = route('my-page');
    //             $page_url_text = "マイページ";

    //             return redirect('change-notification')->with(['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
    //         }
    //     } else {
    //         DB::beginTransaction();
    //         try {
    //             DB::update(
    //                 'update t_players set jara_player_id = ? , player_name = ?, date_of_birth = ?, sex = ?, height = ?, weight = ?,side_info = ?,birth_country = ?,birth_prefecture = ?,residence_country = ?,residence_prefecture = ?,photo = ? where user_id = ?',
    //                 [$request->jara_player_id, $request->player_name, $request->date_of_birth, $request->sex, $request->height, $request->weight, $request->side_info, $request->birth_country, $request->birth_prefecture, $request->residence_country, $request->residence_prefecture, $request->photo, Auth::user()->user_id]
    //             );

    //             DB::commit();
    //             $page_status = "選手情報の更新が正常に完了しました。";
    //             $page_url = route('my-page');
    //             $page_url_text = "マイページ";

    //             return redirect('change-notification')->with(['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
    //         } catch (\Throwable $e) {
    //             DB::rollBack();
    //             //Store error message in the player update log file.
    //             Log::channel('player_update')->info("\r\n \r\n ＊＊＊「USER_EMAIL_ADDRESS」 ：  $request->mailaddress,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
    //             throw ValidationException::withMessages([
    //                 'datachecked_error' => $update_failed
    //             ]);
    //         }

    //         $page_status = "選手情報の更新が正常に完了しました。";
    //         $page_url = route('my-page');
    //         $page_url_text = "マイページ";

    //         return redirect('change-notification')->with(['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
    //     }
    //     return redirect('player/edit');
    // }

    /**
     * Display the edit confirm view.
     */
    // public function createDetails($user_id): View
    // {
    //     //searching player info from database
    //     $retreive_player_by_ID = DB::select('SELECT sex.sex_name, birth_country.birth_country_name,residence_country.residence_country_name, birth_prefecture.birth_prefecture_name, residence_prefecture.residence_prefecture_name, player.photo, player.player_id, player.jara_player_id, player.player_name, player.date_of_birth, player.sex, player.height, player.weight, player.side_info, player.birth_country, player.birth_prefecture, player.residence_country, player.residence_prefecture FROM t_players as player

    //     Left join (select sex_id, sex as sex_name from m_sex where delete_flag = ? ) as sex on player.sex = sex.sex_id

    //     Left join (select country_id, country_name as birth_country_name from m_countries where delete_flag = ?)  as birth_country on player.birth_country = birth_country.country_id

    //     Left join (select country_id, country_name as residence_country_name from m_countries where delete_flag = ?)  as residence_country on player.residence_country = residence_country.country_id

    //     Left join (select pref_id, pref_name as birth_prefecture_name from m_prefectures where delete_flag = ?)  as birth_prefecture on player.birth_prefecture = birth_prefecture.pref_id

    //     Left join (select pref_id, pref_name as residence_prefecture_name from m_prefectures where delete_flag = ?)  as residence_prefecture on player.residence_prefecture = residence_prefecture.pref_id

    //     where player.user_id = ? AND player.delete_flag = ?', [0, 0, 0, 0, 0, $user_id, 0]);



    //     //searching race record info from database
    //     $retrieve_all_race_records = DB::select('SELECT tourn.event_start_date, race.event_name, record.tourn_name, record.official, record.org_name, record.race_number, record.race_name, record.by_group, record.crew_name, record.rank, record.laptime_500m, record.laptime_1000m, record.laptime_1500m, record.laptime_2000m, record.final_time, record.stroke_rate_avg, record.stroke_rat_500m, record.stroke_rat_1000m, record.stroke_rat_1500m, record.stroke_rat_2000m, record.attendance, record.ergo_weight, record.player_height, record.player_weight, record.sheet_name, record.race_result_record_name  FROM t_race_result_record as record

    //     Left join (select race_id, event_name from t_races where delete_flag = ? ) as race on record.race_id = race.race_id

    //     Left join (select tourn_id, event_start_date from t_tournaments where delete_flag = ?)  as tourn on record.tourn_id = tourn.tourn_id

    //     where record.user_id = ? AND record.delete_flag = ?', [0, 0, $user_id, 0]);

    //     //if there is no player info send the user to the register page
    //     if (!count($retreive_player_by_ID))
    //         return view('player.register-edit', ["page_mode" => "register"]);

    //     //storing searched player data to a variable
    //     $player_info = $retreive_player_by_ID[0];

    //     //change the date format
    //     $player_info->date_of_birth = date('Y/m/d', strtotime($player_info->date_of_birth));

    //     //paasing the searched data to the blade for view
    //     return view('player.details', ["player_info" => $player_info, 'all_race_records' => $retrieve_all_race_records, "user_id" => $user_id]);
    // }
    // public function createDelete(): View
    // {
    //     $retrieve_player_ID = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);
    //     if (empty($retrieve_player_ID)) {
    //         return view('player.register-edit', ["page_mode" => "register"]);
    //     }

    //     $player_info = $retrieve_player_ID[count($retrieve_player_ID) - 1];

    //     if ($player_info->delete_flag) {
    //         return view('player.register-edit', ["page_mode" => "register"]);
    //     }
    //     if ($player_info->sex === 1) {
    //         $player_info->sex = "男";
    //     } elseif ($player_info->sex === 2) {
    //         $player_info->sex = "女";
    //     } else {
    //         $player_info->sex = "";
    //     }
    //     return view('player.register-edit-confirm', ["page_mode" => "delete", "player_info" => $player_info]);
    // }

    /**
     * Handle an incoming edit request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */


    // public function storeDelete(Request $request,)/*: RedirectResponse*/
    // {
    //     include('Auth/ErrorMessages/ErrorMessages.php');

    //     DB::beginTransaction();
    //     try {
    //         DB::update(
    //             'update t_players set delete_flag = ?  where user_id = ?',
    //             ["1", Auth::user()->user_id]
    //         );

    //         DB::commit();
    //         $page_status = "選手情報の削除が完了しました。";
    //         $page_url = route('my-page');
    //         $page_url_text = "マイページ";

    //         return view('change-notification', ['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
    //     } catch (\Throwable $e) {
    //         dd($request->all());
    //         dd("stop");
    //         DB::rollBack();
    //         $e_message = $e->getMessage();
    //         $e_code = $e->getCode();
    //         $e_file = $e->getFile();
    //         $e_line = $e->getLine();
    //         $e_errorCode = $e->errorInfo[1];
    //         $e_bindings = implode(", ", $e->getBindings());
    //         $e_connectionName = $e->connectionName;

    //         $user_id = Auth::user()->user_id;
    //         //Store error message in the player delete log file.
    //         Log::channel('player_delete')->info("\r\n \r\n ＊＊＊「USER_ID」 ：  $user_id,  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
    //     }

    //     $page_status = "選手情報の削除が完了しました。";
    //     $page_url = route('my-page');
    //     $page_url_text = "マイページ";

    //     return view('change-notification', ['status' => $page_status, "url" => $page_url, "url_text" => $page_url_text]);
    // }

    // public function createSearch(M_sex $sex): View
    // {
    //     $sex_list = $sex->getSexList();
    //     return view('player.search', ["sex_list" => $sex_list]);
    // }



    public function searchPlayer(Request $request, T_players $players, M_sex $sex)
    {
        Log::debug(sprintf("searchPlayer start"));
        $searched_data = $request->all();
        Log::debug($searched_data);
        $tmpList = ""; //変換したサイド情報を保持するためのtmp変数
        foreach ($searched_data['side_info'] as $sideInfoVal) {
            if ($sideInfoVal) {
                $tmpList .= "1";
            } else {
                $tmpList .= "0";
            }
        }
        $searched_data['side_info'] = $tmpList;
        Log::debug($searched_data['side_info']);

        // reactからのデータ形式に対応させるためにコメントアウト 20240214
        // if ($searched_data['startDateOfBirth'] === "年/月/日") {
        //     $searched_data['startDateOfBirth'] = NULL;
        // } else {
        //     $searched_data['startDateOfBirth'] = date('Y-m-d', strtotime($searched_data['startDateOfBirth']));
        // }
        // if ($searched_data['endDateOfBirth'] === "年/月/日") {
        //     $searched_data['endDateOfBirth'] = NULL;
        // } else {
        //     $searched_data['endDateOfBirth'] = date('Y-m-d', strtotime($searched_data['endDateOfBirth']));
        // }

        $sex_list = $sex->getSexList();

        $player_list =  $players->getPlayerWithSearchCondition($searched_data);
        Log::debug($player_list);

        // reactからのデータ形式に対応させるためにコメントアウト 20240214
        // $side_info_xor = "00000000";
        // if (isset($searched_data['side_info'])) {
        //     foreach ($searched_data['side_info'] as $side_info) {
        //         $side_info_xor = $side_info_xor ^ $side_info;
        //     }
        //     if (count($searched_data['side_info']) % 2)
        //         $side_info_xor = $side_info_xor ^ "00000000";
        //     $searched_data['side_info'] = $side_info_xor;
        // } else {
        //     $searched_data['side_info'] = "00000000";
        // };


        Log::debug(sprintf("searchPlayer end"));

        return response()->json(['reqData' => $sex_list, 'result' => $player_list]); //送信データ(debug用)とDBの結果を返す
        // return view('player.search', ["page_mode" => "search", "sex_list" => $sex_list, "player_list" => $player_list, "searched_data" => (object)$searched_data]);
    }


    //選手検索で使用する関数 200240309
    private function generateSearchCondition($searchInfo, &$search_values_array)
    {
        Log::debug(sprintf("generateSearchCondition start"));
        Log::debug($searchInfo);
        $condition = "";
        //JARA選手コード
        if (isset($searchInfo['jara_player_id'])) {
            $condition .= " and `tp`.`jara_player_id`= :jara_player_id\r\n";
            $search_values_array['jara_player_id'] = $searchInfo['jara_player_id'];
        }
        //選手ID
        if (isset($searchInfo['player_id'])) {            
            $condition .= " and `tp`.`player_id`= :player_id\r\n";
            $search_values_array['player_id'] = $searchInfo['player_id'];
        }
        //選手名
        if (isset($searchInfo['player_name'])) {
            $condition .= " and `tp`.`player_name` LIKE :player_name\r\n";
            $search_values_array['player_name'] = "%".$searchInfo['player_name']."%";
        }
        //性別
        if(isset($searchInfo['sexId']))
        {
            $condition .= "and tp.`sex_id`= :sex_id\r\n";
            $search_values_array['sex_id'] = $searchInfo['sexId'];
        }
        //生年月日
        if(isset($searchInfo['startDateOfBirth']))
        {
            $condition .= "and tp.date_of_birth >= :start_date_of_birth\r\n";
            $search_values_array['start_date_of_birth'] = $searchInfo['startDateOfBirth'];
        }
        if(isset($searchInfo['endDateOfBirth']))
        {
            $condition .= "and tp.date_of_birth <= :end_date_of_birth\r\n";
            $search_values_array['end_date_of_birth'] = $searchInfo['endDateOfBirth'];
        }
        //サイド情報
        if($searchInfo['side_info']['S'] == true)
        {
            $condition .= "and SUBSTRING(tp.`side_info`,8,1) = 1\r\n";
        }
        if($searchInfo['side_info']['B'] == true)
        {
            $condition .= "and SUBSTRING(tp.`side_info`,7,1) = 1\r\n";
        }
        if($searchInfo['side_info']['X'] == true)
        {
            $condition .= "and SUBSTRING(tp.`side_info`,6,1) = 1\r\n";
        }
        if($searchInfo['side_info']['X'] == true)
        {
            $condition .= "and SUBSTRING(tp.`side_info`,5,1) = 1\r\n";
        }
        //出漕大会名
        if(isset($searchInfo['race_class_name']))
        {
            $condition .= "and rrr.tourn_name LIKE :tourn_name\r\n";
            $search_values_array['tourn_name'] = "%".$searchInfo['race_class_name']."%";
        }
        //出漕種目
        if(isset($searchInfo['event_id']))
        {
            $condition .= "and rrr.event_id = :event_id\r\n";
            $search_values_array['event_id'] = $searchInfo['event_id'];
        }

        if (isset($searchInfo['org_id'])) {
            Log::debug("org_idがNULLでない");
            $search_values_array['org_id_1'] = $searchInfo['org_id'];
            $search_values_array['org_id_2'] = $searchInfo['org_id'];

        } else if (isset($searchInfo['entrysystem_org_id'])) {
            Log::debug("entrysystem_org_idがNULLでない");
            $search_values_array['entrysystem_id_1'] = $searchInfo['entrysystem_org_id'];
            $search_values_array['entrysystem_id_2'] = $searchInfo['entrysystem_org_id'];

        } else if (isset($searchInfo['org_name'])) {
            Log::debug("org_nameがNULLでない");
            $search_values_array['org_name_1'] = "%".$searchInfo['org_name']."%";
            $search_values_array['org_name_2'] = "%".$searchInfo['org_name']."%";
            $search_values_array['org_name_3'] = "%".$searchInfo['org_name']."%";
        }

        Log::debug(sprintf("generateSearchCondition end"));
        return $condition;
    }

    //選手検索で使用する関数 200240309
    public function playerSearch(Request $request, T_players $tPlayersData)
    {
        Log::debug(sprintf("playerSearch start"));
        $searched_data = $request->all();
        //Log::debug($searched_data);
        $search_values_array = array();
        $replace_condition_string = $this->generateSearchCondition($searched_data,$search_values_array);
        
        $search_result = null;
        try
        {
            if (isset($searched_data['org_id'])) {
                Log::debug("団体IDの条件が入力されている場合");
                $search_result = $tPlayersData->getPlayerSearchResultWithOrgIdCondition($replace_condition_string,$search_values_array);
                
            } else if (isset($searched_data['entrysystem_org_id'])) {
                Log::debug("エントリーシステムの団体IDの条件が入力されている場合");
                $search_result = $tPlayersData->getPlayerSearchResultWithEntrySystemIdCondition($replace_condition_string,$search_values_array);

            } else if (isset($searched_data['org_name'])) {
                Log::debug("団体名の条件が入力されている場合");
                $search_result = $tPlayersData->getPlayerSearchResultWithOrgNameCondition($replace_condition_string,$search_values_array);

            } else {
                Log::debug("エントリーシステムの団体ID、団体ID、団体名以外の条件が入力されている場合");
                $search_result = $tPlayersData->getPlayerSearchResult($replace_condition_string,$search_values_array);
            }
            //Log::debug($search_result);
            Log::debug(sprintf("playerSearch end"));
            return response()->json(['result' => $search_result]); //送信データ(debug用)とDBの結果を返す
        } catch (\Exception $e) {
            Log::error('Line:' . $e->getLine() . ' message:' . $e->getMessage());
            return response()->json(['errMessage' => $e->getMessage()]); //エラーメッセージを返す
        }
    }

    //===============================================================================================
    //===============================================================================================

    //reactからの選手登録 20240131
    public function storePlayerData(Request $request, T_players $tPlayersData, T_users $t_users)
    {
        $random_file_name = Str::random(12);
        //If new picture is uploaded
        if ($request->hasFile('uploadedPhoto')) {
            $file = $request->file('uploadedPhoto');
            $file_name = $random_file_name . '.' . $request->file('uploadedPhoto')->getClientOriginalExtension();
            $destination_path = public_path() . '/images/players/';
            $file->move($destination_path, $file_name);
            // $file->storeAs('public/images/users', $file_name);
            // return response()->json(['message' => 'File uploaded successfully']);
        }
        Log::debug(sprintf("storePlayerData start"));
        $reqData = $request->all();

        $tPlayersData::$playerInfo['jara_player_id'] = $reqData['jara_player_id']; //JARA選手コード
        $tPlayersData::$playerInfo['player_name'] = $reqData['player_name']; //選手名
        $tPlayersData::$playerInfo['date_of_birth'] = $reqData['date_of_birth']; //誕生日
        $tPlayersData::$playerInfo['height'] = $reqData['height']; //身長
        $tPlayersData::$playerInfo['weight'] = $reqData['weight']; //体重
        $tPlayersData::$playerInfo['sex_id'] = $reqData['sex_id']; //性別ID
        // $tPlayersData::$playerInfo['photo'] = $reqData['photo']; //写真
        //サイド情報
        $side_info = null;
        for ($i = 0; $i < 8; $i++) {
            if ($reqData['side_info'][$i] == "true") {
                $side_info .= "1";
            } else {
                $side_info .= "0";
            }
        }
        $tPlayersData::$playerInfo['side_info'] = $side_info;

        $tPlayersData::$playerInfo['birth_country'] = $reqData['birth_country']; //出身地(国)
        $tPlayersData::$playerInfo['birth_prefecture'] =  $reqData['birth_prefecture']; //出身地(都道府県名)
        $tPlayersData::$playerInfo['residence_country'] = $reqData['residence_country']; //居住地(国)
        $tPlayersData::$playerInfo['residence_prefecture'] =  $reqData['residence_prefecture']; //居住地(都道府県)
        //If new picture is uploaded
        if ($request->hasFile('uploadedPhoto')) {
            $file_name = $random_file_name . '.' . $request->file('uploadedPhoto')->getClientOriginalExtension();
            $tPlayersData::$playerInfo['photo'] = $file_name; //写真
        } else {
            //If  picture is not uploaded

            $tPlayersData::$playerInfo['photo'] = ''; //写真
        }
        $result = $tPlayersData->insertPlayers($tPlayersData::$playerInfo); //DBに選手を登録 20240131

        //ユーザ種別の更新
        //右から3桁目が0のときだけユーザー種別を更新する
        $user_type = (string)Auth::user()->user_type;
        Log::debug("user_type_is_player = ".substr($user_type,-3,1));
        if(mb_substr($user_type,-3,1) == '0')
        {
            $hoge = array();
            $hoge['user_id'] = Auth::user()->user_id;
            $hoge['input'] = '00000100'; //選手のユーザ種別を変更する
            $t_users->updateUserTypeRegist($hoge);
        }
        $users = $t_users->getIDsAssociatedWithUser(Auth::user()->user_id); //ユーザIDに関連づいたIDの取得

        Log::debug(sprintf("storePlayerData end"));
        return response()->json(['users' => $users, 'result' => $result]); //送信データ(debug用)とDBの結果を返す
    }

    //react 選手情報更新画面に表示するuserIDに紐づいたデータを送信 20240131
    public function getUpdatePlayerData(Request $request, T_players $tPlayersData)
    {
        Log::debug(sprintf("getUpdatePlayerData start"));
        // $retrieve_player_by_ID = DB::select('select * from t_players where user_id = ?', [Auth::user()->user_id]);
        $reqData = $request->all();
        Log::debug($reqData);
        $retrieve_player_by_ID = $tPlayersData->getPlayerData($reqData['player_id']); //DBに選手を登録 20240131
        Log::debug(sprintf("getUpdatePlayerData end"));
        return response()->json(['result' => $retrieve_player_by_ID]); //DBの結果を返す
    }
    //reactからの選手登録 20240131
    public function updatePlayerData(Request $request, T_players $tPlayersData, T_users $t_users)
    {
        $random_file_name = Str::random(12);
        //If new picture is uploaded
        if ($request->hasFile('uploadedPhoto')) {
            $file = $request->file('uploadedPhoto');
            $file_name = $random_file_name . '.' . $request->file('uploadedPhoto')->getClientOriginalExtension();
            $destination_path = public_path() . '/images/players/';
            $file->move($destination_path, $file_name);
            // $file->storeAs('public/images/users', $file_name);
            // return response()->json(['message' => 'File uploaded successfully']);
        }
        Log::debug(sprintf("updatePlayerData start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $tPlayersData::$playerInfo['jara_player_id'] = $reqData['jara_player_id']; //JARA選手コード
        $tPlayersData::$playerInfo['player_name'] = $reqData['player_name']; //選手名
        $tPlayersData::$playerInfo['date_of_birth'] = $reqData['date_of_birth']; //誕生日
        $tPlayersData::$playerInfo['height'] = $reqData['height']; //身長
        $tPlayersData::$playerInfo['weight'] = $reqData['weight']; //体重
        $tPlayersData::$playerInfo['sex_id'] = $reqData['sex_id']; //性別ID
        // $tPlayersData::$playerInfo['photo'] = $reqData['photo']; //写真
        //サイド情報
        $side_info = null;
        for ($i = 0; $i < 8; $i++) {
            if ($reqData['side_info'][$i] == "true") {
                $side_info .= "1";
            } else {
                $side_info .= "0";
            }
        }
        $tPlayersData::$playerInfo['side_info'] = $side_info;

        $tPlayersData::$playerInfo['birth_country'] = $reqData['birth_country']; //出身地(国)
        $tPlayersData::$playerInfo['birth_prefecture'] =  $reqData['birth_prefecture']; //出身地(都道府県名)
        $tPlayersData::$playerInfo['residence_country'] = $reqData['residence_country']; //居住地(国)
        $tPlayersData::$playerInfo['residence_prefecture'] =  $reqData['residence_prefecture']; //居住地(都道府県)

        //If new picture is uploaded
        if ($request->hasFile('uploadedPhoto')) {
            $file_name = $random_file_name . '.' . $request->file('uploadedPhoto')->getClientOriginalExtension();
            $tPlayersData::$playerInfo['photo'] = $file_name; //写真
            
            
            if ($reqData['previousPhotoName'] ?? "") {
                $file_path = public_path().'/images/players/'.$reqData['previousPhotoName'];
                if (file_exists($file_path)){
                    unlink($file_path); //前の写真削除
                }
            }
        } else {
            //If  picture is not uploaded
            if ($reqData['photo'] ?? "") {
                $tPlayersData::$playerInfo['photo'] = $reqData['photo']; //写真
            } else {
                $tPlayersData::$playerInfo['photo'] = ''; //写真
                if ($reqData['previousPhotoName'] ?? "") {
                    $file_path = public_path().'/images/players/'.$reqData['previousPhotoName'];
                    if (file_exists($file_path)){
                        unlink($file_path); //前の写真削除
                    }
                }
            }
        }

        DB::beginTransaction();
        try {
            Log::debug($tPlayersData::$playerInfo);
            $result = $tPlayersData->updatePlayerData($tPlayersData::$playerInfo); //DBに選手を更新 20240131

            $users = $t_users->getIDsAssociatedWithUser(Auth::user()->user_id); //ユーザIDに関連づいたIDの取得
            DB::commit();
            Log::debug(sprintf("updatePlayerData end"));
            return response()->json(['users' => $users, 'result' => $result]); //送信データ(debug用)とDBの結果を返す
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Line:' . $e->getLine() . ' message:' . $e->getMessage());
            return response()->json(["選手情報の更新に失敗しました。ユーザーサポートにお問い合わせください。"],400); //エラーメッセージを返す
        }
    }
    //react 選手情報参照画面に表示するuserIDに紐づいたデータを送信 20240131
    public function getPlayerInfoData(Request $request, T_players $tPlayersData)
    {
        Log::debug(sprintf("getPlayerInfoData start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $result = $tPlayersData->getPlayerData($reqData['player_id']); //DBに選手を登録 20240131
        Log::debug(sprintf("getPlayerInfoData end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }
    //react 選手情報参照画面に表示するplayerIDに紐づいたデータを送信 20240131
    public function getRaceResultRecordsData(Request $request, T_raceResultRecord $tRaceResultRecord)
    {
        Log::debug(sprintf("getRaceResultRecordsData start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $result = $tRaceResultRecord->getRaceResultRecord_playerId($reqData['player_id']); //選手IDを元に出漕結果記録を取得 20240212
        Log::debug(sprintf("getRaceResultRecordsData end"));
        return response()->json(['result' => $result]); //DBの結果を返す
    }

    //react 選手情報削除画面から受け取ったデータを削除する 20240201
    public function deletePlayerData(Request $request, T_players $tPlayersData, T_raceResultRecord $tRaceResultRecord, T_users $t_users, T_organization_players $t_org_players)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            Log::debug(sprintf("deletePlayerData start"));
            $reqData = $request->all();
            if (empty($reqData['playerInformation'])) {
                return response()->json("選手情報がないため選手を削除できません。", 400);
            }
            Log::debug($reqData);

            $tPlayersData::$playerInfo['player_id'] = $reqData['playerInformation']['player_id']; //選手ID
            $tPlayersData->deletePlayerData($tPlayersData::$playerInfo); //該当選手に削除フラグを立てる 20240208

            // $tRaceResultRecord::$raceResultRecordInfo['player_id'] = $reqData['playerInformation']['player_id']; //選手ID
            // $result = $tRaceResultRecord->deleteRaceResultRecord_playerId($tRaceResultRecord::$raceResultRecordInfo); //該当選手に削除フラグを立てる 20240208

            $t_org_players->updateDeleteFlagAllOrganizations($reqData['playerInformation']['player_id']);

            //ユーザ種別の更新
            $hoge = array();
            $hoge['user_id'] = Auth::user()->user_id;
            $hoge['input'] = '00000100'; //選手のユーザ種別を変更する
            Log::debug($hoge);
            $user_type = (string)Auth::user()->user_type;
            //右から3桁目が1のときだけユーザー種別を更新する
            if(substr($user_type,-3,1) == '1')
            {
                $t_users->updateUserTypeDelete($hoge);
            }

            DB::commit();

            Log::debug(sprintf("deletePlayerData end"));
            if ($result === "success") {
                return response()->json("選手情報の削除が完了しました。", 200);
            }
            // else {
            //     return response()->json("失敗しました。選手を削除できませんでした。", 500);
            // }
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Line:' . $e->getLine() . ' message:' . $e->getMessage());
            return response()->json("失敗しました。選手を削除できませんでした。", 500);
        }
        // return response()->json(['reqData' => $reqData, 'result' => $result]); //送信データ(debug用)とDBの結果を返す
    }


    public function checkJARAPlayerId(Request $request, T_players $tPlayersData)
    {
        Log::debug(sprintf("checkJARAPlayerId start"));

        $reqData = $request->all();

        Log::debug($reqData['jara_player_id']);

        if($reqData['jara_player_id']==""){
            return response()->json([""]);
        }//JARA選手コードを入力されてない場合

        if ($request["mode"] === "create") {
            
            $result = DB::select(
                'select `player_id`, `player_name` from `t_players` where `delete_flag` = 0 and `user_id` = ?',
                [
                    Auth::user()->user_id 
                ]
            );
            if (!empty($result)) {
                Log::debug(sprintf("checkJARAPlayerId end 1"));
                return response()->json(["選手IDはすでに登録されています。 複数作成することはできません。"], 403);
            }
        }
        $tPlayersData::$playerInfo['jara_player_id'] = $reqData['jara_player_id']; //JARA選手コード
        $registered_player = $tPlayersData->checkJARAPlayerId($tPlayersData::$playerInfo);

        

        if (!empty($registered_player)) {
            Log::debug($registered_player->user_id);

            if($registered_player->user_id === NULL or $registered_player->user_id === "") {
                return response()->json([""]);
            } //マッピング用なJARA選手コードの場合

            else{
                if ($request["mode"] === "create") {
                    if ($registered_player->user_id === Auth::user()->user_id) {
                        Log::debug(sprintf("checkJARAPlayerId end 2"));
                        return response()->json(["選手IDはすでに登録されています。 複数作成することはできません。"], 403);
                    } else {
                        Log::debug(sprintf("checkJARAPlayerId end 3"));
                        return response()->json(["このJARA選手IDは既に別の選手と紐づいています。入力したJARA選手IDを確認してください。紐づいていた選手：「$registered_player->player_id 」「 $registered_player->player_name 」"], 401);
                    }
                }
                if ($request["mode"] === "create_confirm") {
                    if ($registered_player->user_id === Auth::user()->user_id) {
                        Log::debug(sprintf("checkJARAPlayerId end 4"));
                        return response()->json(["登録に失敗しました。選手IDはすでに登録されています。 複数作成することはできません。"], 403);
                    } else {
                        Log::debug(sprintf("checkJARAPlayerId end 5"));
                        return response()->json(["登録に失敗しました。
                        別のユーザーによってJARA選手コードが別の選手と紐づけられています。紐づいていた選手ID：「$registered_player->player_id 」「 $registered_player->player_name 」"], 401);
                    }
                } else if ($request["mode"] === "update") {
                    if ($registered_player->user_id === Auth::user()->user_id) {
                        Log::debug(sprintf("checkJARAPlayerId end 6"));
                        return response()->json("");
                    } else {
                        Log::debug(sprintf("checkJARAPlayerId end 7"));
                        return response()->json(["このJARA選手IDは既に別の選手と紐づいています。入力したJARA選手IDを確認してください。紐づいていた選手：「$registered_player->player_id 」「 $registered_player->player_name 」"], 401);
                    }
                } else if ($request["mode"] === "update_confirm") {
                    if ($registered_player->user_id === Auth::user()->user_id) {
                        Log::debug(sprintf("checkJARAPlayerId end 8"));
                        return response()->json("");
                    } else {
                        Log::debug(sprintf("checkJARAPlayerId end 9"));
                        return response()->json(["更新に失敗しました。
                        別のユーザーによってJARA選手コードが別の選手と紐づけられています。紐づいていた選手ID：「$registered_player->player_id 」「 $registered_player->player_name 」"], 401);
                    }
                } else {
                    Log::debug(sprintf("checkJARAPlayerId end 10"));
                    return response()->json(["失敗しました。"], 400);
                }
            }
        } else {
            if ($request["mode"] === "create") {
                Log::debug(sprintf("checkJARAPlayerId end 11"));
                return response()->json(["入力したJARA選手IDと紐づくデータが存在しません。\nこのJARA選手IDで登録しますか？"]);
            }
            if ($request["mode"] === "create_confirm") {
                Log::debug(sprintf("checkJARAPlayerId end 12"));
                return response()->json([""]);
            } else if ($request["mode"] === "update") {
                Log::debug(sprintf("checkJARAPlayerId end 13"));
                return response()->json(["エントリーシステムの選手IDが変更されています。\n過去のレース結果との紐づけが失われます。\n変更しますか？"]);
            } else if ($request["mode"] === "update_confirm") {
                Log::debug(sprintf("checkJARAPlayerId end 14"));
                return response()->json([""]);
            } else {
                Log::debug(sprintf("checkJARAPlayerId end 14"));
                return response()->json(["失敗しました。"], 400);
            }
        }
    }
}
