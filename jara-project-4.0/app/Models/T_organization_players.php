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

    //団体削除による団体所属選手の削除
    //org_idをキーとして、該当所属選手のdelete_flagを1にする
    public function updateDeleteFlagByOrganizationDeletion($org_id)
    {
        $result = true;   
        try{
                DB::beginTransaction();
                DB::update('update `t_organization_players`
                            set `delete_flag` = 1
                            where 1=1
                            and `org_id` = ?'
                            ,[$org_id]);
                DB::commit();
                return $result;
        }
        catch (\Throwable $e){
                dd($e);
                dd("stop");
                DB::rollBack();
                
                $result = false;
                return $result;
        }
    }
}
