<?php
namespace App\Http\Controllers;

use App\Http\Requests\OrderRequest;
use App\Models\{Order, Product, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class OrderController extends Controller
{
    public function index(Request $request)
    {
        return Order::where('user_id', $request->user()->id)->with('items')->latest('id')->get();
    }

    public function show(Request $request, int $id)
    {
        return Order::where('user_id', $request->user()->id)->with('items')->findOrFail($id);
    }

    public function store(OrderRequest $request)
    {
        $userId = $request->user()->id;
        $items = collect($request->validated('items'))->keyBy('product_id')->sortKeys();
        $reference = $request->validated('reference');

        return DB::transaction(function () use ($userId, $reference, $items) {
            User::whereKey($userId)->lockForUpdate()->firstOrFail();
            $existing = Order::where(['user_id'=>$userId, 'reference'=>$reference])->with('items')->first();
            if ($existing) {
                $previous = $existing->items->pluck('quantity','product_id')->sortKeys()->all();
                abort_if($previous != $items->pluck('quantity','product_id')->all(), 409, 'La referencia pertenece a otra compra.');
                return response()->json($existing);
            }
            $products = Product::whereKey($items->keys()->all())->orderBy('id')->sharedLock()->get()->keyBy('id');
            abort_if($products->count() !== $items->count(), 422, 'Hay productos inexistentes o inactivos.');
            $lines = [];
            $total = 0;
            foreach ($items as $id => $item) {
                $product = $products[$id];
                $total += $product->price_cents * $item['quantity'];
                $lines[] = ['product_id'=>$id, 'name'=>$product->name,
                    'quantity'=>$item['quantity'], 'unit_cents'=>$product->price_cents];
            }
            abort_if($total > 99999999, 422, 'El total supera el máximo admitido.');
            $order = Order::create(['user_id'=>$userId, 'reference'=>$reference, 'total_cents'=>$total]);
            $order->items()->createMany($lines);
            return response()->json($order->refresh()->load('items'), 201);
        }, 3);
    }
}
