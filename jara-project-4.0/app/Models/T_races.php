<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class T_races extends Model
{
    use HasFactory;

    public static $racesData = [
        'race_id' => null,
        'race_number' => 1,
        'entrysystem_race_id' => null,
        'tourn_id' => null,
        'race_name' => null,
        'event_id' => null,
        'event_name' => null,
        'by_group' => null,
        'range' => null,
        'start_datetime' => null,
        'delete_flag' => 0,
    ];

    public function getRace($trnId)
    {
        $races = DB::select('select `race_id`, `race_number`, `entrysystem_race_id`, `tourn_id`, `race_name`, `event_id`, `event_name`, `by_group`, `range`, `start_datetime`, `registered_time`, `registered_user_id`, `updated_time`, `updated_user_id`, `delete_flag` FROM `t_races` where delete_flag=0 and tourn_id = ?', [$trnId]);

        return $races;
    }

    public function insertRaces($racesInfo)
    {
        $result = "success";

        DB::beginTransaction();
        try {
            DB::insert(
                'insert into t_races (`race_id`, `race_number`, `entrysystem_race_id`, `tourn_id`, `race_name`, `event_id`, `event_name`, `by_group`, `range`, `start_datetime`, `registered_time`, `registered_user_id`, `updated_time`,`updated_user_id`, `delete_flag`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [
                    $racesInfo['race_id'],
                    $racesInfo['race_number'],
                    $racesInfo['entrysystem_race_id'],
                    $racesInfo['tourn_id'],
                    $racesInfo['race_name'],
                    $racesInfo['event_id'],
                    $racesInfo['event_name'],
                    $racesInfo['by_group'],
                    $racesInfo['range'],
                    $racesInfo['start_datetime'],
                    NOW(),
                    Auth::user()->user_id,
                    NOW(),
                    Auth::user()->user_id,
                    $racesInfo['delete_flag'],
                ]
            );

            DB::commit();
            return "登録完了";
        } catch (\Throwable $e) {
            dd($e);
            // dd($request->all());
            dd("stop");
            DB::rollBack();

            $result = "failed";
            return $result;
        }
    }

    public function updateRaces($racesInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::update(
                'update t_races set `race_number`=?,`entrysystem_race_id`=?,`tourn_id`=?,`race_name`=?,`event_id`=?,`event_name`=?,`by_group`=?,`range`=?,`start_datetime`=?,`registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? where tourn_id = ?',
                [
                    $racesInfo['race_number'],
                    $racesInfo['entrysystem_race_id'],
                    $racesInfo['tourn_id'],
                    $racesInfo['race_name'],
                    $racesInfo['event_id'],
                    $racesInfo['event_name'],
                    $racesInfo['by_group'],
                    $racesInfo['range'],
                    $racesInfo['start_datetime'],
                    NOW(),
                    Auth::user()->user_id,
                    NOW(),
                    Auth::user()->user_id,
                    $racesInfo['delete_flag'],
                    $racesInfo['tourn_id']
                ]
            );

            DB::commit();
            return $result;
        } catch (\Throwable $e) {
            dd($e);
            // dd($request->all());
            dd("stop");
            DB::rollBack();

            $result = "failed";
            return $result;
        }
    }
}
