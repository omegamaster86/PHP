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
            'email' => ['required', 'string', 'email'],
            // 'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $input = $this->request->all();

        include(app_path() . '/Http/Controllers/Auth/ErrorMessages/ErrorMessages.php');
        $this->ensureIsNotRateLimited();
        if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? and delete_flag = 1 ', [$input['email']]))) {
            throw ValidationException::withMessages([
                'system_error' => $this_mail_deleted
            ]);
        }

        if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? and expiry_time_of_temp_password < ? ', [$input['email'], date('Y-m-d H:i:s')]))) {
            throw ValidationException::withMessages([
                'system_error' => $temp_password_timed_out
            ]);
        }

        if (! Auth::attempt(['mailaddress' => $input['email'], 'password' => $input['password']])) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'system_error' => $password_compare
            ]);

            // if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? ',[$input['email']]))) {
            //     throw ValidationException::withMessages([
            //         'system_error' => $password_compare
            //     ]);
            // }

            // else{
            //     throw ValidationException::withMessages([
            //         'system_error' => $mailAddress_not_found,
            //     ]);

            // }
        }

        $find_user_id = DB::select('SELECT user_id FROM t_users where mailaddress = ?', [$input['email']]);

        $user_id = $find_user_id[0]->user_id;

        DB::beginTransaction();
        try {
            DB::insert('insert into t_access_logs (access_user_id, access_datetime, access_ip, access_host, access_browser, registered_time, registered_user_id, updated_time, updated_user_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?)', [$user_id, now()->format('Y-m-d H:i:s.u'), request()->getClientIp(), request()->getHttpHost(), request()->userAgent(), now()->format('Y-m-d H:i:s.u'), $user_id, now()->format('Y-m-d H:i:s.u'), $user_id]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e);
            abort(500, $e->getMessage());
        }


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
            'email' => trans('auth.throttle', [
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
        return Str::transliterate(Str::lower($this->input('email')) . '|' . $this->ip());
    }
}
