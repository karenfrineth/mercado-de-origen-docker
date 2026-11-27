<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\{Exceptions, Middleware};
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(api: __DIR__.'/../routes/api.php', web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php')
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias(['jwt' => App\Http\Middleware\JwtAuth::class]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if (!$request->is('api/*')) return null;
            $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;
            $details = [];
            $message = match ($status) {
                403 => 'Permisos insuficientes.', 404 => 'Recurso no encontrado.', 405 => 'Método no permitido.',
                429 => 'Demasiadas solicitudes.', 500 => 'Error interno.',
                default => $e->getMessage(),
            };
            if ($e instanceof ValidationException) {
                $status = 422;
                $message = 'Revisa los campos indicados.';
                $details = $e->errors();
            }
            return response()->json(['error' => ['status' => $status, 'message' => $message,
                'details' => (object) $details]], $status,
                $e instanceof HttpExceptionInterface ? $e->getHeaders() : []);
        });
    })->create();
