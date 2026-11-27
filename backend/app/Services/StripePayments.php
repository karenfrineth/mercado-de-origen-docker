<?php
namespace App\Services;

use App\Models\{Order, Payment};
use Illuminate\Support\Facades\DB;
use Stripe\{PaymentIntent, StripeClient};
use Stripe\Exception\ApiErrorException;

final class StripePayments
{
    public function intent(Order $order): array
    {
        $key = config('tienda.stripe');
        abort_unless($key, 503, 'Stripe sin configurar.');
        $payment = DB::transaction(function () use ($order) {
            $locked = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->status === 'paid', 409, 'La orden ya está pagada.');
            return Payment::firstOrCreate(['order_id'=>$locked->id]);
        });
        $client = new StripeClient($key);
        try {
            if ($payment->stripe_id) {
                $intent = $client->paymentIntents->retrieve($payment->stripe_id);
            } else {
                abort_if($payment->created_at->lt(now()->subHours(23)), 409, 'Se requiere conciliar el intento antes de reintentar.');
                $intent = $client->paymentIntents->create([
                    'amount'=>$order->total_cents, 'currency'=>'usd', 'payment_method_types'=>['card'],
                    'metadata'=>['payment_id'=>$payment->id, 'order_id'=>(string) $order->id],
                ], ['idempotency_key'=>'tienda-'.$payment->id]);
                Payment::whereKey($payment->id)->whereNull('stripe_id')->update(['stripe_id'=>$intent->id]);
            }
        } catch (ApiErrorException $e) {
            abort(502, 'Stripe no pudo completar la solicitud. Puedes reintentar.');
        }
        return ['payment_id'=>$payment->id, 'intent_id'=>$intent->id, 'client_secret'=>$intent->client_secret,
            'status'=>$intent->status, 'amount'=>$intent->amount, 'currency'=>'usd'];
    }

    public function settle(PaymentIntent $intent): void
    {
        $local = Payment::find($intent->metadata->payment_id ?? '');
        if (!$local) return; // Evento de otra integración de la misma cuenta Stripe.
        DB::transaction(function () use ($intent, $local) {
            $order = Order::whereKey($local->order_id)->lockForUpdate()->firstOrFail();
            $payment = Payment::whereKey($local->id)->lockForUpdate()->firstOrFail();
            abort_unless((string) $order->id === (string) $intent->metadata->order_id
                && $intent->currency === 'usd' && $intent->status === 'succeeded'
                && (int) $intent->amount_received === (int) $order->total_cents
                && (!$payment->stripe_id || $payment->stripe_id === $intent->id), 409, 'El pago no coincide con la orden.');
            if ($order->status === 'paid') return;
            $payment->stripe_id = $intent->id;
            $payment->status = 'succeeded';
            $payment->save();
            $order->status = 'paid';
            $order->save();
        }, 3);
    }
}
