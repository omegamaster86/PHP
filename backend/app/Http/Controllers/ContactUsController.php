<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactUsMail;
use App\Mail\ContactUsMailForAdmin;
use Illuminate\Support\Facades\Log;

class ContactUsController extends Controller
{
    public function store(Request $request)
    {
        include('Auth/ErrorMessages/ErrorMessages.php');

        Log::debug(sprintf("contact-us start"));
        $mail_data = [
            'user_name' => $request->user_name,
            'mailaddress' => $request->mailaddress,
            'content' => $request->content,
            'user_id' => Auth::user()->user_id ?? ""
        ];

        //Sending mail to the user
        try {
            Mail::to($request->get('mailaddress'))->send(new ContactUsMail($mail_data));
            Mail::to(env('INQUIRY_MAIL_ADDRESS', 'hello@example.com'))->send(new ContactUsMailForAdmin($mail_data));
        } catch (\Throwable $e) {
            Log::error($e);
            Log::debug(sprintf("contact-us end"));
            abort(400, $mail_sent_failed_for_contact_us);
        }
        Log::debug(sprintf("contact-us end"));
        return response()->json(["メール送信の件、完了しました。"], 200);
    }
}
