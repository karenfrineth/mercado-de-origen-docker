<?php
namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\Request;

final class ProductController extends Controller
{
    public function index() { return Product::orderBy('id')->get(); }
    public function show(Product $product) { return $product; }
    public function store(ProductRequest $request)
    {
        return response()->json(Product::create($request->validated()), 201);
    }
    public function update(ProductRequest $request, Product $product)
    {
        abort_if(!$request->validated(), 422, 'Indica al menos un campo.');
        $product->update($request->validated());
        return $product;
    }
    public function destroy(Request $request, Product $product)
    {
        abort_unless($request->user()->is_admin, 403, 'Se requiere un administrador.');
        $product->delete();
        return response()->noContent();
    }
}
