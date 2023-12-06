<?php
/*************************************************************************
*  Project name: JARA
*  File name: UserEditController.php
*  File extension: .php
*  Description: This is the controller file to manage user edit request
*************************************************************************
*  Author: DEY PRASHANTA KUMAR
*  Created At: 2023/11/04
*  Updated At: 2023/11/09
*************************************************************************
*
*  Copyright 2023 by DPT INC.
*
************************************************************************/
namespace App\Http\Controllers;
// use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;
use Illuminate\Validation\ValidationException;
use App\Services\FileUploadService;
use App\Http\Requests\FileUploadRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;

class UserEditController extends Controller
{
    public function create(Request $request): View
    {
        // if(Auth::user()->sex??""){
        //     $sex = Auth::user()->sex;
        // }
        // else{
        //     $sex = "";
        // }
        // if(Auth::user()->residence_country??"")
        //     $residence_country = Auth::user()->residence_country;
        // else
        //     $residence_country = "";
        // if($residence_country==="日本"){
        //     if(Auth::user()->residence_prefecture??"")
        //         $residence_prefecture = Auth::user()->residence_prefecture;
        //     else
        //         $residence_prefecture = "";
        // }
        // else
        //     $residence_prefecture = "";
        
        if(Auth::user()->date_of_birth)
            $date_of_birth = date('Y/m/d', strtotime(Auth::user()->date_of_birth));
        else
            $date_of_birth = "年/月/日";

        $user = array(
            "user_name" => Auth::user()->user_name, 
            "user_id" => Auth::user()->user_id, 
            "user_type" => Auth::user()->user_type, 
            "mailaddress" => Auth::user()->mailaddress, 
            "sex" => Auth::user()->sex, 
            "residence_country" => Auth::user()->residence_country, "residence_prefecture" => Auth::user()->residence_prefecture ,
            "photo" => Auth::user()->photo, 
            "date_of_birth" => $date_of_birth, 
            "height" => Auth::user()->height, 
            "weight" => Auth::user()->weight );

        return view('user.edit')->with(compact('user'));
    }
    public function store(Request $request) : RedirectResponse
    {

        include('Auth/ErrorMessages/ErrorMessages.php');
        // dd($request->photo);
        if ($request->hasFile('photo')) {
            
            // Storage::disk('local')->put('example.txt', $request->file('photo'));
            
            $file = $request->file('photo');
            // $file->store('toPath', ['disk' => 'public']);
            $file_name = DB::table('t_users')->where('mailaddress', Auth::user()->mailaddress)->value('user_id'). '.' . $request->file('photo')->getClientOriginalExtension();
            // Storage::disk('public')->put($fileName, $file);

            // Storage::disk('public')->putFileAs('uploads', $file, $fileName);

            $destination_path = public_path().'/images/users/' ;
            $file->move($destination_path,$file_name);

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
                // [^\x01-\x7E]
                // ^[0-9a-zA-Z-_]+$
                // Username validation rule
                'username' => ['required', 'string', 'max:32','regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_][ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]*[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_]$/'],   

                // Mail address validation rule
                'mailaddress' => ['required','email', 'string', 'lowercase',  'max:255','unique:' . T_user::class],
                //Confirm mail address validation rule
                'confirm_email' => ['required','email', 'string', 'lowercase',  'max:255', 'same:mailAddress'],

                'sex' => ['required','string'],
                'date_of_birth' => ['required','string'],
                'residence_country' => ['required','string'],
                'residence_prefecture' => ['nullable','required_if:residence_country,日本','string'
                
                // function($attribute,$value,$fail) {
                    //     include('ErrorMessages/ErrorMessages.php');
                            
                    // },
                    ]
                ], 
                [
                //Error message for Username validation rule 
                'user_name.required' => $user_name_required,
                'user_name.max' => $user_name_max_limit,
                'user_name.regex' => $userName_regex,
                //Error message for mail address validation rule 
                'mailaddress.required' => $mailAddress_required,
                'mailaddress.email' => $email_validation,
                'mailaddress.lowercase' => $mailAddress_lowercase,
                'mailaddress.unique' => $mailAddress_unique,

                //Error message for confirm mail address validation rule 
                'confirm_email.required' => $confirm_email_required ,
                'confirm_email.email' => $email_validation,
                'confirm_email.lowercase' => $mailAddress_lowercase,
                'confirm_email.same' => $confirm_email_compare,
                //Error message for date of birth validation rule 
                'sex.required' => $sex_required,
                'date_of_birth.required' => $dateOfBirth_required,
                'residence_country.required' => $residenceCountry_required,
                'residence_prefecture.required_if' => $residencePrefecture_required_if,
            ]);
        }
        else{
            $request->validate([
                // Username validation rule
                'user_name' => ['required', 'string', 'max:32','regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_][ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]*[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_]$/'],
                'sex' => ['required','string'],
                'date_of_birth' => ['required','string'],
                'residence_country' => ['required','string'],
                'residence_prefecture' => ['nullable','required_if:residence_country,日本','string']

            ],
                [
                    //Error message for Username validation rule 
                    'user_name.required' => $userName_required,
                    'user_name.regex' => $userName_regex,
                    'user_name.max' => $userName_max_limit,
                    'sex.required' => $sex_required,
                    //Error message for date of birth validation rule 
                    'date_of_birth.required' => $dateOfBirth_required,
                    'residence_country.required' => $residenceCountry_required,
                    'residence_prefecture.required_if' => $residencePrefecture_required_if,
                ]
            );
        }
        //For getting current time
        $date = date('Y-m-d H:i:s');
        //For adding 24hour with current time
        $newDate = date('Y-m-d H:i:s', strtotime($date. ' + 24 hours'));

        
        $userInfo = $request->all();
        
        if ($request->hasFile('photo')){
            $userInfo['photo']=DB::table('t_users')->where('mailaddress', '=', Auth::user()->mailaddress)->value('user_id'). '.' . $request->file('photo')->getClientOriginalExtension();
        }
        else{
            if($request->userPictureStatus==="delete")
                $userInfo['photo']="";
            else
                $userInfo['photo']=DB::table('t_user')->where('mailAddress', Auth::user()->mailAddress)->value('photo');
        }
        // dd($userInfo['photo']);
        return redirect('user/edit/confirm')->with('userInfo', $userInfo);
        
        
    }
}