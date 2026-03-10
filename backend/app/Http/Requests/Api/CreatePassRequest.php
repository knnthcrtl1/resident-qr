<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CreatePassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pass_type' => 'required|in:visitor,delivery',
            'household_id' => 'required|exists:households,id',
            'issued_by_user_id' => 'required|exists:users,id',
            'visitor_name' => 'nullable|string|max:255',
            'has_vehicle' => 'nullable|boolean',
            'plate_no' => 'nullable|string|max:30',
            'delivery_type' => 'nullable|string|max:100',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $passType = (string) $this->input('pass_type', '');
            $hasVehicle = (bool) $this->boolean('has_vehicle');

            if ($passType === 'visitor' && empty($this->input('visitor_name'))) {
                $validator->errors()->add('visitor_name', 'Visitor name is required for visitor passes.');
            }

            if ($passType === 'visitor' && $hasVehicle && empty($this->input('plate_no'))) {
                $validator->errors()->add('plate_no', 'Plate number is required when visitor has a vehicle.');
            }
        });
    }
}
