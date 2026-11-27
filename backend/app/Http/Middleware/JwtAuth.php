<?php
namespace App\Http\Middleware;

use App\Services\Tokens;
use Closure;
use Illuminate\Http\Request;

final class JwtAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken() ?: abort(401, 'Se requiere un token Bearer.');
        $user = app(Tokens::class)->resolve($token);
        $request->setUserResolver(fn () => $user);
        return $next($request);
    }
}
