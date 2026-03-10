<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ValidateScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => 'required|string',
            'guard_user_id' => 'required|exists:users,id',
            'gate' => 'required|in:gate1,gate2',
            'direction' => 'required|in:IN,OUT',
            'note' => 'nullable|string',
        ];
    }
}
