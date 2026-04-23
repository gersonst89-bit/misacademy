<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'token' => 'required|string',
            'email' => 'required|email|exists:usuarios,email',
            'password' => 'required|string|min:8|confirmed',
        ];
    }
}
