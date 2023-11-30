<?php
/*************************************************************************
*  Project name: JARA
*  File name: AuthenticatedSessionController.php
*  File extension: .php
*  Description: This is the controller file to manage login request
*************************************************************************
*  Author: DEY PRASHANTA KUMAR
*  Created At: 2023/11/02
*  Updated At: 2023/11/09
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
     * Display the login view.
     */
    public function create(): View
    {
        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();  

        $request->session()->regenerate();

        //Redirect the logged user to the my page or password change page
        $tempPasswordFlag = DB::table('t_user')->where('mailAddress', $request->mailAddress)->value('tempPasswordFlag');
        if($tempPasswordFlag)
            return redirect('user/password-change');
        else
            return redirect('my-page');
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
