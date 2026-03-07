<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pass;
use App\Models\ScanLog;
use App\Services\JwtService;
use Illuminate\Http\Request;

class ScanController extends Controller
{
    public function validateScan(Request $request, JwtService $jwt)
    {
        $data = $request->validate([
            'token' => 'required|string',
            'guard_user_id' => 'required|exists:users,id',
            'gate' => 'required|in:gate1,gate2',
            'direction' => 'required|in:IN,OUT',
            'note' => 'nullable|string',
        ]);

        $rawHash = hash('sha256', $data['token']);

        try {
            $payload = $jwt->verify($data['token']);
        } catch (\Throwable $e) {
            $this->logScan(null, $data, $rawHash, 'INVALID');
            return response()->json([
                'ok' => false,
                'result' => 'INVALID',
                'message' => 'Invalid QR.',
            ]);
        }

        $type = $payload['type'] ?? null;

        if ($type === 'resident') {
            $this->logScan(null, $data, $rawHash, 'VALID');

            return response()->json([
                'ok' => true,
                'result' => 'VALID',
                'display' => [
                    'type' => 'resident',
                    'householdId' => $payload['householdId'] ?? null,
                    'directionAllowed' => ['IN', 'OUT'],
                ],
            ]);
        }

        if (!in_array($type, ['visitor', 'delivery'])) {
            $this->logScan(null, $data, $rawHash, 'INVALID');
            return response()->json([
                'ok' => false,
                'result' => 'INVALID',
                'message' => 'Unknown token type.',
            ]);
        }

        if ($data['direction'] === 'OUT') {
            $this->logScan(null, $data, $rawHash, 'DENIED_RULE');
            return response()->json([
                'ok' => false,
                'result' => 'DENIED_RULE',
                'message' => 'OUT is not allowed for visitor/delivery passes.',
            ]);
        }

        $pass = Pass::where('id', $payload['passId'] ?? null)
            ->where('token_jti', $payload['jti'] ?? null)
            ->first();

        if (!$pass) {
            $this->logScan(null, $data, $rawHash, 'INVALID');
            return response()->json([
                'ok' => false,
                'result' => 'INVALID',
                'message' => 'Pass not found.',
            ]);
        }

        if ($pass->status === 'revoked') {
            $this->logScan($pass->id, $data, $rawHash, 'REVOKED');
            return response()->json([
                'ok' => false,
                'result' => 'REVOKED',
                'message' => 'Pass revoked.',
            ]);
        }

        if (now()->lt($pass->valid_from) || now()->gt($pass->valid_until)) {
            $this->logScan($pass->id, $data, $rawHash, 'EXPIRED');
            return response()->json([
                'ok' => false,
                'result' => 'EXPIRED',
                'message' => 'Pass expired.',
            ]);
        }

        if ($pass->usage_count >= $pass->usage_limit) {
            $this->logScan($pass->id, $data, $rawHash, 'USED');
            return response()->json([
                'ok' => false,
                'result' => 'USED',
                'message' => 'Pass already used.',
            ]);
        }

        $pass->increment('usage_count');

        $this->logScan($pass->id, $data, $rawHash, 'VALID');

        return response()->json([
            'ok' => true,
            'result' => 'VALID',
            'display' => [
                'type' => $pass->pass_type,
                'householdId' => $pass->household_id,
                'visitorName' => $pass->visitor_name,
                'plateNo' => $pass->plate_no,
                'deliveryType' => $pass->delivery_type,
                'directionAllowed' => ['IN'],
            ],
        ]);
    }

    private function logScan(?int $passId, array $data, string $rawHash, string $result): void
    {
        ScanLog::create([
            'pass_id' => $passId,
            'guard_user_id' => $data['guard_user_id'],
            'gate' => $data['gate'],
            'direction' => $data['direction'],
            'result' => $result,
            'scanned_at' => now(),
            'raw_code_hash' => $rawHash,
            'note' => $data['note'] ?? null,
        ]);
    }
}