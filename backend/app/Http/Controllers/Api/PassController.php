<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreatePassRequest;
use App\Models\Pass;
use App\Services\JwtService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class PassController extends Controller
{
    public function createPass(CreatePassRequest $request, JwtService $jwt)
    {
        $data = $request->validated();

        $idempotencyKey = $request->header('X-Idempotency-Key');
        $cacheKey = null;
        if (!empty($idempotencyKey)) {
            $cacheKey = sprintf('idempotency:passes:%s:%s', $data['issued_by_user_id'], $idempotencyKey);
            $cached = Cache::get($cacheKey);
            if ($cached) {
                return response()->json($cached);
            }
        }

        $hasVehicle = (bool)($data['has_vehicle'] ?? false);

        $pass = DB::transaction(function () use ($data, $hasVehicle) {
            return Pass::create([
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
        });

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

        $response = [
            'success' => true,
            'ok' => true,
            'message' => 'Pass created successfully.',
            'pass' => $pass,
            'qrToken' => $issued['token'],
            'guestUrl' => URL::to('/guest-pass') . '?token=' . urlencode($issued['token']),
        ];

        if ($cacheKey) {
            Cache::put($cacheKey, $response, now()->addMinutes(10));
        }

        return response()->json($response, 201);
    }
}