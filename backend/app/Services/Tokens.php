<?php
namespace App\Services;

use App\Models\User;
use Firebase\JWT\{JWT, Key};

final class Tokens
{
    private function key(): string
    {
        $key = (string) config('tienda.jwt');
        abort_if(strlen($key) < 32, 503, 'Autenticación sin configurar.');
        return $key;
    }

    public function issue(User $user): string
    {
        $now = time();
        return JWT::encode(['iss' => config('app.url'), 'aud' => 'tienda-api',
            'sub' => (string) $user->id, 'iat' => $now, 'exp' => $now + 3600], $this->key(), 'HS256');
    }

    public function resolve(string $token): User
    {
        $key = new Key($this->key(), 'HS256');
        try {
            $claims = JWT::decode($token, $key);
        } catch (\UnexpectedValueException|\DomainException $e) {
            abort(401, 'Token inválido o caducado.');
        }
        abort_unless(($claims->iss ?? null) === config('app.url') && ($claims->aud ?? null) === 'tienda-api'
            && isset($claims->exp, $claims->sub) && ctype_digit((string) $claims->sub), 401, 'Token inválido.');
        return User::find($claims->sub) ?? abort(401, 'Cliente no disponible.');
    }
}
