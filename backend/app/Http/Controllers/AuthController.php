<?php
namespace App\Http\Controllers;

use App\Http\Requests\{LoginRequest, RegisterRequest};
use App\Models\User;
use App\Services\Tokens;
use Illuminate\Support\Facades\Hash;

final class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create($request->validated());
        return response()->json(['id'=>$user->id, 'name'=>$user->name, 'email'=>$user->email], 201);
    }

    public function login(LoginRequest $request, Tokens $tokens)
    {
        $user = User::where('email', $request->validated('email'))->first();
        abort_unless($user && Hash::check($request->validated('password'), $user->password),
            401, 'Credenciales incorrectas.');
        return ['access_token'=>$tokens->issue($user), 'token_type'=>'Bearer', 'expires_in'=>3600];
    }
}
