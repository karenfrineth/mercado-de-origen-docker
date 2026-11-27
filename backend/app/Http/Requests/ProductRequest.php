<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class ProductRequest extends FormRequest
{
    public function authorize(): bool { return (bool) $this->user()?->is_admin; }

    public function rules(): array
    {
        $presence = $this->isMethod('patch') ? 'sometimes|required' : 'required';
        return [
            'name' => "{$presence}|string|max:120",
            'description' => "{$presence}|string|max:2000",
            'price_cents' => "{$presence}|integer|min:50|max:99999999",
        ];
    }
}
