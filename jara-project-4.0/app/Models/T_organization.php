<?php

namespace App\Models;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class T_organization extends Model
{
    use HasFactory;

    //テーブルがm_prefecturesと結びつくように指定する
    protected $table = 'm_prefectures';
    protected $primaryKey = 'pref_id';

    public function getOrganization($orgId)
    {
        $prefectures = DB::select('select *
                                        from t_organization
                                        where delete_flag=0
                                        and org_id = ?
                                        order by display_order'                                        
                                    ,[$orgId]
                                );
        return $prefectures;
    }

    public function insertOrganization(Request $request)
    {
        DB::beginTransaction();
        try{
                DB::insert('insert into t_organizations(entrysystem_org_id,
                                                    org_name,
                                                    jara_org_type,
                                                    jara_org_reg_trail,
                                                    pref_org_type,
                                                    pref_org_reg_trail,
                                                    org_class,
                                                    founding_year,		
                                                    location_country,
                                                    location_prefecture,
                                                    address1,
                                                    address2,
                                                    registered_time,
                                                    registered_user_id,
                                                    updated_time,
                                                    updated_user_id,
                                                    delete_flag
                                                    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                                    [$request->entrysystemOrgId,
                                                    $request->orgName,
                                                    $request->jaraOrgType,
                                                    $request->jaraOrgRegTrail,
                                                    $request->prefOrgType,
                                                    $request->prefOrgRegTrail,                                                    
                                                    $request->orgClass,
                                                    $request->foundingYear,
                                                    392,
                                                    $request->prefecture,
                                                    ($request->municipalities).($request->streetAddress),                                                    
                                                    $request->apartment,
                                                    NOW(),
                                                    Auth::user()->userId,
                                                    NOW(),
                                                    Auth::user()->userId,
                                                    0,
                                                ]);
                DB::commit();
                $page_status = "完了しました";
                $page_url = route('my-page');
                $page_url_text = "マイページ";
                    
                return redirect('change-notification')->with(['status'=> $page_status,"url"=>$page_url,"url_text"=>$page_url_text]);
        }
        catch (\Throwable $e){
                dd($e);
                // dd($request->all());
                dd("stop");
                DB::rollBack();
        }

        // $userId = Auth::id(); 
        // $cartAddInfo = $this->firstOrCreate(['stockId' => $stockId,'userId' => $userId]);
 
        // if($cartAddInfo->wasRecentlyCreated){
        //     $message = 'カートに追加しました';
        // }
        // else{
        //     $message = 'カートに登録済みです';
        // }
 
        //return $message;
    }
}
