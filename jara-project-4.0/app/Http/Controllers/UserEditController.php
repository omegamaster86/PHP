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
use App\Models\T_user;
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
        if(Auth::user()->sex??""){
            $sex = Auth::user()->sex;
        }
        else{
            $sex = "";
        }
        if(Auth::user()->residenceCountry??"")
            $residenceCountry = Auth::user()->residenceCountry;
        else
            $residenceCountry = "";
        if($residenceCountry==="日本"){
            if(Auth::user()->residencePrefecture??"")
                $residencePrefecture = Auth::user()->residencePrefecture;
            else
                $residencePrefecture = "";
        }
        else
            $residencePrefecture = "";
        if(Auth::user()->photo??"")
            $photo = Auth::user()->photo;
        else
            $photo = "";
        
        if(Auth::user()->dateOfBirth??"")
            $birthDate = date('Y/m/d', strtotime(Auth::user()->dateOfBirth));
        else
            $birthDate = "";
        return view('user.edit',["birthDate"=>$birthDate,"sex"=>$sex,"residenceCountry" => $residenceCountry,"residencePrefecture" => $residencePrefecture, "photo"=>$photo]);
    }
    public function store(Request $request) : RedirectResponse
    {
        // if($request->hasFile('photo'))
        //     $photo = ($request->photo->getClientOriginalName());
        // else
        //     $photo = "";

        include('Auth/ErrorMessages/ErrorMessages.php');
        // dd($request->photo);
        if ($request->hasFile('photo')) {
            
            // Storage::disk('local')->put('example.txt', $request->file('photo'));
            
            $file = $request->file('photo');
            // $file->store('toPath', ['disk' => 'public']);
            $fileName = DB::table('t_user')->where('mailAddress', Auth::user()->mailAddress)->value('userId'). '.' . $request->file('photo')->getClientOriginalExtension();
            // Storage::disk('public')->put($fileName, $file);

            // Storage::disk('public')->putFileAs('uploads', $file, $fileName);

            $destinationPath = public_path().'/images/users/' ;
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
                // [^\x01-\x7E]
                // ^[0-9a-zA-Z-_]+$
                // Username validation rule
                'userName' => ['required', 'string', 'max:32','regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_][ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]*[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_]$/'],   

                // Mail address validation rule
                'mailAddress' => ['required','email', 'string', 'lowercase',  'max:255','unique:' . T_user::class],
                //Confirm mail address validation rule
                'confirm_email' => ['required','email', 'string', 'lowercase',  'max:255', 'same:mailAddress'],

                'sex' => ['required','string'],
                'dateOfBirth' => ['required','string'],
                'residenceCountry' => ['required','string'],
                'residencePrefecture' => ['nullable','required_if:residenceCountry,日本','string'
                
                // function($attribute,$value,$fail) {
                    //     include('ErrorMessages/ErrorMessages.php');
                            
                    // },
                    ]
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
                //Error message for date of birth validation rule 
                'sex.required' => $sex_required,
                'dateOfBirth.required' => $dateOfBirth_required,
                'residenceCountry.required' => $residenceCountry_required,
                'residencePrefecture.required_if' => $residencePrefecture_required_if,
            ]);
        }
        else{
            $request->validate([
                // Username validation rule
                'userName' => ['required', 'string', 'max:32','regex:/^[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_][ぁ-んァ-ヶー一-龯0-9a-zA-Z-_ ]*[ぁ-んァ-ヶー一-龯0-9a-zA-Z-_]$/'],
                'sex' => ['required','string'],
                'dateOfBirth' => ['required','string'],
                'residenceCountry' => ['required','string'],
                'residencePrefecture' => ['nullable','required_if:residenceCountry,日本','string']

            ],
                [
                    //Error message for Username validation rule 
                    'userName.required' => $userName_required,
                    'userName.max' => $userName_max_limit,
                    'userName.regex' => $userName_regex,
                    'sex.required' => $sex_required,
                    //Error message for date of birth validation rule 
                    'dateOfBirth.required' => $dateOfBirth_required,
                    'residenceCountry.required' => $residenceCountry_required,
                    'residencePrefecture.required_if' => $residencePrefecture_required_if,
                ]
            );
        }
        //For getting current time
        $date = date('Y-m-d H:i:s');
        //For adding 24hour with current time
        $newDate = date('Y-m-d H:i:s', strtotime($date. ' + 24 hours'));

        
        $userInfo = $request->all();
        
        if ($request->hasFile('photo')){
            $userInfo['photo']=DB::table('t_user')->where('mailAddress', Auth::user()->mailAddress)->value('userId'). '.' . $request->file('photo')->getClientOriginalExtension();
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