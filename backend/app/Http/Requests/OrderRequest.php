<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class OrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        
        return [
            'reference' => 'required|uuid',
            'items' => 'required|array|min:1|max:50',
            'items.*' => 'required|array:product_id,quantity',
            'items.*.product_id' => 'required|integer|min:1|distinct',
            'items.*.quantity' => 'required|integer|min:1|max:100',
        ];
    }
}
