<?php
namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\StripePayments;
use Illuminate\Http\Request;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

final class PaymentController extends Controller
{
    public function intent(Request $request, int $id, StripePayments $payments)
    {
        $order = Order::where('user_id',$request->user()->id)->findOrFail($id);
        return response()->json($payments->intent($order))->header('Cache-Control', 'no-store');
    }

    public function webhook(Request $request, StripePayments $payments)
    {
        $secret = config('tienda.webhook') ?: abort(503, 'Webhook sin configurar.');
        try {
            $event = Webhook::constructEvent($request->getContent(), $request->header('Stripe-Signature', ''), $secret);
        } catch (\UnexpectedValueException|SignatureVerificationException $e) {
            abort(400, 'Evento o firma inválidos.');
        }
        if ($event->type === 'payment_intent.succeeded') $payments->settle($event->data->object);
        return ['received'=>true];
    }
}
