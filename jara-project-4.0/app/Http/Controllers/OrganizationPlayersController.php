<?php

namespace App\Http\Controllers;

use App\Models\M_events;
use App\Models\T_organization_players;
use App\Models\T_organizations;
use App\Models\M_sex;
use App\Models\M_prefectures;
use App\Models\T_organization_staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
}