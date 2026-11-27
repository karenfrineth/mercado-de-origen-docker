<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        
        return [
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:254|unique:users,email',
            'password' => 'required|string|min:12|max:72',
        ];
    }
}
