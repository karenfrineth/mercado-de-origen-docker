<?php
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
Artisan::command('tienda:jwt-key', function () {
    $file = app()->environmentFilePath();
    $env = file_get_contents($file);
    if (!preg_match('/^JWT_SECRET=$/m', $env)) {
        $this->error('Se requiere JWT_SECRET vacío en .env.'); return 1;
    }
    file_put_contents($file, preg_replace('/^JWT_SECRET=$/m', 'JWT_SECRET='.bin2hex(random_bytes(32)), $env), LOCK_EX);
    $this->info('Clave JWT generada.');
});
Artisan::command('tienda:admin {email}', function () {
    $user = User::where('email', $this->argument('email'))->firstOrFail();
    $user->is_admin = true;
    $user->save();
    $this->info('Administrador habilitado.');
});
