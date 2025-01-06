<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use App\Models\T_followed_tournaments;
use App\Models\T_followed_players;
use App\Models\T_tournaments;
use Illuminate\Support\Facades\Auth;

class TopPageController extends Controller
{
    
    public function getTopPageSummaryCount(
        T_followed_tournaments $tFollowedTournaments,
        T_tournaments $tTournaments,
        T_followed_players $tFollowedPlayers
    )
    {
        Log::debug(sprintf("getTopPageSummaryCount start."));
        $followedTournData = $tFollowedTournaments->getFollowedTournCount();
        $participatedTournData = $tTournaments->getParticipatedTournCount(Auth::user()->user_id);
        $followPlayerData = $tFollowedPlayers->getFollowPlayerCount();
        $followedPlayerData = $tFollowedPlayers->getFollowedPlayerCount();

        Log::debug(sprintf("getTopPageSummaryCount end."));
        return response()->json([
            'result' => [
                'followedTournCount' => $followedTournData->followedTournCount,
                'raceCount' => $participatedTournData->raceCount,
                'followPlayerCount' => $followPlayerData->followPlayerCount,
                'followedPlayerCount' => $followedPlayerData->followedPlayerCount,
            ]
        ]);
    }  
}


