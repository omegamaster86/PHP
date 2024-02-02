<?php

/*************************************************************************
 *  Project name: JARA
 *  File name: AuthenticatedSessionController.php
 *  File extension: .php
 *  Description: This is the controller file to manage login request
 *************************************************************************
 *  Author: DEY PRASHANTA KUMAR
 *  Created At: 2023/11/02
 *  Updated At: 2023/12/04
 *************************************************************************
 *
 *  Copyright 2023 by DPT INC.
 *
 ************************************************************************/

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login page view.
     */
    public function create(): View
    {
        // dd("test");
        //return view('auth.login');
        $token = csrf_token();
        $hoge = (string) $token . "000000hoge";
        return view('auth.login', ["hoge" => $hoge]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        //dd($request->all(), $request->session()->token(), csrf_token());
        $request->authenticate();

        $request->session()->regenerate();

        return response()->noContent();//react-frontend

        //blade

        //Get the status of registered user
        // $temp_password_flag = Auth::user()->temp_password_flag;

        // //Redirect the temporary registered user to the my password change page
        // if ($temp_password_flag) {
        //     return redirect('user/password-change');
        // }
        // //Redirect the registered user to the my page
        // else {
        //     return redirect('my-page');
        // }
    }
    //20240119 React連携 ログイン画面CSRFトークン生成
    public function createCsrf()
    {
        //$token = $request->session()->token();
        // $token = "aaaaaaaaaa";
        $token = csrf_token();
        echo($token);
        echo("aaaaaaaaa");
        var_dump($token);
        $hoge = str_split($token);
        $hoge = "aaa000aaa000" . (string) $token . "hhhhhhh99999999";
        return  $hoge;
    }

    //20240119 React連携 ログイン画面遷移
    public function loginCheck(Request $request)
    {
        //$request->session()->token();
        $reqData = $request->all();
        return  $reqData;
        $request->authenticate();

        $request->session()->regenerate();
        

        //Get the status of registered user
        $temp_password_flag = Auth::user()->temp_password_flag;

        return $temp_password_flag;
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Logout Function
        Auth::guard('web')->logout();

        //Destroy current session
        $request->session()->invalidate();

        //Destroy current  token
        $request->session()->regenerateToken();

        //Redirect the logout user to the index page
        return redirect('/');
    }
}
