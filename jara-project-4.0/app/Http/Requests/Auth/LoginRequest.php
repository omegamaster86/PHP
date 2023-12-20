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
use App\Models\T_users;

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
            'mailaddress' => ['required', 'string','email'],
            'password' => ['required', 'string'],
        ];
    }
    public function messages()
    {
        include('ErrorMessages/ErrorMessages.php');
        return [
            'mailaddress.required' => $mailAddress_required,
            'mailaddress.email'=> $email_validation,
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
        if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? and delete_flag = 1 ',[$this->only('mailaddress')['mailaddress']]))) {
            throw ValidationException::withMessages([
                'datachecked_error' => $this_mail_deleted
            ]); 
        }
        
        if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? and expiry_time_of_temp_password < ? ',[$this->only('mailaddress')['mailaddress'], date('Y-m-d H:i:s')]))) {
            throw ValidationException::withMessages([
                'datachecked_error' => $temp_password_timed_out
            ]); 
        }
        
        if (! Auth::attempt($this->only('mailaddress', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());
            
            if (!empty(DB::select('SELECT user_id FROM t_users where mailaddress = ? ',[$this->only('mailaddress')['mailaddress']]))) {
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

        $find_user_id = DB::select('SELECT user_id FROM t_users where mailaddress = ?',[$this->only('mailaddress')['mailaddress']]);
        
        $user_id = $find_user_id[0]->user_id;

        DB::beginTransaction();
        try {
           DB::insert('insert into t_access_log (user_id, access_time, ip, host, browser, registered_time, registered_user_id,update_time, update_user_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?)', [$user_id, now(), request()->host(), request()->getHttpHost(), request()->userAgent(),now(),$user_id, now(), $user_id]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();

            $e_message = $e->getMessage();
            $e_code = $e->getCode();
            $e_file = $e->getFile();
            $e_line = $e->getLine();
            $e_sql = $e->getSql();
            $e_errorCode = $e->errorInfo[1];
            $e_bindings = implode(", ",$e->getBindings());
            $e_connectionName = $e->connectionName;

            //Store log data of the logged in user.
            Log::channel('user_login_access_log')->info("  \r\n \r\n ＊＊＊「MESSAGE」  ： $e_message, \r\n \r\n ＊＊＊「CODE」 ： $e_code,  \r\n \r\n ＊＊＊「FILE」 ： $e_file,  \r\n \r\n ＊＊＊「LINE」 ： $e_line,  \r\n \r\n ＊＊＊「CONNECTION_NAME」 -> $e_connectionName,  \r\n \r\n ＊＊＊「SQL」 ： $e_sql,  \r\n \r\n ＊＊＊「BINDINGS」 ： $e_bindings  \r\n  \r\n ============================================================ \r\n \r\n");
            
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
            'mailaddress' => trans('auth.throttle', [
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
