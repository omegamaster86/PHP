<?php

namespace App\Http\Controllers;
// use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\T_user;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;
use Illuminate\Validation\ValidationException;
use App\Services\FileUploadService;
use App\Http\Requests\FileUploadRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;

class ProfileEditController extends Controller
{
    public function create(Request $request): View
    {
        return view('profile.edit');
    }
    public function store(Request $request) : RedirectResponse
    {
        include('Auth/ErrorMessages/ErrorMessages.php');
        // dd($request->photo);
        if ($request->hasFile('photo')) {
            
            // Storage::disk('local')->put('example.txt', $request->file('photo'));
            
            $file = $request->file('photo');
            // $file->store('toPath', ['disk' => 'public']);
            $fileName = DB::table('t_user')->where('mailAddress', Auth::user()->mailAddress)->value('userName'). '.' . $request->file('photo')->getClientOriginalExtension();
            // Storage::disk('public')->put($fileName, $file);



            // Storage::disk('public')->putFileAs('uploads', $file, $fileName);

            $destinationPath = public_path().'/images' ;
            $file->move($destinationPath,$fileName);


            // You can now save the $filePath to the database or use it as needed
            // ...
            // return response()->json(['message' => 'File uploaded successfully']);
        }
        
        
        // Type Conversion
        $request->mailAddressStatus = (int)$request->mailAddressStatus;
        $request->height = doubleval($request->height);
        $request->weight = (int)$request->weight;

        if((int)$request->mailAddressStatus===1){
            $request->validate([
                // Username validation rule
                'userName' => ['required', 'string', 'max:32','regex:/^[0-9a-zA-Z-_]+$/'],   

                // Mail address validation rule
                'mailAddress' => ['required','email', 'string', 'lowercase',  'max:255','unique:' . T_user::class],
                //Confirm mail address validation rule
                'confirm_email' => ['required','email', 'string', 'lowercase',  'max:255', 'same:mailAddress'],
                'dateOfBirth' => [function($attribute,$value,$fail){
                    // ->subYear(), ->addYear()
                    // $maxYear = date('Y/m/d')->subYear(5);
                    // $minYear = date('Y/m/d')->subYear(150);
                    // if(date('Y/m/d')===$request->dateOfBirth);
                    // dd(check);
                    
                }],
                ], 
                [
                //Error message for Username validation rule 
                'userName.required' => $userName_required,
                'userName.max' => $userName_max_limit,
                'userName.regex' => $userName_regex,
                //Error message for mail address validation rule 
                'mailAddress.required' => $mailAddress_required,
                'mailAddress.email' => $email_validation,
                'mailAddress.lowercase' => $mailAddress_lowercase,
                'mailAddress.unique' => $mailAddress_unique,

                //Error message for confirm mail address validation rule 
                'confirm_email.required' => $confirm_email_required ,
                'confirm_email.email' => $email_validation,
                'confirm_email.lowercase' => $mailAddress_lowercase,
                'confirm_email.same' => $confirm_email_compare,
            ]);
        }
        else{
            $request->validate([
                // Username validation rule
                'userName' => ['required', 'string', 'max:32','regex:/^[0-9a-zA-Z-_]+$/'],        ],
                [
                    //Error message for Username validation rule 
                    'userName.required' => $userName_required,
                    'userName.max' => $userName_max_limit,
                    'userName.regex' => $userName_regex,
                ]
            );
        }
        //For getting current time
        $date = date('Y-m-d H:i:s');
        //For adding 24hour with current time
        $newDate = date('Y-m-d H:i:s', strtotime($date. ' + 24 hours'));

        
        $userInfo = $request->all();
        if ($request->hasFile('photo')){
            $userInfo['photo']=DB::table('t_user')->where('mailAddress', Auth::user()->mailAddress)->value('userName'). '.' . $request->file('photo')->getClientOriginalExtension();
        }
        else{
            $userInfo['photo']="";
        }
        // dd($userInfo['photo']);
        return redirect('profile/edit/confirm')->with('userInfo', $userInfo);
        // return view('profile.edit.confirm',['userInfo' => $userInfo]);
        
        
    }
}