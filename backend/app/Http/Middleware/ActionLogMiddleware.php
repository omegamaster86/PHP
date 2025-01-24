<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ActionLogMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $user_id = Auth::id() ?? 0;  // 今回はLaravelのAuthの仕組みを使っているので、そこから取得されるidをuser_idとして使います。
        $session_id = session()->getId();
        Log::channel('action')->info('action_log', [
            'user_id' => $user_id,
            'session_id' => hash("sha256", $session_id),     //セッションIDはSHA-256でハッシュ化する
        ]);
        $response = $next($request);
        return $response;
    }
}
