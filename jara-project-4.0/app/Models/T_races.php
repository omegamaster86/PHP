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
        'race_class_id' => null,
        'race_class_name' => null,
        'by_group' => null,
        'range' => null,
        'start_date_time' => null,
        'delete_flag' => 0,
    ];

    public function getRace($trnId)
    {
        $races = DB::select('select
                            `race_id`
                            ,`race_number`
                            ,`entrysystem_race_id`
                            ,`tourn_id`
                            ,`race_name`
                            ,`event_id`
                            ,`event_name`
                            ,`race_class_id`
                            ,`race_class_name`
                            ,`by_group`
                            ,`range`
                            ,`start_date_time`
                            ,`registered_time`
                            ,`registered_user_id`
                            ,`updated_time`
                            ,`updated_user_id`
                            ,`delete_flag`
                            FROM `t_races`
                            where delete_flag=0
                            and tourn_id = ?', [$trnId]);
        return $races;
    }

    public function insertRaces($racesInfo)
    {
        DB::insert(
            'insert into t_races (`race_id`, `race_number`, `entrysystem_race_id`, `tourn_id`, `race_name`, `event_id`, `event_name`, `race_class_id`, `race_class_name`, `by_group`, `range`, `start_date_time`, `registered_time`, `registered_user_id`, `updated_time`,`updated_user_id`, `delete_flag`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [
                null,
                $racesInfo['race_number'],
                $racesInfo['entrysystem_race_id'],
                $racesInfo['tourn_id'],
                $racesInfo['race_name'],
                $racesInfo['event_id'],
                $racesInfo['event_name'],
                $racesInfo['race_class_id'],
                $racesInfo['race_class_name'],
                $racesInfo['by_group'],
                $racesInfo['range'],
                $racesInfo['start_date_time'],
                NOW(),
                Auth::user()->user_id,
                NOW(),
                Auth::user()->user_id,
                $racesInfo['delete_flag'],
            ]
        );
    }

    public function updateRaces($racesInfo)
    {
        $result = "success";
        DB::beginTransaction();
        try {
            DB::update(
                'update t_races set `race_number`=?,`entrysystem_race_id`=?,`tourn_id`=?,`race_name`=?,`event_id`=?,`event_name`=?,`race_class_id`=?,`race_class_name`=?,`by_group`=?,`range`=?,`start_date_time`=?,`registered_time`=?,`registered_user_id`=?,`updated_time`=?,`updated_user_id`=?,`delete_flag`=? where tourn_id = ?',
                [
                    $racesInfo['race_number'],
                    $racesInfo['entrysystem_race_id'],
                    $racesInfo['tourn_id'],
                    $racesInfo['race_name'],
                    $racesInfo['event_id'],
                    $racesInfo['event_name'],
                    $racesInfo['race_class_id'],
                    $racesInfo['race_class_name'],
                    $racesInfo['by_group'],
                    $racesInfo['range'],
                    $racesInfo['start_date_time'],
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
            DB::rollBack();

            $result = "failed";
            return $result;
        }
    }
}
