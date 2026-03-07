<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pass;
use App\Services\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PassController extends Controller
{
    public function createPass(Request $request, JwtService $jwt)
    {
        $data = $request->validate([
            'pass_type' => 'required|in:visitor,delivery',
            'household_id' => 'required|exists:households,id',
            'issued_by_user_id' => 'required|exists:users,id',
            'visitor_name' => 'nullable|string|max:255',
            'has_vehicle' => 'nullable|boolean',
            'plate_no' => 'nullable|string|max:30',
            'delivery_type' => 'nullable|string|max:100',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
        ]);

        $hasVehicle = (bool)($data['has_vehicle'] ?? false);

        if ($data['pass_type'] === 'visitor' && empty($data['visitor_name'])) {
            return response()->json([
                'ok' => false,
                'message' => 'Visitor name is required.',
            ], 422);
        }

        if ($data['pass_type'] === 'visitor' && $hasVehicle && empty($data['plate_no'])) {
            return response()->json([
                'ok' => false,
                'message' => 'Plate number is required if visitor has a vehicle.',
            ], 422);
        }

        $pass = Pass::create([
            'pass_type' => $data['pass_type'],
            'household_id' => $data['household_id'],
            'issued_by_user_id' => $data['issued_by_user_id'],
            'visitor_name' => $data['visitor_name'] ?? null,
            'has_vehicle' => $hasVehicle,
            'plate_no' => $data['plate_no'] ?? null,
            'delivery_type' => $data['delivery_type'] ?? null,
            'valid_from' => $data['valid_from'],
            'valid_until' => $data['valid_until'],
            'usage_limit' => 1,
            'usage_count' => 0,
            'status' => 'active',
            'token_jti' => Str::uuid(),
        ]);

        $ttl = max(60, $pass->valid_until->timestamp - time());

        $issued = $jwt->issue([
            'type' => $pass->pass_type,
            'passId' => $pass->id,
            'householdId' => $pass->household_id,
            'visitorName' => $pass->visitor_name,
            'hasVehicle' => $pass->has_vehicle,
            'plateNo' => $pass->plate_no,
            'deliveryType' => $pass->delivery_type,
            'usageLimit' => $pass->usage_limit,
        ], $ttl);

        $pass->token_jti = $issued['payload']['jti'];
        $pass->save();

        return response()->json([
            'ok' => true,
            'pass' => $pass,
            'qrToken' => $issued['token'],
        ]);
    }
}