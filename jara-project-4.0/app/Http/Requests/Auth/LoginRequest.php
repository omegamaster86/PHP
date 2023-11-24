<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'mailAddress' => ['required', 'string','email'],
            'password' => ['required', 'string'],
        ];
    }
    public function messages()
    {
        include('ErrorMessages/ErrorMessages.php');
        return [
            'mailAddress.required' => $mailAddress_required,
            'mailAddress.email'=> $email_validation,
            'password.required' => $password_required 
        ];
    }
    


    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        include('ErrorMessages/ErrorMessages.php');
        $this->ensureIsNotRateLimited();
        if (DB::table('t_user')->where('mailAddress', $this->only('mailAddress'))->where('expiryTimeOfTempPassword', '<', date('Y-m-d H:i:s'))->exists()) {
            throw ValidationException::withMessages([
                'datachecked_error' => $temp_password_timed_out
            ]); 
        }
        if (! Auth::attempt($this->only('mailAddress', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());
            if (DB::table('t_user')->where('mailAddress', $this->only('mailAddress'))->exists()) {
                throw ValidationException::withMessages([
                    'datachecked_error' => $password_compare
                ]);
            }
            
            else{
                throw ValidationException::withMessages([
                    'datachecked_error' => $mailAddress_not_found,
                ]);
                
            }
        }
        $userid = DB::table('t_user')->where('mailAddress', $this->only('mailAddress'))->value('userId');

        DB::table('t_access_log')->insert([
            'userid'=>$userid,
            'accesstime' => now(),
            'ip' => request()->host(),
            'host' => request()->getHttpHost(),
            'browser' => request()->userAgent(),
            'registered_time' => now(),
            'registered_userid' => $userid,
            'update_time' => now(),
            'update_userid' => $userid,
        ]);

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'mailAddress' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->input('mailaddress')).'|'.$this->ip());
    }
}
