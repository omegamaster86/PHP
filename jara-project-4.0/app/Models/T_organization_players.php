<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class T_organization_players extends Model
{
    use HasFactory;

    //テーブルがt_organization_staffと結びつくように指定する
    protected $table = 't_organization_players';
    protected $primaryKey = 'org_player_id';

    public function getOrganizationPlayers($target_org_id)
    {
        $players = DB::select('select *
                                from `t_organization_players`
                                where `delete_flag` =0
                                and `org_id` = ?
                                order by org_player_id'
                                ,[$target_org_id]
                            );
        return $players;
    }
}
