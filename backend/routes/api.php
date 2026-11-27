<?php
use App\Http\Controllers\{AuthController, ProductController, OrderController, PaymentController};
use Illuminate\Support\Facades\Route;

Route::view('documentation', 'swagger');
Route::middleware('throttle:10,1')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{product}', [ProductController::class, 'show'])->whereNumber('product');
Route::post('stripe/webhook', [PaymentController::class, 'webhook']);
Route::middleware('jwt')->group(function () {
    Route::post('products', [ProductController::class, 'store']);
    Route::patch('products/{product}', [ProductController::class, 'update'])->whereNumber('product');
    Route::delete('products/{product}', [ProductController::class, 'destroy'])->whereNumber('product');
    Route::post('orders', [OrderController::class, 'store']);
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{id}', [OrderController::class, 'show'])->whereNumber('id');
    Route::post('orders/{id}/payment', [PaymentController::class, 'intent'])->whereNumber('id');
});
