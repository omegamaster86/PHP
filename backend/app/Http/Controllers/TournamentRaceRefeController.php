<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\T_tournaments;
use App\Models\T_races;
use App\Models\T_raceResultRecord;
use App\Models\T_followed_tournaments;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
// use App\Models\T_organizations;
// use App\Models\M_venue;

// use Illuminate\Http\Request;

class TournamentRaceRefeController extends Controller
{
    //大会情報参照画面に遷移した時
    // public function createReference(T_tournaments $tTournaments, T_races $tRace, T_raceResultRecord $tRaceresult)
    // {
    //     //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
    //     if (Auth::user()->temp_password_flag === 1) {
    //         return redirect('user/password-change');
    //     }
    //     $tTours = $tTournaments->getTournament(1); //大会テーブルから大会情報を取得
    //     $tRaceData = $tRace->getRace(1); //レーステーブルからレース情報を取得
    //     $tRaceResultData = $tRaceresult->getRaceResultRecord_tournId(1); //出漕結果記録テーブルからレース結果情報を取得
    //     return view('tournament.race-reference', ["pagemode" => "refer", "TournamentData" => $tTours, "RaceData" => $tRaceData, "RaceResultData" => $tRaceResultData]);
    // }

    public function showCrewData(T_tournaments $tTournaments, T_races $tRace, T_raceResultRecord $tRaceresult)
    {
        //仮登録が完了していないユーザが別ページのURLを入力して遷移しないように条件分岐する
        if (Auth::user()->temp_password_flag === 1) {
            return redirect('user/password-change');
        }
        //$tTours = $tTournaments->getTournament(1); //大会テーブルから大会情報を取得
        //$tRaceData = $tRace->getRace(1); //レーステーブルからレース情報を取得
        $tRaceResultData = $tRaceresult->getRaceResultRecord_crewData(1,"ababab",1); //出漕結果記録テーブルからレース結果情報を取得 //$raceId,$crewName,$orgId
        //$tRaceResultData = $tRaceresult->getRaceResultRecord_crewData(1,"www","afa"); //出漕結果記録テーブルからレース結果情報を取得 //$raceId,$crewName,$orgId
        return redirect('tournament/racereference')->with(["pagemode" => "crew", "RaceResultData" => $tRaceResultData]);
    }

    //大会フォロー機能 20241028
    public function tournamentFollowed(Request $request, T_followed_tournaments $tFollowedTournaments)
    {
        Log::debug(sprintf("tournamentFollowed start"));
        $reqData = $request->all();
        Log::debug($reqData);
        $tournId = $reqData["tournId"];
        $followTournId = $tFollowedTournaments->getFollowedTournamentsId($tournId); // 202401008

        //フォロー大会テーブルにデータが存在しない場合、新規追加する 20241028
        DB::beginTransaction();
        try {
            if (empty($followTournId)) {
                $tFollowedTournaments->insertFollowedTournaments($tournId); // 202401008
            } else {
                if ($followTournId->delete_flag == 0) {
                    $tFollowedTournaments->updateFollowedTournaments(1, $tournId); // 202401008
                } else {
                    $tFollowedTournaments->updateFollowedTournaments(0, $tournId); // 202401008
                }
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            abort(403, '大会フォローに失敗しました。');
        }

        Log::debug(sprintf("tournamentFollowed end"));
    }

}
